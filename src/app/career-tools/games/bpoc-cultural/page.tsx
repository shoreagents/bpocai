'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Mic, MicOff, Play, Pause, RotateCcw, Send, Timer, 
  Flag, Users, Zap, Trophy, Crown, Skull, Volume2, 
  MessageSquare, Globe, Target, Star, ArrowLeft, Share, AlertTriangle
} from 'lucide-react';

const CulturalCommunicationArena = () => {
  const router = useRouter();
  const [gameState, setGameState] = useState('welcome');
  const [currentStage, setCurrentStage] = useState(1);
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes for demo
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [culturalScores, setCulturalScores] = useState({
    US: 50,
    UK: 50,
    AU: 50,
    CA: 50
  });
  const [playerName, setPlayerName] = useState('Player');
  const [currentResponse, setCurrentResponse] = useState('');
  const [survivalStatus, setSurvivalStatus] = useState(100);
  const [achievements, setAchievements] = useState<string[]>([]);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasAudio, setHasAudio] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [toastAchievement, setToastAchievement] = useState<string | null>(null);
  const [stageAchievements, setStageAchievements] = useState<Record<number, string[]>>({});

  // Count any real player interactions (voice recordings or writing submissions)
  const [interactionCount, setInteractionCount] = useState(0);

  // Real voice recording state
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [canRecord, setCanRecord] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  // Combo challenge state
  const [comboVoiceDone, setComboVoiceDone] = useState(false);
  const [comboWriteDone, setComboWriteDone] = useState(false);

  // Final boss state
  const [bossRoundIndex, setBossRoundIndex] = useState(0); // 0..3
  const [bossVoiceDone, setBossVoiceDone] = useState(false);
  const [bossTimer, setBossTimer] = useState(30);

  // Game timer
  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0) {
      setGameState('results');
    }
  }, [gameState, timeLeft]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setRecordingTime(0);
    }
  }, [isRecording]);

  // Reset per-challenge state when moving between challenges/stages
  useEffect(() => {
    setComboVoiceDone(false);
    setComboWriteDone(false);
    setBossRoundIndex(0);
    setBossVoiceDone(false);
    setBossTimer(30);
    
    // Clear audio recordings when moving to new challenge
    setAudioChunks([]);
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  }, [currentChallenge, currentStage]);

  // Per-round timer for final boss
  useEffect(() => {
    const current = stages[currentStage - 1].challenges[currentChallenge];
    if (gameState === 'playing' && current.type === 'ultimate' && bossTimer > 0 && !bossVoiceDone) {
      const t = setInterval(() => setBossTimer((s) => s - 1), 1000);
      return () => clearInterval(t);
    }
  }, [gameState, currentStage, currentChallenge, bossTimer, bossVoiceDone]);

  // Achievement toast: show newest briefly
  useEffect(() => {
    if (achievements.length > 0) {
      const latest = achievements[achievements.length - 1];
      setToastAchievement(latest);
      const t = setTimeout(() => setToastAchievement(null), 4500);
      return () => clearTimeout(t);
    }
  }, [achievements]);

  // Check current permission state without requesting new permissions
  const checkCurrentPermissionState = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      console.log('Current microphone permission state:', permission.state);
      return permission.state;
    } catch (error) {
      console.log('Could not check permission state:', error);
      return 'unknown';
    }
  };

  // Check microphone permissions on mount and when needed
  const checkMicrophonePermission = async () => {
    try {
      console.log('Checking microphone permissions...');

      // First check current permission state (best-effort)
      const permissionState = await checkCurrentPermissionState();
      console.log('Permission state before getUserMedia:', permissionState);

      // Attempt to get a stream; success here means permission is granted
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // If we reached here, permission is granted and the device is available
      setCanRecord(true);

      // Immediately stop tracks; we only needed this to verify permission
      stream.getTracks().forEach((track) => track.stop());

      console.log('✅ Microphone permission granted and device available');
    } catch (error) {
      setCanRecord(false);
      console.error('Microphone access failed:', error);

      // Check if it's a permission or device error
      if (error instanceof DOMException) {
        if (error.name === 'NotAllowedError') {
          console.log('Permission denied by user');
        } else if (error.name === 'NotFoundError') {
          console.log('No microphone found');
        } else if (error.name === 'NotReadableError') {
          console.log('Microphone is busy or not accessible');
        }
      }
    }
  };

  useEffect(() => {
    checkMicrophonePermission();
    
    // Cleanup audio URL on unmount
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);



  // Helper: add achievement (global + per-stage)
  const addAchievement = (label: string) => {
    setAchievements((prev) => [...prev, label]);
    setStageAchievements((prev) => ({
      ...prev,
      [currentStage]: [...(prev[currentStage] || []), label],
    }));
  };

  const handleBackClick = () => {
    if (gameState === 'playing') {
      setShowExitDialog(true);
      return;
    }
    if (gameState === 'welcome') {
      router.push('/career-tools/games');
    } else {
      setGameState('welcome');
    }
  };

  const handleConfirmExit = () => {
    setShowExitDialog(false);
    router.push('/career-tools/games');
  };

  const proceedToIntro = () => {
    setGameState('intro');
  };

  const stages = [
    {
      name: "Cultural Bootcamp",
      description: "Master the fundamentals of cross-cultural communication",
      scenario: "You're a new BPO agent joining a global team. Your first task is to introduce yourself to different regional teams and adapt your communication style to match their cultural expectations.",
      instructions: "Complete all three challenges to demonstrate your basic cultural awareness and adaptability. Each challenge tests different aspects of cultural communication.",
      challenges: [
        {
          title: "The Voice Identity Test",
          description: "Introduce yourself to 4 different client teams",
          scenario: "Record 4 different 30-second introductions for different cultural contexts. Each team has different communication preferences and cultural norms.",
          instructions: "Record a brief self-introduction (15-30 seconds) that matches each region's communication style. Focus on tone, formality level, and cultural appropriateness. Avoid robotic tones, fake accents, or nervous stammering.",
          type: "voice",
          timeLimit: 120,
          regions: ['US', 'UK', 'AU', 'CA'],
          eliminationTriggers: [
            "Same robotic tone for all cultures",
            "Fake accent attempts", 
            "Nervous stammering or excessive 'ums'",
            "Cannot be clearly understood by native speakers",
            "Wrong energy level for cultural context"
          ]
        },
        {
          title: "The Writing Style Chameleon",
          description: "Same message, 4 different cultural styles",
          scenario: "Your manager asks you to communicate a project deadline change to different regional stakeholders. Each region expects different levels of formality and communication structure.",
          instructions: "Write the same message in 4 different styles that match each region's cultural communication preferences. Pay attention to vocabulary, sentence structure, and tone. Complete all 4 within time limit.",
          type: "writing",
          timeLimit: 90,
          regions: ['US', 'UK', 'AU', 'CA'],
          eliminationTriggers: [
            "Generic corporate speak for all regions",
            "Inappropriate formality level",
            "Cultural tone-deafness",
            "Takes longer than 20 seconds per response"
          ]
        },
        {
          title: "The Slang Decoder Challenge",
          description: "Decode regional slang and respond appropriately",
          scenario: "You'll receive 10 client messages with regional slang from different cultures. Your mission is to decode the slang and respond appropriately to each.",
          instructions: "Decode regional slang terms and respond in culturally appropriate ways. Show understanding of informal language without taking offense. Complete all responses within time limit.",
          type: "slang",
          timeLimit: 90,
          regions: ['US', 'UK', 'AU', 'CA'],
          eliminationTriggers: [
            "Misunderstand more than 3 slang terms",
            "Respond inappropriately to cultural tone",
            "Show offense at casual/informal language",
            "Take longer than 90 seconds total"
          ]
        }
      ]
    },
    {
      name: "Client Integration Arena", 
      description: "Handle real-world client interactions with cultural sensitivity",
      scenario: "You're now handling live client interactions. You'll face angry customers and team coordination challenges that require immediate cultural adaptation under pressure.",
      instructions: "Navigate through customer service scenarios and team coordination challenges. Your survival depends on maintaining cultural appropriateness while solving problems.",
      challenges: [
        {
          title: "The Cultural Style Switch",
          description: "Same business problem, 4 different cultural approaches",
          scenario: "Client's social media campaign is 20% below target metrics. Explain the situation to 4 different clients using their preferred communication style.",
          instructions: "Provide voice response (45 seconds) and writing follow-up (15 seconds) for each culture. Adapt your approach to match each region's communication preferences while maintaining professional quality.",
          type: "style_switch",
          timeLimit: 180,
          regions: ['US', 'UK', 'AU', 'CA'],
          eliminationTriggers: [
            "Same approach for all cultures",
            "Wrong formality level for any region",
            "Mismatched voice and writing styles",
            "Cultural stereotyping or insensitivity"
          ]
        },
        {
          title: "The Angry Customer Gauntlet",
          description: "De-escalate 3 increasingly difficult customers",
          scenario: "You're working the customer service line and receiving calls from increasingly frustrated customers from different regions. Each requires a different approach to de-escalation.",
          instructions: "Record voice responses to de-escalate each customer. Adapt your tone, language, and approach based on the customer's cultural background. Stay professional while showing cultural understanding.",
          type: "voice",
          timeLimit: 180,
          regions: ['US', 'UK', 'AU'],
          eliminationTriggers: [
            "Nervous, defensive, or panicked voice delivery",
            "Wrong cultural approach for any customer",
            "Cannot handle profanity professionally",
            "Blame-shifting or excuse-making responses"
          ]
        },
        {
          title: "The Multi-Cultural Team Chaos",
          description: "Coordinate team from 4 different cultures",
          scenario: "Emergency team chat with mixed cultural styles. 4 team members from different cultures need coordination during crisis.",
          instructions: "Record ONE voice response (90 seconds) that addresses all four communication styles. Acknowledge each team member's concerns while providing unified action plan.",
          type: "combo",
          timeLimit: 120,
          regions: ['US', 'UK', 'AU', 'CA'],
          eliminationTriggers: [
            "Favor one cultural style over others",
            "Generic response that doesn't address individual styles",
            "Nervous or uncertain voice delivery",
            "Misses any team member's core concern"
          ]
        }
      ]
    },
    {
      name: "The Pressure Cooker",
      description: "Advanced cultural navigation under extreme pressure",
      scenario: "You're now in high-pressure situations that test your cultural intelligence and professional boundaries. Each challenge requires perfect cultural adaptation while maintaining professionalism.",
      instructions: "Navigate through increasingly sensitive cultural situations. Demonstrate emotional maturity and cultural intelligence under pressure.",
      challenges: [
        {
          title: "The Cultural Landmine Field",
          description: "Navigate 4 increasingly sensitive cultural situations",
          scenario: "You'll face 4 increasingly sensitive situations that test your ability to handle inappropriate comments, passive-aggressive attacks, and cultural insensitivity professionally.",
          instructions: "Navigate each cultural sensitivity appropriately. Maintain professional relationships despite difficult comments. Address underlying concerns without defensive reactions.",
          type: "landmines",
          timeLimit: 150,
          regions: ['US', 'UK', 'AU', 'CA'],
          eliminationTriggers: [
            "Take offense at inappropriate comments",
            "Miss passive-aggressive subtext completely",
            "Give dishonest responses to avoid conflict",
            "Show cultural insensitivity in responses"
          ]
        },
        {
          title: "The Professional Boundary Test",
          description: "Handle clients pushing professional boundaries",
          scenario: "Clients are pushing professional boundaries by asking personal questions, making inappropriate requests, or sharing excessive personal information.",
          instructions: "Maintain appropriate professional boundaries. Redirect conversations back to business appropriately. Handle inappropriate comments with grace while preserving client relationships.",
          type: "boundaries",
          timeLimit: 120,
          regions: ['US', 'UK', 'AU', 'CA'],
          eliminationTriggers: [
            "Share personal information inappropriately",
            "Agree to inappropriate social meetings",
            "Become confrontational about cultural comments",
            "Take on unprofessional counselor role"
          ]
        },
        {
          title: "The Communication Breakdown Crisis",
          description: "Fix multiple communication failures simultaneously",
          scenario: "Multiple communication failures happening simultaneously. Each client has different complaints about your communication style and needs specific fixes.",
          instructions: "Record individual voice messages (30 seconds each) addressing each client's specific communication concern. Take ownership of failures and provide specific solutions.",
          type: "crisis",
          timeLimit: 150,
          regions: ['US', 'UK', 'AU', 'CA'],
          eliminationTriggers: [
            "Defensive responses or blame-shifting",
            "Generic solutions that don't address specific cultural needs",
            "Nervous or uncertain voice delivery",
            "Promises changes that contradict other clients' needs"
          ]
        }
      ]
    },
    {
      name: "Final Boss Battle",
      description: "The ultimate test of cultural communication mastery",
      scenario: "You're leading a critical conference call with stakeholders from all regions. The call is about a major project failure that could cost millions. Each participant expects communication in their preferred cultural style.",
      instructions: "Navigate through 4 phases of crisis management while respecting all cultural communication styles. This is the ultimate test of your cultural communication skills under extreme pressure.",
      challenges: [
        {
          title: "The Ultimate Multi-Cultural Conference Call Crisis",
          description: "Conference call from hell with 4 cultural communication styles",
          scenario: "Emergency 4-way client call. Each client has different crisis, different cultural expectations, and they're all talking over each other demanding immediate attention.",
          instructions: "Complete 4 phases: Listen & Analyze (60s), Take Charge (90s), Individual Follow-ups (90s), Cultural Adaptation Test (60s). Demonstrate crisis leadership while respecting cultural styles.",
          type: "ultimate",
          timeLimit: 300,
          regions: ['US', 'UK', 'AU', 'CA'],
          eliminationTriggers: [
            "Panic, freeze, or break under pressure",
            "Favor one culture inappropriately over others",
            "Use wrong cultural communication approach for any client",
            "Fail to take charge during crisis leadership moment",
            "Miss any client's primary concern or cultural needs",
            "Exceed 5-minute time limit",
            "Lose professional composure at any point"
          ]
        }
      ]
    }
  ];

  const culturalContexts = {
    US: {
      flag: "🇺🇸",
      name: "United States",
      style: "Direct & Efficient",
      color: "from-blue-600 to-red-600",
      example: "Hey! Quick fix needed - API is down. Can you jump on this ASAP?",
      tone: "Casual confidence, solution-focused"
    },
    UK: {
      flag: "🇬🇧", 
      name: "United Kingdom",
      style: "Polite & Proper",
      color: "from-purple-600 to-blue-800",
      example: "Good morning. I'm rather concerned about the quarterly figures...",
      tone: "Professional diplomacy, structured approach"
    },
    AU: {
      flag: "🇦🇺",
      name: "Australia", 
      style: "Honest & Direct",
      color: "from-yellow-600 to-green-600",
      example: "G'day mate! This project's gone pear-shaped - what's the real story?",
      tone: "Relaxed authenticity, straight-talking"
    },
    CA: {
      flag: "🇨🇦",
      name: "Canada",
      style: "Kind & Considerate", 
      color: "from-red-600 to-red-800",
      example: "Sorry to bother you, but I'm quite worried about the timeline...",
      tone: "Warm empathy, collaborative approach"
    }
  };

  const mockChallenges = {
    voice_intro: {
      US: "Hey team, quick intro for the new guy joining our sprint...",
      UK: "Good morning everyone. I'd like to introduce our new team member...", 
      AU: "G'day everyone! Meet your new teammate...",
      CA: "Hi there, hope everyone's having a good day. I'd like to introduce..."
    },
    writing_adaptation: {
      scenario: "Project deadline moved up by 2 days due to client request",
      US: "Heads up - client moved deadline up 2 days. Totally doable if we prioritize X and Y.",
      UK: "I wanted to update you regarding a timeline adjustment requested by the client...",
      AU: "Quick update - client's moved deadline up 2 days. Tight but doable.",
      CA: "Hi everyone, sorry for short notice, but client asked us to move deadline up 2 days..."
    },
    angry_customers: [
      {
        region: "US",
        level: "Frustrated",
        message: "Your service is pretty disappointing. I expected way better for what I'm paying.",
        context: "Direct but professional de-escalation needed"
      },
      {
        region: "UK", 
        level: "Irate",
        message: "This is absolutely unacceptable. I demand to speak to someone with actual authority.",
        context: "Diplomatic handling of authority challenge"
      },
      {
        region: "AU",
        level: "FURIOUS", 
        message: "This is a complete fucking shambles! You people are bloody useless!",
        context: "Handle extreme language professionally"
      }
    ]
  };

  // Real voice recording functions
  const startRealRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      });
      
      // Set up audio level monitoring
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      source.connect(analyser);
      
      setAudioContext(audioCtx);
      
      // Monitor audio levels
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkAudioLevel = () => {
        if (isRecording) {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(checkAudioLevel);
        }
      };
      checkAudioLevel();
      
      // Check for supported audio formats with fallback
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/wav';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
              mimeType = ''; // Let browser choose default
            }
          }
        }
      }
      
      console.log('Using audio format:', mimeType);
      
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      
      recorder.ondataavailable = (event) => {
        console.log('Audio data available:', {
          size: event.data.size,
          type: event.data.type,
          timestamp: Date.now()
        });
        
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        } else {
          console.warn('Empty audio chunk received');
        }
      };
      
      recorder.onstop = () => {
        console.log('Recording stopped, chunks:', audioChunks.length);
        
        // Use a timeout to ensure all chunks are processed
        setTimeout(() => {
          const currentChunks = [...audioChunks];
          console.log('Processing chunks:', currentChunks.length);
          
          // Check if we have actual audio data
          if (currentChunks.length === 0 || currentChunks.every(chunk => chunk.size === 0)) {
            console.error('No audio data recorded! Trying fallback method...');
            
            // Try fallback recording method
            if (stream && stream.active) {
              console.log('Attempting fallback recording...');
              startFallbackRecording(stream);
            } else {
              alert('No audio was recorded. Please check your microphone and try again.');
              setIsRecording(false);
            }
            return;
          }
          
          const audioBlob = new Blob(currentChunks, { type: recorder.mimeType || 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          console.log('Recording stopped:', {
            blobSize: audioBlob.size,
            blobType: audioBlob.type,
            mimeType: recorder.mimeType,
            chunksCount: currentChunks.length,
            totalChunkSize: currentChunks.reduce((sum, chunk) => sum + chunk.size, 0),
            audioUrl: audioUrl
          });
          
          // Only proceed if we have a valid audio blob
          if (audioBlob.size > 0) {
            setAudioBlob(audioBlob);
            setAudioUrl(audioUrl);
            setAudioChunks([]);
            
            // Analyze the recording for cultural fit
            analyzeVoiceRecording(audioBlob);
          } else {
            console.error('Created blob is empty!');
            alert('Recording failed - no audio data captured. Please try again.');
          }
        }, 100); // Small delay to ensure all chunks are processed
      };
      
      setMediaRecorder(recorder);
      
      // Start recording without timeslice for better compatibility
      recorder.start();
      setIsRecording(true);
      setInteractionCount((c) => c + 1);
      setRecordingTime(0);
      
      console.log('Recording started with format:', recorder.mimeType);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to record voice responses.');
    }
  };

  const stopRealRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      
      // Clean up audio context
      if (audioContext) {
        audioContext.close();
        setAudioContext(null);
      }
      setAudioLevel(0);
    }
  };

  // Enhanced audio playback function
  const playAudioRecording = async () => {
    if (!audioRef.current || !audioUrl) {
      console.log('No audio to play');
      return;
    }

    try {
      // Reset audio to beginning
      audioRef.current.currentTime = 0;
      
      // Try to play the audio
      await audioRef.current.play();
      console.log('Audio playback started successfully');
    } catch (error) {
      console.error('Audio playback failed:', error);
      
      // Fallback: try to create a new audio element
      try {
        const fallbackAudio = new Audio(audioUrl);
        await fallbackAudio.play();
        console.log('Fallback audio playback successful');
      } catch (fallbackError) {
        console.error('Fallback audio also failed:', fallbackError);
        alert('Audio playback failed. Please try recording again.');
      }
    }
  };

  // Fallback recording method using Web Audio API
  const startFallbackRecording = async (stream: MediaStream) => {
    try {
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const destination = audioCtx.createMediaStreamDestination();
      source.connect(destination);
      
      const mediaRecorder = new MediaRecorder(destination.stream);
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          
          console.log('Fallback recording successful:', {
            blobSize: audioBlob.size,
            chunksCount: chunks.length
          });
          
          setAudioBlob(audioBlob);
          setAudioUrl(audioUrl);
          setAudioChunks([]);
          analyzeVoiceRecording(audioBlob);
        } else {
          console.error('Fallback recording also failed');
          alert('Recording failed. Please check your microphone permissions and try again.');
        }
        
        audioCtx.close();
      };
      
      mediaRecorder.start();
      setMediaRecorder(mediaRecorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      console.log('Fallback recording started');
    } catch (error) {
      console.error('Fallback recording failed:', error);
      alert('All recording methods failed. Please check your browser and microphone.');
    }
  };

  const handleVoiceRecording = () => {
    if (!isRecording) {
      startRealRecording();
    } else {
      stopRealRecording();
    }
  };

  // Analyze voice recording for cultural fit
  const analyzeVoiceRecording = (audioBlob: Blob) => {
    // In a real app, this would send audio to AI analysis
    // For now, we'll simulate analysis based on recording duration
    const duration = recordingTime;
    
    // Simulate cultural analysis based on recording length and quality
    const baseScore = Math.min(100, 60 + (duration * 2)); // Longer recordings get higher scores
    
    // Random cultural region focus
    const region = ['US', 'UK', 'AU', 'CA'][Math.floor(Math.random() * 4)] as keyof typeof culturalContexts;
    const score = Math.min(100, baseScore + Math.random() * 20);
    
    setCulturalScores(prev => ({
      ...prev,
      [region]: Math.min(100, prev[region] + score/10)
    }));
    
    if (score > 85) {
      addAchievement(`${culturalContexts[region].flag} Cultural Master`);
    }

    // Mark voice completion flags depending on active challenge type
    const current = stages[currentStage - 1].challenges[currentChallenge];
    if (current.type === 'combo') {
      setComboVoiceDone(true);
    } else if (current.type === 'ultimate') {
      setBossVoiceDone(true);
    }
  };

  // Enhanced cultural analysis for text input
  const analyzeCulturalFit = (text: string) => {
    const analysis = {
      US: 0, UK: 0, AU: 0, CA: 0, overall: 0
    };
    
    // Cultural keyword analysis
    const usKeywords = ['direct', 'efficient', 'quick', 'asap', 'heads up', 'jump on', 'fix', 'team'];
    const ukKeywords = ['rather', 'concerned', 'regarding', 'adjustment', 'proper', 'good morning', 'structured', 'diplomatic'];
    const auKeywords = ['mate', 'honest', 'straight', 'real', 'authentic', 'gday', 'pear-shaped', 'bloody'];
    const caKeywords = ['sorry', 'bother', 'worried', 'timeline', 'collaborative', 'hope', 'having a good day', 'quite'];
    
    // Score based on keyword presence and text length
    const textLower = text.toLowerCase();
    
    usKeywords.forEach(word => {
      if (textLower.includes(word)) analysis.US += 8;
    });
    ukKeywords.forEach(word => {
      if (textLower.includes(word)) analysis.UK += 8;
    });
    auKeywords.forEach(word => {
      if (textLower.includes(word)) analysis.AU += 8;
    });
    caKeywords.forEach(word => {
      if (textLower.includes(word)) analysis.CA += 8;
    });
    
    // Bonus for appropriate length and structure
    if (text.length > 20) {
      analysis.US += 5;
      analysis.UK += 5;
      analysis.AU += 5;
      analysis.CA += 5;
    }
    
    // Cap scores at 100
    analysis.US = Math.min(100, analysis.US);
    analysis.UK = Math.min(100, analysis.UK);
    analysis.AU = Math.min(100, analysis.AU);
    analysis.CA = Math.min(100, analysis.CA);
    
    analysis.overall = (analysis.US + analysis.UK + analysis.AU + analysis.CA) / 4;
    return analysis;
  };

  const handleWritingSubmit = () => {
    if (currentResponse.length > 10) {
      // Real-time cultural analysis
      const culturalAnalysis = analyzeCulturalFit(currentResponse);
      
      // Update scores based on actual content analysis
      Object.entries(culturalAnalysis).forEach(([region, score]) => {
        if (region !== 'overall') {
          setCulturalScores(prev => ({
            ...prev,
            [region]: Math.min(100, prev[region as keyof typeof culturalScores] + score/10)
          }));
        }
      });
      
      setCurrentResponse('');
      setInteractionCount((c) => c + 1);
      
      // Check for achievements based on performance
      if (culturalAnalysis.overall > 80) {
        addAchievement("🌟 Cultural Chameleon");
      }
      
      // Add specific cultural achievements
      if (culturalAnalysis.US > 85) addAchievement("🇺🇸 US Communication Expert");
      if (culturalAnalysis.UK > 85) addAchievement("🇬🇧 UK Communication Expert");
      if (culturalAnalysis.AU > 85) addAchievement("🇦🇺 AU Communication Expert");
      if (culturalAnalysis.CA > 85) addAchievement("🇨🇦 CA Communication Expert");

      // Flag for combo writing completion
      const current = stages[currentStage - 1].challenges[currentChallenge];
      if (current.type === 'combo') {
        setComboWriteDone(true);
      }
    }
  };

  const nextChallenge = () => {
    const currentStageData = stages[currentStage - 1];
    if (currentChallenge < currentStageData.challenges.length - 1) {
      setCurrentChallenge(prev => prev + 1);
    } else if (currentStage < stages.length) {
      setCurrentStage(prev => prev + 1);
      setCurrentChallenge(0);
    } else {
      setGameState('results');
    }
  };

  const calculateTier = () => {
    // If the user hasn't interacted with any challenge, force the lowest tier
    if (interactionCount === 0) {
      return {
        tier: "No Participation",
        icon: "🕒",
        color: "from-gray-500 to-gray-700",
        description: "No challenges were completed. Play the arena to earn a cultural rating."
      };
    }

    const avgScore = Object.values(culturalScores).reduce((a, b) => a + b, 0) / 4;
    const achievementCount = achievements.length;
    
    if (avgScore >= 90 && achievementCount >= 5) {
      return {
        tier: "Cultural Legend",
        icon: "🌟",
        color: "from-yellow-400 to-yellow-600",
        description: "Global Communication Master - Perfect for any international client"
      };
    } else if (avgScore >= 80 && achievementCount >= 3) {
      return {
        tier: "Cultural Master", 
        icon: "🏆",
        color: "from-blue-500 to-purple-600",
        description: "Excellent cultural adaptation - Premium client tier"
      };
    } else if (avgScore >= 70) {
      return {
        tier: "Cultural Professional",
        icon: "🥈", 
        color: "from-gray-400 to-gray-600",
        description: "Good cultural awareness - Standard placement tier"
      };
    } else if (avgScore >= 50) {
      return {
        tier: "Cultural Trainee",
        icon: "🥉",
        color: "from-orange-500 to-orange-700", 
        description: "Basic competency - Needs cultural development"
      };
    } else {
      return {
        tier: "Cultural Disaster",
        icon: "💀",
        color: "from-red-600 to-red-800",
        description: "DO NOT HIRE - Will create cultural friction"
      };
    }
  };

  const restartGame = () => {
    setGameState('intro');
    setCurrentStage(1);
    setCurrentChallenge(0);
    setTimeLeft(300);
    setCulturalScores({ US: 50, UK: 50, AU: 50, CA: 50 });
    setAchievements([]);
    setSurvivalStatus(100);
    setCurrentResponse('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    setGameState('playing');
  };

  if (gameState === 'welcome') {
    return (
      <div className="min-h-screen cyber-grid overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <Header />
        
        <div className="pt-16 relative z-10">
          <div className="container mx-auto px-4 py-8">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={handleBackClick}
                  className="mr-4 text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
                <div className="flex items-center">
                  <Globe className="h-12 w-12 text-green-400 mr-4" />
                  <div>
                    <h1 className="text-4xl font-bold gradient-text">BPOC Cultural</h1>
                    <p className="text-gray-400">The Ultimate Client Survival Arena</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <Card className="glass-card border-white/10">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mr-4">
                        <Globe className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold gradient-text mb-2">
                          Welcome to BPOC Cultural!
                        </CardTitle>
                        <p className="text-gray-300 text-lg">
                          The Ultimate Client Survival Arena
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-gray-300 space-y-6 text-left max-w-3xl mx-auto">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-400" />
                          How to Play
                        </h3>
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-start">
                            <span className="text-cyan-400 mr-3 mt-0.5 text-lg">🎯</span>
                            <span>Navigate through 4 stages of cultural communication challenges</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-cyan-400 mr-3 mt-0.5 text-lg">🌍</span>
                            <span>Master communication across US, UK, Australian, and Canadian cultures</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-cyan-400 mr-3 mt-0.5 text-lg">📖</span>
                            <span>Each stage includes detailed scenarios and clear instructions</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-cyan-400 mr-3 mt-0.5 text-lg">🎤</span>
                            <span>Record voice responses and adapt writing styles in real-time</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-cyan-400 mr-3 mt-0.5 text-lg">💎</span>
                            <span>Become a Cultural Chameleon - the ultimate global communicator</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-cyan-400 mr-3 mt-0.5 text-lg">⚠️</span>
                            <span>One cultural mistake = instant elimination</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-cyan-400 mr-3 mt-0.5 text-lg">🏆</span>
                            <span>Survive 25 minutes to become a Global Communication Legend</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 rounded-lg border border-white/10" style={{ backgroundColor: '#111315' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-5 w-5 text-green-400" />
                            <h4 className="text-white font-semibold">Cultural Mastery</h4>
                          </div>
                          <p className="text-gray-300 text-sm">Test your ability to adapt communication styles across different English-speaking cultures!</p>
                        </div>
                      <div className="p-4 rounded-lg border border-white/10" style={{ backgroundColor: '#111315' }}>
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare className="h-5 w-5 text-blue-400" />
                            <h4 className="text-white font-semibold">Voice & Writing</h4>
                          </div>
                          <p className="text-gray-300 text-sm">Master both spoken and written communication in high-pressure scenarios!</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardContent>
                    <Button
                      onClick={proceedToIntro}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg py-6 h-14"
                    >
                      <Play className="h-6 w-6 mr-3" />
                      Start Game
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen cyber-grid overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <Header />
        
        <div className="pt-16 relative z-10">
          <div className="container mx-auto px-4 py-8">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={handleBackClick}
                  className="mr-4 text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
                <div className="flex items-center">
                  <Globe className="h-12 w-12 text-green-400 mr-4" />
                  <div>
                    <h1 className="text-4xl font-bold gradient-text">BPOC Cultural</h1>
                    <p className="text-gray-400">The Ultimate Client Survival Arena</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <p className="text-xl text-gray-300 leading-relaxed">
                  Master cultural communication across all regions. Navigate through 4 stages of challenges, each with detailed scenarios and clear instructions. 
                  Become the ultimate global communicator!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <Button
                    onClick={startGame}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 text-xl font-bold"
                    size="lg"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start the Cultural Game
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
        

          
      </div>
    );
  }

  // Results Screen
  if (gameState === 'results') {
    const tier = calculateTier();
    const avgScore = Math.round(Object.values(culturalScores).reduce((a, b) => a + b, 0) / 4);
    return (
      <div className="min-h-screen cyber-grid overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Header />

        <div className="pt-16 relative z-10">
          <div className="container mx-auto px-4 py-8">
            {/* Header row with Back like other games */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/career-tools/games')}
                  className="mr-4 text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Button>
                <div className="flex items-center">
                  <Globe className="h-12 w-12 text-green-400 mr-4" />
                  <div>
                    <h1 className="text-4xl font-bold gradient-text">BPOC Cultural</h1>
                    <p className="text-gray-400">The Ultimate Client Survival Arena</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              className="text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass-card border-white/10 mb-6">
                <CardContent className="p-8">
                  <div className="text-6xl mb-4">{tier.icon}</div>
                  <h1 className="text-4xl font-bold gradient-text mb-2">Arena Complete!</h1>
                  <p className="text-gray-300 mb-6">Great work{playerName ? `, ${playerName}` : ''}! Here's your cultural performance.</p>

                  {/* Tier */}
                  <div className={`text-3xl font-extrabold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent mb-6`}>
                    {tier.tier}
                  </div>
                  <p className="text-gray-300 mb-8 max-w-2xl mx-auto">{tier.description}</p>

                  {/* Cultural Scores */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {Object.entries(culturalScores).map(([region, score]) => (
                      <div key={region} className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
                        <div className="text-2xl mb-2">{culturalContexts[region as keyof typeof culturalContexts].flag}</div>
                        <div className="text-xl font-bold text-white">{Math.round(score)}%</div>
                        <div className="text-xs text-gray-400">{culturalContexts[region as keyof typeof culturalContexts].name}</div>
                      </div>
                    ))}
                  </div>

                  {/* Achievements */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-8">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400"/>Achievements</h3>
                    {achievements.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {achievements.map((a, i) => (
                          <span key={i} className="bg-yellow-600/20 text-yellow-300 border border-yellow-500/30 rounded-full px-3 py-1 text-xs">{a}</span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-400">No achievements this run. Try to adapt more precisely next time!</div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-white">{avgScore}%</div>
                      <div className="text-sm text-gray-400">Average Cultural Score</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-white">{achievements.length}</div>
                      <div className="text-sm text-gray-400">Achievements Earned</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-white">{survivalStatus}%</div>
                      <div className="text-sm text-gray-400">Survival Status</div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Actions below card (full width like results card) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mt-2">
                <Button
                  onClick={() => router.push('/career-tools/games')}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2"/>
                  Back to Main Menu
                </Button>
                <Button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'My BPOC Cultural Results',
                        text: `Average: ${avgScore}% | Achievements: ${achievements.length} | Survival: ${survivalStatus}%`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(`BPOC Cultural Results — Average: ${avgScore}% | Achievements: ${achievements.length} | Survival: ${survivalStatus}%`);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <Share className="w-4 h-4 mr-2"/>
                  Share
                </Button>
                <Button
                  onClick={restartGame}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2"/>
                  Play Again
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Main Game Screen
  if (gameState === 'playing') {
    return (
      <div className="min-h-screen cyber-grid overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <Header />
        
        <div className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleBackClick}
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Globe className="h-12 w-12 text-green-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">BPOC Cultural</h1>
                  <p className="text-gray-400">The Ultimate Client Survival Arena</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Header with progress and stats */}
          <div className="p-4 mb-8 border-b border-white/10" style={{ backgroundColor: '#111315' }}>
            <div className="container mx-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">🏟️</div>
                  <div>
                    <div className="font-bold text-lg">{playerName}</div>
                    <div className="text-sm text-gray-400">
                      Stage {currentStage}: {stages[currentStage - 1].name} • Challenge {currentStage}{String.fromCharCode(65 + currentChallenge)}: {stages[currentStage - 1].challenges[currentChallenge].title}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-red-400">
                      <Timer className="w-5 h-5" />
                      <span className="text-xl font-bold">{formatTime(timeLeft)}</span>
                    </div>
                    <div className="text-xs text-gray-400">Arena Time</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-400">{survivalStatus}%</div>
                    <div className="text-xs text-gray-400">Survival</div>
                  </div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${((currentStage - 1) / (stages.length - 1)) * 100}%` 
                  }}
                />
              </div>
              
              {/* Cultural scores */}
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(culturalScores).map(([region, score]) => (
                  <div key={region} className="bg-gray-700 rounded-lg p-3 text-center">
                    {/* Use region code instead of flag to avoid 'GB' fallback rendering */}
                    <div className="text-xl font-semibold">{region}</div>
                    <div className="text-lg font-bold">{Math.round(score)}%</div>
                    <div className="text-xs text-gray-400">{region}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main challenge area */}
          <div className="container mx-auto px-4 py-8">
            <motion.div
              key={`${currentStage}-${currentChallenge}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl mx-auto"
            >
              {/* Challenge header */}
              <div className="rounded-xl p-6 mb-8 text-center border border-white/10 relative" style={{ backgroundColor: '#111315' }}>
                {/* Challenge Info */}
                <div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Challenge {currentStage}{String.fromCharCode(65 + currentChallenge)}</div>
                    <h1 className="text-3xl font-bold">{stages[currentStage - 1].challenges[currentChallenge].title}</h1>
                  </div>
                  
                  <p className="text-lg opacity-90 mb-4">{stages[currentStage - 1].challenges[currentChallenge].description}</p>
                  
                  {/* Challenge Scenario */}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-semibold text-purple-300">Challenge Scenario</span>
                    </div>
                    <p className="text-sm text-gray-200">{stages[currentStage - 1].challenges[currentChallenge].scenario}</p>
                  </div>
                  
                  {/* Challenge Instructions */}
                  <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-semibold text-purple-300">Challenge Instructions</span>
                    </div>
                    <p className="text-sm text-gray-200">{stages[currentStage - 1].challenges[currentChallenge].instructions}</p>
                  </div>
                  
                  {/* Elimination Triggers */}
                  {stages[currentStage - 1].challenges[currentChallenge].eliminationTriggers && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4 max-w-2xl mx-auto">
                      <div className="flex items-center gap-2 mb-2">
                        <Skull className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-semibold text-red-300">Elimination Triggers</span>
                      </div>
                      <div className="space-y-1">
                        {stages[currentStage - 1].challenges[currentChallenge].eliminationTriggers.map((trigger, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs text-gray-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></div>
                            <span>{trigger}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-center gap-4">
                    {stages[currentStage - 1].challenges[currentChallenge].regions.map(region => (
                      <span key={region} className="text-base md:text-lg font-semibold text-gray-200 uppercase tracking-wide">{region}</span>
                    ))}
                  </div>
                </div>
                
                {/* Stage achievements badge */}
                {stageAchievements[currentStage] && stageAchievements[currentStage].length > 0 && (
                  <div className="absolute top-4 right-4 bg-green-600/20 text-green-300 border border-green-500/40 rounded-full px-3 py-1 text-xs">
                    🏅 {stageAchievements[currentStage].length} Achv
                  </div>
                )}
              </div>

              {/* Challenge content */}
              <div className="bg-[#111315] rounded-xl p-8 mb-8 border border-white/10 shadow-lg shadow-black/30">
                {stages[currentStage - 1].challenges[currentChallenge].type === 'voice' && (
                  <div className="text-center">
                    {/* Example prompts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {stages[currentStage - 1].challenges[currentChallenge].regions.map(region => (
                        <div key={region} className={`bg-gradient-to-br ${culturalContexts[region as keyof typeof culturalContexts].color} rounded-lg p-4`}>
                          <div className="text-sm md:text-base font-semibold uppercase text-white/90 mb-2">{region}</div>
                          <div className="font-bold text-lg text-white">{culturalContexts[region as keyof typeof culturalContexts].name}</div>
                          <div className="text-sm text-white/90 mb-2">{culturalContexts[region as keyof typeof culturalContexts].style}</div>
                          <div className="text-xs italic text-white/80">"{culturalContexts[region as keyof typeof culturalContexts].example}"</div>
                        </div>
                      ))}
                    </div>

                                         {/* Enhanced Recording Interface */}
                     <div className="bg-gray-700 rounded-lg p-6">
                       <div className="text-lg mb-4 text-center">
                         {isRecording ? (
                           <div>
                             <div className="text-red-400 mb-2">🔴 Recording... {recordingTime}s</div>
                             {/* Audio level indicator */}
                             <div className="w-32 h-4 bg-gray-700 rounded-full mx-auto overflow-hidden">
                               <div 
                                 className="h-full bg-green-500 transition-all duration-100"
                                 style={{ width: `${Math.min(100, (audioLevel / 128) * 100)}%` }}
                               />
                             </div>
                             <div className="text-xs text-gray-400 mt-1">
                               Audio Level: {Math.round((audioLevel / 128) * 100)}%
                             </div>
                           </div>
                         ) : (
                           <div>
                             {audioUrl ? "Your recording is ready!" : "Click to start recording your response"}
                             {/* Microphone status indicator */}
                             <div className="mt-2 text-sm">
                               <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                                 canRecord 
                                   ? 'bg-green-600/20 text-green-400 border border-green-500/40' 
                                   : 'bg-red-600/20 text-red-400 border border-red-500/40'
                               }`}>
                                 {canRecord ? '🎤 Microphone Ready' : '❌ Microphone Not Ready'}
                               </span>
                             </div>
                           </div>
                         )}
                       </div>
                       
                       <div className="flex items-center justify-center gap-4 mb-4">
                         <motion.button
                           onClick={handleVoiceRecording}
                           disabled={!canRecord}
                           className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${
                             isRecording 
                               ? 'bg-red-600 hover:bg-red-700' 
                               : !canRecord
                               ? 'bg-gray-500 cursor-not-allowed'
                               : 'bg-blue-600 hover:bg-blue-700'
                           }`}
                           whileHover={{ scale: canRecord && !isRecording ? 1.1 : 1 }}
                           whileTap={{ scale: canRecord && !isRecording ? 0.9 : 1 }}
                         >
                           {isRecording ? <MicOff /> : <Mic />}
                         </motion.button>
                         
                         {audioUrl && (
                           <motion.button
                             onClick={playAudioRecording}
                             className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-2xl transition-all"
                             whileHover={{ scale: 1.1 }}
                             whileTap={{ scale: 0.9 }}
                           >
                             <Play className="text-white" />
                           </motion.button>
                         )}
                       </div>
                       
                       {!canRecord && (
                         <div className="text-center text-red-400 text-sm mb-4">
                           <div className="mb-2">⚠️ Microphone access required. Please allow microphone permissions.</div>
                           <div className="flex gap-2 justify-center">
                             <Button
                               onClick={checkMicrophonePermission}
                               size="sm"
                               className="bg-blue-600 hover:bg-blue-700 text-white"
                             >
                               🔄 Refresh Access
                             </Button>
                             <Button
                               onClick={async () => {
                                 const state = await checkCurrentPermissionState();
                                 alert(`Current microphone permission: ${state}\n\nIf it shows 'granted', try clicking 'Refresh Access' above.`);
                               }}
                               size="sm"
                               variant="outline"
                               className="border-gray-600 text-gray-300 hover:bg-gray-700"
                             >
                               ℹ️ Check Status
                             </Button>
                           </div>
                         </div>
                       )}
                       
                       {audioUrl && (
                         <div className="text-center">
                           <audio 
                             ref={audioRef} 
                             src={audioUrl} 
                             className="hidden"
                             controls={false}
                             preload="metadata"
                           />
                           <div className="text-sm text-green-400 mb-2">
                             🎵 Recording saved! Click play to review.
                           </div>
                           <div className="text-xs text-gray-400">
                             Duration: {recordingTime}s • Format: WebM
                           </div>
                         </div>
                       )}
                       
                       <div className="text-sm text-gray-400 mt-4 text-center">
                         Record your introduction for each cultural context
                       </div>
                     </div>
                  </div>
                )}

                {stages[currentStage - 1].challenges[currentChallenge].type === 'writing' && (
                  <div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {Object.entries(mockChallenges.writing_adaptation).map(([key, value]) => {
                        if (key === 'scenario') return null;
                        return (
                          <div key={key} className={`bg-gradient-to-br ${culturalContexts[key as keyof typeof culturalContexts].color} rounded-lg p-4`}>
                            <div className="font-bold text-sm mb-2 text-white">
                              {culturalContexts[key as keyof typeof culturalContexts].flag} {culturalContexts[key as keyof typeof culturalContexts].name}
                            </div>
                            <div className="text-xs italic text-white/80">"{value as string}"</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <textarea
                        value={currentResponse}
                        onChange={(e) => setCurrentResponse(e.target.value)}
                        placeholder="Write your cultural adaptation here..."
                        className="w-full h-32 bg-gray-600 rounded p-4 text-white resize-none"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-400">
                          {currentResponse.length} characters
                        </span>
                        <button
                          onClick={handleWritingSubmit}
                          disabled={currentResponse.length < 10}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Submit Response
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {stages[currentStage - 1].challenges[currentChallenge].type === 'slang' && (
                  <div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <textarea
                        value={currentResponse}
                        onChange={(e) => setCurrentResponse(e.target.value)}
                        placeholder="Write your slang decoding responses here..."
                        className="w-full h-32 bg-gray-600 rounded p-4 text-white resize-none"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-400">
                          {currentResponse.length} characters
                        </span>
                        <button
                          onClick={handleWritingSubmit}
                          disabled={currentResponse.length < 10}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Submit Response
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {stages[currentStage - 1].challenges[currentChallenge].type === 'style_switch' && (
                  <div>
                    
                    <div className="bg-gray-700 rounded-lg p-6 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gradient-to-br from-blue-600 to-red-600 rounded-lg p-4">
                          <div className="font-bold text-sm mb-2 text-white">🇺🇸 US Style</div>
                          <div className="text-xs italic text-white/80">Direct, solution-focused, energetic</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-600 to-blue-800 rounded-lg p-4">
                          <div className="font-bold text-sm mb-2 text-white">🇬🇧 UK Style</div>
                          <div className="text-xs italic text-white/80">Diplomatic, structured, professional</div>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-600 to-green-600 rounded-lg p-4">
                          <div className="font-bold text-sm mb-2 text-white">🇦🇺 AU Style</div>
                          <div className="text-xs italic text-white/80">Honest, straightforward, casual-professional</div>
                        </div>
                        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-lg p-4">
                          <div className="font-bold text-sm mb-2 text-white">🇨🇦 CA Style</div>
                          <div className="text-xs italic text-white/80">Considerate, collaborative, gently apologetic</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <textarea
                        value={currentResponse}
                        onChange={(e) => setCurrentResponse(e.target.value)}
                        placeholder="Write your cultural style adaptations here..."
                        className="w-full h-32 bg-gray-600 rounded p-4 text-white resize-none"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-400">
                          {currentResponse.length} characters
                        </span>
                        <button
                          onClick={handleWritingSubmit}
                          disabled={currentResponse.length < 10}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Submit Response
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                 {stages[currentStage - 1].challenges[currentChallenge].type === 'combo' && (
                  <div>
                    <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-6 text-center mb-6">
                      <div className="text-6xl mb-4">🌪️</div>
                      <h4 className="text-xl font-bold mb-2">Multi-Cultural Crisis!</h4>
                      <p className="text-yellow-200 mb-4">
                        Handle emergency team coordination across all 4 cultures simultaneously
                      </p>
                      <div className="text-sm text-yellow-300">
                        Complete both tasks below to proceed
                      </div>
                    </div>

                    {/* Voice section */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold text-white">Voice Response</div>
                        <div className={`text-sm ${comboVoiceDone ? 'text-green-400' : 'text-gray-400'}`}>
                          {comboVoiceDone ? 'Completed' : 'Required'}
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 mb-4">Record a brief coordination plan addressing all regions.</div>
                      <div className="flex items-center gap-4">
                        <motion.button
                          onClick={handleVoiceRecording}
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isRecording ? <MicOff /> : <Mic />}
                        </motion.button>
                        <div className="text-gray-300">
                          {isRecording ? `Recording... ${recordingTime}s` : 'Click to record'}
                        </div>
                      </div>
                    </div>

                    {/* Writing section */}
                    <div className="bg-gray-800 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="font-semibold text-white">Written Update</div>
                        <div className={`text-sm ${comboWriteDone ? 'text-green-400' : 'text-gray-400'}`}>
                          {comboWriteDone ? 'Submitted' : 'Required'}
                        </div>
                      </div>
                      <textarea
                        value={currentResponse}
                        onChange={(e) => setCurrentResponse(e.target.value)}
                        placeholder="Write a short, culturally-aware update for the team..."
                        className="w-full h-28 bg-gray-700 rounded p-3 text-white text-sm"
                      />
                      <div className="text-right mt-3">
                        <Button
                          onClick={handleWritingSubmit}
                          disabled={currentResponse.length < 10}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >Submit</Button>
                      </div>
                    </div>
                  </div>
                                 )}

                {stages[currentStage - 1].challenges[currentChallenge].type === 'landmines' && (
                  <div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <textarea
                        value={currentResponse}
                        onChange={(e) => setCurrentResponse(e.target.value)}
                        placeholder="Write your responses to navigate these cultural landmines..."
                        className="w-full h-32 bg-gray-600 rounded p-4 text-white resize-none"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-400">
                          {currentResponse.length} characters
                        </span>
                        <button
                          onClick={handleWritingSubmit}
                          disabled={currentResponse.length < 10}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Submit Response
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {stages[currentStage - 1].challenges[currentChallenge].type === 'boundaries' && (
                  <div>
                    
                    <div className="bg-gray-700 rounded-lg p-6 mb-6">
                      <div className="space-y-4">
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                          <div className="font-bold text-sm mb-2 text-yellow-300">🇺🇸 Boundary Test 1 - Personal Information Fishing</div>
                          <div className="text-xs italic text-gray-200">"So where do you live? How much do you guys actually make? I'm curious about the wage difference."</div>
                          <div className="text-xs text-yellow-200 mt-2">Test: Professional deflection while maintaining friendliness</div>
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                          <div className="font-bold text-sm mb-2 text-yellow-300">🇬🇧 Boundary Test 2 - Inappropriate Relationship Building</div>
                          <div className="text-xs italic text-gray-200">"Perhaps we could discuss this over drinks when I'm in Manila next month? I do enjoy the local nightlife."</div>
                          <div className="text-xs text-yellow-200 mt-2">Test: Professional boundary maintenance with diplomatic grace</div>
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                          <div className="font-bold text-sm mb-2 text-yellow-300">🇦🇺 Boundary Test 3 - Cultural Stereotyping</div>
                          <div className="text-xs italic text-gray-200">"You Filipinos are all so hardworking and cheap! No wonder everyone outsources there."</div>
                          <div className="text-xs text-yellow-200 mt-2">Test: Address stereotyping professionally without lecturing</div>
                        </div>
                        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                          <div className="font-bold text-sm mb-2 text-yellow-300">🇨🇦 Boundary Test 4 - Excessive Personal Sharing</div>
                          <div className="text-xs italic text-gray-200">"Sorry, I'm going through a terrible divorce and I just need someone to talk to about my personal problems..."</div>
                          <div className="text-xs text-yellow-200 mt-2">Test: Empathy while maintaining professional focus</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <textarea
                        value={currentResponse}
                        onChange={(e) => setCurrentResponse(e.target.value)}
                        placeholder="Write your responses to maintain professional boundaries..."
                        className="w-full h-32 bg-gray-600 rounded p-4 text-white resize-none"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-400">
                          {currentResponse.length} characters
                        </span>
                        <button
                          onClick={handleWritingSubmit}
                          disabled={currentResponse.length < 10}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Submit Response
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {stages[currentStage - 1].challenges[currentChallenge].type === 'crisis' && (
                  <div>

                    <div className="bg-gray-700 rounded-lg p-6">
                      <textarea
                        value={currentResponse}
                        onChange={(e) => setCurrentResponse(e.target.value)}
                        placeholder="Write your crisis communication responses..."
                        className="w-full h-32 bg-gray-600 rounded p-4 text-white resize-none"
                      />
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-sm text-gray-400">
                          {currentResponse.length} characters
                        </span>
                        <button
                          onClick={handleWritingSubmit}
                          disabled={currentResponse.length < 10}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Submit Response
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                 {stages[currentStage - 1].challenges[currentChallenge].type === 'ultimate' && (
                  <div>
                    <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center mb-6">
                      <div className="text-6xl mb-4">💀</div>
                      <h4 className="text-xl font-bold mb-2">Conference Call Chaos</h4>
                      <p className="text-red-200 mb-4">
                        4-way client call, each with different cultural expectations.
                      </p>
                      <div className="text-sm text-red-300">Round {bossRoundIndex + 1} of 4 • Time left: {bossTimer}s</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 text-center">
                      <div className="text-4xl mb-3">{stages[currentStage - 1].challenges[currentChallenge].regions[bossRoundIndex] === 'US' ? '🇺🇸' : stages[currentStage - 1].challenges[currentChallenge].regions[bossRoundIndex] === 'UK' ? '🇬🇧' : stages[currentStage - 1].challenges[currentChallenge].regions[bossRoundIndex] === 'AU' ? '🇦🇺' : '🇨🇦'}</div>
                      <div className="text-gray-300 mb-4">Give a concise voice response tailored to this region.</div>
                      <motion.button
                        onClick={handleVoiceRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${
                          isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isRecording ? <MicOff /> : <Mic />}
                      </motion.button>
                      <div className="mt-3 text-gray-300">{bossVoiceDone ? 'Recorded ✔' : (isRecording ? `Recording... ${recordingTime}s` : 'Click to record')}</div>

                      {/* Next round button */}
                      <div className="mt-6">
                        <Button
                          disabled={!bossVoiceDone}
                          onClick={() => {
                            // Score boost for current region
                            const region = stages[currentStage - 1].challenges[currentChallenge].regions[bossRoundIndex] as keyof typeof culturalContexts;
                            setCulturalScores(prev => ({ ...prev, [region]: Math.min(100, prev[region] + 5 + Math.random()*5) }));
                            // advance round or finish challenge
                            if (bossRoundIndex < 3) {
                              setBossRoundIndex(bossRoundIndex + 1);
                              setBossVoiceDone(false);
                              setBossTimer(30);
                            } else {
                              // finished all rounds
                              addAchievement('🏁 Final Boss Survived');
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {bossRoundIndex < 3 ? 'Next Round' : 'Rounds Complete'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Challenge actions */}
              <div className="text-center">
                {(() => {
                  const current = stages[currentStage - 1].challenges[currentChallenge];
                  // Toggle this flag to re-enable gating in the future
                  const enforceCompletion = false;
                  let disabled = false;
                  if (enforceCompletion) {
                    if (current.type === 'combo') {
                      disabled = !(comboVoiceDone && comboWriteDone);
                    } else if (current.type === 'ultimate') {
                      disabled = bossRoundIndex < 3 || !bossVoiceDone; // require finishing rounds
                    }
                  }
                  return (
                    <motion.button
                      onClick={nextChallenge}
                      disabled={disabled}
                      className={`px-10 py-4 rounded-full text-white font-bold text-lg shadow-lg transition-all flex items-center gap-3 mx-auto ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-600' : 'bg-gradient-to-r from-green-500 via-teal-500 to-blue-600 hover:from-green-500 hover:via-teal-500 hover:to-blue-700'}`}
                      whileHover={{ scale: disabled ? 1 : 1.05 }}
                      whileTap={{ scale: disabled ? 1 : 0.98 }}
                    >
                      <Target className="w-5 h-5" />
                      {currentStage === stages.length && currentChallenge === stages[currentStage - 1].challenges.length - 1 
                        ? 'COMPLETE ARENA' 
                        : 'NEXT CHALLENGE'}
                    </motion.button>
                  );
                })()}
              </div>

              {/* Achievement toast (global, positioned top-right) */}
              <AnimatePresence>
                {toastAchievement && (
                  <motion.div
                    initial={{ opacity: 0, x: 50, y: -10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="fixed top-24 right-6 z-[100000] pointer-events-none"
                  >
                    <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg px-4 py-2 shadow-2xl text-white max-w-sm border border-white/10 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <span>🏆</span>
                        <span className="font-semibold truncate">{toastAchievement}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      
        {/* Exit Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent className="glass-card border-white/20">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Leave BPOC Cultural?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-300">
                Are you sure you want to exit? Your progress will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
                Continue Playing
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmExit}
                className="bg-red-600 hover:bg-red-700"
              >
                Exit Game
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>


      </div>
    </div>
    );
  }

  // Default fallback (should not reach here)
  return null;
};

export default CulturalCommunicationArena;


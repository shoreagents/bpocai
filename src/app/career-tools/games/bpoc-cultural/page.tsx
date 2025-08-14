'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  MessageSquare, Globe, Target, Star, ArrowLeft
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
  const [playerName, setPlayerName] = useState('');
  const [currentResponse, setCurrentResponse] = useState('');
  const [survivalStatus, setSurvivalStatus] = useState(100);
  const [achievements, setAchievements] = useState<string[]>([]);
  
  const audioRef = useRef(null);
  const [hasAudio, setHasAudio] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [toastAchievement, setToastAchievement] = useState<string | null>(null);

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
      const t = setTimeout(() => setToastAchievement(null), 3000);
      return () => clearTimeout(t);
    }
  }, [achievements]);

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
      challenges: [
        {
          title: "Voice Introduction Challenge",
          description: "Introduce yourself to 4 different client teams",
          type: "voice",
          timeLimit: 120,
          regions: ['US', 'UK', 'AU', 'CA']
        },
        {
          title: "Writing Style Chameleon",
          description: "Same message, 4 different cultural styles",
          type: "writing",
          timeLimit: 90,
          regions: ['US', 'UK', 'AU', 'CA']
        }
      ]
    },
    {
      name: "Client Integration Arena", 
      challenges: [
        {
          title: "Angry Customer Gauntlet",
          description: "De-escalate 3 increasingly difficult customers",
          type: "voice",
          timeLimit: 180,
          regions: ['US', 'UK', 'AU']
        },
        {
          title: "Multi-Cultural Team Crisis",
          description: "Coordinate team from 4 different cultures",
          type: "combo",
          timeLimit: 120,
          regions: ['US', 'UK', 'AU', 'CA']
        }
      ]
    },
    {
      name: "Final Boss Battle",
      challenges: [
        {
          title: "Conference Call Chaos",
          description: "Emergency call with 4 cultural communication styles",
          type: "ultimate",
          timeLimit: 300,
          regions: ['US', 'UK', 'AU', 'CA']
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

  const handleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Mock recording start
    } else {
      setIsRecording(false);
      // Mock recording stop and analysis
      setTimeout(() => {
        const randomScore = 70 + Math.random() * 25;
        const region = ['US', 'UK', 'AU', 'CA'][Math.floor(Math.random() * 4)];
        setCulturalScores(prev => ({
          ...prev,
          [region]: Math.min(100, prev[region] + randomScore/10)
        }));
        
        if (randomScore > 85) {
          setAchievements(prev => [...prev, `${culturalContexts[region].flag} Cultural Master`]);
        }

        // Mark voice completion flags depending on active challenge type
        const current = stages[currentStage - 1].challenges[currentChallenge];
        if (current.type === 'combo') {
          setComboVoiceDone(true);
        } else if (current.type === 'ultimate') {
          setBossVoiceDone(true);
        }
      }, 1500);
    }
  };

  const handleWritingSubmit = () => {
    if (currentResponse.length > 10) {
      // Mock writing analysis
      const scores = Object.keys(culturalContexts).map(region => {
        const score = 60 + Math.random() * 35;
        return { region, score };
      });
      
      scores.forEach(({ region, score }) => {
        setCulturalScores(prev => ({
          ...prev,
          [region]: Math.min(100, prev[region] + score/10)
        }));
      });
      
      setCurrentResponse('');
      
      // Check for achievements
      if (scores.every(s => s.score > 80)) {
        setAchievements(prev => [...prev, "🌟 Cultural Chameleon"]);
      }

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
    if (playerName.trim()) {
      setGameState('playing');
    }
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
                  Master cultural communication across all regions. Navigate through 4 stages of challenges. 
                  Become the ultimate global communicator!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">Enter Your Username</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input
                        type="text"
                        placeholder="Enter your name"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-400"
                      />
                    </div>
                  </CardContent>
                </Card>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-center"
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
                      Stage {currentStage}: {stages[currentStage - 1].name}
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
                    width: `${((currentStage - 1) / stages.length) * 100}%` 
                  }}
                />
              </div>
              
              {/* Cultural scores */}
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(culturalScores).map(([region, score]) => (
                  <div key={region} className="bg-gray-700 rounded-lg p-3 text-center">
                    <div className="text-xl">{culturalContexts[region as keyof typeof culturalContexts].flag}</div>
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
              <div className="rounded-xl p-6 mb-8 text-center border border-white/10" style={{ backgroundColor: '#111315' }}>
                <h1 className="text-3xl font-bold mb-2">{stages[currentStage - 1].challenges[currentChallenge].title}</h1>
                <p className="text-lg opacity-90">{stages[currentStage - 1].challenges[currentChallenge].description}</p>
                <div className="mt-4 flex justify-center gap-4">
                  {stages[currentStage - 1].challenges[currentChallenge].regions.map(region => (
                    <span key={region} className="text-2xl">{culturalContexts[region as keyof typeof culturalContexts].flag}</span>
                  ))}
                </div>
              </div>

              {/* Challenge content */}
              <div className="bg-[#111315] rounded-xl p-8 mb-8 border border-white/10 shadow-lg shadow-black/30">
                {stages[currentStage - 1].challenges[currentChallenge].type === 'voice' && (
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-6">🎤 Voice Challenge</h3>
                    
                    {/* Example prompts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      {stages[currentStage - 1].challenges[currentChallenge].regions.map(region => (
                        <div key={region} className={`bg-gradient-to-br ${culturalContexts[region as keyof typeof culturalContexts].color} rounded-lg p-4`}>
                          <div className="text-2xl mb-2">{culturalContexts[region as keyof typeof culturalContexts].flag}</div>
                          <div className="font-bold text-lg text-white">{culturalContexts[region as keyof typeof culturalContexts].name}</div>
                          <div className="text-sm text-white/90 mb-2">{culturalContexts[region as keyof typeof culturalContexts].style}</div>
                          <div className="text-xs italic text-white/80">"{culturalContexts[region as keyof typeof culturalContexts].example}"</div>
                        </div>
                      ))}
                    </div>

                    {/* Recording interface */}
                    <div className="bg-gray-700 rounded-lg p-6">
                      <div className="text-lg mb-4">
                        {isRecording ? 
                          `🔴 Recording... ${recordingTime}s` : 
                          "Click to start recording your response"
                        }
                      </div>
                      
                      <motion.button
                        onClick={handleVoiceRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all ${
                          isRecording 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {isRecording ? <MicOff /> : <Mic />}
                      </motion.button>
                      
                      <div className="text-sm text-gray-400 mt-4">
                        Record your introduction for each cultural context
                      </div>
                    </div>
                  </div>
                )}

                {stages[currentStage - 1].challenges[currentChallenge].type === 'writing' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6">📝 Writing Challenge</h3>
                    
                    <div className="bg-gray-700 rounded-lg p-6 mb-6">
                      <h4 className="font-bold mb-2">Scenario:</h4>
                      <p className="text-gray-300">{mockChallenges.writing_adaptation.scenario}</p>
                    </div>

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

                 {stages[currentStage - 1].challenges[currentChallenge].type === 'combo' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6">⚡ Combo Challenge</h3>
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

                 {stages[currentStage - 1].challenges[currentChallenge].type === 'ultimate' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6">👑 FINAL BOSS BATTLE</h3>
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
                              setAchievements(prev => [...prev, '🏁 Final Boss Survived']);
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
                  let disabled = false;
                  if (current.type === 'combo') {
                    disabled = !(comboVoiceDone && comboWriteDone);
                  } else if (current.type === 'ultimate') {
                    disabled = bossRoundIndex < 3 || !bossVoiceDone; // require finishing rounds
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
                    initial={{ opacity: 0, x: 50, y: -50 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="fixed top-6 right-6 z-50 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl px-5 py-3 shadow-lg"
                  >
                    <div className="flex items-center gap-2 text-white">
                      <span>🏆</span>
                      <span className="font-semibold">{toastAchievement}</span>
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
};

export default CulturalCommunicationArena;


'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft,
  Guitar,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Zap,
  Target,
  Clock,
  Volume2,
  VolumeX,
  Lock,
  CheckCircle,
  Star
} from 'lucide-react';

// Progressive Vocabulary by difficulty level (varying lengths and complexity)
const BPO_VOCABULARY = {
  easy: {
    words: ['help', 'call', 'chat', 'work', 'home', 'time', 'good', 'best', 'nice', 'easy', 'fast', 'slow', 'high', 'free', 'safe', 'open', 'cool', 'warm', 'date', 'team', 'user', 'game', 'play', 'view', 'save', 'edit', 'send', 'read', 'find', 'sell'],
    timeLimit: 30, // 30 seconds
    speed: 0.6,
    spawnRate: 1800
  },
  medium: {
    words: ['tasks', 'goals', 'plans', 'costs', 'files', 'codes', 'deals', 'teams', 'users', 'games', 'sites', 'forms', 'cards', 'rates', 'types', 'modes', 'tests', 'loads', 'syncs', 'moves', 'links', 'mails', 'infos', 'pages', 'items', 'roles', 'desks', 'bills', 'notes', 'tools'],
    timeLimit: 30, // 30 seconds
    speed: 0.8,
    spawnRate: 1500
  },
  hard: {
    words: ['customer', 'service', 'support', 'billing', 'account', 'payment', 'problem', 'solution', 'request', 'feedback', 'process', 'system', 'update', 'manage', 'handle', 'call back', 'send email', 'fix issue', 'new task', 'team lead', 'data sync', 'user info', 'web page', 'file size', 'test mode', 'load time', 'sync data', 'copy text', 'push code', 'link site'],
    timeLimit: 30, // 30 seconds
    speed: 1.0,
    spawnRate: 1200
  },
  expert: {
    words: ['troubleshoot', 'escalation', 'resolution', 'representative', 'professional', 'assistance', 'communication', 'documentation', 'verification', 'authorization', 'schedule meeting', 'update system', 'process payment', 'customer feedback', 'technical support', 'quality assurance', 'data management', 'system integration', 'performance review', 'project timeline', 'client requirements', 'workflow automation', 'security protocols', 'backup procedures', 'error handling', 'user experience', 'database query', 'network config', 'server maintenance', 'code deployment'],
    timeLimit: 30, // 30 seconds
    speed: 1.0,
    spawnRate: 900
  }
};

type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

interface FallingWord {
  id: string;
  word: string;
  lane: number;
  y: number;
  speed: number;
  typed: boolean;
  missed: boolean;
}

interface GameStats {
  score: number;
  fires: number;
  poos: number;
  combo: number;
  wpm: number;
  accuracy: number;
  timeLeft: number;
  charactersTyped: number;
  correctWords: number;
  totalWords: number;
}

interface DifficultyProgress {
  easy: boolean;
  medium: boolean;
  hard: boolean;
  expert: boolean;
}

export default function TypingHeroPage() {
  const router = useRouter();
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const musicNodesRef = useRef<{
    oscillators: OscillatorNode[];
    gainNodes: GainNode[];
    isPlaying: boolean;
    currentTrack: 'menu' | 'easy' | 'medium' | 'hard' | 'expert' | 'success' | 'failure' | null;
  }>({
    oscillators: [],
    gainNodes: [],
    isPlaying: false,
    currentTrack: null
  });
  
  // Game state
  const [gameState, setGameState] = useState<'menu' | 'difficulty' | 'playing' | 'paused' | 'completed' | 'failed'>('menu');
  const [currentDifficulty, setCurrentDifficulty] = useState<DifficultyLevel>('easy');
  const [difficultyProgress, setDifficultyProgress] = useState<DifficultyProgress>({
    easy: false,
    medium: false,
    hard: false,
    expert: false
  });
  
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    fires: 0,
    poos: 0,
    combo: 0,
    wpm: 0,
    accuracy: 100,
    timeLeft: 90,
    charactersTyped: 0,
    correctWords: 0,
    totalWords: 0
  });
  
  // Game objects
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [targetZoneWords, setTargetZoneWords] = useState<FallingWord[]>([]);
  const [effects, setEffects] = useState<Array<{id: string, type: 'fire' | 'poo', lane: number}>>([]);
  const [bonusEffects, setBonusEffects] = useState<Array<{id: string, text: string, lane: number, y: number}>>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  
  // Game intervals
  const gameLoopRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const wordSpawnRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Game configuration
  const LANES = 5;
  const TARGET_ZONE_Y = 85; // Percentage from top
  const TARGET_ZONE_TOLERANCE = 8; // Percentage tolerance
  
  // Get current difficulty config
  const getCurrentConfig = () => BPO_VOCABULARY[currentDifficulty];
  
  // Initialize Web Audio API for procedural music
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.log('Web Audio API not supported');
      }
    }

    return () => {
      stopMusic();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Stop current music
  const stopMusic = useCallback(() => {
    const nodes = musicNodesRef.current;
    nodes.oscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (error) {
        // Oscillator already stopped
      }
    });
    nodes.gainNodes.forEach(gain => gain.disconnect());
    nodes.oscillators = [];
    nodes.gainNodes = [];
    nodes.isPlaying = false;
  }, []);

  // Create electronic music for different game states
  const playMusic = useCallback((trackType: 'menu' | 'easy' | 'medium' | 'hard' | 'expert' | 'success' | 'failure') => {
    if (!audioContextRef.current || isMuted) return;
    
    // Stop current music
    stopMusic();
    
    const ctx = audioContextRef.current;
    const nodes = musicNodesRef.current;
    nodes.currentTrack = trackType;
    nodes.isPlaying = true;

    // Create master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.1;
    masterGain.connect(ctx.destination);

    // Music configurations for different tracks
    const configs = {
      menu: {
        bpm: 100,
        bassFreq: 80,
        leadFreqs: [330, 440, 550],
        drumTempo: 0.5
      },
      easy: {
        bpm: 110,
        bassFreq: 60,
        leadFreqs: [262, 330, 392], // C, E, G
        drumTempo: 0.4
      },
      medium: {
        bpm: 120,
        bassFreq: 70,
        leadFreqs: [294, 370, 440], // D, F#, A
        drumTempo: 0.35
      },
      hard: {
        bpm: 140,
        bassFreq: 80,
        leadFreqs: [330, 415, 523], // E, G#, C
        drumTempo: 0.3
      },
      expert: {
        bpm: 160,
        bassFreq: 90,
        leadFreqs: [349, 440, 554], // F, A, C#
        drumTempo: 0.25
      },
      success: {
        bpm: 80,
        bassFreq: 100,
        leadFreqs: [523, 659, 784], // High victory chord
        drumTempo: 0.6
      },
      failure: {
        bpm: 60,
        bassFreq: 40,
        leadFreqs: [147, 175, 208], // Low disappointed chord
        drumTempo: 0.8
      }
    };

    const config = configs[trackType];
    const beatInterval = 60 / config.bpm;

    // Create bass line
    const createBassPattern = () => {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.value = config.bassFreq;
      bassGain.gain.value = 0.3;
      
      bassOsc.connect(bassGain);
      bassGain.connect(masterGain);
      
      nodes.oscillators.push(bassOsc);
      nodes.gainNodes.push(bassGain);
      
      bassOsc.start();
      
      // Bass pattern
      const pattern = [1, 0.1, 0.5, 0.1]; // Strong, weak, medium, weak
      let step = 0;
      
      const bassInterval = setInterval(() => {
        if (!nodes.isPlaying) {
          clearInterval(bassInterval);
          return;
        }
        
        bassGain.gain.cancelScheduledValues(ctx.currentTime);
        bassGain.gain.setValueAtTime(pattern[step % pattern.length] * 0.3, ctx.currentTime);
        bassGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + beatInterval * 0.8);
        
        step++;
      }, beatInterval * 1000);
    };

    // Create lead melody
    const createLeadMelody = () => {
      config.leadFreqs.forEach((freq, index) => {
        setTimeout(() => {
          if (!nodes.isPlaying) return;
          
          const leadOsc = ctx.createOscillator();
          const leadGain = ctx.createGain();
          
          leadOsc.type = 'square';
          leadOsc.frequency.value = freq;
          leadGain.gain.value = 0.15;
          
          leadOsc.connect(leadGain);
          leadGain.connect(masterGain);
          
          nodes.oscillators.push(leadOsc);
          nodes.gainNodes.push(leadGain);
          
          leadOsc.start();
          
          // Melody pattern
          const melodyInterval = setInterval(() => {
            if (!nodes.isPlaying) {
              clearInterval(melodyInterval);
              return;
            }
            
            // Create short melody notes
            leadGain.gain.cancelScheduledValues(ctx.currentTime);
            leadGain.gain.setValueAtTime(0.15, ctx.currentTime);
            leadGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + beatInterval * 0.3);
          }, beatInterval * 2000);
          
        }, index * beatInterval * 500);
      });
    };

    // Create drum pattern
    const createDrumPattern = () => {
      const drumInterval = setInterval(() => {
        if (!nodes.isPlaying) {
          clearInterval(drumInterval);
          return;
        }
        
        // Create kick drum
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        
        kickOsc.type = 'sine';
        kickOsc.frequency.value = 60;
        kickGain.gain.value = 0.4;
        
        kickOsc.connect(kickGain);
        kickGain.connect(masterGain);
        
        kickOsc.start();
        kickOsc.stop(ctx.currentTime + 0.1);
        
        kickGain.gain.setValueAtTime(0.4, ctx.currentTime);
        kickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
      }, config.drumTempo * 1000);
    };

    // Start all patterns
    createBassPattern();
    createLeadMelody();
    createDrumPattern();
  }, [isMuted, stopMusic]);

  // Handle music changes based on game state
  useEffect(() => {
    if (isMuted) return;
    
    if (gameState === 'menu' || gameState === 'difficulty') {
      playMusic('menu');
    }
  }, [gameState, isMuted, playMusic]);

  // Generate random word for current difficulty
  const generateWord = useCallback(() => {
    const config = getCurrentConfig();
    return config.words[Math.floor(Math.random() * config.words.length)];
  }, [currentDifficulty]);

  // Check if difficulty is unlocked (all unlocked for testing)
  const isDifficultyUnlocked = (difficulty: DifficultyLevel): boolean => {
    // All difficulties unlocked for testing
    return true;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 border-green-500/30 bg-green-500/20';
      case 'medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/20';
      case 'hard': return 'text-orange-400 border-orange-500/30 bg-orange-500/20';
      case 'expert': return 'text-red-400 border-red-500/30 bg-red-500/20';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/20';
    }
  };

  // Spawn new falling word
  const spawnWord = useCallback(() => {
    if (gameState !== 'playing') return;
    
    const config = getCurrentConfig();
    const newWord: FallingWord = {
      id: `word-${Date.now()}-${Math.random()}`,
      word: generateWord(),
      lane: Math.floor(Math.random() * LANES),
      y: -10, // Start above screen
      speed: config.speed,
      typed: false,
      missed: false
    };
    
    setFallingWords(prev => [...prev, newWord]);
  }, [gameState, generateWord, currentDifficulty]);

  // Start game with selected difficulty
  const startGame = (difficulty: DifficultyLevel) => {
    if (!isDifficultyUnlocked(difficulty)) return;
    
    setCurrentDifficulty(difficulty);
    setGameState('playing');
    setGameStartTime(Date.now());
    
    const config = BPO_VOCABULARY[difficulty];
    setGameStats({
      score: 0,
      fires: 0,
      poos: 0,
      combo: 0,
      wpm: 0,
      accuracy: 100,
      timeLeft: config.timeLimit,
      charactersTyped: 0,
      correctWords: 0,
      totalWords: 0
    });
    
    setFallingWords([]);
    setCurrentInput('');
    setEffects([]);
    setBonusEffects([]);
    setCountdown(null);
    
    // Start background music based on difficulty
    const musicTrack = difficulty as 'easy' | 'medium' | 'hard' | 'expert';
    playMusic(musicTrack);
    
    // Focus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Pause/Resume game
  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
      stopMusic();
    } else if (gameState === 'paused') {
      // Start countdown before resuming
      setCountdown(3);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null) return null;
          
          // Play countdown tick sound
          if (!isMuted && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(console.log);
          }
          
          if (prev <= 1) {
            // Show "GO!" for a brief moment, then resume game
            setTimeout(() => {
              clearInterval(countdownInterval);
              setCountdown(null);
              setGameState('playing');
              const musicTrack = currentDifficulty as 'easy' | 'medium' | 'hard' | 'expert';
              playMusic(musicTrack);
              if (inputRef.current) {
                inputRef.current.focus();
              }
            }, 800); // Brief delay to show "GO!"
            return 0; // Show "GO!" instead of 0
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // End game
  const endGame = (success: boolean) => {
    setGameState(success ? 'completed' : 'failed');
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (wordSpawnRef.current) clearInterval(wordSpawnRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Clear countdown if active
    setCountdown(null);
    
    // Stop gameplay music and play result music
    stopMusic();
    setTimeout(() => {
      playMusic(success ? 'success' : 'failure');
    }, 500);
    
    // Update progress if successful
    if (success) {
      setDifficultyProgress(prev => ({
        ...prev,
        [currentDifficulty]: true
      }));
    }
  };

  // Create visual effect
  const createEffect = (type: 'fire' | 'poo', lane: number) => {
    const effectId = `effect-${Date.now()}-${Math.random()}`;
    setEffects(prev => [...prev, { id: effectId, type, lane }]);
    
    // Play sound effect
    if (!isMuted && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.log);
    }
    
    // Remove effect after animation
    setTimeout(() => {
      setEffects(prev => prev.filter(e => e.id !== effectId));
    }, 1000);
  };

  // Create bonus text effect
  const createBonusEffect = (text: string, lane: number, y: number) => {
    const bonusId = `bonus-${Date.now()}-${Math.random()}`;
    setBonusEffects(prev => [...prev, { id: bonusId, text, lane, y }]);
    
    // Remove bonus text after animation
    setTimeout(() => {
      setBonusEffects(prev => prev.filter(e => e.id !== bonusId));
    }, 1500);
  };

  // Calculate timing bonus based on word position
  const getTimingBonus = (word: FallingWord): number => {
    const distanceFromTarget = Math.abs(word.y - TARGET_ZONE_Y);
    if (distanceFromTarget <= TARGET_ZONE_TOLERANCE) {
      return 50; // Perfect timing bonus
    } else if (distanceFromTarget <= TARGET_ZONE_TOLERANCE * 2) {
      return 25; // Good timing bonus
    } else if (distanceFromTarget <= TARGET_ZONE_TOLERANCE * 3) {
      return 10; // Okay timing bonus
    }
    return 0; // No bonus for very early/late typing
  };

  // Handle word typing
  const handleWordType = (word: FallingWord, isCorrect: boolean) => {
    if (isCorrect) {
      // Fire effect! 🔥
      createEffect('fire', word.lane);
      
      // Calculate timing bonus and show bonus text
      const timingBonus = getTimingBonus(word);
      if (timingBonus === 50) {
        createBonusEffect('PERFECT! +50', word.lane, word.y);
      } else if (timingBonus === 25) {
        createBonusEffect('GREAT! +25', word.lane, word.y);
      } else if (timingBonus === 10) {
        createBonusEffect('GOOD! +10', word.lane, word.y);
      }
      
      setGameStats(prev => {
        const newCombo = prev.combo + 1;
        const comboMultiplier = Math.min(Math.floor(newCombo / 5) + 1, 16);
        const basePoints = 100;
        const difficultyBonus = currentDifficulty === 'easy' ? 0 : 
                               currentDifficulty === 'medium' ? 25 :
                               currentDifficulty === 'hard' ? 50 : 100;
        const totalPoints = (basePoints + difficultyBonus + timingBonus) * comboMultiplier;
        
        return {
          ...prev,
          score: prev.score + totalPoints,
          fires: prev.fires + 1,
          combo: newCombo,
          correctWords: prev.correctWords + 1,
          charactersTyped: prev.charactersTyped + word.word.length
        };
      });
    } else {
      // Poo effect! 💩
      createEffect('poo', word.lane);
      
      setGameStats(prev => ({
        ...prev,
        score: Math.max(0, prev.score - 25),
        poos: prev.poos + 1,
        combo: 0, // Reset combo
        totalWords: prev.totalWords + 1
      }));
    }
    
    // Mark word as typed
    setFallingWords(prev => 
      prev.map(w => w.id === word.id ? { ...w, typed: true } : w)
    );
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim();
    setCurrentInput(value);
    
    if (!value) return;
    
    // Check if typed word matches any visible falling word
    const matchingWord = fallingWords.find(w => 
      !w.typed && !w.missed && w.word.toLowerCase() === value && w.y >= 0 && w.y <= 100
    );
    
    if (matchingWord) {
      handleWordType(matchingWord, true);
      setCurrentInput(''); // Clear input after successful match
    }
  };

  // Handle Enter key for incorrect words
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      // Check if it doesn't match any visible falling word
      const hasMatch = fallingWords.some(w => 
        !w.typed && !w.missed && w.word.toLowerCase() === currentInput.toLowerCase().trim() && w.y >= 0 && w.y <= 100
      );
      
      if (!hasMatch && fallingWords.length > 0) {
        // Wrong word typed - create poo effect in random lane
        const randomLane = Math.floor(Math.random() * LANES);
        createEffect('poo', randomLane);
        
        setGameStats(prev => ({
          ...prev,
          score: Math.max(0, prev.score - 25),
          poos: prev.poos + 1,
          combo: 0,
          totalWords: prev.totalWords + 1
        }));
      }
      
      setCurrentInput('');
    }
  };

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    timerRef.current = setInterval(() => {
      setGameStats(prev => {
        const newTimeLeft = prev.timeLeft - 1;
        
        if (newTimeLeft <= 0) {
          // Time's up - check if passed
          const totalWords = prev.correctWords + prev.totalWords;
          const accuracy = totalWords > 0 ? (prev.correctWords / totalWords) * 100 : 0;
          const passed = accuracy >= 70 && prev.correctWords >= 10; // Pass criteria
          
          setTimeout(() => endGame(passed), 100);
          return { ...prev, timeLeft: 0 };
        }
        
        // Update WPM and accuracy
        const elapsedSeconds = getCurrentConfig().timeLimit - newTimeLeft;
        const totalWords = prev.correctWords + prev.totalWords;
        const accuracy = totalWords > 0 ? (prev.correctWords / totalWords) * 100 : 100;
        const wordsTyped = prev.charactersTyped / 5;
        const wpm = elapsedSeconds > 0 ? (wordsTyped / (elapsedSeconds / 60)) : 0;
        
        return {
          ...prev,
          timeLeft: newTimeLeft,
          accuracy,
          wpm: Math.round(wpm)
        };
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentDifficulty]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    gameLoopRef.current = setInterval(() => {
      setFallingWords(prev => {
        const updated = prev.map(word => ({
          ...word,
          y: word.y + word.speed
        }));
        
        // Remove words that are off screen or typed
        const active = updated.filter(word => 
          word.y < 110 && !word.typed
        );
        
        // Mark missed words
        const withMissed = active.map(word => {
          if (word.y > TARGET_ZONE_Y + TARGET_ZONE_TOLERANCE && !word.missed && !word.typed) {
            return { ...word, missed: true };
          }
          return word;
        });
        
        return withMissed;
      });
      
      // Update words in target zone
      setTargetZoneWords(
        fallingWords.filter(word => 
          word.y >= TARGET_ZONE_Y - TARGET_ZONE_TOLERANCE &&
          word.y <= TARGET_ZONE_Y + TARGET_ZONE_TOLERANCE &&
          !word.typed && !word.missed
        )
      );
    }, 16); // ~60 FPS
    
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, fallingWords]);

  // Word spawning
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const config = getCurrentConfig();
    wordSpawnRef.current = setInterval(spawnWord, config.spawnRate);
    
    return () => {
      if (wordSpawnRef.current) clearInterval(wordSpawnRef.current);
    };
  }, [gameState, currentDifficulty, spawnWord]);

  // Toggle mute
  const toggleMute = () => {
    const wasMuted = isMuted;
    setIsMuted(!isMuted);
    
    if (wasMuted) {
      // Was muted, now unmuting - restart music based on current state
      if (gameState === 'playing') {
        const musicTrack = currentDifficulty as 'easy' | 'medium' | 'hard' | 'expert';
        playMusic(musicTrack);
      } else if (gameState === 'menu' || gameState === 'difficulty') {
        playMusic('menu');
      } else if (gameState === 'completed') {
        playMusic('success');
      } else if (gameState === 'failed') {
        playMusic('failure');
      }
    } else {
      // Was unmuted, now muting - stop music
      stopMusic();
    }
  };



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (wordSpawnRef.current) clearInterval(wordSpawnRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      stopMusic();
    };
  }, [stopMusic]);

  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
      {/* Hidden audio elements */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmEgCj2a4OwPPgEEQJvQ8t2RQgoMX7zS8dlUIAwXZr7n7qhVEwdAXbzS8NxTHwMFPZnK8N+Ja" type="audio/wav" />
      </audio>

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <Header />
      
      <div className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center">
                                <Button
                    variant="ghost"
                    onClick={() => {
                      if (gameState === 'playing' || gameState === 'paused') {
                        setShowExitDialog(true);
                      } else {
                        router.back();
                      }
                    }}
                    className="mr-4 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </Button>
              <div className="flex items-center">
                <Guitar className="h-12 w-12 text-green-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Typing Hero</h1>
                  <p className="text-gray-400">"Rock Your Keyboard!"</p>
                </div>
              </div>
            </div>
            
            {/* Game Controls */}
            {(gameState === 'playing' || gameState === 'paused') && (
              <div className="flex items-center gap-4">
                {gameState === 'playing' && (
                  <Button
                    variant="outline"
                    onClick={togglePause}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                {gameState === 'paused' && (
                  <Button
                    variant="outline"
                    onClick={togglePause}
                    disabled={countdown !== null}
                    className={`border-green-500/50 text-green-400 hover:bg-green-500/10 ${countdown !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {countdown !== null ? (countdown === 0 ? 'GO!' : `Resuming in ${countdown}...`) : 'Resume'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={toggleMute}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </motion.div>

          {/* Game Menu */}
          {gameState === 'menu' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto text-center space-y-8"
            >
              <Card className="glass-card border-white/10">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-full flex items-center justify-center mr-4">
                      <Guitar className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold gradient-text mb-2">
                        Welcome to Typing Hero!
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-lg">
                        Rock your keyboard with rhythm and speed!
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="text-gray-300 space-y-6 text-left max-w-3xl mx-auto">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-400" />
                        How to Play
                      </h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <span className="text-purple-400 mr-3 mt-0.5 text-lg">🎵</span>
                          <span>Words and phrases fall down 5 lanes like notes in Guitar Hero</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-400 mr-3 mt-0.5 text-lg">⚡</span>
                          <span>Type any visible word anytime - no need to wait!</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-400 mr-3 mt-0.5 text-lg">🎯</span>
                          <span>Get bonus points for perfect timing in the target zone</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-400 mr-3 mt-0.5 text-lg">🔥</span>
                          <span>Correct words = Fire effects and points!</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-400 mr-3 mt-0.5 text-lg">💩</span>
                          <span>Wrong words = Poo effects and lost combo</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-400 mr-3 mt-0.5 text-lg">🔓</span>
                          <span>Complete each difficulty to unlock the next one</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-cyan-400 mr-3 mt-0.5 text-lg">🏆</span>
                          <span>Achieve 70% accuracy and 10+ correct words to pass</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-purple-400 text-lg">🎵</span>
                          <h4 className="text-white font-semibold">Dynamic Music</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Each difficulty has unique electronic beats that get faster and more intense!</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-cyan-400 text-lg">📝</span>
                          <h4 className="text-white font-semibold">Progressive Challenge</h4>
                        </div>
                        <p className="text-gray-300 text-sm">From short words to complex business phrases!</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg py-6 h-14"
                    onClick={() => setGameState('difficulty')}
                  >
                    <Play className="h-6 w-6 mr-3" />
                    Choose Difficulty 
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Difficulty Selection */}
          {gameState === 'difficulty' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Choose Your Challenge</h2>
                <p className="text-gray-400">Complete each difficulty to unlock the next level</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(['easy', 'medium', 'hard', 'expert'] as DifficultyLevel[]).map((difficulty) => {
                  const config = BPO_VOCABULARY[difficulty];
                  const isUnlocked = isDifficultyUnlocked(difficulty);
                  const isCompleted = difficultyProgress[difficulty];
                  
                  return (
                    <motion.div
                      key={difficulty}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * ['easy', 'medium', 'hard', 'expert'].indexOf(difficulty) }}
                    >
                      <Card className={`glass-card border-white/10 relative ${isUnlocked ? 'hover:border-white/30 cursor-pointer' : 'opacity-50'} transition-all duration-300`}>
                        {!isUnlocked && (
                          <div className="absolute top-4 right-4">
                            <Lock className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                        {isCompleted && (
                          <div className="absolute top-4 right-4">
                            <CheckCircle className="h-6 w-6 text-green-400" />
                          </div>
                        )}
                        
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <CardTitle className="text-xl text-white capitalize">{difficulty}</CardTitle>
                            <Badge className={getDifficultyColor(difficulty)}>
                              {difficulty === 'easy' && '⭐'}
                              {difficulty === 'medium' && '⭐⭐'}
                              {difficulty === 'hard' && '⭐⭐⭐'}
                              {difficulty === 'expert' && '⭐⭐⭐⭐'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex justify-between">
                              <span>Time Limit:</span>
                              <span className="text-cyan-400">{Math.floor(config.timeLimit / 60)}:{(config.timeLimit % 60).toString().padStart(2, '0')}</span>
                            </div>
                                                         <div className="flex justify-between">
                               <span>Word Type:</span>
                               <span className="text-purple-400">
                                 {difficulty === 'easy' && '4-Letter Words'}
                                 {difficulty === 'medium' && '5-6 Letter Words'}
                                 {difficulty === 'hard' && 'Long Words + Phrases'}
                                 {difficulty === 'expert' && 'Complex Phrases'}
                               </span>
                             </div>
                            <div className="flex justify-between">
                              <span>Speed:</span>
                              <span className="text-yellow-400">
                                {difficulty === 'easy' && 'Slow'}
                                {difficulty === 'medium' && 'Normal'}
                                {difficulty === 'hard' && 'Fast'}
                                {difficulty === 'expert' && 'Very Fast'}
                              </span>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <Button
                            className={`w-full ${isUnlocked ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : 'bg-gray-600 cursor-not-allowed'}`}
                            onClick={() => isUnlocked && startGame(difficulty)}
                            disabled={!isUnlocked}
                          >
                            {!isUnlocked ? (
                              <>
                                <Lock className="h-4 w-4 mr-2" />
                                Locked
                              </>
                            ) : isCompleted ? (
                              <>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Play Again
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Start Challenge
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={() => setGameState('menu')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Menu
                </Button>
              </div>
            </motion.div>
          )}

          {/* Game Arena */}
          {(gameState === 'playing' || gameState === 'paused') && (
            <div className="space-y-6">
              {/* Stats Bar */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Time Progress Bar */}
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">Time Remaining</span>
                    <span className="text-cyan-400 font-bold">
                      {Math.floor(gameStats.timeLeft / 60)}:{(gameStats.timeLeft % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <Progress 
                    value={(gameStats.timeLeft / getCurrentConfig().timeLimit) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Game Stats */}
                <div className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-400" />
                      <span className="text-white font-bold">{gameStats.score.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🔥</span>
                      <span className="text-green-400 font-bold">{gameStats.fires}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💩</span>
                      <span className="text-red-400 font-bold">{gameStats.poos}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-400" />
                      <span className="text-purple-400 font-bold">{gameStats.combo}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-cyan-400" />
                      <span className="text-cyan-400 font-bold">{gameStats.wpm} WPM</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getDifficultyColor(currentDifficulty)}>
                      {currentDifficulty.toUpperCase()}
                    </Badge>
                    <span className="text-white">
                      Accuracy: <span className="font-bold">{Math.round(gameStats.accuracy)}%</span>
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Game Area */}
              <Card className="glass-card border-white/10 relative overflow-hidden">
                <div
                  ref={gameAreaRef}
                  className="relative h-96 bg-gradient-to-b from-gray-900/50 to-gray-800/50"
                  style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(30,30,30,0.9) 100%)' }}
                >
                  {/* Pause Overlay */}
                  {gameState === 'paused' && !countdown && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
                    >
                      <div className="text-center">
                        <h2 className="text-4xl font-bold text-white mb-4">Game Paused</h2>
                        <Button
                          onClick={togglePause}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      </div>
                    </motion.div>
                  )}

                                    {/* Countdown Overlay */}
                  {countdown !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
                    >
                      <div className="glass-card border-white/10 p-8 text-center">
                        <motion.div
                          key={countdown}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="text-6xl font-bold text-white mb-4"
                        >
                          {countdown === 0 ? 'GO!' : countdown}
                        </motion.div>
                        <div className="text-lg text-gray-300">
                          {countdown === 0 ? 'Start typing!' : 'Game resuming...'}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Lane Dividers */}
                  {Array.from({ length: LANES + 1 }, (_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-px bg-cyan-400/30"
                      style={{ left: `${(i / LANES) * 100}%` }}
                    />
                  ))}

                  {/* Target Zone */}
                  <div
                    className="absolute left-0 right-0 border-t-2 border-b-2 border-yellow-400/60 bg-yellow-400/10"
                    style={{
                      top: `${TARGET_ZONE_Y - TARGET_ZONE_TOLERANCE}%`,
                      height: `${TARGET_ZONE_TOLERANCE * 2}%`
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-yellow-400 font-bold text-sm opacity-60">TARGET ZONE</span>
                    </div>
                  </div>

                  {/* Falling Words */}
                  <AnimatePresence>
                    {fallingWords.map((word) => (
                      <motion.div
                        key={word.id}
                        initial={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className={`absolute text-white font-bold text-sm px-2 py-1 rounded ${
                          word.missed ? 'bg-red-500/80' : 'bg-blue-500/80'
                        }`}
                        style={{
                          left: `${(word.lane / LANES) * 100 + (1 / LANES) * 50}%`,
                          top: `${word.y}%`,
                          transform: 'translateX(-50%)',
                          fontSize: currentDifficulty === 'easy' ? '13px' : 
                                   currentDifficulty === 'medium' ? '12px' :
                                   currentDifficulty === 'hard' ? '11px' : '10px'
                        }}
                      >
                        {word.word}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Effects */}
                  <AnimatePresence>
                    {effects.map((effect) => (
                      <motion.div
                        key={effect.id}
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute text-6xl pointer-events-none"
                        style={{
                          left: `${(effect.lane / LANES) * 100 + (1 / LANES) * 50}%`,
                          top: `${TARGET_ZONE_Y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {effect.type === 'fire' ? '🔥' : '💩'}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Bonus Text Effects */}
                  <AnimatePresence>
                    {bonusEffects.map((bonus) => (
                      <motion.div
                        key={bonus.id}
                        initial={{ opacity: 1, y: 0, scale: 1 }}
                        animate={{ opacity: 0, y: -30, scale: 1.2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute text-sm font-bold pointer-events-none"
                        style={{
                          left: `${(bonus.lane / LANES) * 100 + (1 / LANES) * 50}%`,
                          top: `${bonus.y}%`,
                          transform: 'translateX(-50%)',
                          color: bonus.text.includes('PERFECT') ? '#10b981' : 
                                 bonus.text.includes('GREAT') ? '#f59e0b' : '#8b5cf6',
                          textShadow: '0 0 4px rgba(0,0,0,0.8)'
                        }}
                      >
                        {bonus.text}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Reaction Zone */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                    <div className="flex items-center gap-8">
                      {Array.from({ length: LANES }, (_, i) => (
                        <div key={i} className="w-8 h-8 flex items-center justify-center">
                          {effects.find(e => e.lane === i) && (
                            <span className="text-2xl">
                              {effects.find(e => e.lane === i)?.type === 'fire' ? '🔥' : '💩'}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Input Area */}
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        ref={inputRef}
                        value={currentInput}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder={fallingWords.filter(w => !w.typed && !w.missed && w.y >= 0 && w.y <= 100).length > 0 ? 
                          `Type any visible: ${fallingWords.filter(w => !w.typed && !w.missed && w.y >= 0 && w.y <= 100).slice(0, 2).map(w => w.word).join(', ')}${fallingWords.filter(w => !w.typed && !w.missed && w.y >= 0 && w.y <= 100).length > 2 ? '...' : ''}` : 
                          "Type any word or phrase when it appears..."
                        }
                        className="bg-gray-800/50 border-white/20 text-white text-lg font-mono"
                        disabled={gameState !== 'playing'}
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                    </div>
                    <div className="text-sm text-gray-400">
                      <div>Pass: <span className="text-green-400">70% accuracy + 10 words</span></div>
                      <div className="mt-1 text-xs">
                        Timing bonuses: <span className="text-green-400">Perfect +50</span> | <span className="text-yellow-400">Great +25</span> | <span className="text-purple-400">Good +10</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Game Complete */}
          {(gameState === 'completed' || gameState === 'failed') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className={`text-3xl text-center mb-4 ${gameState === 'completed' ? 'text-green-400' : 'text-red-400'}`}>
                    {gameState === 'completed' ? (
                      <>🎉 Challenge Complete! 🔥</>
                    ) : (
                      <>💩 Challenge Failed</>
                    )}
                  </CardTitle>
                  {gameState === 'completed' && (
                    <div className="text-center">
                      <Badge className={getDifficultyColor(currentDifficulty)}>
                        {currentDifficulty.toUpperCase()} COMPLETED
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Final Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400">{gameStats.score.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">Final Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400">{gameStats.wpm}</div>
                      <div className="text-sm text-gray-400">WPM</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400">{gameStats.fires}</div>
                      <div className="text-sm text-gray-400">🔥 Fires</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${gameStats.accuracy >= 70 ? 'text-green-400' : 'text-red-400'}`}>
                        {Math.round(gameStats.accuracy)}%
                      </div>
                      <div className="text-sm text-gray-400">Accuracy</div>
                    </div>
                  </div>

                  {gameState === 'failed' && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                      <p className="text-red-400 font-medium mb-2">Requirements Not Met</p>
                      <p className="text-gray-300 text-sm">
                        Need: 70% accuracy and 10+ correct words
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                      onClick={() => startGame(currentDifficulty)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-white/20 text-white hover:bg-white/10"
                      onClick={() => setGameState('difficulty')}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Choose Difficulty
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Exit Game Alert Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Exit Game</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to exit the game? This will take you back to the main menu and you'll lose your current progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => router.back()}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0"
            >
              Exit Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 
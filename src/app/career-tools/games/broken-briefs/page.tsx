'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  FileText,
  Target,
  Play,
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  Timer,
  Trophy,
  Users,
  Zap,
  BarChart3,
  Star,
  MessageSquare,
  Edit3,
  Award
} from 'lucide-react';

interface Brief {
  id: string;
  title: string;
  clientMessage: string;
  keyPoints: string[];
  requiredElements: string[];
  optionalElements: string[];
  timeLimit: number;
  difficulty: 'easy' | 'medium' | 'hard';
  isCompleted: boolean;
  score?: number;
  feedback?: string[];
}

interface GameStats {
  score: number;
  briefsCompleted: number;
  accuracy: number;
  timeLeft: number;
  currentBrief: number;
  totalBriefs: number;
}

export default function BrokenBriefsPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [currentBrief, setCurrentBrief] = useState<Brief | null>(null);
  const [userBrief, setUserBrief] = useState('');
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    briefsCompleted: 0,
    accuracy: 0,
    timeLeft: 300, // 5 minutes per brief
    currentBrief: 0,
    totalBriefs: 5
  });
  const [gameTime, setGameTime] = useState(300);
  const [gameInterval, setGameInterval] = useState<NodeJS.Timeout | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const briefs: Brief[] = [
    {
      id: 'brief-1',
      title: 'Social Media Campaign',
      clientMessage: `Hi, I need the thing we talked about the other day—you know, the new promo thing for social media. It should kind of match the old one from July but not be too samey. Maybe also mention the discount, but don't make it the focus. And if you can get it done quickly that'd be great—like by Friday if possible, but no worries if not. Thanks!`,
      keyPoints: ['social media promo', 'similar to July version', 'fresh look', 'include discount', 'complete by Friday'],
      requiredElements: ['Design', 'Social media', 'Promo', 'July style', 'Discount', 'Friday deadline'],
      optionalElements: ['Fresh look', 'Not too samey', 'Quick completion'],
      timeLimit: 300, // 5 minutes
      difficulty: 'easy',
      isCompleted: false
    },
    {
      id: 'brief-2',
      title: 'Website Redesign',
      clientMessage: `So we're thinking about maybe updating our website? The current one is kind of old and doesn't really show what we do anymore. We want something modern but not too flashy, you know? Like clean and professional. Also, we need to add a contact form somewhere and maybe a blog section. Oh, and it should work well on phones too. Can you give us an idea of what that might look like?`,
      keyPoints: ['website redesign', 'modern design', 'clean and professional', 'contact form', 'blog section', 'mobile responsive'],
      requiredElements: ['Website', 'Redesign', 'Modern', 'Professional', 'Contact form', 'Blog', 'Mobile responsive'],
      optionalElements: ['Clean design', 'Not flashy', 'Show services'],
      timeLimit: 300, // 5 minutes
      difficulty: 'medium',
      isCompleted: false
    },
    {
      id: 'brief-3',
      title: 'Product Launch',
      clientMessage: `We're launching this new product next month and need to get the word out. It's like a subscription service for small businesses. We want to create some buzz but not oversell it. Maybe some social media posts, an email campaign, and possibly a press release? The target audience is small business owners, so keep that in mind. Budget is around $5k for this whole thing.`,
      keyPoints: ['product launch', 'subscription service', 'small businesses', 'social media', 'email campaign', 'press release', '$5k budget'],
      requiredElements: ['Product launch', 'Subscription service', 'Small business audience', 'Social media', 'Email campaign', 'Press release', '$5k budget'],
      optionalElements: ['Create buzz', 'Don\'t oversell', 'Next month'],
      timeLimit: 300, // 5 minutes
      difficulty: 'hard',
      isCompleted: false
    },
    {
      id: 'brief-4',
      title: 'Event Planning',
      clientMessage: `We're planning this big event for our clients—like a networking thing with some speakers and stuff. It should be somewhere nice, maybe a hotel or conference center. We need to figure out catering, decorations, and all that. Also, we want to record the speakers for later use. The event is in about 3 months, so we have time to plan. Budget is flexible but we want to keep it reasonable.`,
      keyPoints: ['networking event', 'speakers', 'hotel/conference center', 'catering', 'decorations', 'video recording', '3 months timeline'],
      requiredElements: ['Networking event', 'Speakers', 'Venue', 'Catering', 'Decorations', 'Video recording', '3 months timeline'],
      optionalElements: ['Nice location', 'Flexible budget', 'Reasonable cost'],
      timeLimit: 300, // 5 minutes
      difficulty: 'hard',
      isCompleted: false
    },
    {
      id: 'brief-5',
      title: 'Content Marketing',
      clientMessage: `I want to start doing more content marketing to attract leads. We're in the B2B space, so we need content that speaks to business people. Maybe some whitepapers, case studies, and blog posts? We should also do some SEO stuff to make sure people can find us. The goal is to generate more qualified leads through content.`,
      keyPoints: ['content marketing', 'B2B audience', 'whitepapers', 'case studies', 'blog posts', 'SEO', 'qualified leads'],
      requiredElements: ['Content marketing', 'B2B audience', 'Whitepapers', 'Case studies', 'Blog posts', 'SEO', 'Qualified leads'],
      optionalElements: ['Business-focused content', 'Lead generation'],
      timeLimit: 300, // 5 minutes
      difficulty: 'medium',
      isCompleted: false
    }
  ];

  const startGame = () => {
    setGameState('playing');
    setGameStats({
      score: 0,
      briefsCompleted: 0,
      accuracy: 0,
      timeLeft: 300, // 5 minutes per brief
      currentBrief: 0,
      totalBriefs: 5
    });
    setGameTime(300); // 5 minutes
    setCurrentBrief(briefs[0]);
    setUserBrief('');
    setShowFeedback(false);

    // Start brief timer
    const gameTimer = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          // Time's up for current brief, auto-submit or move to next
          if (userBrief.trim()) {
            submitBrief();
          } else {
            moveToNextBrief();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setGameInterval(gameTimer);
  };

  const moveToNextBrief = () => {
    if (gameInterval) clearInterval(gameInterval);
    
    const nextBriefIndex = gameStats.currentBrief + 1;
    
    if (nextBriefIndex < briefs.length) {
      // Move to next brief
      setCurrentBrief(briefs[nextBriefIndex]);
      setUserBrief('');
      setGameTime(300); // Reset to 5 minutes
      
      // Start new timer for next brief
      const newTimer = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            if (userBrief.trim()) {
              submitBrief();
            } else {
              moveToNextBrief();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      setGameInterval(newTimer);
    } else {
      // All briefs completed
      endGame();
    }
  };

  const endGame = () => {
    if (gameInterval) clearInterval(gameInterval);
    
    const accuracy = gameStats.briefsCompleted > 0 
      ? (gameStats.score / (gameStats.briefsCompleted * 100)) * 100 
      : 0;
    
    setGameStats(prev => ({ ...prev, accuracy }));
    setGameState('finished');
  };

  const evaluateBrief = (userInput: string, brief: Brief) => {
    const input = userInput.toLowerCase();
    let score = 0;
    const feedback: string[] = [];

    // Check required elements
    brief.requiredElements.forEach(element => {
      if (input.includes(element.toLowerCase())) {
        score += 5;
        feedback.push(`✅ Included "${element}"`);
      } else {
        score -= 5;
        feedback.push(`❌ Missing "${element}"`);
      }
    });

    // Check optional elements
    brief.optionalElements.forEach(element => {
      if (input.includes(element.toLowerCase())) {
        score += 2;
        feedback.push(`✅ Bonus: "${element}"`);
      }
    });

    // Check for clarity and conciseness
    const wordCount = userInput.split(' ').length;
    if (wordCount <= 50) {
      score += 3;
      feedback.push('✅ Concise and clear');
    } else if (wordCount > 100) {
      score -= 3;
      feedback.push('❌ Too verbose');
    }

    // Check for logical flow
    if (userInput.includes('•') || userInput.includes('-') || userInput.includes('1.') || userInput.includes('2.')) {
      score += 3;
      feedback.push('✅ Good structure');
    }

    // Ensure minimum score
    score = Math.max(score, 0);

    return { score, feedback };
  };

  const submitBrief = () => {
    if (!currentBrief || !userBrief.trim()) return;

    const { score, feedback } = evaluateBrief(userBrief, currentBrief);
    
    // Update brief
    const updatedBrief = {
      ...currentBrief,
      isCompleted: true,
      score,
      feedback
    };

    // Update stats
    setGameStats(prev => ({
      ...prev,
      score: prev.score + score,
      briefsCompleted: prev.briefsCompleted + 1,
      currentBrief: prev.currentBrief + 1
    }));

    // Show feedback
    setShowFeedback(true);

    // Move to next brief or end game
    setTimeout(() => {
      setShowFeedback(false);
      moveToNextBrief();
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  useEffect(() => {
    return () => {
      if (gameInterval) clearInterval(gameInterval);
    };
  }, [gameInterval]);

  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl"></div>
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
                      if (gameState === 'playing') {
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
                <FileText className="h-12 w-12 text-green-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Broken Briefs</h1>
                  <p className="text-gray-400">Transform confusing instructions into clear briefs</p>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {gameState === 'menu' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-4xl mx-auto text-center space-y-8"
              >
                <Card className="glass-card border-white/10">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mr-4">
                        <FileText className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold gradient-text mb-2">
                          Welcome to Broken Briefs!
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg">
                          Master the art of clear communication
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="text-gray-300 space-y-6 text-left max-w-3xl mx-auto">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-400" />
                          How to Play
                        </h3>
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-start">
                            <span className="text-red-400 mr-3 mt-0.5 text-lg">📝</span>
                            <span>Read confusing client messages and instructions</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-yellow-400 mr-3 mt-0.5 text-lg">✍️</span>
                            <span>Rewrite them into clear, actionable task briefs</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-3 mt-0.5 text-lg">🎯</span>
                            <span>Include all key points while removing unnecessary fluff</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-400 mr-3 mt-0.5 text-lg">⏰</span>
                            <span>Complete 5 briefs within 8 minutes</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-cyan-400 mr-3 mt-0.5 text-lg">🏆</span>
                            <span>Earn points for accuracy, clarity, and completeness</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-orange-400 mr-3 mt-0.5 text-lg">📊</span>
                            <span>Get detailed feedback on your communication skills</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-green-400 text-lg">📝</span>
                            <h4 className="text-white font-semibold">Communication Skills</h4>
                          </div>
                          <p className="text-gray-300 text-sm">Practice transforming vague instructions into clear, actionable briefs!</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-cyan-400 text-lg">✍️</span>
                            <h4 className="text-white font-semibold">Summarization</h4>
                          </div>
                          <p className="text-gray-300 text-sm">Develop skills to extract key information and present it clearly!</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg py-6 h-14"
                      onClick={startGame}
                    >
                      <Play className="h-6 w-6 mr-3" />
                      Start Challenge
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {gameState === 'playing' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-6xl mx-auto"
              >
                {/* Game Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card className="glass-card border-white/10 text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Timer className="w-5 h-5 text-green-400 mr-2" />
                        <span className="text-2xl font-bold text-white">{formatTime(gameTime)}</span>
                      </div>
                      <p className="text-xs text-gray-400">Time Left</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-white/10 text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                        <span className="text-2xl font-bold text-white">{gameStats.score}</span>
                      </div>
                      <p className="text-xs text-gray-400">Score</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-white/10 text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <FileText className="w-5 h-5 text-green-400 mr-2" />
                        <span className="text-2xl font-bold text-white">{gameStats.currentBrief + 1}/{gameStats.totalBriefs}</span>
                      </div>
                      <p className="text-xs text-gray-400">Brief</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-white/10 text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <BarChart3 className="w-5 h-5 text-cyan-400 mr-2" />
                        <span className="text-2xl font-bold text-white">
                          {gameStats.briefsCompleted > 0 
                            ? Math.round((gameStats.score / (gameStats.briefsCompleted * 100)) * 100)
                            : 0}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Accuracy</p>
                    </CardContent>
                  </Card>
                </div>

                {currentBrief && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Client Message */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-red-400" />
                        Client Message
                      </h3>
                      <Card className="glass-card border-white/10">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getDifficultyColor(currentBrief.difficulty)}>
                              {currentBrief.difficulty.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              Brief {gameStats.currentBrief + 1} of {gameStats.totalBriefs}
                            </span>
                          </div>
                          <CardTitle className="text-white">{currentBrief.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div 
                            className="bg-gray-900/50 rounded-lg p-4 text-gray-300 text-sm leading-relaxed select-none"
                            onCopy={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            "{currentBrief.clientMessage}"
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Brief Writing */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-green-400" />
                        Your Task Brief
                      </h3>
                      <Card className="glass-card border-white/10">
                        <CardContent className="p-6">
                          <textarea
                            value={userBrief}
                            onChange={(e) => setUserBrief(e.target.value)}
                            onPaste={(e) => e.preventDefault()}
                            onCopy={(e) => e.preventDefault()}
                            onCut={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                            placeholder="Rewrite the client message into a clear, actionable task brief..."
                            className="w-full h-48 bg-gray-900/50 border border-gray-700 rounded-lg p-4 text-white text-sm resize-none focus:outline-none focus:border-purple-500"
                          />
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-gray-400">
                              {userBrief.split(' ').length} words
                            </span>
                            <Button
                              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                              onClick={submitBrief}
                              disabled={!userBrief.trim()}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Submit Brief
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Feedback Modal */}
                <AnimatePresence>
                  {showFeedback && currentBrief && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="max-w-md w-full mx-4"
                      >
                        <Card className="glass-card border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                              <Award className="w-5 h-5 text-yellow-400" />
                              Brief Evaluation
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white mb-2">
                                {currentBrief.score || 0} points
                              </div>
                              <div className="text-sm text-gray-400">
                                {(currentBrief.score || 0) >= 80 ? 'Excellent!' : 
                                 (currentBrief.score || 0) >= 60 ? 'Good job!' : 
                                 (currentBrief.score || 0) >= 40 ? 'Keep practicing!' : 'Needs improvement'}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {currentBrief.feedback?.map((item, index) => (
                                <div key={index} className="text-sm text-gray-300">
                                  {item}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {gameState === 'finished' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto text-center"
              >
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-full flex items-center justify-center mr-4">
                        <Trophy className="w-8 h-8 text-yellow-400" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold gradient-text mb-2">
                          Challenge Complete!
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg">
                          Great job improving your communication skills!
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Final Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{gameStats.score}</div>
                        <div className="text-sm text-gray-400">Final Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{gameStats.briefsCompleted}</div>
                        <div className="text-sm text-gray-400">Briefs Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{gameStats.accuracy}%</div>
                        <div className="text-sm text-gray-400">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{formatTime(480 - gameTime)}</div>
                        <div className="text-sm text-gray-400">Time Used</div>
                      </div>
                    </div>

                    {/* Performance Rating */}
                    <div className="p-4 bg-white/5 rounded-lg">
                      <h4 className="text-white font-semibold mb-2">Performance Rating</h4>
                      <div className="flex items-center justify-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(gameStats.accuracy / 20) 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-500'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        {gameStats.accuracy >= 80 ? 'Excellent communication skills!' : 
                         gameStats.accuracy >= 60 ? 'Good communication abilities!' : 
                         gameStats.accuracy >= 40 ? 'Keep practicing clarity!' : 'Focus on clear communication'}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        onClick={startGame}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play Again
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setGameState('menu')}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Menu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
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
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
  Mail,
  Target,
  Play,
  Clock,
  CheckCircle,
  X,
  Archive,
  Flag,
  AlertTriangle,
  Timer,
  Trophy,
  Users,
  Zap,
  BarChart3,
  Star
} from 'lucide-react';

interface Email {
  id: string;
  subject: string;
  sender: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  type: 'urgent' | 'spam' | 'follow-up' | 'conflicting' | 'client';
  timeReceived: number;
  isProcessed: boolean;
  action?: 'reply' | 'archive' | 'flag' | 'spam';
  isCorrect?: boolean;
}

interface GameStats {
  score: number;
  emailsProcessed: number;
  correctActions: number;
  missedUrgent: number;
  timeLeft: number;
  accuracy: number;
}

export default function InboxZeroPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [emails, setEmails] = useState<Email[]>([]);
  const [currentEmail, setCurrentEmail] = useState<Email | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    emailsProcessed: 0,
    correctActions: 0,
    missedUrgent: 0,
    timeLeft: 300, // 5 minutes
    accuracy: 0
  });
  const [gameTime, setGameTime] = useState(300);
  const [emailSpawnInterval, setEmailSpawnInterval] = useState<NodeJS.Timeout | null>(null);
  const [gameInterval, setGameInterval] = useState<NodeJS.Timeout | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const emailTemplates = [
    {
      subject: 'URGENT: System Down - All Agents Affected',
      sender: 'IT Support',
      content: 'Critical system failure affecting all customer service agents. Please escalate immediately to management.',
      priority: 'high' as const,
      type: 'urgent' as const,
      correctAction: 'reply' as const
    },
    {
      subject: 'Client Escalation - VIP Customer Complaint',
      sender: 'Customer Service Manager',
      content: 'VIP customer threatening to cancel contract. Requires immediate attention and response.',
      priority: 'high' as const,
      type: 'client' as const,
      correctAction: 'reply' as const
    },
    {
      subject: 'Weekly Team Meeting Reminder',
      sender: 'Team Lead',
      content: 'Don\'t forget our weekly team meeting tomorrow at 10 AM. Please prepare your updates.',
      priority: 'medium' as const,
      type: 'follow-up' as const,
      correctAction: 'flag' as const
    },
    {
      subject: 'You\'ve Won $1,000,000! Click Here!',
      sender: 'prize@spam.com',
      content: 'Congratulations! You\'ve been selected for our exclusive prize. Click here to claim your $1,000,000!',
      priority: 'low' as const,
      type: 'spam' as const,
      correctAction: 'spam' as const
    },
    {
      subject: 'Deadline Conflict - Project A vs Project B',
      sender: 'Project Manager',
      content: 'Both Project A and Project B have conflicting deadlines for Friday. Need to prioritize one over the other.',
      priority: 'high' as const,
      type: 'conflicting' as const,
      correctAction: 'reply' as const
    },
    {
      subject: 'Monthly Report Due Today',
      sender: 'Operations Manager',
      content: 'Your monthly performance report is due by 5 PM today. Please submit your metrics and achievements.',
      priority: 'medium' as const,
      type: 'follow-up' as const,
      correctAction: 'flag' as const
    },
    {
      subject: 'Free Viagra - 50% Off Today Only!',
      sender: 'pharmacy@spam.net',
      content: 'Get your free Viagra sample today! Limited time offer. Click now before it\'s gone!',
      priority: 'low' as const,
      type: 'spam' as const,
      correctAction: 'spam' as const
    },
    {
      subject: 'Client Request: Urgent Quote Needed',
      sender: 'Sales Team',
      content: 'Client needs pricing quote by 3 PM today for new service package. Please respond with detailed breakdown.',
      priority: 'high' as const,
      type: 'client' as const,
      correctAction: 'reply' as const
    },
    {
      subject: 'Team Building Event Next Week',
      sender: 'HR Department',
      content: 'Join us for our quarterly team building event next Friday. RSVP by Wednesday.',
      priority: 'low' as const,
      type: 'follow-up' as const,
      correctAction: 'archive' as const
    },
    {
      subject: 'System Maintenance Tonight',
      sender: 'IT Department',
      content: 'Scheduled maintenance tonight from 10 PM to 2 AM. System will be unavailable during this time.',
      priority: 'medium' as const,
      type: 'follow-up' as const,
      correctAction: 'flag' as const
    },
    {
      subject: 'You\'re Our Lucky Winner!',
      sender: 'lottery@fake.com',
      content: 'Congratulations! You\'ve won our grand prize! Send us your bank details to claim your money!',
      priority: 'low' as const,
      type: 'spam' as const,
      correctAction: 'spam' as const
    },
    {
      subject: 'Client Complaint - Service Quality Issue',
      sender: 'Quality Assurance',
      content: 'Client has filed formal complaint about service quality. Requires immediate investigation and response.',
      priority: 'high' as const,
      type: 'client' as const,
      correctAction: 'reply' as const
    },
    {
      subject: 'Office Supplies Order',
      sender: 'Admin Team',
      content: 'Monthly office supplies order is ready for review. Please check the attached list.',
      priority: 'low' as const,
      type: 'follow-up' as const,
      correctAction: 'archive' as const
    },
    {
      subject: 'Training Session Tomorrow',
      sender: 'Training Department',
      content: 'New software training session tomorrow at 2 PM. All agents must attend.',
      priority: 'medium' as const,
      type: 'follow-up' as const,
      correctAction: 'flag' as const
    },
    {
      subject: 'Free iPhone 15 - Claim Now!',
      sender: 'apple@fake.com',
      content: 'You\'ve been selected for a free iPhone 15! Click here to claim your prize immediately!',
      priority: 'low' as const,
      type: 'spam' as const,
      correctAction: 'spam' as const
    }
  ];

  const generateEmail = useCallback((): Email => {
    const template = emailTemplates[Math.floor(Math.random() * emailTemplates.length)];
    return {
      id: `email-${Date.now()}-${Math.random()}`,
      subject: template.subject,
      sender: template.sender,
      content: template.content,
      priority: template.priority,
      type: template.type,
      timeReceived: Date.now(),
      isProcessed: false
    };
  }, []);

  const startGame = () => {
    setGameState('playing');
    setGameStats({
      score: 0,
      emailsProcessed: 0,
      correctActions: 0,
      missedUrgent: 0,
      timeLeft: 300,
      accuracy: 0
    });
    setGameTime(300);
    setEmails([]);
    setCurrentEmail(null);

    // Start spawning emails
    const spawnInterval = setInterval(() => {
      setEmails(prev => {
        const newEmail = generateEmail();
        return [...prev, newEmail];
      });
    }, 8000); // Spawn every 8 seconds

    setEmailSpawnInterval(spawnInterval);

    // Start game timer
    const gameTimer = setInterval(() => {
      setGameTime(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setGameInterval(gameTimer);
  };

  const endGame = () => {
    if (emailSpawnInterval) clearInterval(emailSpawnInterval);
    if (gameInterval) clearInterval(gameInterval);
    
    const accuracy = gameStats.emailsProcessed > 0 
      ? (gameStats.correctActions / gameStats.emailsProcessed) * 100 
      : 0;
    
    setGameStats(prev => ({ ...prev, accuracy }));
    setGameState('finished');
  };

  const processEmail = (emailId: string, action: 'reply' | 'archive' | 'flag' | 'spam') => {
    const email = emails.find(e => e.id === emailId);
    if (!email) return;

    const template = emailTemplates.find(t => 
      t.subject === email.subject && t.sender === email.sender
    );

    const isCorrect = template?.correctAction === action;
    let points = 0;

    if (isCorrect) {
      if (email.priority === 'high') points = 10;
      else if (email.priority === 'medium') points = 7;
      else points = 3;
    } else {
      if (email.priority === 'high') points = -10;
      else if (email.priority === 'medium') points = -7;
      else points = -3;
    }

    // Update email
    setEmails(prev => prev.map(e => 
      e.id === emailId 
        ? { ...e, isProcessed: true, action, isCorrect }
        : e
    ));

    // Update stats
    setGameStats(prev => ({
      ...prev,
      score: prev.score + points,
      emailsProcessed: prev.emailsProcessed + 1,
      correctActions: prev.correctActions + (isCorrect ? 1 : 0),
      missedUrgent: prev.missedUrgent + (email.priority === 'high' && !isCorrect ? 1 : 0)
    }));

    // Remove processed email
    setTimeout(() => {
      setEmails(prev => prev.filter(e => e.id !== emailId));
    }, 1000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (emailSpawnInterval) clearInterval(emailSpawnInterval);
      if (gameInterval) clearInterval(gameInterval);
    };
  }, [emailSpawnInterval, gameInterval]);

  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
                <Mail className="h-12 w-12 text-green-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Inbox Zero Challenge</h1>
                  <p className="text-gray-400">Master email triage and prioritization</p>
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
                        <Mail className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold gradient-text mb-2">
                          Welcome to Inbox Zero Challenge!
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg">
                          Master email triage in a simulated BPO environment
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
                            <span className="text-red-400 mr-3 mt-0.5 text-lg">📧</span>
                            <span>Emails arrive in your inbox with different priorities and types</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-yellow-400 mr-3 mt-0.5 text-lg">⚡</span>
                            <span>Quickly assess each email's urgency and importance</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-3 mt-0.5 text-lg">🎯</span>
                            <span>Choose the correct action: Reply, Archive, Flag, or Mark as Spam</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-purple-400 mr-3 mt-0.5 text-lg">⏰</span>
                            <span>Complete as many emails as possible within 5 minutes</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-orange-400 mr-3 mt-0.5 text-lg">🏆</span>
                            <span>Earn points for correct actions, lose points for mistakes</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-cyan-400 mr-3 mt-0.5 text-lg">📊</span>
                            <span>High-priority emails are worth more points but also bigger penalties</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-green-400 text-lg">📧</span>
                            <h4 className="text-white font-semibold">Email Triage</h4>
                          </div>
                          <p className="text-gray-300 text-sm">Practice real-world email management scenarios from BPO environments!</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-cyan-400 text-lg">⚡</span>
                            <h4 className="text-white font-semibold">Quick Decision Making</h4>
                          </div>
                          <p className="text-gray-300 text-sm">Develop fast, accurate decision-making skills under pressure!</p>
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
                        <Timer className="w-5 h-5 text-blue-400 mr-2" />
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
                        <Mail className="w-5 h-5 text-green-400 mr-2" />
                        <span className="text-2xl font-bold text-white">{gameStats.emailsProcessed}</span>
                      </div>
                      <p className="text-xs text-gray-400">Processed</p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-white/10 text-center">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-center mb-2">
                        <BarChart3 className="w-5 h-5 text-purple-400 mr-2" />
                        <span className="text-2xl font-bold text-white">
                          {gameStats.emailsProcessed > 0 
                            ? Math.round((gameStats.correctActions / gameStats.emailsProcessed) * 100)
                            : 0}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Accuracy</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Email Inbox */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Email List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Inbox ({emails.length})</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {emails.map((email) => (
                        <motion.div
                          key={email.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`glass-card border-white/10 p-4 cursor-pointer transition-all duration-300 hover:border-white/20 ${
                            email.isProcessed ? 'opacity-50' : ''
                          }`}
                          onClick={() => !email.isProcessed && setCurrentEmail(email)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getPriorityIcon(email.priority)}
                              <span className="text-sm font-medium text-white">{email.sender}</span>
                            </div>
                            <Badge className={getPriorityColor(email.priority)}>
                              {email.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <h4 className="text-white font-medium mb-1">{email.subject}</h4>
                          <p className="text-gray-300 text-sm line-clamp-2">{email.content}</p>
                          
                          {email.isProcessed && (
                            <div className="mt-2 flex items-center gap-2">
                              <Badge className={email.isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                                {email.action?.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {email.isCorrect ? '+Points' : '-Points'}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Email Actions */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
                    {currentEmail ? (
                      <Card className="glass-card border-white/10">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">{currentEmail.sender}</span>
                            <Badge className={getPriorityColor(currentEmail.priority)}>
                              {currentEmail.priority.toUpperCase()}
                            </Badge>
                          </div>
                          <CardTitle className="text-white">{currentEmail.subject}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 mb-6">{currentEmail.content}</p>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <Button
                              className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30"
                              onClick={() => processEmail(currentEmail.id, 'reply')}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Reply
                            </Button>
                            <Button
                              className="bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30"
                              onClick={() => processEmail(currentEmail.id, 'flag')}
                            >
                              <Flag className="w-4 h-4 mr-2" />
                              Flag
                            </Button>
                            <Button
                              className="bg-gray-500/20 text-gray-400 border-gray-500/30 hover:bg-gray-500/30"
                              onClick={() => processEmail(currentEmail.id, 'archive')}
                            >
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </Button>
                            <Button
                              className="bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30"
                              onClick={() => processEmail(currentEmail.id, 'spam')}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Spam
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="glass-card border-white/10">
                        <CardContent className="p-8 text-center">
                          <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400">Select an email from the inbox to process it</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
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
                          Great job managing your inbox!
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
                        <div className="text-2xl font-bold text-white">{gameStats.emailsProcessed}</div>
                        <div className="text-sm text-gray-400">Emails Processed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{gameStats.accuracy}%</div>
                        <div className="text-sm text-gray-400">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{gameStats.missedUrgent}</div>
                        <div className="text-sm text-gray-400">Missed Urgent</div>
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
                        {gameStats.accuracy >= 80 ? 'Excellent!' : 
                         gameStats.accuracy >= 60 ? 'Good job!' : 
                         gameStats.accuracy >= 40 ? 'Keep practicing!' : 'Needs improvement'}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Target,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Clock,
  Zap,
  CheckCircle2,
  X,
  AlertTriangle,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Timer,
  Flame,
  Award,
  Brain,
  Share
} from 'lucide-react';

type TaskPriority = 'high' | 'medium' | 'low';
type TaskStatus = 'pending' | 'active' | 'completed' | 'missed' | 'snoozed';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  timeLimit: number; // in seconds
  timeRemaining: number;
  points: number;
  status: TaskStatus;
  category: string;
}

interface GameStats {
  score: number;
  tasksCompleted: number;
  tasksMissed: number;
  accuracy: number;
  timeManagement: number;
  streak: number;
  level: number;
}

type GameState = 'menu' | 'playing' | 'paused' | 'results';

const TASK_TEMPLATES = {
  high: [
    { title: 'Client Escalation', description: 'Handle urgent customer complaint', category: 'Customer Service', points: 100, timeLimit: 45 },
    { title: 'System Alert', description: 'Resolve critical system error', category: 'Technical', points: 120, timeLimit: 60 },
    { title: 'CEO Request', description: 'Prepare executive summary report', category: 'Administrative', points: 150, timeLimit: 90 },
    { title: 'Contract Deadline', description: 'Review and submit urgent contract', category: 'Legal', points: 130, timeLimit: 75 },
    { title: 'Data Breach Alert', description: 'Investigate security incident', category: 'Security', points: 140, timeLimit: 80 }
  ],
  medium: [
    { title: 'Team Meeting', description: 'Attend weekly team standup', category: 'Meetings', points: 60, timeLimit: 120 },
    { title: 'Email Follow-up', description: 'Respond to client inquiries', category: 'Communication', points: 50, timeLimit: 90 },
    { title: 'Report Generation', description: 'Create monthly performance report', category: 'Reporting', points: 70, timeLimit: 150 },
    { title: 'Training Module', description: 'Complete compliance training', category: 'Training', points: 65, timeLimit: 180 },
    { title: 'Quality Check', description: 'Review team submissions', category: 'Quality Assurance', points: 75, timeLimit: 100 }
  ],
  low: [
    { title: 'File Organization', description: 'Sort and organize documents', category: 'Administrative', points: 30, timeLimit: 200 },
    { title: 'Calendar Update', description: 'Schedule upcoming meetings', category: 'Planning', points: 25, timeLimit: 120 },
    { title: 'Software Update', description: 'Install system updates', category: 'Maintenance', points: 35, timeLimit: 180 },
    { title: 'Inventory Check', description: 'Update office supplies list', category: 'Operations', points: 20, timeLimit: 150 },
    { title: 'Newsletter Read', description: 'Review company newsletter', category: 'Information', points: 15, timeLimit: 240 }
  ]
};

const GAME_DURATION = 180; // 3 minutes
const TASK_SPAWN_INTERVAL = 8000; // New task every 8 seconds
const MAX_ACTIVE_TASKS = 4;

export default function TaskJugglerPage() {
  const router = useRouter();
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const taskTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  const spawnTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [gameState, setGameState] = useState<GameState>('menu');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    tasksCompleted: 0,
    tasksMissed: 0,
    accuracy: 0,
    timeManagement: 0,
    streak: 0,
    level: 1
  });
  const [gameTimeRemaining, setGameTimeRemaining] = useState(GAME_DURATION);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
    }
  };

  const generateTask = (): Task => {
    const priorityKeys = Object.keys(TASK_TEMPLATES) as TaskPriority[];
    const priority = priorityKeys[Math.floor(Math.random() * priorityKeys.length)];
    const template = TASK_TEMPLATES[priority][Math.floor(Math.random() * TASK_TEMPLATES[priority].length)];
    
    return {
      id: `task-${Date.now()}-${Math.random()}`,
      title: template.title,
      description: template.description,
      priority,
      timeLimit: template.timeLimit,
      timeRemaining: template.timeLimit,
      points: template.points,
      status: 'pending',
      category: template.category
    };
  };

  const startGame = () => {
    setGameState('playing');
    setTasks([]);
    setGameStats({
      score: 0,
      tasksCompleted: 0,
      tasksMissed: 0,
      accuracy: 0,
      timeManagement: 0,
      streak: 0,
      level: 1
    });
    setGameTimeRemaining(GAME_DURATION);
    setMultiplier(1);
    setLevelProgress(0);

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setGameTimeRemaining(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start task spawning
    spawnTask();
    spawnTimerRef.current = setInterval(() => {
      spawnTask();
    }, TASK_SPAWN_INTERVAL);
  };

  const spawnTask = () => {
    setTasks(prev => {
      if (prev.filter(t => t.status === 'pending' || t.status === 'active').length >= MAX_ACTIVE_TASKS) {
        return prev;
      }
      return [...prev, generateTask()];
    });
  };

  const endGame = () => {
    setGameState('results');
    
    // Clear all timers
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    Object.values(taskTimersRef.current).forEach(timer => clearInterval(timer));
    taskTimersRef.current = {};

    // Calculate final stats
    setGameStats(prev => ({
      ...prev,
      accuracy: prev.tasksCompleted > 0 ? Math.round((prev.tasksCompleted / (prev.tasksCompleted + prev.tasksMissed)) * 100) : 0,
      timeManagement: Math.round((prev.tasksCompleted * 20) + (prev.score / 10))
    }));
  };

  const pauseGame = () => {
    setGameState('paused');
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
    if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    Object.values(taskTimersRef.current).forEach(timer => clearInterval(timer));
  };

  const resumeGame = () => {
    setGameState('playing');
    
    // Resume game timer
    gameTimerRef.current = setInterval(() => {
      setGameTimeRemaining(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Resume task spawning
    spawnTimerRef.current = setInterval(() => {
      spawnTask();
    }, TASK_SPAWN_INTERVAL);

    // Resume task timers
    tasks.forEach(task => {
      if (task.status === 'active' || task.status === 'pending') {
        startTaskTimer(task.id);
      }
    });
  };

  const startTaskTimer = (taskId: string) => {
    if (taskTimersRef.current[taskId]) {
      clearInterval(taskTimersRef.current[taskId]);
    }

    taskTimersRef.current[taskId] = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.id === taskId && task.timeRemaining > 0) {
          const newTimeRemaining = task.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            // Task expired
            handleTaskMissed(taskId);
            return { ...task, timeRemaining: 0, status: 'missed' as TaskStatus };
          }
          return { ...task, timeRemaining: newTimeRemaining };
        }
        return task;
      }));
    }, 1000);
  };

  const handleTaskStart = (taskId: string) => {
    setSelectedTask(taskId);
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'active' } : task
    ));
    startTaskTimer(taskId);
  };

  const handleTaskComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Clear timer
    if (taskTimersRef.current[taskId]) {
      clearInterval(taskTimersRef.current[taskId]);
      delete taskTimersRef.current[taskId];
    }

    // Calculate points with multiplier and time bonus
    const timeBonus = Math.round((task.timeRemaining / task.timeLimit) * 20);
    const totalPoints = Math.round((task.points + timeBonus) * multiplier);

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: 'completed' } : t
    ));

    setGameStats(prev => {
      const newStreak = prev.streak + 1;
      const newScore = prev.score + totalPoints;
      const newLevel = Math.floor(newScore / 500) + 1;
      
      return {
        ...prev,
        score: newScore,
        tasksCompleted: prev.tasksCompleted + 1,
        streak: newStreak,
        level: newLevel
      };
    });

    // Update multiplier based on streak
    if (gameStats.streak > 0 && gameStats.streak % 3 === 0) {
      setMultiplier(prev => Math.min(prev + 0.2, 3));
    }

    setSelectedTask(null);
  };

  const handleTaskSnooze = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { 
        ...task, 
        status: 'snoozed', 
        timeRemaining: Math.min(task.timeRemaining + 15, task.timeLimit) 
      } : task
    ));

    setTimeout(() => {
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: 'pending' } : task
      ));
    }, 10000); // Snooze for 10 seconds
  };

  const handleTaskMissed = (taskId: string) => {
    if (taskTimersRef.current[taskId]) {
      clearInterval(taskTimersRef.current[taskId]);
      delete taskTimersRef.current[taskId];
    }

    setGameStats(prev => ({
      ...prev,
      tasksMissed: prev.tasksMissed + 1,
      streak: 0
    }));

    setMultiplier(1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      // Cleanup timers on unmount
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
      Object.values(taskTimersRef.current).forEach(timer => clearInterval(timer));
    };
  }, []);

  useEffect(() => {
    setLevelProgress((gameStats.score % 500) / 500 * 100);
  }, [gameStats.score]);

  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <div className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
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
                <Target className="h-12 w-12 text-green-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Task Juggler</h1>
                  <p className="text-gray-400">"Master Time-Sensitive Multitasking!"</p>
                </div>
              </div>
            </div>
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
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mr-4">
                      <Target className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold gradient-text mb-2">
                        Welcome to Task Juggler!
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-lg">
                        Master time-sensitive multitasking with real-time priority management
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="text-gray-300 space-y-6 text-left max-w-3xl mx-auto">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-gray-400 text-lg">🎮</span>
                        How to Play
                      </h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <span className="text-red-400 mr-3 mt-0.5 text-lg">⏰</span>
                          <span>Tasks appear with different priorities and time limits</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-400 mr-3 mt-0.5 text-lg">🎯</span>
                          <span>Choose which tasks to tackle first based on priority</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-400 mr-3 mt-0.5 text-lg">✅</span>
                          <span>Complete tasks before time runs out for full points</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-400 mr-3 mt-0.5 text-lg">⏸️</span>
                          <span>Snooze low-priority tasks if needed (+15 seconds)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-400 mr-3 mt-0.5 text-lg">🔥</span>
                          <span>Build streaks for score multipliers up to 3x</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-400 mr-3 mt-0.5 text-lg">📈</span>
                          <span>Manage up to 4 concurrent tasks in real-time</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-yellow-400 text-lg">⚡</span>
                          <h4 className="text-white font-semibold">High-Pressure Environment</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Test your multitasking abilities in a fast-paced BPO simulation!</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-cyan-400 text-lg">🏆</span>
                          <h4 className="text-white font-semibold">Strategic Gameplay</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Balance speed, accuracy, and smart prioritization to maximize your score!</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg py-6 h-14"
                  >
                    <Play className="h-6 w-6 mr-3" />
                    Start Juggling
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Game Playing Interface */}
          {gameState === 'playing' && (
            <div className="space-y-6">
              {/* Game HUD */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
              >
                <Card className="glass-card border-white/10">
                  <CardContent className="p-4 text-center">
                    <Timer className="h-6 w-6 text-red-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{formatTime(gameTimeRemaining)}</div>
                    <p className="text-xs text-gray-400">Time Left</p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardContent className="p-4 text-center">
                    <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{gameStats.score}</div>
                    <p className="text-xs text-gray-400">Score</p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardContent className="p-4 text-center">
                    <Flame className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{gameStats.streak}</div>
                    <p className="text-xs text-gray-400">Streak</p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardContent className="p-4 text-center">
                    <Zap className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">{multiplier.toFixed(1)}x</div>
                    <p className="text-xs text-gray-400">Multiplier</p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/10">
                  <CardContent className="p-4 text-center">
                    <Award className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">L{gameStats.level}</div>
                    <Progress value={levelProgress} className="mt-1 h-1" />
                    <p className="text-xs text-gray-400">Level</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Task Queue */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-blue-400" />
                      Active Tasks ({tasks.filter(t => t.status === 'pending' || t.status === 'active').length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {tasks
                        .filter(task => task.status === 'pending' || task.status === 'active')
                        .sort((a, b) => {
                          const priorityOrder = { high: 3, medium: 2, low: 1 };
                          return priorityOrder[b.priority] - priorityOrder[a.priority];
                        })
                        .map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                              task.status === 'active' 
                                ? 'bg-blue-500/20 border-blue-500/50' 
                                : 'bg-gray-800/50 border-gray-600/50'
                            } ${selectedTask === task.id ? 'ring-2 ring-blue-400' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-white">{task.title}</h4>
                                  <Badge className={getPriorityColor(task.priority)}>
                                    {task.priority.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-400">{task.description}</p>
                                <p className="text-xs text-gray-500 mt-1">{task.category} • {task.points} pts</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1 mr-4">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-gray-400">Time Remaining</span>
                                  <span className={`font-mono ${task.timeRemaining < 30 ? 'text-red-400' : 'text-white'}`}>
                                    {formatTime(task.timeRemaining)}
                                  </span>
                                </div>
                                <Progress 
                                  value={(task.timeRemaining / task.timeLimit) * 100} 
                                  className={`h-2 ${task.timeRemaining < 30 ? 'bg-red-900' : 'bg-gray-700'}`}
                                />
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {task.status === 'pending' && (
                                <>
                                  <Button
                                    onClick={() => handleTaskStart(task.id)}
                                    size="sm"
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Start
                                  </Button>
                                  <Button
                                    onClick={() => handleTaskSnooze(task.id)}
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-600 text-gray-300"
                                  >
                                    <Timer className="h-3 w-3 mr-1" />
                                    Snooze
                                  </Button>
                                </>
                              )}
                              {task.status === 'active' && (
                                <Button
                                  onClick={() => handleTaskComplete(task.id)}
                                  size="sm"
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Complete
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>

                    {tasks.filter(t => t.status === 'pending' || t.status === 'active').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                        <p>Waiting for tasks...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Completed/Missed Tasks */}
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                        Task History
                      </span>
                      <div className="flex gap-4 text-sm">
                        <span className="text-green-400">✓ {gameStats.tasksCompleted}</span>
                        <span className="text-red-400">✗ {gameStats.tasksMissed}</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {tasks
                        .filter(task => task.status === 'completed' || task.status === 'missed')
                        .slice(-10)
                        .reverse()
                        .map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg border ${
                              task.status === 'completed' 
                                ? 'bg-green-500/10 border-green-500/30' 
                                : 'bg-red-500/10 border-red-500/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {task.status === 'completed' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                                ) : (
                                  <X className="h-4 w-4 text-red-400" />
                                )}
                                <span className="text-sm font-medium text-white">{task.title}</span>
                                <Badge className={getPriorityColor(task.priority)} variant="outline">
                                  {task.priority}
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-400">
                                {task.status === 'completed' ? `+${task.points}` : '0'} pts
                              </span>
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>

                    {tasks.filter(t => t.status === 'completed' || t.status === 'missed').length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                        <p>Complete tasks to see history</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Game Controls */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-center"
              >
                <Button
                  onClick={pauseGame}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Game
                </Button>
              </motion.div>
            </div>
          )}

          {/* Paused State */}
          {gameState === 'paused' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto text-center"
            >
              <Card className="glass-card border-white/10">
                <CardContent className="py-16">
                  <div className="space-y-6">
                    <Pause className="h-16 w-16 text-yellow-400 mx-auto" />
                    <h3 className="text-2xl font-bold text-white">Game Paused</h3>
                    <p className="text-gray-300">Take a moment to breathe!</p>
                    <div className="flex gap-4 justify-center">
                      <Button
                        onClick={resumeGame}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                      <Button
                        onClick={() => setGameState('menu')}
                        variant="outline"
                        className="border-gray-600 text-gray-300"
                      >
                        Exit Game
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results Screen */}
          {gameState === 'results' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <Card className="glass-card border-white/10">
                <CardHeader className="pb-6">
                  <CardTitle className="text-center text-white flex items-center justify-center gap-4 text-3xl">
                    <Trophy className="h-10 w-10 text-yellow-400" />
                    Task Juggling Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-yellow-400 mb-4">
                      {gameStats.score}
                    </div>
                    <p className="text-xl text-gray-300">Final Score</p>
                    <Badge className="mt-2 text-lg px-4 py-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Level {gameStats.level} Achieved
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                      <div className="text-3xl font-bold text-green-400">{gameStats.tasksCompleted}</div>
                      <div className="text-lg text-gray-400">Tasks Completed</div>
                    </div>
                    <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                      <div className="text-3xl font-bold text-red-400">{gameStats.tasksMissed}</div>
                      <div className="text-lg text-gray-400">Tasks Missed</div>
                    </div>
                    <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                      <div className="text-3xl font-bold text-blue-400">{gameStats.accuracy}%</div>
                      <div className="text-lg text-gray-400">Accuracy</div>
                    </div>
                    <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                      <div className="text-3xl font-bold text-purple-400">{gameStats.timeManagement}</div>
                      <div className="text-lg text-gray-400">Time Management</div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={() => setGameState('menu')}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Main Menu
                </Button>
                <Button
                  onClick={() => {
                    // Share functionality
                    if (navigator.share) {
                      navigator.share({
                        title: 'My Task Juggler Game Results',
                        text: `I achieved ${gameStats.score} points with ${gameStats.accuracy}% accuracy in task juggling!`,
                        url: window.location.href
                      });
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(`My Task Juggler Game Results: ${gameStats.score} points with ${gameStats.accuracy}% accuracy in task juggling!`);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                  onClick={() => setGameState('menu')}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Take Again
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Exit Game Alert Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                    <AlertDialogContent className="bg-black border-gray-700">
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
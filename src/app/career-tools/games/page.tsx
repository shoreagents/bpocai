'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Headphones,
  Keyboard,
  Target,
  TrendingUp,
  Clock,
  Play,
  Trophy,
  Users,
  Zap,
  BarChart3,
  Guitar,
  Phone,
  Brain,
  Mail,
  FileText,
  Utensils,
  Scale
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CareerGamesPage() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
        id: 'typing-hero',
        title: 'Typing Hero',
        description: 'Guitar Hero meets typing',
        icon: Guitar,
        difficulty: 'Intermediate',
        category: 'Technical',
        duration: '6 minutes',
        content: '4 Difficulties',
        difficultyColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        categoryColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        skillsDeveloped: ['BPO Vocabulary', 'Typing Speed', 'Rhythm', 'Accuracy'],
        participants: 2847,
        rating: 4.9
      },
      {
        id: 'call-flow-builder',
        title: 'Call Flow Builder',
        description: 'Design perfect customer service call flows with drag & drop interface',
        icon: Phone,
        difficulty: 'Advanced',
        category: 'Process Design',
        duration: '12 minutes',
        content: 'Unlimited Flows',
        difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
        categoryColor: 'bg-green-500/20 text-green-400 border-green-500/30',
        skillsDeveloped: ['Customer Service Flow', 'Process Design', 'Problem Solving', 'Logical Thinking'],
        participants: 534,
        rating: 4.7
      },
    {
      id: 'task-juggler',
      title: 'Task Juggler',
      description: 'Master time-sensitive multitasking with real-time priority management',
      icon: Target,
      difficulty: 'Advanced',
      category: 'Time Management',
      duration: '10 minutes',
      content: '3 Levels',
      difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      categoryColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      skillsDeveloped: ['Time Management', 'Attention to Detail', 'Work Ethic', 'Prioritization'],
      participants: 1247,
      rating: 4.8
    },
    {
      id: 'inbox-zero',
      title: 'Inbox Zero Challenge',
      description: 'Master email triage and prioritization in a simulated BPO environment',
      icon: Mail,
      difficulty: 'Intermediate',
      category: 'Communication',
      duration: '5 minutes',
      content: 'Dynamic Emails',
      difficultyColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      categoryColor: 'bg-green-500/20 text-green-400 border-green-500/30',
      skillsDeveloped: ['Email Management', 'Time Management', 'Attention to Detail', 'Work Ethic'],
      participants: 892,
      rating: 4.7
    },
    {
      id: 'broken-briefs',
      title: 'Broken Briefs',
      description: 'Transform confusing client instructions into clear, actionable task briefs',
      icon: FileText,
      difficulty: 'Advanced',
      category: 'Communication',
      duration: '8 minutes',
      content: '5 Briefs',
      difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      categoryColor: 'bg-green-500/20 text-green-400 border-green-500/30',
      skillsDeveloped: ['Written Communication', 'Summarization', 'Instructional Accuracy', 'Clarity'],
      participants: 634,
      rating: 4.8
    },
    {
      id: 'logic-grid',
      title: 'Logic Grid',
      description: 'Solve complex puzzles using deductive reasoning and logical clues',
      icon: Brain,
      difficulty: 'Advanced',
      category: 'Problem Solving',
      duration: '8 minutes',
      content: '4 Difficulties',
      difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      categoryColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      skillsDeveloped: ['Critical Thinking', 'Problem Solving', 'Attention to Detail', 'Logical Reasoning'],
      participants: 756,
      rating: 4.6
    },
    {
      id: 'internship-food',
      title: 'The Right Choice',
      description: 'Make judgment calls in workplace scenarios',
      icon: Scale,
      difficulty: 'Intermediate',
      category: 'Judgment',
      duration: '2 minutes',
      content: '15 Scenarios',
      difficultyColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      categoryColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      skillsDeveloped: ['Cultural Awareness', 'Workplace Ethics', 'Social Cues', 'Professional Judgment'],
      participants: 423,
      rating: 4.8
    }
  ];

  const handleStartGame = (gameId: string) => {
    setSelectedGame(gameId);
    
    // Navigate to specific game pages
    if (gameId === 'typing-hero') {
      router.push('/career-tools/games/typing-hero');
    } else if (gameId === 'call-flow-builder') {
      router.push('/career-tools/games/call-flow-builder');
    } else if (gameId === 'task-juggler') {
      router.push('/career-tools/games/task-juggler');
    } else if (gameId === 'inbox-zero') {
      router.push('/career-tools/games/inbox-zero');
    } else if (gameId === 'broken-briefs') {
      router.push('/career-tools/games/broken-briefs');
    } else if (gameId === 'logic-grid') {
      router.push('/career-tools/games/logic-grid');
    } else if (gameId === 'internship-food') {
      router.push('/career-tools/games/right-choice');
    } else {
      // For other games, you can add navigation or modals here
      console.log(`Starting game: ${gameId}`);
    }
  };

  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
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
                onClick={() => router.push('/career-tools')}
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Trophy className="h-12 w-12 text-green-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Career Games</h1>
                  <p className="text-gray-400">Level up your BPO skills through interactive challenges</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-8">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="group"
              >
                <Card className="glass-card border-white/10 hover:border-white/20 h-full transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                  {/* Icon in top right */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <game.icon className="w-5 h-5 text-green-400" />
                  </div>

                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-white pr-12 mb-2">
                      {game.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-sm leading-relaxed mb-4">
                      {game.description}
                    </CardDescription>

                    {/* Difficulty and Category Badges */}
                    <div className="flex gap-2 mb-4">
                      <Badge className={game.difficultyColor}>
                        {game.difficulty}
                      </Badge>
                      <Badge className={game.categoryColor}>
                        {game.category}
                      </Badge>
                      <Badge className="bg-white/10 text-gray-300 border-white/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {game.duration}
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center gap-1">
                        <BarChart3 className="w-3 h-3" />
                        {game.content}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Skills Developed */}
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Skills Developed:</h4>
                      <div className="flex flex-wrap gap-1">
                        {game.skillsDeveloped.map((skill, skillIndex) => (
                          <Badge 
                            key={skillIndex}
                            variant="secondary"
                            className="bg-gray-800 text-gray-300 border-gray-700 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{game.participants.toLocaleString()} played</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{game.rating} rating</span>
                        </div>
                      </div>
                    </div>

                    {/* Start Game Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25 transition-all duration-300 group-hover:shadow-xl"
                      onClick={() => handleStartGame(game.id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="glass-card border-white/10 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Trophy className="w-5 h-5 text-red-400" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      No achievements yet. Start playing games to earn your first badge!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Your Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="glass-card border-white/10 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Games Completed:</span>
                    <span className="text-white font-medium">0 / 4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Sessions:</span>
                    <span className="text-white font-medium">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Achievement Points:</span>
                    <span className="text-cyan-400 font-medium">0</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
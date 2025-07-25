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
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CareerGamesPage() {
  const router = useRouter();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: 'customer-service-simulator',
      title: 'Customer Service Simulator',
      description: 'Handle various customer scenarios and improve your service skills',
      icon: Headphones,
      difficulty: 'Intermediate',
      category: 'Communication',
      duration: '10 minutes',
      difficultyColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      categoryColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      skillsDeveloped: ['Customer Service', 'Problem Solving', 'Communication'],
      participants: 1247,
      rating: 4.8
    },
    {
      id: 'typing-speed-race',
      title: 'Typing Speed Race',
      description: 'Compete with other candidates to improve your typing speed',
      icon: Keyboard,
      difficulty: 'Beginner',
      category: 'Technical',
      duration: '5 minutes',
      difficultyColor: 'bg-green-500/20 text-green-400 border-green-500/30',
      categoryColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      skillsDeveloped: ['Typing Speed', 'Accuracy', 'Focus'],
      participants: 2156,
      rating: 4.6
    },
    {
      id: 'multitasking-master',
      title: 'Multitasking Master',
      description: 'Juggle multiple tasks like a real BPO professional',
      icon: Target,
      difficulty: 'Advanced',
      category: 'Efficiency',
      duration: '8 minutes',
      difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      categoryColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      skillsDeveloped: ['Multitasking', 'Time Management', 'Stress Management'],
      participants: 856,
      rating: 4.9
    },
    {
      id: 'sales-closer',
      title: 'Sales Closer',
      description: 'Practice closing deals and converting leads',
      icon: TrendingUp,
      difficulty: 'Intermediate',
      category: 'Sales',
      duration: '15 minutes',
      difficultyColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      categoryColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      skillsDeveloped: ['Sales', 'Persuasion', 'Negotiation'],
      participants: 923,
      rating: 4.7
    }
  ];

  const handleStartGame = (gameId: string) => {
    setSelectedGame(gameId);
    // Here you would typically navigate to the actual game or open a game modal
    console.log(`Starting game: ${gameId}`);
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
                onClick={() => router.back()}
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
                    <game.icon className="w-5 h-5 text-gray-400" />
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
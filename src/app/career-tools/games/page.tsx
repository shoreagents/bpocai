'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
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
  FileText,
  Utensils,
  Crown,
  Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getSessionToken } from '@/lib/auth-helpers';
import { useAuth } from '@/contexts/AuthContext';

export default function CareerGamesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ completed: number; totalSessions: number; achievementPoints: number } | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        if (!user?.id) return
        const res = await fetch(`/api/leaderboards/user/${user.id}`)
        if (!res.ok) throw new Error(`Failed to load leaderboard user data: ${res.status}`)
        const data = await res.json()
        // Compute gamesCompleted from engagement items where game completed points > 0 for visible games only
        const engagementItems: Array<{ label: string; points: number }> = data?.engagement?.items || []
        const visibleGameLabels = new Set([
          'Typing Hero Completed',
          'DISC Personality Completed'
        ])
        const gamesCompleted = engagementItems.filter(i => visibleGameLabels.has(i.label) && (i.points || 0) > 0).length
        // Total sessions from leaderboard games plays
        const gamesArr: Array<{ plays?: number }> = data?.games || []
        const totalSessions = gamesArr.reduce((sum, g) => sum + (Number(g.plays || 0)), 0)
        // Achievement points from engagement total
        const achievementPoints = Number(data?.engagement?.total || 0)
        setProgress({ completed: gamesCompleted, totalSessions, achievementPoints })
      } catch (e) {
        console.error('❌ Failed fetching games progress (leaderboard):', e)
        setProgress({ completed: 0, totalSessions: 0, achievementPoints: 0 })
      }
    }
    if (user?.id) {
      fetchProgress()
    }
  }, [user?.id])

  // All games (including hidden ones for future use)
  const allGames = [
    {
        id: 'typing-hero',
        title: 'Typing Hero',
        description: 'Guitar Hero meets typing',
        icon: Guitar,
        difficulty: 'Intermediate',
        category: 'Technical',
        duration: '30 seconds',
        content: 'Medium Challenge',
        difficultyColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        categoryColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        skillsDeveloped: ['BPO Vocabulary', 'Typing Speed', 'Rhythm', 'Accuracy'],
        participants: 2847,
        rating: 4.9
      },
    {
      id: 'disc-personality',
      title: 'BPOC DISC',
      description: 'Discover your workplace superpower through engaging scenarios',
      icon: Brain,
      difficulty: 'Intermediate',
      category: 'Personality',
      duration: '5-8 minutes',
      content: '4 Scenarios',
      difficultyColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      categoryColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      skillsDeveloped: ['Self Awareness', 'Team Dynamics', 'Communication Style', 'Leadership Potential'],
      participants: 156,
      rating: 4.9
    },
    {
      id: 'ultimate',
      title: 'BPOC Ultimate',
      description: 'Master the ultimate BPO challenge with real workplace scenarios',
      icon: Crown,
      difficulty: 'Advanced',
      category: 'Assessment',
      duration: '10-15 minutes',
      content: 'Multiple Scenarios',
      difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      categoryColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      skillsDeveloped: ['Business Acumen', 'Crisis Management', 'Leadership', 'Integrity'],
      participants: 89,
      rating: 4.8
    },
    {
      id: 'bpoc-cultural',
      title: 'BPOC Cultural',
                description: 'Master cultural communication across all regions',
      icon: Globe,
      difficulty: 'Expert',
      category: 'Cultural',
      duration: '25 minutes',
      content: '4 Stages',
      difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      categoryColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
                skillsDeveloped: ['Cultural Intelligence', 'Voice', 'Writing Adaptation', 'Global Communication'],
      participants: 45,
      rating: 4.9
    },

  ];

  // Filter out hidden games (BPOC Ultimate and BPOC Cultural)
  const hiddenGameIds = ['ultimate', 'bpoc-cultural'];
  const games = allGames.filter(game => !hiddenGameIds.includes(game.id));

  const handleStartGame = (gameId: string) => {
    setSelectedGame(gameId);
    
    // Navigate to specific game pages
    if (gameId === 'typing-hero') {
      router.push('/career-tools/games/typing-hero');
    } else if (gameId === 'disc-personality') {
      router.push('/career-tools/games/disc-personality');
    } else if (gameId === 'ultimate') {
      router.push('/career-tools/games/ultimate');
    } else if (gameId === 'bpoc-cultural') {
      router.push('/career-tools/games/bpoc-cultural');
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
          <div className="w-full max-w-4xl mx-auto">
            {/* Your Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="glass-card border-white/10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white text-center justify-center">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md mx-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b border-white/10">
                          <td className="py-3 text-gray-300">Games Completed</td>
                          <td className="py-3 text-right text-white font-medium">
                            {!user ? 'Please log in' : progress ? `${progress.completed} / 2` : 'Loading...'}
                          </td>
                        </tr>
                        <tr className="border-b border-white/10">
                          <td className="py-3 text-gray-300">Total Sessions</td>
                          <td className="py-3 text-right text-white font-medium">
                            {!user ? '—' : progress ? progress.totalSessions : 'Loading...'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 text-gray-300">Achievement Points</td>
                          <td className="py-3 text-right text-cyan-400 font-medium">
                            {!user ? '—' : progress ? progress.achievementPoints : 'Loading...'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    {user && !progress && (
                      <div className="text-center py-4">
                        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-gray-400 text-sm">Loading your progress...</p>
                      </div>
                    )}
                    {!user && (
                      <p className="text-center text-gray-400 text-sm mt-3">Please log in to view your progress</p>
                    )}
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
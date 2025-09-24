'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
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
        description: '🎵 Experience the ultimate typing challenge! Master BPO vocabulary while jamming to the rhythm. Race against time, hit the perfect notes, and become a typing legend!',
        icon: Guitar,
        category: 'Speed',
        duration: '2-3 minutes',
        content: 'WPM Challenge',
        categoryColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        skillsDeveloped: ['⚡ Lightning Speed', '🎯 Precision', '🎵 Rhythm Mastery', '💼 BPO Vocabulary', '🧠 Focus'],
        participants: 2847,
        rating: 4.9,
        gameInfo: '🔥 Most Popular Game! Master the art of fast, accurate typing while grooving to the beat. Perfect for call center agents who need lightning-fast keyboard skills!',
        specialBadge: '🔥 HOT',
        specialBadgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      },
    {
      id: 'disc-personality',
      title: 'BPOC DISC',
      description: '🧠 Unlock your professional superpowers! Navigate through real workplace scenarios and discover your unique communication style. Perfect for understanding team dynamics and leadership potential!',
      icon: Brain,
      category: 'Personality',
      duration: '3-5 minutes',
      content: 'DISC Analysis',
      categoryColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      skillsDeveloped: ['🎭 Self Discovery', '🤝 Team Harmony', '💬 Communication Style', '👑 Leadership DNA', '🎯 Emotional Intelligence'],
      participants: 156,
      rating: 4.9,
      gameInfo: '🌟 Discover your workplace personality! This game reveals your natural communication style and helps you understand how to work better with different team members.',
      specialBadge: '🌟 INSIGHT',
      specialBadgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    },
    {
      id: 'ultimate',
      title: 'BPOC Ultimate',
      description: '👑 The ultimate BPO mastery challenge! Face real workplace crises, make critical decisions, and prove you have what it takes to be a BPO leader. Are you ready for the ultimate test?',
      icon: Crown,
      difficulty: 'Advanced',
      category: 'Assessment',
      duration: '10-15 minutes',
      content: 'Multiple Scenarios',
      difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      categoryColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      skillsDeveloped: ['🎯 Strategic Thinking', '⚡ Crisis Management', '👑 Leadership', '💎 Integrity', '🚀 Innovation'],
      participants: 89,
      rating: 4.8,
      gameInfo: '🏆 The ultimate test for BPO professionals! This advanced challenge simulates real workplace scenarios where your decisions matter. Perfect for aspiring managers and team leads!',
      specialBadge: '🏆 ELITE',
      specialBadgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    },
    {
      id: 'bpoc-cultural',
      title: 'BPOC Cultural',
      description: '🌍 Master global communication! Navigate cultural differences, adapt your communication style, and become a true global BPO professional. Connect with clients from every corner of the world!',
      icon: Globe,
      difficulty: 'Expert',
      category: 'Cultural',
      duration: '25 minutes',
      content: '4 Stages',
      difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      categoryColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      skillsDeveloped: ['🌍 Cultural Intelligence', '🗣️ Voice Adaptation', '✍️ Writing Mastery', '🤝 Global Communication', '🎭 Cultural Sensitivity'],
      participants: 45,
      rating: 4.9,
      gameInfo: '🌐 Become a global communication expert! This advanced game teaches you to work with clients from different cultures and adapt your communication style accordingly.',
      specialBadge: '🌍 GLOBAL',
      specialBadgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
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
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
          >
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="relative">
                  <Trophy className="h-16 w-16 text-green-400 mr-6 animate-pulse" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-900">⚡</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    Career Games
                  </h1>
                  <p className="text-gray-300 text-lg">🎮 Level up your BPO skills through interactive challenges</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2 bg-green-500/20 rounded-full px-3 py-1">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-green-300 text-sm font-semibold">Interactive Learning</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-500/20 rounded-full px-3 py-1">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className="text-purple-300 text-sm font-semibold">Skill Building</span>
                    </div>
                    <div className="flex items-center gap-2 bg-cyan-500/20 rounded-full px-3 py-1">
                      <Trophy className="w-4 h-4 text-cyan-400" />
                      <span className="text-cyan-300 text-sm font-semibold">Achievements</span>
                    </div>
                  </div>
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
                <Card className="glass-card border-white/10 hover:border-white/30 h-full transition-all duration-500 group-hover:scale-105 relative overflow-hidden bg-gradient-to-br from-slate-900/50 via-gray-900/30 to-slate-800/50 backdrop-blur-xl">
                  {/* Animated Background Effects */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-green-400/10 to-cyan-400/10 rounded-full blur-xl animate-pulse"></div>
                  </div>


                  {/* Enhanced Icon with Glow Effect */}
                  <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-green-400/20 to-cyan-400/20 rounded-xl flex items-center justify-center shadow-lg shadow-green-400/25 group-hover:shadow-green-400/40 transition-all duration-300">
                    <game.icon className="w-6 h-6 text-green-400 group-hover:text-cyan-400 transition-colors duration-300" />
                  </div>

                  <CardHeader className="pb-4 relative z-10">
                    <CardTitle className="text-2xl font-bold text-white pr-16 mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {game.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-sm leading-relaxed mb-4">
                      {game.description}
                    </CardDescription>

                    {/* Enhanced Game Info with Glow */}
                    {game.gameInfo && (
                      <div className="bg-gradient-to-r from-cyan-500/15 to-purple-500/15 border border-cyan-500/30 rounded-xl p-4 mb-4 shadow-lg shadow-cyan-500/10">
                        <p className="text-sm text-cyan-200 font-medium">{game.gameInfo}</p>
                      </div>
                    )}

                    {/* Enhanced Badges with Better Styling */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`${game.categoryColor} font-semibold shadow-lg`}>
                        {game.category}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-500/40 flex items-center gap-1 shadow-lg">
                        <Clock className="w-3 h-3" />
                        {game.duration}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-300 border-purple-500/40 flex items-center gap-1 shadow-lg">
                        <BarChart3 className="w-3 h-3" />
                        {game.content}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 relative z-10">
                    {/* Enhanced Skills Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-green-400" />
                        <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">Skills You'll Master:</span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {game.skillsDeveloped.map((skill, skillIndex) => (
                          <Badge 
                            key={skillIndex}
                            variant="secondary"
                            className="bg-gradient-to-r from-green-500/25 to-cyan-500/25 text-green-200 border-green-500/40 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>


                    {/* Enhanced CTA Button with Multiple Effects */}
                    <Button 
                      className="w-full bg-gradient-to-r from-green-500 via-green-600 to-cyan-600 hover:from-green-600 hover:via-green-700 hover:to-cyan-700 text-white border-0 shadow-xl shadow-green-500/30 transition-all duration-500 group-hover:shadow-2xl hover:scale-110 font-bold text-base py-4 relative overflow-hidden"
                      onClick={() => handleStartGame(game.id)}
                    >
                      {/* Button Background Animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                      
                      <div className="relative z-10 flex items-center justify-center gap-3">
                        <Play className="w-5 h-5" />
                        <span>🚀 Start Your Journey</span>
                        <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                      </div>
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
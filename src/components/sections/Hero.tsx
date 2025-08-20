'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  Play,
  Star,
  Brain,
  Zap,
  FileText,
  Wrench,
  Briefcase,
  Trophy,
  Target,
  Clock,
  BarChart3,
  CheckCircle2,
  Crown,
  DollarSign,
  Gamepad2 as GamepadIcon,
  Calculator,
  Search,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'

const typingText = [
  'Your BPO Career Starts Here',
  'AI-Powered Success',
  'Skills That Matter',
  'Dream Jobs Await'
]

const demoTabs = [
  { id: 'resume', label: 'Resume Builder', icon: FileText },
  { id: 'tools', label: 'Career Tools', icon: Wrench },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'leaderboards', label: 'Leaderboards', icon: Trophy }
]

export default function Hero() {
  const router = useRouter()
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)
  const [activeTab, setActiveTab] = useState(0)
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    activeResumes: 0,
    activeJobs: 0
  })
  const [loading, setLoading] = useState(true)

  const handleBuildResume = () => {
    router.push('/resume-builder')
  }

  // Auto-rotate tabs every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % demoTabs.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Typing animation effect
  useEffect(() => {
    const currentText = typingText[currentTypingIndex]
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1))
          setTypingSpeed(Math.random() * 100 + 50)
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentText.slice(0, displayText.length - 1))
          setTypingSpeed(25)
        } else {
          setIsDeleting(false)
          setCurrentTypingIndex((prev) => (prev + 1) % typingText.length)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [displayText, currentTypingIndex, isDeleting, typingSpeed])

  // Fetch platform statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/platform')
        if (response.ok) {
          const data = await response.json()
          setPlatformStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch platform stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const renderDemoContent = () => {
    const currentTab = demoTabs[activeTab]
    
    switch (currentTab.id) {
      case 'resume':
        return (
          <div className="space-y-3">
            {/* What You'll Get */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-sm font-medium text-cyan-400">AI-Powered Analysis</span>
                </div>
                <div className="text-xs text-yellow-400">🎯 Instant Results</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white font-medium">Upload Any Resume Format</span>
                </div>
                <div className="text-xs text-gray-400">PDF, DOCX, Images - We handle them all</div>
              </div>
            </div>

            {/* Expected Outcomes */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium text-green-400">What You'll Discover</span>
              </div>
              
              <div className="space-y-2">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                  <div className="text-xs text-green-400 font-medium">✨ Skills Gap Analysis</div>
                  <div className="text-xs text-gray-300">Find missing skills for your target roles</div>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2">
                  <div className="text-xs text-cyan-400 font-medium">🚀 ATS Optimization Score</div>
                  <div className="text-xs text-gray-300">See how well you'll pass automated filters</div>
                </div>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Your Advantage</span>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                <div className="text-xs text-yellow-400 font-medium">💡 Personalized Recommendations</div>
                <div className="text-xs text-gray-300">Get specific advice to land more interviews</div>
              </div>
            </div>
          </div>
        )

      case 'tools':
        return (
          <div className="space-y-3">
            {/* Skill Development */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-green-400">Skill Development</span>
                </div>
                <div className="text-xs text-cyan-400">📈 Level Up</div>
              </div>
              
              <div className="space-y-2">
                <div className="bg-white/5 rounded-lg p-3 border-l-2 border-green-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <GamepadIcon className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white font-medium">Gamified Learning</span>
                    </div>
                    <span className="text-xs text-green-400">Fun & Engaging</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Earn achievements while improving skills</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border-l-2 border-cyan-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm text-white font-medium">Comprehensive Tests</span>
                    </div>
                    <span className="text-xs text-cyan-400">Know Your Level</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Typing, personality, logic & communication</div>
                </div>
              </div>
            </div>

            {/* Career Growth */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center space-x-2 mb-2">
                <Calculator className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Career Planning</span>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                <div className="text-xs text-yellow-400 font-medium">💰 Know Your Worth</div>
                <div className="text-xs text-gray-300">Get accurate salary estimates for your skills</div>
              </div>
            </div>
          </div>
        )

      case 'jobs':
        return (
          <div className="space-y-3">
            {/* Job Discovery */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-sm font-medium text-purple-400">Smart Job Matching</span>
                </div>
                <div className="text-xs text-green-400">🎯 Perfect Fits</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white font-medium">Find Your Dream Role</span>
                </div>
                <div className="text-xs text-gray-400">AI matches you with top BPO companies</div>
              </div>
            </div>

            {/* What You'll Get */}
            <div className="space-y-2">
              <div className="space-y-2">
                <div className="bg-white/5 rounded-lg p-3 border-l-2 border-green-400">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">High-Match Opportunities</div>
                      <div className="text-xs text-gray-400">Amazon, Google, Microsoft & more</div>
                    </div>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded font-medium">95%+ Match</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border-l-2 border-blue-400">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-white font-medium">Detailed Job Insights</div>
                      <div className="text-xs text-gray-400">Salaries, benefits, requirements</div>
                    </div>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-medium">Full Details</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Potential */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">Your Success</span>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
                <div className="text-xs text-yellow-400 font-medium">🚀 3x Higher Interview Rate</div>
                <div className="text-xs text-gray-300">Better matches = more opportunities</div>
              </div>
            </div>
          </div>
        )

      case 'leaderboards':
        return (
          <div className="space-y-3">
            {/* Community & Recognition */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm font-medium text-yellow-400">Recognition & Growth</span>
                </div>
                <div className="text-xs text-cyan-400">🏆 Compete</div>
              </div>
              
              <div className="bg-white/5 rounded-lg p-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-white font-medium">Showcase Your Skills</span>
                </div>
                <div className="text-xs text-gray-400">Earn recognition from top employers</div>
              </div>
            </div>

            {/* What You'll Achieve */}
            <div className="space-y-2">
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-400/5 rounded-lg p-2 border border-yellow-400/20">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-black" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">Climb the Rankings</div>
                    <div className="text-xs text-gray-400">Show you're among the best</div>
                  </div>
                  <div className="text-sm font-bold text-yellow-400">Top 1%</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-2">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">Connect with Peers</div>
                    <div className="text-xs text-gray-400">Network with top performers</div>
                  </div>
                  <div className="text-sm font-bold text-purple-400">2,847</div>
                </div>
              </div>
            </div>

            {/* Career Benefits */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">Career Impact</span>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-lg p-2">
                <div className="text-xs text-cyan-400 font-medium">📈 Get Noticed by Recruiters</div>
                <div className="text-xs text-gray-300">Top performers get exclusive opportunities</div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden cyber-grid pt-24 pb-8">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-2 text-sm">
                🚀 Revolutionizing BPO Recruitment
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <div className="space-y-3">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
              >
                <span className="text-white">BPOC.IO</span>
                <br />
                <span className="gradient-text">Where BPO</span>
                <br />
                <span className="text-white">Careers Begin</span>
              </motion.h1>

              {/* Typing Animation */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="h-12 flex items-center"
              >
                <span className="text-xl md:text-2xl text-cyan-400 font-medium">
                  {displayText}
                  <span className="animate-pulse">|</span>
                </span>
              </motion.div>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl"
            >
              AI-powered <span className="text-cyan-400 font-semibold">resume builder</span>, <span className="text-purple-400 font-semibold">career tools</span>, and <span className="text-green-400 font-semibold">job matching</span> designed specifically for Filipino BPO professionals. Land your dream job with confidence.
            </motion.p>



            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-4 pt-4"
            >
              <Button 
                size="lg" 
                onClick={handleBuildResume}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg shadow-red-500/25 relative group overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
                <span className="relative z-10 flex items-center">
                  Build Your Resume
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>

              
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex items-center space-x-8 pt-6 border-t border-white/10"
            >
                             <div className="text-center">
                 <div className="text-2xl font-bold text-cyan-400">
                   {loading ? '...' : formatNumber(platformStats.activeResumes)}
                 </div>
                 <div className="text-sm text-gray-400">Active Resumes</div>
               </div>
               <div className="text-center">
                 <div className="text-2xl font-bold text-green-400">
                   {loading ? '...' : formatNumber(platformStats.activeJobs)}
                 </div>
                 <div className="text-sm text-gray-400">Active Jobs</div>
               </div>
               <div className="text-center">
                 <div className="text-2xl font-bold text-purple-400">
                   {loading ? '...' : formatNumber(platformStats.totalUsers)}
                 </div>
                 <div className="text-sm text-gray-400">Total Users</div>
               </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Interactive Demo/Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Main Platform Demo Card */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden min-h-[400px] lg:min-h-[450px]">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 rounded-t-2xl"></div>
              
              {/* Demo Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">BPOC.IO</h3>
                    <p className="text-sm text-gray-400">Interactive Demo</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Play className="w-3 h-3 mr-1" />
                  Demo
                </Badge>
              </div>

              {/* Demo Navigation Tabs */}
              <div className="flex space-x-2 mb-4 flex-wrap gap-y-2">
                {demoTabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(index)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all duration-300 flex items-center ${
                      activeTab === index 
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' 
                        : 'bg-white/10 text-gray-400 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <tab.icon className="w-3 h-3 mr-1" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Demo Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 h-full"
                >
                  {renderDemoContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating Achievement Cards */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute -top-4 -right-4 glass-card p-3 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-sm font-medium text-white">Level 12</div>
                  <div className="text-xs text-gray-400">+150 XP</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ 
                y: [0, 10, 0],
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1
              }}
              className="absolute -bottom-4 -left-4 glass-card p-3 rounded-lg"
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium text-white">+45% Salary</div>
                  <div className="text-xs text-gray-400">Career Growth</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
      >
        <div className="text-sm text-gray-400 mb-2">Discover More</div>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-gradient-to-b from-cyan-400 to-transparent rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  )
} 
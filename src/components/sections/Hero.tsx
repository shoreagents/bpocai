'use client'

import { useState, useEffect } from 'react'
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
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { platformStats, successStories } from '@/lib/data'
import { formatNumber } from '@/lib/utils'



const typingText = [
  'Your BPO Career Starts Here',
  'AI-Powered Success',
  'Skills That Matter',
  'Dream Jobs Await'
]

export default function Hero() {
  const [currentTypingIndex, setCurrentTypingIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)

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
                <span className="text-white">BPOC.AI</span>
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
                <div className="text-2xl font-bold text-cyan-400">{formatNumber(platformStats.resumesBuilt)}+</div>
                <div className="text-sm text-gray-400">Resumes Built</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{formatNumber(platformStats.successRate)}%</div>
                <div className="text-sm text-gray-400">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{platformStats.companies}+</div>
                <div className="text-sm text-gray-400">Companies</div>
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
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-green-400 rounded-t-2xl"></div>
              
              {/* Demo Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">BPOC.AI Platform</h3>
                    <p className="text-sm text-gray-400">Interactive Demo</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Play className="w-3 h-3 mr-1" />
                  Demo
                </Badge>
              </div>

              {/* Demo Navigation Tabs */}
              <div className="flex space-x-2 mb-6">
                <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs border border-cyan-500/30">
                  Resume Builder
                </div>
                <div className="px-3 py-1 bg-white/10 text-gray-400 rounded-full text-xs">
                  Assessments
                </div>
                <div className="px-3 py-1 bg-white/10 text-gray-400 rounded-full text-xs">
                  Job Match
                </div>
              </div>

              {/* Resume Builder Demo Content */}
              <div className="space-y-4">
                {/* Profile Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-sm font-medium text-cyan-400">Personal Information</span>
                    </div>
                    <div className="text-xs text-green-400">✓ Complete</div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-black">JS</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Juan Santos</div>
                        <div className="text-xs text-gray-400">BPO Specialist • Manila, PH</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm font-medium text-purple-400">Core Skills</span>
                    </div>
                    <div className="text-xs text-yellow-400">⚡ AI Enhanced</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded px-2 py-1 text-xs text-center">Customer Service</div>
                    <div className="bg-white/5 rounded px-2 py-1 text-xs text-center">Tech Support</div>
                    <div className="bg-white/5 rounded px-2 py-1 text-xs text-center">Sales</div>
                    <div className="bg-cyan-500/10 border border-cyan-500/20 rounded px-2 py-1 text-xs text-center text-cyan-400">+ Add More</div>
                  </div>
                </div>

                {/* AI Suggestions */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-medium text-cyan-400">AI Suggestions</span>
                  </div>
                  <div className="space-y-2">
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                      <div className="text-xs text-green-400 font-medium mb-1">✨ Skill Recommendation</div>

                      <div className="text-xs text-gray-300">"Leadership Experience" - matches 89% of Team Lead positions</div>

                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-2">
                      <div className="text-xs text-purple-400 font-medium mb-1">🎯 Job Match Found</div>
                      <div className="text-xs text-gray-300">3 new positions match your profile - View Jobs</div>
                    </div>
                  </div>
                </div>
              </div>
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

            {/* Success Story Snippet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute top-1/2 -left-8 transform -translate-y-1/2 glass-card p-4 rounded-lg max-w-xs hidden xl:block"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-black">MS</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Maria Santos</div>
                  <div className="flex items-center space-x-1">
                    {[1,2,3,4,5].map((star) => (
                      <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">

                "BPOC.AI helped me get promoted to Team Lead in just 6 months! The AI analysis was spot-on."

              </p>
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
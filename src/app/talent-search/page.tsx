'use client'

import { motion } from 'framer-motion'
import { Construction, Users, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/layout/Header'

export default function TalentSearchPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 glass-card flex items-center justify-center rounded-full border border-white/10">
                <Users className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-4">
              Talent Search
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover and connect with top BPO professionals
            </p>
          </motion.div>

          {/* Under Development Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card border border-white/10 rounded-2xl p-8 md:p-12 mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                <Construction className="w-10 h-10 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-4">
              🚧 Under Development
            </h2>
            
            <p className="text-lg text-gray-300 mb-6 max-w-2xl mx-auto">
              We're working hard to bring you an amazing talent search experience. 
              This feature will help you discover and connect with top BPO professionals.
            </p>
            
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center">
                <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
                Coming Soon Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Advanced talent filtering</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Skill-based matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Direct messaging system</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Talent analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Resume preview</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-gray-300">Interview scheduling</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  )
}

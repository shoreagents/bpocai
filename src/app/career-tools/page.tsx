'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import CareerToolsCards from '@/components/sections/CareerToolsCards';
import { Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CareerToolsPage() {
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
            className="text-center mb-12"
          >
            
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-cyan-400 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold gradient-text">
                Career Tools
              </h1>
            </div>
            
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Boost your BPO career with our specialized tools designed for Filipino professionals. 
              Test your skills, calculate your worth, and level up through gamification.
            </p>
          </motion.div>

          {/* Career Tools Cards */}
          <CareerToolsCards />
        </div>
      </div>
    </div>
  );
} 
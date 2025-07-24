'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import CareerToolsCards from '@/components/sections/CareerToolsCards';
import { Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function CareerToolsPage() {
  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-16">
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
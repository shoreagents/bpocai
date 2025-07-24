'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import JobsCards from '@/components/sections/JobsCards';
import { Briefcase } from 'lucide-react';

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden cyber-grid">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-cyan-500/6 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-purple-500/6 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/3 to-purple-500/3 rounded-full blur-3xl"></div>
        
        {/* Moving gradient lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-pulse delay-1000"></div>
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
              <Briefcase className="h-12 w-12 text-cyan-400 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold gradient-text">
                Jobs
              </h1>
            </div>
            
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Find your perfect BPO career match with our AI-powered job matching system 
              and comprehensive interview preparation tools.
            </p>
          </motion.div>

          {/* Jobs Cards */}
          <JobsCards />
        </div>
      </div>
    </div>
  );
} 
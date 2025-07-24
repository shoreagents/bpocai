'use client';

import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import JobsCards from '@/components/sections/JobsCards';
import { Briefcase } from 'lucide-react';

export default function JobsPage() {
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
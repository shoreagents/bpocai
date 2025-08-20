"use client"

import Link from 'next/link'
import { Sparkles, Globe, Shield, Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 glass-card flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-xl font-bold gradient-text">BPOC.IO</div>
                <div className="text-xs text-gray-400">Where BPO Careers Begin</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Revolutionizing BPO recruitment with AI-powered tools for Filipino professionals.
            </p>
            <div className="flex items-center space-x-4">
              <Globe className="w-5 h-5 text-cyan-400" />
              <Shield className="w-5 h-5 text-green-400" />
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Platform</h3>
            <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
              <Link href="/resume-builder" className="text-gray-400 hover:text-cyan-400 transition-colors block">Resume Builder</Link>
              <Link href="/career-tools" className="text-gray-400 hover:text-cyan-400 transition-colors block">Career Tools</Link>
              <Link href="/career-tools/games" className="text-gray-400 hover:text-cyan-400 transition-colors block">Career Games</Link>
              <Link href="/jobs/job-matching" className="text-gray-400 hover:text-cyan-400 transition-colors block">Job Matching</Link>
              <Link href="/leaderboards" className="text-gray-400 hover:text-cyan-400 transition-colors block">Leaderboards</Link>
              <Link href="/about" className="text-gray-400 hover:text-cyan-400 transition-colors block">About</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} BPOC.IO. All rights reserved. Built with ❤️ for Filipino BPO professionals.
          </p>
        </div>
      </div>
    </footer>
  )
}



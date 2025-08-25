'use client'

import Header from '@/components/layout/Header'
import { Sparkles } from 'lucide-react'

export default function Home2Page() {
  return (
    <main className="bg-black text-white">
      <Header />

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden cyber-grid pt-24 pb-16">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
              🚀 Revolutionizing BPO Recruitment
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="gradient-text">Where BPO</span>
              <br />
              <span className="text-white">Careers Begin</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              AI-powered <span className="text-cyan-400 font-semibold">resume builder</span>, <span className="text-purple-400 font-semibold">career tools</span>, and <span className="text-green-400 font-semibold">job matching</span> designed specifically for Filipino BPO professionals.
            </p>

            
          </div>
        </div>
      </section>

      {/* Large Brand Logo Section for Screenshots */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden cyber-grid">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col items-center justify-center text-center space-y-8">
            <Sparkles className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-40 lg:h-40 text-cyan-400" />
            <div>
              <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight gradient-text">BPOC.IO</div>
              <div className="text-lg sm:text-xl md:text-2xl text-gray-400 mt-2">Where BPO Careers Begin</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

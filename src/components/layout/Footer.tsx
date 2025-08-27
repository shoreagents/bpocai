"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, Globe, Shield, Zap, Facebook, Instagram, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-black/20 backdrop-blur-sm">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div>
              <div className="flex items-center space-x-3 mb-3">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <div className="text-2xl font-bold gradient-text">BPOC.IO</div>
                  <div className="text-sm text-gray-300">Where BPO Careers Begin</div>
                </div>
              </div>
              
              {/* Gradient divider */}
              <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent mb-3"></div>
              
              <p className="text-gray-300 leading-relaxed mb-4">
                Revolutionizing BPO recruitment with AI-powered tools for Filipino professionals.
              </p>
              
                             {/* Enhanced feature icons */}
               <div className="flex items-center space-x-6">
                 <motion.div 
                   className="flex items-center space-x-2 group cursor-pointer"
                   whileHover={{ scale: 1.05 }}
                 >
                   <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/30 transition-all duration-300">
                     <Globe className="w-4 h-4 text-cyan-400" />
                   </div>
                   <span className="text-xs text-gray-400 group-hover:text-cyan-400 transition-colors">Global</span>
                 </motion.div>
                 
                 <motion.div 
                   className="flex items-center space-x-2 group cursor-pointer"
                   whileHover={{ scale: 1.05 }}
                 >
                   <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center group-hover:bg-green-500/30 transition-all duration-300">
                     <Shield className="w-4 h-4 text-green-400" />
                   </div>
                   <span className="text-xs text-gray-400 group-hover:text-green-400 transition-colors">Secure</span>
                 </motion.div>
                 
                 <motion.div 
                   className="flex items-center space-x-2 group cursor-pointer"
                   whileHover={{ scale: 1.05 }}
                 >
                   <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:bg-purple-500/30 transition-all duration-300">
                     <Zap className="w-4 h-4 text-purple-400" />
                   </div>
                   <span className="text-xs text-gray-400 group-hover:text-purple-400 transition-colors">Fast</span>
                 </motion.div>
               </div>
            </div>
          </motion.div>

          {/* Navigation Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              Platform
            </h3>
            
            {/* Gradient divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent mb-4"></div>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { href: "/resume-builder", text: "Resume Builder" },
                { href: "/career-tools", text: "Career Tools" },
                { href: "/career-tools/games", text: "Career Games" },
                { href: "/jobs/job-matching", text: "Job Matching" },
                { href: "/leaderboards", text: "Leaderboards" },
                { href: "/about", text: "About" }
              ].map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                >
                  <Link 
                    href={link.href} 
                    className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/5"
                  >
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-sm font-medium">{link.text}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Social Links Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              Social Media
            </h3>
            
            {/* Gradient divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent mb-4"></div>
            
                         <div className="grid grid-cols-2 gap-4">
               <motion.div
                 initial={{ opacity: 0, x: -10 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: 0.3 }}
               >
                                   <a 
                    href="https://www.facebook.com/bpoc.io" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/5"
                  >
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <Facebook className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium">Facebook</span>
                  </a>
                </motion.div>

                                <motion.div
                   initial={{ opacity: 0, x: -10 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.35 }}
                 >
                   <div className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/5 opacity-60">
                     <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                     <Instagram className="w-4 h-4 text-pink-400" />
                     <span className="text-sm font-medium">Instagram</span>
                   </div>
                 </motion.div>

                 <motion.div
                   initial={{ opacity: 0, x: -10 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.4 }}
                 >
                   <div className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/5 opacity-60">
                     <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                     <span className="w-4 h-4 text-sky-400 font-bold text-xs">𝕏</span>
                     <span className="text-sm font-medium">Twitter</span>
                   </div>
                 </motion.div>

                 <motion.div
                   initial={{ opacity: 0, x: -10 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: 0.45 }}
                 >
                   <div className="group flex items-center space-x-2 text-gray-400 hover:text-white transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/5 opacity-60">
                     <div className="w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
                     <Mail className="w-4 h-4 text-red-400" />
                     <span className="text-sm font-medium">Gmail</span>
                   </div>
                 </motion.div>
             </div>
          </motion.div>
        </div>

        {/* Enhanced Bottom Section */}
        <motion.div 
          className="mt-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {/* Enhanced gradient divider */}
          <div className="relative mb-6">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="absolute inset-0 w-full h-px bg-gradient-to-r from-cyan-400/0 via-cyan-400/60 to-purple-400/0 blur-sm"></div>
          </div>
          
          <div className="text-center">
            <motion.p 
              className="text-gray-400 leading-relaxed"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span className="text-sm">© {new Date().getFullYear()} </span>
              <span className="font-semibold text-white">BPOC.IO</span>
              <span className="text-sm">. All rights reserved.</span>
              <br />
              <span className="text-sm">Built with </span>
              <motion.span 
                className="text-red-400 text-base"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ❤️
              </motion.span>
              <span className="text-sm"> for Filipino BPO professionals.</span>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}



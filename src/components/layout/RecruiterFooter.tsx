"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Building2, Users, FileText, TrendingUp, Mail, Phone, MapPin } from 'lucide-react'

export default function RecruiterFooter() {
  return (
    <footer className="relative py-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 border-t border-slate-700">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Company Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 space-y-6"
          >
            {/* Logo and Company Name */}
            <div className="flex items-center space-x-3">
              <motion.div 
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Building2 className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <div className="text-2xl font-bold text-white">BPOC Recruiter</div>
                <div className="text-sm text-slate-300">Find Your Next Perfect Hire</div>
              </div>
            </div>
            
            {/* Company Description */}
            <p className="text-slate-300 leading-relaxed max-w-md">
              AI-powered recruitment platform connecting top Filipino talent with leading BPO companies. 
              Streamline your hiring process with intelligent matching and comprehensive candidate insights.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm">recruiters@bpoc.io</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-sm">+63 (2) 1234-5678</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-300">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Manila, Philippines</span>
              </div>
            </div>
          </motion.div>

          {/* Recruiter Tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-white text-lg">Recruiter Tools</h3>
            <div className="space-y-3">
              {[
                { href: "/recruiter/dashboard", text: "Dashboard", icon: TrendingUp },
                { href: "/recruiter/jobs", text: "Job Management", icon: FileText },
                { href: "/recruiter/applicants", text: "Applicants", icon: Users },
                { href: "/recruiter/analytics", text: "Analytics", icon: TrendingUp }
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
                    className="flex items-center space-x-2 text-slate-400 hover:text-white transition-all duration-300 text-sm group"
                  >
                    <link.icon className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                    <span>{link.text}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Support & Resources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="font-bold text-white text-lg">Support</h3>
            <div className="space-y-3">
              {[
                { href: "/recruiter/help", text: "Help Center" },
                { href: "/recruiter/guides", text: "Recruiter Guides" },
                { href: "/recruiter/faq", text: "FAQ" },
                { href: "/recruiter/contact", text: "Contact Support" }
              ].map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Link 
                    href={link.href} 
                    className="text-slate-400 hover:text-white transition-all duration-300 text-sm"
                  >
                    {link.text}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Section - Copyright and Legal Links */}
        <motion.div 
          className="pt-8 border-t border-slate-700"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-slate-400 text-sm">
              © {new Date().getFullYear()} <span className="font-semibold text-white">BPOC.IO</span>. All rights reserved.
            </div>
            
            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              <Link href="/privacy-policy" className="text-slate-400 hover:text-white transition-all duration-300 text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="text-slate-400 hover:text-white transition-all duration-300 text-sm">
                Terms and Conditions
              </Link>
              <Link href="/recruiter/terms" className="text-slate-400 hover:text-white transition-all duration-300 text-sm">
                Recruiter Terms
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

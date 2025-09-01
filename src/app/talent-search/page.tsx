'use client'

import { motion } from 'framer-motion'
import { Search, RefreshCw, User, Mail, Calendar, MapPin, FileText, Eye, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/layout/Header'

export default function TalentSearchPage() {
  // Mock data for the talent pool
  const mockCandidates = [
    {
      id: 1,
      name: "Aaron Punzalan",
      position: "Junior Developer",
      location: "Clark, Pampanga",
      email: "suggestify01@gmail.com",
      joinDate: "9/1/2025",
      resumeAvailable: true,
      aiAnalyzed: false,
      avatar: "AP"
    },
    {
      id: 2,
      name: "Lovell Siron",
      position: "Web Designer",
      location: "Porac Pampanga",
      email: "lovellsiron918@gmail.com",
      joinDate: "9/1/2025",
      resumeAvailable: true,
      aiAnalyzed: false,
      avatar: "LS"
    },
    {
      id: 3,
      name: "Rhon Madlangbayan",
      position: "Customer Success, Sales Specialist...",
      location: "Pampanga",
      email: "rhongoleen@gmail.com",
      joinDate: "8/28/2025",
      resumeAvailable: true,
      aiAnalyzed: true,
      avatar: "RM"
    }
  ]

  const stats = [
    { label: "Total", count: 20, color: "bg-gradient-to-br from-blue-500 to-blue-600", icon: User },
    { label: "Applied", count: 4, color: "bg-gradient-to-br from-green-500 to-green-600", icon: FileText },
    { label: "Qualified", count: 2, color: "bg-gradient-to-br from-purple-500 to-purple-600", icon: Star },
    { label: "Resume", count: 11, color: "bg-gradient-to-br from-yellow-500 to-yellow-600", icon: FileText },
    { label: "AI Analyzed", count: 14, color: "bg-gradient-to-br from-orange-500 to-orange-600", icon: Eye },
    { label: "Work Status", count: 0, color: "bg-gradient-to-br from-indigo-500 to-indigo-600", icon: User },
    { label: "Employed", count: 0, color: "bg-gradient-to-br from-teal-500 to-teal-600", icon: User },
    { label: "Available", count: 0, color: "bg-gradient-to-br from-red-500 to-red-600", icon: User }
  ]

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black cyber-grid pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Search className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Talent Search</h1>
                <p className="text-gray-300">Browse our pool of qualified BPO talent</p>
              </div>
            </div>
            <Button className="bg-gradient-to-br from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card border-white/10 hover:border-white/20 transition-all duration-300 group relative overflow-hidden">
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                      <stat.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-300 mb-1">{stat.label}</div>
                      <div className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors duration-300">{stat.count}</div>
                    </div>
                  </div>
                </CardContent>
                
                {/* Subtle background gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search candidates..." 
                className="pl-10 bg-black/50 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            <Button variant="outline" className="bg-black/50 border-white/20 text-white hover:bg-white/10">
              All Candidates
            </Button>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCandidates.map((candidate) => (
              <Card key={candidate.id} className="glass-card border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-6">
                  {/* Avatar and Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {candidate.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{candidate.name}</h3>
                      <p className="text-sm text-gray-300">{candidate.position}</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                    <MapPin className="w-4 h-4" />
                    {candidate.location}
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                    <Mail className="w-4 h-4" />
                    {candidate.email}
                  </div>

                  {/* Join Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
                    <Calendar className="w-4 h-4" />
                    Joined {candidate.joinDate}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {candidate.resumeAvailable && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Resume Available
                      </span>
                    )}
                    {candidate.aiAnalyzed && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        AI Analyzed
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {candidate.resumeAvailable && (
                      <Button variant="outline" size="sm" className="flex-1 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10">
                        <FileText className="w-4 h-4 mr-1" />
                        View Resume
                      </Button>
                    )}
                    <Button size="sm" className="flex-1 bg-gradient-to-br from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
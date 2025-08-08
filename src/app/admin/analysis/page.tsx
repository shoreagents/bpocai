'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AdminLayout from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Brain, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Activity,
  Sparkles,
  Trophy,
  RefreshCw,
  Eye,
  Download,
  Filter
} from 'lucide-react'

export default function AnalysisPage() {
  const [stats, setStats] = useState({
    totalAnalyses: 1247,
    completedAnalyses: 1189,
    failedAnalyses: 23,
    processingAnalyses: 35,
    averageScore: 87,
    successRate: 95.3
  })

  const dashboardCards = [
    {
      title: 'Total Analyses',
      value: stats.totalAnalyses,
      icon: BarChart3,
      color: 'from-cyan-500 to-blue-600',
      description: 'All time analyses',
      trend: '+12% this week'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      description: 'Completed successfully',
      trend: '+2.1% this month'
    },
    {
      title: 'Average Score',
      value: `${stats.averageScore}%`,
      icon: Trophy,
      color: 'from-purple-500 to-pink-600',
      description: 'Overall performance',
      trend: '+5.3% improvement'
    },
    {
      title: 'Active Processing',
      value: stats.processingAnalyses,
      icon: Activity,
      color: 'from-yellow-500 to-orange-600',
      description: 'Currently processing',
      trend: '-8% from yesterday'
    }
  ]

  return (
    <AdminLayout title="AI Analysis Management" description="Manage and view AI-powered resume analysis results">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex items-center justify-end">
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card hover:bg-white/5 transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{card.title}</p>
                      <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                      <p className="text-xs text-green-400 mt-2">{card.trend}</p>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center`}>
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">Success Rate</span>
                    <span className="text-green-400 font-medium">{stats.successRate}%</span>
                  </div>
                  <Progress value={stats.successRate} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">Average Processing Time</span>
                    <span className="text-cyan-400 font-medium">2.3s</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">Model Accuracy</span>
                    <span className="text-purple-400 font-medium">94.2%</span>
                  </div>
                  <Progress value={94.2} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-green-400" />
                Analysis Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
                    <span className="text-white">Resume Analysis</span>
                  </div>
                  <span className="text-gray-300">456 (36.6%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-white">Career Advice</span>
                  </div>
                  <span className="text-gray-300">234 (18.8%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white">Interview Prep</span>
                  </div>
                  <span className="text-gray-300">189 (15.2%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-white">Skill Assessment</span>
                  </div>
                  <span className="text-gray-300">368 (29.5%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card hover:bg-white/5 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Brain className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">Run New Analysis</h3>
              <p className="text-gray-400 text-sm">Start a new AI analysis for a user</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover:bg-white/5 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">View Reports</h3>
              <p className="text-gray-400 text-sm">Generate detailed analysis reports</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card hover:bg-white/5 transition-all duration-200 cursor-pointer">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-2">Performance</h3>
              <p className="text-gray-400 text-sm">Monitor AI model performance</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

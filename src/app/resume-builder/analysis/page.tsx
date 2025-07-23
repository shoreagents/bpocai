'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Brain, 
  FileText, 
  Link2, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Star,
  Download,
  Share2,
  Sparkles,
  Zap,
  Trophy,
  Clock,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFromLocalStorage } from '@/lib/utils';
import Header from '@/components/layout/Header';

interface AnalysisData {
  sessionId: string;
  uploadedFiles: any[];
  portfolioLinks: any[];
  processedFiles: any[];
}

export default function AnalysisPage() {
  const router = useRouter();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  useEffect(() => {
    // Load data from localStorage
    const sessionId = getFromLocalStorage('bpoc_session_id', '');
    const uploadedFiles = getFromLocalStorage('bpoc_uploaded_files', []);
    const portfolioLinks = getFromLocalStorage('bpoc_portfolio_links', []);
    const processedFiles = getFromLocalStorage('bpoc_processed_files', []);

    if (!sessionId && (!uploadedFiles.length && !portfolioLinks.length)) {
      // No data found, redirect to upload
      router.push('/resume-builder');
      return;
    }

    setAnalysisData({
      sessionId,
      uploadedFiles,
      portfolioLinks,
      processedFiles
    });

    // Simulate analysis process
    const analysisTimer = setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);

    return () => clearTimeout(analysisTimer);
  }, [router]);

  // Mock analysis results - in a real app, these would come from your AI API
  const analysisResults = {
    overallScore: 78,
    atsCompatibility: 85,
    contentQuality: 72,
    professionalPresentation: 83,
    skillsAlignment: 76,
    keyStrengths: [
      'Strong technical skills in customer service platforms',
      'Excellent communication abilities',
      'Proven track record in BPO environment',
      'Professional certification in relevant areas'
    ],
    improvements: [
      'Add more quantifiable achievements',
      'Improve keyword optimization for ATS',
      'Enhance portfolio presentation',
      'Update contact information format'
    ],
    recommendations: [
      'Consider adding metrics to your achievements (e.g., "Improved customer satisfaction by 25%")',
      'Include relevant BPO industry keywords',
      'Optimize for common ATS systems used by BPO companies',
      'Add a professional summary section'
    ]
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const scoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 70) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Brain className="h-12 w-12 text-cyan-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">AI Analysis Results</h1>
                  <p className="text-gray-400">Comprehensive candidate intelligence report</p>
                </div>
              </div>
            </div>
            
            {analysisComplete && (
              <div className="flex gap-3">
                <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            )}
          </motion.div>

          {/* Analysis in Progress */}
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="max-w-2xl mx-auto">
                <div className="relative mb-8">
                  <div className="w-32 h-32 mx-auto glass-card rounded-full flex items-center justify-center">
                    <Brain className="h-16 w-16 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin"></div>
                </div>
                
                <h2 className="text-3xl font-bold gradient-text mb-4">
                  🧠 AI Analysis in Progress
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Our advanced AI is analyzing your resume and portfolio...
                </p>
                
                <div className="space-y-4 text-left max-w-md mx-auto">
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    Processing uploaded documents
                  </div>
                  <div className="flex items-center text-gray-300">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                    Analyzing portfolio links
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-5 w-5 text-yellow-400 mr-3 animate-spin" />
                    Generating intelligence report
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Analysis Results */}
          {analysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Overall Score Card */}
              <Card className="glass-card border-white/10 mb-8">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
                    <div className="text-center lg:text-left">
                      <div className="relative w-32 h-32 mx-auto lg:mx-0 mb-4">
                        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${analysisResults.overallScore * 2.51} 251`}
                            className="transition-all duration-1000"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#06b6d4" />
                              <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-3xl font-bold gradient-text">
                              {analysisResults.overallScore}
                            </div>
                            <div className="text-sm text-gray-400">Overall</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${scoreColor(analysisResults.atsCompatibility)} mb-2`}>
                          {analysisResults.atsCompatibility}%
                        </div>
                        <div className="text-gray-400 text-sm mb-2">ATS Compatibility</div>
                        <Progress 
                          value={analysisResults.atsCompatibility} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${scoreColor(analysisResults.contentQuality)} mb-2`}>
                          {analysisResults.contentQuality}%
                        </div>
                        <div className="text-gray-400 text-sm mb-2">Content Quality</div>
                        <Progress 
                          value={analysisResults.contentQuality} 
                          className="h-2" 
                        />
                      </div>
                      
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${scoreColor(analysisResults.professionalPresentation)} mb-2`}>
                          {analysisResults.professionalPresentation}%
                        </div>
                        <div className="text-gray-400 text-sm mb-2">Presentation</div>
                        <Progress 
                          value={analysisResults.professionalPresentation} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="glass-card border-white/10 p-1">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
                    <Target className="h-4 w-4 mr-2" />
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="strengths" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400">
                    <Trophy className="h-4 w-4 mr-2" />
                    Strengths
                  </TabsTrigger>
                  <TabsTrigger value="improvements" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Improvements
                  </TabsTrigger>
                  <TabsTrigger value="data" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400">
                    <FileText className="h-4 w-4 mr-2" />
                    Source Data
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center text-green-400">
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Key Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {analysisResults.keyStrengths.map((strength, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start"
                            >
                              <Star className="h-4 w-4 text-yellow-400 mt-1 mr-3 flex-shrink-0" />
                              <span className="text-gray-300">{strength}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center text-yellow-400">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {analysisResults.improvements.map((improvement, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start"
                            >
                              <Zap className="h-4 w-4 text-cyan-400 mt-1 mr-3 flex-shrink-0" />
                              <span className="text-gray-300">{improvement}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="strengths" className="space-y-6">
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-400">
                        <Trophy className="h-5 w-5 mr-2" />
                        Detailed Strengths Analysis
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Your standout qualities that make you a strong BPO candidate
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {analysisResults.keyStrengths.map((strength, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="glass-card p-4 border border-green-400/20"
                          >
                            <div className="flex items-center mb-2">
                              <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                                Strength #{index + 1}
                              </Badge>
                            </div>
                            <p className="text-gray-300">{strength}</p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="improvements" className="space-y-6">
                  <Card className="glass-card border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center text-yellow-400">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        AI Recommendations
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Actionable suggestions to enhance your profile
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysisResults.recommendations.map((recommendation, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="glass-card p-4 border border-yellow-400/20"
                          >
                            <div className="flex items-start">
                              <Sparkles className="h-5 w-5 text-yellow-400 mt-1 mr-3 flex-shrink-0" />
                              <div>
                                <p className="text-gray-300 mb-2">{recommendation}</p>
                                <Badge variant="outline" className="border-yellow-400/30 text-yellow-400">
                                  High Impact
                                </Badge>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="data" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center text-cyan-400">
                          <FileText className="h-5 w-5 mr-2" />
                          Uploaded Files
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysisData.uploadedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 glass-card rounded-lg border border-white/10">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 text-cyan-400 mr-3" />
                                <div>
                                  <p className="text-white font-medium">{file.name}</p>
                                  <p className="text-gray-400 text-sm">{file.category}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="border-green-400/30 text-green-400">
                                Analyzed
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center text-purple-400">
                          <Link2 className="h-5 w-5 mr-2" />
                          Portfolio Links
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysisData.portfolioLinks.map((link, index) => (
                            <div key={index} className="flex items-center justify-between p-3 glass-card rounded-lg border border-white/10">
                              <div className="flex items-center">
                                <Link2 className="h-4 w-4 text-purple-400 mr-3" />
                                <div>
                                  <p className="text-white font-medium">{link.title}</p>
                                  <p className="text-gray-400 text-sm">{link.type}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="border-green-400/30 text-green-400">
                                Scanned
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Next Steps */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12"
              >
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gradient-text">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Next Steps
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Ready to take your career to the next level?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 h-auto p-4 flex-col"
                        onClick={() => router.push('/resume-builder/upload')}
                      >
                        <Upload className="h-6 w-6 mb-2" />
                        <span>Upload More Files</span>
                        <span className="text-xs opacity-80">Add more documents</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10 h-auto p-4 flex-col"
                        disabled
                      >
                        <FileText className="h-6 w-6 mb-2" />
                        <span>Build New Resume</span>
                        <span className="text-xs opacity-80">Coming Soon</span>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="border-green-400/30 text-green-400 hover:bg-green-400/10 h-auto p-4 flex-col"
                        onClick={() => router.push('/jobs')}
                      >
                        <Target className="h-6 w-6 mb-2" />
                        <span>Find Jobs</span>
                        <span className="text-xs opacity-80">Match with BPO roles</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 
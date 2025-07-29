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
  Upload,
  Copy,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getFromLocalStorage } from '@/lib/utils';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';

interface AnalysisData {
  sessionId: string;
  uploadedFiles: any[];
  portfolioLinks: any[];
  processedFiles: any[];
}

export default function AnalysisPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [mappedResumeData, setMappedResumeData] = useState<any>(null);
  const [improvedSummary, setImprovedSummary] = useState<string | null>(null);
  const [isImprovingSummary, setIsImprovingSummary] = useState(false);

  // Smart mapping function to extract data from flexible JSON structure
  const mapResumeData = (rawData: any) => {
    if (!rawData) return null;

    console.log('🔍 DEBUG: Mapping resume data from raw JSON...');
    
    const mapped = {
      // Name mapping - look for various name fields
      name: findField(rawData, ['name', 'full_name', 'fullName', 'personal_name', 'candidate_name', 'first_name', 'last_name']) ||
            combineFields(rawData, ['first_name', 'last_name']) ||
            extractFromContact(rawData, 'name'),
      
      // Email mapping
      email: findField(rawData, ['email', 'email_address', 'contact_email', 'primary_email']) ||
             extractFromContact(rawData, 'email') ||
             extractFromArray(rawData, ['emails', 'contact_emails']),
      
      // Phone mapping
      phone: findField(rawData, ['phone', 'phone_number', 'contact_phone', 'mobile', 'telephone']) ||
             extractFromContact(rawData, 'phone') ||
             extractFromArray(rawData, ['phones', 'phone_numbers']),
      
      // Location mapping
      location: findField(rawData, ['location', 'address', 'city', 'residence', 'current_location']) ||
                extractFromContact(rawData, 'location') ||
                combineFields(rawData, ['city', 'state']) ||
                combineFields(rawData, ['city', 'country']),
      
      // Summary mapping
      summary: findField(rawData, ['summary', 'professional_summary', 'profile', 'objective', 'about', 'overview', 'career_summary']),
      
      // Skills mapping
      skills: findArray(rawData, ['skills', 'technical_skills', 'core_skills', 'competencies', 'abilities', 'technologies']),
      
      // Experience mapping
      experience: findArray(rawData, ['experience', 'work_experience', 'employment', 'career', 'jobs', 'positions', 'work_history']),
      
      // Education mapping
      education: findArray(rawData, ['education', 'academic_background', 'qualifications', 'schooling', 'degrees'])
    };

    console.log('🔍 DEBUG: Mapped resume data:', mapped);
    return mapped;
  };



  // Helper functions for smart field mapping
  const findField = (obj: any, fieldNames: string[]) => {
    for (const field of fieldNames) {
      if (obj && obj[field]) return obj[field];
    }
    return null;
  };

  const findArray = (obj: any, fieldNames: string[]) => {
    for (const field of fieldNames) {
      if (obj && Array.isArray(obj[field])) return obj[field];
    }
    return [];
  };

  const combineFields = (obj: any, fields: string[]) => {
    const values = fields.map(field => obj?.[field]).filter(Boolean);
    return values.length > 0 ? values.join(' ') : null;
  };

  const extractFromContact = (obj: any, type: string) => {
    const contactFields = ['contact', 'contact_info', 'personal_info', 'contact_information'];
    for (const contactField of contactFields) {
      if (obj?.[contactField]?.[type]) return obj[contactField][type];
    }
    return null;
  };

  const extractFromArray = (obj: any, arrayFields: string[]) => {
    for (const field of arrayFields) {
      if (obj?.[field] && Array.isArray(obj[field]) && obj[field].length > 0) {
        return obj[field][0]; // Return first item
      }
    }
    return null;
  };

  useEffect(() => {
    // Load data from localStorage
    const sessionId = getFromLocalStorage('bpoc_session_id', '');
    const uploadedFiles = getFromLocalStorage('bpoc_uploaded_files', []);
    const portfolioLinks = getFromLocalStorage('bpoc_portfolio_links', []);
    const processedFiles = getFromLocalStorage('bpoc_processed_files', []);
    const debugProcessedResumes = getFromLocalStorage('bpoc_processed_resumes', []);

    console.log('🔍 DEBUG: Analysis page localStorage data:');
    console.log('  - sessionId:', sessionId);
    console.log('  - uploadedFiles:', uploadedFiles);
    console.log('  - portfolioLinks:', portfolioLinks);
    console.log('  - processedFiles:', processedFiles);
    console.log('  - processedResumes:', debugProcessedResumes);

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

    // Start real AI analysis process
    performAIAnalysis(sessionId, uploadedFiles, portfolioLinks, processedFiles);

    // Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, [router]);

  // Auto-improve summary when analysis is complete and summary is available
  useEffect(() => {
    if (analysisComplete && mappedResumeData?.summary && !improvedSummary && !isImprovingSummary) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        improveSummary();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [analysisComplete, mappedResumeData?.summary, improvedSummary, isImprovingSummary]);

  // Perform AI analysis using Claude API
  const performAIAnalysis = async (sessionId: string, uploadedFiles: any[], portfolioLinks: any[], processedFiles: any[]) => {
    try {
      // Step 1: Convert files to JSON (if not already processed)
      setProgressValue(10);
      
      // Get processed resumes from localStorage
      const processedResumes = getFromLocalStorage('bpoc_processed_resumes', []);
      
      if (processedResumes.length === 0) {
        throw new Error('No processed resume data found. Please go back and process your files first.');
      }

      // Step 2: Prepare data for Claude analysis
      setProgressValue(30);
      
      const resumeDataFromStorage = processedResumes[0]; // Use the first processed resume
      console.log('🔍 DEBUG: Raw resume data from localStorage:', resumeDataFromStorage);
      console.log('🔍 DEBUG: Resume data keys:', Object.keys(resumeDataFromStorage || {}));
      console.log('🔍 DEBUG: Resume data structure:', JSON.stringify(resumeDataFromStorage, null, 2));
      
      // Map the raw data to a consistent structure
      const mapped = mapResumeData(resumeDataFromStorage);
      console.log('🔍 DEBUG: Mapped data for UI:', mapped);
      
      setResumeData(resumeDataFromStorage); // Store original data for Claude
      setMappedResumeData(mapped); // Store mapped data for UI display
      const portfolioData = portfolioLinks.map(link => ({
        url: link.url,
        type: link.type,
        title: link.title
      }));

      // Step 3: Call Claude API for analysis
      setProgressValue(50);
      
      const analysisResponse = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData: resumeDataFromStorage,
          portfolioLinks: portfolioData,
          sessionId
        })
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.json();
        throw new Error(errorData.error || 'Failed to analyze resume');
      }

      const analysisData = await analysisResponse.json();
      
      if (!analysisData.success) {
        throw new Error(analysisData.error || 'Analysis failed');
      }

      // Step 4: Set analysis results
      setProgressValue(90);
      setAnalysisResults(analysisData.analysis);
      
      // Step 5: Complete analysis
      setProgressValue(100);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }, 500);

    } catch (error) {
      console.error('AI Analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }
  };

  // Use real analysis results from Claude API or show loading state
  const finalAnalysisResults = analysisResults;

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

  // Function to improve professional summary using Claude API
  const improveSummary = async () => {
    if (!mappedResumeData?.summary || isImprovingSummary) return;

    setIsImprovingSummary(true);
    try {
      const response = await fetch('/api/improve-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalSummary: mappedResumeData.summary,
          resumeData: resumeData
        }),
      });

      const data = await response.json();
      
      if (data.success && data.improvedSummary) {
        setImprovedSummary(data.improvedSummary);
        console.log('✅ Summary improved successfully');
      } else {
        console.error('Failed to improve summary:', data.error);
        // You could add a toast notification here
      }
    } catch (error) {
      console.error('Error improving summary:', error);
      // You could add a toast notification here
    } finally {
      setIsImprovingSummary(false);
    }
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

  // Show loading state while analysis is in progress
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin h-16 w-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-white mb-4">Analyzing Your Resume</h2>
                <p className="text-gray-400 mb-6">Claude AI is processing your resume data...</p>
                <div className="max-w-md mx-auto">
                  <Progress value={progressValue} className="h-2 bg-white/10" />
                  <p className="text-sm text-gray-300 mt-2">{progressValue}% Complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if analysis failed
  if (analysisError) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="text-red-400 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-white mb-4">Analysis Failed</h2>
                <p className="text-gray-400 mb-6">{analysisError}</p>
                <Button onClick={() => router.back()} className="bg-cyan-500 hover:bg-cyan-600">
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show message if no analysis results yet
  if (!finalAnalysisResults || !analysisComplete) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="text-cyan-400 text-6xl mb-4">🤖</div>
                <h2 className="text-2xl font-bold text-white mb-4">No Analysis Results</h2>
                <p className="text-gray-400 mb-6">Please go back and run the analysis first.</p>
                <Button onClick={() => router.back()} className="bg-cyan-500 hover:bg-cyan-600">
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Additional safety check - ensure we have the required structure from Claude
  if (!finalAnalysisResults.keyStrengths || !finalAnalysisResults.improvements || !finalAnalysisResults.recommendations) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="text-yellow-400 text-6xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold text-white mb-4">Incomplete Claude Analysis</h2>
                <p className="text-gray-400 mb-6">Claude AI analysis is incomplete or failed. Please try running the analysis again.</p>
                <Button onClick={() => router.back()} className="bg-cyan-500 hover:bg-cyan-600">
                  Go Back
                </Button>
              </div>
            </div>
          </div>
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
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <Brain className="h-12 w-12 text-cyan-400 animate-pulse mr-3" />
                    <h2 className="text-3xl font-bold gradient-text">
                      AI Analysis in Progress
                    </h2>
                  </div>
                  
                  <p className="text-lg text-gray-300 mb-6">
                    Claude AI is analyzing your resume and portfolio data...
                  </p>
                  
                  <div className="max-w-md mx-auto">
                    <Progress 
                      value={progressValue} 
                      className="h-2 bg-white/10"
                    />
                  </div>
                </div>
                
                <div className="space-y-4 text-left max-w-md mx-auto">
                  {/* Task 1: Loading resume data (0-25%) */}
                  <motion.div 
                    className="flex items-center text-gray-300"
                    animate={{ 
                      color: progressValue >= 25 ? '#10b981' : progressValue > 0 ? '#06b6d4' : '#6b7280'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ scale: progressValue >= 25 ? 1.1 : 1 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                    >
                      {progressValue >= 25 ? (
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                      ) : progressValue > 0 ? (
                        <div className="relative mr-3">
                          <Clock className="h-5 w-5 text-cyan-400 animate-pulse" />
                          <div className="absolute inset-0 h-5 w-5 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin"></div>
                        </div>
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-500 rounded-full mr-3"></div>
                      )}
                    </motion.div>
                    Loading resume data
                  </motion.div>
                  
                  {/* Task 2: Preparing analysis (25-50%) */}
                  <motion.div 
                    className="flex items-center text-gray-300"
                    animate={{ 
                      color: progressValue >= 50 ? '#10b981' : progressValue >= 25 ? '#3b82f6' : '#6b7280'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ scale: progressValue >= 50 ? 1.1 : 1 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                    >
                      {progressValue >= 50 ? (
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                      ) : progressValue >= 25 ? (
                        <div className="relative mr-3">
                          <Clock className="h-5 w-5 text-blue-400 animate-pulse" />
                          <div className="absolute inset-0 h-5 w-5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin"></div>
                        </div>
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-500 rounded-full mr-3"></div>
                      )}
                    </motion.div>
                    Preparing analysis data
                  </motion.div>
                  
                  {/* Task 3: Claude AI analysis (50-90%) */}
                  <motion.div 
                    className="flex items-center text-gray-300"
                    animate={{ 
                      color: progressValue >= 90 ? '#10b981' : progressValue >= 50 ? '#eab308' : '#6b7280'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ scale: progressValue >= 90 ? 1.1 : 1 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                    >
                      {progressValue >= 90 ? (
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                      ) : progressValue >= 50 ? (
                        <div className="relative mr-3">
                          <Clock className="h-5 w-5 text-yellow-400 animate-pulse" />
                          <div className="absolute inset-0 h-5 w-5 rounded-full border-2 border-yellow-400/30 border-t-yellow-400 animate-spin"></div>
                        </div>
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-500 rounded-full mr-3"></div>
                      )}
                    </motion.div>
                    Claude AI analyzing resume
                  </motion.div>
                  
                  {/* Task 4: Generating report (90-100%) */}
                  <motion.div 
                    className="flex items-center text-gray-300"
                    animate={{ 
                      color: progressValue >= 100 ? '#10b981' : progressValue >= 90 ? '#8b5cf6' : '#6b7280'
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      animate={{ scale: progressValue >= 100 ? 1.1 : 1 }}
                      transition={{ duration: 0.3, type: 'spring' }}
                    >
                      {progressValue >= 100 ? (
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3" />
                      ) : progressValue >= 90 ? (
                        <div className="relative mr-3">
                          <Clock className="h-5 w-5 text-purple-400 animate-pulse" />
                          <div className="absolute inset-0 h-5 w-5 rounded-full border-2 border-purple-400/30 border-t-purple-400 animate-spin"></div>
                        </div>
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-500 rounded-full mr-3"></div>
                      )}
                    </motion.div>
                    Generating analysis report
                  </motion.div>
                </div>
                
                {analysisError && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2 text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Analysis Error</span>
                    </div>
                    <p className="text-red-300 text-sm mt-1">{analysisError}</p>
                  </motion.div>
                )}
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
                            strokeDasharray={`${(finalAnalysisResults?.overallScore || 0) * 2.51} 251`}
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
                                                           <div className="text-xl font-bold gradient-text">
                                                                 {finalAnalysisResults?.overallScore ?? 'N/A'}/100
                              </div>
                             <div className="text-sm text-gray-400">Overall</div>
                           </div>
                         </div>
                      </div>
                    </div>
                    
                    {/* User Profile Information */}
                    <div className="lg:col-span-3 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4">Candidate Profile</h3>
                          
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                              <div>
                                <p className="text-sm text-gray-400">Name</p>
                                <p className="text-white font-medium">
                                  {mappedResumeData?.name || 'No name found in resume'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                              <div>
                                <p className="text-sm text-gray-400">Email</p>
                                <p className="text-white font-medium">
                                  {mappedResumeData?.email || 'No email found in resume'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-400"></div>
                              <div>
                                <p className="text-sm text-gray-400">Phone</p>
                                <p className="text-white font-medium">
                                  {mappedResumeData?.phone || 'No phone number found in resume'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                              <div>
                                <p className="text-sm text-gray-400">Location</p>
                                <p className="text-white font-medium">
                                  {mappedResumeData?.location || 'No location found in resume'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Portfolio Links */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Links</h3>
                          
                          <div className="space-y-3">
                            {analysisData?.portfolioLinks?.length > 0 ? (
                              analysisData.portfolioLinks.map((link, index) => (
                                <div key={index} className="flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                                  <div>
                                    <p className="text-sm text-gray-400 capitalize">{link.type}</p>
                                    <a 
                                      href={link.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-cyan-400 hover:text-cyan-300 transition-colors truncate max-w-xs block"
                                    >
                                      {link.title || link.url}
                                    </a>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                <div>
                                  <p className="text-sm text-gray-400">Portfolio</p>
                                  <p className="text-gray-500">No portfolio links added</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </CardContent>
              </Card>

              {/* Analysis Tabs */}
              <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex justify-center">
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
                    <TabsTrigger value="salary" className="data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Salary & Career
                    </TabsTrigger>
                  </TabsList>
                </div>

                                 <TabsContent value="overview" className="space-y-6">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Skills */}
                     <Card className="glass-card border-white/10">
                       <CardHeader>
                         <CardTitle className="flex items-center text-cyan-400">
                           <Star className="h-5 w-5 mr-2" />
                           Skills
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <div className="flex flex-wrap gap-2">
                           {(Array.isArray(mappedResumeData?.skills) && mappedResumeData.skills.length > 0) ? 
                             mappedResumeData.skills.map((skill: string, index: number) => (
                               <motion.div
                                 key={index}
                                 initial={{ opacity: 0, scale: 0.8 }}
                                 animate={{ opacity: 1, scale: 1 }}
                                 transition={{ delay: index * 0.1 }}
                               >
                                 <Badge variant="outline" className="border-cyan-400/30 text-cyan-400 bg-cyan-400/10">
                                   {skill}
                                 </Badge>
                               </motion.div>
                             )) : 
                             <p className="text-gray-400 text-sm">No skills data available from resume</p>
                           }
                         </div>
                       </CardContent>
                     </Card>

                     {/* Professional Summary */}
                     <Card className="glass-card border-white/10">
                       <CardHeader>
                         <CardTitle className="flex items-center justify-between text-purple-400">
                           <div className="flex items-center">
                             <FileText className="h-5 w-5 mr-2" />
                             Professional Summary
                           </div>
                           {mappedResumeData?.summary && (
                             <Button
                               onClick={improveSummary}
                               disabled={isImprovingSummary}
                               size="sm"
                               className="bg-purple-500 hover:bg-purple-600 text-white"
                             >
                               {isImprovingSummary ? (
                                 <>
                                   <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                   Improving...
                                 </>
                               ) : (
                                 <>
                                   <Sparkles className="h-4 w-4 mr-2" />
                                   Improve with AI
                                 </>
                               )}
                             </Button>
                           )}
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         {improvedSummary ? (
                           <div>
                             <div className="flex items-center justify-between mb-2">
                               <h4 className="text-sm font-semibold text-green-400">Improved Summary:</h4>
                               <div className="flex gap-2">
                                 <Button
                                   onClick={() => navigator.clipboard.writeText(improvedSummary)}
                                   size="sm"
                                   variant="outline"
                                   className="text-xs border-green-400/30 text-green-400 hover:bg-green-400/10"
                                 >
                                   <Copy className="h-3 w-3 mr-1" />
                                   Copy
                                 </Button>
                                 <Button
                                   onClick={() => setImprovedSummary(null)}
                                   size="sm"
                                   variant="outline"
                                   className="text-xs border-gray-400/30 text-gray-400 hover:bg-gray-400/10"
                                 >
                                   <ArrowLeft className="h-3 w-3 mr-1" />
                                   Reset
                                 </Button>
                               </div>
                             </div>
                             <p className="text-gray-300 leading-relaxed">
                               {improvedSummary}
                             </p>
                           </div>
                         ) : (
                           <p className="text-gray-300 leading-relaxed">
                             {mappedResumeData?.summary || 'No professional summary found in resume'}
                           </p>
                         )}
                       </CardContent>
                     </Card>

                     {/* Work Experience */}
                     <Card className="glass-card border-white/10">
                       <CardHeader>
                         <CardTitle className="flex items-center text-green-400">
                           <Trophy className="h-5 w-5 mr-2" />
                           Work Experience
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <div className="space-y-4">
                           {(Array.isArray(mappedResumeData?.experience) && mappedResumeData.experience.length > 0) ? 
                             mappedResumeData.experience.map((exp: any, index: number) => (
                               <motion.div
                                 key={index}
                                 initial={{ opacity: 0, y: 20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: (index + 1) * 0.1 }}
                                 className="border-l-2 border-green-400/30 pl-4"
                               >
                                 <h4 className="font-semibold text-white">{exp.position || exp.title || 'Position'}</h4>
                                 <p className="text-green-400 text-sm">{exp.company || exp.employer || 'Company'} • {exp.duration || exp.period || 'Duration'}</p>
                                 <p className="text-gray-300 text-sm mt-2">
                                   {exp.description || exp.responsibilities?.join(', ') || 'No description available'}
                                 </p>
                               </motion.div>
                             )) :
                             <p className="text-gray-400 text-sm">No work experience data available from resume</p>
                           }
                         </div>
                       </CardContent>
                     </Card>

                     {/* Education */}
                     <Card className="glass-card border-white/10">
                       <CardHeader>
                         <CardTitle className="flex items-center text-yellow-400">
                           <Target className="h-5 w-5 mr-2" />
                           Education
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <div className="space-y-4">
                           {(Array.isArray(mappedResumeData?.education) && mappedResumeData.education.length > 0) ? 
                             mappedResumeData.education.map((edu: any, index: number) => (
                               <motion.div
                                 key={index}
                                 initial={{ opacity: 0, y: 20 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 transition={{ delay: (index + 1) * 0.1 }}
                                 className="border-l-2 border-yellow-400/30 pl-4"
                               >
                                 <h4 className="font-semibold text-white">{edu.degree || edu.title || 'Degree'}</h4>
                                 <p className="text-yellow-400 text-sm">{edu.institution || edu.school || edu.university || 'Institution'} • {edu.year || edu.graduationYear || 'Year'}</p>
                                 <p className="text-gray-300 text-sm mt-2">
                                   {edu.details || edu.description || edu.honors || 'No details available'}
                                 </p>
                               </motion.div>
                             )) :
                             <p className="text-gray-400 text-sm">No education data available from resume</p>
                           }
                         </div>
                       </CardContent>
                     </Card>
                   </div>
                 </TabsContent>

                                                 <TabsContent value="strengths" className="space-y-8">
                  {/* Header Section */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h2 className="text-3xl font-bold text-white mb-4">Your Professional Strengths</h2>
                      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        AI-powered analysis of your resume reveals your key competitive advantages for BPO roles
                      </p>
                    </motion.div>
                  </div>

                  {/* Main Strengths Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Core Professional Strengths */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="glass-card border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:from-green-500/15 hover:to-green-600/10 transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <Target className="h-6 w-6 text-green-400" />
                            </div>
                            <CardTitle className="text-green-400 text-xl">Core Professional Strengths</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Your strongest professional attributes that set you apart
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.isArray(finalAnalysisResults?.strengthsAnalysis?.coreStrengths) && finalAnalysisResults.strengthsAnalysis.coreStrengths.length > 0 ? 
                            finalAnalysisResults.strengthsAnalysis.coreStrengths.map((strength: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + (index * 0.1) }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10 border border-green-400/20 hover:bg-green-500/15 transition-colors"
                              >
                                <div className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                                  <span className="text-green-400 text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-white text-sm leading-relaxed">{strength}</p>
                                </div>
                              </motion.div>
                            )) : 
                            <div className="text-center py-8">
                              <div className="text-gray-400 text-sm">No core strengths analysis available</div>
                            </div>
                          }
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Technical Strengths */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="glass-card border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:from-blue-500/15 hover:to-blue-600/10 transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <Zap className="h-6 w-6 text-blue-400" />
                            </div>
                            <CardTitle className="text-blue-400 text-xl">Technical Strengths</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Technical skills that make you valuable for BPO roles
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.isArray(finalAnalysisResults?.strengthsAnalysis?.technicalStrengths) && finalAnalysisResults.strengthsAnalysis.technicalStrengths.length > 0 ? 
                            finalAnalysisResults.strengthsAnalysis.technicalStrengths.map((strength: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 + (index * 0.1) }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-400/20 hover:bg-blue-500/15 transition-colors"
                              >
                                <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                                  <span className="text-blue-400 text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-white text-sm leading-relaxed">{strength}</p>
                                </div>
                              </motion.div>
                            )) : 
                            <div className="text-center py-8">
                              <div className="text-gray-400 text-sm">No technical strengths analysis available</div>
                            </div>
                          }
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Soft Skills */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Card className="glass-card border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:from-purple-500/15 hover:to-purple-600/10 transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                                                         <div className="p-2 bg-purple-500/20 rounded-lg">
                               <Users className="h-6 w-6 text-purple-400" />
                             </div>
                            <CardTitle className="text-purple-400 text-xl">Soft Skills</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Interpersonal skills that enhance your professional value
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.isArray(finalAnalysisResults?.strengthsAnalysis?.softSkills) && finalAnalysisResults.strengthsAnalysis.softSkills.length > 0 ? 
                            finalAnalysisResults.strengthsAnalysis.softSkills.map((skill: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (index * 0.1) }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-400/20 hover:bg-purple-500/15 transition-colors"
                              >
                                <div className="flex-shrink-0 w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center mt-0.5">
                                  <span className="text-purple-400 text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-white text-sm leading-relaxed">{skill}</p>
                                </div>
                              </motion.div>
                            )) : 
                            <div className="text-center py-8">
                              <div className="text-gray-400 text-sm">No soft skills analysis available</div>
                            </div>
                          }
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Notable Achievements */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="glass-card border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 hover:from-yellow-500/15 hover:to-yellow-600/10 transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                              <Trophy className="h-6 w-6 text-yellow-400" />
                            </div>
                            <CardTitle className="text-yellow-400 text-xl">Notable Achievements</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Key accomplishments that demonstrate your value
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.isArray(finalAnalysisResults?.strengthsAnalysis?.achievements) && finalAnalysisResults.strengthsAnalysis.achievements.length > 0 ? 
                            finalAnalysisResults.strengthsAnalysis.achievements.map((achievement: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + (index * 0.1) }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/20 hover:bg-yellow-500/15 transition-colors"
                              >
                                <div className="flex-shrink-0 w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center mt-0.5">
                                  <span className="text-yellow-400 text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-white text-sm leading-relaxed">{achievement}</p>
                                </div>
                              </motion.div>
                            )) : 
                            <div className="text-center py-8">
                              <div className="text-gray-400 text-sm">No achievements analysis available</div>
                            </div>
                          }
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Market Advantages */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Card className="glass-card border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 hover:from-cyan-500/15 hover:to-cyan-600/10 transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                              <TrendingUp className="h-6 w-6 text-cyan-400" />
                            </div>
                            <CardTitle className="text-cyan-400 text-xl">Market Advantages</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Specific advantages for the BPO industry
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.isArray(finalAnalysisResults?.strengthsAnalysis?.marketAdvantage) && finalAnalysisResults.strengthsAnalysis.marketAdvantage.length > 0 ? 
                            finalAnalysisResults.strengthsAnalysis.marketAdvantage.map((advantage: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 + (index * 0.1) }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20 hover:bg-cyan-500/15 transition-colors"
                              >
                                <div className="flex-shrink-0 w-6 h-6 bg-cyan-500/20 rounded-full flex items-center justify-center mt-0.5">
                                  <span className="text-cyan-400 text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-white text-sm leading-relaxed">{advantage}</p>
                                </div>
                              </motion.div>
                            )) : 
                            <div className="text-center py-8">
                              <div className="text-gray-400 text-sm">No market advantages analysis available</div>
                            </div>
                          }
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Key Strengths Summary */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="lg:col-span-2"
                    >
                      <Card className="glass-card border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:from-green-500/15 hover:to-green-600/10 transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <Star className="h-6 w-6 text-green-400" />
                            </div>
                            <CardTitle className="text-green-400 text-xl">Key Strengths Summary</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Your most valuable professional attributes for career success
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.isArray(finalAnalysisResults?.keyStrengths) && finalAnalysisResults.keyStrengths.length > 0 ? 
                              finalAnalysisResults.keyStrengths.map((strength: string, index: number) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.8 + (index * 0.1) }}
                                  className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-400/20 hover:bg-green-500/15 transition-colors"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-green-400 text-sm font-bold">{index + 1}</span>
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-white text-sm leading-relaxed">{strength}</p>
                                  </div>
                                </motion.div>
                              )) : 
                              <div className="col-span-full text-center py-8">
                                <div className="text-gray-400 text-sm">No key strengths analysis available</div>
                              </div>
                            }
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </TabsContent>

                                                  <TabsContent value="improvements" className="space-y-8">
                   {/* Header Section */}
                   <div className="text-center mb-8">
                     <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.1 }}
                     >
                       <h2 className="text-3xl font-bold text-white mb-4">Resume Improvements</h2>
                       <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                         AI-powered analysis identifies specific areas to enhance your resume's effectiveness
                       </p>
                     </motion.div>
                   </div>

                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     
                     {/* Critical Issues to Address */}
                     <motion.div
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.2 }}
                     >
                       <Card className="glass-card border-red-500/30 bg-gradient-to-br from-red-500/10 to-red-600/5 hover:from-red-500/15 hover:to-red-600/10 transition-all duration-300">
                         <CardHeader className="pb-4">
                           <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-red-500/20 rounded-lg">
                               <AlertTriangle className="h-6 w-6 text-red-400" />
                             </div>
                             <CardTitle className="text-red-400 text-xl">Critical Issues to Address</CardTitle>
                           </div>
                           <CardDescription className="text-gray-300 text-sm">
                             High-priority improvements that will significantly boost your resume score
                           </CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-3">
                           {Array.isArray(finalAnalysisResults?.improvements) && finalAnalysisResults.improvements.length > 0 ? 
                             finalAnalysisResults.improvements.map((improvement: string, index: number) => (
                               <motion.div
                                 key={index}
                                 initial={{ opacity: 0, x: -20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: 0.3 + (index * 0.1) }}
                                 className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-400/20 hover:bg-red-500/15 transition-colors"
                               >
                                 <div className="flex-shrink-0 w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5">
                                   <span className="text-red-400 text-xs font-bold">{index + 1}</span>
                                 </div>
                                 <div className="flex-1">
                                   <p className="text-white text-sm leading-relaxed">{improvement}</p>
                                 </div>
                               </motion.div>
                             )) : 
                             <div className="text-center py-8">
                               <div className="text-gray-400 text-sm">No improvement suggestions available from Claude</div>
                             </div>
                           }
                         </CardContent>
                       </Card>
                     </motion.div>

                     {/* Section Analysis - Contact & Summary */}
                     <motion.div
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.3 }}
                     >
                       <Card className="glass-card border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:from-blue-500/15 hover:to-blue-600/10 transition-all duration-300">
                         <CardHeader className="pb-4">
                           <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-blue-500/20 rounded-lg">
                               <TrendingUp className="h-6 w-6 text-blue-400" />
                             </div>
                             <CardTitle className="text-blue-400 text-xl">Section Analysis</CardTitle>
                           </div>
                           <CardDescription className="text-gray-300 text-sm">
                             Detailed breakdown of each resume section with scores and recommendations
                           </CardDescription>
                         </CardHeader>
                         <CardContent className="space-y-3">
                           {/* Contact Section */}
                           {finalAnalysisResults?.sectionAnalysis?.contact && (
                             <motion.div
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.4 }}
                               className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20"
                             >
                               <div className="flex items-center justify-between mb-2">
                                 <h4 className="font-semibold text-white">Contact Information</h4>
                                 <div className="text-xl font-bold text-green-400">
                                   {finalAnalysisResults.sectionAnalysis.contact.score}/100
                                 </div>
                               </div>
                               <div className="space-y-1">
                                 {finalAnalysisResults.sectionAnalysis.contact.reasons?.map((reason: string, idx: number) => (
                                   <p key={idx} className="text-gray-300 text-xs">• {reason}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.contact.issues?.map((issue: string, idx: number) => (
                                   <p key={idx} className="text-red-400 text-xs">⚠️ {issue}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.contact.improvements?.map((improvement: string, idx: number) => (
                                   <p key={idx} className="text-green-400 text-xs">💡 {improvement}</p>
                                 ))}
                               </div>
                             </motion.div>
                           )}

                           {/* Summary Section */}
                           {finalAnalysisResults?.sectionAnalysis?.summary && (
                             <motion.div
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.5 }}
                               className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20"
                             >
                               <div className="flex items-center justify-between mb-2">
                                 <h4 className="font-semibold text-white">Professional Summary</h4>
                                 <div className="text-xl font-bold text-yellow-400">
                                   {finalAnalysisResults.sectionAnalysis.summary.score}/100
                                 </div>
                               </div>
                               <div className="space-y-1">
                                 {finalAnalysisResults.sectionAnalysis.summary.reasons?.map((reason: string, idx: number) => (
                                   <p key={idx} className="text-gray-300 text-xs">• {reason}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.summary.issues?.map((issue: string, idx: number) => (
                                   <p key={idx} className="text-red-400 text-xs">⚠️ {issue}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.summary.improvements?.map((improvement: string, idx: number) => (
                                   <p key={idx} className="text-green-400 text-xs">💡 {improvement}</p>
                                 ))}
                               </div>
                             </motion.div>
                           )}

                           {/* Experience Section */}
                           {finalAnalysisResults?.sectionAnalysis?.experience && (
                             <motion.div
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.6 }}
                               className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20"
                             >
                               <div className="flex items-center justify-between mb-2">
                                 <h4 className="font-semibold text-white">Work Experience</h4>
                                 <div className="text-xl font-bold text-yellow-400">
                                   {finalAnalysisResults.sectionAnalysis.experience.score}/100
                                 </div>
                               </div>
                               <div className="space-y-1">
                                 {finalAnalysisResults.sectionAnalysis.experience.reasons?.map((reason: string, idx: number) => (
                                   <p key={idx} className="text-gray-300 text-xs">• {reason}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.experience.issues?.map((issue: string, idx: number) => (
                                   <p key={idx} className="text-red-400 text-xs">⚠️ {issue}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.experience.improvements?.map((improvement: string, idx: number) => (
                                   <p key={idx} className="text-green-400 text-xs">💡 {improvement}</p>
                                 ))}
                               </div>
                             </motion.div>
                           )}

                           {/* Education Section */}
                           {finalAnalysisResults?.sectionAnalysis?.education && (
                             <motion.div
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.7 }}
                               className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20"
                             >
                               <div className="flex items-center justify-between mb-2">
                                 <h4 className="font-semibold text-white">Education</h4>
                                 <div className="text-xl font-bold text-green-400">
                                   {finalAnalysisResults.sectionAnalysis.education.score}/100
                                 </div>
                               </div>
                               <div className="space-y-1">
                                 {finalAnalysisResults.sectionAnalysis.education.reasons?.map((reason: string, idx: number) => (
                                   <p key={idx} className="text-gray-300 text-xs">• {reason}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.education.issues?.map((issue: string, idx: number) => (
                                   <p key={idx} className="text-red-400 text-xs">⚠️ {issue}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.education.improvements?.map((improvement: string, idx: number) => (
                                   <p key={idx} className="text-green-400 text-xs">💡 {improvement}</p>
                                 ))}
                               </div>
                             </motion.div>
                           )}

                           {/* Skills Section */}
                           {finalAnalysisResults?.sectionAnalysis?.skills && (
                             <motion.div
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.8 }}
                               className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20"
                             >
                               <div className="flex items-center justify-between mb-2">
                                 <h4 className="font-semibold text-white">Skills</h4>
                                 <div className="text-xl font-bold text-yellow-400">
                                   {finalAnalysisResults.sectionAnalysis.skills.score}/100
                                 </div>
                               </div>
                               <div className="space-y-1">
                                 {finalAnalysisResults.sectionAnalysis.skills.reasons?.map((reason: string, idx: number) => (
                                   <p key={idx} className="text-gray-300 text-xs">• {reason}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.skills.issues?.map((issue: string, idx: number) => (
                                   <p key={idx} className="text-red-400 text-xs">⚠️ {issue}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.skills.improvements?.map((improvement: string, idx: number) => (
                                   <p key={idx} className="text-green-400 text-xs">💡 {improvement}</p>
                                 ))}
                               </div>
                             </motion.div>
                           )}
                         </CardContent>
                       </Card>
                     </motion.div>

                     {/* Recommendations */}
                     <motion.div
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.4 }}
                       className="lg:col-span-2"
                     >
                       <Card className="glass-card border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:from-green-500/15 hover:to-green-600/10 transition-all duration-300">
                         <CardHeader className="pb-4">
                           <div className="flex items-center gap-3 mb-2">
                             <div className="p-2 bg-green-500/20 rounded-lg">
                               <CheckCircle className="h-6 w-6 text-green-400" />
                             </div>
                             <CardTitle className="text-green-400 text-xl">Actionable Recommendations</CardTitle>
                           </div>
                           <CardDescription className="text-gray-300 text-sm">
                             Specific steps to enhance your resume's effectiveness
                           </CardDescription>
                         </CardHeader>
                         <CardContent>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {Array.isArray(finalAnalysisResults?.recommendations) && finalAnalysisResults.recommendations.length > 0 ? 
                               finalAnalysisResults.recommendations.map((recommendation: string, index: number) => (
                                 <motion.div
                                   key={index}
                                   initial={{ opacity: 0, scale: 0.95 }}
                                   animate={{ opacity: 1, scale: 1 }}
                                   transition={{ delay: 0.5 + (index * 0.1) }}
                                   className="flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-400/20 hover:bg-green-500/15 transition-colors"
                                 >
                                   <div className="flex-shrink-0 w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mt-0.5">
                                     <span className="text-green-400 text-sm font-bold">{index + 1}</span>
                                   </div>
                                   <div className="flex-1">
                                     <p className="text-white text-sm leading-relaxed">{recommendation}</p>
                                   </div>
                                 </motion.div>
                               )) : 
                               <div className="col-span-full text-center py-8">
                                 <div className="text-gray-400 text-sm">No recommendations available from Claude</div>
                               </div>
                             }
                           </div>
                         </CardContent>
                       </Card>
                     </motion.div>
                   </div>
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
                  
                  {/* Resume JSON Data */}
                  <Card className="glass-card border-green-500/20 bg-green-500/5">
                    <CardHeader>
                      <CardTitle className="flex items-center text-green-400">
                        <FileText className="h-5 w-5 mr-2" />
                        Resume JSON Data (Analyzed by Claude)
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        Raw JSON data extracted from your resume that Claude AI analyzed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Mapped Data Preview */}
                        <div>
                          <h4 className="text-md font-medium text-cyan-400 mb-2">📊 Mapped Data (What UI Uses)</h4>
                          <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/20 max-h-48 overflow-y-auto">
                            <pre className="text-green-300 text-xs whitespace-pre-wrap break-words">
                              {mappedResumeData ? JSON.stringify(mappedResumeData, null, 2) : 'No mapped data available'}
                            </pre>
                          </div>
                        </div>
                        
                        {/* Raw Data */}
                        <div>
                          <h4 className="text-md font-medium text-gray-400 mb-2">🔍 Raw JSON Data (Original from OpenAI)</h4>
                          <div className="max-h-48 overflow-y-auto bg-gray-900/50 rounded-lg p-4">
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                              {resumeData ? JSON.stringify(resumeData, null, 2) : 'No resume data available'}
                            </pre>
                          </div>
                        </div>
                      </div>
                      
                      {/* JSON Stats */}
                      <div className="mt-4 pt-4 border-t border-green-400/20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-green-400 font-bold text-lg">
                              {resumeData ? Object.keys(resumeData).length : 0}
                            </div>
                            <div className="text-gray-400 text-xs">JSON Fields</div>
                          </div>
                          <div>
                            <div className="text-cyan-400 font-bold text-lg">
                              {resumeData?.skills?.length || 0}
                            </div>
                            <div className="text-gray-400 text-xs">Skills Found</div>
                          </div>
                          <div>
                            <div className="text-purple-400 font-bold text-lg">
                              {resumeData?.experience?.length || 0}
                            </div>
                            <div className="text-gray-400 text-xs">Experience Items</div>
                          </div>
                          <div>
                            <div className="text-yellow-400 font-bold text-lg">
                              {resumeData?.education?.length || 0}
                            </div>
                            <div className="text-gray-400 text-xs">Education Items</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="salary" className="space-y-8">
                  {/* Header Section */}
                  <div className="text-center mb-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h2 className="text-3xl font-bold text-white mb-4">Salary & Career Insights</h2>
                      <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        AI-powered analysis of your market value and career progression opportunities
                      </p>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Salary Analysis */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="glass-card border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-pink-600/5 hover:from-pink-500/15 hover:to-pink-600/10 transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-pink-500/20 rounded-lg">
                              <TrendingUp className="h-6 w-6 text-pink-400" />
                            </div>
                            <CardTitle className="text-pink-400 text-xl">Salary Analysis</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Market-based salary recommendations and factors
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Current Level */}
                          {finalAnalysisResults?.salaryAnalysis?.currentLevel && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              className="p-3 rounded-lg bg-pink-500/10 border border-pink-400/20"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white">Current Level</h4>
                                <Badge className="bg-pink-500/20 text-pink-400 border-pink-400/30">
                                  {finalAnalysisResults.salaryAnalysis.currentLevel.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-gray-300 text-sm">
                                {finalAnalysisResults.salaryAnalysis.currentLevel === 'entry' ? 'Entry-level professional' :
                                 finalAnalysisResults.salaryAnalysis.currentLevel === 'senior' ? 'Senior professional with extensive experience' :
                                 'Experienced professional with 3+ years in BPO'}
                              </p>
                            </motion.div>
                          )}

                          {/* Recommended Salary Range */}
                          {finalAnalysisResults?.salaryAnalysis?.recommendedSalaryRange && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className="p-3 rounded-lg bg-green-500/10 border border-green-400/20"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white">Recommended Salary Range</h4>
                                <div className="text-xl font-bold text-green-400">
                                  {finalAnalysisResults.salaryAnalysis.recommendedSalaryRange.includes('PHP') ? 
                                    finalAnalysisResults.salaryAnalysis.recommendedSalaryRange.replace('PHP', '₱') :
                                    finalAnalysisResults.salaryAnalysis.recommendedSalaryRange
                                  }
                                </div>
                              </div>
                              <p className="text-gray-300 text-sm">
                                {finalAnalysisResults.salaryAnalysis.recommendedSalaryRange}
                              </p>
                            </motion.div>
                          )}

                          {/* Factors Affecting Salary */}
                          {Array.isArray(finalAnalysisResults?.salaryAnalysis?.factorsAffectingSalary) && finalAnalysisResults.salaryAnalysis.factorsAffectingSalary.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                              className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20"
                            >
                              <h4 className="font-semibold text-white mb-3">Factors Affecting Salary</h4>
                              <div className="space-y-2">
                                {finalAnalysisResults.salaryAnalysis.factorsAffectingSalary.map((factor: string, index: number) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                    <span className="text-gray-300 text-sm">{factor}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}

                          {/* Negotiation Tips */}
                          {Array.isArray(finalAnalysisResults?.salaryAnalysis?.negotiationTips) && finalAnalysisResults.salaryAnalysis.negotiationTips.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 }}
                              className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/20"
                            >
                              <h4 className="font-semibold text-white mb-3">Negotiation Tips</h4>
                              <div className="space-y-2">
                                {finalAnalysisResults.salaryAnalysis.negotiationTips.map((tip: string, index: number) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                                    <span className="text-gray-300 text-sm">{tip}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Career Path */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="glass-card border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:from-blue-500/15 hover:to-blue-600/10 transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <Target className="h-6 w-6 text-blue-400" />
                            </div>
                            <CardTitle className="text-blue-400 text-xl">Career Path</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Your career progression roadmap
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Current Position */}
                          {finalAnalysisResults?.careerPath?.currentPosition && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20"
                            >
                              <h4 className="font-semibold text-white mb-2">Current Position</h4>
                              <p className="text-blue-400 font-medium">
                                {finalAnalysisResults.careerPath.currentPosition}
                              </p>
                            </motion.div>
                          )}

                          {/* Next Career Steps */}
                          {Array.isArray(finalAnalysisResults?.careerPath?.nextCareerSteps) && finalAnalysisResults.careerPath.nextCareerSteps.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 }}
                              className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20"
                            >
                              <h4 className="font-semibold text-white mb-3">Next Career Steps</h4>
                              <div className="space-y-3">
                                {finalAnalysisResults.careerPath.nextCareerSteps.map((career: any, index: number) => (
                                  <div key={index} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-400/20 border border-blue-400/30 flex items-center justify-center">
                                      <span className="text-blue-400 text-xs font-bold">{career.step}</span>
                                    </div>
                                    <div>
                                      <p className="text-white font-medium text-sm">{career.title}</p>
                                      <p className="text-gray-300 text-xs">{career.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Skill Gaps */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Card className="glass-card border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:from-orange-500/15 hover:to-orange-600/10 transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                              <AlertTriangle className="h-6 w-6 text-orange-400" />
                            </div>
                            <CardTitle className="text-orange-400 text-xl">Skill Gaps to Address</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Skills needed for career advancement
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.isArray(finalAnalysisResults?.careerPath?.skillGaps) && finalAnalysisResults.careerPath.skillGaps.length > 0 ? 
                            finalAnalysisResults.careerPath.skillGaps.map((skill: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (index * 0.1) }}
                                className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-400/20 hover:bg-orange-500/15 transition-colors"
                              >
                                <div className="flex-shrink-0 w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center mt-0.5">
                                  <span className="text-orange-400 text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-white text-sm leading-relaxed">{skill}</p>
                                </div>
                              </motion.div>
                            )) : 
                            <div className="text-center py-8">
                              <div className="text-gray-400 text-sm">No skill gaps analysis available from Claude</div>
                            </div>
                          }
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Timeline */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="glass-card border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:from-green-500/15 hover:to-green-600/10 transition-all duration-300">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <Clock className="h-6 w-6 text-green-400" />
                            </div>
                            <CardTitle className="text-green-400 text-xl">Career Timeline</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Expected timeline for career progression
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {finalAnalysisResults?.careerPath?.timeline && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.6 }}
                              className="p-3 rounded-lg bg-green-500/10 border border-green-400/20"
                            >
                              <div className="text-center">
                                <div className="text-3xl font-bold text-green-400 mb-2">
                                  {finalAnalysisResults.careerPath.timeline}
                                </div>
                                <p className="text-gray-300 text-sm">
                                  for promotion with skill development
                                </p>
                              </div>
                            </motion.div>
                          )}
                          
                          {finalAnalysisResults?.careerPath?.timelineDetails && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.7 }}
                              className="p-3 rounded-lg bg-green-500/10 border border-green-400/20"
                            >
                              <h4 className="font-semibold text-white mb-2">Timeline Details</h4>
                              <p className="text-gray-300 text-sm">
                                {finalAnalysisResults.careerPath.timelineDetails}
                              </p>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
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
                        onClick={() => {
                          // Store resume data in localStorage for the builder
                          if (resumeData) {
                            localStorage.setItem('resumeData', JSON.stringify(resumeData));
                            router.push('/resume-builder/build');
                          }
                        }}
                      >
                        <FileText className="h-6 w-6 mb-2" />
                        <span>Build New Resume</span>
                        <span className="text-xs opacity-80">AI-powered resume builder</span>
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
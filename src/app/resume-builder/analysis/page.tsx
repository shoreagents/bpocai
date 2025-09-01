'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/toast';
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
  Users,
  User,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import LoadingScreen from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { getFromLocalStorage, cleanupLocalStorageAfterSave } from '@/lib/utils';
import { getSessionToken } from '@/lib/auth-helpers';
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
  const handleViewProfile = async () => {
    try {
      const token = await getSessionToken();
      if (!token) {
        router.push('/resume-builder/build');
        return;
      }
      const res = await fetch('/api/user/saved-resumes', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      });
      const text = await res.text();
      let data: any = null; try { data = JSON.parse(text); } catch {}
      if (res.ok && data?.success && data?.hasSavedResume && data?.resumeSlug) {
        router.push(`/${data.resumeSlug}`);
      } else {
        toast.info('No saved resume found. Save your resume to profile first.');
        router.push('/resume-builder/build');
      }
    } catch {
      router.push('/resume-builder/build');
    }
  };
  const { user } = useAuth();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [mappedResumeData, setMappedResumeData] = useState<any>(null);
  const [aggregatedResumeData, setAggregatedResumeData] = useState<any>(null);
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

  // Aggregate data across all files for robust Overview tab fallbacks
  useEffect(() => {
    if (!resumeData || !Array.isArray(resumeData.files)) {
      setAggregatedResumeData(null);
      return;
    }

    try {
      const allSkills: string[] = [];
      const allExperience: any[] = [];
      const allEducation: any[] = [];

      for (const file of resumeData.files) {
        const data = file?.data;
        if (!data) continue;

        if (Array.isArray(data.skills)) {
          for (const s of data.skills) {
            if (typeof s === 'string') allSkills.push(s);
          }
        }

        if (Array.isArray(data.experience)) {
          for (const e of data.experience) {
            allExperience.push(e);
          }
        }

        if (Array.isArray(data.education)) {
          for (const ed of data.education) {
            allEducation.push(ed);
          }
        }
      }

      // Deduplicate skills (case-insensitive)
      const dedupedSkills = Array.from(
        new Set(
          allSkills
            .map((s) => (typeof s === 'string' ? s.trim() : s))
            .filter(Boolean)
            .map((s) => (typeof s === 'string' ? s.toLowerCase() : s))
        )
      );

      setAggregatedResumeData({
        skills: dedupedSkills,
        experience: allExperience,
        education: allEducation,
      });
    } catch (e) {
      console.warn('⚠️ Failed to aggregate resume data for overview fallback:', e);
      setAggregatedResumeData(null);
    }
  }, [resumeData]);

  useEffect(() => {
    const init = async () => {
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

      // Try to load existing analysis from DB first
      try {
        const token = await getSessionToken();
        if (token) {
          const url = `/api/user/analysis-results${sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : ''}`;
          const res = await fetch(url, {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store'
          });
          if (res.ok) {
            const data = await res.json();
            const hasNewUpload = (uploadedFiles && uploadedFiles.length > 0) || (processedFiles && processedFiles.length > 0);
            if (data.found && data.analysis && !hasNewUpload) {
              console.log('✅ Loaded existing analysis from DB');
              setAnalysisResults(data.analysis);
              setIsAnalyzing(false);
              setAnalysisComplete(true);
              // Populate overview fallbacks from DB snapshots if present
              const prof = data.analysis.candidateProfile;
              const skills = data.analysis.skillsSnapshot;
              const exp = data.analysis.experienceSnapshot;
              const edu = data.analysis.educationSnapshot;
              if (prof || skills || exp || edu) {
                setAggregatedResumeData({
                  skills: Array.isArray(skills) ? skills : [],
                  experience: Array.isArray(exp) ? exp : [],
                  education: Array.isArray(edu) ? edu : [],
                });
                // If mapped missing, set minimal mapped fields from profile
                setMappedResumeData((prev: any) => ({
                  ...(prev || {}),
                  name: (prev?.name ?? prof?.name) || prev?.name,
                  email: (prev?.email ?? prof?.email) || prev?.email,
                  phone: (prev?.phone ?? prof?.phone) || prev?.phone,
                  location: (prev?.location ?? prof?.location) || prev?.location,
                }));
                  // Ensure resumeData is available for Generate New Resume
                  setResumeData((prev: any) => {
                    if (prev) return prev;
                    return {
                      name: prof?.name,
                      email: prof?.email,
                      phone: prof?.phone,
                      location: prof?.location,
                      summary: data.analysis.improvedSummary || '',
                      skills: Array.isArray(skills) ? skills : [],
                      experience: Array.isArray(exp) ? exp : [],
                      education: Array.isArray(edu) ? edu : [],
                    };
                  });
              }
              return; // Skip running analysis again
            }
          }
        }
      } catch (e) {
        console.warn('⚠️ Failed to preload analysis from DB:', e);
      }

      // Start real AI analysis process (force fresh run after reupload)
      performAIAnalysis(sessionId, uploadedFiles, portfolioLinks, processedFiles);
    };

    init();

    // Cleanup function
    return () => {
      // Cleanup if needed
    };
  }, [router]);

  // Use real analysis results from Claude API or show loading state
  const finalAnalysisResults = analysisResults;

  // Auto-improve summary when analysis is complete and summary is available
  useEffect(() => {
    if (analysisComplete && finalAnalysisResults?.improvedSummary && !improvedSummary && !isImprovingSummary) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        setImprovedSummary(finalAnalysisResults.improvedSummary);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [analysisComplete, finalAnalysisResults?.improvedSummary, improvedSummary, isImprovingSummary]);

  // Perform AI analysis using Claude API
  const performAIAnalysis = async (sessionId: string, uploadedFiles: any[], portfolioLinks: any[], processedFiles: any[]) => {
    try {
      // Start with 0% and simulate progress
      setProgressValue(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgressValue(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return prev;
          }
          return Math.min(prev + Math.random() * 8, 85);
        });
      }, 600);

      // Get processed resumes from localStorage
      const processedResumes = getFromLocalStorage('bpoc_processed_resumes', []);
      
      if (processedResumes.length === 0) {
        throw new Error('No processed resume data found. Please go back and process your files first.');
      }

      // Use ALL processed files (resumes and certificates)
      console.log('🔍 DEBUG: All processed files from localStorage:', processedResumes);
      console.log('🔍 DEBUG: Number of processed files:', processedResumes.length);
      
      // Combine all processed files into a comprehensive dataset
      const combinedResumeData = {
        files: processedResumes.map((file, index) => ({
          fileName: uploadedFiles[index]?.name || `File ${index + 1}`,
          fileType: uploadedFiles[index]?.type || 'unknown',
          data: file
        })),
        totalFiles: processedResumes.length,
        fileTypes: uploadedFiles.map(file => file.type),
        fileNames: uploadedFiles.map(file => file.name)
      };
      
      console.log('🔍 DEBUG: Combined resume data structure:', combinedResumeData);
      
      // Build a merged mapped view across ALL processed files so multi-page/multi-file data shows up
      const mappedPerFile = processedResumes.map((file) => mapResumeData(file));
      const mergeUnique = (arrA: any[] = [], arrB: any[] = []) => {
        const merged = [...(Array.isArray(arrA) ? arrA : []), ...(Array.isArray(arrB) ? arrB : [])];
        const seen = new Set<string>();
        const result: any[] = [];
        for (const item of merged) {
          const key = typeof item === 'string' ? item.toLowerCase() : JSON.stringify(item);
          if (!seen.has(key)) { seen.add(key); result.push(item); }
        }
        return result;
      };
      const pickLonger = (a?: string | null, b?: string | null) => {
        const aa = a || '';
        const bb = b || '';
        return bb.length > aa.length ? bb : aa;
      };

      const mergedMapped = mappedPerFile.reduce((acc: any, curr: any) => {
        return {
          name: acc.name || curr.name || null,
          email: acc.email || curr.email || null,
          phone: acc.phone || curr.phone || null,
          location: acc.location || curr.location || null,
          summary: pickLonger(acc.summary, curr.summary) || null,
          skills: (() => {
            const a = acc.skills || {};
            const c = curr.skills || {};
            return {
              technical: mergeUnique(a.technical, c.technical),
              soft_skills: mergeUnique(a.soft_skills, c.soft_skills),
              tools: mergeUnique(a.tools, c.tools),
              languages: mergeUnique(a.languages, c.languages)
            };
          })(),
          experience: mergeUnique(acc.experience, curr.experience),
          education: mergeUnique(acc.education, curr.education)
        };
      }, {} as any);

      console.log('🔍 DEBUG: Merged mapped data for UI (all files/pages):', mergedMapped);

      setResumeData(combinedResumeData); // Store combined data for Claude
      setMappedResumeData(mergedMapped); // Store merged data for UI display
      const portfolioData = portfolioLinks.map(link => ({
        url: link.url,
        type: link.type,
        title: link.title
      }));

      const token = await getSessionToken();
      const analysisResponse = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          resumeData: combinedResumeData, // Send all files
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

      // Set analysis results and complete
      setProgressValue(100);
      setAnalysisResults(analysisData.analysis);
      
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
        
        // Clean up localStorage after analysis is complete
        // Note: We keep the data for now since user might want to generate resume
        // Cleanup will happen when they save the generated resume
        console.log('✅ Analysis complete - data ready for resume generation');
      }, 1000);

    } catch (error) {
      console.error('AI Analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Analysis failed');
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }
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

  const getScoreLevel = () => {
    const score = finalAnalysisResults?.overallScore || 0;
    if (score >= 90) {
      return {
        level: 'Excellent',
        bgColor: 'bg-green-500/20',
        color: 'text-green-400',
        borderColor: 'border-green-400/30'
      };
    } else if (score >= 80) {
      return {
        level: 'Very Good',
        bgColor: 'bg-blue-500/20',
        color: 'text-blue-400',
        borderColor: 'border-blue-400/30'
      };
    } else if (score >= 70) {
      return {
        level: 'Good',
        bgColor: 'bg-yellow-500/20',
        color: 'text-yellow-400',
        borderColor: 'border-yellow-400/30'
      };
    } else if (score >= 60) {
      return {
        level: 'Fair',
        bgColor: 'bg-orange-500/20',
        color: 'text-orange-400',
        borderColor: 'border-orange-400/30'
      };
    } else {
      return {
        level: 'Needs Improvement',
        bgColor: 'bg-red-500/20',
        color: 'text-red-400',
        borderColor: 'border-red-400/30'
      };
    }
  };

  // Function to improve professional summary using Claude API
  const improveSummary = async () => {
    if (!mappedResumeData?.summary || isImprovingSummary) return;

    setIsImprovingSummary(true);
    try {
      // Use the improved summary from the main analysis results
      if (finalAnalysisResults?.improvedSummary) {
        setImprovedSummary(finalAnalysisResults.improvedSummary);
        console.log('✅ Summary improved successfully');
      } else {
        console.error('No improved summary available from analysis');
      }
    } catch (error) {
      console.error('Error improving summary:', error);
    } finally {
      setIsImprovingSummary(false);
    }
  };

  // Function to cleanup localStorage when user completes the workflow
  const cleanupWorkflowData = () => {
    console.log('🧹 Cleaning up workflow data from localStorage...');
    
    try {
      // Remove workflow-specific data after completion
      const keysToRemove = [
        'bpoc_session_id',        // Session complete
        'bpoc_uploaded_files',    // Files processed
        'bpoc_portfolio_links',   // Links processed
        'bpoc_processed_files',   // Files processed
        'bpoc_processed_resumes'  // Analysis complete
      ];
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`✅ Removed workflow data: ${key}`);
        }
      });
      
      console.log('🧹 Workflow cleanup completed');
    } catch (error) {
      console.error('❌ Error during workflow cleanup:', error);
    }
  };

  // Auto-cleanup when user navigates away from analysis page
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (analysisComplete) {
        cleanupWorkflowData();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [analysisComplete]);

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
      <>
        <Header />
        <LoadingScreen 
          title="Analyzing Your Resume"
          subtitle="Claude AI is processing your resume data..."
          progressValue={progressValue}
          showProgress={true}
          showStatusIndicators={true}
        />
      </>
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
    <div className="min-h-screen cyber-grid overflow-hidden">
      <Header />
      
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="mr-4 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-gray-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Leave Analysis Results?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      Are you sure you want to go back? You'll lose access to your analysis results.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => router.back()}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Yes, Go Back
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="flex items-center">
                <Brain className="h-12 w-12 text-cyan-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">AI Analysis Results</h1>
                  <p className="text-gray-400">Comprehensive candidate intelligence report</p>
                </div>
              </div>
            </div>
            
            {analysisComplete && (
              <div className="flex gap-3" />
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




              {/* Analysis Tabs */}
              <Tabs defaultValue="overview" className="space-y-8">
                <div className="flex justify-center">
                  <TabsList className="glass-card border-white/20 shadow-lg shadow-white/10 p-1 bg-black/20">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-blue-500/20 data-[state=active]:text-cyan-400 data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/20">
                      <Target className="h-4 w-4 mr-2" />
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="strengths" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-green-400 data-[state=active]:shadow-lg data-[state=active]:shadow-green-500/20">
                      <Trophy className="h-4 w-4 mr-2" />
                      Strengths
                    </TabsTrigger>
                    <TabsTrigger value="improvements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-orange-400 data-[state=active]:shadow-lg data-[state=active]:shadow-orange-500/20">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Improvements
                    </TabsTrigger>
                    <TabsTrigger value="salary" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-400 data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Salary & Career
                    </TabsTrigger>
                  </TabsList>
                </div>

                                                                  <TabsContent value="overview" className="space-y-8">
                   {/* Header Section */}
                   <div className="text-center mb-8">
                     <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.1 }}
                     >
                       <h2 className="text-3xl font-bold text-white mb-4">Resume Overview</h2>
                       <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                         Comprehensive breakdown of your resume sections and key information
                       </p>
                     </motion.div>
                   </div>

                   {/* Three Cards Layout */}
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                     {/* Overall Score Card */}
                     <Card className="glass-card border-cyan-500/30 shadow-lg shadow-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 h-full flex flex-col">
                       <CardContent className="p-6 flex-1 flex flex-col justify-center">
                         <div className="text-center">
                           <div className="relative w-48 h-48 mx-auto mb-6">
                             <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
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
                                 <div className="text-5xl font-bold gradient-text mb-2">
                                   {finalAnalysisResults?.overallScore ?? 'N/A'}
                                 </div>
                                 <div className="text-lg text-gray-400">Overall Score</div>
                               </div>
                             </div>
                           </div>
                           
                           {/* Score Level Badge */}
                           <Badge className={`${getScoreLevel().bgColor} ${getScoreLevel().color} ${getScoreLevel().borderColor} text-base px-4 py-2`}>
                             {getScoreLevel().level}
                           </Badge>
                         </div>
                       </CardContent>
                     </Card>

                     {/* Candidate Profile Card */}
                     <Card className="glass-card border-white/20 shadow-lg shadow-white/10 bg-gradient-to-br from-white/5 to-gray-500/5">
                       <CardContent className="p-6">
                         <div className="text-center lg:text-left mb-4">
                           <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                             <Users className="h-5 w-5 text-cyan-400" />
                             Candidate Profile
                           </h3>
                         </div>
                         
                         <div className="space-y-3">
                           <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
                             <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                             <div>
                               <p className="text-xs text-gray-400">Name</p>
                               <p className="text-white font-medium text-sm">
                                 {mappedResumeData?.name || 'No name found'}
                               </p>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
                             <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                             <div>
                               <p className="text-xs text-gray-400">Email</p>
                               <p className="text-white font-medium text-sm">
                                 {mappedResumeData?.email || 'No email found'}
                               </p>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
                             <div className="w-3 h-3 rounded-full bg-green-400"></div>
                             <div>
                               <p className="text-xs text-gray-400">Phone</p>
                               <p className="text-white font-medium text-sm">
                                 {mappedResumeData?.phone || 'No phone found'}
                               </p>
                             </div>
                           </div>
                           
                           <div className="flex items-center gap-3 p-3 rounded-lg border border-white/10">
                             <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                             <div>
                               <p className="text-xs text-gray-400">Location</p>
                               <p className="text-white font-medium text-sm">
                                 {mappedResumeData?.location || 'No location found'}
                               </p>
                             </div>
                           </div>
                         </div>
                       </CardContent>
                     </Card>
                     
                     {/* Additional Links Card */}
                     <Card className="glass-card border-pink-500/30 shadow-lg shadow-pink-500/20 bg-gradient-to-br from-pink-500/5 to-purple-500/5">
                       <CardContent className="p-6">
                         <div className="text-center lg:text-left mb-4">
                           <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                             <Link2 className="h-5 w-5 text-pink-400" />
                             Additional Links
                           </h3>
                         </div>
                         
                         <div className="space-y-3">
                           {analysisData?.portfolioLinks?.length > 0 ? (
                             analysisData.portfolioLinks.map((link, index) => {
                               const getLinkIcon = (type: string) => {
                                 switch (type.toLowerCase()) {
                                   case 'linkedin': return '💼';
                                   case 'github': return '🐙';
                                   case 'behance': return '🎨';
                                   case 'dribbble': return '🏀';
                                   case 'website': return '🌐';
                                   default: return '🔗';
                                 }
                               };

                               return (
                                 <motion.div 
                                   key={index} 
                                   className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:border-pink-400/30 transition-all duration-300"
                                   initial={{ opacity: 0, x: -20 }}
                                   animate={{ opacity: 1, x: 0 }}
                                   transition={{ delay: index * 0.1 }}
                                 >
                                   <div className="w-3 h-3 rounded-full bg-pink-400 flex-shrink-0"></div>
                                   <div className="flex-1">
                                     <p className="text-xs text-gray-400 capitalize font-medium">{link.type}</p>
                                     <a 
                                       href={link.url} 
                                       target="_blank" 
                                       rel="noopener noreferrer"
                                       className="text-white font-medium text-sm hover:text-pink-400 transition-colors"
                                     >
                                       {link.title || link.url}
                                     </a>
                                   </div>
                                 </motion.div>
                               );
                             })
                           ) : (
                             <motion.div 
                               className="flex items-center gap-3 p-3 rounded-lg border border-white/10"
                               initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                             >
                               <div className="w-3 h-3 rounded-full bg-gray-500 flex-shrink-0"></div>
                               <div>
                                 <p className="text-xs text-gray-400 font-medium">Portfolio</p>
                                 <p className="text-white font-medium text-sm">No additional links added</p>
                               </div>
                             </motion.div>
                           )}
                         </div>
                       </CardContent>
                     </Card>
                   </div>
                   
                   {/* First Row - 3 Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                      {/* Skills Section */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Card className="glass-card border-cyan-500/30 shadow-lg shadow-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 h-80 flex flex-col">
                          <CardHeader className="pb-4 flex-shrink-0">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Star className="h-5 w-5 text-cyan-400" />
                              </div>
                              <CardTitle className="text-cyan-400 text-lg">Skills & Competencies</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34, 211, 238, 0.3) transparent' }}>
                            <div className="flex flex-wrap gap-2">
                              {(() => {
                                const skills = Array.isArray(mappedResumeData?.skills) && mappedResumeData.skills.length > 0
                                  ? mappedResumeData.skills
                                  : Array.isArray(aggregatedResumeData?.skills) && aggregatedResumeData.skills.length > 0
                                    ? aggregatedResumeData.skills
                                    : [];
                                return skills.length > 0 ? skills.map((skill: string, index: number) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <Badge 
                                      variant="outline" 
                                      className="border-cyan-400/30 text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 transition-colors px-3 py-1 text-sm max-w-full break-words"
                                    >
                                      {skill}
                                    </Badge>
                                  </motion.div>
                                )) : (
                                  <div className="text-center py-8 w-full">
                                    <div className="text-gray-400 text-sm">No skills data available</div>
                                  </div>
                                );
                              })()}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Professional Summary */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Card className="glass-card border-purple-500/30 shadow-lg shadow-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 h-80 flex flex-col">
                          <CardHeader className="pb-4 flex-shrink-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                  <FileText className="h-5 w-5 text-purple-400" />
                                </div>
                                <CardTitle className="text-purple-400 text-lg">Professional Summary</CardTitle>
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
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168, 85, 247, 0.3) transparent' }}>
                            {improvedSummary ? (
                              <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                  <Sparkles className="h-4 w-4 text-green-400" />
                                  <span className="text-sm text-green-400 font-medium">AI Improved</span>
                                </div>
                                <p className="text-gray-300 leading-relaxed text-sm">
                                  {improvedSummary}
                                </p>
                              </div>
                            ) : (
                              <div className="py-4">
                                <p className="text-gray-300 leading-relaxed text-sm">
                                  {mappedResumeData?.summary || 'No professional summary found'}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Work Experience */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Card className="glass-card border-green-500/30 shadow-lg shadow-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 h-80 flex flex-col">
                          <CardHeader className="pb-4 flex-shrink-0">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-green-500/20 rounded-lg">
                                <Trophy className="h-5 w-5 text-green-400" />
                              </div>
                              <CardTitle className="text-green-400 text-lg">Work Experience</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(34, 197, 94, 0.3) transparent' }}>
                            <div className="space-y-4">
                              {(() => {
                                const experiences = Array.isArray(mappedResumeData?.experience) && mappedResumeData.experience.length > 0
                                  ? mappedResumeData.experience
                                  : Array.isArray(aggregatedResumeData?.experience) && aggregatedResumeData.experience.length > 0
                                    ? aggregatedResumeData.experience
                                    : [];
                                return experiences.length > 0 ? experiences.map((exp: any, index: number) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (index + 1) * 0.1 }}
                                    className="p-4 glass-card rounded-lg border border-white/10 hover:border-green-400/30 transition-all duration-300"
                                  >
                                    <h4 className="font-semibold text-white text-base">{exp.position || exp.title || 'Position'}</h4>
                                    <p className="text-green-400 text-sm mb-2">{exp.company || exp.employer || 'Company'} • {exp.duration || exp.period || 'Duration'}</p>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                      {exp.description || exp.responsibilities?.join(', ') || 'No description available'}
                                    </p>
                                  </motion.div>
                                )) : (
                                  <div className="text-center py-12">
                                    <div className="text-gray-400 text-sm">No work experience data available</div>
                                  </div>
                                );
                              })()}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Second Row - 2 Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Education */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <Card className="glass-card border-yellow-500/30 shadow-lg shadow-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 h-full">
                          <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <Target className="h-5 w-5 text-yellow-400" />
                              </div>
                              <CardTitle className="text-yellow-400 text-lg">Education</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {(() => {
                                const education = Array.isArray(mappedResumeData?.education) && mappedResumeData.education.length > 0
                                  ? mappedResumeData.education
                                  : Array.isArray(aggregatedResumeData?.education) && aggregatedResumeData.education.length > 0
                                    ? aggregatedResumeData.education
                                    : [];
                                return education.length > 0 ? education.map((edu: any, index: number) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (index + 1) * 0.1 }}
                                    className="p-4 glass-card rounded-lg border border-white/10 hover:border-yellow-400/30 transition-all duration-300"
                                  >
                                    <h4 className="font-semibold text-white text-base">{edu.degree || edu.title || 'Degree'}</h4>
                                    <p className="text-yellow-400 text-sm mb-2">
                                      {edu.institution || edu.school || edu.university || 'Institution'}
                                      {edu.year || edu.graduationYear || edu.yearCompleted || edu.duration ? 
                                        ` • ${edu.year || edu.graduationYear || edu.yearCompleted || edu.duration}` : 
                                        ' • Year not specified'
                                      }
                                    </p>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                      {edu.details || edu.description || edu.honors || edu.gpa ? 
                                        `${edu.details || edu.description || ''} ${edu.honors ? `• ${edu.honors}` : ''} ${edu.gpa ? `• GPA: ${edu.gpa}` : ''}`.trim() : 
                                        'No additional details available'
                                      }
                                    </p>
                                  </motion.div>
                                )) : (
                                  <div className="text-center py-12">
                                    <div className="text-gray-400 text-sm">No education data available</div>
                                  </div>
                                );
                              })()}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      {/* Portfolio Links */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Card className="glass-card border-blue-500/30 shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 h-full">
                          <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Link2 className="h-5 w-5 text-blue-400" />
                              </div>
                              <CardTitle className="text-blue-400 text-lg">Additional Links</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {Array.isArray(analysisData?.portfolioLinks) && analysisData.portfolioLinks.length > 0 ? 
                                analysisData.portfolioLinks.slice(0, 4).map((link: any, index: number) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + (index * 0.1) }}
                                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-400/20 hover:bg-blue-500/15 transition-colors"
                                  >
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                                      <Link2 className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-white text-sm font-medium truncate">{link.title || link.name}</p>
                                      <p className="text-blue-400 text-xs truncate">{link.url}</p>
                                    </div>
                                  </motion.div>
                                )) : 
                                                              <div className="text-center py-8">
                                <div className="text-gray-400 text-sm">No additional links available</div>
                              </div>
                              }
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
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

                    {/* First Row - 3 Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    
                    {/* Core Professional Strengths */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="glass-card border-green-500/30 shadow-lg shadow-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 h-full">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <Target className="h-5 w-5 text-green-400" />
                            </div>
                            <CardTitle className="text-green-400 text-lg">Core Professional Strengths</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Your strongest professional attributes that set you apart
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.isArray(finalAnalysisResults?.strengthsAnalysis?.coreStrengths) && finalAnalysisResults.strengthsAnalysis.coreStrengths.length > 0 ? 
                            finalAnalysisResults.strengthsAnalysis.coreStrengths.slice(0, 3).map((strength: string, index: number) => (
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
                      <Card className="glass-card border-blue-500/30 shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 h-full">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <Zap className="h-5 w-5 text-blue-400" />
                            </div>
                            <CardTitle className="text-blue-400 text-lg">Technical Strengths</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Technical skills that make you valuable for BPO roles
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.isArray(finalAnalysisResults?.strengthsAnalysis?.technicalStrengths) && finalAnalysisResults.strengthsAnalysis.technicalStrengths.length > 0 ? 
                            finalAnalysisResults.strengthsAnalysis.technicalStrengths.slice(0, 3).map((strength: string, index: number) => (
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
                      <Card className="glass-card border-purple-500/30 shadow-lg shadow-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 h-full">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <Users className="h-5 w-5 text-purple-400" />
                            </div>
                            <CardTitle className="text-purple-400 text-lg">Soft Skills</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Interpersonal skills that enhance your professional value
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.isArray(finalAnalysisResults?.strengthsAnalysis?.softSkills) && finalAnalysisResults.strengthsAnalysis.softSkills.length > 0 ? 
                            finalAnalysisResults.strengthsAnalysis.softSkills.slice(0, 3).map((skill: string, index: number) => (
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
                  </div>

                  {/* Second Row - 2 Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Notable Achievements */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="glass-card border-yellow-500/30 shadow-lg shadow-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 h-full">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                              <Trophy className="h-5 w-5 text-yellow-400" />
                            </div>
                            <CardTitle className="text-yellow-400 text-lg">Notable Achievements</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Key accomplishments that demonstrate your value
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.isArray(finalAnalysisResults?.strengthsAnalysis?.achievements) && finalAnalysisResults.strengthsAnalysis.achievements.length > 0 ? 
                            finalAnalysisResults.strengthsAnalysis.achievements.slice(0, 4).map((achievement: string, index: number) => (
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
                      <Card className="glass-card border-cyan-500/30 shadow-lg shadow-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 h-full">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-cyan-400" />
                            </div>
                            <CardTitle className="text-cyan-400 text-lg">Market Advantages</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Specific advantages for the BPO industry
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.isArray(finalAnalysisResults?.strengthsAnalysis?.marketAdvantage) && finalAnalysisResults.strengthsAnalysis.marketAdvantage.length > 0 ? 
                            finalAnalysisResults.strengthsAnalysis.marketAdvantage.slice(0, 4).map((advantage: string, index: number) => (
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
                  </div>

                  {/* Third Row - Key Strengths Summary */}
                  <div className="mt-8">
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Card className="glass-card border-green-500/30 shadow-lg shadow-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <Star className="h-5 w-5 text-green-400" />
                            </div>
                            <CardTitle className="text-green-400 text-lg">Key Strengths Summary</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Your most valuable professional attributes for career success
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                   {/* First Row - 2 Cards */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                     
                     {/* Critical Issues to Address */}
                     <motion.div
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.2 }}
                     >
                       <Card className="glass-card border-red-500/30 shadow-lg shadow-red-500/20 bg-gradient-to-br from-red-500/5 to-pink-500/5 h-[28rem] flex flex-col">
                         <CardHeader className="pb-4 flex-shrink-0">
                           <div className="flex items-center gap-3">
                             <div className="p-2 bg-red-500/20 rounded-lg">
                               <AlertTriangle className="h-5 w-5 text-red-400" />
                             </div>
                             <CardTitle className="text-red-400 text-lg">Critical Issues to Address</CardTitle>
                           </div>
                           <CardDescription className="text-gray-300 text-sm">
                             High-priority improvements that will significantly boost your resume score
                           </CardDescription>
                         </CardHeader>
                         <CardContent className="flex-1 space-y-3">
                           {Array.isArray(finalAnalysisResults?.improvements) && finalAnalysisResults.improvements.length > 0 ? 
                             finalAnalysisResults.improvements.map((improvement: string, index: number) => (
                               <motion.div
                                 key={index}
                                 initial={{ opacity: 0, x: -20 }}
                                 animate={{ opacity: 1, x: 0 }}
                                 transition={{ delay: 0.3 + (index * 0.05) }}
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
                             <div className="text-center py-10">
                               <div className="text-gray-400 text-sm">No improvement suggestions available</div>
                             </div>
                           }
                         </CardContent>
                       </Card>
                     </motion.div>

                     {/* Section Analysis */}
                     <motion.div
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.3 }}
                     >
                       <Card className="glass-card border-blue-500/30 shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 h-[28rem] flex flex-col">
                         <CardHeader className="pb-4 flex-shrink-0">
                           <div className="flex items-center gap-3">
                             <div className="p-2 bg-blue-500/20 rounded-lg">
                               <TrendingUp className="h-5 w-5 text-blue-400" />
                             </div>
                             <CardTitle className="text-blue-400 text-lg">Section Analysis</CardTitle>
                           </div>
                           <CardDescription className="text-gray-300 text-sm">
                             Detailed breakdown of each resume section with scores and recommendations
                           </CardDescription>
                         </CardHeader>
                         <CardContent className="flex-1 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(59, 130, 246, 0.3) transparent' }}>
                           {/* Contact Section */}
                           {finalAnalysisResults?.sectionAnalysis?.contact && (
                             <motion.div
                               initial={{ opacity: 0, x: -20 }}
                               animate={{ opacity: 1, x: 0 }}
                               transition={{ delay: 0.4 }}
                               className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/20"
                             >
                               <div className="flex items-center justify-between mb-3">
                                 <h4 className="font-semibold text-white text-sm">Contact Information</h4>
                                 <div className="text-lg font-bold text-green-400">
                                   {finalAnalysisResults.sectionAnalysis.contact.score}/100
                                 </div>
                               </div>
                               <div className="space-y-2">
                                 {finalAnalysisResults.sectionAnalysis.contact.reasons?.map((reason: string, idx: number) => (
                                   <p key={idx} className="text-gray-300 text-sm">• {reason}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.contact.issues?.map((issue: string, idx: number) => (
                                   <p key={idx} className="text-red-400 text-sm">⚠️ {issue}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.contact.improvements?.map((improvement: string, idx: number) => (
                                   <p key={idx} className="text-green-400 text-sm">💡 {improvement}</p>
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
                               className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/20"
                             >
                               <div className="flex items-center justify-between mb-3">
                                 <h4 className="font-semibold text-white text-sm">Professional Summary</h4>
                                 <div className="text-lg font-bold text-yellow-400">
                                   {finalAnalysisResults.sectionAnalysis.summary.score}/100
                                 </div>
                               </div>
                               <div className="space-y-2">
                                 {finalAnalysisResults.sectionAnalysis.summary.reasons?.map((reason: string, idx: number) => (
                                   <p key={idx} className="text-gray-300 text-sm">• {reason}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.summary.issues?.map((issue: string, idx: number) => (
                                   <p key={idx} className="text-red-400 text-sm">⚠️ {issue}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.summary.improvements?.map((improvement: string, idx: number) => (
                                   <p key={idx} className="text-green-400 text-sm">💡 {improvement}</p>
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
                               className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/20"
                             >
                               <div className="flex items-center justify-between mb-3">
                                 <h4 className="font-semibold text-white text-sm">Work Experience</h4>
                                 <div className="text-lg font-bold text-yellow-400">
                                   {finalAnalysisResults.sectionAnalysis.experience.score}/100
                                 </div>
                               </div>
                               <div className="space-y-2">
                                 {finalAnalysisResults.sectionAnalysis.experience.reasons?.map((reason: string, idx: number) => (
                                   <p key={idx} className="text-gray-300 text-sm">• {reason}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.experience.issues?.map((issue: string, idx: number) => (
                                   <p key={idx} className="text-red-400 text-sm">⚠️ {issue}</p>
                                 ))}
                                 {finalAnalysisResults.sectionAnalysis.experience.improvements?.map((improvement: string, idx: number) => (
                                   <p key={idx} className="text-green-400 text-sm">💡 {improvement}</p>
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
                               className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/20"
                             >
                               <div className="flex items-center justify-between mb-3">
                                 <h4 className="font-semibold text-white text-sm">Education</h4>
                                 <div className="text-lg font-bold text-green-400">
                                   {finalAnalysisResults.sectionAnalysis.education.score}/100
                                 </div>
                               </div>
                               <div className="space-y-2">
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
                                 <h4 className="font-semibold text-white text-sm">Skills</h4>
                                 <div className="text-lg font-bold text-yellow-400">
                                   {finalAnalysisResults.sectionAnalysis.skills.score}/100
                                 </div>
                               </div>
                               <div className="space-y-2">
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
                   </div>

                   {/* Second Row - Recommendations */}
                   <div className="mt-8">
                     <motion.div
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.4 }}
                     >
                       <Card className="glass-card border-green-500/30 shadow-lg shadow-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                         <CardHeader className="pb-4">
                           <div className="flex items-center gap-3">
                             <div className="p-2 bg-green-500/20 rounded-lg">
                               <CheckCircle className="h-5 w-5 text-green-400" />
                             </div>
                             <CardTitle className="text-green-400 text-lg">Actionable Recommendations</CardTitle>
                           </div>
                           <CardDescription className="text-gray-300 text-sm">
                             Specific steps to enhance your resume's effectiveness
                           </CardDescription>
                         </CardHeader>
                         <CardContent>
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                 <div className="text-gray-400 text-sm">No recommendations available</div>
                               </div>
                             }
                           </div>
                         </CardContent>
                       </Card>
                     </motion.div>
                   </div>
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

                  {/* First Row - 3 Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    
                    {/* Salary Analysis */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="glass-card border-purple-500/30 shadow-lg shadow-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5 h-[28rem] flex flex-col">
                        <CardHeader className="pb-4 flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-purple-400" />
                            </div>
                            <CardTitle className="text-purple-400 text-lg">Salary Analysis</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Market-based salary recommendations and factors
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168, 85, 247, 0.3) transparent' }}>
                          {/* Current Level */}
                          {finalAnalysisResults?.salaryAnalysis?.currentLevel && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                              className="p-4 rounded-lg bg-purple-500/10 border border-purple-400/20"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-white text-sm">Current Level</h4>
                                <Badge className="bg-purple-500/20 text-purple-400 border-purple-400/30">
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
                              className="p-4 rounded-lg bg-purple-500/10 border border-purple-400/20"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-white text-sm">Recommended Salary Range</h4>
                                <div className="text-lg font-bold text-purple-400">
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
                              className="p-4 rounded-lg bg-purple-500/10 border border-purple-400/20"
                            >
                              <h4 className="font-semibold text-white mb-3 text-sm">Factors Affecting Salary</h4>
                              <div className="space-y-3">
                                {finalAnalysisResults.salaryAnalysis.factorsAffectingSalary.map((factor: string, index: number) => (
                                  <div key={index} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
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
                              className="p-4 rounded-lg bg-purple-500/10 border border-purple-400/20"
                            >
                              <h4 className="font-semibold text-white mb-3 text-sm">Negotiation Tips</h4>
                              <div className="space-y-3">
                                {finalAnalysisResults.salaryAnalysis.negotiationTips.map((tip: string, index: number) => (
                                  <div key={index} className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
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
                      <Card className="glass-card border-blue-500/30 shadow-lg shadow-blue-500/20 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 h-[28rem] flex flex-col">
                        <CardHeader className="pb-4 flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <Target className="h-5 w-5 text-blue-400" />
                            </div>
                            <CardTitle className="text-blue-400 text-lg">Career Path</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Your career progression roadmap
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(59, 130, 246, 0.3) transparent' }}>
                          {/* Current Position */}
                          {finalAnalysisResults?.careerPath?.currentPosition && (
                            <motion.div
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 }}
                              className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/20"
                            >
                              <h4 className="font-semibold text-white mb-3 text-sm">Current Position</h4>
                              <p className="text-blue-400 font-medium text-sm">
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
                              className="p-4 rounded-lg bg-blue-500/10 border border-blue-400/20"
                            >
                              <h4 className="font-semibold text-white mb-3 text-sm">Next Career Steps</h4>
                              <div className="space-y-4">
                                {finalAnalysisResults.careerPath.nextCareerSteps.map((career: any, index: number) => (
                                  <div key={index} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-400/20 border border-blue-400/30 flex items-center justify-center">
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
                      <Card className="glass-card border-orange-500/30 shadow-lg shadow-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5 h-[28rem] flex flex-col">
                        <CardHeader className="pb-4 flex-shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-orange-400" />
                            </div>
                            <CardTitle className="text-orange-400 text-lg">Skill Gaps to Address</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Skills needed for career advancement
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(249, 115, 22, 0.3) transparent' }}>
                          {Array.isArray(finalAnalysisResults?.careerPath?.skillGaps) && finalAnalysisResults.careerPath.skillGaps.length > 0 ? 
                            finalAnalysisResults.careerPath.skillGaps.map((skill: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (index * 0.05) }}
                                className="flex items-start gap-4 p-4 rounded-lg bg-orange-500/10 border border-orange-400/20 hover:bg-orange-500/15 transition-colors"
                              >
                                <div className="flex-shrink-0 w-7 h-7 bg-orange-500/20 rounded-full flex items-center justify-center mt-0.5">
                                  <span className="text-orange-400 text-xs font-bold">{index + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-white text-sm leading-relaxed">{skill}</p>
                                </div>
                              </motion.div>
                            )) : 
                            <div className="text-center py-12">
                              <div className="text-gray-400 text-sm">No skill gaps analysis available</div>
                            </div>
                          }
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Second Row - 2 Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Timeline */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Card className="glass-card border-green-500/30 shadow-lg shadow-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5 h-full">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                              <Clock className="h-5 w-5 text-green-400" />
                            </div>
                            <CardTitle className="text-green-400 text-lg">Career Timeline</CardTitle>
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
                              <h4 className="font-semibold text-white mb-2 text-sm">Timeline Details</h4>
                              <p className="text-gray-300 text-sm">
                                {finalAnalysisResults.careerPath.timelineDetails}
                              </p>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Market Position */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Card className="glass-card border-cyan-500/30 shadow-lg shadow-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 h-full">
                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                              <TrendingUp className="h-5 w-5 text-cyan-400" />
                            </div>
                            <CardTitle className="text-cyan-400 text-lg">Market Position</CardTitle>
                          </div>
                          <CardDescription className="text-gray-300 text-sm">
                            Your competitive position in the job market
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20"
                          >
                            <h4 className="font-semibold text-white mb-2 text-sm">Competitive Analysis</h4>
                            <p className="text-gray-300 text-sm">
                              Based on your skills, experience, and market demand, you are positioned as a competitive candidate in the BPO industry.
                            </p>
                          </motion.div>
                          
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20"
                          >
                            <h4 className="font-semibold text-white mb-2 text-sm">Growth Potential</h4>
                            <p className="text-gray-300 text-sm">
                              With continued skill development and experience, you have strong potential for career advancement and salary growth.
                            </p>
                          </motion.div>
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
                <Card className="glass-card border-white/20 shadow-lg shadow-white/10">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gradient-text text-lg">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Next Steps (Step 3)
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Ready to take your career to the next level?
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <Button 
                          variant="outline" 
                          className="w-full border-purple-400/30 text-purple-400 hover:bg-purple-400/10 h-auto p-6 flex-col transition-all duration-300 hover:scale-105"
                          onClick={() => {
                            if (resumeData) {
                              localStorage.setItem('resumeData', JSON.stringify(resumeData));
                              cleanupWorkflowData();
                              router.push('/resume-builder/build');
                            }
                          }}
                        >
                          <FileText className="h-8 w-8 mb-3" />
                          <span className="font-semibold text-base">Generate New Improved Resume</span>
                          <span className="text-xs opacity-80 mt-1">AI-powered resume builder</span>
                        </Button>
                      </motion.div>
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
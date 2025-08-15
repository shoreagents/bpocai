'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Share2, 
  Eye, 
  Calendar,
  User,
  Building,
  GraduationCap,
  Award,
  Code,
  Star,
  Globe,
  Mail,
  Phone,
  MapPin,
  FileText,
  Pencil,
  Trash2,
  Guitar,
  Brain,
  Scale,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSessionToken } from '@/lib/auth-helpers';
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LoadingScreen from '@/components/ui/loading-screen';
import Header from '@/components/layout/Header';
import { PacmanLoader } from 'react-spinners';

interface SavedResume {
  id: string;
  slug: string;
  title: string;
  data: {
    content: any;
    template: any;
    sections: any[];
    headerInfo: any;
  };
  template: string;
  originalResumeId: string | null;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    fullName: string;
    avatarUrl: string;
  };
}

export default function SavedResumePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [resume, setResume] = useState<SavedResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [typingStats, setTypingStats] = useState<any | null>(null);
  const [typingLatest, setTypingLatest] = useState<any | null>(null);
  const [discStats, setDiscStats] = useState<any | null>(null);
  const [discLatest, setDiscLatest] = useState<any | null>(null);
  const [ultimateStats, setUltimateStats] = useState<any | null>(null);
  const [ultimateLatest, setUltimateLatest] = useState<any | null>(null);

  // Ensure global edit flag exists for any legacy template code expecting it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      if (typeof w.isEditMode === 'undefined') {
        w.isEditMode = false
      }
    }
  }, [])

  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/get-saved-resume/${slug}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load resume');
        }

        const data = await response.json();
        setResume(data.resume);
        // Determine ownership via Supabase client
        const { data: userData } = await supabase.auth.getUser()
        const currentUserId = userData?.user?.id
        setIsOwner(!!currentUserId && String(currentUserId) === String(data.resume?.userId || ''))
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError(err instanceof Error ? err.message : 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchResume();
    }
  }, [slug]);

  // Fetch AI analysis results (public by resume owner)
  useEffect(() => {
    const load = async () => {
      try {
        setAnalysisLoading(true)
        if (!resume?.userId) { setAnalysis(null); return }
        const res = await fetch(`/api/analysis-results/public/${resume.userId}`, { cache: 'no-store' })
        if (!res.ok) { setAnalysis(null); return }
        const data = await res.json()
        if (data?.found) setAnalysis(data.analysis); else setAnalysis(null)
      } catch (e) {
        setAnalysis(null)
      } finally {
        setAnalysisLoading(false)
      }
    }
    load()
  }, [resume?.userId]);

  // Fetch Career Games data (Typing Hero)
  useEffect(() => {
    (async () => {
      try {
        // Find resume owner userId from loaded resume
        if (!resume?.userId) return
        const res = await fetch(`/api/games/typing-hero/public/${resume.userId}`, { cache: 'no-store' })
        if (res.ok) {
          const data = await res.json()
          setTypingStats(data.stats || null)
          setTypingLatest(data.latestSession || null)
        }
        const dres = await fetch(`/api/games/disc-personality/public/${resume.userId}`, { cache: 'no-store' })
        if (dres.ok) {
          const d = await dres.json()
          setDiscStats(d.stats || null)
          setDiscLatest(d.latestSession || null)
        }
        const ures = await fetch(`/api/games/ultimate/public/${resume.userId}`, { cache: 'no-store' })
        if (ures.ok) {
          const u = await ures.json()
          setUltimateStats(u.stats || null)
          setUltimateLatest(u.latestSession || null)
        }
      } catch {}
    })()
  }, [resume?.userId])

  const exportToPDF = async () => {
    const element = document.getElementById('resume-content');
    if (!element) {
      alert('Resume content not found. Please try again.');
      return;
    }

    try {
      setExporting(true);
      console.log('Starting PDF export...');
      
      // Wait for any animations to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Wait for fonts to load
      await document.fonts.ready;
      
      console.log('Capturing resume content...');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight,
        foreignObjectRendering: false,
        removeContainer: false,
        logging: true,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('resume-content');
          if (clonedElement) {
            // Ensure proper styling for PDF
            clonedElement.style.transform = 'none';
            clonedElement.style.position = 'static';
            clonedElement.style.overflow = 'visible';
            clonedElement.style.width = '100%';
            clonedElement.style.height = 'auto';
            clonedElement.style.boxShadow = 'none';
            clonedElement.style.borderRadius = '0';
            clonedElement.style.backgroundColor = '#ffffff';
            
            // Remove any animations or transforms from all child elements
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el: any) => {
              el.style.transform = 'none';
              el.style.transition = 'none';
              el.style.animation = 'none';
            });
          }
        }
      });

      console.log('Canvas created:', canvas.width, 'x', canvas.height);

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log('PDF dimensions:', imgWidth, 'x', imgHeight, 'mm');
      
      // Add first page
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Add additional pages if content is longer than one page
      let heightLeft = imgHeight;
      let position = 0;
      
      while (heightLeft >= pageHeight) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${resume?.user.fullName.replace(/\s+/g, '-').toLowerCase()}-resume.pdf`;
      pdf.save(fileName);
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error generating PDF. Please try again. Error: ' + (error as Error).message);
    } finally {
      setExporting(false);
    }
  };

  const shareResume = async () => {
    const url = `${window.location.origin}/${slug}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: resume?.title || 'Resume',
          text: `Check out ${resume?.user.fullName}'s resume`,
          url: url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Resume URL copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        // Fallback to showing the URL
        alert(`Resume URL: ${url}`);
      }
    }
  };

  const editResume = async () => {
    try {
      // Put current resume content back to localStorage and go to builder
      if (resume?.data) {
        localStorage.setItem('resumeData', JSON.stringify(resume.data.content));
      }
      window.location.href = '/resume-builder/build';
    } catch (e) {}
  };

  const deleteResume = async () => {
    if (!confirm('Delete this resume? This action cannot be undone.')) return;
    try {
      setDeleting(true);
      const token = await getSessionToken();
      if (!token) {
        alert('Please log in to delete your resume.');
        setDeleting(false);
        return;
      }
      const res = await fetch(`/api/user/saved-resume/${slug}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to delete resume');
      }
      alert('Resume deleted');
      window.location.href = '/resume-builder';
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete resume');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Futuristic Space Background */}
        <div className="absolute inset-0">
          {/* Nebula Effect */}
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-cyan-900/20"></div>
          <div className="absolute inset-0 bg-gradient-radial from-blue-900/15 via-transparent to-pink-900/15"></div>
          
          {/* Starfield */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.3 + Math.random() * 0.7
                }}
              ></div>
            ))}
          </div>
          
          {/* Floating Space Debris */}
          <div className="absolute top-20 left-10 w-3 h-3 bg-cyan-400/40 rounded-full animate-bounce"></div>
          <div className="absolute top-40 right-20 w-2 h-2 bg-purple-400/50 rounded-full animate-ping"></div>
          <div className="absolute top-60 left-1/4 w-2.5 h-2.5 bg-blue-400/40 rounded-full animate-pulse"></div>
          <div className="absolute top-80 right-1/3 w-1.5 h-1.5 bg-green-400/60 rounded-full animate-bounce"></div>
          <div className="absolute top-32 left-2/3 w-2 h-2 bg-pink-400/50 rounded-full animate-ping"></div>
          <div className="absolute top-72 right-1/6 w-1.5 h-1.5 bg-yellow-400/40 rounded-full animate-pulse"></div>
          
          {/* Energy Orbs */}
          <div className="absolute top-1/4 left-1/6 w-6 h-6 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full animate-spin opacity-40"></div>
          <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-gradient-to-r from-purple-400/25 to-pink-400/25 rounded-full animate-pulse opacity-30"></div>
          <div className="absolute top-2/3 left-1/3 w-5 h-5 bg-gradient-to-r from-green-400/35 to-cyan-400/35 rounded-full animate-bounce opacity-50"></div>
          <div className="absolute top-1/2 right-1/6 w-4 h-4 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full animate-spin opacity-40" style={{ animationDirection: 'reverse' }}></div>
          
          {/* Cosmic Grid */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/8 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/8 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-blue-500/5 to-transparent"></div>
          
          {/* Wormhole Effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-40 h-40 border border-cyan-400/15 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-purple-400/15 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '4s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-blue-400/15 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border border-pink-400/15 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
          </div>
          
          {/* Energy Waves */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-cyan-500/10 via-transparent to-transparent animate-pulse"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-purple-500/10 via-transparent to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <Header />
        <div className="pt-16 relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center relative">
                {/* Pac-Man Loader */}
                <div className="relative mb-8">
                  <div className="flex justify-center">
                    <PacmanLoader 
                      color="#fbbf24" 
                      size={60}
                      margin={4}
                      speedMultiplier={1.2}
                    />
                  </div>
                  
                  {/* Floating energy particles */}
                  <div className="absolute -top-4 -left-4 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute -top-4 -right-4 w-3 h-3 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute -bottom-4 -left-4 w-3 h-3 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                  <div className="absolute -bottom-4 -right-4 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
                </div>
                
                {/* Enhanced Text with Glow Effect */}
                <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.5)' }}>
                  Loading Resume
                </h2>
                <p className="text-gray-300 mb-6 text-lg">Fetching your resume data...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-hidden cyber-grid">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24 relative z-10">
          <Card className="glass-card border-white/10 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Resume Not Found</h1>
              <p className="text-gray-300 mb-8">{error}</p>
              <Button 
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="relative min-h-screen overflow-hidden cyber-grid">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24 relative z-10">
          <Card className="glass-card border-white/10 max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h1 className="text-4xl font-bold text-white mb-4">Resume Not Found</h1>
              <p className="text-gray-300 mb-8">The resume you're looking for doesn't exist.</p>
              <Button 
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const resumeData = resume.data.content;
  const template = resume.data.template;
  const headerInfo = resume.data.headerInfo;

  return (
    <div className="relative min-h-screen overflow-hidden cyber-grid">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24 relative z-10">
        {/* Enhanced Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="space-y-6">
            {/* Main Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
                    <FileText className="h-6 w-6 text-purple-400" />
                  </div>
                                     <div>
                     <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">{resume.title}</h1>
                                           <div className="text-gray-300 text-sm">
                        <span className="font-bold">Total Views:</span> {resume.viewCount} • <span className="font-bold">Created:</span> {new Date(resume.createdAt).toLocaleDateString()} • <span className="font-bold">Template:</span> {resume.template || 'Default'}
                      </div>
                   </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {isOwner ? (
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 transition-all duration-200"
                  onClick={editResume}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Resume
                </Button>
                ) : null}
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 transition-all duration-200"
                  onClick={shareResume}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button
                  onClick={exportToPDF}
                  disabled={exporting}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25 transition-all duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Export PDF'}
                </Button>
                {isOwner ? (
                <Button
                  variant="destructive"
                  onClick={deleteResume}
                  disabled={deleting}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>
                ) : null}
              </div>
            </div>
            
          </div>
        </motion.div>


        {/* Tabs: Resume and AI Analysis */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >

          <div className="max-w-7xl w-full mx-auto">
            <Tabs defaultValue="resume" className="space-y-6">
              <div className="flex justify-center">
                <TabsList className="glass-card border-white/20 p-1 bg-black/20">
                  <TabsTrigger value="resume">Resume</TabsTrigger>
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                  <TabsTrigger value="career-games">Career Games</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="resume">
                <div 
                  id="resume-content"
                  className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto text-gray-900 [&_*]:text-gray-900 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_p]:text-gray-700 [&_li]:text-gray-700 [&_span]:text-gray-700 [&_.text-gray-700]:text-gray-700 [&_.text-gray-600]:text-gray-600 [&_.text-gray-500]:text-gray-500 [&_.text-gray-900]:text-gray-900"
                  style={{
                    fontFamily: template.fontFamily,
                    color: '#1f2937'
                  }}
                >
            {/* Header */}
            <div className="text-center mb-8">

              <h1 
                className="text-3xl font-bold mb-2 text-gray-900"
                style={{ color: template.primaryColor || '#1f2937' }}
              >
                {headerInfo.name}
              </h1>
              <p 
                className="text-xl font-semibold mb-4 text-gray-800"
                style={{ color: template.secondaryColor || '#374151' }}
              >
                {headerInfo.title}
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm text-gray-600">
                {headerInfo.email && (
                  <div className="flex items-center gap-1 hover:text-purple-600 transition-colors">
                    <Mail className="h-4 w-4" />
                    <span className="break-all">{headerInfo.email}</span>
                  </div>
                )}
                {headerInfo.phone && (
                  <div className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                    <Phone className="h-4 w-4" />
                    <span className="break-all">{headerInfo.phone}</span>
                  </div>
                )}
                {headerInfo.location && (
                  <div className="flex items-center gap-1 hover:text-green-600 transition-colors">
                    <MapPin className="h-4 w-4" />
                    <span className="break-all">{headerInfo.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Section Headers */}
            {resumeData.summary && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                  <h2 
                    className="text-lg font-semibold text-gray-900"
                    style={{ color: template.primaryColor || '#1f2937' }}
                  >
                    Professional Summary
                  </h2>
                </div>
                <p className="text-gray-700 leading-relaxed pl-3 border-l-2 border-gray-200">{resumeData.summary}</p>
              </div>
            )}

            {/* Enhanced Experience Section */}
            {resumeData.experience && resumeData.experience.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                  <h2 
                    className="text-lg font-semibold text-gray-900"
                    style={{ color: template.primaryColor || '#1f2937' }}
                  >
                    Work Experience
                  </h2>
                </div>
                <div className="space-y-4">
                  {resumeData.experience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-4 pl-4 hover:border-l-4 hover:border-purple-500 transition-all duration-200" style={{ borderColor: template.secondaryColor || '#6b7280' }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{exp.duration}</span>
                      </div>
                      <p className="text-gray-600 mb-2 font-medium">{exp.company}</p>
                      {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {exp.achievements.map((achievement: string, idx: number) => (
                            <li key={idx} className="hover:text-gray-900 transition-colors">{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {resumeData.skills && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                  <h2 
                    className="text-lg font-semibold text-gray-900"
                    style={{ color: template.primaryColor || '#1f2937' }}
                  >
                    Skills
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {resumeData.skills.technical && resumeData.skills.technical.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.technical.map((skill: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            style={{ backgroundColor: template.secondaryColor || '#6b7280', color: 'white' }}
                            className="text-xs px-2 py-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {resumeData.skills.soft && resumeData.skills.soft.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Soft Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.soft.map((skill: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-gray-700 border-gray-300 text-xs px-2 py-1"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                   {resumeData.skills.languages && Array.isArray(resumeData.skills.languages) && resumeData.skills.languages.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.languages.map((language: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-gray-700 border-gray-300 text-xs px-2 py-1"
                          >
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education && resumeData.education.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  <h2 
                    className="text-lg font-semibold text-gray-900"
                    style={{ color: template.primaryColor || '#1f2937' }}
                  >
                    Education
                  </h2>
                </div>
                <div className="space-y-4">
                  {resumeData.education.map((edu: any, index: number) => (
                    <div key={index} className="border-l-4 pl-4 hover:border-l-4 hover:border-indigo-500 transition-all duration-200" style={{ borderColor: template.secondaryColor || '#6b7280' }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{edu.year}</span>
                      </div>
                      <p className="text-gray-600 mb-2 font-medium">{edu.institution}</p>
                      {edu.highlights && edu.highlights.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {edu.highlights.map((highlight: string, idx: number) => (
                            <li key={idx} className="hover:text-gray-900 transition-colors">{highlight}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
                   {resumeData.certifications && Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                  <h2 
                    className="text-lg font-semibold text-gray-900"
                    style={{ color: template.primaryColor || '#1f2937' }}
                  >
                    Certifications
                  </h2>
                </div>
                <div className="space-y-2">
                  {resumeData.certifications.map((cert: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {resumeData.projects && resumeData.projects.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-teal-500 to-green-500 rounded-full"></div>
                  <h2 
                    className="text-lg font-semibold text-gray-900"
                    style={{ color: template.primaryColor || '#1f2937' }}
                  >
                    Projects
                  </h2>
                </div>
                <div className="space-y-4">
                  {resumeData.projects.map((project: any, index: number) => (
                    <div key={index} className="border-l-4 pl-4 hover:border-l-4 hover:border-teal-500 transition-all duration-200" style={{ borderColor: template.secondaryColor || '#6b7280' }}>
                      <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-2">{project.description}</p>
                   {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Technologies: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.technologies.map((tech: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-gray-700 border-gray-300 text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                       {project.impact && Array.isArray(project.impact) && project.impact.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {project.impact.map((impact: string, idx: number) => (
                            <li key={idx} className="hover:text-gray-900 transition-colors">{impact}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {resumeData.achievements && resumeData.achievements.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-red-500 rounded-full"></div>
                  <h2 
                    className="text-lg font-semibold text-gray-900"
                    style={{ color: template.primaryColor || '#1f2937' }}
                  >
                    Achievements
                  </h2>
                </div>
                <div className="space-y-2">
                  {resumeData.achievements.map((achievement: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                      <Star className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="max-w-6xl w-full mx-auto">
                  {analysisLoading && (
                    <div className="text-center text-gray-300 py-12">Loading analysis...</div>
                  )}
                  {!analysisLoading && !analysis && !analysisError && (
                    <div className="text-center text-gray-300 py-12">
                      No analysis found. Login and run an analysis to see results here.
                    </div>
                  )}
                  {analysisError && (
                    <div className="text-center text-red-400 py-12">{analysisError}</div>
                  )}
                  {analysis && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                                                                           <Card className="glass-card border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
                          <CardHeader>
                            <CardTitle className="text-cyan-400">Overall Score</CardTitle>
                          </CardHeader>
                                                                                                           <CardContent className="max-h-56 min-h-56 flex flex-col">
                             <div className="text-4xl font-bold text-white mb-4">{analysis.overallScore ?? 'N/A'}</div>
                             <div className="grid grid-cols-2 gap-3">
                               <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
                                 <div className="text-cyan-400 font-medium text-sm mb-1">ATS</div>
                                 <div className="text-white font-semibold text-lg">{analysis.atsCompatibility ?? '—'}</div>
                               </div>
                               <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
                                 <div className="text-cyan-400 font-medium text-sm mb-1">Content</div>
                                 <div className="text-white font-semibold text-lg">{analysis.contentQuality ?? '—'}</div>
                               </div>
                               <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
                                 <div className="text-cyan-400 font-medium text-sm mb-1">Presentation</div>
                                 <div className="text-white font-semibold text-lg">{analysis.professionalPresentation ?? '—'}</div>
                               </div>
                               <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
                                 <div className="text-cyan-400 font-medium text-sm mb-1">Alignment</div>
                                 <div className="text-white font-semibold text-lg">{analysis.skillsAlignment ?? '—'}</div>
                               </div>
                             </div>
                           </CardContent>
                        </Card>

                                             <Card className="glass-card border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                         <CardHeader>
                           <CardTitle className="text-purple-400">Improved Summary</CardTitle>
                         </CardHeader>
                                                                                                      <CardContent data-card="improved-summary" className="text-gray-300 text-sm max-h-56 overflow-y-auto [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-purple-500/20 [&::-webkit-scrollbar-thumb]:bg-purple-500/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-purple-500/80">
                             <div className="leading-loose space-y-4">
                               {analysis.improvedSummary ? (
                                 <div className="whitespace-pre-line">{analysis.improvedSummary}</div>
                               ) : (
                                 '—'
                               )}
                             </div>
                           </CardContent>
                       </Card>

                       <Card className="glass-card border-green-500/30">
                         <CardHeader>
                           <CardTitle className="text-green-400">Key Strengths</CardTitle>
                         </CardHeader>
                                                                                                       <CardContent data-card="key-strengths" className="max-h-56 overflow-y-auto [&::-webkit-scrollbar]:w-3 [&::-webkit-scrollbar-track]:bg-green-500/20 [&::-webkit-scrollbar-thumb]:bg-green-500/60 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-green-500/80">
                            {Array.isArray(analysis.keyStrengths) && analysis.keyStrengths.length > 0 ? (
                              <div className="space-y-2">
                                <div className="space-y-2">
                                  {analysis.keyStrengths.map((s: string, i: number) => (
                                    <div
                                      key={i}
                                      className="p-3 rounded-lg bg-green-500/10 border border-green-400/20 text-sm text-gray-200 leading-relaxed"
                                    >
                                      {s}
                                    </div>
                                  ))}
                                </div>
                                {/* Add some extra content to ensure scrolling */}
                                <div className="space-y-2">
                                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-400/20 text-sm text-gray-200 leading-relaxed">
                                    Additional strength item to ensure scrollbar visibility
                                  </div>
                                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-400/20 text-sm text-gray-200 leading-relaxed">
                                    Another strength item for testing scrollbar
                                  </div>
                                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-400/20 text-sm text-gray-200 leading-relaxed">
                                    Final strength item to trigger scrollbar
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-gray-400 text-sm">—</div>
                            )}
                          </CardContent>
                       </Card>

                                                                                           <Card className="glass-card border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                          <CardHeader>
                            <CardTitle className="text-indigo-400">Career Path</CardTitle>
                          </CardHeader>
                                                     <CardContent className="text-sm text-gray-300 space-y-3 max-h-96 overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-indigo-500/10 [&::-webkit-scrollbar-thumb]:bg-indigo-500/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-indigo-500/70">
                            {analysis.careerPath?.currentPosition && (
                              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                                <div className="text-white font-medium mb-1">Current Position</div>
                                <div className="text-indigo-400">{analysis.careerPath.currentPosition}</div>
                              </div>
                            )}
                            
                            {Array.isArray(analysis.careerPath?.nextCareerSteps) && analysis.careerPath.nextCareerSteps.length > 0 && (
                              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                                <div className="text-white font-medium mb-2">Next Career Steps</div>
                                <div className="space-y-2">
                                  {analysis.careerPath.nextCareerSteps.map((step: any, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                                      <div>
                                        <div className="text-white font-medium text-sm">{step.title || `Step ${i + 1}`}</div>
                                        <div className="text-gray-300 text-xs">{step.description || 'Career advancement opportunity'}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {Array.isArray(analysis.careerPath?.skillGaps) && analysis.careerPath.skillGaps.length > 0 && (
                              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                                <div className="text-white font-medium mb-2">Skill Gaps to Address</div>
                                <div className="space-y-1">
                                  {analysis.careerPath.skillGaps.map((skill: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0"></div>
                                      <span className="text-gray-300 text-xs">{skill}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {analysis.careerPath?.timeline && (
                              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                                <div className="text-white font-medium mb-1">Timeline</div>
                                <div className="text-indigo-400 text-sm">{analysis.careerPath.timeline}</div>
                              </div>
                            )}
                            
                            {analysis.careerPath?.timelineDetails && (
                              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                                <div className="text-white font-medium mb-1">Timeline Details</div>
                                <div className="text-gray-300 text-xs">{analysis.careerPath.timelineDetails}</div>
                              </div>
                            )}
                            
                            {analysis.careerPath?.marketPosition && (
                              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                                <div className="text-white font-medium mb-1">Market Position</div>
                                <div className="text-gray-300 text-xs">{analysis.careerPath.marketPosition}</div>
                              </div>
                            )}
                            
                            {analysis.careerPath?.growthPotential && (
                              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
                                <div className="text-white font-medium mb-1">Growth Potential</div>
                                <div className="text-gray-300 text-xs">{analysis.careerPath.growthPotential}</div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                                                                                           <Card className="glass-card border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
                          <CardHeader>
                            <CardTitle className="text-emerald-400">Strengths Analysis</CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm text-gray-300 space-y-3 max-h-96 overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-emerald-500/10 [&::-webkit-scrollbar-thumb]:bg-emerald-500/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-emerald-500/70">
                            {Array.isArray(analysis.strengthsAnalysis?.coreStrengths) && analysis.strengthsAnalysis.coreStrengths.length > 0 && (
                              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                                <div className="text-white font-medium mb-2">Core Strengths</div>
                                <div className="space-y-1">
                                  {analysis.strengthsAnalysis.coreStrengths.map((strength: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                                      <span className="text-gray-300 text-xs">{strength}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {Array.isArray(analysis.strengthsAnalysis?.technicalStrengths) && analysis.strengthsAnalysis.technicalStrengths.length > 0 && (
                              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                                <div className="text-white font-medium mb-2">Technical Strengths</div>
                                <div className="space-y-1">
                                  {analysis.strengthsAnalysis.technicalStrengths.map((strength: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                                      <span className="text-gray-300 text-xs">{strength}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {Array.isArray(analysis.strengthsAnalysis?.softSkills) && analysis.strengthsAnalysis.softSkills.length > 0 && (
                              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                                <div className="text-white font-medium mb-2">Soft Skills</div>
                                <div className="space-y-1">
                                  {analysis.strengthsAnalysis.softSkills.map((skill: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                                      <span className="text-gray-300 text-xs">{skill}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {Array.isArray(analysis.strengthsAnalysis?.achievements) && analysis.strengthsAnalysis.achievements.length > 0 && (
                              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                                <div className="text-white font-medium mb-2">Notable Achievements</div>
                                <div className="space-y-1">
                                  {analysis.strengthsAnalysis.achievements.map((achievement: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                                      <span className="text-gray-300 text-xs">{achievement}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {Array.isArray(analysis.strengthsAnalysis?.marketAdvantage) && analysis.strengthsAnalysis.marketAdvantage.length > 0 && (
                              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                                <div className="text-white font-medium mb-2">Market Advantages</div>
                                <div className="space-y-1">
                                  {analysis.strengthsAnalysis.marketAdvantage.map((advantage: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></div>
                                      <span className="text-gray-300 text-xs">{advantage}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {analysis.strengthsAnalysis?.uniqueValue && (
                              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                                <div className="text-white font-medium mb-1">Unique Value Proposition</div>
                                <div className="text-gray-300 text-xs">{analysis.strengthsAnalysis.uniqueValue}</div>
                              </div>
                            )}
                            
                            {analysis.strengthsAnalysis?.competitiveEdge && (
                              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
                                <div className="text-white font-medium mb-1">Competitive Edge</div>
                                <div className="text-gray-300 text-xs">{analysis.strengthsAnalysis.competitiveEdge}</div>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                                                                                                                                                                                       <Card className="glass-card border-blue-500/30">
                             <CardHeader>
                               <CardTitle className="text-blue-400">Salary Analysis</CardTitle>
                             </CardHeader>
                                                           <CardContent className="text-sm text-gray-300 space-y-3 max-h-96 overflow-y-auto relative [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-blue-500/10 [&::-webkit-scrollbar-thumb]:bg-blue-500/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-blue-500/70">
                               {analysis.salaryAnalysis?.currentLevel && (
                                 <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
                                   <div className="text-white font-medium mb-1">Current Level</div>
                                   <div className="text-blue-400">{analysis.salaryAnalysis.currentLevel}</div>
                                 </div>
                               )}
                               
                               {analysis.salaryAnalysis?.recommendedSalaryRange && (
                                 <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
                                   <div className="text-white font-medium mb-1">Recommended Salary Range</div>
                                   <div className="text-blue-400 font-medium">
                                     {analysis.salaryAnalysis.recommendedSalaryRange.includes('PHP') ? 
                                       analysis.salaryAnalysis.recommendedSalaryRange.replace('PHP', '₱') :
                                       analysis.salaryAnalysis.recommendedSalaryRange
                                     }
                                   </div>
                                 </div>
                               )}
                               
                               {Array.isArray(analysis.salaryAnalysis?.factorsAffectingSalary) && analysis.salaryAnalysis.factorsAffectingSalary.length > 0 && (
                                 <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
                                   <div className="text-white font-medium mb-2">Factors Affecting Salary</div>
                                   <div className="space-y-1">
                                     {analysis.salaryAnalysis.factorsAffectingSalary.map((factor: string, i: number) => (
                                       <div key={i} className="flex items-start gap-2">
                                         <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                                         <span className="text-gray-300 text-xs">{factor}</span>
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               )}
                               
                               {Array.isArray(analysis.salaryAnalysis?.negotiationTips) && analysis.salaryAnalysis.negotiationTips.length > 0 && (
                                 <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
                                   <div className="text-white font-medium mb-2">Negotiation Tips</div>
                                   <div className="space-y-1">
                                     {analysis.salaryAnalysis.negotiationTips.map((tip: string, i: number) => (
                                       <div key={i} className="flex items-start gap-2">
                                         <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                                         <span className="text-gray-300 text-xs">{tip}</span>
                                       </div>
                                     ))}
                                   </div>
                                 </div>
                               )}
                               
                               {analysis.salaryAnalysis?.marketComparison && (
                                 <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
                                   <div className="text-white font-medium mb-1">Market Comparison</div>
                                   <div className="text-gray-300 text-xs">{analysis.salaryAnalysis.marketComparison}</div>
                                 </div>
                               )}
                               
                               {analysis.salaryAnalysis?.growthProjection && (
                                 <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
                                   <div className="text-white font-medium mb-1">Growth Projection</div>
                                   <div className="text-gray-300 text-xs">{analysis.salaryAnalysis.growthProjection}</div>
                                 </div>
                               )}
                               
                               {analysis.salaryAnalysis?.industryBenchmark && (
                                 <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-400/20">
                                   <div className="text-white font-medium mb-1">Industry Benchmark</div>
                                   <div className="text-gray-300 text-xs">{analysis.salaryAnalysis.industryBenchmark}</div>
                                 </div>
                               )}
                             </CardContent>
                           </Card>
                       
                                               <div className="lg:col-span-3">
                          <Card className="glass-card border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
                            <CardHeader>
                              <CardTitle className="text-orange-400">Section Analysis</CardTitle>
                            </CardHeader>
                                                                               <CardContent className="max-h-96 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-orange-500/10 [&::-webkit-scrollbar-thumb]:bg-orange-500/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-orange-500/70">
                          <div className="space-y-4">
                            {['contact','summary','experience','education','skills'].map((sec) => {
                              const sectionData = analysis.sectionAnalysis?.[sec];
                              return (
                                <div key={sec} className="p-4 rounded-lg border border-orange-400/20 bg-orange-500/5">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="text-white font-medium capitalize text-base">{sec}</div>
                                    <div className="text-orange-400 font-semibold text-lg">
                                      Score: {sectionData?.score ?? '—'}
                                    </div>
                                  </div>
                                  
                                  {sectionData?.issues && Array.isArray(sectionData.issues) && sectionData.issues.length > 0 && (
                                    <div className="mb-3">
                                      <div className="text-orange-300 font-medium text-sm mb-2">Issues Found:</div>
                                      <div className="space-y-1">
                                        {sectionData.issues.map((issue: string, idx: number) => (
                                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></div>
                                            <span>{issue}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {sectionData?.reasons && Array.isArray(sectionData.reasons) && sectionData.reasons.length > 0 && (
                                    <div className="mb-3">
                                      <div className="text-orange-300 font-medium text-sm mb-2">Reasons:</div>
                                      <div className="space-y-1">
                                        {sectionData.reasons.map((reason: string, idx: number) => (
                                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0"></div>
                                            <span>{reason}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {sectionData?.improvements && Array.isArray(sectionData.improvements) && sectionData.improvements.length > 0 && (
                                    <div>
                                      <div className="text-orange-300 font-medium text-sm mb-2">Improvements:</div>
                                      <div className="space-y-1">
                                        {sectionData.improvements.map((improvement: string, idx: number) => (
                                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 flex-shrink-0"></div>
                                            <span>{improvement}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {(!sectionData?.issues && !sectionData?.reasons && !sectionData?.improvements) && (
                                    <div className="text-gray-400 text-xs italic">
                                      No detailed analysis available for this section
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                         </Card>
                       </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="career-games">
                <div className="max-w-6xl w-full mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Typing Hero */}
                    <Card className="glass-card border-white/10 hover:border-white/20 transition-colors">
                      <CardHeader className="pb-2 flex items-center gap-2">
                        <Guitar className="w-5 h-5 text-yellow-400" />
                        <CardTitle className="text-white">Typing Hero</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-300 space-y-2">
                        {typingStats ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>Best WPM: <span className="text-white font-semibold">{typingStats.best_wpm ?? '—'}</span></div>
                            <div>Best Accuracy: <span className="text-white font-semibold">{typingStats.best_accuracy ?? '—'}{typingStats.best_accuracy != null ? '%' : ''}</span></div>
                            <div>Median WPM: <span className="text-white font-semibold">{typingStats.median_wpm ?? '—'}</span></div>
                            <div>Recent WPM: <span className="text-white font-semibold">{typingStats.recent_wpm ?? '—'}</span></div>
                            <div>Highest Difficulty: <span className="text-white font-semibold capitalize">{typingStats.highest_difficulty ?? '—'}</span></div>
                            <div>Consistency Index: <span className="text-white font-semibold">{typingStats.consistency_index ?? '—'}</span></div>
                            <div>Total Sessions: <span className="text-white font-semibold">{typingStats.total_sessions ?? 0}</span></div>
                            <div>Percentile: <span className="text-white font-semibold">{typingStats.percentile != null ? `${typingStats.percentile}%` : '—'}</span></div>
                          </div>
                        ) : (
                          <div>No Typing Hero stats yet.</div>
                        )}
                        <Separator className="my-3 bg-white/10" />
                        <div className="text-gray-400">Latest Session</div>
                        {typingLatest ? (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-gray-300">
                            <div>Date: <span className="text-white font-semibold">{new Date(typingLatest.started_at).toLocaleString()}</span></div>
                            <div>WPM: <span className="text-white font-semibold">{typingLatest.wpm ?? '—'}</span></div>
                            <div>Accuracy: <span className="text-white font-semibold">{typingLatest.accuracy != null ? `${typingLatest.accuracy}%` : '—'}</span></div>
                          </div>
                        ) : (
                          <div>No recent session found.</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* BPOC DISC */}
                    <Card className="glass-card border-white/10 hover:border-white/20 transition-colors">
                      <CardHeader className="pb-2 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-amber-400" />
                        <CardTitle className="text-white">BPOC DISC</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-300 space-y-2">
                        {discStats ? (
                          <div className="grid grid-cols-2 gap-3">
                            <div>D: <span className="text-white font-semibold">{discStats.d ?? '—'}%</span></div>
                            <div>I: <span className="text-white font-semibold">{discStats.i ?? '—'}%</span></div>
                            <div>S: <span className="text-white font-semibold">{discStats.s ?? '—'}%</span></div>
                            <div>C: <span className="text-white font-semibold">{discStats.c ?? '—'}%</span></div>
                            <div>Primary: <span className="text-white font-semibold">{discStats.primary_style ?? '—'}</span></div>
                            <div>Secondary: <span className="text-white font-semibold">{discStats.secondary_style ?? '—'}</span></div>
                            <div>Consistency: <span className="text-white font-semibold">{discStats.consistency_index ?? '—'}</span></div>
                            {discStats.percentile != null && (
                              <div>Percentile: <span className="text-white font-semibold">{discStats.percentile}%</span></div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400">No data yet.</div>
                        )}
                        {discLatest && (
                          <div className="mt-2 text-gray-400">
                            <div className="text-xs">Latest Session</div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>Date: <span className="text-white">{new Date(discLatest.started_at).toLocaleString()}</span></div>
                              <div>Primary: <span className="text-white">{discLatest.primary_style}</span></div>
                              <div>D/I/S/C: <span className="text-white">{discLatest.d}% / {discLatest.i}% / {discLatest.s}% / {discLatest.c}%</span></div>
                              <div>Consistency: <span className="text-white">{discLatest.consistency_index ?? '—'}</span></div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    

                    {/* BPOC Cultural */}
                    <Card className="glass-card border-white/10 hover:border-white/20 transition-colors">
                      <CardHeader className="pb-2 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <CardTitle className="text-white">BPOC Cultural</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-300">
                        <div className="text-gray-400">No data yet.</div>
                      </CardContent>
                    </Card>

                    {/* BPOC Ultimate */}
                    <Card className="glass-card border-white/10 hover:border-white/20 transition-colors">
                      <CardHeader className="pb-2 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-red-400" />
                        <CardTitle className="text-white">BPOC Ultimate</CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-gray-300 space-y-3">
                        {ultimateStats ? (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <div>Tier: <span className="text-white font-semibold">{ultimateStats.last_tier ?? '—'}</span></div>
                              <div>Sessions: <span className="text-white font-semibold">{ultimateStats.total_sessions ?? 0}</span></div>
                              <div>Smart: <span className="text-white font-semibold">{ultimateStats.smart ?? '—'}</span></div>
                              <div>Motivated: <span className="text-white font-semibold">{ultimateStats.motivated ?? '—'}</span></div>
                              <div>Integrity: <span className="text-white font-semibold">{ultimateStats.integrity ?? '—'}</span></div>
                              <div>Business: <span className="text-white font-semibold">{ultimateStats.business ?? '—'}</span></div>
                              {ultimateStats.last_recommendation && (
                                <div className="col-span-2">Recommendation: <span className="text-white font-semibold">{ultimateStats.last_recommendation}</span></div>
                              )}
                              {ultimateStats.last_client_value && (
                                <div className="col-span-2">Client Value: <span className="text-white font-semibold">{ultimateStats.last_client_value}</span></div>
                              )}
                            </div>
                            {(ultimateStats.platinum_choices != null || ultimateStats.gold_choices != null || ultimateStats.bronze_choices != null || ultimateStats.nightmare_choices != null) && (
                              <div className="grid grid-cols-4 gap-3 text-xs text-gray-400">
                                <div>Platinum: <span className="text-white font-semibold">{ultimateStats.platinum_choices ?? 0}</span></div>
                                <div>Gold: <span className="text-white font-semibold">{ultimateStats.gold_choices ?? 0}</span></div>
                                <div>Bronze: <span className="text-white font-semibold">{ultimateStats.bronze_choices ?? 0}</span></div>
                                <div>Nightmare: <span className="text-white font-semibold">{ultimateStats.nightmare_choices ?? 0}</span></div>
                              </div>
                            )}
                            {ultimateStats.latest_competencies && (
                              <div className="grid grid-cols-2 gap-3">
                                <div>Team Morale: <span className="text-white font-semibold">{ultimateStats.latest_competencies.teamMorale ?? ultimateStats.latest_competencies.team_morale ?? '—'}</span></div>
                                <div>Client Trust: <span className="text-white font-semibold">{ultimateStats.latest_competencies.clientTrust ?? ultimateStats.latest_competencies.client_trust ?? '—'}</span></div>
                                <div>Business Impact: <span className="text-white font-semibold">{ultimateStats.latest_competencies.businessImpact ?? ultimateStats.latest_competencies.business_impact ?? '—'}</span></div>
                                <div>Crisis Pressure: <span className="text-white font-semibold">{ultimateStats.latest_competencies.crisisPressure ?? ultimateStats.latest_competencies.crisis_pressure ?? '—'}</span></div>
                              </div>
                            )}
                            {Array.isArray(ultimateStats.key_strengths) && ultimateStats.key_strengths.length > 0 && (
                              <div>
                                <div className="text-gray-400">Key Strengths</div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {ultimateStats.key_strengths.map((s: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-white/90 border border-white/10">{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {Array.isArray(ultimateStats.development_areas) && ultimateStats.development_areas.length > 0 && (
                              <div>
                                <div className="text-gray-400">Development Areas</div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {ultimateStats.development_areas.map((s: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-white/90 border border-white/10">{s}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-gray-400">No data yet.</div>
                        )}
                        {ultimateLatest && (
                          <div className="mt-3 text-gray-400">
                            <div className="text-xs">Latest Session</div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>Date: <span className="text-white">{new Date(ultimateLatest.started_at).toLocaleString()}</span></div>
                              <div>Tier: <span className="text-white">{ultimateLatest.tier ?? '—'}</span></div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              
            </Tabs>
          </div>
        </motion.div>

        {/* Export Progress Overlay */}
        {exporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <Card className="glass-card border-white/10 max-w-md w-full mx-4">
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                <h3 className="text-xl font-semibold text-white mb-2">Generating PDF</h3>
                <p className="text-gray-300">Please wait while we prepare your resume...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  BarChart3,
  Gamepad2,
  Briefcase,
  FileText,
  Trophy,
  Crown,
  Medal,
  Zap,
  Target,
  TrendingUp,
  Users,
  MessageSquare,
  Calculator,
  Brain,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lock,
  Unlock,
  Settings,
  RefreshCw,
  Save,
  Upload,
  X,
  Plus,
  Minus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Heart,
  Bookmark,
  Flag,
  Shield,
  Clock,
  Check,
  AlertTriangle,
  Info,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Mic,
  MicOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Timer,
  StopCircle,
  PlayCircle,
  PauseCircle,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Maximize,
  Minimize,
  Fullscreen,
  FullscreenExit,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw as RotateCcwIcon,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Scissors,
  Pen,
  Pencil,
  Eraser,
  Paintbrush,
  Palette,
  Image,
  Video,
  Music,
  File,
  Folder,
  Archive,
  Inbox,
  Outbox,
  Trash,
  Recycle,
  Restore,
  Undo,
  Redo,
  Cut,
  Copy as CopyIcon,
  Paste,
  Clipboard,
  ClipboardCheck,
  ClipboardList,
  ClipboardCopy,
  ClipboardPaste,
  ClipboardX,
  ClipboardMinus,
  ClipboardPlus,
  ClipboardEdit,
  ClipboardSearch,
  ClipboardDownload,
  ClipboardUpload,
  ClipboardShare,
  ClipboardHeart,
  ClipboardStar,
  ClipboardFlag,
  ClipboardBookmark,
  ClipboardLock,
  ClipboardUnlock,
  ClipboardSettings,
  ClipboardRefresh,
  ClipboardSave,
  ClipboardUpload as ClipboardUploadIcon,
  ClipboardDownload as ClipboardDownloadIcon,
  ClipboardShare as ClipboardShareIcon,
  ClipboardHeart as ClipboardHeartIcon,
  ClipboardStar as ClipboardStarIcon,
  ClipboardFlag as ClipboardFlagIcon,
  ClipboardBookmark as ClipboardBookmarkIcon,
  ClipboardLock as ClipboardLockIcon,
  ClipboardUnlock as ClipboardUnlockIcon,
  ClipboardSettings as ClipboardSettingsIcon,
  ClipboardRefresh as ClipboardRefreshIcon,
  ClipboardSave as ClipboardSaveIcon,
  ClipboardUpload as ClipboardUploadIcon2,
  ClipboardDownload as ClipboardDownloadIcon2,
  ClipboardShare as ClipboardShareIcon2,
  ClipboardHeart as ClipboardHeartIcon2,
  ClipboardStar as ClipboardStarIcon2,
  ClipboardFlag as ClipboardFlagIcon2,
  ClipboardBookmark as ClipboardBookmarkIcon2,
  ClipboardLock as ClipboardLockIcon2,
  ClipboardUnlock as ClipboardUnlockIcon2,
  ClipboardSettings as ClipboardSettingsIcon2,
  ClipboardRefresh as ClipboardRefreshIcon2,
  ClipboardSave as ClipboardSaveIcon2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/toast';
import { formatNumber, generateInitials } from '@/lib/utils';

interface SavedResume {
  id: string;
  slug: string;
  title: string;
  data: any;
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
    email: string;
    phone: string;
    location: string;
    position: string;
  };
}

export default function ResumeSlugPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
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
  const [overallScore, setOverallScore] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<string>('resume');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  // Function to determine rank based on overall score
  const getRank = (score: number) => {
    if (score >= 85 && score <= 100) return { rank: 'GOLD', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' };
    if (score >= 65 && score <= 84) return { rank: 'SILVER', color: 'text-gray-300', bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/30' };
    if (score >= 50 && score <= 64) return { rank: 'BRONZE', color: 'text-orange-400', bgColor: 'bg-orange-500/20', borderColor: 'border-orange-500/30' };
    return { rank: 'None', color: 'text-gray-500', bgColor: 'bg-gray-600/20', borderColor: 'border-gray-600/30' };
  };

  const [typingStats, setTypingStats] = useState<any | null>(null);
  const [typingLatest, setTypingLatest] = useState<any | null>(null);
  const [discStats, setDiscStats] = useState<any | null>(null);
  const [discLatest, setDiscLatest] = useState<any | null>(null);
  const [ultimateStats, setUltimateStats] = useState<any | null>(null);
  const [ultimateLatest, setUltimateLatest] = useState<any | null>(null);
  const [culturalStats, setCulturalStats] = useState<any | null>(null);
  const [culturalLatest, setCulturalLatest] = useState<any | null>(null);
  const [isGameResultsDropdownOpen, setIsGameResultsDropdownOpen] = useState<boolean>(false);

  // Starfield state
  const [stars, setStars] = useState<Array<{
    id: number;
    left: string;
    top: string;
    animationDelay: string;
    animationDuration: string;
    opacity: number;
  }>>([]);

  // Initialize starfield
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${3 + Math.random() * 4}s`,
          opacity: Math.random() * 0.8 + 0.2,
        });
      }
      setStars(newStars);
    };
    generateStars();
  }, []);

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isShareOpen && !target.closest('.share-dropdown') && !target.closest('[data-share-button]')) {
        setIsShareOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isShareOpen]);

  // Fetch resume data
  useEffect(() => {
    const fetchResume = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/get-saved-resume/${slug}`, {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load resume');
        }
        
        const data = await response.json();
        if (data.success && data.resume) {
          console.log('=== API RESPONSE DEBUG ===');
          console.log('Full API response:', data);
          console.log('Resume object:', data.resume);
          console.log('Resume data:', data.resume.data);
          console.log('Resume template:', data.resume.template);
          console.log('========================');
          setResume(data.resume);
          setIsOwner(user?.id === data.resume.userId);
          
          // Fetch overall score
          if (data.resume.userId) {
            try {
              const scoreResponse = await fetch(`/api/user/profile?userId=${data.resume.userId}`);
              if (scoreResponse.ok) {
                const scoreData = await scoreResponse.json();
                setOverallScore(scoreData.user?.overall_score || 0);
              }
            } catch (error) {
              console.log('Failed to fetch overall score:', error);
            }
          }
        } else {
          throw new Error('Resume not found');
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
        setError(error instanceof Error ? error.message : 'Failed to load resume');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchResume();
    }
  }, [slug, user?.id]);

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${resume?.user.fullName} - Resume`,
          text: `Check out ${resume?.user.fullName}'s resume`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  // Copy URL function
  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Resume URL copied to clipboard!');
    } catch (error) {
      console.error('Error copying URL:', error);
      alert('Failed to copy URL. Please try again.');
    }
  };

  // Share resume function
  const shareResume = async (platform?: string) => {
    const url = `${window.location.origin}/resume/${slug}`;
    const title = resume?.title || 'Resume';
    const text = `Check out ${resume?.user.fullName}'s resume`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;

      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;

      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;

      case 'instagram':
        // Instagram doesn't support direct URL sharing, so we'll copy the URL
        await copyUrl(url);
        break;

      case 'copy':
        await copyUrl(url);
        break;

      default:
        // Default native sharing
        if (navigator.share) {
          try {
            await navigator.share({
              title: title,
              text: text,
              url: url
            });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        } else {
          // Fallback to copying to clipboard
          await copyUrl(url);
        }
    }
    
    // Close share dropdown
    setIsShareOpen(false);
  };

  // Edit resume function
  const editResume = async () => {
    console.log('Edit Resume clicked!', { resume: resume?.data });

    try {
      // Use existing generated resume data from database instead of regenerating
      if (resume?.data?.content) {
        // Set a flag to indicate we're editing an existing resume
        localStorage.setItem('editingExistingResume', 'true');
        localStorage.setItem('resumeData', JSON.stringify(resume.data.content));
        console.log('Existing resume data loaded for editing');
      } else {
        console.error('No resume data found to edit');
        return;
      }
      console.log('Redirecting to resume builder...');
      window.location.href = '/resume-builder/build';
    } catch (e) {
      console.error('Error in editResume:', e);
    }
  };

  // Export to PDF function
  const exportToPDF = async () => {
    console.log('Export PDF clicked!');
    const element = document.getElementById('resume-content');

    if (!element) {
      alert('Resume content not found. Please try again.');
      return;
    }

    setExporting(true);

    try {
      // Wait for fonts to load
      await document.fonts.ready;
      
      console.log('Capturing resume content...');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      console.log('Canvas created, generating PDF...');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${resume?.user.fullName || 'Resume'}-Resume.pdf`;
      pdf.save(fileName);

      console.log('PDF saved successfully');

    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error generating PDF. Please try again. Error: ' + (error as Error).message);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading resume...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error Loading Resume</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Resume Not Found</h1>
          <p className="text-gray-400 mb-4">The resume you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const rank = getRank(overallScore);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Starfield Background */}
      <div className="fixed inset-0 z-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.animationDelay,
              animationDuration: star.animationDuration,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <Header />
      
      {/* Main Content */}
      <div className="pt-16 relative z-10">
        <div className="container mx-auto px-6 py-8 flex justify-center">
          <div className="max-w-6xl w-full">
            {/* Resume Header with User Info and Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-8 mb-8"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                {/* User Info */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    {resume.user.avatarUrl ? (
                      <img
                        src={resume.user.avatarUrl}
                        alt={resume.user.fullName}
                        className="w-20 h-20 rounded-full object-cover border-2 border-cyan-400/30"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                        {generateInitials(resume.user.fullName)}
                      </div>
                    )}
                    {rank.rank !== 'None' && (
                      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${rank.bgColor} ${rank.borderColor} border-2 flex items-center justify-center`}>
                        <Crown className={`w-4 h-4 ${rank.color}`} />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                      {resume.user.fullName}
                    </h1>
                    <p className="text-xl text-gray-300 mb-1">
                      {resume.user.position || 'Professional'}
                    </p>
                    <div className="flex items-center gap-4 text-gray-400">
                      {resume.user.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{resume.user.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatNumber(resume.viewCount)} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Updated {new Date(resume.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                 {/* Actions */}
                 <div className="flex items-center gap-3">
                   {/* Edit Resume Button - Only show for owner */}
                   {isOwner && (
                     <Button
                       onClick={editResume}
                       variant="outline"
                       className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                     >
                       <Pencil className="h-4 w-4 mr-2" />
                       Edit Resume
                     </Button>
                   )}
                   
                   {/* Share Button with Dropdown */}
                   <div className="relative">
                     <Button
                       onClick={() => setIsShareOpen(!isShareOpen)}
                       variant="outline"
                       className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10"
                       data-share-button
                     >
                       <Share2 className="h-4 w-4 mr-2" />
                       Share
                     </Button>
                     
                     {/* Share Dropdown Menu */}
                     {isShareOpen && (
                       <div className="absolute top-full right-0 mt-2 w-64 bg-black/90 border border-white/20 rounded-lg shadow-xl backdrop-blur-sm z-50 share-dropdown">
                         <div className="p-2 space-y-1">
                           {/* Native Share (if available) */}
                           {typeof navigator !== 'undefined' && 'share' in navigator && (
                             <div
                               onClick={() => shareResume()}
                               className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors text-left cursor-pointer"
                             >
                               <Share2 className="h-4 w-4 text-blue-400" />
                               <span>Share via...</span>
                             </div>
                           )}
                           
                           {/* Facebook */}
                           <div
                             onClick={() => shareResume('facebook')}
                             className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors text-left cursor-pointer"
                           >
                             <Facebook className="h-4 w-4 text-blue-600" />
                             <span>Share on Facebook</span>
                           </div>
                           
                           {/* X (Twitter) */}
                           <div
                             onClick={() => shareResume('twitter')}
                             className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors text-left cursor-pointer"
                           >
                             <Twitter className="h-4 w-4 text-blue-400" />
                             <span>Share on X (Twitter)</span>
                           </div>
                           
                           {/* LinkedIn */}
                           <div
                             onClick={() => shareResume('linkedin')}
                             className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors text-left cursor-pointer"
                           >
                             <Linkedin className="h-4 w-4 text-blue-700" />
                             <span>Share on LinkedIn</span>
                           </div>
                           
                           {/* Instagram */}
                           <div
                             onClick={() => shareResume('instagram')}
                             className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors text-left cursor-pointer"
                           >
                             <Instagram className="h-4 w-4 text-pink-500" />
                             <span>Copy URL for Instagram</span>
                           </div>
                           
                           {/* Copy URL */}
                           <div
                             onClick={() => shareResume('copy')}
                             className="w-full flex items-center gap-3 px-3 py-2 text-white hover:bg-white/10 rounded-md transition-colors text-left cursor-pointer"
                           >
                             <Copy className="h-4 w-4 text-green-400" />
                             <span>Copy URL</span>
                           </div>
                         </div>
                       </div>
                     )}
                   </div>
                   
                   {/* Export PDF Button */}
                   <Button
                     onClick={exportToPDF}
                     disabled={exporting}
                     className="bg-cyan-500 hover:bg-cyan-600 text-white"
                   >
                     {exporting ? (
                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     ) : (
                       <Download className="h-4 w-4 mr-2" />
                     )}
                     {exporting ? 'Exporting...' : 'Export PDF'}
                   </Button>
                 </div>
              </div>

              {/* Overall Score */}
              {overallScore > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">AI Analysis Score</h3>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-bold gradient-text">
                          {overallScore}/100
                        </div>
                        <Badge className={`${rank.bgColor} ${rank.borderColor} border ${rank.color}`}>
                          {rank.rank}
                        </Badge>
                      </div>
                    </div>
                    <div className="w-32">
                      <Progress value={overallScore} className="h-3" />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Resume Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-8"
            >
              {resume.data ? (
                <div 
                  id="resume-content"
                  className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto text-gray-900 [&_*]:text-gray-900 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_p]:text-gray-700 [&_li]:text-gray-700 [&_span]:text-gray-700 [&_.text-gray-700]:text-gray-700 [&_.text-gray-600]:text-gray-600 [&_text-gray-500]:text-gray-500 [&_.text-gray-900]:text-gray-900"
                  style={{
                    fontFamily: resume.data.template?.fontFamily || 'Inter, sans-serif',
                    color: '#1f2937'
                  }}
                >
                  {/* Header */}
                  <div className="text-center mb-8">
                     <h1 
                       className="text-2xl font-bold mb-2 text-gray-900"
                       style={{ color: resume.data.template?.primaryColor || '#1f2937' }}
                     >
                       {resume.data.content?.name || resume.data.headerInfo?.name || resume.user.fullName}
                     </h1>
                     <p 
                       className="text-lg font-semibold mb-4 text-gray-800"
                       style={{ color: resume.data.template?.secondaryColor || '#374151' }}
                     >
                       {resume.data.content?.bestJobTitle || resume.data.headerInfo?.title || resume.user.position || 'Professional'}
                     </p>
                    <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm text-gray-600">
                      {/* Email and phone hidden for confidentiality */}
                      {/* {(resume.data.headerInfo?.email || resume.data.content?.email) && (
                        <div className="flex items-center gap-1 hover:text-purple-600 transition-colors">
                          <Mail className="h-4 w-4" />
                          <span className="break-all">{resume.data.headerInfo?.email || resume.data.content?.email}</span>
                        </div>
                      )}
                      {(resume.data.headerInfo?.phone || resume.data.content?.phone) && (
                        <div className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                          <Phone className="h-4 w-4" />
                          <span className="break-all">{resume.data.headerInfo?.phone || resume.data.content?.phone}</span>
                        </div>
                      )} */}
                      {(resume.data.headerInfo?.location || resume.data.content?.location) && (
                        <div className="flex items-center gap-1 hover:text-green-600 transition-colors">
                          <MapPin className="h-4 w-4" />
                          <span className="break-all">{resume.data.headerInfo?.location || resume.data.content?.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                   {/* Professional Summary */}
                   {resume.data.content?.summary && (
                     <div className="mb-6">
                       <div className="flex items-center gap-2 mb-3">
                         <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                         <h2 
                           className="text-lg font-semibold text-gray-900"
                           style={{ color: resume.data.template?.primaryColor || '#1f2937' }}
                         >
                           Professional Summary
                         </h2>
                       </div>
                       <p className="text-gray-700 leading-relaxed pl-3 border-l-2 border-gray-200">{resume.data.content.summary}</p>
                     </div>
                   )}

                   {/* Work Experience */}
                   {resume.data.content?.experience && resume.data.content.experience.length > 0 && (
                     <div className="mb-6">
                       <div className="flex items-center gap-2 mb-3">
                         <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-blue-500 rounded-full"></div>
                         <h2 
                           className="text-lg font-semibold text-gray-900"
                           style={{ color: resume.data.template?.primaryColor || '#1f2937' }}
                         >
                           Work Experience
                         </h2>
                       </div>
                       <div className="space-y-4">
                         {resume.data.content.experience.map((exp: any, index: number) => (
                           <div key={index} className="border-l-4 pl-4 hover:border-l-4 hover:border-purple-500 transition-all duration-200" style={{ borderColor: resume.data.template?.secondaryColor || '#6b7280' }}>
                             <div className="flex justify-between items-start mb-2">
                               <h3 className="font-semibold text-gray-900">{exp.title || exp.position}</h3>
                               <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{exp.duration}</span>
                             </div>
                             <p className="text-gray-600 mb-2 font-medium">{exp.company}</p>
                             {exp.description && (
                               <p className="text-gray-700 text-sm">{exp.description}</p>
                             )}
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

                   {/* Education */}
                   {resume.data.content?.education && resume.data.content.education.length > 0 && (
                     <div className="mb-6">
                       <div className="flex items-center gap-2 mb-3">
                         <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                         <h2 
                           className="text-lg font-semibold text-gray-900"
                           style={{ color: resume.data.template?.primaryColor || '#1f2937' }}
                         >
                           Education
                         </h2>
                       </div>
                       <div className="space-y-4">
                         {resume.data.content.education.map((edu: any, index: number) => (
                           <div key={index} className="border-l-4 pl-4 hover:border-l-4 hover:border-indigo-500 transition-all duration-200" style={{ borderColor: resume.data.template?.secondaryColor || '#6b7280' }}>
                             <div className="flex justify-between items-start mb-2">
                               <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                               <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{edu.year}</span>
                             </div>
                             <p className="text-gray-600 mb-2 font-medium">{edu.institution}</p>
                             {edu.major && <p className="text-gray-700 text-sm">Major: {edu.major}</p>}
                             {Array.isArray(edu.highlights) && edu.highlights.length > 0 && (
                               <ul className="list-disc list-inside text-sm text-gray-700 mt-2 space-y-1">
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

                   {/* Skills */}
                   {resume.data.content?.skills && (
                     <div className="mb-6">
                       <div className="flex items-center gap-2 mb-3">
                         <div className="w-1 h-6 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                         <h2 
                           className="text-lg font-semibold text-gray-900"
                           style={{ color: resume.data.template?.primaryColor || '#1f2937' }}
                         >
                           Skills
                         </h2>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {resume.data.content.skills.technical && resume.data.content.skills.technical.length > 0 && (
                           <div>
                             <h3 className="font-medium text-gray-900 mb-3">Technical Skills</h3>
                             <div className="flex flex-wrap gap-2">
                               {resume.data.content.skills.technical.map((skill: string, index: number) => (
                                 <Badge 
                                   key={index} 
                                   variant="secondary" 
                                   style={{ backgroundColor: resume.data.template?.secondaryColor || '#6b7280', color: 'white' }}
                                   className="text-xs px-2 py-1"
                                 >
                                   {skill}
                                 </Badge>
                               ))}
                             </div>
                           </div>
                         )}
                         {resume.data.content.skills.soft && resume.data.content.skills.soft.length > 0 && (
                           <div>
                             <h3 className="font-medium text-gray-900 mb-3">Soft Skills</h3>
                             <div className="flex flex-wrap gap-2">
                               {resume.data.content.skills.soft.map((skill: string, index: number) => (
                                 <Badge 
                                   key={index} 
                                   variant="outline" 
                                   className="text-xs px-2 py-1 border-gray-300 text-gray-700"
                                 >
                                   {skill}
                                 </Badge>
                               ))}
                             </div>
                           </div>
                         )}
                         {resume.data.content.skills.languages && resume.data.content.skills.languages.length > 0 && (
                           <div>
                             <h3 className="font-medium text-gray-900 mb-3">Languages</h3>
                             <div className="flex flex-wrap gap-2">
                               {resume.data.content.skills.languages.map((skill: string, index: number) => (
                                 <Badge 
                                   key={index} 
                                   variant="outline" 
                                   className="text-xs px-2 py-1 border-blue-300 text-blue-700"
                                 >
                                   {skill}
                                 </Badge>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>
                       {/* Fallback for simple skills array */}
                       {!resume.data.content.skills.technical && !resume.data.content.skills.soft && !resume.data.content.skills.languages && Array.isArray(resume.data.content.skills) && (
                         <div className="flex flex-wrap gap-2">
                           {resume.data.content.skills.map((skill: string, index: number) => (
                             <Badge 
                               key={index} 
                               variant="secondary" 
                               style={{ backgroundColor: resume.data.template?.secondaryColor || '#6b7280', color: 'white' }}
                               className="text-xs px-2 py-1"
                             >
                               {skill}
                             </Badge>
                           ))}
                         </div>
                       )}
                     </div>
                   )}

                   {/* Certifications */}
                   {resume.data.content?.certifications && resume.data.content.certifications.length > 0 && (
                     <div className="mb-6">
                       <div className="flex items-center gap-2 mb-3">
                         <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                         <h2 
                           className="text-lg font-semibold text-gray-900"
                           style={{ color: resume.data.template?.primaryColor || '#1f2937' }}
                         >
                           Certifications
                         </h2>
                       </div>
                       <div className="space-y-3">
                         {resume.data.content.certifications.map((cert: string, index: number) => (
                           <div key={index} className="border-l-4 pl-4 hover:border-l-4 hover:border-emerald-500 transition-all duration-200" style={{ borderColor: resume.data.template?.secondaryColor || '#6b7280' }}>
                             <div className="flex items-center gap-2">
                               <Award className="h-4 w-4 text-emerald-600" />
                               <span className="text-gray-700 font-medium">{cert}</span>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Projects */}
                   {resume.data.content?.projects && resume.data.content.projects.length > 0 && (
                     <div className="mb-6">
                       <div className="flex items-center gap-2 mb-3">
                         <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
                         <h2 
                           className="text-lg font-semibold text-gray-900"
                           style={{ color: resume.data.template?.primaryColor || '#1f2937' }}
                         >
                           Projects
                         </h2>
                       </div>
                       <div className="space-y-4">
                         {resume.data.content.projects.map((project: any, index: number) => (
                           <div key={index} className="border-l-4 pl-4 hover:border-l-4 hover:border-violet-500 transition-all duration-200" style={{ borderColor: resume.data.template?.secondaryColor || '#6b7280' }}>
                             <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                             {project.description && (
                               <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                             )}
                             {Array.isArray(project.technologies) && project.technologies.length > 0 && (
                               <div className="mb-2">
                                 <div className="flex flex-wrap gap-1">
                                   {project.technologies.map((tech: string, idx: number) => (
                                     <Badge 
                                       key={idx} 
                                       variant="outline" 
                                       className="text-xs px-2 py-1 border-violet-300 text-violet-700"
                                     >
                                       {tech}
                                     </Badge>
                                   ))}
                                 </div>
                               </div>
                             )}
                             {Array.isArray(project.impact) && project.impact.length > 0 && (
                               <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
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
                   {resume.data.content?.achievements && resume.data.content.achievements.length > 0 && (
                     <div className="mb-6">
                       <div className="flex items-center gap-2 mb-3">
                         <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                         <h2 
                           className="text-lg font-semibold text-gray-900"
                           style={{ color: resume.data.template?.primaryColor || '#1f2937' }}
                         >
                           Achievements
                         </h2>
                       </div>
                       <div className="space-y-3">
                         {resume.data.content.achievements.map((achievement: string, index: number) => (
                           <div key={index} className="border-l-4 pl-4 hover:border-l-4 hover:border-amber-500 transition-all duration-200" style={{ borderColor: resume.data.template?.secondaryColor || '#6b7280' }}>
                             <div className="flex items-center gap-2">
                               <Trophy className="h-4 w-4 text-amber-600" />
                               <span className="text-gray-700">{achievement}</span>
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Organizations */}
                   {resume.data.content?.organizations && resume.data.content.organizations.length > 0 && (
                     <div className="mb-6">
                       <div className="flex items-center gap-2 mb-3">
                         <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-red-500 rounded-full"></div>
                         <h2 
                           className="text-lg font-semibold text-gray-900"
                           style={{ color: resume.data.template?.primaryColor || '#1f2937' }}
                         >
                           Organizations & Activities
                         </h2>
                       </div>
                       <div className="space-y-4">
                         {resume.data.content.organizations.map((org: any, index: number) => (
                           <div key={index} className="border-l-4 pl-4 hover:border-l-4 hover:border-pink-500 transition-all duration-200" style={{ borderColor: resume.data.template?.secondaryColor || '#6b7280' }}>
                             <div className="flex justify-between items-start mb-2">
                               <h3 className="font-semibold text-gray-900">{org.role || org.title}</h3>
                               <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{org.duration}</span>
                             </div>
                             <p className="text-gray-600 mb-2 font-medium">{org.organization || org.company}</p>
                             {org.description && <p className="text-gray-700 text-sm">{org.description}</p>}
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

                   {/* Debug: Show raw data if no structured content found */}
                   {!resume.data.content?.summary && !resume.data.content?.experience && !resume.data.content?.education && !resume.data.content?.skills && !resume.data.content?.certifications && !resume.data.content?.projects && !resume.data.content?.achievements && !resume.data.content?.organizations && !resume.data.content?.name && !resume.data.headerInfo?.name && (
                     <div className="bg-gray-50 p-6 rounded-lg">
                       <p className="text-gray-600 mb-4">
                         No structured content found. Showing raw data:
                       </p>
                       <details>
                         <summary className="text-blue-600 cursor-pointer">Show raw data</summary>
                         <pre className="mt-2 text-xs text-gray-500 overflow-auto">
                           {JSON.stringify(resume.data, null, 2)}
                         </pre>
                       </details>
                     </div>
                   )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No resume content available</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
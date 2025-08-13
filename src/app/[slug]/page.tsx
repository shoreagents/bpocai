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
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
        // Clean up any existing empty strings in the data
        if (data.resume?.data?.content) {
          data.resume.data.content = sanitizeResumeData(data.resume.data.content);
          
          // If we found and cleaned empty strings, update the database immediately
          const hasEmptyStrings = JSON.stringify(data.resume.data.content).includes('""');
          if (hasEmptyStrings) {
            console.log('Found empty strings in loaded data, cleaning up...');
            try {
              const token = await getSessionToken();
              if (token) {
                const cleanContent = sanitizeResumeData(data.resume.data.content);
                await fetch(`/api/user/saved-resume/${slug}`, {
                  method: 'PUT',
                  headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                  },
                  body: JSON.stringify(cleanContent)
                });
                console.log('Database cleaned up automatically');
              }
            } catch (e) {
              console.error('Failed to auto-clean database:', e);
            }
          }
        }
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

  // Try to fetch AI analysis results for the authenticated user
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setAnalysisLoading(true);
        const token = await getSessionToken();
        if (!token) {
          setAnalysis(null);
          return;
        }
        const res = await fetch('/api/user/analysis-results', {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load analysis');
        }
        const data = await res.json();
        if (data?.found && data?.analysis) {
          setAnalysis(data.analysis);
        } else {
          setAnalysis(null);
        }
      } catch (e) {
        setAnalysisError(e instanceof Error ? e.message : 'Failed to load analysis');
      } finally {
        setAnalysisLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

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
      // Set edit mode to true to show delete icons
      setIsEditMode(true);
      // Put current resume content back to localStorage and go to builder
      if (resume?.data) {
        localStorage.setItem('resumeData', JSON.stringify(resume.data.content));
      }
      window.location.href = '/resume-builder/build';
    } catch (e) {}
  };

  const deleteResume = async () => {
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

  const handleDeleteItem = (type: 'skill' | 'certification' | 'achievement' | 'experience-achievement', 
                           index: number,
                           value: string,
                           category?: 'technical' | 'soft' | 'languages', 
                           experienceIndex?: number) => {
    setDeleteItem({ type, category, index, experienceIndex, value });
    setShowDeleteDialog(true);
  };

  // Function to completely sanitize resume data
  const sanitizeResumeData = (data: any) => {
    // Create a completely new object to avoid reference issues
    const cleanedData = JSON.parse(JSON.stringify(data));
    
    if (cleanedData.skills) {
      Object.keys(cleanedData.skills).forEach(category => {
        if (Array.isArray(cleanedData.skills[category])) {
          // Completely rebuild the array without any empty values
          const originalArray = [...cleanedData.skills[category]];
          cleanedData.skills[category] = originalArray
            .filter((item: any) => {
              const isValid = item !== null && item !== undefined && item !== '' && item.toString().trim() !== '';
              if (!isValid) {
                console.log(`Removing invalid item from ${category}:`, item);
              }
              return isValid;
            });
          
          if (originalArray.length !== cleanedData.skills[category].length) {
            console.log(`Sanitized ${category}: removed ${originalArray.length - cleanedData.skills[category].length} invalid entries`);
          }
        }
      });
    }
    
    if (cleanedData.certifications && Array.isArray(cleanedData.certifications)) {
      const originalArray = [...cleanedData.certifications];
      cleanedData.certifications = originalArray
        .filter((item: any) => {
          const isValid = item !== null && item !== undefined && item !== '' && item.toString().trim() !== '';
          if (!isValid) {
            console.log('Removing invalid certification:', item);
          }
          return isValid;
        });
      
      if (originalArray.length !== cleanedData.certifications.length) {
        console.log(`Sanitized certifications: removed ${originalArray.length - cleanedData.certifications.length} invalid entries`);
      }
    }
    
    if (cleanedData.achievements && Array.isArray(cleanedData.achievements)) {
      const originalArray = [...cleanedData.achievements];
      cleanedData.achievements = originalArray
        .filter((item: any) => {
          const isValid = item !== null && item !== undefined && item !== '' && item.toString().trim() !== '';
          if (!isValid) {
            console.log('Removing invalid achievement:', item);
          }
          return isValid;
        });
      
      if (originalArray.length !== cleanedData.achievements.length) {
        console.log(`Sanitized achievements: removed ${originalArray.length - cleanedData.achievements.length} invalid entries`);
      }
    }
    
    if (cleanedData.experience && Array.isArray(cleanedData.experience)) {
      cleanedData.experience.forEach((exp: any, expIndex: number) => {
        if (exp.achievements && Array.isArray(exp.achievements)) {
          const originalArray = [...exp.achievements];
          exp.achievements = originalArray
            .filter((item: any) => {
              const isValid = item !== null && item !== undefined && item !== '' && item.toString().trim() !== '';
              if (!isValid) {
                console.log(`Removing invalid experience achievement from index ${expIndex}:`, item);
              }
              return isValid;
            });
          
          if (originalArray.length !== exp.achievements.length) {
            console.log(`Sanitized experience ${expIndex} achievements: removed ${originalArray.length - exp.achievements.length} invalid entries`);
          }
        }
      });
    }
    
    return cleanedData;
  };

  // Force cleanup function for testing
  const forceCleanup = async () => {
    if (!resume) return;
    
    try {
      const token = await getSessionToken();
      if (!token) {
        alert('Please log in to clean up data.');
        return;
      }
      
      console.log('Original data:', JSON.stringify(resume.data.content.skills, null, 2));
      
      // Create completely clean data
      const cleanContent = sanitizeResumeData(resume.data.content);
      
      console.log('Cleaned data:', JSON.stringify(cleanContent.skills, null, 2));
      
      // Update the database with clean data
      const res = await fetch(`/api/user/saved-resume/${slug}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(cleanContent)
      });
      
      if (!res.ok) {
        throw new Error('Failed to clean up data');
      }
      
      // Update local state
      setResume({ ...resume, data: { ...resume.data, content: cleanContent } });
      alert('Data cleaned up successfully!');
      
      // Reload the page to see the changes
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to clean up data');
    }
  };

  const confirmDeleteItem = async () => {
    if (!deleteItem || !resume) return;

    try {
      const token = await getSessionToken();
      if (!token) {
        alert('Please log in to delete items.');
        return;
      }

      // Create a deep copy of the resume data
      const updatedResume = JSON.parse(JSON.stringify(resume));
      
      // Log the data before deletion for debugging
      console.log('Before deletion:', JSON.stringify(updatedResume.data.content.skills, null, 2));
      
      switch (deleteItem.type) {
        case 'skill':
          if (deleteItem.category && updatedResume.data.content.skills[deleteItem.category]) {
            // Instead of splice, rebuild the array without the deleted item and any empty values
            const originalArray = [...updatedResume.data.content.skills[deleteItem.category]];
            updatedResume.data.content.skills[deleteItem.category] = originalArray
              .filter((skill: string, idx: number) => {
                // Skip the deleted item and any empty/invalid items
                if (idx === deleteItem.index) return false;
                if (!skill || skill.trim() === '') return false;
                return true;
              });
            console.log('After deletion and cleanup:', JSON.stringify(updatedResume.data.content.skills[deleteItem.category], null, 2));
          }
          break;
        case 'certification':
          if (updatedResume.data.content.certifications) {
            updatedResume.data.content.certifications.splice(deleteItem.index, 1);
            updatedResume.data.content.certifications = updatedResume.data.content.certifications
              .filter((cert: string) => cert && cert.trim() !== '');
          }
          break;
        case 'achievement':
          if (updatedResume.data.content.achievements) {
            updatedResume.data.content.achievements.splice(deleteItem.index, 1);
            updatedResume.data.content.achievements = updatedResume.data.content.achievements
              .filter((achievement: string) => achievement && achievement.trim() !== '');
          }
          break;
        case 'experience-achievement':
          if (deleteItem.experienceIndex !== undefined && 
              updatedResume.data.content.experience[deleteItem.experienceIndex]?.achievements) {
            updatedResume.data.content.experience[deleteItem.experienceIndex].achievements.splice(deleteItem.index, 1);
            updatedResume.data.content.experience[deleteItem.experienceIndex].achievements = 
              updatedResume.data.content.experience[deleteItem.experienceIndex].achievements
                .filter((achievement: string) => achievement && achievement.trim() !== '');
          }
          break;
      }

      // Comprehensive cleanup of ALL arrays to remove empty strings and invalid entries
      if (updatedResume.data.content.skills) {
        Object.keys(updatedResume.data.content.skills).forEach(category => {
          if (Array.isArray(updatedResume.data.content.skills[category])) {
            const originalLength = updatedResume.data.content.skills[category].length;
            updatedResume.data.content.skills[category] = updatedResume.data.content.skills[category]
              .filter((item: string) => item && item.trim() !== '');
            const newLength = updatedResume.data.content.skills[category].length;
            if (originalLength !== newLength) {
              console.log(`Cleaned ${category} skills: removed ${originalLength - newLength} empty entries`);
            }
          }
        });
      }
      
      if (updatedResume.data.content.certifications && Array.isArray(updatedResume.data.content.certifications)) {
        const originalLength = updatedResume.data.content.certifications.length;
        updatedResume.data.content.certifications = updatedResume.data.content.certifications
          .filter((cert: string) => cert && cert.trim() !== '');
        const newLength = updatedResume.data.content.certifications.length;
        if (originalLength !== newLength) {
          console.log(`Cleaned certifications: removed ${originalLength - newLength} empty entries`);
        }
      }
      
      if (updatedResume.data.content.achievements && Array.isArray(updatedResume.data.content.achievements)) {
        const originalLength = updatedResume.data.content.achievements.length;
        updatedResume.data.content.achievements = updatedResume.data.content.achievements
          .filter((achievement: string) => achievement && achievement.trim() !== '');
        const newLength = updatedResume.data.content.achievements.length;
        if (originalLength !== newLength) {
          console.log(`Cleaned achievements: removed ${originalLength - newLength} empty entries`);
        }
      }
      
      if (updatedResume.data.content.experience && Array.isArray(updatedResume.data.content.experience)) {
        updatedResume.data.content.experience.forEach((exp: any) => {
          if (exp.achievements && Array.isArray(exp.achievements)) {
            const originalLength = exp.achievements.length;
            exp.achievements = exp.achievements.filter((achievement: string) => achievement && achievement.trim() !== '');
            const newLength = exp.achievements.length;
            if (originalLength !== newLength) {
              console.log(`Cleaned experience achievements: removed ${originalLength - newLength} empty entries`);
            }
          }
        });
      }

      // Log the final cleaned data
      console.log('Final cleaned data:', JSON.stringify(updatedResume.data.content.skills, null, 2));

      // Apply final sanitization to ensure no empty values remain
      const sanitizedContent = sanitizeResumeData(updatedResume.data.content);
      console.log('After sanitization:', JSON.stringify(sanitizedContent.skills, null, 2));
      
      // Double-check: if any empty strings still exist, force remove them
      if (sanitizedContent.skills) {
        Object.keys(sanitizedContent.skills).forEach(category => {
          if (Array.isArray(sanitizedContent.skills[category])) {
            sanitizedContent.skills[category] = sanitizedContent.skills[category]
              .filter((item: any) => item && item !== '' && item.toString().trim() !== '');
            console.log(`Final ${category} skills after double-check:`, sanitizedContent.skills[category]);
          }
        });
      }
      
      // Log the exact data being sent to the database
      console.log('Data being sent to database:', JSON.stringify(sanitizedContent, null, 2));
      console.log('Skills being sent:', JSON.stringify(sanitizedContent.skills, null, 2));

      // Update the resume in the database
      const res = await fetch(`/api/user/saved-resume/${slug}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(sanitizedContent)
      });

      if (!res.ok) {
        throw new Error('Failed to update resume');
      }

      // Update local state
      setResume(updatedResume);
      setShowDeleteDialog(false);
      setDeleteItem(null);
      
      // Force refresh the resume data to ensure consistency
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      alert('Item deleted successfully');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete item');
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
                    <p className="text-gray-300">by {resume.user.fullName}</p>
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

                         {/* Stats Cards */}
             <div className="flex flex-wrap gap-4 justify-center">
               <Card className="glass-card border-white/10 hover:border-purple-500/30 transition-all duration-200 w-auto min-w-[320px] max-w-[380px]">
                 <CardContent className="p-4">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-purple-500/20 rounded-lg">
                       <Eye className="h-5 w-5 text-purple-400" />
                     </div>
                     <div className="min-w-0 flex-1">
                       <p className="text-sm text-gray-400 truncate">Total Views</p>
                       <p className="text-2xl font-bold text-white">{resume.viewCount}</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <Card className="glass-card border-white/10 hover:border-blue-500/30 transition-all duration-200 w-auto min-w-[320px] max-w-[380px]">
                 <CardContent className="p-4">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-blue-500/20 rounded-lg">
                       <Calendar className="h-5 w-5 text-blue-400" />
                     </div>
                     <div className="min-w-0 flex-1">
                       <p className="text-sm text-gray-400 truncate">Created</p>
                       <p className="text-lg font-semibold text-white truncate">{new Date(resume.createdAt).toLocaleDateString()}</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>

               <Card className="glass-card border-white/10 hover:border-green-500/30 transition-all duration-200 w-auto min-w-[320px] max-w-[380px]">
                 <CardContent className="p-4">
                   <div className="flex items-center gap-3">
                     <div className="p-2 bg-green-500/20 rounded-lg">
                       <Star className="h-5 w-5 text-green-400" />
                     </div>
                     <div className="min-w-0 flex-1">
                       <p className="text-sm text-gray-400 truncate">Template</p>
                       <p className="text-lg font-semibold text-white truncate capitalize">{resume.template}</p>
                     </div>
                   </div>
                 </CardContent>
               </Card>
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

          <div className="max-w-5xl w-full mx-auto">
            <Tabs defaultValue="resume" className="space-y-6">
              <div className="flex justify-center">
                <TabsList className="glass-card border-white/20 p-1 bg-black/20">
                  <TabsTrigger value="resume">Resume</TabsTrigger>
                  <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="resume">
                <div 
                  id="resume-content"
                  className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto text-gray-900 [&_*]:text-gray-900 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_p]:text-gray-700 [&_li]:text-gray-700 [&_span]:text-gray-700 [&_.text-gray-700]:text-gray-700 [&_.text-gray-600]:text-gray-600 [&_.text-gray-500]:text-gray-500 [&_.text-gray-900]:text-gray-900"
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
                          <div key={index} className="flex items-center gap-1 group">
                            <Badge 
                              variant="secondary" 
                              style={{ backgroundColor: template.secondaryColor || '#6b7280', color: 'white' }}
                              className="text-xs px-2 py-1"
                            >
                              {skill}
                            </Badge>
                            {isEditMode && (
                              <button
                                onClick={() => handleDeleteItem('skill', index, skill, 'technical')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-xs"
                                title="Delete skill"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {resumeData.skills.soft && resumeData.skills.soft.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Soft Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.soft.map((skill: string, index: number) => (
                          <div key={index} className="flex items-center gap-1 group">
                            <Badge 
                              variant="outline" 
                              className="text-gray-700 border-gray-300 text-xs px-2 py-1"
                            >
                              {skill}
                            </Badge>
                            {isEditMode && (
                              <button
                                onClick={() => handleDeleteItem('skill', index, skill, 'soft')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-xs"
                                title="Delete skill"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                   {resumeData.skills.languages && Array.isArray(resumeData.skills.languages) && resumeData.skills.languages.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.languages.map((language: string, index: number) => (
                          <div key={index} className="flex items-center gap-1 group">
                            <Badge 
                              variant="outline" 
                              className="text-gray-700 border-gray-300 text-xs px-2 py-1"
                            >
                              {language}
                            </Badge>
                            {isEditMode && (
                              <button
                                onClick={() => handleDeleteItem('skill', index, language, 'languages')}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-xs"
                                title="Delete language"
                              >
                                ×
                              </button>
                            )}
                          </div>
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
                    <div key={index} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors group">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{cert}</span>
                      </div>
                      {isEditMode && (
                        <button
                          onClick={() => handleDeleteItem('certification', index, cert)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 text-sm"
                          title="Delete certification"
                        >
                          ×
                        </button>
                      )}
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
                    <div key={index} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg transition-colors group">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-700">{achievement}</span>
                      </div>
                      {isEditMode && (
                        <button
                          onClick={() => handleDeleteItem('achievement', index, achievement)}
                          className="opacity-100 text-red-500 hover:text-red-700 text-sm"
                          title="Delete achievement"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="max-w-4xl w-full mx-auto">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      <Card className="glass-card border-cyan-500/30 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 h-80">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-cyan-400">Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-cyan-400/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-cyan-400/20">
                          <div className="text-4xl font-bold text-white mb-4">{analysis.overallScore ?? 'N/A'}</div>
                          <div className="grid grid-cols-2 gap-3 text-sm text-gray-300">
                            <div className="p-2 rounded bg-cyan-500/10 border border-cyan-400/20">
                              ATS: <span className="text-white font-semibold">{analysis.atsCompatibility ?? '—'}</span>
                            </div>
                            <div className="p-2 rounded bg-cyan-500/10 border border-cyan-400/20">
                              Content: <span className="text-white font-semibold">{analysis.contentQuality ?? '—'}</span>
                            </div>
                            <div className="p-2 rounded bg-cyan-500/10 border border-cyan-400/20">
                              Presentation: <span className="text-white font-semibold">{analysis.professionalPresentation ?? '—'}</span>
                            </div>
                            <div className="p-2 rounded bg-cyan-500/10 border border-cyan-400/20">
                              Alignment: <span className="text-white font-semibold">{analysis.skillsAlignment ?? '—'}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 h-80">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-purple-400">Improved Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-purple-400/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-purple-400/20">
                          <div className="text-gray-300 text-sm leading-relaxed">
                            {analysis.improvedSummary || '—'}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-green-500/30 h-80">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-green-400">Key Strengths</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-green-400/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-green-400/20">
                          {Array.isArray(analysis.keyStrengths) && analysis.keyStrengths.length > 0 ? (
                            <div className="space-y-3">
                              {analysis.keyStrengths.map((s: string, i: number) => (
                                <div
                                  key={i}
                                  className="p-3 rounded-lg bg-green-500/10 border border-green-400/20 text-sm text-gray-200 leading-relaxed"
                                >
                                  {s}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-400 text-sm">—</div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-red-500/5 h-80">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-orange-400">Career Path</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-orange-400/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-orange-400/20 text-sm text-gray-300 space-y-3">
                          {analysis.careerPath ? (
                            <>
                              {analysis.careerPath.currentRole && (
                                <div className="p-2 rounded bg-orange-500/10 border border-orange-400/20">
                                  <span className="text-white font-medium">Current:</span> {analysis.careerPath.currentRole}
                                </div>
                              )}
                              {analysis.careerPath.targetRole && (
                                <div className="p-2 rounded bg-orange-500/10 border border-orange-400/20">
                                  <span className="text-white font-medium">Target:</span> {analysis.careerPath.targetRole}
                                </div>
                              )}
                              {Array.isArray(analysis.careerPath.nextCareerSteps) && analysis.careerPath.nextCareerSteps.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-white font-medium">Next Steps</div>
                                  <ul className="space-y-2">
                                    {analysis.careerPath.nextCareerSteps.map((step: any, i: number) => (
                                      <li key={i} className="p-2 rounded bg-orange-500/10 border border-orange-400/20 text-gray-300">
                                        <span className="text-white font-medium">{step.title}:</span> {step.description}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {analysis.careerPath.timeline && (
                                <div className="p-2 rounded bg-orange-500/10 border border-orange-400/20">
                                  <span className="text-white font-medium">Timeline:</span> {analysis.careerPath.timeline}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-400 text-sm">—</div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-teal-500/30 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 h-80">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-teal-400">Strengths Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-teal-400/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-teal-400/20 text-sm text-gray-300 space-y-3">
                          {analysis.strengthsAnalysis ? (
                            <>
                              {Array.isArray(analysis.strengthsAnalysis.topStrengths) && analysis.strengthsAnalysis.topStrengths.length > 0 && (
                                <div className="space-y-2">
                                  <div className="text-white font-medium">Top Strengths</div>
                                  <ul className="space-y-2">
                                    {analysis.strengthsAnalysis.topStrengths.map((strength: string, i: number) => (
                                      <li key={i} className="p-2 rounded bg-teal-500/10 border border-teal-400/20 text-gray-300">
                                        {strength}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {analysis.strengthsAnalysis.uniqueValue && (
                                <div className="p-2 rounded bg-teal-500/10 border border-teal-400/20">
                                  <span className="text-white font-medium">Unique Value:</span>
                                  <div className="text-gray-300 mt-1">{analysis.strengthsAnalysis.uniqueValue}</div>
                                </div>
                              )}
                              {analysis.strengthsAnalysis.areasToHighlight && (
                                <div className="space-y-2">
                                  <div className="text-white font-medium">Highlight Areas</div>
                                  <ul className="space-y-2">
                                    {analysis.strengthsAnalysis.areasToHighlight.map((area: string, i: number) => (
                                      <li key={i} className="p-2 rounded bg-teal-500/10 border border-teal-400/20 text-gray-300">
                                        {area}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-gray-400 text-sm">—</div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-blue-500/30 h-80">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-blue-400">Salary Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-400/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-blue-400/20 text-sm text-gray-300 space-y-3">
                          <div className="p-2 rounded bg-blue-500/10 border border-blue-400/20">
                            <span className="text-white font-medium">Level:</span> {analysis.salaryAnalysis?.currentLevel || '—'}
                          </div>
                          <div className="p-2 rounded bg-blue-500/10 border border-blue-400/20">
                            <span className="text-white font-medium">Range:</span> {analysis.salaryAnalysis?.recommendedSalaryRange || '—'}
                          </div>
                          {analysis.salaryAnalysis?.marketPosition && (
                            <div className="p-2 rounded bg-blue-500/10 border border-blue-400/20">
                              <span className="text-white font-medium">Market Position:</span> {analysis.salaryAnalysis.marketPosition}
                            </div>
                          )}
                          {analysis.salaryAnalysis?.growthPotential && (
                            <div className="p-2 rounded bg-blue-500/10 border border-blue-400/20">
                              <span className="text-white font-medium">Growth Potential:</span> {analysis.salaryAnalysis.growthPotential}
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="glass-card border-white/20 h-80 lg:col-span-2 xl:col-span-3">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white">Section Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="h-64 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-white/20">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            {['contact','summary','experience','education','skills'].map((sec) => (
                              <div key={sec} className="p-3 rounded-lg border border-white/10 bg-white/5">
                                <div className="text-white font-medium capitalize mb-1">{sec}</div>
                                <div className="text-gray-300">Score: <span className="text-white">{analysis.sectionAnalysis?.[sec]?.score ?? '—'}</span></div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
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

        {/* Delete Item Confirmation Dialog */}
        {showDeleteDialog && deleteItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Item</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete "{deleteItem.value}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeleteItem(null);
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDeleteItem}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

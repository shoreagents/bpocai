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
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LoadingScreen from '@/components/ui/loading-screen';
import Header from '@/components/layout/Header';

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

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Resume Not Found</h1>
            <p className="text-gray-400 mb-8">{error}</p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Resume Not Found</h1>
            <p className="text-gray-400 mb-8">The resume you're looking for doesn't exist.</p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const resumeData = resume.data.content;
  const template = resume.data.template;
  const headerInfo = resume.data.headerInfo;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{resume.title}</h1>
              <p className="text-gray-400 mb-3">by {resume.user.fullName}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {resume.viewCount} views
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(resume.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/10"
                onClick={shareResume}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={exportToPDF}
                disabled={exporting}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25"
              >
                <Download className="h-4 w-4 mr-2" />
                {exporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Resume Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <div 
            id="resume-content"
            className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto"
            style={{
              fontFamily: template.fontFamily,
              color: '#1f2937'
            }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: template.primaryColor }}
              >
                {headerInfo.name}
              </h1>
              <p 
                className="text-xl font-semibold mb-4"
                style={{ color: template.secondaryColor }}
              >
                {headerInfo.title}
              </p>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm text-gray-600">
                {headerInfo.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span className="break-all">{headerInfo.email}</span>
                  </div>
                )}
                {headerInfo.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span className="break-all">{headerInfo.phone}</span>
                  </div>
                )}
                {headerInfo.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="break-all">{headerInfo.location}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator className="mb-6" />

            {/* Summary */}
            {resumeData.summary && (
              <div className="mb-6">
                <h2 
                  className="text-lg font-semibold mb-3"
                  style={{ color: template.primaryColor }}
                >
                  Professional Summary
                </h2>
                <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
              </div>
            )}

            {/* Experience */}
            {resumeData.experience && resumeData.experience.length > 0 && (
              <div className="mb-6">
                <h2 
                  className="text-lg font-semibold mb-3"
                  style={{ color: template.primaryColor }}
                >
                  Work Experience
                </h2>
                <div className="space-y-4">
                  {resumeData.experience.map((exp: any, index: number) => (
                    <div key={index} className="border-l-4 pl-4" style={{ borderColor: template.secondaryColor }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                        <span className="text-sm text-gray-500">{exp.duration}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{exp.company}</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {exp.achievements.map((achievement: string, idx: number) => (
                          <li key={idx}>{achievement}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {resumeData.skills && (
              <div className="mb-6">
                <h2 
                  className="text-lg font-semibold mb-3"
                  style={{ color: template.primaryColor }}
                >
                  Skills
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {resumeData.skills.technical && resumeData.skills.technical.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.technical.map((skill: string, index: number) => (
                          <Badge 
                            key={index} 
                            variant="secondary" 
                            style={{ backgroundColor: template.secondaryColor, color: 'white' }}
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
                  {resumeData.skills.languages && resumeData.skills.languages.length > 0 && (
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
                <h2 
                  className="text-lg font-semibold mb-3"
                  style={{ color: template.primaryColor }}
                >
                  Education
                </h2>
                <div className="space-y-4">
                  {resumeData.education.map((edu: any, index: number) => (
                    <div key={index} className="border-l-4 pl-4" style={{ borderColor: template.secondaryColor }}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                        <span className="text-sm text-gray-500">{edu.year}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{edu.institution}</p>
                      {edu.highlights && edu.highlights.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {edu.highlights.map((highlight: string, idx: number) => (
                            <li key={idx}>{highlight}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {resumeData.certifications && resumeData.certifications.length > 0 && (
              <div className="mb-6">
                <h2 
                  className="text-lg font-semibold mb-3"
                  style={{ color: template.primaryColor }}
                >
                  Certifications
                </h2>
                <div className="space-y-2">
                  {resumeData.certifications.map((cert: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
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
                <h2 
                  className="text-lg font-semibold mb-3"
                  style={{ color: template.primaryColor }}
                >
                  Projects
                </h2>
                <div className="space-y-4">
                  {resumeData.projects.map((project: any, index: number) => (
                    <div key={index} className="border-l-4 pl-4" style={{ borderColor: template.secondaryColor }}>
                      <h3 className="font-semibold text-gray-900 mb-2">{project.title}</h3>
                      <p className="text-gray-600 mb-2">{project.description}</p>
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Technologies: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.technologies.map((tech: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {project.impact && project.impact.length > 0 && (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {project.impact.map((impact: string, idx: number) => (
                            <li key={idx}>{impact}</li>
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
                <h2 
                  className="text-lg font-semibold mb-3"
                  style={{ color: template.primaryColor }}
                >
                  Achievements
                </h2>
                <div className="space-y-2">
                  {resumeData.achievements.map((achievement: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-700">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

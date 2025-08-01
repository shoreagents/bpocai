'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Palette, 
  Type, 
  Move, 
  Eye, 
  EyeOff,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  AlertTriangle,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LoadingScreen from '@/components/ui/loading-screen';
import Header from '@/components/layout/Header';

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  preview: string;
}

interface ResumeSection {
  id: string;
  title: string;
  content: any;
  visible: boolean;
  order: number;
}

interface ImprovedResumeContent {
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    achievements: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    highlights: string[];
  }>;
  certifications: string[];
  projects: Array<{
    title: string;
    description: string;
    technologies: string[];
    impact: string[];
  }>;
  achievements: string[];
}

const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'executive',
    name: 'Executive Power',
    description: 'Bold and authoritative design for senior professionals',
    primaryColor: '#1e293b',
    secondaryColor: '#475569',
    fontFamily: 'Georgia, "Times New Roman", serif',
    preview: 'Dark navy with gold accents, sophisticated layout'
  },
  {
    id: 'tech-innovator',
    name: 'Tech Innovator',
    description: 'Modern tech-focused design with gradient accents',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    fontFamily: '"Courier New", "Roboto Mono", monospace',
    preview: 'Purple gradient with monospace font, tech aesthetic'
  },
  {
    id: 'creative-artist',
    name: 'Creative Artist',
    description: 'Expressive design with artistic flair',
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
    fontFamily: '"Brush Script MT", "Dancing Script", cursive',
    preview: 'Warm orange tones with artistic typography'
  },
  {
    id: 'minimalist-zen',
    name: 'Minimalist Zen',
    description: 'Clean and peaceful design with breathing space',
    primaryColor: '#6b7280',
    secondaryColor: '#9ca3af',
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    preview: 'Subtle grays with generous whitespace'
  },
  {
    id: 'corporate-chic',
    name: 'Corporate Chic',
    description: 'Elegant business design with modern sophistication',
    primaryColor: '#059669',
    secondaryColor: '#047857',
    fontFamily: '"Garamond", "Baskerville", serif',
    preview: 'Emerald green with professional layout'
  },
  {
    id: 'startup-energy',
    name: 'Startup Energy',
    description: 'Dynamic and energetic design for entrepreneurs',
    primaryColor: '#dc2626',
    secondaryColor: '#b91c1c',
    fontFamily: '"Impact", "Arial Black", sans-serif',
    preview: 'Vibrant red with bold, energetic styling'
  },
  {
    id: 'academic-scholar',
    name: 'Academic Scholar',
    description: 'Traditional academic design with scholarly appeal',
    primaryColor: '#1e40af',
    secondaryColor: '#1e3a8a',
    fontFamily: '"Times New Roman", "Bookman Old Style", serif',
    preview: 'Deep blue with classic academic layout'
  },
  {
    id: 'freelance-charm',
    name: 'Freelance Charm',
    description: 'Warm and approachable design for freelancers',
    primaryColor: '#7c2d12',
    secondaryColor: '#92400e',
    fontFamily: '"Comic Sans MS", "Segoe Print", cursive',
    preview: 'Warm brown tones with friendly typography'
  }
];

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(resumeTemplates[0]);
  const [customColors, setCustomColors] = useState({
    primary: resumeTemplates[0].primaryColor,
    secondary: resumeTemplates[0].secondaryColor
  });
  const [improvedResume, setImprovedResume] = useState<ImprovedResumeContent | null>(null);
  const [originalResumeData, setOriginalResumeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    // Get resume data from localStorage
    const resumeData = localStorage.getItem('resumeData');
    if (resumeData) {
      const parsedData = JSON.parse(resumeData);
      setOriginalResumeData(parsedData);
      generateImprovedResume(parsedData);
    } else {
      // No resume data available, show error
      setError('No resume data found. Please upload a resume first.');
    }
  }, []);

  useEffect(() => {
    if (improvedResume) {
      initializeSections();
    }
  }, [improvedResume]);

  const generateImprovedResume = async (resumeData: any) => {
    setIsLoading(true);
    setError(null);
    setProgressValue(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return Math.min(prev + Math.random() * 10, 90);
      });
    }, 800);

    try {
      const response = await fetch('/api/improve-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData,
          sessionId: 'resume-builder'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setProgressValue(100);
        setTimeout(() => {
        setImprovedResume(data.improvedResume);
        }, 500);
      } else {
        setError(data.error || 'Failed to improve resume');
      }
    } catch (error) {
      console.error('Error generating improved resume:', error);
      setError('Failed to generate improved resume. Please try again.');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
      setIsLoading(false);
      }, 1000);
    }
  };

  // Extract header information from original resume data
  const getHeaderInfo = () => {
    if (!originalResumeData) {
      console.log('🔍 DEBUG: No original resume data available');
      return {
        name: 'Name not found',
        title: 'Title not found',
        location: 'Location not found',
        email: 'Email not found',
        phone: 'Phone not found'
      };
    }

    console.log('🔍 DEBUG: Extracting header info from original resume data');
    console.log('  - Original data type:', typeof originalResumeData);
    console.log('  - Original data keys:', Object.keys(originalResumeData));
    console.log('  - Original data structure:', JSON.stringify(originalResumeData, null, 2));

    // Smart field mapping for header data
    const findField = (obj: any, fieldNames: string[]) => {
      for (const field of fieldNames) {
        if (obj[field]) {
          console.log(`  - Found field "${field}":`, obj[field]);
          return obj[field];
        }
      }
      return null;
    };

    const extractFromContact = (obj: any, type: string) => {
      const contactFields = ['contact', 'contact_info', 'personal_info', 'contact_information'];
      for (const field of contactFields) {
        if (obj[field] && obj[field][type]) {
          console.log(`  - Found ${type} in contact field "${field}":`, obj[field][type]);
          return obj[field][type];
        }
      }
      return null;
    };

    const extractFromArray = (obj: any, arrayFields: string[]) => {
      for (const field of arrayFields) {
        if (obj[field] && Array.isArray(obj[field]) && obj[field].length > 0) {
          console.log(`  - Found ${field} array first item:`, obj[field][0]);
          return obj[field][0];
        }
      }
      return null;
    };

    const combineFields = (obj: any, fields: string[]) => {
      const values = fields.map(field => obj[field]).filter(Boolean);
      if (values.length > 0) {
        const result = values.join(' ');
        console.log(`  - Combined fields ${fields.join(', ')}:`, result);
        return result;
      }
      return null;
    };

    // Try to get data from processed resumes if original data doesn't work
    let processedResumes = [];
    try {
      const processedData = localStorage.getItem('bpoc_processed_resumes');
      if (processedData) {
        processedResumes = JSON.parse(processedData);
        console.log('🔍 DEBUG: Found processed resumes:', processedResumes.length);
      }
    } catch (error) {
      console.log('🔍 DEBUG: Error reading processed resumes:', error);
    }

    // Try to extract from first processed resume if available
    let firstProcessedResume = null;
    if (processedResumes.length > 0) {
      firstProcessedResume = processedResumes[0];
      console.log('🔍 DEBUG: First processed resume keys:', Object.keys(firstProcessedResume || {}));
    }

    // Try to extract title from improved resume summary
    let improvedTitle = null;
    if (improvedResume && improvedResume.summary) {
      // Look for common title patterns in the summary - more precise matching
      const titlePatterns = [
        /(?:I am|I'm) a (.+?)(?:\.|,|$)/i,
        /(?:working as|currently serving as) a (.+?)(?:\.|,|$)/i,
        /(?:experienced|skilled|professional) (.+?)(?:\.|,|$)/i,
        /(?:senior|junior|lead|principal) (.+?)(?:\.|,|$)/i,
        /(?:software|web|mobile|data|devops|cloud|full-stack|frontend|backend) (.+?)(?:\.|,|$)/i
      ];
      
      for (const pattern of titlePatterns) {
        const match = improvedResume.summary.match(pattern);
        if (match && match[1]) {
          let extractedTitle = match[1].trim();
          
          // Clean up the title - remove extra descriptions
          if (extractedTitle.includes('with')) {
            extractedTitle = extractedTitle.split('with')[0].trim();
          }
          if (extractedTitle.includes('demonstrated')) {
            extractedTitle = extractedTitle.split('demonstrated')[0].trim();
          }
          if (extractedTitle.includes('expertise')) {
            extractedTitle = extractedTitle.split('expertise')[0].trim();
          }
          if (extractedTitle.includes('and')) {
            extractedTitle = extractedTitle.split('and')[0].trim();
          }
          
          // Only use if it's a reasonable length (not too long)
          if (extractedTitle.length > 3 && extractedTitle.length < 50) {
            improvedTitle = extractedTitle;
            console.log('🔍 DEBUG: Found title in improved summary:', improvedTitle);
            break;
          }
        }
      }
    }

    // Enhanced title extraction from original JSON data
    const extractTitleFromJSON = (data: any) => {
      // Comprehensive list of possible title fields in JSON
      const titleFields = [
        'title', 'job_title', 'position', 'role', 'current_position', 
        'profession', 'occupation', 'job_position', 'job_role', 'current_role',
        'designation', 'job_designation', 'current_job', 'current_title',
        'professional_title', 'work_title', 'employment_title', 'career_title'
      ];
      
      // Try to find title in the main data object
      for (const field of titleFields) {
        if (data[field]) {
          console.log(`🔍 DEBUG: Found title field "${field}":`, data[field]);
          return data[field];
        }
      }
      
      // Try to find title in nested objects
      const nestedObjects = ['contact', 'contact_info', 'personal_info', 'contact_information', 'profile', 'personal'];
      for (const objKey of nestedObjects) {
        if (data[objKey] && typeof data[objKey] === 'object') {
          for (const field of titleFields) {
            if (data[objKey][field]) {
              console.log(`🔍 DEBUG: Found title field "${field}" in "${objKey}":`, data[objKey][field]);
              return data[objKey][field];
            }
          }
        }
      }
      
      // Try to find title in arrays (like experience)
      if (data.experience && Array.isArray(data.experience) && data.experience.length > 0) {
        const firstExperience = data.experience[0];
        for (const field of titleFields) {
          if (firstExperience[field]) {
            console.log(`🔍 DEBUG: Found title field "${field}" in first experience:`, firstExperience[field]);
            return firstExperience[field];
          }
        }
      }
      
      // Try to find title in work_history
      if (data.work_history && Array.isArray(data.work_history) && data.work_history.length > 0) {
        const firstWork = data.work_history[0];
        for (const field of titleFields) {
          if (firstWork[field]) {
            console.log(`🔍 DEBUG: Found title field "${field}" in first work_history:`, firstWork[field]);
            return firstWork[field];
          }
        }
      }
      
      return null;
    };

    const headerInfo = {
      name: findField(originalResumeData, ['name', 'full_name', 'fullName', 'personal_name', 'candidate_name']) ||
            combineFields(originalResumeData, ['first_name', 'last_name']) ||
            extractFromContact(originalResumeData, 'name') ||
            (firstProcessedResume ? findField(firstProcessedResume, ['name', 'full_name', 'fullName', 'personal_name', 'candidate_name']) : null) ||
            'Name not found',
      
      title: extractTitleFromJSON(originalResumeData) ||
             (firstProcessedResume ? extractTitleFromJSON(firstProcessedResume) : null) ||
             improvedTitle ||
             'Title not found',
      
      location: findField(originalResumeData, ['location', 'address', 'city', 'residence', 'current_location']) ||
                extractFromContact(originalResumeData, 'location') ||
                combineFields(originalResumeData, ['city', 'state']) ||
                combineFields(originalResumeData, ['city', 'country']) ||
                (firstProcessedResume ? findField(firstProcessedResume, ['location', 'address', 'city', 'residence', 'current_location']) : null) ||
                'Location not found',
      
      email: findField(originalResumeData, ['email', 'email_address', 'contact_email', 'primary_email']) ||
             extractFromContact(originalResumeData, 'email') ||
             extractFromArray(originalResumeData, ['emails', 'contact_emails']) ||
             (firstProcessedResume ? findField(firstProcessedResume, ['email', 'email_address', 'contact_email', 'primary_email']) : null) ||
             'Email not found',
      
      phone: findField(originalResumeData, ['phone', 'phone_number', 'contact_phone', 'mobile', 'telephone']) ||
             extractFromContact(originalResumeData, 'phone') ||
             extractFromArray(originalResumeData, ['phones', 'phone_numbers']) ||
             (firstProcessedResume ? findField(firstProcessedResume, ['phone', 'phone_number', 'contact_phone', 'mobile', 'telephone']) : null) ||
             'Phone not found'
    };

    console.log('🔍 DEBUG: Final extracted header info:', headerInfo);
    return headerInfo;
  };

  const initializeSections = () => {
    if (!improvedResume) return;

    const initialSections: ResumeSection[] = [
      {
        id: 'summary',
        title: 'Professional Summary',
        content: improvedResume.summary,
        visible: true,
        order: 1
      },
      {
        id: 'experience',
        title: 'Work Experience',
        content: improvedResume.experience,
        visible: true,
        order: 2
      },
      {
        id: 'skills',
        title: 'Skills',
        content: improvedResume.skills,
        visible: true,
        order: 3
      },
      {
        id: 'education',
        title: 'Education',
        content: improvedResume.education,
        visible: true,
        order: 4
      },
      {
        id: 'certifications',
        title: 'Certifications',
        content: improvedResume.certifications,
        visible: true,
        order: 5
      },
      {
        id: 'projects',
        title: 'Projects',
        content: improvedResume.projects,
        visible: true,
        order: 6
      },
      {
        id: 'achievements',
        title: 'Achievements',
        content: improvedResume.achievements,
        visible: true,
        order: 7
      }
    ];

    setSections(initialSections);
  };

  const handleTemplateChange = (template: ResumeTemplate) => {
    setSelectedTemplate(template);
    setCustomColors({
      primary: template.primaryColor,
      secondary: template.secondaryColor
    });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  };

  const handleDragStart = (sectionId: string) => {
    setDraggedSection(sectionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetSectionId: string) => {
    if (!draggedSection || draggedSection === targetSectionId) return;

    setSections(prev => {
      const draggedSectionData = prev.find(s => s.id === draggedSection);
      const targetSectionData = prev.find(s => s.id === targetSectionId);
      
      if (!draggedSectionData || !targetSectionData) return prev;

      return prev.map(section => {
        if (section.id === draggedSection) {
          return { ...section, order: targetSectionData.order };
        } else if (section.id === targetSectionId) {
          return { ...section, order: draggedSectionData.order };
        }
        return section;
      }).sort((a, b) => a.order - b.order);
    });

    setDraggedSection(null);
  };

  const exportToPDF = async () => {
    const element = document.getElementById('resume-content');
    if (!element) {
      alert('Resume content not found. Please try again.');
      return;
    }

    try {
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

      pdf.save('improved-resume.pdf');
      console.log('PDF saved successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error generating PDF. Please try again. Error: ' + (error as Error).message);
    }
  };

  const renderSectionContent = (section: ResumeSection) => {
    switch (section.id) {
      case 'summary':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Professional Summary
            </h3>
            <p className="text-gray-700 leading-relaxed">{section.content}</p>
          </div>
        );

      case 'experience':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Work Experience
            </h3>
            {Array.isArray(section.content) ? (
              section.content.map((exp: any, index: number) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{exp.title}</h4>
                    <span className="text-sm text-gray-500">{exp.duration}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {Array.isArray(exp.achievements) ? 
                      exp.achievements.map((achievement: string, idx: number) => (
                        <li key={idx}>{achievement}</li>
                      )) : 
                      <li>No achievements listed</li>
                    }
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No work experience data available</p>
            )}
          </div>
        );

      case 'skills':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(section.content?.technical) ? 
                    section.content.technical.map((skill: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        style={{ backgroundColor: customColors.secondary, color: 'white' }}
                        className="text-xs px-2 py-1 whitespace-normal break-words"
                      >
                        {skill}
                      </Badge>
                    )) : 
                    <p className="text-gray-500 text-sm">No technical skills available</p>
                  }
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Soft Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(section.content?.soft) ? 
                    section.content.soft.map((skill: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-gray-700 border-gray-300 text-xs px-2 py-1 whitespace-normal break-words"
                      >
                        {skill}
                      </Badge>
                    )) : 
                    <p className="text-gray-500 text-sm">No soft skills available</p>
                  }
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(section.content?.languages) ? 
                    section.content.languages.map((language: string, index: number) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="text-gray-700 border-gray-300 text-xs px-2 py-1 whitespace-normal break-words"
                      >
                        {language}
                      </Badge>
                    )) : 
                    <p className="text-gray-500 text-sm">No languages available</p>
                  }
                </div>
              </div>
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Education
            </h3>
            {Array.isArray(section.content) ? (
              section.content.map((edu: any, index: number) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                    <span className="text-sm text-gray-500">{edu.year}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{edu.institution}</p>
                  {Array.isArray(edu.highlights) && edu.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {edu.highlights.map((highlight: string, idx: number) => (
                        <li key={idx}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No education data available</p>
            )}
          </div>
        );

      case 'certifications':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(section.content) ? 
                section.content.map((cert: string, index: number) => (
                  <Badge key={index} variant="secondary" style={{ backgroundColor: customColors.secondary, color: 'white' }}>
                    {cert}
                  </Badge>
                )) : 
                <p className="text-gray-500">No certifications available</p>
              }
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Projects
            </h3>
            {Array.isArray(section.content) ? (
              section.content.map((project: any, index: number) => (
                <div key={index} className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                  <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Array.isArray(project.technologies) ? 
                      project.technologies.map((tech: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs text-gray-700 border-gray-300">
                          {tech}
                        </Badge>
                      )) : 
                      <p className="text-gray-500 text-sm">No technologies listed</p>
                    }
                  </div>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {Array.isArray(project.impact) ? 
                      project.impact.map((impact: string, idx: number) => (
                        <li key={idx}>{impact}</li>
                      )) : 
                      <li>No impact details available</li>
                    }
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No projects data available</p>
            )}
          </div>
        );

      case 'achievements':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Achievements
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              {Array.isArray(section.content) ? 
                section.content.map((achievement: string, index: number) => (
                  <li key={index}>{achievement}</li>
                )) : 
                <li>No achievements available</li>
              }
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <LoadingScreen 
          title="Generating Your Improved Resume"
          subtitle="Claude AI is enhancing your resume content..."
          progressValue={progressValue}
          showProgress={true}
          showStatusIndicators={true}
        />
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-8">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
            <p className="text-gray-300 mb-6">{error}</p>
            <Button
              onClick={() => router.push('/resume-builder')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resume Upload
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <div className="pt-16 relative z-10">
      <div className="container mx-auto px-4 py-8">
          {/* Enhanced Header */}
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
                    <AlertDialogTitle className="text-white">Leave Generated Resume?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      Are you sure you want to go back to the resume builder? Any unsaved changes will be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => router.push('/resume-builder')}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Yes, Go Back
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <div className="flex items-center">
                <Type className="h-12 w-12 text-cyan-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Generated Resume</h1>
                  <p className="text-gray-400">Your AI-enhanced professional resume</p>
                </div>
              </div>
          </div>
          
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="border-white/20 text-gray-300 hover:bg-white/10"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
          <Button
            onClick={exportToPDF}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
          </motion.div>

        <div className="space-y-8">
            {/* Compact Template Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-white/10 shadow-lg">
                <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-white text-lg">
                    <Palette className="h-5 w-5 mr-2 text-cyan-400" />
                Choose Template
              </CardTitle>
                  <p className="text-sm text-gray-400">Select your preferred style</p>
            </CardHeader>
            <CardContent>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {resumeTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedTemplate.id === template.id
                              ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/50 shadow-lg shadow-cyan-500/25'
                          : 'border-white/10 hover:border-white/30 hover:bg-white/5'
                      }`}
                      onClick={() => handleTemplateChange(template)}
                    >
                          <CardContent className="p-2">
                        <div className="text-center">
                              <div className="text-lg mb-1">
                            {template.id === 'executive' && '💼'}
                            {template.id === 'tech-innovator' && '⚡'}
                            {template.id === 'creative-artist' && '🎨'}
                            {template.id === 'minimalist-zen' && '🧘'}
                            {template.id === 'corporate-chic' && '👔'}
                            {template.id === 'startup-energy' && '🚀'}
                            {template.id === 'academic-scholar' && '📚'}
                            {template.id === 'freelance-charm' && '✨'}
                          </div>
                              <h4 className="font-medium text-white text-xs">{template.name}</h4>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
            </motion.div>

            {/* Enhanced Main Content Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 xl:grid-cols-5 gap-8"
            >
              {/* Enhanced Left Sidebar - Section Management */}
            <div className="xl:col-span-1">
                <Card className="glass-card border-white/10 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-white text-lg">
                      <Move className="h-5 w-5 mr-2 text-cyan-400" />
                      Manage Sections
                    </CardTitle>
                    <p className="text-sm text-gray-400">Drag to reorder, click to toggle visibility</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {sections.map((section) => (
                        <motion.div
                          key={section.id}
                          draggable
                          onDragStart={() => handleDragStart(section.id)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(section.id)}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-move transition-all duration-200 ${
                            draggedSection === section.id
                              ? 'border-cyan-500 bg-cyan-500/20 shadow-lg shadow-cyan-500/25'
                              : 'border-white/10 hover:border-white/30 hover:bg-white/5 hover:shadow-lg'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Move className="h-4 w-4 text-gray-400" />
                            <span className="text-white text-sm font-medium">{section.title}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleSectionVisibility(section.id)}
                            className="text-gray-400 hover:text-white p-1"
                          >
                            {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Color Customization - Moved here and not sticky */}
                <Card className="glass-card border-white/10 shadow-lg mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-white text-sm">
                      <Palette className="h-4 w-4 mr-2" />
                      Color Customization
                      <div className="ml-auto flex gap-1">
                        <div
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: customColors.primary }}
                        />
                        <div
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: customColors.secondary }}
                        />
              </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-300 mb-2 block">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customColors.primary}
                          onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                          className="w-10 h-8 rounded border border-white/20 bg-white/5 cursor-pointer"
                        />
                        <span className="text-xs text-gray-400 font-mono">{customColors.primary}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-300 mb-2 block">Secondary Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={customColors.secondary}
                          onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                          className="w-10 h-8 rounded border border-white/20 bg-white/5 cursor-pointer"
                        />
                        <span className="text-xs text-gray-400 font-mono">{customColors.secondary}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            </div>

              {/* Enhanced Main Content - Resume Preview */}
            <div className="xl:col-span-4">
                <Card className="glass-card border-white/10 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-xl flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-cyan-400" />
                        Resume Preview
                      </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>Template:</span>
                      <span className="font-medium text-white">{selectedTemplate.name}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div
                      id="resume-content"
                      className="bg-white rounded-lg p-8 shadow-2xl w-full max-w-4xl"
                      style={{ 
                        fontFamily: selectedTemplate.fontFamily,
                        minHeight: '297mm',
                        boxSizing: 'border-box',
                        overflow: 'visible',
                        position: 'relative',
                        zIndex: 1,
                        ...(selectedTemplate.id === 'executive' && {
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          border: '2px solid #1e293b'
                        }),
                        ...(selectedTemplate.id === 'tech-innovator' && {
                          background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                          border: '1px solid #6366f1'
                        }),
                        ...(selectedTemplate.id === 'creative-artist' && {
                          background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                          border: '2px solid #f59e0b'
                        }),
                        ...(selectedTemplate.id === 'minimalist-zen' && {
                          background: '#ffffff',
                          border: '1px solid #e5e7eb'
                        }),
                        ...(selectedTemplate.id === 'corporate-chic' && {
                          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
                          border: '2px solid #059669'
                        }),
                        ...(selectedTemplate.id === 'startup-energy' && {
                          background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
                          border: '2px solid #dc2626'
                        }),
                        ...(selectedTemplate.id === 'academic-scholar' && {
                          background: '#ffffff',
                          border: '1px solid #1e40af'
                        }),
                        ...(selectedTemplate.id === 'freelance-charm' && {
                          background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)',
                          border: '2px solid #7c2d12'
                        })
                      }}
                    >
                      {/* Header */}
                      <div 
                        className="text-center mb-8 pb-6 border-b-2" 
                        style={{ 
                          borderColor: customColors.primary,
                          ...(selectedTemplate.id === 'executive' && {
                            borderBottomWidth: '3px',
                            borderBottomStyle: 'solid'
                          }),
                          ...(selectedTemplate.id === 'tech-innovator' && {
                            borderBottomStyle: 'dashed'
                          }),
                          ...(selectedTemplate.id === 'creative-artist' && {
                            borderBottomStyle: 'double',
                            borderBottomWidth: '4px'
                          }),
                          ...(selectedTemplate.id === 'startup-energy' && {
                            borderBottomStyle: 'solid',
                            borderBottomWidth: '3px',
                            background: 'linear-gradient(90deg, transparent 0%, rgba(220, 38, 38, 0.1) 50%, transparent 100%)'
                          })
                        }}
                      >
                        <h1 
                          className="text-3xl font-bold text-gray-900 mb-2"
                          style={{
                            ...(selectedTemplate.id === 'executive' && { color: '#1e293b' }),
                            ...(selectedTemplate.id === 'tech-innovator' && { color: '#6366f1' }),
                            ...(selectedTemplate.id === 'creative-artist' && { color: '#f59e0b' }),
                            ...(selectedTemplate.id === 'corporate-chic' && { color: '#059669' }),
                            ...(selectedTemplate.id === 'startup-energy' && { color: '#dc2626' }),
                            ...(selectedTemplate.id === 'academic-scholar' && { color: '#1e40af' }),
                            ...(selectedTemplate.id === 'freelance-charm' && { color: '#7c2d12' })
                          }}
                        >
                          {getHeaderInfo().name}
                        </h1>
                        <p className="text-gray-600">{getHeaderInfo().title} • {getHeaderInfo().location}</p>
                        <p className="text-gray-600">{getHeaderInfo().email} • {getHeaderInfo().phone}</p>
                      </div>

                      {/* Sections */}
                      <AnimatePresence>
                        {sections
                          .filter(section => section.visible)
                          .sort((a, b) => a.order - b.order)
                          .map((section) => (
                            <motion.div
                              key={section.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                            >
                              {renderSectionContent(section)}
                            </motion.div>
                          ))}
                      </AnimatePresence>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>


                </div>
      </div>
    </div>
  );
}
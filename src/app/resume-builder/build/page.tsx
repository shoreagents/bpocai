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
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean and contemporary design with strong typography',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    fontFamily: 'Inter',
    preview: 'Modern layout with blue accent'
  },
  {
    id: 'classic',
    name: 'Classic Elegant',
    description: 'Traditional format with sophisticated styling',
    primaryColor: '#374151',
    secondaryColor: '#1f2937',
    fontFamily: 'Georgia',
    preview: 'Traditional black and gray design'
  },
  {
    id: 'creative',
    name: 'Creative Bold',
    description: 'Eye-catching design with vibrant colors',
    primaryColor: '#7c3aed',
    secondaryColor: '#5b21b6',
    fontFamily: 'Poppins',
    preview: 'Purple accent with modern typography'
  },
  {
    id: 'minimal',
    name: 'Minimal Clean',
    description: 'Simple and focused on content',
    primaryColor: '#059669',
    secondaryColor: '#047857',
    fontFamily: 'Roboto',
    preview: 'Green accent with clean layout'
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
        setImprovedResume(data.improvedResume);
      } else {
        setError(data.error || 'Failed to improve resume');
      }
    } catch (error) {
      console.error('Error generating improved resume:', error);
      setError('Failed to generate improved resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Extract header information from original resume data
  const getHeaderInfo = () => {
    if (!originalResumeData) {
      console.log('🔍 DEBUG: No original resume data available');
      return {
        name: 'Your Name',
        title: 'Your Title',
        location: 'Your Location',
        email: 'your.email@example.com',
        phone: '+63 912 345 6789'
      };
    }

    console.log('🔍 DEBUG: Extracting header info from original resume data');
    console.log('  - Original data keys:', Object.keys(originalResumeData));

    // Smart field mapping for header data
    const findField = (obj: any, fieldNames: string[]) => {
      for (const field of fieldNames) {
        if (obj[field]) return obj[field];
      }
      return null;
    };

    const extractFromContact = (obj: any, type: string) => {
      const contactFields = ['contact', 'contact_info', 'personal_info', 'contact_information'];
      for (const field of contactFields) {
        if (obj[field] && obj[field][type]) return obj[field][type];
      }
      return null;
    };

    const extractFromArray = (obj: any, arrayFields: string[]) => {
      for (const field of arrayFields) {
        if (obj[field] && Array.isArray(obj[field]) && obj[field].length > 0) {
          return obj[field][0];
        }
      }
      return null;
    };

    const combineFields = (obj: any, fields: string[]) => {
      const values = fields.map(field => obj[field]).filter(Boolean);
      return values.length > 0 ? values.join(' ') : null;
    };

    const headerInfo = {
      name: findField(originalResumeData, ['name', 'full_name', 'fullName', 'personal_name', 'candidate_name']) ||
            combineFields(originalResumeData, ['first_name', 'last_name']) ||
            extractFromContact(originalResumeData, 'name') ||
            'Your Name',
      
      title: findField(originalResumeData, ['title', 'job_title', 'position', 'role', 'current_position']) ||
             'Your Title',
      
      location: findField(originalResumeData, ['location', 'address', 'city', 'residence', 'current_location']) ||
                extractFromContact(originalResumeData, 'location') ||
                combineFields(originalResumeData, ['city', 'state']) ||
                combineFields(originalResumeData, ['city', 'country']) ||
                'Your Location',
      
      email: findField(originalResumeData, ['email', 'email_address', 'contact_email', 'primary_email']) ||
             extractFromContact(originalResumeData, 'email') ||
             extractFromArray(originalResumeData, ['emails', 'contact_emails']) ||
             'your.email@example.com',
      
      phone: findField(originalResumeData, ['phone', 'phone_number', 'contact_phone', 'mobile', 'telephone']) ||
             extractFromContact(originalResumeData, 'phone') ||
             extractFromArray(originalResumeData, ['phones', 'phone_numbers']) ||
             '+63 912 345 6789'
    };

    console.log('🔍 DEBUG: Extracted header info:', headerInfo);
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
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
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

      pdf.save('improved-resume.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
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
            {section.content.map((exp: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{exp.title}</h4>
                  <span className="text-sm text-gray-500">{exp.duration}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{exp.company}</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {exp.achievements.map((achievement: string, idx: number) => (
                    <li key={idx}>{achievement}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'skills':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Technical Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {section.content.technical.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" style={{ backgroundColor: customColors.secondary, color: 'white' }}>
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Soft Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {section.content.soft.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {section.content.languages.map((language: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {language}
                    </Badge>
                  ))}
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
            {section.content.map((edu: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                  <span className="text-sm text-gray-500">{edu.year}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{edu.institution}</p>
                {edu.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {edu.highlights.map((highlight: string, idx: number) => (
                      <li key={idx}>{highlight}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        );

      case 'certifications':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              {section.content.map((cert: string, index: number) => (
                <Badge key={index} variant="secondary" style={{ backgroundColor: customColors.secondary, color: 'white' }}>
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Projects
            </h3>
            {section.content.map((project: any, index: number) => (
              <div key={index} className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{project.title}</h4>
                <p className="text-sm text-gray-700 mb-2">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {project.technologies.map((tech: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {project.impact.map((impact: string, idx: number) => (
                    <li key={idx}>{impact}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );

      case 'achievements':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Achievements
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              {section.content.map((achievement: string, index: number) => (
                <li key={index}>{achievement}</li>
              ))}
            </ul>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Generating Your Improved Resume</h2>
          <p className="text-gray-300">Claude AI is enhancing your resume content...</p>
        </div>
      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Analysis
          </Button>
          
          <div className="flex gap-4">
            <Button
              onClick={exportToPDF}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Template Selection & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Template Selection */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Type className="h-5 w-5 mr-2" />
                  Resume Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resumeTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedTemplate.id === template.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      onClick={() => handleTemplateChange(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-white">{template.name}</h4>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: template.primaryColor }}
                          />
                        </div>
                        <p className="text-sm text-gray-300">{template.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            {/* Color Customization */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Palette className="h-5 w-5 mr-2" />
                  Customize Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Primary Color</label>
                  <input
                    type="color"
                    value={customColors.primary}
                    onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                    className="w-full h-10 rounded border border-white/20 bg-white/5"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 mb-2 block">Secondary Color</label>
                  <input
                    type="color"
                    value={customColors.secondary}
                    onChange={(e) => setCustomColors(prev => ({ ...prev, secondary: e.target.value }))}
                    className="w-full h-10 rounded border border-white/20 bg-white/5"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Section Management */}
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Move className="h-5 w-5 mr-2" />
                  Manage Sections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sections.map((section) => (
                    <motion.div
                      key={section.id}
                      draggable
                      onDragStart={() => handleDragStart(section.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(section.id)}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-move transition-all ${
                        draggedSection === section.id
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center">
                        <Move className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-white text-sm">{section.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSectionVisibility(section.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        {section.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resume Preview */}
          <div className="lg:col-span-3">
            <Card className="glass-card border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Resume Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  id="resume-content"
                  className="bg-white rounded-lg p-8 shadow-lg"
                  style={{ fontFamily: selectedTemplate.fontFamily }}
                >
                  {/* Header */}
                  <div className="text-center mb-8 pb-6 border-b-2" style={{ borderColor: customColors.primary }}>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{getHeaderInfo().name}</h1>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
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
  Share2,
  CheckCircle,
  Briefcase,
  Wrench,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import LoadingScreen from '@/components/ui/loading-screen';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionToken } from '@/lib/auth-helpers';
import { cleanupLocalStorageAfterSave } from '@/lib/utils';

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
  name: string;
  bestJobTitle: string;
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
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>(resumeTemplates[0]);
  const [customColors, setCustomColors] = useState({
    primary: resumeTemplates[0].primaryColor,
    secondary: resumeTemplates[0].secondaryColor
  });
  const [improvedResume, setImprovedResume] = useState<ImprovedResumeContent | null>(null);
  const [originalResumeData, setOriginalResumeData] = useState<any>(null);
  const [extractedFallback, setExtractedFallback] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sections, setSections] = useState<ResumeSection[]>([]);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [savedResumeUrl, setSavedResumeUrl] = useState<string>('');
  const [hasSavedResume, setHasSavedResume] = useState(false);
  const [isDeletingSaved, setIsDeletingSaved] = useState(false);

  useEffect(() => {
    // Get resume data from localStorage
    const resumeData = localStorage.getItem('resumeData');
    if (resumeData) {
      const parsedData = JSON.parse(resumeData);
      setOriginalResumeData(parsedData);
      generateImprovedResume(parsedData);
    } else {
      // No resume data available locally, still attempt to fetch extracted fallback from server
      setError('No resume data found. Please upload a resume first.');
    }

    // Also fetch latest extracted resume as a fallback for header info (email/phone/location)
    (async () => {
      try {
        const sessionToken = await getSessionToken();
        if (!sessionToken) return;
        const res = await fetch('/api/user/extracted-resume', {
          headers: { Authorization: `Bearer ${sessionToken}` },
          cache: 'no-store'
        });
        const resText = await res.text();
        try {
          const json = JSON.parse(resText);
          if (res.ok && json?.hasData) setExtractedFallback(json.resumeData);
        } catch {
          // Non-JSON response (e.g., 500 HTML); ignore
        }
      } catch {}
    })();

    // Check if user has a saved resume to conditionally show Delete button
    (async () => {
      try {
        const sessionToken = await getSessionToken();
        if (!sessionToken || !user?.id) return;
        const res = await fetch('/api/user/saved-resumes', {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'x-user-id': String(user.id)
          },
          cache: 'no-store'
        });
        const text = await res.text();
        let data: any = null;
        try { data = JSON.parse(text); } catch {}
        if (res.ok && data?.success) {
          setHasSavedResume(Boolean(data.hasSavedResume));
        }
      } catch {}
    })();
  }, []);

  // Re-check when user becomes available (fixes initial mount with undefined user.id)
  useEffect(() => {
    (async () => {
      try {
        if (!user?.id) return;
        const sessionToken = await getSessionToken();
        if (!sessionToken) return;
        const res = await fetch('/api/user/saved-resumes', {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'x-user-id': String(user.id)
          },
          cache: 'no-store'
        });
        const text = await res.text();
        let data: any = null;
        try { data = JSON.parse(text); } catch {}
        if (res.ok && data?.success) {
          setHasSavedResume(Boolean(data.hasSavedResume));
        }
      } catch {}
    })();
  }, [user?.id]);

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

      const text = await response.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch {}
      if (response.ok && data?.success) {
        setProgressValue(100);
        setTimeout(() => {
          setImprovedResume(data.improvedResume);
          
          // Save the generated resume data to database
          saveGeneratedResumeToDatabase(data.improvedResume, resumeData);
        }, 500);
      } else {
        setError((data && data.error) || text || 'Failed to improve resume');
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

  // Helper: set a deep value on an object given a path like "summary" or "experience[0].achievements[1]"
  const setDeepValue = (target: any, path: string, value: unknown): any => {
    if (!path) return target;
    const normalized = path
      .replace(/\[(\d+)\]/g, '.$1')
      .split('.')
      .filter(Boolean);
    let cursor: any = target;
    for (let i = 0; i < normalized.length - 1; i++) {
      const key = isNaN(Number(normalized[i])) ? normalized[i] : Number(normalized[i]);
      if (cursor[key] === undefined || cursor[key] === null) {
        // Create missing container (object or array)
        const nextKey = normalized[i + 1];
        cursor[key] = isNaN(Number(nextKey)) ? {} : [];
      }
      cursor = cursor[key];
    }
    const lastKey = normalized[normalized.length - 1];
    cursor[isNaN(Number(lastKey)) ? lastKey : Number(lastKey)] = value;
    return target;
  };

  // Public function: update resume text inline in the preview
  // Usage example: updateResumeText('summary', 'New professional summary...')
  //                updateResumeText('experience[0].title', 'Senior Developer')
  const updateResumeText = (fieldPath: string, newValue: string) => {
    if (!improvedResume) return;

    // 1) Update the improved resume content (source of truth for saving)
    const updatedResume = JSON.parse(JSON.stringify(improvedResume));
    setDeepValue(updatedResume, fieldPath, newValue);
    // Defer state update slightly to avoid interrupting contentEditable typing
    window.requestAnimationFrame(() => setImprovedResume(updatedResume));

    // 2) Keep the visible preview sections in sync for immediate UI feedback
    const getSectionIdFromPath = (path: string): string | null => {
      if (path.startsWith('summary')) return 'summary';
      if (path.startsWith('experience')) return 'experience';
      if (path.startsWith('skills')) return 'skills';
      if (path.startsWith('education')) return 'education';
      if (path.startsWith('certifications')) return 'certifications';
      if (path.startsWith('projects')) return 'projects';
      if (path.startsWith('achievements')) return 'achievements';
      return null;
    };

    const sectionId = getSectionIdFromPath(fieldPath);
    if (sectionId) {
      window.requestAnimationFrame(() => {
        setSections(prevSections => prevSections.map(section => {
          if (section.id !== sectionId) return section;
          const updatedContent = (updatedResume as any)[sectionId];
          return { ...section, content: updatedContent };
        }));
      });
    }
  };

  // Highlight state for newly added fields
  const [highlightPath, setHighlightPath] = useState<string | null>(null);
  const isHighlighted = (path: string) => highlightPath === path;
  const getHighlightClass = (path: string) => (isHighlighted(path) ? 'ring-2 ring-cyan-400 rounded-sm bg-cyan-50' : '');
  const isGroupHighlighted = (rootPath: string) => !!highlightPath && (highlightPath === rootPath || highlightPath.startsWith(rootPath + '.'));
  const getGroupHighlightClass = (rootPath: string) => (isGroupHighlighted(rootPath) ? 'ring-2 ring-cyan-400 rounded-sm bg-cyan-50' : '');
  useEffect(() => {
    if (!highlightPath) return;
    // Focus the newly added element if present
    try {
      const target = document.querySelector<HTMLElement>(`[data-path="${highlightPath}"]`);
      if (target) {
        target.focus();
        if ((target as any).isContentEditable) {
          const range = document.createRange();
          range.selectNodeContents(target);
          range.collapse(false);
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } else if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
          const len = (target as HTMLInputElement | HTMLTextAreaElement).value?.length ?? 0;
          (target as HTMLInputElement | HTMLTextAreaElement).setSelectionRange?.(len, len);
        }
      }
    } catch {}
    const timer = setTimeout(() => setHighlightPath(null), 2500);
    return () => clearTimeout(timer);
  }, [highlightPath]);

  // Add / Remove item helpers
  const addListItem = (containerPath: string, defaultValue: any, highlightSubField?: string) => {
    if (!improvedResume) return;
    const updated = JSON.parse(JSON.stringify(improvedResume));
    const path = containerPath.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let cursor: any = updated;
    for (let i = 0; i < path.length; i++) {
      const key = isNaN(Number(path[i])) ? path[i] : Number(path[i]);
      if (i === path.length - 1) {
        if (!Array.isArray(cursor[key])) cursor[key] = [];
        cursor[key].push(defaultValue);
        const newIndex = cursor[key].length - 1;
        const basePath = `${containerPath}[${newIndex}]`;
        const targetPath = highlightSubField ? `${basePath}.${highlightSubField}` : basePath;
        setHighlightPath(targetPath);
      } else {
        if (cursor[key] == null) cursor[key] = {};
        cursor = cursor[key];
      }
    }
    window.requestAnimationFrame(() => setImprovedResume(updated));
    const rootId = path[0];
    window.requestAnimationFrame(() => setSections(prev => prev.map(s => s.id === rootId ? { ...s, content: (updated as any)[rootId] } : s)));
  };

  const removeListItem = (containerPath: string, index: number) => {
    if (!improvedResume) return;
    const updated = JSON.parse(JSON.stringify(improvedResume));
    const path = containerPath.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
    let cursor: any = updated;
    for (let i = 0; i < path.length; i++) {
      const key = isNaN(Number(path[i])) ? path[i] : Number(path[i]);
      if (i === path.length - 1) {
        if (Array.isArray(cursor[key])) cursor[key].splice(index, 1);
      } else {
        if (cursor[key] == null) return;
        cursor = cursor[key];
      }
    }
    window.requestAnimationFrame(() => setImprovedResume(updated));
    const rootId = path[0];
    window.requestAnimationFrame(() => setSections(prev => prev.map(s => s.id === rootId ? { ...s, content: (updated as any)[rootId] } : s)));
  };

  // Lightweight inline editor that preserves visual presentation
  type EditableProps = {
    as?: any;
    value: string;
    onChange: (val: string) => void;
    className?: string;
    multiline?: boolean;
    placeholder?: string;
  };

  const Editable = ({ as = 'span', value, onChange, className = '', multiline = false, placeholder = '' }: EditableProps) => {
    const Tag: any = as;
    const ref = React.useRef<HTMLElement | null>(null);
    const [isFocused, setIsFocused] = React.useState(false);
    const latestTextRef = React.useRef<string>(value || '');

    // Keep DOM in sync only when not focused to avoid caret jump
    React.useEffect(() => {
      const el = ref.current;
      if (!el) return;
      if (!isFocused && (el.textContent || '') !== (value || '')) {
        el.textContent = value || '';
      }
    }, [value, isFocused]);

    return (
      <Tag
        ref={ref as any}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        spellCheck
        className={`editable focus:outline-none focus:ring-2 focus:ring-cyan-300/40 rounded-sm ${className}`}
        onFocus={() => setIsFocused(true)}
        onBlur={(e: any) => {
          setIsFocused(false);
          const text = e.currentTarget.textContent || latestTextRef.current || '';
          onChange(text);
        }}
        onInput={(e: any) => {
          // Don't trigger React state updates while typing to preserve focus
          latestTextRef.current = e.currentTarget.textContent || '';
        }}
        onKeyDown={(e: any) => {
          if (!multiline && e.key === 'Enter') {
            e.preventDefault();
            (e.currentTarget as HTMLElement).blur();
          }
        }}
        data-placeholder={placeholder}
        tabIndex={0}
      />
    );
  };

  // Function to save generated resume data to database
  const saveGeneratedResumeToDatabase = async (generatedResumeData: any, originalResumeData: any) => {
    try {
      // Get session token for authentication
      const sessionToken = await getSessionToken();
      
      if (!sessionToken) {
        console.warn('⚠️ No session token available, skipping database save');
        return;
      }

      console.log('💾 Saving generated resume to database...');
      
      const saveResponse = await fetch('/api/save-generated-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          generatedResumeData,
          originalResumeId: null, // We'll link this later if needed
          templateUsed: selectedTemplate.id,
          generationMetadata: {
            originalResumeData: originalResumeData,
            generationTimestamp: new Date().toISOString(),
            templateUsed: selectedTemplate.id,
            userAgent: navigator.userAgent
          }
        }),
      });

      const saveText = await saveResponse.text();
      let saveJson: any = null;
      try { saveJson = JSON.parse(saveText); } catch {}

      if (saveResponse.ok) {
        console.log('✅ Generated resume saved to database:', saveJson?.generatedResumeId ?? '(no id)');
        // Clean up localStorage after successful database save
        cleanupLocalStorageAfterSave();
      } else {
        console.warn('⚠️ Failed to save generated resume to database:', (saveJson && saveJson.error) || saveText || saveResponse.statusText);
      }
    } catch (error) {
      console.error('❌ Error saving generated resume to database:', error);
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
      name: (improvedResume && improvedResume.name) ||
            findField(originalResumeData, ['name', 'full_name', 'fullName', 'personal_name', 'candidate_name']) ||
            combineFields(originalResumeData, ['first_name', 'last_name']) ||
            extractFromContact(originalResumeData, 'name') ||
            (firstProcessedResume ? findField(firstProcessedResume, ['name', 'full_name', 'fullName', 'personal_name', 'candidate_name']) : null) ||
            'Name not found',
      
      title: (improvedResume && improvedResume.bestJobTitle) ||
             extractTitleFromJSON(originalResumeData) ||
             (firstProcessedResume ? extractTitleFromJSON(firstProcessedResume) : null) ||
             improvedTitle ||
             'Title not found',
      
      location: findField(originalResumeData, ['location', 'address', 'city', 'residence', 'current_location']) ||
                extractFromContact(originalResumeData, 'location') ||
                combineFields(originalResumeData, ['city', 'state']) ||
                combineFields(originalResumeData, ['city', 'country']) ||
                (extractedFallback ? (findField(extractedFallback, ['location', 'address', 'city', 'residence', 'current_location']) ||
                                      extractFromContact(extractedFallback, 'location') ||
                                      combineFields(extractedFallback, ['city', 'state']) ||
                                      combineFields(extractedFallback, ['city', 'country'])) : null) ||
                (firstProcessedResume ? findField(firstProcessedResume, ['location', 'address', 'city', 'residence', 'current_location']) : null) ||
                'Location not found',
      
      email: findField(originalResumeData, ['email', 'email_address', 'contact_email', 'primary_email']) ||
             extractFromContact(originalResumeData, 'email') ||
             extractFromArray(originalResumeData, ['emails', 'contact_emails']) ||
              (extractedFallback ? (findField(extractedFallback, ['email', 'email_address', 'contact_email', 'primary_email']) ||
                                    extractFromContact(extractedFallback, 'email') ||
                                    extractFromArray(extractedFallback, ['emails', 'contact_emails'])) : null) ||
             (firstProcessedResume ? findField(firstProcessedResume, ['email', 'email_address', 'contact_email', 'primary_email']) : null) ||
             'Email not found',
      
      phone: findField(originalResumeData, ['phone', 'phone_number', 'contact_phone', 'mobile', 'telephone']) ||
             extractFromContact(originalResumeData, 'phone') ||
             extractFromArray(originalResumeData, ['phones', 'phone_numbers']) ||
              (extractedFallback ? (findField(extractedFallback, ['phone', 'phone_number', 'contact_phone', 'mobile', 'telephone']) ||
                                    extractFromContact(extractedFallback, 'phone') ||
                                    extractFromArray(extractedFallback, ['phones', 'phone_numbers'])) : null) ||
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

  // Function to save resume to profile
  const saveResumeToProfile = async () => {
    if (!improvedResume) {
      alert('Please generate a resume first before saving to profile.');
      return;
    }

    try {
      // Get session token for authentication
      const sessionToken = await getSessionToken();
      
      if (!sessionToken) {
        alert('Please log in to save your resume to profile.');
        return;
      }

      console.log('💾 Saving resume to profile...');
      
      // Prepare the complete resume data (content + template)
      const completeResumeData = {
        content: improvedResume,
        template: selectedTemplate,
        sections: sections,
        headerInfo: getHeaderInfo()
      };

      // Generate a title for the resume
      const resumeTitle = `${improvedResume.name || 'My'}'s Resume`;
      
      const saveResponse = await fetch('/api/save-resume-to-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          resumeData: completeResumeData,
          templateUsed: selectedTemplate.id,
          resumeTitle: resumeTitle
        }),
      });

      const saveText = await saveResponse.text();
      let saveJson: any = null;
      try { saveJson = JSON.parse(saveText); } catch {}

      if (saveResponse.ok) {
        console.log('✅ Resume saved to profile:', saveJson?.resumeUrl ?? '(no url)');
        // Set the saved resume URL and show success modal
        setSavedResumeUrl(saveJson?.resumeUrl ?? '');
        setShowSaveSuccessModal(true);
      } else {
        const message = (saveJson && saveJson.error) || saveText || saveResponse.statusText;
        console.error('❌ Failed to save resume to profile:', message);
        alert(`Failed to save resume to profile: ${message}`);
      }
    } catch (error) {
      console.error('❌ Error saving resume to profile:', error);
      alert('Error saving resume to profile. Please try again.');
    }
  };

  // Function to handle navigation from success modal
  const handleSuccessModalAction = (action: 'career-tools' | 'jobs' | 'view-resume') => {
    setShowSaveSuccessModal(false);
    
    switch (action) {
      case 'career-tools':
        router.push('/career-tools');
        break;
      case 'jobs':
        router.push('/jobs');
        break;
      case 'view-resume':
        if (savedResumeUrl) {
          window.open(savedResumeUrl, '_blank');
        }
        break;
    }
  };

  const renderSectionContent = (section: ResumeSection) => {
    // Helper function to check if content is empty
    const isEmptyContent = (content: any): boolean => {
      if (!content) return true;
      if (Array.isArray(content)) return content.length === 0;
      if (typeof content === 'object') {
        return Object.values(content).every(val => isEmptyContent(val));
      }
      if (typeof content === 'string') return content.trim() === '';
      return false;
    };

    // Helper function to check if skills section has any content
    const hasSkillsContent = (skills: any): boolean => {
      if (!skills) return false;
      const technical = Array.isArray(skills.technical) ? skills.technical.length > 0 : false;
      const soft = Array.isArray(skills.soft) ? skills.soft.length > 0 : false;
      const languages = Array.isArray(skills.languages) ? skills.languages.length > 0 : false;
      return technical || soft || languages;
    };

    switch (section.id) {
      case 'summary':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Professional Summary
            </h3>
            <textarea
              data-path="summary"
              className={`w-full border border-gray-300 rounded-md p-4 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 leading-relaxed resize-none ${getHighlightClass('summary')}`}
              value={section.content || ''}
              onChange={(e) => updateResumeText('summary', e.target.value)}
              placeholder="Add your professional summary..."
              rows={6}
            />
          </div>
        );

      case 'experience':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Work Experience
            </h3>
            <div className="mb-3">
              <Button variant="outline" className="text-xs" onClick={() => addListItem('experience', { title: 'New Role', company: '', duration: '', achievements: [''] }, 'title')}>
                + Add experience
              </Button>
            </div>
            {Array.isArray(section.content) && section.content.length > 0 ? (
              section.content.map((exp: any, index: number) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <input
                      data-path={`experience[${index}].title`}
                      className={`border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${getHighlightClass(`experience[${index}].title`)}`}
                      value={exp.title || ''}
                      onChange={(e) => updateResumeText(`experience[${index}].title`, e.target.value)}
                      placeholder="Job Title"
                    />
                    <input
                      data-path={`experience[${index}].duration`}
                      className={`border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${getHighlightClass(`experience[${index}].duration`)}`}
                      value={exp.duration || ''}
                      onChange={(e) => updateResumeText(`experience[${index}].duration`, e.target.value)}
                      placeholder="Duration (e.g., 2020-2024)"
                    />
                  </div>
                  <input
                    data-path={`experience[${index}].company`}
                    className={`border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 mb-2 ${getHighlightClass(`experience[${index}].company`)}`}
                    value={exp.company || ''}
                    onChange={(e) => updateResumeText(`experience[${index}].company`, e.target.value)}
                    placeholder="Company"
                  />
                  <div className="mb-2">
                    <h5 className="font-medium text-gray-700 mb-2">Key Achievements:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {Array.isArray(exp.achievements) ? (
                        exp.achievements.map((achievement: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 group">
                          <input
                            data-path={`experience[${index}].achievements[${idx}]`}
                            className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${getHighlightClass(`experience[${index}].achievements[${idx}]`)}`}
                            value={achievement || ''}
                            onChange={(e) => updateResumeText(`experience[${index}].achievements[${idx}]`, e.target.value)}
                            placeholder={`Achievement ${idx + 1}`}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeListItem(`experience[${index}].achievements`, idx)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Remove achievement"
                          >
                            ×
                          </Button>
                        </li>
                                              ))
                      ) : (
                        <li className="text-gray-500">No achievements listed</li>
                      )}
                    </ul>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => addListItem(`experience[${index}].achievements`, '', '')}>+ Add achievement</Button>
                    <Button variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => removeListItem('experience', index)}>Remove role</Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No work experience yet. Use "+ Add experience" to add your first role.</p>
            )}
          </div>
        );

      case 'skills':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Skills
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Button variant="outline" className="text-xs" onClick={() => addListItem('skills.technical', '', '')}>+ Tech</Button>
              <Button variant="outline" className="text-xs" onClick={() => addListItem('skills.soft', '', '')}>+ Soft</Button>
              <Button variant="outline" className="text-xs" onClick={() => addListItem('skills.languages', '', '')}>+ Language</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.isArray(section.content?.technical) && section.content.technical.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Technical Skills</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {section.content.technical.map((skill: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <input
                          data-path={`skills.technical[${index}]`}
                          className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${getHighlightClass(`skills.technical[${index}]`)}`}
                          value={skill || ''}
                          onChange={(e) => updateResumeText(`skills.technical[${index}]`, e.target.value)}
                          placeholder={`Technical skill ${index + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeListItem('skills.technical', index)}
                          className="px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Remove skill"
                        >
                          ×
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(section.content?.soft) && section.content.soft.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Soft Skills</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {section.content.soft.map((skill: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <input
                          data-path={`skills.soft[${index}]`}
                          className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${getHighlightClass(`skills.soft[${index}]`)}`}
                          value={skill || ''}
                          onChange={(e) => updateResumeText(`skills.soft[${index}]`, e.target.value)}
                          placeholder={`Soft skill ${index + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeListItem('skills.soft', index)}
                          className="px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Remove skill"
                        >
                          ×
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(section.content?.languages) && section.content.languages.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Languages</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {section.content.languages.map((language: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <input
                          data-path={`skills.languages[${index}]`}
                          className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${getHighlightClass(`skills.languages[${index}]`)}`}
                          value={language || ''}
                          onChange={(e) => updateResumeText(`skills.languages[${index}]`, e.target.value)}
                          placeholder={`Language ${index + 1}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeListItem('skills.languages', index)}
                          className="px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Remove language"
                        >
                          ×
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {!hasSkillsContent(section.content) && (
              <p className="text-gray-500 text-sm mt-2">No skills yet. Use the buttons above to add skills.</p>
            )}
          </div>
        );

      case 'education':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Education
            </h3>
            <div className="mb-3">
              <Button variant="outline" className="text-xs" onClick={() => addListItem('education', { degree: 'New Degree', institution: '', year: '', highlights: [''] }, 'degree')}>
                + Add education
              </Button>
            </div>
            {Array.isArray(section.content) && section.content.length > 0 ? (
              section.content.map((edu: any, index: number) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between items-start mb-2 gap-3">
                    <input
                      data-path={`education[${index}].degree`}
                      className={`border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${getHighlightClass(`education[${index}].degree`)}`}
                      value={edu.degree || ''}
                      onChange={(e) => updateResumeText(`education[${index}].degree`, e.target.value)}
                      placeholder="Degree"
                    />
                    <input
                      data-path={`education[${index}].year`}
                      className={`border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${getHighlightClass(`education[${index}].year`)}`}
                      value={edu.year || ''}
                      onChange={(e) => updateResumeText(`education[${index}].year`, e.target.value)}
                      placeholder="Year (e.g., 2020-2024)"
                    />
                  </div>
                  <input
                    data-path={`education[${index}].institution`}
                    className={`border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 mb-2 ${getHighlightClass(`education[${index}].institution`)}`}
                    value={edu.institution || ''}
                    onChange={(e) => updateResumeText(`education[${index}].institution`, e.target.value)}
                    placeholder="Institution"
                  />
                  {Array.isArray(edu.highlights) && edu.highlights.length > 0 && (
                    <div className="mb-2">
                      <h5 className="font-medium text-gray-700 mb-2">Key Highlights:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {edu.highlights.map((highlight: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 group">
                            <input
                              data-path={`education[${index}].highlights[${idx}]`}
                              className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${getHighlightClass(`education[${index}].highlights[${idx}]`)}`}
                              value={highlight || ''}
                              onChange={(e) => updateResumeText(`education[${index}].highlights[${idx}]`, e.target.value)}
                              placeholder={`Highlight ${idx + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeListItem(`education[${index}].highlights`, idx)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Remove highlight"
                            >
                              ×
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => addListItem(`education[${index}].highlights`, '', '')}>+ Add highlight</Button>
                    <Button variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => removeListItem('education', index)}>Remove education</Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No education yet. Use "+ Add education" to add your first entry.</p>
            )}
          </div>
        );

      case 'certifications':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Certifications
            </h3>
            <div className="mb-3">
              <Button variant="outline" className="text-xs" onClick={() => addListItem('certifications', '', '')}>+ Add certification</Button>
            </div>
            {Array.isArray(section.content) && section.content.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {section.content.map((cert: string, index: number) => (
                  <li key={index} className="flex items-center gap-2">
                    <input
                      data-path={`certifications[${index}]`}
                      className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 ${getHighlightClass(`certifications[${index}]`)}`}
                      value={cert || ''}
                      onChange={(e) => updateResumeText(`certifications[${index}]`, e.target.value)}
                      placeholder={`Certification ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeListItem('certifications', index)}
                      className="px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Remove certification"
                    >
                      ×
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No certifications yet. Use "+ Add certification" to add one.</p>
            )}
          </div>
        );

      case 'projects':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Projects
            </h3>
            <div className="mb-3">
              <Button variant="outline" className="text-xs" onClick={() => addListItem('projects', { title: 'New Project', description: '', technologies: [''], impact: [''] }, 'title')}>+ Add project</Button>
            </div>
            {Array.isArray(section.content) && section.content.length > 0 ? (
              section.content.map((project: any, index: number) => (
                <div key={index} className="mb-6">
                  <input
                    data-path={`projects[${index}].title`}
                    className={`w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-2 ${getHighlightClass(`projects[${index}].title`)}`}
                    value={project.title || ''}
                    onChange={(e) => updateResumeText(`projects[${index}].title`, e.target.value)}
                    placeholder="Project Title"
                  />
                  <textarea
                    data-path={`projects[${index}].description`}
                    className={`w-full border border-gray-300 rounded-md p-3 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 mb-2 ${getHighlightClass(`projects[${index}].description`)}`}
                    rows={4}
                    value={project.description || ''}
                    onChange={(e) => updateResumeText(`projects[${index}].description`, e.target.value)}
                    placeholder="Project Description"
                  />
                  <div className="mb-2">
                    <h5 className="font-medium text-gray-700 mb-2">Technologies Used:</h5>
                    {Array.isArray(project.technologies) ? (
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {project.technologies.map((tech: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 group">
                            <input
                              data-path={`projects[${index}].technologies[${idx}]`}
                              className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${getHighlightClass(`projects[${index}].technologies[${idx}]`)}`}
                              value={tech || ''}
                              onChange={(e) => updateResumeText(`projects[${index}].technologies[${idx}]`, e.target.value)}
                              placeholder={`Technology ${idx + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeListItem(`projects[${index}].technologies`, idx)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                              title="Remove technology"
                            >
                              ×
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No technologies listed</p>
                    )}
                  </div>
                  <div className="mb-2">
                    <h5 className="font-medium text-gray-700 mb-2">Impact & Results:</h5>
                    {Array.isArray(project.impact) ? (
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {project.impact.map((impact: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-2 group">
                            <input
                              data-path={`projects[${index}].impact[${idx}]`}
                              className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${getHighlightClass(`projects[${index}].impact[${idx}]`)}`}
                              value={impact || ''}
                              onChange={(e) => updateResumeText(`projects[${index}].impact[${idx}]`, e.target.value)}
                              placeholder={`Impact ${idx + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeListItem(`projects[${index}].impact`, idx)}
                              title="Remove impact"
                            >
                              ×
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No impact details available</p>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => addListItem(`projects[${index}].technologies`, '', '')}>+ Add technology</Button>
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => addListItem(`projects[${index}].impact`, '', '')}>+ Add impact</Button>
                    <Button variant="ghost" size="sm" className="text-xs text-red-400" onClick={() => removeListItem('projects', index)}>Remove project</Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No projects yet. Use "+ Add project" to add one.</p>
            )}
          </div>
        );

      case 'achievements':
        return (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3" style={{ color: customColors.primary }}>
              Achievements
            </h3>
            <div className="mb-3">
              <Button variant="outline" className="text-xs" onClick={() => addListItem('achievements', '', '')}>+ Add achievement</Button>
            </div>
            {Array.isArray(section.content) && section.content.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {section.content.map((achievement: string, index: number) => (
                  <li key={index} className="flex items-center gap-2 group">
                    <input
                      data-path={`achievements[${index}]`}
                      className={`flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 ${getHighlightClass(`achievements[${index}]`)}`}
                      value={achievement || ''}
                      onChange={(e) => updateResumeText(`achievements[${index}]`, e.target.value)}
                      placeholder={`Achievement ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeListItem('achievements', index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Remove achievement"
                    >
                      ×
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No achievements yet. Use "+ Add achievement" to add one.</p>
            )}
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
                  <Editable
                    as="h1"
                    className="text-4xl font-bold gradient-text"
                    value={getHeaderInfo().name || 'Your Name'}
                    onChange={(val) => updateResumeText('name', val)}
                    placeholder="Your Name"
                  />
                  <Editable
                    as="p"
                    className="text-gray-400"
                    value={getHeaderInfo().title || ''}
                    onChange={(val) => updateResumeText('bestJobTitle', val)}
                    placeholder="Your Title"
                  />
                </div>
              </div>
          </div>
          
            <div className="flex gap-3">
              <Button


                onClick={saveResumeToProfile}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25"
              >
                <Save className="h-4 w-4 mr-2" />
                Save to Profile to Share Link
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
                {hasSavedResume && (
                  <div className="mt-4">
                    <Button
                      variant="destructive"
                      onClick={() => setIsDeletingSaved(true)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Saved Resume
                    </Button>
                  </div>
                )}
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
                        <Editable
                          as="h1"
                          className="text-3xl font-bold text-gray-900 mb-2"
                          value={getHeaderInfo().name}
                          onChange={(val) => updateResumeText('name', val)}
                          multiline
                        />
                        <p className="text-gray-600">
                          <Editable
                            as="span"
                            value={getHeaderInfo().title}
                            onChange={(val) => updateResumeText('bestJobTitle', val)}
                          multiline
                          />
                          {' '}
                          •{' '}
                          <Editable
                            as="span"
                            value={getHeaderInfo().location}
                            onChange={(val) => updateResumeText('location', val)}
                          multiline
                          />
                        </p>
                        <p className="text-gray-600">
                          <Editable
                            as="span"
                            value={getHeaderInfo().email}
                            onChange={(val) => updateResumeText('email', val)}
                          multiline
                          />
                          {' '}
                          •{' '}
                          <Editable
                            as="span"
                            value={getHeaderInfo().phone}
                            onChange={(val) => updateResumeText('phone', val)}
                          />
                        </p>
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

          {/* Save Success Modal */}
        <Dialog open={showSaveSuccessModal} onOpenChange={setShowSaveSuccessModal}>
          <DialogContent className="bg-[#0b0b0d] border border-white/10 text-white max-w-md">
            <DialogHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <DialogTitle className="text-xl font-bold text-center text-white">
                Resume Saved Successfully!
              </DialogTitle>
              <DialogDescription className="text-center text-gray-300">
                Your resume has been saved to your profile and is now available for sharing.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 mt-6">
              <Button
                onClick={() => handleSuccessModalAction('career-tools')}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
              >
                <Wrench className="h-4 w-4 mr-2" />
                Go to Career Tools
              </Button>
              
              <Button
                onClick={() => handleSuccessModalAction('jobs')}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Go to Jobs
              </Button>
              
              <Button
                onClick={() => handleSuccessModalAction('view-resume')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Saved Resume
              </Button>
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowSaveSuccessModal(false)}
                className="w-full border-white/10 text-gray-300 hover:bg-white/5"
              >
                Continue Editing
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirm Delete Saved Resume Modal */}
        <Dialog open={isDeletingSaved} onOpenChange={setIsDeletingSaved}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>Delete saved resume?</DialogTitle>
              <DialogDescription className="text-gray-300">
                This action cannot be undone. Deleting your saved resume <span className="font-semibold text-red-400">will also remove all of your existing job applications linked to this resume</span>. You will need to restart any applications afterwards.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeletingSaved(false)} className="border-gray-600 text-gray-300 hover:bg-gray-800">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  try {
                    const token = await getSessionToken();
                    if (!token || !user?.id) {
                      alert('Please log in.');
                      return;
                    }
                    const res = await fetch('/api/user/saved-resumes', {
                      headers: { Authorization: `Bearer ${token}`, 'x-user-id': String(user.id) },
                    });
                    const text = await res.text();
                    let data: any = null; try { data = JSON.parse(text); } catch {}
                    const slug = data?.resumeSlug;
                    if (!slug) {
                      alert('No saved resume found.');
                      setIsDeletingSaved(false);
                      return;
                    }
                    const del = await fetch(`/api/user/saved-resume/${slug}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}`, 'x-user-id': String(user.id) },
                    });
                    if (!del.ok) {
                      const dtext = await del.text();
                      let djson: any = null; try { djson = JSON.parse(dtext); } catch {}
                      throw new Error((djson && (djson.details || djson.error)) || dtext || 'Delete failed');
                    }
                    setIsDeletingSaved(false);
                    try { sessionStorage.setItem('resumeDeleted', '1'); } catch {}
                    router.push('/resume-builder');
                  } catch (e: any) {
                    alert(e?.message || 'Failed to delete saved resume');
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
        </div>
      </div>
    </div>
  );
}
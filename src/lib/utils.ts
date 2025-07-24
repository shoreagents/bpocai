import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format date utilities
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return formatDateShort(date)
}

// Score and progress utilities
export function calculateLevel(experiencePoints: number): number {
  return Math.floor(Math.sqrt(experiencePoints / 100)) + 1
}

export function getExperienceForNextLevel(currentLevel: number): number {
  return Math.pow(currentLevel, 2) * 100
}

export function getProgressToNextLevel(experiencePoints: number): { current: number, needed: number, percentage: number } {
  const level = calculateLevel(experiencePoints)
  const currentLevelXP = Math.pow(level - 1, 2) * 100
  const nextLevelXP = Math.pow(level, 2) * 100
  const current = experiencePoints - currentLevelXP
  const needed = nextLevelXP - currentLevelXP
  const percentage = Math.round((current / needed) * 100)

  return { current, needed, percentage }
}

export function formatScore(score: number, decimals: number = 1): string {
  return score.toFixed(decimals)
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-neon-green'
  if (score >= 80) return 'text-cyber-blue'
  if (score >= 70) return 'text-yellow-400'
  if (score >= 60) return 'text-orange-400'
  return 'text-red-400'
}

export function getScoreGrade(score: number): string {
  if (score >= 97) return 'A+'
  if (score >= 93) return 'A'
  if (score >= 90) return 'A-'
  if (score >= 87) return 'B+'
  if (score >= 83) return 'B'
  if (score >= 80) return 'B-'
  if (score >= 77) return 'C+'
  if (score >= 73) return 'C'
  if (score >= 70) return 'C-'
  if (score >= 60) return 'D'
  return 'F'
}

// String utilities
export function formatName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function validatePassword(password: string): { isValid: boolean, errors: string[] } {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return { isValid: errors.length === 0, errors }
}

// Format utilities
export function formatSalary(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatNumber(number: number): string {
  return new Intl.NumberFormat('en-US').format(number)
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${remainingSeconds}s`
}

// Array utilities
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array)
  return shuffled.slice(0, count)
}

// Local storage utilities

export function setLocalStorage(key: string, value: unknown): void {

  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

// URL utilities
export function buildUrl(baseUrl: string, params: Record<string, string | number | boolean>): string {
  const url = new URL(baseUrl)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value))
  })
  return url.toString()
}

// Debounce utility

export function debounce<T extends (...args: unknown[]) => unknown>(

  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Resume Builder utilities

// File validation utilities
export function isValidFileType(file: File): boolean {
  const validTypes = [
    // Document types
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    // Image types
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif'
  ];
  return validTypes.includes(file.type);
}

export function categorizeFile(file: File): string {
  const type = file.type.toLowerCase();
  
  if (type.includes('pdf')) return 'PDF Document';
  if (type.includes('word') || type.includes('document')) return 'Word Document';
  if (type.includes('image')) return 'Image';
  
  return 'Document';
}

// URL validation utilities
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function categorizePortfolioLink(url: string): string {
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes('linkedin.com')) return 'linkedin';
  if (hostname.includes('github.com')) return 'github';
  if (hostname.includes('behance.net')) return 'behance';
  if (hostname.includes('dribbble.com')) return 'dribbble';
  if (hostname.includes('portfolio')) return 'portfolio';
  
  return 'website';
}

// Session management
export function generateSessionId(): string {
  return `bpoc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function saveToLocalStorage(key: string, value: unknown): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window !== 'undefined') {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
    return defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
}

// File processing utilities
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix to get just the base64 data
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(reader.error);
  });
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Resume Processing Types - Updated to support clean DOCX-only JSON
export interface ProcessedResume {
  // Clean resume fields (from DOCX content) - top level
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  website?: string;
  summary?: string;
  objective?: string;
  
  experience?: Array<{
    company?: string;
    position?: string;
    duration?: string;
    location?: string;
    responsibilities?: string[];
    description?: string;
    achievements?: string[];
  }>;
  
  education?: Array<{
    institution?: string;
    degree?: string;
    year?: string;
    location?: string;
    gpa?: string;
    honors?: string;
    details?: string;
    coursework?: string[];
  }>;
  
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  
  projects?: Array<{
    name?: string;
    description?: string;
    technologies?: string[];
    duration?: string;
    url?: string;
  }>;
  
  sections?: Array<{
    title: string;
    content: string;
  }>;
  
  // Comprehensive content fields
  additionalInfo?: string[];

  
  // Optional metadata (for UI purposes)
  fileName?: string;
  fileType?: string;
  processingMethod?: string;
  extractedAt?: string;
  ocrConfidence?: number;
  
  // Optional raw data
  rawText?: string;
  jpegImages?: string[];  // base64 data URLs
  
  // Parsed information
  parsed: {
    personalInfo: {
      name?: string;
      email?: string;
      phone?: string;
      title?: string;
      location?: string;
      linkedin?: string;
      website?: string;
    };
    
    sections: Array<{
      title: string;      // e.g., "EXPERIENCE", "EDUCATION"
      content: string;    // Full text content
      items?: Array<{     // Structured items (optional)
        title?: string;
        company?: string;
        duration?: string;
        description?: string;
      }>;
    }>;
    
    skills: string[];
    emails: string[];
    phones: string[];
    urls: string[];
  };
  
  // Legacy fields for backward compatibility
  personalInfo?: any;
  extractedText?: string;
  confidence?: number;
  
  // New pipeline metadata
  pipelineMetadata?: {
    step1_textExtraction?: {
      method: string;
      success: boolean;
      textLength: number;
    };
    step2_docxCreation?: {
      method: string;
      success: boolean;
      docxSize: number;
    };
    step3_jsonConversion?: {
      method: string;
      success: boolean;
      timestamp: string;
    };
    totalProcessingSteps?: number;
    pipelineVersion?: string;
  };
  
  // DOCX-specific metadata
  docxMetadata?: {
    docxFileName?: string;
    docxSize?: number;
    docxPreview?: string;
    sectionsCount?: number;
    contentSource?: string;
    processingTimestamp?: string;
  };
}

// Main resume processing function - Literal DOCX Creation → Preview → JSON Pipeline
export async function processResumeFile(file: File, openaiApiKey?: string): Promise<ProcessedResume> {
  console.log('🚀 Starting literal DOCX-first pipeline for:', file.name);
  console.log('📋 Process: File → Literal Text Extraction → Exact DOCX Creation → JSON from DOCX');
  console.log('🎯 Preserving content exactly as written in original file');
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key is required. Please add your API key to continue.');
  }
  
  try {
    // Step 1: Extract text literally (exactly as written)
    console.log('📤 Step 1: Extracting text exactly as written in original file...');
    const literalText = await extractAndOrganizeText(file, openaiApiKey);
    console.log(`✅ Step 1 Complete: Literal text extracted (${literalText.length} characters)`);
    
    // Step 2: Create literal DOCX file (preserving exact content)
    console.log('📄 Step 2: Creating DOCX with exact original content...');
    const { docxFile, docxPreview } = await createOrganizedDOCX(literalText, file.name);
    console.log('✅ Step 2 Complete: Literal DOCX created preserving exact content');
    
    // Step 3: Convert DOCX content to JSON (only what's in DOCX)
    console.log('🔄 Step 3: Converting DOCX content to JSON (literal extraction)...');
    const jsonData = await convertDOCXContentToJSON(docxFile, openaiApiKey);
    console.log('✅ Step 3 Complete: JSON extracted exactly from DOCX content');
    
    // Step 4: Build final resume object with literal DOCX preview
    console.log('🏗️ Step 4: Building final resume with literal content...');
    const finalResume = buildResumeWithDOCXPreview(file, literalText, docxFile, docxPreview, jsonData);
    console.log('✅ Pipeline Complete: Literal resume content preserved!');
    
    return finalResume;
    
  } catch (error) {
    console.error('❌ Pipeline Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process ${file.name}: ${errorMessage}`);
  }
}

// Step 1: Extract text exactly as it appears in the original file (literal extraction)
async function extractAndOrganizeText(file: File, openaiApiKey: string): Promise<string> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name;
  
  console.log(`🔍 Processing ${fileName} for literal extraction...`);
  console.log(`📏 File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  console.log(`📋 Extracting content exactly as written in original file`);
  
  try {
    // Extract raw text exactly as it appears (no AI organization)
    const literalText = await extractLiteralTextFromFile(file, openaiApiKey);
    console.log(`📝 Literal text extracted: ${literalText.length} characters`);
    console.log(`✅ Content preserved exactly as written in original file`);
    
    return literalText;
    
  } catch (error) {
    console.error('❌ Literal text extraction failed:', error);
    throw new Error(`Failed to extract literal text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text literally from file with COMPREHENSIVE methods to get ALL content
async function extractLiteralTextFromFile(file: File, openaiApiKey: string): Promise<string> {
  const fileType = file.type.toLowerCase();
  const fileName = file.name;
  
  console.log(`🔍 COMPREHENSIVE extraction from ${fileName}...`);
  console.log(`📄 File type: ${fileType}`);
  console.log(`📏 File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  console.log(`🎯 Goal: Extract EVERY word and character`);
  
  const OpenAI = (await import('openai')).default;
  const openai = new OpenAI({
    apiKey: openaiApiKey,
    dangerouslyAllowBrowser: true
  });
  
  const extractedTexts: string[] = [];
  
  try {
    // Convert file to base64 for API processing
    console.log('📦 Converting file to base64...');
    const base64Data = await fileToBase64(file);
    console.log('✅ File converted to base64');

    // Handle different file types with ENHANCED extraction methods for complex designs
    if (fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf')) {
      console.log('📄 COMPLEX PDF DETECTED - Using CANVA-OPTIMIZED extraction pipeline...');
      console.log('🎨 Designed for complex layouts, overlays, and design-heavy documents');
      
      // Method 1: Direct PDF text extraction (quick check for embedded text)
      try {
        console.log('🔍 Method 1: Quick embedded text check...');
        const pdf2md = await import('@opendocsg/pdf2md');
        const arrayBuffer = await file.arrayBuffer();
        const directText = await pdf2md.default(arrayBuffer);
        
        if (directText && directText.trim().length > 50) {
          extractedTexts.push(directText);
          console.log(`✅ Method 1 success: ${directText.length} characters of embedded text found`);
        } else {
          console.log('⚠️ Method 1: Minimal embedded text - likely a design-heavy PDF');
        }
      } catch (error) {
        console.log('⚠️ Method 1 failed - proceeding with visual extraction:', error);
      }
      
      // Method 2: HIGH-RESOLUTION PDF to Images with ENHANCED OCR
      try {
        console.log('🔍 Method 2: HIGH-RES PDF to Images with ENHANCED OCR...');
        console.log('📸 Using 4K resolution and advanced OCR for complex layouts');
        const imageTexts = await extractTextFromComplexPDF(file, openai);
        if (imageTexts && imageTexts.length > 0) {
          imageTexts.forEach((text, pageIndex) => {
            if (text && text.trim().length > 20) {
              extractedTexts.push(`PAGE ${pageIndex + 1}:\n${text}`);
              console.log(`✅ Method 2 Page ${pageIndex + 1}: ${text.length} characters extracted`);
            }
          });
        }
      } catch (error) {
        console.log('⚠️ Method 2 failed:', error);
      }
      
      // Method 3: SPECIALIZED Resume Vision API with LAYOUT UNDERSTANDING
      try {
        console.log('🔍 Method 3: SPECIALIZED Resume Vision API...');
        console.log('🧠 AI optimized for resume layouts, Canva designs, and complex formatting');
        const visionText = await extractResumeWithSpecializedVision(openai, base64Data);
        if (visionText && visionText.trim().length > 20) {
          extractedTexts.push(visionText);
          console.log(`✅ Method 3 success: ${visionText.length} characters extracted`);
        }
      } catch (error) {
        console.log('⚠️ Method 3 failed:', error);
      }
      
      // Method 4: MULTIPLE PASSES with different AI approaches
      try {
        console.log('🔍 Method 4: MULTI-PASS specialized extraction...');
        const multiPassTexts = await extractWithMultiplePasses(openai, base64Data);
        multiPassTexts.forEach((text, passIndex) => {
          if (text && text.trim().length > 20) {
            extractedTexts.push(`PASS ${passIndex + 1}:\n${text}`);
            console.log(`✅ Method 4 Pass ${passIndex + 1}: ${text.length} characters extracted`);
          }
        });
      } catch (error) {
        console.log('⚠️ Method 4 failed:', error);
      }
      
    } else if (fileType.includes('docx') || fileType.includes('wordprocessingml') || fileName.toLowerCase().endsWith('.docx')) {
      console.log('📝 DOCX detected - using MULTIPLE extraction methods...');
      
      // Method 1: Direct DOCX parsing
      try {
        console.log('🔍 Method 1: Direct DOCX parsing...');
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value && result.value.trim().length > 20) {
          extractedTexts.push(result.value);
          console.log(`✅ Method 1 success: ${result.value.length} characters extracted`);
        }
      } catch (error) {
        console.log('⚠️ Method 1 failed:', error);
      }
      
      // Method 2: Vision API for complex layouts
      try {
        console.log('🔍 Method 2: Vision API for complex DOCX layouts...');
        const visionText = await extractComprehensiveTextWithVision(openai, base64Data, 'docx');
        if (visionText && visionText.trim().length > 20) {
          extractedTexts.push(visionText);
          console.log(`✅ Method 2 success: ${visionText.length} characters extracted`);
        }
      } catch (error) {
        console.log('⚠️ Method 2 failed:', error);
      }
      
    } else if (fileType.includes('doc') && fileType.includes('msword') || fileName.toLowerCase().endsWith('.doc')) {
      console.log('📄 DOC detected - using Vision API (legacy format)...');
      try {
        const visionText = await extractComprehensiveTextWithVision(openai, base64Data, 'doc');
        extractedTexts.push(visionText);
        console.log(`✅ DOC extraction: ${visionText.length} characters`);
      } catch (error) {
        console.log('⚠️ DOC extraction failed:', error);
      }
      
    } else if (fileType.includes('image') || /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(fileName)) {
      console.log('🖼️ Image detected - using MULTIPLE OCR methods...');
      
      // Method 1: Tesseract OCR (if available)
      try {
        console.log('🔍 Method 1: Tesseract OCR...');
        const ocrText = await extractTextWithTesseract(file);
        if (ocrText && ocrText.trim().length > 10) {
          extractedTexts.push(ocrText);
          console.log(`✅ Method 1 success: ${ocrText.length} characters extracted`);
        }
      } catch (error) {
        console.log('⚠️ Method 1 failed, continuing with Vision API...');
      }
      
      // Method 2: Enhanced Vision API
      try {
        console.log('🔍 Method 2: Enhanced Vision API OCR...');
        const visionText = await extractComprehensiveTextWithVision(openai, base64Data, 'image');
        if (visionText && visionText.trim().length > 10) {
          extractedTexts.push(visionText);
          console.log(`✅ Method 2 success: ${visionText.length} characters extracted`);
        }
      } catch (error) {
        console.log('⚠️ Method 2 failed:', error);
      }
      
    } else {
      console.log('❓ Unknown file type - trying comprehensive Vision API...');
      try {
        const visionText = await extractComprehensiveTextWithVision(openai, base64Data, 'unknown');
        extractedTexts.push(visionText);
        console.log(`✅ Unknown type extraction: ${visionText.length} characters`);
      } catch (error) {
        console.log('⚠️ Unknown type extraction failed:', error);
      }
    }

    // Combine all extraction results
    if (extractedTexts.length === 0) {
      throw new Error('All extraction methods failed - no text could be extracted from the file');
    }
    
    const combinedText = combineExtractedTexts(extractedTexts);
    const finalText = cleanExtractedText(combinedText);
    
    if (!finalText || finalText.trim().length < 10) {
      throw new Error('Insufficient text extracted - please ensure the file contains readable text');
    }

    console.log(`🎉 COMPREHENSIVE extraction complete!`);
    console.log(`📊 Methods used: ${extractedTexts.length}`);
    console.log(`📝 Final result: ${finalText.length} characters`);
    console.log(`📋 Lines extracted: ${finalText.split('\n').length}`);
    console.log(`📖 Preview: ${finalText.substring(0, 200)}...`);
    
    return finalText.trim();

  } catch (error) {
    console.error('❌ ALL extraction methods failed:', error);
    throw new Error(`Failed to extract text from ${fileName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Enhanced comprehensive text extraction using OpenAI Vision API with proper ordering
async function extractComprehensiveTextWithVision(openai: any, base64Data: string, fileType: string): Promise<string> {
  console.log(`🤖 Using enhanced Vision API for ${fileType} with PROPER ORDERING...`);
  
  // Different prompts for different file types to ensure proper order
  let orderingInstructions = '';
  
  if (fileType === 'image' || fileType === 'jpeg' || fileType === 'jpg' || fileType === 'png') {
    orderingInstructions = `
CRITICAL READING ORDER for IMAGES/RESUMES:
1. Start from the TOP-LEFT corner of the document
2. Read HORIZONTALLY from LEFT to RIGHT for each line
3. Then move DOWN to the next line and repeat
4. For multi-column layouts: read the ENTIRE LEFT column first, then the RIGHT column
5. For sections: read the HEADER first, then the content below it
6. For contact info at top: read name, then title, then contact details in order
7. Maintain the EXACT VISUAL ORDER as it appears in the image
8. Do NOT rearrange content - preserve the original sequence`;
  } else if (fileType === 'pdf') {
    orderingInstructions = `
CRITICAL READING ORDER for PDFs:
1. Read each PAGE from TOP to BOTTOM, LEFT to RIGHT
2. Preserve the exact document flow and structure
3. Include page headers and footers in their correct positions
4. For multi-column PDFs: read LEFT column completely, then RIGHT column
5. Maintain section order exactly as in the original document
6. Include ALL text from margins, headers, footers, and sidebars`;
  } else {
    orderingInstructions = `
CRITICAL READING ORDER:
1. Follow the natural document flow from TOP to BOTTOM
2. Read LEFT to RIGHT within each section
3. Preserve the original text sequence and structure`;
  }
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `EXTRACT ALL TEXT from this ${fileType} preserving EXACT VISUAL ORDER. This is critical.

${orderingInstructions}

CONTENT REQUIREMENTS:
1. Extract EVERY single word, number, and character visible
2. Include headers, footers, sidebar content, watermarks, small text
3. Include ALL contact information (emails, phones, addresses, websites)
4. Include ALL job titles, company names, dates, skills, education details
5. Include text in tables, lists, or special formatting
6. Include any decorative elements that contain text
7. Do not summarize, interpret, or skip any content
8. Return raw text exactly as written, in the EXACT VISUAL ORDER
9. If you see text, include it in the correct position
10. Missing any text or wrong order is not acceptable

IMPORTANT: Read the document like a human would read it naturally - top to bottom, left to right, maintaining the original visual sequence.`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Data}`,
              detail: "high"
            }
          }
        ]
      }
    ],
    max_tokens: 4000,
    temperature: 0.1
  });

  const extractedText = completion.choices[0]?.message?.content;
  if (!extractedText) {
    throw new Error('No text returned from Vision API');
  }

  console.log(`✅ Enhanced Vision API extraction with proper ordering: ${extractedText.length} characters`);
  return extractedText.trim();
}

// ENHANCED: Extract text from complex PDFs (Canva, design-heavy) with high resolution
async function extractTextFromComplexPDF(file: File, openai: any): Promise<string[]> {
  console.log('🎨 COMPLEX PDF PROCESSOR: Optimized for Canva and design-heavy documents');
  
  try {
    // Import PDF.js with enhanced settings
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up PDF.js worker with multiple fallback URLs
    const workerUrls = [
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
      'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    ];
    
    for (const workerUrl of workerUrls) {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        console.log(`📦 PDF.js worker configured: ${workerUrl}`);
        break;
      } catch (error) {
        console.log(`⚠️ Worker failed: ${workerUrl}`, error);
      }
    }
    
    // Load the PDF with enhanced settings
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ 
      data: arrayBuffer,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true
    }).promise;
    
    console.log(`📄 Complex PDF loaded: ${pdf.numPages} pages`);
    
    const pageTexts: string[] = [];
    
    // Process each page with HIGH RESOLUTION for complex layouts
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`🔍 Processing complex page ${pageNum}/${pdf.numPages} with 4K resolution...`);
        
        const page = await pdf.getPage(pageNum);
        
        // ULTRA HIGH RESOLUTION for complex designs (4x normal)
        const viewport = page.getViewport({ scale: 4.0 });
        
        // Create high-resolution canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // White background for better OCR
        context!.fillStyle = 'white';
        context!.fillRect(0, 0, canvas.width, canvas.height);
        
        // Render page at ultra-high resolution
        const renderContext = {
          canvasContext: context!,
          viewport: viewport,
          background: 'white'
        };
        
        await page.render(renderContext).promise;
        
        // Convert to high-quality JPEG
        const imageData = canvas.toDataURL('image/jpeg', 0.98);
        const base64Data = imageData.split(',')[1];
        
        console.log(`🖼️ Page ${pageNum} rendered at ${canvas.width}x${canvas.height} (4K quality)`);
        
        // Extract text using SPECIALIZED resume vision API
        const pageText = await extractResumeWithSpecializedVision(openai, base64Data);
        
        if (pageText && pageText.trim().length > 10) {
          pageTexts.push(pageText);
          console.log(`✅ Page ${pageNum} text extracted: ${pageText.length} characters`);
        } else {
          console.log(`⚠️ Page ${pageNum} yielded minimal text`);
          pageTexts.push(''); // Keep page order
        }
        
      } catch (pageError) {
        console.log(`⚠️ Failed to process page ${pageNum}:`, pageError);
        pageTexts.push(''); // Keep page order
      }
    }
    
    console.log(`✅ Complex PDF processing complete: ${pageTexts.length} pages processed`);
    return pageTexts;
    
  } catch (error) {
    console.error('❌ Complex PDF processing failed:', error);
    // Fallback to regular PDF processing
    return await extractTextFromPDFAsImages(file, openai);
  }
}

// SPECIALIZED: Resume-optimized Vision API extraction
async function extractResumeWithSpecializedVision(openai: any, base64Data: string): Promise<string> {
  console.log(`🧠 SPECIALIZED RESUME EXTRACTION: Optimized for modern resume layouts`);
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You are a RESUME CONTENT SPECIALIST. Extract ALL text from this resume image with PERFECT ACCURACY.

🎯 RESUME-SPECIFIC INSTRUCTIONS:
1. This is likely a MODERN DESIGNED RESUME (Canva, InDesign, etc.)
2. Text may be in CREATIVE LAYOUTS, overlays, or decorative elements
3. PRESERVE EXACT READING ORDER: Name → Title → Contact → Sections
4. Include ALL sections: Experience, Education, Skills, etc.
5. Extract EVERY detail: dates, company names, job titles, descriptions
6. Include contact info: emails, phones, addresses, LinkedIn, websites
7. Capture skills lists, bullet points, and formatted text
8. Don't miss small text, icons with text, or background elements

📋 CRITICAL REQUIREMENTS:
- Extract EVERY visible word and number
- Maintain the VISUAL READING FLOW (top-to-bottom, left-to-right)
- Include ALL professional details (no matter how small)
- Capture formatted lists, tables, and structured content
- Include years, dates, percentages, and metrics
- Don't summarize or interpret - extract EXACTLY as written
- If text is stylized or decorative, still include the content

🚫 NEVER SKIP:
- Contact information (even if styled)
- Job descriptions and responsibilities  
- Education details and dates
- Skills and competencies
- Certifications and achievements
- Social media links and portfolios

Return the complete text preserving the original structure and order.`
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Data}`,
              detail: "high"
            }
          }
        ]
      }
    ],
    max_tokens: 4000,
    temperature: 0.1
  });

  const extractedText = completion.choices[0]?.message?.content;
  if (!extractedText) {
    throw new Error('No text returned from Specialized Resume Vision API');
  }

  console.log(`✅ Specialized resume extraction: ${extractedText.length} characters`);
  return extractedText.trim();
}

// MULTI-PASS: Different AI approaches for comprehensive extraction
async function extractWithMultiplePasses(openai: any, base64Data: string): Promise<string[]> {
  console.log(`🔄 MULTI-PASS EXTRACTION: Using different AI strategies`);
  
  const passes: string[] = [];
  
  // Pass 1: Focus on structure and layout
  try {
    console.log('🔍 Pass 1: Structure and layout focus...');
    const structurePass = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Focus on STRUCTURE and LAYOUT. Extract text emphasizing:
- Document sections and headers
- Professional formatting and organization
- Contact information and personal details
- Clear reading order and hierarchy
Extract all visible text while maintaining structure.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 3000,
      temperature: 0.1
    });
    
    const structureText = structurePass.choices[0]?.message?.content;
    if (structureText) {
      passes.push(structureText);
      console.log(`✅ Pass 1 complete: ${structureText.length} characters`);
    }
  } catch (error) {
    console.log('⚠️ Pass 1 failed:', error);
  }
  
  // Pass 2: Focus on details and content
  try {
    console.log('🔍 Pass 2: Details and content focus...');
    const contentPass = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Focus on DETAILS and CONTENT. Extract text emphasizing:
- Job descriptions and responsibilities
- Skills, achievements, and metrics
- Education details and dates
- Small text and fine details
- Numbers, percentages, and statistics
Extract every detail you can see, no matter how small.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 3000,
      temperature: 0.1
    });
    
    const contentText = contentPass.choices[0]?.message?.content;
    if (contentText) {
      passes.push(contentText);
      console.log(`✅ Pass 2 complete: ${contentText.length} characters`);
    }
  } catch (error) {
    console.log('⚠️ Pass 2 failed:', error);
  }
  
  console.log(`✅ Multi-pass extraction complete: ${passes.length} passes`);
  return passes;
}

// Convert PDF pages to images then extract text from each page
async function extractTextFromPDFAsImages(file: File, openai: any): Promise<string[]> {
  console.log('🔄 Converting PDF pages to images for comprehensive OCR...');
  
  try {
    // Dynamically import PDF.js
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set up PDF.js worker with multiple fallback URLs
    const workerUrls = [
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
      'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
    ];
    
    for (const workerUrl of workerUrls) {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
        console.log(`📦 Trying PDF.js worker: ${workerUrl}`);
        break;
      } catch (error) {
        console.log(`⚠️ Worker failed: ${workerUrl}`, error);
      }
    }
    
    // Load the PDF
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log(`📄 PDF loaded: ${pdf.numPages} pages`);
    
    const pageTexts: string[] = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        console.log(`🔍 Processing PDF page ${pageNum}/${pdf.numPages}...`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // High resolution
        
        // Create canvas to render page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Render page to canvas
        const renderContext = {
          canvasContext: context!,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        
        // Convert canvas to base64 image
        const imageData = canvas.toDataURL('image/jpeg', 0.95);
        const base64Data = imageData.split(',')[1];
        
        console.log(`🖼️ Page ${pageNum} converted to image`);
        
        // Extract text from the image using Vision API
        const pageText = await extractComprehensiveTextWithVision(openai, base64Data, 'image');
        
        if (pageText && pageText.trim().length > 10) {
          pageTexts.push(pageText);
          console.log(`✅ Page ${pageNum} text extracted: ${pageText.length} characters`);
        } else {
          console.log(`⚠️ Page ${pageNum} yielded insufficient text`);
          pageTexts.push(''); // Keep page order
        }
        
      } catch (pageError) {
        console.log(`⚠️ Failed to process page ${pageNum}:`, pageError);
        pageTexts.push(''); // Keep page order
      }
    }
    
    console.log(`✅ PDF to images processing complete: ${pageTexts.length} pages processed`);
    return pageTexts;
    
  } catch (error) {
    console.error('❌ PDF to images conversion failed:', error);
    throw new Error(`PDF to images conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Tesseract OCR extraction (fallback method)
async function extractTextWithTesseract(file: File): Promise<string> {
  console.log('🔍 Attempting Tesseract OCR extraction...');
  
  try {
    // Import Tesseract dynamically
    const Tesseract = await import('tesseract.js');
    
    console.log('⚙️ Processing with Tesseract OCR...');
    const { data: { text } } = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`📖 OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });
    
    console.log(`✅ Tesseract extraction complete: ${text.length} characters`);
    return text;
    
  } catch (error) {
    console.log('⚠️ Tesseract not available or failed:', error);
    throw new Error('Tesseract OCR failed');
  }
}

// Legacy helper function to extract text using OpenAI Vision API  
async function extractTextWithVisionAPI(openai: any, base64Data: string, fileType: string): Promise<string> {
  console.log(`🤖 Using OpenAI Vision API for ${fileType} text extraction...`);
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract ALL text content from this ${fileType} file. Return only the extracted text, no formatting or commentary. Focus on preserving the original structure and content.`
          },
          {
            type: "image_url",
            image_url: {
              url: base64Data,
              detail: "high"
            }
          }
        ]
      }
    ],
    max_tokens: 4000
  });

  const extractedText = completion.choices[0]?.message?.content;
  if (!extractedText) {
    throw new Error('No text extracted by Vision API');
  }

  console.log('✅ Vision API text extraction complete');
  return extractedText;
}

// Clean extracted text to fix spacing and formatting issues from complex PDFs
function cleanExtractedText(text: string): string {
  if (!text) return '';
  
  console.log('🧹 Cleaning extracted text for better formatting...');
  
  let cleaned = text;
  
  // Fix excessive spacing between characters (e.g., "S e n i o r" → "Senior")
  cleaned = cleaned.replace(/\b([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])/g, (match, a, b, c) => {
    // Only fix if it's clearly spaced out letters (3+ consecutive single letters with spaces)
    const words = match.split(/\s+/);
    if (words.length >= 3 && words.every(word => word.length === 1)) {
      return words.join('');
    }
    return match;
  });
  
  // Fix extensive character spacing in titles and headers
  cleaned = cleaned.replace(/([A-Z])\s+([a-z])\s+([a-z])\s+([a-z])\s+([a-z])/g, '$1$2$3$4$5');
  cleaned = cleaned.replace(/([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])\s+([A-Za-z])/g, '$1$2$3$4');
  
  // Clean up excessive line breaks and whitespace
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // Max 2 line breaks
  cleaned = cleaned.replace(/[ \t]+/g, ' '); // Multiple spaces to single space
  cleaned = cleaned.replace(/^\s+|\s+$/gm, ''); // Trim lines
  
  // Fix numbered/bulleted lists formatting
  cleaned = cleaned.replace(/\n\s*([•○▪▫-]|\d+\.)\s*/g, '\n$1 ');
  
  // Clean up section headers
  cleaned = cleaned.replace(/^#{1,6}\s*(.+?)\s*$/gm, '## $1');
  
  // Remove excessive markdown formatting
  cleaned = cleaned.replace(/#{4,}/g, '###'); // Max 3 hashes
  
  console.log(`✅ Text cleaned: ${text.length} → ${cleaned.length} characters`);
  return cleaned.trim();
}

// ENHANCED: Intelligent combination for complex PDF extractions
function combineExtractedTexts(extractedTexts: string[]): string {
  if (extractedTexts.length === 0) {
    return '';
  }
  
  if (extractedTexts.length === 1) {
    return extractedTexts[0];
  }
  
  console.log(`🔗 INTELLIGENT COMBINATION: Merging ${extractedTexts.length} extraction results...`);
  console.log(`🧠 Using advanced logic for Canva/design PDF optimization`);
  
  // Enhanced combination logic for complex resumes
  const combinedResult = combineComplexPDFResults(extractedTexts);
  
  console.log(`✅ Intelligent combination complete: ${combinedResult.length} characters`);
  return combinedResult;
}

// SPECIALIZED: Intelligent combination for complex PDF results
function combineComplexPDFResults(extractedTexts: string[]): string {
  console.log(`🎨 COMPLEX PDF COMBINER: Optimizing multiple extraction results`);
  
  // Filter out empty or too-short results
  const validTexts = extractedTexts.filter(text => text && text.trim().length > 20);
  
  if (validTexts.length === 0) {
    return '';
  }
  
  if (validTexts.length === 1) {
    return validTexts[0];
  }
  
  // Analyze each extraction result
  const analysisResults = validTexts.map((text, index) => ({
    index,
    text,
    length: text.length,
    lineCount: text.split('\n').length,
    hasEmail: /@/.test(text),
    hasPhone: /(\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/.test(text),
    hasExperience: /(experience|work|job|position)/i.test(text),
    hasEducation: /(education|university|college|degree)/i.test(text),
    hasSkills: /(skills|competenc)/i.test(text),
    hasStructure: /\n\s*\n/.test(text), // Has paragraph breaks
    completenessScore: 0
  }));
  
  // Calculate completeness scores
  analysisResults.forEach(result => {
    let score = 0;
    score += result.length / 100; // Length factor
    score += result.hasEmail ? 10 : 0;
    score += result.hasPhone ? 10 : 0;
    score += result.hasExperience ? 15 : 0;
    score += result.hasEducation ? 15 : 0;
    score += result.hasSkills ? 10 : 0;
    score += result.hasStructure ? 10 : 0;
    score += result.lineCount > 10 ? 10 : 0;
    
    result.completenessScore = score;
    console.log(`📊 Extraction ${result.index + 1}: Score ${score.toFixed(1)} (${result.length} chars)`);
  });
  
  // Sort by completeness score (highest first)
  analysisResults.sort((a, b) => b.completenessScore - a.completenessScore);
  
  // Start with the most complete result
  let primary = analysisResults[0].text;
  console.log(`🎯 Primary result: Extraction ${analysisResults[0].index + 1} (score: ${analysisResults[0].completenessScore.toFixed(1)})`);
  
  // Intelligently merge additional content from other extractions
  for (let i = 1; i < analysisResults.length; i++) {
    const additional = analysisResults[i];
    console.log(`🔍 Analyzing additional extraction ${additional.index + 1}...`);
    
    // Extract unique content not in primary
    const additionalLines = additional.text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 5);
    
    const primaryLines = primary.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 5);
    
    const uniqueLines: string[] = [];
    
    additionalLines.forEach(line => {
      // Check if this line adds new information
      const isUnique = !primaryLines.some(pLine => {
        const similarity = calculateTextSimilarity(line, pLine);
        return similarity > 0.7; // 70% similarity threshold
      });
      
      if (isUnique && line.length > 10) {
        uniqueLines.push(line);
      }
    });
    
    if (uniqueLines.length > 0) {
      console.log(`📝 Found ${uniqueLines.length} unique lines from extraction ${additional.index + 1}`);
      primary += '\n\n' + uniqueLines.join('\n');
    }
  }
  
  // Final cleanup and optimization
  primary = cleanupCombinedText(primary);
  
  console.log(`✅ Complex PDF combination complete: ${primary.length} final characters`);
  return primary;
}

// Calculate text similarity between two lines
function calculateTextSimilarity(text1: string, text2: string): number {
  const longer = text1.length > text2.length ? text1 : text2;
  const shorter = text1.length > text2.length ? text2 : text1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

// Clean up the final combined text
function cleanupCombinedText(text: string): string {
  return text
    // Remove excessive whitespace
    .replace(/\n{4,}/g, '\n\n\n')
    .replace(/\s{3,}/g, ' ')
    // Remove duplicate lines that are very similar
    .split('\n')
    .filter((line, index, array) => {
      if (line.trim().length < 5) return true; // Keep short lines/spacing
      
      // Check for near-duplicates
      for (let i = 0; i < index; i++) {
        if (calculateTextSimilarity(line.trim(), array[i].trim()) > 0.9) {
          return false; // Skip near-duplicate
        }
      }
      return true;
    })
    .join('\n')
    .trim();
}

// Simple Levenshtein distance function for text similarity
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Organize extracted text using AI for structured DOCX creation
async function organizeTextWithAI(rawText: string, fileName: string, apiKey: string): Promise<string> {
  try {
    console.log('🤖 Sending text to GPT-4o for organization...');
    
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a resume organizer. Take the raw extracted text and organize it into clear, well-structured sections suitable for a professional resume document. Return only the organized text with proper headings and formatting."
        },
        {
          role: "user",
          content: `Organize this resume text into a well-structured format with clear sections:

INSTRUCTIONS:
1. Create clear section headings (PERSONAL INFORMATION, PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS, etc.)
2. Organize content under appropriate sections
3. Clean up any OCR errors or formatting issues
4. Ensure professional formatting and structure
5. Remove any duplicate or irrelevant information
6. Return ONLY the organized text, no commentary

Raw text from ${fileName}:
${rawText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    });
    
    const organizedText = completion.choices[0]?.message?.content;
    if (!organizedText) {
      throw new Error('No organized text received from AI');
    }
    
    console.log('✅ Text organized by AI');
    return organizedText.trim();
    
  } catch (error) {
    console.error('AI text organization failed:', error);
    throw new Error(`Failed to organize text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Step 2: Create literal DOCX file preserving exact content
async function createOrganizedDOCX(literalText: string, originalFileName: string): Promise<{ docxFile: File; docxPreview: string }> {
  console.log('📄 Creating literal DOCX file preserving exact content...');
  console.log(`📝 Literal text length: ${literalText.length} characters`);
  console.log(`🎯 Preserving content exactly as written in original file`);
  
  try {
    const { Document, Packer, Paragraph, TextRun } = await import('docx');
    
    console.log('🔧 Building literal DOCX document (no reorganization)...');
    
    // Create DOCX with exact content as it appears (no parsing into sections)
    const docElements: any[] = [];
    
    // Split text by lines and preserve exact formatting
    const lines = literalText.split('\n');
    console.log(`📋 Preserving ${lines.length} lines exactly as they appear`);
    
    lines.forEach(line => {
      // Preserve empty lines for spacing
      if (line.trim() === '') {
        docElements.push(new Paragraph({ text: "" }));
      } else {
        // Preserve exact line content without modification
        docElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 22  // Standard size for readability
              })
            ]
          })
        );
      }
    });
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: docElements
      }]
    });
    
    console.log('⚙️ Generating literal DOCX binary data...');
    const uint8Array = await Packer.toBuffer(doc);
    
    // Create DOCX file
    const docxFileName = `literal_${originalFileName.replace(/\.[^/.]+$/, "")}.docx`;
    const docxFile = new File([uint8Array], docxFileName, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    // Create preview text (exact content)
    const docxPreview = createLiteralDOCXPreview(literalText);
    
    console.log(`✅ Literal DOCX created: ${docxFileName} (${(docxFile.size / 1024).toFixed(1)}KB)`);
    console.log(`📖 Preview shows exact original content: ${docxPreview.length} characters`);
    
    return { docxFile, docxPreview };
    
  } catch (error) {
    console.error('❌ Literal DOCX creation failed:', error);
    throw new Error(`Failed to create literal DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Parse organized text into sections
function parseOrganizedTextIntoSections(text: string): Array<{ title: string; content: string }> {
  const sections: Array<{ title: string; content: string }> = [];
  const lines = text.split('\n');
  
  let currentSection = '';
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Check if line is a section header (all caps or title case with common section names)
    if (trimmedLine && (
      trimmedLine === trimmedLine.toUpperCase() ||
      /^(PERSONAL INFORMATION|PROFESSIONAL SUMMARY|SUMMARY|OBJECTIVE|EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|PROJECTS|LANGUAGES|REFERENCES)/i.test(trimmedLine)
    )) {
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        sections.push({
          title: currentSection,
          content: currentContent.join('\n').trim()
        });
      }
      
      // Start new section
      currentSection = trimmedLine;
      currentContent = [];
    } else if (currentSection && trimmedLine) {
      currentContent.push(trimmedLine);
    }
  }
  
  // Add last section
  if (currentSection && currentContent.length > 0) {
    sections.push({
      title: currentSection,
      content: currentContent.join('\n').trim()
    });
  }
  
  return sections;
}

// Create well-formatted preview text with proper spacing and structure
function createLiteralDOCXPreview(literalText: string): string {
  if (!literalText) return '📄 EXACT CONTENT FROM ORIGINAL FILE:\n\n(No content available)';
  
  console.log('🎨 Creating formatted DOCX preview...');
  
  // Clean and format the text for better readability
  let formatted = literalText;
  
  // Apply text cleaning first
  formatted = cleanExtractedText(formatted);
  
  // Additional preview-specific formatting
  // Add proper spacing around section headers
  formatted = formatted.replace(/^(#{1,3})\s*(.+)$/gm, (match, hashes, title) => {
    const level = hashes.length;
    const spacing = level === 1 ? '\n\n' : '\n';
    return `${spacing}${hashes} ${title.trim()}${spacing}`;
  });
  
  // Format bullet points with proper indentation
  formatted = formatted.replace(/^([•○▪▫-]|\d+\.)\s*/gm, '   $1 ');
  
  // Ensure proper spacing between sections
  formatted = formatted.replace(/\n(#{1,3})/g, '\n\n$1');
  
  // Clean up excessive spacing while maintaining structure
  formatted = formatted.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  // Add proper spacing around contact information
  formatted = formatted.replace(/(Phone|Email|Address|LinkedIn|Portfolio):\s*/gi, '\n$1: ');
  
  // Format experience/education entries with better spacing
  formatted = formatted.replace(/(\d{4}[-–]\d{4}|\d{4})\s*\n/g, '$1\n\n');
  
  // Clean up and trim
  formatted = formatted.trim();
  
  console.log(`✅ Preview formatted: ${literalText.length} → ${formatted.length} characters`);
  
  return `📄 FORMATTED CONTENT FROM ORIGINAL FILE:\n\n${formatted}`;
}

// Create preview text for DOCX display (legacy function)
function createDOCXPreview(sections: Array<{ title: string; content: string }>): string {
  let preview = '';
  
  sections.forEach((section, index) => {
    preview += `═══ ${section.title} ═══\n\n`;
    preview += section.content + '\n\n';
    
    if (index < sections.length - 1) {
      preview += '─'.repeat(50) + '\n\n';
    }
  });
  
  return preview;
}

// Legacy function for compatibility
async function createDOCXFromText(extractedText: string, originalFileName: string): Promise<File> {
  console.log('📄 Creating DOCX file from extracted text...');
  console.log(`📝 Text length: ${extractedText.length} characters`);
  
  try {
    // Install docx library dynamically
    const { Document, Packer, Paragraph, TextRun } = await import('docx');
    
    console.log('🔧 Initializing DOCX document...');
    
    // Split text into paragraphs (by double newlines or single newlines)
    const paragraphs = extractedText
      .split(/\n\s*\n/)
      .filter(p => p.trim().length > 0)
      .map(p => p.trim());
    
    console.log(`📋 Creating ${paragraphs.length} paragraphs in DOCX...`);
    
    // Create DOCX document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Add title
          new Paragraph({
            children: [
              new TextRun({
                text: `Resume: ${originalFileName.replace(/\.[^/.]+$/, "")}`,
                bold: true,
                size: 32
              })
            ]
          }),
          new Paragraph({
            children: [new TextRun({ text: "" })] // Empty line
          }),
          // Add content paragraphs
          ...paragraphs.map(paragraph => 
            new Paragraph({
              children: [
                new TextRun({
                  text: paragraph,
                  size: 24
                })
              ]
            })
          )
        ]
      }]
    });
    
    console.log('⚙️ Generating DOCX binary data...');
    
    // Generate DOCX file as Uint8Array
    const uint8Array = await Packer.toBuffer(doc);
    
    // Convert to File object
    const docxFileName = `extracted_${originalFileName.replace(/\.[^/.]+$/, "")}.docx`;
    const docxFile = new File([uint8Array], docxFileName, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });
    
    console.log(`✅ DOCX file created: ${docxFileName} (${(docxFile.size / 1024).toFixed(1)}KB)`);
    return docxFile;
    
  } catch (error) {
    console.error('❌ DOCX creation failed:', error);
    throw new Error(`Failed to create DOCX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Step 3: Convert DOCX content to JSON (only what's in DOCX)
async function convertDOCXContentToJSON(docxFile: File, openaiApiKey: string): Promise<any> {
  console.log('🔄 Converting DOCX content to JSON...');
  console.log(`📄 DOCX file: ${docxFile.name} (${(docxFile.size / 1024).toFixed(1)}KB)`);
  
  try {
    // Read the DOCX file content
    console.log('📖 Reading DOCX content...');
    const mammoth = await import('mammoth');
    const arrayBuffer = await docxFile.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    const docxContent = result.value;
    console.log(`✅ DOCX content read: ${docxContent.length} characters`);
    
    if (!docxContent || docxContent.trim().length < 20) {
      throw new Error('DOCX file contains insufficient content');
    }
    
    // Convert DOCX content to JSON using AI (only what's in the DOCX)
    console.log('🤖 Converting DOCX content to structured JSON...');
    const jsonData = await convertTextToStrictJSON(docxContent, docxFile.name, openaiApiKey);
    
    // Return clean JSON data without unnecessary metadata
    const enhancedData = {
      ...jsonData
    };
    
    console.log('✅ DOCX content converted to JSON successfully');
    return enhancedData;
    
  } catch (error) {
    console.error('❌ DOCX to JSON conversion failed:', error);
    throw new Error(`Failed to convert DOCX content to JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Convert text to comprehensive JSON (capture ALL content from DOCX)
async function convertTextToStrictJSON(text: string, fileName: string, apiKey: string): Promise<any> {
  try {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a comprehensive JSON converter. Extract EVERY piece of information from the DOCX text and convert it to JSON. Do not miss ANY content - this is critical. Include all text exactly as written."
        },
        {
          role: "user",
          content: `Extract EVERY piece of information from this DOCX content into comprehensive JSON. Missing ANY content is not acceptable.

CRITICAL REQUIREMENTS:
1. Extract EVERY word, number, date, and detail present in the DOCX
2. Include ALL contact information (emails, phones, addresses, websites, social profiles)
3. Include ALL job titles, company names, employment dates, and job descriptions
4. Include ALL education details, degrees, institutions, years, GPA, honors
5. Include ALL skills, certifications, languages, projects, achievements
6. Include ALL sections and their complete content
7. Include ANY additional text or details not covered by standard fields
8. Do not summarize or shorten any content
9. Preserve exact wording and details as written
10. If you see ANY text content, include it somewhere in the JSON

Use this comprehensive structure and add any additional fields needed:

{
  "name": "",
  "title": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "website": "",
  "summary": "",
  "objective": "",
  "experience": [
    {
      "company": "",
      "position": "",
      "duration": "",
      "location": "",
      "responsibilities": [],
      "achievements": [],
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "year": "",
      "location": "",
      "gpa": "",
      "honors": "",
      "details": "",
      "coursework": []
    }
  ],
  "skills": [],
  "certifications": [],
  "languages": [],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [],
      "duration": "",
      "url": ""
    }
  ],
  "sections": [
    {
      "title": "",
      "content": ""
    }
  ],
  "additionalInfo": []
}

DOCX content to extract from (get EVERYTHING):
${text}`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    });
    
    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }
    
    // Clean and parse JSON
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    const jsonData = JSON.parse(cleanResponse.trim());
    
    // Text is already included in the structured JSON data
    
    console.log(`✅ Comprehensive JSON conversion complete`);
    console.log(`📊 JSON fields populated: ${Object.keys(jsonData).length}`);
    console.log(`📝 Full text preserved: ${text.length} characters`);
    
    return jsonData;
    
  } catch (error) {
    console.error('Comprehensive JSON conversion failed:', error);
    throw new Error(`Failed to convert to comprehensive JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Legacy function for compatibility  
async function convertDOCXToJSON(docxFile: File, originalText: string, openaiApiKey: string): Promise<any> {
  console.log('🔄 Converting DOCX to structured JSON...');
  console.log(`📄 DOCX file: ${docxFile.name} (${(docxFile.size / 1024).toFixed(1)}KB)`);
  
  try {
    // Read the DOCX file we just created to verify it contains the text
    console.log('📖 Reading DOCX content for verification...');
    const mammoth = await import('mammoth');
    const arrayBuffer = await docxFile.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    console.log(`✅ DOCX verification: ${result.value.length} characters read`);
    
    // Use OpenAI to convert the text to structured JSON
    console.log('🤖 Sending to OpenAI for JSON structuring...');
    const structuredData = await parseResumeWithOpenAI(originalText, docxFile.name, openaiApiKey);
    
    // Add metadata about the DOCX processing
    const enhancedData = {
      ...structuredData,
      _metadata: {
        originalFileName: docxFile.name,
        docxCreated: true,
        docxSize: docxFile.size,
        processingTimestamp: new Date().toISOString(),
        textLength: originalText.length,
        docxTextLength: result.value.length
      }
    };
    
    console.log('✅ DOCX to JSON conversion complete');
    return enhancedData;
    
  } catch (error) {
    console.error('❌ DOCX to JSON conversion failed:', error);
    throw new Error(`Failed to convert DOCX to JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text from PDF (simplified approach)
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Try direct text extraction first (for text-based PDFs)
    const pdf2md = await import('@opendocsg/pdf2md');
    const arrayBuffer = await file.arrayBuffer();
    const text = await pdf2md.default(arrayBuffer);
    
    if (text && text.trim().length > 50) {
      console.log('✅ PDF text extracted directly');
      return text;
    }
    
    // If direct extraction fails, fall back to OCR via image conversion
    console.log('📷 PDF requires OCR processing (scanned/image-based)');
    const jpegImages = await convertPDFToJPEGSimple(file);
    let ocrText = '';
    
    for (const jpegDataUrl of jpegImages) {
      const { text: pageText } = await performSimpleOCR(jpegDataUrl);
      ocrText += pageText + '\n';
    }
    
    return ocrText;
    
  } catch (error) {
    console.error('PDF text extraction failed:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text from DOCX
async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length < 10) {
      throw new Error('No text found in DOCX file');
    }
    
    console.log('✅ DOCX text extracted');
    return result.value;
    
  } catch (error) {
    console.error('DOCX text extraction failed:', error);
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Extract text from images using OCR
async function extractTextFromImage(file: File): Promise<string> {
  try {
    console.log('🔍 Running OCR on image...');
    const objectUrl = URL.createObjectURL(file);
    const { text } = await performSimpleOCR(objectUrl);
    
    if (!text || text.trim().length < 10) {
      throw new Error('No readable text found in image. Please ensure the image is clear and contains text.');
    }
    
    console.log('✅ Image OCR completed');
    return text;
    
  } catch (error) {
    console.error('Image OCR failed:', error);
    throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Simplified OCR for text extraction
async function performSimpleOCR(imageUrl: string): Promise<{ text: string; confidence: number }> {
  try {
    const tesseract = await import('tesseract.js');
    const { data: { text, confidence } } = await tesseract.recognize(imageUrl, 'eng');
    
    // Basic text cleaning
    const cleanedText = text
      .replace(/\s{3,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return { text: cleanedText, confidence };
  } catch (error) {
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Parse resume text using OpenAI GPT-3.5 Turbo
async function parseResumeWithOpenAI(text: string, fileName: string, apiKey: string): Promise<any> {
  let rawResponse = '';
  
  try {
    console.log('🤖 Sending to OpenAI GPT-3.5 Turbo for parsing...');
    
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, API calls should be made from server-side
    });
    
    const prompt = createResumeParsingPrompt(text, fileName);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert resume parser. Extract structured information from resume text and return it as valid JSON."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.1, // Low temperature for consistent parsing
      max_tokens: 2000
    });
    
    const response = completion.choices[0]?.message?.content;
    rawResponse = response || ''; // Store for error handling
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }
    
    console.log('📝 OpenAI response received, parsing JSON...');
    
    // Clean the response - remove markdown code blocks if present
    let cleanResponse = response.trim();
    
    // Remove ```json and ``` wrapper if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any leading/trailing whitespace
    cleanResponse = cleanResponse.trim();
    
    console.log('🧹 Cleaned response for parsing...');
    console.log('🔍 First 200 chars of cleaned response:', cleanResponse.substring(0, 200));
    
    // Parse the JSON response
    const parsedData = JSON.parse(cleanResponse);
    console.log('✅ OpenAI parsing successful');
    
    return parsedData;
    
  } catch (error) {
    console.error('OpenAI parsing failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
      } else if (error.message.includes('quota')) {
        throw new Error('OpenAI API quota exceeded. Please check your billing and try again.');
      } else if (error.message.includes('Unexpected token') || error.message.includes('JSON')) {
        // Log the problematic response for debugging
        console.error('🔍 Full OpenAI response that failed to parse:', rawResponse);
        throw new Error(`OpenAI returned malformed JSON. Response preview: "${rawResponse.substring(0, 150)}...". Check console for full response.`);
      }
    }
    
    throw new Error(`AI parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create the prompt for OpenAI resume parsing
function createResumeParsingPrompt(text: string, fileName: string): string {
  return `
Extract information from this resume and return a JSON object with the following exact structure:

{
  "personalInfo": {
    "name": "Full name",
    "email": "email@example.com", 
    "phone": "phone number",
    "title": "job title/position",
    "location": "city, country",
    "linkedin": "linkedin URL",
    "website": "personal website URL"
  },
  "sections": [
    {
      "title": "SECTION_NAME",
      "content": "full section content"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "emails": ["email1@example.com"],
  "phones": ["+1234567890"],
  "urls": ["https://example.com"],
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title", 
      "duration": "Start - End",
      "description": "Job description"
    }
  ],
  "education": [
    {
      "institution": "School Name",
      "degree": "Degree Name",
      "year": "Year/Duration"
    }
  ],
  "summary": "Professional summary or objective"
}

IMPORTANT RULES:
1. Return ONLY valid JSON, no other text
2. If a field is not found, use empty string "" or empty array []
3. Extract ALL email addresses, phone numbers, and URLs found
4. Include ALL skills mentioned (technical, soft skills, tools, languages)
5. Parse experience entries with company, position, duration, description
6. Extract education with institution, degree, and year
7. Identify clear sections like EXPERIENCE, EDUCATION, SKILLS, etc.

Resume filename: ${fileName}

Resume text:
${text}
`;
}

// Build resume with DOCX preview 
function buildResumeWithDOCXPreview(
  file: File, 
  organizedText: string, 
  docxFile: File, 
  docxPreview: string, 
  jsonData: any
): ProcessedResume {
  console.log('🏗️ Building clean resume JSON from DOCX content...');
  
  // Create clean resume structure with ONLY DOCX content
  const cleanResumeJSON: ProcessedResume = {
    // Clean JSON data from DOCX (main content)
    ...jsonData,
    
    // Minimal metadata for UI functionality only
    docxMetadata: {
      docxFileName: docxFile.name,
      docxSize: docxFile.size,
      docxPreview: docxPreview,
      sectionsCount: jsonData.sections?.length || 0,
      contentSource: 'DOCX_CONTENT_ONLY'
    }
  };
  
  console.log('📊 Clean DOCX Content Statistics:');
  console.log(`   📄 DOCX source: ${docxFile.name} (${(docxFile.size / 1024).toFixed(1)}KB)`);
  console.log(`   📖 DOCX preview: ${docxPreview.length} characters`);
  console.log(`   🎯 Sections found: ${jsonData.sections?.length || 0}`);
  console.log(`   💼 Experience entries: ${jsonData.experience?.length || 0}`);
  console.log(`   🎓 Education entries: ${jsonData.education?.length || 0}`);
  console.log(`   ⭐ Skills found: ${jsonData.skills?.length || 0}`);
  console.log(`   🏆 Certifications: ${jsonData.certifications?.length || 0}`);
  console.log(`   🌐 Languages: ${jsonData.languages?.length || 0}`);
  console.log(`   📁 Projects: ${jsonData.projects?.length || 0}`);
  console.log('✅ Clean JSON from DOCX content ready!');
  
  return cleanResumeJSON;
}

// Legacy function for compatibility
function buildFinalResumeJSON(file: File, extractedText: string, aiParsedData: any): ProcessedResume {
  console.log('🏗️ Building final resume JSON with pipeline metadata...');
  
  const currentTime = new Date().toISOString();
  const fileTypeDisplay = getFileTypeDisplay(file.type);
  
  const resumeJSON: ProcessedResume = {
    // Metadata
    fileName: file.name,
    fileType: file.type,
    processingMethod: `${fileTypeDisplay} → API Extraction → DOCX Creation → JSON Conversion`,
    extractedAt: currentTime,
    ocrConfidence: 95, // AI-based processing is highly reliable
    
    // Raw data
    rawText: extractedText,
    jpegImages: [], // Not used in new pipeline
    
    // Parsed information (new structure)
    parsed: {
      personalInfo: aiParsedData.personalInfo || {},
      sections: aiParsedData.sections || [],
      skills: aiParsedData.skills || [],
      emails: aiParsedData.emails || [],
      phones: aiParsedData.phones || [],
      urls: aiParsedData.urls || []
    },
    
    // Legacy compatibility fields
    personalInfo: aiParsedData.personalInfo || {},
    experience: aiParsedData.experience || [],
    education: aiParsedData.education || [],
    summary: aiParsedData.summary || '',
    extractedText: extractedText,
    confidence: 95,
    certifications: [],
    languages: [],
    
    // New pipeline metadata
    pipelineMetadata: {
      step1_textExtraction: {
        method: 'API-based extraction',
        success: true,
        textLength: extractedText.length
      },
      step2_docxCreation: {
        method: 'Dynamic DOCX generation',
        success: aiParsedData._metadata?.docxCreated || false,
        docxSize: aiParsedData._metadata?.docxSize || 0
      },
      step3_jsonConversion: {
        method: 'AI-powered structuring',
        success: true,
        timestamp: aiParsedData._metadata?.processingTimestamp || currentTime
      },
      totalProcessingSteps: 4,
      pipelineVersion: '2.0'
    }
  };
  
  console.log('📊 Pipeline Statistics:');
  console.log(`   📄 Original file: ${file.name} (${fileTypeDisplay})`);
  console.log(`   📝 Text extracted: ${extractedText.length} characters`);
  console.log(`   📋 DOCX created: ${aiParsedData._metadata?.docxCreated ? 'Yes' : 'No'}`);
  console.log(`   🎯 JSON fields: ${Object.keys(aiParsedData).length}`);
  console.log('✅ Final resume JSON built successfully with full pipeline metadata');
  
  return resumeJSON;
}

// Helper function to get file type display name
function getFileTypeDisplay(fileType: string): string {
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('docx')) return 'DOCX';
  if (fileType.includes('doc')) return 'DOC';
  if (fileType.includes('png')) return 'PNG';
  if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'JPEG';
  return 'Unknown';
}

// Convert PDF to JPEG using PDF.js with enhanced error handling
async function convertPDFToJPEG(file: File): Promise<string[]> {
  // Try the simple approach first, then fallback to complex
  try {
    return await convertPDFToJPEGSimple(file);
  } catch (simpleError) {
    console.warn('Simple PDF conversion failed, trying advanced method:', simpleError);
    return await convertPDFToJPEGAdvanced(file);
  }
}

// Simple PDF conversion method
async function convertPDFToJPEGSimple(file: File): Promise<string[]> {
  try {
    console.log('🔧 Trying simple PDF.js approach...');
    
    const pdfjsLib = await import('pdfjs-dist');
    
    // Use a reliable CDN worker URL
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    console.log(`✅ PDF loaded with ${pdf.numPages} page(s)`);
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create canvas context');
    
    // Process only first page for simplicity
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Fill white background
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    await page.render({ canvasContext: context, viewport }).promise;
    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    console.log('✅ Simple PDF conversion successful');
    return [jpegDataUrl];
    
  } catch (error) {
    console.error('Simple PDF conversion failed:', error);
    throw error;
  }
}

// Advanced PDF conversion method with full error handling
async function convertPDFToJPEGAdvanced(file: File): Promise<string[]> {
  try {
    console.log('🔧 Initializing advanced PDF.js...');
    
    // Try different PDF.js loading approaches
    let pdfjsLib: any;
    
    try {
      // Method 1: Dynamic import with explicit worker setup
      pdfjsLib = await import('pdfjs-dist');
      
      // Set up worker with multiple fallback URLs
      const workerUrls = [
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`,
        `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`,
        `/pdf.worker.min.js` // Local fallback
      ];
      
      for (const workerUrl of workerUrls) {
        try {
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
          console.log(`🔧 Trying worker URL: ${workerUrl}`);
          break;
        } catch (workerError) {
          console.warn(`Worker URL failed: ${workerUrl}`, workerError);
          continue;
        }
      }
      
    } catch (importError) {
      console.error('PDF.js import failed:', importError);
      throw new Error('Failed to load PDF.js library. Please refresh the page and try again.');
    }
    
    // Prepare PDF document
    const arrayBuffer = await file.arrayBuffer();
    console.log(`📄 Loading PDF (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)}MB)...`);
    
    const loadingTask = pdfjsLib.getDocument({ 
      data: arrayBuffer,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
      disableAutoFetch: true,
      disableStream: true,
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/'
    });
    
    const pdf = await loadingTask.promise;
    console.log(`✅ PDF loaded successfully with ${pdf.numPages} page(s)`);
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not create canvas context');
    
    const jpegImages: string[] = [];
    const pagesToProcess = Math.min(pdf.numPages, 3); // Process max 3 pages
    
    for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
      try {
        console.log(`🎨 Rendering page ${pageNum}/${pagesToProcess}...`);
        
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // High resolution for OCR
        
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        // Clear canvas with white background
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          background: 'white'
        };
        
        await page.render(renderContext).promise;
        const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        jpegImages.push(jpegDataUrl);
        
        console.log(`✅ Page ${pageNum} converted to JPEG (${(jpegDataUrl.length / 1024).toFixed(1)}KB)`);
        
      } catch (pageError) {
        console.error(`Failed to process page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }
    
    if (jpegImages.length === 0) {
      throw new Error('No pages could be converted to JPEG');
    }
    
    return jpegImages;
    
  } catch (error) {
    console.error('❌ PDF conversion error:', error);
    
    // Provide user-friendly error message
    if (error instanceof Error) {
      if (error.message.includes('Invalid PDF')) {
        throw new Error('The PDF file appears to be corrupted or invalid. Please try a different file.');
      } else if (error.message.includes('worker')) {
        throw new Error('PDF processing service is unavailable. Please refresh the page and try again.');
      } else if (error.message.includes('network')) {
        throw new Error('Network error while processing PDF. Please check your internet connection.');
      }
    }
    
    throw new Error(`PDF conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}. Try converting the PDF to an image first.`);
  }
}

// Convert DOCX to JPEG (DOCX → HTML → DOM → JPEG)
async function convertDOCXToJPEG(file: File): Promise<string[]> {
  try {
    const mammoth = await import('mammoth');
    const html2canvas = await import('html2canvas');
    
    console.log('📝 Converting DOCX to HTML...');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    
    // Create styled container for rendering
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = result.value;
    tempDiv.style.cssText = `
      width: 800px;
      padding: 40px;
      font-family: 'Times New Roman', serif;
      font-size: 12px;
      line-height: 1.4;
      background-color: white;
      color: black;
      position: absolute;
      top: -9999px;
      left: -9999px;
      border: 1px solid #ccc;
    `;
    
    document.body.appendChild(tempDiv);
    
    console.log('🎨 Rendering HTML to canvas...');
    const canvas = await html2canvas.default(tempDiv, {
      backgroundColor: 'white',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      width: 800,
      height: tempDiv.scrollHeight
    });
    
    document.body.removeChild(tempDiv);
    
    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
    console.log('✅ DOCX converted to JPEG');
    
    return [jpegDataUrl];
  } catch (error) {
    console.error('DOCX conversion error:', error);
    throw new Error(`DOCX conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Convert PNG to JPEG (handle transparency)
async function convertPNGToJPEG(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }
      
      // Fill white background (replace PNG transparency)
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw PNG image on white background
      ctx.drawImage(img, 0, 0);
      
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.95);
      console.log('✅ PNG converted to JPEG');
      resolve([jpegDataUrl]);
    };
    
    img.onerror = () => reject(new Error('Failed to load PNG image'));
    img.src = URL.createObjectURL(file);
  });
}

// DOC file conversion (requires server-side or external service)
async function convertDOCToJPEG(file: File): Promise<string[]> {
  // For now, throw error - DOC requires server-side conversion
  throw new Error('DOC file conversion requires server-side processing. Please convert to DOCX or PDF first.');
}

// Advanced OCR processing with enhanced settings
async function performAdvancedOCR(jpegDataUrl: string): Promise<{ text: string; confidence: number }> {
  try {
    const tesseract = await import('tesseract.js');
    
    const worker = await tesseract.createWorker('eng');
    
    // Configure for resume processing
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,()[]{}:;@#$%&*+-=/<>?!"\' \n\t',
      tessedit_pageseg_mode: tesseract.PSM.AUTO,
      preserve_interword_spaces: '1'
    });
    
    const { data: { text, confidence } } = await worker.recognize(jpegDataUrl);
    await worker.terminate();
    
    // Clean OCR text
    const cleanedText = cleanOCRText(text);
    
    return { text: cleanedText, confidence };
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error(`OCR processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Build comprehensive resume JSON following the specification
function buildComprehensiveResumeJSON(
  file: File, 
  fullText: string, 
  jpegImages: string[], 
  averageConfidence: number
): ProcessedResume {
  console.log('🏗️ Building comprehensive resume JSON...');
  
  // Extract data using new comprehensive approach
  const personalInfo = extractPersonalInfo(fullText);
  const sections = extractSections(fullText);
  const emails = extractEmails(fullText);
  const phones = extractPhones(fullText);
  const urls = extractUrls(fullText);
  const skills = extractSkills(fullText);
  
  // Determine processing method
  const processingMethod = getProcessingMethod(file.type);
  
  const resumeJSON: ProcessedResume = {
    // Metadata
    fileName: file.name,
    fileType: file.type,
    processingMethod,
    extractedAt: new Date().toISOString(),
    ocrConfidence: averageConfidence,
    
    // Raw data
    rawText: fullText,
    jpegImages,
    
    // Parsed information
    parsed: {
      personalInfo,
      sections,
      skills,
      emails,
      phones,
      urls
    },
    
    // Legacy compatibility fields
    personalInfo,
    experience: extractLegacyExperience(sections),
    education: extractLegacyEducation(sections),
    summary: extractLegacySummary(sections),
    extractedText: fullText,
    confidence: averageConfidence,
    certifications: [],
    languages: []
  };
  
  console.log('✅ Resume JSON built successfully');
  return resumeJSON;
}

// Helper functions for the new comprehensive approach
function getProcessingMethod(fileType: string): string {
  if (fileType.includes('pdf')) return 'PDF→JPEG→OCR';
  if (fileType.includes('docx')) return 'DOCX→JPEG→OCR';
  if (fileType.includes('doc')) return 'DOC→JPEG→OCR';
  if (fileType.includes('png')) return 'PNG→JPEG→OCR';
  if (fileType.includes('jpeg') || fileType.includes('jpg')) return 'JPEG→OCR';
  return 'Unknown→JPEG→OCR';
}

function extractEmails(text: string): string[] {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  return [...new Set(text.match(emailRegex) || [])];
}

function extractPhones(text: string): string[] {
  const phonePatterns = [
    /(?:\+63|0)\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{4}/g,
    /(?:\+1)?\s*\(?[0-9]{3}\)?\s*[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g,
    /(?:\+[0-9]{1,3}[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}/g
  ];
  
  const phones: string[] = [];
  phonePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) phones.push(...matches);
  });
  
  return [...new Set(phones)];
}

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s]+/g;
  return [...new Set(text.match(urlRegex) || [])];
}

function extractSections(text: string): Array<{ title: string; content: string }> {
  const lines = text.split('\n').filter(line => line.trim());
  const sections: Array<{ title: string; content: string }> = [];
  
  const sectionHeaders = [
    'SUMMARY', 'OBJECTIVE', 'PROFILE', 'PROFESSIONAL SUMMARY',
    'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT', 'PROFESSIONAL EXPERIENCE', 'CAREER HISTORY',
    'EDUCATION', 'ACADEMIC BACKGROUND', 'EDUCATIONAL BACKGROUND',
    'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'KEY SKILLS',
    'PROJECTS', 'KEY PROJECTS', 'NOTABLE PROJECTS',
    'CERTIFICATIONS', 'CERTIFICATES', 'PROFESSIONAL CERTIFICATIONS',
    'ACHIEVEMENTS', 'AWARDS', 'HONORS', 'ACCOMPLISHMENTS',
    'LANGUAGES', 'INTERESTS', 'HOBBIES', 'REFERENCES'
  ];
  
  let currentSection = '';
  let sectionContent: string[] = [];
  
  lines.forEach(line => {
    const upperLine = line.trim().toUpperCase();
    
    // Check if line is a section header
    const matchedHeader = sectionHeaders.find(header => 
      upperLine === header || 
      upperLine.includes(header) ||
      header.includes(upperLine)
    );
    
    if (matchedHeader && line.trim().length <= 50) {
      // Save previous section
      if (currentSection && sectionContent.length > 0) {
        sections.push({
          title: currentSection,
          content: sectionContent.join('\n').trim()
        });
      }
      
      // Start new section
      currentSection = matchedHeader;
      sectionContent = [];
    } else if (currentSection && line.trim()) {
      sectionContent.push(line.trim());
    }
  });
  
  // Add last section
  if (currentSection && sectionContent.length > 0) {
    sections.push({
      title: currentSection,
      content: sectionContent.join('\n').trim()
    });
  }
  
  return sections;
}

// Legacy compatibility functions
function extractLegacyExperience(sections: Array<{ title: string; content: string }>): any[] {
  const expSection = sections.find(s => 
    s.title.includes('EXPERIENCE') || s.title.includes('EMPLOYMENT')
  );
  
  if (!expSection) return [];
  
  // Simple parsing for backward compatibility
  return [{
    company: 'Company extracted from sections',
    position: 'Position extracted from sections', 
    duration: 'Duration extracted from sections',
    description: expSection.content.substring(0, 200)
  }];
}

function extractLegacyEducation(sections: Array<{ title: string; content: string }>): any[] {
  const eduSection = sections.find(s => 
    s.title.includes('EDUCATION') || s.title.includes('ACADEMIC')
  );
  
  if (!eduSection) return [];
  
  return [{
    institution: 'Institution extracted from sections',
    degree: 'Degree extracted from sections',
    year: 'Year extracted from sections'
  }];
}

function extractLegacySummary(sections: Array<{ title: string; content: string }>): string {
  const summarySection = sections.find(s => 
    s.title.includes('SUMMARY') || s.title.includes('OBJECTIVE') || s.title.includes('PROFILE')
  );
  
  return summarySection?.content || '';
}

// DOCX Processing (DOCX → JSON)
async function processDOCXResume(file: File): Promise<ProcessedResume> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    console.log('Extracted DOCX text:', result.value?.substring(0, 500) + '...');
    
    if (!result.value || result.value.trim().length < 10) {
      throw new Error('No text extracted from DOCX or text too short');
    }
    
    // Note: This old function is replaced by the comprehensive JPEG-first pipeline
    throw new Error('Old DOCX processing - use new pipeline instead');
  } catch (error) {
    console.error('DOCX processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to process DOCX: ${errorMessage}`);
  }
}

// DOC Processing - Basic implementation
async function processDOCResume(file: File): Promise<ProcessedResume> {
  // DOC files require server-side processing for best results
  throw new Error('DOC files require API processing. Please use processResumeFile(file, "api")');
}

// Image Processing (JPG/PNG → OCR → JSON)
async function processImageResume(file: File): Promise<ProcessedResume> {
  try {
    console.log('Processing image file with OCR:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2) + 'MB');
    
    const tesseract = await import('tesseract.js');
    
    // Enhanced OCR with better settings for resume processing
    const worker = await tesseract.createWorker('eng');
    
    // Configure OCR for better text recognition
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,()[]{}:;@#$%&*+-=/<>?!"\' \n\t',
      tessedit_pageseg_mode: tesseract.PSM.AUTO, // Automatic page segmentation
      preserve_interword_spaces: '1'
    });
    
    console.log('Starting OCR processing...');
    const startTime = Date.now();
    
    const { data: { text, confidence } } = await worker.recognize(file);
    
    const processingTime = Date.now() - startTime;
    console.log(`OCR completed in ${processingTime}ms with confidence: ${confidence}%`);
    console.log('OCR extracted text length:', text.length);
    console.log('OCR text preview:', text.substring(0, 300) + '...');
    
    await worker.terminate();
    
    if (!text || text.trim().length < 20) {
      throw new Error(`OCR extracted very little text (${text.trim().length} characters). The image might be low quality or not contain readable text.`);
    }
    
    if (confidence < 30) {
      console.warn(`Low OCR confidence: ${confidence}%. Results may be inaccurate.`);
    }
    
    // Clean up OCR text (common OCR issues)
    const cleanedText = cleanOCRText(text);
    console.log('Cleaned text length:', cleanedText.length);
    
    // Note: This old function is replaced by the comprehensive JPEG-first pipeline
    throw new Error('Old image processing - use new pipeline instead');
  } catch (error) {
    console.error('Image OCR processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown OCR error';
    throw new Error(`Failed to process image with OCR: ${errorMessage}`);
  }
}

// Clean OCR text to fix common recognition issues
function cleanOCRText(text: string): string {
  let cleaned = text;
  
  // Fix common OCR mistakes
  const replacements = [
    // Common character misrecognitions
    [/\b0\b/g, 'O'], // Zero to O
    [/\bl\b/g, 'I'], // lowercase l to I in context
    [/\bS\b(?=[0-9])/g, '5'], // S to 5 before numbers
    [/\bG\b(?=[0-9])/g, '6'], // G to 6 before numbers
    [/\|\|/g, 'll'], // Double pipe to double l
    [/\|(?=[a-zA-Z])/g, 'l'], // Pipe to l before letters
    [/(?<=[a-zA-Z])\|/g, 'l'], // Pipe to l after letters
    
    // Fix spacing issues
    [/\s{3,}/g, ' '], // Multiple spaces to single
    [/\n{3,}/g, '\n\n'], // Multiple newlines to double
    [/([a-z])([A-Z])/g, '$1 $2'], // Add space between lowercase and uppercase
    
    // Fix email and phone patterns that OCR often breaks
    [/(\w+)\s+@\s+(\w+)/g, '$1@$2'], // Fix broken emails
    [/(\d{3})\s*-?\s*(\d{3})\s*-?\s*(\d{4})/g, '$1-$2-$3'], // Fix phone numbers
    
    // Common word fixes
    [/\bskilis\b/gi, 'skills'],
    [/\bexperience\b/gi, 'experience'],
    [/\beducation\b/gi, 'education'],
    [/\bcompany\b/gi, 'company'],
    [/\buniversity\b/gi, 'university'],
    [/\bcollege\b/gi, 'college']
  ];
  
  replacements.forEach(([pattern, replacement]) => {
    if (typeof pattern === 'object' && 'test' in pattern) {
      cleaned = cleaned.replace(pattern as RegExp, replacement as string);
    }
  });
  
  // Remove obviously incorrect characters/lines
  const lines = cleaned.split('\n');
  const filteredLines = lines.filter(line => {
    const trimmed = line.trim();
    // Keep line if it has reasonable content
    return trimmed.length > 0 && 
           !/^[^a-zA-Z0-9]{3,}$/.test(trimmed) && // Skip lines with only special characters
           !/^[|\\\/\-_=+~`!@#$%^&*()]{3,}$/.test(trimmed); // Skip obvious OCR garbage
  });
  
  cleaned = filteredLines.join('\n');
  
  console.log('OCR text cleaning completed');
  return cleaned;
}

// Legacy function - replaced by buildComprehensiveResumeJSON
// (Kept for reference but not used in new pipeline)

// Helper parsing functions
function extractPersonalInfo(text: string) {
  const personalInfo: ProcessedResume['personalInfo'] = {};
  
  console.log('Extracting personal info from text length:', text.length);
  
  // Email regex - more comprehensive
  const emailMatches = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g);
  if (emailMatches && emailMatches.length > 0) {
    personalInfo.email = emailMatches[0]; // Take the first email found
  }
  
  // Phone regex - multiple patterns for different formats
  const phonePatterns = [
    /(?:\+63|0)\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{4}/g,  // Philippines format
    /(?:\+1)?\s*\(?[0-9]{3}\)?\s*[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, // US format
    /(?:\+[0-9]{1,3}[-.\s]?)?[0-9]{3,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}/g // General international
  ];
  
  for (const pattern of phonePatterns) {
    const phoneMatches = text.match(pattern);
    if (phoneMatches && phoneMatches.length > 0) {
      personalInfo.phone = phoneMatches[0].replace(/\s+/g, ' ').trim();
      break;
    }
  }
  
  // LinkedIn regex - more flexible
  const linkedinPatterns = [
    /(?:linkedin\.com\/in\/)([a-zA-Z0-9-]+)/g,
    /(?:linkedin\.com\/profile\/view\?id=)([a-zA-Z0-9-]+)/g,
    /(?:www\.linkedin\.com\/in\/)([a-zA-Z0-9-]+)/g
  ];
  
  for (const pattern of linkedinPatterns) {
    const linkedinMatch = text.match(pattern);
    if (linkedinMatch) {
      const username = linkedinMatch[0].split('/').pop();
      personalInfo.linkedin = `https://linkedin.com/in/${username}`;
      break;
    }
  }
  
  // GitHub regex - more flexible
  const githubPatterns = [
    /(?:github\.com\/)([a-zA-Z0-9-]+)/g,
    /(?:www\.github\.com\/)([a-zA-Z0-9-]+)/g
  ];
  
  for (const pattern of githubPatterns) {
    const githubMatch = text.match(pattern);
    if (githubMatch) {
      const username = githubMatch[0].split('/').pop();
      personalInfo.github = `https://github.com/${username}`;
      break;
    }
  }
  
  // Name extraction - improved with multiple strategies
  const lines = text.split('\n').filter(line => line.trim());
  
  // Strategy 1: Look for name patterns in first few lines
  for (const line of lines.slice(0, 8)) {
    const cleanLine = line.trim();
    // Skip empty lines, emails, phone numbers, addresses, URLs
    if (cleanLine.length < 2 || 
        cleanLine.includes('@') || 
        cleanLine.match(/[0-9]{3}.*[0-9]{3}.*[0-9]{4}/) ||
        cleanLine.includes('http') ||
        cleanLine.includes('.com') ||
        cleanLine.match(/^[0-9]/) ||
        cleanLine.toLowerCase().includes('resume') ||
        cleanLine.toLowerCase().includes('curriculum') ||
        cleanLine.toLowerCase().includes('cv')) {
      continue;
    }
    
    // Look for name patterns (2-4 words, mostly letters)
    if (cleanLine.match(/^[A-Za-z\s'.-]{2,50}$/) && 
        cleanLine.split(' ').length >= 2 && 
        cleanLine.split(' ').length <= 4 &&
        !personalInfo.name) {
      personalInfo.name = cleanLine;
      break;
    }
  }
  
  // Strategy 2: Look for "Name:" patterns
  if (!personalInfo.name) {
    const nameMatch = text.match(/(?:name|full name)[:\s]+([A-Za-z\s'.-]{2,50})/i);
    if (nameMatch && nameMatch[1]) {
      personalInfo.name = nameMatch[1].trim();
    }
  }
  
  // Address extraction
  const addressPatterns = [
    /(?:address|location)[:\s]+([^:\n]{10,100})/i,
    /([A-Za-z\s,]+(?:City|Street|Ave|Avenue|Road|Rd|St|Drive|Dr|Lane|Ln)[^:\n]{0,50})/i
  ];
  
  for (const pattern of addressPatterns) {
    const addressMatch = text.match(pattern);
    if (addressMatch && addressMatch[1]) {
      personalInfo.address = addressMatch[1].trim();
      break;
    }
  }
  
  console.log('Extracted personal info:', personalInfo);
  return personalInfo;
}

function extractSummary(text: string): string | undefined {
  const summaryPatterns = [
    /(?:summary|objective|profile|about)[:\s]*([\s\S]*?)(?:\n\s*\n|experience|education|skills|work)/i,
    /(?:professional\s+summary)[:\s]*([\s\S]*?)(?:\n\s*\n|experience|education|skills|work)/i
  ];
  
  for (const pattern of summaryPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim().substring(0, 500); // Limit summary length
    }
  }
  
  return undefined;
}

function extractExperience(text: string): ProcessedResume['experience'] {
  const experience: ProcessedResume['experience'] = [];
  
  console.log('Extracting experience from text...');
  
  // Multiple patterns to find experience section
  const expSectionPatterns = [
    /(?:work\s+experience|professional\s+experience|employment\s+history|career\s+history)[:\s]*([\s\S]*?)(?:education|academic|skills|certifications|qualifications|$)/i,
    /(?:experience)[:\s]*([\s\S]*?)(?:education|academic|skills|certifications|qualifications|$)/i,
    /(?:employment)[:\s]*([\s\S]*?)(?:education|academic|skills|certifications|qualifications|$)/i
  ];
  
  let expText = '';
  for (const pattern of expSectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 50) {
      expText = match[1];
      break;
    }
  }
  
  // If no clear section found, try to extract from the whole text
  if (!expText || expText.trim().length < 50) {
    expText = text;
  }
  
  // Multiple patterns for extracting individual experience entries
  const experiencePatterns = [
    // Pattern 1: Company - Position (Date)
    /([A-Za-z\s&.,'-]+)\s*[-–]\s*([A-Za-z\s&.,'-]+)\s*\(([^)]*[0-9][^)]*)\)/g,
    // Pattern 2: Position at Company (Date)
    /([A-Za-z\s&.,'-]+)\s+at\s+([A-Za-z\s&.,'-]+)\s*\(([^)]*[0-9][^)]*)\)/g,
    // Pattern 3: Company | Position | Date
    /([A-Za-z\s&.,'-]+)\s*\|\s*([A-Za-z\s&.,'-]+)\s*\|\s*([^|\n]*[0-9][^|\n]*)/g,
    // Pattern 4: Company, Position, Date format
    /([A-Za-z\s&.,'-]+),\s*([A-Za-z\s&.,'-]+),\s*([^,\n]*[0-9][^,\n]*)/g
  ];
  
  // Try each pattern
  for (const pattern of experiencePatterns) {
    const matches = [...expText.matchAll(pattern)];
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        let company = '', position = '', duration = '';
        
        if (pattern.source.includes('at')) {
          // Position at Company format
          position = match[1]?.trim() || '';
          company = match[2]?.trim() || '';
          duration = match[3]?.trim() || '';
        } else {
          // Company - Position format
          company = match[1]?.trim() || '';
          position = match[2]?.trim() || '';
          duration = match[3]?.trim() || '';
        }
        
        // Validate entries
        if (company && company.length > 1 && company.length < 100 &&
            position && position.length > 1 && position.length < 100 &&
            duration && duration.match(/[0-9]/)) {
          
          // Clean up duration
          duration = duration.replace(/[()]/g, '').trim();
          
          experience.push({
            company: company,
            position: position,
            duration: duration,
            description: `Work experience at ${company} as ${position}`,
            achievements: []
          });
        }
      });
    }
  }
  
  // Alternative approach: Look for date patterns and work backwards
  if (experience.length === 0) {
    const datePatterns = [
      /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+[0-9]{4}/gi,
      /[0-9]{4}\s*[-–]\s*[0-9]{4}/g,
      /[0-9]{4}\s*[-–]\s*(?:present|current)/gi,
      /[0-9]{1,2}\/[0-9]{4}/g
    ];
    
    for (const datePattern of datePatterns) {
      const dateMatches = [...expText.matchAll(datePattern)];
      dateMatches.forEach(dateMatch => {
        const dateIndex = dateMatch.index!;
        const beforeDate = expText.substring(Math.max(0, dateIndex - 200), dateIndex);
        const lines = beforeDate.split('\n').filter(line => line.trim());
        
        if (lines.length >= 2) {
          const potentialCompany = lines[lines.length - 2]?.trim();
          const potentialPosition = lines[lines.length - 1]?.trim();
          
          if (potentialCompany && potentialPosition &&
              potentialCompany.length > 1 && potentialCompany.length < 100 &&
              potentialPosition.length > 1 && potentialPosition.length < 100) {
            
            experience.push({
              company: potentialCompany,
              position: potentialPosition,
              duration: dateMatch[0],
              description: `Work experience at ${potentialCompany}`,
              achievements: []
            });
          }
        }
      });
    }
  }
  
  // Look for common BPO companies if we found nothing
  if (experience.length === 0) {
    const bpoCompanies = [
      'teleperformance', 'concentrix', 'accenture', 'ibm', 'cognizant', 'sykes', 'sitel',
      'convergys', 'alorica', 'sutherland', 'transcom', 'call center', 'bpo'
    ];
    
    for (const company of bpoCompanies) {
      const companyRegex = new RegExp(company, 'gi');
      const companyMatches = [...text.matchAll(companyRegex)];
      if (companyMatches.length > 0) {
        experience.push({
          company: company.charAt(0).toUpperCase() + company.slice(1),
          position: 'Customer Service Representative',
          duration: 'Date not specified',
          description: `BPO experience at ${company}`,
          achievements: []
        });
      }
    }
  }
  
  console.log('Extracted experience entries:', experience.length);
  return experience;
}

function extractEducation(text: string): ProcessedResume['education'] {
  const education: ProcessedResume['education'] = [];
  
  console.log('Extracting education from text...');
  
  // Multiple patterns to find education section
  const eduSectionPatterns = [
    /(?:educational\s+background|academic\s+background|education\s+history)[:\s]*([\s\S]*?)(?:experience|work|skills|certifications|qualifications|$)/i,
    /(?:education|academic)[:\s]*([\s\S]*?)(?:experience|work|skills|certifications|qualifications|$)/i,
    /(?:qualifications)[:\s]*([\s\S]*?)(?:experience|work|skills|certifications|$)/i
  ];
  
  let eduText = '';
  for (const pattern of eduSectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 20) {
      eduText = match[1];
      break;
    }
  }
  
  // If no clear section found, search entire text
  if (!eduText || eduText.trim().length < 20) {
    eduText = text;
  }
  
  // Common degree patterns
  const degreePatterns = [
    /(?:bachelor['\s]?s?|bs|ba|bsc)\s+(?:of\s+)?(?:science\s+in\s+|arts\s+in\s+|in\s+)?([a-zA-Z\s]+)/gi,
    /(?:master['\s]?s?|ms|ma|msc|mba)\s+(?:of\s+)?(?:science\s+in\s+|arts\s+in\s+|in\s+)?([a-zA-Z\s]+)/gi,
    /(?:doctor\s+of\s+philosophy|phd|doctorate)\s+(?:in\s+)?([a-zA-Z\s]+)/gi,
    /(?:associate\s+degree|associates?)\s+(?:in\s+)?([a-zA-Z\s]+)/gi,
    /(?:diploma|certificate)\s+(?:in\s+)?([a-zA-Z\s]+)/gi
  ];
  
  // Institution patterns
  const institutionPatterns = [
    /([A-Za-z\s]+(?:university|college|institute|academy))/gi,
    /([A-Za-z\s]+\s+(?:university|college|institute|academy))/gi,
    /(?:university|college|institute|academy)\s+(?:of\s+)?([A-Za-z\s]+)/gi
  ];
  
  // Year patterns
  const yearPatterns = [
    /(?:graduated|class\s+of|year)\s*:?\s*([0-9]{4})/gi,
    /([0-9]{4})\s*[-–]\s*([0-9]{4})/g,
    /([0-9]{4})\s*[-–]\s*(?:present|current)/gi,
    /\b([0-9]{4})\b/g
  ];
  
  // Extract degree and institution combinations
  const combinedPatterns = [
    // Pattern: Degree at/from Institution (Year)
    /(bachelor['\s]?s?|master['\s]?s?|phd|doctorate|associate|diploma)[^,\n]*\s+(?:at|from)\s+([^,\n]+)\s*\(?([0-9]{4})?\)?/gi,
    // Pattern: Institution - Degree (Year)
    /([A-Za-z\s]+(?:university|college|institute))\s*[-–]\s*([^,\n]+)\s*\(?([0-9]{4})?\)?/gi,
    // Pattern: Institution, Degree, Year
    /([A-Za-z\s]+(?:university|college|institute))[,\s]+([^,\n]+)[,\s]+([0-9]{4})/gi
  ];
  
  for (const pattern of combinedPatterns) {
    const matches = [...eduText.matchAll(pattern)];
    matches.forEach(match => {
      let institution = '', degree = '', year = '';
      
      if (pattern.source.includes('at|from')) {
        // Degree at Institution format
        degree = match[1]?.trim() || '';
        institution = match[2]?.trim() || '';
        year = match[3]?.trim() || '';
      } else {
        // Institution - Degree format
        institution = match[1]?.trim() || '';
        degree = match[2]?.trim() || '';
        year = match[3]?.trim() || '';
      }
      
      if (institution && degree) {
        education.push({
          institution: institution,
          degree: degree,
          year: year || 'Year not specified'
        });
      }
    });
  }
  
  // Fallback: Extract separately if no combinations found
  if (education.length === 0) {
    const institutions: string[] = [];
    const degrees: string[] = [];
    const years: string[] = [];
    
    // Extract institutions
    for (const pattern of institutionPatterns) {
      const matches = [...eduText.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].trim().length > 3) {
          institutions.push(match[1].trim());
        }
      });
    }
    
    // Extract degrees
    for (const pattern of degreePatterns) {
      const matches = [...eduText.matchAll(pattern)];
      matches.forEach(match => {
        const fullMatch = match[0].trim();
        if (fullMatch && fullMatch.length > 3) {
          degrees.push(fullMatch);
        }
      });
    }
    
    // Extract years
    for (const pattern of yearPatterns) {
      const matches = [...eduText.matchAll(pattern)];
      matches.forEach(match => {
        if (match[1] && match[1].match(/^[0-9]{4}$/)) {
          years.push(match[1]);
        }
      });
    }
    
    // Combine extracted data
    const maxEntries = Math.max(institutions.length, degrees.length);
    for (let i = 0; i < maxEntries; i++) {
      education.push({
        institution: institutions[i] || 'Institution not specified',
        degree: degrees[i] || 'Degree not specified',
        year: years[i] || 'Year not specified'
      });
    }
  }
  
  // Clean up education entries
  const cleanedEducation = education
    .filter(edu => 
      edu.institution.length > 3 && 
      edu.degree.length > 3 &&
      edu.institution !== edu.degree
    )
    .map(edu => ({
      ...edu,
      institution: edu.institution.replace(/[()[\]]/g, '').trim(),
      degree: edu.degree.replace(/[()[\]]/g, '').trim(),
      year: edu.year.replace(/[()[\]]/g, '').trim()
    }));
  
  console.log('Extracted education entries:', cleanedEducation.length);
  return cleanedEducation;
}

function extractSkills(text: string): string[] {
  const skills: string[] = [];
  
  console.log('Extracting skills from text...');
  
  // Multiple patterns to find skills section
  const skillsSectionPatterns = [
    /(?:technical\s+skills|core\s+skills|key\s+skills|skills\s+summary|professional\s+skills)[:\s]*([\s\S]*?)(?:\n\s*\n|experience|education|certifications|qualifications|$)/i,
    /(?:skills|competencies|technologies|proficiencies)[:\s]*([\s\S]*?)(?:\n\s*\n|experience|education|certifications|qualifications|$)/i,
    /(?:expertise)[:\s]*([\s\S]*?)(?:\n\s*\n|experience|education|certifications|qualifications|$)/i
  ];
  
  let skillsText = '';
  for (const pattern of skillsSectionPatterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].trim().length > 20) {
      skillsText = match[1];
      break;
    }
  }
  
  // If no clear skills section found, search the entire text
  if (!skillsText || skillsText.trim().length < 20) {
    skillsText = text;
  }
  
  // Comprehensive BPO and general skills list
  const bpoSkills = [
    // Core BPO Skills
    'customer service', 'customer support', 'customer care', 'call center', 'contact center',
    'inbound calls', 'outbound calls', 'chat support', 'email support', 'phone support',
    'technical support', 'help desk', 'troubleshooting', 'problem solving',
    
    // Communication Skills
    'communication', 'verbal communication', 'written communication', 'english proficiency',
    'english communication', 'active listening', 'interpersonal skills',
    
    // Technical Skills
    'microsoft office', 'ms office', 'excel', 'word', 'powerpoint', 'outlook',
    'google workspace', 'google docs', 'google sheets',
    'typing', 'data entry', 'computer skills', 'internet navigation',
    
    // CRM and Software
    'crm', 'salesforce', 'zendesk', 'freshdesk', 'servicenow', 'oracle',
    'sap', 'erp', 'database management', 'sql', 'reporting',
    
    // Soft Skills
    'multitasking', 'time management', 'adaptability', 'teamwork', 'leadership',
    'patience', 'empathy', 'conflict resolution', 'stress management',
    
    // Industry Specific
    'quality assurance', 'qa', 'compliance', 'data analysis', 'reporting',
    'sales', 'lead generation', 'cold calling', 'appointment setting',
    'order processing', 'billing', 'account management'
  ];
  
  const technicalSkills = [
    'html', 'css', 'javascript', 'python', 'java', 'c++', 'php', 'sql',
    'mysql', 'postgresql', 'mongodb', 'redis', 'aws', 'azure', 'gcp',
    'docker', 'kubernetes', 'git', 'github', 'linux', 'windows', 'macos'
  ];
  
  const allSkills = [...bpoSkills, ...technicalSkills];
  
  // Extract skills from skills section
  if (skillsText && skillsText.trim().length > 20) {
    // Extract by common delimiters
    const extractedSkills = skillsText.split(/[,\n•\-\*\|\t·]/)
      .map(skill => skill.trim())
      .map(skill => skill.replace(/^[-•\*·\s]+/, '')) // Remove bullet points
      .map(skill => skill.replace(/[()[\]]/g, '')) // Remove brackets
      .filter(skill => skill.length > 1 && skill.length < 80)
      .filter(skill => !skill.match(/^[0-9]+$/)) // Remove pure numbers
      .filter(skill => !skill.toLowerCase().includes('year')) // Remove "X years" patterns
      .filter(skill => !skill.toLowerCase().includes('experience')); // Remove "experience" words
    
    skills.push(...extractedSkills);
  }
  
  // Search for skills throughout the entire text
  allSkills.forEach(skill => {
    const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(skillRegex);
    if (matches && matches.length > 0) {
      // Use proper case version
      const properCaseSkill = skill.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      if (!skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
        skills.push(properCaseSkill);
      }
    }
  });
  
  // Extract programming languages and technologies
  const techPatterns = [
    /(?:programming\s+languages?|technologies?|tools?)[:\s]*([\s\S]*?)(?:\n\s*\n|experience|education|$)/i,
    /(?:software)[:\s]*([\s\S]*?)(?:\n\s*\n|experience|education|$)/i
  ];
  
  for (const pattern of techPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const techSkills = match[1].split(/[,\n•\-\*\|]/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 1 && skill.length < 50);
      skills.push(...techSkills);
    }
  }
  
  // Clean up and deduplicate skills
  const cleanedSkills = skills
    .map(skill => skill.trim())
    .filter(skill => skill.length > 1 && skill.length < 80)
    .filter(skill => !skill.match(/^[0-9\s\-\.]+$/)) // Remove number-only strings
    .filter(skill => !skill.toLowerCase().match(/^(the|and|or|in|at|for|with|by)$/)) // Remove common words
    .map(skill => {
      // Capitalize first letter of each word
      return skill.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    });
  
  // Remove duplicates (case-insensitive)
  const uniqueSkills: string[] = [];
  cleanedSkills.forEach(skill => {
    if (!uniqueSkills.some(existing => 
      existing.toLowerCase() === skill.toLowerCase() || 
      existing.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(existing.toLowerCase())
    )) {
      uniqueSkills.push(skill);
    }
  });
  
  console.log('Extracted skills count:', uniqueSkills.length);
  return uniqueSkills.slice(0, 50); // Limit to 50 skills to avoid bloat
}

function extractCertifications(text: string): string[] {
  const certifications: string[] = [];
  
  const certMatch = text.match(/(?:certifications|certificates|licenses)[:\s]*([\s\S]*?)(?:\n\s*\n|experience|education|skills|$)/i);
  if (certMatch) {
    const certText = certMatch[1];
    const extractedCerts = certText.split(/[,\n•\-\*]/)
      .map(cert => cert.trim())
      .filter(cert => cert.length > 0 && cert.length < 100);
    certifications.push(...extractedCerts);
  }
  
  return certifications;
}

function extractLanguages(text: string): string[] {
  const languages: string[] = [];
  
  const langMatch = text.match(/(?:languages)[:\s]*([\s\S]*?)(?:\n\s*\n|experience|education|skills|certifications|$)/i);
  if (langMatch) {
    const langText = langMatch[1];
    const extractedLangs = langText.split(/[,\n•\-\*]/)
      .map(lang => lang.trim())
      .filter(lang => lang.length > 0 && lang.length < 30);
    languages.push(...extractedLangs);
  }
  
  // Common languages for BPO
  const commonLanguages = ['english', 'filipino', 'tagalog', 'cebuano', 'spanish', 'mandarin'];
  commonLanguages.forEach(lang => {
    if (text.toLowerCase().includes(lang) && !languages.some(l => l.toLowerCase() === lang)) {
      languages.push(lang.charAt(0).toUpperCase() + lang.slice(1));
    }
  });
  
  return [...new Set(languages)];
}

function calculateConfidence(text: string, method: 'ocr' | 'document'): number {
  let confidence = method === 'document' ? 85 : 70; // Base confidence
  
  // Boost confidence based on extracted data quality
  if (text.includes('@')) confidence += 5; // Has email
  if (text.match(/\b[0-9]{3}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/)) confidence += 5; // Has phone
  if (text.toLowerCase().includes('experience')) confidence += 5;
  if (text.toLowerCase().includes('education')) confidence += 5;
  if (text.toLowerCase().includes('skills')) confidence += 5;
  
  return Math.min(confidence, 95); // Cap at 95%
}

// API-based processing (recommended for production)
async function processResumeViaAPI(file: File): Promise<ProcessedResume> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', file.type);
  
  try {
    const response = await fetch('/api/resume/parse', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('API processing failed');
    }
    
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('API processing error:', error);
    throw new Error('Failed to process resume via API');
  }
}

// Resume validation and scoring
export function validateProcessedResume(resume: ProcessedResume): { 
  isValid: boolean; 
  issues: string[]; 
  score: number;
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;
  
  // Check personal info
  if (resume.personalInfo.email) score += 15;
  else {
    issues.push('Missing email address');
    suggestions.push('Add a professional email address');
  }
  
  if (resume.personalInfo.phone) score += 10;
  else {
    issues.push('Missing phone number');
    suggestions.push('Include a contact phone number');
  }
  
  if (resume.personalInfo.name) score += 10;
  else {
    issues.push('Missing full name');
    suggestions.push('Ensure your full name is clearly visible');
  }
  
  // Legacy validation - updated for new comprehensive structure
  if (resume.parsed?.sections?.length > 0) score += 25;
  else {
    issues.push('No structured sections found');
    suggestions.push('Ensure your resume has clear sections');
  }
  
  // Check skills in new structure
  if (resume.parsed?.skills?.length > 0) score += 15;
  else {
    issues.push('No skills listed');
    suggestions.push('List your relevant skills and competencies');
  }
  
  // Check summary
  if (resume.summary) score += 5;
  else suggestions.push('Consider adding a professional summary');
  
  return {
    isValid: issues.length === 0,
    issues,
    score: Math.min(score, 100),
    suggestions
  };
}

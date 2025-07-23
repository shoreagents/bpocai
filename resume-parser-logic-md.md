# Resume Parser Logic Documentation

## Overview
This document outlines the complete logic for a multi-format resume parser that converts various file types to JPEG images, performs OCR text extraction, and outputs structured JSON data.

## Core Processing Logic

### File Type Handling Workflow
```
IF RESUME FILE TYPE IS:
1. PDF → CONVERT TO JPEG → OCR → JSON
2. DOCX → CONVERT TO JPEG → OCR → JSON  
3. JPG/JPEG → OCR → JSON
4. DOC → CONVERT TO JPEG → OCR → JSON
5. PNG → CONVERT TO JPEG → OCR → JSON
```

### Processing Pipeline
```
Input File → File Type Detection → Format Conversion → JPEG Generation → OCR Processing → Text Parsing → JSON Output
```

## Required Packages

### Core Dependencies
```json
{
  "dependencies": {
    // File conversion
    "pdfjs-dist": "^3.11.174",           // PDF to canvas/image
    "mammoth": "^1.6.0",                // DOCX to HTML conversion
    "html2canvas": "^1.4.1",            // HTML to image conversion
    "file-type": "^18.5.0",             // File type detection
    
    // OCR Processing
    "tesseract.js": "^5.0.4",           // Client-side OCR
    "@google-cloud/vision": "^4.0.0",   // Google Cloud Vision (optional)
    "aws-sdk": "^2.1400.0",             // AWS Textract (optional)
    
    // Utilities
    "lodash": "^4.17.21",               // Data manipulation
    "date-fns": "^2.30.0",              // Date parsing
    
    // React/UI
    "react": "^18.2.0",
    "lucide-react": "^0.263.1"          // Icons
  }
}
```

## File Conversion Methods

### 1. PDF to JPEG Conversion
```javascript
// Using PDF.js to convert PDF pages to JPEG images
const convertPDFToJPEG = async (pdfFile) => {
  const pdf = await pdfjsLib.getDocument(pdfFile).promise;
  const jpegImages = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({ canvasContext: context, viewport }).promise;
    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    jpegImages.push(jpegDataUrl);
  }
  
  return jpegImages;
};
```

### 2. DOCX to JPEG Conversion
```javascript
// Convert DOCX → HTML → Rendered Element → JPEG
const convertDOCXToJPEG = async (docxFile) => {
  // Step 1: DOCX to HTML using mammoth
  const arrayBuffer = await docxFile.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  
  // Step 2: Render HTML to DOM element
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = result.value;
  tempDiv.style.cssText = `
    width: 800px;
    padding: 20px;
    font-family: Arial, sans-serif;
    background-color: white;
    line-height: 1.4;
  `;
  document.body.appendChild(tempDiv);
  
  // Step 3: Convert DOM element to JPEG using html2canvas
  const canvas = await html2canvas(tempDiv, {
    backgroundColor: 'white',
    scale: 2,
    useCORS: true
  });
  
  document.body.removeChild(tempDiv);
  const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
  return [jpegDataUrl];
};
```

### 3. PNG to JPEG Conversion
```javascript
// Convert PNG to JPEG (handling transparency)
const convertPNGToJPEG = async (pngFile) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Fill white background (replace PNG transparency)
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw PNG image on white background
      ctx.drawImage(img, 0, 0);
      
      // Convert to JPEG
      const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      resolve([jpegDataUrl]);
    };
    
    img.src = URL.createObjectURL(pngFile);
  });
};
```

### 4. DOC File Handling
```javascript
// DOC files require server-side conversion or external API
const convertDOCToJPEG = async (docFile) => {
  // Option 1: Server-side conversion endpoint
  const formData = new FormData();
  formData.append('file', docFile);
  
  const response = await fetch('/api/convert-doc-to-jpeg', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('DOC conversion failed');
  }
  
  const jpegBlob = await response.blob();
  const jpegDataUrl = URL.createObjectURL(jpegBlob);
  return [jpegDataUrl];
  
  // Option 2: Use CloudConvert or similar API
  // Option 3: Convert DOC → DOCX → JPEG (if possible)
};
```

## OCR Processing

### Tesseract.js Implementation
```javascript
import Tesseract from 'tesseract.js';

const performOCR = async (jpegDataUrl) => {
  const { data: { text, confidence } } = await Tesseract.recognize(
    jpegDataUrl,
    'eng',
    {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      preserve_interword_spaces: '1'
    }
  );
  
  return { text, confidence };
};
```

### Cloud OCR Options (Alternative)
```javascript
// Google Cloud Vision API
const googleOCR = async (base64Image) => {
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [{
        image: { content: base64Image },
        features: [{ type: 'TEXT_DETECTION', maxResults: 1 }]
      }]
    })
  });
  
  const result = await response.json();
  return result.responses[0]?.textAnnotations[0]?.description || '';
};
```

## JSON Output Structure

### Expected JSON Format
```typescript
interface ResumeJSON {
  // Metadata
  fileName: string;
  fileType: string;
  processingMethod: string;
  extractedAt: string;
  ocrConfidence?: number;
  
  // Raw data
  rawText: string;
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
}
```

### Example JSON Output
```json
{
  "fileName": "john_doe_resume.pdf",
  "fileType": "application/pdf",
  "processingMethod": "PDF->JPEG->OCR",
  "extractedAt": "2025-07-23T10:30:00.000Z",
  "ocrConfidence": 89.5,
  "rawText": "JOHN DOE\nSoftware Engineer...",
  "parsed": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "(555) 123-4567",
      "title": "Software Engineer"
    },
    "sections": [
      {
        "title": "EXPERIENCE",
        "content": "Senior Software Engineer - TechCorp (2020-Present)..."
      },
      {
        "title": "EDUCATION",
        "content": "Bachelor of Science in Computer Science - MIT (2016-2020)"
      }
    ],
    "skills": ["JavaScript", "React", "Node.js"],
    "emails": ["john.doe@email.com"],
    "phones": ["(555) 123-4567"],
    "urls": ["https://johndoe.dev"]
  }
}
```

## Text Parsing Logic

### Personal Information Extraction
```javascript
const extractPersonalInfo = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  const personalInfo = {};
  
  // Name (usually first line)
  if (lines.length > 0) {
    personalInfo.name = lines[0].trim();
  }
  
  // Email extraction
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
  const emails = text.match(emailRegex) || [];
  if (emails.length > 0) {
    personalInfo.email = emails[0];
  }
  
  // Phone extraction
  const phoneRegex = /(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const phones = text.match(phoneRegex) || [];
  if (phones.length > 0) {
    personalInfo.phone = phones[0];
  }
  
  // Title (second line if no special characters)
  if (lines.length > 1 && !emails.includes(lines[1]) && !phones.includes(lines[1])) {
    personalInfo.title = lines[1].trim();
  }
  
  return personalInfo;
};
```

### Section Detection
```javascript
const extractSections = (text) => {
  const lines = text.split('\n').filter(line => line.trim());
  const sections = [];
  
  const sectionHeaders = [
    'SUMMARY', 'OBJECTIVE', 'PROFILE',
    'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT', 'PROFESSIONAL EXPERIENCE',
    'EDUCATION', 'ACADEMIC BACKGROUND',
    'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES',
    'PROJECTS', 'KEY PROJECTS',
    'CERTIFICATIONS', 'CERTIFICATES',
    'ACHIEVEMENTS', 'AWARDS', 'HONORS',
    'LANGUAGES', 'INTERESTS', 'REFERENCES'
  ];
  
  let currentSection = '';
  let sectionContent = [];
  
  lines.forEach(line => {
    const upperLine = line.trim().toUpperCase();
    
    // Check if line is a section header
    if (sectionHeaders.some(header => upperLine.includes(header))) {
      // Save previous section
      if (currentSection && sectionContent.length > 0) {
        sections.push({
          title: currentSection,
          content: sectionContent.join('\n').trim()
        });
      }
      
      // Start new section
      currentSection = upperLine;
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
};
```

## Main Processing Function

### Universal File Processor
```javascript
const processResumeFile = async (file) => {
  let jpegImages = [];
  let processingMethod = '';
  
  // Step 1: Convert to JPEG based on file type
  switch (file.type) {
    case 'application/pdf':
      jpegImages = await convertPDFToJPEG(file);
      processingMethod = 'PDF->JPEG->OCR';
      break;
      
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      jpegImages = await convertDOCXToJPEG(file);
      processingMethod = 'DOCX->JPEG->OCR';
      break;
      
    case 'application/msword':
      jpegImages = await convertDOCToJPEG(file);
      processingMethod = 'DOC->JPEG->OCR';
      break;
      
    case 'image/png':
      jpegImages = await convertPNGToJPEG(file);
      processingMethod = 'PNG->JPEG->OCR';
      break;
      
    case 'image/jpeg':
    case 'image/jpg':
      jpegImages = [URL.createObjectURL(file)];
      processingMethod = 'JPEG->OCR';
      break;
      
    default:
      throw new Error(`Unsupported file type: ${file.type}`);
  }
  
  // Step 2: Perform OCR on all JPEG images
  let fullText = '';
  let totalConfidence = 0;
  
  for (const jpegDataUrl of jpegImages) {
    const { text, confidence } = await performOCR(jpegDataUrl);
    fullText += text + '\n';
    totalConfidence += confidence;
  }
  
  const averageConfidence = totalConfidence / jpegImages.length;
  
  // Step 3: Parse text to structured JSON
  const personalInfo = extractPersonalInfo(fullText);
  const sections = extractSections(fullText);
  
  // Step 4: Extract additional data
  const emails = fullText.match(/[\w\.-]+@[\w\.-]+\.\w+/g) || [];
  const phones = fullText.match(/(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g) || [];
  const urls = fullText.match(/https?:\/\/[^\s]+/g) || [];
  
  // Step 5: Build final JSON
  const resumeJSON = {
    fileName: file.name,
    fileType: file.type,
    processingMethod,
    extractedAt: new Date().toISOString(),
    ocrConfidence: averageConfidence,
    rawText: fullText,
    jpegImages, // Optional: include generated images
    parsed: {
      personalInfo,
      sections,
      skills: [], // TODO: Implement skills extraction
      emails,
      phones,
      urls
    }
  };
  
  return resumeJSON;
};
```

## Error Handling

### Robust Error Handling
```javascript
const safeProcessResumeFile = async (file) => {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size too large (max 10MB)');
    }
    
    // Process file
    return await processResumeFile(file);
    
  } catch (error) {
    console.error('Resume processing error:', error);
    
    return {
      fileName: file?.name || 'unknown',
      fileType: file?.type || 'unknown',
      processingMethod: 'FAILED',
      extractedAt: new Date().toISOString(),
      error: error.message,
      rawText: '',
      parsed: {
        personalInfo: {},
        sections: [],
        skills: [],
        emails: [],
        phones: [],
        urls: []
      }
    };
  }
};
```

## Implementation Notes

### Performance Considerations
- PDF conversion can be slow for large files
- OCR processing takes 10-30 seconds per page
- Consider showing progress indicators
- Implement file size limits
- Use Web Workers for heavy processing

### Accuracy Improvements
- Use higher scale (2.0+) for better image quality
- Preprocess images (contrast, brightness)
- Use multiple OCR engines and compare results
- Implement post-processing text cleanup

### Browser Compatibility
- PDF.js works in all modern browsers
- html2canvas has some limitations
- File API support required
- Canvas API support required

### Security Considerations
- Validate file types on both client and server
- Implement file size limits
- Sanitize extracted text
- Be cautious with DOC files (potential security risk)

## Usage Example

```javascript
// React component usage
const ResumeUploader = () => {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const resumeJSON = await safeProcessResumeFile(file);
      console.log('Processed resume:', resumeJSON);
      
      // Download JSON
      const blob = new Blob([JSON.stringify(resumeJSON, null, 2)], 
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name}_parsed.json`;
      link.click();
      
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };
  
  return (
    <input 
      type="file" 
      accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
      onChange={handleFileUpload}
    />
  );
};
```
'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, Link, X, FileText, Image, AlertCircle, Check, Plus, Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { isValidFileType, categorizeFile, isValidUrl, categorizePortfolioLink, saveToLocalStorage, generateSessionId, fileToBase64, formatFileSize, processResumeFile, ProcessedResume, validateProcessedResume } from '@/lib/utils';
import Header from '@/components/layout/Header';

export default function ResumeBuilderPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Resume processing states
  const [processedResumes, setProcessedResumes] = useState<ProcessedResume[]>([]);
  const [processingStatus, setProcessingStatus] = useState<Record<string, 'processing' | 'completed' | 'error'>>({});
  
  // Processing logs state
  const [processingLogs, setProcessingLogs] = useState<Record<string, string[]>>({});
  const [showProcessingLogs, setShowProcessingLogs] = useState(false);
  const [showDOCXPreview, setShowDOCXPreview] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  
  // AI Analysis states
  const [isAnalyzingWithClaude, setIsAnalyzingWithClaude] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Handle file drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    files.forEach(file => {
      if (!isValidFileType(file)) {
        newErrors.push(`${file.name}: Unsupported file type. Please upload PDF, DOC, DOCX, or image files.`);
      } else if (file.size > 10 * 1024 * 1024) { // 10MB limit
        newErrors.push(`${file.name}: File too large. Maximum size is 10MB.`);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(prev => [...prev, ...newErrors]);
    }

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      setErrors(prev => prev.filter(error => !newErrors.includes(error)));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addPortfolioLink = () => {
    if (!newLink.trim()) return;

    if (!isValidUrl(newLink)) {
      setErrors(prev => [...prev, 'Please enter a valid URL']);
      return;
    }

    if (portfolioLinks.includes(newLink)) {
      setErrors(prev => [...prev, 'This URL has already been added']);
      return;
    }

    setPortfolioLinks(prev => [...prev, newLink]);
    setNewLink('');
    setErrors(prev => prev.filter(error => !error.includes('URL')));
  };

  const removeLink = (index: number) => {
    setPortfolioLinks(prev => prev.filter((_, i) => i !== index));
  };

  const canContinue = uploadedFiles.length > 0 || portfolioLinks.length > 0;

  // Fetch API keys securely and process file on client
  const processFileWithAPI = async (file: File, log: (message: string) => void) => {
    try {
      log(`🔐 Fetching secure API keys...`);
      
      // Fetch API keys from secure server endpoint
      const keyResponse = await fetch('/api/get-api-key');
      if (!keyResponse.ok) {
        throw new Error('Failed to fetch API keys from server');
      }
      
      const keyResult = await keyResponse.json();
      if (!keyResult.success) {
        throw new Error(keyResult.error || 'API keys not available');
      }
      
      log(`✅ API keys obtained, processing file with CloudConvert + GPT pipeline...`);
      
      // Process file using the updated CloudConvert + GPT pipeline with API keys
      const processedResume = await processResumeFileWithLogs(file, keyResult.openaiApiKey, keyResult.cloudConvertApiKey, log);
      
      return processedResume;
      
    } catch (error) {
      log(`❌ Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  // Custom logger to capture processing logs
  const createFileLogger = (fileName: string) => {
    const logs: string[] = [];
    
    const log = (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] ${message}`;
      logs.push(logEntry);
      console.log(message); // Still log to console
      
      // Update logs state
      setProcessingLogs(prev => ({
        ...prev,
        [fileName]: [...logs]
      }));
    };
    
    return { log, getLogs: () => logs };
  };

  // Process uploaded files to JSON using OpenAI
  const processUploadedFiles = async () => {
    if (uploadedFiles.length === 0) return;

    // Clear previous logs
    setProcessingLogs({});
    setShowProcessingLogs(true);
    setIsAnalyzingWithClaude(true);
    setAnalysisProgress(0);

    const processedResults: ProcessedResume[] = [];
    
    for (const file of uploadedFiles) {
      const { log } = createFileLogger(file.name);
      setProcessingStatus(prev => ({ ...prev, [file.name]: 'processing' }));
      
      try {
        log(`🚀 Starting new resume processing pipeline for: ${file.name}`);
        log(`📋 Process: File → API Text Extraction → DOCX Creation → JSON Conversion`);
        log(`📏 File size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        log(`📁 File type: ${file.type}`);
        
        // Update progress for JSON conversion
        setAnalysisProgress(25);
        
        // Process with server-side API
        const processedResume = await processFileWithAPI(file, log);
        processedResults.push(processedResume);
        
        setProcessingStatus(prev => ({ ...prev, [file.name]: 'completed' }));
        log(`✅ Pipeline Complete: Flexible resume extraction successful!`);
        log(`📊 Final JSON contains ${Object.keys(processedResume).filter(key => key !== '_uiMetadata').length} dynamic fields`);
        
        // Update progress for Claude analysis preparation
        setAnalysisProgress(50);
        log(`🤖 Preparing data for Claude AI analysis...`);
        
        // Simulate Claude analysis (this will be done in the analysis page)
        setAnalysisProgress(75);
        log(`🧠 Claude AI will analyze the JSON data in the next step...`);
        
        setAnalysisProgress(100);
        log(`✅ Ready for Claude AI analysis!`);
        
      } catch (error) {
        console.error(`❌ Error processing ${file.name}:`, error);
        const { log } = createFileLogger(file.name);
        log(`❌ Pipeline Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        
        setProcessingStatus(prev => ({ ...prev, [file.name]: 'error' }));
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        setErrors(prev => [...prev, `Failed to process ${file.name}: ${errorMessage}`]);
      }
    }
    
    setProcessedResumes(processedResults);
    if (processedResults.length > 0) {
      // Auto-show DOCX preview and JSON for the new pipeline
      setShowDOCXPreview(true);
      setShowJsonPreview(true);
    }
    
    // Reset analysis state after a delay
    setTimeout(() => {
      setIsAnalyzingWithClaude(false);
      setAnalysisProgress(0);
    }, 2000);
  };

  // Process a single resume file with logs
  const processResumeFileWithLogs = async (file: File, openaiApiKey: string, cloudConvertApiKey: string, log: (message: string) => void): Promise<ProcessedResume> => {
    try {
      const fileType = file.type.toLowerCase();
      const needsCloudConvert = fileType.includes('pdf') || fileType.includes('wordprocessingml') || fileType.includes('msword');
      
      // Step 1: Document Conversion (if needed)
      if (needsCloudConvert) {
        log(`🔄 Step 1: Converting ${file.name} to JPEG using CloudConvert`);
        log(`📋 Multi-page support: Processing ALL pages individually`);
        log(`⚙️ CloudConvert API: Creating conversion job...`);
        log(`📤 Uploading document for conversion...`);
        log(`🎯 Target format: JPEG per page (optimized for GPT Vision)`);
        log(`📄 Downloading converted JPEG files for each page...`);
      }

      // Step 2: OCR Processing
      log(`🤖 Step 2: Multi-Page GPT Vision OCR Processing`);
      log(`🔍 Initializing GPT-4 Vision for text extraction...`);
      log(`📄 Processing ${needsCloudConvert ? 'all converted JPEG pages' : 'image file'}...`);
      log(`🎯 Extracting all visible text from every page, preserving structure...`);

      // Step 3: DOCX Creation
      log(`📄 Step 3: Creating Organized DOCX Document`);
      log(`📝 Initializing DOCX document with extracted content...`);
      log(`🎨 Formatting text sections and headers...`);
      log(`⚙️ Generating DOCX binary data...`);

      // Step 4: JSON Conversion
      log(`🔄 Step 4: Converting DOCX to Structured JSON`);
      log(`📖 Reading DOCX content for verification...`);
      log(`🤖 Sending to GPT-4 for intelligent JSON structuring...`);
      log(`🎯 Extracting skills, experience, education, and contact info...`);

      // Call the actual processing function directly with API keys (no circular calls)
      const result = await processResumeFile(file, openaiApiKey, cloudConvertApiKey);
      
      // Complete
      log(`✅ Pipeline Complete: CloudConvert + GPT OCR processing successful!`);
      
      return result;
    } catch (error) {
      log(`❌ Processing failed for ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleContinue = async () => {
    if (!canContinue) return;

    setLoading(true);
    
    try {
      // Generate session ID and save data
      const sessionId = generateSessionId();
      
      // Save uploaded files info
      const fileInfo = uploadedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        category: categorizeFile(file)
      }));

      // Save portfolio links with categorization
      const linkInfo = portfolioLinks.map(link => ({
        url: link,
        type: categorizePortfolioLink(link),
        title: new URL(link).hostname
      }));

      // Convert files to base64 for storage and API processing
      const processedFiles = await Promise.all(
        uploadedFiles.map(async (file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: file.lastModified,
          data: await fileToBase64(file)
        }))
      );

      // Save to localStorage for persistence
      saveToLocalStorage('bpoc_session_id', sessionId);
      saveToLocalStorage('bpoc_uploaded_files', fileInfo);
      saveToLocalStorage('bpoc_portfolio_links', linkInfo);
      saveToLocalStorage('bpoc_processed_files', processedFiles);
      saveToLocalStorage('bpoc_processed_resumes', processedResumes);

      // Navigate to analysis page
      router.push('/resume-builder/analysis');
      
    } catch (error) {
      console.error('Error saving upload data:', error);
      setErrors(prev => [...prev, 'Failed to save upload data. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5 text-purple-400" />;
    if (file.type.includes('pdf')) return <FileText className="h-5 w-5 text-red-400" />;
    if (file.type.includes('word') || file.type.includes('document')) return <FileText className="h-5 w-5 text-blue-400" />;
    return <FileText className="h-5 w-5 text-cyan-400" />;
  };

  const getFileTypeBadge = (file: File) => {
    const category = categorizeFile(file);
    const colorMap: { [key: string]: string } = {
      'PDF Document': 'bg-red-500/20 text-red-400 border-red-400/30',
      'Word Document': 'bg-blue-500/20 text-blue-400 border-blue-400/30',
      'Image': 'bg-purple-500/20 text-purple-400 border-purple-400/30',
      'Document': 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30'
    };
    
    return (
      <Badge 
        variant="outline" 
        className={`text-xs ${colorMap[category] || colorMap['Document']}`}
      >
        {category}
      </Badge>
    );
  };

  const getLinkIcon = (url: string) => {
    const type = categorizePortfolioLink(url);
    switch (type) {
      case 'linkedin': return '💼';
      case 'github': return '🐙';
      case 'behance': return '🎨';
      case 'dribbble': return '🏀';
      default: return '🔗';
    }
  };

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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <Sparkles className="h-12 w-12 text-cyan-400 mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold gradient-text">
                Resume Analyzer
              </h1>
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
           Upload your files and add portfolio links - we'll create your complete candidate intelligence profile
            </p>
          </motion.div>



        {/* Main Upload Interface */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* File Upload Section */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="glass-card border-white/10 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Upload className="h-5 w-5 text-cyan-400" />
                      📁 Upload Files
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Resume • Certificates • Work Samples
                      <br />
                      <span className="text-cyan-400">PDF, DOC, DOCX, JPG, PNG</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Drop Zone */}
                    <div
                      className={`relative p-8 border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer ${
                        dragActive 
                          ? 'border-cyan-400 bg-cyan-400/5' 
                          : 'border-white/20 hover:border-cyan-400/50 hover:bg-cyan-400/5'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">
                          📄 Drop Files Here
                        </h3>
                        <p className="text-gray-400 mb-4">
                          or click to browse files
                        </p>
                        <Button variant="outline" className="border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10">
                          Browse Files
                        </Button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.gif"
                        onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                        className="hidden"
                      />
                    </div>



                    {/* Uploaded Files */}
                    {uploadedFiles.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-400" />
                          Uploaded Files:
                        </h4>
                        <div className="space-y-2">
                          {uploadedFiles.map((file, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center justify-between p-3 glass-card rounded-lg border border-white/10"
                            >
                              <div className="flex items-center gap-3">
                                {getFileIcon(file)}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-white font-medium">{file.name}</p>
                                    {getFileTypeBadge(file)}
                                  </div>
                                  <p className="text-gray-400 text-sm">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Portfolio Links Section */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="glass-card border-white/10 h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Link className="h-5 w-5 text-purple-400" />
                      🔗 Portfolio Links
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      <span className="text-purple-400">LinkedIn • GitHub • Personal Website • Portfolio</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Add Link Input */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        placeholder="https://linkedin.com/in/yourname"
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50"
                        onKeyPress={(e) => e.key === 'Enter' && addPortfolioLink()}
                      />
                      <Button onClick={addPortfolioLink} size="sm" className="bg-purple-500 hover:bg-purple-600">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Portfolio Links List */}
                    {portfolioLinks.length > 0 && (
                      <div>
                        <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-400" />
                          Portfolio Links:
                        </h4>
                        <div className="space-y-2">
                          {portfolioLinks.map((link, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center justify-between p-3 glass-card rounded-lg border border-white/10"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{getLinkIcon(link)}</span>
                                <div>
                                  <p className="text-white font-medium">
                                    {new URL(link).hostname}
                                  </p>
                                  <p className="text-gray-400 text-sm truncate max-w-xs">
                                    {link}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLink(index)}
                                className="text-gray-400 hover:text-red-400"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Add Buttons */}
                    <div className="pt-4 border-t border-white/10">
                      <p className="text-gray-400 text-sm mb-3">Quick add common platforms:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewLink('https://linkedin.com/in/')}
                          className="border-white/20 text-gray-300 hover:bg-white/10"
                        >
                          💼 LinkedIn
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewLink('https://github.com/')}
                          className="border-white/20 text-gray-300 hover:bg-white/10"
                        >
                          🐙 GitHub
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewLink('https://behance.net/')}
                          className="border-white/20 text-gray-300 hover:bg-white/10"
                        >
                          🎨 Behance
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewLink('https://')}
                          className="border-white/20 text-gray-300 hover:bg-white/10"
                        >
                          🌐 Website
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <Card className="glass-card border-red-500/30 bg-red-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-400 mb-2">Please fix these issues:</h4>
                        <ul className="space-y-1">
                          {errors.map((error, index) => (
                            <li key={index} className="text-sm text-red-300">
                              • {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Process Files Section */}
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <Card className="glass-card border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                      🤖 AI-Powered Resume Analysis
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Extract content exactly as written, create literal DOCX, then convert to faithful JSON

                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Process Files Button */}
                    <div className="text-center space-y-4">
                      <Button
                        onClick={processUploadedFiles}
                        disabled={uploadedFiles.length === 0 || Object.keys(processingStatus).some(key => processingStatus[key] === 'processing')}
                        className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-2"
                      >
                        {Object.keys(processingStatus).some(key => processingStatus[key] === 'processing') ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            {isAnalyzingWithClaude ? 'Claude AI Processing...' : 'AI Processing...'}
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                      
                      {/* Claude Analysis Progress */}
                      {isAnalyzingWithClaude && (
                        <div className="max-w-md mx-auto">
                          <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                            <span>JSON Conversion & Claude Analysis</span>
                            <span>{analysisProgress}%</span>
                          </div>
                          <Progress 
                            value={analysisProgress} 
                            className="h-2 bg-white/10"
                          />
                          <div className="flex items-center justify-center mt-2 text-xs text-cyan-400">
                            <Brain className="h-3 w-3 mr-1 animate-pulse" />
                            Claude AI will analyze your resume data
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Processing Status */}
                    {Object.keys(processingStatus).length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-white">Processing Status:</h5>
                        {uploadedFiles.map((file, index) => {
                          const status = processingStatus[file.name];
                          const fileType = file.type.toLowerCase();
                          const needsCloudConvert = fileType.includes('pdf') || fileType.includes('wordprocessingml') || fileType.includes('msword');
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 glass-card rounded border border-white/10">
                              <div className="flex-1">
                                <div className="text-gray-300 text-sm font-medium">{file.name}</div>
                                <div className="text-gray-400 text-xs mt-1">
                                  {needsCloudConvert ? '🔄 CloudConvert → GPT → DOCX → JSON' : '🤖 GPT → DOCX → JSON'}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {status === 'processing' && (
                                  <>
                                    <div className="animate-spin h-3 w-3 border border-cyan-400 border-t-transparent rounded-full" />
                                    <span className="text-cyan-400 text-xs">
                                      {needsCloudConvert ? 'CloudConvert...' : 'Processing...'}
                                    </span>
                                  </>
                                )}
                                {status === 'completed' && (
                                  <>
                                    <Check className="h-3 w-3 text-green-400" />
                                    <span className="text-green-400 text-xs">Pipeline Complete</span>
                                  </>
                                )}
                                {status === 'error' && (
                                  <>
                                    <X className="h-3 w-3 text-red-400" />
                                    <span className="text-red-400 text-xs">Failed</span>
                                  </>
                                )}
                                {!status && (
                                  <>
                                    <div className="h-3 w-3 rounded-full bg-gray-500" />
                                    <span className="text-gray-500 text-xs">Ready</span>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Toggle Controls */}
                    {processedResumes.length > 0 && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <Button
                            onClick={() => setShowProcessingLogs(!showProcessingLogs)}
                            variant="outline"
                            className="border-blue-400/20 text-blue-300 hover:bg-blue-400/10"
                          >
                            {showProcessingLogs ? 'Hide' : 'Show'} Process Logs
                          </Button>
                          <Button
                            onClick={() => setShowDOCXPreview(!showDOCXPreview)}
                            variant="outline"
                            className="border-purple-400/20 text-purple-300 hover:bg-purple-400/10"
                          >
                            {showDOCXPreview ? 'Hide' : 'Show'} DOCX Preview
                          </Button>
                          <Button
                            onClick={() => setShowJsonPreview(!showJsonPreview)}
                            variant="outline"
                            className="border-green-400/20 text-green-300 hover:bg-green-400/10"
                          >
                            {showJsonPreview ? 'Hide' : 'Show'} JSON Data
                          </Button>
                        </div>

                        {/* Processing Logs Area */}
                        {showProcessingLogs && Object.keys(processingLogs).length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <Card className="glass-card border-blue-400/30 bg-blue-400/5">
                              <CardHeader>
                                <CardTitle className="text-blue-400 text-sm flex items-center gap-2">
                                  📋 Processing Logs: File → DOCX → JSON Conversion
                                </CardTitle>
                                <CardDescription className="text-blue-300/70">
                                  Step-by-step conversion logs with token usage and cost tracking
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-6">
                                  {Object.entries(processingLogs).map(([fileName, logs]) => (
                                    <div key={fileName} className="space-y-3">
                                      <div className="flex items-center gap-2 pb-2 border-b border-blue-400/20">
                                        <span className="text-blue-400 font-medium">📄 {fileName}</span>
                                        <Badge variant="outline" className="border-blue-400/30 text-blue-300">
                                          {logs.length} log entries
                                        </Badge>
                                      </div>
                                      
                                      <div className="max-h-96 overflow-y-auto bg-gray-900/50 rounded-lg p-4">
                                        <div className="space-y-1">
                                          {logs.map((log, index) => {
                                            const isStepStart = log.includes('Step') && (log.includes('Starting') || log.includes('Complete'));
                                            const isError = log.includes('❌') || log.includes('Error');
                                            const isSuccess = log.includes('✅') || log.includes('Complete');
                                            const isTokenInfo = log.includes('💰') || log.includes('Token') || log.includes('Cost');
                                            
                                            return (
                                              <div
                                                key={index}
                                                className={`text-xs font-mono ${
                                                  isError 
                                                    ? 'text-red-400' 
                                                    : isSuccess 
                                                    ? 'text-green-400' 
                                                    : isStepStart
                                                    ? 'text-cyan-400 font-bold'
                                                    : isTokenInfo
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'
                                                } ${isStepStart ? 'mt-2' : ''}`}
                                              >
                                                {log}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      
                                      {/* Enhanced Pipeline Steps Summary with Cost Info */}
                                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-3 border-t border-blue-400/20">
                                        <div className="text-center">
                                          <div className="text-cyan-400 font-bold text-sm">
                                            {logs.filter(log => log.includes('Step 1') || log.includes('OCR')).length}
                                          </div>
                                          <div className="text-gray-400 text-xs">OCR Processing</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-purple-400 font-bold text-sm">
                                            {logs.filter(log => log.includes('Step 2') || log.includes('DOCX')).length}
                                          </div>
                                          <div className="text-gray-400 text-xs">DOCX Creation</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-yellow-400 font-bold text-sm">
                                            {logs.filter(log => log.includes('Step 3') || log.includes('JSON')).length}
                                          </div>
                                          <div className="text-gray-400 text-xs">JSON Conversion</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-green-400 font-bold text-sm">
                                            {logs.filter(log => log.includes('Pipeline Complete')).length > 0 ? '✅' : '🔄'}
                                          </div>
                                          <div className="text-gray-400 text-xs">Status</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-orange-400 font-bold text-sm">
                                            💰
                                          </div>
                                          <div className="text-gray-400 text-xs">Token Costs</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Cost Summary Section */}
                                <div className="mt-6 pt-4 border-t border-blue-400/20">
                                  <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                                    💰 Token Usage & Cost Summary
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-900/50 rounded-lg p-3">
                                      <h5 className="text-cyan-400 text-sm font-medium mb-2">💡 Cost Information</h5>
                                      <div className="space-y-1 text-xs text-gray-300">
                                        <div>🎯 Current GPT-4o Rates:</div>
                                        <div className="ml-2">• Input: $0.005 per 1K tokens</div>
                                        <div className="ml-2">• Output: $0.015 per 1K tokens</div>
                                        <div className="ml-2">• Exchange: ~₱56.95 per $1 USD</div>
                                      </div>
                                    </div>
                                    <div className="bg-gray-900/50 rounded-lg p-3">
                                      <h5 className="text-yellow-400 text-sm font-medium mb-2">📊 Usage Details</h5>
                                      <div className="space-y-1 text-xs text-gray-300">
                                        <div>🔄 Multi-page support: Each page processed</div>
                                        <div>🤖 Vision OCR: Image tokens + text output</div>
                                        <div>📝 JSON conversion: Text analysis</div>
                                        <div>💰 Real-time tracking in browser console</div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}

                        {/* DOCX Preview Area */}
                        {showDOCXPreview && processedResumes.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <Card className="glass-card border-purple-400/30 bg-purple-400/5">
                              <CardHeader>
                                <CardTitle className="text-purple-400 text-sm flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  📄 DOCX Preview: CloudConvert + GPT Pipeline Output
                                </CardTitle>
                                <CardDescription className="text-purple-300/70">
                                  Organized DOCX document created from: Document → CloudConvert (JPEG) → GPT Vision OCR → Structured Text → DOCX
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-6">
                                  {processedResumes.map((resume, index) => (
                                    <div key={index} className="space-y-3">
                                      <div className="flex items-center gap-2 pb-2 border-b border-purple-400/20">
                                        <span className="text-purple-400 font-medium">
                                          📄 {(resume as any)._uiMetadata?.docxFileName || `Document ${index + 1}`}
                                        </span>
                                        <Badge variant="outline" className="border-purple-400/30 text-purple-300">
                                          {(resume as any)._uiMetadata?.docxSize ? `${((resume as any)._uiMetadata.docxSize / 1024).toFixed(1)}KB` : 'N/A'}
                                        </Badge>
                                      </div>
                                      
                                      {(resume as any)._uiMetadata?.docxPreview ? (
                                        <div className="max-h-96 overflow-y-auto bg-gray-900/50 rounded-lg p-4">
                                          <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg font-sans">
                                            <div className="prose prose-sm max-w-none">
                                              <pre className="whitespace-pre-wrap text-sm leading-loose font-mono bg-gray-50 p-4 rounded border-l-4 border-cyan-400 overflow-x-auto">

                                                {(resume as any)._uiMetadata.docxPreview}
                                              </pre>

                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="text-center py-8 text-gray-400">
                                          <p>No DOCX preview available for this file</p>
                                        </div>
                                      )}
                                     
                                      {/* DOCX Stats */}
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t border-purple-400/20">
                                        <div className="text-center">
                                          <div className="text-purple-400 font-bold text-sm">
                                            {Object.keys(resume).filter(key => key !== '_uiMetadata').length}
                                          </div>
                                          <div className="text-gray-400 text-xs">JSON Fields</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-cyan-400 font-bold text-sm">
                                            {(resume as any)._uiMetadata?.docxSize ? `${((resume as any)._uiMetadata.docxSize / 1024).toFixed(1)}KB` : '0KB'}
                                          </div>
                                          <div className="text-gray-400 text-xs">DOCX Size</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-yellow-400 font-bold text-sm">
                                            {(resume as any)._uiMetadata?.contentSource || 'CloudConvert Pipeline'}
                                          </div>
                                          <div className="text-gray-400 text-xs">Source</div>
                                        </div>
                                        <div className="text-center">
                                          <div className="text-green-400 font-bold text-sm">
                                            📄
                                          </div>
                                          <div className="text-gray-400 text-xs">Pure JSON</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}

                        {/* JSON Preview Area */}
                        {showJsonPreview && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <Card className="glass-card border-green-400/30 bg-green-400/5">
                              <CardHeader>
                                <CardTitle className="text-green-400 text-sm flex items-center gap-2">
                                  <Check className="h-4 w-4" />
                                  📄 Flexible JSON Output (Pure Resume Content)
                                </CardTitle>
                                <CardDescription className="text-green-300/70">
                                  Dynamic JSON structure that adapts to the actual resume content - no predetermined fields, only what's actually in the document
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="max-h-96 overflow-y-auto">
                                  <pre className="text-xs text-gray-300 whitespace-pre-wrap break-words">
                                    {JSON.stringify(
                                      processedResumes.map(resume => {
                                        // Filter out internal UI metadata from JSON display
                                        const { _uiMetadata, ...pureResumeData } = resume as any;
                                        return pureResumeData;
                                      }), 
                                      null, 
                                      2
                                    )}
                                  </pre>
                                </div>
                                
                                {/* Summary Stats */}
                                <div className="mt-4 pt-4 border-t border-green-400/20">
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                                    <div>
                                      <div className="text-green-400 font-bold text-lg">
                                        {processedResumes.length}
                                      </div>
                                      <div className="text-gray-400 text-xs">Files Processed</div>
                                    </div>
                                    <div>
                                      <div className="text-cyan-400 font-bold text-lg">
                                        {processedResumes.reduce((acc, resume) => acc + Object.keys(resume).filter(key => key !== '_uiMetadata').length, 0)}
                                      </div>
                                      <div className="text-gray-400 text-xs">Total Data Fields</div>
                                    </div>
                                    <div>
                                      <div className="text-purple-400 font-bold text-lg">
                                        {processedResumes.reduce((acc, resume) => {
                                          // Filter out UI metadata before calculating size
                                          const { _uiMetadata, ...pureData } = resume as any;
                                          const jsonStr = JSON.stringify(pureData);
                                          return acc + (jsonStr.length / 1024);
                                        }, 0).toFixed(1)}KB
                                      </div>
                                      <div className="text-gray-400 text-xs">Pure JSON Size</div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Continue Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 text-center"
            >
              {loading ? (
                <div className="space-y-4">
                  <div className="glass-card border-white/10 p-6 max-w-md mx-auto">
                    <div className="flex items-center mb-4">
                      <Sparkles className="mr-2 h-5 w-5 text-cyan-400 animate-pulse" />
                      <span className="text-white font-medium">Processing Files...</span>
                    </div>
                    <div className="relative">
                      <Progress 
                        value={85} 
                        className="h-3 bg-white/10"
                      />
                      <div 
                        className="absolute inset-0 h-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full animate-pulse"
                        style={{
                          animation: 'progress-shimmer 2s ease-in-out infinite',
                        }}
                      />
                    </div>
                    <div className="mt-3 text-sm text-gray-300 text-center">
                      Analyzing resume content and portfolio data...
                    </div>
                  </div>
                </div>
              ) : (
              <Button
                onClick={handleContinue}
                  disabled={!canContinue}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-8 py-3 shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Continue to Analysis
              </Button>
              )}
              
              {!canContinue && (
                <p className="text-gray-400 mt-3 text-sm">
                  Please upload at least one file or add a portfolio link to continue
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
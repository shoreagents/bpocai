// Core candidate and user types for BPOC.AI platform

export interface Candidate {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  location: string
  profilePicture?: string
  createdAt: Date
  updatedAt: Date
  
  // Profile completion
  profileCompletionScore: number
  isProfileComplete: boolean
  
  // Resume data
  resume: Resume
  
  // Assessment scores
  assessments: AssessmentResults
  
  // Gamification
  level: number
  experiencePoints: number
  badges: Badge[]
  
  // Career preferences
  preferences: CareerPreferences
}

export interface Resume {
  id: string
  candidateId: string
  
  // Basic info
  summary: string
  
  // Work experience
  workExperience: WorkExperience[]
  
  // Education
  education: Education[]
  
  // Skills
  skills: Skill[]
  
  // AI Analysis
  aiAnalysis: ResumeAnalysis
  
  createdAt: Date
  updatedAt: Date
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: Date
  endDate?: Date
  isCurrentRole: boolean
  description: string
  achievements: string[]
  skills: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startDate: Date
  endDate?: Date
  gpa?: number
  achievements: string[]
}

export interface Skill {
  id: string
  name: string
  category: SkillCategory
  proficiencyLevel: number // 1-5
  isVerified: boolean
  verificationSource?: string
}

export enum SkillCategory {
  TECHNICAL = 'technical',
  COMMUNICATION = 'communication',
  CUSTOMER_SERVICE = 'customer-service',
  SALES = 'sales',
  LANGUAGE = 'language',
  SOFTWARE = 'software',
  INDUSTRY = 'industry'
}

export interface ResumeAnalysis {
  overallScore: number
  strengths: string[]
  improvements: string[]
  gapAnalysis: SkillGap[]
  industryMatch: IndustryMatch[]
  recommendations: string[]
  lastAnalyzedAt: Date
}

export interface SkillGap {
  skillName: string
  importance: number
  currentLevel: number
  targetLevel: number
  suggestions: string[]
}

export interface IndustryMatch {
  industry: string
  matchPercentage: number
  reasoning: string
}

export interface AssessmentResults {
  typing: TypingTestResult
  personality: PersonalityTestResult
  logic: LogicTestResult
  industry: IndustryTestResult[]
}

export interface TypingTestResult {
  wpm: number
  accuracy: number
  completedAt: Date
  certificateUrl?: string
}

export interface PersonalityTestResult {
  type: string // DISC type
  traits: PersonalityTrait[]
  roleRecommendations: string[]
  completedAt: Date
}

export interface PersonalityTrait {
  name: string
  score: number
  description: string
}

export interface LogicTestResult {
  score: number
  category: string
  strengths: string[]
  improvements: string[]
  completedAt: Date
}

export interface IndustryTestResult {
  industry: string
  score: number
  level: string
  strengths: string[]
  improvements: string[]
  completedAt: Date
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: BadgeCategory
  rarity: BadgeRarity
  unlockedAt: Date
  progress?: number
  maxProgress?: number
}

export enum BadgeCategory {
  ASSESSMENT = 'assessment',
  SKILL = 'skill',
  CAREER = 'career',
  SOCIAL = 'social',
  ACHIEVEMENT = 'achievement'
}

export enum BadgeRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

export interface CareerPreferences {
  preferredIndustries: string[]
  preferredRoles: string[]
  salaryRange: SalaryRange
  workArrangement: WorkArrangement
  availabilityToStart: Date
  willingToRelocate: boolean
  preferredLocations: string[]
}

export interface SalaryRange {
  min: number
  max: number
  currency: string
}

export enum WorkArrangement {
  ONSITE = 'onsite',
  REMOTE = 'remote',
  HYBRID = 'hybrid'
}

// Game types
export interface GameResult {
  gameId: string
  candidateId: string
  gameType: GameType
  score: number
  completionTime: number
  achievements: string[]
  playedAt: Date
}

export enum GameType {
  CUSTOMER_SERVICE_SIMULATOR = 'customer-service-simulator',
  TYPING_SPEED_RACE = 'typing-speed-race',
  MULTITASKING_MASTER = 'multitasking-master',
  SALES_CLOSER = 'sales-closer'
}

// Job matching types
export interface JobMatch {
  jobId: string
  candidateId: string
  matchScore: number
  matchReasons: string[]
  skillMatches: SkillMatch[]
  salaryMatch: boolean
  locationMatch: boolean
  createdAt: Date
}

export interface SkillMatch {
  skillName: string
  required: boolean
  candidateLevel: number
  requiredLevel: number
  matchScore: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  totalItems: number
  totalPages: number
  currentPage: number
  pageSize: number
}

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phoneNumber?: string
  location: string
  agreedToTerms: boolean
}

export interface ResumeForm {
  summary: string
  workExperience: Omit<WorkExperience, 'id'>[]
  education: Omit<Education, 'id'>[]
  skills: string[]
} 
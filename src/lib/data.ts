import { 
  Candidate, 
  Badge, 
  BadgeCategory, 
  BadgeRarity, 
  SkillCategory, 
  GameType,
  WorkArrangement 
} from '@/types/candidate'

// Mock candidate data
export const mockCandidate: Candidate = {
  id: '1',
  email: 'maria.santos@email.com',
  firstName: 'Maria',
  lastName: 'Santos',
  phoneNumber: '+63 917 123 4567',
  location: 'Clark, Pampanga, Philippines',
  profilePicture: undefined,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-07-20'),
  profileCompletionScore: 85,
  isProfileComplete: false,
  level: 12,
  experiencePoints: 14400,
  badges: [
    {
      id: 'b1',
      name: 'Resume Master',
      description: 'Completed comprehensive resume with AI analysis',
      icon: '📝',
      category: BadgeCategory.ACHIEVEMENT,
      rarity: BadgeRarity.UNCOMMON,
      unlockedAt: new Date('2024-02-01')
    },
    {
      id: 'b2',
      name: 'Speed Demon',
      description: 'Achieved 80+ WPM in typing test',
      icon: '⚡',
      category: BadgeCategory.SKILL,
      rarity: BadgeRarity.RARE,
      unlockedAt: new Date('2024-03-15')
    },
    {
      id: 'b3',
      name: 'Assessment Champion',
      description: 'Completed all skill assessments',
      icon: '🏆',
      category: BadgeCategory.ASSESSMENT,
      rarity: BadgeRarity.EPIC,
      unlockedAt: new Date('2024-04-10')
    }
  ],
  resume: {
    id: 'r1',
    candidateId: '1',
    summary: 'Dedicated customer service professional with 5+ years of experience in BPO industry. Proven track record of exceeding KPIs and maintaining high customer satisfaction scores. Skilled in technical support, sales, and team leadership.',
    workExperience: [
      {
        id: 'we1',
        company: 'TelePerformance Clark',
        position: 'Senior Customer Service Representative',
        startDate: new Date('2022-03-01'),
        endDate: undefined,
        isCurrentRole: true,
        description: 'Handle complex customer inquiries for US telecom clients. Lead training sessions for new hires and maintain team performance metrics.',
        achievements: [
          'Achieved 98% customer satisfaction rating for 18 consecutive months',
          'Reduced average call handling time by 25%',
          'Trained 50+ new representatives',
          'Promoted to Team Lead within 8 months'
        ],
        skills: ['Customer Service', 'Technical Support', 'Team Leadership', 'Training', 'CRM Software']
      },
      {
        id: 'we2',
        company: 'Concentrix Clark',
        position: 'Technical Support Representative',
        startDate: new Date('2019-08-01'),
        endDate: new Date('2022-02-28'),
        isCurrentRole: false,
        description: 'Provided technical support for software and hardware issues. Troubleshot complex problems and escalated when necessary.',
        achievements: [
          'Maintained 95% first-call resolution rate',
          'Received Employee of the Month award 3 times',
          'Mentored 15 junior representatives'
        ],
        skills: ['Technical Support', 'Troubleshooting', 'Software Knowledge', 'Hardware Support']
      }
    ],
    education: [
      {
        id: 'e1',
        institution: 'Holy Angel University',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Information Technology',
        startDate: new Date('2015-06-01'),
        endDate: new Date('2019-05-01'),
        gpa: 3.7,
        achievements: [
          'Magna Cum Laude',
          'IT Society President',
          'Dean\'s List for 6 semesters'
        ]
      }
    ],
    skills: [
      {
        id: 's1',
        name: 'Customer Service',
        category: SkillCategory.CUSTOMER_SERVICE,
        proficiencyLevel: 5,
        isVerified: true,
        verificationSource: 'Assessment'
      },
      {
        id: 's2',
        name: 'Technical Support',
        category: SkillCategory.TECHNICAL,
        proficiencyLevel: 4,
        isVerified: true,
        verificationSource: 'Work Experience'
      },
      {
        id: 's3',
        name: 'English Communication',
        category: SkillCategory.COMMUNICATION,
        proficiencyLevel: 5,
        isVerified: true,
        verificationSource: 'Assessment'
      }
    ],
    aiAnalysis: {
      overallScore: 87,
      strengths: [
        'Strong customer service background with proven results',
        'Leadership experience and training capabilities',
        'Technical skills complementing service abilities',
        'Consistent performance and career progression'
      ],
      improvements: [
        'Add specific software certifications',
        'Include quantified sales achievements',
        'Expand international client experience',
        'Develop additional language skills'
      ],
      gapAnalysis: [
        {
          skillName: 'Sales',
          importance: 8,
          currentLevel: 2,
          targetLevel: 4,
          suggestions: ['Complete sales training course', 'Gain sales experience', 'Study sales methodologies']
        }
      ],
      industryMatch: [
        { industry: 'Customer Service BPO', matchPercentage: 95, reasoning: 'Perfect match with extensive experience' },
        { industry: 'Technical Support', matchPercentage: 88, reasoning: 'Strong technical background' },
        { industry: 'Sales BPO', matchPercentage: 72, reasoning: 'Communication skills transferable, needs sales training' }
      ],
      recommendations: [
        'Consider pursuing Team Lead or Supervisor roles',
        'Develop sales skills to increase opportunities',
        'Obtain industry certifications for career advancement'
      ],
      lastAnalyzedAt: new Date('2024-07-20')
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-07-20')
  },
  assessments: {
    typing: {
      wpm: 85,
      accuracy: 97,
      completedAt: new Date('2024-03-15'),
      certificateUrl: '/certificates/typing-85wpm.pdf'
    },
    personality: {
      type: 'DISC-I',
      traits: [
        { name: 'Dominance', score: 6, description: 'Moderate leadership tendencies' },
        { name: 'Influence', score: 9, description: 'High people skills and enthusiasm' },
        { name: 'Steadiness', score: 7, description: 'Good team stability and reliability' },
        { name: 'Conscientiousness', score: 8, description: 'Detail-oriented and organized' }
      ],
      roleRecommendations: [
        'Customer Service Representative',
        'Sales Representative',
        'Team Lead',
        'Training Coordinator'
      ],
      completedAt: new Date('2024-04-05')
    },
    logic: {
      score: 82,
      category: 'Problem Solving',
      strengths: ['Pattern Recognition', 'Analytical Thinking', 'Decision Making'],
      improvements: ['Complex Mathematical Logic', 'Abstract Reasoning'],
      completedAt: new Date('2024-04-12')
    },
    industry: [
      {
        industry: 'BPO Customer Service',
        score: 94,
        level: 'Expert',
        strengths: ['Customer Handling', 'Conflict Resolution', 'Product Knowledge'],
        improvements: ['Advanced CRM Usage', 'Cross-selling Techniques'],
        completedAt: new Date('2024-05-01')
      },
      {
        industry: 'Real Estate',
        score: 68,
        level: 'Intermediate',
        strengths: ['Communication', 'Client Relations'],
        improvements: ['Property Law Knowledge', 'Market Analysis', 'Lead Generation'],
        completedAt: new Date('2024-05-15')
      }
    ]
  },
  preferences: {
    preferredIndustries: ['Customer Service', 'Technical Support', 'Sales'],
    preferredRoles: ['Senior Customer Service Rep', 'Team Lead', 'Training Specialist'],
    salaryRange: { min: 25000, max: 40000, currency: 'PHP' },
    workArrangement: WorkArrangement.ONSITE,
    availabilityToStart: new Date('2024-08-01'),
    willingToRelocate: false,
    preferredLocations: ['Clark', 'Angeles City', 'Mabalacat']
  }
}

// Featured assessments



// Career games



// Platform statistics
export const platformStats = {
  resumesBuilt: 10000,
  successRate: 85,
  companies: 500,
  averageSalaryIncrease: 35,
  partnerCompanies: 150,

  hiddenFees: 100,
  minutes: 5,

  
}

// Success stories
export const successStories = [
  {
    id: '1',
    name: 'Juan dela Cruz',
    previousRole: 'Call Center Agent',
    newRole: 'Senior Team Lead',
    salaryIncrease: '+45%',
    location: 'Clark, Pampanga',
    story: 'Through BPOC.AI assessments, I identified my leadership potential and got promoted within 6 months!',
    avatar: '/avatars/juan.jpg',
    company: 'TelePerformance'
  },
  {
    id: '2', 
    name: 'Anna Reyes',
    previousRole: 'Unemployed',
    newRole: 'Customer Success Manager',
    salaryIncrease: 'New Career',
    location: 'Angeles City',
    story: 'BPOC.AI helped me transition from unemployment to a dream job in just 3 weeks!',
    avatar: '/avatars/anna.jpg',
    company: 'Concentrix'
  },
  {
    id: '3',
    name: 'Mark Gonzales', 
    previousRole: 'Technical Support',
    newRole: 'Sales Director',
    salaryIncrease: '+60%',
    location: 'Clark, Pampanga',
    story: 'The career games helped me discover my sales potential. Now I lead a team of 20!',
    avatar: '/avatars/mark.jpg',
    company: 'Sutherland'
  }
]

// Industry focus areas
export const industries = [
  {
    id: 'customer-service',
    name: 'Customer Service',
    description: 'Help customers solve problems and provide excellent support',
    icon: '🎧',
    averageSalary: 'PHP 25,000 - 35,000',
    openPositions: 1250,
    growthRate: '+15%',
    skills: ['Communication', 'Problem Solving', 'Patience', 'Product Knowledge']
  },
  {
    id: 'technical-support',
    name: 'Technical Support',
    description: 'Troubleshoot technical issues and provide IT solutions',
    icon: '🛠️',
    averageSalary: 'PHP 30,000 - 45,000',
    openPositions: 850,
    growthRate: '+22%',
    skills: ['Technical Knowledge', 'Troubleshooting', 'Documentation', 'Remote Tools']
  },
  {
    id: 'sales',
    name: 'Sales & Lead Generation',
    description: 'Generate leads, close deals, and drive revenue growth',
    icon: '💼',
    averageSalary: 'PHP 28,000 - 50,000+',
    openPositions: 950,
    growthRate: '+18%',
    skills: ['Persuasion', 'Relationship Building', 'CRM Software', 'Pipeline Management']
  },
  {
    id: 'real-estate',
    name: 'Real Estate Virtual Assistant',
    description: 'Support real estate professionals with admin and lead management',
    icon: '🏠',
    averageSalary: 'PHP 35,000 - 55,000',
    openPositions: 450,
    growthRate: '+35%',
    skills: ['Real Estate Knowledge', 'Lead Management', 'Marketing', 'Client Relations']
  }
]

// Available badges
export const availableBadges: Badge[] = [
  {
    id: 'profile-complete',
    name: 'Profile Master',
    description: 'Complete your profile 100%',
    icon: '✅',
    category: BadgeCategory.ACHIEVEMENT,
    rarity: BadgeRarity.COMMON,
    unlockedAt: new Date(),
    progress: 85,
    maxProgress: 100
  },
  {
    id: 'first-assessment',
    name: 'First Steps', 
    description: 'Complete your first assessment',
    icon: '🎯',
    category: BadgeCategory.ASSESSMENT,
    rarity: BadgeRarity.COMMON,
    unlockedAt: new Date()
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Type 80+ WPM with 95%+ accuracy',
    icon: '⚡',
    category: BadgeCategory.SKILL,
    rarity: BadgeRarity.RARE,
    unlockedAt: new Date()
  },
  {
    id: 'assessment-champion',
    name: 'Assessment Champion',
    description: 'Complete all available assessments',
    icon: '🏆',
    category: BadgeCategory.ASSESSMENT, 
    rarity: BadgeRarity.EPIC,
    unlockedAt: new Date()
  },
  {
    id: 'game-master',
    name: 'Game Master',
    description: 'Complete all career games',
    icon: '🎮',
    category: BadgeCategory.ACHIEVEMENT,
    rarity: BadgeRarity.LEGENDARY,
    unlockedAt: new Date()
  }
] 
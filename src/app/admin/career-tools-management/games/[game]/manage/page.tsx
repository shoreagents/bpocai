'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import { motion } from 'framer-motion'
import { Edit, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import AdminLayout from '@/components/layout/AdminLayout'

interface GameQuestion {
  id: number
  type: string
  question: string
  options?: string[]
  correctAnswer?: string
  explanation?: string
}

export default function GameManagePage({ params }: { params: Promise<{ game: string }> }) {
  const resolvedParams = use(params)
  const [questions, setQuestions] = useState<GameQuestion[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(null)

  // Right Choice questions
  const rightChoiceQuestions: GameQuestion[] = [
    {
      id: 1,
      type: 'choice',
      question: 'Is it okay to take the food home?',
      options: ['Yes', 'No'],
      correctAnswer: 'No - You understand boundaries and group dynamics — great instincts.',
      explanation: 'You understand boundaries and group dynamics — great instincts. The interviewer smiles. "Good judgment. That\'s the kind of discretion we look for in a team environment."'
    },
    {
      id: 2,
      type: 'choice',
      question: 'Should you speak up to defend Sarah?',
      options: ['Yes', 'No'],
      correctAnswer: 'No - You understand that direct confrontation in meetings can escalate tensions and affect team harmony.',
      explanation: 'You understand that direct confrontation in meetings can escalate tensions and affect team harmony. You later approach Mike privately. The manager appreciates your discretion and conflict resolution skills.'
    },
    {
      id: 3,
      type: 'choice',
      question: 'Should you prioritize work over your family commitment?',
      options: ['Yes', 'No'],
      correctAnswer: 'No - You maintain healthy boundaries and communicate your priorities effectively.',
      explanation: 'You maintain healthy boundaries and communicate your priorities effectively. You propose a solution that meets both needs. The team respects your boundaries and finds alternative approaches.'
    },
    {
      id: 4,
      type: 'choice',
      question: 'Should you address the cultural insensitivity immediately?',
      options: ['Yes', 'No'],
      correctAnswer: 'No - You choose to address it privately, showing both cultural awareness and professional discretion.',
      explanation: 'You choose to address it privately, showing both cultural awareness and professional discretion. You later have a private conversation with the team member. They apologize and learn from the experience.'
    },
    {
      id: 5,
      type: 'choice',
      question: 'Should you defend your team\'s work to the client?',
      options: ['Yes', 'No'],
      correctAnswer: 'No - You demonstrate professional maturity by listening to feedback and finding constructive solutions.',
      explanation: 'You demonstrate professional maturity by listening to feedback and finding constructive solutions. You ask clarifying questions and propose solutions. The client appreciates the professional approach and the relationship improves.'
    },
    {
      id: 6,
      type: 'choice',
      question: 'Should you take sides to resolve the conflict quickly?',
      options: ['Yes', 'No'],
      correctAnswer: 'No - You act as a neutral mediator, helping the team find common ground and maintain relationships.',
      explanation: 'You act as a neutral mediator, helping the team find common ground and maintain relationships. You facilitate a productive discussion. Both parties feel heard, and the team develops better conflict resolution skills.'
    },
    {
      id: 7,
      type: 'choice',
      question: 'Should you report this behavior to management?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes - You uphold ethical standards, but consider the impact on team relationships and the other person\'s wishes.',
      explanation: 'You uphold ethical standards, but consider the impact on team relationships and the other person\'s wishes. Management investigates and addresses the issue. The team learns about proper attribution, but some relationships become strained.'
    },
    {
      id: 8,
      type: 'choice',
      question: 'Should you admit you\'re not prepared and ask for help?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes - You show honesty and self-awareness, which builds trust and allows for better preparation.',
      explanation: 'You show honesty and self-awareness, which builds trust and allows for better preparation. Your manager appreciates your honesty and helps you prepare. The presentation goes well, and the team learns about transparency.'
    },
    {
      id: 9,
      type: 'choice',
      question: 'Should you directly confront your colleague about their performance?',
      options: ['Yes', 'No'],
      correctAnswer: 'No - You choose to understand the situation first and offer support, showing empathy and team collaboration.',
      explanation: 'You choose to understand the situation first and offer support, showing empathy and team collaboration. You reach out privately to offer help. Your colleague opens up about personal challenges, and you work together on solutions.'
    },
    {
      id: 10,
      type: 'choice',
      question: 'Should you push forward with your innovative idea despite potential resistance?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes - You show initiative and innovation, but timing and approach are crucial for successful change management.',
      explanation: 'You show initiative and innovation, but timing and approach are crucial for successful change management. Your manager is initially skeptical but impressed by your thorough preparation. The idea gets implemented gradually.'
    },
    {
      id: 11,
      type: 'choice',
      question: 'Should you take time to help them despite your own workload?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes - You demonstrate leadership and team support, but need to balance helping others with your own responsibilities.',
      explanation: 'You demonstrate leadership and team support, but need to balance helping others with your own responsibilities. Your colleague is grateful and learns quickly. The team notices your leadership, but your own work gets delayed slightly.'
    },
    {
      id: 12,
      type: 'choice',
      question: 'Should you address the comment to promote inclusivity?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes - You promote an inclusive environment, but timing and approach matter for effective communication.',
      explanation: 'You promote an inclusive environment, but timing and approach matter for effective communication. The team becomes more aware of inclusive language. Some appreciate your courage, others feel defensive about their choice of words.'
    },
    {
      id: 13,
      type: 'choice',
      question: 'Should you intervene to stop the gossip?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes - You demonstrate integrity and respect for privacy, but direct confrontation might create tension.',
      explanation: 'You demonstrate integrity and respect for privacy, but direct confrontation might create tension. The gossiping stops, but some colleagues become defensive. The targeted person later thanks you privately.'
    },
    {
      id: 14,
      type: 'choice',
      question: 'Should you take on the extra work to please the client?',
      options: ['Yes', 'No'],
      correctAnswer: 'No - You maintain professional boundaries and suggest appropriate alternatives, showing both respect and resourcefulness.',
      explanation: 'You maintain professional boundaries and suggest appropriate alternatives, showing both respect and resourcefulness. You suggest a colleague who specializes in that area. The client appreciates your honesty and gets better service.'
    },
    {
      id: 15,
      type: 'choice',
      question: 'Should you correct your manager and give credit to the team?',
      options: ['Yes', 'No'],
      correctAnswer: 'Yes - You demonstrate leadership and team appreciation, which builds trust and loyalty among colleagues.',
      explanation: 'You demonstrate leadership and team appreciation, which builds trust and loyalty among colleagues. Your teammates appreciate the recognition. Your manager learns to acknowledge team efforts more inclusively.'
    }
  ]

  // BPOC DISC questions
  const discQuestions: GameQuestion[] = [
    {
      id: 1,
      type: 'personality',
      question: 'Leadership Under Pressure - Your manager just announced a HUGE project with an impossible deadline. The whole team looks overwhelmed and panicked. What is your superhero move?',
      options: ['Challenge accepted! I will take point and get this organized!', 'Team huddle! We are stronger together - let us break this down!', 'Let me review the requirements and create a realistic timeline.', 'I need to analyze the scope and identify potential roadblocks first.'],
      correctAnswer: 'Challenge accepted! I will take point and get this organized!',
      explanation: 'Bold leader energy!'
    },
    {
      id: 2,
      type: 'personality',
      question: 'Decision-Making Authority - A critical client decision needs to be made immediately. Your team is looking to you for direction. How do you handle this moment of truth?',
      options: ['I will make the call now and take full responsibility for the outcome!', 'Let me gather input from the team and build consensus!', 'I will carefully consider all options before making a decision.', 'I need to analyze all the data and risks before deciding.'],
      correctAnswer: 'I will make the call now and take full responsibility for the outcome!',
      explanation: 'Decisive leader mode!'
    },
    {
      id: 3,
      type: 'personality',
      question: 'Risk-Taking Moments - Your company is considering a bold new strategy that could revolutionize the business. What is your stance on this high-risk opportunity?',
      options: ['Let us go for it! High risk means high reward - I am all in!', 'This could be amazing! Let me rally the team behind this vision!', 'I will support this if we have a solid backup plan in place.', 'I need to thoroughly evaluate all potential outcomes first.'],
      correctAnswer: 'Let us go for it! High risk means high reward - I am all in!',
      explanation: 'Risk taker extraordinaire!'
    },
    {
      id: 4,
      type: 'personality',
      question: 'Control vs Delegation - Your team is struggling with a complex project. You have the expertise to take control, but you also want to develop their skills. What do you do?',
      options: ['I will take charge and show them how it is done - we need results now!', 'Let me inspire them and guide them through this challenge!', 'I will support them step by step and help them learn.', 'I will create a detailed plan and monitor their progress closely.'],
      correctAnswer: 'I will take charge and show them how it is done - we need results now!',
      explanation: 'Take charge leader!'
    },
    {
      id: 5,
      type: 'personality',
      question: 'Power Dynamics Situations - You discover that a colleague has been undermining your work to senior management. How do you handle this power play?',
      options: ['I will confront them directly and establish my position clearly!', 'Let me address this diplomatically and turn them into an ally!', 'I will document everything and handle this through proper channels.', 'I need to gather evidence and present a comprehensive case.'],
      correctAnswer: 'I will confront them directly and establish my position clearly!',
      explanation: 'Direct confrontation mode!'
    },
    {
      id: 6,
      type: 'personality',
      question: 'Social Interaction Preferences - Company networking event with potential new clients and partners. You walk into a room full of strangers. What is your natural approach?',
      options: ['Time to identify the key decision makers and make connections.', 'This is exciting! Let me introduce myself to everyone!', 'I will find a few people to have meaningful conversations with.', 'Let me observe the room dynamics and plan my approach.'],
      correctAnswer: 'This is exciting! Let me introduce myself to everyone!',
      explanation: 'Social butterfly power!'
    },
    {
      id: 7,
      type: 'personality',
      question: 'Communication Style Choices - You need to present a new idea to your team. The concept is complex but exciting. How do you approach this communication challenge?',
      options: ['I will deliver a powerful, direct presentation that commands attention!', 'I will make this fun and engaging - let me tell a story that inspires!', 'I will explain this step by step and answer all questions patiently.', 'I will provide detailed documentation and clear logical structure.'],
      correctAnswer: 'I will make this fun and engaging - let me tell a story that inspires!',
      explanation: 'Inspirational storyteller!'
    },
    {
      id: 8,
      type: 'personality',
      question: 'Team Motivation Moments - Your team is feeling demotivated after a project setback. Morale is low and productivity is suffering. How do you boost their spirits?',
      options: ['I will set clear goals and push them to exceed expectations!', 'Let me organize a team celebration and remind them of our successes!', 'I will listen to their concerns and provide steady support.', 'I will analyze the root causes and implement systematic improvements.'],
      correctAnswer: 'Let me organize a team celebration and remind them of our successes!',
      explanation: 'Team cheerleader!'
    },
    {
      id: 9,
      type: 'personality',
      question: 'Persuasion Opportunities - You need to convince senior management to approve your innovative project proposal. The budget is significant. How do you make your case?',
      options: ['I will present the facts and demand immediate approval based on ROI!', 'Let me share the exciting vision and get them excited about the possibilities!', 'I will build trust gradually and show them the long-term benefits.', 'I will provide comprehensive data and detailed risk analysis.'],
      correctAnswer: 'Let me share the exciting vision and get them excited about the possibilities!',
      explanation: 'Visionary persuader!'
    },
    {
      id: 10,
      type: 'personality',
      question: 'Public Presentation Scenarios - You have been asked to give a keynote speech at a major industry conference. The audience includes competitors and potential clients. How do you prepare?',
      options: ['I will deliver a powerful, memorable speech that establishes our dominance!', 'I will create an engaging, entertaining presentation that connects with everyone!', 'I will focus on being authentic and building genuine connections.', 'I will ensure every detail is perfect and every fact is verified.'],
      correctAnswer: 'I will create an engaging, entertaining presentation that connects with everyone!',
      explanation: 'Engaging entertainer!'
    },
    {
      id: 11,
      type: 'personality',
      question: 'Change vs Stability Preferences - Your company is implementing a major system overhaul. New software, new processes, everything is changing at once. Your honest reaction?',
      options: ['Finally! This will streamline everything and boost efficiency!', 'Let me help everyone adapt and make this transition smooth!', 'I will support the team and ensure we follow the new procedures carefully.', 'I need to understand the new system thoroughly before implementing.'],
      correctAnswer: 'Let me help everyone adapt and make this transition smooth!',
      explanation: 'Change facilitator power!'
    },
    {
      id: 12,
      type: 'personality',
      question: 'Conflict Resolution Approaches - Two team members are having a heated disagreement that is affecting team productivity. How do you handle this conflict?',
      options: ['I will step in and make a decision to resolve this immediately!', 'Let me facilitate a discussion and help them find common ground!', 'I will listen to both sides and help them work through this together.', 'I will analyze the situation and create a structured resolution process.'],
      correctAnswer: 'Let me facilitate a discussion and help them find common ground!',
      explanation: 'Harmony facilitator!'
    },
    {
      id: 13,
      type: 'personality',
      question: 'Work Pace Consistency - Your team is under pressure to deliver results quickly, but you know rushing could compromise quality. How do you balance speed and thoroughness?',
      options: ['We need to push hard and fast - speed is everything right now!', 'Let me motivate the team to work efficiently while maintaining enthusiasm!', 'I will maintain our steady pace and ensure we do not sacrifice quality.', 'I will create a detailed timeline that balances speed and accuracy.'],
      correctAnswer: 'Let me motivate the team to work efficiently while maintaining enthusiasm!',
      explanation: 'Efficiency motivator!'
    },
    {
      id: 14,
      type: 'personality',
      question: 'Team Support Situations - A colleague is struggling with a personal issue that is affecting their work performance. How do you respond to their need for support?',
      options: ['I will help them focus on work and push through this challenge!', 'Let me cheer them up and help them see the positive side!', 'I will listen and provide steady emotional support during this time.', 'I will help them create a structured plan to manage their situation.'],
      correctAnswer: 'Let me cheer them up and help them see the positive side!',
      explanation: 'Positive encourager!'
    },
    {
      id: 15,
      type: 'personality',
      question: 'Routine vs Variety Choices - Your manager offers you a choice: continue with your current stable role or take on a new, more dynamic position with unknown challenges. What do you choose?',
      options: ['I will take the new role - I thrive on challenges and variety!', 'I will embrace the new opportunity and make it exciting for everyone!', 'I will carefully consider the stability of my current role first.', 'I will analyze both options thoroughly before making a decision.'],
      correctAnswer: 'I will embrace the new opportunity and make it exciting for everyone!',
      explanation: 'Opportunity embracer!'
    },
    {
      id: 16,
      type: 'personality',
      question: 'Detail vs Big Picture Focus - You are reviewing a major project proposal. Your team wants to focus on the big picture and exciting outcomes. What is your priority?',
      options: ['I will focus on the strategic impact and bold outcomes!', 'Let me highlight the exciting possibilities and benefits!', 'I will ensure we have a solid foundation and reliable approach.', 'I will examine every detail and ensure accuracy throughout.'],
      correctAnswer: 'I will examine every detail and ensure accuracy throughout.',
      explanation: 'Detail master!'
    },
    {
      id: 17,
      type: 'personality',
      question: 'Quality vs Speed Decisions - A major quality issue has been discovered in your team\'s work. Multiple errors found, client is upset. How do you handle this?',
      options: ['I will take immediate action to fix this and prevent future issues!', 'Let me gather the team and we will solve this together!', 'I will carefully review our processes and implement better checks.', 'I need to analyze the root cause and create a comprehensive solution.'],
      correctAnswer: 'I need to analyze the root cause and create a comprehensive solution.',
      explanation: 'Analytical problem solver!'
    },
    {
      id: 18,
      type: 'personality',
      question: 'Rule Following vs Flexibility - A client requests a modification that goes against company policy but could lead to significant business. How do you handle this ethical dilemma?',
      options: ['I will find a way to make this work - business results matter most!', 'Let me negotiate a creative solution that satisfies everyone!', 'I will follow the rules but help find an acceptable alternative.', 'I will consult the policy guidelines and ensure full compliance.'],
      correctAnswer: 'I will consult the policy guidelines and ensure full compliance.',
      explanation: 'Policy enforcer!'
    },
    {
      id: 19,
      type: 'personality',
      question: 'Analysis vs Action Preferences - Your team is ready to launch a new product, but you have concerns about potential risks. How do you balance thorough analysis with timely action?',
      options: ['Let us launch now and fix any issues as they arise!', 'Let me build excitement and confidence in the team for launch!', 'I will ensure we have proper safeguards in place before launching.', 'I need to conduct a thorough risk assessment before proceeding.'],
      correctAnswer: 'I need to conduct a thorough risk assessment before proceeding.',
      explanation: 'Risk assessor!'
    },
    {
      id: 20,
      type: 'personality',
      question: 'Structure vs Creativity Choices - Your team is brainstorming a creative solution to a complex problem. How do you contribute to this creative process?',
      options: ['I will push for bold, innovative ideas that break the mold!', 'Let me inspire the team with exciting possibilities and energy!', 'I will help build on existing ideas and create practical solutions.', 'I will ensure we have a structured approach to evaluate all ideas.'],
      correctAnswer: 'I will ensure we have a structured approach to evaluate all ideas.',
      explanation: 'Structured evaluator!'
    }
  ]

  // BPOC Ultimate questions
  const ultimateQuestions: GameQuestion[] = [
    {
      id: 1,
      type: 'ultimate',
      question: 'The Late Start Crisis - Your first day, you arrive 15 minutes late due to traffic. Everyone notices you\'re late. Your supervisor looks concerned.',
      options: ['Sorry, traffic was crazy! Manila roads are impossible!', 'I apologize for being late. I\'ve adjusted my commute for tomorrow.', 'Sorry for the delay - I\'m ready to jump in and catch up!', 'Quietly slip to your desk and start working'],
      correctAnswer: 'I apologize for being late. I\'ve adjusted my commute for tomorrow.',
      explanation: 'Ownership & Forward-Thinking - Tests ownership, forward-thinking'
    },
    {
      id: 2,
      type: 'ultimate',
      question: 'The Knowledge Gap Challenge - Assigned to support a cryptocurrency client, but you know nothing about crypto. You need to provide quality support but lack the necessary knowledge.',
      options: ['I don\'t know anything about cryptocurrency, I might need different clients', 'I\'ll research crypto basics tonight and ask smart questions tomorrow', 'Let me find a teammate who knows crypto to help me get started', 'I\'ll figure it out as I go, how hard can it be?'],
      correctAnswer: 'I\'ll research crypto basics tonight and ask smart questions tomorrow',
      explanation: 'Proactive Learning - SMART + MOTIVATED: Proactive learning'
    },
    {
      id: 3,
      type: 'ultimate',
      question: 'The Friday 5PM Disaster - Friday 5PM, client\'s e-commerce site crashes during flash sale. Client\'s biggest sale of the year. Losing $500/minute. Client sleeping (different timezone). Supervisor left early.',
      options: ['I\'ll try to reach the client and wait for instructions', 'Emergency protocol: diagnose issue, implement temp fix, document everything, notify all stakeholders', 'I\'ll send an email to client and supervisor explaining the situation', 'Let me check if it\'s a simple fix I can handle immediately'],
      correctAnswer: 'Emergency protocol: diagnose issue, implement temp fix, document everything, notify all stakeholders',
      explanation: 'Crisis Management Hero - SMART + MOTIVATED: Take charge with systematic approach'
    },
    {
      id: 4,
      type: 'ultimate',
      question: 'The Blame Game Moment - You discover the website crash was caused by an update YOU did yesterday. Client lost $15,000. Supervisor asking for explanation. Teammate suggests blaming \'server issues\'. Client relationship strained.',
      options: ['Server problems caused the outage, very unfortunate timing', 'My update caused this. Here\'s what went wrong and how I\'ll prevent it', 'The update process needs better testing protocols to prevent this', 'I was following the exact procedure I was taught'],
      correctAnswer: 'My update caused this. Here\'s what went wrong and how I\'ll prevent it',
      explanation: 'Full Ownership - GOLD: Full ownership + learning'
    },
    {
      id: 5,
      type: 'ultimate',
      question: 'The Impossible Customer - Angry customer wants refund for digital product after 6 months. Customer demanding $500 refund, threatening bad reviews. Policy: 30-day limit. Customer ranting about \'garbage software\'.',
      options: ['I understand your frustration, but our policy clearly states 30 days maximum for refunds', 'I hear how frustrated you are. Let me explore options to make this right within our guidelines', 'Let me approve the refund to resolve this situation immediately', 'This is escalated beyond my authority, let me get my supervisor'],
      correctAnswer: 'I hear how frustrated you are. Let me explore options to make this right within our guidelines',
      explanation: 'Empathy + Problem-Solving - SMART: Empathy + creative problem-solving'
    },
    {
      id: 6,
      type: 'ultimate',
      question: 'The Cultural Sensitivity Test - US client makes inappropriate comment about \'cheap Filipino labor\'. Client says: \'You guys are cheap for a reason. Just get it done, it doesn\'t have to be perfect - it\'s not like you\'re expensive American workers.\'',
      options: ['That\'s offensive and unprofessional. Filipino workers provide excellent value.', 'Stay silent and continue with work discussion', 'We focus on delivering quality results regardless of cost differences', 'Haha yes, we work hard for good prices!'],
      correctAnswer: 'We focus on delivering quality results regardless of cost differences',
      explanation: 'Professional Redirect - SMART: Professional redirect without confrontation'
    },
    {
      id: 7,
      type: 'ultimate',
      question: 'The Recurring Problem Pattern - Third month review - you notice client patterns. Client A: Same billing error monthly (2-3 hours to fix). Client B: Weekly password resets. Client C: Confused about project status repeatedly.',
      options: ['These issues are manageable, I\'ll continue handling them as they come', 'I\'ll create automated solutions and documentation to prevent these recurring issues', 'I\'ll send clients better instructions to reduce these problems', 'These clients need additional training from their account managers'],
      correctAnswer: 'I\'ll create automated solutions and documentation to prevent these recurring issues',
      explanation: 'Systematic Improvement - SMART + MOTIVATED: Systematic improvement approach'
    },
    {
      id: 8,
      type: 'ultimate',
      question: 'The Business Opportunity Spot - Client mentions struggling with social media engagement. Client\'s Instagram engagement dropped 40%. Considering $3,000/month agency. You notice: no consistent branding, random posting, unanswered comments, wrong target audience.',
      options: ['That\'s outside my expertise, good luck finding the right agency', 'I\'ve noticed some patterns in your social media. Would you like my observations before you hire an agency?', 'Social media is tricky, agencies probably know best', 'I could handle social media too if you\'re interested in expanding my role'],
      correctAnswer: 'I\'ve noticed some patterns in your social media. Would you like my observations before you hire an agency?',
      explanation: 'Proactive Value Creation - SMART + MOTIVATED: Proactive value creation'
    },
    {
      id: 9,
      type: 'ultimate',
      question: 'The Team Crisis Decision - Your supervisor is sick, you\'re temporarily in charge of 5-person team. Simultaneous emergencies: 1) Client payment system down 2) New member deleted files 3) Angry customer needs callback 4) Monthly report due in 2 hours',
      options: ['Let\'s vote on which problem to handle first', 'Client payment system first (highest revenue impact), then customer callback, then report, then file recovery', 'I\'ll call our supervisor to get direction on priorities', 'Everyone handle what they can, we\'ll figure it out as we go'],
      correctAnswer: 'Client payment system first (highest revenue impact), then customer callback, then report, then file recovery',
      explanation: 'Strategic Leadership - SMART + MOTIVATED: Strategic prioritization with clear reasoning'
    },
    {
      id: 10,
      type: 'ultimate',
      question: 'The Final Ethics Test - End of your trial month, permanent position decision pending. Supervisor hints that if you \'overlook\' questionable client billing practices (charging for uncompleted work), your permanent position is guaranteed. Others seem to know but stay quiet.',
      options: ['I want to fit in with the team culture and practices', 'I\'ll focus on delivering quality work according to professional standards', 'I need to report these billing irregularities to management', 'I\'ll keep my head down and do my assigned tasks only'],
      correctAnswer: 'I\'ll focus on delivering quality work according to professional standards',
      explanation: 'Maintain Integrity - GOLD: Maintain integrity without being confrontational'
    }
  ]

  // Initialize questions based on game type
  const getGameQuestions = () => {
    switch (resolvedParams.game) {
      case 'disc-personality':
        return discQuestions
      case 'ultimate':
        return ultimateQuestions
      default:
        return []
    }
  }

  // Initialize questions on component mount
  useEffect(() => {
    setQuestions(getGameQuestions())
  }, [resolvedParams.game])

  const handleEdit = (question: GameQuestion) => {
    setCurrentQuestion(question)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const handleSaveChanges = () => {
    if (currentQuestion) {
      setQuestions(questions.map(q => 
        q.id === currentQuestion.id ? currentQuestion : q
      ))
      setIsEditDialogOpen(false)
      setCurrentQuestion(null)
    }
  }

  const getGameTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'typing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'puzzle':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'logic':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'choice':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'personality':
        return 'bg-pink-500/20 text-pink-400 border-pink-500/30'
      case 'ultimate':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatGameName = (gameName: string) => {
    return gameName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <AdminLayout
      title={`Manage ${formatGameName(resolvedParams.game)} Questions`}
      description="Manage game questions and content"
      titleContent={
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Question
        </Button>
      }
    >
      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              {formatGameName(resolvedParams.game)} Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No questions found</div>
                <div className="text-gray-500 text-sm">Questions for this game will appear here once added.</div>
              </div>
            ) : (
              <div style={{ position: 'relative', width: '100%', overflow: 'auto', transform: 'none !important', transition: 'none !important' }} data-admin-table="true">
                <table style={{ width: '100%', captionSide: 'bottom', fontSize: '0.875rem', transform: 'none !important', transition: 'none !important' }}>
                  <thead style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <tr>
                      <th style={{ height: '3rem', padding: '0 1rem', textAlign: 'left', verticalAlign: 'middle', fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)', width: '60px' }}>#</th>
                      <th style={{ height: '3rem', padding: '0 1rem', textAlign: 'left', verticalAlign: 'middle', fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)', width: '120px' }}>Type</th>
                      <th style={{ height: '3rem', padding: '0 1rem', textAlign: 'left', verticalAlign: 'middle', fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)' }}>Question</th>
                      <th style={{ height: '3rem', padding: '0 1rem', textAlign: 'left', verticalAlign: 'middle', fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)', width: '200px' }}>Correct Answer</th>
                      <th style={{ height: '3rem', padding: '0 1rem', textAlign: 'right', verticalAlign: 'middle', fontWeight: '500', color: 'rgba(255, 255, 255, 0.6)', width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderBottom: 'none' }}>
                    {questions.map((question) => (
                      <tr key={question.id} className="admin-table-row" style={{ 
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                        transform: 'none !important',
                        transition: 'none !important',
                        scale: '1 !important',
                        translate: 'none !important',
                        transformOrigin: 'center !important',
                        willChange: 'auto !important'
                      }}>
                        <td style={{ padding: '1rem', verticalAlign: 'middle' }}>{question.id}</td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                          <Badge 
                            className={getGameTypeColor(question.type)}
                            variant="outline"
                          >
                            {question.type}
                          </Badge>
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle' }}>{question.question}</td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', fontFamily: 'monospace', fontSize: '0.875rem' }}>{question.correctAnswer}</td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-500 hover:text-blue-600"
                            onClick={() => handleEdit(question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDelete(question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="glass-card max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Question</DialogTitle>
            </DialogHeader>
            {currentQuestion && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Type</label>
                  <Input
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, type: e.target.value})}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Question</label>
                  <Textarea
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                    className="bg-white/5 border-white/10 text-white"
                    rows={3}
                  />
                </div>
                {currentQuestion.options && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Options</label>
                    {currentQuestion.options.map((option, index) => (
                      <Input
                        key={index}
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options!]
                          newOptions[index] = e.target.value
                          setCurrentQuestion({...currentQuestion, options: newOptions})
                        }}
                        className="bg-white/5 border-white/10 text-white mb-2"
                        placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      />
                    ))}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Correct Answer</label>
                  <Input
                    value={currentQuestion.correctAnswer || ''}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, correctAnswer: e.target.value})}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Explanation</label>
                  <Textarea
                    value={currentQuestion.explanation || ''}
                    onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                    className="bg-white/5 border-white/10 text-white"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

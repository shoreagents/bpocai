'use client'

import { useState } from 'react'
import { use } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusCircle, Edit, Trash2, ArrowLeft, Trophy, Brain, MessageSquare, PuzzleIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import AdminLayout from '@/components/layout/AdminLayout'

// Real questions from assessments
const getAssessmentQuestions = (assessmentType: string) => {
  switch (assessmentType) {
    case 'disc-personality':
      return discQuestions.map((q, index) => ({
        id: index + 1,
        type: q.category,
        question: q.scenario,
        options: q.options.map(opt => opt.text),
        correctAnswer: q.options[q.options.findIndex(opt => opt.type === 'D')].text,
        explanation: "DISC assessment measures preferences, no strictly correct answers"
      }));

    case 'communication-skills':
      return communicationQuestions.map((q, index) => ({
        id: index + 1,
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.options[q.correct],
        explanation: q.explanation
      }));

    case 'logical-reasoning':
      return logicalQuestions.map((q, index) => ({
        id: index + 1,
        type: q.type,
        question: q.question,
        options: q.options,
        correctAnswer: q.options[q.correct],
        explanation: q.explanation
      }));

    case 'workplace-judgment':
      return workplaceJudgmentQuestions.map((q, index) => ({
        id: index + 1,
        type: q.type,
        question: q.scenario,
        options: q.options,
        correctAnswer: q.bestResponse,
        explanation: q.explanation
      }));

    case 'typing-speed-test':
      return typingSpeedTestQuestions.map((q, index) => ({
        id: index + 1,
        type: q.type,
        question: q.text,
        options: [],
        correctAnswer: "No correct answer - Speed and accuracy test",
        explanation: q.description
      }));

    default:
      return [];
  }
}

// Assessment questions
const discQuestions = [
  {
    category: "Dominance",
    scenario: "When faced with a challenging project deadline, you prefer to:",
    options: [
      { text: "Take immediate control and drive results", type: "D" },
      { text: "Encourage team enthusiasm and creativity", type: "I" },
      { text: "Ensure team stability and steady progress", type: "S" },
      { text: "Create detailed plans and quality checkpoints", type: "C" }
    ]
  },
  {
    category: "Influence",
    scenario: "In team meetings, you typically:",
    options: [
      { text: "Focus on getting decisions made quickly", type: "D" },
      { text: "Share ideas enthusiastically and engage others", type: "I" },
      { text: "Listen carefully and support team consensus", type: "S" },
      { text: "Present data and factual analysis", type: "C" }
    ]
  },
  {
    category: "Steadiness",
    scenario: "When changes are announced at work, you:",
    options: [
      { text: "Immediately look for opportunities to lead the change", type: "D" },
      { text: "Get excited and help others see the positive aspects", type: "I" },
      { text: "Need time to adjust and prefer gradual implementation", type: "S" },
      { text: "Want to understand all details before proceeding", type: "C" }
    ]
  },
  {
    category: "Conscientiousness",
    scenario: "When reviewing work quality, you focus on:",
    options: [
      { text: "Meeting targets and achieving results", type: "D" },
      { text: "Recognizing team efforts and celebrating wins", type: "I" },
      { text: "Ensuring consistency and reliability", type: "S" },
      { text: "Accuracy, precision, and following standards", type: "C" }
    ]
  },
  {
    category: "Dominance",
    scenario: "In competitive situations, you:",
    options: [
      { text: "Thrive on the challenge and push to win", type: "D" },
      { text: "Use charm and persuasion to gain advantage", type: "I" },
      { text: "Prefer collaborative approaches over competition", type: "S" },
      { text: "Rely on preparation and systematic methods", type: "C" }
    ]
  },
  {
    category: "Influence",
    scenario: "When networking or meeting new people, you:",
    options: [
      { text: "Focus on what they can do for your goals", type: "D" },
      { text: "Enjoy connecting and building relationships naturally", type: "I" },
      { text: "Take time to warm up but are genuinely interested", type: "S" },
      { text: "Prefer structured interactions with clear purposes", type: "C" }
    ]
  },
  {
    category: "Steadiness",
    scenario: "Your approach to work-life balance is:",
    options: [
      { text: "Work hard, but results matter more than hours", type: "D" },
      { text: "Balance work with social activities and fun", type: "I" },
      { text: "Maintain steady routines and consistent boundaries", type: "S" },
      { text: "Plan and organize to maximize efficiency", type: "C" }
    ]
  },
  {
    category: "Conscientiousness",
    scenario: "When given a complex task, you first:",
    options: [
      { text: "Start working immediately to make progress", type: "D" },
      { text: "Discuss it with others to get different perspectives", type: "I" },
      { text: "Ask clarifying questions about expectations", type: "S" },
      { text: "Break it down into detailed steps and timelines", type: "C" }
    ]
  },
  {
    category: "Dominance",
    scenario: "Your leadership style is best described as:",
    options: [
      { text: "Direct and results-focused", type: "D" },
      { text: "Inspirational and people-centered", type: "I" },
      { text: "Supportive and team-oriented", type: "S" },
      { text: "Systematic and quality-focused", type: "C" }
    ]
  },
  {
    category: "Influence",
    scenario: "When persuading others, you rely on:",
    options: [
      { text: "Logical arguments and bottom-line benefits", type: "D" },
      { text: "Enthusiasm, stories, and emotional connection", type: "I" },
      { text: "Building trust and showing genuine concern", type: "S" },
      { text: "Facts, data, and detailed evidence", type: "C" }
    ]
  },
  {
    category: "Steadiness",
    scenario: "In conflict situations, you prefer to:",
    options: [
      { text: "Address issues directly and decisively", type: "D" },
      { text: "Use humor and positivity to defuse tension", type: "I" },
      { text: "Seek compromise and maintain relationships", type: "S" },
      { text: "Follow proper procedures and remain objective", type: "C" }
    ]
  },
  {
    category: "Conscientiousness",
    scenario: "Your workspace organization reflects:",
    options: [
      { text: "Efficiency focused on getting things done", type: "D" },
      { text: "Open and welcoming for interactions", type: "I" },
      { text: "Comfortable and consistent setup", type: "S" },
      { text: "Systematic organization with everything in its place", type: "C" }
    ]
  },
  {
    category: "Dominance",
    scenario: "When delegating tasks, you:",
    options: [
      { text: "Give clear expectations and expect results", type: "D" },
      { text: "Explain the vision and inspire commitment", type: "I" },
      { text: "Ensure people are comfortable and supported", type: "S" },
      { text: "Provide detailed instructions and checkpoints", type: "C" }
    ]
  },
  {
    category: "Influence",
    scenario: "Your communication style is typically:",
    options: [
      { text: "Direct and to the point", type: "D" },
      { text: "Animated and engaging", type: "I" },
      { text: "Thoughtful and considerate", type: "S" },
      { text: "Precise and well-structured", type: "C" }
    ]
  },
  {
    category: "Steadiness",
    scenario: "When learning new skills, you prefer:",
    options: [
      { text: "Jump in and learn by doing", type: "D" },
      { text: "Learn with others in group settings", type: "I" },
      { text: "Take your time and practice until confident", type: "S" },
      { text: "Study thoroughly before attempting", type: "C" }
    ]
  },
  {
    category: "Conscientiousness",
    scenario: "Your approach to problem-solving involves:",
    options: [
      { text: "Quick decisions based on experience", type: "D" },
      { text: "Brainstorming with others for creative solutions", type: "I" },
      { text: "Considering impact on all stakeholders", type: "S" },
      { text: "Systematic analysis of all available data", type: "C" }
    ]
  },
  {
    category: "Dominance",
    scenario: "In high-pressure situations, you:",
    options: [
      { text: "Take charge and drive toward solutions", type: "D" },
      { text: "Keep spirits up and motivate the team", type: "I" },
      { text: "Remain calm and provide steady support", type: "S" },
      { text: "Focus on maintaining quality standards", type: "C" }
    ]
  },
  {
    category: "Influence",
    scenario: "Your ideal team environment includes:",
    options: [
      { text: "Clear goals and autonomy to achieve them", type: "D" },
      { text: "Open communication and collaborative energy", type: "I" },
      { text: "Supportive relationships and job security", type: "S" },
      { text: "Defined processes and quality standards", type: "C" }
    ]
  },
  {
    category: "Steadiness",
    scenario: "When giving feedback to colleagues, you:",
    options: [
      { text: "Are direct about what needs to change", type: "D" },
      { text: "Focus on positive reinforcement and encouragement", type: "I" },
      { text: "Are gentle and considerate of their feelings", type: "S" },
      { text: "Provide specific, factual observations", type: "C" }
    ]
  },
  {
    category: "Conscientiousness",
    scenario: "Your decision-making process typically involves:",
    options: [
      { text: "Making quick decisions to maintain momentum", type: "D" },
      { text: "Getting input from others and building consensus", type: "I" },
      { text: "Considering long-term stability and team impact", type: "S" },
      { text: "Thoroughly analyzing all options and risks", type: "C" }
    ]
  },
  {
    category: "Dominance",
    scenario: "When setting goals, you prefer:",
    options: [
      { text: "Ambitious targets that push boundaries", type: "D" },
      { text: "Inspiring goals that motivate the team", type: "I" },
      { text: "Realistic goals that ensure team success", type: "S" },
      { text: "Specific, measurable, and achievable objectives", type: "C" }
    ]
  },
  {
    category: "Influence",
    scenario: "In social work situations, you:",
    options: [
      { text: "Focus on business objectives", type: "D" },
      { text: "Enjoy building relationships and having fun", type: "I" },
      { text: "Participate but prefer smaller groups", type: "S" },
      { text: "Attend when required but prefer work focus", type: "C" }
    ]
  },
  {
    category: "Steadiness",
    scenario: "Your approach to routine tasks is:",
    options: [
      { text: "Get them done efficiently to focus on bigger things", type: "D" },
      { text: "Make them more enjoyable through interaction", type: "I" },
      { text: "Maintain consistent quality and reliability", type: "S" },
      { text: "Follow established procedures precisely", type: "C" }
    ]
  },
  {
    category: "Conscientiousness",
    scenario: "When reviewing others' work, you focus on:",
    options: [
      { text: "Whether it achieves the intended results", type: "D" },
      { text: "Acknowledging effort and providing encouragement", type: "I" },
      { text: "Being supportive while suggesting improvements", type: "S" },
      { text: "Ensuring accuracy and adherence to standards", type: "C" }
    ]
  },
  {
    category: "Dominance",
    scenario: "Your response to criticism is typically:",
    options: [
      { text: "Challenge it if you disagree, accept if it helps results", type: "D" },
      { text: "Appreciate the feedback and discuss it openly", type: "I" },
      { text: "Take it personally but work to improve relationships", type: "S" },
      { text: "Analyze it objectively and make necessary adjustments", type: "C" }
    ]
  },
  {
    category: "Influence",
    scenario: "When presenting ideas, you:",
    options: [
      { text: "Focus on bottom-line benefits and quick wins", type: "D" },
      { text: "Use enthusiasm and storytelling to engage", type: "I" },
      { text: "Emphasize team benefits and collaborative value", type: "S" },
      { text: "Present detailed research and supporting data", type: "C" }
    ]
  },
  {
    category: "Steadiness",
    scenario: "Your preferred pace of work is:",
    options: [
      { text: "Fast and intense to achieve maximum results", type: "D" },
      { text: "Energetic with variety and social interaction", type: "I" },
      { text: "Steady and consistent with predictable rhythms", type: "S" },
      { text: "Methodical and thorough to ensure quality", type: "C" }
    ]
  },
  {
    category: "Conscientiousness",
    scenario: "When starting a new project, you first:",
    options: [
      { text: "Identify key objectives and success metrics", type: "D" },
      { text: "Get everyone excited about the possibilities", type: "I" },
      { text: "Understand team roles and ensure everyone's comfortable", type: "S" },
      { text: "Create detailed project plans and timelines", type: "C" }
    ]
  },
  {
    category: "Dominance",
    scenario: "Your attitude toward rules and procedures is:",
    options: [
      { text: "Useful if they help achieve results, otherwise flexible", type: "D" },
      { text: "Important for fairness but shouldn't limit creativity", type: "I" },
      { text: "Valuable for providing structure and stability", type: "S" },
      { text: "Essential for maintaining quality and consistency", type: "C" }
    ]
  },
  {
    category: "Influence",
    scenario: "When motivating team members, you:",
    options: [
      { text: "Set challenging goals and reward achievement", type: "D" },
      { text: "Inspire with vision and recognize contributions publicly", type: "I" },
      { text: "Provide support and show appreciation consistently", type: "S" },
      { text: "Offer clear expectations and opportunities for skill development", type: "C" }
    ]
  },
  {
    category: "Steadiness",
    scenario: "In times of organizational change, you:",
    options: [
      { text: "See opportunities and push for quick implementation", type: "D" },
      { text: "Help others see the positive aspects and stay optimistic", type: "I" },
      { text: "Focus on helping the team adjust and maintain stability", type: "S" },
      { text: "Want to understand all implications before supporting", type: "C" }
    ]
  },
  {
    category: "Conscientiousness",
    scenario: "Your approach to continuous improvement involves:",
    options: [
      { text: "Focusing on changes that drive better results", type: "D" },
      { text: "Encouraging innovation and creative thinking", type: "I" },
      { text: "Making gradual improvements that don't disrupt team harmony", type: "S" },
      { text: "Systematic analysis and measured implementation", type: "C" }
    ]
  },
  {
    category: "Dominance",
    scenario: "When faced with obstacles, you:",
    options: [
      { text: "Find alternative paths and push through aggressively", type: "D" },
      { text: "Rally others to overcome challenges together", type: "I" },
      { text: "Patiently work around them without causing disruption", type: "S" },
      { text: "Analyze the situation and develop systematic solutions", type: "C" }
    ]
  },
  {
    category: "Influence",
    scenario: "Your approach to building team spirit includes:",
    options: [
      { text: "Setting clear goals and celebrating victories", type: "D" },
      { text: "Organizing fun activities and encouraging open communication", type: "I" },
      { text: "Creating supportive environment where everyone feels valued", type: "S" },
      { text: "Establishing fair processes and recognizing quality work", type: "C" }
    ]
  },
  {
    category: "Steadiness",
    scenario: "When working with difficult people, you:",
    options: [
      { text: "Address issues directly to maintain productivity", type: "D" },
      { text: "Try to understand their perspective and find common ground", type: "I" },
      { text: "Remain patient and work to preserve relationships", type: "S" },
      { text: "Maintain professional standards and document interactions", type: "C" }
    ]
  },
  {
    category: "Conscientiousness",
    scenario: "Your ideal work recognition would be:",
    options: [
      { text: "Achievement awards for exceeding targets", type: "D" },
      { text: "Public recognition for team collaboration and innovation", type: "I" },
      { text: "Appreciation for reliability and team support", type: "S" },
      { text: "Recognition for accuracy, quality, and expertise", type: "C" }
    ]
  },
  {
    category: "Dominance",
    scenario: "When planning your career development, you focus on:",
    options: [
      { text: "Opportunities for leadership and increased responsibility", type: "D" },
      { text: "Roles that involve people interaction and influence", type: "I" },
      { text: "Positions that offer security and team collaboration", type: "S" },
      { text: "Expertise development and specialized knowledge", type: "C" }
    ]
  },
  {
    category: "Influence",
    scenario: "Your natural energy level at work is:",
    options: [
      { text: "High intensity focused on achieving results", type: "D" },
      { text: "Enthusiastic and engaging with others", type: "I" },
      { text: "Steady and consistent throughout the day", type: "S" },
      { text: "Concentrated and focused on detailed work", type: "C" }
    ]
  },
  {
    category: "Steadiness",
    scenario: "When building relationships with colleagues, you:",
    options: [
      { text: "Focus on mutual benefit and shared objectives", type: "D" },
      { text: "Enjoy getting to know them personally and socially", type: "I" },
      { text: "Build trust slowly through consistent, reliable interactions", type: "S" },
      { text: "Maintain professional relationships based on competence", type: "C" }
    ]
  },
  {
    category: "Conscientiousness",
    scenario: "Your response to tight deadlines is:",
    options: [
      { text: "Push hard and cut non-essential activities", type: "D" },
      { text: "Rally the team and maintain positive energy", type: "I" },
      { text: "Work steadily and ask for help when needed", type: "S" },
      { text: "Plan carefully and prioritize to maintain quality", type: "C" }
    ]
  }
];

const communicationQuestions = [
  {
    type: "Grammar",
    question: "Choose the correct sentence:",
    options: [
      "The customer service team are working hard today.",
      "The customer service team is working hard today.",
      "The customer service team was working hard today.",
      "The customer service team were working hard today."
    ],
    correct: 1,
    explanation: "When referring to a team as a single unit, use the singular verb 'is'."
  },
  {
    type: "Email Writing",
    question: "Which is the most professional way to start an email to a client?",
    options: [
      "Hey there!",
      "Dear Sir/Madam,",
      "Hi!",
      "Good morning, Mr. Johnson,"
    ],
    correct: 3,
    explanation: "Using the client's name with appropriate title is most professional."
  },
  {
    type: "Customer Service",
    question: "A customer is upset about a delayed order. Your best response is:",
    options: [
      "That's not our fault, delays happen sometimes.",
      "I understand your frustration. Let me check the status and find a solution for you.",
      "You should have ordered earlier if you needed it faster.",
      "There's nothing I can do about delays."
    ],
    correct: 1,
    explanation: "Showing empathy and offering to help demonstrates excellent customer service."
  },
  {
    type: "Grammar",
    question: "Identify the correct use of apostrophes:",
    options: [
      "The company's policy states that employee's must sign in.",
      "The companys policy states that employees must sign in.",
      "The company's policy states that employees must sign in.",
      "The companies policy states that employee's must sign in."
    ],
    correct: 2,
    explanation: "Company's (possessive) and employees (plural, not possessive) are correct."
  },
  {
    type: "Vocabulary",
    question: "In a professional context, 'escalate' means:",
    options: [
      "To make something more expensive",
      "To transfer an issue to a higher authority",
      "To increase the volume of your voice",
      "To complicate a simple process"
    ],
    correct: 1,
    explanation: "In customer service, escalate means to transfer an issue to a supervisor or higher authority."
  },
  {
    type: "Email Writing",
    question: "The best way to end a professional email is:",
    options: [
      "Thanks, bye!",
      "Best regards, [Your Name]",
      "See ya later",
      "TTYL"
    ],
    correct: 1,
    explanation: "'Best regards' followed by your name is the most professional closing."
  },
  {
    type: "Customer Service",
    question: "When you don't know the answer to a customer's question, you should:",
    options: [
      "Make up an answer so you don't look incompetent",
      "Transfer them to someone else immediately",
      "Say 'I don't know' and end the call",
      "Acknowledge that you need to research it and offer to follow up"
    ],
    correct: 3,
    explanation: "Honesty combined with a commitment to find the answer shows professionalism."
  },
  {
    type: "Grammar",
    question: "Choose the sentence with correct subject-verb agreement:",
    options: [
      "Either the manager or the employees is responsible.",
      "Either the manager or the employees are responsible.",
      "Either the manager or the employees was responsible.",
      "Either the manager or the employees were responsible."
    ],
    correct: 1,
    explanation: "With 'either...or', the verb agrees with the subject closest to it (employees = are)."
  },
  {
    type: "Vocabulary",
    question: "What does 'proactive' mean in a workplace context?",
    options: [
      "Reacting quickly to problems",
      "Taking action to prevent problems before they occur",
      "Being active all the time",
      "Supporting company activities"
    ],
    correct: 1,
    explanation: "Proactive means taking initiative to prevent issues rather than just reacting to them."
  },
  {
    type: "Customer Service",
    question: "The most important skill in customer service is:",
    options: [
      "Speaking very fast to handle more calls",
      "Active listening and empathy",
      "Knowing all product details by heart",
      "Always agreeing with the customer"
    ],
    correct: 1,
    explanation: "Active listening and empathy help you understand and address customer needs effectively."
  },
  {
    type: "Grammar",
    question: "Which sentence uses commas correctly?",
    options: [
      "The manager, who is from Manila, started last week.",
      "The manager who is from Manila, started last week.",
      "The manager, who is from Manila started last week.",
      "The manager who is from Manila started, last week."
    ],
    correct: 0,
    explanation: "Commas should surround non-essential information ('who is from Manila')."
  },
  {
    type: "Email Writing",
    question: "When writing a follow-up email, the best subject line is:",
    options: [
      "Follow-up",
      "Hi again",
      "Follow-up: Project Status Update - Action Required",
      "Important!!!"
    ],
    correct: 2,
    explanation: "A clear, specific subject line helps recipients understand the email's purpose and urgency."
  },
  {
    type: "Customer Service",
    question: "A customer wants a refund but doesn't have a receipt. You should:",
    options: [
      "Immediately deny the request",
      "Ask for their contact information to verify the purchase in your system",
      "Give them a full refund without questions",
      "Tell them it's impossible without a receipt"
    ],
    correct: 1,
    explanation: "Professional service involves exploring all options to help the customer within company policy."
  },
  {
    type: "Vocabulary",
    question: "In business communication, 'actionable' means:",
    options: [
      "Something that can be sued for",
      "Information that can be acted upon",
      "A dramatic response",
      "An active person"
    ],
    correct: 1,
    explanation: "Actionable information provides clear direction for what steps to take next."
  },
  {
    type: "Grammar",
    question: "Choose the correct pronoun usage:",
    options: [
      "Between you and I, this policy needs changing.",
      "Between you and me, this policy needs changing.",
      "Between yourself and I, this policy needs changing.",
      "Between yourself and myself, this policy needs changing."
    ],
    correct: 1,
    explanation: "After prepositions like 'between', use object pronouns (me, not I)."
  },
  {
    type: "Customer Service",
    question: "When handling multiple customer inquiries, you should:",
    options: [
      "Focus on the easiest ones first",
      "Handle them in the order they arrived",
      "Prioritize based on urgency and customer tier",
      "Deal with VIP customers only"
    ],
    correct: 2,
    explanation: "Effective prioritization considers both urgency and customer importance for optimal service."
  },
  {
    type: "Email Writing",
    question: "When requesting information via email, you should:",
    options: [
      "Use ALL CAPS to show importance",
      "Be specific about what you need and when",
      "Send multiple emails to ensure it's seen",
      "Make the subject line vague to create curiosity"
    ],
    correct: 1,
    explanation: "Clear, specific requests with deadlines help recipients provide better, timely responses."
  },
  {
    type: "Vocabulary",
    question: "What does 'bandwidth' mean in a business context?",
    options: [
      "Internet speed",
      "Available capacity or resources",
      "The width of a computer screen",
      "Radio frequency range"
    ],
    correct: 1,
    explanation: "In business, bandwidth refers to available time, resources, or capacity to take on tasks."
  },
  {
    type: "Grammar",
    question: "Identify the correct use of 'who' vs 'whom':",
    options: [
      "Who should I contact about this issue?",
      "Whom should I contact about this issue?",
      "Who should I contact this issue about?",
      "Whom is handling this project?"
    ],
    correct: 1,
    explanation: "Use 'whom' when it's the object of the sentence (you contact whom = him/her)."
  },
  {
    type: "Customer Service",
    question: "The best way to handle an angry customer is to:",
    options: [
      "Match their energy and speak loudly",
      "Remain calm, listen actively, and acknowledge their concerns",
      "Put them on hold until they calm down",
      "Transfer them immediately to a supervisor"
    ],
    correct: 1,
    explanation: "Staying calm and showing empathy helps de-escalate situations and build trust."
  }
];

const logicalQuestions = [
  {
    type: "Pattern Recognition",
    question: "What comes next in this sequence: 2, 4, 8, 16, ?",
    options: ["24", "32", "20", "18"],
    correct: 1,
    explanation: "Each number is doubled (2×2=4, 4×2=8, 8×2=16, 16×2=32)"
  },
  {
    type: "Logic Puzzle",
    question: "All BPO agents are computer literate. Sarah is a BPO agent. Therefore:",
    options: [
      "Sarah might be computer literate",
      "Sarah is definitely computer literate", 
      "Sarah is not computer literate",
      "We cannot determine if Sarah is computer literate"
    ],
    correct: 1,
    explanation: "This is a valid logical deduction. If all BPO agents are computer literate and Sarah is a BPO agent, then Sarah must be computer literate."
  },
  {
    type: "Number Series",
    question: "Find the missing number: 3, 7, 15, 31, ?",
    options: ["47", "63", "55", "71"],
    correct: 1,
    explanation: "Pattern: (3×2+1=7), (7×2+1=15), (15×2+1=31), (31×2+1=63)"
  },
  {
    type: "Logic Puzzle",
    question: "If it takes 5 agents 5 minutes to process 5 calls, how long would it take 100 agents to process 100 calls?",
    options: ["100 minutes", "20 minutes", "5 minutes", "10 minutes"],
    correct: 2,
    explanation: "Each agent processes 1 call in 5 minutes, so 100 agents can process 100 calls in 5 minutes."
  },
  {
    type: "Pattern Recognition", 
    question: "Which pattern completes the sequence: ○△□, △□○, □○△, ?",
    options: ["○△□", "△○□", "□△○", "○□△"],
    correct: 0,
    explanation: "The sequence rotates the three symbols. After □○△, the next rotation brings us back to ○△□."
  },
  {
    type: "Logic Deduction",
    question: "In a call center, if every customer service call lasts exactly 6 minutes and there are no breaks between calls, how many calls can one agent handle in 2 hours?",
    options: ["15 calls", "20 calls", "25 calls", "30 calls"],
    correct: 1,
    explanation: "2 hours = 120 minutes. 120 ÷ 6 = 20 calls per agent."
  },
  {
    type: "Number Series",
    question: "Complete the series: 1, 1, 2, 3, 5, 8, ?",
    options: ["11", "13", "15", "10"],
    correct: 1,
    explanation: "This is the Fibonacci sequence where each number is the sum of the two preceding ones (5+8=13)."
  },
  {
    type: "Logic Puzzle",
    question: "If some programmers are analysts, and all analysts are problem solvers, which statement must be true?",
    options: [
      "All programmers are problem solvers",
      "Some programmers are problem solvers", 
      "No programmers are problem solvers",
      "All problem solvers are programmers"
    ],
    correct: 1,
    explanation: "Since some programmers are analysts, and all analysts are problem solvers, then some programmers must be problem solvers."
  },
  {
    type: "Pattern Recognition",
    question: "What's the next number in the sequence: 1, 4, 9, 16, 25, ?",
    options: ["30", "35", "36", "49"],
    correct: 2,
    explanation: "These are perfect squares: 1², 2², 3², 4², 5², 6² = 36"
  },
  {
    type: "Logic Deduction", 
    question: "A team processes 240 tickets in 8 hours. If they work at the same rate, how many tickets can they process in 5 hours?",
    options: ["120 tickets", "150 tickets", "180 tickets", "200 tickets"],
    correct: 1,
    explanation: "Rate: 240 tickets ÷ 8 hours = 30 tickets/hour. In 5 hours: 30 × 5 = 150 tickets."
  },
  {
    type: "Pattern Recognition",
    question: "What comes next: A1, C3, E5, G7, ?",
    options: ["I9", "H8", "I8", "J10"],
    correct: 0,
    explanation: "Letters skip one (A, C, E, G, I) and numbers increase by 2 (1, 3, 5, 7, 9)."
  },
  {
    type: "Logic Puzzle",
    question: "If all cats are animals, and some animals are pets, which must be true?",
    options: [
      "All cats are pets",
      "Some cats are pets", 
      "Some cats might be pets",
      "No cats are pets"
    ],
    correct: 2,
    explanation: "We cannot definitively conclude cats are pets, but it's possible since cats are animals and some animals are pets."
  },
  {
    type: "Number Series",
    question: "Find the pattern: 2, 6, 12, 20, 30, ?",
    options: ["38", "40", "42", "44"],
    correct: 2,
    explanation: "Differences between consecutive terms: 4, 6, 8, 10, 12. Next term: 30 + 12 = 42."
  },
  {
    type: "Logic Deduction",
    question: "Three agents can handle 90 calls in 3 hours. How many agents are needed to handle 150 calls in 2 hours?",
    options: ["4 agents", "5 agents", "6 agents", "7 agents"],
    correct: 1,
    explanation: "Rate: 90 calls ÷ (3 agents × 3 hours) = 10 calls per agent per hour. For 150 calls in 2 hours: 150 ÷ (2 × 10) = 7.5, so 5 agents needed."
  },
  {
    type: "Pattern Recognition",
    question: "Complete the sequence: 1, 3, 6, 10, 15, ?",
    options: ["18", "20", "21", "24"],
    correct: 2,
    explanation: "These are triangular numbers: 1, 1+2=3, 3+3=6, 6+4=10, 10+5=15, 15+6=21."
  },
  {
    type: "Logic Puzzle", 
    question: "In a call center, Agent A takes twice as long as Agent B to resolve a ticket. If Agent B takes 4 minutes, how long for both to resolve 3 tickets working together?",
    options: ["6 minutes", "8 minutes", "9 minutes", "12 minutes"],
    correct: 1,
    explanation: "Agent A: 8 min/ticket, Agent B: 4 min/ticket. Combined rate: 1/8 + 1/4 = 3/8 tickets/min. For 3 tickets: 3 ÷ (3/8) = 8 minutes."
  },
  {
    type: "Number Series",
    question: "What's the next term: 100, 50, 25, 12.5, ?",
    options: ["6", "6.25", "5", "7.5"],
    correct: 1,
    explanation: "Each term is divided by 2: 100÷2=50, 50÷2=25, 25÷2=12.5, 12.5÷2=6.25."
  },
  {
    type: "Logic Deduction",
    question: "If every email response takes 2 minutes to write and 30 seconds to send, how many complete email responses can be sent in 1 hour?",
    options: ["20", "24", "30", "40"],
    correct: 1,
    explanation: "Total time per email: 2 min + 0.5 min = 2.5 min. In 60 minutes: 60 ÷ 2.5 = 24 complete emails."
  },
  {
    type: "Pattern Recognition",
    question: "Find the next in sequence: Z, Y, X, W, V, ?",
    options: ["U", "T", "S", "R"],
    correct: 0,
    explanation: "The alphabet is being traversed backwards: Z, Y, X, W, V, U."
  },
  {
    type: "Logic Puzzle",
    question: "If it's true that 'No efficient workers are lazy' and 'Some BPO agents are efficient workers', what can we conclude?",
    options: [
      "All BPO agents are efficient",
      "Some BPO agents are not lazy",
      "All BPO agents are lazy", 
      "No BPO agents are lazy"
    ],
    correct: 1,
    explanation: "Since some BPO agents are efficient workers and no efficient workers are lazy, then some BPO agents are not lazy."
  }
];

const workplaceJudgmentQuestions = [
  {
    type: "Workplace Ethics",
    scenario: "Lunch is provided at work. You notice many leftovers. You're tempted to take some home. Your team lead sees you eyeing it and says, 'Big lunch today, huh?'",
    options: [
      "Casually ask if it's okay to pack some for later.",
      "Quietly sneak a container of food into your bag.",
      "Say, 'Yes! Love free lunch!' and walk off.",
      "Clean up and wait to be offered leftovers."
    ],
    bestResponse: "Clean up and wait to be offered leftovers.",
    explanation: "Excellent judgment! You demonstrated patience and proper workplace etiquette."
  },
  {
    type: "Team Collaboration",
    scenario: "During a client presentation, your colleague is struggling with their section. The client looks confused and your manager is getting nervous.",
    options: [
      "Step in and help your colleague by adding clarifying points.",
      "Let your colleague figure it out on their own.",
      "Take over the entire presentation immediately.",
      "Whisper suggestions to your colleague discreetly."
    ],
    bestResponse: "Whisper suggestions to your colleague discreetly.",
    explanation: "Perfect balance! You helped without undermining your colleague."
  },
  {
    type: "Professional Communication",
    scenario: "You accidentally sent a confidential email to the wrong person. The recipient hasn't opened it yet, but you're worried about the potential breach.",
    options: [
      "Hope they don't open it and keep quiet.",
      "Contact the recipient immediately and ask them to delete it.",
      "Immediately notify your manager and IT department.",
      "Try to retract the email using your email client."
    ],
    bestResponse: "Immediately notify your manager and IT department.",
    explanation: "Excellent judgment! You showed accountability and followed proper protocols."
  },
  {
    type: "Interpersonal Skills",
    scenario: "A colleague confides in you that they're planning to quit because they're unhappy with the company. They ask you to keep it confidential.",
    options: [
      "Promise to keep it completely confidential and not tell anyone.",
      "Try to convince them to stay and work through their issues.",
      "Suggest they talk to HR about their concerns before making a decision.",
      "Tell your manager immediately to prepare for their departure."
    ],
    bestResponse: "Suggest they talk to HR about their concerns before making a decision.",
    explanation: "Excellent guidance! You directed them to the right resources."
  },
  {
    type: "Client Relations",
    scenario: "A client asks you to complete a task that's outside your scope of work. They're a valuable client, but this request would take significant time.",
    options: [
      "Complete the task to maintain the client relationship.",
      "Politely decline and explain it's outside your scope.",
      "Suggest an alternative solution or refer them to the right person.",
      "Ask your manager for guidance on how to handle this request."
    ],
    bestResponse: "Suggest an alternative solution or refer them to the right person.",
    explanation: "Excellent approach! You provided value while staying within scope."
  },
  {
    type: "Team Conflict",
    scenario: "Two team members are having a disagreement that's affecting team productivity. They both come to you separately to complain about each other.",
    options: [
      "Stay neutral and let them work it out themselves.",
      "Bring them together and mediate the discussion directly.",
      "Involve HR to handle the conflict professionally.",
      "Take sides based on who you think is right."
    ],
    bestResponse: "Involve HR to handle the conflict professionally.",
    explanation: "Excellent judgment! You used the right resources for conflict resolution."
  },
  {
    type: "Problem Solving",
    scenario: "Your manager gives you an urgent task with a tight deadline. You're already working on other important projects.",
    options: [
      "Work overtime to complete everything without complaining.",
      "Discuss priorities with your manager and ask for guidance.",
      "Ask if you can delegate some of your current tasks to others.",
      "Tell your manager you can't take on additional work."
    ],
    bestResponse: "Discuss priorities with your manager and ask for guidance.",
    explanation: "Excellent approach! You showed professionalism and communication skills."
  },
  {
    type: "Professional Communication",
    scenario: "You see a colleague post something negative about the company on social media. It's not very damaging, but it's unprofessional.",
    options: [
      "Ignore it - it's their personal social media account.",
      "Report it to HR immediately.",
      "Talk to your colleague privately about the post.",
      "Comment on the post asking them to take it down."
    ],
    bestResponse: "Talk to your colleague privately about the post.",
    explanation: "Excellent approach! You handled it professionally and privately."
  },
  {
    type: "Career Development",
    scenario: "A promotion opportunity opens up in your department. You're interested, but so is a colleague who has been with the company longer.",
    options: [
      "Apply for the position and compete fairly.",
      "Step aside and let your colleague have the opportunity.",
      "Discuss it with your colleague first before applying.",
      "Try to undermine your colleague's chances."
    ],
    bestResponse: "Apply for the position and compete fairly.",
    explanation: "Excellent approach! You showed confidence and professionalism."
  },
  {
    type: "Client Relations",
    scenario: "A client gives you negative feedback about a project you worked on. The feedback is harsh but contains some valid points.",
    options: [
      "Defend your work and explain why the feedback is wrong.",
      "Thank them politely but ignore the feedback.",
      "Acknowledge the feedback and ask how you can improve.",
      "Blame other team members or external factors."
    ],
    bestResponse: "Acknowledge the feedback and ask how you can improve.",
    explanation: "Excellent approach! You showed professionalism and growth mindset."
  },
  {
    type: "Workplace Ethics",
    scenario: "You overhear colleagues gossiping about another team member. They're spreading rumors that could damage that person's reputation.",
    options: [
      "Join in the conversation and add your own observations.",
      "Ignore it and walk away without saying anything.",
      "Defend the colleague and ask them to stop spreading rumors.",
      "Report the gossip to HR immediately."
    ],
    bestResponse: "Defend the colleague and ask them to stop spreading rumors.",
    explanation: "Excellent leadership! You stood up for what's right."
  },
  {
    type: "Problem Solving",
    scenario: "Your computer crashes during an important client presentation. You have a backup plan, but it's not as polished as your original presentation.",
    options: [
      "Panic and blame IT for the technical issues.",
      "Apologize profusely and ask to reschedule.",
      "Adapt quickly and continue with your backup plan confidently.",
      "Try to fake your way through without admitting the technical issue."
    ],
    bestResponse: "Adapt quickly and continue with your backup plan confidently.",
    explanation: "Excellent problem-solving! You showed resilience and professionalism."
  },
  {
    type: "Work-Life Balance",
    scenario: "Your manager expects you to work late regularly, but you have family commitments. Other team members seem to work longer hours.",
    options: [
      "Work late to match your colleagues and avoid conflict.",
      "Have an honest discussion with your manager about boundaries.",
      "Start looking for a new job with better work-life balance.",
      "Complain to your colleagues about the unfair expectations."
    ],
    bestResponse: "Have an honest discussion with your manager about boundaries.",
    explanation: "Excellent approach! You showed professionalism and self-advocacy."
  },
  {
    type: "Workplace Ethics",
    scenario: "A client sends you an expensive gift as a thank you for your work. Your company has a policy about accepting gifts from clients.",
    options: [
      "Accept the gift gratefully and keep it.",
      "Politely decline and explain the company policy.",
      "Ask your manager for guidance on how to handle the gift.",
      "Accept the gift and share it with the entire team."
    ],
    bestResponse: "Politely decline and explain the company policy.",
    explanation: "Excellent judgment! You maintained integrity and professionalism."
  },
  {
    type: "Interpersonal Skills",
    scenario: "You discover that a colleague made a significant error in their work that could affect a client project. They don't know you've noticed it.",
    options: [
      "Ignore it - it's not your responsibility.",
      "Report it to your manager immediately.",
      "Talk to your colleague privately about the error.",
      "Point out the error in a team meeting."
    ],
    bestResponse: "Talk to your colleague privately about the error.",
    explanation: "Excellent approach! You showed teamwork and professionalism."
  },
  {
    type: "Career Development",
    scenario: "You want to request working from home one day a week, but your manager has been resistant to remote work in the past.",
    options: [
      "Tell your manager you need to work from home and that's final.",
      "Propose a trial period and explain the benefits to the team.",
      "Ask your colleagues to support your request first.",
      "Threaten to look for another job if the request is denied."
    ],
    bestResponse: "Propose a trial period and explain the benefits to the team.",
    explanation: "Excellent approach! You showed professionalism and preparation."
  },
  {
    type: "Team Collaboration",
    scenario: "Your team successfully completes a major project. Your manager suggests celebrating with alcohol, but you know some team members don't drink.",
    options: [
      "Go along with the alcohol-focused celebration.",
      "Suggest an inclusive celebration that accommodates everyone.",
      "Skip the celebration to avoid the alcohol issue.",
      "Complain privately to other team members about the situation."
    ],
    bestResponse: "Suggest an inclusive celebration that accommodates everyone.",
    explanation: "Excellent approach! You showed inclusivity and consideration."
  },
  {
    type: "Career Development",
    scenario: "A junior colleague asks you for career advice. They're considering leaving the company because they feel stuck in their current role.",
    options: [
      "Encourage them to leave and find better opportunities elsewhere.",
      "Discuss internal opportunities and growth possibilities.",
      "Refer them to HR for career development resources.",
      "Discourage them from making any changes and encourage them to stay put."
    ],
    bestResponse: "Discuss internal opportunities and growth possibilities.",
    explanation: "Excellent guidance! You helped retain talent and support growth."
  },
  {
    type: "Client Relations",
    scenario: "A client complains about the quality of work delivered by your team. The complaint is valid, but you weren't directly involved in the project.",
    options: [
      "Explain that you weren't involved and it's not your responsibility.",
      "Acknowledge the issue and offer to help resolve it.",
      "Blame the specific team members who worked on the project.",
      "Minimize the issue and suggest it's not as bad as they think."
    ],
    bestResponse: "Acknowledge the issue and offer to help resolve it.",
    explanation: "Excellent approach! You showed customer focus and teamwork."
  },
  {
    type: "Interpersonal Skills",
    scenario: "You become close friends with a colleague, but they start asking you for favors at work that could compromise your professional judgment.",
    options: [
      "Do the favors to maintain the friendship.",
      "Set clear boundaries while maintaining the friendship.",
      "End the friendship to avoid any conflicts of interest.",
      "Complain to other colleagues about the situation."
    ],
    bestResponse: "Set clear boundaries while maintaining the friendship.",
    explanation: "Excellent approach! You maintained both friendship and professionalism."
  }
];

const typingSpeedTestQuestions = [
  {
    type: "Easy Level",
    text: "Working in a call center is a good job. Many people like to help customers. You can learn new skills every day. The work is fun and easy. You will talk to nice people from around the world. Customer service is very important. Always be kind and helpful. Listen to what customers say. Try to solve their problems quickly. Take your time to understand them. Good communication skills are needed. Practice typing fast and clear. Be patient with every customer. Work well with your team members. Keep learning and growing.",
    description: "Basic typing test with simple words and sentences"
  },
  {
    type: "Easy Level",
    text: "Office work is simple when you know the basics. You will use a computer every day. Type emails to your team and clients. Answer phone calls with a smile. Keep your desk clean and organized. Follow company rules at all times. Be on time for work and meetings. Help your coworkers when they need it. Learn new software programs quickly. Save your work files in the right folders. Check your schedule every morning. Ask questions when you are not sure. Practice makes you better at your job.",
    description: "Basic office tasks typing test"
  },
  {
    type: "Medium Level",
    text: "The Business Process Outsourcing industry requires excellent communication skills and technical proficiency. Customer service representatives must demonstrate patience, empathy, and problem-solving abilities while maintaining professional standards. Successful agents utilize various software applications including CRM systems, ticketing platforms, and knowledge management databases. Quality assurance metrics, performance indicators, and client satisfaction scores determine promotional opportunities. Training programs focus on product knowledge, troubleshooting procedures, and effective communication strategies to ensure optimal customer experiences.",
    description: "Professional vocabulary and complex sentences"
  },
  {
    type: "Medium Level",
    text: "Effective workplace communication involves active listening, clear articulation, and professional etiquette. Representatives handle diverse customer inquiries, technical support requests, and escalation procedures while maintaining composure under pressure. Documentation requirements include detailed case notes, resolution summaries, and follow-up actions. Performance metrics evaluate response times, accuracy rates, and customer satisfaction scores. Continuous improvement initiatives focus on skill development, process optimization, and service excellence standards.",
    description: "Professional communication typing test"
  },
  {
    type: "Hard Level",
    text: "Advanced BPO operations necessitate comprehensive understanding of multi-tiered escalation protocols, SLA compliance metrics (≥99.5%), and sophisticated CRM integrations. Agents must adeptly navigate complex troubleshooting scenarios involving: API configurations, database queries, encrypted authentication systems, and cross-platform compatibility issues. The convergence of artificial intelligence, machine learning algorithms, and predictive analytics requires exceptional adaptability. Performance benchmarks include: resolution rates >85%, first-call resolution 70%, customer satisfaction ≥4.8/5.0, and adherence to quality assurance standards.",
    description: "Technical terms, special characters, and complex syntax"
  },
  {
    type: "Hard Level",
    text: "Technical support specialists utilize advanced diagnostic tools, system monitoring dashboards, and incident management platforms. Root cause analysis (RCA) procedures involve: log file examination, network connectivity testing, and application performance monitoring. Key performance indicators (KPIs) include: Mean Time to Resolution (MTTR) <4 hours, First Contact Resolution (FCR) >80%, and Net Promoter Score (NPS) ≥70. Compliance frameworks require adherence to ISO 27001, SOC 2 Type II, and GDPR regulations while maintaining 24/7 operational availability.",
    description: "Technical documentation typing test"
  },
  {
    type: "Expert Level",
    text: "Enterprise-grade BPO architectures utilize microservices frameworks: {\"apiVersion\": \"v1\", \"metadata\": {\"namespace\": \"prod\"}, \"spec\": {\"replicas\": 3}}. Advanced implementations require OAuth2.0 authentication, RESTful APIs, and SQL queries: SELECT u.*, p.* FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.status = 'ACTIVE' && p.tier >= 'PREMIUM'; Predictive analytics leverage machine learning models (Random Forest, SVM, Neural Networks) with hyperparameters: α=0.001, β₁=0.9, β₂=0.999, ε=1e-8. Performance monitoring utilizes Kubernetes clusters, Docker containers, and CI/CD pipelines for seamless deployment automation.",
    description: "Programming syntax, advanced symbols, and complex formatting"
  },
  {
    type: "Expert Level",
    text: "Complex database operations require proficiency in advanced SQL syntax: CREATE PROCEDURE GetCustomerMetrics(@startDate DATETIME, @endDate DATETIME) AS BEGIN SELECT c.customer_id, c.name, COUNT(t.ticket_id) AS total_tickets, AVG(t.resolution_time) AS avg_resolution FROM customers c INNER JOIN tickets t ON c.customer_id = t.customer_id WHERE t.created_date BETWEEN @startDate AND @endDate GROUP BY c.customer_id, c.name HAVING COUNT(t.ticket_id) > 5 ORDER BY avg_resolution DESC; END; Implementation involves connection pooling, transaction management, and data encryption using AES-256 algorithms.",
    description: "Database operations with complex SQL syntax"
  }
];

const assessmentTitles: { [key: string]: string } = {
  'disc-personality': 'DISC Personality Assessment',
  'communication-skills': 'Communication Skills Test',
  'logical-reasoning': 'Logical Reasoning Test',
  'typing-speed-test': 'Typing Speed Test',
  'workplace-judgment': 'Workplace Judgment Test'
}

const assessmentIcons: { [key: string]: string } = {
  'disc-personality': 'purple',
  'communication-skills': 'blue',
  'logical-reasoning': 'orange',
  'typing-speed-test': 'green',
  'workplace-judgment': 'yellow'
}

export default function AssessmentManagePage({ params }: { params: Promise<{ assessment: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<any>(null)
  const [questions, setQuestions] = useState(() => getAssessmentQuestions(resolvedParams.assessment))

  const handleEdit = (question: any) => {
    setCurrentQuestion(question)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    // Add delete logic here
    setQuestions(questions.filter(q => q.id !== id))
  }

  const handleSaveChanges = () => {
    // Add save logic here
    setIsEditDialogOpen(false)
  }

  const formatAssessmentName = (assessmentName: string) => {
    return assessmentName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getAssessmentTitle = () => {
    return `Manage ${formatAssessmentName(resolvedParams.assessment)} Questions`
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      // DISC Types
      case "Dominance": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Influence": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Steadiness": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Conscientiousness": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      
      // Communication Types
      case "Grammar": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "Email Writing": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Customer Service": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Vocabulary": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      
             // Logical Types
       case "Pattern Recognition": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
       case "Logic Puzzle": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
       case "Number Series": return "bg-green-500/20 text-green-400 border-green-500/30";
       case "Logic Deduction": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
       
       // Workplace Judgment Types
       case "Workplace Ethics": return "bg-red-500/20 text-red-400 border-red-500/30";
       case "Team Collaboration": return "bg-green-500/20 text-green-400 border-green-500/30";
       case "Professional Communication": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
       case "Interpersonal Skills": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
       case "Client Relations": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
       case "Team Conflict": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
       case "Problem Solving": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
       case "Career Development": return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
       case "Work-Life Balance": return "bg-pink-500/20 text-pink-400 border-pink-500/30";
       
       // Typing Speed Test Types
       case "Easy Level": return "bg-green-500/20 text-green-400 border-green-500/30";
       case "Medium Level": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
       case "Hard Level": return "bg-orange-500/20 text-orange-400 border-orange-500/30";
       case "Expert Level": return "bg-red-500/20 text-red-400 border-red-500/30";
       
       default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  }

  const getColorScheme = () => {
    const color = assessmentIcons[resolvedParams.assessment] || 'blue'
    return {
      gradientFrom: `from-${color}-500`,
      gradientTo: `to-${color === 'yellow' ? 'orange' : color}-600`,
      borderHover: `hover:border-${color}-500/30`,
      bgHover: `hover:bg-${color}-500/20`,
      textColor: `text-${color}-400`,
      borderColor: `border-${color}-500/30`,
      bgColor: `bg-${color}-500/20`
    }
  }

  const colors = getColorScheme()

  const titleContent = (
    <Button 
      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
      onClick={() => {
        setCurrentQuestion(null)
        setIsEditDialogOpen(true)
      }}
    >
      <PlusCircle className="h-4 w-4 mr-2" />
      Add New Question
    </Button>
  )

  return (
    <AdminLayout 
      title={getAssessmentTitle()} 
      description="Manage assessment questions and content"
      titleContent={titleContent}
    >
      <div className="space-y-8">
        {/* Questions Table */}
        <Card className="glass-card border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-white">
              {formatAssessmentName(resolvedParams.assessment)} Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No questions found</h3>
                <p className="text-gray-500">
                  Click "Add New Question" to start creating questions for this assessment.
                </p>
              </div>
            ) : (
              <div className="relative w-full overflow-auto" style={{ transform: 'none !important', transition: 'none !important' }} data-admin-table="true">
                <table className="w-full caption-bottom text-sm" style={{ transform: 'none !important', transition: 'none !important' }}>
                  <thead className="[&_tr]:border-b">
                    <tr>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[60px]">#</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[120px]">Type</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Question</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[200px]">Correct Answer</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[100px] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
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
                            className={getQuestionTypeColor(question.type)}
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

        {/* Edit/Add Question Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {currentQuestion ? 'Edit Question' : 'Add New Question'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Type</label>
                <Input 
                  placeholder="Question Type"
                  defaultValue={currentQuestion?.type}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Question</label>
                <Textarea 
                  placeholder="Enter your question"
                  defaultValue={currentQuestion?.question}
                />
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-gray-200">Options</label>
                {currentQuestion?.options?.map((option: string, index: number) => (
                  <div key={index} className="space-y-2">
                    <label className="text-xs text-gray-400">Option {String.fromCharCode(65 + index)}</label>
                    <Input 
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      defaultValue={option}
                    />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Correct Answer</label>
                <Input 
                  placeholder="The correct answer text"
                  defaultValue={currentQuestion?.correctAnswer}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-200">Explanation</label>
                <Textarea 
                  placeholder="Add an explanation for the correct answer"
                  defaultValue={currentQuestion?.explanation}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
              <Button 
                className={`bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} text-white`}
                onClick={handleSaveChanges}
              >
                Save changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  )
}

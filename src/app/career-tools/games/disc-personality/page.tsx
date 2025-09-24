'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft,
  Brain,
  Play,
  RotateCcw,
  Trophy,
  Target,
  Clock,
  Star,
  Zap,
  ChevronLeft,
  ChevronRight,
  Upload,
  Building2,
  BarChart3,
  Briefcase,
  Flame,
  Sparkles,
  Shield,
  Heart,
  DollarSign,
  Car,
  Users,
  Church,
  Home
} from 'lucide-react';

import { FILIPINO_DISC_SCENARIOS } from '../../../../data/filipinoDiscScenarios';

// Animal personality definitions
const ANIMAL_PERSONALITIES = {
  D: {
    animal: "🦅 EAGLE",
    title: "The Sky Dominator",
    description: "You soar above challenges and lead from the front!",
    traits: ["Natural Leader", "Results-Focused", "Decisive", "Direct"],
    bpoRoles: ["Team Lead", "Operations Manager", "Escalation Specialist", "Performance Coach"],
    color: "from-red-500 to-red-600",
    borderColor: "border-red-500/30"
  },
  I: {
    animal: "🦚 PEACOCK", 
    title: "The Social Star",
    description: "You light up rooms and connect with people effortlessly!",
    traits: ["People-Oriented", "Enthusiastic", "Persuasive", "Optimistic"],
    bpoRoles: ["Customer Service Lead", "Sales Manager", "Training Specialist", "Client Relations"],
    color: "from-yellow-500 to-yellow-600",
    borderColor: "border-yellow-500/30"
  },
  S: {
    animal: "🐢 TURTLE",
    title: "The Steady Guardian", 
    description: "You keep everything running smoothly and provide the foundation teams depend on!",
    traits: ["Reliable", "Patient", "Team-Oriented", "Consistent"],
    bpoRoles: ["Quality Assurance", "Operations Coordinator", "Process Analyst", "Support Specialist"],
    color: "from-green-500 to-green-600",
    borderColor: "border-green-500/30"
  },
  C: {
    animal: "🦉 OWL",
    title: "The Wise Analyst",
    description: "You spot what others miss and ensure everything meets the highest standards!",
    traits: ["Detail-Oriented", "Analytical", "Quality-Focused", "Systematic"],
    bpoRoles: ["Quality Manager", "Data Analyst", "Compliance Specialist", "Documentation Lead"],
    color: "from-blue-500 to-blue-600", 
    borderColor: "border-blue-500/30"
  }
};

// Context icons mapping
const CONTEXT_ICONS = {
  FAMILY: Home,
  WORK: Briefcase,
  SOCIAL: Users,
  TRAFFIC: Car,
  MONEY: DollarSign,
  CRISIS: Shield,
  RELIGION: Church,
  RELATIONSHIPS: Heart
};

interface GameState {
  currentQuestion: number;
  scores: { D: number; I: number; S: number; C: number };
  gameStarted: boolean;
  gameCompleted: boolean;
  xpPoints: number;
  badges: string[];
  achievements: string[];
  streak: number;
  combo: number;
  lastAnswer: string;
  sessionStartTime: Date | null;
  userProfile: UserProfile | null;
  responses: QuestionResponse[];
  personalizedQuestions: PersonalizedQuestion[];
  showPersonalized: boolean;
  isGeneratingPersonalized: boolean;
}

interface PersonalizedQuestion {
  id: number;
  context: string;
  title: string;
  scenario: string;
  options: Array<{
    id: string;
    disc: string;
    animal: string;
    text: string;
    reaction: string;
  }>;
}

interface UserProfile {
  name: string;
  age: number;
  location: string;
  monthlyIncome: string;
  workExperience: string;
  livingSituation: string;
  familyRole: string;
}

interface QuestionResponse {
  questionId: number;
  selectedChoice: string;
  discType: string;
  responseTime: number;
  timestamp: Date;
}

export default function FilipinoDiscGame() {
  const router = useRouter();
  const { user, session } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>({
    currentQuestion: 0,
    scores: { D: 0, I: 0, S: 0, C: 0 },
    gameStarted: false,
    gameCompleted: false,
    xpPoints: 0,
    badges: [],
    achievements: [],
    streak: 0,
    combo: 0,
    lastAnswer: '',
    sessionStartTime: null,
    userProfile: null,
    responses: [],
    personalizedQuestions: [],
    showPersonalized: false,
    isGeneratingPersonalized: false
  });

  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [discResult, setDiscResult] = useState<any>(null);
  const [showReaction, setShowReaction] = useState<string | null>(null);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showSpiritReveal, setShowSpiritReveal] = useState(false);
  const [revealStep, setRevealStep] = useState(0);
  const [aiAssessment, setAiAssessment] = useState<string | null>(null);
  const [isGeneratingAIAssessment, setIsGeneratingAIAssessment] = useState(false);
  const [aiBpoRoles, setAiBpoRoles] = useState<any[] | null>(null);
  const [isGeneratingBpoRoles, setIsGeneratingBpoRoles] = useState(false);

  // Sound effects for spirit selection
  const playSpiritSound = (discType: string) => {
    try {
      const sounds = {
        'D': () => {
          // Eagle screech simulation with Web Audio API
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        },
        'I': () => {
          // Peacock call - melodic chirp
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
          oscillator.frequency.setValueAtTime(650, audioContext.currentTime + 0.2);
          
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.4);
        },
        'S': () => {
          // Turtle - low gentle hum
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.6);
        },
        'C': () => {
          // Owl hoot - two tone
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
          oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.2);
          
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        }
      };
      
      sounds[discType as keyof typeof sounds]?.();
    } catch (error) {
      console.log('🔇 Sound not available:', error);
    }
  };
  // Profile modal removed - using existing user data

  const currentScenario = gameState.showPersonalized 
    ? gameState.personalizedQuestions?.[gameState.currentQuestion - FILIPINO_DISC_SCENARIOS.length]
    : FILIPINO_DISC_SCENARIOS[gameState.currentQuestion];
  
  // Randomize choice order to prevent pattern recognition
  const shuffledOptions = currentScenario?.options ? [...currentScenario.options].sort(() => Math.random() - 0.5) : [];
  
	// Style helpers for DISC options
	const getDiscStyles = (disc: string) => {
		switch (disc) {
			case 'D':
				return {
					bg: 'from-red-500/10 to-red-600/10',
					border: 'border-red-500/40',
					ring: 'ring-red-500/30',
					text: 'text-red-300'
				}
			case 'I':
				return {
					bg: 'from-yellow-500/10 to-yellow-600/10',
					border: 'border-yellow-500/40',
					ring: 'ring-yellow-500/30',
					text: 'text-yellow-300'
				}
			case 'S':
				return {
					bg: 'from-green-500/10 to-green-600/10',
					border: 'border-green-500/40',
					ring: 'ring-green-500/30',
					text: 'text-green-300'
				}
			case 'C':
				return {
					bg: 'from-blue-500/10 to-blue-600/10',
					border: 'border-blue-500/40',
					ring: 'ring-blue-500/30',
					text: 'text-blue-300'
				}
			default:
				return {
					bg: 'from-cyan-500/10 to-purple-600/10',
					border: 'border-white/10',
					ring: 'ring-white/10',
					text: 'text-gray-300'
				}
		}
	}
  
  const totalQuestions = FILIPINO_DISC_SCENARIOS.length + (gameState.personalizedQuestions?.length || 0);
  const progressPercent = Math.min(100, Math.round(((gameState.currentQuestion + 1) / Math.max(totalQuestions, 1)) * 100));
  
  // Auto-create user profile from existing data
  useEffect(() => {
    if (user && !gameState.userProfile && gameState.gameStarted) {
      const profile: UserProfile = {
        name: user.user_metadata?.full_name || 'Player',
        age: 28, // Default age
        location: user.user_metadata?.location || 'Metro Manila',
        monthlyIncome: '35000-50000', // Default based on BPO averages
        workExperience: '3-5-years-bpo', // Default
        livingSituation: 'with_parents', // Common Filipino situation
        familyRole: 'supportive_child' // Common Filipino role
      };
      setGameState(prev => ({ ...prev, userProfile: profile }));
    }
  }, [user, gameState.gameStarted, gameState.userProfile]);

  const startGame = () => {
    if (!user) {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('signup', 'true');
        router.push(`${url.pathname}?${url.searchParams.toString()}`);
        return;
      }
    }
    
    setGameState(prev => ({ 
      ...prev, 
      gameStarted: true,
      sessionStartTime: new Date()
    }));
  };

  // Generate personalized questions using Claude API
  const generatePersonalizedQuestions = async (responses?: any[], scores?: any) => {
    if (!user) {
      console.error('❌ No user found for personalized questions');
      completeGame();
      return;
    }

    // Use passed parameters or fallback to current state
    const currentResponses = responses || gameState.responses;
    const currentScores = scores || gameState.scores;

    console.log('🤖 Starting personalized questions generation for user:', user.id);
    setGameState(prev => ({ ...prev, isGeneratingPersonalized: true }));
    
    try {
      console.log('🤖 Generating personalized questions for', user.email);
      console.log('🤖 Current responses count:', currentResponses.length);
      console.log('🤖 Current DISC scores:', currentScores);
      console.log('🤖 Raw responses data:', currentResponses);
      console.log('🤖 Raw scores data:', currentScores);
      
      const requestBody = {
        userId: user.id,
        responses: currentResponses,
        discScores: currentScores
      };
      
      console.log('🤖 Sending request body:', requestBody);
      
      const response = await fetch('/api/games/disc/personalized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('🌐 API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Received API response:', data);
        
        // Validate that we actually got questions
        if (data.personalizedQuestions && data.personalizedQuestions.length > 0) {
          console.log('✅ Setting up', data.personalizedQuestions.length, 'personalized questions');
          setGameState(prev => ({
            ...prev,
            personalizedQuestions: data.personalizedQuestions,
            showPersonalized: true,
            currentQuestion: FILIPINO_DISC_SCENARIOS.length,
            isGeneratingPersonalized: false
          }));
          
          // Clear any lingering UI state from previous question
          setSelectedOption(null);
          setShowReaction(null);
          setShowAchievement(null);
        } else {
          console.error('❌ No personalized questions in response:', data);
          completeGame();
        }
      } else {
        const errorText = await response.text();
        console.error('❌ API call failed:', response.status, errorText);
        // Complete game without personalized questions
        completeGame();
      }
    } catch (error) {
      console.error('❌ Error generating personalized questions:', error);
      // Complete game without personalized questions
      completeGame();
    }
  };

  const completeGame = () => {
    setGameState(prev => ({
      ...prev,
      gameCompleted: true,
      isGeneratingPersonalized: false
    }));
    calculateResults(gameState.scores);
  };

	// Safety check after functions are defined
	useEffect(() => {
		if (!currentScenario && gameState.gameStarted && !gameState.gameCompleted && !gameState.isGeneratingPersonalized) {
			console.log('⚠️ No current scenario found, completing game');
			console.log('Game state:', {
				currentQuestion: gameState.currentQuestion,
				showPersonalized: gameState.showPersonalized,
				personalizedQuestionsCount: gameState.personalizedQuestions?.length || 0,
				totalQuestions,
				isGenerating: gameState.isGeneratingPersonalized
			});
			completeGame();
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentScenario, gameState.gameStarted, gameState.gameCompleted, gameState.isGeneratingPersonalized])

  const generateAIBpoRoles = async (results: any, allResponses: any[]): Promise<any[]> => {
    if (!user) return [];
    
    setIsGeneratingBpoRoles(true);
    
    try {
      console.log('💼 Generating AI BPO roles for user:', user.id);
      
      // Get user's current position from user metadata or profile
      const currentPosition = user.user_metadata?.position || user.user_metadata?.current_position || 'Not specified';
      const currentExperience = user.user_metadata?.bio || 'No bio available';
      const location = user.user_metadata?.location || 'Philippines';
      
      const bpoRolesPrompt = `You are an expert BPO career consultant. Based on this candidate's DISC personality and current position, recommend 4 suitable BPO job titles.

CANDIDATE:
- Current Position: ${currentPosition}
- Primary DISC Type: ${results.primaryType} (${results.scores[results.primaryType]}%)
- Secondary Type: ${results.secondaryType} (${results.scores[results.secondaryType]}%)

Return ONLY a JSON array of exactly 4 job titles:
[
  {"title": "Customer Experience Specialist"},
  {"title": "Quality Assurance Analyst"},
  {"title": "Team Lead - Technical Support"},
  {"title": "Data Analytics Specialist"}
]

Focus on real BPO roles in the Philippines that match their personality and experience level.`;

      const response = await fetch('/api/games/disc/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          responses: allResponses,
          discScores: results.scores,
          prompt: bpoRolesPrompt,
          isAssessment: true // Reuse the same endpoint
        })
      });

      let generatedRoles: any[] = [];
      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.aiAssessment || '';
        
        // Try to extract JSON from the AI response
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            generatedRoles = JSON.parse(jsonMatch[0]);
            console.log('✅ AI BPO roles generated:', generatedRoles.length);
          } catch (parseError) {
            console.error('Error parsing BPO roles JSON:', parseError);
            // Fallback to default roles
            generatedRoles = [
              { title: "Customer Service Representative" },
              { title: "Technical Support Specialist" },
              { title: "Quality Assurance Analyst" },
              { title: "Team Lead" }
            ];
          }
        } else {
          console.error('No JSON found in BPO roles response');
          generatedRoles = [
            { title: "Customer Service Representative" },
            { title: "Technical Support Specialist" },
            { title: "Quality Assurance Analyst" },
            { title: "Team Lead" }
          ];
        }
      } else {
        // Fallback roles based on DISC type
        const discBasedRoles = {
          'D': [
            { title: "Team Lead - Operations" },
            { title: "Quality Assurance Supervisor" },
            { title: "Training Manager" },
            { title: "Customer Experience Manager" }
          ],
          'I': [
            { title: "Customer Experience Specialist" },
            { title: "Training and Development" },
            { title: "Team Lead - Customer Support" },
            { title: "Sales Representative" }
          ],
          'S': [
            { title: "Technical Support Specialist" },
            { title: "Data Entry Specialist" },
            { title: "Customer Service Representative" },
            { title: "Quality Assurance Analyst" }
          ],
          'C': [
            { title: "Data Analytics Specialist" },
            { title: "Quality Assurance Analyst" },
            { title: "Technical Documentation" },
            { title: "Process Improvement Specialist" }
          ]
        };
        generatedRoles = discBasedRoles[results.primaryType as keyof typeof discBasedRoles] || discBasedRoles['I'];
      }
      
      // Set state for UI display
      setAiBpoRoles(generatedRoles);
      console.log('🎯 AI BPO Roles generated and returned:', generatedRoles.length, 'roles');
      return generatedRoles;
      
    } catch (error) {
      console.error('❌ AI BPO roles generation failed:', error);
      const fallbackRoles = [
        { title: "Customer Service Representative" },
        { title: "Technical Support Specialist" },
        { title: "Quality Assurance Analyst" },
        { title: "Team Lead" }
      ];
      setAiBpoRoles(fallbackRoles);
      return fallbackRoles;
    } finally {
      setIsGeneratingBpoRoles(false);
    }
  };

  const generateAIAssessment = async (results: any, allResponses: any[]): Promise<string> => {
    if (!user) return '';
    
    setIsGeneratingAIAssessment(true);
    
    try {
      console.log('🧠 Generating AI assessment with ALL', allResponses.length, 'responses');
      
      const assessmentPrompt = `Analyze this complete Filipino DISC personality assessment for ${user.user_metadata?.first_name || user.email || 'this person'}:

FINAL RESULTS:
Primary Type: ${results.primaryType} (${results.scores[results.primaryType]}%)
Secondary Type: ${results.secondaryType} (${results.scores[results.secondaryType]}%)
All Scores: D=${results.scores.D}%, I=${results.scores.I}%, S=${results.scores.S}%, C=${results.scores.C}%
Confidence: ${results.confidence}%

COMPLETE RESPONSE ANALYSIS (All ${allResponses.length} Questions):
${allResponses.map(r => `Q${r.questionId}: Choice ${r.selectedChoice} (${r.discType}) - ${r.responseTime}ms response time`).join('\n')}

Create a comprehensive 3-paragraph assessment that:
1. Analyzes their TRUE personality based on ALL response patterns (not just scores)
2. Explains how this applies to Filipino workplace culture and BPO roles
3. Provides specific strengths, blind spots, and growth recommendations
4. References notable response patterns or speed/consistency
5. Uses encouraging but brutally honest tone

Make it deeply personal and actionable based on their actual choices.`;

      const response = await fetch('/api/games/disc/personalized', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          responses: allResponses,
          discScores: results.scores,
          prompt: assessmentPrompt,
          isAssessment: true
        })
      });

      let generatedAssessment = '';
      if (response.ok) {
        const data = await response.json();
        generatedAssessment = data.aiAssessment || `Based on your complete ${allResponses.length}-question assessment, you demonstrate strong ${results.primaryType === 'D' ? 'leadership and decisive action' : results.primaryType === 'I' ? 'social influence and team building' : results.primaryType === 'S' ? 'reliability and steady support' : 'analytical thinking and systematic approach'}. Your response patterns show authentic decision-making that aligns well with Filipino workplace values and BPO industry requirements.`;
        console.log('✅ AI assessment generated using:', data.generatedBy);
      } else {
        generatedAssessment = `Your comprehensive ${allResponses.length}-question assessment reveals a ${results.primaryType === 'D' ? 'dynamic leader' : results.primaryType === 'I' ? 'natural influencer' : results.primaryType === 'S' ? 'steady supporter' : 'analytical thinker'} with strong potential. Your response patterns show consistent decision-making that indicates excellent professional capabilities and cultural adaptability in the Philippine workplace.`;
      }
      
      // Set state for UI display
      setAiAssessment(generatedAssessment);
      console.log('🎯 AI Assessment generated and returned:', generatedAssessment.length, 'characters');
      return generatedAssessment;
      
    } catch (error) {
      console.log('❌ AI assessment failed, using enhanced fallback');
      const fallbackAssessment = `Your comprehensive ${allResponses.length}-question assessment reveals a ${results.primaryType === 'D' ? 'dynamic leader' : results.primaryType === 'I' ? 'natural influencer' : results.primaryType === 'S' ? 'steady supporter' : 'analytical thinker'} with strong potential. Your response patterns show consistent decision-making that indicates excellent professional capabilities and cultural adaptability in the Philippine workplace.`;
      setAiAssessment(fallbackAssessment);
      return fallbackAssessment;
    } finally {
      setIsGeneratingAIAssessment(false);
    }
  };

  const handleOptionSelect = (optionId: string, disc: string, reaction: string) => {
    const startTime = Date.now();
    setSelectedOption(optionId);
    
    // Show mysterious spirit collection instead of reaction
    const spiritMessages = {
      'D': '🦅 A fierce spirit stirs within...',
      'I': '🦚 A vibrant energy awakens...',
      'S': '🐢 A steady presence grows...',
      'C': '🦉 Ancient wisdom gathers...'
    };
    setShowReaction(spiritMessages[disc as keyof typeof spiritMessages] || 'A mysterious force awakens...');
    
    // Play spirit sound effect
    playSpiritSound(disc);
    
    // Record response
    const response: QuestionResponse = {
      questionId: gameState.currentQuestion + 1,
      selectedChoice: optionId,
      discType: disc,
      responseTime: startTime - (gameState.sessionStartTime?.getTime() || startTime),
      timestamp: new Date()
    };

    // Calculate XP per question (small amount per question)
    let xpGain = 5; // 5 XP per question answered
    const newAchievements = [...gameState.achievements];
    
    // Streak system
    let newStreak = gameState.streak;
    let newCombo = gameState.combo;
    
    if (disc === gameState.lastAnswer) {
      newStreak += 1;
      newCombo += 1;
      xpGain += Math.floor(newStreak * 2); // Bonus XP for streaks (reduced)
    } else {
      newStreak = 1;
      newCombo = 0;
    }
    
    // Achievement system
    if (gameState.currentQuestion === 0 && disc === 'D') {
      newAchievements.push('Quick Eagle');
    }
    if (newStreak === 3 && !newAchievements.includes('Streak Master')) {
      newAchievements.push('Streak Master');
      setShowAchievement('Streak Master');
      setTimeout(() => setShowAchievement(null), 3000);
    }
    
    setTimeout(() => {
      const newScores = { ...gameState.scores };
      newScores[disc as keyof typeof newScores] += 1;
      
      const newResponses = [...gameState.responses, response];
      
      // Update state with new data
        setGameState(prev => ({
          ...prev,
          scores: newScores,
          xpPoints: prev.xpPoints + xpGain,
          achievements: newAchievements,
          streak: newStreak,
          combo: newCombo,
        lastAnswer: disc,
        responses: newResponses
      }));
      
      // Check if we just completed the 30th question (index 29)
      if (gameState.currentQuestion === FILIPINO_DISC_SCENARIOS.length - 1 && !gameState.showPersonalized) {
        console.log('🎯 Just completed question 30! Responses:', newResponses.length);
        console.log('🎯 Final scores after 30 questions:', newScores);
        console.log('🎯 Triggering personalized questions generation');
        generatePersonalizedQuestions(newResponses, newScores);
        return;
      }
      
      // Continue to next question or complete game
      if (gameState.currentQuestion < totalQuestions - 1) {
        setGameState(prev => ({
          ...prev,
          currentQuestion: prev.currentQuestion + 1
        }));
        setSelectedOption(null);
        setShowReaction(null);
      } else {
        completeGame();
      }
    }, 1500);
  };

  const calculateResults = async (scores: { D: number; I: number; S: number; C: number }) => {
    // Start the dramatic reveal sequence
    setShowSpiritReveal(true);
    setRevealStep(0);
    
    // Step 1: "The spirits have spoken..."
    setTimeout(() => setRevealStep(1), 1000);
    
    // Step 2: "Your destiny is revealed..."
    setTimeout(() => setRevealStep(2), 3000);
    
    // Step 3: Show the actual results
    setTimeout(async () => {
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const percentages = {
      D: Math.round((scores.D / total) * 100),
      I: Math.round((scores.I / total) * 100),
      S: Math.round((scores.S / total) * 100),
      C: Math.round((scores.C / total) * 100)
    };

    const sorted = Object.entries(percentages).sort(([,a], [,b]) => b - a);
    const primaryType = sorted[0][0] as 'D' | 'I' | 'S' | 'C';
      const secondaryType = sorted[1][0] as 'D' | 'I' | 'S' | 'C';

    const results = {
      primaryType,
        secondaryType,
      scores: percentages,
        confidence: Math.min(95, 70 + (Math.max(...Object.values(percentages)) - Math.min(...Object.values(percentages)))),
        culturalAlignment: 95, // High since questions are culturally designed
        authenticity: 90 // High for demo purposes
    };

      // Calculate final XP bonus using the same formula as database
      const durationSeconds = Math.floor((Date.now() - (gameState.sessionStartTime?.getTime() || Date.now())) / 1000);
      const completionBonusXP = Math.round(
        (results.confidence * 2) + 
        (results.culturalAlignment * 1.5) + 
        (gameState.responses.length * 5) +
        (durationSeconds < 600 ? 50 : 0) // Speed bonus for under 10 minutes
      );
      
      // Calculate badges using same logic as database
      const finalBadges = results.confidence >= 85 ? ['High Confidence Achievement'] : [];
      
      // Update XP and badges with final values
      setGameState(prev => ({
        ...prev,
        xpPoints: completionBonusXP, // Set to final calculated XP (not accumulative)
        achievements: finalBadges // Set to final badges
      }));
      
      console.log('🎯 Final XP calculated:', completionBonusXP, 'points');
      console.log('📊 XP Breakdown:', {
        confidenceXP: results.confidence * 2,
        culturalXP: results.culturalAlignment * 1.5,
        questionXP: gameState.responses.length * 5,
        speedBonus: durationSeconds < 600 ? 50 : 0,
        duration: `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`,
        badges: finalBadges.length
      });

      // Generate AI assessment and BPO roles - WAIT for both to complete and capture results
      console.log('🤖 Starting AI analysis...');
      const [generatedAssessment, generatedBpoRoles] = await Promise.all([
        generateAIAssessment(results, gameState.responses),
        generateAIBpoRoles(results, gameState.responses)
      ]);
      console.log('✅ AI analysis completed');
      console.log('📝 Generated AI Assessment:', generatedAssessment.length, 'characters');
      console.log('💼 Generated BPO Roles:', generatedBpoRoles.length, 'roles');

    setDiscResult(results);
      setShowSpiritReveal(false);
    setShowResults(true);

      // Save complete session to database (AI data should now be available)
      console.log('💾 Saving complete DISC session to database');
      console.log('🔑 User info:', { id: user?.id, email: user?.email });
      console.log('📊 Session data:', {
        responses: gameState.responses.length,
        scores: gameState.scores,
        hasAiAssessment: !!generatedAssessment,
        aiAssessmentLength: generatedAssessment?.length || 0,
        hasBpoRoles: !!generatedBpoRoles && generatedBpoRoles.length > 0,
        bpoRolesCount: generatedBpoRoles?.length || 0,
        bpoRolesPreview: generatedBpoRoles?.slice(0, 2).map(r => r?.title) || []
      });
      
      try {
        console.log('📤 Sending AI data to database:', {
          aiAssessmentPreview: generatedAssessment?.substring(0, 100) + '...',
          bpoRolesData: generatedBpoRoles
        });
        
        const response = await fetch('/api/games/disc/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || 'no-token'}`
          },
          body: JSON.stringify({
						sessionStartTime: gameState.sessionStartTime,
            sessionData: {
							totalResponses: gameState.responses.length,
							completionTime: Math.floor((Date.now() - (gameState.sessionStartTime?.getTime() || Date.now())) / 1000),
							culturalContexts: ['FAMILY', 'WORK', 'SOCIAL', 'TRAFFIC', 'MONEY', 'CRISIS'],
							personalizedQuestionsUsed: gameState.personalizedQuestions.length
            },
            coreResponses: gameState.responses.slice(0, 30),
            coreScores: gameState.scores,
            personalizedResponses: gameState.responses.slice(30),
            personalizedQuestions: gameState.personalizedQuestions,
						finalResults: results,
						aiAssessment: generatedAssessment,
						aiBpoRoles: generatedBpoRoles,
						userContext: {
							position: user?.user_metadata?.position || user?.user_metadata?.current_position,
							location: user?.user_metadata?.location,
							bio: user?.user_metadata?.bio
            }
          })
        });
        
        console.log('🌐 API Response status:', response.status);
        const responseData = await response.json();
        console.log('📋 API Response data:', responseData);
        
        if (response.ok) {
        console.log('✅ DISC session saved successfully');
        // If API returns cumulative totals, prefer those for display
        const apiTotalXp = responseData?.totals?.total_xp;
        const apiBadges = responseData?.totals?.badges_earned;
        if (typeof apiTotalXp === 'number' || typeof apiBadges === 'number') {
          setGameState(prev => ({
            ...prev,
            xpPoints: typeof apiTotalXp === 'number' ? apiTotalXp : prev.xpPoints,
            achievements: typeof apiBadges === 'number' ? new Array(Math.max(0, apiBadges)).fill('') : prev.achievements
          }));
        }
        } else {
          console.error('❌ API returned error:', responseData);
        }
      } catch (error) {
        console.error('❌ Failed to save DISC session:', error);
        console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error');
      }
    }, 5000);
  };

  const resetGame = () => {
    setGameState({
      currentQuestion: 0,
      scores: { D: 0, I: 0, S: 0, C: 0 },
      gameStarted: false,
      gameCompleted: false,
      xpPoints: 0,
      badges: [],
      achievements: [],
      streak: 0,
      combo: 0,
      lastAnswer: '',
      sessionStartTime: null,
      userProfile: null,
		responses: [],
		personalizedQuestions: [],
		showPersonalized: false,
		isGeneratingPersonalized: false
    });
    setSelectedOption(null);
    setShowResults(false);
    setDiscResult(null);
    setShowReaction(null);
  };

  // Show dramatic spirit reveal sequence
  if (showSpiritReveal) {
    const revealMessages = [
      "The ancient spirits have been watching...",
      "Your choices have awakened a power within...",
      "Your true nature is about to be revealed..."
    ];

    return (
			<div className="min-h-screen cyber-grid pb-40">
        <Header />
        <div className="pt-16 relative z-10 flex items-center justify-center min-h-screen">
          <Card className="disc-game-screen max-w-2xl mx-auto">
            <CardContent className="p-12 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-8"
              >
                <div className="text-8xl">🔮</div>
              </motion.div>
              
              <motion.div
                key={revealStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
              >
                <h2 className="text-3xl font-bold gradient-text mb-6">
                  {revealMessages[revealStep] || revealMessages[0]}
                </h2>
              </motion.div>
              
              <div className="flex justify-center gap-8 mb-8">
                {[
                  { emoji: '🦅', score: gameState.scores.D, color: 'text-red-400' },
                  { emoji: '🦚', score: gameState.scores.I, color: 'text-yellow-400' },
                  { emoji: '🐢', score: gameState.scores.S, color: 'text-green-400' },
                  { emoji: '🦉', score: gameState.scores.C, color: 'text-blue-400' }
                ].map((spirit, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center"
                    animate={{ 
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  >
                    <div className="text-4xl mb-2">{spirit.emoji}</div>
                    <div className={`text-xl font-bold ${spirit.color}`}>{spirit.score}</div>
                  </motion.div>
                ))}
              </div>
              
              <p className="text-gray-300 text-lg">
                The spirits are converging... Your destiny awaits...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading screen for personalized question generation
  if (gameState.isGeneratingPersonalized) {
    return (
			<div className="min-h-screen cyber-grid pb-40">
        <Header />
        <div className="pt-16 relative z-10 flex items-center justify-center min-h-screen">
          <Card className="disc-game-screen max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <Brain className="h-16 w-16 text-cyan-400 mx-auto" />
              </motion.div>
              <h2 className="text-2xl font-bold gradient-text mb-4">
                🤖 AI Analyzing Your Personality, {user?.user_metadata?.first_name || 'Player'}...
              </h2>
              <p className="text-gray-300 mb-4">
                Claude AI is creating 5 personalized questions based on your unique Filipino cultural patterns and response style using your real profile data from {user?.user_metadata?.location || 'your location'}.
              </p>
              <div className="disc-progress-bar mb-4">
                <motion.div 
                  className="disc-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              </div>
              <p className="text-sm text-gray-400">
                This will make your results impossible to fake and perfectly personalized to your life! 🇵🇭
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults && discResult) {
    const personalityType = ANIMAL_PERSONALITIES[discResult.primaryType as keyof typeof ANIMAL_PERSONALITIES];

    return (
			<div className="min-h-screen cyber-grid pb-40">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <Header />
        
        <div className="pt-16 relative z-10">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="text-6xl">{personalityType.animal.split(' ')[0]}</div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                    You are {personalityType.animal}!
                  </h1>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-2">{personalityType.title}</h2>
                <p className="text-gray-300 text-lg">{personalityType.description}</p>
                </div>
                
              {/* Results Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Personality Scores */}
                <Card className="disc-game-screen">
                  <CardHeader>
                    <CardTitle className="text-white">🎯 Your DISC Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
						{Object.entries(discResult.scores as Record<string, number>).map(([type, score]: [string, number]) => {
                        const animal = ANIMAL_PERSONALITIES[type as keyof typeof ANIMAL_PERSONALITIES];
                      return (
                          <div key={type} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{animal.animal.split(' ')[0]}</span>
                              <span className="text-white font-medium">{type}-Type</span>
                          </div>
                            <div className="flex items-center gap-2">
                              <div className="w-24 personality-score-bar">
                                <div 
                                  className={`personality-score-fill score-${type.toLowerCase()}`}
										style={{ width: `${Number(score)}%` }}
                                />
                          </div>
									<span className="text-white font-bold w-12">{Number(score)}%</span>
                          </div>
                          </div>
                      );
                      })}
                  </div>
                  </CardContent>
                </Card>

                {/* Game Stats */}
                <Card className="disc-game-screen">
                  <CardHeader>
                    <CardTitle className="text-white">🏆 Your Achievement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-cyan-400">{gameState.xpPoints}</div>
                        <div className="text-sm text-gray-400">Total XP</div>
                    </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">{gameState.achievements.length}</div>
                        <div className="text-sm text-gray-400">Badges</div>
                  </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400">{discResult.confidence}%</div>
                        <div className="text-sm text-gray-400">Confidence</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400">{Math.round(discResult.culturalAlignment)}%</div>
                        <div className="text-sm text-gray-400">Filipino Fit</div>
                      </div>
                  </div>
                  </CardContent>
                </Card>
                </div>

              {/* Detailed Personality Explanation */}
              <Card className="disc-game-screen mb-8">
                <CardHeader>
                  <CardTitle className="text-white">🧬 Understanding Your {personalityType.animal} Nature</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-cyan-300 mb-2">Your Core Traits</h4>
                    <div className="flex flex-wrap gap-2">
                      {personalityType.traits.map((trait, index) => (
                        <span key={index} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-green-300 mb-2">Why This Fits Filipino Culture</h4>
                    <p className="text-gray-300">
                      {personalityType.title === "The Sky Dominator" && "In Filipino culture, you're the natural 'tagapamuno' who takes charge during challenges. Your 'diskarte' mentality helps you find solutions where others see obstacles."}
                      {personalityType.title === "The Social Star" && "You embody the Filipino spirit of 'pakikipagkapwa' - connecting with others naturally. Your warmth and enthusiasm make you perfect for building relationships in any setting."}
                      {personalityType.title === "The Steady Guardian" && "You represent the Filipino value of 'malasakit' - caring for others consistently. Your reliability and patience make you the foundation that teams depend on."}
                      {personalityType.title === "The Wise Analyst" && "You reflect the Filipino trait of being 'matalino' - not just smart, but wise. Your attention to detail and systematic approach ensures quality in everything you do."}
                    </p>
                  </div>

				{/* AI Assessment Section - Show loading or content */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-purple-400" />
              <h4 className="text-xl font-semibold text-purple-300">🧠 AI Personal Assessment</h4>
						{isGeneratingAIAssessment && (
							<div className="flex items-center gap-2 ml-auto">
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
								<span className="text-xs text-purple-300">Analyzing...</span>
							</div>
						)}
            </div>
            
					{isGeneratingAIAssessment ? (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
							<p className="text-purple-300 text-lg font-medium">AI is analyzing your personality...</p>
							<p className="text-gray-400 text-sm mt-2">Examining your response patterns and cultural alignment</p>
						</div>
					) : typeof aiAssessment === 'string' ? (
						<>
            {/* Visual Response Pattern Analysis */}
            <div className="mb-6 p-4 bg-black/20 rounded-lg">
              <h5 className="text-sm font-semibold text-cyan-300 mb-3">📊 Response Pattern Analysis</h5>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-400">Total Responses Analyzed</div>
                  <div className="text-2xl font-bold text-white">{gameState.responses.length}</div>
                </div>
                <div>
                  <div className="text-gray-400">Average Response Time</div>
                  <div className="text-2xl font-bold text-white">
                    {Math.round(gameState.responses.reduce((sum, r) => sum + (r.responseTime || 0), 0) / gameState.responses.length / 1000)}s
                  </div>
                </div>
              </div>
            </div>

            {/* DISC Score Visualization */}
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-cyan-300 mb-3">🎯 Personality Breakdown</h5>
              
              {/* Circular Progress Rings */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                {[
                  { type: 'D', label: 'Dominance', color: 'text-red-400', bgColor: 'stroke-red-500', score: discResult.scores.D, emoji: '🦅' },
                  { type: 'I', label: 'Influence', color: 'text-yellow-400', bgColor: 'stroke-yellow-500', score: discResult.scores.I, emoji: '🦚' },
                  { type: 'S', label: 'Steadiness', color: 'text-green-400', bgColor: 'stroke-green-500', score: discResult.scores.S, emoji: '🐢' },
                  { type: 'C', label: 'Conscientiousness', color: 'text-blue-400', bgColor: 'stroke-blue-500', score: discResult.scores.C, emoji: '🦉' }
                ].map(item => {
                  const circumference = 2 * Math.PI * 35;
                  const strokeDasharray = `${(item.score / 100) * circumference} ${circumference}`;
                  
                  return (
                    <div key={item.type} className="flex flex-col items-center">
                      <div className="relative w-20 h-20 mb-2">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="35"
                            className={item.bgColor}
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={strokeDasharray}
                            strokeLinecap="round"
                            style={{
                              transition: 'stroke-dasharray 1s ease-in-out',
                              filter: 'drop-shadow(0 0 6px currentColor)'
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                            <div className="text-2xl">{item.emoji}</div>
                            <div className={`text-xs font-bold ${item.color}`}>{item.score}%</div>
                      </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-white text-sm">{item.type}</div>
                        <div className="text-xs text-gray-400">{item.label}</div>
                      </div>
                  </div>
                  );
                })}
                </div>

              {/* Bar Chart Alternative */}
              <div className="space-y-3">
                {[
                  { type: 'D', label: 'Dominance', color: 'bg-red-500', score: discResult.scores.D },
                  { type: 'I', label: 'Influence', color: 'bg-yellow-500', score: discResult.scores.I },
                  { type: 'S', label: 'Steadiness', color: 'bg-green-500', score: discResult.scores.S },
                  { type: 'C', label: 'Conscientiousness', color: 'bg-blue-500', score: discResult.scores.C }
                ].map(item => (
                  <div key={item.type} className="flex items-center gap-3">
                    <div className="w-8 text-center font-bold">{item.type}</div>
                    <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${item.score}%` }}
                            />
                          </div>
                    <div className="w-12 text-right text-sm font-semibold">
                      {item.score}%
                    </div>
                    <div className="w-24 text-xs text-gray-400">
                      {item.label}
                    </div>
                  </div>
                ))}
                  </div>
                </div>
                
            {/* Response Speed Analysis */}
            <div className="mb-6 p-4 bg-black/20 rounded-lg">
              <h5 className="text-sm font-semibold text-cyan-300 mb-3">⚡ Decision Speed Insights</h5>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-gray-400">Fastest Response</div>
                  <div className="text-lg font-bold text-green-400">
                    {Math.min(...gameState.responses.map(r => r.responseTime || 0)) / 1000}s
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Longest Response</div>
                  <div className="text-lg font-bold text-orange-400">
                    {Math.max(...gameState.responses.map(r => r.responseTime || 0)) / 1000}s
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis Text */}
            <div className="bg-black/30 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-purple-300 mb-3">🔮 Deep Personality Insights</h5>
              <div className="text-gray-300 leading-relaxed text-sm space-y-3">
							{aiAssessment.split('\n\n').map((paragraph: string, index: number) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
                    </div>
						</>
					) : (
						<div className="text-center py-6">
							<p className="text-gray-400">AI assessment will appear here once generated.</p>
                  </div>
                )}
				</div>
                </CardContent>
              </Card>

              {/* AI-Powered BPO Career Insights */}
              <Card className="disc-game-screen mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                  <CardTitle className="text-white">💼 Perfect BPO Roles for You</CardTitle>
                    {isGeneratingBpoRoles && (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-400 border-t-transparent"></div>
                        <span className="text-xs text-cyan-300">AI Analyzing...</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isGeneratingBpoRoles ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-cyan-300 text-lg font-medium">AI is finding your perfect BPO roles...</p>
                      <p className="text-gray-400 text-sm mt-2">Analyzing your personality against {user?.user_metadata?.position || 'your background'}</p>
                    </div>
                  ) : aiBpoRoles && aiBpoRoles.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain className="h-5 w-5 text-cyan-400" />
                        <span className="text-sm text-cyan-300">Personalized for your {user?.user_metadata?.position || 'background'}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiBpoRoles.map((role: any, index: number) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                            <Briefcase className="h-5 w-5 text-cyan-400" />
                            <span className="text-white">{role.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Fallback to default roles
                    <div className="space-y-4">
                      <div className="text-sm text-gray-400 mb-4">Based on your {personalityType.animal} personality:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {personalityType.bpoRoles.map((role, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <Briefcase className="h-5 w-5 text-cyan-400" />
                        <span className="text-white">{role}</span>
                          </div>
                      ))}
                    </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  onClick={() => router.push('/career-tools/games')}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg w-full"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Games
                </Button>
                <Button
                  onClick={() => {
                    // Generate shareable result card
                    const shareText = `I'm a ${personalityType.animal}! ${personalityType.title} 🇵🇭 Perfect for ${personalityType.bpoRoles[0]} roles! What's your BPO animal?`;
                    if (navigator.share) {
                      navigator.share({ text: shareText });
                    } else if (navigator.clipboard) {
                      navigator.clipboard.writeText(shareText);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Share Results
                </Button>
                <Button
                  onClick={resetGame}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Take Again
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Welcome screen
  if (!gameState.gameStarted) {
    return (
		<div className="min-h-screen cyber-grid pb-40">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <Header />
        
        <div className="pt-16 relative z-10">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center space-y-8"
            >
              <Card className="disc-game-screen">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="text-6xl mr-4">🇵🇭</div>
                    <div>
                      <CardTitle className="text-4xl font-bold gradient-text mb-2">
                        Filipino DISC Personality Game
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-lg">
                        Discover your BPO animal spirit through authentic Filipino scenarios!
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="text-gray-300 space-y-6 text-left max-w-3xl mx-auto">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-400" />
                        What Makes This Special
                      </h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <span className="text-2xl mr-3 mt-0.5">🦅🦚🐢🦉</span>
                          <span><strong>4 Filipino Animal Spirits:</strong> Eagle (Dominator), Peacock (Social Star), Turtle (Steady Guardian), Owl (Wise Analyst)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-400 mr-3 mt-0.5 text-lg">🇵🇭</span>
                          <span><strong>30 Real Filipino Scenarios + 5 AI Personalized:</strong> Family drama, OFW money issues, EDSA traffic, BGC encounters, barkada pressure, work politics, social media pressure</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-400 mr-3 mt-0.5 text-lg">🤖</span>
                          <span><strong>AI-Powered Personalization:</strong> Claude AI creates 5 custom questions using YOUR real name, location, and profile data</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-400 mr-3 mt-0.5 text-lg">💼</span>
                          <span><strong>BPO Career Insights:</strong> Perfect role matches for Philippine call centers and outsourcing</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-400 mr-3 mt-0.5 text-lg">🎮</span>
                          <span><strong>Gamified Experience:</strong> XP, achievements, streaks, and shareable results</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-red-400 text-lg">⚡</span>
                          <h4 className="text-white font-semibold">Real Filipino Context</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Every scenario uses authentic Filipino situations with real peso amounts and cultural references.</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-400 text-lg">🎯</span>
                          <h4 className="text-white font-semibold">BPO-Focused Results</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Get specific role recommendations for Philippine call centers and BPO companies.</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg py-6 h-16"
                  >
                    <Play className="w-6 h-6 mr-3" />
                    Discover My Filipino BPO Animal! 🇵🇭
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Main game interface
  const ContextIcon = CONTEXT_ICONS[currentScenario?.context as keyof typeof CONTEXT_ICONS] || Brain;
  
  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
      
      <Header />
      
		<div className="pt-16 relative z-10 min-h-screen">
        <div className="container mx-auto px-4 md:px-6 py-4 h-full">
          {/* Compact Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => setShowExitDialog(true)}
                className="mr-4 text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ContextIcon className="h-8 w-8 text-green-400 mr-3" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">Filipino DISC 🇵🇭</h1>
                  <p className="text-gray-400 text-sm">{currentScenario?.context} Context</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Game Layout */}
          <div className="flex gap-4 h-[calc(100vh-140px)]">
            {/* Left Side - Progress and Stats */}
				<div className="w-1/3 h-full grid grid-rows-2 gap-4">
              {/* Filipino Personality Journey */}
              <Card className="disc-game-screen">
						<CardContent className="p-4 h-full flex flex-col">
                    <div className="text-center mb-3">
                      <h3 className="text-lg font-bold text-cyan-300">🇵🇭 Personality Journey</h3>
                      <div className="text-xs text-gray-400">Discovering Your Filipino Work Style</div>
                      </div>
                    
                    <div className="flex-1 space-y-3">
                      {/* Current Context */}
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-1">Current Context</div>
                        <div className="text-sm font-semibold text-white">
                          {gameState.currentQuestion < 8 ? '👨‍👩‍👧‍👦 Family Dynamics' :
                           gameState.currentQuestion < 14 ? '💼 Professional Workplace' :
                           gameState.currentQuestion < 20 ? '🎉 Social Interactions' :
                           gameState.currentQuestion < 24 ? '🚗 Traffic & Stress' :
                           gameState.currentQuestion < 29 ? '💰 Money & Values' :
                           gameState.currentQuestion < 30 ? '⚡ Crisis Response' :
                           gameState.showPersonalized ? '🎯 Personal Challenges' : '🔮 Final Assessment'}
                      </div>
                      </div>

                      {/* Personality Emergence */}
                      <div className="bg-black/20 rounded-lg p-3">
                        <div className="text-xs text-gray-400 mb-2">Emerging Traits</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-red-400 font-bold">{Math.round((gameState.scores.D / Math.max(gameState.currentQuestion + 1, 1)) * 100)}%</div>
                            <div className="text-red-300">Leader</div>
                          </div>
                          <div className="text-center">
                            <div className="text-yellow-400 font-bold">{Math.round((gameState.scores.I / Math.max(gameState.currentQuestion + 1, 1)) * 100)}%</div>
                            <div className="text-yellow-300">Social</div>
                          </div>
                          <div className="text-center">
                            <div className="text-green-400 font-bold">{Math.round((gameState.scores.S / Math.max(gameState.currentQuestion + 1, 1)) * 100)}%</div>
                            <div className="text-green-300">Steady</div>
                          </div>
                          <div className="text-center">
                            <div className="text-blue-400 font-bold">{Math.round((gameState.scores.C / Math.max(gameState.currentQuestion + 1, 1)) * 100)}%</div>
                            <div className="text-blue-300">Careful</div>
                          </div>
                        </div>
                      </div>

                      {/* Cultural Insight */}
                      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg p-3">
                        <div className="text-xs text-cyan-300 mb-1">Filipino Values Focus</div>
                        <div className="text-xs text-gray-300">
                          {gameState.currentQuestion < 10 ? 'Testing your "malasakit" (caring) in family situations' :
                           gameState.currentQuestion < 20 ? 'Exploring "pakikipagkapwa" (shared identity) at work' :
                           gameState.currentQuestion < 30 ? 'Revealing your "diskarte" (resourcefulness) under pressure' :
                           'Discovering your authentic Filipino leadership style'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

            {/* Spirit Stage */}
            <Card className="disc-game-screen">
						<CardContent className="p-4 h-full flex flex-col">
							<div className="text-center flex flex-col h-full">
								<div className="text-lg font-bold text-cyan-300 mb-3">🎭 Spirit Stage 🎭</div>
                  
                  {/* Main Character Stage - takes up remaining space */}
							<div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg p-4 border border-purple-500/30 flex-1 flex items-center justify-center min-h-[200px]">
                    {selectedOption && showReaction && (
              <motion.div
                        key={`${gameState.currentQuestion}-${selectedOption}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [0, 1.5, 1], 
                          opacity: [0, 1, 1],
                          rotate: [0, 360, 0]
                        }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="text-center"
                      >
                        {/* Show the character based on DISC type, not choice ID */}
                        {(() => {
                          const currentChoice = shuffledOptions?.find(opt => opt.id === selectedOption);
                          const discType = currentChoice?.disc;
                          
                          if (discType === 'D') {
                            return (
                              <motion.div
                                animate={{ 
                                  y: [0, -20, 0],
                                  scale: [1, 1.2, 1]
                                }}
                                transition={{ duration: 0.8, repeat: 2 }}
                                className="text-9xl"
                                style={{ filter: 'drop-shadow(0 0 20px #ef4444)' }}
                              >
                                🦅
                              </motion.div>
                            );
                          } else if (discType === 'I') {
                            return (
                              <motion.div
                                animate={{ 
                                  rotate: [0, 15, -15, 0],
                                  scale: [1, 1.3, 1]
                                }}
                                transition={{ duration: 1, repeat: 2 }}
                                className="text-9xl"
                                style={{ filter: 'drop-shadow(0 0 20px #ffd23f)' }}
                              >
                                🦚
                              </motion.div>
                            );
                          } else if (discType === 'S') {
                            return (
                              <motion.div
                                animate={{ 
                                  x: [0, 10, -10, 0],
                                  scale: [1, 1.1, 1]
                                }}
                                transition={{ duration: 1.2, repeat: 2 }}
                                className="text-9xl"
                                style={{ filter: 'drop-shadow(0 0 20px #10b981)' }}
                              >
                                🐢
                              </motion.div>
                            );
                          } else if (discType === 'C') {
                            return (
                              <motion.div
                                animate={{ 
                                  rotate: [0, -20, 20, 0],
                                  scale: [1, 1.2, 1]
                                }}
                                transition={{ duration: 0.9, repeat: 2 }}
                                className="text-9xl"
                                style={{ filter: 'drop-shadow(0 0 20px #3b82f6)' }}
                              >
                                🦉
                              </motion.div>
                            );
                          }
                          return null;
                        })()}
                      </motion.div>
                    )}
                    
                    {/* Default state when no selection */}
                    {!selectedOption && (
								<div className="text-8xl opacity-30">🔮</div>
                    )}
                       </div>
                  
							<div className="text-center text-sm text-gray-400 mt-3 font-medium">
                    Question {gameState.currentQuestion + 1} of {totalQuestions}
                     </div>
                    </div>
                  </CardContent>
                </Card>

            </div>

            {/* Right Side - Main Game Content */}
				<div className="w-2/3 h-full">
              <motion.div
                key={gameState.currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full"
              >
                <div className={`disc-game-screen h-full rounded-xl border border-white/10 bg-black/30 pt-2 pb-0 px-2 scenario-${currentScenario?.context.toLowerCase()} flex flex-col`}>
                  {/* Compact top header with progress */}
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2">
                      <ContextIcon className="h-5 w-5 text-cyan-400" />
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-cyan-400/30 text-cyan-300 text-[10px] tracking-wide uppercase">{currentScenario?.context}</span>
                      </div>
                    <div className="flex-1">
                      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${progressPercent}%` }} />
                    </div>
                       </div>
                    <div className="text-[10px] text-gray-400 whitespace-nowrap">{gameState.currentQuestion + 1}/{totalQuestions}</div>
                     </div>

                  {/* Title */}
                  <h2 className="text-2xl font-extrabold text-center mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow">{currentScenario?.title}</h2>

                  {/* Scenario */}
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3 mb-1">
                    <p className="text-lg text-gray-200 leading-relaxed">{currentScenario?.scenario}</p>
                  </div>

                  {/* Choices grid - force 2x2 */}
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    {shuffledOptions.map((choice, index) => {
                      const styles = getDiscStyles(choice.disc)
                      return (
                        <motion.button
                          key={choice.id}
                          onClick={() => handleOptionSelect(choice.id, choice.disc, choice.reaction)}
                          disabled={selectedOption !== null}
                          className={`text-left transition-all rounded-lg border ${styles.border} bg-gradient-to-br ${styles.bg} ${selectedOption === choice.id ? `ring-2 ${styles.ring} scale-[1.005]` : 'hover:ring-1'} hover:translate-y-[-1px] hover:shadow-lg/30 backdrop-blur-sm`}
                          whileHover={{ scale: selectedOption === null ? 1.01 : 1 }}
                          whileTap={{ scale: 0.99 }}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex items-start gap-4 p-4">
                            <div className="text-2xl select-none">
                              {choice.animal.split(' ')[0]}
                            </div>
                            <div className="flex-1">
                              <div className="text-white font-semibold leading-snug text-base">{choice.text}</div>
                              <div className={`mt-1 text-xs ${styles.text}`}>{choice.animal}</div>
                            </div>
                          </div>
                        </motion.button>
                      )
                    })}
                  </div>

                  {/* Ancient Spirits Gathering moved below choices */}
                  <div className="mt-2">
                    <Card className="disc-game-screen py-1">
                      <CardContent className="p-3">
                        <div className="text-center mb-3">
                          <div className="text-sm text-gray-300 mb-3">Ancient Spirits Gathering</div>
                          <div className="flex justify-center gap-8 min-h-[128px] items-end">
                            <motion.div 
                              className="flex flex-col items-center"
                              animate={{ scale: gameState.scores.D > 0 ? [1, 1.15, 1] : 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="text-4xl mb-1" style={{ opacity: gameState.scores.D > 0 ? 1 : 0.3 }}>🦅</div>
                              <div className="text-sm text-red-400 font-bold">{gameState.scores.D}</div>
                            </motion.div>
                            <motion.div 
                              className="flex flex-col items-center"
                              animate={{ scale: gameState.scores.I > 0 ? [1, 1.15, 1] : 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="text-4xl mb-1" style={{ opacity: gameState.scores.I > 0 ? 1 : 0.3 }}>🦚</div>
                              <div className="text-sm text-yellow-400 font-bold">{gameState.scores.I}</div>
                            </motion.div>
                            <motion.div 
                              className="flex flex-col items-center"
                              animate={{ scale: gameState.scores.S > 0 ? [1, 1.15, 1] : 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="text-4xl mb-1" style={{ opacity: gameState.scores.S > 0 ? 1 : 0.3 }}>🐢</div>
                              <div className="text-sm text-green-400 font-bold">{gameState.scores.S}</div>
                            </motion.div>
                            <motion.div 
                              className="flex flex-col items-center"
                              animate={{ scale: gameState.scores.C > 0 ? [1, 1.15, 1] : 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="text-4xl mb-1" style={{ opacity: gameState.scores.C > 0 ? 1 : 0.3 }}>🦉</div>
                              <div className="text-sm text-blue-400 font-bold">{gameState.scores.C}</div>
                            </motion.div>
                          </div>
                    </div>
                  </CardContent>
                </Card>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback Popup */}
      <AnimatePresence>
      {showReaction && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowReaction(null)}
        >
          <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="disc-game-screen border-cyan-400/50 shadow-xl">
              <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-2">✨</div>
                <p className="text-xl font-semibold text-white">{showReaction}</p>
                <p className="text-sm text-gray-400 mt-2">Click anywhere to continue</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Achievement Notification */}
      <AnimatePresence>
      {showAchievement && (
        <motion.div
            className="achievement-notification"
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="text-green-400 font-bold">Achievement Unlocked!</p>
                <p className="text-white text-sm">{showAchievement}</p>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Exit Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="bg-black border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Filipino DISC Game?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Your progress will be lost if you leave now. Are you sure you want to exit?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Continue Playing
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => router.push('/career-tools/games')} 
              className="bg-red-600 hover:bg-red-700"
            >
              Exit Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

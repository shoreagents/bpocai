'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { 
  ArrowLeft,
  Utensils,
  Target,
  Play,
  Clock,
  CheckCircle,
  X,
  AlertTriangle,
  Timer,
  Trophy,
  Users,
  Zap,
  BarChart3,
  Star,
  MessageSquare,
  Edit3,
  Award,
  Building,
  User,
  Smile,
  Frown,
  Scale,
  MessageCircle,
  Share
} from 'lucide-react';

interface GameStats {
  score: number;
  cultureFit: number;
  emotionalIntelligence: number;
  pragmaticThinking: number;
  currentQuestion: number;
  totalQuestions: number;
  isCompleted: boolean;
}

interface Question {
  id: string;
  scenario: string;
  question: string;
  teamHint?: string;
  options: {
    yes: {
      feedback: string;
      cultureFit: number;
      emotionalIntelligence: number;
      pragmaticThinking: number;
      reaction: string;
    };
    no: {
      feedback: string;
      cultureFit: number;
      emotionalIntelligence: number;
      pragmaticThinking: number;
      reaction: string;
    };
  };
}

export default function InternshipFoodPage() {
  const router = useRouter();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState<'yes' | 'no' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showTeamHint, setShowTeamHint] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    cultureFit: 50,
    emotionalIntelligence: 50,
    pragmaticThinking: 50,
    currentQuestion: 0,
    totalQuestions: 15,
    isCompleted: false
  });

  const questions: Question[] = [
    {
      id: 'food-question',
      scenario: `You're at Google HQ. After a catered lunch, you notice there's a lot of leftover food. Your teammate jokingly says: "Hey, they probably just throw that away, right? Is it cool to take some home?"`,
      question: 'Is it okay to take the food home?',
      teamHint: 'Sarah from HR says: "It\'s always better to wait for an offer than to ask directly."',
      options: {
        yes: {
          feedback: 'You might be practical, but in a workplace setting, optics matter.',
          cultureFit: -10,
          emotionalIntelligence: 0,
          pragmaticThinking: 5,
          reaction: 'The team stares. The room goes quiet. The interviewer furrows their brow. "Hmm... Interesting response. We value initiative... but also professionalism."'
        },
        no: {
          feedback: 'You understand boundaries and group dynamics — great instincts.',
          cultureFit: 15,
          emotionalIntelligence: 5,
          pragmaticThinking: 0,
          reaction: 'The interviewer smiles. "Good judgment. That\'s the kind of discretion we look for in a team environment."'
        }
      }
    },
    {
      id: 'meeting-interruption',
      scenario: `During a team meeting, your colleague Sarah is presenting when another team member, Mike, constantly interrupts her with "corrections" and "better ideas." Sarah looks increasingly frustrated but tries to stay professional.`,
      question: 'Should you speak up to defend Sarah?',
      teamHint: 'Mike from Sales says: "Sometimes the best help is the most subtle help."',
      options: {
        yes: {
          feedback: 'You show empathy and team support, but timing and approach matter in professional settings.',
          cultureFit: 5,
          emotionalIntelligence: 10,
          pragmaticThinking: -5,
          reaction: 'The team notices your intervention. Some appreciate the support, others think you should have handled it privately. The manager makes a mental note about team dynamics.'
        },
        no: {
          feedback: 'You understand that direct confrontation in meetings can escalate tensions and affect team harmony.',
          cultureFit: 10,
          emotionalIntelligence: 5,
          pragmaticThinking: 10,
          reaction: 'You later approach Mike privately. The manager appreciates your discretion and conflict resolution skills.'
        }
      }
    },
    {
      id: 'deadline-pressure',
      scenario: `Your team is under intense deadline pressure. Your manager asks you to work late, but you have a family commitment you promised to keep. The project is critical for the company.`,
      question: 'Should you prioritize work over your family commitment?',
      teamHint: 'Lisa from Work-Life Balance says: "Setting boundaries early shows professionalism and self-respect."',
      options: {
        yes: {
          feedback: 'You demonstrate commitment to the team, but work-life balance is crucial for long-term success.',
          cultureFit: 5,
          emotionalIntelligence: -5,
          pragmaticThinking: 10,
          reaction: 'Your manager appreciates the dedication, but HR notes the overtime. They discuss work-life balance policies with leadership.'
        },
        no: {
          feedback: 'You maintain healthy boundaries and communicate your priorities effectively.',
          cultureFit: 10,
          emotionalIntelligence: 15,
          pragmaticThinking: 5,
          reaction: 'You propose a solution that meets both needs. The team respects your boundaries and finds alternative approaches.'
        }
      }
    },
    {
      id: 'cultural-misunderstanding',
      scenario: `During a team lunch, your colleague from a different cultural background shares a traditional dish. Another team member makes a joke about "weird food" and laughs. The colleague looks uncomfortable.`,
      question: 'Should you address the cultural insensitivity immediately?',
      teamHint: 'Maria from Diversity & Inclusion says: "Cultural sensitivity is best addressed privately to avoid public embarrassment."',
      options: {
        yes: {
          feedback: 'You show cultural awareness and allyship, but public confrontation might make everyone uncomfortable.',
          cultureFit: 15,
          emotionalIntelligence: 5,
          pragmaticThinking: -5,
          reaction: 'The colleague appreciates your support, but the atmosphere becomes tense. HR later implements cultural sensitivity training.'
        },
        no: {
          feedback: 'You choose to address it privately, showing both cultural awareness and professional discretion.',
          cultureFit: 10,
          emotionalIntelligence: 10,
          pragmaticThinking: 10,
          reaction: 'You later have a private conversation with the team member. They apologize and learn from the experience.'
        }
      }
    },
    {
      id: 'client-criticism',
      scenario: `A client is very critical of your team's work during a presentation. They're being harsh and somewhat unfair. Your manager looks stressed, and the team is demoralized.`,
      question: 'Should you defend your team\'s work to the client?',
      teamHint: 'David from Client Relations says: "Listen first, then ask clarifying questions before responding defensively."',
      options: {
        yes: {
          feedback: 'You show loyalty to your team, but client relationships require diplomacy and understanding.',
          cultureFit: 5,
          emotionalIntelligence: -5,
          pragmaticThinking: -10,
          reaction: 'The client becomes defensive. Your manager has to smooth things over. The team appreciates your loyalty but learns about client diplomacy.'
        },
        no: {
          feedback: 'You demonstrate professional maturity by listening to feedback and finding constructive solutions.',
          cultureFit: 10,
          emotionalIntelligence: 15,
          pragmaticThinking: 10,
          reaction: 'You ask clarifying questions and propose solutions. The client appreciates the professional approach and the relationship improves.'
        }
      }
    },
    {
      id: 'team-conflict',
      scenario: `Two of your teammates are having a disagreement about project direction. It's affecting team morale and productivity. They both come to you separately to vent and seek your support.`,
      question: 'Should you take sides to resolve the conflict quickly?',
      teamHint: 'Alex from Team Development says: "Neutral mediation often leads to better long-term solutions than taking sides."',
      options: {
        yes: {
          feedback: 'You might resolve the immediate issue, but taking sides can create long-term team divisions.',
          cultureFit: -5,
          emotionalIntelligence: -5,
          pragmaticThinking: 5,
          reaction: 'The conflict resolves temporarily, but team trust is damaged. Others become hesitant to share concerns with you.'
        },
        no: {
          feedback: 'You act as a neutral mediator, helping the team find common ground and maintain relationships.',
          cultureFit: 15,
          emotionalIntelligence: 15,
          pragmaticThinking: 10,
          reaction: 'You facilitate a productive discussion. Both parties feel heard, and the team develops better conflict resolution skills.'
        }
      }
    },
    {
      id: 'ethical-dilemma',
      scenario: `You discover that a colleague has been taking credit for work that was actually done by another team member. The colleague is well-liked and the other person hasn't complained.`,
      question: 'Should you report this behavior to management?',
      teamHint: 'Emma from Ethics & Compliance says: "Consider speaking with the affected person first before escalating."',
      options: {
        yes: {
          feedback: 'You uphold ethical standards, but consider the impact on team relationships and the other person\'s wishes.',
          cultureFit: 10,
          emotionalIntelligence: 0,
          pragmaticThinking: 5,
          reaction: 'Management investigates and addresses the issue. The team learns about proper attribution, but some relationships become strained.'
        },
        no: {
          feedback: 'You might avoid conflict, but this allows unethical behavior to continue and affects team trust.',
          cultureFit: -5,
          emotionalIntelligence: -10,
          pragmaticThinking: -5,
          reaction: 'The behavior continues. Team morale suffers as others notice the unfair treatment. Trust in leadership decreases.'
        }
      }
    },
    {
      id: 'communication-pressure',
      scenario: `During a high-stakes client presentation, your manager asks you to present a section you're not fully prepared for. You're nervous but don't want to let the team down.`,
      question: 'Should you admit you\'re not prepared and ask for help?',
      teamHint: 'James from Communication Training says: "Honesty about preparation builds trust and leads to better outcomes."',
      options: {
        yes: {
          feedback: 'You show honesty and self-awareness, which builds trust and allows for better preparation.',
          cultureFit: 10,
          emotionalIntelligence: 15,
          pragmaticThinking: 5,
          reaction: 'Your manager appreciates your honesty and helps you prepare. The presentation goes well, and the team learns about transparency.'
        },
        no: {
          feedback: 'You try to wing it, which could damage client relationships and team reputation.',
          cultureFit: -5,
          emotionalIntelligence: -5,
          pragmaticThinking: -10,
          reaction: 'The presentation goes poorly. The client loses confidence, and your manager has to step in to salvage the situation.'
        }
      }
    },
    {
      id: 'remote-work-challenge',
      scenario: `Your team is working remotely, and you notice a colleague consistently missing deadlines and appearing distracted during video calls. Others are picking up their slack.`,
      question: 'Should you directly confront your colleague about their performance?',
      teamHint: 'Sophie from Remote Work says: "Remote challenges often have personal causes. Approach with empathy first."',
      options: {
        yes: {
          feedback: 'You address the issue directly, but this might damage relationships and create tension in a remote environment.',
          cultureFit: -5,
          emotionalIntelligence: -5,
          pragmaticThinking: 10,
          reaction: 'Your colleague becomes defensive. The team atmosphere becomes tense, and others avoid similar confrontations.'
        },
        no: {
          feedback: 'You choose to understand the situation first and offer support, showing empathy and team collaboration.',
          cultureFit: 10,
          emotionalIntelligence: 15,
          pragmaticThinking: 5,
          reaction: 'You reach out privately to offer help. Your colleague opens up about personal challenges, and you work together on solutions.'
        }
      }
    },
    {
      id: 'innovation-vs-tradition',
      scenario: `Your team has been using the same process for years, but you have an innovative idea that could improve efficiency. However, your manager is known for being resistant to change.`,
      question: 'Should you push forward with your innovative idea despite potential resistance?',
      teamHint: 'Tom from Innovation says: "Present change as an evolution, not a revolution. Show the benefits clearly."',
      options: {
        yes: {
          feedback: 'You show initiative and innovation, but timing and approach are crucial for successful change management.',
          cultureFit: 5,
          emotionalIntelligence: 0,
          pragmaticThinking: 15,
          reaction: 'Your manager is initially skeptical but impressed by your thorough preparation. The idea gets implemented gradually.'
        },
        no: {
          feedback: 'You respect existing processes and team dynamics, but miss opportunities for improvement.',
          cultureFit: 10,
          emotionalIntelligence: 5,
          pragmaticThinking: -5,
          reaction: 'The team continues with the old process. Others notice your hesitation and become less likely to suggest improvements.'
        }
      }
    },
    {
      id: 'mentorship-opportunity',
      scenario: `A junior team member approaches you for help with a project you're not directly involved in. You're busy with your own work, but they seem really struggling and stressed.`,
      question: 'Should you take time to help them despite your own workload?',
      teamHint: 'Rachel from Leadership Development says: "Mentorship builds your leadership skills and team relationships."',
      options: {
        yes: {
          feedback: 'You demonstrate leadership and team support, but need to balance helping others with your own responsibilities.',
          cultureFit: 15,
          emotionalIntelligence: 10,
          pragmaticThinking: -5,
          reaction: 'Your colleague is grateful and learns quickly. The team notices your leadership, but your own work gets delayed slightly.'
        },
        no: {
          feedback: 'You maintain focus on your priorities, but miss an opportunity to build relationships and demonstrate leadership.',
          cultureFit: -5,
          emotionalIntelligence: -5,
          pragmaticThinking: 10,
          reaction: 'Your colleague struggles alone. Others notice your lack of support, and team collaboration suffers.'
        }
      }
    },
    {
      id: 'diversity-inclusion',
      scenario: `During a team meeting, someone makes a comment that could be interpreted as insensitive to a particular group. No one else seems to notice, but you're concerned about the impact.`,
      question: 'Should you address the comment to promote inclusivity?',
      teamHint: 'Carlos from DEI says: "Addressing bias privately often has more impact than public confrontation."',
      options: {
        yes: {
          feedback: 'You promote an inclusive environment, but timing and approach matter for effective communication.',
          cultureFit: 15,
          emotionalIntelligence: 10,
          pragmaticThinking: 0,
          reaction: 'The team becomes more aware of inclusive language. Some appreciate your courage, others feel defensive about their choice of words.'
        },
        no: {
          feedback: 'You avoid potential conflict, but miss an opportunity to create a more inclusive workplace culture.',
          cultureFit: -5,
          emotionalIntelligence: -5,
          pragmaticThinking: 5,
          reaction: 'The comment goes unaddressed. Team members from affected groups notice the silence and feel less supported.'
        }
      }
    },
    {
      id: 'workplace-gossip',
      scenario: `You overhear colleagues gossiping about another team member's personal life during lunch. They're sharing details that seem private and potentially harmful.`,
      question: 'Should you intervene to stop the gossip?',
      teamHint: 'Nina from Workplace Culture says: "Gossip creates toxic environments. Address it directly but tactfully."',
      options: {
        yes: {
          feedback: 'You demonstrate integrity and respect for privacy, but direct confrontation might create tension.',
          cultureFit: 10,
          emotionalIntelligence: 15,
          pragmaticThinking: -5,
          reaction: 'The gossiping stops, but some colleagues become defensive. The targeted person later thanks you privately.'
        },
        no: {
          feedback: 'You avoid conflict, but allowing gossip can damage team trust and create a toxic environment.',
          cultureFit: -10,
          emotionalIntelligence: -5,
          pragmaticThinking: 0,
          reaction: 'The gossip continues and spreads. Team morale suffers as people become wary of sharing personal information.'
        }
      }
    },
    {
      id: 'client-request',
      scenario: `A client asks you to complete a task that's outside your job description and expertise. They're a valuable client, but you're already overwhelmed with your own work.`,
      question: 'Should you take on the extra work to please the client?',
      teamHint: 'Patricia from Client Success says: "Know your limits and suggest the right person for the job."',
      options: {
        yes: {
          feedback: 'You show client service dedication, but overextending yourself can lead to poor quality work and burnout.',
          cultureFit: 5,
          emotionalIntelligence: 0,
          pragmaticThinking: -10,
          reaction: 'The client is pleased, but your other work suffers. Your manager notices the quality decline.'
        },
        no: {
          feedback: 'You maintain professional boundaries and suggest appropriate alternatives, showing both respect and resourcefulness.',
          cultureFit: 10,
          emotionalIntelligence: 10,
          pragmaticThinking: 15,
          reaction: 'You suggest a colleague who specializes in that area. The client appreciates your honesty and gets better service.'
        }
      }
    },
    {
      id: 'team-recognition',
      scenario: `Your team completes a major project successfully, but your manager only recognizes you publicly for the achievement, even though it was a team effort.`,
      question: 'Should you correct your manager and give credit to the team?',
      teamHint: 'Kevin from Team Leadership says: "Sharing credit builds stronger teams and shows true leadership."',
      options: {
        yes: {
          feedback: 'You demonstrate leadership and team appreciation, which builds trust and loyalty among colleagues.',
          cultureFit: 15,
          emotionalIntelligence: 10,
          pragmaticThinking: 5,
          reaction: 'Your teammates appreciate the recognition. Your manager learns to acknowledge team efforts more inclusively.'
        },
        no: {
          feedback: 'You accept the credit, but this damages team relationships and creates resentment.',
          cultureFit: -10,
          emotionalIntelligence: -5,
          pragmaticThinking: 0,
          reaction: 'Your teammates feel undervalued and become less motivated to collaborate on future projects.'
        }
      }
    }
  ];

  const startGame = () => {
    // Shuffle the questions array
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);
    
    setGameState('playing');
    setShuffledQuestions(shuffledQuestions);
    setCurrentQuestion(shuffledQuestions[0]);
    setGameStats(prev => ({
      ...prev,
      currentQuestion: 0,
      totalQuestions: shuffledQuestions.length
    }));
  };

  const handleAnswer = (answer: 'yes' | 'no') => {
    if (!currentQuestion) return;

    setUserAnswer(answer);
    const result = currentQuestion.options[answer];
    
    setGameStats(prev => ({
      ...prev,
      cultureFit: Math.max(0, Math.min(100, prev.cultureFit + result.cultureFit)),
      emotionalIntelligence: Math.max(0, Math.min(100, prev.emotionalIntelligence + result.emotionalIntelligence)),
      pragmaticThinking: Math.max(0, Math.min(100, prev.pragmaticThinking + result.pragmaticThinking)),
      score: prev.score + (result.cultureFit + result.emotionalIntelligence + result.pragmaticThinking),
      currentQuestion: prev.currentQuestion + 1,
      isCompleted: prev.currentQuestion + 1 >= shuffledQuestions.length
    }));

    setShowFeedback(true);
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    setUserAnswer(null);
    setShowTeamHint(false);
    
    const nextQuestionIndex = gameStats.currentQuestion;
    if (nextQuestionIndex < shuffledQuestions.length) {
      setCurrentQuestion(shuffledQuestions[nextQuestionIndex]);
    } else {
      setGameState('finished');
    }
  };

  const finishGame = () => {
    setGameState('finished');
    setShowFeedback(false);
  };

  const restartGame = () => {
    setGameState('menu');
    setCurrentQuestion(null);
    setUserAnswer(null);
    setShowFeedback(false);
    setGameStats({
      score: 0,
      cultureFit: 50,
      emotionalIntelligence: 50,
      pragmaticThinking: 50,
      currentQuestion: 0,
      totalQuestions: questions.length,
      isCompleted: false
    });
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: 'Excellent', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (score >= 60) return { level: 'Good', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
    if (score >= 40) return { level: 'Fair', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
    return { level: 'Needs Improvement', color: 'text-red-400', bgColor: 'bg-red-500/20' };
  };

  const getJudgmentLevel = (answer: 'yes' | 'no', currentQuestion: Question) => {
    const option = currentQuestion.options[answer];
    const totalScore = option.cultureFit + option.emotionalIntelligence + option.pragmaticThinking;
    
    if (totalScore >= 20) {
      return { 
        level: 'Excellent Judgment', 
        icon: <Smile className="h-8 w-8 text-green-400" />,
        color: 'text-green-400'
      };
    } else if (totalScore >= 10) {
      return { 
        level: 'Good Judgment', 
        icon: <Smile className="h-8 w-8 text-yellow-400" />,
        color: 'text-yellow-400'
      };
    } else if (totalScore >= 0) {
      return { 
        level: 'Fair Judgment', 
        icon: <Frown className="h-8 w-8 text-orange-400" />,
        color: 'text-orange-400'
      };
    } else {
      return { 
        level: 'Poor Judgment', 
        icon: <Frown className="h-8 w-8 text-red-400" />,
        color: 'text-red-400'
      };
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
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => {
                  if (gameState === 'playing') {
                    setShowExitDialog(true);
                  } else {
                    router.push('/career-tools/games');
                  }
                }}
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Scale className="h-12 w-12 text-green-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">The Right Choice</h1>
                  <p className="text-gray-400">Make judgment calls in workplace scenarios</p>
                </div>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {gameState === 'menu' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="max-w-4xl mx-auto text-center space-y-8"
              >
                <Card className="glass-card border-white/10">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-center mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mr-4">
                        <Scale className="w-8 h-8 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold gradient-text mb-2">
                          Welcome to The Right Choice!
                        </CardTitle>
                        <CardDescription className="text-gray-300 text-lg">
                          Master workplace judgment and cultural awareness
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="text-gray-300 space-y-6 text-left max-w-3xl mx-auto">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-green-400" />
                          How to Play
                        </h3>
                        <ul className="space-y-3 text-sm">
                          <li className="flex items-start">
                            <span className="text-green-400 mr-3 mt-0.5 text-lg">🏢</span>
                            <span>Experience realistic workplace scenarios from The Internship movie</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-3 mt-0.5 text-lg">🤔</span>
                            <span>Make judgment calls with only Yes or No options</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-3 mt-0.5 text-lg">🎯</span>
                            <span>See immediate feedback on your professional judgment</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-3 mt-0.5 text-lg">⏰</span>
                            <span>Complete the challenge in under 2 minutes</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-3 mt-0.5 text-lg">🏆</span>
                            <span>Earn points for cultural awareness and workplace ethics</span>
                          </li>
                          <li className="flex items-start">
                            <span className="text-green-400 mr-3 mt-0.5 text-lg">📊</span>
                            <span>Get detailed feedback on your professional judgment skills</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-green-400 text-lg">🏢</span>
                            <h4 className="text-white font-semibold">Cultural Awareness</h4>
                          </div>
                          <p className="text-gray-300 text-sm">Learn to navigate workplace dynamics and understand cultural boundaries!</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-green-400 text-lg">⚖️</span>
                          <h4 className="text-white font-semibold">Workplace Ethics</h4>
                          </div>
                          <p className="text-gray-300 text-sm">Develop professional judgment and understand workplace boundaries!</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg py-6 h-14"
                      onClick={startGame}
                    >
                      <Play className="h-6 w-6 mr-3" />
                      Start Challenge
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {gameState === 'playing' && currentQuestion && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="min-h-screen flex flex-col overflow-y-auto"
              >
                {/* Question Display */}
                <div className="flex flex-col justify-center items-center p-4 md:p-8 pt-12">
                  {/* Question Card */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-6xl"
                  >
                    {/* Scenario Card */}
                    <Card className="glass-card border-white/10 mb-8">
                      <CardHeader className="pb-8">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-3 text-white text-2xl">
                            <Building className="h-8 w-8 text-green-400" />
                            The Scenario
                          </CardTitle>
                          <span className="text-white font-semibold">
                            Scenario {gameStats.currentQuestion + 1} of {gameStats.totalQuestions}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-8">
                        {/* Scenario */}
                        <div 
                          className="bg-white/5 rounded-xl p-6 md:p-8 border border-white/10"
                          onCopy={(e: React.ClipboardEvent) => e.preventDefault()}
                          onCut={(e: React.ClipboardEvent) => e.preventDefault()}
                          onPaste={(e: React.ClipboardEvent) => e.preventDefault()}
                          onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
                          onDragStart={(e: React.DragEvent) => e.preventDefault()}
                          style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
                        >
                          <div className="flex items-start gap-4 mb-6">
                            <User className="h-8 w-8 text-cyan-400 mt-1" />
                            <div>
                              <p className="text-white font-medium mb-3 text-lg">Your teammate says:</p>
                              <p className="text-gray-300 italic text-lg md:text-xl leading-relaxed">"{currentQuestion.scenario}"</p>
                            </div>
                          </div>
                        </div>

                        {/* Question */}
                        <div className="text-center">
                          <h3 className="text-3xl md:text-4xl font-bold text-white mb-8">
                            {currentQuestion.question}
                          </h3>
                          
                          {/* Answer Options */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Button
                              onClick={() => handleAnswer('yes')}
                              disabled={userAnswer !== null}
                              className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-xl shadow-green-500/30 transition-all duration-300 disabled:opacity-50 text-xl font-bold"
                            >
                              <CheckCircle className="w-8 h-8 mr-3" />
                              Yes
                            </Button>
                            <Button
                              onClick={() => handleAnswer('no')}
                              disabled={userAnswer !== null}
                              className="h-20 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-xl shadow-red-500/30 transition-all duration-300 disabled:opacity-50 text-xl font-bold"
                            >
                              <X className="w-8 h-8 mr-3" />
                              No
                            </Button>
                          </div>

                          {/* Team Consultation */}
                          {currentQuestion.teamHint && (
                            <div className="mt-6">
                              <Button
                                onClick={() => setShowTeamHint(!showTeamHint)}
                                variant="outline"
                                className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Ask Team for Help
                              </Button>
                              
                              {showTeamHint && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30"
                                >
                                  <p className="text-green-300 text-sm italic">💡 {currentQuestion.teamHint}</p>
                                </motion.div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Feedback Modal */}
                <AnimatePresence>
                  {showFeedback && userAnswer && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    >
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="max-w-4xl w-full mx-4"
                      >
                        <Card className="glass-card border-white/10">
                          <CardHeader className="pb-6">
                            <CardTitle className="flex items-center gap-3 text-white text-2xl">
                              {userAnswer && currentQuestion && getJudgmentLevel(userAnswer, currentQuestion).icon}
                              <span className={userAnswer && currentQuestion ? getJudgmentLevel(userAnswer, currentQuestion).color : 'text-white'}>
                                {userAnswer && currentQuestion ? getJudgmentLevel(userAnswer, currentQuestion).level : 'Judgment'}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-8">
                            {/* Reaction */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                              <p className="text-gray-300 italic text-lg leading-relaxed">
                                "{currentQuestion.options[userAnswer].reaction}"
                              </p>
                            </div>

                            {/* Feedback */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                              <h4 className="text-white font-medium mb-3 text-lg">Feedback:</h4>
                              <p className="text-gray-300 text-lg leading-relaxed">
                                {currentQuestion.options[userAnswer].feedback}
                              </p>
                            </div>

                            {/* Score Impact */}
                            <div className="grid grid-cols-3 gap-6">
                              <div className="text-center p-4 bg-white/5 rounded-lg">
                                <h4 className="text-white font-medium text-base mb-2">Culture Fit</h4>
                                <p className={`text-lg font-bold ${currentQuestion.options[userAnswer].cultureFit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {currentQuestion.options[userAnswer].cultureFit >= 0 ? '+' : ''}{currentQuestion.options[userAnswer].cultureFit}
                                </p>
                              </div>
                              <div className="text-center p-4 bg-white/5 rounded-lg">
                                <h4 className="text-white font-medium text-base mb-2">Emotional Intelligence</h4>
                                <p className={`text-lg font-bold ${currentQuestion.options[userAnswer].emotionalIntelligence >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {currentQuestion.options[userAnswer].emotionalIntelligence >= 0 ? '+' : ''}{currentQuestion.options[userAnswer].emotionalIntelligence}
                                </p>
                              </div>
                              <div className="text-center p-4 bg-white/5 rounded-lg">
                                <h4 className="text-white font-medium text-base mb-2">Pragmatic Thinking</h4>
                                <p className={`text-lg font-bold ${currentQuestion.options[userAnswer].pragmaticThinking >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {currentQuestion.options[userAnswer].pragmaticThinking >= 0 ? '+' : ''}{currentQuestion.options[userAnswer].pragmaticThinking}
                                </p>
                              </div>
                            </div>

                            <Button
                              onClick={gameStats.isCompleted ? finishGame : nextQuestion}
                              className="w-full h-14 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-lg font-bold"
                            >
                              {gameStats.isCompleted ? 'View Results' : 'Next Question'}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {gameState === 'finished' && (
              <motion.div
                key="finished"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto"
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-6">
                    <Trophy className="h-12 w-12 text-yellow-400 mr-4" />
                    <div>
                      <h1 className="text-4xl font-bold gradient-text">Challenge Complete!</h1>
                      <p className="text-gray-400">Here's how you performed</p>
                    </div>
                  </div>
                </div>

                {/* Results Card */}
                <Card className="glass-card border-white/10 mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Award className="h-5 w-5 text-yellow-400" />
                      Your Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Overall Score */}
                    <div className="text-center p-6 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-2">Overall Performance</h3>
                      <div className={`text-3xl font-bold mb-2 ${getScoreLevel(gameStats.score).color}`}>
                        {getScoreLevel(gameStats.score).level}
                      </div>
                      <p className="text-gray-400 text-sm">Score: {gameStats.score}</p>
                    </div>

                    {/* Skill Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="text-white font-medium mb-2">Culture Fit</h4>
                        <div className="text-2xl font-bold text-purple-400 mb-2">{gameStats.cultureFit}</div>
                        <Progress value={gameStats.cultureFit} className="h-2" />
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="text-white font-medium mb-2">Emotional Intelligence</h4>
                        <div className="text-2xl font-bold text-cyan-400 mb-2">{gameStats.emotionalIntelligence}</div>
                        <Progress value={gameStats.emotionalIntelligence} className="h-2" />
                      </div>
                      <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                        <h4 className="text-white font-medium mb-2">Pragmatic Thinking</h4>
                        <div className="text-2xl font-bold text-green-400 mb-2">{gameStats.pragmaticThinking}</div>
                        <Progress value={gameStats.pragmaticThinking} className="h-2" />
                      </div>
                    </div>

                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => router.push('/career-tools/games')}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Main Menu
                  </Button>
                  <Button
                    onClick={() => {
                      // Share functionality
                      if (navigator.share) {
                        navigator.share({
                          title: 'My Right Choice Game Results',
                          text: `I achieved ${gameStats.score} points with ${getScoreLevel(gameStats.score).level} performance!`,
                          url: window.location.href
                        });
                      } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(`My Right Choice Game Results: ${gameStats.score} points with ${getScoreLevel(gameStats.score).level} performance!`);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    onClick={restartGame}
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Take Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Exit Dialog */}
          <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <AlertDialogContent className="bg-black border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Exit Game</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  Are you sure you want to exit the game? This will take you back to the main menu and you'll lose your current progress.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => router.push('/career-tools/games')} className="bg-red-600 hover:bg-red-700 text-white">
                  Exit Game
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
} 
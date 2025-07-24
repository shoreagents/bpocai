'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Brain,
  Keyboard,
  MessageSquare,
  PuzzleIcon,
  Clock,
  Play,
  Target,
  Users,
  Zap,
  Trophy,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SkillsAssessmentPage() {
  const router = useRouter();
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const assessments = [
    {
      id: 'typing-speed-test',
      title: 'Typing Speed Test',
      description: 'Progressive typing assessment with 4 difficulty levels. From simple words to programming syntax.',
      icon: Keyboard,
      difficulty: 'Progressive',
      category: 'Technical Skills',
      duration: '4 levels',
      difficultyColor: 'bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent border-cyan-500/30',
      categoryColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      skillsAssessed: ['Typing Speed (WPM)', 'Accuracy %', 'Technical Terms', 'Programming Syntax'],
      participants: 8764,
      rating: 4.8
    },
    {
      id: 'disc-personality',
      title: 'DISC Personality Assessment',
      description: 'Discover your work style and personality type. Essential for job matching and team placement.',
      icon: Brain,
      difficulty: 'Intermediate',
      category: 'Personality',
      duration: '15 minutes',
      difficultyColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      categoryColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      skillsAssessed: ['Dominance', 'Influence', 'Steadiness', 'Conscientiousness'],
      participants: 2789,
      rating: 4.8
    },
    {
      id: 'communication-skills',
      title: 'Communication Skills Test',
      description: 'Test your English proficiency, grammar, and customer service communication abilities.',
      icon: MessageSquare,
      difficulty: 'Intermediate',
      category: 'Communication',
      duration: '12 minutes',
      difficultyColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      categoryColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      skillsAssessed: ['Grammar & Vocabulary', 'Email Writing', 'Customer Responses'],
      participants: 1956,
      rating: 4.7
    },
    {
      id: 'logical-reasoning',
      title: 'Logical Reasoning Test',
      description: 'Evaluate your problem-solving and analytical thinking skills for technical support roles.',
      icon: PuzzleIcon,
      difficulty: 'Advanced',
      category: 'Cognitive',
      duration: '20 minutes',
      difficultyColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      categoryColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      skillsAssessed: ['Pattern Recognition', 'Problem Solving', 'Logical Analysis'],
      participants: 1203,
      rating: 4.9
    }
  ];

  const handleStartTest = (testId: string) => {
    setSelectedTest(testId);
    
    // Navigate to the specific assessment page
    const routeMap: { [key: string]: string } = {
      'typing-speed-test': '/career-tools/assessments/typing-speed-test',
      'disc-personality': '/career-tools/assessments/disc-personality',
      'communication-skills': '/career-tools/assessments/communication-skills',
      'logical-reasoning': '/career-tools/assessments/logical-reasoning'
    };
    
    const route = routeMap[testId];
    if (route) {
      router.push(route);
    } else {
      console.log(`Starting assessment: ${testId}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-16">
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
                onClick={() => router.back()}
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Target className="h-12 w-12 text-cyan-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Skills Assessment</h1>
                  <p className="text-gray-400">Industry-standard tests used by major BPO companies</p>
                </div>
              </div>
            </div>
          </motion.div>



          {/* Assessments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-8">
            {assessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (index * 0.1) }}
                className="group"
              >
                <Card className="glass-card border-white/10 hover:border-white/20 h-full transition-all duration-300 group-hover:scale-105 relative overflow-hidden">
                  {/* Icon in top right */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <assessment.icon className="w-5 h-5 text-gray-400" />
                  </div>

                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl text-white pr-12 mb-2">
                      {assessment.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-sm leading-relaxed mb-4">
                      {assessment.description}
                    </CardDescription>

                    {/* Difficulty and Category Badges */}
                    <div className="flex gap-2 mb-4">
                      <Badge className={assessment.difficultyColor}>
                        {assessment.difficulty}
                      </Badge>
                      <Badge className={assessment.categoryColor}>
                        {assessment.category}
                      </Badge>
                      <Badge className="bg-white/10 text-gray-300 border-white/20 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {assessment.duration}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Skills Assessed */}
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Skills Assessed:</h4>
                      <div className="flex flex-wrap gap-1">
                        {assessment.skillsAssessed.map((skill, skillIndex) => (
                          <Badge 
                            key={skillIndex}
                            variant="secondary"
                            className="bg-gray-800 text-gray-300 border-gray-700 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-4 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{assessment.participants.toLocaleString()} completed</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>{assessment.rating} rating</span>
                        </div>
                      </div>
                    </div>

                    {/* Start Test Button */}
                    <Button 
                      className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-0 shadow-lg shadow-cyan-500/25 transition-all duration-300 group-hover:shadow-xl"
                      onClick={() => handleStartTest(assessment.id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Assessment
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="glass-card border-white/10 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Trophy className="w-5 h-5 text-red-400" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-gray-500" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Complete assessments to earn skill badges and certifications!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Your Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="glass-card border-white/10 h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Assessments Completed:</span>
                    <span className="text-white font-medium">0 / 4</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Skill Badges Earned:</span>
                    <span className="text-white font-medium">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">BPO Readiness:</span>
                    <span className="text-yellow-400 font-medium">Start Testing</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
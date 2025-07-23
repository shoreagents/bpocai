'use client'

import { motion } from 'framer-motion'
import Header from '@/components/layout/Header'
import Hero from '@/components/sections/Hero'

import DatabaseStatus from '@/components/debug/DatabaseStatus'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowRight,
  FileText,
  BrainIcon,
  GamepadIcon,
  Trophy,
  Users,
  Target,
  TrendingUp,
  Star,
  Quote,
  CheckCircle,
  Sparkles,
  Globe,
  Shield,
  Zap,
  MessageSquare,
  Calculator,

  BarChart,
  X
} from 'lucide-react'
import { 

  platformStats 
} from '@/lib/data'
import { formatNumber } from '@/lib/utils'

export default function HomePage() {
  return (
    <main className="bg-black text-white">
      <Header />
      
      <Hero />


      {/* Database Status Debug Section */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 bg-red-900/10 border-y border-red-500/20">
        <div className="container mx-auto flex justify-center">
          <DatabaseStatus />
        </div>
      </section>


      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to 
              <span className="gradient-text"> Succeed in BPO</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our comprehensive platform combines AI technology with industry expertise 
              to accelerate your BPO career journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: FileText,
                title: 'AI Resume Builder',
                description: 'Create professional resumes with real-time AI analysis and industry-specific templates.',
                color: 'text-red-400',
                bgColor: 'bg-red-500/10',
                features: ['AI Analysis', 'BPO Templates', 'Real-time Scoring']
              },
              {
                icon: BrainIcon,
                title: 'Career Assessments',
                description: 'Comprehensive tests covering typing, personality, logic, and industry-specific skills.',
                color: 'text-cyan-400',
                bgColor: 'bg-cyan-500/10',
                features: ['DISC Personality', 'Typing Test', 'Logic Assessment']
              },
              {
                icon: Target,
                title: 'Job Matching',
                description: 'Smart AI-powered job matching that connects you with the perfect BPO opportunities.',
                color: 'text-purple-400',
                bgColor: 'bg-purple-500/10',
                features: ['Smart Matching', 'Skill Analysis', 'Company Fit']
              },
              {
                icon: MessageSquare,
                title: 'Interview Prep',
                description: 'Practice with AI-powered mock interviews and get personalized feedback.',
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
                features: ['Mock Interviews', 'AI Feedback', 'BPO Scenarios']
              },
              {
                icon: Calculator,
                title: 'Salary Calculator',
                description: 'Get accurate salary estimates based on your skills, experience, and location.',
                color: 'text-yellow-400',
                bgColor: 'bg-yellow-500/10',
                features: ['Market Data', 'Skill Premium', 'Location Analysis']
              },
              {
                icon: BarChart,
                title: 'Career Growth',
                description: 'Track your progress and discover personalized career advancement paths.',
                color: 'text-indigo-400',
                bgColor: 'bg-indigo-500/10',
                features: ['Progress Tracking', 'Skill Roadmap', 'Career Paths']
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-card border-white/10 h-full hover:border-white/20 transition-all duration-300 group">
                  <CardHeader>
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {feature.features.map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Why Choose BPOC.AI Section */}

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">

              Why Choose <span className="gradient-text">BPOC.AI</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how we compare to traditional job platforms and other career tools.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Traditional Job Sites */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
                              <Card className="glass-card border-white/10 h-full">
                  <CardHeader className="text-center pb-3">
                    <CardTitle className="text-xl text-white mb-0">Traditional Job Sites</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Generic resume templates</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">No BPO-specific guidance</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Limited career tools</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">No AI-powered insights</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Generic job matching</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* BPOC.AI - Center Column with Recommendation Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              {/* Recommended Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-1 text-xs font-semibold">
                  RECOMMENDED
                </Badge>
              </div>
              
              <Card className="glass-card border-red-500/30 h-full relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-purple-500/5 rounded-xl"></div>
                
                <CardHeader className="text-center pb-3 relative z-10">
                  <CardTitle className="text-xl text-white mb-0">BPOC.AI</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 relative z-10">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">AI-powered resume builder</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">BPO-specific optimization</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Comprehensive career tools</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">AI insights & recommendations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Smart job matching</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Other Career Tools */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
                              <Card className="glass-card border-white/10 h-full">
                  <CardHeader className="text-center pb-3">
                    <CardTitle className="text-xl text-white mb-0">Other Career Tools</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Not BPO-focused</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Expensive subscriptions</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Limited Filipino context</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">No job matching</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <X className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">Generic advice</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </section>


      {/* How It Works Section */}

      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">

              How It <span className="text-red-500">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get your dream BPO job in just 4 simple steps with our AI-powered platform.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center relative"
            >
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                1
              </div>
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Upload Your Resume</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Upload your existing resume or start from scratch with our AI-powered builder.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center relative"
            >
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                2
              </div>
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
                  <BrainIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Analysis</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Our AI analyzes your resume and provides personalized recommendations.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center relative"
            >
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                3
              </div>
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Optimize & Improve</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Address red flags, fill gaps, and optimize for BPO industry standards.
              </p>
            </motion.div>

            {/* Step 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center relative"
            >
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                4
              </div>
              <div className="mb-6">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Land Your Dream Job</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Apply with confidence and get matched with the best BPO opportunities.
              </p>
            </motion.div>
          </div>

          {/* Bottom divider line */}
          <div className="mt-16">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>

          </div>
        </div>
      </section>


            {/* Success Stories */}

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">Success</span> Stories
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">

              See how BPOC.AI has helped thousands of Filipino BPO professionals advance their careers.
            </p>
          </motion.div>

          {/* Testimonial Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {/* Maria Santos */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="glass-card border-white/10 h-full p-6 min-h-[200px]">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-base">MS</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">Maria Santos</h3>
                    <p className="text-sm text-gray-400">Customer Service Representative at Accenture</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-gray-300 italic leading-relaxed text-base">
                  "BPOC.AI helped me create a professional resume that highlighted my BPO experience. I got hired within 2 weeks!"
                </blockquote>
              </Card>
            </motion.div>

            {/* John Dela Cruz */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-white/10 h-full p-6 min-h-[200px]">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-base">JDC</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">John Dela Cruz</h3>
                    <p className="text-sm text-gray-400">Team Lead at Concentrix</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-gray-300 italic leading-relaxed text-base">
                  "The AI analysis identified gaps in my resume that I never noticed. After addressing them, I got promoted to Team Lead."
                </blockquote>
              </Card>
            </motion.div>

            {/* Ana Rodriguez */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-white/10 h-full p-6 min-h-[200px]">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-black font-bold text-base">AR</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base">Ana Rodriguez</h3>
                    <p className="text-sm text-gray-400">Quality Analyst at TelePerformance</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <blockquote className="text-gray-300 italic leading-relaxed text-base">
                  "The salary calculator helped me negotiate better pay. I'm now earning 30% more than my previous role."
                </blockquote>
              </Card>
            </motion.div>
          </div>

          {/* Statistics */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}

            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <div>
              <div className="text-2xl md:text-3xl font-bold text-cyan-400 mb-2">10,000+</div>
              <div className="text-sm text-gray-400">Happy Users</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-green-400 mb-2">95%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-2">500+</div>
              <div className="text-sm text-gray-400">Companies</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-yellow-400 mb-2">4.9/5</div>
              <div className="text-sm text-gray-400">User Rating</div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-900/20 to-purple-900/20">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium mb-8">
                <Zap className="w-4 h-4 mr-2" />
                Ready to Transform Your Career?
              </div>
            </motion.div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Start Your Journey 
              <span className="gradient-text"> Today </span>
              
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Join thousands of Filipino BPO professionals who have already transformed their careers with BPOC.AI. It's completely free to get started.

            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-lg shadow-red-500/25 text-lg px-8 py-4"
              >

                Build Your Resume Now 

                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 bg-transparent text-lg px-8 py-4"
              >

                Create Free Account
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400">{formatNumber(platformStats.hiddenFees)}% Free</div>
                <div className="text-sm text-gray-400">No hidden fees</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{formatNumber(platformStats.minutes)} Minutes</div>
                <div className="text-sm text-gray-400">To get started</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">Instant</div>
                <div className="text-sm text-gray-400">AI analysis</div>

              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 glass-card flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xl font-bold gradient-text">BPOC.AI</div>
                  <div className="text-xs text-gray-400">Where BPO Careers Begin</div>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Revolutionizing BPO recruitment with AI-powered tools for Filipino professionals.
              </p>
              <div className="flex items-center space-x-4">
                <Globe className="w-5 h-5 text-cyan-400" />
                <Shield className="w-5 h-5 text-green-400" />
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Platform</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">Resume Builder</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">Assessments</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">Career Games</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">Job Matching</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">Career Guide</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">Interview Tips</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">Salary Guide</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">Success Stories</a>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">About Us</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">Contact</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors block">Terms of Service</a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 BPOC.AI. All rights reserved. Built with ❤️ for Filipino BPO professionals.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

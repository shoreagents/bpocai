'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  Calculator,
  MapPin,
  Briefcase,
  GraduationCap,
  TrendingUp,
  DollarSign,
  Star,
  Users,
  Target,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FormData {
  experience: string;
  jobRole: string;
  location: string;
  education: string;
  skills: string[];
}

interface CalculatedSalary {
  monthly: number;
  annual: number;
  breakdown: {
    base: number;
    experienceBonus: number;
    locationAdjustment: number;
    educationBonus: number;
    skillBonus: number;
  };
}

export default function SalaryCalculatorPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData>({
    experience: '',
    jobRole: '',
    location: '',
    education: '',
    skills: []
  });

  const [calculatedSalary, setCalculatedSalary] = useState<CalculatedSalary | null>(null);

  const experienceLevels = [
    { value: 'entry', label: 'Entry Level (0-1 years)', multiplier: 1.0 },
    { value: 'junior', label: 'Junior Level (1-3 years)', multiplier: 1.3 },
    { value: 'mid', label: 'Mid Level (3-5 years)', multiplier: 1.6 },
    { value: 'senior', label: 'Senior Level (5+ years)', multiplier: 2.0 }
  ];

  const jobRoles = [
    { value: 'customer-service', label: 'Customer Service Representative', baseSalary: 25000 },
    { value: 'technical-support', label: 'Technical Support Specialist', baseSalary: 32000 },
    { value: 'sales-associate', label: 'Sales Associate', baseSalary: 28000 },
    { value: 'data-entry', label: 'Data Entry Specialist', baseSalary: 22000 },
    { value: 'virtual-assistant', label: 'Virtual Assistant', baseSalary: 24000 },
    { value: 'content-moderator', label: 'Content Moderator', baseSalary: 26000 }
  ];

  const locations = [
    { value: 'metro-manila', label: 'Metro Manila', multiplier: 1.2 },
    { value: 'cebu', label: 'Cebu', multiplier: 1.0 },
    { value: 'davao', label: 'Davao', multiplier: 0.9 },
    { value: 'clark-pampanga', label: 'Clark, Pampanga', multiplier: 1.1 },
    { value: 'baguio', label: 'Baguio', multiplier: 0.95 },
    { value: 'iloilo', label: 'Iloilo', multiplier: 0.85 }
  ];

  const educationLevels = [
    { value: 'high-school', label: 'High School Graduate', multiplier: 1.0 },
    { value: 'college-undergrad', label: 'College Undergraduate', multiplier: 1.1 },
    { value: 'college-graduate', label: 'College Graduate', multiplier: 1.25 },
    { value: 'masters', label: 'Masters Degree', multiplier: 1.4 }
  ];

  const skillOptions = [
    { value: 'bilingual', label: 'Bilingual (English/Filipino)', bonus: 3000 },
    { value: 'third-language', label: 'Third Language', bonus: 5000 },
    { value: 'technical-skills', label: 'Technical Skills', bonus: 4000 },
    { value: 'leadership', label: 'Leadership Experience', bonus: 6000 },
    { value: 'certifications', label: 'Industry Certifications', bonus: 3500 },
    { value: 'software-proficiency', label: 'Software Proficiency', bonus: 2500 }
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    calculateSalary(newFormData);
  };

  const handleSkillToggle = (skillValue: string) => {
    const newSkills = formData.skills.includes(skillValue)
      ? formData.skills.filter(s => s !== skillValue)
      : [...formData.skills, skillValue];
    
    const newFormData = { ...formData, skills: newSkills };
    setFormData(newFormData);
    calculateSalary(newFormData);
  };

  const calculateSalary = (data: FormData) => {
    if (!data.experience || !data.jobRole || !data.location || !data.education) {
      setCalculatedSalary(null);
      return;
    }

    const jobRole = jobRoles.find(role => role.value === data.jobRole);
    const experience = experienceLevels.find(exp => exp.value === data.experience);
    const location = locations.find(loc => loc.value === data.location);
    const education = educationLevels.find(edu => edu.value === data.education);

    if (!jobRole || !experience || !location || !education) {
      setCalculatedSalary(null);
      return;
    }

    let baseSalary = jobRole.baseSalary;
    let totalSalary = baseSalary * experience.multiplier * location.multiplier * education.multiplier;

    // Add skill bonuses
    const skillBonus = data.skills.reduce((total, skillValue) => {
      const skill = skillOptions.find(s => s.value === skillValue);
      return total + (skill ? skill.bonus : 0);
    }, 0);

    totalSalary += skillBonus;

    const monthlySalary = Math.round(totalSalary / 12);
    const annualSalary = Math.round(totalSalary);

    setCalculatedSalary({
      monthly: monthlySalary,
      annual: annualSalary,
      breakdown: {
        base: Math.round(baseSalary),
        experienceBonus: Math.round(baseSalary * (experience.multiplier - 1)),
        locationAdjustment: Math.round(baseSalary * experience.multiplier * (location.multiplier - 1)),
        educationBonus: Math.round(baseSalary * experience.multiplier * location.multiplier * (education.multiplier - 1)),
        skillBonus: skillBonus
      }
    });
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
                onClick={() => router.back()}
                className="mr-4 text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
              </Button>
              <div className="flex items-center">
                <Calculator className="h-12 w-12 text-yellow-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Salary Calculator</h1>
                  <p className="text-gray-400">Get accurate salary estimates for BPO positions</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="w-5 h-5 text-yellow-400" />
                    Calculate Your Salary
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Fill in your details to get an accurate salary estimate
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Experience Level */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Experience Level
                    </label>
                    <select
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    >
                      <option value="">Select experience level</option>
                      {experienceLevels.map(level => (
                        <option key={level.value} value={level.value} className="bg-gray-800">
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Job Role */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Job Role
                    </label>
                    <select
                      value={formData.jobRole}
                      onChange={(e) => handleInputChange('jobRole', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    >
                      <option value="">Select job role</option>
                      {jobRoles.map(role => (
                        <option key={role.value} value={role.value} className="bg-gray-800">
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Location
                    </label>
                    <select
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    >
                      <option value="">Select location</option>
                      {locations.map(location => (
                        <option key={location.value} value={location.value} className="bg-gray-800">
                          {location.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Education */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Education Level
                    </label>
                    <select
                      value={formData.education}
                      onChange={(e) => handleInputChange('education', e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:border-yellow-400 focus:outline-none"
                    >
                      <option value="">Select education level</option>
                      {educationLevels.map(education => (
                        <option key={education.value} value={education.value} className="bg-gray-800">
                          {education.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skills */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Additional Skills
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {skillOptions.map(skill => (
                        <label key={skill.value} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.skills.includes(skill.value)}
                            onChange={() => handleSkillToggle(skill.value)}
                            className="rounded border-white/20 bg-white/10 text-yellow-400 focus:ring-yellow-400"
                          />
                          <span className="text-gray-300 text-sm">{skill.label}</span>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            +₱{skill.bonus.toLocaleString()}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-white/10 sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Salary Estimate
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Based on current market data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {calculatedSalary ? (
                    <div className="space-y-6">
                      {/* Main Salary Display */}
                      <div className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                        <div className="text-3xl font-bold text-white mb-2">
                          ₱{calculatedSalary.monthly.toLocaleString()}
                        </div>
                        <div className="text-yellow-400 font-medium">Monthly Salary</div>
                        <div className="text-gray-300 text-sm mt-1">
                          ₱{calculatedSalary.annual.toLocaleString()} annually
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="space-y-3">
                        <h4 className="text-white font-medium">Salary Breakdown:</h4>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Base Salary:</span>
                            <span className="text-white">₱{calculatedSalary.breakdown.base.toLocaleString()}</span>
                          </div>
                          
                          {calculatedSalary.breakdown.experienceBonus > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Experience Bonus:</span>
                              <span className="text-green-400">+₱{calculatedSalary.breakdown.experienceBonus.toLocaleString()}</span>
                            </div>
                          )}
                          
                          {calculatedSalary.breakdown.locationAdjustment !== 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Location Adjustment:</span>
                              <span className={calculatedSalary.breakdown.locationAdjustment > 0 ? 'text-green-400' : 'text-red-400'}>
                                {calculatedSalary.breakdown.locationAdjustment > 0 ? '+' : ''}₱{calculatedSalary.breakdown.locationAdjustment.toLocaleString()}
                              </span>
                            </div>
                          )}
                          
                          {calculatedSalary.breakdown.educationBonus > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Education Bonus:</span>
                              <span className="text-green-400">+₱{calculatedSalary.breakdown.educationBonus.toLocaleString()}</span>
                            </div>
                          )}
                          
                          {calculatedSalary.breakdown.skillBonus > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-300">Skill Bonuses:</span>
                              <span className="text-green-400">+₱{calculatedSalary.breakdown.skillBonus.toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-white/10 pt-2">
                          <div className="flex justify-between font-medium">
                            <span className="text-white">Total Annual:</span>
                            <span className="text-yellow-400">₱{calculatedSalary.annual.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Market Info */}
                      <div className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-medium text-white">Market Insights</span>
                        </div>
                        <div className="space-y-1 text-xs text-gray-300">
                          <div className="flex justify-between">
                            <span>Industry Average:</span>
                            <span>₱{Math.round(calculatedSalary.annual * 0.95).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Top 25% Earn:</span>
                            <span>₱{Math.round(calculatedSalary.annual * 1.3).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Growth Potential:</span>
                            <span className="text-green-400">15-25% annually</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Calculator className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">
                        Fill in all fields to calculate your estimated salary
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 
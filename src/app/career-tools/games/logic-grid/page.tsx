'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Brain, 
  Target, 
  CheckCircle, 
  X, 
  Timer, 
  Lightbulb, 
  Play, 
  Star, 
  Trophy,
  Users,
  Building,
  Phone,
  Calendar,
  Clock,
  AlertTriangle,
  MessageSquare,
  Wrench,
  DollarSign,
  TrendingUp,
  FolderOpen,
  TestTube,
  Eye,
  Globe,
  MapPin,
  Shield,
  BarChart,
  Share
} from 'lucide-react';
import Header from '@/components/layout/Header';

type GridCell = {
  value: string;
  isCorrect: boolean;
  isSelected: boolean;
  isCrossed: boolean;
};

type GameState = 'menu' | 'difficulty' | 'playing' | 'completed' | 'failed';

type Puzzle = {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  description?: string;
  clues: string[];
  solution: Record<string, Record<string, string>>;
  gridLayouts: {
    title: string;
    description: string;
    rowItems: string[];
    colItems: string[];
    icon: string;
  }[];
  timeLimit: number;
  hints: number;
};

const PUZZLES: Puzzle[] = [
  // EASY PUZZLES - 2 unique puzzles
  {
    id: 'puzzle-1',
    difficulty: 'easy',
    title: 'Agent Shift Assignment',
    description: 'Match agents to their shifts and departments',
    clues: [
      'John works the morning shift',
      'Sarah works in the sales department',
      'Mike works the night shift',
      'The agent in customer service works the afternoon shift'
    ],
    solution: {
      'Agent to Shift': {
        'John': 'Morning',
        'Sarah': 'Afternoon', 
        'Mike': 'Night'
      },
      'Agent to Department': {
        'John': 'Sales',
        'Sarah': 'Customer Service',
        'Mike': 'Technical Support'
      }
    },
    gridLayouts: [
      {
        title: 'Who Works Which Shift?',
        description: 'Mark which agent works which shift. Click: Green = correct, Red = impossible.',
        rowItems: ['John', 'Sarah', 'Mike'],
        colItems: ['Morning', 'Night', 'Afternoon'],
        icon: 'Users'
      },
      {
        title: 'Who Works in Which Department?',
        description: 'Mark which agent works in which department. Click: Green = correct, Red = impossible.',
        rowItems: ['John', 'Sarah', 'Mike'],
        colItems: ['Sales', 'Customer Service', 'Technical Support'],
        icon: 'Building'
      }
    ],
    timeLimit: 90,
    hints: 4
  },
  {
    id: 'puzzle-1b',
    difficulty: 'easy',
    title: 'Team Project Assignment',
    description: 'Match team members to their roles and project phases',
    clues: [
      'Alex is the project manager',
      'Emma works on the development phase',
      'David is the team lead',
      'The QA tester works on the testing phase'
    ],
    solution: {
      'Member to Role': {
        'Alex': 'Project Manager',
        'Emma': 'Developer',
        'David': 'Team Lead'
      },
      'Member to Phase': {
        'Alex': 'Planning',
        'Emma': 'Development',
        'David': 'Testing'
      }
    },
    gridLayouts: [
      {
        title: 'Who Has Which Role?',
        description: 'Mark which team member has which role. Click: Green = correct, Red = impossible.',
        rowItems: ['Alex', 'Emma', 'David'],
        colItems: ['Project Manager', 'Developer', 'Team Lead'],
        icon: 'Users'
      },
      {
        title: 'Who Works on Which Phase?',
        description: 'Mark which team member works on which project phase. Click: Green = correct, Red = impossible.',
        rowItems: ['Alex', 'Emma', 'David'],
        colItems: ['Planning', 'Development', 'Testing'],
        icon: 'Calendar'
      }
    ],
    timeLimit: 90,
    hints: 4
  },

  // MEDIUM PUZZLES - 3 unique puzzles
  {
    id: 'puzzle-2',
    difficulty: 'medium',
    title: 'Call Center Operations',
    description: 'Match call types to agents and priorities',
    clues: [
      'Technical calls are handled by Alex',
      'Billing inquiries are high priority',
      'Emma handles customer complaints',
      'The low priority calls are general inquiries',
      'David works in the support department'
    ],
    solution: {
      'Call Type to Agent': {
        'Technical': 'Alex',
        'Billing': 'Emma',
        'General': 'David'
      },
      'Call Type to Priority': {
        'Technical': 'Medium',
        'Billing': 'High',
        'General': 'Low'
      },
      'Agent to Department': {
        'Alex': 'Technical',
        'Emma': 'Billing',
        'David': 'Support'
      }
    },
    gridLayouts: [
      {
        title: 'Who Handles Which Call Type?',
        description: 'Mark which agent handles which call type. Click: Green = correct, Red = impossible.',
        rowItems: ['Technical', 'Billing', 'General'],
        colItems: ['Alex', 'Emma', 'David'],
        icon: 'Phone'
      },
      {
        title: 'What Priority is Each Call Type?',
        description: 'Mark the priority level for each call type. Click: Green = correct, Red = impossible.',
        rowItems: ['Technical', 'Billing', 'General'],
        colItems: ['High', 'Medium', 'Low'],
        icon: 'AlertTriangle'
      },
      {
        title: 'Which Department Does Each Agent Work In?',
        description: 'Mark which department each agent belongs to. Click: Green = correct, Red = impossible.',
        rowItems: ['Alex', 'Emma', 'David'],
        colItems: ['Technical', 'Billing', 'Support'],
        icon: 'Building'
      }
    ],
    timeLimit: 90,
    hints: 6
  },
  {
    id: 'puzzle-2b',
    difficulty: 'medium',
    title: 'Office Schedule Management',
    description: 'Match employees to their work schedules and locations',
    clues: [
      'Lisa works from 9 AM to 5 PM',
      'Tom works in the downtown office',
      'Maria works the evening shift',
      'The remote worker starts at 10 AM',
      'The night shift worker is in the suburban office'
    ],
    solution: {
      'Employee to Schedule': {
        'Lisa': '9 AM - 5 PM',
        'Tom': '8 AM - 4 PM',
        'Maria': '6 PM - 2 AM'
      },
      'Employee to Location': {
        'Lisa': 'Downtown',
        'Tom': 'Downtown',
        'Maria': 'Suburban'
      },
      'Schedule to Location': {
        '9 AM - 5 PM': 'Downtown',
        '8 AM - 4 PM': 'Downtown',
        '6 PM - 2 AM': 'Suburban'
      }
    },
    gridLayouts: [
      {
        title: 'Who Works Which Schedule?',
        description: 'Mark which employee works which schedule. Click: Green = correct, Red = impossible.',
        rowItems: ['Lisa', 'Tom', 'Maria'],
        colItems: ['8 AM - 4 PM', '9 AM - 5 PM', '6 PM - 2 AM'],
        icon: 'Clock'
      },
      {
        title: 'Who Works in Which Location?',
        description: 'Mark which employee works in which location. Click: Green = correct, Red = impossible.',
        rowItems: ['Lisa', 'Tom', 'Maria'],
        colItems: ['Downtown', 'Suburban', 'Remote'],
        icon: 'MapPin'
      },
      {
        title: 'Which Location Has Which Schedule?',
        description: 'Mark which location operates on which schedule. Click: Green = correct, Red = impossible.',
        rowItems: ['8 AM - 4 PM', '9 AM - 5 PM', '6 PM - 2 AM'],
        colItems: ['Downtown', 'Suburban', 'Remote'],
        icon: 'Calendar'
      }
    ],
    timeLimit: 90,
    hints: 6
  },
  {
    id: 'puzzle-2c',
    difficulty: 'medium',
    title: 'Product Support Teams',
    description: 'Match support teams to products and response times',
    clues: [
      'Team Alpha handles software issues',
      'Critical issues have 2-hour response time',
      'Team Beta works on hardware problems',
      'The 4-hour response team handles moderate issues',
      'Team Gamma specializes in network problems'
    ],
    solution: {
      'Team to Product': {
        'Alpha': 'Software',
        'Beta': 'Hardware',
        'Gamma': 'Network'
      },
      'Team to Response Time': {
        'Alpha': '2 hours',
        'Beta': '4 hours',
        'Gamma': '6 hours'
      },
      'Product to Response Time': {
        'Software': '2 hours',
        'Hardware': '4 hours',
        'Network': '6 hours'
      }
    },
    gridLayouts: [
      {
        title: 'Which Team Handles Which Product?',
        description: 'Mark which team handles which product type. Click: Green = correct, Red = impossible.',
        rowItems: ['Alpha', 'Beta', 'Gamma'],
        colItems: ['Software', 'Hardware', 'Network'],
        icon: 'Wrench'
      },
      {
        title: 'What Response Time Does Each Team Have?',
        description: 'Mark the response time for each team. Click: Green = correct, Red = impossible.',
        rowItems: ['Alpha', 'Beta', 'Gamma'],
        colItems: ['2 hours', '4 hours', '6 hours'],
        icon: 'Timer'
      },
      {
        title: 'What Response Time Does Each Product Have?',
        description: 'Mark the response time for each product type. Click: Green = correct, Red = impossible.',
        rowItems: ['Software', 'Hardware', 'Network'],
        colItems: ['2 hours', '4 hours', '6 hours'],
        icon: 'Clock'
      }
    ],
    timeLimit: 90,
    hints: 6
  },

  // HARD PUZZLES - 4 unique puzzles
  {
    id: 'puzzle-3',
    difficulty: 'hard',
    title: 'Multi-Department Operations',
    description: 'Match departments to their managers, budgets, and performance ratings',
    clues: [
      'Sales department has the highest budget',
      'Maria manages the IT department',
      'The department with 85% performance is managed by John',
      'HR department has a $500K budget',
      'The department with 92% performance has a $800K budget',
      'David manages the department with 78% performance'
    ],
    solution: {
      'Department to Manager': {
        'Sales': 'John',
        'IT': 'Maria',
        'HR': 'David'
      },
      'Department to Budget': {
        'Sales': '$800K',
        'IT': '$600K',
        'HR': '$500K'
      },
      'Department to Performance': {
        'Sales': '92%',
        'IT': '85%',
        'HR': '78%'
      },
      'Manager to Budget': {
        'John': '$800K',
        'Maria': '$600K',
        'David': '$500K'
      }
    },
    gridLayouts: [
      {
        title: 'Who Manages Which Department?',
        description: 'Mark which manager oversees which department. Click: Green = correct, Red = impossible.',
        rowItems: ['Sales', 'IT', 'HR'],
        colItems: ['John', 'Maria', 'David'],
        icon: 'Users'
      },
      {
        title: 'What Budget Does Each Department Have?',
        description: 'Mark the budget allocation for each department. Click: Green = correct, Red = impossible.',
        rowItems: ['Sales', 'IT', 'HR'],
        colItems: ['$500K', '$600K', '$800K'],
        icon: 'DollarSign'
      },
      {
        title: 'What Performance Rating Does Each Department Have?',
        description: 'Mark the performance rating for each department. Click: Green = correct, Red = impossible.',
        rowItems: ['Sales', 'IT', 'HR'],
        colItems: ['78%', '85%', '92%'],
        icon: 'TrendingUp'
      },
      {
        title: 'What Budget Does Each Manager Control?',
        description: 'Mark the budget controlled by each manager. Click: Green = correct, Red = impossible.',
        rowItems: ['John', 'Maria', 'David'],
        colItems: ['$500K', '$600K', '$800K'],
        icon: 'DollarSign'
      }
    ],
    timeLimit: 90,
    hints: 8
  },
  {
    id: 'puzzle-3b',
    difficulty: 'hard',
    title: 'Client Project Teams',
    description: 'Match project teams to clients, deadlines, and team sizes',
    clues: [
      'Project A has a 3-month deadline',
      'The 6-person team works for Client Beta',
      'Client Alpha has the longest deadline',
      'The 4-person team has a 2-month deadline',
      'Project C is for Client Gamma',
      'The team with 8 people has a 4-month deadline'
    ],
    solution: {
      'Project to Client': {
        'A': 'Alpha',
        'B': 'Beta',
        'C': 'Gamma'
      },
      'Project to Deadline': {
        'A': '3 months',
        'B': '2 months',
        'C': '4 months'
      },
      'Project to Team Size': {
        'A': '6 people',
        'B': '4 people',
        'C': '8 people'
      },
      'Client to Team Size': {
        'Alpha': '6 people',
        'Beta': '4 people',
        'Gamma': '8 people'
      }
    },
    gridLayouts: [
      {
        title: 'Which Client Does Each Project Serve?',
        description: 'Mark which client each project is for. Click: Green = correct, Red = impossible.',
        rowItems: ['A', 'B', 'C'],
        colItems: ['Alpha', 'Beta', 'Gamma'],
        icon: 'Users'
      },
      {
        title: 'What Deadline Does Each Project Have?',
        description: 'Mark the deadline for each project. Click: Green = correct, Red = impossible.',
        rowItems: ['A', 'B', 'C'],
        colItems: ['2 months', '3 months', '4 months'],
        icon: 'Calendar'
      },
      {
        title: 'How Many People Work on Each Project?',
        description: 'Mark the team size for each project. Click: Green = correct, Red = impossible.',
        rowItems: ['A', 'B', 'C'],
        colItems: ['4 people', '6 people', '8 people'],
        icon: 'Users'
      },
      {
        title: 'How Many People Work for Each Client?',
        description: 'Mark the team size working for each client. Click: Green = correct, Red = impossible.',
        rowItems: ['Alpha', 'Beta', 'Gamma'],
        colItems: ['4 people', '6 people', '8 people'],
        icon: 'Users'
      }
    ],
    timeLimit: 90,
    hints: 8
  },
  {
    id: 'puzzle-3c',
    difficulty: 'hard',
    title: 'Service Level Management',
    description: 'Match service levels to response times, customer types, and support channels',
    clues: [
      'Premium customers get 1-hour response',
      'Email support is for standard customers',
      'Phone support has 4-hour response time',
      'VIP customers use chat support',
      'The 2-hour response is for standard customers',
      'Chat support is available 24/7'
    ],
    solution: {
      'Customer Type to Response Time': {
        'Premium': '1 hour',
        'Standard': '2 hours',
        'VIP': '30 minutes'
      },
      'Customer Type to Channel': {
        'Premium': 'Phone',
        'Standard': 'Email',
        'VIP': 'Chat'
      },
      'Channel to Response Time': {
        'Phone': '4 hours',
        'Email': '2 hours',
        'Chat': '30 minutes'
      },
      'Channel to Availability': {
        'Phone': 'Business hours',
        'Email': '24/7',
        'Chat': '24/7'
      }
    },
    gridLayouts: [
      {
        title: 'What Response Time Does Each Customer Type Get?',
        description: 'Mark the response time for each customer type. Click: Green = correct, Red = impossible.',
        rowItems: ['Premium', 'Standard', 'VIP'],
        colItems: ['30 minutes', '1 hour', '2 hours'],
        icon: 'Timer'
      },
      {
        title: 'Which Channel Does Each Customer Type Use?',
        description: 'Mark the support channel for each customer type. Click: Green = correct, Red = impossible.',
        rowItems: ['Premium', 'Standard', 'VIP'],
        colItems: ['Phone', 'Email', 'Chat'],
        icon: 'Phone'
      },
      {
        title: 'What Response Time Does Each Channel Have?',
        description: 'Mark the response time for each support channel. Click: Green = correct, Red = impossible.',
        rowItems: ['Phone', 'Email', 'Chat'],
        colItems: ['30 minutes', '2 hours', '4 hours'],
        icon: 'Clock'
      },
      {
        title: 'What Availability Does Each Channel Have?',
        description: 'Mark the availability for each support channel. Click: Green = correct, Red = impossible.',
        rowItems: ['Phone', 'Email', 'Chat'],
        colItems: ['Business hours', '24/7'],
        icon: 'Clock'
      }
    ],
    timeLimit: 90,
    hints: 8
  },
  {
    id: 'puzzle-3d',
    difficulty: 'hard',
    title: 'Quality Assurance Process',
    description: 'Match QA processes to defect types, severity levels, and resolution times',
    clues: [
      'Critical defects are resolved in 1 day',
      'UI testing finds medium severity issues',
      'Performance testing has 3-day resolution',
      'The 5-day resolution is for low severity',
      'Security testing finds critical defects',
      'Functional testing handles minor issues'
    ],
    solution: {
      'Test Type to Defect Severity': {
        'Security': 'Critical',
        'UI': 'Medium',
        'Performance': 'High',
        'Functional': 'Low'
      },
      'Test Type to Resolution Time': {
        'Security': '1 day',
        'UI': '2 days',
        'Performance': '3 days',
        'Functional': '5 days'
      },
      'Severity to Resolution Time': {
        'Critical': '1 day',
        'High': '3 days',
        'Medium': '2 days',
        'Low': '5 days'
      },
      'Defect Type to Test Type': {
        'Security': 'Security',
        'UI': 'UI',
        'Performance': 'Performance',
        'Functional': 'Functional'
      }
    },
    gridLayouts: [
      {
        title: 'What Severity Does Each Test Type Find?',
        description: 'Mark the defect severity for each test type. Click: Green = correct, Red = impossible.',
        rowItems: ['Security', 'UI', 'Performance', 'Functional'],
        colItems: ['Low', 'Medium', 'High', 'Critical'],
        icon: 'AlertTriangle'
      },
      {
        title: 'What Resolution Time Does Each Test Type Have?',
        description: 'Mark the resolution time for each test type. Click: Green = correct, Red = impossible.',
        rowItems: ['Security', 'UI', 'Performance', 'Functional'],
        colItems: ['1 day', '2 days', '3 days', '5 days'],
        icon: 'Clock'
      },
      {
        title: 'What Resolution Time Does Each Severity Level Have?',
        description: 'Mark the resolution time for each severity level. Click: Green = correct, Red = impossible.',
        rowItems: ['Low', 'Medium', 'High', 'Critical'],
        colItems: ['1 day', '2 days', '3 days', '5 days'],
        icon: 'Timer'
      },
      {
        title: 'Which Test Type Handles Which Defect Type?',
        description: 'Mark which test type handles which defect type. Click: Green = correct, Red = impossible.',
        rowItems: ['Security', 'UI', 'Performance', 'Functional'],
        colItems: ['Security', 'UI', 'Performance', 'Functional'],
        icon: 'TestTube'
      }
    ],
    timeLimit: 90,
    hints: 8
  },

  // EXPERT PUZZLES - 4 unique puzzles
  {
    id: 'puzzle-4',
    difficulty: 'expert',
    title: 'Enterprise Resource Planning',
    description: 'Match departments to their resource allocations, project priorities, and success metrics',
    clues: [
      'Marketing has the highest budget allocation',
      'The department with 95% success rate has 20% budget',
      'IT department manages 3 active projects',
      'The department with 2 projects has 15% budget allocation',
      'HR has the lowest success rate',
      'The department with 25% budget has 4 projects',
      'Finance department has 85% success rate'
    ],
    solution: {
      'Department to Budget': {
        'Marketing': '25%',
        'IT': '20%',
        'HR': '15%',
        'Finance': '40%'
      },
      'Department to Projects': {
        'Marketing': '4',
        'IT': '3',
        'HR': '2',
        'Finance': '1'
      },
      'Department to Success Rate': {
        'Marketing': '90%',
        'IT': '95%',
        'HR': '75%',
        'Finance': '85%'
      },
      'Budget to Success Rate': {
        '25%': '90%',
        '20%': '95%',
        '15%': '75%',
        '40%': '85%'
      }
    },
    gridLayouts: [
      {
        title: 'What Budget Allocation Does Each Department Have?',
        description: 'Mark the budget allocation for each department. Click: Green = correct, Red = impossible.',
        rowItems: ['Marketing', 'IT', 'HR', 'Finance'],
        colItems: ['15%', '20%', '25%', '40%'],
        icon: 'DollarSign'
      },
      {
        title: 'How Many Projects Does Each Department Manage?',
        description: 'Mark the number of projects for each department. Click: Green = correct, Red = impossible.',
        rowItems: ['Marketing', 'IT', 'HR', 'Finance'],
        colItems: ['1', '2', '3', '4'],
        icon: 'FolderOpen'
      },
      {
        title: 'What Success Rate Does Each Department Have?',
        description: 'Mark the success rate for each department. Click: Green = correct, Red = impossible.',
        rowItems: ['Marketing', 'IT', 'HR', 'Finance'],
        colItems: ['75%', '85%', '90%', '95%'],
        icon: 'TrendingUp'
      },
      {
        title: 'What Success Rate Does Each Budget Level Achieve?',
        description: 'Mark the success rate for each budget allocation. Click: Green = correct, Red = impossible.',
        rowItems: ['15%', '20%', '25%', '40%'],
        colItems: ['75%', '85%', '90%', '95%'],
        icon: 'BarChart'
      }
    ],
    timeLimit: 90,
    hints: 8
  },
  {
    id: 'puzzle-4b',
    difficulty: 'expert',
    title: 'Global Operations Management',
    description: 'Match regions to their operational metrics, team structures, and market conditions',
    clues: [
      'North America has the highest revenue',
      'The region with 50 employees has 85% efficiency',
      'Europe operates in 3 time zones',
      'The region with 30 employees has 90% efficiency',
      'Asia Pacific has the most diverse team',
      'The region with 40 employees operates in 2 time zones',
      'Latin America has 75% efficiency'
    ],
    solution: {
      'Region to Revenue': {
        'North America': '$2M',
        'Europe': '$1.5M',
        'Asia Pacific': '$1.8M',
        'Latin America': '$1.2M'
      },
      'Region to Team Size': {
        'North America': '50',
        'Europe': '40',
        'Asia Pacific': '45',
        'Latin America': '30'
      },
      'Region to Efficiency': {
        'North America': '95%',
        'Europe': '85%',
        'Asia Pacific': '90%',
        'Latin America': '75%'
      },
      'Region to Time Zones': {
        'North America': '3',
        'Europe': '3',
        'Asia Pacific': '4',
        'Latin America': '2'
      }
    },
    gridLayouts: [
      {
        title: 'What Revenue Does Each Region Generate?',
        description: 'Mark the revenue for each region. Click: Green = correct, Red = impossible.',
        rowItems: ['North America', 'Europe', 'Asia Pacific', 'Latin America'],
        colItems: ['$1.2M', '$1.5M', '$1.8M', '$2M'],
        icon: 'DollarSign'
      },
      {
        title: 'How Many Employees Does Each Region Have?',
        description: 'Mark the team size for each region. Click: Green = correct, Red = impossible.',
        rowItems: ['North America', 'Europe', 'Asia Pacific', 'Latin America'],
        colItems: ['30', '40', '45', '50'],
        icon: 'Users'
      },
      {
        title: 'What Efficiency Does Each Region Achieve?',
        description: 'Mark the efficiency rate for each region. Click: Green = correct, Red = impossible.',
        rowItems: ['North America', 'Europe', 'Asia Pacific', 'Latin America'],
        colItems: ['75%', '85%', '90%', '95%'],
        icon: 'TrendingUp'
      },
      {
        title: 'How Many Time Zones Does Each Region Operate In?',
        description: 'Mark the number of time zones for each region. Click: Green = correct, Red = impossible.',
        rowItems: ['North America', 'Europe', 'Asia Pacific', 'Latin America'],
        colItems: ['2', '3', '4'],
        icon: 'Globe'
      }
    ],
    timeLimit: 90,
    hints: 8
  },
  {
    id: 'puzzle-4c',
    difficulty: 'expert',
    title: 'Strategic Initiative Planning',
    description: 'Match strategic initiatives to their timelines, resource requirements, and expected outcomes',
    clues: [
      'Digital transformation has the highest budget',
      'The 6-month initiative requires 15 team members',
      'Customer experience improvement has 90% success probability',
      'The initiative with 12-month timeline has 20 team members',
      'Process automation has 85% success probability',
      'The initiative with 8-month timeline requires 10 team members',
      'Talent development has the lowest budget'
    ],
    solution: {
      'Initiative to Timeline': {
        'Digital Transformation': '12 months',
        'Customer Experience': '6 months',
        'Process Automation': '8 months',
        'Talent Development': '4 months'
      },
      'Initiative to Team Size': {
        'Digital Transformation': '20',
        'Customer Experience': '15',
        'Process Automation': '10',
        'Talent Development': '8'
      },
      'Initiative to Success Rate': {
        'Digital Transformation': '80%',
        'Customer Experience': '90%',
        'Process Automation': '85%',
        'Talent Development': '95%'
      },
      'Initiative to Budget': {
        'Digital Transformation': '$2M',
        'Customer Experience': '$1.5M',
        'Process Automation': '$1M',
        'Talent Development': '$500K'
      }
    },
    gridLayouts: [
      {
        title: 'What Timeline Does Each Initiative Have?',
        description: 'Mark the timeline for each strategic initiative. Click: Green = correct, Red = impossible.',
        rowItems: ['Digital Transformation', 'Customer Experience', 'Process Automation', 'Talent Development'],
        colItems: ['4 months', '6 months', '8 months', '12 months'],
        icon: 'Calendar'
      },
      {
        title: 'How Many Team Members Does Each Initiative Require?',
        description: 'Mark the team size for each initiative. Click: Green = correct, Red = impossible.',
        rowItems: ['Digital Transformation', 'Customer Experience', 'Process Automation', 'Talent Development'],
        colItems: ['8', '10', '15', '20'],
        icon: 'Users'
      },
      {
        title: 'What Success Rate Does Each Initiative Have?',
        description: 'Mark the success probability for each initiative. Click: Green = correct, Red = impossible.',
        rowItems: ['Digital Transformation', 'Customer Experience', 'Process Automation', 'Talent Development'],
        colItems: ['80%', '85%', '90%', '95%'],
        icon: 'TrendingUp'
      },
      {
        title: 'What Budget Does Each Initiative Require?',
        description: 'Mark the budget for each initiative. Click: Green = correct, Red = impossible.',
        rowItems: ['Digital Transformation', 'Customer Experience', 'Process Automation', 'Talent Development'],
        colItems: ['$500K', '$1M', '$1.5M', '$2M'],
        icon: 'DollarSign'
      }
    ],
    timeLimit: 90,
    hints: 8
  },
  {
    id: 'puzzle-4d',
    difficulty: 'expert',
    title: 'Risk Management Framework',
    description: 'Match risk categories to their mitigation strategies, impact levels, and monitoring frequencies',
    clues: [
      'Cybersecurity risks have high impact',
      'The risk with weekly monitoring has medium impact',
      'Operational risks require daily monitoring',
      'The risk with monthly monitoring has low impact',
      'Financial risks have the highest mitigation cost',
      'The risk with quarterly monitoring requires 5 mitigation strategies',
      'Compliance risks have medium impact'
    ],
    solution: {
      'Risk Category to Impact': {
        'Cybersecurity': 'High',
        'Operational': 'Medium',
        'Financial': 'High',
        'Compliance': 'Medium'
      },
      'Risk Category to Monitoring': {
        'Cybersecurity': 'Daily',
        'Operational': 'Weekly',
        'Financial': 'Monthly',
        'Compliance': 'Quarterly'
      },
      'Risk Category to Mitigation Cost': {
        'Cybersecurity': '$500K',
        'Operational': '$200K',
        'Financial': '$1M',
        'Compliance': '$300K'
      },
      'Risk Category to Strategies': {
        'Cybersecurity': '8',
        'Operational': '5',
        'Financial': '10',
        'Compliance': '3'
      }
    },
    gridLayouts: [
      {
        title: 'What Impact Level Does Each Risk Category Have?',
        description: 'Mark the impact level for each risk category. Click: Green = correct, Red = impossible.',
        rowItems: ['Cybersecurity', 'Operational', 'Financial', 'Compliance'],
        colItems: ['Low', 'Medium', 'High'],
        icon: 'AlertTriangle'
      },
      {
        title: 'What Monitoring Frequency Does Each Risk Category Have?',
        description: 'Mark the monitoring frequency for each risk category. Click: Green = correct, Red = impossible.',
        rowItems: ['Cybersecurity', 'Operational', 'Financial', 'Compliance'],
        colItems: ['Daily', 'Weekly', 'Monthly', 'Quarterly'],
        icon: 'Eye'
      },
      {
        title: 'What Mitigation Cost Does Each Risk Category Have?',
        description: 'Mark the mitigation cost for each risk category. Click: Green = correct, Red = impossible.',
        rowItems: ['Cybersecurity', 'Operational', 'Financial', 'Compliance'],
        colItems: ['$200K', '$300K', '$500K', '$1M'],
        icon: 'DollarSign'
      },
      {
        title: 'How Many Mitigation Strategies Does Each Risk Category Require?',
        description: 'Mark the number of mitigation strategies for each risk category. Click: Green = correct, Red = impossible.',
        rowItems: ['Cybersecurity', 'Operational', 'Financial', 'Compliance'],
        colItems: ['3', '5', '8', '10'],
        icon: 'Shield'
      }
    ],
    timeLimit: 90,
    hints: 8
  }
];

export default function LogicGridGame() {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [availablePuzzles, setAvailablePuzzles] = useState<Puzzle[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'Users': Users,
      'Building': Building,
      'Phone': Phone,
      'Calendar': Calendar,
      'Clock': Clock,
      'Timer': Timer,
      'AlertTriangle': AlertTriangle,
      'Wrench': Wrench,
      'DollarSign': DollarSign,
      'TrendingUp': TrendingUp,
      'FolderOpen': FolderOpen,
      'TestTube': TestTube,
      'Eye': Eye,
      'Globe': Globe,
      'MapPin': MapPin,
      'Shield': Shield,
      'BarChart': BarChart
    };
    return iconMap[iconName] || Users;
  };

  // Initialize grid
  const initializeGrid = (puzzle: Puzzle) => {
    // Calculate total grid size based on all grid layouts
    let maxRows = 0;
    let maxCols = 0;
    
    puzzle.gridLayouts.forEach(layout => {
      maxRows = Math.max(maxRows, layout.rowItems.length);
      maxCols = Math.max(maxCols, layout.colItems.length);
    });
    
    const totalRows = maxRows * puzzle.gridLayouts.length;
    const totalCols = maxCols;
    
    const newGrid: GridCell[][] = [];
    for (let i = 0; i < totalRows; i++) {
      newGrid[i] = [];
      for (let j = 0; j < totalCols; j++) {
        newGrid[i][j] = {
          value: '',
          isCorrect: false,
          isSelected: false,
          isCrossed: false
        };
      }
    }
    
    setGrid(newGrid);
  };

  // Start game
  const startGame = (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => {
    const puzzles = PUZZLES.filter(p => p.difficulty === difficulty).slice(0, 2);
    setAvailablePuzzles(puzzles);
    setCurrentPuzzleIndex(0);
    
    const puzzle = puzzles[0];
    setCurrentPuzzle(puzzle);
    setSelectedDifficulty(difficulty);
    setTimeLeft(puzzle.timeLimit);
    setHintsUsed(0);
    setScore(0);
    setIsCompleted(false);
    setShowHint(false);
    setCurrentHint('');
    
    initializeGrid(puzzle);
    setGameState('playing');
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // End game
  const endGame = (won: boolean) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (won) {
      const timeBonus = Math.floor(timeLeft * 2);
      const hintPenalty = hintsUsed * 50;
      const finalScore = 1000 + timeBonus - hintPenalty;
      
      setScore(finalScore);
    }
    
    setGameState(won ? 'completed' : 'failed');
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing' || !currentPuzzle) return;
    
    const newGrid = [...grid];
    const cell = newGrid[row][col];
    
    if (cell.isCrossed) {
      cell.isCrossed = false;
      cell.isSelected = true;
    } else if (cell.isSelected) {
      cell.isSelected = false;
      cell.isCrossed = true;
    } else {
      cell.isSelected = true;
      cell.isCrossed = false;
    }
    
    setGrid(newGrid);
    checkSolution();
  };

  // Check solution
  const checkSolution = () => {
    if (!currentPuzzle) return;
    
    let correctMatches = 0;
    let totalMatches = 0;
    
    // Check each cell
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.isSelected) {
          totalMatches++;
          
          // Check if this is a valid connection in any of the solution mappings
          const isValidConnection = Object.values(currentPuzzle.solution).some(mapping => {
            const rowItems = Object.keys(mapping);
            const colItems = Object.values(mapping);
            return rowItems.includes(rowIndex.toString()) && colItems.includes(colIndex.toString());
          });
          
          if (isValidConnection) {
            correctMatches++;
          }
        }
      });
    });
    
    // Count total expected connections
    const totalExpectedConnections = Object.values(currentPuzzle.solution).reduce((total, mapping) => 
      total + Object.keys(mapping).length, 0
    );
    
    if (correctMatches === totalExpectedConnections && totalMatches === correctMatches) {
      endGame(true);
    }
  };

  // Get hint
  const getHint = () => {
    if (!currentPuzzle || hintsUsed >= currentPuzzle.hints) return;
    
    const unusedHints = currentPuzzle.clues.filter(clue => !currentHint.includes(clue));
    if (unusedHints.length > 0) {
      const randomHint = unusedHints[Math.floor(Math.random() * unusedHints.length)];
      setCurrentHint(prev => prev ? `${prev}\n\n${randomHint}` : randomHint);
      setHintsUsed(prev => prev + 1);
      setShowHint(true);
    }
  };

  // Reset game
  const resetGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setGameState('menu');
    setCurrentPuzzle(null);
    setGrid([]);
    setTimeLeft(0);
    setScore(0);
    setHintsUsed(0);
    setIsCompleted(false);
    setShowHint(false);
    setCurrentHint('');
    setCurrentPuzzleIndex(0);
    setAvailablePuzzles([]);
    setShowResetDialog(false);
  };

  const nextPuzzle = () => {
    if (currentPuzzleIndex < availablePuzzles.length - 1) {
      const nextIndex = currentPuzzleIndex + 1;
      const puzzle = availablePuzzles[nextIndex];
      
      setCurrentPuzzleIndex(nextIndex);
      setCurrentPuzzle(puzzle);
      setTimeLeft(puzzle.timeLimit);
      setHintsUsed(0);
      setScore(0);
      setIsCompleted(false);
      setShowHint(false);
      setCurrentHint('');
      
      initializeGrid(puzzle);
      
      // Restart timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <div className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-8">
          
          {/* Menu Screen */}
          {gameState === 'menu' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.back();
                    }}
                    className="mr-4 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </Button>
                  <div className="flex items-center">
                    <Brain className="h-12 w-12 text-green-400 mr-4" />
                    <div>
                      <h1 className="text-4xl font-bold gradient-text">Logic Grid</h1>
                      <p className="text-gray-400">"Master deductive reasoning with interactive puzzles"</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center space-y-8"
              >
                              <Card className="glass-card border-white/10">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mr-4">
                      <Brain className="w-8 h-8 text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold gradient-text mb-2">
                        Welcome to Logic Grid!
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-lg">
                        Master deductive reasoning with interactive logic puzzles
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="text-gray-300 space-y-6 text-left max-w-3xl mx-auto">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-400" />
                        How to Play
                      </h3>
                      <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                          <span className="text-green-400 mr-3 mt-0.5 text-lg">🧩</span>
                          <span>Use the clues to determine relationships between items</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-400 mr-3 mt-0.5 text-lg">✅</span>
                          <span>Click cells to mark them as correct (green) or impossible (red)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-400 mr-3 mt-0.5 text-lg">💡</span>
                          <span>Use hints when you're stuck - they're limited per puzzle</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-400 mr-3 mt-0.5 text-lg">🎯</span>
                          <span>Complete all relationships to solve the puzzle</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-cyan-400 mr-3 mt-0.5 text-lg">⏱️</span>
                          <span>Beat the time limit to earn bonus points</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-400 mr-3 mt-0.5 text-lg">🔓</span>
                          <span>Complete each difficulty to unlock the next level</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-red-400 mr-3 mt-0.5 text-lg">🏆</span>
                          <span>Solve puzzles correctly to advance and improve your skills</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-green-400 text-lg">🧠</span>
                          <h4 className="text-white font-semibold">Deductive Reasoning</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Use logical clues to eliminate possibilities and find the correct relationships!</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-400 text-lg">📊</span>
                          <h4 className="text-white font-semibold">Multiple Grids</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Each puzzle contains multiple relationship grids to solve simultaneously!</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setGameState('difficulty')}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg py-6 h-14"
                  >
                    <Play className="w-6 h-6 mr-3" />
                    Choose Difficulty
                  </Button>
                </CardContent>
              </Card>
              </motion.div>
            </>
          )}

          {/* Difficulty Selection */}
          {gameState === 'difficulty' && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    onClick={() => setGameState('menu')}
                    className="mr-4 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </Button>
                  <div className="flex items-center">
                    <Brain className="h-12 w-12 text-green-400 mr-4" />
                    <div>
                      <h1 className="text-4xl font-bold gradient-text">Logic Grid</h1>
                      <p className="text-gray-400">"Master deductive reasoning with interactive puzzles"</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto space-y-6"
              >
                <div className="text-center mb-8 mt-8">
                  <h2 className="text-3xl font-bold text-white mb-2">Choose Your Challenge</h2>
                  <p className="text-gray-400">Complete each difficulty to unlock the next level</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { 
                      difficulty: 'easy', 
                      title: 'Easy', 
                      stars: 1,
                      time: '5:00',
                      puzzleType: 'Simple Relationships',
                      complexity: 'Basic',
                      color: 'green'
                    },
                    { 
                      difficulty: 'medium', 
                      title: 'Medium', 
                      stars: 2,
                      time: '4:00',
                      puzzleType: 'Complex Relationships',
                      complexity: 'Intermediate',
                      color: 'yellow'
                    },
                    { 
                      difficulty: 'hard', 
                      title: 'Hard', 
                      stars: 3,
                      time: '3:00',
                      puzzleType: 'Advanced Logic',
                      complexity: 'Expert',
                      color: 'red'
                    },
                    { 
                      difficulty: 'expert', 
                      title: 'Expert', 
                      stars: 4,
                      time: '2:30',
                      puzzleType: 'Master Level',
                      complexity: 'Master',
                      color: 'purple'
                    }
                  ].map((level) => (
                    <motion.div
                      key={level.difficulty}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="glass-card border-white/10 hover:border-white/20 transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-xl text-white">{level.title}</CardTitle>
                            <div className="flex">
                              {[...Array(level.stars)].map((_, i) => (
                                <span 
                                  key={i} 
                                  className={`text-sm ${
                                    level.stars === 4 ? 'text-orange-400' : 'text-yellow-400'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Time Limit:</span>
                              <span className="text-blue-400 font-medium">{level.time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Puzzle Type:</span>
                              <span className="text-purple-400 font-medium">{level.puzzleType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Complexity:</span>
                              <span className="text-yellow-400 font-medium">{level.complexity}</span>
                            </div>
                          </div>
                          <Button
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium"
                            onClick={() => startGame(level.difficulty as 'easy' | 'medium' | 'hard' | 'expert')}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Start Challenge
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </>
          )}

          {/* Game Screen */}
          {gameState === 'playing' && currentPuzzle && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (gameState === 'playing') {
                        setShowExitDialog(true);
                      } else {
                        router.back();
                      }
                    }}
                    className="mr-4 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </Button>
                  <div className="flex items-center">
                    <Brain className="h-12 w-12 text-green-400 mr-4" />
                    <div>
                      <h1 className="text-4xl font-bold gradient-text">Logic Grid</h1>
                      <p className="text-gray-400">Puzzle {currentPuzzleIndex + 1} of {availablePuzzles.length}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="max-w-6xl mx-auto space-y-6">
                {/* Game Header */}
                <div className="flex items-center justify-between glass-card p-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 glass-card px-3 py-2">
                      <Timer className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-medium">{formatTime(timeLeft)}</span>
                    </div>
                    <div className="flex items-center space-x-2 glass-card px-3 py-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-medium">{currentPuzzle.hints - hintsUsed} hints left</span>
                    </div>
                    {availablePuzzles.length >= 2 && (
                      <Button
                        onClick={nextPuzzle}
                        disabled={currentPuzzleIndex >= 1}
                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                      >
                        Next Puzzle
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Dynamic Puzzle Grids */}
                  <div className="space-y-6">
                    {currentPuzzle.gridLayouts.map((layout, layoutIndex) => {
                      // Get the appropriate icon component
                      const IconComponent = getIconComponent(layout.icon);
                      
                      return (
                        <Card key={layoutIndex} className="glass-card border-white/10">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center">
                              <IconComponent className="w-5 h-5 mr-2 text-green-400" />
                              {layout.title}
                            </CardTitle>
                            <CardDescription className="text-gray-300">
                              {layout.description}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto">
                              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${layout.colItems.length + 1}, minmax(80px, 1fr))` }}>
                                {/* Header row */}
                                <div className="h-12"></div>
                                {layout.colItems.map((colItem, index) => (
                                  <div key={index} className="h-12 flex items-center justify-center text-sm font-medium text-white bg-white/10 rounded">
                                    {colItem}
                                  </div>
                                ))}
                                
                                {/* Row items */}
                                {layout.rowItems.map((rowItem, rowIndex) => (
                                  <React.Fragment key={rowIndex}>
                                    <div className="h-12 flex items-center justify-center text-sm font-medium text-white bg-white/10 rounded">
                                      {rowItem}
                                    </div>
                                    {layout.colItems.map((colItem, colIndex) => (
                                      <button
                                        key={`grid-${layoutIndex}-${rowIndex}-${colIndex}`}
                                        onClick={() => handleCellClick(rowIndex + (layoutIndex * layout.rowItems.length), colIndex)}
                                        className={`h-12 border border-white/20 rounded transition-all duration-200 flex items-center justify-center ${
                                          grid[rowIndex + (layoutIndex * layout.rowItems.length)]?.[colIndex]?.isSelected 
                                            ? 'bg-green-500/20 border-green-400/50' 
                                            : grid[rowIndex + (layoutIndex * layout.rowItems.length)]?.[colIndex]?.isCrossed 
                                            ? 'bg-red-500/20 border-red-400/50' 
                                            : 'hover:bg-white/10'
                                        }`}
                                      >
                                        {grid[rowIndex + (layoutIndex * layout.rowItems.length)]?.[colIndex]?.isSelected && (
                                          <CheckCircle className="w-5 h-5 text-green-400" />
                                        )}
                                        {grid[rowIndex + (layoutIndex * layout.rowItems.length)]?.[colIndex]?.isCrossed && (
                                          <X className="w-5 h-5 text-red-400" />
                                        )}
                                      </button>
                                    ))}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Clues and Hints */}
                  <div className="space-y-6">
                    <Card className="glass-card border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                          Clues
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {currentPuzzle.clues.map((clue, index) => (
                            <div key={index} className="text-gray-300 text-sm p-3 bg-white/5 rounded-lg">
                              {index + 1}. {clue}
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={getHint}
                          disabled={hintsUsed >= currentPuzzle.hints}
                          className="w-full mt-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                        >
                          <Lightbulb className="w-4 h-4 mr-2" />
                          Get Hint ({currentPuzzle.hints - hintsUsed} left)
                        </Button>
                        {showHint && currentHint && (
                          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <h4 className="text-yellow-400 font-semibold mb-2">Hint:</h4>
                            <p className="text-gray-300 text-sm whitespace-pre-line">{currentHint}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Game Completed */}
          {gameState === 'completed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    onClick={() => setGameState('menu')}
                    className="mr-4 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </Button>
                  <div className="flex items-center">
                    <Brain className="h-12 w-12 text-purple-400 mr-4" />
                    <div>
                      <h1 className="text-4xl font-bold gradient-text">Logic Grid</h1>
                      <p className="text-gray-400">Master deductive reasoning through complex puzzles</p>
                    </div>
                  </div>
                </div>
              </div>
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-full flex items-center justify-center mr-4">
                      <Trophy className="w-10 h-10 text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold gradient-text mb-2">
                        Puzzle Solved!
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-lg">
                        Excellent deductive reasoning!
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="glass-card p-4">
                      <div className="text-2xl font-bold text-green-400">{score}</div>
                      <div className="text-sm text-gray-400">Score</div>
                    </div>
                    <div className="glass-card p-4">
                      <div className="text-2xl font-bold text-blue-400">{formatTime(currentPuzzle?.timeLimit || 0 - timeLeft)}</div>
                      <div className="text-sm text-gray-400">Time Used</div>
                    </div>
                  </div>
                  
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => setGameState('menu')}
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
                          title: 'My Logic Grid Game Results',
                          text: `I solved the puzzle with ${score} points in ${formatTime(currentPuzzle?.timeLimit || 0 - timeLeft)}!`,
                          url: window.location.href
                        });
                      } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(`My Logic Grid Game Results: ${score} points in ${formatTime(currentPuzzle?.timeLimit || 0 - timeLeft)}!`);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                    onClick={() => currentPuzzleIndex < availablePuzzles.length - 1 ? nextPuzzle() : startGame(selectedDifficulty as 'easy' | 'medium')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Take Again
                  </Button>
                </div>
            </motion.div>
          )}

          {/* Game Failed */}
          {gameState === 'failed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    onClick={() => setGameState('menu')}
                    className="mr-4 text-gray-400 hover:text-white"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back
                  </Button>
                  <div className="flex items-center">
                    <Brain className="h-12 w-12 text-purple-400 mr-4" />
                    <div>
                      <h1 className="text-4xl font-bold gradient-text">Logic Grid</h1>
                      <p className="text-gray-400">Master deductive reasoning through complex puzzles</p>
                    </div>
                  </div>
                </div>
              </div>
              <Card className="glass-card border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mr-4">
                      <X className="w-10 h-10 text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold gradient-text mb-2">
                        Puzzle Incomplete
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-lg">
                        Time ran out before you could solve the puzzle. Keep practicing to improve your logical reasoning skills!
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Performance Feedback */}
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-semibold mb-2">Performance Feedback</h4>
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span>Time management needs improvement</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Focus on systematic problem-solving approach</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Practice with easier puzzles first</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Tip: Try using the hint system to understand the logical patterns better.
                    </p>
                  </div>
                </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => setGameState('menu')}
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
                          title: 'My Logic Grid Game Results',
                          text: `I attempted the puzzle but ran out of time. Need to practice more logical reasoning!`,
                          url: window.location.href
                        });
                      } else {
                        // Fallback: copy to clipboard
                        navigator.clipboard.writeText(`My Logic Grid Game Results: Attempted the puzzle but ran out of time. Need to practice more logical reasoning!`);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                    onClick={() => startGame(selectedDifficulty as 'easy' | 'medium')}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Take Again
                  </Button>
                </div>
            </motion.div>
          )}

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
                <AlertDialogAction
                  onClick={() => {
                    setShowExitDialog(false);
                    router.back();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
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
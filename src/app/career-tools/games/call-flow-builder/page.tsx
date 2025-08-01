'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Phone,
  Play,
  RotateCcw,
  Trophy,
  Clock,
  Target,
  CheckCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Link,
  MessageSquare,
  Headphones,
  Brain,
  AlertTriangle,
  Lightbulb,
  X,
  Share
} from 'lucide-react';

type FlowNodeType = 'greeting' | 'question' | 'response' | 'action' | 'decision' | 'end';

interface FlowNode {
  id: string;
  type: FlowNodeType;
  text: string;
  x: number;
  y: number;
  connections: string[];
}

interface Connection {
  from: string;
  to: string;
  label?: string;
}

interface GameStats {
  efficiency: number;
  customerSatisfaction: number;
  resolutionRate: number;
  avgCallTime: number;
  flowComplexity: number;
}

const TOOLBOX_ITEMS = {
  greeting: [
    'Thank you for calling [Company]. How can I help you today?',
    'Good morning! This is [Name]. How may I assist you?',
    'Hello! Welcome to our customer service. What brings you here today?',
    'Hi there! You\'ve reached [Department]. How can I make your day better?',
    'Welcome to [Company] support. I\'m here to help solve any concerns.'
  ],
  question: [
    'Can you tell me more about the issue you\'re experiencing?',
    'What account number or reference can I help you with?',
    'Have you tried any troubleshooting steps already?',
    'When did this problem first occur?',
    'Could you describe exactly what happened when the issue started?'
  ],
  response: [
    'I understand your concern and I\'m here to help.',
    'Let me check that information for you right away.',
    'I apologize for the inconvenience you\'ve experienced.',
    'That\'s a great question. Let me explain...',
    'I can definitely help you with that. Here\'s what we\'ll do...'
  ],
  action: [
    'Update customer account information',
    'Process refund request',
    'Schedule technical support callback',
    'Escalate to supervisor',
    'Create support ticket'
  ],
  decision: [
    'Is the customer satisfied with the solution?',
    'Does this require technical assistance?',
    'Is additional verification needed?',
    'Should this be escalated?',
    'Does the customer need follow-up contact?'
  ],
  end: [
    'Thank you for calling. Have a great day!',
    'Is there anything else I can help you with today?',
    'Your issue has been resolved. You should receive confirmation shortly.',
    'Perfect! Your request has been processed successfully.',
    'Thank you for your patience. Please don\'t hesitate to call if you need help again.'
  ]
};

const TEST_SCENARIOS = [
  {
    id: 'billing-issue',
    name: 'Billing Inquiry',
    description: 'Customer has questions about their monthly bill',
    customerType: 'confused',
    complexity: 'medium',
    expectedSteps: ['greeting', 'question', 'response', 'action', 'end']
  },
  {
    id: 'technical-support',
    name: 'Technical Support',
    description: 'Customer experiencing technical difficulties',
    customerType: 'frustrated',
    complexity: 'high',
    expectedSteps: ['greeting', 'question', 'decision', 'action', 'response', 'end']
  },
  {
    id: 'product-info',
    name: 'Product Information',
    description: 'Customer wants information about services',
    customerType: 'curious',
    complexity: 'low',
    expectedSteps: ['greeting', 'question', 'response', 'end']
  }
];

export default function CallFlowBuilderPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'building' | 'testing' | 'results'>('menu');
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{ type: FlowNodeType; text: string } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [testScenario, setTestScenario] = useState(TEST_SCENARIOS[0]);
  const [gameStats, setGameStats] = useState<GameStats>({
    efficiency: 0,
    customerSatisfaction: 0,
    resolutionRate: 0,
    avgCallTime: 0,
    flowComplexity: 0
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedFlow, setCompletedFlow] = useState<string[]>([]);
  const [flowFeedback, setFlowFeedback] = useState<{message: string, type: 'success' | 'warning' | 'info'} | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const getNodeTypeColor = (type: FlowNodeType) => {
    const colors = {
      greeting: 'bg-green-500/20 text-green-400 border-green-500/30',
      question: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      response: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      action: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      decision: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      end: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[type];
  };

  const getNodeTypeIcon = (type: FlowNodeType) => {
    const icons = {
      greeting: Phone,
      question: MessageSquare,
      response: Headphones,
      action: Play,
      decision: Target,
      end: CheckCircle
    };
    return icons[type];
  };

  const handleDragStart = (type: FlowNodeType, text: string) => {
    setDraggedItem({ type, text });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Calculate position relative to the canvas, accounting for scroll
    const x = e.clientX - rect.left + scrollLeft;
    const y = e.clientY - rect.top + scrollTop;

    // Node dimensions (w-48 = 192px width, approximate height)
    const nodeWidth = 192;
    const nodeHeight = 80;

    // Center the node on the drop point
    const centeredX = Math.max(0, Math.min(x - nodeWidth / 2, rect.width - nodeWidth));
    const centeredY = Math.max(0, Math.min(y - nodeHeight / 2, rect.height - nodeHeight));

    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type: draggedItem.type,
      text: draggedItem.text,
      x: centeredX,
      y: centeredY,
      connections: []
    };

    const updatedNodes = [...flowNodes, newNode];
    setFlowNodes(updatedNodes);
    setDraggedItem(null);
    
    // Reset cursor
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
    
    // Generate initial feedback when nodes are added
    const feedback = generateFlowFeedback(updatedNodes, connections);
    setFlowFeedback(feedback);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Add visual feedback during drag
    if (draggedItem && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      const x = e.clientX - rect.left + scrollLeft;
      const y = e.clientY - rect.top + scrollTop;
      
      setMousePosition({ x, y });
      
      // Update cursor position for visual feedback
      canvasRef.current.style.cursor = 'crosshair';
    }
  };

  const generateFlowSequence = (nodes: FlowNode[], connections: Connection[]) => {
    // Find starting node (greeting type or first node)
    const startNode = nodes.find(node => node.type === 'greeting') || nodes[0];
    if (!startNode) return [];

    const sequence: string[] = [];
    const visited = new Set<string>();
    
    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        sequence.push(node.text);
        
        // Find next connected node
        const nextConnection = connections.find(conn => conn.from === nodeId);
        if (nextConnection) {
          traverse(nextConnection.to);
        }
      }
    };

    traverse(startNode.id);
    return sequence;
  };

  const generateFlowFeedback = (nodes: FlowNode[], connections: Connection[]) => {
    if (nodes.length === 0) return null;
    
    const nodeTypes = nodes.map(n => n.type);
    const hasGreeting = nodeTypes.includes('greeting');
    const hasEnd = nodeTypes.includes('end');
    const connectionCount = connections.length;
    
    if (connectionCount === 0) {
      return {
        message: "Start connecting your nodes to build a conversation flow!",
        type: 'info' as const
      };
    }
    
    if (!hasGreeting) {
      return {
        message: "Consider adding a greeting to start your call flow professionally.",
        type: 'warning' as const
      };
    }
    
    if (!hasEnd) {
      return {
        message: "Don't forget to add an ending to properly close the conversation.",
        type: 'warning' as const
      };
    }
    
    if (connectionCount >= 3 && hasGreeting && hasEnd) {
      return {
        message: "Excellent! Your call flow has a good structure with proper opening and closing.",
        type: 'success' as const
      };
    }
    
    return {
      message: "Good progress! Keep building your flow by connecting more nodes.",
      type: 'info' as const
    };
  };

  const connectNodes = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    
    const existingConnection = connections.find(
      conn => conn.from === fromId && conn.to === toId
    );
    
    if (!existingConnection) {
      const newConnections = [...connections, { from: fromId, to: toId }];
      const updatedNodes = flowNodes.map(node => 
        node.id === fromId 
          ? { ...node, connections: [...node.connections, toId] }
          : node
      );
      
      setConnections(newConnections);
      setFlowNodes(updatedNodes);
      
      // Generate completed flow and feedback
      const flowSequence = generateFlowSequence(updatedNodes, newConnections);
      const feedback = generateFlowFeedback(updatedNodes, newConnections);
      
      setCompletedFlow(flowSequence);
      setFlowFeedback(feedback);
    }
    // Don't reset connectingFrom - allow multiple connections from the same node
  };

  const deleteNode = (nodeId: string) => {
    setFlowNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => conn.from !== nodeId && conn.to !== nodeId));
    setSelectedNode(null);
  };

  const clearCanvas = () => {
    setFlowNodes([]);
    setConnections([]);
    setSelectedNode(null);
    setConnectingFrom(null);
    setIsConnecting(false);
    setCompletedFlow([]);
    setFlowFeedback(null);
    setShowClearDialog(false);
  };

  const testFlow = () => {
    // Simulate flow testing and calculate stats
    const hasGreeting = flowNodes.some(node => node.type === 'greeting');
    const hasEnd = flowNodes.some(node => node.type === 'end');
    const nodeCount = flowNodes.length;
    const connectionCount = connections.length;
    
    // Calculate metrics based on flow structure
    const efficiency = Math.min(100, Math.max(0, 100 - (nodeCount - 4) * 10));
    const customerSatisfaction = hasGreeting && hasEnd ? 85 + Math.random() * 15 : 60 + Math.random() * 20;
    const resolutionRate = nodeCount >= 3 ? 80 + Math.random() * 20 : 60 + Math.random() * 20;
    const avgCallTime = 2 + (nodeCount * 0.5) + Math.random();
    const flowComplexity = (connectionCount / Math.max(nodeCount - 1, 1)) * 100;

    setGameStats({
      efficiency: Math.round(efficiency),
      customerSatisfaction: Math.round(customerSatisfaction),
      resolutionRate: Math.round(resolutionRate),
      avgCallTime: Number(avgCallTime.toFixed(1)),
      flowComplexity: Math.round(flowComplexity)
    });

    setGameState('testing');
    
    // Simulate testing time
    setTimeout(() => {
      setGameState('results');
      setIsCompleted(true);
    }, 3000);
  };

  const startNewFlow = () => {
    clearCanvas();
    setGameState('building');
    setIsCompleted(false);
    setCompletedFlow([]);
    setFlowFeedback(null);
  };

  return (
    <div className="min-h-screen cyber-grid overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <Header />
      
      <div className="pt-16 relative z-10">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center">
                                <Button
                    variant="ghost"
                    onClick={() => {
                      if (gameState === 'building' || gameState === 'testing') {
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
                <Phone className="h-12 w-12 text-green-400 mr-4" />
                <div>
                  <h1 className="text-4xl font-bold gradient-text">Call Flow Builder</h1>
                  <p className="text-gray-400">"Design Perfect Customer Service Flows!"</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Game Menu */}
          {gameState === 'menu' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto text-center space-y-8"
            >
              <Card className="glass-card border-white/10">
                <CardHeader className="pb-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center mr-4">
                      <Phone className="w-8 h-8 text-red-400" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-bold gradient-text mb-2">
                        Welcome to Call Flow Builder!
                      </CardTitle>
                      <CardDescription className="text-gray-300 text-lg">
                        Design perfect customer service call flows with drag & drop interface
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
                          <span className="text-green-400 mr-3 mt-0.5 text-lg">📞</span>
                          <span>Drag conversation pieces from the toolbox to the canvas</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-400 mr-3 mt-0.5 text-lg">🔗</span>
                          <span>Connect flow pieces with arrows to create logical paths</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-purple-400 mr-3 mt-0.5 text-lg">🧪</span>
                          <span>Test your flow with real customer scenarios</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-400 mr-3 mt-0.5 text-lg">📊</span>
                          <span>Get scored on efficiency and customer satisfaction</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-yellow-400 mr-3 mt-0.5 text-lg">🎯</span>
                          <span>Build optimal customer service workflows</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-cyan-400 mr-3 mt-0.5 text-lg">⚡</span>
                          <span>Master process design and efficiency optimization</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="w-5 h-5 text-purple-400" />
                          <h4 className="text-white font-semibold">Skills Assessment</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Customer service flow, problem solving, and logical thinking!</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-orange-400 text-lg">🏗️</span>
                          <h4 className="text-white font-semibold">Process Design</h4>
                        </div>
                        <p className="text-gray-300 text-sm">Learn to create efficient customer service workflows!</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg py-6 h-14"
                    onClick={startNewFlow}
                  >
                    <Play className="h-6 w-6 mr-3" />
                    Start Building
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Game Building Interface */}
          {gameState === 'building' && (
            <div className="space-y-6">
                                    {/* Toolbar */}
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-4">
                          <Button
                            onClick={() => setShowClearDialog(true)}
                            variant="outline"
                            className="border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Clear
                          </Button>
                          {connectingFrom && (
                            <Button
                              onClick={() => {
                                setConnectingFrom(null);
                                setIsConnecting(false);
                              }}
                              variant="outline"
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel Connection
                            </Button>
                          )}
                        </div>
                
                <div className="flex items-center space-x-4">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    Nodes: {flowNodes.length}
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    Connections: {connections.length}
                  </Badge>
                  <Button
                    onClick={testFlow}
                    disabled={flowNodes.length < 2}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Test Flow
                  </Button>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-11 gap-8">
                {/* Toolbox */}
                <div className="lg:col-span-3 space-y-3">
                  <Card className="glass-card border-white/10 h-[600px] overflow-y-auto">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center text-xl">
                        <Plus className="h-5 w-5 mr-2 text-green-400" />
                        Toolbox
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(TOOLBOX_ITEMS).map(([type, items]) => (
                        <div key={type} className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-300 capitalize flex items-center">
                            {React.createElement(getNodeTypeIcon(type as FlowNodeType), { 
                              className: "h-4 w-4 mr-2" 
                            })}
                            {type}
                          </h4>
                          {items.map((item, index) => (
                            <div
                              key={index}
                              draggable
                              onDragStart={() => handleDragStart(type as FlowNodeType, item)}
                              className={`p-3 rounded-lg cursor-move hover:scale-105 transition-transform ${getNodeTypeColor(type as FlowNodeType)} text-sm leading-relaxed`}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Canvas */}
                <div className="lg:col-span-5">
                                      <Card className="glass-card border-white/10 h-[600px]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center text-xl">
                        <Target className="h-5 w-5 mr-2 text-blue-400" />
                        Flow Canvas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div
                        ref={canvasRef}
                        className="relative w-full h-[540px] bg-gray-900/20 rounded-lg overflow-hidden"
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={(e) => {
                          if (canvasRef.current && !canvasRef.current.contains(e.relatedTarget as Node)) {
                            canvasRef.current.style.cursor = 'default';
                          }
                        }}
                      >
                        {flowNodes.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            <div className="text-center">
                              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                              <p>Drag items from the toolbox to start building your flow</p>
                            </div>
                          </div>
                        )}

                        {connectingFrom && (
                          <div className="absolute top-2 right-2 bg-yellow-500/20 border border-yellow-500/50 rounded-md p-2 text-yellow-300 text-xs z-10">
                            🔗 Click another node to connect
                          </div>
                        )}

                        {/* Drop indicator */}
                        {draggedItem && (
                          <div 
                            className="absolute border-2 border-dashed border-green-400 bg-green-400/10 rounded-lg w-48 h-20 pointer-events-none z-10 opacity-50"
                            style={{
                              left: `${Math.max(0, Math.min(mousePosition.x - 96, 540 - 192))}px`,
                              top: `${Math.max(0, Math.min(mousePosition.y - 40, 540 - 80))}px`
                            }}
                          >
                            <div className="flex items-center justify-center h-full text-green-400 text-xs">
                              Drop here
                            </div>
                          </div>
                        )}

                        {/* Render connections */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                          {connections.map((connection, index) => {
                            const fromNode = flowNodes.find(n => n.id === connection.from);
                            const toNode = flowNodes.find(n => n.id === connection.to);
                            if (!fromNode || !toNode) return null;

                            const x1 = fromNode.x + 100;
                            const y1 = fromNode.y + 25;
                            const x2 = toNode.x;
                            const y2 = toNode.y + 25;

                            return (
                              <g key={index}>
                                <line
                                  x1={x1}
                                  y1={y1}
                                  x2={x2}
                                  y2={y2}
                                  stroke="#10b981"
                                  strokeWidth="2"
                                  markerEnd="url(#arrowhead)"
                                />
                              </g>
                            );
                          })}
                          <defs>
                            <marker
                              id="arrowhead"
                              markerWidth="10"
                              markerHeight="7"
                              refX="10"
                              refY="3.5"
                              orient="auto"
                            >
                              <polygon
                                points="0 0, 10 3.5, 0 7"
                                fill="#10b981"
                              />
                            </marker>
                          </defs>
                        </svg>

                        {/* Render nodes */}
                        {flowNodes.map((node) => (
                          <div
                            key={node.id}
                            className={`absolute w-48 p-2 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              getNodeTypeColor(node.type)
                            } ${
                              selectedNode === node.id ? 'ring-2 ring-white/50' : ''
                            } ${
                              connectingFrom === node.id ? 'ring-2 ring-yellow-400' : ''
                            } ${
                              connectingFrom && connectingFrom !== node.id && !connections.find(conn => conn.from === connectingFrom && conn.to === node.id) ? 'ring-2 ring-green-400' : ''
                            } ${
                              connectingFrom && connectingFrom !== node.id && connections.find(conn => conn.from === connectingFrom && conn.to === node.id) ? 'ring-2 ring-gray-400 opacity-50' : ''
                            } hover:scale-105`}
                            style={{ left: node.x, top: node.y }}
                            onClick={() => {
                              if (connectingFrom && connectingFrom !== node.id) {
                                connectNodes(connectingFrom, node.id);
                              } else {
                                setSelectedNode(selectedNode === node.id ? null : node.id);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                {React.createElement(getNodeTypeIcon(node.type), { 
                                  className: "h-3 w-3 mr-1" 
                                })}
                                <span className="text-xs font-medium capitalize">{node.type}</span>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (connectingFrom && connectingFrom !== node.id) {
                                      // If we're in connection mode and this is a different node, connect them
                                      connectNodes(connectingFrom, node.id);
                                    } else {
                                      // Otherwise, toggle connection mode for this node
                                      setConnectingFrom(connectingFrom === node.id ? null : node.id);
                                      setIsConnecting(connectingFrom !== node.id);
                                    }
                                  }}
                                  className={`text-xs p-1 hover:bg-white/10 rounded ${
                                    connectingFrom === node.id ? 'bg-yellow-500/30' : ''
                                  } ${
                                    connectingFrom && connectingFrom !== node.id && connections.find(conn => conn.from === connectingFrom && conn.to === node.id) ? 'opacity-50' : ''
                                  }`}
                                  title={
                                    connectingFrom === node.id 
                                      ? "Click another node to connect, or click again to cancel" 
                                      : connectingFrom && connections.find(conn => conn.from === connectingFrom && conn.to === node.id)
                                        ? "Already connected"
                                        : "Click to start connecting from this node"
                                  }
                                  disabled={!!(connectingFrom && connectingFrom !== node.id && connections.find(conn => conn.from === connectingFrom && conn.to === node.id))}
                                >
                                  <Link className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNode(node.id);
                                  }}
                                  className="text-xs p-1 hover:bg-white/10 rounded text-red-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-xs leading-tight">{node.text}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Flow Display Section */}
                <div className="lg:col-span-3 space-y-8">
                  {/* Completed Flow */}
                  {completedFlow.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="glass-card border-white/10 min-h-[250px]">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                            Conversation Flow
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                          {completedFlow.map((step, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-500/20 border border-blue-500/30 rounded-full flex items-center justify-center text-xs text-blue-400 font-medium">
                                {index + 1}
                              </div>
                              <p className="text-gray-300 text-base leading-relaxed">
                                {step}
                              </p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Feedback */}
                  {flowFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="glass-card border-white/10 min-h-[200px]">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Brain className="h-5 w-5 mr-2 text-purple-400" />
                            AI Feedback
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className={`p-4 rounded-lg border ${
                            flowFeedback.type === 'success' 
                              ? 'bg-green-500/20 border-green-500/30 text-green-300'
                              : flowFeedback.type === 'warning'
                              ? 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300'
                              : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
                          }`}>
                            <div className="flex items-start space-x-2">
                              <div className="flex-shrink-0 mt-0.5">
                                {flowFeedback.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                                {flowFeedback.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                                {flowFeedback.type === 'info' && <Lightbulb className="h-4 w-4" />}
                              </div>
                              <p className="text-base">{flowFeedback.message}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Placeholder when no flow */}
                  {completedFlow.length === 0 && !flowFeedback && (
                    <Card className="glass-card border-white/10">
                      <CardContent className="py-8 text-center">
                        <MessageSquare className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-base">
                          Start building your flow to see the conversation preview here
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>


            </div>
          )}

          {/* Testing State */}
          {gameState === 'testing' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center"
            >
              <Card className="glass-card border-white/10">
                <CardContent className="py-16">
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
                        <Clock className="h-10 w-10 text-blue-400 animate-spin" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Testing Your Flow</h3>
                      <p className="text-gray-400">Running simulations with {testScenario.name}...</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-gray-500">Analyzing conversation paths</div>
                      <div className="text-sm text-gray-500">Measuring efficiency metrics</div>
                      <div className="text-sm text-gray-500">Calculating customer satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          {gameState === 'results' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <Card className="glass-card border-white/10">
                <CardHeader className="pb-6">
                  <CardTitle className="text-center text-white flex items-center justify-center gap-4 text-3xl">
                    <Trophy className="h-10 w-10 text-yellow-400" />
                    Flow Performance Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid md:grid-cols-3 gap-8">
                    {/* Overall Score */}
                    <div className="text-center">
                      <div className="text-6xl font-bold text-yellow-400 mb-4">
                        {Math.round((gameStats.efficiency + gameStats.customerSatisfaction + gameStats.resolutionRate) / 3)}
                      </div>
                      <div className="text-lg text-gray-400">Overall Score</div>
                      <Badge className="mt-4 text-lg px-4 py-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        {Math.round((gameStats.efficiency + gameStats.customerSatisfaction + gameStats.resolutionRate) / 3) >= 80 ? 'Excellent' : 
                         Math.round((gameStats.efficiency + gameStats.customerSatisfaction + gameStats.resolutionRate) / 3) >= 70 ? 'Good' : 
                         'Needs Improvement'}
                      </Badge>
                    </div>

                    {/* Detailed Metrics */}
                    <div className="md:col-span-2 space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                          <div className="text-3xl font-bold text-green-400">{gameStats.efficiency}%</div>
                          <div className="text-lg text-gray-400">Flow Efficiency</div>
                        </div>
                        <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                          <div className="text-3xl font-bold text-blue-400">{gameStats.customerSatisfaction}%</div>
                          <div className="text-lg text-gray-400">Customer Satisfaction</div>
                        </div>
                        <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                          <div className="text-3xl font-bold text-purple-400">{gameStats.resolutionRate}%</div>
                          <div className="text-lg text-gray-400">Resolution Rate</div>
                        </div>
                        <div className="text-center p-6 bg-gray-800/30 rounded-lg">
                          <div className="text-3xl font-bold text-orange-400">{gameStats.avgCallTime}m</div>
                          <div className="text-lg text-gray-400">Avg Call Time</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
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
                        title: 'My Call Flow Builder Results',
                        text: `I achieved ${Math.round((gameStats.efficiency + gameStats.customerSatisfaction + gameStats.resolutionRate) / 3)}% overall score with ${gameStats.efficiency}% efficiency!`,
                        url: window.location.href
                      });
                    } else {
                      // Fallback: copy to clipboard
                      navigator.clipboard.writeText(`My Call Flow Builder Results: ${Math.round((gameStats.efficiency + gameStats.customerSatisfaction + gameStats.resolutionRate) / 3)}% overall score with ${gameStats.efficiency}% efficiency!`);
                    }
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
                  onClick={startNewFlow}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Take Again
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Clear Canvas Alert Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent className="bg-black border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Clear Canvas</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to clear the canvas? This will remove all nodes and connections you've created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={clearCanvas}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Clear Canvas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Exit Game Alert Dialog */}
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
              onClick={() => router.back()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Exit Game
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
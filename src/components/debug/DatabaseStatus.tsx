'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ConnectionTest {
  name: string
  status: 'loading' | 'success' | 'error' | 'pending'
  message: string

  details?: unknown

}

export default function DatabaseStatus() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: 'Environment Variables', status: 'pending', message: 'Not checked' },
    { name: 'Supabase Client', status: 'pending', message: 'Not checked' },
    { name: 'Database Connection', status: 'pending', message: 'Not checked' },
    { name: 'Auth Service', status: 'pending', message: 'Not checked' },
  ])

  const runTests = async () => {
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'loading' as const, message: 'Testing...' })))

    // Test 1: Environment Variables
    const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!envUrl || !envKey) {
      setTests(prev => prev.map(test => 
        test.name === 'Environment Variables' 
          ? { 
              ...test, 
              status: 'error' as const, 
              message: 'Missing environment variables',
              details: {
                url: envUrl ? '✅ Set' : '❌ Missing NEXT_PUBLIC_SUPABASE_URL',
                key: envKey ? '✅ Set' : '❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY'
              }
            }
          : test
      ))
      return
    }

    // Validate URL format
    let validUrl = false
    try {
      const url = new URL(envUrl)
      validUrl = url.hostname.includes('supabase.co')
    } catch (e) {
      validUrl = false
    }

    setTests(prev => prev.map(test => 
      test.name === 'Environment Variables' 
        ? { 
            ...test, 
            status: validUrl ? 'success' as const : 'error' as const,
            message: validUrl ? 'Environment variables loaded correctly' : 'Invalid Supabase URL format',
            details: {
              url: envUrl,
              urlValid: validUrl,
              keyLength: envKey.length,
              keyStartsWithEyJ: envKey.startsWith('eyJ')
            }
          }
        : test
    ))

    if (!validUrl) return

    // Test 2: Supabase Client
    try {
      const client = supabase
      setTests(prev => prev.map(test => 
        test.name === 'Supabase Client' 
          ? { 
              ...test, 
              status: 'success' as const,
              message: 'Supabase client initialized successfully'
            }
          : test
      ))
    } catch (error) {
      setTests(prev => prev.map(test => 
        test.name === 'Supabase Client' 
          ? { 
              ...test, 
              status: 'error' as const,
              message: `Client initialization failed: ${error}`,
              details: error
            }
          : test
      ))
      return
    }

    // Test 3: Database Connection
    try {
      const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1)
      
      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        // Table doesn't exist, but connection works - this is expected for new projects
        setTests(prev => prev.map(test => 
          test.name === 'Database Connection' 
            ? { 
                ...test, 
                status: 'success' as const,
                message: 'Database connection successful (table not found is expected for new projects)'
              }
            : test
        ))
      } else if (error && error.code === 'PGRST301') {
        // JWT expired or invalid
        setTests(prev => prev.map(test => 
          test.name === 'Database Connection' 
            ? { 
                ...test, 
                status: 'error' as const,
                message: `Authentication error: ${error.message}`,
                details: error
              }
            : test
        ))
      } else if (error) {
        setTests(prev => prev.map(test => 
          test.name === 'Database Connection' 
            ? { 
                ...test, 
                status: 'error' as const,
                message: `Database error: ${error.message}`,
                details: error
              }
            : test
        ))
      } else {
        setTests(prev => prev.map(test => 
          test.name === 'Database Connection' 
            ? { 
                ...test, 
                status: 'success' as const,
                message: 'Database connection successful'
              }
            : test
        ))
      }
    } catch (error) {
      setTests(prev => prev.map(test => 
        test.name === 'Database Connection' 
          ? { 
              ...test, 
              status: 'error' as const,
              message: `Connection failed: ${error}`,
              details: error
            }
          : test
      ))
    }

    // Test 4: Auth Service
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setTests(prev => prev.map(test => 
          test.name === 'Auth Service' 
            ? { 
                ...test, 
                status: 'error' as const,
                message: `Auth error: ${error.message}`,
                details: error
              }
            : test
        ))
      } else {
        setTests(prev => prev.map(test => 
          test.name === 'Auth Service' 
            ? { 
                ...test, 
                status: 'success' as const,
                message: 'Auth service working correctly'
              }
            : test
        ))
      }
    } catch (error) {
      setTests(prev => prev.map(test => 
        test.name === 'Auth Service' 
          ? { 
              ...test, 
              status: 'error' as const,
              message: `Auth service failed: ${error}`,
              details: error
            }
          : test
      ))
    }
  }

  useEffect(() => {
    if (isExpanded) {
      runTests()
    }
  }, [isExpanded])

  const getStatusIcon = (status: ConnectionTest['status']) => {
    switch (status) {
      case 'loading': return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    const hasError = tests.some(test => test.status === 'error')
    const allSuccess = tests.every(test => test.status === 'success')
    const isLoading = tests.some(test => test.status === 'loading')

    if (isLoading) return <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">Checking...</Badge>
    if (hasError) return <Badge variant="destructive" className="bg-red-500/20 text-red-400">Connection Issues</Badge>
    if (allSuccess) return <Badge variant="secondary" className="bg-green-500/20 text-green-400">Connected</Badge>
    return <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">Not Tested</Badge>
  }

  const maskCredential = (credential: string) => {
    if (!credential) return 'Not set'
    if (credential.length < 20) return credential
    return credential.slice(0, 10) + '...' + credential.slice(-10)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl"
    >
      <Card className="glass-card border-white/20">
        <CardHeader 
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-cyan-400" />
              <div>
                <CardTitle className="text-white">Database Connection Status</CardTitle>
                <p className="text-sm text-gray-400">Click to check Supabase connection</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <AlertCircle className="w-5 h-5 text-gray-400" />
              </motion.div>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Connection Tests</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={runTests}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Run Tests
              </Button>
            </div>

            {/* Test Results */}
            <div className="space-y-3">
              {tests.map((test, index) => (
                <motion.div
                  key={test.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium text-white">{test.name}</div>
                      <div className="text-sm text-gray-400">{test.message}</div>
                    </div>
                  </div>

                  {test.details !== undefined && test.details !== null && (
                                         <details className="text-xs text-gray-500">
                       <summary className="cursor-pointer">Details</summary>
                       <pre className="mt-2 p-2 bg-black/20 rounded text-xs overflow-auto">
                         {String(JSON.stringify(test.details || {}, null, 2))}
                       </pre>
                     </details>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Environment Variables Display */}
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-white">Environment Variables</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="text-gray-400 hover:text-white"
                >
                  {showCredentials ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">NEXT_PUBLIC_SUPABASE_URL:</span>
                  <span className="text-white font-mono">
                    {showCredentials 
                      ? process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'
                      : maskCredential(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                  <span className="text-white font-mono">
                    {showCredentials 
                      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'Not set'
                      : maskCredential(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-medium text-yellow-400 mb-2">Troubleshooting Tips</h4>
              <ul className="text-sm text-yellow-200 space-y-1">
                <li>• Make sure your .env.local file is in the project root</li>
                <li>• Restart your dev server after changing environment variables</li>
                <li>• URL should be: https://[project-id].supabase.co</li>
                <li>• Use the &quot;anon public&quot; key, NOT &quot;service_role secret&quot;</li>
                <li>• &quot;Table not found&quot; errors are normal for new projects</li>
                <li>• Check Supabase dashboard for correct credentials</li>
              </ul>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
} 
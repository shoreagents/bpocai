'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import { Wrench, Construction } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AdminLayout from '@/components/layout/AdminLayout'

export default function AssessmentManagePage({ params }: { params: Promise<{ assessment: string }> }) {
  const resolvedParams = use(params)

  const formatAssessmentName = (assessmentName: string) => {
    return assessmentName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <AdminLayout
      title={`Manage ${formatAssessmentName(resolvedParams.assessment)} Assessment`}
      description="Assessment management and configuration"
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card border-white/10">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                  <Construction className="w-10 h-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Under Development
              </CardTitle>
              <p className="text-gray-300 text-lg">
                The {formatAssessmentName(resolvedParams.assessment)} Assessment is currently being developed.
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <Wrench className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">
                  Coming Soon
                </h3>
                                 <p className="text-gray-400 mb-4">
                   Our team is working hard to create a comprehensive assessment experience.
                 </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  )
}

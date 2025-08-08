'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AssessmentRedirect({ params }: { params: { assessment: string } }) {
  const router = useRouter()

  useEffect(() => {
    router.push(`/admin/career-tools-management/assessments/${params.assessment}/manage`)
  }, [params.assessment, router])

  return null
}

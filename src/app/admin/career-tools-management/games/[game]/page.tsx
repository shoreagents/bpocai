'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GameRedirect({ params }: { params: { game: string } }) {
  const router = useRouter()

  useEffect(() => {
    router.push(`/admin/career-tools-management/games/${params.game}/manage`)
  }, [params.game, router])

  return null
}

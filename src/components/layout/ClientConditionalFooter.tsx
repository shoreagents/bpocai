'use client'

import Footer from './Footer'
import { usePathname } from 'next/navigation'

export default function ClientConditionalFooter() {
  const pathname = usePathname()
  if (!pathname) return null
  if (pathname.startsWith('/admin')) return null
  return <Footer />
}



import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/database'

// Company name mapping for frontend display
const getDisplayCompanyName = (dbCompanyName: string): string => {
  const companyMappings: { [key: string]: string } = {
    'UrbanX Pty Ltd': 'ShoreAgents',
    'ShoreAgentss': 'ShoreAgents',
    'ShoreAgents Inc.': 'ShoreAgents',
    // Add more mappings as needed
  }
  
  return companyMappings[dbCompanyName] || dbCompanyName
}

export async function GET(request: NextRequest) {
  try {
    // Fetch all companies from members table
    const result = await pool.query(`
      SELECT company_id, company
      FROM members
      ORDER BY company ASC
    `)

    const companies = result.rows.map((row: any) => ({
      company_id: row.company_id,
      company: getDisplayCompanyName(row.company), // Use display name for frontend
      original_company: row.company // Keep original name for reference
    }))

    return NextResponse.json({ companies })
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}

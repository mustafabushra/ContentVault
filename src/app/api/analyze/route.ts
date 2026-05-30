import { NextRequest, NextResponse } from 'next/server'
import { analyzeContent } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const { url, title, description } = await req.json()
    const analysis = await analyzeContent(url, title, description)
    return NextResponse.json(analysis)
  } catch (e) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}

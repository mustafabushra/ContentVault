import { NextRequest, NextResponse } from 'next/server'
import { generateContent } from '@/lib/groq'

export async function POST(req: NextRequest) {
  try {
    const { type, analysis, originalContent } = await req.json()
    const content = await generateContent(type, analysis, originalContent)
    return NextResponse.json({ content })
  } catch (e) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}

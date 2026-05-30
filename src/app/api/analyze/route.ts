import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const PLATFORM_MAP: Record<string, string> = {
  instagram: 'instagram', tiktok: 'tiktok', twitter: 'twitter',
  youtube: 'youtube', linkedin: 'linkedin', facebook: 'facebook',
}

async function tryAnalyze(url: string, title: string, description: string, attempt = 0): Promise<Record<string, unknown>> {
  const prompt = `أنت محلل محتوى رقمي متخصص في السوشيال ميديا العربية.

حلّل هذا المحتوى وأعد JSON فقط (بدون أي نص إضافي):

العنوان: ${title}
الوصف: ${description || 'غير متوفر'}
الرابط: ${url || 'غير متوفر'}

{
  "topic": "الموضوع الرئيسي في جملة قصيرة",
  "hook": "الجملة الجاذبة الأقوى في المحتوى",
  "format": "نوع المحتوى: ريلز أو فيديو أو مقال أو خيط أو كابشن",
  "mood": "مزاج المحتوى: تحفيزي أو تعليمي أو ترفيهي أو إخباري أو عملي",
  "tags": ["3 وسوم عربية مناسبة"],
  "platform": "المنصة الأنسب: instagram أو tiktok أو youtube أو twitter أو web"
}`

  const res = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
    max_tokens: 300,
    response_format: { type: 'json_object' },
  })

  const text = res.choices[0]?.message?.content ?? '{}'
  return JSON.parse(text)
}

export async function POST(req: NextRequest) {
  try {
    const { url, title, description } = await req.json()

    if (!title && !description) {
      return NextResponse.json({
        topic: 'محتوى محفوظ', hook: '', format: 'محتوى',
        mood: 'عام', tags: [], platform: 'web',
      })
    }

    // Retry up to 2 times
    let lastError: Error | null = null
    for (let i = 0; i < 2; i++) {
      try {
        const analysis = await tryAnalyze(url ?? '', title ?? '', description ?? '', i)
        // Validate platform value
        if (analysis.platform && !PLATFORM_MAP[analysis.platform as string]) {
          analysis.platform = 'web'
        }
        return NextResponse.json(analysis)
      } catch (e) {
        lastError = e as Error
        if (i === 0) await new Promise(r => setTimeout(r, 800))
      }
    }

    console.error('Groq analyze failed:', lastError)
    return NextResponse.json({
      topic: title?.substring(0, 60) ?? 'محتوى',
      hook: '', format: 'محتوى', mood: 'عام', tags: [], platform: 'web',
    })
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

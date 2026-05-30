import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function analyzeContent(title: string, description: string, url: string) {
  const prompt = `أنت محلل محتوى رقمي. قم بتحليل هذا المحتوى وأعد JSON فقط بهذا الشكل:
{
  "topic": "الموضوع الرئيسي",
  "hook": "ما الذي يجعل هذا المحتوى جذاباً",
  "format": "نوع الفورمات (فيديو/مقال/بودكاست/صورة)",
  "mood": "المزاج (تحفيزي/تعليمي/ترفيهي/إخباري)",
  "tags": ["وسم1", "وسم2", "وسم3"],
  "platform": "المنصة المناسبة (instagram/tiktok/youtube/twitter/web)"
}

العنوان: ${title}
الوصف: ${description}
الرابط: ${url}`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  return JSON.parse(completion.choices[0].message.content || '{}')
}

export async function generateContent(
  type: 'caption' | 'hook' | 'script' | 'thread',
  title: string,
  analysis: Record<string, unknown>
) {
  const typeMap = {
    caption: 'كابشن لوسائل التواصل الاجتماعي',
    hook: 'هوك جذاب لأول 3 ثوانٍ',
    script: 'سكريبت فيديو قصير (60 ثانية)',
    thread: 'خيط تويتر (5 تغريدات)',
  }

  const prompt = `أنت كاتب محتوى إبداعي عربي. اكتب ${typeMap[type]} بناءً على:
العنوان: ${title}
الموضوع: ${analysis.topic}
المزاج: ${analysis.mood}
اكتب بالعربية فقط، وكن إبداعياً وجذاباً.`

  const completion = await groq.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
  })

  return completion.choices[0].message.content || ''
}

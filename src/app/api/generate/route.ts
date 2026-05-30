import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const TYPE_PROMPTS: Record<string, string> = {
  caption: `اكتب كابشن احترافي لمنصات السوشيال ميديا. المتطلبات:
- 100-150 كلمة
- ابدأ بجملة جاذبة
- أضف 3-4 نقاط قيمة
- أنهِ بـ CTA واضح
- أضف 5 هاشتاقات مناسبة في النهاية`,

  hook: `اكتب هوك لافت للانتباه. المتطلبات:
- جملة واحدة فقط (15-25 كلمة)
- تبدأ بسؤال أو تحدٍّ أو مفاجأة
- يجعل المشاهد يتوقف في أول 3 ثوانٍ`,

  script: `اكتب سكريبت لفيديو قصير (60 ثانية). الهيكل:
[0-5ث] الهوك: جملة جاذبة
[5-15ث] المشكلة: ما الألم الذي يشعر به المشاهد؟
[15-45ث] الحل: 3 نقاط عملية سريعة
[45-55ث] النتيجة: ما الفائدة؟
[55-60ث] الـ CTA: ماذا يفعل المشاهد؟`,

  thread: `اكتب خيط تويتر من 5 تغريدات. المتطلبات:
- التغريدة الأولى: هوك لا يُقاوم
- 3 تغريدات وسطى: معلومة/فكرة/نقطة قيمة
- التغريدة الأخيرة: خلاصة + CTA
- كل تغريدة أقل من 280 حرف
- افصل بين التغريدات بـ ---`,
}

export async function POST(req: NextRequest) {
  try {
    const { type, title, analysis } = await req.json()

    const typePrompt = TYPE_PROMPTS[type] ?? TYPE_PROMPTS.caption

    const prompt = `${typePrompt}

المعلومات المتاحة:
العنوان: ${title ?? ''}
الموضوع: ${analysis?.topic ?? ''}
المزاج: ${analysis?.mood ?? ''}
الهوك الأصلي: ${analysis?.hook ?? ''}

اكتب بالعربية فقط. اجعل المحتوى إبداعياً وجذاباً ومناسباً للجمهور العربي.`

    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75,
      max_tokens: 600,
    })

    const content = res.choices[0]?.message?.content ?? ''
    return NextResponse.json({ content })
  } catch (e) {
    console.error('Generate error:', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ContentVaultBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()

    // Extract meta tags
    const getTag = (name: string) => {
      const patterns = [
        new RegExp(`<meta[^>]*property=["']og:${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${name}["']`, 'i'),
        new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["']`, 'i'),
      ]
      for (const p of patterns) {
        const m = html.match(p)
        if (m) return m[1]
      }
      return ''
    }

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)

    const platform = detectPlatform(url)

    return NextResponse.json({
      title: getTag('title') || titleMatch?.[1] || url,
      description: getTag('description') || '',
      thumbnail: getTag('image') || '',
      platform,
      url,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 })
  }
}

function detectPlatform(url: string): string {
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('linkedin.com')) return 'linkedin'
  if (url.includes('facebook.com')) return 'facebook'
  return 'web'
}

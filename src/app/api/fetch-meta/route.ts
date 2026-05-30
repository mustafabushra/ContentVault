import { NextRequest, NextResponse } from 'next/server'

function detectPlatform(url: string): string {
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('tiktok.com'))    return 'tiktok'
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('linkedin.com')) return 'linkedin'
  if (url.includes('facebook.com')) return 'facebook'
  return 'web'
}

function extractTitle(html: string, url: string): string {
  const patterns = [
    /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i,
    /<meta[^>]*name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ]
  for (const p of patterns) {
    const m = html.match(p)
    if (m?.[1]?.trim()) return m[1].trim()
  }
  // Fallback: use domain as title
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

function extractMeta(html: string, prop: string): string {
  const patterns = [
    new RegExp(`<meta[^>]*property=["']og:${prop}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${prop}["']`, 'i'),
    new RegExp(`<meta[^>]*name=["'](twitter:)?${prop}["'][^>]*content=["']([^"']+)["']`, 'i'),
  ]
  for (const p of patterns) {
    const m = html.match(p)
    const val = m?.[1] || m?.[2]
    if (val?.trim()) return val.trim()
  }
  return ''
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url?.trim()) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  const platform = detectPlatform(url)

  // For platforms that block scraping, return minimal data immediately
  if (['instagram', 'tiktok', 'twitter'].includes(platform)) {
    return NextResponse.json({
      url, platform,
      title: getPlatformTitle(url, platform),
      description: '',
      thumbnail: '',
    })
  }

  // Try to fetch metadata for other URLs
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 6000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ar,en;q=0.9',
      },
    })
    clearTimeout(timeout)

    const html = await res.text()
    return NextResponse.json({
      url,
      platform,
      title:       extractTitle(html, url),
      description: extractMeta(html, 'description'),
      thumbnail:   extractMeta(html, 'image'),
    })
  } catch {
    // If fetch fails, return minimal data — save will still work
    return NextResponse.json({
      url, platform,
      title:       getPlatformTitle(url, platform),
      description: '',
      thumbnail:   '',
    })
  }
}

function getPlatformTitle(url: string, platform: string): string {
  const labels: Record<string, string> = {
    instagram: 'منشور إنستقرام',
    tiktok:    'فيديو تيك توك',
    twitter:   'تغريدة تويتر',
    youtube:   'فيديو يوتيوب',
    linkedin:  'منشور لينكدإن',
    facebook:  'منشور فيسبوك',
  }
  // Try to extract video ID or username from URL for a better title
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length > 0) {
      return `${labels[platform] || 'محتوى'} — ${parts[parts.length - 1].substring(0, 30)}`
    }
  } catch {}
  return labels[platform] || 'محتوى محفوظ'
}

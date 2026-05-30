import { NextRequest, NextResponse } from 'next/server'

function detectPlatform(url: string) {
  if (url.includes('instagram.com'))                        return 'instagram'
  if (url.includes('tiktok.com'))                          return 'tiktok'
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('linkedin.com'))                        return 'linkedin'
  if (url.includes('facebook.com'))                        return 'facebook'
  return 'web'
}

// oEmbed endpoints — free, no auth needed
async function fetchOembed(url: string, platform: string) {
  const endpoints: Record<string, string> = {
    tiktok:  `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    youtube: `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`,
    twitter: `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`,
  }

  const endpoint = endpoints[platform]
  if (!endpoint) return null

  try {
    const res = await fetch(endpoint, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// YouTube — extract video ID and get description from page
async function fetchYouTubeMeta(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
      signal: AbortSignal.timeout(6000),
    })
    const html = await res.text()

    const desc = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/)?.[1]
      ?.replace(/\\n/g, '\n').replace(/\\"/g, '"').substring(0, 500) ?? ''
    const tags = [...html.matchAll(/"keywords":\[(.*?)\]/g)]
      .map(m => m[1].replace(/"/g, '').split(',').slice(0, 5))[0] ?? []

    return { description: desc, tags }
  } catch {
    return { description: '', tags: [] }
  }
}

// Generic page scraper for web URLs
async function fetchWebMeta(url: string) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0', Accept: 'text/html' },
      signal: AbortSignal.timeout(6000),
    })
    const html = await res.text()

    const get = (prop: string) => {
      const patterns = [
        new RegExp(`<meta[^>]*property=["']og:${prop}["'][^>]*content=["']([^"']{1,500})["']`, 'i'),
        new RegExp(`<meta[^>]*content=["']([^"']{1,500})["'][^>]*property=["']og:${prop}["']`, 'i'),
        new RegExp(`<meta[^>]*name=["'](twitter:)?${prop}["'][^>]*content=["']([^"']{1,500})["']`, 'i'),
      ]
      for (const p of patterns) {
        const m = html.match(p)
        const v = m?.[1] ?? m?.[2]
        if (v?.trim()) return v.trim()
      }
      return ''
    }

    const titleMatch = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)

    return {
      title:       get('title') || titleMatch?.[1]?.trim() || '',
      description: get('description'),
      thumbnail:   get('image'),
    }
  } catch {
    return { title: '', description: '', thumbnail: '' }
  }
}

export async function POST(req: NextRequest) {
  const { url } = await req.json()
  if (!url?.trim()) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  const platform = detectPlatform(url)

  // ─── TikTok ───────────────────────────────────────────────
  if (platform === 'tiktok') {
    const oembed = await fetchOembed(url, 'tiktok')
    return NextResponse.json({
      url, platform,
      title:       oembed?.title ?? 'فيديو تيك توك',
      description: oembed?.author_name ? `بواسطة @${oembed.author_name}` : '',
      thumbnail:   oembed?.thumbnail_url ?? '',
      author:      oembed?.author_name ?? '',
    })
  }

  // ─── YouTube ──────────────────────────────────────────────
  if (platform === 'youtube') {
    const [oembed, extra] = await Promise.all([
      fetchOembed(url, 'youtube'),
      fetchYouTubeMeta(url),
    ])
    return NextResponse.json({
      url, platform,
      title:       oembed?.title ?? 'فيديو يوتيوب',
      description: extra.description,
      thumbnail:   oembed?.thumbnail_url ?? '',
      author:      oembed?.author_name ?? '',
      tags:        extra.tags,
    })
  }

  // ─── Twitter/X ────────────────────────────────────────────
  if (platform === 'twitter') {
    const oembed = await fetchOembed(url, 'twitter')
    // oembed.html contains the tweet text in HTML
    const tweetText = oembed?.html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? ''
    const hashtags = [...tweetText.matchAll(/#(\w+)/g)].map(m => m[1])

    return NextResponse.json({
      url, platform,
      title:       tweetText.substring(0, 120) || 'تغريدة',
      description: tweetText,
      thumbnail:   '',
      author:      oembed?.author_name ?? '',
      tags:        hashtags.slice(0, 5),
    })
  }

  // ─── Instagram ────────────────────────────────────────────
  if (platform === 'instagram') {
    // Instagram blocks scraping — return minimal data
    // User will fill description manually or via share sheet
    return NextResponse.json({
      url, platform,
      title:       'منشور إنستقرام',
      description: '',
      thumbnail:   '',
      needsManualDescription: true, // hint to UI
    })
  }

  // ─── Web / LinkedIn / Facebook ────────────────────────────
  const meta = await fetchWebMeta(url)
  return NextResponse.json({
    url, platform,
    title:       meta.title || new URL(url).hostname,
    description: meta.description,
    thumbnail:   meta.thumbnail,
  })
}

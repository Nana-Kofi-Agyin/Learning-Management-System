'use client'

import { useState } from 'react'
import Image from 'next/image'
import { extractYouTubeId } from '@/lib/youtube'

type YouTubePlayerProps = {
  youtubeUrl: string | null
  title: string
}

export default function YouTubePlayer({ youtubeUrl, title }: YouTubePlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const videoId = extractYouTubeId(youtubeUrl)

  if (!videoId) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-black dark:border-slate-800">
      <div className="relative aspect-video w-full">
        {isLoaded ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsLoaded(true)}
            aria-label={`Play video: ${title}`}
            className="group relative flex h-full w-full items-center justify-center bg-slate-900 text-white"
          >
            <Image
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt={`Video thumbnail for ${title}`}
              fill
              sizes="(max-width: 1024px) 100vw, 70vw"
              priority
              className="object-cover opacity-80 transition group-hover:opacity-90"
            />
            <div className="relative z-10 flex flex-col items-center gap-2">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900/90 text-xl text-white shadow-lg transition group-hover:scale-105">
                ▶
              </span>
              <span className="rounded bg-black/75 px-3 py-1 text-xs font-medium">
                Tap to load video
              </span>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

import React from 'react'
import { Post } from './SubstationFeedPage'

interface GalleryPostProps {
  post: Post
}

export const GalleryPost: React.FC<GalleryPostProps> = ({ post }) => {
  return (
    <div className="relative max-w-3xl p-4 bg-gray-50">
      <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-green-400" />
      <div className="absolute left-0 -top-0 w-32 h-0.5  bg-green-400" />

      <div className="flex flex-col items-start space-y-4">
        <div className="text-lg tracking-wide underline"> {post.heading} </div>

        <div className="relative w-full">
          <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-gray-50 to-transparent left-0 z-10" />
          <div className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent to-gray-50 right-0 z-10" />
          <div className="relative flex space-x-4 w-full px-8 overflow-x-scroll no-scrollbar">
            {['🍞', '🐼', '🏴', '🦇', '🔊'].map((emoji, i) => (
              <div
                key={`img${i}`}
                className="p-8 aspect-square select-none flex items-center justify-center rounded-lg shadow bg-green-100 text-9xl">
                {emoji}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-start space-y-2">
          <div className="text-lg">{post.content}</div>
        </div>

        <div className="self-end">{post.date}</div>
      </div>
    </div>
  )
}

import React from 'react'
import { AiOutlinePlayCircle } from 'react-icons/ai'
import { Post } from './SubstationFeedPage'

interface VideoPostProps {
  post: Post
}

export const VideoPost: React.FC<VideoPostProps> = ({ post }) => {
  return (
    <div className="relative max-w-3xl p-4 bg-gray-50">
      <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-green-400" />
      <div className="absolute left-0 -top-0 w-32 h-0.5  bg-green-400" />

      <div className="flex flex-col items-start space-y-4">
        <div className="text-lg tracking-wide underline"> {post.heading}</div>

        <a
          className="group relative w-full aspect-video flex items-center justify-center rounded-sm bg-gradient-to-tr from-green-200 to-white"
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          target="_blank"
          rel="noreferrer">
          <AiOutlinePlayCircle className="transition-transform shadow-md group-hover:scale-110 text-9xl bg-green-400 rounded-full text-gray-50 group-hover:text-white z-20" />
          <div className="absolute overflow-hidden font-bold text-green-200 tracking-widest text-9xl break-all inset-0">
            <div className="absolute overflow-hidden font-bold text-9xl transform scale-150 rotate-12 opacity-75 bottom-0 left-10 z-10">
              😱
            </div>
            <div className="absolute overflow-hidden font-bold text-9xl transform scale-150 rotate-180 opacity-75 right-20 -top-0 z-10">
              😱
            </div>
            ????????????? ????????????? ????????????? ?????????????
          </div>
        </a>

        <div className="flex flex-col items-start space-y-2">
          <div className="text-lg uppercase"> description</div>
          <div className="text-lg">{post.content}</div>
        </div>

        <div className="self-end">{post.date}</div>
      </div>
    </div>
  )
}

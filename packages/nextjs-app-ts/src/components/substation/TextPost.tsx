import React from 'react'
import { Post } from './SubstationFeedPage'

interface TextPostProps {
  post: Post
}

export const TextPost: React.FC<TextPostProps> = ({ post }) => {
  return (
    <div className="relative w-full max-w-3xl p-4 bg-gray-50 rounded-md">
      <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-green-400" />
      <div className="absolute left-0 -top-0 w-32 h-0.5  bg-green-400" />

      <div className="flex flex-col items-start space-y-4">
        <div className="text-lg tracking-wide underline"> {post.heading} </div>
        <div className="text-lg">{post.content}</div>
        <div className="self-end">{post.date}</div>
      </div>
    </div>
  )
}

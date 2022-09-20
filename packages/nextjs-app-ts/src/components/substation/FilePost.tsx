import React from 'react'
import { TbFileDownload } from 'react-icons/tb'
import { Post } from './SubstationFeedPage'

interface FilePostProps {
  post: Post
}

export const FilePost: React.FC<FilePostProps> = ({ post }) => {
  return (
    <div className="relative max-w-3xl p-4 bg-gray-50">
      <div className="absolute -left-2 -top-2 w-4 h-4 rounded-full bg-green-400" />
      <div className="absolute left-0 -top-0 w-32 h-0.5  bg-green-400" />

      <div className="flex flex-col items-start space-y-4">
        <div className="text-lg tracking-wide underline">{post.heading}</div>
        <div className="text-lg">{post.content}</div>
        <div className="flex space-x-2">
          <a
            href="https://ipfs.io/ipfs/bafybeiecbvrddbsz6lmjya7ij73rehq5wx5u3kb3g355empm5472ydvlrq"
            target="_blank"
            rel="noreferrer"
            className="flex flex-row items-center px-4 py-2 space-x-2 text-lg border-2 text-gray-800 hover:text-green-400 bg-gray-200 border-gray-800 rounded-lg">
            <TbFileDownload className="text-xl" />
            <div className="tracking-wide">MEVSecrets.sol</div>
          </a>
        </div>

        <div className="self-end">{post.date}</div>
      </div>
    </div>
  )
}

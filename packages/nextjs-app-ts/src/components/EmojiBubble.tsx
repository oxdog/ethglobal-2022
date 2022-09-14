import React from 'react'

interface EmojiBubbleProps {
  emoji: string
}

export const EmojiBubble: React.FC<EmojiBubbleProps> = ({ emoji }) => {
  return (
    <div className="text-5xl bg-gray-200 rounded-full h-24 w-24 flex items-center justify-center pb-1 shadow-md shadow-cyan-400">
      {emoji}
    </div>
  )
}

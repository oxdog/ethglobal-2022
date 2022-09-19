import React from 'react'

interface ClipStringProps {
  maxLength: number
  text: string
}

export const ClipString: React.FC<ClipStringProps> = ({ maxLength, text }) => {
  return (
    <>
      {text.substring(0, maxLength)} {text.length > maxLength && '...'}
    </>
  )
}

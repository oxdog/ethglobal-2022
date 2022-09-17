import React from 'react'

interface LayoutProps {}

export const Layout: React.FC<LayoutProps> = ({}) => {
  return (
    <div className="flex w-screen">
      <div className="fixed bg-green-400 w-80 h-full">sidebar</div>
      <div className="w-full bg-yellow-400">
        <div className="h-screen bg-purple-400">1</div>
        <div className="h-screen bg-purple-400">1</div>
        <div className="h-screen bg-purple-400">1</div>
      </div>
    </div>
  )
}

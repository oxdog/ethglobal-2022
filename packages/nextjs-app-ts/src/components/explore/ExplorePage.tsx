import React from 'react'

interface ExplorePageProps {}

export const ExplorePage: React.FC<ExplorePageProps> = ({}) => {
  return (
    <div className="flex flex-col items-center pt-48">
      explore and stuff ⛰🌋
      <div className="flex flex-wrap gap-8">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div key={`exp${i}`} className="h-72 w-72 p-8 shadwo bg-gray-50 rounded-lg">
              Explore {i}
              explore and stuff ⛰🌋
            </div>
          ))}
      </div>
    </div>
  )
}

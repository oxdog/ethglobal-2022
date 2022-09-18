import React, { ReactNode } from 'react'
import { AiOutlineLoading } from 'react-icons/ai'

interface ButtonProps {
  children?: ReactNode
  onClick: () => any
  loading?: boolean
  variant: 'full' | 'outline'
}

export const Button: React.FC<ButtonProps> = ({ children, onClick, loading, variant = 'full' }) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      type="button"
      className={
        variant === 'full'
          ? 'inline-flex items-center px-6 py-3 border transition-colors border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
          : 'inline-flex items-center px-6 py-3 border transition-colors border-transparent text-base font-medium rounded-full shadow-sm text-gry-800 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
      }>
      {loading && <AiOutlineLoading className="mr-4 animate-spin text-lg" />}
      {children}
    </button>
  )
}

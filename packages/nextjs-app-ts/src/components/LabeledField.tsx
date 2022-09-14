import React, { ReactNode } from 'react'

interface LabeledFieldProps {
  label: string
  children?: ReactNode
}

export const LabeledField: React.FC<LabeledFieldProps> = ({ label, children }) => (
  <div className="flex flex-col justify-start">
    <div className="">{label}</div>
    <div className="text-4xl">{children}</div>
  </div>
)

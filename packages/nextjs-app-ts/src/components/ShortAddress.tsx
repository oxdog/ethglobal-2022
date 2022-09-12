import React from 'react'

interface ShortAddressProps {
  address: string
}

export const ShortAddress: React.FC<ShortAddressProps> = ({ address }) => {
  return <>{address.substring(0, 6) + '...' + address.substring(address.length - 4)}</>
}

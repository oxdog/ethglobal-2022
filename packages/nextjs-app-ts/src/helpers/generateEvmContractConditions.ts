const functionAbi = {
  name: 'getPassdataViaAddress',
  inputs: [
    {
      name: '',
      type: 'address',
    },
  ],
  outputs: [
    {
      name: 'active',
      type: 'bool',
    },
    {
      name: 'tier',
      type: 'uint256',
    },
  ],
  stateMutability: 'view',
  type: 'function',
}

export const generateEvmContractConditions = (contractAddress: string, chain: string, tier: number) => [
  {
    contractAddress,
    chain,
    functionName: 'getPassdataViaAddress',
    functionParams: [':userAddress'],
    functionAbi,
    returnValueTest: {
      key: 'active',
      comparator: '=',
      value: 'true',
    },
  },
  { operator: 'and' },
  {
    contractAddress,
    chain,
    functionName: 'getPassdataViaAddress',
    functionParams: [':userAddress'],
    functionAbi,
    returnValueTest: {
      key: 'tier',
      comparator: '>=',
      value: tier.toString(),
    },
  },
]

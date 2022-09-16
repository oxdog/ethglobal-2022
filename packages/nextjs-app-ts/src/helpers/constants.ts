import hardhatDeployedContractsJson from '~common/generated/hardhat_contracts.json'

export const SSAJson = hardhatDeployedContractsJson[5][0].contracts.Subscription_SuperApp as {
  address: string
  abi: []
}

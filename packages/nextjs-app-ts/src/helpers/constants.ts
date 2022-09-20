import hardhatDeployedContractsJson from '~common/generated/hardhat_contracts.json'

export const SSAJson = hardhatDeployedContractsJson[5][0].contracts.Subscription_SuperApp as {
  address: string
  abi: []
}

export const SUBSTATION_WHITELIST = ['0xBCa2081845Bb4cc52FeAC84f38B4A5Ef41B1C0e5']

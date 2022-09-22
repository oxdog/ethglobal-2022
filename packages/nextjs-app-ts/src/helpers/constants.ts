import hardhatDeployedContractsJson from '~common/generated/hardhat_contracts.json'

export const SSAJson = hardhatDeployedContractsJson[5][0].contracts.Subscription_SuperApp as {
  address: string
  abi: []
}

export const oxdogStation = {
  address: '0xBCa2081845Bb4cc52FeAC84f38B4A5Ef41B1C0e5',
  emoji: '🥪',
}

export const breadStation = {
  address: '0xBCa2081845Bb4cc52FeAC84f38B4A5Ef41B1C0e5',
  emoji: '🥖',
}

export const mevStation = {
  address: '0xBCa2081845Bb4cc52FeAC84f38B4A5Ef41B1C0e5',
  emoji: '⚡',
}

export const SUBSTATION_WHITELIST = [oxdogStation.address, breadStation.address, mevStation.address]

export const EMOJIS = {
  [oxdogStation.address]: oxdogStation.emoji,
  [breadStation.address]: breadStation.emoji,
  [mevStation.address]: mevStation.emoji,
}

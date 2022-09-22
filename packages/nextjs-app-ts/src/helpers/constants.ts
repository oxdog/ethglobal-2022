import hardhatDeployedContractsJson from '~common/generated/hardhat_contracts.json'

export const SSAJson = hardhatDeployedContractsJson[5][0].contracts.Subscription_SuperApp as {
  address: string
  abi: []
}

export const oxdogStation = {
  address: '0x135968Ea9CD5f6788f1036294F23f5eA4d4bbAc3',
  emoji: '🥪',
}

export const breadStation = {
  address: '0x9571ca9396699A62835E4A8CfDD3131786634Aa1',
  emoji: '🥖',
}

export const mevStation = {
  address: '0xa4e1d6555a84611c69cCC93CC4C16D4c63D57c80',
  emoji: '⚡',
}

export const SUBSTATION_WHITELIST = [oxdogStation.address, breadStation.address, mevStation.address]

export const EMOJIS = {
  [oxdogStation.address]: oxdogStation.emoji,
  [breadStation.address]: breadStation.emoji,
  [mevStation.address]: mevStation.emoji,
}

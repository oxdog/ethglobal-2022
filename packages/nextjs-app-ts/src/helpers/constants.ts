import hardhatDeployedContractsJson from '~common/generated/hardhat_contracts.json'

export const SSAJson = hardhatDeployedContractsJson[80001][0].contracts.Subscription_SuperApp as {
  address: string
  abi: []
}

export const oxdogStation = {
  address: '0xC6E764227F4ba0544f46cdF3DEFE170C31ceA4FD',
  cid: 'bafybeihn7neu3tie6agdeqembvteeapbpa77ndehml6raknwmcpdtabxe4',
  flowRates: [
    { rate: '5', value: '1929012345679' },
    { rate: '10', value: '3858024691358' },
    { rate: '25', value: '9645061728395' },
  ],
  emoji: '🥪',
}

export const breadStation = {
  address: '0xfEcfe6c06bC814342411b5f9AeAef45D73774912',
  cid: 'bafybeic7pzir6mztspu2rewemlui5pz6glsjqvvkfnmwdhwuwe4n2p2puq',
  flowRates: [
    { rate: '5', value: '1929012345679' },
    { rate: '10', value: '3858024691358' },
  ],
  emoji: '🥖',
}

export const mevStation = {
  address: '0xf547075d775052177e33A612B3D36a99269793A9',
  cid: 'bafybeieyowvwyhevowjwjtamzatfp44yrakqzoxvcbxsl52475tt3efwte',
  flowRates: [
    { rate: '25', value: '9645061728395' },
    { rate: '80', value: '30864197530864' },
    { rate: '240', value: '92592592592592' },
  ],
  emoji: '⚡',
}

export const SUBSTATION_WHITELIST = [oxdogStation.address, breadStation.address, mevStation.address]

export const EMOJIS = {
  [oxdogStation.address]: oxdogStation.emoji,
  [breadStation.address]: breadStation.emoji,
  [mevStation.address]: mevStation.emoji,
}

export const FLOW_RATES = {
  [oxdogStation.address]: oxdogStation.flowRates,
  [breadStation.address]: breadStation.flowRates,
  [mevStation.address]: mevStation.flowRates,
}

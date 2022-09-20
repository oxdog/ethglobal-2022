import _ from 'lodash'

export const getSigningMsg = (account: string, chainId: number) =>
  `Supersub DEMO asks you to sign with your Ethereum account:\n${account}\n\nURI: ${
    window.location.href
  } to unlock the resources
    \nChain ID: ${chainId}\nNonce: ${_.random(176545765434512, 999999999999999, false)}\nIssued At: ${new Date()}`

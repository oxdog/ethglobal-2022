export const getSigningMsg = (account: string, chainId: number) =>
  `Supersub wants you to sign in with your Ethereum account:\n${account}\n\nURI: ${
    window.location.href
  }\nChain ID: ${chainId}\nNonce: ${_.random(
    176545765434512,
    999999999999999,
    false
  )}\nIssued At: ${new Date().getDate()}`

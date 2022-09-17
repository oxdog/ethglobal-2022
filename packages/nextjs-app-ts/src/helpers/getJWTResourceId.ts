export const getJWTResourceId = (contractAddress: string) => ({
  baseUrl: 'supersub_replace', // quick bug fix, needed baseurl server side
  path: '/substation',
  orgId: '',
  role: '',
  extraData: contractAddress,
})

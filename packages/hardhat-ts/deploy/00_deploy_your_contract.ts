import { utils } from 'ethers'
import { DeployFunction } from 'hardhat-deploy/types'
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended'

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  // Görli
  const SUPERFLUID_HOST = '0x22ff293e14F1EC3A09B137e9e06084AFd63adDF9'
  const DAIX = '0xF2d68898557cCb2Cf4C10c3Ef2B034b2a69DAD00'
  // const DAI = '0x88271d333C72e51516B67f5567c728E702b3eeE8'

  await deploy('Subscription_SuperApp', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    args: [
      SUPERFLUID_HOST,
      DAIX,
      'TestSub',
      'TESU',
      'bafybeidytala2n2enpwndjb2uku7gs7geh4tvho55aseiyavl77uk7xj6i',
      [0, utils.parseEther('1'), utils.parseEther('2'), utils.parseEther('3')],
    ],
    log: true,
    gasLimit: 10_000_000,
  })

  /*
    // Getting a previously deployed contract
    const Subscription_SuperApp = await ethers.getContract("Subscription_SuperApp", deployer);
    await Subscription_SuperApp.setPurpose("Hello");
    
    //const Subscription_SuperApp = await ethers.getContractAt('Subscription_SuperApp', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */
}
export default func
func.tags = ['Subscription_SuperApp']

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/

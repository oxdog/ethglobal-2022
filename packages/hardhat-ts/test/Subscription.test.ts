/* eslint-disable @typescript-eslint/no-unsafe-call */
import '../helpers/hardhat-imports'
import './helpers/chai-imports'

import { Provider } from '@ethersproject/abstract-provider'
import { Framework } from '@superfluid-finance/sdk-core'
import { Contract, utils } from 'ethers'
import { SubscriptionAccess, SubscriptionAccess__factory } from 'generated/contract-types'
import hre from 'hardhat'
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers'
import { getHardhatSigners } from 'tasks/functions/accounts'
import { deployFramework, deployWrapperSuperToken } from './helpers/deploy-sf'

const INITIAL_BALANCE = utils.parseEther('10')

describe('Subscription', function () {
  let contractsFramework: any
  let sf: Framework

  let dai: Contract
  let daix: Contract

  let deployer: SignerWithAddress
  let user1: SignerWithAddress

  let sub: SubscriptionAccess

  before(async () => {
    const signers = await getHardhatSigners(hre)
    deployer = signers.deployer
    user1 = signers.user1

    //* Deploy Superfluid
    contractsFramework = await deployFramework(deployer)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const tokenPair = await deployWrapperSuperToken(deployer, contractsFramework.superTokenFactory, 'fDAI', 'fDAI')
    dai = tokenPair.underlyingToken
    daix = tokenPair.superToken

    // initialize the superfluid framework...put custom and web3 only bc we are using hardhat locally
    sf = await Framework.create({
      chainId: 31337,
      provider: deployer.provider as Provider,
      resolverAddress: contractsFramework.resolver,
      protocolReleaseVersion: 'test',
    })

    //* Deploy SubscriptionAccess
    const subFactory = new SubscriptionAccess__factory(deployer)
    sub = await subFactory.deploy('TestSub', 'TESU', sf.host.contract.address, daix.address)
  })

  beforeEach(async function () {
    await dai.connect(deployer).mint(deployer.address, INITIAL_BALANCE)
    await dai.connect(deployer).mint(user1.address, INITIAL_BALANCE)

    await dai.connect(deployer).approve(daix.address, INITIAL_BALANCE)
    await daix.connect(deployer).upgrade(INITIAL_BALANCE)
    await daix.connect(deployer).transfer(sub.address, utils.parseEther('5'))

    await dai.connect(user1).approve(daix.address, INITIAL_BALANCE)
    await daix.connect(user1).upgrade(INITIAL_BALANCE)
  })

  describe('SubscriptionAccess', function () {
    describe('Superapp Callbacks', function () {
      it('Create', async () => {
        const createFlowOperation = sf.cfaV1.createFlow({
          receiver: sub.address,
          superToken: daix.address,
          flowRate: '100000000',
          overrides: { gasLimit: 1_000_000 },
        })

        const updateFlowOperation = sf.cfaV1.updateFlow({
          receiver: sub.address,
          superToken: daix.address,
          flowRate: '200000000',
          overrides: { gasLimit: 1_000_000 },
        })

        const deleteFlowOperation = sf.cfaV1.deleteFlow({
          sender: user1.address,
          receiver: sub.address,
          superToken: daix.address,
          flowRate: '100000000',
          overrides: { gasLimit: 1_000_000 },
        })

        await createFlowOperation.exec(user1)
        await updateFlowOperation.exec(user1)
        await deleteFlowOperation.exec(user1)
      })
    })
  })
})

/* eslint-disable @typescript-eslint/no-unsafe-call */
import '../helpers/hardhat-imports'
import './helpers/chai-imports'

import { Provider } from '@ethersproject/abstract-provider'
import { Framework } from '@superfluid-finance/sdk-core'
import { expect } from 'chai'
import { Contract, utils } from 'ethers'
import { MoneyRouter, MoneyRouter__factory } from 'generated/contract-types'
import hre from 'hardhat'
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers'
import { getHardhatSigners } from 'tasks/functions/accounts'
import { deployFramework, deployWrapperSuperToken } from './helpers/deploy-sf'

const INITIAL_BALANCE = utils.parseEther('10')

describe('MoneyRouter', function () {
  let contractsFramework: any
  let sf: Framework

  let dai: Contract
  let daix: Contract

  let deployer: SignerWithAddress
  let user1: SignerWithAddress

  let choco: MoneyRouter

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

    //* Deploy MoneyRouter
    const chocoFactory = new MoneyRouter__factory(deployer)
    choco = await chocoFactory.deploy(sf.settings.config.hostAddress)
  })

  beforeEach(async function () {
    await dai.connect(deployer).mint(deployer.address, INITIAL_BALANCE)
    await dai.connect(deployer).mint(user1.address, INITIAL_BALANCE)

    await dai.connect(deployer).approve(daix.address, INITIAL_BALANCE)
    await daix.connect(deployer).upgrade(INITIAL_BALANCE)
    await daix.connect(deployer).transfer(choco.address, utils.parseEther('5'))

    await dai.connect(user1).approve(daix.address, INITIAL_BALANCE)
    await daix.connect(user1).upgrade(INITIAL_BALANCE)
  })

  describe('MoneyRouter', function () {
    describe('Access Control', function () {
      it('Owner is deployer', async function () {
        expect(await choco.owner()).to.be.equal(deployer.address)
      })
    })

    describe('Control Flow Agreements', function () {
      it('Create CFA from Contract', async function () {
        await choco.createFlowFromContract(daix.address, user1.address, '100000000000000', { gasLimit: 1_000_000 })

        const receiverContractFlowRate = await sf.cfaV1.getFlow({
          superToken: daix.address,
          sender: choco.address,
          receiver: user1.address,
          providerOrSigner: deployer,
        })

        expect(receiverContractFlowRate, '100000000000000')
      })

      it('Create CFA into Contract', async function () {
        const authorizeContractOperation = sf.cfaV1.updateFlowOperatorPermissions({
          superToken: daix.address,
          flowOperator: choco.address,
          permissions: 7, // full control
          flowRateAllowance: '100000000000000', // ~2500 per month
        })
        await authorizeContractOperation.exec(user1)

        await choco.connect(user1).createFlowIntoContract(daix.address, '100000000000000', { gasLimit: 1_000_000 })

        const receiverContractFlowRate = await sf.cfaV1.getFlow({
          superToken: daix.address,
          sender: user1.address,
          receiver: choco.address,
          providerOrSigner: deployer,
        })
        expect(receiverContractFlowRate, '100000000000000')
      })
    })
  })
})

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import '../helpers/hardhat-imports'
import './helpers/chai-imports'

import { Provider } from '@ethersproject/abstract-provider'
import { Framework } from '@superfluid-finance/sdk-core'
import { expect } from 'chai'
import { Contract, utils } from 'ethers'
import { Subscription_SuperApp, Subscription_SuperApp__factory } from 'generated/contract-types'
import hre, { ethers } from 'hardhat'
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers'
import { getHardhatSigners } from 'tasks/functions/accounts'
import { deployFramework, deployWrapperSuperToken } from './helpers/deploy-sf'

const INITIAL_BALANCE = utils.parseEther('1000')

describe('Subscription', function () {
  let contractsFramework: any
  let sf: Framework

  let dai: Contract
  let daix: Contract

  let deployer: SignerWithAddress
  let user1: SignerWithAddress
  let user2: SignerWithAddress

  let sub: Subscription_SuperApp

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createFlow = () =>
    sf.cfaV1.createFlow({
      receiver: sub.address,
      superToken: daix.address,
      flowRate: '110000000',
      overrides: { gasLimit: 1_000_000 },
    })

  before(async () => {
    const signers = await getHardhatSigners(hre)
    deployer = signers.deployer
    user1 = signers.user1
    user2 = signers.user2

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

    await dai.connect(deployer).mint(deployer.address, INITIAL_BALANCE)
    await dai.connect(deployer).mint(user1.address, INITIAL_BALANCE)
    await dai.connect(deployer).mint(user2.address, INITIAL_BALANCE)

    await dai.connect(deployer).approve(daix.address, INITIAL_BALANCE)
    await daix.connect(deployer).upgrade(INITIAL_BALANCE)

    await dai.connect(user1).approve(daix.address, INITIAL_BALANCE)
    await daix.connect(user1).upgrade(INITIAL_BALANCE)

    await dai.connect(user2).approve(daix.address, INITIAL_BALANCE)
    await daix.connect(user2).upgrade(INITIAL_BALANCE)
  })

  beforeEach(async function () {
    //* Deploy Subscription_SuperApp
    const subFactory = new Subscription_SuperApp__factory(deployer)
    sub = await subFactory.deploy(sf.host.contract.address, daix.address, 'TestSub', 'TESU')
    // await dai.connect(deployer).mint(deployer.address, INITIAL_BALANCE)
    // await dai.connect(deployer).approve(daix.address, INITIAL_BALANCE)
    // await daix.connect(deployer).upgrade(INITIAL_BALANCE)
    // await daix.connect(deployer).transfer(sub.address, INITIAL_BALANCE)
  })

  describe('Superapp Callbacks', function () {
    it('Create', async () => {
      const createFlowOperation = createFlow()

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
        flowRate: '200000000',
        overrides: { gasLimit: 1_000_000 },
      })

      await createFlowOperation.exec(user1)
      await updateFlowOperation.exec(user1)
      await deleteFlowOperation.exec(user1)
    })
  })

  describe('Pass', function () {
    describe('Access Control', function () {})

    describe('Pass Control', function () {
      it('PassId starts at 1', async () => {
        expect(await sub.balanceOf(user1.address)).to.be.equal(0)

        const createFlowOperation = createFlow()
        await createFlowOperation.exec(user1)

        await expect(sub.ownerOf(0)).to.be.revertedWith('ERC721: invalid token ID')
        expect(await sub.ownerOf(1)).to.be.equal(user1.address)
        expect(await sub.tokenOfOwnerByIndex(user1.address, 0)).to.be.equal(1)
      })

      describe('Subscriber owns 2 passes', function () {
        beforeEach(async () => {
          const createFlowOperation1 = createFlow()
          await createFlowOperation1.exec(user1)

          const createFlowOperation2 = createFlow()
          await createFlowOperation2.exec(user2)

          await sub.connect(user2).transferFrom(user2.address, user1.address, 2, { gasLimit: 1_000_000 })
          expect(await sub.activePass(user1.address)).to.be.equal(1)
          expect(await sub.ownerOf(1)).to.be.equal(user1.address)
          expect(await sub.ownerOf(2)).to.be.equal(user1.address)
        })

        it('Switch active Pass', async () => {
          await sub.connect(user1).switchPass(2)
          expect(await sub.activePass(user1.address)).to.be.equal(2)
        })

        it("Can't switch if not owner of Pass", async () => {
          await expect(sub.connect(user2).switchPass(2)).to.be.revertedWith('Not Owner of Pass')
        })

        it("Can't switch if no active stream", async () => {
          await sub.connect(user1).transferFrom(user1.address, user2.address, 2, { gasLimit: 1_000_000 })
          expect(await sub.ownerOf(2)).to.be.equal(user2.address)
          expect(await sub.activePass(user2.address)).to.be.equal(0)
          await expect(sub.connect(user2).switchPass(2)).to.be.revertedWith('No stream active')
        })

        it('Switch logs TTV', async () => {
          expect(await sub.TTV(1)).to.be.equal(0)
          await ethers.provider.send('evm_increaseTime', [3600])

          await sub.connect(user1).switchPass(2)

          expect(await sub.TTV(1)).to.be.gt(200_000_000)
        })
      })
    })

    describe('Pass Tiers', function () {
      it.skip('Owner can update Pass Tiers', async () => {})
      it.skip('Perma lock Tier in Pass', async () => {})
    })

    describe('Stream Creation', function () {
      it('Issue Pass', async () => {
        expect(await sub.balanceOf(user1.address)).to.be.equal(0)

        const createFlowOperation = createFlow()
        await createFlowOperation.exec(user1)

        expect(await sub.balanceOf(user1.address)).to.be.equal(1)
      })

      it('Set ActivePass for Subscriber', async () => {
        const createFlowOperation = createFlow()
        await createFlowOperation.exec(user1)

        expect(await sub.activePass(user1.address)).to.be.equal(1)
      })

      it("Subscriber can't create Two Streams", async () => {
        const createFlowOperation1 = createFlow()
        const createFlowOperation2 = sf.cfaV1.createFlow({
          receiver: sub.address,
          superToken: daix.address,
          flowRate: '110000000',
          overrides: { gasLimit: 1_000_000 },
        })

        await createFlowOperation1.exec(user1)
        await expect(createFlowOperation2.exec(user1)).to.be.revertedWith('CFA: flow already exist')
      })

      it.skip('Activate Pass if Subscriber already owns one', async () => {})
    })

    describe('Stream Update', function () {
      beforeEach(async () => {})

      it('Log Total Stream Transmission in Pass', async () => {
        const createFlowOperation1 = createFlow()
        const updateFlowOperation = sf.cfaV1.updateFlow({
          receiver: sub.address,
          superToken: daix.address,
          flowRate: '200000000',
          overrides: { gasLimit: 1_000_000 },
        })

        await createFlowOperation1.exec(user1)
        expect(await sub.TTV(1)).to.be.equal(0)

        await ethers.provider.send('evm_increaseTime', [3600])

        await updateFlowOperation.exec(user1)
        expect(await sub.TTV(1)).to.be.gt(200_000_000)
      })
    })

    describe('Stream Termination', function () {
      it('Deactive Pass State', async () => {
        const createFlowOperation = createFlow()

        const deleteFlowOperation = sf.cfaV1.deleteFlow({
          sender: user1.address,
          receiver: sub.address,
          superToken: daix.address,
          flowRate: '200000000',
          overrides: { gasLimit: 1_000_000 },
        })

        await createFlowOperation.exec(user1)
        expect(await sub.passState(1)).to.be.equal(true)

        await deleteFlowOperation.exec(user1)
        expect(await sub.passState(1)).to.be.equal(false)
      })

      it('Remove Active Pass from Subscriber', async () => {
        const createFlowOperation = createFlow()

        const deleteFlowOperation = sf.cfaV1.deleteFlow({
          sender: user1.address,
          receiver: sub.address,
          superToken: daix.address,
          flowRate: '200000000',
          overrides: { gasLimit: 1_000_000 },
        })

        await createFlowOperation.exec(user1)
        expect(await sub.activePass(user1.address)).to.be.equal(1)

        await deleteFlowOperation.exec(user1)
        expect(await sub.activePass(user1.address)).to.be.equal(0)
      })

      it('Log Total Stream Transmission in Pass', async () => {
        const createFlowOperation = createFlow()

        const deleteFlowOperation = sf.cfaV1.deleteFlow({
          sender: user1.address,
          receiver: sub.address,
          superToken: daix.address,
          flowRate: '200000000',
          overrides: { gasLimit: 1_000_000 },
        })

        await createFlowOperation.exec(user1)
        expect(await sub.TTV(1)).to.be.equal(0)

        await ethers.provider.send('evm_increaseTime', [3600])

        await deleteFlowOperation.exec(user1)
        expect(await sub.activePass(user1.address)).to.be.equal(0)

        expect(await sub.TTV(1)).to.be.gt(200_000_000)
      })
    })

    describe('Pass Transfer', function () {
      const PASS_ID = 1

      beforeEach(async () => {
        const createFlowOperation = createFlow()
        await createFlowOperation.exec(user1)

        const ownerContractFlowRate = await sf.cfaV1.getFlow({
          superToken: daix.address,
          sender: user1.address,
          receiver: sub.address,
          providerOrSigner: user1,
        })
        expect(ownerContractFlowRate, '110000000')

        expect(await sub.activePass(user1.address)).to.be.equal(PASS_ID)
      })

      it('Remove active pass from Sender', async () => {
        await sub.connect(user1).transferFrom(user1.address, user2.address, 1, { gasLimit: 1_000_000 })
        expect(await sub.activePass(user1.address)).to.be.equal(0)
      })

      it('Deactivate Pass State', async () => {
        await sub.connect(user1).transferFrom(user1.address, user2.address, 1, { gasLimit: 1_000_000 })
        expect(await sub.activePass(user1.address)).to.be.equal(0)
      })

      it('Cancel Senders Stream if active Pass', async () => {
        await sub.connect(user1).transferFrom(user1.address, user2.address, 1, { gasLimit: 1_000_000 })

        const ownerContractFlowRate = await sf.cfaV1.getFlow({
          superToken: daix.address,
          sender: user1.address,
          receiver: sub.address,
          providerOrSigner: user1,
        })
        expect(ownerContractFlowRate, '0')
      })

      it('Log Total Stream Transmission in Pass', async () => {
        expect(await sub.TTV(1)).to.be.equal(0)
        await ethers.provider.send('evm_increaseTime', [3600])
        await sub.connect(user1).transferFrom(user1.address, user2.address, 1, { gasLimit: 1_000_000 })
        expect(await sub.TTV(1)).to.be.gt(200_000_000)
        expect(await sub.activePass(user1.address)).to.be.equal(0)
      })

      it("Don't cancel Stream on inactive pass transfer", async () => {
        const createFlowOperation = createFlow()
        await createFlowOperation.exec(user2)
        await sub.connect(user2).transferFrom(user2.address, user1.address, 2, { gasLimit: 1_000_000 })

        expect(await sub.ownerOf(2)).to.be.equal(user1.address)
        expect(await sub.activePass(user1.address)).to.be.equal(1)

        await sub.connect(user1).transferFrom(user1.address, user2.address, 2, { gasLimit: 1_000_000 })
        expect(await sub.ownerOf(2)).to.be.equal(user2.address)

        const ownerContractFlowRate = await sf.cfaV1.getFlow({
          superToken: daix.address,
          sender: user1.address,
          receiver: sub.address,
          providerOrSigner: user1,
        })
        expect(ownerContractFlowRate, '110000000')
      })
    })
  })
})

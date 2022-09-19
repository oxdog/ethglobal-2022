import { BigNumber, BigNumberish } from 'ethers'
import { FC, ReactElement, useEffect, useMemo, useState } from 'react'
import EtherFormatted from './EtherFormatted'

const ANIMATION_MINIMUM_STEP_TIME = 80

export interface FlowingBalanceProps {
  balance: string
  balanceTimestamp: number
  flowRate: string
  reverse?: boolean
}

const FlowingBalance: FC<FlowingBalanceProps> = ({
  balance,
  balanceTimestamp,
  flowRate,
  reverse = false,
}): ReactElement => {
  const [weiValue, setWeiValue] = useState<BigNumberish>(balance)
  useEffect(() => setWeiValue(balance), [balance])

  const balanceTimestampMs = useMemo(() => BigNumber.from(balanceTimestamp).mul(1000), [balanceTimestamp])

  useEffect(() => {
    const flowRateBigNumber = BigNumber.from(flowRate)
    if (flowRateBigNumber.isZero()) {
      return // No need to show animation when flow rate is zero.
    }

    const balanceBigNumber = BigNumber.from(balance)

    let stopAnimation = false
    let lastAnimationTimestamp: DOMHighResTimeStamp = 0

    const animationStep = (currentAnimationTimestamp: DOMHighResTimeStamp) => {
      if (stopAnimation) {
        return
      }

      if (currentAnimationTimestamp - lastAnimationTimestamp > ANIMATION_MINIMUM_STEP_TIME) {
        const currentTimestampBigNumber = BigNumber.from(
          new Date().valueOf() // Milliseconds elapsed since UTC epoch, disregards timezone.
        )

        if (reverse) {
          const nextBalance = balanceBigNumber.sub(
            currentTimestampBigNumber.sub(balanceTimestampMs).mul(flowRateBigNumber).div(1000)
          )

          if (nextBalance.gt(0)) {
            setWeiValue(nextBalance)
          } else {
            setWeiValue(BigNumber.from('0'))
          }
        } else {
          setWeiValue(
            balanceBigNumber.add(currentTimestampBigNumber.sub(balanceTimestampMs).mul(flowRateBigNumber).div(1000))
          )
        }

        lastAnimationTimestamp = currentAnimationTimestamp
      }

      window.requestAnimationFrame(animationStep)
    }

    window.requestAnimationFrame(animationStep)

    return () => {
      stopAnimation = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, balanceTimestamp, flowRate])

  return (
    <>
      <EtherFormatted wei={weiValue} />
    </>
  )
}

export default FlowingBalance

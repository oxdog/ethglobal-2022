import { BigNumber } from 'ethers'
import { FC, ReactElement, useEffect, useMemo, useState } from 'react'

const ANIMATION_MINIMUM_STEP_TIME = 80

export interface ProgressBarProps {
  fromBalance: string
  toNextTier: string
  balance: string
  balanceTimestamp: number
  flowRate: string
}

const ProgressBar: FC<ProgressBarProps> = ({
  fromBalance,
  toNextTier,
  balance,
  balanceTimestamp,
  flowRate,
}): ReactElement => {
  const [progress, setProgress] = useState<number>(0)

  const balanceTimestampMs = useMemo(() => BigNumber.from(balanceTimestamp).mul(1000), [balanceTimestamp])

  useEffect(() => {
    const fromBN = BigNumber.from(fromBalance)
    const balanceBN = BigNumber.from(balance).sub(fromBN)
    const toBN = BigNumber.from(toNextTier).add(balanceBN)
    const flowRateBigNumber = BigNumber.from(flowRate)
    if (flowRateBigNumber.isZero()) {
      const percent = balanceBN.mul(100).div(toBN)
      setProgress(percent.toNumber())
      return // No need to show animation when flow rate is zero.
    }

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

        const currentBN = balanceBN.add(
          currentTimestampBigNumber.sub(balanceTimestampMs).mul(flowRateBigNumber).div(1000)
        )

        if (currentBN.gt(toBN)) {
          setProgress(100)
        } else {
          const percent = currentBN.mul(100).div(toBN)
          setProgress(percent.toNumber())
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
    // <Box
    //   data-cy={'total-streamed'}
    //   component="span"
    //   sx={{
    //     textOverflow: 'ellipsis',
    //   }}>
    <div className="flex bg-gray-200 h-4 w-full">
      <div className="bg-cyan-400 z-10" style={{ width: `${progress}%` }} />
      {/* <div className="absolute bottom-0 bg-gray-200 w-full h-4" /> */}
    </div>
    // </Box>
  )
}

export default ProgressBar

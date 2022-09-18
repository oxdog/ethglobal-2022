import { StaticJsonRpcProvider } from '@ethersproject/providers'
import { Address } from 'eth-components/ant'
import { useSignerAddress } from 'eth-hooks'
import { useEthersAppContext } from 'eth-hooks/context'
import { TCreateEthersModalConnector } from 'eth-hooks/models'
import { Signer } from 'ethers'
import { FC, useState } from 'react'
import { invariant } from 'ts-invariant'
import { useDebounce } from 'use-debounce'
import { useIsMounted } from 'usehooks-ts'
import { Button } from './Button'

export interface IAccountProps {
  ensProvider: StaticJsonRpcProvider | undefined
  localProvider?: StaticJsonRpcProvider | undefined
  createLoginConnector?: TCreateEthersModalConnector
  loginOnError?: (error: Error) => void
  logoutOnSuccess?: () => void
  address?: string
  signer?: Signer
  hasContextConnect: boolean
  fontSize?: number
  blockExplorer: string
  price: number
}

export const Account: FC<IAccountProps> = (props: IAccountProps) => {
  const ethersAppContext = useEthersAppContext()
  const showLoadModal = !ethersAppContext.active
  const [connecting, setConnecting] = useState(false)

  const isMounted = useIsMounted()
  const [loadingButton, loadingButtonDebounce] = useDebounce(connecting, 1000, {
    maxWait: 1500,
  })

  if (loadingButton && connecting) {
    setConnecting(false)
  }

  const [signerAddress] = useSignerAddress(props.signer)
  const address = props.address ?? signerAddress
  const [resolvedAddress] = useDebounce<string | undefined>(
    props.hasContextConnect ? ethersAppContext.account : address,
    200,
    {
      trailing: true,
    }
  )

  const handleLoginClick = (): void => {
    if (props.createLoginConnector != null) {
      const connector = props.createLoginConnector?.()
      if (!isMounted()) {
        invariant.log('openModal: no longer mounted')
      } else if (connector) {
        setConnecting(true)
        ethersAppContext.openModal(connector, props.loginOnError)
      } else {
        invariant.warn('openModal: A valid EthersModalConnector was not provided')
      }
    }
  }

  const loadModalButton = (
    <>
      {showLoadModal && props.createLoginConnector && (
        <Button variant="full" loading={loadingButtonDebounce.isPending()} key="loginbutton" onClick={handleLoginClick}>
          connect
        </Button>
      )}
    </>
  )

  const logoutButton = (
    <>
      {!showLoadModal && props.createLoginConnector && (
        <button
          key="logoutbutton"
          onClick={(): void => ethersAppContext.disconnectModal(props.logoutOnSuccess)}
          type="button"
          className="inline-flex items-center px-6 py-1 border transition-colors border-transparent text-base font-medium rounded-full shadow-sm text-gry-800 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          logout
        </button>
      )}
    </>
  )

  return (
    <div className="flex flex-col items-start space-y-4">
      <span>
        {resolvedAddress != null && (
          <Address
            address={resolvedAddress}
            fontSize={props.fontSize ?? 18}
            ensProvider={props.ensProvider}
            blockExplorer={props.blockExplorer}
            minimized={false}
            hideCopy
          />
        )}
      </span>

      {props.hasContextConnect && (
        <>
          {loadModalButton}
          {logoutButton}
        </>
      )}
    </div>
  )
}

// @ts-expect-error
import LitJsSdk from '@lit-protocol/sdk-browser'
import Cookies from 'cookies'
import { GetServerSideProps } from 'next'
import { FC } from 'react'
import ProtectedPage from '~~/components/protected/ProtectedPage'

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
  const { id } = query
  const cookies = new Cookies(req, res)
  const jwt = cookies.get('lit-auth')
  if (!jwt) {
    return {
      props: {
        authorized: false,
      },
    }
  }

  const { verified, payload } = LitJsSdk.verifyJwt({ jwt })

  if (payload.baseUrl !== 'http://localhost:3000' || payload.path !== '/protected' || payload.extraData !== id) {
    return {
      props: {
        authorized: false,
      },
    }
  }
  return {
    props: {
      authorized: verified ? true : false,
    },
  }
}

interface ProtectedPageProps {
  authorized: boolean
}

const Page: FC<ProtectedPageProps> = ({ authorized }) => {
  return <ProtectedPage authorized={authorized} />
}

export default Page

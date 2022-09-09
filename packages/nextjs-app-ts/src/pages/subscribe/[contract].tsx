import { useRouter } from 'next/router'
import { FC } from 'react'

import { SubscribePage } from '~~/components/subscribe/SubscribePage'

const Page: FC = () => {
  const router = useRouter()
  const { contract } = router.query

  return <SubscribePage contract={contract as string} pageName="Subscribe" />
}

export default Page

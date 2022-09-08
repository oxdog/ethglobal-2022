import { useRouter } from 'next/router';
import React, { FC } from 'react';

const Page: FC = () => {
  const router = useRouter();
  const { subID } = router.query;

  return (
    <div className="w-screen flex flex-col items-center justify-center bg-white">
      <div className="w-min bg-green-400 text-3xl">heading</div>
      <div className="w-min bg-green-400">contract: {subID}</div>
      <div className="w-min bg-green-400">button</div>
    </div>
  );
};

export default Page;

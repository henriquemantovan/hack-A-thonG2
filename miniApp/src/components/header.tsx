'use client';

import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '../hooks/useTonConnect';

export default function Header() {
  const { connected, wallet, network } = useTonConnect();

  return (
    <header className="w-full px-4 py-2">
      <div className="flex justify-end">
        <TonConnectButton />
      </div>
    </header>
  );
}

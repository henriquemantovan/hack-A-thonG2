'use client';

import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from '../hooks/useTonConnect';
import { Address } from 'ton';


//ALGUEM CENTRALIZA PARA MIM PFV :(
export default function Header() {
    const { connected, wallet, network } = useTonConnect();
  
  return (<header>
    <div>
        {connected && (
          <>
            <div>
              <p>Wallet: {Address.parse(wallet as string).toString()}</p>
              <p>Network: {network}</p>
              <p>Status: Connected</p>
            </div>
            <div/>
          </>
        )}
        {!connected && (
          <div>
            <p>Status: Disconnected</p>
          </div>
        )}
    </div>


      <TonConnectButton />
    
    </header>

  );
}

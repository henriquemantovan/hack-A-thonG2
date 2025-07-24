import { CHAIN, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { Address } from "@ton/core";
import { SenderArguments } from "@ton/core";
import { Sender } from "@ton/core";

export function useTonConnect(): {
    connected: boolean;
    wallet: string | null;
    network: CHAIN | null;
} {
    const [tonConnectUI] = useTonConnectUI()
    const wallet = useTonWallet()
    
    return {
        connected: !!wallet?.account.address,
        wallet: wallet?.account.address ?? null,
        network: wallet?.account.chain ?? null 
    }
}
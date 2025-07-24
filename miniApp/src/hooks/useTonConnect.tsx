import { CHAIN, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { Address, Sender, SenderArguments } from "@ton/core";

export function useTonConnect(): {
    sender: Sender | null;
    connected: boolean;
    wallet: string | null;
    network: CHAIN | null;
} {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    const sender: Sender | null = wallet?.account?.address
        ? {
            send: async (args: SenderArguments) => {
                await tonConnectUI.sendTransaction({
                    validUntil: Date.now() + 5 * 60 * 1000,
                    messages: [
                        {
                            address: args.to.toString(),
                            amount: args.value.toString(),
                            payload: args.body?.toBoc().toString("base64") ?? undefined,
                        },
                    ],
                });
            },
            address: Address.parse(wallet.account.address),
        }
        : null;

    return {
        sender,
        connected: !!wallet?.account?.address,
        wallet: wallet?.account?.address ?? null,
        network: wallet?.account?.chain ?? null,
    };
}

import { Address, OpenedContract } from "@ton/core";
import { TactStore } from "../wrapper/simple_counter.tact_TactStore";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";
import { useTonAddress } from "@tonconnect/ui-react";

export function useStoreContract() {
    const { client } = useTonClient();
    
    const storeContract = useAsyncInitialize(async () => { 
        if (!client) return;
        const contract = TactStore.fromAddress(
            Address.parse("kQCTKOdZqwp35I44Xtp_psL7qOQp_R1kFR9_0dJjn16A5sjf")
        );
        return client.open(contract as unknown as Contract) as OpenedContract<TactStore>;
    }, [client]);

    return storeContract;
}
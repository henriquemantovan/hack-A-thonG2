import { Address, OpenedContract } from "@ton/core";
import { TactStore } from "../wrapper/simple_counter.tact_TactStore";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useTonConnect } from "./useTonConnect";
import { useTonAddress } from "@tonconnect/ui-react";
import { Contract } from "ton";
import { useEffect, useState } from "react";

export function useStoreContract(itemId: bigint) {
    const { client } = useTonClient();
    type Item = {
  $$type: "Item";
  price: bigint;
  quantity: bigint;
  owner: Address;
};

    const [itemValue, setItemValue] = useState<Item | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const storeContract = useAsyncInitialize(async () => { 
        if (!client) return;
        const contract = TactStore.fromAddress(
            Address.parse("kQCTKOdZqwp35I44Xtp_psL7qOQp_R1kFR9_0dJjn16A5sjf")
        );
        return client.open(contract as unknown as Contract) as OpenedContract<TactStore>;
    }, [client]);

    useEffect(() => {
        async function fetchItem() {
            if (!storeContract || !itemId) return;
            
            try {
                setLoading(true);
                setError(null);
                
                const value = await storeContract.getGetItem(itemId);
                setItemValue(value);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'ERRO');
                alert("erro");
                console.error("ERRO", err);
            } finally {
                setLoading(false);
            }
        }

        fetchItem();
    }, [storeContract, itemId]);

    return {
        itemValue,
        loading,
        error,
        storeContract
    };


}


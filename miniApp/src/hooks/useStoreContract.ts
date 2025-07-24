import { Address, OpenedContract } from "@ton/ton";
import { TactStore } from "../wrapper/simple_counter.tact_TactStore";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useEffect, useState } from "react";
import { Item } from "../wrapper/simple_counter.tact_TactStore";
const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

export function useStoreContract(itemId: bigint) {
    const { client } = useTonClient();


    const [itemValue, setItemValue] = useState<Item | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const storeContract = useAsyncInitialize<OpenedContract<TactStore> | null>(async () => {
        if (!client) return null;
        const contract = TactStore.fromAddress(
            Address.parse("kQCTKOdZqwp35I44Xtp_psL7qOQp_R1kFR9_0dJjn16A5sjf")
        );
        return client.open(contract) as OpenedContract<TactStore>;
    }, [client]);

    useEffect(() => {
        async function fetchItem() {
            if (!storeContract || !itemId) return;

            try {
                setLoading(true);
                setError(null);
                setItemValue(null);
                console.log("teste");
                await sleep(500); // opcional: só para simular delay

                const value:Item | null = await TactStore.getGetItem((storeContract as any), itemId);
                if (value) {
                    setItemValue(value as Item);
                    console.log("Item carregado:", value);
                } else {
                    setError("Item não encontrado");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Erro ao buscar item");
                console.error("Erro ao buscar item:", err);
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

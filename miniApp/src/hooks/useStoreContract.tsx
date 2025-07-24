import { Address, beginCell, ContractProvider, OpenedContract, toNano } from "@ton/ton";
import { TactStore } from "../wrapper/simple_counter.tact_TactStore";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonClient } from "./useTonClient";
import { useEffect, useState } from "react";
import { Item } from "../wrapper/simple_counter.tact_TactStore";
import { useTonConnect } from "./useTonConnect";
const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

export function useStoreContract(itemId: bigint) {
    const { client } = useTonClient();
    let debug :bigint;

    const [itemValue, setItemValue] = useState<Item | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const storeContract = useAsyncInitialize<OpenedContract<TactStore> | null>(async () => {
        if (!client) return null;
        const contract = TactStore.fromAddress(
            Address.parse("kQBey5cqzRBkAe9fQu06zHRCvVuRLWS7KiCogOL7X32XJEzr")
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
                await sleep(500);
                
                const raw = storeContract as unknown as { provider?: ContractProvider };
                const value = await storeContract.getGetItemQuantity(itemId);
                console.log(storeContract.getGetItemCount());
                debug = await (storeContract.getGetItemCount());
                
                console.log("valor: ");
                console.log(storeContract.getGetItemCount())
                console.log(debug);
                console.log(value);
                if (value) {
                    console.log("Item carregado:", value);
                } else {
                    setError("Item não encontrado");
                }

            } catch (err) {
                console.log(debug);
                setError(err instanceof Error ? err.message : "Erro ao buscar item");
                console.error("Erro ao buscar item:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchItem();
    }, [storeContract, itemId]);

    const { sender } = useTonConnect();

    const sendAddItem = async (price: number, quantity: number) => {
        if (!storeContract || !sender) throw new Error("Contrato ou sender indisponível.");

        const priceNano = toNano(price);
        const quantityBig = BigInt(quantity);

        await storeContract.send(
        sender,
        { value: toNano(0.2) },
        {
            $$type: "AddItem",
            price: priceNano,
            quantity: quantityBig,
        }
        );
    };

    return {
        itemValue,
        loading,
        error,
        storeContract,
        sendAddItem,
    };
    }


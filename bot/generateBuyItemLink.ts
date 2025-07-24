import { beginCell, toNano } from "@ton/core";
import { storeBuyItem } from "./simple_counter.tact_TactStore"; // ajuste o path conforme necessário

export function generateBuyItemLink(itemId: number, amountTON: number): string {
  const payloadCell = beginCell()
    .store(storeBuyItem({
      $$type: "BuyItem",
      id: BigInt(itemId)
    }))
    .endCell();

  const base64Payload = payloadCell.toBoc().toString("base64url");

  const tonAmount = toNano(amountTON).toString(); // convertendo TON → nanoTON

  return `ton://transfer/kQBey5cqzRBkAe9fQu06zHRCvVuRLWS7KiCogOL7X32XJEzr?amount=${tonAmount}&bin=${base64Payload}`;
}

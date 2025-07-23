import React, { useState } from "react";
import { useStoreContract } from "../hooks/useStoreContract";

export default function ItemPage() {
  const [inputId, setInputId] = useState("");
  const [itemId, setItemId] = useState<bigint | null>(null);

  // Só chama o hook quando itemId está definido
  const { itemValue, loading, error } = useStoreContract(itemId ?? BigInt(0));

  // Função que seta o itemId ao clicar no botão
function handleFetchItem() {
  alert("Botão clicado!"); // Alerta ao clicar

  if (inputId.trim() === "") return;
  try {
    const idBigInt = BigInt(inputId.trim());
    setItemId(idBigInt);
  } catch {
    alert("ID inválido");
  }
}


  return (
    <div style={{ padding: "1rem" }}>
      <h1>Item Viewer</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Digite o ID do item"
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <button onClick={handleFetchItem}>Buscar Item</button>
       
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {itemValue ? (
        <div>
          <p><strong>Preço:</strong> {itemValue.price.toString()}</p>
          <p><strong>Quantidade:</strong> {itemValue.quantity.toString()}</p>
          <p><strong>Dono:</strong> {itemValue.owner.toString()}</p>
        </div>
      ) : (
        !loading && <p>Nenhum item encontrado.</p>
      )}
    </div>
  );
}

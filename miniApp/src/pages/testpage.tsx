import React, { useState } from "react";
import { useStoreContract } from "../hooks/useStoreContract"; // Ajuste o caminho conforme seu projeto

export function StoreViewer() {
  const [inputId, setInputId] = useState("");
const [itemId, setItemId] = useState<bigint>(0n);


  const { itemValue, loading, error } = useStoreContract(itemId);

  const handleFetchItem = () => {
    if (inputId.trim() === "") {
      alert("Digite um ID válido.");
      return;
    }

    try {
      const parsedId = BigInt(inputId.trim());
      setItemId(parsedId);
    } catch {
      alert("ID inválido. Deve ser um número.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "500px" }}>
      <h2>Consultar Item da Store</h2>

      <input
        type="text"
        value={inputId}
        onChange={(e) => setInputId(e.target.value)}
        placeholder="Digite o ID do item (ex: 1)"
        style={{
          padding: "10px",
          fontSize: "16px",
          width: "100%",
          marginBottom: "10px",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={handleFetchItem}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        Buscar Item
      </button>

      {loading && <p>🔄 Carregando item...</p>}
      {error && <p style={{ color: "red" }}>❌ Erro: {error}</p>}

      {itemValue && (
        <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "5px" }}>
          <h3>📦 Detalhes do Item</h3>
          <p><strong>Preço:</strong> {itemValue.price.toString()}</p>
          <p><strong>Quantidade:</strong> {itemValue.quantity.toString()}</p>
          <p><strong>Dono:</strong> {itemValue.owner.toString()}</p>
        </div>
      )}
    </div>
  );
}

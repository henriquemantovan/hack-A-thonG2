import { useParams } from "react-router-dom";
import { useStoreContract } from "../hooks/useStoreContract";

export default function ItemPage() {
  const { id } = useParams();
  const itemId = id ? BigInt(id) : BigInt(0);
  const { itemValue, loading, error } = useStoreContract(itemId);

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Item Viewer</h1>

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

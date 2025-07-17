import { toNano } from '@ton/core';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { Store } from '../contracts/store';

export async function run(provider: NetworkProvider) {
  const deployer = provider.sender(); // Usuário dono do deploy
  const userA = provider.openWallet(); // Vendedor A
  const userB = provider.openWallet(); // Vendedor B

  // 💡 Cria a loja com deployer como owner (não é mais relevante com seller por produto)
  const store = provider.open(await Store.fromInit(deployer.address));

  console.log('🚀 Deploying store...');
  await store.sendDeploy(deployer, toNano('0.05'));
  await sleep(1);

  // ✅ UserA adiciona um produto
  console.log('🛒 UserA adiciona produto ID 1');
  await store.send(userA, {
    value: toNano('0.05'),
    body: store.add_product(1n, 1000n, 10n),
  });

  // ✅ UserB tenta remover -> deve falhar
  console.log('❌ UserB tenta remover produto (espera-se erro)');
  try {
    await store.send(userB, {
      value: toNano('0.01'),
      body: store.remove_product(1n),
    });
  } catch (e) {
    console.log('✅ Falhou como esperado:', e.message);
  }

  // ✅ UserA remove com sucesso
  console.log('🧹 UserA remove produto');
  await store.send(userA, {
    value: toNano('0.01'),
    body: store.remove_product(1n),
  });

  // 🔍 Verifica se foi removido mesmo
  const product = await store.get_product(1n);
  console.log('📦 Produto após remoção:', product); // Deve ser null/undefined
}

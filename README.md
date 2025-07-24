# MarkeTON

### Como acessar o projeto
- Nome/link do nosso bot  do telegram [@PolichainG2bot](https://t.me/PolichainG2bot)
- MiniApp deployado na vercel no link: https://marketon-rust.vercel.app/ (OBS: miniApp só roda completamente dentro do telegram)
- Link do contrato deployado: https://testnet.tonviewer.com/EQBey5cqzRBkAe9fQu06zHRCvVuRLWS7KiCogOL7X32XJPdh


### Problema central

O Telegram é uma plataforma dinâmica, com uma comunidade global em constante crescimento e um ecossistema de bots e miniApps cada vez mais sofisticado. Com a integração da blockchain TON, o ambiente está pronto para experiências Web3, mas ainda há espaço para soluções que tornem essa tecnologia acessível no dia a dia das pessoas.

Apesar do avanço das criptomoedas, muitos e-commerces ainda encontram dificuldades para integrá-las em pagamentos, especialmente de forma simples, segura e intuitiva ao usuário final. Isso limita a adoção de soluções Web3 por pequenos vendedores e impede que consumidores comuns tenham uma experiência fluida com ativos digitais.

Ainda mais, há uma grande oportunidade em unir a praticidade dos bots no Telegram com pagamentos via TON, criando uma ponte entre o comércio digital e o universo cripto, sem exigir conhecimento técnico avançado nem investimentos. Assim, essa lacuna representa uma chance concreta de democratizar o acesso à Web3, aproximando usuários, criadores e empreendedores de uma nova economia digital a partir do próprio Telegram.

---

### Visão geral

Nosso projeto é uma solução que permite que qualquer pessoa crie e gerencie uma loja online diretamente dentro do Telegram, unindo a praticidade dos bots com o poder dos pagamentos descentralizados via TON.

A proposta é oferecer uma experiência fluida e acessível tanto para vendedores quanto para compradores, eliminando barreiras técnicas e incentivando o uso real da Web3 no dia a dia.

A interface é simples e intuitiva, o vendedor só precisa ter uma carteira TON para começar. Os usuários podem buscar produtos, navegar pelas categorias e realizar compras diretamente no chat. Os pagamentos são registrados diretamente na blockchain da TON, garantindo transparência, confiabilidade e remoção de intermediários. Essa abordagem traz ao Telegram a praticidade de um e-commerce com a confiança das soluções Web3.

Vale apontar que, devido à sua arquitetura versátil, o sistema pode ser aplicado a lojas online, vendas em eventos, prestação de serviços, entre outros usos.

---

### Tecnologias Usadas

- #### TypeScript
   - Descrição: Linguagem principal do projeto, trazendo tipagem estática e maior robustez ao desenvolvimento em todas as camadas da aplicação.

- #### Tact
   - Descrição: Linguagem de programação para desenvolvimento de contratos inteligentes na blockchain TON, oferecendo segurança e eficiência.

- #### Next.js
   - Descrição: Framework React para desenvolvimento full-stack, proporcionando renderização server-side e geração de sites estáticos.

- #### React
   - Descrição: Biblioteca JavaScript para criação de interfaces de usuário dinâmicas e reativas no mini app.

- #### TON Connect
   - Descrição: SDK oficial para integração com carteiras TON, permitindo conexão segura e transações na blockchain TON.

- #### Prisma
   - Descrição: ORM moderno para TypeScript que facilita o acesso e manipulação do banco de dados com type-safety.

- #### Tailwind CSS
   - Descrição: Framework CSS utility-first para estilização rápida e responsiva da interface do usuário.

- #### Telegram Bot API
   - Descrição: API oficial do Telegram para criação de bots interativos e automatização de processos de e-commerce.

- #### AWS Lambda & Serverless
   - Descrição: Plataforma serverless para execução do bot do Telegram, garantindo escalabilidade e baixo custo operacional.

- #### TON Blueprint
   - Descrição: Ferramenta de desenvolvimento para contratos inteligentes TON, facilitando build, teste e deploy dos smart contracts.

- #### Vercel
   - Descrição: Plataforma de deploy e hospedagem para aplicações front-end, oferecendo integração contínua e performance otimizada.

- #### Neon
   - Descrição: Banco de dados PostgreSQL serverless, proporcionando escalabilidade automática e gerenciamento simplificado de dados.

---

### Instalação e Execução do Miniapp

1. Clone o repositório:
   ```bash
   git clone https://github.com/henriquemantovan/hack-A-thonG2.git
   cd hack-A-thonG2/miniApp
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor localmente:
   ```bash
   npm run dev
   ```
4. Acesse a aplicação em [http://localhost:3000](http://localhost:3000)

---

### Instalação e Execução do Bot

1. Clone o repositório:
   ```bash
   git clone https://github.com/henriquemantovan/hack-A-thonG2.git
   cd hack-A-thonG2/bot
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o ngrok para simular a AWS:
   ```bash
   ngrok http 3000
   ```
4. Set corretamente o .env
5. Inicie o servidor localmente:
   ```bash
   npm run dev
   ```
6. Acesse o bot [@PolichainG2bot](https://t.me/PolichainG2bot) e dê /start
---

#### Observações
- Certifique-se de ter o Node.js e o NGROK instalado em sua máquina.
- Para utilizar funcionalidades de blockchain, é necessário ter uma carteira digital da carteira TON.

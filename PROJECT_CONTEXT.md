# 🧭 Contexto do Projeto: Gestão JGcode

> **Documento Oficial de Contexto e Arquitetura do Sistema**  
> **Versão:** 2.4 (Fase MVP Completo & Conectado ao Firebase)  
> **Última Atualização:** Setembro/2026  
> **Empresa:** JGcode Soluções em Tecnologia

---

## 1. Visão Geral do Projeto

O **Gestão JGcode** é uma plataforma web desenvolvida para centralizar a operação da JGcode, cobrindo:
1. **Gestão Interna (Backoffice / Admin):** Controle completo sobre clientes (PF e PJ), projetos de tecnologia entregues e em desenvolvimento, planos de pagamento (à vista, parcelado, recorrente) e faturamento.
2. **Portal de Autoatendimento do Cliente:** Área acessada diretamente via CPF ou CNPJ cadastrado, cujo objetivo primário é consultar e liquidar faturas via Pix instantâneo, acompanhar links de publicação de seus projetos (Google Meu Negócio, Sites, E-mails Corporativos) e solicitar suporte técnico via WhatsApp.
3. **Gateway de Pagamento Desacoplado:** Arquitetura orientada a interfaces (`IPaymentProvider`) com suporte nativo a geração de Pix via Mercado Pago (QR Code e Copia-e-Cola com simulação de baixa e fallback).
4. **Persistência Híbrida (Nuvem + Fallback):** Conectado ao **Firebase Firestore** com fallback automático no `localStorage` do navegador para assegurar resiliência em caso de desconexão.

---

## 2. Stack Tecnológica

| Camada | Tecnologia | Detalhes |
| :--- | :--- | :--- |
| **Linguagem** | TypeScript 6.0 | Tipagem estrita em todo o fluxo de dados (`/src/types/index.ts`). |
| **Framework Frontend** | React 19 + Vite 8 | Fast Refresh, bundling otimizado e performance nativa. |
| **Estilização** | TailwindCSS 3.4 | Tokens customizados no estilo Apple (`#F5F5F7`, `#0071E3`, `#1D1D1F`, sombras suaves `shadow-apple`). |
| **Roteamento** | React Router DOM v7 | Rotas declarativas com proteção por papel (`ProtectedRoute.tsx`). |
| **Ícones** | Lucide React | Ícones consistentes e minimalistas. |
| **Banco de Dados** | Firebase Firestore (v12) | Projeto em nuvem `gestaojgcode` com regras configuradas (`firestore.rules`). |
| **Deploy & Hosting** | Vercel | Otimizado para SPA com roteamento configurado em `vercel.json`. |

---

## 3. Arquitetura de Acessos & Autenticação

O sistema possui duas portas de entrada independentes e desacopladas:

```mermaid
flowchart TD
    Root["Rota Raiz (/)"] --> Redirect{"Usuário Autenticado?"}
    
    Redirect -- Não --> LoginChoice["Rotas de Login"]
    LoginChoice --> LoginCliente["/login ou /login/cliente"]
    LoginChoice --> LoginAdmin["/admin/login"]

    Redirect -- Sim (Cliente) --> AreaCliente["/cliente (Portal do Cliente)"]
    Redirect -- Sim (Admin) --> AreaAdmin["/admin (Painel Administrativo)"]

    LoginCliente -->|"Autentica por CPF ou CNPJ"| AreaCliente
    LoginAdmin -->|"Autentica por E-mail + Senha"| AreaAdmin
```

### 3.1. Portal do Cliente (`/login`)
* **Identificação:** Apenas o **CPF ou CNPJ** do cliente cadastrado previamente pelo administrador.
* **Experiência:** Não exige senhas complexas, facilitando o pagamento rápido de boletos e mensalidades pelo celular ou computador.
* **Componentes:** Construído com `LoginCard`, `LoginVisualSidebar` (arco arquitetônico e arte 3D) e o hook `useCpfCnpj`.

### 3.2. Painel do Administrador (`/admin/login`)
* **Identificação:** E-mail corporativo (`admin@jgcode.com`) e senha (`admin123`).
* **Experiência:** Foco corporativo e restrito, com alternador de visibilidade de senha (`usePasswordToggle`) e atalho de retorno ao portal do cliente.

---

## 4. Módulos Funcionais do Sistema

### 4.1. Área Administrativa (`/admin/*`)
* **Visão Geral (`AdminDashboardOverviewPage.tsx`):**
  * Cards de métricas: Receita Mensal Recorrente (MRR), Clientes Ativos, Faturamento do Mês e Taxa de Inadimplência.
  * Gráfico de faturamento mensal e comparativo.
  * Card de **Próximos Vencimentos** alinhado com nome do cliente, valor e data de vencimento.
* **Gestão de Clientes (`AdminClientsPage.tsx`):**
  * Listagem, busca em tempo real por razão social, nome ou documento.
  * Modal de cadastro de novos clientes com validação e formatação automática de CPF/CNPJ.
* **Detalhes do Cliente & Projetos (`AdminClientDetailPage.tsx`):**
  * Dados cadastrais completos do cliente.
  * Gestão de Projetos: cadastro e **edição de projetos já salvos** (nome, links de publicação, notas técnicas, tipo de serviço: GMB, Site, E-mail Pro, Tráfego Pago, etc.).
  * Gestão Financeira: histórico de pagamentos, geração de cobrança Pix ou **baixa manual** pelo administrador.
* **Gestão de Usuários da Equipe (`AdminUsersPage.tsx`):**
  * Controle de acesso para administradores, gerentes de projeto, suporte e financeiro.
* **Layout Retrátil (`AdminLayout.tsx`):**
  * Menu lateral retrátil/expansível com persistência de estado no navegador.

### 4.2. Área do Cliente (`/cliente/*`)
* **Foco em Pagamentos Rápidos (`ClientDashboardPage.tsx`):**
  * Card de alerta destacado para faturas pendentes ou em atraso.
  * Botão de ação direta: **"Pagar com Pix"** (abre o modal com QR Code renderizado, chave Pix Copia-e-Cola e contador de expiração de 30 minutos).
  * Seção de faturas quitadas com data e método de pagamento.
  * Cards dos serviços ativos e projetos entregues com link de acesso direto.
  * Botão de suporte rápido direto no WhatsApp da JGcode.

---

## 5. Estrutura de Diretórios

```text
gestaoJGcode/
├── .env                          # Variáveis de ambiente ativas (Firebase)
├── .env.local                    # Variáveis de ambiente locais (Vite)
├── .env.example                  # Template de variáveis para novos ambientes
├── firebase.json                 # Configurações do Firebase CLI
├── firestore.rules               # Regras de segurança do Firestore
├── index.html                    # Ponto de entrada HTML com meta tags
├── package.json                  # Dependências e scripts npm
├── tailwind.config.js            # Configuração do Design System Apple
├── tsconfig.json                 # Configuração de compilação TypeScript
├── vercel.json                   # Configuração de rotas SPA na Vercel
├── public/
│   └── images/
│       ├── client-login.jpg      # Arte 3D da tela de login do cliente
│       └── admin-login.jpg       # Arte 3D da tela de login do administrador
└── src/
    ├── App.tsx                   # Roteamento principal e auto-limpeza
    ├── main.tsx                  # Inicialização do React DOM
    ├── index.css                 # Estilos globais e fontes
    ├── components/
    │   ├── common/               # Componentes atômicos (Button, Input, Badge, Modal, DividerWithText)
    │   ├── layout/               # Layouts (AdminLayout, LoginCard, LoginVisualSidebar)
    │   ├── payment/              # Modal de pagamento Pix (PixModal / PaymentModal)
    │   └── project/              # Modais de criação e edição de projetos
    ├── contexts/
    │   └── AuthContext.tsx       # Provedor global de autenticação (Admin / Client)
    ├── hooks/
    │   ├── useCpfCnpj.ts         # Hook de validação, formatação e detecção de documento
    │   └── usePasswordToggle.ts  # Hook para alternância de visibilidade de senha
    ├── pages/
    │   ├── admin/                # Páginas do painel administrativo
    │   ├── client/               # Página do portal do cliente
    │   └── auth/                 # Telas de login separadas (ClientLoginPage, AdminLoginPage)
    ├── routes/
    │   └── ProtectedRoute.tsx    # Guarda de rotas com redirecionamento inteligente
    ├── services/
    │   ├── firebase.ts           # Inicialização do SDK do Firebase
    │   ├── firestoreService.ts   # Operações no Firestore em nuvem
    │   ├── storageService.ts     # Camada de persistência local limpa
    │   └── payment/              # IPaymentProvider e MercadoPagoProvider
    ├── types/
    │   └── index.ts              # Tipagens TypeScript (Client, Project, Payment, PaymentPlan, User)
    └── utils/
        └── formatters.ts         # Formatadores BRL, CPF/CNPJ, telefone e datas
```

---

## 6. Configuração do Firebase & Ambiente

As credenciais do Firebase Firestore estão configuradas em `.env` e `.env.local`:

```ini
VITE_FIREBASE_API_KEY=AIzaSyAPISIq64MQIZ29nj9lsXFc0OxW9y0lwUA
VITE_FIREBASE_AUTH_DOMAIN=gestaojgcode.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=gestaojgcode
VITE_FIREBASE_STORAGE_BUCKET=gestaojgcode.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=921246955016
VITE_FIREBASE_APP_ID=1:921246955016:web:9d2b5b5b6813bbe7a483bd
VITE_FIREBASE_MEASUREMENT_ID=G-7HPYSG4Q3B
```

### Coleções do Firestore:
* `clients`: Armazena clientes cadastrados (`id`, `name`, `companyName`, `cpfCnpj`, `email`, `phone`, `address`, `active`).
* `projects`: Armazena projetos vinculados (`id`, `clientId`, `name`, `serviceType`, `publishedLink`, `technicalDetails`, `status`).
* `plans`: Armazena os planos financeiros (`AVISTA`, `PARCELADO`, `RECORRENTE`).
* `payments`: Armazena faturas e mensalidades (`amount`, `dueDate`, `status: PENDING | PAID | MANUAL`, `qrCodeCopyPaste`).
* `users`: Usuários internos com acesso ao painel admin.

---

## 7. Comandos Principais

* **Iniciar Servidor Local:**
  ```bash
  npm run dev
  ```
* **Compilar para Produção (Build Check):**
  ```bash
  npm run build
  ```
* **Visualizar Build de Produção Localmente:**
  ```bash
  npm run preview
  ```
* **Verificação de Lint:**
  ```bash
  npm run lint
  ```

---

## 8. Convenções e Boas Práticas

1. **Clean Code & Tipagem:** Não utilizar `any`. Todos os modelos e retornos de serviços devem utilizar as interfaces de `src/types/index.ts`.
2. **Moeda e Documentos:** Valores monetários sempre formatados com `formatCurrency(val)` (formato Real BRL: `R$ 1.500,00`). CPFs e CNPJs devem utilizar a máscara de `formatCpfCnpj`.
3. **Preservação de Layout:** Todo novo elemento deve seguir o design system Apple/Clean: bordas suaves (`rounded-xl` / `rounded-2xl`), cores neutras com destaque em azul JGcode (`#0071E3`) e contrastes acessíveis.

# JGcode Gestão – Plataforma de Clientes, Projetos e Pagamentos

Sistema modular para gestão de clientes, projetos (Sites, Google Meu Negócio, E-mails Corporativos e Tecnologia) com faturamento automatizado via Pix (Mercado Pago) e portal exclusivo para clientes.

---

## 🌟 Principais Recursos Implementados

### 1. Dois Acessos Independentes (Controle por Perfil)
- **Área do Cliente**:
  - Acesso direto informando apenas o **CPF ou CNPJ** cadastrado pelo Administrador.
  - Visualização de **Projetos em formato de cartões (Cards estilo Pinterest)** com status e links de publicação direta (Google Maps, sites, etc.).
  - Lista de **Mensalidades e Parcelas em Aberto**.
  - Botão **"Pagar com Pix"** que abre modal interativo gerando QR Code e chave Pix Copia e Cola.
  - Histórico de pagamentos quitados.

- **Painel do Administrador**:
  - Acesso seguro via credenciais corporativas.
  - Cadastro completo de clientes (com validação e máscara de CPF/CNPJ).
  - Cadastro de projetos vinculados a cada cliente (Sites, GMB, E-mail profissional, etc.).
  - Criação de planos de pagamento flexíveis: **À Vista**, **Parcelado** (com geração automática de parcelas) ou **Recorrente / Mensalidade**.
  - **Aprovação Manual**: possibilidade de o administrador marcar qualquer fatura como paga manualmente (dinheiro, TED, etc.).

### 2. Design System Inspirado na Apple & Pinterest
- **Apple**: Tipografia nítida (Inter / San Francisco), espaçamentos de 8pt, cantos arredondados suaves (`rounded-apple`), efeitos de vidro (*glassmorphism* / blur), sombras discretas e foco em clareza visual.
- **Pinterest**: Disposição de projetos em cartões visuais com imagem de capa, badges de categoria e foco em acessibilidade móvel.

### 3. Integração com Mercado Pago (Troçável / Extensível)
- Arquitetura baseada na interface `IPaymentProvider`:
  - `MercadoPagoProvider`: gera cobranças Pix reais através de Serverless Function Vercel (`/api/payments/pix.ts`) ou simulação visual de alta fidelidade.
  - `PaymentGatewayManager`: permite plugar qualquer outro gateway (Stripe, Asaas, PagBank) sem alterar as telas ou a regra de negócios.

### 4. 100% Gratuito (Plano Spark + Vercel)
- Roda no plano **Spark** do Firebase (Auth + Firestore).
- Hospedagem e Serverless Functions de pagamento na **Vercel** (sem custos de servidor).

---

## 🚀 Como Executar Localmente

### 1. Clonar e Instalar Dependências
```bash
npm install
```

### 2. Executar em Modo de Desenvolvimento
```bash
npm run dev
```
Abra o navegador em `http://localhost:5173`.

### 3. Contas de Demonstração (Já Inclusas)
Na tela de login, há botões de 1 clique para testar:
- **Cliente 1 (CNPJ)**: `12.345.678/0001-90` (Padaria Pão de Ouro – possui 2 projetos publicados e faturas pendentes).
- **Cliente 2 (CPF)**: `123.456.789-00` (Dr. Roberto Silva – serviço de e-mail corporativo).
- **Administrador**: `admin@jgcode.com` / Senha: `admin123`.

---

## 📁 Estrutura Modular de Pastas

```text
├── api/                       # Serverless Functions Vercel (Mercado Pago, Webhooks)
│   └── payments/pix.ts
├── src/
│   ├── components/
│   │   ├── common/            # Button, Input, Modal, Badge (Apple Design)
│   │   └── payment/           # PixPaymentModal (Mercado Pago QR Code)
│   ├── contexts/              # AuthContext (Dual login: Admin e Cliente via CPF/CNPJ)
│   ├── pages/
│   │   ├── admin/             # AdminDashboardPage (Clientes, Projetos, Faturas, Baixa Manual)
│   │   ├── client/            # ClientDashboardPage (Projetos estilo Pinterest, Pagamentos)
│   │   └── auth/              # LoginPage com alternador de perfil
│   ├── routes/                # ProtectedRoute e Router
│   ├── services/
│   │   ├── firebase.ts        # Conexão Firebase com fallback
│   │   ├── storageService.ts  # Camada de dados persistente com demo data
│   │   └── payment/           # IPaymentProvider e MercadoPagoProvider
│   ├── types/                 # Modelos de dados TypeScript
│   └── utils/                 # Formatadores BRL, CPF/CNPJ e datas
├── tailwind.config.js         # Tokens de design Apple & Pinterest
└── vercel.json                # Configuração para deploy na Vercel
```

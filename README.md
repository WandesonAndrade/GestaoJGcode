# JGcode Gestão – Plataforma de Clientes, Projetos e Pagamentos

Sistema web modular para gestão de clientes, projetos de tecnologia (Sites, Google Meu Negócio, E-mails Corporativos, etc.) e faturamento com portal de autoatendimento via Pix para clientes da **JGcode Soluções em Tecnologia**.

> 📖 **Para documentação técnica e arquitetura completa, consulte o arquivo [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md).**  
> 🗺️ **Para o status do roadmap e pendências de entrega, consulte [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).**

---

## 🌟 Principais Recursos

### 1. Duas Áreas Independentes
- **Portal do Cliente (`/login` e `/cliente`)**:
  - Acesso direto com **CPF ou CNPJ** sem necessidade de senhas complexas.
  - Alerta em destaque para faturas pendentes com botão imediato **"Pagar com Pix"** (QR Code e chave Copia-e-Cola).
  - Histórico de mensalidades quitadas.
  - Acompanhamento dos serviços contratados com links diretos para projetos publicados.
  - Botão de atendimento rápido via WhatsApp.
- **Painel Administrativo (`/admin/login` e `/admin`)**:
  - Acesso seguro para a equipe interna (`admin@jgcode.com`).
  - Dashboard executivo com métricas de MRR, faturamento mensal, gráfico e próximos vencimentos com layout alinhado.
  - Cadastro de clientes (PF e PJ) com validação de documentos.
  - Cadastro e **edição de projetos já salvos** com links de publicação, notas técnicas e domínios.
  - Planos de pagamento flexíveis: À Vista, Parcelado ou Recorrente (Mensalidade).
  - Gestão de faturas com geração de Pix e opção de **baixa manual** pelo administrador.
  - Gestão de usuários da equipe interna.

### 2. Design System Apple & Pinterest
- UI moderna e limpa inspirada nas diretrizes visuais da Apple e Pinterest.
- Telas de login com arco arquitetônico decorativo e ilustrações 3D.
- Menu lateral retrátil/expansível no painel administrativo.

### 3. Integração com Firebase & Mercado Pago
- **Firebase Firestore:** Conectado ao banco de dados em nuvem (`gestaojgcode`) com fallback local.
- **Mercado Pago:** Arquitetura desacoplada via interface `IPaymentProvider` para emissão de Pix instantâneo com geração de QR Code.

---

## 🚀 Como Executar Localmente

### 1. Instalar Dependências
```bash
npm install
```

### 2. Executar o Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse em: `http://localhost:5173`

### 3. Compilar para Produção
```bash
npm run build
```

---

## 🔑 Acesso Administrativo Inicial

* **E-mail:** `admin@jgcode.com`
* **Senha:** `admin123`
* **Rota:** `/admin/login`

---

## 📄 Licença
Propriedade privada de **JGcode Soluções em Tecnologia**. Todos os direitos reservados.

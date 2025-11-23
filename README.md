# GlowMana Backend API

Backend API para o aplicativo GlowMana - Sistema de gerenciamento de salão de beleza.

## 🚀 Versões Disponíveis

### JSON Server (atual - efêmero)
- Arquivo: `server.js`
- Dados em `db.json` (não persistem no Render Free)
- Comando: `npm start`

### MongoDB (recomendado - persistente)
- Arquivo: `server-mongodb.js`
- Dados no MongoDB Atlas (persistem)
- Comando: `npm run start:mongodb`

## 📦 Instalação

```bash
npm install
```

## 🔧 Configuração MongoDB

### Desenvolvimento Local

1. Instale MongoDB localmente ou use MongoDB Atlas
2. Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

3. Configure a connection string no `.env`:

```env
MONGODB_URI=mongodb://localhost:27017/glowmana
# ou
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/glowmana
```

4. Popule o banco com dados iniciais:

```bash
npm run seed
```

5. Inicie o servidor:

```bash
npm run start:mongodb
```

### Produção (Render)

Siga o guia completo em `MONGODB_MIGRATION.md` para configurar MongoDB Atlas.

## 📝 Endpoints Disponíveis

### Autenticação
- `POST /auth/register` - Registro de cliente
- `POST /auth/login` - Login de cliente
- `POST /auth/store-login` - Login de administrador
- `POST /auth/update` - Atualizar perfil de cliente
- `POST /auth/admin-update` - Atualizar perfil de admin

### Agendamentos
- `GET /appointments` - Listar agendamentos
- `POST /appointments` - Criar agendamento (cliente)
- `POST /store/appointments` - Criar agendamento (loja)
- `PATCH /appointments/:id` - Atualizar status
- `POST /appointments/:id/reschedule` - Reagendar
- `POST /appointments/:id/cancel` - Cancelar
- `DELETE /appointments/:id` - Excluir agendamento

### Serviços
- `GET /services` - Listar serviços
- `POST /store/services` - Criar serviço
- `DELETE /services/:id` - Excluir serviço

### Promoções
- `GET /promotions` - Listar promoções
- `POST /store/promotions` - Criar promoção
- `DELETE /promotions/:id` - Excluir promoção

### Notificações
- `GET /notifications` - Listar notificações
- `POST /notifications/:id/read` - Marcar como lida
- `POST /notifications/read-all` - Marcar todas como lidas

### Feedbacks
- `GET /feedbacks` - Listar feedbacks
- `POST /feedbacks` - Criar feedback

### Estatísticas
- `GET /stats/today` - Estatísticas do dia (agendamentos, cancelamentos, feedbacks)

## 🔐 Credenciais de Teste

**Admin:**
- Email: `admin@glowmana.com`
- Senha: `admin123`

**Cliente:**
- Email: `maria@exemplo.com`
- Senha: `senha123`

## ⚠️ Importante - Persistência de Dados

### JSON Server (server.js)
- ❌ Dados **NÃO** persistem no Render Free
- Quando o serviço hiberna, `db.json` volta ao estado inicial
- Use apenas para testes rápidos

### MongoDB (server-mongodb.js)
- ✅ Dados **PERSISTEM** permanentemente
- MongoDB Atlas oferece 512MB gratuito
- Recomendado para produção

## 📊 Estrutura do Banco MongoDB

```
glowmana (database)
├── users - Usuários clientes
├── storeadmins - Administradores
├── services - Serviços oferecidos
├── promotions - Promoções ativas
├── appointments - Agendamentos
├── feedbacks - Avaliações
└── notifications - Notificações
```

## 🚀 Deploy no Render

### Com JSON Server (efêmero)

1. Faça push do código para GitHub
2. Conecte repositório no Render
3. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`

### Com MongoDB (persistente)

1. Crie cluster no MongoDB Atlas (veja `MONGODB_MIGRATION.md`)
2. Adicione variável de ambiente no Render:
   - `MONGODB_URI=mongodb+srv://...`
3. Configure Start Command:
   - `npm run start:mongodb`
4. Execute seed uma vez:
   - `npm run seed`

## 📚 Documentação Adicional

- `MONGODB_MIGRATION.md` - Guia completo de migração para MongoDB
- `PERSISTENCIA.md` - Explicação do problema de persistência
- `.env.example` - Exemplo de configuração

## 🛠️ Scripts Disponíveis

```bash
npm start              # Inicia com JSON Server
npm run start:mongodb  # Inicia com MongoDB
npm run seed          # Popula MongoDB com dados iniciais
npm run dev           # Desenvolvimento com nodemon
```

## ⚡ Performance

### JSON Server
- Rápido para desenvolvimento
- Sem dependências externas
- ❌ Não persiste dados no Render

### MongoDB
- Escalável
- Consultas otimizadas com índices
- ✅ Persiste dados permanentemente
- 512MB gratuito no Atlas

## 🆘 Suporte

Problemas comuns e soluções em `MONGODB_MIGRATION.md` seção "Troubleshooting".

### Passo 1: Criar Repositório GitHub

1. Acesse https://github.com/new
2. Nome do repositório: `glowmana-backend`
3. Deixe como público
4. NÃO adicione README, .gitignore ou licença (já temos esses arquivos)
5. Clique em "Create repository"

### Passo 2: Fazer Upload do Código

Execute no PowerShell dentro da pasta `glowmana-backend`:

```powershell
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/glowmana-backend.git
git push -u origin main
```

**Substitua `SEU-USUARIO` pelo seu username do GitHub!**

### Passo 3: Deploy no Render

1. Acesse https://render.com e crie uma conta gratuita
2. No dashboard, clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub `glowmana-backend`
4. Configure:
   - **Name**: `glowmana-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Clique em "Create Web Service"
6. Aguarde o deploy (2-5 minutos)
7. Copie a URL do seu backend (ex: `https://glowmana-backend.onrender.com`)

### Passo 4: Atualizar App para Usar Backend Online

Edite o arquivo `src/config/api.js` no projeto GlowMana:

```javascript
export const API_URL = 'https://glowmana-backend.onrender.com';
```

Ou use variável de ambiente:

```bash
EXPO_PUBLIC_API_URL=https://glowmana-backend.onrender.com
```

## 📝 Endpoints Disponíveis

- `POST /auth/register` - Registro de cliente
- `POST /auth/login` - Login de cliente
- `POST /auth/store-login` - Login de administrador
- `POST /auth/update` - Atualizar perfil de cliente
- `POST /auth/admin-update` - Atualizar perfil de admin
- `GET /appointments` - Listar agendamentos
- `POST /appointments` - Criar agendamento
- `PATCH /appointments/:id` - Atualizar status
- `DELETE /appointments/:id` - Excluir agendamento
- `GET /services` - Listar serviços
- `POST /store/services` - Criar serviço
- `DELETE /services/:id` - Excluir serviço
- `GET /promotions` - Listar promoções
- `POST /store/promotions` - Criar promoção
- `DELETE /promotions/:id` - Excluir promoção
- `GET /notifications` - Listar notificações
- `POST /notifications/:id/read` - Marcar como lida

## 🔧 Desenvolvimento Local

```bash
npm install
npm start
```

O servidor estará disponível em `http://localhost:3001`

## ⚠️ Importante

- O plano gratuito do Render hiberna após 15 minutos de inatividade
- A primeira requisição após hibernar pode levar 30-60 segundos
- Para evitar isso, considere usar um serviço de "ping" ou upgrade para plano pago

## 📦 Estrutura

```
glowmana-backend/
├── server.js       # Servidor principal com todas as rotas
├── db.json         # Banco de dados JSON
├── package.json    # Dependências
└── README.md       # Este arquivo
```

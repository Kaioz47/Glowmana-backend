# GlowMana Backend API

Backend API para o aplicativo GlowMana - Sistema de gerenciamento de salão de beleza.

## 🚀 Deploy no Render

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

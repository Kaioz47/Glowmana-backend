# Guia de Migração para MongoDB Atlas

## Passo 1: Criar Conta MongoDB Atlas

1. Acesse https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta gratuita (pode usar Google/GitHub)
3. Escolha o plano **M0 Free** (512MB gratuito)

## Passo 2: Criar Cluster

1. No dashboard, clique em **"Build a Database"**
2. Escolha **FREE** (M0 Sandbox)
3. Provider: **AWS** (recomendado)
4. Region: Escolha a mais próxima (ex: São Paulo)
5. Cluster Name: `glowmana-cluster`
6. Clique em **"Create"**

⏰ *Aguarde 3-5 minutos para o cluster ser provisionado*

## Passo 3: Configurar Acesso

### Criar Usuário do Banco

1. Clique em **"Database Access"** (menu lateral)
2. **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `glowmana_user`
5. Password: Clique em **"Autogenerate Secure Password"** e **copie a senha**
6. Database User Privileges: **Read and write to any database**
7. Clique em **"Add User"**

### Configurar IP Whitelist

1. Clique em **"Network Access"** (menu lateral)
2. **"Add IP Address"**
3. Escolha **"Allow Access from Anywhere"** (0.0.0.0/0)
   - *Para produção, use apenas os IPs do Render*
4. Clique em **"Confirm"**

## Passo 4: Obter Connection String

1. Volte para **"Database"** (menu lateral)
2. Clique no botão **"Connect"** do seu cluster
3. Escolha **"Connect your application"**
4. Driver: **Node.js** | Version: **5.5 or later**
5. Copie a connection string (ex: `mongodb+srv://glowmana_user:<password>@glowmana-cluster...`)
6. **Substitua `<password>` pela senha que você copiou**

## Passo 5: Configurar Backend

### Localmente

1. Crie arquivo `.env` na raiz do backend:

```bash
MONGODB_URI=mongodb+srv://glowmana_user:SUA_SENHA_AQUI@glowmana-cluster.xxxxx.mongodb.net/glowmana?retryWrites=true&w=majority
PORT=3001
```

2. Rode o seed para popular o banco:

```bash
npm run seed
```

3. Inicie o servidor:

```bash
npm start
```

### No Render

1. Acesse o dashboard do Render: https://dashboard.render.com/
2. Selecione seu serviço `glowmana-backend`
3. Vá em **"Environment"** (menu lateral)
4. Clique em **"Add Environment Variable"**
5. Adicione:
   - Key: `MONGODB_URI`
   - Value: `mongodb+srv://glowmana_user:SUA_SENHA_AQUI@...`
6. Clique em **"Save Changes"**

⚠️ **O Render vai reiniciar automaticamente**

## Passo 6: Popular Banco no MongoDB Atlas

Após configurar no Render:

1. Acesse o shell do Render ou rode localmente com a mesma connection string
2. Execute o seed:

```bash
npm run seed
```

Ou use o MongoDB Compass:
1. Baixe: https://www.mongodb.com/try/download/compass
2. Conecte usando a connection string
3. Importe os dados de `db.json` manualmente

## Passo 7: Testar

```bash
# Teste local
curl http://localhost:3001/services

# Teste produção
curl https://glowmana-backend.onrender.com/services
```

Deve retornar os 5 serviços cadastrados!

## Verificação Final

✅ Checklist:
- [ ] Cluster MongoDB Atlas criado
- [ ] Usuário do banco configurado
- [ ] Network Access liberado (0.0.0.0/0)
- [ ] Connection string obtida e senha substituída
- [ ] Variável `MONGODB_URI` configurada no Render
- [ ] Seed executado com sucesso
- [ ] Backend respondendo corretamente
- [ ] Dados persistem após restart do Render

## Estrutura do Banco

```
glowmana (database)
├── users
├── storeadmins
├── services
├── promotions
├── appointments
├── feedbacks
└── notifications
```

## Monitoramento

### Via Atlas Dashboard
1. **"Database"** → Cluster → **"Collections"**
2. Visualize todas as coleções e documentos
3. **"Metrics"** para ver uso e performance

### Via MongoDB Compass
- Ferramenta visual para explorar dados
- Editar documentos
- Criar índices
- Executar queries

## Custos

**Plano Free (M0):**
- 512MB storage
- Shared RAM
- Shared vCPU
- ✅ Suficiente para até ~1000 usuários ativos

**Quando fazer upgrade:**
- Storage > 512MB
- Necessita backup automático
- Requer alta disponibilidade (replicas)

## Troubleshooting

### Erro: "MongoServerError: bad auth"
→ Senha incorreta na connection string

### Erro: "MongooseServerSelectionError"
→ IP não está na whitelist ou cluster inativo

### Dados não persistem
→ Verifique se `MONGODB_URI` está correta no Render

### Conexão lenta
→ Escolha region mais próxima ou upgrade para plano pago

## Suporte

- Docs MongoDB: https://docs.mongodb.com/
- Mongoose Docs: https://mongoosejs.com/docs/
- Atlas Support: https://www.mongodb.com/cloud/atlas/support

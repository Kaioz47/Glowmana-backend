# 🚀 Quick Start - MongoDB Atlas

## Configuração Rápida (5 minutos)

### 1. Criar Conta
1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Use Google/GitHub para login rápido

### 2. Criar Cluster FREE
1. Clique **"Build a Database"**
2. Escolha **M0 FREE** (512MB)
3. Provider: AWS
4. Region: São Paulo (sa-east-1)
5. Cluster Name: `glowmana`
6. **Create**

⏰ Aguarde 3-5 min

### 3. Criar Usuário
1. Menu **Database Access**
2. **Add New Database User**
3. Username: `glowmana_user`
4. **Autogenerate Password** → COPIE A SENHA!
5. Privilege: **Read and write**
6. **Add User**

### 4. Liberar IP
1. Menu **Network Access**
2. **Add IP Address**
3. **Allow Access from Anywhere** (0.0.0.0/0)
4. **Confirm**

### 5. Pegar Connection String
1. Menu **Database** → **Connect**
2. **Connect your application**
3. Driver: Node.js 5.5+
4. COPIE a string:
```
mongodb+srv://glowmana_user:<password>@glowmana.xxxxx.mongodb.net/?retryWrites=true&w=majority
```
5. Substitua `<password>` pela senha copiada no passo 3
6. Adicione `/glowmana` após `.net`:
```
mongodb+srv://glowmana_user:SENHA_AQUI@glowmana.xxxxx.mongodb.net/glowmana?retryWrites=true&w=majority
```

### 6. Configurar Backend

**Render (Produção):**
1. Dashboard Render → Seu serviço
2. **Environment** → **Add Environment Variable**
3. Key: `MONGODB_URI`
4. Value: (cole a connection string completa)
5. **Save Changes** (vai reiniciar)

### 7. Popular Dados

**Via Render Shell:**
```bash
npm run seed
```

**Ou via Compass:**
1. Baixe: https://www.mongodb.com/try/download/compass
2. Cole a connection string
3. Connect
4. Crie database `glowmana`
5. Importe JSON de `db.json`

### 8. Atualizar Start Command no Render

No Render, em **Settings**:
- Start Command: `npm run start:mongodb`
- **Save Changes**

### 9. Testar

```bash
curl https://glowmana-backend.onrender.com/services
```

Deve retornar os 5 serviços!

## ✅ Checklist

- [ ] Cluster criado
- [ ] Usuário criado e senha copiada
- [ ] IP liberado (0.0.0.0/0)
- [ ] Connection string obtida e password substituído
- [ ] `/glowmana` adicionado ao final da connection string
- [ ] `MONGODB_URI` configurado no Render
- [ ] Start command alterado para `npm run start:mongodb`
- [ ] Seed executado
- [ ] Backend testado e funcionando

## 🎉 Pronto!

Agora seus dados persistem permanentemente no MongoDB Atlas!

## 📊 Ver Dados

**MongoDB Atlas Dashboard:**
- Database → Collections → Visualizar dados

**MongoDB Compass (recomendado):**
- Interface visual
- Criar/editar documentos
- Executar queries
- Exportar/importar dados

## Dúvidas?

Veja `MONGODB_MIGRATION.md` para guia completo com troubleshooting.

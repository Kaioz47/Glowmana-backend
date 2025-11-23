# ⚠️ Problema de Persistência de Dados no Render

## Causa do Problema

O plano gratuito do Render usa **armazenamento efêmero**:
- Quando o serviço hiberna (após 15 min de inatividade)
- Quando o serviço é reiniciado
- Quando há um novo deploy

**Todos os dados gravados em `db.json` são perdidos** e o arquivo volta ao estado inicial do repositório.

## Soluções

### Opção 1: Banco de Dados Externo (Recomendado para Produção)

Migrar para um banco de dados persistente:

#### MongoDB Atlas (Gratuito)
```bash
npm install mongodb mongoose
```

**Vantagens:**
- Dados realmente persistentes
- 512MB gratuito
- Backup automático
- Escala facilmente

**Passos:**
1. Criar conta em https://www.mongodb.com/cloud/atlas/register
2. Criar cluster gratuito
3. Obter connection string
4. Adicionar como variável de ambiente no Render
5. Modificar `server.js` para usar MongoDB

#### PostgreSQL (Render oferece)
```bash
npm install pg
```

**Vantagens:**
- Integração direta com Render
- 1GB gratuito por 90 dias
- SQL familiar

### Opção 2: Manter JSON com Dados Iniciais Ricos

**Situação Atual:** Implementada neste commit

- O arquivo `db.json` agora tem dados iniciais completos
- Usuários podem testar sem precisar cadastrar tudo novamente
- **Limitação:** Novos cadastros ainda serão perdidos ao reiniciar

**Dados Iniciais Incluídos:**
- 1 admin pré-cadastrado
- 1 usuário demo
- 5 serviços prontos
- 1 promoção ativa
- 1 agendamento exemplo
- 1 feedback de exemplo

**Credenciais de Teste:**
- Admin: `admin@glowmana.com` / `admin123`
- Cliente: `maria@exemplo.com` / `senha123`

### Opção 3: Upgrade do Plano Render

**Custo:** $7/mês (Starter plan)

**Vantagens:**
- Mantém json-server
- Persistência funciona
- 512MB RAM
- Sem hibernação

## Recomendação

**Para desenvolvimento/testes:** Use Opção 2 (dados iniciais ricos) ✅ Implementado

**Para produção:** Migre para MongoDB Atlas (Opção 1)

## Como Implementar MongoDB

Veja o arquivo `MONGODB_MIGRATION.md` para instruções detalhadas de migração.

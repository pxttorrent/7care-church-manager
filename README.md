# 🏛️ Church Plus Manager

Sistema completo de gerenciamento para igrejas com funcionalidades avançadas de relacionamento, eventos e gamificação. **Agora com persistência real usando Neon Database e deploy automático no Netlify!**

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Neon Database (gratuita)

### Instalação Local
```bash
# Instalar dependências
npm install

# Configurar banco de dados
# 1. Crie uma conta em https://console.neon.tech/
# 2. Crie um novo projeto
# 3. Copie a connection string
# 4. Crie arquivo .env com:
echo "DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require" > .env

# Executar em desenvolvimento
npm run dev
```

### Deploy no Netlify
1. **Conecte seu repositório no Netlify**
2. **Configure as variáveis de ambiente:**
   - `DATABASE_URL`: Sua string de conexão do Neon
   - `NODE_ENV`: `production`
3. **Deploy automático!** 🚀

### Acesso
- **Local:** http://localhost:3065
- **Dashboard:** http://localhost:3065/dashboard
- **Login Admin:** admin@7care.com / meu7care

## ✨ Funcionalidades

### 👥 Gestão de Membros
- Cadastro completo de membros
- Sistema de aprovação
- Perfis detalhados com dados pessoais
- Histórico de atividades
- **Proteção do super administrador**

### 🎯 Sistema de Relacionamentos
- Conectar interessados com missionários
- Acompanhamento de relacionamentos
- Status de progresso
- Notas e observações

### 📅 Gestão de Eventos
- Criação e edição de eventos
- Sistema de convites
- Controle de presença
- Eventos recorrentes

### 🎮 Gamificação
- Sistema de pontos avançado
- Conquistas e badges
- Ranking de membros
- Metas e desafios
- **Cálculo automático de pontos**

### 📊 Dashboard e Relatórios
- Estatísticas em tempo real
- Gráficos interativos
- Relatórios personalizados
- Exportação de dados

### 💬 Comunicação
- Sistema de mensagens
- Notificações
- Chat em tempo real
- Avisos e comunicados

## 🛠️ Tecnologias

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express
- **Banco de Dados:** Neon Database (PostgreSQL)
- **Deploy:** Netlify
- **UI:** Tailwind CSS + Radix UI
- **Gráficos:** Recharts
- **Formulários:** React Hook Form + Zod
- **ORM:** Drizzle ORM

## 🗄️ Arquitetura de Dados

### **Neon Database (PostgreSQL)**
- ✅ **Persistência real** - Dados salvos permanentemente
- ✅ **Escalabilidade** - Suporta milhares de usuários
- ✅ **Backup automático** - Dados seguros
- ✅ **Performance** - Consultas SQL otimizadas

### **Tabelas Principais:**
- `users` - Usuários do sistema
- `churches` - Igrejas
- `events` - Eventos
- `relationships` - Relacionamentos missionário-interessado
- `meetings` - Reuniões
- `messages` - Mensagens
- `notifications` - Notificações
- `discipleship_requests` - Solicitações de discipulado
- `missionary_profiles` - Perfis missionários
- `emotional_checkins` - Check-ins emocionais
- `point_configs` - Configurações de pontos
- `achievements` - Conquistas
- E muito mais...

## 📁 Estrutura do Projeto

```
church-plus-manager/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários
├── server/                # Backend Express
│   ├── routes.ts          # Rotas da API
│   ├── neonAdapter.ts     # Adaptador Neon Database
│   ├── schema.ts          # Schema PostgreSQL
│   ├── migrateToNeon.ts   # Migração automática
│   └── index.ts           # Servidor principal
├── shared/                # Código compartilhado
│   └── schema.ts          # Schemas e tipos
├── netlify.toml           # Configuração Netlify
└── uploads/               # Arquivos enviados
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Executa servidor de desenvolvimento

# Build
npm run build        # Gera build de produção

# Produção
npm run start        # Executa servidor de produção

# Verificação
npm run check        # Verifica tipos TypeScript
```

## 🎯 Como Usar

### 1. **Primeiro Acesso**
- Acesse http://localhost:3065
- Faça login com as credenciais do super admin
- Configure as igrejas e departamentos

### 2. **Cadastro de Membros**
- Vá em "Membros" > "Novo Membro"
- Preencha os dados pessoais
- Aprove o membro no sistema

### 3. **Criar Eventos**
- Vá em "Eventos" > "Novo Evento"
- Configure data, local e descrição
- Convide os membros

### 4. **Sistema de Pontos**
- Configure as regras de pontuação
- Monitore o progresso dos membros
- Crie conquistas personalizadas

## 🔐 Segurança

- Senhas criptografadas com bcrypt
- Validação de dados com Zod
- Sanitização de inputs
- Controle de acesso por roles
- **Super administrador protegido**

## 🚀 Deploy no Netlify

### **Configuração Automática:**
1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push!

### **Variáveis de Ambiente:**
- `DATABASE_URL`: String de conexão do Neon
- `NODE_ENV`: `production`

### **Vantagens:**
- ✅ Deploy automático
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Variáveis de ambiente seguras

## 📱 Responsividade

- Design totalmente responsivo
- Funciona em desktop, tablet e mobile
- Interface adaptativa
- Componentes otimizados

## 🚀 Performance

- Carregamento otimizado
- Lazy loading de componentes
- Cache inteligente
- Compressão de assets
- **Banco de dados otimizado**

## 🎨 Personalização

- Temas claro/escuro
- Cores personalizáveis
- Layouts flexíveis
- Componentes modulares

## 📈 Roadmap

- [x] Migração para Neon Database
- [x] Deploy no Netlify
- [x] Proteção do super administrador
- [x] Sistema de pontos avançado
- [ ] Integração com sistemas externos
- [ ] App mobile nativo
- [ ] Relatórios avançados
- [ ] Sistema de backup
- [ ] Multi-idiomas

## 🤝 Contribuição

Este é um projeto proprietário. Para suporte ou dúvidas, entre em contato com a equipe de desenvolvimento.

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Church Plus Manager** - Transformando a gestão de igrejas com tecnologia moderna e persistência real! 🏛️✨

**Agora com Neon Database + Netlify!** 🚀
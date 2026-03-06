# ArkBioAI — Demo Interface

Demonstração interativa da plataforma ArkBioAI para priorização de alvos genéticos.

## Deploy no Vercel

### Opção 1: Via GitHub (recomendado)

```bash
# 1. Crie um repositório no GitHub
# 2. Faça push do projeto:
cd arkbioai-demo
git init
git add .
git commit -m "ArkBioAI demo"
git branch -M main
git remote add origin https://github.com/SEU_USER/arkbioai-demo.git
git push -u origin main

# 3. No Vercel (vercel.com):
#    → New Project → Import Git Repository
#    → Selecione arkbioai-demo
#    → Framework Preset: Vite (auto-detecta)
#    → Deploy
```

### Opção 2: Via CLI

```bash
# 1. Instale o Vercel CLI
npm i -g vercel

# 2. Na pasta do projeto
cd arkbioai-demo
npm install

# 3. Deploy
vercel

# Responda as perguntas:
#   → Set up and deploy? Y
#   → Which scope? (sua conta)
#   → Link to existing project? N
#   → Project name? arkbioai-demo
#   → Directory? ./
#   → Override settings? N

# 4. Para produção:
vercel --prod
```

## Desenvolvimento local

```bash
npm install
npm run dev
# Acesse http://localhost:5173
```

## Estrutura

```
arkbioai-demo/
├── index.html          # HTML entry point
├── package.json        # Dependencies (Vite + React)
├── vite.config.js      # Vite config
└── src/
    ├── main.jsx        # React entry
    └── App.jsx         # Toda a aplicação
```

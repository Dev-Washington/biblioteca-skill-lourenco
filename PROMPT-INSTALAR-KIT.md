# Prompt — instalar o kit certo no meu projeto

Cole o bloco abaixo em uma sessão do Claude Code aberta **dentro do projeto** que vai
receber o kit.

---

```
Analise este projeto e instale nele o kit de skills mais adequado do Catálogo LSK.

Fontes:
- Catálogo (página):   https://biblioteca-skill-lourenco.vercel.app/
- Repositório:         https://github.com/Dev-Washington/biblioteca-skill-lourenco
- Download direto:     https://biblioteca-skill-lourenco.vercel.app/downloads/<SLUG>.zip

Siga estes passos, nesta ordem:

1. DIAGNÓSTICO DO PROJETO
   Leia o que já existe aqui antes de decidir qualquer coisa: README, package.json /
   requirements.txt / go.mod / Gemfile / pubspec.yaml, estrutura de pastas, stack,
   framework, infraestrutura e o que já houver em .claude/. Diga em 3 a 5 linhas o que
   este projeto é e qual é o trabalho dominante nele (web, mobile, dados, segurança,
   documentação, produto, etc.).

2. CATÁLOGO
   Busque https://biblioteca-skill-lourenco.vercel.app/ e leia os 13 kits disponíveis
   (LSK 001 a LSK 013), com o que cada um cobre. Use a página como fonte da verdade —
   não presuma o conteúdo dos kits pelo nome.

   Slugs de download (o <SLUG> da URL):
   KIT-DEVWEB-AITMPL · KIT-SECURITY-SISTEM-AITMPL · KIT-DEVWEB-MOTION-AITMPL ·
   KIT-DEVOPS-CLOUD · KIT-MARKETING · KIT-CLAUDE-CODE · KIT-MOBILE-AITMPL ·
   KIT-PRODUTO-PM · KIT-DOCUMENTOS · KIT-IA-AGENTES · KIT-DOCUMENTACAO ·
   KIT-PESQUISA · KIT-DADOS-IA · TODOS-OS-KITS

3. RECOMENDAÇÃO
   Escolha os kit necessarios para o sistema. Justifique cada escolha com
   uma evidência concreta do meu projeto (um arquivo, uma dependência, um diretório) —
   não com uma descrição genérica. Liste também o que você considerou e descartou, e
   por quê. Se nenhum kit servir bem, diga isso em vez de forçar uma escolha.

   Pare aqui e me pergunte se pode instalar. Só siga adiante depois do meu "ok".

4. DOWNLOAD E VERIFICAÇÃO
   Depois do meu ok:
   - baixe o .zip para uma pasta temporária (não para dentro do projeto):
     curl -fL -o /tmp/<SLUG>.zip https://biblioteca-skill-lourenco.vercel.app/downloads/<SLUG>.zip
   - confirme que veio um zip de verdade (HTTP 200, content-type application/zip) e
     descompacte em /tmp
   - antes de instalar, leia o README.md e o install.sh do kit e me mostre o que o
     instalador faz: quantas skills, agents, comandos, hooks e MCPs ele vai colocar, e
     quais arquivos meus ele vai tocar ou fazer merge (.claude/settings.json,
     .mcp.json, CLAUDE.md)

5. CONFERÊNCIA
   Rode o check.sh do kit, se houver, e liste o que ficou instalado em .claude/:
   skills, agents, comandos e hooks, com o nome de cada um. Termine com 3 exemplos
   práticos de uso já ligados ao meu projeto — o que eu digito e o que acontece.

Regras: não instale nada antes do passo 3 aprovado; não apague nem sobrescreva
arquivos meus sem me mostrar antes; se o download falhar, me mostre o erro em vez de
seguir com uma alternativa inventada.
```

---

## Versão curta

Para quando você já sabe o que quer e só precisa que ele decida e instale:

```
Leia https://biblioteca-skill-lourenco.vercel.app/ (repo:
https://github.com/Dev-Washington/biblioteca-skill-lourenco), analise este projeto,
e me diga qual dos 13 kits LSK instalar e por quê — com evidência do meu código, não
descrição genérica. Depois do meu ok, baixe de
https://biblioteca-skill-lourenco.vercel.app/downloads/<SLUG>.zip, descompacte em /tmp
e rode ./install.sh neste projeto. No fim, liste o que foi instalado em .claude/.
```

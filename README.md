# Catálogo LSK

Landing page para distribuir 13 kits de skills, agents, comandos e hooks para o
[Claude Code](https://claude.com/claude-code). **394 componentes**, todos instalados
e verificados em disco antes de entrar no catálogo.

Página estática — sem framework, sem build, sem dependência.

**Compilado e construído por [Washington Lourenço](https://portifolio-lourenco.vercel.app/)**
— desenvolvedor, front-end e ferramentas.
[Portfólio](https://portifolio-lourenco.vercel.app/) · [GitHub](https://github.com/Dev-Washington)

---

## Multiplataforma

Cada kit traz dois instaladores, com comportamento idêntico:

| Sistema | Comando |
|---|---|
| macOS / Linux | `chmod +x install.sh` · `./install.sh /caminho/do/projeto` |
| Windows | `.\install.ps1 C:\caminho\do\projeto` |

O `install.ps1` é PowerShell nativo — não exige Node, Git Bash nem WSL. Foi testado
nos 13 kits com PowerShell 7.6.5, e o resultado é byte a byte igual ao do `install.sh`:
mesma contagem de skills, agents, comandos e hooks, mesmo merge de `settings.json` e
`.mcp.json`, mesmo `CLAUDE.md`.

Para pular os hooks: `--sem-hooks` (bash) ou `-SemHooks` (PowerShell).

> **Windows e Python.** Dois kits (Engenharia Web e Segurança) têm hooks em Python que
> chamam `python3`. No Windows o comando geralmente é `python` — ajuste em
> `.claude/settings.json` ou instale com `-SemHooks`.

## Rodar local

```bash
python3 -m http.server 8000
# http://localhost:8000
```

Abrir o `index.html` direto também funciona, inclusive os downloads.

## Publicar na Vercel

O repositório já vem com `vercel.json`. Não há comando de build.

1. Em [vercel.com/new](https://vercel.com/new), importe este repositório
2. **Framework Preset:** `Other`
3. **Build Command:** deixe vazio
4. **Output Directory:** deixe vazio (raiz)
5. Deploy

O `vercel.json` cuida de cache dos `.zip` e dos cabeçalhos de segurança.

> A pasta `downloads/` tem 14 MB. Está dentro do limite do plano gratuito da Vercel.

---

## Estrutura

```
.
├── index.html      a página — gerada a partir de catalogo.js
├── estilo.css      folha de estilo
├── pagina.js       campo de estrelas, revelação, filtros, fichas
├── catalogo.js     dados dos 13 kits — fonte da verdade
├── og.jpg          imagem de compartilhamento (1200×630)
├── vercel.json     cache e cabeçalhos
├── robots.txt
└── downloads/      14 arquivos .zip (13 kits + pacote completo)
```

Para mudar um kit: edite `catalogo.js` e regenere o `index.html`, ou edite a linha
correspondente direto no HTML.

---

## Design

**Estrutura: registro de observatório.** Cada kit é um objeto catalogado, com
designação, tipo, magnitude e classe espectral. Foi escolha deliberada para fugir da
grade de cards, que é o padrão de toda landing page gerada por IA.

**A magnitude é real.** Segue a convenção astronômica — quanto menor o número, mais
brilhante. Sirius tem −1,46; o maior kit do catálogo tem −1,6. Deriva da quantidade
de componentes.

**As classes espectrais usam cores reais de estrelas.** Classe O é azul-branca,
K é laranja. E os tipos fazem sentido: o kit Mobile é `Sistema binário` (duas
plataformas), o kit de Pesquisa está na constelação `Telescopium`.

**Uma estação espacial cruza o céu.** Aparece pela primeira vez por volta dos 4 s,
atravessa em ~16 s e some. Volta a cada 2,5–4 min, sempre por uma rota diferente.
O comportamento segue o da ISS a olho nu: ponto firme e brilhante, **sem piscar** — o
que pisca é avião — e em parte das passagens ela apaga no meio do céu, ao entrar na
sombra da Terra, sem chegar à borda. A rota da primeira passagem foi escolhida para
cair na faixa limpa entre a barra do topo e o rótulo: mais abaixo, ela passava atrás
do título e ninguém veria. Custo medido: **0 fps** — segue em 60.

**Sem gradiente roxo-azul, sem Inter, sem Poppins** — os três maiores clichês de
design gerado por IA. A tipografia é JetBrains Mono como display, não só como
metadado.

---

## Verificação

Tudo abaixo foi medido com Playwright, não estimado:

| Item | Resultado |
|---|---|
| Erros de console | nenhum |
| Frame rate | 61 fps |
| Overflow horizontal (320 → 2560 px) | nenhum |
| Contraste WCAG AA | todo texto aprovado |
| Hierarquia de headings | sem saltos |
| Elementos focáveis sem nome | 0 de 50 |
| HTML: interativo aninhado | nenhum |
| Sem JavaScript | 13 objetos e 13 links de download visíveis |
| `prefers-reduced-motion` | respeitado |
| Download + integridade dos zips | 14/14 íntegros |
| `install.ps1` nos 13 kits | 13/13, paridade total com `install.sh` |
| Abas de sistema (mac/win/linux) | trocam corretamente, escolha persiste |

### Problemas encontrados e corrigidos

**1. Frame rate em 25 fps.** O `filter: blur(90px)` das nebulosas era o gargalo —
medido isoladamente: 25 fps com, 61 fps sem. O canvas das estrelas custava apenas
0,36 ms por frame contra um orçamento de 16,7 ms; não era ele. Substituído por
gradientes radiais com paradas suaves — mesmo resultado visual, sem custo de
composição.

**2. Margens zeradas no mobile.** O atalho `padding` em `.secao` sobrescrevia o
`padding-inline` do container, e o texto encostava na borda. Trocado por
`padding-block`.

**3. Overflow horizontal.** As nebulosas transbordavam a viewport (`scrollWidth`
1468 contra 1440). Resolvido com `overflow:hidden` no container do céu.

**4. Contraste abaixo do mínimo.** O tom `--texto-3` dava 3,48:1 sobre o fundo —
reprovava em WCAG AA (mínimo 4,5:1) em 7 lugares. Ajustado para 4,91:1.

**5. HTML inválido.** Havia um `<a>` dentro de um `<button>` em cada uma das 13
linhas — conteúdo interativo aninhado quebra a navegação por teclado. Reestruturado:
o botão cobre a linha, o link de download fica por cima.

**6. `install.ps1` não copiava nada.** Duas falhas encontradas ao testar com PowerShell
real: caminhos montados com `\` (que no Unix é caractere literal, não separador), e
`Get-ChildItem` sem `-Force` — o PowerShell marca tudo sob uma pasta iniciada por ponto
como oculto, então listava zero arquivos e o script terminava anunciando sucesso.
Corrigidos com `Join-Path` aninhado e `-Force`.

**7. Conteúdo podia ficar invisível.** As revelações dependiam do
`IntersectionObserver`. Adicionada rede de segurança: passados 2,6 s, tudo aparece
independentemente. Numa página de download, conteúdo invisível é o pior defeito
possível.

**8. A estação passava escondida atrás do título.** A primeira rota cruzava a faixa
vertical ocupada pelo texto do herói. Como o céu fica atrás do conteúdo, a passagem
mais importante — a que acontece nos primeiros segundos — era invisível. Rotas
elevadas para o céu aberto acima do rótulo.

**9. O brilho da estação era um disco de borda dura.** Um `arc()` preenchido com
`globalAlpha` baixo não é um brilho: é um círculo cinza chapado. Trocado por
`createRadialGradient` com três paradas.

---

## Limitações

1. **Os downloads exigem os arquivos ao lado da página.** Funciona local e em
   hospedagem estática — não se você colar apenas o HTML em outro lugar.
2. **Sem analytics e sem captura de e-mail.** A página só distribui.
3. **As fontes vêm do Google Fonts.** Sem internet, cai para as do sistema — o
   layout continua correto, mas perde o caráter.
4. **Os textos de cada kit estão embutidos no HTML.** Mudança de conteúdo exige
   editar o arquivo.

---

## Autoria

**Washington Lourenço** — selecionou os 394 componentes, montou os 13 kits, escreveu
a skill `web-motion` (que não existia no catálogo de origem) e construiu esta página.

- Portfólio: **https://portifolio-lourenco.vercel.app/**
- GitHub: https://github.com/Dev-Washington

Os componentes dos kits vêm do catálogo público do [aitmpl.com](https://aitmpl.com/)
e mantêm suas licenças de origem. A curadoria, a skill `web-motion`, os scripts de
instalação, a documentação e esta página são de autoria própria.

Feito com [Claude Code](https://claude.com/claude-code).

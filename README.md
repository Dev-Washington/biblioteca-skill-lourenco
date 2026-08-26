# Catálogo LSK

Landing page para distribuir 13 kits de skills, agents, comandos e hooks para o
[Claude Code](https://claude.com/claude-code). **394 componentes**, todos instalados
e verificados em disco antes de entrar no catálogo.

Página estática — sem framework, sem build, sem dependência.

---

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

**6. Conteúdo podia ficar invisível.** As revelações dependiam do
`IntersectionObserver`. Adicionada rede de segurança: passados 2,6 s, tudo aparece
independentemente. Numa página de download, conteúdo invisível é o pior defeito
possível.

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

Feito com [Claude Code](https://claude.com/claude-code).

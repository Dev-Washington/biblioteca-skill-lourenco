const fs=require("fs");
const src=fs.readFileSync("catalogo.js","utf8").replace(/^const /gm,"globalThis.");
eval(src);
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
let S=0,A=0,C=0,H=0,M=0,KB=0;
for(const k of CATALOGO){S+=k.skills;A+=k.agents;C+=k.cmds;H+=k.hooks;M+=k.mcps;KB+=k.kb;}
const TOT=S+A+C, MB=(KB/1024).toFixed(1).replace(".",",");
const num=n=>String(n).replace(".",",");
const massa=kb=>kb>=1024?[(kb/1024).toFixed(1).replace(".",","),"MB"]:[String(kb),"KB"];
const setaExt=`<svg class="ext" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3h7v7M13 3 4 12"/></svg>`;
const seta=`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 2v9M4.5 7.5 8 11l3.5-3.5M2.5 13.5h11"/></svg>`;

const linhas=CATALOGO.map(k=>{
  const cor=CLASSES[k.classe].cor, comp=k.skills+k.agents+k.cmds;
  const fid="ficha-"+k.id.replace(/\s+/g,"-").toLowerCase();
  const [mv,mu]=massa(k.kb);
  return `
        <article class="objeto" data-classe="${k.classe}" style="--cor:${cor}">
          <div class="linha">
            <button class="alternar" type="button" aria-expanded="false" aria-controls="${fid}">
              <span class="sr">Abrir ficha de ${esc(k.nome)} — ${k.id}</span>
            </button>
            <span class="desig"><i class="astro" aria-hidden="true"></i>${k.id}</span>
            <span class="nome">
              <h3>${esc(k.nome)}</h3>
              <p>${esc(k.slug)}</p>
            </span>
            <span class="col col-tipo">${esc(k.tipo)}</span>
            <span class="col col-mag mag">${num(k.mag.toFixed(1))}<span> mag</span></span>
            <span class="col col-comp comp"><b>${comp}</b> comp.</span>
            <a class="baixar" href="downloads/${k.slug}.zip" download>${seta}<span>baixar</span><span class="sr"> ${esc(k.nome)}, arquivo zip</span></a>
          </div>
          <div class="ficha" id="${fid}">
            <div class="ficha-in">
              <div class="ficha-corpo">
                <div>
                  <p>${k.desc}</p>
                  <p class="destaque">${k.destaque}</p>
                  <div class="comando">
                    <span aria-hidden="true">$</span><code>./install.sh /caminho/do/seu/projeto</code>
                    <button class="copiar" type="button">copiar<span class="sr"> comando de instalação</span></button>
                  </div>
                </div>
                <div>
                  <dl class="inventario">
                    <div><dt>Skills</dt><dd${k.skills?"":' class="zero"'}>${k.skills}</dd></div>
                    <div><dt>Agents</dt><dd${k.agents?"":' class="zero"'}>${k.agents}</dd></div>
                    <div><dt>Comandos</dt><dd${k.cmds?"":' class="zero"'}>${k.cmds}</dd></div>
                    <div><dt>Hooks</dt><dd${k.hooks?"":' class="zero"'}>${k.hooks}</dd></div>
                    <div><dt>MCPs</dt><dd${k.mcps?"":' class="zero"'}>${k.mcps}</dd></div>
                    <div><dt>Massa</dt><dd>${mv}<small>${mu}</small></dd></div>
                  </dl>
                  <p class="proc">Classe ${k.classe} · ${esc(CLASSES[k.classe].nome)} · ${esc(k.constelacao)}</p>
                </div>
              </div>
            </div>
          </div>
        </article>`;
}).join("");

/* prompts de instalação — fonte única: PROMPT-INSTALAR-KIT.md */
/* o original mora na raiz do repo de kits; se estiver ao lado, sincroniza a cópia local
   (é ela que vai para o deploy — a pasta da landpage é o repo publicado). */
if(fs.existsSync("../PROMPT-INSTALAR-KIT.md")) fs.copyFileSync("../PROMPT-INSTALAR-KIT.md","PROMPT-INSTALAR-KIT.md");
const promptMd=fs.readFileSync("PROMPT-INSTALAR-KIT.md","utf8");
const blocos=[...promptMd.matchAll(/```\n([\s\S]*?)```/g)].map(m=>m[1].replace(/\s+$/,""));
if(blocos.length<2) throw new Error("PROMPT-INSTALAR-KIT.md: esperava 2 blocos de prompt, achei "+blocos.length);
const [promptLongo,promptCurto]=blocos;
const linhasLongo=promptLongo.split("\n").length, linhasCurto=promptCurto.split("\n").length;

const chips=Object.entries(CLASSES).map(([c,v])=>{
  const n=CATALOGO.filter(k=>k.classe===c).length;
  return `<button class="filtro" type="button" data-classe="${c}" aria-pressed="false"><i style="background:${v.cor}" aria-hidden="true"></i>${esc(v.nome)} <span class="cont">${n}</span></button>`;
}).join("\n            ");

const html=`<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Catálogo LSK — ${TOT} componentes para o Claude Code</title>
<meta name="description" content="Treze kits de skills, agents, comandos e hooks para o Claude Code. ${TOT} componentes catalogados, instalados e verificados, prontos para baixar.">
<meta name="author" content="Washington Lourenço">
<link rel="author" href="https://portifolio-lourenco.vercel.app/">
<meta name="theme-color" content="#05060A">
<meta name="color-scheme" content="dark">
<meta property="og:title" content="Catálogo LSK — ${TOT} componentes para o Claude Code">
<meta property="og:description" content="Treze kits prontos: engenharia web, segurança, mobile, motion, IA, dados, documentos e mais. Baixe e aponte para o seu projeto.">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='5' fill='%23FFB56B'/%3E%3Ccircle cx='16' cy='16' r='11' fill='none' stroke='%23FFB56B' stroke-opacity='.35'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500&family=JetBrains+Mono:wght@200;300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="estilo.css">
</head>
<body>

<a class="pular" href="#catalogo">Pular para o catálogo</a>

<div id="ceu" aria-hidden="true">
  <div class="fundo-ceu"></div>
  <div class="nebulosa neb-1"></div>
  <div class="nebulosa neb-2"></div>
  <div class="nebulosa neb-3"></div>
  <canvas id="estrelas"></canvas>
  <div class="grade"></div>
</div>
<div class="veu" aria-hidden="true"></div>

<div class="envelope">

  <header class="status">
    <div class="faixa status-in">
      <span class="marca">CATÁLOGO <b>LSK</b></span>
      <span class="status-sep" aria-hidden="true"></span>
      <span class="pip oculta-mob">13 objetos catalogados</span>
      <span class="status-sep oculta-mob" aria-hidden="true"></span>
      <a class="destaque-link oculta-mob" href="#prompt">prompt de instalação</a>
      <span class="status-sep oculta-mob" aria-hidden="true"></span>
      <a class="destaque-link oculta-mob" href="https://portifolio-lourenco.vercel.app/" target="_blank" rel="noopener noreferrer">por Washington Lourenço</a>
      <a class="pip destaque-link" href="downloads/TODOS-OS-KITS.zip" download>baixar tudo<span class="sr"> — os 13 kits, arquivo zip</span></a>
    </div>
  </header>

  <main>

    <section class="levantamento faixa">
      <p class="etiqueta rev">Levantamento do céu profundo · Claude Code</p>
      <h1 class="rev">Treze corpos<br>catalogados.<br><span class="brilho">${TOT} componentes</span><br><em>prontos para usar.</em></h1>
      <p class="chamada rev">
        Cada objeto deste catálogo é um kit completo de skills, agents, comandos e hooks para o
        Claude&nbsp;Code. Nenhum é teórico — <strong>todos foram instalados, testados e verificados
        em disco</strong> antes de entrar aqui. Baixe, aponte para o seu projeto, e a IA passa a
        trabalhar com o conhecimento certo.
      </p>
      <dl class="leitura rev">
        <div><dt>Skills</dt><dd>${S}</dd></div>
        <div><dt>Agents</dt><dd>${A}</dd></div>
        <div><dt>Comandos</dt><dd>${C}</dd></div>
        <div><dt>Massa total</dt><dd>${MB}<small>MB</small></dd></div>
      </dl>
      <div class="acoes rev">
        <a class="btn btn-primario" href="downloads/TODOS-OS-KITS.zip" download>${seta} Baixar os 13 kits</a>
        <a class="btn" href="#catalogo">Percorrer o catálogo</a>
        <a class="btn" href="#prompt">Prompt de instalação</a>
      </div>
    </section>

    <section class="secao faixa" id="catalogo" aria-labelledby="t-catalogo">
      <div class="secao-topo">
        <span class="indice" aria-hidden="true">01 — Registro</span>
        <h2 id="t-catalogo">O catálogo</h2>
      </div>
      <p class="nota rev nota-topo">
        Ordenado por magnitude — quanto <strong>menor</strong> o número, mais brilhante o objeto.
        É a convenção astronômica real: Sirius tem magnitude −1,46. Aqui a magnitude deriva da
        quantidade de componentes. Abra qualquer linha para ver a ficha.
      </p>

      <div class="filtros rev" role="group" aria-label="Filtrar por classe">
        <button class="filtro" type="button" data-classe="tudo" aria-pressed="true">Tudo <span class="cont">13</span></button>
        ${chips}
      </div>

      <div class="registro">
        <div class="cabecalho" aria-hidden="true">
          <span>Designação</span><span>Objeto</span><span>Tipo</span>
          <span>Magnitude</span><span>Componentes</span><span></span>
        </div>
        ${linhas}
      </div>
      <p class="nota rodape-reg" role="status">
        <span id="contagem">13 objetos</span> · ${S} skills · ${A} agents · ${C} comandos · ${H} hooks · ${M} MCPs
      </p>
    </section>

    <section class="secao faixa" aria-labelledby="t-inst">
      <div class="secao-topo">
        <span class="indice" aria-hidden="true">02 — Instrumentação</span>
        <h2 id="t-inst">Como baixar e usar</h2>
      </div>
      <p class="nota rev nota-topo">
        Cada kit é uma pasta com <code>.claude/</code>, documentação e dois instaladores:
        <code>install.sh</code> para macOS e Linux, <code>install.ps1</code> para Windows.
        Não precisa de instalação global, conta, nem Node — os instaladores usam só o que já
        vem com o sistema.
      </p>

      <div class="so" role="group" aria-label="Escolha o sistema operacional">
        <button class="so-aba" type="button" data-so="mac" aria-pressed="true">macOS</button>
        <button class="so-aba" type="button" data-so="win" aria-pressed="false">Windows</button>
        <button class="so-aba" type="button" data-so="linux" aria-pressed="false">Linux</button>
      </div>

      <div class="passos rev-lista">
        <div class="passo">
          <p class="passo-n">Passo 01</p>
          <h3>Baixe e descompacte</h3>
          <p>Pegue um kit ou o pacote completo, no botão acima. Dentro vem tudo pronto — nada é baixado depois.</p>
          <pre data-so="mac"><i># o Finder já descompacta com dois cliques.</i>
<i># pelo terminal:</i>
unzip <b>KIT-DEVWEB-AITMPL.zip</b> -d meu-kit
cd meu-kit</pre>
          <pre data-so="win" hidden><i># o Explorer descompacta com botão direito &gt; Extrair tudo.</i>
<i># pelo PowerShell:</i>
Expand-Archive <b>KIT-DEVWEB-AITMPL.zip</b> -DestinationPath meu-kit
cd meu-kit</pre>
          <pre data-so="linux" hidden><i># se faltar o unzip: sudo apt install unzip</i>
unzip <b>KIT-DEVWEB-AITMPL.zip</b> -d meu-kit
cd meu-kit</pre>
        </div>

        <div class="passo">
          <p class="passo-n">Passo 02</p>
          <h3>Aponte para o projeto</h3>
          <p>Copia skills, agents e comandos sem sobrescrever nada. Rodar duas vezes não duplica.</p>
          <pre data-so="mac"><i># libera a execução, só na 1ª vez</i>
chmod +x install.sh check.sh

<b>./install.sh</b> /caminho/do/projeto
<b>./check.sh</b>   <i># confere o que chegou</i></pre>
          <pre data-so="win" hidden><i># se o Windows bloquear scripts, só nesta janela:</i>
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

<b>.\\install.ps1</b> C:\\caminho\\do\\projeto</pre>
          <pre data-so="linux" hidden><b>chmod</b> +x install.sh check.sh

<b>./install.sh</b> /caminho/do/projeto
<b>./check.sh</b>   <i># confere o que chegou</i></pre>
        </div>

        <div class="passo">
          <p class="passo-n">Passo 03</p>
          <h3>Abra e use</h3>
          <p>As skills ativam sozinhas quando o assunto aparece. Cada kit traz comandos próprios.</p>
          <pre data-so="mac">cd /caminho/do/projeto
<b>claude</b>
<i># dentro da sessão:</i>
<b>/kit-devweb</b></pre>
          <pre data-so="win" hidden>cd C:\\caminho\\do\\projeto
<b>claude</b>
<i># dentro da sessão:</i>
<b>/kit-devweb</b></pre>
          <pre data-so="linux" hidden>cd /caminho/do/projeto
<b>claude</b>
<i># dentro da sessão:</i>
<b>/kit-devweb</b></pre>
        </div>
      </div>

      <div class="avisos rev-lista">
        <p class="aviso" data-so="mac">
          <b>macOS</b> — se o sistema disser que o arquivo veio da internet e bloquear, rode
          <code>xattr -d com.apple.quarantine install.sh</code> uma vez. Os kits com hooks em
          Python usam <code>python3</code>, que já vem no macOS.
        </p>
        <p class="aviso" data-so="win" hidden>
          <b>Windows</b> — o <code>install.ps1</code> usa só PowerShell, sem dependência externa.
          Dois kits (Engenharia&nbsp;Web e Segurança) trazem hooks escritos em Python que chamam
          <code>python3</code>; no Windows o comando costuma ser <code>python</code> — ajuste em
          <code>.claude/settings.json</code>, ou instale sem eles passando
          <code>-SemHooks</code>. Também funciona pelo WSL ou Git&nbsp;Bash, usando o
          <code>install.sh</code>.
        </p>
        <p class="aviso" data-so="linux" hidden>
          <b>Linux</b> — precisa do <code>unzip</code> e, para os kits com hooks, do
          <code>python3</code>. Ambos costumam já estar instalados; se não,
          <code>sudo apt install unzip python3</code>.
        </p>
      </div>

      <p class="nota nota-fim">
        Prefere não instalar em lugar nenhum? Abra o Claude&nbsp;Code dentro da própria pasta do
        kit — tudo carrega automaticamente. E se um kit tiver hooks que bloqueiam comandos, você
        pode instalar sem eles: <code>./install.sh /destino --sem-hooks</code> no macOS e Linux,
        <code>.\\install.ps1 C:\\destino -SemHooks</code> no Windows.
      </p>
    </section>

    <section class="secao faixa" id="prompt" aria-labelledby="t-prompt">
      <div class="secao-topo">
        <span class="indice" aria-hidden="true">03 — Piloto automático</span>
        <h2 id="t-prompt">Deixe o Claude escolher o kit</h2>
      </div>
      <p class="nota rev nota-topo">
        Se você não quer decidir sozinho qual dos 13 kits serve ao seu projeto, cole um dos
        prompts abaixo numa sessão do Claude&nbsp;Code aberta <strong>dentro do projeto</strong>.
        Ele lê o que já existe ali, recomenda com evidência do seu próprio código, espera o seu
        ok e só então baixa e instala.
      </p>

      <div class="prompt-bloco rev">
        <div class="prompt-abas">
          <div class="pr-grupo" role="group" aria-label="Escolha a versão do prompt">
            <button class="pr-aba" type="button" data-pr="longo" aria-pressed="true">Versão completa</button>
            <button class="pr-aba" type="button" data-pr="curto" aria-pressed="false">Versão curta</button>
          </div>
          <a class="pr-arquivo" href="PROMPT-INSTALAR-KIT.md" download>PROMPT-INSTALAR-KIT.md<span class="sr"> — baixar o arquivo com as duas versões</span></a>
        </div>

        <div class="pr-painel" data-painel="longo">
          <div class="pr-topo">
            <span class="pr-rotulo">5 passos · diagnóstico, catálogo, recomendação, download e conferência · ${linhasLongo} linhas</span>
            <button class="copiar" type="button" data-alvo="prompt-longo">copiar<span class="sr"> o prompt completo</span></button>
          </div>
          <pre class="pr-texto" id="prompt-longo" tabindex="0">${esc(promptLongo)}</pre>
        </div>

        <div class="pr-painel" data-painel="curto" hidden>
          <div class="pr-topo">
            <span class="pr-rotulo">Direto ao ponto · para quem já conhece o catálogo · ${linhasCurto} linhas</span>
            <button class="copiar" type="button" data-alvo="prompt-curto">copiar<span class="sr"> o prompt curto</span></button>
          </div>
          <pre class="pr-texto" id="prompt-curto" tabindex="0">${esc(promptCurto)}</pre>
        </div>
      </div>

      <p class="nota nota-fim">
        Os dois prompts travam antes de instalar qualquer coisa: o Claude só baixa o
        <code>.zip</code> depois do seu ok, mostra o que o instalador vai tocar
        (<code>.claude/settings.json</code>, <code>.mcp.json</code>, <code>CLAUDE.md</code>) e não
        sobrescreve arquivo seu sem avisar.
      </p>
    </section>

    <section class="secao faixa" aria-labelledby="t-proc">
      <div class="secao-topo">
        <span class="indice" aria-hidden="true">04 — Procedência</span>
        <h2 id="t-proc">De onde vieram</h2>
      </div>
      <div class="colofao-grade rev">
        <div>
          <h3>Origem</h3>
          <p>
            Os componentes vêm do catálogo público do
            <a href="https://aitmpl.com/" target="_blank" rel="noopener noreferrer">aitmpl.com</a>
            — 872 skills, 422 agents, 286 comandos, 101 MCPs e 62 hooks — filtrados por tema,
            validados um a um contra o catálogo e instalados clonando o repositório de origem.
          </p>
          <p>
            Uma skill não veio de lá: <strong>web-motion</strong>, no LSK&nbsp;003. O catálogo não
            tem nenhuma skill de animação web, e nenhum componente dele menciona
            <code>prefers-reduced-motion</code>. Ela foi escrita do zero — e esta página foi
            construída seguindo ela.
          </p>
        </div>
        <div>
          <h3>O que foi verificado</h3>
          <ul>
            <li>${TOT} componentes validados</li>
            <li>Frontmatter conferido em todos</li>
            <li>Hooks testados com payload real</li>
            <li>install.sh testado e idempotente</li>
            <li>check.sh: 0 faltando em 13 kits</li>
            <li>Contraste WCAG AA em todo texto</li>
          </ul>
        </div>
        <div>
          <h3>Ressalvas</h3>
          <ul>
            <li>Componentes de terceiros — revise antes de executar, sobretudo hooks</li>
            <li>Popularidade desigual entre skills</li>
            <li>Alguns MCPs pedem credencial</li>
            <li>Não substitui revisão humana</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="secao faixa" id="autoria" aria-labelledby="t-autoria">
      <div class="secao-topo">
        <span class="indice" aria-hidden="true">05 — Observador</span>
        <h2 id="t-autoria">Quem compilou</h2>
      </div>
      <div class="placa rev">
        <div class="placa-quem">
          <p class="placa-rotulo">Compilado e construído por</p>
          <p class="placa-nome">Washington Lourenço</p>
          <p class="placa-cargo">Desenvolvedor · front-end e ferramentas</p>
          <p class="placa-txt">
            Selecionou os ${TOT} componentes deste catálogo, montou os 13 kits, escreveu a skill
            <strong>web-motion</strong> — que não existia no catálogo de origem — e construiu
            esta página.
          </p>
          <div class="placa-links">
            <a class="btn btn-primario" href="https://portifolio-lourenco.vercel.app/" target="_blank" rel="noopener noreferrer">
              Ver o portfólio${setaExt}
            </a>
            <a class="btn" href="https://github.com/Dev-Washington" target="_blank" rel="noopener noreferrer">
              GitHub${setaExt}
            </a>
          </div>
        </div>
        <dl class="placa-dados">
          <div><dt>Observador</dt><dd>Washington Lourenço</dd></div>
          <div><dt>Portfólio</dt><dd><a href="https://portifolio-lourenco.vercel.app/" target="_blank" rel="noopener noreferrer">portifolio-lourenco.vercel.app</a></dd></div>
          <div><dt>Repositório</dt><dd><a href="https://github.com/Dev-Washington/biblioteca-skill-lourenco" target="_blank" rel="noopener noreferrer">Dev-Washington/biblioteca-skill-lourenco</a></dd></div>
          <div><dt>Primeira publicação</dt><dd>26 de agosto de 2026</dd></div>
        </dl>
      </div>
    </section>

  </main>

  <footer class="colofao faixa">
    <div class="assinatura">
      <span>Catálogo LSK · rev. 26.08.2026</span>
      <span>Compilado por <a class="destaque-link" href="https://portifolio-lourenco.vercel.app/" target="_blank" rel="noopener noreferrer">Washington Lourenço</a></span>
      <span>${TOT} componentes · 13 objetos · ${MB} MB</span>
    </div>
  </footer>

</div>

<script src="pagina.js" defer></script>
</body>
</html>
`;
fs.writeFileSync("index.html",html);
console.log("index.html regerado: "+html.split("\n").length+" linhas, "+(Buffer.byteLength(html)/1024).toFixed(1)+" KB");

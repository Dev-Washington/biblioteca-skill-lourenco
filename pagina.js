/* ============================================================
   Catálogo LSK — comportamento
   Regra: transform e opacity apenas. Conteúdo visível sem JS.
   ============================================================ */
(function(){
'use strict';
var reduz = window.matchMedia('(prefers-reduced-motion: reduce)');
/* A faixa de ceu limpa so existe no heroi. Fora dele a estacao cruzaria
   por tras do texto das outras secoes, onde nao ha espaco livre. */
var heroiNaTela = true;

/* ---------- 1. campo de estrelas ---------- */
function ceu(){
  var cv = document.getElementById('estrelas');
  if(!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d', {alpha:true});
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var L = 0, A = 0, estrelas = [], meteoro = null, t0 = 0, raf = 0;
  var relogio = 0, est = null, proxEst = 0, rotaIdx = 0;

  // 3 camadas de profundidade: longe/média/perto
  var CAMADAS = [
    {n:0.00060, r:[0.35,0.85], b:[0.18,0.42], v:0.0028, p:0.16},
    {n:0.00028, r:[0.55,1.15], b:[0.30,0.62], v:0.0060, p:0.38},
    {n:0.00010, r:[0.85,1.75], b:[0.45,0.92], v:0.0110, p:0.72}
  ];
  // cores de classes espectrais reais
  var TONS = ['#FFFFFF','#FFFFFF','#FFFFFF','#DCE6FF','#C8D8FF','#FFE6C8','#FFD2A1'];

  function rnd(a,b){ return a + Math.random()*(b-a); }

  function semear(){
    L = cv.clientWidth; A = cv.clientHeight;
    cv.width = Math.round(L*dpr); cv.height = Math.round(A*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    estrelas = [];
    var area = L*A;
    for(var c=0;c<CAMADAS.length;c++){
      var k = CAMADAS[c];
      var qtd = Math.min(Math.round(area*k.n), 620);
      for(var i=0;i<qtd;i++){
        estrelas.push({
          x: Math.random()*L, y: Math.random()*A,
          r: rnd(k.r[0],k.r[1]), base: rnd(k.b[0],k.b[1]),
          v: k.v, p: k.p, cor: TONS[(Math.random()*TONS.length)|0],
          fase: Math.random()*Math.PI*2, freq: rnd(0.4,1.5)
        });
      }
    }
  }

  function estrela(s, alfa){
    ctx.globalAlpha = alfa;
    ctx.fillStyle = s.cor;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.2832); ctx.fill();
    if(s.r > 1.15 && alfa > 0.55){           // halo só nas mais brilhantes
      ctx.globalAlpha = alfa*0.13;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r*3.6, 0, 6.2832); ctx.fill();
    }
  }

  /* ---------- estacao espacial ----------
     Travessia de ponta a ponta: entra por um lado, cruza o ceu e sai pelo
     outro, sumindo de vez. A proxima entra pelo lado oposto e por outra
     altura, entao nunca repete o mesmo caminho seguido.
     Coordenadas relativas para sobreviver a qualquer redimensionamento;
     x fora de [0,1] e fora da tela de proposito. */
  // A faixa de ceu entre a barra do topo e a etiqueta e estreita, e a estacao
  // nao pode encostar no texto: atras da etiqueta o contraste cai para 1,3:1.
  // Entao os caminhos variam em sentido e inclinacao, dentro dessa faixa.
  var ROTAS = [
    {a:[ 1.16, 0.134], b:[-0.16, 0.152]},   // direita -> esquerda, descendo
    {a:[-0.16, 0.150], b:[ 1.16, 0.133]},   // esquerda -> direita, subindo
    {a:[ 1.16, 0.152], b:[-0.16, 0.135]},
    {a:[-0.16, 0.133], b:[ 1.16, 0.151]},
    {a:[ 1.16, 0.142], b:[-0.16, 0.142]},   // reta
    {a:[-0.16, 0.148], b:[ 1.16, 0.136]}
  ];
  var EST_PRIMEIRA  = 2600;               // primeira aparece logo
  var EST_TRAVESSIA = 44000;              // 44 s de ponta a ponta: sem pressa
  var EST_PAUSA     = [52000, 84000];     // ~1 a 1,5 min de ceu limpo

  function suavizar(q){ return q <= 0 ? 0 : q >= 1 ? 1 : q*q*(3 - 2*q); }

  /* --- silhueta da ISS ---
     Modelada nos quadros do proprio video: trelica integrada com os nos entre
     segmentos, quatro pares de asas solares com a grade de celulas e a moldura
     acobreada, radiadores brancos perpendiculares, a fila de modulos
     pressurizados sob o centro, nave acoplada e as antenas parabolicas.
     Vetor e nao imagem: nitida em qualquer densidade de tela e sem peso. */
  function asaSolar(x, y, w, h, A){
    var g = ctx.createLinearGradient(x, y, x + w, y);
    g.addColorStop(0,    'rgba(38,52,92,'    + (A*0.92) + ')');
    g.addColorStop(0.35, 'rgba(104,132,196,' + (A*0.96) + ')');
    g.addColorStop(0.62, 'rgba(78,102,158,'  + (A*0.94) + ')');
    g.addColorStop(1,    'rgba(34,46,84,'    + (A*0.90) + ')');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    // grade de celulas
    ctx.fillStyle = 'rgba(12,16,30,' + (A*0.42) + ')';
    for(var i = 1; i < 7; i++) ctx.fillRect(x, y + h*i/7 - 0.22, w, 0.44);
    ctx.fillRect(x + w/2 - 0.22, y, 0.44, h);
    // moldura acobreada das bordas longas, marca visivel da ISS
    ctx.fillStyle = 'rgba(172,110,66,' + (A*0.8) + ')';
    ctx.fillRect(x, y, 0.62, h); ctx.fillRect(x + w - 0.62, y, 0.62, h);
  }

  function radiador(x, y, w, h, A){
    var g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0, 'rgba(246,249,255,' + (A*0.92) + ')');
    g.addColorStop(1, 'rgba(176,188,212,' + (A*0.86) + ')');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(120,134,164,' + (A*0.5) + ')';
    for(var i = 1; i < 4; i++) ctx.fillRect(x + w*i/4 - 0.16, y, 0.32, h);
  }

  function modulo(x, y, w, h, A, juntas){
    var g = ctx.createLinearGradient(x, y, x, y + h);
    g.addColorStop(0,   'rgba(226,234,248,' + (A*0.96) + ')');
    g.addColorStop(0.42,'rgba(250,252,255,' + (A*0.98) + ')');
    g.addColorStop(1,   'rgba(150,162,190,' + (A*0.92) + ')');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    // juntas entre modulos: sem elas a fila le como uma barra lisa
    ctx.fillStyle = 'rgba(112,124,152,' + (A*0.6) + ')';
    for(var i = 1; i < (juntas || 1); i++) ctx.fillRect(x + w*i/juntas - 0.28, y, 0.56, h);
  }

  // x inicial de cada coluna de asas: duas em cada ponta da trelica
  var PARES = [-34.0, -27.6, 22.4, 28.8];

  function corpoISS(A){
    var i, x;
    // Asas longas e estreitas -- ~34 m por 12 m na real -- e nao quadradas.
    // Foi o erro mais visivel da primeira versao.
    for(i = 0; i < PARES.length; i++){
      x = PARES[i];
      asaSolar(x, -28.0, 5.4, 24.4, A);
      asaSolar(x,   3.6, 5.4, 24.4, A);
      // mastro entre os dois paineis do par, prendendo-os a trelica. Claro
      // demais ele parte cada painel ao meio; escuro, le como estrutura.
      ctx.fillStyle = 'rgba(96,108,136,' + (A*0.85) + ')';
      ctx.fillRect(x + 2.35, -28.0, 0.8, 55.0);
    }
    // Radiadores acima da trelica, modulos abaixo: empilhados do mesmo lado
    // viravam uma laje branca unica.
    radiador(-7.0, -14.6, 2.8, 13.6, A);
    radiador(-1.4, -14.6, 2.8, 13.6, A);
    radiador( 4.2, -14.6, 2.8, 13.6, A);
    // trelica integrada, com os nos entre segmentos
    ctx.fillStyle = 'rgba(212,222,244,' + (A*0.96) + ')';
    ctx.fillRect(-36.0, -1.05, 72.0, 2.1);
    ctx.fillStyle = 'rgba(248,251,255,' + (A*0.55) + ')';
    ctx.fillRect(-36.0, -1.05, 72.0, 0.6);          // brilho da aresta superior
    ctx.fillStyle = 'rgba(126,140,174,' + (A*0.85) + ')';
    for(i = -31; i <= 31; i += 7.8) ctx.fillRect(i - 0.4, -2.2, 0.8, 4.4);
    // fila de modulos pressurizados sob o centro
    modulo(-15.0, 2.6, 30.0, 4.1, A, 5);
    modulo(-8.6, 7.1, 17.2, 3.0, A, 3);
    ctx.fillStyle = 'rgba(206,216,238,' + (A*0.94) + ')';
    ctx.fillRect(-1.6, 10.2, 3.2, 5.0);             // nave acoplada
    // paineis menores do segmento russo, presos aos modulos
    ctx.fillStyle = 'rgba(104,120,158,' + (A*0.9) + ')';
    ctx.fillRect(-20.6, 3.0, 5.4, 1.1);
    ctx.fillRect( 15.2, 3.0, 5.4, 1.1);
    // antenas parabolicas na trelica
    ctx.fillStyle = 'rgba(200,210,234,' + (A*0.9) + ')';
    ctx.fillRect(-19.8, -3.0, 2.3, 2.3);
    ctx.fillRect( 17.5, -3.0, 2.3, 2.3);
  }

  function desenharEstacao(x, y, ang, alfa, esc, culm, giro){
    if(alfa <= 0.002) return;
    var dx = Math.cos(ang), dy = Math.sin(ang);
    // Mais brilhante perto da culminancia, quando passa mais perto. E um
    // inchaco lento ao longo da travessia, nao um pisca-pisca: satelite
    // nao pisca -- o que pisca e aviao.
    var b = 1 + 0.4*(culm || 0);

    var comp = 140*esc;
    var g = ctx.createLinearGradient(x, y, x - dx*comp, y - dy*comp);
    g.addColorStop(0,   'rgba(255,240,214,' + (alfa*0.20*b) + ')');
    g.addColorStop(0.4, 'rgba(255,240,214,' + (alfa*0.07*b) + ')');
    g.addColorStop(1,   'rgba(255,240,214,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 1.2*esc; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dx*comp, y - dy*comp); ctx.stroke();

    // Halo curto de proposito. Com 46 unidades ele alcancava a etiqueta e
    // segurava o contraste em 3,99:1, abaixo do minimo de 4,5.
    var rh = 27*esc*b;
    var h = ctx.createRadialGradient(x, y, 0, x, y, rh);
    h.addColorStop(0,   'rgba(255,246,226,' + (alfa*0.20*b) + ')');
    h.addColorStop(0.36,'rgba(255,240,214,' + (alfa*0.07*b) + ')');
    h.addColorStop(1,   'rgba(255,236,204,0)');
    ctx.fillStyle = h;
    ctx.beginPath(); ctx.arc(x, y, rh, 0, 6.2832); ctx.fill();

    // A atitude nao segue a direcao do voo. Alinhar a trelica com o trajeto
    // deixava a estacao de cabeca para baixo nas passagens da direita para a
    // esquerda -- radiadores embaixo, nave acoplada para cima. Ela mantem a
    // atitude em relacao a Terra e so vira devagar ao longo da passagem, que
    // e o que se ve do chao.
    ctx.save();
    ctx.translate(x, y); ctx.rotate(giro); ctx.scale(esc, esc);
    corpoISS(alfa);
    ctx.restore();
  }

  function passagem(q, r){
    if(!heroiNaTela) return;
    var ax = r.a[0]*L, ay = r.a[1]*A, bx = r.b[0]*L, by = r.b[1]*A;
    // Aparece e some so nas pontas do trajeto, ja fora da area util: ela
    // atravessa inteira, sem apagar no meio do ceu.
    var alfa = Math.min(suavizar(q/0.07), 1 - suavizar((q - 0.93)/0.07));
    desenharEstacao(ax + (bx - ax)*q, ay + (by - ay)*q,
                    Math.atan2(by - ay, bx - ax),
                    alfa*0.98,
                    Math.max(1.0, Math.min(1.85, L/780)),
                    Math.sin(q*Math.PI),
                    -0.17 + 0.30*q);
  }

  function estatico(){
    ctx.clearRect(0,0,L,A);
    for(var i=0;i<estrelas.length;i++) estrela(estrelas[i], estrelas[i].base);
    ctx.globalAlpha = 1;
    passagem(0.42, ROTAS[0]);   // sem movimento, mas ela continua la
  }

  function passo(t){
    if(!t0) t0 = t;
    var dt = Math.min(t - t0, 48); t0 = t;
    var seg = t/1000;
    ctx.clearRect(0,0,L,A);

    for(var i=0;i<estrelas.length;i++){
      var s = estrelas[i];
      s.y += s.v*dt;                                  // deriva lenta
      if(s.y - s.r > A){ s.y = -s.r; s.x = Math.random()*L; }
      var cintila = 0.78 + 0.22*Math.sin(seg*s.freq + s.fase);
      estrela(s, s.base*cintila);
    }
    ctx.globalAlpha = 1;

    // meteoro raro
    if(!meteoro && Math.random() < 0.0016){
      meteoro = {x: rnd(L*0.1, L*0.95), y: rnd(-40, A*0.42), vida:0,
                 dur: rnd(680,1050), dx: rnd(-1.5,-0.55), dy: rnd(0.45,0.95),
                 comp: rnd(70,190)};
    }
    if(meteoro){
      meteoro.vida += dt;
      var q = meteoro.vida/meteoro.dur;
      if(q >= 1){ meteoro = null; }
      else{
        var op = Math.sin(q*Math.PI);
        var mx = meteoro.x + meteoro.dx*meteoro.vida*0.5;
        var my = meteoro.y + meteoro.dy*meteoro.vida*0.5;
        var g = ctx.createLinearGradient(mx, my, mx - meteoro.dx*meteoro.comp, my - meteoro.dy*meteoro.comp);
        g.addColorStop(0,'rgba(255,235,205,'+(op*0.85)+')');
        g.addColorStop(1,'rgba(255,235,205,0)');
        ctx.strokeStyle = g; ctx.lineWidth = 1.15; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(mx,my);
        ctx.lineTo(mx - meteoro.dx*meteoro.comp, my - meteoro.dy*meteoro.comp); ctx.stroke();
      }
    }

    // agenda da estacao: o relogio anda com dt, entao pausa junto com a aba
    relogio += dt;
    if(!est && relogio >= proxEst){
      est = {r: ROTAS[rotaIdx % ROTAS.length], ini: relogio};
      rotaIdx++;
    }
    if(est){
      var qe = (relogio - est.ini)/EST_TRAVESSIA;
      if(qe >= 1){ est = null; proxEst = relogio + rnd(EST_PAUSA[0], EST_PAUSA[1]); }
      else passagem(qe, est.r);
    }

    raf = requestAnimationFrame(passo);
  }

  function ligar(){
    cancelAnimationFrame(raf); t0 = 0;
    if(reduz.matches) estatico(); else raf = requestAnimationFrame(passo);
  }

  proxEst = EST_PRIMEIRA;
  semear(); ligar();


  var tmr;
  window.addEventListener('resize', function(){
    clearTimeout(tmr);
    tmr = setTimeout(function(){ semear(); if(reduz.matches) estatico(); }, 180);
  }, {passive:true});

  if(reduz.addEventListener) reduz.addEventListener('change', ligar);

  document.addEventListener('visibilitychange', function(){
    if(document.hidden) cancelAnimationFrame(raf);
    else if(!reduz.matches){ t0 = 0; raf = requestAnimationFrame(passo); }
  });

  /* paralaxe do ponteiro — só em ponteiro fino, transform apenas */
  if(window.matchMedia('(pointer:fine)').matches && !reduz.matches){
    var nebs = Array.prototype.slice.call(document.querySelectorAll('.nebulosa'));
    var alvoX = 0, alvoY = 0, atualX = 0, atualY = 0, rafP = 0;
    window.addEventListener('pointermove', function(e){
      alvoX = (e.clientX/window.innerWidth - .5);
      alvoY = (e.clientY/window.innerHeight - .5);
      if(!rafP) rafP = requestAnimationFrame(suave);
    }, {passive:true});
    function suave(){
      atualX += (alvoX - atualX)*0.055;
      atualY += (alvoY - atualY)*0.055;
      for(var i=0;i<nebs.length;i++){
        var f = (i+1)*13;
        nebs[i].style.transform = 'translate3d('+(atualX*f).toFixed(2)+'px,'+(atualY*f*0.62).toFixed(2)+'px,0)';
      }
      if(Math.abs(alvoX-atualX) > 0.0006 || Math.abs(alvoY-atualY) > 0.0006){
        rafP = requestAnimationFrame(suave);
      } else { rafP = 0; }
    }
  }
}

/* ---------- 2. revelação ao entrar na viewport ---------- */
function revelar(){
  var alvos = document.querySelectorAll('.rev, .rev-lista');
  if(!('IntersectionObserver' in window)){
    for(var i=0;i<alvos.length;i++) alvos[i].classList.add('visivel');
    return;
  }
  document.querySelectorAll('.rev-lista').forEach(function(g){
    Array.prototype.forEach.call(g.children, function(el,i){ el.style.setProperty('--i', i); });
  });
  var io = new IntersectionObserver(function(ent){
    ent.forEach(function(e){
      if(!e.isIntersecting) return;
      e.target.classList.add('visivel');
      io.unobserve(e.target);
    });
  }, {threshold:0.08, rootMargin:'0px 0px -8% 0px'});
  for(var j=0;j<alvos.length;j++) io.observe(alvos[j]);

  /* Rede de segurança: se por qualquer motivo o observer não disparar
     (aba em segundo plano, captura de tela sem rolagem, layout inesperado),
     nada pode ficar invisível para sempre. */
  setTimeout(function(){
    for(var k=0;k<alvos.length;k++) alvos[k].classList.add('visivel');
    io.disconnect();
  }, 2600);
}

/* ---------- 3. registro: abrir ficha ---------- */
function registro(){
  document.querySelectorAll('.alternar').forEach(function(btn){
    btn.addEventListener('click', function(){
      var obj = btn.closest('.objeto');
      var abrindo = !obj.classList.contains('aberto');
      obj.classList.toggle('aberto', abrindo);
      btn.setAttribute('aria-expanded', abrindo ? 'true' : 'false');
    });
  });
}

/* ---------- 4. filtros por classe espectral ---------- */
function filtros(){
  var bts = document.querySelectorAll('.filtro');
  var objs = document.querySelectorAll('.objeto');
  var cont = document.getElementById('contagem');
  bts.forEach(function(b){
    b.addEventListener('click', function(){
      var cls = b.dataset.classe;
      bts.forEach(function(o){ o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      var n = 0;
      objs.forEach(function(o){
        var ok = (cls === 'tudo' || o.dataset.classe === cls);
        o.hidden = !ok;
        if(ok) n++; else { o.classList.remove('aberto');
          var l = o.querySelector('.alternar'); if(l) l.setAttribute('aria-expanded','false'); }
      });
      if(cont) cont.textContent = n === 13 ? '13 objetos' : (n + (n === 1 ? ' objeto' : ' objetos'));
    });
  });
}

/* ---------- 5. copiar comando ---------- */
function copiar(){
  document.querySelectorAll('.copiar').forEach(function(b){
    b.addEventListener('click', function(e){
      e.stopPropagation();
      var txt = b.previousElementSibling ? b.previousElementSibling.textContent.trim() : '';
      var fim = function(ok){
        b.textContent = ok ? 'copiado' : 'falhou';
        b.dataset.ok = ok ? '1' : '';
        setTimeout(function(){ b.textContent = 'copiar'; b.dataset.ok = ''; }, 1900);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(txt).then(function(){ fim(true); }, function(){ fim(false); });
      } else { fim(false); }
    });
  });
}


/* ---------- 6. abas de sistema operacional ---------- */
function sistemas(){
  var abas = document.querySelectorAll('.so-aba');
  if(!abas.length) return;

  function aplicar(so){
    abas.forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.so === so ? 'true' : 'false'); });
    document.querySelectorAll('[data-so]').forEach(function(el){
      if(el.classList.contains('so-aba')) return;
      el.hidden = (el.dataset.so !== so);
    });
    try{ localStorage.setItem('lsk-so', so); }catch(e){}
  }

  abas.forEach(function(b){
    b.addEventListener('click', function(){ aplicar(b.dataset.so); });
  });

  /* Detecta o sistema para já abrir na aba certa. Se falhar, fica no macOS,
     que é o padrão marcado no HTML — nada quebra. */
  var so = null;
  try{ so = localStorage.getItem('lsk-so'); }catch(e){}
  if(!so){
    var p = (navigator.userAgentData && navigator.userAgentData.platform) ||
            navigator.platform || navigator.userAgent || '';
    p = p.toLowerCase();
    if(p.indexOf('win') === 0 || p.indexOf('windows') > -1) so = 'win';
    else if(p.indexOf('linux') > -1 && p.indexOf('android') === -1) so = 'linux';
    else so = 'mac';
  }
  aplicar(so);
}

/* ---------- 7. limites do heroi ---------- */
function vigiarHeroi(){
  var h = document.querySelector('.levantamento');
  if(!h || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(e){ heroiNaTela = e[0].isIntersecting; },
    {threshold:0}).observe(h);
}

/* ---------- arranque ---------- */
document.documentElement.classList.add('js-pronto');
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', iniciar);
} else { iniciar(); }
function iniciar(){ vigiarHeroi(); ceu(); revelar(); registro(); filtros(); copiar(); sistemas(); }
})();

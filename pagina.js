/* ============================================================
   Catálogo LSK — comportamento
   Regra: transform e opacity apenas. Conteúdo visível sem JS.
   ============================================================ */
(function(){
'use strict';
var reduz = window.matchMedia('(prefers-reduced-motion: reduce)');

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
     A ISS a olho nu nao pisca: e um ponto firme, mais brilhante que qualquer
     estrela, atravessando o ceu em poucos minutos. E costuma sumir no meio do
     caminho ao entrar na sombra da Terra, sem chegar ao horizonte. As duas
     coisas estao aqui. Rotas em coordenadas relativas para sobreviver a
     qualquer redimensionamento. */
  var ROTAS = [
    // A primeira passagem e a que mais importa e vai pela faixa limpa entre a
    // barra do topo e o rotulo do heroi: mais baixa que isso ela some atras do
    // titulo gigante, que e o que acontecia antes.
    {a:[-0.08, 0.17], b:[ 1.08, 0.085], sombra:false},
    {a:[ 1.08, 0.11], b:[-0.08, 0.38], sombra:true },
    {a:[-0.08, 0.60], b:[ 0.88,-0.08], sombra:false},
    {a:[ 0.16,-0.08], b:[ 1.08, 0.33], sombra:true },
    {a:[ 1.08, 0.55], b:[-0.08, 0.14], sombra:false}
  ];
  var EST_PRIMEIRA  = 3400;               // primeira passagem dentro dos 10 s
  var EST_TRAVESSIA = 16500;              // duracao de uma travessia
  var EST_PAUSA     = [155000, 235000];   // 2,5 a 4 min ate a proxima

  function suavizar(q){ return q <= 0 ? 0 : q >= 1 ? 1 : q*q*(3 - 2*q); }

  function desenharEstacao(x, y, ang, alfa, esc, culm){
    if(alfa <= 0.002) return;
    var dx = Math.cos(ang), dy = Math.sin(ang);
    // A ISS fica mais brilhante perto da culminancia, quando esta mais proxima.
    // E um inchaco lento ao longo de 16 s, nao um pisca-pisca: satelite nao pisca.
    var b = 1 + 0.45*(culm || 0);

    // rastro, como um registro de longa exposicao
    var comp = 132*esc;
    var g = ctx.createLinearGradient(x, y, x - dx*comp, y - dy*comp);
    g.addColorStop(0,   'rgba(255,240,214,' + (alfa*0.42*b) + ')');
    g.addColorStop(0.45,'rgba(255,240,214,' + (alfa*0.14*b) + ')');
    g.addColorStop(1,   'rgba(255,240,214,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 1.35*esc; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - dx*comp, y - dy*comp); ctx.stroke();

    // silhueta: trelica central com dois pares de paineis solares
    ctx.save();
    ctx.translate(x, y); ctx.rotate(ang); ctx.scale(esc, esc);
    ctx.fillStyle = 'rgba(92,112,164,' + (alfa*0.88) + ')';
    ctx.fillRect(-11.5, -6.3, 7, 4.7); ctx.fillRect(-11.5, 1.6, 7, 4.7);
    ctx.fillRect(  4.5, -6.3, 7, 4.7); ctx.fillRect(  4.5, 1.6, 7, 4.7);
    ctx.fillStyle = 'rgba(228,235,250,' + (alfa*0.94) + ')';
    ctx.fillRect(-12, -0.8, 24, 1.6);
    ctx.fillRect(-2.9, -2.2, 5.8, 4.4);
    ctx.restore();

    // brilho do modulo: gradiente, nao circulo chapado. Um arc com alpha
    // baixo desenha um disco de borda dura, que parece sujeira na tela.
    var rh = 17*esc*b;
    var h = ctx.createRadialGradient(x, y, 0, x, y, rh);
    h.addColorStop(0,   'rgba(255,246,226,' + (alfa*0.62*b) + ')');
    h.addColorStop(0.28,'rgba(255,240,214,' + (alfa*0.24*b) + ')');
    h.addColorStop(0.6, 'rgba(255,236,204,' + (alfa*0.07*b) + ')');
    h.addColorStop(1,   'rgba(255,236,204,0)');
    ctx.fillStyle = h;
    ctx.beginPath(); ctx.arc(x, y, rh, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#FFFAF0';
    ctx.globalAlpha = Math.min(1, alfa*1.0*b);
    ctx.beginPath(); ctx.arc(x, y, 2.4*esc, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function passagem(q, r){
    var ax = r.a[0]*L, ay = r.a[1]*A, bx = r.b[0]*L, by = r.b[1]*A;
    var entra = suavizar(q/0.10);
    // com sombra ela apaga no meio do ceu; sem, so ao sair pela borda
    var sai = r.sombra ? 1 - suavizar((q - 0.54)/0.30)
                       : 1 - suavizar((q - 0.88)/0.12);
    desenharEstacao(ax + (bx - ax)*q, ay + (by - ay)*q,
                    Math.atan2(by - ay, bx - ax),
                    Math.min(entra, sai)*0.98,
                    Math.max(1.05, Math.min(1.75, L/840)),
                    Math.sin(q*Math.PI));
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

/* ---------- arranque ---------- */
document.documentElement.classList.add('js-pronto');
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', iniciar);
} else { iniciar(); }
function iniciar(){ ceu(); revelar(); registro(); filtros(); copiar(); sistemas(); }
})();

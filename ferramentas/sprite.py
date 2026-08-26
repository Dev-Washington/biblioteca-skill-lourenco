#!/usr/bin/env python3
"""Transforma a foto da estacao no sprite usado pela pagina.

    python3 ferramentas/sprite.py IMG_9135.JPG [saida.webp]

Tres passos, cada um resolvendo um problema encontrado na pratica:

  1. Achar a estacao. As estrelas sao pontos isolados; a estacao e uma mancha
     clara grande. Contando pixels claros por linha e por coluna, so a estacao
     passa do limiar -- mas o limiar precisa ser alto: com 6 pixels por coluna
     o ceu estrelado sozinho ja passava e o recorte pegava o quadro inteiro.

  2. Apagar o fundo. O alfa sai de uma copia em cinza passada por uma rampa:
     o preto do espaco some, os paineis escuros ficam.

  3. Apagar as estrelas. A rampa nao as separa -- uma estrela e tao clara
     quanto a trelica. O que as separa e o tamanho: a estacao e uma regiao
     conectada de centenas de milhares de pixels, cada estrela tem algumas
     dezenas. Sobram so as regioes grandes.
"""
import subprocess, sys, os
from collections import deque

def dims(p):
    d = subprocess.run(['ffprobe','-v','error','-select_streams','v:0',
        '-show_entries','stream=width,height','-of','csv=p=0',p],
        capture_output=True, text=True, check=True).stdout.strip().split(',')
    return int(d[0]), int(d[1])

def cinza(p):
    return subprocess.run(['ffmpeg','-v','error','-i',p,'-f','rawvideo',
        '-pix_fmt','gray','-'], capture_output=True, check=True).stdout

def achar(w, h, g, lim=46):
    lin=[0]*h; col=[0]*w
    for y in range(h):
        b=y*w
        for x in range(w):
            if g[b+x] > lim: lin[y]+=1; col[x]+=1
    ml, mc = int(w*0.028), int(h*0.028)
    ys=[y for y in range(h) if lin[y]>ml]; xs=[x for x in range(w) if col[x]>mc]
    if not ys or not xs: sys.exit('nao achei a estacao: ajuste o limiar')
    f=10
    return (max(0,min(xs)-f), max(0,min(ys)-f),
            min(w,max(xs)+f), min(h,max(ys)+f))

def so_regioes_grandes(w, h, a):
    """Zera tudo que nao faz parte da estacao.

    O corte e relativo, nao absoluto: sobrevive quem tiver ao menos 5% dos
    pixels da maior regiao. Medido nesta imagem: a estacao tem 225.782 px e a
    maior mancha seguinte tem 1.824 -- duas ordens de grandeza de distancia.
    Sendo relativo, se a estacao vier partida em duas pecas grandes as duas
    ficam."""
    dentro = bytearray(1 if v > 16 else 0 for v in a)
    visto = bytearray(len(dentro))
    regioes = []
    for i in range(len(dentro)):
        if not dentro[i] or visto[i]: continue
        fila = deque([i]); visto[i] = 1; regiao = [i]
        while fila:
            p = fila.popleft(); py, px = divmod(p, w)
            for dy in (-1,0,1):
                ny = py+dy
                if ny < 0 or ny >= h: continue
                for dx in (-1,0,1):
                    nx = px+dx
                    if nx < 0 or nx >= w: continue
                    q = ny*w+nx
                    if dentro[q] and not visto[q]:
                        visto[q]=1; fila.append(q); regiao.append(q)
        regioes.append(regiao)
    if not regioes: sys.exit('nada opaco na imagem')
    maior = max(len(r) for r in regioes)
    corte = maior*0.05
    manter = bytearray(len(dentro))
    mantidas = 0
    for r in regioes:
        if len(r) >= corte:
            mantidas += 1
            for p in r: manter[p] = 1
    print(f'  regioes: {len(regioes)} encontradas, {mantidas} mantida(s); '
          f'maior {maior} px, corte em {int(corte)} px')
    # dilata 1 px para nao comer a borda suavizada da estacao
    saida = bytearray(len(a))
    for i in range(len(a)):
        if not a[i]: continue
        if manter[i]: saida[i] = a[i]; continue
        y, x = divmod(i, w)
        for dy in (-1,0,1):
            ny=y+dy
            if ny<0 or ny>=h: continue
            for dx in (-1,0,1):
                nx=x+dx
                if 0<=nx<w and manter[ny*w+nx]: saida[i]=a[i]; break
            if saida[i]: break
    return saida

def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    ent = sys.argv[1]
    sai = sys.argv[2] if len(sys.argv) > 2 else 'video/estacao.webp'
    tmp = '/tmp/sprite'
    os.makedirs(tmp, exist_ok=True)

    w, h = dims(ent); print(f'entrada: {w}x{h}')
    x0, y0, x1, y1 = achar(w, h, cinza(ent))
    cw, ch = (x1-x0)//2*2, (y1-y0)//2*2
    print(f'estacao em {cw}x{ch} a partir de ({x0},{y0})')

    LARG = 1100                      # o suficiente para telas 3x
    rgba = f'{tmp}/rgba.png'
    subprocess.run(['ffmpeg','-v','error','-i',ent,'-filter_complex',
        f"[0:v]crop={cw}:{ch}:{x0}:{y0},scale={LARG}:-2,split=2[a][b];"
        "[b]format=gray,lut=y='(val-14)*7'[m];"
        "[a]format=rgba[c];[c][m]alphamerge[o]",
        '-map','[o]','-frames:v','1','-y',rgba], check=True)
    lw, lh = dims(rgba)

    print('separando a estacao das estrelas...')
    alfa = subprocess.run(['ffmpeg','-v','error','-i',rgba,'-vf','alphaextract',
        '-f','rawvideo','-pix_fmt','gray','-'], capture_output=True, check=True).stdout
    limpo = so_regioes_grandes(lw, lh, alfa)
    with open(f'{tmp}/alfa.gray','wb') as f: f.write(limpo)

    final = f'{tmp}/final.png'
    subprocess.run(['ffmpeg','-v','error','-i',rgba,
        '-f','rawvideo','-pix_fmt','gray','-s',f'{lw}x{lh}','-i',f'{tmp}/alfa.gray',
        '-filter_complex','[0:v]format=rgba[c];[c][1:v]alphamerge[o]',
        '-map','[o]','-frames:v','1','-y',final], check=True)
    # cwebp e nao libwebp: esta compilacao do ffmpeg nao traz o encoder
    subprocess.run(['cwebp','-quiet','-q','82','-alpha_q','92','-m','6',
        final,'-o',sai], check=True)
    print(f'{sai}: {os.path.getsize(sai)//1024} KB'
          f'  (PNG seria {os.path.getsize(final)//1024} KB)  {lw}x{lh}')

main()

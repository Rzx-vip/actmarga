#!/usr/bin/env python3
"""Build: src/* -> dist/index.html (terproteksi) + dist/_private/index.readable.html"""
import os, sys, zlib, base64, secrets, json, shutil, re
R = os.path.dirname(os.path.abspath(__file__))
src = lambda n: open(os.path.join(R, 'src', n), encoding='utf-8').read()
css = src('style.css')
js = ''.join(src(n) for n in ['01-core.js', '02-render.js', '03-admin.js', '04-boot.js'])
BINS = os.environ.get('BINS_JSON', '[{"id":"ISI_BIN_ID_1","key":""},{"id":"ISI_BIN_ID_2","key":""}]')
CFG = '<script type="application/json" id="igneel-config">{"bins":%s}</script>' % BINS
HEAD = '''<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>MARGA ACT</title>
<meta name="description" content="MARGA ACT — Gabung Group Seleksi &amp; Official TikTok Marga">
<meta name="theme-color" content="#050b18">
<meta property="og:title" content="MARGA ACT">
<meta property="og:description" content="Gabung Group Seleksi &amp; Official TikTok Marga">
<meta name="referrer" content="strict-origin-when-cross-origin">
<link rel="icon" href="igneel-ACETE-MARGA.webp">
'''
NOSCRIPT = '<noscript><p style="font:16px system-ui;text-align:center;padding:40px">Aktifkan JavaScript untuk membuka halaman ini.</p></noscript>'
out = os.path.join(R, 'dist'); priv = os.path.join(out, '_private')
shutil.rmtree(out, ignore_errors=True); os.makedirs(priv)

# 1) versi readable (SIMPAN PRIVAT, jangan di-deploy)
readable = HEAD + '<style>' + css + '</style>\n</head>\n<body>\n' + CFG + '\n' + NOSCRIPT + '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n'
open(os.path.join(priv, 'index.readable.html'), 'w', encoding='utf-8').write(readable)

# 2) versi terproteksi: deflate-raw -> XOR kunci acak -> base64
payload = (css + '\x00' + js).encode('utf-8')
co = zlib.compressobj(9, zlib.DEFLATED, -15); z = co.compress(payload) + co.flush()
key = list(secrets.token_bytes(24))
x = bytes(b ^ key[i % len(key)] for i, b in enumerate(z))
b64 = base64.b64encode(x).decode()
loader = ('(async()=>{var d=document;try{var s=atob("%s"),k=%s,u=new Uint8Array(s.length),i;'
          'for(i=0;i<s.length;i++)u[i]=s.charCodeAt(i)^k[i%%k.length];'
          'var t=await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("deflate-raw"))).text(),'
          'n=t.indexOf("\\0"),y=d.createElement("style");y.textContent=t.slice(0,n);d.head.append(y);(0,eval)(t.slice(n+1))}'
          'catch(e){d.body.textContent="Browser terlalu lama. Perbarui browser kamu."}})()') % (b64, json.dumps(key))
prot = HEAD + '<style>html,body{margin:0;height:100%;background:#fff}</style>\n</head>\n<body>\n' + CFG + '\n' + NOSCRIPT + '\n<script>' + loader + '</script>\n</body>\n</html>\n'
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(prot)
print('readable %d KB | protected %d KB | js %d KB css %d KB' % (len(readable)//1024, len(prot)//1024, len(js)//1024, len(css)//1024))

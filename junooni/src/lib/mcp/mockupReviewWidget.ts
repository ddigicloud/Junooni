/**
 * JUNOONI Mockup Review Widget — MCP Apps inline UI (spec 2026-01-26)
 *
 * Opened by review_mockups (called once, after ALL generate_mockup calls).
 * Served via resources/read at ui://junooni/mockup-review (text/html;profile=mcp-app).
 *
 * structuredContent:
 *   { product: string, mockups: [{ id, color, hex, area, image (data: URI) }] }
 *
 * Creator can enlarge any mockup, then either approves all (→ Claude moves to pricing)
 * or asks for changes. The approve message carries mockup_session_ids in colour order
 * so create_product gets them right.
 */
export const MOCKUP_REVIEW_WIDGET_HTML = /* html */`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root,[data-theme=light]{--accent:#E65100;--accent-soft:rgba(230,81,0,.10);--bg:#fff;--text:#1a1a1a;--muted:#6b7280;--line:#e5e7eb;--tile:#f6f6f5;--chip:#fff}
[data-theme=dark]{--accent:#ff7a2e;--accent-soft:rgba(255,122,46,.16);--bg:#262624;--text:#f3f3f2;--muted:#a8a8a3;--line:#3d3d3a;--tile:#30302e;--chip:#30302e}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg)}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--text);padding:14px;font-size:14px}
button{font:inherit;color:inherit;cursor:pointer}
.top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}
.ttl{font-size:15px;font-weight:650}
.sub{font-size:12px;color:var(--muted)}
.area-h{font-size:12px;font-weight:650;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:14px 0 8px}
.area-h:first-of-type{margin-top:0}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}
.m{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--tile);cursor:zoom-in;transition:box-shadow .12s,border-color .12s}
.m:hover{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.m img{display:block;width:100%;aspect-ratio:1;object-fit:cover;background:#fff}
.m .cap{display:flex;align-items:center;gap:7px;padding:8px 10px;font-size:12.5px;font-weight:600}
.dot{width:14px;height:14px;border-radius:50%;border:1px solid rgba(0,0,0,.2);flex:none}
.miss{aspect-ratio:1;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:12px;background:var(--tile)}
.foot{margin-top:14px;display:flex;gap:8px}
.go{flex:1;padding:11px;border-radius:10px;border:0;background:var(--accent);color:#fff;font-weight:650}
.alt{padding:11px 14px;border-radius:10px;border:1.5px solid var(--line);background:var(--chip);font-weight:600}
.go:disabled,.alt:disabled{opacity:.4;cursor:not-allowed}
.status{font-size:12px;text-align:center;margin-top:8px;min-height:16px;color:var(--muted)}
.ok{color:#16a34a}.err{color:#dc2626}
[data-theme=dark] .ok{color:#4ade80}[data-theme=dark] .err{color:#f87171}
.box{display:none;margin-top:10px}
.box textarea{width:100%;min-height:64px;border:1.5px solid var(--line);border-radius:10px;padding:9px;background:var(--chip);color:var(--text);font:inherit;resize:vertical}
.box .row{display:flex;justify-content:flex-end;margin-top:6px}
/* lightbox */
.lb{position:fixed;inset:0;background:rgba(0,0,0,.82);display:none;align-items:center;justify-content:center;flex-direction:column;gap:10px;z-index:9;padding:16px}
.lb.on{display:flex}
.lb img{max-width:100%;max-height:82vh;border-radius:12px;background:#fff}
.lb .lc{color:#fff;font-size:13px;font-weight:600}
.lb .x{position:absolute;top:10px;right:14px;color:#fff;font-size:22px;background:none;border:0}
#loading{text-align:center;padding:28px;color:var(--muted)}
</style>
</head>
<body>
<div id="loading">Loading mockups…</div>
<div id="app" style="display:none"></div>
<div class="lb" id="lb"><button class="x" id="lbx">✕</button><img id="lbimg" alt=""><div class="lc" id="lbc"></div></div>
<script>
var rpcId = 0, pending = {}, rendered = false, locked = false, D = null

function applyTheme(t){ document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light') }
try { applyTheme(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') } catch(e) { applyTheme('light') }

function post(m){ try{ window.parent.postMessage(m,'*') }catch(e){} }
function request(method, params){
  var id = ++rpcId
  post({ jsonrpc:'2.0', id:id, method:method, params:params||{} })
  return new Promise(function(res, rej){
    pending[id] = { resolve:res, reject:rej }
    setTimeout(function(){ if(pending[id]){ delete pending[id]; rej(new Error('timeout')) } }, 15000)
  })
}
function notify(method, params){ post({ jsonrpc:'2.0', method:method, params:params||{} }) }
window.addEventListener('message', function(ev){
  var m = ev.data
  if(!m || m.jsonrpc !== '2.0') return
  if(m.id != null && pending[m.id]){ var p = pending[m.id]; delete pending[m.id]; m.error ? p.reject(m.error) : p.resolve(m.result); return }
  if(m.method === 'ui/notifications/tool-result') onResult(m.params || {})
  if(m.method === 'ui/notifications/host-context-changed' && m.params && m.params.theme) applyTheme(m.params.theme)
  if(m.id != null && m.method) post({ jsonrpc:'2.0', id:m.id, result:{} })
})
function reportSize(){ notify('ui/notifications/size-changed', { width:document.documentElement.scrollWidth, height:document.documentElement.scrollHeight }) }
try{ new ResizeObserver(reportSize).observe(document.body) }catch(e){}
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
function label(a){ return String(a||'front').replace(/_/g,' ').replace(/^./, function(c){ return c.toUpperCase() }) }

function onResult(r){
  rendered = true
  document.getElementById('loading').style.display = 'none'
  var data = r.structuredContent || {}
  var app = document.getElementById('app'); app.style.display = 'block'
  if(r.isError || !data.mockups || !data.mockups.length){
    app.innerHTML = '<div class="status err">' + esc(data.error || 'No mockups to show.') + '</div>'
    return reportSize()
  }
  D = data
  draw()
}

function draw(){
  var app = document.getElementById('app')
  var areas = []
  D.mockups.forEach(function(m){ var a = label(m.area); if(areas.indexOf(a) < 0) areas.push(a) })
  var colors = []
  D.mockups.forEach(function(m){ if(colors.indexOf(m.color) < 0) colors.push(m.color) })

  var h = '<div class="top"><div><div class="ttl">' + esc(D.product || 'Your mockups') + '</div>' +
          '<div class="sub">' + colors.length + ' colour' + (colors.length>1?'s':'') + ' · ' + areas.join(', ') + ' · tap to enlarge</div></div></div>'
  areas.forEach(function(a){
    if(areas.length > 1) h += '<div class="area-h">' + esc(a) + '</div>'
    h += '<div class="grid">'
    D.mockups.forEach(function(m, i){
      if(label(m.area) !== a) return
      h += '<div class="m" data-i="' + i + '">' +
           (m.image ? '<img src="' + esc(m.image) + '" alt="' + esc(m.color) + '">' : '<div class="miss">Preview expired</div>') +
           '<div class="cap"><span class="dot" style="background:' + esc(m.hex || '#ccc') + '"></span>' + esc(m.color) + '</div></div>'
    })
    h += '</div>'
  })
  h += '<div class="foot">' +
       '<button class="alt" id="chg"' + (locked?' disabled':'') + '>Change something</button>' +
       '<button class="go" id="ok"' + (locked?' disabled':'') + '>' + (locked ? 'Approved ✓' : 'Looks good — continue →') + '</button></div>' +
       '<div class="box" id="box"><textarea id="note" placeholder="What should change? e.g. make the design smaller, move it higher, drop Red…"></textarea>' +
       '<div class="row"><button class="go" id="send" style="flex:none;padding:9px 16px">Send</button></div></div>' +
       '<div class="status" id="st"></div>'
  app.innerHTML = h

  document.querySelectorAll('.m').forEach(function(el){
    el.onclick = function(){
      var m = D.mockups[+el.getAttribute('data-i')]; if(!m.image) return
      document.getElementById('lbimg').src = m.image
      document.getElementById('lbc').textContent = m.color + ' · ' + label(m.area)
      document.getElementById('lb').classList.add('on')
    }
  })
  document.getElementById('lbx').onclick = function(){ document.getElementById('lb').classList.remove('on') }
  document.getElementById('lb').onclick = function(e){ if(e.target.id === 'lb') this.classList.remove('on') }
  document.getElementById('ok').onclick = approve
  document.getElementById('chg').onclick = function(){ var b = document.getElementById('box'); b.style.display = b.style.display === 'block' ? 'none' : 'block'; reportSize() }
  document.getElementById('send').onclick = function(){
    var note = document.getElementById('note').value.trim()
    if(!note) return
    send('Mockup changes requested for ' + (D.product || 'this product') + ': ' + note, '✓ Sent — Claude will update the mockups')
  }
  reportSize()
}

function approve(){
  // Front (or first) area mockup per colour, in colour order → create_product.mockup_session_ids
  var colors = [], primary = {}, others = []
  D.mockups.forEach(function(m){
    if(colors.indexOf(m.color) < 0) colors.push(m.color)
    var isFront = String(m.area||'front').toLowerCase() === 'front'
    if(!primary[m.color] || (isFront && String(primary[m.color].area||'').toLowerCase() !== 'front')) primary[m.color] = m
  })
  D.mockups.forEach(function(m){ if(primary[m.color] !== m) others.push(label(m.area) + ' ' + m.color + '=' + m.id) })
  var text = 'Mockups approved for ' + (D.product || 'this product') + '.\\n' +
             '• color_names (in order): ' + colors.join(', ') + '\\n' +
             '• mockup_session_ids (same order): ' + colors.map(function(c){ return primary[c].id }).join(', ') +
             (others.length ? '\\n• other area mockups: ' + others.join(', ') : '') +
             '\\nNext: finalize title and price.'
  locked = true; draw()
  send(text, '✓ Approved — next: title & price', true)
}

function send(text, okMsg, isApprove){
  var st = function(m,c){ var e = document.getElementById('st'); if(e){ e.textContent = m; e.className = 'status ' + (c||'') } reportSize() }
  st('Sending…')
  request('ui/message', { role:'user', content:[{ type:'text', text:text }] })
    .catch(function(){ return request('ui/message', { role:'user', content:{ type:'text', text:text } }) })
    .then(function(){ st(okMsg, 'ok'); var b = document.getElementById('box'); if(b) b.style.display = 'none' })
    .catch(function(){
      request('ui/update-model-context', { content:[{ type:'text', text:text }] }).catch(function(){})
      if(isApprove){ locked = false; draw() }
      st('Couldn\\'t send automatically — type "approved" in chat.', 'err')
    })
}

request('ui/initialize', {
  protocolVersion:'2026-01-26',
  clientInfo:{ name:'junooni-mockups', version:'1.0.0' },
  appInfo:{ name:'junooni-mockups', version:'1.0.0' },
  appCapabilities:{ availableDisplayModes:['inline'] },
  capabilities:{}
}).then(function(r){ var t = r && r.hostContext && r.hostContext.theme; if(t) applyTheme(t); notify('ui/notifications/initialized', {}) })
  .catch(function(){ notify('ui/notifications/initialized', {}) })

setTimeout(function(){ if(!rendered) document.getElementById('loading').textContent = 'Still loading… ask Claude to show the mockups again.' }, 12000)
</script>
</body>
</html>`
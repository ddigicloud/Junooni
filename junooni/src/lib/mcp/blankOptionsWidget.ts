/**
 * JUNOONI Product Options Widget — MCP Apps inline UI (spec 2026-01-26)
 *
 * Opened by get_blank_details. Served via resources/read at ui://junooni/blank-options
 * (mimeType text/html;profile=mcp-app).
 *
 * The creator picks colours, sizes, print technology (if >1), print area(s),
 * same/different design (if >1 area) and sales channel, then taps Continue.
 * The widget posts ONE user message with all choices (ui/message) and Claude
 * continues straight to browse_gallery.
 *
 * Data arrives in ui/notifications/tool-result → structuredContent.blank:
 *   { id, name, product_type, base_cost, image (data: URI | null),
 *     colors:[{name,hex}], sizes:[string], technologies:[{id,name,print_areas:[string]}] }
 * The thumbnail is embedded server-side as a data: URI, so no extra CSP domains are needed.
 */
export const BLANK_OPTIONS_WIDGET_HTML = /* html */`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root,[data-theme=light]{
  --accent:#E65100; --accent-soft:rgba(230,81,0,.10); --accent-ring:rgba(230,81,0,.28);
  --bg:#ffffff; --text:#1a1a1a; --muted:#6b7280; --line:#e5e7eb; --chip:#ffffff; --card:#f6f6f5;
}
[data-theme=dark]{
  --accent:#ff7a2e; --accent-soft:rgba(255,122,46,.16); --accent-ring:rgba(255,122,46,.35);
  --bg:#262624; --text:#f3f3f2; --muted:#a8a8a3; --line:#3d3d3a; --chip:#30302e; --card:#30302e;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg)}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--text);padding:14px;font-size:14px;line-height:1.35}
button{font:inherit;color:inherit;cursor:pointer}

/* header */
.head{display:flex;gap:14px;align-items:center;padding-bottom:14px;border-bottom:1px solid var(--line)}
.thumb{width:76px;height:76px;border-radius:10px;background:#fff;border:1px solid var(--line);object-fit:cover;flex:none}
.thumb.ph{display:flex;align-items:center;justify-content:center;font-size:30px}
.title{font-size:16px;font-weight:650}
.meta{color:var(--muted);font-size:12.5px;margin-top:3px}
.cost{display:inline-block;margin-top:6px;font-size:12px;font-weight:600;color:var(--accent);background:var(--accent-soft);padding:2px 8px;border-radius:999px}

/* sections */
.sec{padding:14px 0;border-bottom:1px solid var(--line)}
.sec:last-of-type{border-bottom:0}
.sec-h{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px}
.sec-t{font-size:12px;font-weight:650;text-transform:uppercase;letter-spacing:.05em}
.sec-n{font-size:12px;color:var(--muted)}
.sec-n.done{color:var(--accent);font-weight:600}
.row{display:flex;flex-wrap:wrap;gap:8px}

/* colour swatches */
.sw{display:flex;flex-direction:column;align-items:center;gap:5px;width:64px;background:none;border:0;padding:0}
.sw .dot{position:relative;width:34px;height:34px;border-radius:50%;border:1px solid rgba(0,0,0,.18);box-shadow:inset 0 0 0 2px rgba(255,255,255,.35);transition:transform .12s, box-shadow .12s}
.sw:hover .dot{transform:scale(1.06)}
.sw.on .dot{box-shadow:0 0 0 2px var(--chip),0 0 0 4px var(--accent)}
.sw .dot::after{content:"✓";position:absolute;inset:0;display:none;align-items:center;justify-content:center;font-size:15px;font-weight:700}
.sw.on .dot::after{display:flex}
.sw .nm{font-size:11px;text-align:center;color:var(--muted);line-height:1.15;max-width:64px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.sw.on .nm{color:var(--text);font-weight:600}

/* chips */
.chip{min-width:44px;padding:7px 13px;border-radius:999px;border:1.5px solid var(--line);background:var(--chip);font-size:13px;font-weight:500;transition:border-color .12s,background .12s}
.chip:hover{border-color:var(--accent)}
.chip.on{border-color:var(--accent);background:var(--accent-soft);color:var(--accent);font-weight:650}

/* segmented single-select */
.seg{display:flex;border:1.5px solid var(--line);border-radius:10px;overflow:hidden}
.seg button{flex:1;padding:9px 8px;background:var(--chip);border:0;border-right:1.5px solid var(--line);font-size:13px;font-weight:500}
.seg button:last-child{border-right:0}
.seg button.on{background:var(--accent);color:#fff;font-weight:650}
.hint{font-size:12px;color:var(--muted);margin-top:8px}

/* footer */
.foot{position:sticky;bottom:0;padding:12px 0 2px;margin-top:4px;background:var(--bg)}
.summary{font-size:12px;color:var(--muted);margin-bottom:8px;min-height:16px}
.go{width:100%;padding:11px;border-radius:10px;border:0;background:var(--accent);color:#fff;font-weight:650;font-size:14px;transition:opacity .12s}
.go:disabled{opacity:.35;cursor:not-allowed}
.status{font-size:12px;text-align:center;margin-top:8px;min-height:16px;color:var(--muted)}
.ok{color:#16a34a}.err{color:#dc2626}
[data-theme=dark] .ok{color:#4ade80}[data-theme=dark] .err{color:#f87171}
.locked .pick{pointer-events:none;opacity:.6}
.edit{background:none;border:0;color:var(--accent);font-size:12px;font-weight:600;text-decoration:underline;margin-left:6px}
#loading{text-align:center;padding:28px;color:var(--muted)}
</style>
</head>
<body>
<div id="loading">Loading product options…</div>
<div id="app" style="display:none"></div>
<script>
var rpcId = 0, pending = {}, rendered = false, locked = false
var B = null
var S = { colors: [], sizes: [], tech: null, areas: [], design_mode: 'same', channel: null }

// ── Theme: follow the host (Claude) theme; paint our own background so text is always readable ──
function applyTheme(t){ document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light') }
try { applyTheme(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') } catch(e) { applyTheme('light') }
window.addEventListener('message', function(ev){
  var m = ev.data
  if (m && m.method === 'ui/notifications/host-context-changed' && m.params && m.params.theme) applyTheme(m.params.theme)
})


// ── JSON-RPC over postMessage ──────────────────────────────────────────────
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
  if(m.id != null && m.method) post({ jsonrpc:'2.0', id:m.id, result:{} })
})
function reportSize(){ notify('ui/notifications/size-changed', { width:document.documentElement.scrollWidth, height:document.documentElement.scrollHeight }) }
try{ new ResizeObserver(reportSize).observe(document.body) }catch(e){}

function onResult(r){
  var data = r.structuredContent || {}
  rendered = true
  document.getElementById('loading').style.display = 'none'
  if(r.isError || !data.blank){
    var app = document.getElementById('app'); app.style.display = 'block'
    app.innerHTML = '<div class="status err">' + esc(data.error || 'Could not load product options.') + '</div>'
    return reportSize()
  }
  B = data.blank
  if((B.technologies||[]).length === 1) S.tech = B.technologies[0]
  var areas = currentAreas()
  if(areas.length === 1) S.areas = [areas[0]]
  draw()
}

// ── helpers ────────────────────────────────────────────────────────────────
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }
function toggle(arr, v){ var i = arr.indexOf(v); i < 0 ? arr.push(v) : arr.splice(i,1) }
function currentAreas(){ return S.tech ? (S.tech.print_areas||[]) : ((B.technologies||[])[0]||{}).print_areas || [] }
function inr(n){ return '₹' + Math.round(n||0).toLocaleString('en-IN') }
function lum(hex){
  var h = String(hex||'#fff').replace('#',''); if(h.length===3) h = h.split('').map(function(c){return c+c}).join('')
  var r=parseInt(h.substr(0,2),16)||0, g=parseInt(h.substr(2,2),16)||0, b=parseInt(h.substr(4,2),16)||0
  return (0.299*r + 0.587*g + 0.114*b)/255
}
function label(a){ return String(a).replace(/_/g,' ') }
function ready(){
  return S.colors.length && S.sizes.length && S.tech && S.areas.length && S.channel
}

// ── render ─────────────────────────────────────────────────────────────────
function draw(){
  var app = document.getElementById('app'); app.style.display = 'block'
  app.className = locked ? 'locked' : ''
  var techs = B.technologies || []
  var areas = currentAreas()
  var h = ''

  h += '<div class="head">'
  h += B.image ? '<img class="thumb" src="' + esc(B.image) + '" alt="">' : '<div class="thumb ph">👕</div>'
  h += '<div><div class="title">' + esc(B.name) + '</div>'
  h += '<div class="meta">' + esc(B.product_type || '') + (S.tech ? ' · ' + esc(S.tech.name) : '') + '</div>'
  h += '<span class="cost">Base cost ' + inr(B.base_cost) + '</span></div></div>'

  // colours
  h += sec('Colours', S.colors.length ? S.colors.length + ' selected' : 'Pick one or more', S.colors.length)
  h += '<div class="row pick">'
  ;(B.colors||[]).forEach(function(c, i){
    var on = S.colors.indexOf(c.name) > -1
    var tick = lum(c.hex) > 0.6 ? '#111' : '#fff'
    h += '<button class="sw' + (on?' on':'') + '" data-k="color" data-i="' + i + '" title="' + esc(c.name + ' ' + c.hex) + '">' +
         '<span class="dot" style="background:' + esc(c.hex) + ';color:' + tick + '"></span>' +
         '<span class="nm">' + esc(c.name) + '</span></button>'
  })
  h += '</div></div>'

  // sizes
  h += sec('Sizes', S.sizes.length ? S.sizes.join(', ') : 'Pick one or more', S.sizes.length)
  h += '<div class="row pick">'
  ;(B.sizes||[]).forEach(function(s, i){
    h += '<button class="chip' + (S.sizes.indexOf(s) > -1 ? ' on' : '') + '" data-k="size" data-i="' + i + '">' + esc(s) + '</button>'
  })
  h += '</div></div>'

  // technology (only if more than one)
  if(techs.length > 1){
    h += sec('Print technology', S.tech ? S.tech.name : 'Pick one', !!S.tech)
    h += '<div class="seg pick">'
    techs.forEach(function(t, i){
      h += '<button class="' + (S.tech && S.tech.id === t.id ? 'on' : '') + '" data-k="tech" data-i="' + i + '">' + esc(t.name) + '</button>'
    })
    h += '</div></div>'
  }

  // print areas
  if(areas.length){
    h += sec('Print area', S.areas.length ? S.areas.map(label).join(', ') : 'Pick one or more', S.areas.length)
    h += '<div class="row pick">'
    areas.forEach(function(a, i){
      h += '<button class="chip' + (S.areas.indexOf(a) > -1 ? ' on' : '') + '" data-k="area" data-i="' + i + '">' + esc(label(a)) + '</button>'
    })
    h += '</div>'
    if(S.areas.length > 1){
      h += '<div style="margin-top:12px" class="seg pick">' +
           '<button class="' + (S.design_mode==='same'?'on':'') + '" data-k="mode" data-v="same">Same design on all</button>' +
           '<button class="' + (S.design_mode==='different'?'on':'') + '" data-k="mode" data-v="different">Different per area</button></div>'
    }
    h += '</div>'
  }

  // channel
  h += sec('Sell on', S.channel ? chLabel(S.channel) : 'Pick one', !!S.channel)
  h += '<div class="seg pick">' +
       ['marketplace','own_store','both'].map(function(c){
         return '<button class="' + (S.channel===c?'on':'') + '" data-k="channel" data-v="' + c + '">' + chLabel(c) + '</button>'
       }).join('') + '</div>'
  h += '<div class="hint">Marketplace = JUNOONI marketplace · Own Store = your storefront</div></div>'

  // footer
  h += '<div class="foot"><div class="summary">' + summary() + '</div>' +
       '<button class="go" id="go"' + (ready() && !locked ? '' : ' disabled') + '>' +
       (locked ? 'Sent ✓' : 'Continue to artwork →') + '</button>' +
       '<div class="status" id="st"></div></div>'

  app.innerHTML = h
  wire()
  reportSize()
}
function sec(t, n, done){
  return '<div class="sec"><div class="sec-h"><span class="sec-t">' + t + '</span><span class="sec-n' + (done?' done':'') + '">' + esc(n) + '</span></div>'
}
function chLabel(c){ return c==='marketplace' ? 'Marketplace' : c==='own_store' ? 'Own Store' : 'Both' }
function summary(){
  if(!ready()){
    var miss = []
    if(!S.colors.length) miss.push('colour')
    if(!S.sizes.length) miss.push('size')
    if(!S.tech) miss.push('print technology')
    if(!S.areas.length) miss.push('print area')
    if(!S.channel) miss.push('where to sell')
    return 'Still to pick: ' + miss.join(', ')
  }
  var variants = S.colors.length * S.sizes.length
  return S.colors.length + ' colour' + (S.colors.length>1?'s':'') + ' × ' + S.sizes.length + ' size' + (S.sizes.length>1?'s':'') +
         ' = <b>' + variants + ' variant' + (variants>1?'s':'') + '</b>'
}

function wire(){
  document.querySelectorAll('[data-k]').forEach(function(el){
    el.onclick = function(){
      if(locked) return
      var k = el.getAttribute('data-k'), i = +el.getAttribute('data-i'), v = el.getAttribute('data-v')
      if(k==='color') toggle(S.colors, B.colors[i].name)
      if(k==='size')  toggle(S.sizes, B.sizes[i])
      if(k==='tech'){ S.tech = B.technologies[i]; S.areas = S.areas.filter(function(a){ return currentAreas().indexOf(a) > -1 }); if(currentAreas().length===1) S.areas=[currentAreas()[0]] }
      if(k==='area')  toggle(S.areas, currentAreas()[i])
      if(k==='mode')  S.design_mode = v
      if(k==='channel') S.channel = v
      // keep sizes in catalogue order
      S.sizes.sort(function(a,b){ return B.sizes.indexOf(a) - B.sizes.indexOf(b) })
      draw()
    }
  })
  var go = document.getElementById('go')
  if(go) go.onclick = submit
}

// ── submit: one user message with every choice → Claude opens the gallery ──
function submit(){
  if(!ready() || locked) return
  locked = true; draw()
  var colorDetail = S.colors.map(function(n){ var c = B.colors.filter(function(x){return x.name===n})[0]; return n + ' (' + (c?c.hex:'') + ')' })
  var text =
    'Product options for ' + B.name + ' (blank_id ' + B.id + '):\\n' +
    '• colors: ' + colorDetail.join(', ') + '\\n' +
    '• sizes: ' + S.sizes.join(', ') + '\\n' +
    '• print technology: ' + S.tech.name + ' (technology_id ' + S.tech.id + ')\\n' +
    '• print areas: ' + S.areas.join(', ') + (S.areas.length>1 ? ' — ' + (S.design_mode==='same' ? 'same design on all areas' : 'different design per area') : '') + '\\n' +
    '• sales channel: ' + S.channel
  var st = function(m,c){ var e=document.getElementById('st'); if(e){ e.textContent=m; e.className='status '+(c||'') } reportSize() }
  st('Sending your choices…')
  request('ui/message', { role:'user', content:[{ type:'text', text:text }] })
    .catch(function(){ return request('ui/message', { role:'user', content:{ type:'text', text:text } }) })
    .then(function(){
      var e = document.getElementById('st')
      if(e){ e.innerHTML = '<span class="ok">✓ Sent — opening your gallery…</span><button class="edit" id="edit">Change</button>'; document.getElementById('edit').onclick = function(){ locked=false; draw() } }
      reportSize()
    })
    .catch(function(){
      request('ui/update-model-context', { content:[{ type:'text', text:text }] }).catch(function(){})
      locked = false; draw()
      st('Couldn\\'t send automatically — type "continue" in chat.', 'err')
    })
}

// ── handshake ──────────────────────────────────────────────────────────────
request('ui/initialize', {
  protocolVersion:'2026-01-26',
  clientInfo:{ name:'junooni-options', version:'1.0.0' },
  appInfo:{ name:'junooni-options', version:'1.0.0' },
  appCapabilities:{ availableDisplayModes:['inline'] },
  capabilities:{}
}).then(function(r){ var t = r && r.hostContext && r.hostContext.theme; if (t) applyTheme(t); notify('ui/notifications/initialized', {}) })
  .catch(function(){ notify('ui/notifications/initialized', {}) })

setTimeout(function(){ if(!rendered){ document.getElementById('loading').textContent = 'Still loading… ask Claude to show the product options again.' } }, 12000)
</script>
</body>
</html>`
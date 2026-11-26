/**
 * JUNOONI Finalize Product Widget — MCP Apps inline UI (spec 2026-01-26)
 *
 * Opened by finalize_product (after the creator approves mockups).
 * Served via resources/read at ui://junooni/finalize (text/html;profile=mcp-app).
 *
 * structuredContent:
 *   { product: { blank_name, thumb (data: URI|null), colors:[], sizes:[], sales_channel },
 *     titles: [string],                       // Claude's suggestions from the design
 *     pricing: { base_cost, fee_rate, commission, tiers:[{label,price,profit}] } }
 *
 * Creator picks/writes a title and picks/enters a price, then "Create product"
 * posts one message → Claude calls create_product with exactly these values.
 * "Suggest other titles" asks Claude for fresh suggestions (it re-calls finalize_product).
 */
export const FINALIZE_PRODUCT_WIDGET_HTML = /* html */`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root,[data-theme=light]{--accent:#E65100;--accent-soft:rgba(230,81,0,.10);--bg:#fff;--text:#1a1a1a;--muted:#6b7280;--line:#e5e7eb;--tile:#f6f6f5;--chip:#fff;--warn:#b45309}
[data-theme=dark]{--accent:#ff7a2e;--accent-soft:rgba(255,122,46,.16);--bg:#262624;--text:#f3f3f2;--muted:#a8a8a3;--line:#3d3d3a;--tile:#30302e;--chip:#30302e;--warn:#fbbf24}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg)}
body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--text);padding:14px;font-size:14px;line-height:1.35}
button,input{font:inherit;color:inherit}
button{cursor:pointer}
.head{display:flex;gap:12px;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--line)}
.thumb{width:64px;height:64px;border-radius:10px;object-fit:cover;background:#fff;border:1px solid var(--line);flex:none}
.thumb.ph{display:flex;align-items:center;justify-content:center;font-size:26px}
.h1{font-size:15px;font-weight:650}
.meta{font-size:12px;color:var(--muted);margin-top:3px}
.sec{padding:14px 0;border-bottom:1px solid var(--line)}
.sec:last-of-type{border-bottom:0}
.sec-h{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px}
.sec-t{font-size:12px;font-weight:650;text-transform:uppercase;letter-spacing:.05em}
.link{background:none;border:0;color:var(--accent);font-size:12.5px;font-weight:600}
.link:disabled{opacity:.4;cursor:not-allowed}
/* title options */
.opt{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:var(--chip);margin-bottom:8px}
.opt:hover{border-color:var(--accent)}
.opt.on{border-color:var(--accent);background:var(--accent-soft)}
.rad{width:16px;height:16px;border-radius:50%;border:2px solid var(--line);flex:none;position:relative}
.opt.on .rad{border-color:var(--accent)}
.opt.on .rad::after{content:"";position:absolute;inset:3px;border-radius:50%;background:var(--accent)}
.opt .tx{flex:1;font-weight:550}
.tag{font-size:10.5px;font-weight:700;color:var(--accent);background:var(--accent-soft);padding:2px 7px;border-radius:999px}
.own{width:100%;margin-top:2px;padding:10px 12px;border:1.5px solid var(--line);border-radius:10px;background:var(--chip);outline:none}
.own:focus{border-color:var(--accent)}
.count{font-size:11px;color:var(--muted);text-align:right;margin-top:4px}
/* price tiers */
.tiers{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.tier{padding:10px 8px;border:1.5px solid var(--line);border-radius:10px;background:var(--chip);text-align:center}
.tier:hover{border-color:var(--accent)}
.tier.on{border-color:var(--accent);background:var(--accent-soft)}
.tier .lb{font-size:11px;color:var(--muted);text-transform:capitalize}
.tier .pr{font-size:16px;font-weight:700;margin-top:2px}
.tier .ea{font-size:11.5px;color:var(--muted);margin-top:2px}
.tier.on .ea{color:var(--accent);font-weight:600}
.custom{display:none;margin-top:10px;align-items:center;gap:10px}
.custom.on{display:flex}
.cur{display:flex;align-items:center;border:1.5px solid var(--line);border-radius:10px;background:var(--chip);padding:0 10px;flex:1}
.cur:focus-within{border-color:var(--accent)}
.cur input{border:0;outline:none;background:transparent;padding:10px 6px;width:100%}
.earn{font-size:13px;font-weight:600;white-space:nowrap}
.warn{font-size:12px;color:var(--warn);margin-top:8px;min-height:15px}
.note{font-size:11.5px;color:var(--muted);margin-top:8px}
.go{width:100%;padding:12px;border-radius:10px;border:0;background:var(--accent);color:#fff;font-weight:650;font-size:14px;margin-top:4px}
.go:disabled{opacity:.35;cursor:not-allowed}
.status{font-size:12px;text-align:center;margin-top:8px;min-height:16px;color:var(--muted)}
.ok{color:#16a34a}.err{color:#dc2626}
[data-theme=dark] .ok{color:#4ade80}[data-theme=dark] .err{color:#f87171}
.locked .pick{pointer-events:none;opacity:.6}
#loading{text-align:center;padding:28px;color:var(--muted)}
@media (max-width:420px){ .tiers{grid-template-columns:repeat(2,1fr)} }
</style>
</head>
<body>
<div id="loading">Loading…</div>
<div id="app" style="display:none"></div>
<script>
var rpcId = 0, pending = {}, rendered = false, locked = false, D = null
var S = { titleIdx: 0, own: '', tier: 1, custom: '' }

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
function inr(n){ return '₹' + Math.round(n||0).toLocaleString('en-IN') }

function onResult(r){
  rendered = true
  document.getElementById('loading').style.display = 'none'
  var app = document.getElementById('app'); app.style.display = 'block'
  var data = r.structuredContent || {}
  if(r.isError || !data.pricing){
    app.innerHTML = '<div class="status err">' + esc(data.error || 'Could not load product details.') + '</div>'
    return reportSize()
  }
  D = data
  S.titleIdx = (D.titles && D.titles.length) ? 0 : -1
  draw()
}

// ── pricing maths (same formula as suggest_price) ──────────────────────────
function payout(price){ var p = D.pricing; return Math.round(price * (1 - p.fee_rate) * (1 - p.commission) - p.base_cost) }
function minPrice(){ return D.pricing.tiers[0].price }
function chosenPrice(){
  if(S.tier === 3){ var v = parseInt(String(S.custom).replace(/[^0-9]/g,''), 10); return isNaN(v) ? null : v }
  return D.pricing.tiers[S.tier].price
}
function chosenTitle(){ return S.titleIdx === -1 ? S.own.trim() : (D.titles[S.titleIdx] || '') }
function priceError(){
  var p = chosenPrice()
  if(p == null) return 'Enter a price'
  if(p < minPrice()) return 'Minimum price is ' + inr(minPrice()) + ' so you still earn on each sale'
  if(p > 100000) return 'That price looks too high'
  return ''
}
function ready(){ return chosenTitle().length >= 3 && !priceError() }

// ── render ─────────────────────────────────────────────────────────────────
function draw(){
  var app = document.getElementById('app')
  app.className = locked ? 'locked' : ''
  var P = D.product || {}, tiers = D.pricing.tiers
  var h = ''

  h += '<div class="head">' + (P.thumb ? '<img class="thumb" src="' + esc(P.thumb) + '" alt="">' : '<div class="thumb ph">👕</div>') +
       '<div><div class="h1">Almost done — name &amp; price</div>' +
       '<div class="meta">' + esc(P.blank_name || '') +
       (P.colors && P.colors.length ? ' · ' + P.colors.length + ' colour' + (P.colors.length>1?'s':'') : '') +
       (P.sizes && P.sizes.length ? ' · ' + esc(P.sizes.join(', ')) : '') +
       (P.sales_channel ? ' · ' + esc(P.sales_channel.replace('_',' ')) : '') + '</div></div></div>'

  // title
  h += '<div class="sec"><div class="sec-h"><span class="sec-t">Product title</span>' +
       '<button class="link" id="more"' + (locked?' disabled':'') + '>↻ Suggest other titles</button></div><div class="pick">'
  ;(D.titles || []).forEach(function(t, i){
    h += '<button class="opt' + (S.titleIdx===i?' on':'') + '" data-t="' + i + '"><span class="rad"></span><span class="tx">' + esc(t) + '</span>' +
         (i===0 ? '<span class="tag">Suggested</span>' : '') + '</button>'
  })
  h += '<button class="opt' + (S.titleIdx===-1?' on':'') + '" data-t="-1"><span class="rad"></span><span class="tx">✏️ Write my own</span></button>'
  if(S.titleIdx === -1){
    h += '<input class="own" id="own" maxlength="80" placeholder="e.g. Golden Speaker Hoodie" value="' + esc(S.own) + '">' +
         '<div class="count"><span id="cnt">' + S.own.length + '</span>/80</div>'
  }
  h += '</div></div>'

  // price
  h += '<div class="sec"><div class="sec-h"><span class="sec-t">Selling price</span><span class="meta">Base cost ' + inr(D.pricing.base_cost) + '</span></div>' +
       '<div class="tiers pick">'
  tiers.forEach(function(t, i){
    h += '<button class="tier' + (S.tier===i?' on':'') + '" data-p="' + i + '"><div class="lb">' + esc(t.label) + '</div>' +
         '<div class="pr">' + inr(t.price) + '</div><div class="ea">you earn ' + inr(t.profit) + '</div></button>'
  })
  h += '<button class="tier' + (S.tier===3?' on':'') + '" data-p="3"><div class="lb">Custom</div><div class="pr">✏️</div><div class="ea">your price</div></button></div>'
  h += '<div class="custom pick' + (S.tier===3?' on':'') + '"><div class="cur">₹<input id="cp" inputmode="numeric" placeholder="' + tiers[1].price + '" value="' + esc(S.custom) + '"></div>' +
       '<div class="earn" id="earn"></div></div>'
  h += '<div class="warn" id="warn"></div>'
  h += '<div class="note">Earnings = price − 5% payment fee − base cost. 0% JUNOONI commission.</div></div>'

  h += '<button class="go" id="go">' + (locked ? 'Sent ✓' : 'Create product →') + '</button><div class="status" id="st"></div>'
  app.innerHTML = h
  wire(); refresh(); reportSize()
}

function refresh(){
  var go = document.getElementById('go'), warn = document.getElementById('warn'), earn = document.getElementById('earn')
  if(S.tier === 3 && earn){ var p = chosenPrice(); earn.textContent = p ? 'you earn ' + inr(payout(p)) : '' }
  var e = priceError()
  warn.textContent = (S.tier === 3 && S.custom !== '') ? e : ''
  if(go) go.disabled = locked || !ready()
}

function wire(){
  document.querySelectorAll('[data-t]').forEach(function(el){
    el.onclick = function(){ if(locked) return; S.titleIdx = +el.getAttribute('data-t'); draw(); if(S.titleIdx === -1){ var o = document.getElementById('own'); if(o){ o.focus(); o.setSelectionRange(o.value.length, o.value.length) } } }
  })
  document.querySelectorAll('[data-p]').forEach(function(el){
    el.onclick = function(){ if(locked) return; S.tier = +el.getAttribute('data-p'); draw(); if(S.tier === 3){ var c = document.getElementById('cp'); if(c) c.focus() } }
  })
  var own = document.getElementById('own')
  if(own) own.oninput = function(){ S.own = own.value; document.getElementById('cnt').textContent = S.own.length; refresh() }
  var cp = document.getElementById('cp')
  if(cp) cp.oninput = function(){ S.custom = cp.value.replace(/[^0-9]/g,''); if(cp.value !== S.custom) cp.value = S.custom; refresh() }
  document.getElementById('go').onclick = submit
  document.getElementById('more').onclick = function(){
    if(locked) return
    send('Suggest 3 different product titles (not: ' + (D.titles || []).join(' / ') + ').', '✓ Asked Claude for new titles…', false)
  }
}

function submit(){
  if(!ready() || locked) return
  var title = chosenTitle(), price = chosenPrice()
  var text = 'Final product details:\\n' +
             '• title: "' + title.replace(/"/g, "'") + '"' + (S.titleIdx === -1 ? ' (written by creator)' : '') + '\\n' +
             '• selling_price: ' + price + ' (creator earns ' + inr(payout(price)) + ' per sale)\\n' +
             'Create the product now.'
  locked = true; draw()
  send(text, '✓ Creating your product…', true)
}

function send(text, okMsg, isFinal){
  var st = function(m,c){ var e = document.getElementById('st'); if(e){ e.textContent = m; e.className = 'status ' + (c||'') } reportSize() }
  st('Sending…')
  request('ui/message', { role:'user', content:[{ type:'text', text:text }] })
    .catch(function(){ return request('ui/message', { role:'user', content:{ type:'text', text:text } }) })
    .then(function(){ st(okMsg, 'ok') })
    .catch(function(){
      request('ui/update-model-context', { content:[{ type:'text', text:text }] }).catch(function(){})
      if(isFinal){ locked = false; draw() }
      st('Couldn\\'t send automatically — type "continue" in chat.', 'err')
    })
}

request('ui/initialize', {
  protocolVersion:'2026-01-26',
  clientInfo:{ name:'junooni-finalize', version:'1.0.0' },
  appInfo:{ name:'junooni-finalize', version:'1.0.0' },
  appCapabilities:{ availableDisplayModes:['inline'] },
  capabilities:{}
}).then(function(r){ var t = r && r.hostContext && r.hostContext.theme; if(t) applyTheme(t); notify('ui/notifications/initialized', {}) })
  .catch(function(){ notify('ui/notifications/initialized', {}) })

setTimeout(function(){ if(!rendered) document.getElementById('loading').textContent = 'Still loading… ask Claude to show it again.' }, 12000)
</script>
</body>
</html>`
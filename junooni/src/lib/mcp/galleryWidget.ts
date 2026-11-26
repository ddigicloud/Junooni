/**
 * JUNOONI Gallery Widget — MCP Apps inline UI (spec 2026-01-26)
 *
 * Served via resources/read at ui://junooni/gallery
 * mimeType: text/html;profile=mcp-app
 *
 * Lifecycle (host = Claude.ai):
 *   1. View  → Host  ui/initialize            (request)
 *   2. Host  → View  result                   (host context)
 *   3. View  → Host  ui/notifications/initialized
 *   4. Host  → View  ui/notifications/tool-result  { structuredContent: { images, upload_url } }
 *   5. User picks / uploads → View → Host  ui/message (posts as user turn, Claude continues)
 *
 * Images load straight from https://files.junooni.com and uploads POST to
 * https://api.junooni.com. Both domains are whitelisted in the resource's
 * _meta.ui.csp, so no base64 baking is needed.
 */
export const GALLERY_WIDGET_HTML = /* html */`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box;margin:0;padding:0}
:root,[data-theme=light]{--bg:#fff;--text:#111;--muted:#6b7280;--line:#e5e7eb;--tile:#f9fafb;--accent:#E65100}
[data-theme=dark]{--bg:#262624;--text:#f3f3f2;--muted:#a8a8a3;--line:#3d3d3a;--tile:#30302e;--accent:#ff7a2e}
html,body{background:var(--bg)}
body{font-family:system-ui,-apple-system,sans-serif;color:var(--text);padding:12px}
h2{font-size:11px;color:#888;margin-bottom:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:600}
#grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
.card{position:relative;cursor:pointer;border-radius:10px;overflow:hidden;border:2px solid #e5e7eb;aspect-ratio:1;background:#f9fafb;transition:border-color .15s,box-shadow .15s}
.card:hover{border-color:#E65100;box-shadow:0 0 0 3px rgba(230,81,0,.1)}
.card.selected{border-color:#E65100;box-shadow:0 0 0 3px rgba(230,81,0,.18)}
.card img{width:100%;height:100%;object-fit:cover;display:block}
.card .lbl{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.55);padding:3px 6px;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#fff}
.check{position:absolute;top:5px;right:5px;width:20px;height:20px;background:#E65100;border-radius:50%;display:none;align-items:center;justify-content:center;color:#fff;font-size:12px}
.card.selected .check{display:flex}
.upload-card{cursor:pointer;border-radius:10px;border:2px dashed #d1d5db;aspect-ratio:1;background:#fafafa;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px;transition:border-color .15s,background .15s}
.upload-card:hover,.upload-card.over{border-color:#E65100;background:rgba(230,81,0,.04)}
.upload-card .icon{font-size:24px;line-height:1}
.upload-card .lbl2{font-size:11px;color:#6b7280;text-align:center;line-height:1.3}
.bar-wrap{height:3px;background:#e5e7eb;border-radius:2px;overflow:hidden;width:80%;display:none}
.bar{height:100%;background:#E65100;width:0%;transition:width .2s}
#status{font-size:12px;color:#6b7280;text-align:center;min-height:16px;margin-top:10px}
.ok{color:#16a34a!important}.err{color:#dc2626!important}
#loading{text-align:center;padding:24px;color:#9ca3af;font-size:13px}
.empty{grid-column:1/-1;text-align:center;padding:12px;color:#9ca3af;font-size:12px}
input[type=file]{display:none}
[data-theme=dark] .card{border-color:var(--line);background:var(--tile)}
[data-theme=dark] .upload-card{border-color:#55554f;background:var(--tile)}
[data-theme=dark] .upload-card .lbl2,[data-theme=dark] #status{color:var(--muted)}
[data-theme=dark] h2{color:var(--muted)}
</style>
</head>
<body>
<div id="loading">Loading your gallery…</div>
<div id="main" style="display:none">
  <h2 id="gtitle">Your Designs</h2>
  <div id="grid"></div>
</div>
<div id="status"></div>
<input type="file" id="fi" accept="image/*">
<script>
var uploadUrl = null
var rpcId = 0
var pending = {}
var rendered = false
var locked = false
var currentImgs = []
var currentArea = null

// ── Theme: follow the host (Claude) theme; paint our own background so text is always readable ──
function applyTheme(t){ document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light') }
try { applyTheme(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') } catch(e) { applyTheme('light') }
window.addEventListener('message', function(ev){
  var m = ev.data
  if (m && m.method === 'ui/notifications/host-context-changed' && m.params && m.params.theme) applyTheme(m.params.theme)
})

// ── JSON-RPC over postMessage ───────────────────────────────────────────────
function post(msg) { try { window.parent.postMessage(msg, '*') } catch (e) {} }
function request(method, params) {
  var id = ++rpcId
  post({ jsonrpc: '2.0', id: id, method: method, params: params || {} })
  return new Promise(function (resolve, reject) {
    pending[id] = { resolve: resolve, reject: reject }
    setTimeout(function () { if (pending[id]) { delete pending[id]; reject(new Error('timeout')) } }, 15000)
  })
}
function notify(method, params) { post({ jsonrpc: '2.0', method: method, params: params || {} }) }

window.addEventListener('message', function (ev) {
  var m = ev.data
  if (!m || m.jsonrpc !== '2.0') return
  // Response to one of our requests
  if (m.id != null && pending[m.id]) {
    var p = pending[m.id]; delete pending[m.id]
    if (m.error) p.reject(m.error); else p.resolve(m.result)
    return
  }
  if (m.method === 'ui/notifications/tool-result') {
    handleResult(m.params || {})
  }
  // Host may ping / request teardown — acknowledge requests we don't handle
  if (m.id != null && m.method) post({ jsonrpc: '2.0', id: m.id, result: {} })
})

function handleResult(result) {
  var data = result.structuredContent
  if (!data && result.content && result.content[0] && result.content[0].text) {
    try { data = JSON.parse(result.content[0].text) } catch (e) {}
  }
  data = data || {}
  if (result.isError || data.error) {
    document.getElementById('loading').style.display = 'none'
    rendered = true
    stat('Finish the product details in chat first — Claude will reopen the gallery.', 'err')
    return
  }
  uploadUrl = data.upload_url || null
  currentArea = data.area || null
  render(data.images || [])
}

// ── Auto-height so the inline frame fits the grid ──────────────────────────
function reportSize() {
  notify('ui/notifications/size-changed', {
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight
  })
}
try { new ResizeObserver(reportSize).observe(document.body) } catch (e) {}

// ── Render ──────────────────────────────────────────────────────────────────
function render(imgs) {
  rendered = true
  currentImgs = imgs
  document.getElementById('loading').style.display = 'none'
  document.getElementById('main').style.display = 'block'
  var areaLbl = currentArea ? String(currentArea).replace(/_/g, ' ') : ''
  document.getElementById('gtitle').innerHTML =
    (areaLbl ? 'Design for <span style="color:var(--accent)">' + esc(areaLbl.toUpperCase()) + '</span> · ' : '') +
    (imgs.length ? 'Your Designs (' + imgs.length + ')' : 'Your Designs')
  var grid = document.getElementById('grid')
  grid.innerHTML = ''

  var uc = document.createElement('div')
  uc.className = 'upload-card'
  uc.innerHTML = '<div class="icon">📤</div><div class="lbl2">Upload<br>new design</div>' +
                 '<div class="bar-wrap" id="bwrap"><div class="bar" id="bbar"></div></div>'
  uc.onclick = function () { if (!locked) document.getElementById('fi').click() }
  uc.addEventListener('dragover', function (e) { e.preventDefault(); uc.classList.add('over') })
  uc.addEventListener('dragleave', function () { uc.classList.remove('over') })
  uc.addEventListener('drop', function (e) {
    e.preventDefault(); uc.classList.remove('over')
    if (!locked && e.dataTransfer.files[0]) upload(e.dataTransfer.files[0])
  })
  grid.appendChild(uc)

  if (!imgs.length) {
    var empty = document.createElement('div')
    empty.className = 'empty'
    empty.textContent = 'No designs yet — upload one!'
    grid.appendChild(empty)
  }

  imgs.forEach(function (img) {
    var d = document.createElement('div')
    d.className = 'card'
    d.innerHTML = '<img src="' + esc(img.url) + '" alt="' + esc(img.filename) + '" loading="lazy">' +
                  '<div class="lbl">' + esc(img.filename) + '</div><div class="check">✓</div>'
    d.onclick = function () {
      if (locked) return
      document.querySelectorAll('.card.selected').forEach(function (c) { c.classList.remove('selected') })
      d.classList.add('selected')
      choose(img.url, img.filename)
    }
    grid.appendChild(d)
  })
  reportSize()
}

// ── Selecting a design: post a user turn so Claude continues automatically ──
function choose(url, name) {
  locked = true
  stat('Using "' + name + '"…', '')
  var text = 'Use this design' + (currentArea ? ' for ' + currentArea : '') + ': "' + name + '" — artwork_url: ' + url +
             (currentArea ? ' (area: ' + currentArea + ')' : '')
  // Hosts differ on content shape: try array first (SDK form), then single object (spec form)
  request('ui/message', { role: 'user', content: [{ type: 'text', text: text }] })
    .catch(function (e1) {
      console.warn('[junooni] ui/message (array) failed', e1)
      return request('ui/message', { role: 'user', content: { type: 'text', text: text } })
    })
    .then(function () {
      stat('✅ Selected "' + name + '"', 'ok')
    })
    .catch(function (e2) {
      console.warn('[junooni] ui/message (object) failed', e2)
      locked = false
      // Last resort: put it in model context so Claude sees it on the next turn
      request('ui/update-model-context', { content: [{ type: 'text', text: text }] }).catch(function () {})
      stat('Selected "' + name + '" — say "done" in chat to continue', 'err')
    })
}

// ── Upload straight to api.junooni.com (whitelisted in CSP connectDomains) ──
document.getElementById('fi').onchange = function (e) { if (e.target.files[0]) upload(e.target.files[0]) }

function upload(file) {
  if (!uploadUrl) { stat('Upload link missing — ask Claude to reopen the gallery', 'err'); return }
  stat('Uploading "' + file.name + '"…', '')
  progress(0)
  var fd = new FormData()
  fd.append('file', file)
  var xhr = new XMLHttpRequest()
  xhr.open('POST', uploadUrl)
  xhr.upload.onprogress = function (e) { if (e.lengthComputable) progress(Math.round(e.loaded / e.total * 90)) }
  xhr.onload = function () {
    progress(100)
    var r = {}
    try { r = JSON.parse(xhr.responseText) } catch (e) {}
    if (xhr.status === 200 && r.url) {
      render([{ url: r.url, filename: file.name }].concat(currentImgs))
      var first = document.querySelector('.card')
      if (first) first.classList.add('selected')
      stat('✅ Uploaded!', 'ok')
      choose(r.url, file.name)
    }
    else stat('Upload failed: ' + (r.error || ('HTTP ' + xhr.status)), 'err')
  }
  xhr.onerror = function () { stat('Upload failed: network error', 'err') }
  xhr.send(fd)
}

function progress(pct) {
  var w = document.getElementById('bwrap'), b = document.getElementById('bbar')
  if (!w || !b) return
  w.style.display = 'block'; b.style.width = pct + '%'
  if (pct >= 100) setTimeout(function () { w.style.display = 'none' }, 1200)
}
function stat(msg, cls) {
  var el = document.getElementById('status')
  el.textContent = msg; el.className = cls || ''
  reportSize()
}
function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// ── Handshake ───────────────────────────────────────────────────────────────
request('ui/initialize', {
  protocolVersion: '2026-01-26',
  clientInfo: { name: 'junooni-gallery', version: '2.0.0' },
  appInfo:    { name: 'junooni-gallery', version: '2.0.0' },
  appCapabilities: { availableDisplayModes: ['inline'] },
  capabilities: {}
}).then(function (r) {
  var t = r && r.hostContext && r.hostContext.theme; if (t) applyTheme(t)
  notify('ui/notifications/initialized', {})
}).catch(function () {
  notify('ui/notifications/initialized', {})
})

setTimeout(function () {
  if (!rendered) stat('Still waiting for gallery data… try asking Claude to reopen it.', 'err')
}, 12000)
</script>
</body>
</html>`
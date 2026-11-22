/**
 * JUNOONI Gallery Widget — MCP Apps inline UI
 *
 * Served as a resource at gallery://junooni/widget
 * Claude.ai fetches this, renders it in an iframe inline in chat.
 *
 * Data flow:
 *   browse_gallery tool result  →  postMessage(ontoolresult)  →  widget renders
 *   user picks image            →  postMessage(callServerTool / ui/message)  →  Claude calls upload_artwork
 *   user drops file             →  widget POSTs to /api/mcp/widget-upload  →  postMessage with new url
 */

export const GALLERY_WIDGET_HTML = /* html */`<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,sans-serif;background:#111;color:#f1f1f1;padding:14px;min-height:100vh}
h2{font-size:12px;color:#888;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em}
#grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px}
.card{position:relative;cursor:pointer;border-radius:8px;overflow:hidden;border:2px solid transparent;aspect-ratio:1;background:#1a1a1a;transition:border-color .15s,transform .15s}
.card:hover{border-color:#7c3aed;transform:scale(1.02)}
.card img{width:100%;height:100%;object-fit:cover;display:block}
.card .lbl{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,.75);padding:3px 5px;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#ddd}
#drop{border:2px dashed #333;border-radius:10px;padding:18px 12px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s;margin-bottom:10px}
#drop:hover,#drop.over{border-color:#7c3aed;background:rgba(124,58,237,.08)}
#drop p{color:#888;font-size:12px;margin-bottom:8px}
#drop button{background:#7c3aed;color:#fff;border:none;border-radius:6px;padding:7px 14px;font-size:12px;cursor:pointer;font-weight:500}
#drop button:hover{background:#6d28d9}
.bar-wrap{height:3px;background:#222;border-radius:2px;overflow:hidden;margin-top:8px;display:none}
.bar{height:100%;background:#7c3aed;width:0%;transition:width .2s}
#status{font-size:11px;color:#888;text-align:center;min-height:16px}
.ok{color:#4ade80}.err{color:#f87171}
#loading{text-align:center;padding:30px;color:#666;font-size:13px}
.empty{text-align:center;padding:16px;color:#555;font-size:12px}
</style>
</head>
<body>
<div id="loading">Loading your gallery…</div>

<div id="main" style="display:none">
  <h2 id="gtitle">Your Designs</h2>
  <div id="grid"></div>

  <div id="drop">
    <p>Upload a new design</p>
    <button onclick="document.getElementById('fi').click()">📤 Choose File</button>
    <input type="file" id="fi" accept="image/*" style="display:none">
    <div class="bar-wrap" id="bwrap"><div class="bar" id="bbar"></div></div>
  </div>
</div>

<div id="status"></div>

<script>
var uploadUrl = null

/* ── receive tool result from MCP host ── */
window.addEventListener('message', function(ev) {
  var m = ev.data
  if (!m) return
  // MCP Apps passes the tool result in various formats
  var payload = m.toolResult ?? m.result ?? m.params ?? m.data ?? m
  if (m.type === 'toolResult' || m.method === 'ontoolresult' ||
      m.type === 'ontoolresult' || (payload && payload.content)) {
    init(payload)
  }
})

function init(result) {
  var text = ''
  try {
    if (result && result.content && result.content[0]) {
      text = result.content[0].text ?? ''
    } else if (typeof result === 'string') {
      text = result
    }
    var data = typeof text === 'string' ? JSON.parse(text) : text
    uploadUrl = data.upload_url ?? null
    render(data.images ?? [])
  } catch(e) {
    render([])
  }
}

function render(imgs) {
  document.getElementById('loading').style.display = 'none'
  document.getElementById('main').style.display = 'block'
  var grid = document.getElementById('grid')
  grid.innerHTML = ''
  document.getElementById('gtitle').textContent =
    imgs.length ? 'Your Designs (' + imgs.length + ')' : 'No designs yet'

  if (!imgs.length) {
    grid.innerHTML = '<div class="empty">No designs saved yet.<br>Upload one below.</div>'
    return
  }

  imgs.forEach(function(img) {
    var d = document.createElement('div')
    d.className = 'card'
    d.innerHTML = '<img src="' + esc(img.url) + '" alt="' + esc(img.filename) + '" loading="lazy"><div class="lbl">' + esc(img.filename) + '</div>'
    d.onclick = function() { pick(img.url, img.filename) }
    grid.appendChild(d)
  })
}

function pick(url, name) {
  stat('Using "' + name + '"…', '')
  // Try callServerTool (MCP Apps runtime) then fall back to ui/message
  send({ jsonrpc:'2.0', id:1, method:'callServerTool',
         params:{ name:'upload_artwork', arguments:{ artwork_url: url } } })
  send({ type:'ui/message', message:'I want to use this design. artwork_url: ' + url })
}

/* ── file upload ── */
var fi = document.getElementById('fi')
var drop = document.getElementById('drop')

fi.onchange = function(e) { if (e.target.files[0]) go(e.target.files[0]) }
drop.addEventListener('dragover', function(e){ e.preventDefault(); drop.classList.add('over') })
drop.addEventListener('dragleave', function(){ drop.classList.remove('over') })
drop.addEventListener('drop', function(e){
  e.preventDefault(); drop.classList.remove('over')
  if (e.dataTransfer.files[0]) go(e.dataTransfer.files[0])
})

function go(file) {
  if (!uploadUrl) { stat('No upload URL — please retry browse_gallery', 'err'); return }
  stat('Uploading "' + file.name + '"…', '')
  progress(0)

  var fd = new FormData()
  fd.append('file', file)

  var xhr = new XMLHttpRequest()
  xhr.open('POST', uploadUrl)
  xhr.upload.onprogress = function(e) {
    if (e.lengthComputable) progress(Math.round(e.loaded/e.total*90))
  }
  xhr.onload = function() {
    progress(100)
    if (xhr.status === 200) {
      try {
        var r = JSON.parse(xhr.responseText)
        if (r.url) {
          stat('✅ Uploaded!', 'ok')
          setTimeout(function(){ pick(r.url, file.name) }, 400)
        } else { stat('Upload failed: ' + (r.error||'unknown'), 'err') }
      } catch(e) { stat('Upload failed: bad response', 'err') }
    } else { stat('Upload failed (HTTP ' + xhr.status + ')', 'err') }
  }
  xhr.onerror = function(){ stat('Upload failed: network error', 'err') }
  xhr.send(fd)
}

function progress(pct) {
  var w = document.getElementById('bwrap'), b = document.getElementById('bbar')
  w.style.display = 'block'; b.style.width = pct + '%'
  if (pct >= 100) setTimeout(function(){ w.style.display='none' }, 1200)
}

function stat(msg, cls) {
  var el = document.getElementById('status')
  el.textContent = msg; el.className = cls || ''
}

function send(msg) { try { window.parent.postMessage(msg, '*') } catch(e){} }

function esc(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

// Signal ready
send({ type:'ready' })
send({ jsonrpc:'2.0', id:0, method:'ready', params:{} })
</script>
</body>
</html>`
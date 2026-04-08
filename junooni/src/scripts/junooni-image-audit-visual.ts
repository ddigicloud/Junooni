/**
 * JUNOONI — Visual Image Audit Server (Medusa v2)
 * ─────────────────────────────────────────────────
 * Reads image-audit-report.json and serves a visual browser UI.
 * Images are served directly from your static folder.
 *
 * Step 1: Run the audit first to generate image-audit-report.json
 *   npx medusa exec src/scripts/junooni-find-unused-images.ts
 *
 * Step 2: Run this server (plain node, NOT medusa exec)
 *   node src/scripts/junooni-image-audit-visual.ts
 *   OR if ts-node available:
 *   npx ts-node src/scripts/junooni-image-audit-visual.ts
 *
 * Then open: http://localhost:4444
 */

import http from "http"
import fs from "fs"
import path from "path"
import url from "url"

const PORT = 4444
const STATIC_DIR = "C:\\junooni-github\\junooni\\junooni\\static"
const REPORT_FILE = "image-audit-report.json"

// ─────────────────────────────────────────────────────────────

// This script runs as plain Node, not medusa exec
// So we don't use export default

function loadReport() {
  if (!fs.existsSync(REPORT_FILE)) {
    console.error(`❌ ${REPORT_FILE} not found.`)
    console.error("   Run this first:")
    console.error("   npx medusa exec src/scripts/junooni-find-unused-images.ts")
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(REPORT_FILE, "utf-8"))
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B"
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

function getMime(ext: string): string {
  return ({ ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml" } as any)[ext] || "application/octet-stream"
}

function serveImage(res: http.ServerResponse, fname: string) {
  const filePath = path.join(STATIC_DIR, path.basename(fname))
  if (!fs.existsSync(filePath)) {
    res.writeHead(404); res.end(); return
  }
  const ext = path.extname(filePath).toLowerCase()
  res.writeHead(200, { "Content-Type": getMime(ext), "Cache-Control": "max-age=3600" })
  fs.createReadStream(filePath).pipe(res)
}

function serveHtml(res: http.ServerResponse, report: any) {
  const { unusedFiles = [], noDbFiles = [], usedFiles = [] } = report
  const totalUnused = unusedFiles.length + noDbFiles.length
  const unusedBytes = [...unusedFiles, ...noDbFiles].reduce((s: number, f: any) => s + (f.size || 0), 0)

  // Safe serialization — avoid any escaping issues
  const safeJson = (data: any) => JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>JUNOONI Image Audit</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #e0e0e0; }

header { background: #1a1a1a; border-bottom: 1px solid #2a2a2a; padding: 20px 30px; position: sticky; top: 0; z-index: 100; }
header h1 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 14px; }
.stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.stat { background: #252525; border-radius: 8px; padding: 10px 18px; }
.stat .num { font-size: 22px; font-weight: 700; }
.stat .lbl { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
.stat.green .num { color: #4ade80; }
.stat.red .num { color: #f87171; }
.stat.gray .num { color: #94a3b8; }
.stat.amber .num { color: #fbbf24; }
.tabs { display: flex; gap: 4px; }
.tab { padding: 8px 18px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; border: none; background: #252525; color: #888; }
.tab.active { background: #7c3aed; color: #fff; }
.tab:hover:not(.active) { background: #333; color: #ccc; }

.controls { padding: 14px 30px; display: flex; gap: 12px; align-items: center; background: #141414; border-bottom: 1px solid #222; flex-wrap: wrap; }
.search { background: #1e1e1e; border: 1px solid #333; border-radius: 6px; padding: 8px 14px; color: #e0e0e0; font-size: 13px; width: 260px; outline: none; }
.search:focus { border-color: #7c3aed; }
select { background: #1e1e1e; border: 1px solid #333; border-radius: 6px; padding: 8px 14px; color: #ccc; font-size: 13px; cursor: pointer; }
.count { margin-left: auto; font-size: 13px; color: #666; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; padding: 20px 30px; }
.card { background: #1a1a1a; border-radius: 10px; overflow: hidden; border: 1px solid #2a2a2a; cursor: pointer; transition: border-color 0.15s; }
.card:hover { border-color: #555; }
.card.selected { border-color: #7c3aed; background: #1a1535; }
.card img { width: 100%; aspect-ratio: 1; object-fit: cover; background: #111; display: block; }
.placeholder { width: 100%; aspect-ratio: 1; background: #111; display: flex; align-items: center; justify-content: center; font-size: 32px; }
.card-body { padding: 8px 10px; }
.fname { font-size: 11px; color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 6px; }
.meta { display: flex; justify-content: space-between; align-items: center; }
.size { font-size: 11px; color: #666; }
.badge { font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: 600; }
.b-orphan { background: #3b1010; color: #f87171; }
.b-deleted { background: #3b2a0a; color: #fbbf24; }
.b-noDb { background: #1a1a3b; color: #818cf8; }
.b-used { background: #0a3b1a; color: #4ade80; }
.date { font-size: 10px; color: #555; margin-top: 3px; }
.cb { float: right; accent-color: #7c3aed; margin-top: 1px; }

.action-bar { position: fixed; bottom: 0; left: 0; right: 0; background: #1a1a1a; border-top: 1px solid #333; padding: 14px 30px; display: flex; align-items: center; gap: 14px; transform: translateY(100%); transition: transform 0.2s; z-index: 200; }
.action-bar.show { transform: translateY(0); }
.sel-count { font-size: 14px; font-weight: 600; }
.btn { padding: 8px 18px; border-radius: 6px; cursor: pointer; font-size: 13px; border: 1px solid #444; background: #252525; color: #ccc; }
.btn:hover { background: #333; }
.btn-primary { background: #7c3aed; border-color: #7c3aed; color: #fff; font-weight: 600; }
.btn-primary:hover { background: #6d28d9; }
.btn-danger { background: #991b1b; border-color: #991b1b; color: #fff; font-weight: 600; }
.btn-danger:hover { background: #7f1d1d; }
.empty { text-align: center; padding: 60px; color: #555; grid-column: 1/-1; }

.loading { text-align: center; padding: 60px; color: #666; grid-column: 1/-1; font-size: 15px; }
</style>
</head>
<body>

<header>
  <h1>🖼️ JUNOONI Image Audit — ${new Date().toLocaleDateString()}</h1>
  <div class="stats">
    <div class="stat green"><div class="num">${usedFiles.length}</div><div class="lbl">Used</div></div>
    <div class="stat red"><div class="num">${unusedFiles.length}</div><div class="lbl">Orphaned</div></div>
    <div class="stat gray"><div class="num">${noDbFiles.length}</div><div class="lbl">No DB Record</div></div>
    <div class="stat amber"><div class="num">${formatBytes(unusedBytes)}</div><div class="lbl">Reclaimable</div></div>
  </div>
  <div class="tabs">
    <button class="tab active" onclick="switchTab('unused',this)">❌ Unused (${totalUnused})</button>
    <button class="tab" onclick="switchTab('orphaned',this)">👻 Orphaned (${unusedFiles.length})</button>
    <button class="tab" onclick="switchTab('noDb',this)">❓ No DB (${noDbFiles.length})</button>
    <button class="tab" onclick="switchTab('used',this)">✅ Used (${usedFiles.length})</button>
  </div>
</header>

<div class="controls">
  <input class="search" type="text" placeholder="Search filename..." oninput="onSearch(this.value)" />
  <select onchange="onSort(this.value)">
    <option value="name">Sort: Name A-Z</option>
    <option value="size-desc">Sort: Largest first</option>
    <option value="size-asc">Sort: Smallest first</option>
    <option value="date-desc">Sort: Newest first</option>
    <option value="date-asc">Sort: Oldest first</option>
  </select>
  <span class="count" id="countEl">—</span>
</div>

<div class="grid" id="grid"><div class="loading">Loading...</div></div>

<div class="action-bar" id="actionBar">
  <span class="sel-count" id="selCount">0 selected</span>
  <button class="btn" onclick="selectAllVisible()">Select All Visible</button>
  <button class="btn" onclick="clearSel()">Clear</button>
  <button class="btn btn-primary" onclick="exportList()">📋 Export List</button>
</div>

<script>
var DATA = {
  unused:   ${safeJson([...unusedFiles, ...noDbFiles])},
  orphaned: ${safeJson(unusedFiles)},
  noDb:     ${safeJson(noDbFiles)},
  used:     ${safeJson(usedFiles)}
};

var tab = 'unused';
var all = DATA.unused.slice();
var filtered = all.slice();
var selected = {};
var sortMode = 'name';
var searchQ = '';
var PAGE = 80;
var rendered = 0;

function switchTab(t, btn) {
  tab = t;
  all = DATA[t].slice();
  selected = {};
  searchQ = '';
  document.querySelector('.search').value = '';
  document.querySelectorAll('.tab').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  applyFilter();
}

function onSearch(v) { searchQ = v.toLowerCase(); applyFilter(); }
function onSort(v) { sortMode = v; applyFilter(); }

function applyFilter() {
  filtered = all.filter(function(f) { return f.fname.toLowerCase().indexOf(searchQ) >= 0; });
  if (sortMode === 'name') filtered.sort(function(a,b){ return a.fname.localeCompare(b.fname); });
  else if (sortMode === 'size-desc') filtered.sort(function(a,b){ return b.size-a.size; });
  else if (sortMode === 'size-asc') filtered.sort(function(a,b){ return a.size-b.size; });
  else if (sortMode === 'date-desc') filtered.sort(function(a,b){ return new Date(b.createdAt||0)-new Date(a.createdAt||0); });
  else if (sortMode === 'date-asc') filtered.sort(function(a,b){ return new Date(a.createdAt||0)-new Date(b.createdAt||0); });
  rendered = 0;
  document.getElementById('grid').innerHTML = '';
  document.getElementById('countEl').textContent = filtered.length + ' images';
  renderMore();
  updateBar();
}

function fmt(b) {
  if (!b) return '0 B';
  var s=['B','KB','MB','GB'], i=Math.floor(Math.log(b)/Math.log(1024));
  return (b/Math.pow(1024,i)).toFixed(2)+' '+s[i];
}

function badge(status) {
  var map = { orphaned:'b-orphan:Orphaned', soft_deleted_in_db:'b-deleted:Soft Deleted', no_db_record:'b-noDb:No DB Record', used:'b-used:Used' };
  var v = map[status] || 'b-noDb:'+status;
  var parts = v.split(':');
  return '<span class="badge '+parts[0]+'">'+parts[1]+'</span>';
}

function renderMore() {
  var grid = document.getElementById('grid');
  if (filtered.length === 0) {
    grid.innerHTML = '<div class="empty">No images found</div>';
    return;
  }
  var end = Math.min(rendered + PAGE, filtered.length);
  var frag = document.createDocumentFragment();
  for (var i = rendered; i < end; i++) {
    var f = filtered[i];
    var div = document.createElement('div');
    div.className = 'card' + (selected[f.fname] ? ' selected' : '');
    div.dataset.fname = f.fname;
    div.dataset.idx = String(i);
    var imgHtml = '<img src="/img/' + encodeURIComponent(f.fname) + '" loading="lazy" onerror="this.style.display=\'none\'" />';
    var date = f.createdAt ? new Date(f.createdAt).toLocaleDateString() : '';
    div.innerHTML = imgHtml +
      '<div class="card-body">' +
        '<div class="fname"><input type="checkbox" class="cb" ' + (selected[f.fname]?'checked':'') + ' onclick="event.stopPropagation();toggle(event,\''+encodeURIComponent(f.fname)+'\')" /> ' + f.fname + '</div>' +
        '<div class="meta"><span class="size">'+fmt(f.size)+'</span>'+badge(f.status)+'</div>' +
        (date ? '<div class="date">'+date+'</div>' : '') +
      '</div>';
    div.onclick = function(e) {
      if (e.target.type === 'checkbox') return;
      var fn = decodeURIComponent(this.dataset.fname);
      toggleByName(fn);
    };
    frag.appendChild(div);
  }
  grid.appendChild(frag);
  rendered = end;

  if (rendered < filtered.length) {
    var more = document.createElement('button');
    more.className = 'btn';
    more.style.cssText = 'grid-column:1/-1;margin:10px auto;display:block;padding:12px 32px';
    more.textContent = 'Load more (' + (filtered.length - rendered) + ' remaining)';
    more.onclick = function() { this.remove(); renderMore(); };
    grid.appendChild(more);
  }
}

function toggle(e, encFname) {
  var fname = decodeURIComponent(encFname);
  toggleByName(fname);
}

function toggleByName(fname) {
  if (selected[fname]) delete selected[fname];
  else selected[fname] = true;
  var cards = document.querySelectorAll('.card');
  cards.forEach(function(c) {
    if (decodeURIComponent(c.dataset.fname) === fname) {
      c.classList.toggle('selected', !!selected[fname]);
      var cb = c.querySelector('.cb');
      if (cb) cb.checked = !!selected[fname];
    }
  });
  updateBar();
}

function selectAllVisible() {
  filtered.slice(0, rendered).forEach(function(f) { selected[f.fname] = true; });
  document.querySelectorAll('.card').forEach(function(c) {
    c.classList.add('selected');
    var cb = c.querySelector('.cb'); if (cb) cb.checked = true;
  });
  updateBar();
}

function clearSel() {
  selected = {};
  document.querySelectorAll('.card').forEach(function(c) {
    c.classList.remove('selected');
    var cb = c.querySelector('.cb'); if (cb) cb.checked = false;
  });
  updateBar();
}

function updateBar() {
  var cnt = Object.keys(selected).length;
  document.getElementById('selCount').textContent = cnt + ' selected';
  document.getElementById('actionBar').classList.toggle('show', cnt > 0);
}

function exportList() {
  var selFiles = filtered.filter(function(f) { return selected[f.fname]; });
  var totalSize = selFiles.reduce(function(s,f){ return s+(f.size||0); }, 0);
  var lines = [
    '# JUNOONI — Images Selected for Deletion',
    '# Generated: ' + new Date().toISOString(),
    '# Count: ' + selFiles.length + ' files (' + fmt(totalSize) + ')',
    '# Format: filePath | size | status | dbId',
    ''
  ].concat(selFiles.map(function(f) {
    return f.filePath + '\\t' + fmt(f.size) + '\\t' + f.status + '\\t' + (f.dbId||'');
  }));
  var blob = new Blob([lines.join('\\n')], {type:'text/plain'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'images-to-delete.txt';
  a.click();
}

// Init
applyFilter();
</script>
</body>
</html>`

  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
  res.end(html)
}

// ── Start server ───────────────────────────────────────────────
const report = loadReport()
console.log("\n🖼️  JUNOONI Image Audit Server")
console.log(`   Loaded report: ${report.summary?.totalFiles || '?'} files`)
console.log(`   Unused: ${(report.unusedFiles?.length||0) + (report.noDbFiles?.length||0)}`)
console.log(`   Reclaimable: ${report.summary?.reclaimable || '?'}\n`)

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || "/")
  const pathname = parsed.pathname || "/"

  if (pathname === "/" || pathname === "/index.html") {
    serveHtml(res, report)
  } else if (pathname.startsWith("/img/")) {
    const fname = decodeURIComponent(pathname.replace("/img/", ""))
    serveImage(res, fname)
  } else {
    res.writeHead(404); res.end()
  }
})

server.listen(PORT, () => {
  console.log(`✅ Open in browser → http://localhost:${PORT}`)
  console.log("   Press Ctrl+C to stop\n")
})
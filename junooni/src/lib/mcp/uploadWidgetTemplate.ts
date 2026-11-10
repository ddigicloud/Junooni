// src/lib/mcp/uploadWidgetTemplate.ts
// HTML template for the MCP artwork upload widget.
// create_upload_session substitutes UPLOAD_URL_PLACEHOLDER with the real endpoint
// and returns the finished HTML so Claude can publish it as an Artifact immediately.

export const UPLOAD_WIDGET_TEMPLATE = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>Upload Artwork</title>
<style>
:root{--bg:#0f0f0f;--surface:#1a1a1a;--border:#2e2e2e;--accent:#7c5cfc;--accent2:#a97cf8;--text:#f0f0f0;--muted:#888;--success:#22c55e;--error:#ef4444}
@media(prefers-color-scheme:light){:root{--bg:#f5f5f5;--surface:#fff;--border:#e0e0e0;--text:#111;--muted:#666}}
*{box-sizing:border-box;margin:0;padding:0}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px 24px;max-width:420px;width:100%;text-align:center}
.logo{font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--accent2);margin-bottom:24px}
h1{font-size:22px;font-weight:700;margin-bottom:8px;line-height:1.3}
.subtitle{font-size:14px;color:var(--muted);margin-bottom:32px}
.drop-zone{border:2px dashed var(--border);border-radius:14px;padding:32px 16px;cursor:pointer;transition:border-color .2s,background .2s;margin-bottom:20px}
.drop-zone:hover,.drop-zone.drag-over{border-color:var(--accent);background:rgba(124,92,252,.06)}
.drop-zone-icon{font-size:40px;margin-bottom:12px}
.drop-zone-text{font-size:15px;font-weight:600;margin-bottom:4px}
.drop-zone-sub{font-size:13px;color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;padding:15px 24px;border-radius:12px;border:none;font-size:15px;font-weight:700;cursor:pointer;transition:opacity .15s,transform .1s}
.btn:active{transform:scale(.97)}
.btn-primary{background:linear-gradient(135deg,var(--accent),var(--accent2));color:#fff}
.btn-primary:disabled{opacity:.5;cursor:not-allowed}
.preview-wrap{display:none;margin-bottom:20px}
.preview-wrap img{width:100%;max-height:220px;object-fit:contain;border-radius:12px;background:#000}
.preview-name{font-size:13px;color:var(--muted);margin-top:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.preview-change{display:inline-block;margin-top:6px;font-size:13px;color:var(--accent2);cursor:pointer;text-decoration:underline}
.progress-wrap{display:none;margin-bottom:20px}
.progress-bar-bg{height:6px;border-radius:999px;background:var(--border);overflow:hidden}
.progress-bar-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,var(--accent),var(--accent2));width:0%;transition:width .3s ease}
.progress-label{font-size:13px;color:var(--muted);margin-top:8px}
.success-state{display:none;padding:20px 0}
.success-icon{font-size:52px;margin-bottom:12px}
.success-title{font-size:20px;font-weight:700;color:var(--success);margin-bottom:6px}
.success-sub{font-size:14px;color:var(--muted);line-height:1.5}
.error-msg{display:none;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:10px;padding:12px 16px;font-size:14px;color:var(--error);margin-bottom:16px;text-align:left}
</style>
</head>
<body>
<div class="card">
  <div class="logo">JUNOONI</div>
  <div id="initState">
    <h1>Upload Your Design</h1>
    <p class="subtitle">Pick an image from your gallery to get started</p>
    <div class="drop-zone" id="dropZone" onclick="fileInput.click()">
      <div class="drop-zone-icon">🖼️</div>
      <div class="drop-zone-text">Tap to choose image</div>
      <div class="drop-zone-sub">PNG, JPG, WebP · up to 20 MB</div>
    </div>
    <div id="errorMsg" class="error-msg"></div>
    <div id="previewWrap" class="preview-wrap">
      <img id="previewImg" src="" alt="Preview">
      <div id="previewName" class="preview-name"></div>
      <span class="preview-change" onclick="fileInput.click()">Choose a different image</span>
    </div>
    <div id="progressWrap" class="progress-wrap">
      <div class="progress-bar-bg"><div id="progressFill" class="progress-bar-fill"></div></div>
      <div id="progressLabel" class="progress-label">Uploading…</div>
    </div>
    <button id="uploadBtn" class="btn btn-primary" onclick="startUpload()" disabled>⬆️ Upload Design</button>
  </div>
  <div id="successState" class="success-state">
    <div class="success-icon">✅</div>
    <div class="success-title">Design Uploaded!</div>
    <div class="success-sub">Your design is ready.<br>Go back to Claude and say <strong>"done"</strong>.</div>
  </div>
</div>
<input type="file" id="fileInput" accept="image/*" style="display:none" onchange="onFileSelect(this)">
<script>
const UPLOAD_URL="UPLOAD_URL_PLACEHOLDER"
let selectedFile=null
function onFileSelect(input){
  const file=input.files[0]
  if(!file)return
  if(file.size>20*1024*1024){showError("File is too large. Please choose an image under 20 MB.");return}
  selectedFile=file;hideError()
  const reader=new FileReader()
  reader.onload=e=>{
    document.getElementById("previewImg").src=e.target.result
    document.getElementById("previewName").textContent=file.name
    document.getElementById("previewWrap").style.display="block"
    document.getElementById("dropZone").style.display="none"
  }
  reader.readAsDataURL(file)
  document.getElementById("uploadBtn").disabled=false
}
async function startUpload(){
  if(!selectedFile)return
  document.getElementById("uploadBtn").disabled=true
  document.getElementById("progressWrap").style.display="block"
  setProgress(10,"Preparing…")
  try{
    const formData=new FormData()
    formData.append("file",selectedFile)
    setProgress(30,"Uploading…")
    const resp=await fetch(UPLOAD_URL,{method:"POST",body:formData})
    setProgress(80,"Processing…")
    let data;try{data=await resp.json()}catch{data={}}
    if(!resp.ok||data.ok===false)throw new Error(data.error||"Upload failed ("+resp.status+")")
    setProgress(100,"Done!")
    await new Promise(r=>setTimeout(r,400))
    showSuccess()
  }catch(err){
    showError(err.message||"Upload failed. Please try again.")
    document.getElementById("progressWrap").style.display="none"
    document.getElementById("uploadBtn").disabled=false
  }
}
function setProgress(pct,label){document.getElementById("progressFill").style.width=pct+"%";document.getElementById("progressLabel").textContent=label}
function showSuccess(){document.getElementById("initState").style.display="none";document.getElementById("successState").style.display="block"}
function showError(msg){const el=document.getElementById("errorMsg");el.textContent="⚠️ "+msg;el.style.display="block"}
function hideError(){document.getElementById("errorMsg").style.display="none"}
const dropZone=document.getElementById("dropZone")
dropZone.addEventListener("dragover",e=>{e.preventDefault();dropZone.classList.add("drag-over")})
dropZone.addEventListener("dragleave",()=>dropZone.classList.remove("drag-over"))
dropZone.addEventListener("drop",e=>{
  e.preventDefault();dropZone.classList.remove("drag-over")
  const file=e.dataTransfer?.files?.[0]
  if(file){const dt=new DataTransfer();dt.items.add(file);fileInput.files=dt.files;onFileSelect(fileInput)}
})
</script>
</body>
</html>`
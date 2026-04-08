/**
 * JUNOONI — Find Unused Images (Medusa v2)
 * ─────────────────────────────────────────────────
 * READ-ONLY. Does NOT delete anything.
 *
 * Usage:
 *   npx medusa exec src/scripts/junooni-find-unused-images.ts
 */

import fs from "fs"
import path from "path"

// ── Uploads folder — Medusa stores files in /static ──────────
const UPLOADS_CANDIDATES = [
  path.resolve(process.cwd(), "./static"),
  path.resolve(process.cwd(), "../static"),
  "C:\\junooni-github\\junooni\\junooni\\static",
  "C:\\junooni-github\\junooni\\static",
]

// ─────────────────────────────────────────────────────────────

export default async function findUnusedImages({ container }: { container: any }) {
  console.log("\n╔══════════════════════════════════════════════╗")
  console.log("║   JUNOONI — Unused Image Finder (Read-Only) ║")
  console.log("╚══════════════════════════════════════════════╝\n")

  // ── Get DB query function ──────────────────────────────────
  // Medusa v2 uses different internal service names — try all
  let query: (sql: string) => Promise<any[]>

  const tryResolve = (name: string) => {
    try { return container.resolve(name) } catch { return null }
  }

  const pgConn = tryResolve("__pg_connection__") || tryResolve("db_connection") || tryResolve("knex")
  if (pgConn && typeof pgConn.raw === "function") {
    query = async (sql: string) => {
      const r = await pgConn.raw(sql)
      return r.rows ?? (Array.isArray(r[0]) ? r[0] : r)
    }
    console.log("✅ DB connected via knex/pg\n")
  } else {
    // Fallback: direct pg via DATABASE_URL
    console.log("ℹ️  Falling back to direct pg via DATABASE_URL...")
    const { default: pg } = await import("pg")
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      console.error("❌ DATABASE_URL not found in environment.")
      console.error("   Make sure your .env has DATABASE_URL set.")
      return
    }
    const client = new pg.Client({ connectionString: dbUrl })
    await client.connect()
    query = async (sql: string) => {
      const res = await client.query(sql)
      return res.rows
    }
    console.log("✅ DB connected via DATABASE_URL\n")
  }

  // ── Find uploads folder ────────────────────────────────────
  let uploadsDir = ""
  for (const candidate of UPLOADS_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      uploadsDir = candidate
      break
    }
  }

  if (!uploadsDir) {
    console.error("❌ Could not find uploads folder. Tried:")
    UPLOADS_CANDIDATES.forEach(c => console.error("   ", c))
    console.error("\n   Edit UPLOADS_CANDIDATES at the top of this script.")
    return
  }

  // ── Scan uploads folder ────────────────────────────────────
  console.log(`📁 Uploads folder: ${uploadsDir}`)
  const allFiles = getAllFiles(uploadsDir)
  const totalSize = allFiles.reduce((s, f) => s + fileSize(f), 0)
  console.log(`   Found ${allFiles.length} files  (${formatBytes(totalSize)})\n`)

  if (allFiles.length === 0) {
    console.log("⚠️  No files found in uploads folder.")
    return
  }

  // ── Get all image records from DB ──────────────────────────
  console.log("🗄️  Fetching image records from database...")
  let dbImages: any[] = []
  try {
    dbImages = await query(`SELECT id, url, created_at, deleted_at FROM image ORDER BY created_at DESC`)
    console.log(`   Found ${dbImages.length} records in image table\n`)
  } catch (err: any) {
    console.error("❌ Failed to query image table:", err.message)
    return
  }

  // ── Collect referenced image IDs ───────────────────────────
  console.log("🔗 Checking product references...")
  const referencedIds = new Set<string>()

  for (const { table, col } of [
    { table: "product_image",         col: "image_id" },
    { table: "product_variant_image", col: "image_id" },
  ]) {
    try {
      const rows = await query(`SELECT DISTINCT ${col} FROM ${table} WHERE ${col} IS NOT NULL`)
      rows.forEach((r: any) => referencedIds.add(r[col]))
      console.log(`   ${table}: ${rows.length} references`)
    } catch (err: any) {
      console.warn(`   ⚠️  Skipped ${table}: ${err.message}`)
    }
  }

  // ── Collect thumbnail URLs ─────────────────────────────────
  const referencedUrls = new Set<string>()
  for (const { table, col } of [
    { table: "product",            col: "thumbnail" },
    { table: "product_collection", col: "thumbnail" },
    { table: "product_category",   col: "image_url" },
  ]) {
    try {
      const rows = await query(`SELECT DISTINCT ${col} FROM ${table} WHERE ${col} IS NOT NULL AND ${col} != ''`)
      rows.forEach((r: any) => { if (r[col]) referencedUrls.add(r[col]) })
    } catch (_) {}
  }

  // Add URLs from referenced image records
  dbImages
    .filter(img => referencedIds.has(img.id))
    .forEach(img => { if (img.url) referencedUrls.add(img.url) })

  console.log(`   Referenced IDs: ${referencedIds.size}`)
  console.log(`   Referenced URLs (incl. thumbnails): ${referencedUrls.size}\n`)

  // ── Build filename → DB map ────────────────────────────────
  const dbFileMap = new Map<string, any>()
  for (const img of dbImages) {
    const fname = path.basename((img.url || "").split("?")[0])
    if (fname) dbFileMap.set(fname, img)
  }

  // ── Classify every file on disk ────────────────────────────
  const usedFiles:   any[] = []
  const unusedFiles: any[] = []
  const noDbRecord:  any[] = []

  for (const filePath of allFiles) {
    const fname = path.basename(filePath)
    const size  = fileSize(filePath)
    const dbImg = dbFileMap.get(fname)

    if (!dbImg) {
      noDbRecord.push({ filePath, fname, size })
      continue
    }

    const isReferenced  = referencedIds.has(dbImg.id) || referencedUrls.has(dbImg.url)
    const isSoftDeleted = !!dbImg.deleted_at

    if (isReferenced && !isSoftDeleted) {
      usedFiles.push({ filePath, fname, size, dbId: dbImg.id })
    } else {
      unusedFiles.push({
        filePath, fname, size,
        dbId: dbImg.id,
        url: dbImg.url,
        createdAt: dbImg.created_at,
        reason: isSoftDeleted ? "soft_deleted_in_db" : "orphaned_not_linked",
      })
    }
  }

  // ── Print summary ──────────────────────────────────────────
  const unusedSize  = unusedFiles.reduce((s, f) => s + f.size, 0)
  const noDbSize    = noDbRecord.reduce((s, f) => s + f.size, 0)
  const reclaimable = unusedSize + noDbSize

  console.log("═══════════════════════════════════════════════")
  console.log("📊  RESULTS")
  console.log("═══════════════════════════════════════════════")
  console.log(`Total files on disk  : ${allFiles.length}  (${formatBytes(totalSize)})`)
  console.log(`✅  USED             : ${usedFiles.length} files`)
  console.log(`❌  UNUSED (orphaned): ${unusedFiles.length} files  (${formatBytes(unusedSize)})`)
  console.log(`❓  NO DB RECORD     : ${noDbRecord.length} files  (${formatBytes(noDbSize)})`)
  console.log(`─────────────────────────────────────────────`)
  console.log(`💾  Total reclaimable: ${formatBytes(reclaimable)}`)
  console.log("═══════════════════════════════════════════════\n")

  if (unusedFiles.length > 0) {
    console.log("❌  UNUSED FILES (orphaned — not linked to any product):")
    console.log("─────────────────────────────────────────────")
    unusedFiles.forEach((f, i) => {
      console.log(`${String(i + 1).padStart(3)}. ${f.fname}`)
      console.log(`     Size   : ${formatBytes(f.size)}`)
      console.log(`     DB ID  : ${f.dbId}`)
      console.log(`     Reason : ${f.reason}`)
      console.log(`     Created: ${f.createdAt ? new Date(f.createdAt).toLocaleDateString() : "unknown"}`)
      console.log()
    })
  }

  if (noDbRecord.length > 0) {
    console.log(`❓  NO DB RECORD (${noDbRecord.length} files — on disk, not in DB):`)
    console.log("─────────────────────────────────────────────")
    noDbRecord.forEach((f, i) => {
      console.log(`${String(i + 1).padStart(3)}. ${f.fname}  [${formatBytes(f.size)}]`)
    })
    console.log()
  }

  // ── Save report ────────────────────────────────────────────
  const report = {
    generatedAt: new Date().toISOString(),
    uploadsDir,
    summary: {
      totalFiles: allFiles.length,
      totalSize: formatBytes(totalSize),
      usedFiles: usedFiles.length,
      unusedFiles: unusedFiles.length,
      noDbRecord: noDbRecord.length,
      reclaimable: formatBytes(reclaimable),
    },
    unusedFiles,
    noDbRecord,
    usedFiles,
  }

  fs.writeFileSync("image-audit-report.json", JSON.stringify(report, null, 2))
  console.log("📝 Full report  → image-audit-report.json")

  const lines = [
    `# JUNOONI Unused Images — ${new Date().toISOString()}`,
    `# Uploads: ${uploadsDir}`,
    `# Reclaimable: ${formatBytes(reclaimable)}`,
    "",
    "# ORPHANED (in DB, not linked to any product)",
    ...unusedFiles.map(f => `${f.filePath}\t${formatBytes(f.size)}\torphan\t${f.dbId}`),
    "",
    "# NO DB RECORD (on disk only)",
    ...noDbRecord.map(f => `${f.filePath}\t${formatBytes(f.size)}\tno_db_record\t`),
  ]
  fs.writeFileSync("unused-images-list.txt", lines.join("\n"))
  console.log("📋 Unused list  → unused-images-list.txt")
  console.log("\n✅ Done! No data was modified.\n")
}

// ── Helpers ───────────────────────────────────────────────────

function getAllFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...getAllFiles(fullPath))
    else results.push(fullPath)
  }
  return results
}

function fileSize(p: string): number {
  try { return fs.statSync(p).size } catch { return 0 }
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B"
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}
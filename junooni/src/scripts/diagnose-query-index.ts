// // src/scripts/diagnose-slow-statements.ts
// // Run: npx medusa exec src/scripts/diagnose-slow-statements.ts

// import pg from "pg"

// export default async function diagnoseSlowStatements() {
//   const dbUrl = process.env.DATABASE_URL
//   if (!dbUrl) throw new Error("DATABASE_URL not found")

//   const client = new pg.Client({ connectionString: dbUrl })
//   await client.connect()

//   try {
//     // Check if pg_stat_statements is available
//     const ext = await client.query(`
//       SELECT * FROM pg_extension WHERE extname = 'pg_stat_statements'
//     `)

//     if (ext.rows.length === 0) {
//       console.log("pg_stat_statements extension not installed.")
//       console.log("Trying to create it...")
//       try {
//         await client.query(`CREATE EXTENSION IF NOT EXISTS pg_stat_statements`)
//         console.log("✓ Created pg_stat_statements")
//       } catch (err: any) {
//         console.log(`✗ Could not create: ${err.message}`)
//         console.log("(may require superuser / shared_preload_libraries config — skip to alternative below)")
//         return
//       }
//     }

//     console.log("\n=== Top 20 slowest queries by total time (touching product/index tables) ===")
//     const r = await client.query(`
//       SELECT
//         calls,
//         round(total_exec_time::numeric, 2) AS total_ms,
//         round(mean_exec_time::numeric, 2) AS mean_ms,
//         round(max_exec_time::numeric, 2) AS max_ms,
//         left(query, 300) AS query
//       FROM pg_stat_statements
//       WHERE query ILIKE '%product%' OR query ILIKE '%index_data%' OR query ILIKE '%index_relation%'
//       ORDER BY max_exec_time DESC
//       LIMIT 20
//     `)
//     for (const row of r.rows) {
//       console.log(`calls=${row.calls} total_ms=${row.total_ms} mean_ms=${row.mean_ms} max_ms=${row.max_ms}`)
//       console.log(`  ${row.query}`)
//       console.log("")
//     }
//   } finally {
//     await client.end()
//   }
// }

// src/scripts/diagnose-published-fanout.ts
// Run: npx medusa exec src/scripts/diagnose-published-fanout.ts

import pg from "pg"

const CREATOR_STORE_SC = "sc_01KMAP3HD1EVDF9FT7EHHHV8HP"
const VENDOR_ID = "01KJ50176GDA5B0W7228VZNSR8"

export default async function diagnosePublishedFanout() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) throw new Error("DATABASE_URL not found")

  const client = new pg.Client({ connectionString: dbUrl })
  await client.connect()

  try {
    const r = await client.query(`
      SELECT
        p.id,
        p.title,
        p.status,
        (SELECT count(*) FROM product_variant pv WHERE pv.product_id = p.id AND pv.deleted_at IS NULL) AS variants,
        (SELECT count(*) FROM image i WHERE i.product_id = p.id AND i.deleted_at IS NULL) AS images,
        (SELECT count(*) FROM product_option po WHERE po.product_id = p.id AND po.deleted_at IS NULL) AS options,
        (SELECT count(*) FROM product_option_value pov
           JOIN product_option po2 ON pov.option_id = po2.id
           WHERE po2.product_id = p.id AND pov.deleted_at IS NULL) AS option_values,
        (SELECT count(*) FROM product_category_product pcp WHERE pcp.product_id = p.id) AS categories
      FROM product p
      WHERE p.deleted_at IS NULL
        AND p.status = 'published'
        AND p.id IN (
          SELECT product_id FROM product_sales_channel WHERE sales_channel_id = $1
        )
      ORDER BY p.created_at DESC
    `, [CREATOR_STORE_SC])

    console.log(`\nFound ${r.rows.length} published products in sales channel ${CREATOR_STORE_SC}:\n`)
    for (const row of r.rows) {
      const fanout = row.variants * Math.max(row.images, 1) * Math.max(row.option_values, 1) * Math.max(row.categories, 1)
      console.log(`${row.id} | ${row.title} | status=${row.status} | v=${row.variants} i=${row.images} o=${row.options} ov=${row.option_values} c=${row.categories} -> fanout~${fanout}`)
    }
  } finally {
    await client.end()
  }
}
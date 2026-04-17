import { ExecArgs } from "@medusajs/framework/types"

export default async function checkColumns({ container }: ExecArgs) {
  const db = container.resolve("__pg_connection__") as any

  const result = await db.raw(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'post'
    ORDER BY ordinal_position;
  `)

  console.log("\n=== COLUMNS IN 'post' TABLE ===")
  for (const row of result.rows) {
    console.log(`  ${row.column_name.padEnd(25)} ${row.data_type} (nullable: ${row.is_nullable})`)
  }
}
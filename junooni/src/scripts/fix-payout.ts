import { Pool } from 'pg'

export default async function fix() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  const client = await pool.connect()
  try {
    console.log('Adding missing columns to payout table...')
    await client.query(`
      ALTER TABLE "payout" 
        ADD COLUMN IF NOT EXISTS "raw_payout_total" jsonb null,
        ADD COLUMN IF NOT EXISTS "raw_current_balance" jsonb null,
        ADD COLUMN IF NOT EXISTS "raw_pending_balance" jsonb null,
        ADD COLUMN IF NOT EXISTS "raw_total_earned" jsonb null,
        ADD COLUMN IF NOT EXISTS "raw_total_paid" jsonb null,
        ADD COLUMN IF NOT EXISTS "raw_total_pending_payout" jsonb null
    `)
    console.log('✅ payout table fixed.')

    console.log('Adding missing columns to payout_details table...')
    await client.query(`
      ALTER TABLE "payout_details"
        ADD COLUMN IF NOT EXISTS "raw_amount" jsonb null,
        ADD COLUMN IF NOT EXISTS "raw_tax_amount" jsonb null,
        ADD COLUMN IF NOT EXISTS "raw_tds_percentage" jsonb null,
        ADD COLUMN IF NOT EXISTS "raw_tds_amount" jsonb null,
        ADD COLUMN IF NOT EXISTS "raw_cost_price" jsonb null,
        ADD COLUMN IF NOT EXISTS "raw_commission_rate" jsonb null,
        ADD COLUMN IF NOT EXISTS "raw_selling_price" jsonb null
    `)
    console.log('✅ payout_details table fixed.')

    console.log('🎉 All done!')
  } catch (err) {
    console.error('❌ Error:', err)
  } finally {
    client.release()
    await pool.end()
  }
}
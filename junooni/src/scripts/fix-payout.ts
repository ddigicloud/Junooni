import { Pool } from 'pg'

export default async function fix() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  })

  const client = await pool.connect()
  try {
    // ✅ Check recent payout_details records to see if payout transactions are being saved
    console.log('\n🔍 Recent payout_details records (last 5):')
    const recent = await client.query(`
      SELECT id, type, amount, order_id, payout_id, created_at 
      FROM payout_details 
      ORDER BY created_at DESC 
      LIMIT 5
    `)
    console.table(recent.rows)

    // ✅ Check nullable status of key columns
    console.log('\n🔍 Nullable status of key columns:')
    const nullable = await client.query(`
      SELECT column_name, is_nullable, data_type
      FROM information_schema.columns 
      WHERE table_name = 'payout_details'
      AND column_name IN ('order_id', 'order_item_id', 'product_id', 'payout_id')
      ORDER BY column_name
    `)
    console.table(nullable.rows)

    // ✅ Drop NOT NULL constraints on order_id, order_item_id, product_id
    console.log('\n🔧 Dropping NOT NULL constraints on order_id, order_item_id, product_id...')
    await client.query(`
      ALTER TABLE "payout_details"
        ALTER COLUMN "order_id" DROP NOT NULL,
        ALTER COLUMN "order_item_id" DROP NOT NULL,
        ALTER COLUMN "product_id" DROP NOT NULL
    `)
    console.log('✅ Nullable constraints fixed.')

    // Check current column types
    const result = await client.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'payout_details'
      AND column_name IN ('amount', 'tax_amount', 'tds_amount', 'cost_price', 'selling_price', 'commission_rate', 'tds_percentage')
      ORDER BY column_name
    `)
    console.log('\n📊 Current payout_details column types:')
    console.table(result.rows)

    const result2 = await client.query(`
      SELECT column_name, data_type, numeric_precision, numeric_scale
      FROM information_schema.columns 
      WHERE table_name = 'payout'
      AND column_name IN ('current_balance', 'total_earned', 'total_paid', 'avg_order_value', 'payout_total')
      ORDER BY column_name
    `)
    console.log('📊 Current payout column types:')
    console.table(result2.rows)

    // Fix: alter all decimal columns to double precision (float8)
    console.log('\n🔧 Altering payout_details columns to double precision...')
    await client.query(`
      ALTER TABLE "payout_details"
        ALTER COLUMN "amount" TYPE double precision,
        ALTER COLUMN "tax_amount" TYPE double precision,
        ALTER COLUMN "tds_percentage" TYPE double precision,
        ALTER COLUMN "tds_amount" TYPE double precision,
        ALTER COLUMN "cost_price" TYPE double precision,
        ALTER COLUMN "commission_rate" TYPE double precision,
        ALTER COLUMN "selling_price" TYPE double precision
    `)
    console.log('✅ payout_details columns fixed.')

    console.log('\n🔧 Altering payout columns to double precision...')
    await client.query(`
      ALTER TABLE "payout"
        ALTER COLUMN "payout_total" TYPE double precision,
        ALTER COLUMN "current_balance" TYPE double precision,
        ALTER COLUMN "pending_balance" TYPE double precision,
        ALTER COLUMN "total_earned" TYPE double precision,
        ALTER COLUMN "total_paid" TYPE double precision,
        ALTER COLUMN "total_pending_payout" TYPE double precision,
        ALTER COLUMN "avg_order_value" TYPE double precision
    `)
    console.log('✅ payout columns fixed.')

    // Drop raw_* columns that are no longer needed
    console.log('\n🔧 Dropping raw_* columns...')
    await client.query(`
      ALTER TABLE "payout_details"
        DROP COLUMN IF EXISTS "raw_amount",
        DROP COLUMN IF EXISTS "raw_tax_amount",
        DROP COLUMN IF EXISTS "raw_tds_percentage",
        DROP COLUMN IF EXISTS "raw_tds_amount",
        DROP COLUMN IF EXISTS "raw_cost_price",
        DROP COLUMN IF EXISTS "raw_commission_rate",
        DROP COLUMN IF EXISTS "raw_selling_price"
    `)
    await client.query(`
      ALTER TABLE "payout"
        DROP COLUMN IF EXISTS "raw_payout_total",
        DROP COLUMN IF EXISTS "raw_current_balance",
        DROP COLUMN IF EXISTS "raw_pending_balance",
        DROP COLUMN IF EXISTS "raw_total_earned",
        DROP COLUMN IF EXISTS "raw_total_paid",
        DROP COLUMN IF EXISTS "raw_total_pending_payout",
        DROP COLUMN IF EXISTS "raw_avg_order_value"
    `)
    console.log('✅ raw_* columns dropped.')

    // ✅ Verify nullable fix worked
    console.log('\n✅ Verifying nullable fix:')
    const verifyNullable = await client.query(`
      SELECT column_name, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'payout_details'
      AND column_name IN ('order_id', 'order_item_id', 'product_id')
      ORDER BY column_name
    `)
    console.table(verifyNullable.rows)

    console.log('\n🎉 All done! Restart the server and try recording a manual payout again.')
  } catch (err) {
    console.error('❌ Error:', err)
  } finally {
    client.release()
    await pool.end()
  }
}
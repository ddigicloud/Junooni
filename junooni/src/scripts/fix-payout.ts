import { Pool } from 'pg'

export default async function fix() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const client = await pool.connect()

  try {
    console.log('\n🔍 Current payout_details records (last 5):')
    const recent = await client.query(`
      SELECT id, type, amount, order_id, payout_id, created_at 
      FROM payout_details ORDER BY created_at DESC LIMIT 5
    `)
    console.table(recent.rows)

    console.log('\n🔍 Current column types:')
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'payout_details'
      AND column_name IN ('amount','tax_amount','tds_amount','cost_price','selling_price','commission_rate','tds_percentage','order_id','order_item_id','product_id','payout_id')
      ORDER BY column_name
    `)
    console.table(cols.rows)

    // ─── Step 1: Make order_id, order_item_id, product_id nullable ───────────
    console.log('\n🔧 Dropping NOT NULL constraints...')
    await client.query(`
      ALTER TABLE "payout_details"
        ALTER COLUMN "order_id" DROP NOT NULL,
        ALTER COLUMN "order_item_id" DROP NOT NULL,
        ALTER COLUMN "product_id" DROP NOT NULL
    `)
    console.log('✅ Nullable constraints fixed.')

    // ─── Step 2: Convert existing float data to integer paise ────────────────
    console.log('\n🔧 Converting payout_details money columns: float rupees → integer paise...')
    await client.query(`
      ALTER TABLE "payout_details"
        ALTER COLUMN "amount" TYPE bigint USING ROUND(amount * 100)::bigint,
        ALTER COLUMN "tax_amount" TYPE bigint USING ROUND(tax_amount * 100)::bigint,
        ALTER COLUMN "tds_percentage" TYPE bigint USING ROUND(tds_percentage * 100)::bigint,
        ALTER COLUMN "tds_amount" TYPE bigint USING ROUND(tds_amount * 100)::bigint,
        ALTER COLUMN "cost_price" TYPE bigint USING ROUND(cost_price * 100)::bigint,
        ALTER COLUMN "commission_rate" TYPE bigint USING ROUND(commission_rate * 100)::bigint,
        ALTER COLUMN "selling_price" TYPE bigint USING ROUND(selling_price * 100)::bigint
    `)
    console.log('✅ payout_details money columns converted to paise.')

    console.log('\n🔧 Converting payout balance columns: float rupees → integer paise...')
    await client.query(`
      ALTER TABLE "payout"
        ALTER COLUMN "payout_total" TYPE bigint USING ROUND(COALESCE(payout_total, 0) * 100)::bigint,
        ALTER COLUMN "current_balance" TYPE bigint USING ROUND(COALESCE(current_balance, 0) * 100)::bigint,
        ALTER COLUMN "pending_balance" TYPE bigint USING ROUND(COALESCE(pending_balance, 0) * 100)::bigint,
        ALTER COLUMN "total_earned" TYPE bigint USING ROUND(COALESCE(total_earned, 0) * 100)::bigint,
        ALTER COLUMN "total_paid" TYPE bigint USING ROUND(COALESCE(total_paid, 0) * 100)::bigint,
        ALTER COLUMN "total_pending_payout" TYPE bigint USING ROUND(COALESCE(total_pending_payout, 0) * 100)::bigint,
        ALTER COLUMN "avg_order_value" TYPE bigint USING ROUND(COALESCE(avg_order_value, 0) * 100)::bigint,
        ALTER COLUMN "minimum_payout_amount" TYPE bigint USING ROUND(COALESCE(minimum_payout_amount, 1000) * 100)::bigint
    `)
    console.log('✅ payout balance columns converted to paise.')

    // ─── Step 3: Drop old raw_* float companion columns if still present ─────
    console.log('\n🔧 Dropping raw_* columns if present...')
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
        DROP COLUMN IF EXISTS "raw_avg_order_value",
        DROP COLUMN IF EXISTS "raw_minimum_payout_amount"
    `)
    console.log('✅ raw_* columns dropped.')

    // ─── Step 4: Verify ───────────────────────────────────────────────────────
    console.log('\n✅ Verifying final column types:')
    const verify = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name IN ('payout_details', 'payout')
      AND column_name IN ('amount','current_balance','total_paid','total_earned','order_id','product_id','minimum_payout_amount')
      ORDER BY table_name, column_name
    `)
    console.table(verify.rows)

    console.log('\n✅ Sample data after conversion:')
    const sample = await client.query(`
      SELECT id, type, amount, payout_id FROM payout_details ORDER BY created_at DESC LIMIT 5
    `)
    console.table(sample.rows)

    console.log('\n✅ Payout balances after conversion:')
    const balances = await client.query(`
      SELECT vendor_id, current_balance, total_earned, total_paid, minimum_payout_amount FROM payout LIMIT 5
    `)
    console.table(balances.rows)

    console.log('\n🎉 Migration complete! All money values now stored as integer paise.')
    console.log('   e.g. ₹647.50 is now stored as 64750')
    console.log('   Restart the server after this migration.')

  } catch (err) {
    console.error('❌ Error:', err)
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}
import { Migration } from '@mikro-orm/migrations';

export class Migration20250830032751 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "payout" drop constraint if exists "payout_vendor_id_unique";`);
    this.addSql(`alter table if exists "payout" drop constraint if exists "payout_payout_batch_id_foreign";`);

    this.addSql(`drop index if exists "IDX_PAYOUT_VENDOR_ID";`);
    this.addSql(`drop index if exists "IDX_PAYOUT_ORDER_ID";`);
    this.addSql(`drop index if exists "IDX_payout_payout_batch_id";`);
    this.addSql(`alter table if exists "payout" drop column if exists "order_id", drop column if exists "amount", drop column if exists "type", drop column if exists "status", drop column if exists "reason", drop column if exists "notes", drop column if exists "preferred_payment_method", drop column if exists "payout_batch_id";`);

    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payout_vendor_id_unique" ON "payout" (vendor_id) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "payout_details" add column if not exists "order_id" text not null, add column if not exists "order_item_id" text not null;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PAYOUT_ORDER_ID" ON "payout_details" (order_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PAYOUT_ORDER_ITEM_ID" ON "payout_details" (order_item_id) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_payout_vendor_id_unique";`);

    this.addSql(`alter table if exists "payout" add column if not exists "order_id" text not null, add column if not exists "amount" integer not null, add column if not exists "type" text check ("type" in ('earning', 'payout', 'adjustment', 'refund')) not null, add column if not exists "status" text check ("status" in ('pending', 'processing', 'completed', 'failed', 'cancelled')) not null default 'pending', add column if not exists "reason" text not null, add column if not exists "notes" text null, add column if not exists "preferred_payment_method" text check ("preferred_payment_method" in ('bank_transfer', 'paypal', 'razorpay')) not null default 'bank_transfer', add column if not exists "payout_batch_id" text not null;`);
    this.addSql(`alter table if exists "payout" add constraint "payout_payout_batch_id_foreign" foreign key ("payout_batch_id") references "payout_batch" ("id") on update cascade;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PAYOUT_VENDOR_ID" ON "payout" (vendor_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PAYOUT_ORDER_ID" ON "payout" (order_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payout_payout_batch_id" ON "payout" (payout_batch_id) WHERE deleted_at IS NULL;`);

    this.addSql(`drop index if exists "IDX_PAYOUT_ORDER_ID";`);
    this.addSql(`drop index if exists "IDX_PAYOUT_ORDER_ITEM_ID";`);
    this.addSql(`alter table if exists "payout_details" drop column if exists "order_id", drop column if exists "order_item_id";`);
  }

}

import { Migration } from '@mikro-orm/migrations';

export class Migration20251208113627 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "payout_batch" drop constraint if exists "payout_batch_batch_reference_unique";`);
    this.addSql(`alter table if exists "payout" drop constraint if exists "payout_vendor_id_unique";`);
    this.addSql(`create table if not exists "payout" ("id" text not null, "vendor_id" text not null, "payout_period" text null, "scheduled_payout_date" timestamptz null, "payment_method" text check ("payment_method" in ('bank_transfer', 'paypal', 'razorpay', 'manual')) null, "external_reference_id" text null, "processor_response" text null, "payout_total" numeric null default 0, "current_balance" numeric null default 0, "pending_balance" numeric null default 0, "total_earned" numeric null default 0, "total_paid" numeric null default 0, "total_pending_payout" numeric null default 0, "total_orders" integer not null default 0, "avg_order_value" integer not null default 0, "minimum_payout_amount" integer not null default 1000, "payout_schedule" text check ("payout_schedule" in ('weekly', 'biweekly', 'monthly')) not null default 'biweekly', "last_payout_at" timestamptz null, "last_earning_at" timestamptz null, "next_payout_date" timestamptz null, "is_payout_enabled" boolean not null default true, "hold_payouts" boolean not null default false, "hold_reason" text null, "processed_at" timestamptz null, "created_by" text null, "raw_payout_total" jsonb null, "raw_current_balance" jsonb null, "raw_pending_balance" jsonb null, "raw_total_earned" jsonb null, "raw_total_paid" jsonb null, "raw_total_pending_payout" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payout_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payout_deleted_at" ON "payout" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payout_vendor_id_unique" ON "payout" (vendor_id) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "payout_batch" ("id" text not null, "batch_reference" text not null, "period" text not null, "status" text check ("status" in ('pending', 'processing', 'completed', 'failed', 'partially_failed')) not null default 'pending', "total_vendors" integer not null default 0, "total_amount" integer not null default 0, "successful_payouts" integer not null default 0, "failed_payouts" integer not null default 0, "payment_method" text check ("payment_method" in ('bank_transfer', 'paypal', 'stripe', 'manual')) not null, "processor_batch_id" text null, "processor_response" text null, "scheduled_at" timestamptz not null, "started_at" timestamptz null, "completed_at" timestamptz null, "created_by" text null, "notes" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payout_batch_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_payout_batch_batch_reference_unique" ON "payout_batch" (batch_reference) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payout_batch_deleted_at" ON "payout_batch" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "payout_details" ("id" text not null, "order_id" text not null, "order_item_id" text not null, "product_id" text not null, "amount" numeric not null, "tax_amount" numeric not null default 0, "tds_percentage" numeric not null default 0, "tds_amount" numeric not null default 0, "cost_price" numeric null, "commission_rate" numeric null, "selling_price" numeric null, "type" text check ("type" in ('earning', 'payout', 'adjustment', 'refund')) not null, "fulfillment_type" text check ("fulfillment_type" in ('creator_fulfillment', 'junooni_fulfillment')) null, "tax_type" text check ("tax_type" in ('igst', 'sgst-cgst')) not null default 'igst', "status" text check ("status" in ('pending', 'processing', 'completed', 'failed', 'cancelled')) not null default 'pending', "reason" text not null, "notes" text null, "payout_id" text not null, "raw_amount" jsonb not null, "raw_tax_amount" jsonb not null, "raw_tds_percentage" jsonb not null, "raw_tds_amount" jsonb not null, "raw_cost_price" jsonb null, "raw_commission_rate" jsonb null, "raw_selling_price" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "payout_details_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PAYOUT_ORDER_ID" ON "payout_details" (order_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PAYOUT_ORDER_ITEM_ID" ON "payout_details" (order_item_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_PAYOUT_PRODUCT_ID" ON "payout_details" (product_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payout_details_payout_id" ON "payout_details" (payout_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_payout_details_deleted_at" ON "payout_details" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "payout_details" add constraint "payout_details_payout_id_foreign" foreign key ("payout_id") references "payout" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "payout_details" drop constraint if exists "payout_details_payout_id_foreign";`);

    this.addSql(`drop table if exists "payout" cascade;`);

    this.addSql(`drop table if exists "payout_batch" cascade;`);

    this.addSql(`drop table if exists "payout_details" cascade;`);
  }

}

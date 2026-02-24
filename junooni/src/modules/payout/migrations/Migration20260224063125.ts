import { Migration } from '@mikro-orm/migrations';

export class Migration20260224063125 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "payout" drop column if exists "raw_payout_total", drop column if exists "raw_current_balance", drop column if exists "raw_pending_balance", drop column if exists "raw_total_earned", drop column if exists "raw_total_paid", drop column if exists "raw_total_pending_payout", drop column if exists "raw_avg_order_value";`);

    this.addSql(`alter table if exists "payout" alter column "payout_total" type real using ("payout_total"::real);`);
    this.addSql(`alter table if exists "payout" alter column "current_balance" type real using ("current_balance"::real);`);
    this.addSql(`alter table if exists "payout" alter column "pending_balance" type real using ("pending_balance"::real);`);
    this.addSql(`alter table if exists "payout" alter column "total_earned" type real using ("total_earned"::real);`);
    this.addSql(`alter table if exists "payout" alter column "total_paid" type real using ("total_paid"::real);`);
    this.addSql(`alter table if exists "payout" alter column "total_pending_payout" type real using ("total_pending_payout"::real);`);
    this.addSql(`alter table if exists "payout" alter column "avg_order_value" type real using ("avg_order_value"::real);`);

    this.addSql(`alter table if exists "payout_details" drop column if exists "raw_amount", drop column if exists "raw_tax_amount", drop column if exists "raw_tds_percentage", drop column if exists "raw_tds_amount", drop column if exists "raw_cost_price", drop column if exists "raw_commission_rate", drop column if exists "raw_selling_price";`);

    this.addSql(`alter table if exists "payout_details" alter column "amount" type real using ("amount"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "tax_amount" type real using ("tax_amount"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "tds_percentage" type real using ("tds_percentage"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "tds_amount" type real using ("tds_amount"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "cost_price" type real using ("cost_price"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "commission_rate" type real using ("commission_rate"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "selling_price" type real using ("selling_price"::real);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "payout" add column if not exists "raw_payout_total" jsonb null, add column if not exists "raw_current_balance" jsonb null, add column if not exists "raw_pending_balance" jsonb null, add column if not exists "raw_total_earned" jsonb null, add column if not exists "raw_total_paid" jsonb null, add column if not exists "raw_total_pending_payout" jsonb null, add column if not exists "raw_avg_order_value" jsonb not null;`);
    this.addSql(`alter table if exists "payout" alter column "payout_total" type numeric using ("payout_total"::numeric);`);
    this.addSql(`alter table if exists "payout" alter column "current_balance" type numeric using ("current_balance"::numeric);`);
    this.addSql(`alter table if exists "payout" alter column "pending_balance" type numeric using ("pending_balance"::numeric);`);
    this.addSql(`alter table if exists "payout" alter column "total_earned" type numeric using ("total_earned"::numeric);`);
    this.addSql(`alter table if exists "payout" alter column "total_paid" type numeric using ("total_paid"::numeric);`);
    this.addSql(`alter table if exists "payout" alter column "total_pending_payout" type numeric using ("total_pending_payout"::numeric);`);
    this.addSql(`alter table if exists "payout" alter column "avg_order_value" type numeric using ("avg_order_value"::numeric);`);

    this.addSql(`alter table if exists "payout_details" add column if not exists "raw_amount" jsonb not null, add column if not exists "raw_tax_amount" jsonb not null, add column if not exists "raw_tds_percentage" jsonb not null, add column if not exists "raw_tds_amount" jsonb not null, add column if not exists "raw_cost_price" jsonb null, add column if not exists "raw_commission_rate" jsonb null, add column if not exists "raw_selling_price" jsonb null;`);
    this.addSql(`alter table if exists "payout_details" alter column "amount" type numeric using ("amount"::numeric);`);
    this.addSql(`alter table if exists "payout_details" alter column "tax_amount" type numeric using ("tax_amount"::numeric);`);
    this.addSql(`alter table if exists "payout_details" alter column "tds_percentage" type numeric using ("tds_percentage"::numeric);`);
    this.addSql(`alter table if exists "payout_details" alter column "tds_amount" type numeric using ("tds_amount"::numeric);`);
    this.addSql(`alter table if exists "payout_details" alter column "cost_price" type numeric using ("cost_price"::numeric);`);
    this.addSql(`alter table if exists "payout_details" alter column "commission_rate" type numeric using ("commission_rate"::numeric);`);
    this.addSql(`alter table if exists "payout_details" alter column "selling_price" type numeric using ("selling_price"::numeric);`);
  }

}

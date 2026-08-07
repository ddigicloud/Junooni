// import { Migration } from '@mikro-orm/migrations';

// export class Migration20260225061325 extends Migration {

//   override async up(): Promise<void> {
//     this.addSql(`alter table if exists "payout" alter column "payout_total" type integer using ("payout_total"::integer);`);
//     this.addSql(`alter table if exists "payout" alter column "current_balance" type integer using ("current_balance"::integer);`);
//     this.addSql(`alter table if exists "payout" alter column "current_balance" set not null;`);
//     this.addSql(`alter table if exists "payout" alter column "pending_balance" type integer using ("pending_balance"::integer);`);
//     this.addSql(`alter table if exists "payout" alter column "pending_balance" set not null;`);
//     this.addSql(`alter table if exists "payout" alter column "total_earned" type integer using ("total_earned"::integer);`);
//     this.addSql(`alter table if exists "payout" alter column "total_earned" set not null;`);
//     this.addSql(`alter table if exists "payout" alter column "total_paid" type integer using ("total_paid"::integer);`);
//     this.addSql(`alter table if exists "payout" alter column "total_paid" set not null;`);
//     this.addSql(`alter table if exists "payout" alter column "total_pending_payout" type integer using ("total_pending_payout"::integer);`);
//     this.addSql(`alter table if exists "payout" alter column "total_pending_payout" set not null;`);
//     this.addSql(`alter table if exists "payout" alter column "avg_order_value" type integer using ("avg_order_value"::integer);`);
//     this.addSql(`alter table if exists "payout" alter column "minimum_payout_amount" type integer using ("minimum_payout_amount"::integer);`);
//     this.addSql(`alter table if exists "payout" alter column "minimum_payout_amount" set default 100000;`);

//     this.addSql(`alter table if exists "payout_details" alter column "amount" type integer using ("amount"::integer);`);
//     this.addSql(`alter table if exists "payout_details" alter column "tax_amount" type integer using ("tax_amount"::integer);`);
//     this.addSql(`alter table if exists "payout_details" alter column "tds_percentage" type integer using ("tds_percentage"::integer);`);
//     this.addSql(`alter table if exists "payout_details" alter column "tds_amount" type integer using ("tds_amount"::integer);`);
//     this.addSql(`alter table if exists "payout_details" alter column "cost_price" type integer using ("cost_price"::integer);`);
//     this.addSql(`alter table if exists "payout_details" alter column "commission_rate" type integer using ("commission_rate"::integer);`);
//     this.addSql(`alter table if exists "payout_details" alter column "selling_price" type integer using ("selling_price"::integer);`);
//   }

//   override async down(): Promise<void> {
//     this.addSql(`alter table if exists "payout" alter column "payout_total" type real using ("payout_total"::real);`);
//     this.addSql(`alter table if exists "payout" alter column "current_balance" type real using ("current_balance"::real);`);
//     this.addSql(`alter table if exists "payout" alter column "current_balance" drop not null;`);
//     this.addSql(`alter table if exists "payout" alter column "pending_balance" type real using ("pending_balance"::real);`);
//     this.addSql(`alter table if exists "payout" alter column "pending_balance" drop not null;`);
//     this.addSql(`alter table if exists "payout" alter column "total_earned" type real using ("total_earned"::real);`);
//     this.addSql(`alter table if exists "payout" alter column "total_earned" drop not null;`);
//     this.addSql(`alter table if exists "payout" alter column "total_paid" type real using ("total_paid"::real);`);
//     this.addSql(`alter table if exists "payout" alter column "total_paid" drop not null;`);
//     this.addSql(`alter table if exists "payout" alter column "total_pending_payout" type real using ("total_pending_payout"::real);`);
//     this.addSql(`alter table if exists "payout" alter column "total_pending_payout" drop not null;`);
//     this.addSql(`alter table if exists "payout" alter column "avg_order_value" type real using ("avg_order_value"::real);`);
//     this.addSql(`alter table if exists "payout" alter column "minimum_payout_amount" type integer using ("minimum_payout_amount"::integer);`);
//     this.addSql(`alter table if exists "payout" alter column "minimum_payout_amount" set default 1000;`);

//     this.addSql(`alter table if exists "payout_details" alter column "amount" type real using ("amount"::real);`);
//     this.addSql(`alter table if exists "payout_details" alter column "tax_amount" type real using ("tax_amount"::real);`);
//     this.addSql(`alter table if exists "payout_details" alter column "tds_percentage" type real using ("tds_percentage"::real);`);
//     this.addSql(`alter table if exists "payout_details" alter column "tds_amount" type real using ("tds_amount"::real);`);
//     this.addSql(`alter table if exists "payout_details" alter column "cost_price" type real using ("cost_price"::real);`);
//     this.addSql(`alter table if exists "payout_details" alter column "commission_rate" type real using ("commission_rate"::real);`);
//     this.addSql(`alter table if exists "payout_details" alter column "selling_price" type real using ("selling_price"::real);`);
//   }

// }




import { Migration } from '@mikro-orm/migrations';

export class Migration20260225061325 extends Migration {

  override async up(): Promise<void> {
    // FIX: changed all "integer" to "bigint"
    // PostgreSQL integer max = 2,147,483,647
    // Payout columns store amounts in paisa — large orders exceed this limit
    // bigint max = 9,223,372,036,854,775,807 — safe for any realistic amount
    this.addSql(`alter table if exists "payout" alter column "payout_total" type bigint using ("payout_total"::bigint);`);
    this.addSql(`alter table if exists "payout" alter column "current_balance" type bigint using ("current_balance"::bigint);`);
    this.addSql(`alter table if exists "payout" alter column "current_balance" set not null;`);
    this.addSql(`alter table if exists "payout" alter column "pending_balance" type bigint using ("pending_balance"::bigint);`);
    this.addSql(`alter table if exists "payout" alter column "pending_balance" set not null;`);
    this.addSql(`alter table if exists "payout" alter column "total_earned" type bigint using ("total_earned"::bigint);`);
    this.addSql(`alter table if exists "payout" alter column "total_earned" set not null;`);
    this.addSql(`alter table if exists "payout" alter column "total_paid" type bigint using ("total_paid"::bigint);`);
    this.addSql(`alter table if exists "payout" alter column "total_paid" set not null;`);
    this.addSql(`alter table if exists "payout" alter column "total_pending_payout" type bigint using ("total_pending_payout"::bigint);`);
    this.addSql(`alter table if exists "payout" alter column "total_pending_payout" set not null;`);
    this.addSql(`alter table if exists "payout" alter column "avg_order_value" type bigint using ("avg_order_value"::bigint);`);
    this.addSql(`alter table if exists "payout" alter column "minimum_payout_amount" type bigint using ("minimum_payout_amount"::bigint);`);
    this.addSql(`alter table if exists "payout" alter column "minimum_payout_amount" set default 100000;`);

    this.addSql(`alter table if exists "payout_details" alter column "amount" type bigint using ("amount"::bigint);`);
    this.addSql(`alter table if exists "payout_details" alter column "tax_amount" type bigint using ("tax_amount"::bigint);`);
    this.addSql(`alter table if exists "payout_details" alter column "tds_percentage" type bigint using ("tds_percentage"::bigint);`);
    this.addSql(`alter table if exists "payout_details" alter column "tds_amount" type bigint using ("tds_amount"::bigint);`);
    this.addSql(`alter table if exists "payout_details" alter column "cost_price" type bigint using ("cost_price"::bigint);`);
    this.addSql(`alter table if exists "payout_details" alter column "commission_rate" type bigint using ("commission_rate"::bigint);`);
    this.addSql(`alter table if exists "payout_details" alter column "selling_price" type bigint using ("selling_price"::bigint);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "payout" alter column "payout_total" type real using ("payout_total"::real);`);
    this.addSql(`alter table if exists "payout" alter column "current_balance" type real using ("current_balance"::real);`);
    this.addSql(`alter table if exists "payout" alter column "current_balance" drop not null;`);
    this.addSql(`alter table if exists "payout" alter column "pending_balance" type real using ("pending_balance"::real);`);
    this.addSql(`alter table if exists "payout" alter column "pending_balance" drop not null;`);
    this.addSql(`alter table if exists "payout" alter column "total_earned" type real using ("total_earned"::real);`);
    this.addSql(`alter table if exists "payout" alter column "total_earned" drop not null;`);
    this.addSql(`alter table if exists "payout" alter column "total_paid" type real using ("total_paid"::real);`);
    this.addSql(`alter table if exists "payout" alter column "total_paid" drop not null;`);
    this.addSql(`alter table if exists "payout" alter column "total_pending_payout" type real using ("total_pending_payout"::real);`);
    this.addSql(`alter table if exists "payout" alter column "total_pending_payout" drop not null;`);
    this.addSql(`alter table if exists "payout" alter column "avg_order_value" type real using ("avg_order_value"::real);`);
    this.addSql(`alter table if exists "payout" alter column "minimum_payout_amount" type integer using ("minimum_payout_amount"::integer);`);
    this.addSql(`alter table if exists "payout" alter column "minimum_payout_amount" set default 1000;`);

    this.addSql(`alter table if exists "payout_details" alter column "amount" type real using ("amount"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "tax_amount" type real using ("tax_amount"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "tds_percentage" type real using ("tds_percentage"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "tds_amount" type real using ("tds_amount"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "cost_price" type real using ("cost_price"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "commission_rate" type real using ("commission_rate"::real);`);
    this.addSql(`alter table if exists "payout_details" alter column "selling_price" type real using ("selling_price"::real);`);
  }

}
import { Migration } from '@mikro-orm/migrations';

export class Migration20260223120958 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "payout" add column if not exists "raw_avg_order_value" jsonb null;`);
    this.addSql(`alter table if exists "payout" alter column "avg_order_value" type numeric using ("avg_order_value"::numeric);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "payout" drop column if exists "raw_avg_order_value";`);

    this.addSql(`alter table if exists "payout" alter column "avg_order_value" type integer using ("avg_order_value"::integer);`);
  }

}

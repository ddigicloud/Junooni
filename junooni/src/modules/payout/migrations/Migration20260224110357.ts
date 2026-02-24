import { Migration } from '@mikro-orm/migrations';

export class Migration20260224110357 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "payout_details" alter column "order_id" type text using ("order_id"::text);`);
    this.addSql(`alter table if exists "payout_details" alter column "order_id" drop not null;`);
    this.addSql(`alter table if exists "payout_details" alter column "order_item_id" type text using ("order_item_id"::text);`);
    this.addSql(`alter table if exists "payout_details" alter column "order_item_id" drop not null;`);
    this.addSql(`alter table if exists "payout_details" alter column "product_id" type text using ("product_id"::text);`);
    this.addSql(`alter table if exists "payout_details" alter column "product_id" drop not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "payout_details" alter column "order_id" type text using ("order_id"::text);`);
    this.addSql(`alter table if exists "payout_details" alter column "order_id" set not null;`);
    this.addSql(`alter table if exists "payout_details" alter column "order_item_id" type text using ("order_item_id"::text);`);
    this.addSql(`alter table if exists "payout_details" alter column "order_item_id" set not null;`);
    this.addSql(`alter table if exists "payout_details" alter column "product_id" type text using ("product_id"::text);`);
    this.addSql(`alter table if exists "payout_details" alter column "product_id" set not null;`);
  }

}

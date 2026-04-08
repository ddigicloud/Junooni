import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260318083317 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" add column if not exists "sell_on_marketplace" boolean not null default true, add column if not exists "sell_on_own_store" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop column if exists "sell_on_marketplace", drop column if exists "sell_on_own_store";`);
  }

}

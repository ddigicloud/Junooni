import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260629104516 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" add column if not exists "marketplace_status" text check ("marketplace_status" in ('none', 'pending', 'approved', 'rejected')) not null default 'none', add column if not exists "marketplace_rejection_reason" text null, add column if not exists "marketplace_applied_at" timestamptz null, add column if not exists "marketplace_approved_at" timestamptz null;`);
    this.addSql(`alter table if exists "vendor" alter column "sell_on_marketplace" type boolean using ("sell_on_marketplace"::boolean);`);
    this.addSql(`alter table if exists "vendor" alter column "sell_on_marketplace" set default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop column if exists "marketplace_status", drop column if exists "marketplace_rejection_reason", drop column if exists "marketplace_applied_at", drop column if exists "marketplace_approved_at";`);

    this.addSql(`alter table if exists "vendor" alter column "sell_on_marketplace" type boolean using ("sell_on_marketplace"::boolean);`);
    this.addSql(`alter table if exists "vendor" alter column "sell_on_marketplace" set default true;`);
  }

}

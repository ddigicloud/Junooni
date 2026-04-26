import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260424120901 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "post" add column if not exists "audience" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "post" drop column if exists "audience";`);
  }

}

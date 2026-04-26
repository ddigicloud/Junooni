import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260425063113 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "post" add column if not exists "is_featured" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "post" drop column if exists "is_featured";`);
  }

}

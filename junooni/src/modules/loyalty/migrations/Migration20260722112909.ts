import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260722112909 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "loyalty_transaction" add column if not exists "order_amount" integer null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "loyalty_transaction" drop column if exists "order_amount";`);
  }

}

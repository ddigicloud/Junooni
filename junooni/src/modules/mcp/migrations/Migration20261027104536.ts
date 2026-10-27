import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261027104536 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "mcp_access_token" ("id" text not null, "vendor_id" text not null, "access_token" text not null, "scope" text not null default 'read', "label" text null, "last_used_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "mcp_access_token_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_mcp_access_token_deleted_at" ON "mcp_access_token" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "mcp_access_token" cascade;`);
  }

}

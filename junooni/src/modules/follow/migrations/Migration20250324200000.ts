import { Migration } from '@mikro-orm/migrations';

export class Migration20250324200000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "follow_list" drop constraint if exists "follow_list_vendor_id_follow_id_unique";`);
    this.addSql(`alter table if exists "follow" drop constraint if exists "follow_customer_id_unique";`);
    this.addSql(`create table if not exists "follow" ("id" text not null, "customer_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "follow_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_follow_deleted_at" ON "follow" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_follow_customer_id_unique" ON "follow" (customer_id) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "follow_list" ("id" text not null, "vendor_id" text not null, "follow_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "follow_list_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_follow_list_follow_id" ON "follow_list" (follow_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_follow_list_deleted_at" ON "follow_list" (deleted_at) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_follow_list_vendor_id_follow_id_unique" ON "follow_list" (vendor_id, follow_id) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "follow_list" add constraint "follow_list_follow_id_foreign" foreign key ("follow_id") references "follow" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "follow_list" drop constraint if exists "follow_list_follow_id_foreign";`);

    this.addSql(`drop table if exists "follow" cascade;`);

    this.addSql(`drop table if exists "follow_list" cascade;`);
  }

}

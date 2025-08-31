import { Migration } from '@mikro-orm/migrations';

export class Migration20250825164826 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "vendor_artwork" ("id" text not null, "name" text not null, "description" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_artwork_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_artwork_deleted_at" ON "vendor_artwork" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "vendor_artwork_media" ("id" text not null, "fileId" text not null, "mimeType" text not null, "filename" text not null, "file_type" text not null, "file_description" text not null, "vendor_artwork_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_artwork_media_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_artwork_media_vendor_artwork_id" ON "vendor_artwork_media" (vendor_artwork_id) WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_artwork_media_deleted_at" ON "vendor_artwork_media" (deleted_at) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "vendor_artwork_media" add constraint "vendor_artwork_media_vendor_artwork_id_foreign" foreign key ("vendor_artwork_id") references "vendor_artwork" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor_artwork_media" drop constraint if exists "vendor_artwork_media_vendor_artwork_id_foreign";`);

    this.addSql(`drop table if exists "vendor_artwork" cascade;`);

    this.addSql(`drop table if exists "vendor_artwork_media" cascade;`);
  }

}

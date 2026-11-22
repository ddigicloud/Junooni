import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261120060559 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "vendor_gallery_image" ("id" text not null, "url" text not null, "file_id" text not null, "filename" text not null, "size" integer null, "mime_type" text null, "vendor_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "vendor_gallery_image_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_gallery_image_vendor_id" ON "vendor_gallery_image" ("vendor_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_vendor_gallery_image_deleted_at" ON "vendor_gallery_image" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "vendor_gallery_image" add constraint "vendor_gallery_image_vendor_id_foreign" foreign key ("vendor_id") references "vendor" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "vendor_gallery_image" cascade;`);
  }

}

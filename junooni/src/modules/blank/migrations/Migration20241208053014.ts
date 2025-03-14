import { Migration } from '@mikro-orm/migrations';

export class Migration20241208053014 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "blank" ("id" text not null, "title" text not null, "handle" text not null, "status" text check ("status" in (\'draft\', \'published\', \'archived\')) not null, "fcode" text not null, "customisation_height" integer not null, "customisation_width" integer not null, "metadata" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blank_pkey" primary key ("id"));');
    this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_blank_handle_unique" ON "blank" (handle) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "blank_images" ("id" text not null, "rank" integer not null default 0, "url" text not null, "blank_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blank_images_pkey" primary key ("id"));');
    this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_blank_images_url_unique" ON "blank_images" (url) WHERE deleted_at IS NULL;');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_blank_images_blank_id" ON "blank_images" (blank_id) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "blank_options" ("id" text not null, "title" text not null, "blank_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blank_options_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_blank_options_blank_id" ON "blank_options" (blank_id) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "blank_option_values" ("id" text not null, "value" text not null, "option_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blank_option_values_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_blank_option_values_option_id" ON "blank_option_values" (option_id) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "blank_variants" ("id" text not null, "title" text not null, "price" integer not null default 0, "stock_quantity" integer not null default 0, "sku" text not null, "hs_code" text not null, "blank_id" text not null, "variant_rank" integer not null default 0, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blank_variants_pkey" primary key ("id"));');
    this.addSql('CREATE UNIQUE INDEX IF NOT EXISTS "IDX_blank_variants_sku_unique" ON "blank_variants" (sku) WHERE deleted_at IS NULL;');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_blank_variants_blank_id" ON "blank_variants" (blank_id) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "blankoptionvalues_blankvariants" ("blank_variants_id" text not null, "blank_option_values_id" text not null, constraint "blankoptionvalues_blankvariants_pkey" primary key ("blank_variants_id", "blank_option_values_id"));');

    this.addSql('alter table if exists "blank_images" add constraint "blank_images_blank_id_foreign" foreign key ("blank_id") references "blank" ("id") on update cascade;');

    this.addSql('alter table if exists "blank_options" add constraint "blank_options_blank_id_foreign" foreign key ("blank_id") references "blank" ("id") on update cascade;');

    this.addSql('alter table if exists "blank_option_values" add constraint "blank_option_values_option_id_foreign" foreign key ("option_id") references "blank_options" ("id") on update cascade;');

    this.addSql('alter table if exists "blank_variants" add constraint "blank_variants_blank_id_foreign" foreign key ("blank_id") references "blank" ("id") on update cascade;');

    this.addSql('alter table if exists "blankoptionvalues_blankvariants" add constraint "blankoptionvalues_blankvariants_blank_variants_id_foreign" foreign key ("blank_variants_id") references "blank_variants" ("id") on update cascade on delete cascade;');
    this.addSql('alter table if exists "blankoptionvalues_blankvariants" add constraint "blankoptionvalues_blankvariants_blank_option_values_id_foreign" foreign key ("blank_option_values_id") references "blank_option_values" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "blank_images" drop constraint if exists "blank_images_blank_id_foreign";');

    this.addSql('alter table if exists "blank_options" drop constraint if exists "blank_options_blank_id_foreign";');

    this.addSql('alter table if exists "blank_variants" drop constraint if exists "blank_variants_blank_id_foreign";');

    this.addSql('alter table if exists "blank_option_values" drop constraint if exists "blank_option_values_option_id_foreign";');

    this.addSql('alter table if exists "blankoptionvalues_blankvariants" drop constraint if exists "blankoptionvalues_blankvariants_blank_option_values_id_foreign";');

    this.addSql('alter table if exists "blankoptionvalues_blankvariants" drop constraint if exists "blankoptionvalues_blankvariants_blank_variants_id_foreign";');

    this.addSql('drop table if exists "blank" cascade;');

    this.addSql('drop table if exists "blank_images" cascade;');

    this.addSql('drop table if exists "blank_options" cascade;');

    this.addSql('drop table if exists "blank_option_values" cascade;');

    this.addSql('drop table if exists "blank_variants" cascade;');

    this.addSql('drop table if exists "blankoptionvalues_blankvariants" cascade;');
  }

}

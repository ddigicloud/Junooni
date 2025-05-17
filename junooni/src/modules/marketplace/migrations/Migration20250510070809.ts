import { Migration } from '@mikro-orm/migrations';

export class Migration20250510070809 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" add column if not exists "gst_verification_status" text check ("gst_verification_status" in ('pending', 'verified', 'failed')) not null default 'pending', add column if not exists "creator_category" text check ("creator_category" in ('Art', 'Music', 'Cinema', 'Fashion', 'Sports', 'Comedy', 'Gaming', 'Influencer', 'other')) null, add column if not exists "verified" text check ("verified" in ('Yes', 'No')) not null default 'No';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop column if exists "gst_verification_status", drop column if exists "creator_category", drop column if exists "verified";`);
  }

}

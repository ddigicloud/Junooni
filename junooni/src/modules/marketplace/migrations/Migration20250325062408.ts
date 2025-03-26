import { Migration } from '@mikro-orm/migrations';

export class Migration20250325062408 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop constraint if exists "vendor_handle_unique";`);
    this.addSql(`alter table if exists "vendor" add column if not exists "coverphoto" text null, add column if not exists "youtube" text null, add column if not exists "instagram" text null, add column if not exists "xtwitter" text null, add column if not exists "othersocial" text null, add column if not exists "phonenumber" text null, add column if not exists "GSTIN" text null, add column if not exists "companyname" text null, add column if not exists "pan_number" text null, add column if not exists "city" text null, add column if not exists "pincode" text null, add column if not exists "state" text null, add column if not exists "address" text null, add column if not exists "tan_number" text null, add column if not exists "bank_account_holder_name" text null, add column if not exists "bank_account_number" text null, add column if not exists "bank_account_ifsc_code" text null, add column if not exists "bank_name" text null, add column if not exists "bank_account_type" text check ("bank_account_type" in ('Saving', 'Current')) null default 'Saving', add column if not exists "cancelled_checkque" text null, add column if not exists "creator_bio" text null, add column if not exists "creator_title" text null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_vendor_handle_unique" ON "vendor" (handle) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop index if exists "IDX_vendor_handle_unique";`);
    this.addSql(`alter table if exists "vendor" drop column if exists "coverphoto", drop column if exists "youtube", drop column if exists "instagram", drop column if exists "xtwitter", drop column if exists "othersocial", drop column if exists "phonenumber", drop column if exists "GSTIN", drop column if exists "companyname", drop column if exists "pan_number", drop column if exists "city", drop column if exists "pincode", drop column if exists "state", drop column if exists "address", drop column if exists "tan_number", drop column if exists "bank_account_holder_name", drop column if exists "bank_account_number", drop column if exists "bank_account_ifsc_code", drop column if exists "bank_name", drop column if exists "bank_account_type", drop column if exists "cancelled_checkque", drop column if exists "creator_bio", drop column if exists "creator_title";`);
  }

}

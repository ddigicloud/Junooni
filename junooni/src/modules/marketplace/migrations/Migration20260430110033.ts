import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260430110033 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "vendor" add column if not exists "plan" text null default 'free', add column if not exists "plan_billing_cycle" text check ("plan_billing_cycle" in ('monthly', 'annual')) null, add column if not exists "plan_activated_at" timestamptz null, add column if not exists "razorpay_subscription_id" text null, add column if not exists "razorpay_payment_id" text null, add column if not exists "instagram_access_token" text null, add column if not exists "instagram_user_id" text null, add column if not exists "instagram_token_expires_at" timestamptz null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "vendor" drop column if exists "plan", drop column if exists "plan_billing_cycle", drop column if exists "plan_activated_at", drop column if exists "razorpay_subscription_id", drop column if exists "razorpay_payment_id", drop column if exists "instagram_access_token", drop column if exists "instagram_user_id", drop column if exists "instagram_token_expires_at";`);
  }

}

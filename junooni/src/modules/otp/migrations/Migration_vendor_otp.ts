import { Migration } from "@mikro-orm/migrations"

export class Migration_vendor_otp extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      CREATE TABLE IF NOT EXISTS "vendor_otp" (
        "id"         VARCHAR(255)             NOT NULL,
        "email"      VARCHAR(255)             NOT NULL,
        "otp"        VARCHAR(10)              NOT NULL,
        "expires_at" TIMESTAMPTZ              NOT NULL,
        "used"       BOOLEAN                  NOT NULL DEFAULT FALSE,
        "created_at" TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ,
        CONSTRAINT "vendor_otp_pkey" PRIMARY KEY ("id")
      );
    `)
    this.addSql(`CREATE INDEX IF NOT EXISTS "vendor_otp_email_idx" ON "vendor_otp" ("email");`)
  }

  async down(): Promise<void> {
    this.addSql(`DROP TABLE IF EXISTS "vendor_otp";`)
  }
}
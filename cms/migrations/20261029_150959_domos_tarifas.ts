import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "domos" ADD COLUMN "weekend_price" numeric;
  ALTER TABLE "domos" ADD COLUMN "extra_guest_price" numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "domos" DROP COLUMN "weekend_price";
  ALTER TABLE "domos" DROP COLUMN "extra_guest_price";`)
}

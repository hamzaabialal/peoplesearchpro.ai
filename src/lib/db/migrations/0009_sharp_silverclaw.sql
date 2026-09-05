ALTER TABLE "payouts" ADD COLUMN "commission_id" bigint;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_commission_id_commissions_id_fk" FOREIGN KEY ("commission_id") REFERENCES "public"."commissions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_commission_id_unique" UNIQUE("commission_id");
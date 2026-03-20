-- CreateTable
CREATE TABLE "card_blueprint_market_value" (
    "id" SERIAL NOT NULL,
    "card_blueprint_id" INTEGER NOT NULL,
    "median_market_value_cents" INTEGER NOT NULL,
    "listing_count" INTEGER NOT NULL,
    "fetched_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "card_blueprint_market_value_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "card_blueprint_market_value_card_blueprint_id_key" ON "card_blueprint_market_value"("card_blueprint_id");

-- AddForeignKey
ALTER TABLE "card_blueprint_market_value" ADD CONSTRAINT "card_blueprint_market_value_card_blueprint_id_fkey" FOREIGN KEY ("card_blueprint_id") REFERENCES "card_blueprint"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

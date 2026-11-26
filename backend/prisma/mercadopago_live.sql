CREATE TABLE IF NOT EXISTS `mercadopago_payments` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reservation_id` INTEGER NOT NULL,
  `access_hash` VARCHAR(64) NOT NULL,
  `provider_id` VARCHAR(100) NULL,
  `payment_url` VARCHAR(2048) NULL,
  `amount_cents` INTEGER NOT NULL,
  `service_name` VARCHAR(200) NOT NULL,
  `registration_date` DATETIME(3) NULL,
  `status` VARCHAR(24) NOT NULL DEFAULT 'CREANDO',
  `version` INTEGER NOT NULL DEFAULT 0,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `mercadopago_payments_reservation_id_key` (`reservation_id`),
  UNIQUE INDEX `mercadopago_payments_access_hash_key` (`access_hash`),
  UNIQUE INDEX `mercadopago_payments_provider_id_key` (`provider_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `mercadopago_payments_reservation_id_fkey` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

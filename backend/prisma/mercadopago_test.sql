-- Aplicar una sola vez a la base de datos correspondiente, después de una copia de seguridad.
CREATE TABLE `mercadopago_test_payments` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `reservation_id` INTEGER NOT NULL,
  `access_hash` VARCHAR(64) NOT NULL,
  `provider_id` VARCHAR(100) NULL,
  `payment_url` VARCHAR(2048) NULL,
  `amount_cents` INTEGER NOT NULL,
  `status` VARCHAR(24) NOT NULL DEFAULT 'CREANDO',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `mercadopago_test_payments_reservation_id_key` (`reservation_id`),
  UNIQUE INDEX `mercadopago_test_payments_access_hash_key` (`access_hash`),
  UNIQUE INDEX `mercadopago_test_payments_provider_id_key` (`provider_id`),
  PRIMARY KEY (`id`),
  CONSTRAINT `mercadopago_test_payments_reservation_id_fkey` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Cambio aditivo para una base de datos existente. Ejecutar una sola vez.
ALTER TABLE `reservations`
  ADD COLUMN `izipay_link` VARCHAR(2048) NULL,
  ADD COLUMN `izipay_reference` VARCHAR(150) NULL,
  ADD COLUMN `izipay_paid_at` DATETIME(3) NULL;

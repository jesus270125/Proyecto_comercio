// Todos los cálculos se hacen en céntimos para evitar errores de redondeo.
function calculateReservationPricing(unitPrice, persons, nights = 1) {
  const unitCents = Math.round(Number(unitPrice) * 100);
  const subtotalCents = unitCents * persons * nights;
  const serviceFeeCents = Math.round(subtotalCents * 0.05);
  return {
    subtotal: subtotalCents / 100,
    serviceFee: serviceFeeCents / 100,
    total: (subtotalCents + serviceFeeCents) / 100,
    depositCents: serviceFeeCents,
  };
}

module.exports = { calculateReservationPricing };

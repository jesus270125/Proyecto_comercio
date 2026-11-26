// src/routes/public.js
// Rutas públicas — sin autenticación requerida
const router = require('express').Router();
const dest  = require('../controllers/destinationsController');
const exp   = require('../controllers/experiencesController');
const acc   = require('../controllers/accommodationsController');
const res_  = require('../controllers/reservationsController');
const { optionalAuth } = require('../middleware/auth');
const { validateReservation } = require('../middleware/validate');
const payments = require('../services/culqiTestPayments');
const { getCulqiTestConfig } = require('../services/culqiConfig');
const izipay = require('../services/izipaySandbox');
const mercadoPago = require('../services/mercadoPagoTest');
const mercadoPagoLive = require('../services/mercadoPagoLive');

// Destinos
router.get('/destinations',       dest.list);
router.get('/destinations/:slug', dest.detail);

// Experiencias
router.get('/experiences',        exp.list);
router.get('/experiences/:slug',  exp.detail);

// Hospedajes
router.get('/accommodations',        acc.list);
router.get('/accommodations/:slug',  acc.detail);

// Reservas (invitados pueden reservar)
router.get('/payment-demo', (req, res) => res.json({ enabled: process.env.NODE_ENV === 'development' && process.env.PAYMENT_DEMO_ENABLED === 'true' }));
router.get('/payment-manual', (req, res) => res.json({ enabled: process.env.IZIPAY_MANUAL_ENABLED === 'true' }));
router.get('/mercadopago-test', (req, res) => {
  try { res.set('Cache-Control', 'no-store').json({ enabled: Boolean(mercadoPago.config()) }); }
  catch { res.status(503).json({ error: 'Mercado Pago de prueba no disponible.' }); }
});
router.get('/mercadopago-test/status', mercadoPago.status);
router.post('/mercadopago-test/webhook', mercadoPago.webhook);
router.get('/mercadopago', async (req, res, next) => {
  try {
    const enabled = process.env.MERCADOPAGO_LIVE_ENABLED === 'true' && mercadoPagoLive.config().enabled;
    if (enabled && !await mercadoPagoLive.hasPaymentTable()) {
      return res.status(503).json({ error: 'El cobro en línea no está disponible.' });
    }
    res.set('Cache-Control', 'no-store').json({ enabled });
  } catch (err) { next(err); }
});
router.post('/mercadopago/webhook', mercadoPagoLive.webhook);
router.get('/mercadopago/:codigo', mercadoPagoLive.purchaserPayment);
router.post('/mercadopago/:codigo/checkout', mercadoPagoLive.purchaserPayment);
router.get('/izipay-test', (req, res) => {
  try { res.set('Cache-Control', 'no-store').json({ enabled: Boolean(izipay.config()) }); }
  catch { res.status(503).json({ error: 'Izipay de prueba no disponible.' }); }
});
router.get('/izipay-test/status', izipay.status);
router.post('/izipay-test/webhook', izipay.webhook);
router.get('/payment-test', (req, res) => {
  try { res.set('Cache-Control', 'no-store').json({ enabled: Boolean(getCulqiTestConfig()) }); }
  catch { res.status(503).json({ error: 'Pago de prueba no disponible.' }); }
});
router.get('/payment-test/status', payments.getStatus);
router.post('/payment-test/webhook', payments.webhook);
router.post('/reservations', optionalAuth, validateReservation, res_.create);

module.exports = router;

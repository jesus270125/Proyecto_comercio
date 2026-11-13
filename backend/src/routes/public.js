// src/routes/public.js
// Rutas públicas — sin autenticación requerida
const router = require('express').Router();
const dest  = require('../controllers/destinationsController');
const exp   = require('../controllers/experiencesController');
const acc   = require('../controllers/accommodationsController');
const res_  = require('../controllers/reservationsController');
const { optionalAuth } = require('../middleware/auth');
const { validateReservation } = require('../middleware/validate');

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
router.post('/reservations', optionalAuth, validateReservation, res_.create);

module.exports = router;

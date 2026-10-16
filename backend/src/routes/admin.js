// src/routes/admin.js
// Rutas de administración — requieren JWT + rol ADMIN
const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateExperience, validateAccommodation } = require('../middleware/validate');
const dest  = require('../controllers/destinationsController');
const exp   = require('../controllers/experiencesController');
const acc   = require('../controllers/accommodationsController');
const res_  = require('../controllers/reservationsController');

// Todas las rutas admin requieren autenticación y rol ADMIN
router.use(authenticate, requireAdmin);

// ── Destinos ──────────────────────────────────────────────
router.get   ('/destinations',             dest.adminList);
router.post  ('/destinations',             dest.adminCreate);
router.put   ('/destinations/:id',         dest.adminUpdate);
router.delete('/destinations/:id',         dest.adminDelete);
router.patch ('/destinations/:id/publish', dest.adminTogglePublish);

// ── Experiencias ──────────────────────────────────────────
router.get   ('/experiences',                    exp.adminList);
router.post  ('/experiences',   validateExperience, exp.adminCreate);
router.put   ('/experiences/:id', exp.adminUpdate);
router.delete('/experiences/:id', exp.adminDelete);
router.patch ('/experiences/:id/publish', exp.adminTogglePublish);

// ── Hospedajes ────────────────────────────────────────────
router.get   ('/accommodations',                       acc.adminList);
router.post  ('/accommodations',   validateAccommodation, acc.adminCreate);
router.put   ('/accommodations/:id', acc.adminUpdate);
router.delete('/accommodations/:id', acc.adminDelete);
router.patch ('/accommodations/:id/publish', acc.adminTogglePublish);

// ── Reservas ─────────────────────────────────────────────
router.get   ('/reservations',                  res_.adminList);
router.get   ('/reservations/:id',              res_.adminDetail);
router.patch ('/reservations/:id/estado',       res_.adminUpdateEstado);
router.delete('/reservations/:id',              res_.adminDelete);

module.exports = router;

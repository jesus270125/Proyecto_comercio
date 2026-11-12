// src/routes/admin.js
// Rutas de administración — requieren JWT + rol ADMIN
const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validateResource } = require('../middleware/validate');
const dest  = require('../controllers/destinationsController');
const exp   = require('../controllers/experiencesController');
const acc   = require('../controllers/accommodationsController');
const res_  = require('../controllers/reservationsController');
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');

// Todas las rutas admin requieren autenticación y rol ADMIN
router.use(authenticate, requireAdmin);
router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) return res.status(400).json({ error: 'Identificador inválido.' });
  next();
});

router.post('/images', express.raw({ type: 'image/webp', limit: '4mb' }), async (req, res, next) => {
  try {
    const image = req.body;
    if (!Buffer.isBuffer(image) || image.length < 20 || image.toString('ascii', 0, 4) !== 'RIFF' || image.toString('ascii', 8, 12) !== 'WEBP' || image.readUInt32LE(4) + 8 !== image.length) {
      return res.status(400).json({ error: 'La imagen no tiene un formato válido.' });
    }
    const directory = path.join(__dirname, '..', '..', 'uploads');
    await fs.mkdir(directory, { recursive: true });
    const filename = `${randomUUID()}.webp`;
    await fs.writeFile(path.join(directory, filename), image, { flag: 'wx' });
    res.status(201).json({ data: { url: `/uploads/${filename}` } });
  } catch (err) { next(err); }
});

// ── Destinos ──────────────────────────────────────────────
router.get   ('/destinations',             dest.adminList);
router.post  ('/destinations', validateResource('destination'), dest.adminCreate);
router.put   ('/destinations/:id', validateResource('destination', true), dest.adminUpdate);
router.delete('/destinations/:id',         dest.adminDelete);
router.patch ('/destinations/:id/publish', dest.adminTogglePublish);

// ── Experiencias ──────────────────────────────────────────
router.get   ('/experiences',                    exp.adminList);
router.post  ('/experiences', validateResource('experience'), exp.adminCreate);
router.put   ('/experiences/:id', validateResource('experience', true), exp.adminUpdate);
router.delete('/experiences/:id', exp.adminDelete);
router.patch ('/experiences/:id/publish', exp.adminTogglePublish);

// ── Hospedajes ────────────────────────────────────────────
router.get   ('/accommodations',                       acc.adminList);
router.post  ('/accommodations', validateResource('accommodation'), acc.adminCreate);
router.put   ('/accommodations/:id', validateResource('accommodation', true), acc.adminUpdate);
router.delete('/accommodations/:id', acc.adminDelete);
router.patch ('/accommodations/:id/publish', acc.adminTogglePublish);

// ── Reservas ─────────────────────────────────────────────
router.get   ('/reservations',                  res_.adminList);
router.get   ('/reservations/:id',              res_.adminDetail);
router.patch ('/reservations/:id/estado',       res_.adminUpdateEstado);
router.delete('/reservations/:id',              res_.adminDelete);

module.exports = router;

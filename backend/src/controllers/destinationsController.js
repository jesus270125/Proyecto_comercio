// src/controllers/destinationsController.js
const prisma = require('../config/database');
const { slugify } = require('../middleware/validate');

// GET /api/v1/destinations
async function list(req, res, next) {
  try {
    const items = await prisma.destination.findMany({
      where: { publicado: true },
      orderBy: { nombre: 'asc' },
      select: {
        id: true, nombre: true, slug: true, province: true,
        description: true, image: true, altitude: true, climate: true,
        highlights: true,
      },
    });
    const formatted = items.map(d => ({ ...d, name: d.nombre }));
    res.json({ data: formatted, total: formatted.length });
  } catch (err) { next(err); }
}

// GET /api/v1/destinations/:slug
async function detail(req, res, next) {
  try {
    const item = await prisma.destination.findFirst({
      where: { slug: req.params.slug, publicado: true },
      include: {
        experiences: {
          where: { publicado: true },
          select: { id: true, nombre: true, slug: true, image: true, price: true, category: true, duration: true },
        },
        accommodations: {
          where: { publicado: true },
          select: { id: true, nombre: true, slug: true, image: true, price: true, type: true },
        },
      },
    });
    if (!item) return res.status(404).json({ error: 'Destino no encontrado.' });
    res.json({ data: item });
  } catch (err) { next(err); }
}

// ── ADMIN ─────────────────────────────────────────────────

async function adminList(req, res, next) {
  try {
    const items = await prisma.destination.findMany({ orderBy: { createdAt: 'desc' } });
    const formatted = items.map(d => ({ ...d, name: d.nombre }));
    res.json({ data: formatted, total: formatted.length });
  } catch (err) { next(err); }
}

async function adminCreate(req, res, next) {
  try {
    const { nombre, province, description, image, altitude, climate, highlights } = req.body;
    if (!nombre || !description || !image)
      return res.status(400).json({ error: 'nombre, description e image son requeridos.' });

    const slug = slugify(nombre);
    const item = await prisma.destination.create({
      data: { nombre, slug, province, description, image, altitude, climate, highlights: highlights || [] },
    });
    res.status(201).json({ data: { ...item, name: item.nombre } });
  } catch (err) { next(err); }
}

async function adminUpdate(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { nombre, province, description, image, altitude, climate, highlights, publicado } = req.body;
    const data = {};
    if (nombre !== undefined) { data.nombre = nombre; data.slug = slugify(nombre); }
    if (province !== undefined) data.province = province;
    if (description !== undefined) data.description = description;
    if (image !== undefined) data.image = image;
    if (altitude !== undefined) data.altitude = altitude;
    if (climate !== undefined) data.climate = climate;
    if (highlights !== undefined) data.highlights = highlights;
    if (publicado !== undefined) data.publicado = publicado;

    const item = await prisma.destination.update({ where: { id }, data });
    res.json({ data: { ...item, name: item.nombre } });
  } catch (err) { next(err); }
}

async function adminDelete(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await prisma.destination.delete({ where: { id } });
    res.json({ message: 'Destino eliminado.' });
  } catch (err) { next(err); }
}

async function adminTogglePublish(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const current = await prisma.destination.findUnique({ where: { id }, select: { publicado: true } });
    if (!current) return res.status(404).json({ error: 'Destino no encontrado.' });
    const item = await prisma.destination.update({ where: { id }, data: { publicado: !current.publicado } });
    res.json({ data: { id: item.id, publicado: item.publicado } });
  } catch (err) { next(err); }
}

module.exports = { list, detail, adminList, adminCreate, adminUpdate, adminDelete, adminTogglePublish };

// src/controllers/accommodationsController.js
const prisma = require('../config/database');
const { slugify } = require('../middleware/validate');

// GET /api/v1/accommodations
async function list(req, res, next) {
  try {
    const { type, featured, q } = req.query;
    const where = { publicado: true };
    if (type) where.type = type;
    if (featured === 'true') where.featured = true;
    if (q) where.nombre = { contains: q };

    const items = await prisma.accommodation.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true, nombre: true, slug: true, type: true, location: true,
        district: true, description: true, price: true, rating: true,
        reviewsCount: true, capacity: true, rooms: true, image: true,
        amenities: true, featured: true,
      },
    });
    const formatted = items.map(a => ({
      ...a,
      name: a.nombre,
      reviews: a.reviewsCount,
      price: parseFloat(a.price),
      rating: parseFloat(a.rating) || 5.0,
    }));
    res.json({ data: formatted, total: formatted.length });
  } catch (err) { next(err); }
}

// GET /api/v1/accommodations/:slug
async function detail(req, res, next) {
  try {
    const item = await prisma.accommodation.findFirst({
      where: { slug: req.params.slug, publicado: true },
      include: { destination: { select: { id: true, nombre: true, slug: true } } },
    });
    if (!item) return res.status(404).json({ error: 'Hospedaje no encontrado.' });
    const formatted = {
      ...item,
      name: item.nombre,
      reviews: item.reviewsCount,
      price: parseFloat(item.price),
      rating: parseFloat(item.rating) || 5.0,
    };
    res.json({ data: formatted });
  } catch (err) { next(err); }
}

// ── ADMIN ─────────────────────────────────────────────────

async function adminList(req, res, next) {
  try {
    const items = await prisma.accommodation.findMany({
      orderBy: { createdAt: 'desc' },
      include: { destination: { select: { nombre: true } } },
    });
    res.json({ data: items, total: items.length });
  } catch (err) { next(err); }
}

async function adminCreate(req, res, next) {
  try {
    const {
      nombre, description, type, location, district, address,
      price, capacity, rooms, image, gallery, amenities, featured, destinationId,
    } = req.body;

    const slug = slugify(nombre);
    const item = await prisma.accommodation.create({
      data: {
        nombre, slug, description, type, location, district, address,
        price: parseFloat(price),
        capacity: capacity ? parseInt(capacity) : null,
        rooms: rooms ? parseInt(rooms) : null,
        image, gallery, amenities,
        featured: featured || false,
        destinationId: destinationId ? parseInt(destinationId) : null,
      },
    });
    res.status(201).json({
      data: {
        ...item,
        name: item.nombre,
        reviews: item.reviewsCount,
        price: parseFloat(item.price),
        rating: parseFloat(item.rating) || 5.0,
      },
    });
  } catch (err) { next(err); }
}

async function adminUpdate(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const updateData = { ...req.body };
    if (updateData.nombre) updateData.slug = slugify(updateData.nombre);
    if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);
    if (updateData.capacity !== undefined) updateData.capacity = updateData.capacity ? parseInt(updateData.capacity) : null;
    if (updateData.rooms !== undefined) updateData.rooms = updateData.rooms ? parseInt(updateData.rooms) : null;
    if (updateData.destinationId !== undefined)
      updateData.destinationId = updateData.destinationId ? parseInt(updateData.destinationId) : null;

    const item = await prisma.accommodation.update({ where: { id }, data: updateData });
    res.json({
      data: {
        ...item,
        name: item.nombre,
        reviews: item.reviewsCount,
        price: parseFloat(item.price),
        rating: parseFloat(item.rating) || 5.0,
      },
    });
  } catch (err) { next(err); }
}

async function adminDelete(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await prisma.accommodation.delete({ where: { id } });
    res.json({ message: 'Hospedaje eliminado.' });
  } catch (err) { next(err); }
}

async function adminTogglePublish(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const current = await prisma.accommodation.findUnique({ where: { id }, select: { publicado: true } });
    if (!current) return res.status(404).json({ error: 'Hospedaje no encontrado.' });
    const item = await prisma.accommodation.update({ where: { id }, data: { publicado: !current.publicado } });
    res.json({ data: { id: item.id, publicado: item.publicado } });
  } catch (err) { next(err); }
}

module.exports = { list, detail, adminList, adminCreate, adminUpdate, adminDelete, adminTogglePublish };

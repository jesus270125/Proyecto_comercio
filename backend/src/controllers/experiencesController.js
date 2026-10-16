// src/controllers/experiencesController.js
const prisma = require('../config/database');
const { slugify } = require('../middleware/validate');

// GET /api/v1/experiences
async function list(req, res, next) {
  try {
    const { category, featured, q } = req.query;
    const where = { publicado: true };
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;
    if (q) where.nombre = { contains: q };

    const items = await prisma.experience.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true, nombre: true, slug: true, shortDescription: true,
        category: true, location: true, duration: true, difficulty: true,
        groupSize: true, price: true, rating: true, reviewsCount: true,
        image: true, featured: true, tags: true,
      },
    });
    const formatted = items.map(e => ({
      ...e,
      name: e.nombre,
      reviews: e.reviewsCount,
      price: parseFloat(e.price),
      rating: parseFloat(e.rating) || 5.0,
    }));
    res.json({ data: formatted, total: formatted.length });
  } catch (err) { next(err); }
}

// GET /api/v1/experiences/:slug
async function detail(req, res, next) {
  try {
    const item = await prisma.experience.findFirst({
      where: { slug: req.params.slug, publicado: true },
      include: { destination: { select: { id: true, nombre: true, slug: true } } },
    });
    if (!item) return res.status(404).json({ error: 'Experiencia no encontrada.' });
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
    const items = await prisma.experience.findMany({
      orderBy: { createdAt: 'desc' },
      include: { destination: { select: { nombre: true } } },
    });
    res.json({ data: items, total: items.length });
  } catch (err) { next(err); }
}

async function adminCreate(req, res, next) {
  try {
    const {
      nombre, shortDescription, description, category, location,
      district, duration, difficulty, groupSize, price, image,
      gallery, includes, excludes, itinerary, tags, featured,
      destinationId,
    } = req.body;

    const slug = slugify(nombre);
    const item = await prisma.experience.create({
      data: {
        nombre, slug, shortDescription, description, category, location,
        district, duration, difficulty, groupSize,
        price: parseFloat(price),
        image, gallery, includes, excludes, itinerary, tags,
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
    if (updateData.destinationId !== undefined)
      updateData.destinationId = updateData.destinationId ? parseInt(updateData.destinationId) : null;

    const item = await prisma.experience.update({ where: { id }, data: updateData });
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
    await prisma.experience.delete({ where: { id } });
    res.json({ message: 'Experiencia eliminada.' });
  } catch (err) { next(err); }
}

async function adminTogglePublish(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const current = await prisma.experience.findUnique({ where: { id }, select: { publicado: true } });
    if (!current) return res.status(404).json({ error: 'Experiencia no encontrada.' });
    const item = await prisma.experience.update({ where: { id }, data: { publicado: !current.publicado } });
    res.json({ data: { id: item.id, publicado: item.publicado } });
  } catch (err) { next(err); }
}

module.exports = { list, detail, adminList, adminCreate, adminUpdate, adminDelete, adminTogglePublish };

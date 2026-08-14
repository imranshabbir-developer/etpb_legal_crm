const { Op } = require("sequelize");
const { Court } = require("../../models");
const { ApiError } = require("../../utils/ApiError");

function slugifyName(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function listCourts({ layer } = {}) {
  const where = { isActive: true };
  if (layer === "internal" || layer === "external") {
    where.layer = layer;
  }

  const courts = await Court.findAll({
    where,
    order: [
      ["layer", "ASC"],
      ["sortOrder", "ASC"],
      ["name", "ASC"],
    ],
  });

  return courts.map((court) => court.toApiJSON());
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function getCourtBySlugOrId(slugOrId) {
  const or = [{ slug: slugOrId }];
  // Only query id when value is a UUID — Postgres rejects invalid UUID literals
  if (UUID_RE.test(String(slugOrId))) {
    or.push({ id: slugOrId });
  }

  const court = await Court.findOne({
    where: {
      isActive: true,
      [Op.or]: or,
    },
  });

  if (!court) {
    throw new ApiError(404, "Court not found");
  }

  return court.toApiJSON();
}

async function createCourt(payload) {
  const baseSlug = payload.slug || slugifyName(payload.name);
  if (!baseSlug) {
    throw new ApiError(400, "Could not derive a valid court slug from name");
  }

  let slug = baseSlug;
  let suffix = 2;
  while (await Court.findOne({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`.slice(0, 80);
    suffix += 1;
  }

  const maxSort =
    (await Court.max("sortOrder", {
      where: { layer: payload.layer },
    })) || 0;

  const court = await Court.create({
    slug,
    name: payload.name.trim().toUpperCase(),
    layer: payload.layer,
    categories: payload.categories,
    sortOrder: payload.sortOrder ?? Number(maxSort) + 1,
    isActive: true,
  });

  return court.toApiJSON();
}

async function updateCourt(slugOrId, payload) {
  const or = [{ slug: slugOrId }];
  if (UUID_RE.test(String(slugOrId))) {
    or.push({ id: slugOrId });
  }

  const court = await Court.findOne({ where: { [Op.or]: or } });
  if (!court) {
    throw new ApiError(404, "Court not found");
  }

  await court.update({
    ...(payload.name !== undefined ? { name: payload.name.trim().toUpperCase() } : {}),
    ...(payload.categories !== undefined ? { categories: payload.categories } : {}),
    ...(payload.sortOrder !== undefined ? { sortOrder: payload.sortOrder } : {}),
    ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
  });

  return court.toApiJSON();
}

module.exports = {
  listCourts,
  getCourtBySlugOrId,
  createCourt,
  updateCourt,
};

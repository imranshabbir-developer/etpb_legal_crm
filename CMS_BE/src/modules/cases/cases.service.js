const { Op } = require("sequelize");
const { Case, Court } = require("../../models");
const { ApiError } = require("../../utils/ApiError");

function rethrowUnique(error) {
  if (error?.name === "SequelizeUniqueConstraintError") {
    throw new ApiError(
      409,
      "A case with this number already exists for this court and category",
    );
  }
  throw error;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function resolveCourt(courtIdOrSlug) {
  const or = [{ slug: courtIdOrSlug }];
  if (UUID_RE.test(String(courtIdOrSlug))) {
    or.push({ id: courtIdOrSlug });
  }
  const court = await Court.findOne({
    where: { isActive: true, [Op.or]: or },
  });
  if (!court) {
    throw new ApiError(400, "Court not found");
  }
  return court;
}

function payloadToRow(payload, court) {
  const { courtId, layer, ...rest } = payload;
  if (layer && layer !== court.layer) {
    throw new ApiError(400, `Case layer must match court layer (${court.layer})`);
  }
  return {
    ...rest,
    courtSlug: court.slug,
    courtUuid: court.id,
    nameOfCourt: rest.nameOfCourt || court.name,
    layer: court.layer,
  };
}

async function nextSrNo() {
  const max = await Case.max("srNo");
  return (Number(max) || 0) + 1;
}

async function listCases(query = {}) {
  const where = {};
  const and = [];

  if (query.layer === "internal" || query.layer === "external") {
    where.layer = query.layer;
  }
  if (query.courtId) {
    if (UUID_RE.test(String(query.courtId))) {
      where.courtUuid = query.courtId;
    } else {
      where.courtSlug = query.courtId;
    }
  }
  if (query.category) {
    where.caseCategory = query.category;
  }
  if (query.q && String(query.q).trim()) {
    const q = `%${String(query.q).trim()}%`;
    and.push({
      [Op.or]: [
        { caseNo: { [Op.iLike]: q } },
        { caseTitled: { [Op.iLike]: q } },
        { nameOfCounsel: { [Op.iLike]: q } },
        { caseStatus: { [Op.iLike]: q } },
      ],
    });
  }
  if (and.length) {
    where[Op.and] = and;
  }

  const order = [
    ["srNo", "ASC"],
    ["createdAt", "ASC"],
  ];

  if (query.page || query.limit) {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 25);
    const { count, rows } = await Case.findAndCountAll({
      where,
      order,
      limit,
      offset: (page - 1) * limit,
    });
    return {
      items: rows.map((row) => row.toApiJSON()),
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.max(1, Math.ceil(count / limit)),
      },
    };
  }

  const rows = await Case.findAll({
    where,
    order,
  });
  return rows.map((row) => row.toApiJSON());
}

async function getCaseById(id) {
  const row = await Case.findByPk(id);
  if (!row) throw new ApiError(404, "Case not found");
  return row.toApiJSON();
}

async function createCase(payload) {
  const court = await resolveCourt(payload.courtId);
  if (!court.categories.includes(payload.caseCategory)) {
    throw new ApiError(400, "Category is not valid for this court");
  }
  try {
    const row = await Case.create({
      ...payloadToRow(payload, court),
      srNo: payload.srNo || (await nextSrNo()),
    });
    return row.toApiJSON();
  } catch (error) {
    rethrowUnique(error);
  }
}

async function updateCase(id, payload) {
  const row = await Case.findByPk(id);
  if (!row) throw new ApiError(404, "Case not found");

  let court = null;
  if (payload.courtId) {
    court = await resolveCourt(payload.courtId);
  } else {
    court = await Court.findOne({ where: { slug: row.courtSlug } });
  }

  const category = payload.caseCategory || row.caseCategory;
  if (court && Array.isArray(court.categories) && !court.categories.includes(category)) {
    throw new ApiError(400, "Category is not valid for this court");
  }

  if (payload.layer && court && payload.layer !== court.layer) {
    throw new ApiError(400, `Case layer must match court layer (${court.layer})`);
  }

  const patch = { ...payload };
  delete patch.courtId;
  if (court) {
    patch.courtSlug = court.slug;
    patch.courtUuid = court.id;
    patch.layer = court.layer;
    if (!patch.nameOfCourt) patch.nameOfCourt = court.name;
  }

  try {
    await row.update(patch);
    return row.toApiJSON();
  } catch (error) {
    rethrowUnique(error);
  }
}

async function deleteCase(id) {
  const row = await Case.findByPk(id);
  if (!row) throw new ApiError(404, "Case not found");
  await row.destroy();
  return { id };
}

async function deleteCases(ids = []) {
  if (!Array.isArray(ids) || !ids.length) {
    throw new ApiError(400, "ids array is required");
  }
  const removed = await Case.destroy({ where: { id: { [Op.in]: ids } } });
  return { removed };
}

async function clearCourtCategory(courtId, category) {
  if (!courtId || !category) {
    throw new ApiError(400, "courtId and category are required");
  }
  const where = { caseCategory: category };
  if (UUID_RE.test(String(courtId))) {
    where[Op.or] = [{ courtSlug: courtId }, { courtUuid: courtId }];
  } else {
    where.courtSlug = courtId;
  }
  const removed = await Case.destroy({ where });
  return { removed };
}

module.exports = {
  listCases,
  getCaseById,
  createCase,
  updateCase,
  deleteCase,
  deleteCases,
  clearCourtCategory,
};

const { Role, Permission } = require("../../models");

async function listActiveRoles() {
  const roles = await Role.findAll({
    where: { isActive: true },
    attributes: ["id", "name", "slug", "description"],
    include: [
      {
        model: Permission,
        attributes: ["key"],
        through: { attributes: [] },
      },
    ],
    order: [["name", "ASC"]],
  });

  return roles.map((role) => ({
    id: role.id,
    name: role.name,
    slug: role.slug,
    description: role.description,
    permissions: (role.Permissions || []).map((p) => p.key),
  }));
}

module.exports = { listActiveRoles };

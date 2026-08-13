require("dotenv").config();

const { sequelize } = require("../config/database");
const { Role, Permission, RolePermission, User } = require("../models");
const { hashPassword } = require("../utils/password");

const PERMISSIONS = [
  { key: "cases:view", description: "View cases" },
  { key: "cases:create", description: "Create cases" },
  { key: "cases:edit", description: "Edit cases" },
  { key: "cases:delete", description: "Delete cases" },
  { key: "users:view", description: "View users" },
  { key: "users:manage-staff", description: "Manage staff users" },
  { key: "users:manage-admin", description: "Manage admin users" },
  { key: "settings:view", description: "View settings" },
  { key: "settings:manage", description: "Manage settings" },
  { key: "modules:configure", description: "Configure modules" },
];

const ROLE_DEFS = [
  {
    name: "Super Admin",
    slug: "super-admin",
    description: "Full system access including module configuration",
    permissions: PERMISSIONS.map((p) => p.key),
  },
  {
    name: "Admin",
    slug: "admin",
    description: "Manage cases, users, and settings",
    permissions: PERMISSIONS.map((p) => p.key),
  },
  {
    name: "Staff",
    slug: "staff",
    description: "View and edit cases; view settings",
    permissions: ["cases:view", "cases:edit", "settings:view"],
  },
];

const USERS = [
  {
    name: "Super Admin",
    email: "superadmin@ips.gov.pk",
    password: "SuperAdmin@123",
    roleSlug: "super-admin",
    status: "Active",
  },
  {
    name: "IPS Admin",
    email: "admin@ips.gov.pk",
    password: "Admin@123",
    roleSlug: "admin",
    status: "Active",
  },
  {
    name: "Legal Admin (Lahore)",
    email: "legal.admin@ips.gov.pk",
    password: "Admin@123",
    roleSlug: "admin",
    status: "Active",
  },
  {
    name: "Case Staff",
    email: "staff@ips.gov.pk",
    password: "Staff@123",
    roleSlug: "staff",
    status: "Active",
  },
  {
    name: "Records Officer",
    email: "records@ips.gov.pk",
    password: "Staff@123",
    roleSlug: "staff",
    status: "Active",
  },
  {
    name: "Hearing Clerk",
    email: "hearings@ips.gov.pk",
    password: "Staff@123",
    roleSlug: "staff",
    status: "Active",
  },
  {
    name: "Litigation Assistant",
    email: "litigation@ips.gov.pk",
    password: "Staff@123",
    roleSlug: "staff",
    status: "Inactive",
  },
];

async function upsertPermission(def) {
  const [row] = await Permission.findOrCreate({
    where: { key: def.key },
    defaults: def,
  });
  return row;
}

async function upsertRole(def) {
  const [role] = await Role.findOrCreate({
    where: { slug: def.slug },
    defaults: {
      name: def.name,
      slug: def.slug,
      description: def.description,
      isActive: true,
    },
  });

  await role.update({
    name: def.name,
    description: def.description,
    isActive: true,
  });

  return role;
}

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const permissionMap = {};
    for (const def of PERMISSIONS) {
      const permission = await upsertPermission(def);
      permissionMap[permission.key] = permission;
    }

    const roleMap = {};
    for (const def of ROLE_DEFS) {
      const role = await upsertRole(def);
      roleMap[role.slug] = role;

      for (const key of def.permissions) {
        const permission = permissionMap[key];
        await RolePermission.findOrCreate({
          where: {
            roleId: role.id,
            permissionId: permission.id,
          },
          defaults: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }

    for (const userDef of USERS) {
      const role = roleMap[userDef.roleSlug];
      const passwordHash = await hashPassword(userDef.password);
      const [user, created] = await User.findOrCreate({
        where: { email: userDef.email },
        defaults: {
          name: userDef.name,
          email: userDef.email,
          passwordHash,
          roleId: role.id,
          status: userDef.status,
        },
      });

      if (!created) {
        await user.update({
          name: userDef.name,
          passwordHash,
          roleId: role.id,
          status: userDef.status,
        });
      }
    }

    console.log("Seed completed:");
    console.log(`- Roles: ${ROLE_DEFS.length}`);
    console.log(`- Permissions: ${PERMISSIONS.length}`);
    console.log(`- Users: ${USERS.length}`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();

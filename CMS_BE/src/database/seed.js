require("dotenv").config();

const { sequelize } = require("../config/database");
const { Role, Permission, RolePermission, User, Court, Case, AppSetting } = require("../models");
const { hashPassword } = require("../utils/password");
const { Op } = require("sequelize");

const INTERNAL_FOUR = [
  "decided-cases",
  "pending-cases",
  "restraining-order",
  "direction-cases",
];
const EXTERNAL_TWO = ["restraining-order", "direction-cases"];

const COURTS = [
  {
    slug: "federal-secretary",
    name: "FEDERAL SECRETARY",
    layer: "internal",
    categories: [...INTERNAL_FOUR],
    sortOrder: 1,
  },
  {
    slug: "joint-secretary",
    name: "JOINT SECRETARY",
    layer: "internal",
    categories: [...INTERNAL_FOUR],
    sortOrder: 2,
  },
  {
    slug: "chairman",
    name: "CHAIRMAN",
    layer: "internal",
    categories: [...INTERNAL_FOUR],
    sortOrder: 3,
  },
  {
    slug: "administrator",
    name: "ADMINISTRATOR",
    layer: "internal",
    categories: [...INTERNAL_FOUR],
    sortOrder: 4,
  },
  {
    slug: "assistant-deputy-administrator",
    name: "ASSISTANT / DEPUTY ADMINISTRATOR",
    layer: "internal",
    categories: [...INTERNAL_FOUR],
    sortOrder: 5,
  },
  {
    slug: "federal-constitutional-court",
    name: "FEDERAL CONSTITUTIONAL COURT OF PAKISTAN",
    layer: "external",
    categories: [...EXTERNAL_TWO],
    sortOrder: 1,
  },
  {
    slug: "supreme-court",
    name: "SUPREME COURT OF PAKISTAN",
    layer: "external",
    categories: [...EXTERNAL_TWO],
    sortOrder: 2,
  },
  {
    slug: "high-court",
    name: "HIGH COURT",
    layer: "external",
    categories: [...EXTERNAL_TWO],
    sortOrder: 3,
  },
  {
    slug: "district-session-court",
    name: "DISTRICT & SESSION COURT",
    layer: "external",
    categories: [...EXTERNAL_TWO],
    sortOrder: 4,
  },
  {
    slug: "civil-court",
    name: "CIVIL COURT",
    layer: "external",
    categories: [...EXTERNAL_TWO],
    sortOrder: 5,
  },
  {
    slug: "federal-service-tribunal",
    name: "FEDERAL SERVICE TRIBUNAL",
    layer: "external",
    categories: [...EXTERNAL_TWO],
    sortOrder: 6,
  },
  {
    slug: "other-courts",
    name: "OTHER COURTS",
    layer: "external",
    categories: [...INTERNAL_FOUR],
    sortOrder: 7,
  },
];

const PERMISSIONS = [
  { key: "cases:view", description: "View cases" },
  { key: "cases:create", description: "Create cases" },
  { key: "cases:edit", description: "Edit cases" },
  { key: "cases:delete", description: "Delete cases" },
  { key: "courts:manage", description: "Create and update courts" },
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
    permissions: PERMISSIONS.map((p) => p.key).filter((key) => key !== "modules:configure"),
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

function pad(n, size = 3) {
  return String(n).padStart(size, "0");
}

function categoryCount(layer, category) {
  if (layer === "external" && (category === "restraining-order" || category === "direction-cases")) {
    return 4;
  }
  if (category === "pending-cases") return 5;
  if (category === "decided-cases") return 4;
  return 3;
}

function categoryStatus(category) {
  switch (category) {
    case "decided-cases":
      return "Decided";
    case "pending-cases":
      return "Pending";
    case "restraining-order":
      return "Restraining Order";
    case "direction-cases":
      return "Direction";
    default:
      return "Pending";
  }
}

function categoryStage(category, i) {
  if (category === "decided-cases") return i % 2 === 0 ? "Disposed" : "Judgment";
  if (category === "pending-cases") return i % 2 === 0 ? "Evidence" : "Arguments";
  if (category === "restraining-order") return "Stay / Injunction";
  return "Compliance / Directions";
}

function sampleTitle(courtName, i) {
  const titles = [
    "IPS vs Occupant — Recovery of Possession",
    "Allottee vs IPS — Lease Dispute",
    "IPS vs Encroacher — Eviction",
    "Beneficiary vs IPS — Property Claim",
    "IPS vs Trespasser — Injunction",
  ];
  return `${titles[i % titles.length]} (${courtName.split(" ")[0]})`;
}

function sampleCounsel(i) {
  const names = [
    "Adv. Imran Ali",
    "Adv. Sara Khan",
    "Adv. Bilal Ahmed",
    "Adv. Nadia Hussain",
    "Adv. Usman Raza",
  ];
  return names[i % names.length];
}

function sampleProceeding(category, i) {
  if (category === "decided-cases") return "Matter decided; order reserved / announced";
  if (category === "restraining-order") return "Stay application heard; status quo directed";
  if (category === "direction-cases") return "Court directions issued for record production";
  return i % 2 === 0 ? "Adjourned for evidence" : "Counsel heard; next date fixed";
}

function sampleRemarks(category, i) {
  if (category === "pending-cases") return "Priority follow-up with counsel before next date";
  if (category === "restraining-order") return "Monitor stay order compliance";
  if (category === "direction-cases") return "Ensure departmental compliance report";
  return i % 2 === 0 ? "Appeal window under review" : "File closed pending certified copy";
}

function isoDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Mix overdue + upcoming hearing dates so Reminders has live demo data. */
function sampleNextHearing(i, decided) {
  if (decided) return "—";
  const offsetDays = [-7, -2, 0, 1, 2, 3, 7, 14, 21][i % 9];
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return isoDateOnly(date);
}

function buildDemoCases(courtDefs) {
  const rows = [];
  let sr = 1;

  for (const court of courtDefs) {
    for (const category of court.categories) {
      const count = categoryCount(court.layer, category);
      for (let i = 1; i <= count; i += 1) {
        const decided = category === "decided-cases";
        const caseNo = `IPS/${court.layer === "internal" ? "INT" : "EXT"}/${pad(sr)}/${2024 + (i % 2)}`;
        rows.push({
          srNo: sr,
          caseNo,
          dateOfInstitution: `2024-0${(i % 9) + 1}-${pad((i % 27) + 1, 2)}`,
          caseCategory: category,
          propertyLandDemandNo: `PLD-${pad(100 + i)}`,
          lotNo: `LOT-${pad(i)}`,
          areaMeasuring: `${(i * 3.5).toFixed(1)} Marla`,
          propertyLandStatus: i % 2 === 0 ? "Evacuee Trust Property" : "Attached / Under Litigation",
          caseTitled: sampleTitle(court.name, i),
          nameOfCourt: court.name,
          courtSlug: court.slug,
          layer: court.layer,
          nameOfCounsel: sampleCounsel(i),
          dateOfEntrustmentToCounsel: `2024-0${(i % 8) + 1}-15`,
          todayCourtProceedings: sampleProceeding(category, i),
          nextDateOfHearing: sampleNextHearing(i, decided),
          nextDateProceedings: decided ? "—" : "Arguments / Evidence",
          dateOfDecision: decided ? `2025-0${(i % 9) + 1}-20` : "—",
          decidedInFavourOfIps: decided ? (i % 2 === 0 ? "Yes" : "No") : "—",
          decidedAgainstIps: decided ? (i % 2 === 0 ? "No" : "Yes") : "—",
          fillingOfAppeal: decided && i % 3 === 0 ? "Yes" : "No",
          dateGistOfProceedings: sampleProceeding(category, i),
          proceedingDate: `2025-1${i % 2}-${pad((i % 25) + 1, 2)}`,
          previousDate: `2025-0${(i % 9) + 1}-10`,
          requirementForNextDateOfHearing: decided ? "—" : "File written arguments / produce record",
          feePaid: `${20000 + i * 1500}`,
          feePayable: `${5000 + (i % 4) * 2500}`,
          caseStatus: categoryStatus(category),
          stage: categoryStage(category, i),
          shortOrder: decided ? "Short order announced" : "—",
          finalOrder: decided ? "Final order placed on record" : "—",
          remarks: sampleRemarks(category, i),
        });
        sr += 1;
      }
    }
  }

  return rows;
}

async function seed() {
  try {
    await sequelize.authenticate();
    // Schema comes from `npm run db:migrate`. Seed only upserts reference/demo rows.
    const overwriteCases = process.env.SEED_OVERWRITE_CASES === "true";

    const permissionMap = {};
    for (const def of PERMISSIONS) {
      const permission = await upsertPermission(def);
      permissionMap[permission.key] = permission;
    }

    const roleMap = {};
    for (const def of ROLE_DEFS) {
      const role = await upsertRole(def);
      roleMap[role.slug] = role;

      const allowedIds = [];
      for (const key of def.permissions) {
        const permission = permissionMap[key];
        allowedIds.push(permission.id);
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

      // Revoke permissions no longer assigned to this role
      await RolePermission.destroy({
        where: {
          roleId: role.id,
          permissionId: { [Op.notIn]: allowedIds },
        },
      });
    }

    await AppSetting.findOrCreate({
      where: { key: "modules" },
      defaults: {
        key: "modules",
        value: {
          showInternalModule: true,
          showExternalModule: true,
          showChartsModule: true,
        },
      },
    });

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

    for (const courtDef of COURTS) {
      const [court, created] = await Court.findOrCreate({
        where: { slug: courtDef.slug },
        defaults: {
          slug: courtDef.slug,
          name: courtDef.name,
          layer: courtDef.layer,
          categories: courtDef.categories,
          sortOrder: courtDef.sortOrder,
          isActive: true,
        },
      });

      if (!created) {
        await court.update({
          name: courtDef.name,
          layer: courtDef.layer,
          categories: courtDef.categories,
          sortOrder: courtDef.sortOrder,
          // Preserve existing isActive (do not reactivate deactivated courts).
        });
      }
    }

    const dbCourts = await Court.findAll({ where: { isActive: true } });
    const courtBySlug = Object.fromEntries(dbCourts.map((c) => [c.slug, c]));
    const demoCases = buildDemoCases(COURTS);
    let casesCreated = 0;
    let casesUpdated = 0;
    let casesKept = 0;

    for (const row of demoCases) {
      const court = courtBySlug[row.courtSlug];
      const [caseRow, created] = await Case.findOrCreate({
        where: {
          courtSlug: row.courtSlug,
          caseCategory: row.caseCategory,
          caseNo: row.caseNo,
        },
        defaults: {
          ...row,
          courtUuid: court?.id || null,
        },
      });

      if (created) {
        casesCreated += 1;
      } else if (overwriteCases) {
        await caseRow.update({
          ...row,
          courtUuid: court?.id || caseRow.courtUuid,
        });
        casesUpdated += 1;
      } else {
        casesKept += 1;
      }
    }

    const { syncNotificationsForUser } = require("../modules/notifications/notifications.service");
    const activeUsers = await User.findAll({ where: { status: "Active" } });
    for (const user of activeUsers) {
      await syncNotificationsForUser(user.id);
    }

    console.log("Seed completed:");
    console.log(`- Roles: ${ROLE_DEFS.length}`);
    console.log(`- Permissions: ${PERMISSIONS.length}`);
    console.log(`- Users: ${USERS.length}`);
    console.log(`- Courts: ${COURTS.length}`);
    console.log(
      `- Cases: created ${casesCreated}, updated ${casesUpdated}, kept ${casesKept}` +
        (overwriteCases ? " (SEED_OVERWRITE_CASES=true)" : " (existing demo cases preserved)"),
    );
    console.log(`- Notification inboxes synced: ${activeUsers.length}`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seed();

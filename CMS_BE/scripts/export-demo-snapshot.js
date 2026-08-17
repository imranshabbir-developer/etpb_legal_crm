require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const { sequelize } = require("../src/config/database");
const { Case, Court } = require("../src/models");

const SNAPSHOT_PATH = path.join(__dirname, "../src/database/data/demo-snapshot.json");
const TEST_COURT_RE = /^(smoke-test-court-|e2e-court-)/i;

const CASE_FIELDS = [
  "srNo",
  "caseNo",
  "dateOfInstitution",
  "caseCategory",
  "propertyLandDemandNo",
  "lotNo",
  "areaMeasuring",
  "propertyLandStatus",
  "caseTitled",
  "nameOfCourt",
  "courtSlug",
  "layer",
  "nameOfCounsel",
  "dateOfEntrustmentToCounsel",
  "todayCourtProceedings",
  "nextDateOfHearing",
  "nextDateProceedings",
  "dateOfDecision",
  "decidedInFavourOfIps",
  "decidedAgainstIps",
  "fillingOfAppeal",
  "dateGistOfProceedings",
  "proceedingDate",
  "previousDate",
  "requirementForNextDateOfHearing",
  "feePaid",
  "feePayable",
  "caseStatus",
  "stage",
  "shortOrder",
  "finalOrder",
  "remarks",
];

function pickCase(row) {
  const out = {};
  for (const key of CASE_FIELDS) {
    out[key] = row[key] ?? "";
  }
  out.srNo = Number(row.srNo);
  return out;
}

async function main() {
  await sequelize.authenticate();

  const courts = await Court.findAll({
    order: [
      ["layer", "ASC"],
      ["sortOrder", "ASC"],
      ["name", "ASC"],
    ],
  });

  const officialCourts = courts.filter((court) => !TEST_COURT_RE.test(court.slug));
  const officialSlugs = officialCourts.map((court) => court.slug);

  const cases = await Case.findAll({
    where: { courtSlug: { [Op.in]: officialSlugs } },
    order: [
      ["srNo", "ASC"],
      ["caseNo", "ASC"],
    ],
  });

  const snapshot = {
    exportedAt: new Date().toISOString(),
    courts: officialCourts.map((court) => ({
      slug: court.slug,
      name: court.name,
      layer: court.layer,
      categories: Array.isArray(court.categories) ? court.categories : [],
      sortOrder: court.sortOrder,
      isActive: court.isActive,
    })),
    cases: cases.map((row) => pickCase(row.get({ plain: true }))),
  };

  fs.mkdirSync(path.dirname(SNAPSHOT_PATH), { recursive: true });
  fs.writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  console.log(`Wrote ${SNAPSHOT_PATH}`);
  console.log(`- Courts: ${snapshot.courts.length}`);
  console.log(`- Cases: ${snapshot.cases.length}`);
  await sequelize.close();
}

main().catch((error) => {
  console.error("Export failed:", error);
  process.exit(1);
});

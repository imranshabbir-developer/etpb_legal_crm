const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../config/database");

class Case extends Model {
  toApiJSON() {
    return {
      id: this.id,
      srNo: this.srNo,
      caseNo: this.caseNo,
      dateOfInstitution: this.dateOfInstitution || "",
      caseCategory: this.caseCategory,
      propertyLandDemandNo: this.propertyLandDemandNo || "",
      lotNo: this.lotNo || "",
      areaMeasuring: this.areaMeasuring || "",
      propertyLandStatus: this.propertyLandStatus || "",
      caseTitled: this.caseTitled || "",
      nameOfCourt: this.nameOfCourt || "",
      courtId: this.courtSlug,
      layer: this.layer,
      nameOfCounsel: this.nameOfCounsel || "",
      dateOfEntrustmentToCounsel: this.dateOfEntrustmentToCounsel || "",
      todayCourtProceedings: this.todayCourtProceedings || "",
      nextDateOfHearing: this.nextDateOfHearing || "",
      nextDateProceedings: this.nextDateProceedings || "",
      dateOfDecision: this.dateOfDecision || "",
      decidedInFavourOfIps: this.decidedInFavourOfIps || "",
      decidedAgainstIps: this.decidedAgainstIps || "",
      fillingOfAppeal: this.fillingOfAppeal || "",
      dateGistOfProceedings: this.dateGistOfProceedings || "",
      proceedingDate: this.proceedingDate || "",
      previousDate: this.previousDate || "",
      requirementForNextDateOfHearing: this.requirementForNextDateOfHearing || "",
      feePaid: this.feePaid || "",
      feePayable: this.feePayable || "",
      caseStatus: this.caseStatus || "",
      stage: this.stage || "",
      shortOrder: this.shortOrder || "",
      finalOrder: this.finalOrder || "",
      remarks: this.remarks || "",
    };
  }
}

const text = (field, length = 500) => ({
  type: DataTypes.STRING(length),
  allowNull: false,
  defaultValue: "",
  field,
});

const longText = (field) => ({
  type: DataTypes.TEXT,
  allowNull: false,
  defaultValue: "",
  field,
});

Case.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    srNo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "sr_no",
    },
    caseNo: {
      type: DataTypes.STRING(120),
      allowNull: false,
      field: "case_no",
    },
    dateOfInstitution: text("date_of_institution", 40),
    caseCategory: {
      type: DataTypes.ENUM(
        "decided-cases",
        "pending-cases",
        "restraining-order",
        "direction-cases",
      ),
      allowNull: false,
      field: "case_category",
    },
    propertyLandDemandNo: text("property_land_demand_no", 120),
    lotNo: text("lot_no", 80),
    areaMeasuring: text("area_measuring", 120),
    propertyLandStatus: text("property_land_status", 200),
    caseTitled: text("case_titled", 400),
    nameOfCourt: text("name_of_court", 200),
    courtSlug: {
      type: DataTypes.STRING(80),
      allowNull: false,
      field: "court_slug",
    },
    courtUuid: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "court_uuid",
    },
    layer: {
      type: DataTypes.ENUM("internal", "external"),
      allowNull: false,
    },
    nameOfCounsel: text("name_of_counsel", 200),
    dateOfEntrustmentToCounsel: text("date_of_entrustment_to_counsel", 40),
    todayCourtProceedings: longText("today_court_proceedings"),
    nextDateOfHearing: text("next_date_of_hearing", 40),
    nextDateProceedings: longText("next_date_proceedings"),
    dateOfDecision: text("date_of_decision", 40),
    decidedInFavourOfIps: text("decided_in_favour_of_ips", 40),
    decidedAgainstIps: text("decided_against_ips", 40),
    fillingOfAppeal: text("filling_of_appeal", 40),
    dateGistOfProceedings: longText("date_gist_of_proceedings"),
    proceedingDate: text("proceeding_date", 40),
    previousDate: text("previous_date", 40),
    requirementForNextDateOfHearing: longText("requirement_for_next_date_of_hearing"),
    feePaid: text("fee_paid", 40),
    feePayable: text("fee_payable", 40),
    caseStatus: text("case_status", 80),
    stage: text("stage", 120),
    shortOrder: longText("short_order"),
    finalOrder: longText("final_order"),
    remarks: longText("remarks"),
  },
  {
    sequelize,
    modelName: "Case",
    tableName: "cases",
    indexes: [
      { fields: ["court_slug"] },
      { fields: ["layer"] },
      { fields: ["case_category"] },
      { fields: ["next_date_of_hearing"] },
      { fields: ["case_no"] },
      {
        unique: true,
        name: "cases_court_category_caseno_uq",
        fields: ["court_slug", "case_category", "case_no"],
      },
    ],
  },
);

module.exports = { Case };

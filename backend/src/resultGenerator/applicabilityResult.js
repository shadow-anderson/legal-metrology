const { randomUUID } = require("crypto");

const createApplicabilityResult = ({
  inspectionId,
  status,
  contextSnapshot = {},
  applicableRules = [],
  applicableSchedules = [],
  exemptions = [],
  reasons = []
}) => {

  return {
    id: randomUUID(),

    inspectionId,

    status,

    contextSnapshot,

    applicableRules,

    applicableSchedules,

    exemptions,

    reasons,

    confirmedByOfficerId: null,

    confirmedAt: null,

    evaluatedAt:
      new Date().toISOString()
  };
};

module.exports = {
  createApplicabilityResult
};
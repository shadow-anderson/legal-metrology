const { loadAllRules } = require("./ruleLoader");
const {
  evaluateApplicability
} = require("./applicabilityEngine");

const rules = loadAllRules();

const r3 = rules.find(
  (rule) => rule.rule_id === "R3"
);


const testCases = [
  {
    name: "10kg Biscuits",
    product: {
      commodity_name: "Biscuits",
      net_quantity: {
        value: 10,
        unit: "kg"
      },
      is_industrial_consumer: false,
      is_institutional_consumer: false
    }
  },

  {
    name: "30kg Biscuits",
    product: {
      commodity_name: "Biscuits",
      net_quantity: {
        value: 30,
        unit: "kg"
      },
      is_industrial_consumer: false,
      is_institutional_consumer: false
    }
  },

  {
    name: "30kg Cement",
    product: {
      commodity_name: "Cement",
      net_quantity: {
        value: 30,
        unit: "kg"
      },
      is_industrial_consumer: false,
      is_institutional_consumer: false
    }
  },

  {
    name: "50kg Fertilizer",
    product: {
      commodity_name: "Fertilizer",
      net_quantity: {
        value: 50,
        unit: "kg"
      },
      is_industrial_consumer: false,
      is_institutional_consumer: false
    }
  },

  {
    name: "Industrial Consumer",
    product: {
      commodity_name: "Biscuits",
      net_quantity: {
        value: 10,
        unit: "kg"
      },
      is_industrial_consumer: true,
      is_institutional_consumer: false
    }
  },

  {
    name: "Missing Quantity",
    product: {
      commodity_name: "Biscuits",
      is_industrial_consumer: false,
      is_institutional_consumer: false
    }
  }
];


for (const testCase of testCases) {
  const result = evaluateApplicability(
    r3,
    testCase
  );

  console.log("\n-------------------------");
  console.log(testCase.name);
  console.log("-------------------------");

  console.log("Applicable:", result.applicable);
  console.log("Status:", result.status);
  console.log("Reason:", result.reason);
}
function Results({
  onProceedToVerification,
  onProceedToFinal,
}) {
  /*TEST MODE*/
  const TEST_RESULT = "NEEDS VERIFICATION";

  /* MOCK DATA */
  const inspection = {
    inspectionId: "INS-00124",

    status: TEST_RESULT,

    product: {
      name: "ABC Biscuits",
      category: "Biscuits",
      mrp: "₹50",
      netQuantity: "100 g",
      manufacturer: "ABC Foods Pvt Ltd",
      manufactureDate: "08/2026",
    },

    rules: [
      {
        reference: "Rule 6(1)(c)",
        status: "PASS",
        message: "Net quantity declaration is present",
        confidence: 97,
      },
      {
        reference: "Rule 7(2)",
        status: "FAIL",
        message: "Numeral height appears below the minimum requirement",
        confidence: 92,
      },
      {
        reference: "Rule 8",
        status: "VERIFY",
        message: "Declaration could not be confidently verified",
        confidence: 61,
      },
    ],
  };

  /* RESULT CONFIGURATION */
  const resultConfig = {
    PASS: {
      title: "COMPLIANT",
      subtitle: "The product appears to meet all applicable compliance requirements.",
      icon: "✓",
      iconBackground: "#d1e7dd",
      iconColor: "#198754",
      cardBackground: "#eefaf3",
      borderColor: "#198754",
      titleColor: "text-success",
      badgeClass: "bg-success-subtle text-success",
      badgeText: "✓ Passed",
    },

    FAIL: {
      title: "NON-COMPLIANT",
      subtitle: "One or more compliance requirements have failed.",
      icon: "✕",
      iconBackground: "#f8d7da",
      iconColor: "#dc3545",
      cardBackground: "#fff2f3",
      borderColor: "#dc3545",
      titleColor: "text-danger",
      badgeClass: "bg-danger-subtle text-danger",
      badgeText: "✕ Failed",
    },

    "NEEDS VERIFICATION": {
      title: "NEEDS VERIFICATION",
      subtitle: "Some compliance requirements require inspector review.",
      icon: "!",
      iconBackground: "#ffe8a3",
      iconColor: "#997404",
      cardBackground: "#fff8e6",
      borderColor: "#f0ad00",
      titleColor: "text-warning-emphasis",
      badgeClass: "bg-warning-subtle text-warning-emphasis",
      badgeText: "⚠ Review Required",
    },
  };

  const currentResult = resultConfig[inspection.status];

  /* COUNT RESULTS */
  const passedCount = inspection.rules.filter(
    (rule) => rule.status === "PASS"
  ).length;

  const failedCount = inspection.rules.filter(
    (rule) => rule.status === "FAIL"
  ).length;

  const verifyCount = inspection.rules.filter(
    (rule) => rule.status === "VERIFY"
  ).length;

  /* STATUS HELPERS */
  const getStatusClass = (status) => {
    if (status === "PASS") {
      return "bg-success-subtle text-success";
    }
    if (status === "FAIL") {
      return "bg-danger-subtle text-danger";
    }
    return "bg-warning-subtle text-warning-emphasis";
  };

  const getRuleBorder = (status) => {
    if (status === "PASS") {
      return "#d1e7dd";
    }
    if (status === "FAIL") {
      return "#f5c2c7";
    }
    return "#ffe69c";
  };

  /* BUTTON ACTION */
  const handleContinue = () => {
    if (inspection.status === "NEEDS VERIFICATION") {
      onProceedToVerification();
    } else {
      onProceedToFinal();
    }
  };

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#f5f7fa" }}>
      <div className="container">
        {/* HEADER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <p className="text-primary fw-semibold mb-1"> Inspection Results </p>
            <h2 className="fw-bold mb-1"> Inspection Review</h2>
            <p className="text-muted mb-0"> Review the AI-generated inspection findings.</p>
          </div>

          <div className="text-md-end">
            <small className="text-muted d-block"> Inspection ID </small>
            <span className="fw-bold"> {inspection.inspectionId}</span>
          </div>
        </div>

        {/* OVERALL RESULT */}
        <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden"
         style={{ backgroundColor: currentResult.cardBackground, borderLeft: `6px solid ${currentResult.borderColor}`,}}>
          <div className="card-body p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">

              {/* Result title */}
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  style={{ width: "64px", height: "64px", backgroundColor: currentResult.iconBackground, color: currentResult.iconColor, fontSize: "30px", fontWeight: "bold",}}>
                  {currentResult.icon}
                </div>

                <div>
                  <small className="text-muted fw-semibold"> OVERALL INSPECTION RESULT </small>
                  <h2 className={`fw-bold mt-1 mb-1 ${currentResult.titleColor}`}> {currentResult.title} </h2>
                  <p className="text-muted mb-0"> {currentResult.subtitle} </p>
                </div>
              </div>

              {/* Result summary */}
              <div className="text-md-end">
                <div className="mb-2">
                  <span className={`badge rounded-pill ${currentResult.badgeClass} px-4 py-2 fs-6`}>
                    {currentResult.badgeText}
                  </span>
                </div>

                <small className="text-muted">
                  {passedCount} Passed • {failedCount} Failed •{" "}
                  {verifyCount} Requires Verification
                </small>
              </div>
            </div>
          </div>
        </div>

        {/*  PRODUCT INFORMATION  */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <h4 className="fw-bold mb-1"> Product Information</h4>
            <p className="text-muted mb-4"> Information extracted from the product images.</p>

            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <small className="text-muted"> Product Name</small>
                <p className="fw-semibold mb-0"> {inspection.product.name}</p>
              </div>

              <div className="col-md-6 col-lg-4">
                <small className="text-muted"> Category</small>
                <p className="fw-semibold mb-0"> {inspection.product.category}</p>
              </div>

              <div className="col-md-6 col-lg-4">
                <small className="text-muted"> MRP </small>
                <p className="fw-semibold mb-0"> {inspection.product.mrp} </p>
              </div>

              <div className="col-md-6 col-lg-4">
                <small className="text-muted"> Net Quantity </small>
                <p className="fw-semibold mb-0"> {inspection.product.netQuantity} </p>
              </div>

              <div className="col-md-6 col-lg-4">
                <small className="text-muted"> Manufacturer</small>
                <p className="fw-semibold mb-0"> {inspection.product.manufacturer} </p>
              </div>

              <div className="col-md-6 col-lg-4">
                <small className="text-muted"> Manufacture Date </small>
                <p className="fw-semibold mb-0"> {inspection.product.manufactureDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* COMPLIANCE RESULTS */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="mb-4">
              <h4 className="fw-bold mb-1"> Compliance Results</h4>
              <p className="text-muted mb-0"> AI and rule-engine findings for this inspection.</p>
            </div>

            <div className="d-flex flex-column gap-3">
              {inspection.rules.map((rule, index) => (
                <div key={index} className="rounded-4 p-3"
                 style={{ border: `1px solid ${getRuleBorder(rule.status)}`, backgroundColor: rule.status === "FAIL" ? "#fffafa" : "#ffffff",}}>
                  <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                    <div className="d-flex gap-3">

                      {/* Status Icon */}
                      <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{ width: "44px", height: "44px",
                          backgroundColor: rule.status === "PASS" ? "#e8f7ee" : rule.status === "FAIL" ? "#fdecec" : "#fff5d9",
                          color: rule.status === "PASS" ? "#198754" : rule.status === "FAIL" ? "#dc3545" : "#997404",
                          fontWeight: "bold", fontSize: "20px",}}>
                        {rule.status === "PASS" ? "✓" : rule.status === "FAIL" ? "✕" : "!"}
                      </div>

                      {/* Rule Details */}
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center flex-wrap gap-2 mb-1">
                          <span className="fw-bold"> {rule.reference} </span>
                          <span className={`badge rounded-pill ${getStatusClass( rule.status)}`}>
                            {rule.status}
                          </span>
                        </div>

                        <p className="text-muted mb-2"> {rule.message}</p>

                        {/* Confidence Bar */}
                        <div className="progress" style={{ height: "6px", maxWidth: "400px",}}>
                          <div className={ rule.status === "PASS" ? "progress-bar bg-success" : rule.status === "FAIL" ? "progress-bar bg-danger" : "progress-bar bg-warning"}
                            role="progressbar" style={{ width: `${rule.confidence}%`,}}/>
                        </div>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="text-md-end">
                      <small className="text-muted d-block"> Confidence </small>
                      <span className={`fw-bold fs-5 ${ rule.status === "PASS" ? "text-success" : rule.status === "FAIL" ? "text-danger" : "text-warning-emphasis"}`}>
                        {rule.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* STATUS-SPECIFIC NOTICE */}
        {inspection.status === "PASS" && (
          <div className="alert alert-success border-0 rounded-4 p-4 mb-4">
            <div className="d-flex gap-3">
              <div style={{ fontSize: "22px" }}> ✓ </div>
              <div>
                <h6 className="fw-bold"> Inspection Passed </h6>
                <p className="mb-0">
                  The AI and rule engine found no blocking compliance
                  violations. You can proceed to the final result.
                </p>
              </div>
            </div>
          </div>
        )}

        {inspection.status === "FAIL" && (
          <div className="alert alert-danger border-0 rounded-4 p-4 mb-4">
            <div className="d-flex gap-3">
              <div style={{ fontSize: "22px" }}> ✕ </div>
              <div>
                <h6 className="fw-bold"> Compliance Violation Detected</h6>
                <p className="mb-0">
                  The inspection contains one or more failed compliance
                  requirements. Review the findings before finalizing.
                </p>
              </div>
            </div>
          </div>
        )}

        {inspection.status === "NEEDS VERIFICATION" && (
          <div className="alert alert-warning border-0 rounded-4 p-4 mb-4">
            <div className="d-flex gap-3">
              <div style={{ fontSize: "22px" }}> ⚠ </div>
              <div> 
                <h6 className="fw-bold"> Inspector Verification Required</h6>
                <p className="mb-0">
                  The AI could not confidently determine all findings.
                  Review the extracted information and evidence before
                  completing this inspection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h5 className="fw-bold mb-1"> {inspection.status === "NEEDS VERIFICATION" ? "Review the findings" : "Complete the inspection"} </h5>
                <p className="text-muted mb-0"> {inspection.status === "NEEDS VERIFICATION" ? "Verify the information and evidence before finalizing." : "Proceed to the final inspection result."}</p>
              </div>

              <button type="button" className="btn btn-primary btn-lg px-5 rounded-3" onClick={handleContinue}>
                {inspection.status === "NEEDS VERIFICATION" ? "Proceed to Verification →" : "View Final Result →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;
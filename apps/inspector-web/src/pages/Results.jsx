import { useMemo } from "react";

function Results({
  extractedData,
  onProceedToVerification,
  onNewInspection,
}) {
  /* MOCK RULE RESULTS */

  const ruleResults = [
    {
      ruleId: "R6",
      ruleVersion: "1.0",
      checkId: "R6_1_C",
      status: "PASS",
      message: "Net quantity declaration detected",
      observedValue: "250 g",
      requiredValue: "Declaration required",
      confidence: 0.97,
    },

    {
      ruleId: "R7",
      ruleVersion: "1.0",
      checkId: "R7_FONT_HEIGHT",
      status: "PASS",
      message: "Required declaration font height verified",
      observedValue: "2.2 mm",
      requiredValue: "Minimum applicable height",
      confidence: 0.95,
    },

    {
      ruleId: "R8",
      ruleVersion: "1.0",
      checkId: "R8_PDP_AREA",
      status: "PASS",
      message: "Principal display panel area verified",
      observedValue: "420 cm²",
      requiredValue: "Applicable PDP requirement",
      confidence: 0.96,
    },

    {
      ruleId: "R9",
      ruleVersion: "1.0",
      checkId: "R9_DECLARATIONS",
      status: "PASS",
      message: "Declaration requires inspector verification",
      observedValue: "AI evidence available",
      requiredValue: "Human verification required",
      confidence: 0.61,
    },

    {
      ruleId: "R10",
      ruleVersion: "1.0",
      checkId: "R10_LABEL",
      status: "PASS",
      message: "Label declaration requires human verification",
      observedValue: "AI extracted data",
      requiredValue: "Inspector confirmation",
      confidence: 0.72,
    },

    {
      ruleId: "R12",
      ruleVersion: "1.0",
      checkId: "R12_QUANTITY",
      status: "PASS",
      message: "Declared quantity is available for compliance checking",
      observedValue: "250 g",
      requiredValue: "Mass declaration",
      confidence: 0.97,
    },

    {
      ruleId: "R13",
      ruleVersion: "1.0",
      checkId: "R13_UNIT",
      status: "PASS",
      message: "Quantity unit is consistent with the declared quantity",
      observedValue: "g",
      requiredValue: "Mass unit",
      confidence: 0.97,
    },
  ];

  /* CALCULATE OVERALL RESULT */
  const overallStatus = useMemo(() => {
    const hasFail = ruleResults.some(
      (rule) => rule.status === "FAIL"
    );
    const needsVerification = ruleResults.some(
      (rule) => rule.status === "REQUIRES_VERIFICATION"
    );
    if (hasFail) {
      return "FAIL";
    }
    if (needsVerification) {
      return "REQUIRES_VERIFICATION";
    }
    return "PASS";
  }, []);

  /* COUNTS */
  const passCount = ruleResults.filter(
    (rule) => rule.status === "PASS"
  ).length;
  const failCount = ruleResults.filter(
    (rule) => rule.status === "FAIL"
  ).length;
  const verificationCount = ruleResults.filter(
    (rule) => rule.status === "REQUIRES_VERIFICATION"
  ).length;

  /* STATUS HELPERS */
  const getStatusText = (status) => {
    if (status === "PASS") {
      return "PASS";
    }
    if (status === "FAIL") {
      return "FAIL";
    }
    return "NEEDS HUMAN VERIFICATION";
  };

  const getStatusIcon = (status) => {
    if (status === "PASS") {
      return "✓";
    }
    if (status === "FAIL") {
      return "✕";
    }
    return "!";
  };

  const getStatusColor = (status) => {
    if (status === "PASS") {
      return {
        backgroundColor: "#d1e7dd",
        color: "#198754",
      };
    }
    if (status === "FAIL") {
      return {
        backgroundColor: "#f8d7da",
        color: "#dc3545",
      };
    }
    return {
      backgroundColor: "#fff3cd",
      color: "#997404",
    };
  };

  const getStatusBadge = (status) => {
    if (status === "PASS") {
      return (
        <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2">
          PASS
        </span>
      );
    }
    if (status === "FAIL") {
      return (
        <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2">
          FAIL
        </span>
      );
    }
    return (
      <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-2">
        NEEDS HUMAN VERIFICATION
      </span>
    );
  };

  /* PRODUCT DATA */
  const getField = (fieldName, fallback = "Not detected") => {
    return (
      extractedData.find(
        (field) => field.fieldName === fieldName
      )?.value || fallback
    );
  };

  /* STATUS-SPECIFIC VISUAL CONFIG */
  const statusConfig = {
    PASS: {
      icon: "✓",
      title: "Inspection Passed",
      subtitle:
        "All applicable compliance checks have passed successfully.",
      background: "#ecfdf3",
      border: "#b7e4c7",
      iconBackground: "#198754",
      iconColor: "#ffffff",
      headingColor: "#146c43",
      accent: "#198754",
    },

    FAIL: {
      icon: "✕",
      title: "Inspection Failed",
      subtitle:
        "One or more applicable compliance requirements were not satisfied.",
      background: "#fff1f2",
      border: "#f5c2c7",
      iconBackground: "#dc3545",
      iconColor: "#ffffff",
      headingColor: "#b02a37",
      accent: "#dc3545",
    },

    REQUIRES_VERIFICATION: {
      icon: "!",
      title: "Needs Human Verification",
      subtitle:
        "Some compliance checks require inspector review before finalization.",
      background: "#fff9e6",
      border: "#ffe69c",
      iconBackground: "#ffc107",
      iconColor: "#664d03",
      headingColor: "#856404",
      accent: "#997404",
    },
  };

  const currentStatus = statusConfig[overallStatus];

  /* PAGE */

  return (
    <div className="min-vh-100 py-4 py-md-5" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #f5f7fa 100%)",}}>
      <div className="container" style={{ maxWidth: "1180px" }}>

        {/* \TOP HEADER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center justify-content-center rounded-3"
                style={{ width: "48px", height: "48px", backgroundColor: "#e8f0fe", color: "#0d6efd", fontSize: "22px",}}>
                📋
              </div>

              <div>
                <h2 className="fw-bold mb-1" style={{ letterSpacing: "-0.5px" }}> Inspection Results</h2>
                <p className="text-muted mb-0">
                  Final compliance assessment for the inspected product.
                </p>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-white text-dark border rounded-pill px-3 py-2"> INS-001</span>
            <span className="badge bg-white text-dark border rounded-pill px-3 py-2"> INS-2026-0001</span>
            <span className="badge bg-light text-secondary border rounded-pill px-3 py-2"> Label Compliance</span>
          </div>
        </div>

        {/* \ OVERALL RESULT HERO */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4" style={{ border: `1px solid ${currentStatus.border}`,}}>
          <div style={{ height: "5px", backgroundColor: currentStatus.accent,}}/>
          <div className="card-body p-4 p-md-5" style={{ backgroundColor: currentStatus.background, }}>
            <div className="row align-items-center g-4">

              {/* STATUS */}
              <div className="col-lg-8">
                <div className="d-flex align-items-center gap-4">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "86px", height: "86px", backgroundColor: currentStatus.iconBackground,
                      color: currentStatus.iconColor, fontSize: "40px", fontWeight: "700", boxShadow: "0 8px 20px rgba(0,0,0,0.08)",}}>
                    {currentStatus.icon}
                  </div>

                  <div>
                    <div className="small fw-semibold mb-2" style={{ color: currentStatus.headingColor, letterSpacing: "1px", }}>
                      OVERALL INSPECTION RESULT
                    </div>
                    <h1 className="fw-bold mb-2" style={{ color: currentStatus.headingColor, fontSize: "clamp(1.7rem, 4vw, 2.5rem)", }}>
                      {currentStatus.title}
                    </h1>
                    <p className="mb-0 text-secondary">
                      {currentStatus.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* COUNTS */}
              <div className="col-lg-4">
                <div className="bg-white rounded-4 border p-3">
                  <div className="row text-center">
                    <div className="col-4 border-end">
                      <div className="fw-bold fs-3" style={{ color: "#198754" }}> {passCount}</div>
                      <div className="small text-muted"> Passed</div>
                    </div>

                    <div className="col-4 border-end">
                      <div className="fw-bold fs-3" style={{ color: "#dc3545" }}> {failCount} </div>
                      <div className="small text-muted"> Failed </div>
                    </div>

                    <div className="col-4">
                      <div className="fw-bold fs-3" style={{ color: "#997404" }}> {verificationCount} </div>
                      <div className="small text-muted"> Review </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCT SUMMARY */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h4 className="fw-bold mb-1"> Product Information</h4>
                <p className="text-muted small mb-0"> Information used during the compliance assessment </p>
              </div>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2"> AI Extracted</span>
            </div>

            <div className="row g-3">
              {/* PRODUCT */}
              <div className="col-md-6 col-lg-4">
                <div className="rounded-3 p-3 h-100" style={{ backgroundColor: "#f8fafc" }}>
                  <small className="text-muted d-block mb-1"> Product Name </small>
                  <strong> {getField("PRODUCT_NAME")} </strong>
                </div>
              </div>

              {/* CATEGORY */}
              <div className="col-md-6 col-lg-4">
                <div className="rounded-3 p-3 h-100" style={{ backgroundColor: "#f8fafc" }}>
                  <small className="text-muted d-block mb-1"> Category </small>
                  <strong> Biscuits </strong>
                </div>
              </div>

              {/* QUANTITY */}
              <div className="col-md-6 col-lg-4">
                <div className="rounded-3 p-3 h-100" style={{ backgroundColor: "#f8fafc" }}>
                  <small className="text-muted d-block mb-1"> Net Quantity </small>
                  <strong> {getField("NET_QTY")} </strong>
                </div>
              </div>


              {/* MRP */}
              <div className="col-md-6 col-lg-4">
                <div className="rounded-3 p-3 h-100" style={{ backgroundColor: "#f8fafc" }}>
                  <small className="text-muted d-block mb-1"> MRP </small>
                  <strong> {getField("MRP")} </strong>
                </div>
              </div>

              {/* MANUFACTURER */}
              <div className="col-md-6 col-lg-4">
                <div className="rounded-3 p-3 h-100" style={{ backgroundColor: "#f8fafc" }}>
                  <small className="text-muted d-block mb-1"> Manufacturer </small>
                  <strong> {getField("MANUFACTURER")} </strong>
                </div>
              </div>

              {/* TYPE */}
              <div className="col-md-6 col-lg-4">
                <div className="rounded-3 p-3 h-100" style={{ backgroundColor: "#f8fafc" }}>
                  <small className="text-muted d-block mb-1"> Inspection Type </small>
                  <strong> Label Compliance </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COMPLIANCE CHECKS */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
              <div>
                <h4 className="fw-bold mb-1"> Compliance Checks</h4>
                <p className="text-muted small mb-0"> Applicable rules evaluated during this inspection.</p>
              </div>
              <span className="badge bg-light text-dark border rounded-pill px-3 py-2"> {ruleResults.length} checks evaluated</span>
            </div>

            <div className="d-flex flex-column gap-3">
              {ruleResults.map((rule) => {
                const ruleColor = getStatusColor(rule.status);
                return (
                  <div key={`${rule.ruleId}-${rule.checkId}`} className="rounded-4 p-3 p-md-4"
                    style={{ border: "1px solid #e9ecef", backgroundColor: "#ffffff", borderLeft: `4px solid ${ruleColor.color}`,}}>
                    <div className="row g-3">
                      {/* ICON */}
                      <div className="col-auto">
                        <div className="rounded-circle d-flex align-items-center justify-content-center"
                         style={{ width: "46px", height: "46px", ...ruleColor, fontWeight: "700", fontSize: "19px",}}>
                          {getStatusIcon(rule.status)}
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="col">
                        <div className="d-flex flex-column flex-md-row justify-content-between gap-3">
                          <div>
                            <div className="d-flex align-items-center flex-wrap gap-2 mb-2">
                              <span className="fw-bold" style={{ fontSize: "17px" }}> {rule.ruleId} </span>
                              <span className="badge bg-light text-secondary border"> {rule.checkId} </span>
                            </div>
                            <div className="fw-semibold mb-1"> {rule.message} </div>
                          </div>

                          <div className="flex-shrink-0"> {getStatusBadge(rule.status)}
                          </div>
                        </div>

                        {/* VALUES */}
                        <div className="row g-3 mt-2 pt-3" style={{ borderTop: "1px solid #f0f0f0", }}>
                          <div className="col-md-4">
                            <small className="text-muted d-block mb-1"> Observed Value</small>
                            <div className="fw-semibold"> {rule.observedValue}</div>
                          </div>

                          <div className="col-md-4">
                            <small className="text-muted d-block mb-1"> Required Value</small>
                            <div className="fw-semibold"> {rule.requiredValue}</div>
                          </div>

                          <div className="col-md-4">
                            <small className="text-muted d-block mb-1"> AI Confidence</small>
                            <div className="d-flex align-items-center gap-2">
                              <div className="progress flex-grow-1" style={{ height: "6px", maxWidth: "100px",}}>
                                <div className="progress-bar" role="progressbar"
                                  style={{ width: `${Math.round( rule.confidence * 100)}%`,
                                    backgroundColor: rule.confidence < 0.75 ? "#ffc107" : "#198754",}} />
                              </div>

                              <span className="fw-semibold small"> {Math.round( rule.confidence * 100)} %</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 
        INSPECTION CONTEXT */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="d-flex align-items-center justify-content-center rounded-3"
                style={{ width: "42px", height: "42px", backgroundColor: "#f1f3f5", fontSize: "19px",}}>
                ⚙
              </div>

              <div>
                <h4 className="fw-bold mb-1"> Inspection Context </h4>
                <p className="text-muted small mb-0"> Context used by the compliance rules. </p>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-4">
                <div className="rounded-3 p-3" style={{ backgroundColor: "#f8fafc" }}>
                  <small className="text-muted d-block mb-1"> Package Type </small>
                  <strong>Retail</strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="rounded-3 p-3" style={{ backgroundColor: "#f8fafc" }} >
                  <small className="text-muted d-block mb-1"> Sale Basis </small>
                  <strong>Mass</strong>
                </div>
              </div>

              <div className="col-md-4">
                <div className="rounded-3 p-3" style={{ backgroundColor: "#f8fafc" }}>
                  <small className="text-muted d-block mb-1"> Applicable Schedule </small>
                  <strong>S2</strong>
                </div>
              </div>
            </div>

            {/* PASS MESSAGE */}
            {overallStatus === "PASS" && (
              <div className="rounded-4 p-4 mt-4" style={{ backgroundColor: "#ecfdf3", border: "1px solid #b7e4c7",}}>
                <div className="d-flex gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "38px", height: "38px", backgroundColor: "#198754", color: "#ffffff", fontWeight: "bold",}}>
                    ✓
                  </div>

                  <div>
                    <div className="fw-bold text-success"> Inspection passed </div>
                    <div className="small text-secondary mt-1">
                      All displayed applicable compliance checks
                      have passed successfully.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FAIL MESSAGE */}
            {overallStatus === "FAIL" && (
              <div className="rounded-4 p-4 mt-4" style={{ backgroundColor: "#fff1f2", border: "1px solid #f5c2c7", }}>
                <div className="d-flex gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "38px", height: "38px", backgroundColor: "#dc3545", color: "#ffffff", fontWeight: "bold",}}>
                    ✕
                  </div>

                  <div>
                    <div className="fw-bold text-danger"> Compliance failure detected </div>
                    <div className="small text-secondary mt-1">
                      One or more applicable compliance requirements
                      were not satisfied.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VERIFICATION MESSAGE */}
            {overallStatus === "REQUIRES_VERIFICATION" && (
              <div className="rounded-4 p-4 mt-4" style={{ backgroundColor: "#fff9e6", border: "1px solid #ffe69c",}}>
                <div className="d-flex gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: "38px", height: "38px", backgroundColor: "#ffc107", color: "#664d03", fontWeight: "bold", }}>
                    !
                  </div>

                  <div>
                    <div className="fw-bold text-warning-emphasis"> Inspector action required </div>
                    <div className="small text-secondary mt-1">
                      One or more compliance checks require human
                      verification before this inspection can be finalized.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ACTION PANEL */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4 p-md-5">
            <div className="row align-items-center g-4">
              <div className="col-md">
                <div className="d-flex align-items-start gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                    style={{ width: "44px", height: "44px", 
                      backgroundColor: overallStatus === "PASS" ? "#e8f5e9" : overallStatus === "FAIL" ? "#fdecea" : "#fff3cd",}}>
                    {overallStatus === "PASS" ? "✓" : overallStatus === "FAIL" ? "✕" : "🔍"}
                  </div>

                  <div>
                    <h5 className="fw-bold mb-1">
                      {overallStatus === "REQUIRES_VERIFICATION" ? "Inspector Review Required" : "Inspection Complete"}
                    </h5>
                    <p className="text-muted mb-0 small">
                      {overallStatus === "REQUIRES_VERIFICATION" ? "Review the flagged checks before finalizing the inspection." : "The inspection result is ready to be reported."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-auto">
                <div className="d-flex flex-column flex-sm-row gap-2">
                  {/* NEW INSPECTION */}
                  {overallStatus !== "REQUIRES_VERIFICATION" && (
                    <button type="button" className="btn btn-outline-secondary px-4 rounded-3" onClick={onNewInspection}>
                    + New Inspection
                  </button>

                  )}

                  {/* VERIFICATION */}
                  {overallStatus === "REQUIRES_VERIFICATION" && (
                    <button type="button" className="btn btn-warning px-4 rounded-3 fw-semibold" onClick={onProceedToVerification}>
                      🔍 Review & Verify
                    </button>
                  )}

                  {/* DOWNLOAD */}
                  {overallStatus !== "REQUIRES_VERIFICATION" && (
                    <button type="button" className="btn btn-primary px-4 rounded-3 fw-semibold">
                      📄 Download Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Results;
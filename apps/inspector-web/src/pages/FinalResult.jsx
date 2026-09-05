function FinalResult({ onNewInspection }) {
  const inspection = {
    inspectionId: "INS-00124",
    productName: "ABC Biscuits",
    verifiedBy: "Inspector",
    verifiedAt: "05 Sep 2026, 12:30 PM",

    rules: [
      {
        reference: "Rule 6(1)(c)",
        status: "PASS",
        message: "Net quantity declaration is present",
      },
      {
        reference: "Rule 7(2)",
        status: "FAIL",
        message: "Numeral height is below the minimum requirement",
      },
      {
        reference: "Rule 8",
        status: "PASS",
        message: "Declaration verified by inspector",
      },
    ],
  };

  const passed = inspection.rules.filter(
    (rule) => rule.status === "PASS"
  ).length;

  const failed = inspection.rules.filter(
    (rule) => rule.status === "FAIL"
  ).length;

  return (
    <div
      className="min-vh-100 py-5"
      style={{ backgroundColor: "#f5f7fa" }}
    >
      <div className="container">

        {/* Header */}
        <div className="mb-4">
          <p className="text-primary fw-semibold mb-1">
            Inspection Completed
          </p>

          <h2 className="fw-bold mb-1">
            Final Inspection Result
          </h2>

          <p className="text-muted mb-0">
            The inspection has been reviewed and finalized.
          </p>
        </div>

        {/* Final Status */}
        <div
          className="card border-0 shadow-sm rounded-4 mb-4"
          style={{
            backgroundColor: "#fffafa",
            borderLeft: "6px solid #dc3545",
          }}
        >
          <div className="card-body p-4 p-md-5">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">

              <div className="d-flex align-items-center gap-3">

                <div
                  className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                  style={{
                    width: "70px",
                    height: "70px",
                    backgroundColor: "#fdecec",
                    color: "#dc3545",
                    fontSize: "32px",
                    fontWeight: "bold",
                  }}
                >
                  !
                </div>

                <div>
                  <small className="text-muted fw-semibold">
                    FINAL COMPLIANCE RESULT
                  </small>

                  <h2 className="fw-bold text-danger mb-1 mt-1">
                    NON-COMPLIANT
                  </h2>

                  <p className="text-muted mb-0">
                    One or more compliance requirements failed.
                  </p>
                </div>

              </div>

              <div className="text-md-end">

                <div className="mb-2">
                  <span className="badge rounded-pill bg-danger-subtle text-danger px-4 py-2 fs-6">
                    ✕ Non-Compliant
                  </span>
                </div>

                <small className="text-muted">
                  {passed} Passed • {failed} Failed
                </small>

              </div>

            </div>

          </div>
        </div>

        {/* Inspection Summary */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">

          <div className="card-body p-4">

            <h4 className="fw-bold mb-1">
              Inspection Summary
            </h4>

            <p className="text-muted mb-4">
              Final details recorded for this inspection.
            </p>

            <div className="row g-4">

              <div className="col-md-6 col-lg-3">
                <small className="text-muted d-block">
                  Inspection ID
                </small>

                <span className="fw-semibold">
                  {inspection.inspectionId}
                </span>
              </div>

              <div className="col-md-6 col-lg-3">
                <small className="text-muted d-block">
                  Product
                </small>

                <span className="fw-semibold">
                  {inspection.productName}
                </span>
              </div>

              <div className="col-md-6 col-lg-3">
                <small className="text-muted d-block">
                  Verified By
                </small>

                <span className="fw-semibold">
                  {inspection.verifiedBy}
                </span>
              </div>

              <div className="col-md-6 col-lg-3">
                <small className="text-muted d-block">
                  Verification Time
                </small>

                <span className="fw-semibold">
                  {inspection.verifiedAt}
                </span>
              </div>

            </div>

          </div>
        </div>

        {/* Compliance Summary */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">

          <div className="card-body p-4">

            <div className="mb-4">
              <h4 className="fw-bold mb-1">
                Compliance Summary
              </h4>

              <p className="text-muted mb-0">
                Final status of each compliance requirement.
              </p>
            </div>

            <div className="d-flex flex-column gap-3">

              {inspection.rules.map((rule, index) => (

                <div
                  key={index}
                  className="rounded-4 p-3"
                  style={{
                    border:
                      rule.status === "PASS"
                        ? "1px solid #d1e7dd"
                        : "1px solid #f5c2c7",

                    backgroundColor:
                      rule.status === "PASS"
                        ? "#fbfffc"
                        : "#fffafa",
                  }}
                >

                  <div className="d-flex align-items-center gap-3">

                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{
                        width: "44px",
                        height: "44px",
                        backgroundColor:
                          rule.status === "PASS"
                            ? "#e8f7ee"
                            : "#fdecec",

                        color:
                          rule.status === "PASS"
                            ? "#198754"
                            : "#dc3545",

                        fontSize: "20px",
                        fontWeight: "bold",
                      }}
                    >
                      {rule.status === "PASS" ? "✓" : "✕"}
                    </div>

                    <div className="flex-grow-1">

                      <div className="d-flex align-items-center flex-wrap gap-2 mb-1">

                        <span className="fw-bold">
                          {rule.reference}
                        </span>

                        <span
                          className={`badge rounded-pill ${
                            rule.status === "PASS"
                              ? "bg-success-subtle text-success"
                              : "bg-danger-subtle text-danger"
                          }`}
                        >
                          {rule.status}
                        </span>

                      </div>

                      <p className="text-muted mb-0">
                        {rule.message}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </div>
        </div>

        {/* Verification Record */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">

          <div className="card-body p-4">

            <div className="d-flex align-items-center gap-3">

              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#e8f7ee",
                  color: "#198754",
                  fontSize: "22px",
                }}
              >
                ✓
              </div>

              <div>
                <h5 className="fw-bold mb-1">
                  Inspector Verification Recorded
                </h5>

                <p className="text-muted mb-0">
                  AI findings were reviewed and the inspector's
                  verification has been recorded successfully.
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* Bottom Actions */}
        <div className="card border-0 shadow-sm rounded-4">

          <div className="card-body p-4">

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

              <div>
                <h5 className="fw-bold mb-1">
                  Inspection Complete
                </h5>

                <p className="text-muted mb-0">
                  This inspection is now ready for record and reporting.
                </p>
              </div>

              <div className="d-flex gap-2">

                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 rounded-3"
                  onClick={() => alert("Report download will be connected later.")}
                >
                  ↓ Download Report
                </button>

                <button type="button" className="btn btn-primary px-4 rounded-3" onClick={onNewInspection}>
                      + New Inspection
                </button>

              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default FinalResult;
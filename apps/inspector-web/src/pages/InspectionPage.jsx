function InspectionPage({ onStartInspection, inspector, onLogout }) {
  const pastInspections = [
    {
      id: "INS-001",
      product: "Parle-G Biscuits",
      category: "Biscuits",
      date: "05 Sep 2026",
      status: "Completed",
      result: "Pass",
    },
    {
      id: "INS-002",
      product: "Tata Salt",
      category: "Salt",
      date: "04 Sep 2026",
      status: "Completed",
      result: "Pass",
    },
    {
      id: "INS-003",
      product: "Amul Butter",
      category: "Dairy",
      date: "03 Sep 2026",
      status: "Completed",
      result: "Pass",
    },
    {
      id: "INS-004",
      product: "Dettol Handwash",
      category: "Personal Care",
      date: "02 Sep 2026",
      status: "Completed",
      result: "Fail",
    },
  ];

  const inspectorName = inspector?.name || "Inspector 01";
  const inspectorId = inspector?.id || "INS-001";
  const designation = inspector?.designation || "Senior Inspector";
  const region = inspector?.region || "Bathinda Region";

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f6f8fb", color: "#172033" }}>
      {/* Navbar */}
      <nav className="navbar bg-white border-bottom" style={{ minHeight: "72px" }}>
        <div className="container">
          {/* Brand */}
          <div className="d-flex align-items-center">
            <div className="d-flex align-items-center justify-content-center rounded-3 me-2" style={{ width: "40px", height: "40px", backgroundColor: "#0d6efd", color: "#ffffff", fontSize: "18px", fontWeight: "700" }}>
              SI
            </div>
            <div>
              <div className="fw-bold" style={{ fontSize: "20px", lineHeight: "1.1" }}>
                SmartInspect
              </div>
              <div className="text-muted" style={{ fontSize: "12px" }}>
                Digital Inspection Platform
              </div>
            </div>
          </div>

          {/* Inspector Info */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-none d-md-block text-end">
              <div className="fw-semibold" style={{ fontSize: "14px" }}>
                {inspectorName}
              </div>
              <div className="text-muted" style={{ fontSize: "12px" }}>
                {inspectorId}
              </div>
            </div>
            <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "40px", height: "40px", backgroundColor: "#e8f1ff", color: "#0d6efd", fontSize: "13px", fontWeight: "700" }}>
              {inspector?.initials || "01"}
            </div>
            <button className="btn btn-outline-danger btn-sm px-3 rounded-circle" onClick={onLogout}> Logout </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="container py-5">
        {/* Welcome Section */}
        <div className="row align-items-center mb-5">
          <div className="col-12 col-md-8">
            <div className="text-primary fw-semibold mb-2" style={{ fontSize: "13px", letterSpacing: "0.4px" }}>
              INSPECTOR WORKSPACE
            </div>
            <h1 className="fw-bold mb-2" style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.7px" }}>
              Welcome, {inspectorName}
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "15px" }}>
              Manage your product inspections and review previous inspection
              records.
            </p>
          </div>
          <div className="col-12 col-md-4 mt-4 mt-md-0 text-md-end">
            <button type="button" className="btn btn-primary btn-lg px-4 rounded-3 fw-semibold" onClick={onStartInspection}>
              + New Inspection
            </button>
          </div>
        </div>

        {/* Inspector Profile Card */}
        <div className="card border-0 rounded-4 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="row align-items-center g-4">
              {/* Profile */}
              <div className="col-12 col-md-7">
                <div className="d-flex align-items-center">
                  <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 me-3" style={{ width: "64px", height: "64px", backgroundColor: "#e8f1ff", color: "#0d6efd", fontSize: "18px", fontWeight: "700" }}>
                    {inspector?.initials || "01"}
                  </div>
                  <div>
                    <div className="text-muted mb-1" style={{ fontSize: "12px" }}>
                      INSPECTOR PROFILE
                    </div>
                    <h5 className="fw-bold mb-1">
                      {inspectorName}
                    </h5>
                    <div className="text-muted" style={{ fontSize: "13px" }}>
                      {designation} • {region}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="col-12 col-md-5">
                <div className="rounded-3 p-3" style={{ backgroundColor: "#f8f9fa" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted" style={{ fontSize: "13px" }}>
                      Account Status
                    </span>
                    <span className="badge rounded-pill" style={{ backgroundColor: "#e8f7ee", color: "#198754", padding: "7px 11px", fontSize: "11px" }}>
                      ● Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="row g-3 mb-5">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 rounded-4 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: "42px", height: "42px", backgroundColor: "#e8f1ff", color: "#0d6efd", fontSize: "18px" }}>
                  ✓
                </div>
                <div className="fw-bold" style={{ fontSize: "26px" }}>
                  4
                </div>
                <div className="text-muted" style={{ fontSize: "13px" }}>
                  Total Inspections
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 rounded-4 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: "42px", height: "42px", backgroundColor: "#e8f7ee", color: "#198754", fontSize: "18px" }}>
                  ✓
                </div>
                <div className="fw-bold" style={{ fontSize: "26px" }}>
                  2
                </div>
                <div className="text-muted" style={{ fontSize: "13px" }}>
                  Passed
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 rounded-4 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: "42px", height: "42px", backgroundColor: "#fff4df", color: "#b77900", fontSize: "18px" }}>
                  !
                </div>
                <div className="fw-bold" style={{ fontSize: "26px" }}>
                  0
                </div>
                <div className="text-muted" style={{ fontSize: "13px" }}>
                  Needs Verification
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card border-0 rounded-4 shadow-sm h-100">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: "42px", height: "42px", backgroundColor: "#fdecec", color: "#dc3545", fontSize: "18px" }}>
                  ×
                </div>
                <div className="fw-bold" style={{ fontSize: "26px" }}>
                  1
                </div>
                <div className="text-muted" style={{ fontSize: "13px" }}>
                  Failed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Past Inspections */}
        <div className="card border-0 rounded-4 shadow-sm">
          <div className="card-body p-4 p-md-5">
            {/* Section Header */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4">
              <div>
                <h4 className="fw-bold mb-1">
                  Recent Inspections
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Review your previously completed inspections.
                </p>
              </div>
              <span className="badge rounded-pill text-bg-light px-3 py-2 align-self-start align-self-md-center" style={{ fontSize: "11px" }}>
                {pastInspections.length} Records
              </span>
            </div>

            {/* Desktop Table */}
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr style={{ borderBottom: "1px solid #e9ecef" }}>
                    <th className="text-muted fw-semibold" style={{ fontSize: "12px" }}>
                      INSPECTION ID
                    </th>
                    <th className="text-muted fw-semibold" style={{ fontSize: "12px" }}>
                      PRODUCT
                    </th>
                    <th className="text-muted fw-semibold" style={{ fontSize: "12px" }}>
                      CATEGORY
                    </th>
                    <th className="text-muted fw-semibold" style={{ fontSize: "12px" }}>
                      DATE
                    </th>
                    <th className="text-muted fw-semibold" style={{ fontSize: "12px" }}>
                      STATUS
                    </th>
                    <th className="text-muted fw-semibold" style={{ fontSize: "12px" }}>
                      RESULT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pastInspections.map((inspection) => {
                    let resultClass = "text-bg-success";
                    let resultStyle = {};

                    if (inspection.result === "Fail") {
                      resultClass = "";
                      resultStyle = {
                        backgroundColor: "#fdecec",
                        color: "#dc3545",
                      };
                    }

                    if (inspection.result === "Needs Verification") {
                      resultClass = "";
                      resultStyle = {
                        backgroundColor: "#fff4df",
                        color: "#a66b00",
                      };
                    }

                    return (
                      <tr key={inspection.id}>
                        <td>
                          <span className="fw-semibold" style={{ fontSize: "13px" }}>
                            {inspection.id}
                          </span>
                        </td>
                        <td>
                          <div className="fw-semibold" style={{ fontSize: "13px" }}>
                            {inspection.product}
                          </div>
                        </td>
                        <td>
                          <span className="text-muted" style={{ fontSize: "13px" }}>
                            {inspection.category}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted" style={{ fontSize: "13px" }}>
                            {inspection.date}
                          </span>
                        </td>
                        <td>
                          <span className="badge rounded-pill" style={{ backgroundColor: "#f0f2f5", color: "#495057", fontSize: "10px", padding: "7px 10px" }}>
                            {inspection.status}
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${resultClass}`} style={{ ...resultStyle, fontSize: "10px", padding: "7px 10px" }}>
                            {inspection.result}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Start Inspection CTA */}
        <div className="mt-4">
          <div className="rounded-4 p-4 p-md-5" style={{ backgroundColor: "#eaf2ff", border: "1px solid #d7e6ff" }}>
            <div className="row align-items-center g-4">
              <div className="col-12 col-md-8">
                <div className="text-primary fw-semibold mb-2" style={{ fontSize: "12px" }}>
                  READY TO BEGIN?
                </div>
                <h4 className="fw-bold mb-2">
                  Start a new product inspection
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: "14px", lineHeight: "1.6" }}>
                  Capture product evidence and let SmartInspect analyze
                  declarations and check applicable compliance requirements.
                </p>
              </div>
              <div className="col-12 col-md-4 text-md-end">
                <button type="button" className="btn btn-primary px-4 py-2 rounded-3 fw-semibold" onClick={onStartInspection}>
                  Start Inspection →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-top mt-5" style={{ padding: "22px 0" }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <div className="text-muted" style={{ fontSize: "12px" }}>
              © 2026 SmartInspect
            </div>
            <div className="text-muted" style={{ fontSize: "12px" }}>
              Inspector Portal
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default InspectionPage;
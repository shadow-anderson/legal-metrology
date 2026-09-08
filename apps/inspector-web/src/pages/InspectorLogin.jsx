function InspectorLogin({ onSelectInspector }) {
  const inspectors = [
    {
      id: "INS-001",
      name: "Inspector 01",
      designation: "Senior Inspector",
      region: "Bathinda Region",
      status: "Active",
      initials: "01",
    },
    {
      id: "INS-002",
      name: "Inspector 02",
      designation: "Inspector",
      region: "Patiala Region",
      status: "Active",
      initials: "02",
    },
    {
      id: "INS-003",
      name: "Inspector 03",
      designation: "Inspector",
      region: "Ludhiana Region",
      status: "Active",
      initials: "03",
    },
    {
      id: "INS-004",
      name: "Inspector 04",
      designation: "Inspector",
      region: "Amritsar Region",
      status: "Active",
      initials: "04",
    },
  ];

  const handleInspectorSelect = (inspector) => {
    if (onSelectInspector) {
      onSelectInspector(inspector);
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f6f8fb", color: "#172033" }}>
      {/* Navbar */}
      <nav className="navbar bg-white border-bottom" style={{ minHeight: "72px" }}>
        <div className="container">
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
          <div className="d-none d-sm-flex align-items-center" style={{ fontSize: "14px", color: "#6c757d" }}>
            Inspector Portal
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container py-5">
        {/* Page Header */}
        <div className="text-center mx-auto mb-5" style={{ maxWidth: "720px" }}>
          <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill mb-3" style={{ backgroundColor: "#e8f1ff", color: "#0d6efd", fontSize: "12px", fontWeight: "700", letterSpacing: "0.5px" }}>
            INSPECTOR PORTAL
          </div>
          <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(30px, 4vw, 42px)", letterSpacing: "-0.8px" }}>
            Inspector Login
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: "16px", lineHeight: "1.7" }}>
            Select your inspector profile to access the inspection workspace
            and begin a new product inspection.
          </p>
        </div>

        {/* Inspector Cards */}
        <div className="row g-4 justify-content-center">
          {inspectors.map((inspector) => (
            <div className="col-12 col-sm-6 col-lg-3" key={inspector.id}>
              <div className="card h-100 border-0 rounded-4" style={{ boxShadow: "0 8px 25px rgba(23, 32, 51, 0.07)", transition: "transform 0.2s ease, box-shadow 0.2s ease" }}>
                <div className="card-body p-4 d-flex flex-column">
                  {/* Avatar */}
                  <div className="d-flex justify-content-between align-items-start mb-4">
                    <div className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: "58px", height: "58px", backgroundColor: "#e8f1ff", color: "#0d6efd", fontSize: "16px", fontWeight: "700" }}>
                      {inspector.initials}
                    </div>
                    <span className="badge rounded-pill" style={{ backgroundColor: "#e8f7ee", color: "#198754", fontSize: "11px", padding: "7px 10px" }}>
                      ● {inspector.status}
                    </span>
                  </div>

                  {/* Inspector Information */}
                  <div className="mb-4">
                    <h5 className="fw-bold mb-1" style={{ fontSize: "18px" }}>
                      {inspector.name}
                    </h5>
                    <div className="text-primary fw-semibold mb-3" style={{ fontSize: "13px" }}>
                      {inspector.designation}
                    </div>
                    <div className="mb-2" style={{ fontSize: "13px", color: "#6c757d" }}>
                      <span className="fw-semibold text-dark">
                        Inspector ID:
                      </span>{" "}
                      {inspector.id}
                    </div>
                    <div style={{ fontSize: "13px", color: "#6c757d" }}>
                      <span className="fw-semibold text-dark">
                        Region:
                      </span>{" "}
                      {inspector.region}
                    </div>
                  </div>

                  {/* Select Button */}
                  <div className="mt-auto">
                    <button type="button" className="btn btn-primary w-100 rounded-3 py-2 fw-semibold" onClick={() => handleInspectorSelect(inspector)}>
                      Continue as Inspector
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Portal Information */}
        <div className="row justify-content-center mt-5">
          <div className="col-12 col-lg-10">
            <div className="card border-0 rounded-4" style={{ backgroundColor: "#ffffff", boxShadow: "0 6px 20px rgba(23, 32, 51, 0.05)" }}>
              <div className="card-body p-4 p-md-5">
                <div className="row align-items-center g-4">
                  {/* Left */}
                  <div className="col-12 col-md-7">
                    <div className="d-flex align-items-start">
                      <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0 me-3" style={{ width: "46px", height: "46px", backgroundColor: "#eef5ff", color: "#0d6efd", fontSize: "20px" }}>
                        ✓
                      </div>
                      <div>
                        <h5 className="fw-bold mb-2">
                          About the Inspector Portal
                        </h5>
                        <p className="text-muted mb-0" style={{ fontSize: "14px", lineHeight: "1.7" }}>
                          SmartInspect helps inspectors capture product
                          evidence, review extracted declarations, check
                          compliance requirements, verify uncertain results,
                          and generate inspection reports.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="col-12 col-md-5">
                    <div className="rounded-3 p-3" style={{ backgroundColor: "#f8f9fa" }}>
                      <div className="row g-3">
                        <div className="col-6">
                          <div className="fw-bold" style={{ fontSize: "20px", color: "#0d6efd" }}>
                            4
                          </div>
                          <div className="text-muted" style={{ fontSize: "12px" }}>
                            Active Inspectors
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="fw-bold" style={{ fontSize: "20px", color: "#198754" }}>
                            Live
                          </div>
                          <div className="text-muted" style={{ fontSize: "12px" }}>
                            Inspection System
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="text-center mt-4">
          <p className="text-muted mb-0" style={{ fontSize: "12px" }}>
            Select your assigned inspector profile to continue.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-top bg-white mt-4" style={{ padding: "22px 0" }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <div className="text-muted" style={{ fontSize: "12px" }}>
              © 2026 SmartInspect
            </div>
            <div className="text-muted" style={{ fontSize: "12px" }}>
              Digital Product Inspection & Compliance
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default InspectorLogin;
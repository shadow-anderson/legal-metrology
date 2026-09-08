function Landing({ onInspectorLogin, onDashboardLogin }) {
  return (
    <div className="min-vh-100" style={{ backgroundColor: "#f6f8fb", color: "#172033" }}>
      {/* NAVBAR */}
      <nav className="navbar bg-white border-bottom" style={{ minHeight: "72px" }}>
        <div className="container">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: "44px", height: "44px", backgroundColor: "#e8f0fe", fontSize: "21px" }}>
              ⚖️
            </div>
            <div>
              <div className="fw-bold fs-5">SmartInspect</div>
              <small className="text-muted"> Product Compliance & Inspection</small>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: "linear-gradient(135deg, #ffffff 0%, #f7faff 60%, #eef5ff 100%)", borderBottom: "1px solid #e9edf3" }}>
        <div className="container">
          <div className="row align-items-center" style={{ minHeight: "510px", paddingTop: "45px", paddingBottom: "45px" }}>
            {/* LEFT */}
            <div className="col-lg-7 pe-lg-5">
              <div className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 mb-3" style={{ backgroundColor: "#e9f2ff", color: "#0d6efd", fontSize: "13px", fontWeight: "600" }}>
                <span>●</span>
                DIGITAL INSPECTION PLATFORM
              </div>
              <h1 className="fw-bold mb-3" style={{ fontSize: "clamp(2.5rem, 5vw, 4.2rem)", lineHeight: "1.08", letterSpacing: "-2px" }}>
                Smarter way to
                <br />
                <span className="text-primary"> inspect products.</span>
              </h1>
              <p className="text-muted mb-4" style={{ maxWidth: "650px", fontSize: "17px", lineHeight: "1.7" }}>
                SmartInspect brings product image capture, AI-assisted information extraction, compliance checking and human verification together in one structured inspection workflow.
              </p>
              {/* LOGIN BUTTONS */}
              <div className="d-flex flex-column flex-sm-row gap-3 mb-3">
                <button type="button" className="btn btn-primary btn-lg rounded-3 px-4 shadow-sm" onClick={onInspectorLogin}>
                  👤 Inspector Login
                  <span className="ms-2">→</span>
                </button>
                <button type="button" className="btn btn-outline-primary btn-lg rounded-3 px-4" onClick={onDashboardLogin}>
                  📊 Dashboard Login
                </button>
              </div>
              <div className="d-flex flex-wrap gap-3 text-muted small">
                <span>✓ Evidence based</span>
                <span>✓ AI assisted</span>
                <span>✓ Rule driven</span>
              </div>
            </div>

            {/* RIGHT */}
            <div className="col-lg-5 mt-5 mt-lg-0">
              <div className="position-relative mx-auto" style={{ maxWidth: "420px" }}>
                {/* Main Visual Card */}
                <div className="card border-0 shadow rounded-4 overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
                  {/* Blue Header */}
                  <div className="p-4" style={{ background: "linear-gradient(135deg, #0d6efd, #4b8df8)", color: "white" }}>
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: "55px", height: "55px", backgroundColor: "rgba(255,255,255,0.18)", fontSize: "27px" }}>
                        ⚖️
                      </div>
                      <div>
                        <small className="opacity-75"> SMARTINSPECT </small>
                        <h4 className="fw-bold mb-0"> Digital Inspection </h4>
                      </div>
                    </div>
                  </div>

                  {/* Workflow */}
                  <div className="p-4">
                    <div className="mb-4">
                      <small className="text-muted"> INSPECTION WORKFLOW</small>
                      <h5 className="fw-bold mb-0 mt-1"> From evidence to compliance </h5>
                    </div>
                    {/* Step 1 */}
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: "48px", height: "48px", backgroundColor: "#eaf2ff", fontSize: "21px" }}>
                        📷
                      </div>
                      <div>
                        <div className="fw-semibold"> Capture Evidence </div>
                        <small className="text-muted"> Product images & evidence </small>
                      </div>
                    </div>
                    {/* Connector */}
                    <div style={{ height: "18px", borderLeft: "2px dashed #d9e2f0", marginLeft: "23px" }} />
                    {/* Step 2 */}
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: "48px", height: "48px", backgroundColor: "#eef8f2", fontSize: "21px" }}>
                        🤖
                      </div>
                      <div>
                        <div className="fw-semibold"> Extract Information</div>
                        <small className="text-muted"> AI-assisted data extraction </small>
                      </div>
                    </div>
                    <div style={{ height: "18px", borderLeft: "2px dashed #d9e2f0", marginLeft: "23px" }} />
                    {/* Step 3 */}
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: "48px", height: "48px", backgroundColor: "#fff5e8", fontSize: "21px" }}>
                        ✓
                      </div>
                      <div>
                        <div className="fw-semibold"> Verify Compliance</div>
                        <small className="text-muted"> Rules & inspector review </small>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Status */}
                  <div className="px-4 py-3 border-top d-flex align-items-center justify-content-between" style={{ backgroundColor: "#fafbfd" }}>
                    <small className="text-muted"> Inspection status </small>
                    <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2"> ● Ready </span>
                  </div>
                </div>

                {/* Small Floating Card */}
                <div className="position-absolute bg-white rounded-4 shadow-sm p-3" style={{ bottom: "-22px", left: "-28px", width: "185px" }}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center justify-content-center rounded-3" style={{ width: "38px", height: "38px", backgroundColor: "#eef8f2" }}>
                      🔍
                    </div>
                    <div>
                      <div className="fw-semibold small"> Evidence Based </div>
                      <small className="text-muted"> Traceable results </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-4">
            <span className="badge rounded-pill px-3 py-2 mb-2" style={{ backgroundColor: "#e9f2ff", color: "#0d6efd" }}>
              PLATFORM CAPABILITIES
            </span>
            <h2 className="fw-bold mb-2"> Everything in one inspection platform </h2>
            <p className="text-muted mb-0"> Designed to make product inspection faster, clearer and more traceable. </p>
          </div>
          <div className="row g-3">
            {/* Feature 1 */}
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ backgroundColor: "#ffffff" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: "50px", height: "50px", backgroundColor: "#eaf2ff", fontSize: "22px" }}>
                    📷
                  </div>
                  <h5 className="fw-bold mb-2"> Evidence Capture </h5>
                  <p className="text-muted mb-0 small"> Capture clear product images and maintain visual evidence throughout an inspection. </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ backgroundColor: "#ffffff" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: "50px", height: "50px", backgroundColor: "#eaf2ff", fontSize: "22px" }}>
                    🤖
                  </div>
                  <h5 className="fw-bold mb-2"> AI Extraction </h5>
                  <p className="text-muted mb-0 small"> Extract important product and label declarations using AI-assisted processing. </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ backgroundColor: "#ffffff" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: "50px", height: "50px", backgroundColor: "#eaf2ff", fontSize: "22px" }}>
                    ⚖️
                  </div>
                  <h5 className="fw-bold mb-2"> Rule Checking </h5>
                  <p className="text-muted mb-0 small"> Evaluate applicable compliance requirements and identify potential violations. </p>
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="col-md-6 col-lg-3">
              <div className="card border-0 shadow-sm rounded-4 h-100" style={{ backgroundColor: "#ffffff" }}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: "50px", height: "50px", backgroundColor: "#f1efff", fontSize: "22px" }}>
                    📄
                  </div>
                  <h5 className="fw-bold mb-2"> Reports </h5>
                  <p className="text-muted mb-0 small"> Maintain structured inspection results and generate evidence-based reports. </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container">
          <div className="text-center mb-4">
            <span className="badge rounded-pill px-3 py-2 mb-2" style={{ backgroundColor: "#e9f2ff", color: "#0d6efd" }}>
              HOW IT WORKS
            </span>
            <h2 className="fw-bold mb-2"> A simple four-step process </h2>
            <p className="text-muted mb-0"> Every inspection follows a structured digital workflow. </p>
          </div>
          <div className="row g-4">
            {[
              {
                number: "01",
                icon: "📷",
                title: "Capture",
                text: "Capture clear images of the product.",
              },
              {
                number: "02",
                icon: "🤖",
                title: "Extract",
                text: "AI extracts relevant declarations.",
              },
              {
                number: "03",
                icon: "⚖️",
                title: "Check",
                text: "Applicable rules are evaluated.",
              },
              {
                number: "04",
                icon: "✓",
                title: "Verify",
                text: "Inspector reviews and confirms results.",
              },
            ].map((step) => (
              <div className="col-6 col-lg-3" key={step.number}>
                <div className="d-flex align-items-start gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0" style={{ width: "52px", height: "52px", backgroundColor: "#f0f5ff", fontSize: "21px" }}>
                    {step.icon}
                  </div>
                  <div>
                    <div className="small fw-bold text-primary mb-1">
                      {step.number}
                    </div>
                    <h6 className="fw-bold mb-1">
                      {step.title}
                    </h6>
                    <small className="text-muted">
                      {step.text}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-4 bg-white">
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <div className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center justify-content-center rounded-2" style={{ width: "34px", height: "34px", backgroundColor: "#e8f0fe", fontSize: "16px" }}>
                ⚖️
              </div>
              <span className="fw-semibold">
                SmartInspect
              </span>
            </div>
            <small className="text-muted">
              Digital Product Compliance & Inspection Platform
            </small>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
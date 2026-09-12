function ExtractedData({ data, onEdit, onContinue }) {
  const detectedCount = data.filter(
    (field) => field.status === "DETECTED" || (field.value &&
      field.value.trim() !== "" && field.value !== "Not detected")
    ).length;

  const getConfidenceClass = (confidence) => {
    if (confidence >= 0.95) {
      return "bg-success-subtle text-success";
    }
    if (confidence >= 0.90) {
      return "bg-warning-subtle text-warning-emphasis";
    }
    return "bg-danger-subtle text-danger";
  };

  const getConfidenceBarClass = (confidence) => {
    if (confidence >= 0.95) return "bg-success";
    if (confidence >= 0.90) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div className="min-vh-100 py-4 py-md-5"
      style={{ background: "linear-gradient(180deg, #f3f6fa 0%, #f8fafc 100%)",}}>
      <div className="container">

        {/* HEADER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: "54px", height: "54px", borderRadius: "15px", backgroundColor: "#e7f0ff", color: "#0d6efd", fontSize: "25px", boxShadow: "0 4px 12px rgba(13,110,253,0.08)",}}>
              📄
            </div>
            <div>
              <div className="text-primary fw-bold text-uppercase mb-1"
                style={{ fontSize: "11px", letterSpacing: "1px",}}>
                Inspection Review
              </div>
              <h2 className="fw-bold mb-1"> Extracted Data </h2>
              <p className="text-muted mb-0"> Review AI-extracted information before compliance analysis.</p>
            </div>
          </div>

          {/* FIELD COUNT */}
          <div className="bg-white border rounded-3 px-3 py-2 shadow-sm" style={{ minWidth: "175px",}}>
            <div className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center justify-content-center rounded-circle bg-primary-subtle text-primary fw-bold"
                style={{ width: "38px", height: "38px", fontSize: "15px",}}>
                {detectedCount}
              </div>

              <div>
                <div className="fw-bold small"> Fields detected </div>
                <div className="text-muted small"> {detectedCount} of {data.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* EXTRACTION COMPLETE */}
        <div className="card border-0 shadow-sm rounded-4 mb-4"
          style={{ borderLeft: "4px solid #198754",}}>
          <div className="card-body p-3 p-md-4">
            <div className="row align-items-center g-3">
              <div className="col-md-8">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle bg-success-subtle text-success fw-bold"
                    style={{ width: "42px", height: "42px", fontSize: "18px",}}>
                    ✓
                  </div>

                  <div>
                    <div className="fw-bold"> AI extraction completed</div>
                    <div className="small text-muted">
                      Product information has been extracted from the
                      uploaded inspection images.
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4 text-md-end">
                <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2"> ● Extraction Complete </span>
              </div>
            </div>
          </div>
        </div>

        {/*  MAIN CARD */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-4 p-md-5">

            {/* SECTION HEADER */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="rounded-circle bg-primary" style={{ width: "9px", height: "9px", display: "inline-block",}}/>
                  <h4 className="fw-bold mb-0"> AI Extracted Information </h4>
                </div>

                <p className="text-muted mb-0 small"> Detected declarations and AI confidence for each field.</p>
              </div>

              <div className="small text-muted">
                <span className="fw-bold text-success"> {detectedCount}</span>{" "}
                detected
              </div>
            </div>

            {/* PRODUCT SUMMARY */}
            <div className="rounded-4 p-4 mb-4" style={{ backgroundColor: "#f7f9fc", border: "1px solid #e7ebf0",}}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="d-flex align-items-center justify-content-center rounded-3 bg-white shadow-sm"
                  style={{ width: "46px", height: "46px", fontSize: "23px",}}>
                  🍪
                </div>

                <div>
                  <div className="text-muted" style={{ fontSize: "12px" }}> INSPECTED PRODUCT </div>
                  <div className="fw-bold fs-5"> Parle-G Biscuits </div>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="bg-white rounded-3 p-3" style={{ border: "1px solid #edf0f3",}}>
                    <small className="text-muted d-block mb-1"> Category  </small>
                    <div className="fw-semibold"> Biscuits </div>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="bg-white rounded-3 p-3" style={{ border: "1px solid #edf0f3",}}>
                    <small className="text-muted d-block mb-1"> Inspection Type </small>
                    <div className="fw-semibold"> Label Compliance </div>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div className="bg-white rounded-3 p-3" style={{ border: "1px solid #edf0f3", }}>
                    <small className="text-muted d-block mb-1"> Extraction Status</small>
                    <div className="fw-semibold text-success"> ✓ Completed </div>
                  </div>
                </div>
              </div>
            </div>

            {/* EXTRACTED FIELDS */}
            <div className="row g-3">
              {data.map((field) => {
                const detected = field.status === "DETECTED" || (field.value && field.value.trim() !== "" && field.value !== "Not detected");
                return (
                  <div className="col-12 col-md-6" key={field.fieldName}>
                    <div className="h-100 rounded-4 p-4"
                      style={{ backgroundColor: detected ? "#ffffff" : "#fafafa", border: "1px solid #e4e8ed",
                        borderLeft: detected ? "4px solid #198754" : "4px solid #adb5bd", boxShadow: "0 2px 8px rgba(0,0,0,0.025)",}}>

                      {/* FIELD HEADER */}
                      <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <div className="d-flex gap-2">
                          <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                            style={{ width: "32px", height: "32px",
                              backgroundColor: detected ? "#d1e7dd" : "#e9ecef",
                              color: detected ? "#198754" : "#6c757d",  fontWeight: "800",  fontSize: "14px",}}>
                            {detected ? "✓" : "—"}
                          </div>

                          <div>
                            <div className="text-muted mb-1" style={{ fontSize: "12px", fontWeight: "600", }}>
                              {field.label}
                            </div>

                            <div className={ detected ? "fw-bold" : "fw-semibold text-muted"}
                              style={{ fontSize: "17px", lineHeight: "1.35", }}>
                              {field.value}
                            </div>
                          </div>
                        </div>

                        {/* CONFIDENCE */}
                        {field.confidence !== null ? (
                          <span className={`badge rounded-pill px-3 py-2 ${getConfidenceClass( field.confidence)}`}>
                            {Math.round(field.confidence * 100)}%
                          </span>
                        ) : (
                          <span className="badge rounded-pill bg-light text-muted px-3 py-2">
                            Not detected
                          </span>
                        )}
                      </div>

                      {/* CONFIDENCE BAR */}
                      {field.confidence !== null && (
                        <div className="mb-3">
                          <div className="d-flex justify-content-between mb-1">
                            <small className="text-muted"> AI confidence</small>
                            <small className="text-muted"> {Math.round(field.confidence * 100)}%</small>
                          </div>

                          <div className="progress" style={{ height: "5px", backgroundColor: "#edf0f2",}}>
                            <div className={`progress-bar ${getConfidenceBarClass( field.confidence)}`}
                              style={{ width: `${field.confidence * 100}%`,}}/>
                          </div>
                        </div>
                      )}

                      {/* OCR */}
                      {field.ocrText && (
                        <div className="rounded-3 p-3 mb-3"
                          style={{ backgroundColor: "#f8f9fa", border: "1px solid #edf0f2",}}>
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: "10px",}}> Aa </span>
                            <small className="fw-semibold text-muted"> OCR Text </small>
                          </div>
                          <div className="small fw-medium"> {field.ocrText} </div>
                        </div>
                      )}

                      {/* BOUNDING BOX */}
                      {field.bbox ? (
                        <div>
                          <small className="text-muted fw-semibold d-block mb-1" style={{ fontSize: "11px",}}> BOUNDING BOX</small>
                          <code className="d-block rounded-2 px-2 py-2"
                            style={{ backgroundColor: "#f5f6f8", border: "1px solid #e6e8eb", color: "#495057", fontSize: "12px",}}>
                            [{field.bbox.join(", ")}]
                          </code>
                        </div>
                      ) : (
                        <small className="text-muted"> No bounding box available </small>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BOUNDING BOX INFO */}
            <div className="d-flex gap-3 rounded-4 p-4 mt-4" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e2e6ea"}}>
              <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
               style={{ width: "40px", height: "40px", backgroundColor: "#ffffff", fontSize: "19px",}}>
                📐
              </div>

              <div>
                <div className="fw-bold mb-1"> Bounding Box Convention</div>
                <div className="small text-muted mb-2">
                  Coordinates identify the location of extracted text
                  within the original image.
                </div>

                <code className="d-inline-block rounded-2 px-2 py-1"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #dee2e6", fontSize: "12px",}}>
                  [xMin, yMin, xMax, yMax]
                </code>

                <div className="small text-muted mt-2">
                  Coordinates are measured in pixels. The origin (0,0)
                  is at the top-left of the original image.
                </div>
              </div>
            </div>

            {/* REVIEW NOTICE */}
            <div className="d-flex gap-3 rounded-4 p-4 mt-3" style={{ backgroundColor: "#eef6ff", border: "1px solid #cfe2ff",}}>
              <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                style={{ width: "40px", height: "40px", backgroundColor: "#dbeafe", fontSize: "18px",}}>
                ℹ️
              </div>

              <div>
                <div className="fw-bold mb-1 text-primary"> Inspector review required</div>
                <div className="small text-muted">
                  Check the extracted values carefully. If an AI value
                  is incorrect, edit it before continuing to the
                  compliance results.
                </div>
              </div>
            </div>

            {/* ACTION AREA */}
            <div className="mt-5 pt-4" style={{  borderTop: "1px solid #e9ecef",}}>
              <div className="row align-items-center g-3">
                <div className="col-md-7">
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                      style={{ width: "44px", height: "44px", backgroundColor: "#e7f1ff", color: "#0d6efd", fontWeight: "800",}}>
                      ✓
                    </div>

                    <div>
                      <h5 className="fw-bold mb-1"> Ready for compliance check? </h5>
                      <p className="text-muted mb-0 small"> Correct any inaccurate AI values before proceeding.</p>
                    </div>
                  </div>
                </div>

                <div className="col-md-5">
                  <div className="d-flex justify-content-md-end gap-2">
                    <button type="button" className="btn btn-outline-primary px-4 py-2 rounded-3 fw-semibold" onClick={onEdit}>
                      ✏️ Edit Data
                    </button>

                    <button type="button" className="btn btn-primary px-4 py-2 rounded-3 fw-semibold shadow-sm" onClick={onContinue}>
                      Continue
                      <span className="ms-2"> → </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExtractedData;
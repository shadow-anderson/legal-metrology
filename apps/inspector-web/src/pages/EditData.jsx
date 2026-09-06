import { useState } from "react";

function EditData({ data, onSave, onCancel }) {
  const [formData, setFormData] = useState(data);

  /*  HANDLE FIELD CHANGE */
  const handleChange = (fieldName, value) => {
    setFormData((previousData) =>
      previousData.map((field) =>field.fieldName === fieldName
          ? {
              ...field,
              value: value,
              status: value.trim() === "" ? "NOT_DETECTED" : "CORRECTED",
            } : field
      )
    );
  };

  /* SAVE */
  const handleSave = () => {
    const cleanedData = formData.map((field) => ({
      ...field,

      value:
        field.value.trim() === "" ? "Not detected" : field.value,
      status:
        field.value.trim() === "" ? "NOT_DETECTED" : field.status === "NOT_DETECTED" ? "CORRECTED" : field.status,
    }));
    onSave(cleanedData);
  };

  return (
    <div className="min-vh-100 py-4 py-md-5" style={{ background: "linear-gradient(180deg, #f3f6fa 0%, #f8fafc 100%)",}}>
      <div className="container">

        {/* HEADER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: "54px", height: "54px", borderRadius: "15px", backgroundColor: "#e7f0ff", color: "#0d6efd", fontSize: "24px", boxShadow: "0 4px 12px rgba(13,110,253,0.08)",}}>
              ✏️
            </div>

            <div>
              <div className="text-primary fw-bold text-uppercase mb-1"
                style={{ fontSize: "11px", letterSpacing: "1px"}}>
                Inspector Correction
              </div>
              <h2 className="fw-bold mb-1"> Edit Extracted Data</h2>
              <p className="text-muted mb-0"> Review and correct information extracted by AI. </p>
            </div>
          </div>

          {/* PRODUCT */}
          <div className="bg-white border rounded-3 px-3 py-2 shadow-sm">
            <div className="d-flex align-items-center gap-2">
              <div className="d-flex align-items-center justify-content-center rounded-3"
                style={{ width: "36px", height: "36px", backgroundColor: "#fff3cd", fontSize: "18px",}}>
                🍪
              </div>

              <div>
                <div className="text-muted" style={{ fontSize: "11px" }}> PRODUCT</div>
                <div className="fw-semibold small"> Parle-G Biscuits</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
          <div className="card-body p-4 p-md-5">

            {/* INTRO HEADER */}
            <div className="rounded-4 p-4 mb-4" style={{ backgroundColor: "#f7f9fc", border: "1px solid #e7ebf0",}}>
              <div className="d-flex align-items-start gap-3">
                <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                  style={{ width: "42px", height: "42px", backgroundColor: "#e7f0ff", color: "#0d6efd", fontSize: "19px",}}>
                  📝
                </div>

                <div>
                  <h4 className="fw-bold mb-1"> Review & Correct Information</h4>
                  <p className="text-muted mb-0 small">
                    Update any value that was incorrectly extracted.
                    AI confidence and OCR references are shown below
                    for verification.
                  </p>
                </div>
              </div>
            </div>

            {/* FORM FIELDS */}
            <div className="row g-4">
              {formData.map((field) => (
                <div className="col-12 col-md-6" key={field.fieldName}>
                  <div className="h-100 rounded-4 p-4" style={{ backgroundColor: "#ffffff",
                      border: field.status === "CORRECTED" ? "1px solid #b7dfc5" : "1px solid #e2e6ea",
                      borderLeft: field.status === "CORRECTED" ? "4px solid #198754" : "4px solid #0d6efd",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.025)",}}>

                    {/* FIELD HEADER */}
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
                      <div>
                        <div className="text-muted text-uppercase fw-semibold mb-1"
                          style={{ fontSize: "11px", letterSpacing: "0.4px",}}>
                          {field.label}
                        </div>

                        <div className="small text-muted" > Inspector editable field </div>
                      </div>

                      {/* AI CONFIDENCE */}
                      {field.confidence !== null && (
                        <span className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2"
                          style={{ whiteSpace: "nowrap",}}>
                          AI {Math.round(field.confidence * 100)}%
                        </span>
                      )}
                    </div>

                    {/* INPUT */}
                    <div className="position-relative mt-3">
                      <input type="text" className="form-control form-control-lg rounded-3"
                        style={{ border: field.status === "CORRECTED" ? "1px solid #198754" : "1px solid #ced4da",
                          boxShadow: field.status === "CORRECTED" ? "0 0 0 2px rgba(25,135,84,0.08)" : "none",
                          fontSize: "15px", fontWeight: "500",}}
                        value={ field.value === "Not detected" ? "" : field.value}
                        placeholder={ field.value === "Not detected" ? "Not detected — enter value if available" : `Enter ${field.label}`}
                        onChange={(event) =>
                          handleChange(
                            field.fieldName,
                            event.target.value
                          )
                        }
                      />
                    </div>

                    {/* CORRECTION STATUS */}
                    {field.status === "CORRECTED" && (
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <span className="d-flex align-items-center justify-content-center rounded-circle bg-success text-white"
                          style={{ width: "18px", height: "18px", fontSize: "10px",}}>
                          ✓
                        </span>
                        <small className="text-success fw-semibold"> Inspector corrected this field </small>
                      </div>
                    )}

                    {/* ORIGINAL AI REFERENCE */}
                    {field.ocrText && (
                      <div className="rounded-3 p-3 mt-3" style={{ backgroundColor: "#f8f9fa", border: "1px solid #edf0f2",}}>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: "10px", }}> Aa</span>
                          <small className="text-muted fw-semibold"> Original AI / OCR Reference </small>
                        </div>

                        <div className="small" style={{ color: "#495057",}}> {field.ocrText} </div>
                      </div>
                    )}

                    {/* BOUNDING BOX */}
                    {field.bbox && (
                      <div className="mt-3">
                        <div className="text-muted fw-semibold mb-1" style={{ fontSize: "11px", letterSpacing: "0.3px",}}>
                          ORIGINAL BOUNDING BOX
                        </div>
                        <code className="d-block rounded-2 px-3 py-2"
                          style={{ backgroundColor: "#f5f6f8", border: "1px solid #e6e8eb", color: "#495057", fontSize: "12px",}}>
                          [{field.bbox.join(", ")}]
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* IMPORTANT NOTICE= */}
            <div className="d-flex gap-3 rounded-4 p-4 mt-4" style={{ backgroundColor: "#fff8e6", border: "1px solid #ffe69c",}}>
              <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                style={{ width: "42px", height: "42px", backgroundColor: "#fff3cd", fontSize: "19px",}}>
                ⚠️
              </div>

              <div>
                <div className="fw-bold mb-1"> Inspector correction</div>
                <div className="small text-muted">
                  Changes made here are inspector corrections to
                  the AI-extracted values. The original AI output,
                  confidence and OCR information remain available
                  for reference.
                </div>
              </div>
            </div>

            {/* BOUNDING BOX INFO */}
            <div className="d-flex gap-3 rounded-4 p-4 mt-3" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e2e6ea",}}>
              <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
               style={{ width: "42px", height: "42px", backgroundColor: "#ffffff", fontSize: "19px",}}>
                📐
              </div>

              <div>
                <div className="fw-bold mb-1"> Bounding Box Convention</div>
                <div className="small text-muted mb-2"> Format used for the original AI-detected region: </div>
                <code className="d-inline-block rounded-2 px-3 py-2"
                  style={{ backgroundColor: "#ffffff", border: "1px solid #dee2e6", fontSize: "12px",}}>
                  [xMin, yMin, xMax, yMax]
                </code>

                <div className="small text-muted mt-2">
                  Coordinates are in pixels relative to the
                  original image. Origin is at the top-left.
                </div>
              </div>
            </div>

            {/* SAVE NOTICE */}
            <div className="d-flex align-items-center gap-3 mt-4 p-3 rounded-3" 
            style={{ backgroundColor: "#eef6ff", border: "1px solid #cfe2ff",}}>
              <span className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
                style={{ width: "30px",height: "30px", fontSize: "14px",}}> i </span>
              <div className="small text-muted">
                Review all corrections carefully before saving.
                Your changes will be used for the compliance results.
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-5 pt-4" style={{ borderTop: "1px solid #e9ecef", }}>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div>
                  <div className="fw-bold"> Finished making corrections?</div>
                  <div className="small text-muted"> Save your changes to continue the inspection.</div>
                </div>

                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-secondary px-4 py-2 rounded-3 fw-semibold" onClick={onCancel}>
                    Cancel
                  </button>

                  <button type="button" className="btn btn-primary px-4 py-2 rounded-3 fw-semibold shadow-sm" onClick={handleSave}>
                    ✓ Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditData;
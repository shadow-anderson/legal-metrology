import { useState } from "react";

function Verification({
  extractedData,
  onReinspect,
  onCompleteVerification,
}) {
  /* GET EXTRACTED VALUE */
  const getFieldValue = (fieldName, fallback = "") => {
    const field = extractedData?.find(
      (item) => item.fieldName === fieldName
    );
    return field?.value || fallback;
  };

  /* STATES */
  const [humanDecision, setHumanDecision] = useState("");
  const [correctedValue, setCorrectedValue] = useState("");
  const [inspectorComment, setInspectorComment] = useState("");
  const [verified, setVerified] = useState(false);

  /* AI FINDING */
  const aiConfidence = 61;
  const aiDetectedValue = getFieldValue(
    "NET_QTY",
    "250 g"
  );

  /* HUMAN DECISION */
  const handleDecisionChange = (decision) => {
    setHumanDecision(decision);

    // Clear corrected value when inspector selects
    // any option other than "AI is wrong"
    if (decision !== "CORRECT_AI") {
      setCorrectedValue("");
    }
  };

  /* CONFIRM VERIFICATION */
  const confirmVerification = () => {
    if (!humanDecision) {
      alert("Please select what the inspector says.");
      return;
    }
    if (
      humanDecision === "CORRECT_AI" &&
      !correctedValue.trim()
    ) {
      alert("Please enter the correct value.");
      return;
    }
    if (!inspectorComment.trim()) {
      alert("Please add an inspector comment.");
      return;
    }

    const updatedData = extractedData.map((field) => {
      let newValue = field.value;
      /*
        If inspector says AI is wrong,
        replace the AI value with the corrected value.
      */
      if (
        field.fieldName === "NET_QTY" &&
        humanDecision === "CORRECT_AI"
      ) {
        newValue = correctedValue.trim();
      }

      return {
        ...field,
        value: newValue,
        status: "VERIFIED",

        humanVerification: {
          decision: humanDecision,

          correctedValue:
            humanDecision === "CORRECT_AI" ? correctedValue.trim() : null,

          comment: inspectorComment.trim(),
          verified: true,
        },
      };
    });
    onCompleteVerification(updatedData);
    setVerified(true);
  };

  /* RE-INSPECT */
  const handleReinspect = () => {
    onReinspect();
  };

  /* UI */
  return (
    <div className="container-fluid bg-light min-vh-100 py-4">
      <div className="container">

        {/* HEADER */}
        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge bg-warning text-dark px-3 py-2 rounded-pill"> HUMAN VERIFICATION REQUIRED</span>
          </div>
          <h2 className="fw-bold mb-1"> Inspector Verification </h2>
          <p className="text-muted mb-0">
            AI has identified an uncertain declaration. Review the
            highlighted evidence and provide the final human decision.
          </p>
        </div>

        {/* IMPORTANT NOTICE*/}
        <div className="alert alert-warning border-0 shadow-sm rounded-4 mb-4">
          <div className="d-flex gap-3">
            <div style={{ fontSize: "24px" }}> ⚠️ </div>
            <div>
              <strong> Why is verification required?</strong>
              <div className="small mt-1">
                The AI could not confidently interpret one part of
                the package declaration. The inspector must review
                the highlighted area and provide the final decision.
              </div>
            </div>
          </div>
        </div>

        {/* AI FINDING + EVIDENCE */}
        <div className="card border-0 shadow-sm rounded-4 mb-4">
          <div className="card-body p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1"> AI Finding & Inspector Decision </h4>
                <p className="text-muted mb-0"> Review what AI detected and provide the human decision.</p>
              </div>
              <span className="badge bg-warning text-dark px-3 py-2"> Rule R9</span>
            </div>

            <div className="row g-4">
              {/*  AI SAYS */}
              <div className="col-lg-6">
                <div className="border rounded-4 p-4 h-100">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "36px", height: "36px", }}> AI</span>

                    <div>
                      <div className="fw-bold"> AI Says </div>
                      <div className="small text-muted"> Automated analysis</div>
                    </div>
                  </div>

                  {/* AI MESSAGE */}
                  <div className="alert alert-warning border-0 rounded-3">
                    <strong> "I can't confidently understand this declaration."</strong>
                    <div className="small mt-2">
                      The text in the highlighted area is partially
                      unclear. Human verification is required.
                    </div>
                  </div>

                  {/* AI DETAILS */}
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="bg-light rounded-3 p-3">
                        <div className="small text-muted"> AI Detected</div>
                        <div className="fw-semibold"> Net Quantity</div>
                        <div className="small text-muted mt-1"> {aiDetectedValue}</div>
                      </div>
                    </div>

                    <div className="col-6">
                      <div className="bg-light rounded-3 p-3">
                        <div className="small text-muted"> Confidence</div>
                        <div className="fw-semibold"> {aiConfidence}%</div>
                      </div>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted"> AI Status</span>
                    <span className="badge bg-warning text-dark"> NEEDS VERIFICATION</span>
                  </div>
                </div>
              </div>

              {/* AI EVIDENCE IMAGE */}
              <div className="col-lg-6">
                <div className="border rounded-4 p-4 h-100">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="fw-bold"> AI Evidence</div>
                      <div className="small text-muted"> Area highlighted by AI</div>
                    </div>
                    <span className="badge bg-danger"> UNCLEAR AREA</span>
                  </div>

                  {/* IMAGE */}
                  <div className="position-relative rounded-3 overflow-hidden bg-light"
                    style={{ minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center",}}>
                    <img src="/product-image.jpg" alt="AI provided product evidence"
                      className="img-fluid" style={{ maxHeight: "380px", width: "100%", objectFit: "contain",}}/>

                    {/* AI HIGHLIGHT */}
                    <div className="position-absolute" 
                    style={{ left: "20%", top: "45%", width: "45%", height: "18%", border: "4px solid red", borderRadius: "8px", boxShadow: "0 0 0 9999px rgba(0,0,0,0.15)", pointerEvents: "none",}}>
                      <span className="position-absolute bg-danger text-white px-2 py-1 rounded"
                        style={{ top: "-32px", left: "0", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap",}}>
                        AI UNCERTAIN AREA
                      </span>
                    </div>
                  </div>

                  <div className="small text-muted mt-2">
                    🔴 Red box shows the exact area where AI needs
                    human clarification.
                  </div>
                </div>
              </div>
            </div>

            {/* INSPECTOR SAYS */}
            <div className="border rounded-4 p-4 mt-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="badge bg-success rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "36px", height: "36px",}}> 👤 </span>

                <div>
                  <div className="fw-bold"> Inspector Says </div>
                  <div className="small text-muted"> Human decision</div>
                </div>
              </div>

              <p className="small text-muted">Based on the highlighted evidence, what is your decision? </p>

              {/* DECISION BUTTONS */}
              <div className="row g-3">

                {/* CONFIRM AI */}
                <div className="col-md-4">
                  <button type="button" className={`btn w-100 text-start p-3 rounded-3 ${ humanDecision === "CONFIRM_AI" ? "btn-success" : "btn-outline-success" }`}
                    onClick={() => handleDecisionChange("CONFIRM_AI")}>
                    <div className="fw-semibold"> ✓ Confirm — AI is correct </div>
                    <div className="small mt-1"> The AI interpretation is correct. </div>
                  </button>
                </div>

                {/* CORRECT AI */}
                <div className="col-md-4">
                  <button type="button" className={`btn w-100 text-start p-3 rounded-3 ${ humanDecision === "CORRECT_AI" ? "btn-danger" : "btn-outline-danger"}`}
                    onClick={() => handleDecisionChange("CORRECT_AI") }>
                    <div className="fw-semibold"> ✎ Correct — AI is wrong </div>
                    <div className="small mt-1">  Enter the correct value. </div>
                  </button>
                </div>

                {/* CANNOT DETERMINE */}
                <div className="col-md-4">
                  <button type="button" className={`btn w-100 text-start p-3 rounded-3 ${ humanDecision === "CANNOT_DETERMINE" ? "btn-secondary" : "btn-outline-secondary"}`}
                    onClick={() => handleDecisionChange(
                        "CANNOT_DETERMINE"
                      )}>
                    <div className="fw-semibold"> ? Cannot determine </div>
                    <div className="small mt-1"> Evidence is insufficient. </div>
                  </button>
                </div>
              </div>

              {/* CORRECT VALUE */}
              {humanDecision === "CORRECT_AI" && (
                <div className="mt-4">
                  <label className="form-label fw-semibold"> Correct Value </label>
                  <input type="text" className="form-control form-control-lg rounded-3" placeholder="Enter correct value" value={correctedValue}
                    onChange={(e) => setCorrectedValue(e.target.value) }/>
                  <div className="small text-muted mt-2">
                    Enter the value exactly as visible in the
                    highlighted area.
                  </div>
                </div>
              )}

              {/* INSPECTOR COMMENT */}
              <div className="mt-4">
                <label className="form-label fw-semibold"> Inspector Comment</label>
                <textarea className="form-control rounded-3" rows="3" placeholder="Explain your observation or verification..."
                  value={inspectorComment} onChange={(e) => setInspectorComment(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">

              {/* RE-INSPECT */}
              <button type="button" className="btn btn-outline-secondary px-4 py-2 rounded-3" onClick={handleReinspect}>
                🔄 Re-inspect
              </button>

              {/* CONFIRM */}
              <button type="button" className="btn btn-success px-4 py-2 rounded-3 fw-semibold" onClick={confirmVerification}>
                ✓ Confirm Verification
              </button>
            </div>
          </div>
        </div>

        {/*  VERIFIED MESSAGE */}
        {verified && (
          <div className="alert alert-success border-0 shadow-sm rounded-4 mt-4">
            <div className="d-flex align-items-center gap-3">
              <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px",}}>
                ✓
              </div>

              <div>
                <div className="fw-bold"> Verification Completed</div>
                <div className="small"> Inspector decision has been recorded successfully.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Verification;
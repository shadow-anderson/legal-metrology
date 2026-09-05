import { useState } from "react";

function Verification({ onCompleteVerification }) {
  const [product, setProduct] = useState({
    name: "ABC Biscuits",
    category: "Biscuits",
    mrp: "₹50",
    netQuantity: "100 g",
    manufacturer: "ABC Foods Pvt Ltd",
    manufactureDate: "08/2026",
  });

  const [verified, setVerified] = useState(false);

  const handleChange = (field, value) => {
    setProduct((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const completeVerification = () => {
    setVerified(true);
    
    setTimeout(() => {
      onCompleteVerification();
    }, 500);
  };

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#f5f7fa" }}>
      <div className="container">
        {/* Header */}
        <div className="mb-4">
          <p className="text-primary fw-semibold mb-1"> Inspector Verification </p>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h2 className="fw-bold mb-1"> Verify Inspection </h2>
              <p className="text-muted mb-0"> Review AI-generated information and verify the evidence.</p>
            </div>

            <div className="text-md-end">
              <small className="text-muted d-block"> Inspection ID </small>
              <span className="fw-bold"> INS-00124 </span>
            </div>
          </div>
        </div>

        {/* Verification Notice */}
        <div className="alert alert-info border-0 rounded-4 p-4 mb-4">
          <div className="d-flex gap-3">
            <div style={{ fontSize: "22px" }}> ℹ️ </div>

            <div>
              <h6 className="fw-bold mb-1"> Human Verification</h6>
              <p className="mb-0"> Review the information extracted by AI. You can correct extracted fields and add evidence where required. </p>
            </div>
          </div>
        </div>

        <div className="row g-4">

          {/* LEFT - Product Information */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body p-4 p-md-5">

                <div className="mb-4">
                  <h4 className="fw-bold mb-1"> Product Information</h4>
                  <p className="text-muted mb-0"> Verify and correct the information extracted by AI. </p>
                </div>

                {/* Product Name */}
                <div className="mb-4">
                  <label className="form-label fw-semibold"> Product Name </label>

                  <input type="text" className="form-control form-control-lg rounded-3" value={product.name}
                    onChange={(e) =>
                      handleChange("name", e.target.value)
                    }/>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="form-label fw-semibold"> Category</label>
                  <input type="text" className="form-control form-control-lg rounded-3" value={product.category}
                    onChange={(e) =>
                      handleChange("category", e.target.value)
                    }/>
                </div>

                <div className="row g-4">
                  {/* MRP */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold"> MRP</label>
                    <input type="text" className="form-control form-control-lg rounded-3" value={product.mrp}
                      onChange={(e) =>
                        handleChange("mrp", e.target.value)
                      }/>
                  </div>

                  {/* Quantity */}
                  <div className="col-md-6">
                    <label className="form-label fw-semibold"> Net Quantity</label>
                    <input type="text" className="form-control form-control-lg rounded-3" value={product.netQuantity}
                      onChange={(e) =>
                        handleChange(
                          "netQuantity",
                          e.target.value)
                        }/>
                  </div>
                </div>

                {/* Manufacturer */}
                <div className="mt-4 mb-4">
                  <label className="form-label fw-semibold"> Manufacture</label>
                  <input type="text" className="form-control form-control-lg rounded-3" value={product.manufacturer}
                    onChange={(e) =>
                      handleChange(
                        "manufacturer",
                        e.target.value)
                    }/>
                </div>

                {/* Manufacture Date */}
                <div className="mb-4">
                  <label className="form-label fw-semibold"> Manufacture Date</label>
                  <input type="text" className="form-control form-control-lg rounded-3" value={product.manufactureDate}
                    onChange={(e) =>
                      handleChange(
                        "manufactureDate",
                        e.target.value)
                    }/>
                </div>

                {/* AI Info */}
                <div className="rounded-4 p-3" style={{ backgroundColor: "#f8f9fa", border: "1px solid #e9ecef",}}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="text-muted d-block"> AI Extraction Confidence </small>
                      <span className="fw-bold text-success"> 94%</span>
                    </div>
                    <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2"> High Confidence </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT - Evidence */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h4 className="fw-bold mb-1"> Evidence</h4>
                    <p className="text-muted mb-0"> Review the evidence used by AI.</p>
                  </div>
                  <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2"> Rule 7(2)</span>
                </div>

                {/* Image Placeholder */}
                <div className="rounded-4 overflow-hidden mb-3"
                  style={{ height: "280px", backgroundColor: "#e9ecef", display: "flex", alignItems: "center", justifyContent: "center",}}>
                  <div className="text-center text-muted">
                    <div style={{ fontSize: "50px" }}> 🖼️</div>
                    <p className="fw-semibold mb-1"> Product Evidence Image</p>
                    <small> Evidence image will appear here</small>
                  </div>
                </div>

                {/* Evidence Details */}
                <div className="rounded-4 p-3 mb-3" style={{ backgroundColor: "#fff8e6", border: "1px solid #ffe69c",}}>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted"> Rule</span>
                    <strong> Rule 7(2)</strong>
                  </div>

                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted"> AI Result</span>
                    <span className="badge bg-danger-subtle text-danger"> FAIL</span>
                  </div>

                  <div className="d-flex justify-content-between">
                    <span className="text-muted"> Confidence</span>
                    <strong className="text-danger"> 92% </strong>
                  </div>
                </div>

                {/* Add Evidence */}
                <button type="button" className="btn btn-outline-primary w-100 rounded-3 py-2">
                  + Add / Update Evidence
                </button>
              </div>
            </div>

            {/* Measurement */}
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-1"> Inspector Measurement</h5>
                <p className="text-muted small mb-3"> Enter a measurement if physical verification is required.</p>
                <div className="input-group">
                  <input type="number" className="form-control rounded-start-3" placeholder="Enter measurement"/>
                  <span className="input-group-text"> mm</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="card border-0 shadow-sm rounded-4 mt-4">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h5 className="fw-bold mb-1"> Ready to complete verification </h5>
                <p className="text-muted mb-0"> Save your corrections and finalize the inspection review.</p>
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-outline-secondary px-4 rounded-3" onClick={() => alert("Changes saved!")}>
                  Save Changes
                </button>

                <button type="button" className="btn btn-primary px-4 rounded-3" onClick={completeVerification}>
                  Complete Verification →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {verified && (
          <div className="alert alert-success border-0 rounded-4 mt-4 p-4">
            <div className="d-flex gap-3 align-items-center">
              <div className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "42px", height: "42px", backgroundColor: "#d1e7dd", color: "#198754", fontSize: "20px",}}>
                ✓
              </div>
              <div>
                <h6 className="fw-bold mb-1"> Verification Completed </h6>
                <p className="mb-0 text-muted"> The inspection has been verified successfully.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Verification;
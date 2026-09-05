import { useEffect, useState } from "react";

function Processing({ onComplete }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((previous) => {
        if (previous >= 100) {
          clearInterval(interval);
          return 100;
        }

        return previous + 2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        onComplete();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5" style={{ backgroundColor: "#f5f7fa" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">

            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body text-center p-5">

                {/* Icon */}
                <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                  style={{  width: "90px",  height: "90px",  backgroundColor: "#e8f0fe",  fontSize: "40px",}}>
                  🔍
                </div>

                {/* Heading */}
                <h2 className="fw-bold mb-2"> Processing Inspection </h2>

                <p className="text-muted mb-4">
                  Analyzing the uploaded product images and checking
                  compliance requirements.
                </p>

                {/* Progress */}
                <div className="mb-2">
                  <div className="progress rounded-pill" style={{ height: "10px" }}>
                    <div className="progress-bar bg-primary rounded-pill" role="progressbar" style={{ width: `${progress}%` }}/>
                  </div>
                </div>

                <div className="d-flex justify-content-between mb-4">
                  <small className="text-muted"> AI Analysis
                  </small>

                  <small className="fw-semibold text-primary"> {progress}%
                  </small>
                </div>

                {/* Processing Steps */}
                <div className="text-start">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "32px", height: "32px", backgroundColor: progress >= 20 ? "#d1e7dd" : "#e9ecef",
                         color: progress >= 20 ? "#198754" : "#6c757d",}}>
                      {progress >= 20 ? "✓" : "•"}
                    </div>

                    <span className={  progress >= 20  ? "fw-semibold" : "text-muted"}> Reading product information</span>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "32px", height: "32px",
                        backgroundColor: progress >= 50 ? "#d1e7dd" : "#e9ecef",
                        color: progress >= 50 ? "#198754" : "#6c757d",
                      }}>
                      {progress >= 50 ? "✓" : "•"}
                    </div>

                    <span className={ progress >= 50 ? "fw-semibold" : "text-muted"}> Extracting declarations</span>
                  </div>

                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{  width: "32px",  height: "32px",
                        backgroundColor: progress >= 75 ? "#d1e7dd" : "#e9ecef",
                        color: progress >= 75 ? "#198754" : "#6c757d",
                      }}>
                      {progress >= 75 ? "✓" : "•"}
                    </div>

                    <span className={ progress >= 75 ? "fw-semibold" : "text-muted"}> Running compliance checks</span>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ width: "32px", height: "32px",
                        backgroundColor: progress >= 100 ? "#d1e7dd" : "#e9ecef",
                        color: progress >= 100 ? "#198754" : "#6c757d",
                      }}>
                      {progress >= 100 ? "✓" : "•"}
                    </div>

                    <span className={ progress >= 100 ? "fw-semibold" : "text-muted"}> Preparing inspection results</span>
                  </div>
                </div>

                {/* Bottom text */}
                <div className="mt-4">
                  <small className="text-muted">
                    Please wait while the inspection is being processed.
                  </small>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Processing;
import {  useEffect, useRef, useState } from "react";

function InspectionPage({ onStartInspection }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [cameraError, setCameraError] = useState("");

  //automatically stops camera when leaving page
  useEffect(() => {
  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }
  };
}, []);

  // Open camera
  const openCamera = async () => {
    try {
      setCameraError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      console.error(error);
      setCameraError(
        "Camera could not be opened. Please allow camera permission."
      );
    }
  };

  // Capture photo
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const imageUrl = canvas.toDataURL("image/jpeg");
    setImages((previousImages) => [
      ...previousImages,
      imageUrl,
    ]);
  };

  // Close camera
  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    setCameraOpen(false);
  };

  // Delete image
  const deleteImage = (indexToDelete) => {
    setImages((previousImages) =>
      previousImages.filter(
        (_, index) => index !== indexToDelete
      )
    );
  };

  // Start inspection
  const startInspection = () => {
    if (images.length === 0) return;
    onStartInspection();
  };

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: "#f5f7fa" }}>
      <div className="container">

        {/* Header */}
        <div className="mb-5">
          <div className="d-flex align-items-center gap-3 mb-2">
            <div className="d-flex align-items-center justify-content-center rounded-3"
              style={{ width: "48px", height: "48px", backgroundColor: "#e8f0fe", fontSize: "22px",}}>
              🔍
            </div>

            <div>
              <h2 className="fw-bold mb-0"> New Inspection </h2>
              <p className="text-muted mb-0"> Capture product images to begin inspection </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4 p-md-5">

            {/* Section Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1"> Product Images</h4>

                <p className="text-muted mb-0"> Capture clear images of the product from different angles.</p>
              </div>

              {images.length > 0 && (
                <span className="badge rounded-pill text-bg-light px-3 py-2"> {images.length}{" "} {images.length === 1 ? "Image" : "Images"}</span>
              )}
            </div>

            {/* Camera */}
            {cameraOpen && (
              <div className="mb-4">

                <div className="rounded-4 overflow-hidden bg-dark" style={{ minHeight: "300px",}}>
                  <video ref={videoRef} autoPlay playsInline className="w-100" style={{ maxHeight: "550px", objectFit: "contain",}}/>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button type="button" className="btn btn-primary px-4" onClick={takePhoto}>
                    📸 Take Photo
                  </button>

                  <button type="button" className="btn btn-outline-secondary px-4" onClick={closeCamera}>
                    Close Camera
                  </button>
                </div>
              </div>
            )}

            {/* Camera Error */}
            {cameraError && (
              <div className="alert alert-danger rounded-3">
                {cameraError}
              </div>
            )}

            {/* Upload Area */}
            {!cameraOpen && (
              <div className="border border-2 rounded-4 p-5 text-center" style={{ borderStyle: "dashed", backgroundColor: "#fafbfc",}}>
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: "70px", height: "70px", backgroundColor: "#e8f0fe", fontSize: "30px",}}>
                  📷
                </div>

                <h5 className="fw-bold"> Capture Product Image </h5>

                <p className="text-muted mb-4">
                  Use your camera to capture a clear image of the product.
                  You can add as many images as required.
                </p>

                <button type="button" className="btn btn-primary px-4 py-2 rounded-3" onClick={openCamera}>
                  📷 Upload Image
                </button>
              </div>
            )}

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} style={{ display: "none" }}/>

            {/* Image Preview Section */}
            {images.length > 0 && (
              <div className="mt-5">

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-1"> Captured Images </h5>
                    <small className="text-muted"> Review your images before starting inspection.</small>
                  </div>

                  {!cameraOpen && (
                    <button type="button" className="btn btn-outline-primary btn-sm rounded-3" onClick={openCamera}>
                      + Add Image
                    </button>
                  )}
                </div>

                <div className="row g-3">
                  {images.map((image, index) => (
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={index}>
                      <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
                        <img src={image} alt={`Product ${index + 1}`} className="w-100" style={{ height: "190px", objectFit: "cover",}}/>

                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-semibold"> Image {index + 1}</span>

                            <button type="button" className="btn btn-sm btn-outline-danger rounded-3" onClick={() => deleteImage(index)}>
                              Delete
                            </button>

                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            )}

            <hr className="my-5" />
            
            {/* Start Inspection */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h5 className="fw-bold mb-1"> Ready to inspect? </h5>
                <p className="text-muted mb-0">
                  Start the inspection process once your images are ready.
                </p>
              </div>

              <button type="button" className="btn btn-primary btn-lg px-5 rounded-3" disabled={images.length === 0} onClick={startInspection}>
                Start Inspection →
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InspectionPage;
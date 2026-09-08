import { useEffect, useRef, useState } from "react";

function UploadPhotos({ onContinue }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [images, setImages] = useState([]);
  const [cameraError, setCameraError] = useState("");

  // Stop camera when leaving the page
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

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageUrl = canvas.toDataURL("image/jpeg");

    setImages((previousImages) => [
      ...previousImages,
      imageUrl,
    ]);
  };

  // Gallery upload
  const handleGalleryUpload = (event) => {
    const files = Array.from(event.target.files);

    const selectedImages = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));

    setImages((previousImages) => [
      ...previousImages,
      ...selectedImages,
    ]);

    event.target.value = "";
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

  // Continue to processing
  const startInspection = () => {
    if (images.length === 0) return;

    closeCamera();

    onContinue(images);
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
          <div className="text-muted d-none d-sm-block" style={{ fontSize: "13px" }}>
            New Inspection
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="container py-5">
        {/* Header */}
        <div className="mb-4">
          <div className="text-primary fw-semibold mb-2" style={{ fontSize: "12px", letterSpacing: "0.5px" }}>
            NEW INSPECTION
          </div>
          <h1 className="fw-bold mb-2" style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.7px" }}>
            Upload Product Photos
          </h1>
          <p className="text-muted mb-0" style={{ fontSize: "15px", lineHeight: "1.6" }}>
            Capture clear product images using your camera or upload existing
            images from your device.
          </p>
        </div>

        {/* Main Card */}
        <div className="card border-0 shadow-sm rounded-4">
          <div className="card-body p-4 p-md-5">
            {/* Section Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1">
                  Product Evidence
                </h4>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  Add one or more clear images of the product packaging.
                </p>
              </div>
              {images.length > 0 && (
                <span className="badge rounded-pill text-bg-light px-3 py-2" style={{ fontSize: "11px" }}>
                  {images.length}{" "}
                  {images.length === 1 ? "Image" : "Images"}
                </span>
              )}
            </div>

            {/* Camera */}
            {cameraOpen && (
              <div className="mb-4">
                <div className="rounded-4 overflow-hidden bg-dark" style={{ minHeight: "300px" }}>
                  <video ref={videoRef} autoPlay playsInline className="w-100" style={{ maxHeight: "550px", objectFit: "contain" }} />
                </div>
                <div className="d-flex flex-column flex-sm-row gap-2 mt-3">
                  <button type="button" className="btn btn-primary px-4 rounded-3" onClick={takePhoto}>
                    📸 Take Photo
                  </button>
                  <button type="button" className="btn btn-outline-secondary px-4 rounded-3" onClick={closeCamera}>
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

            {/* Hidden File Input */}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="d-none" onChange={handleGalleryUpload} />

            {/* Upload Area */}
            {!cameraOpen && (
              <div className="border border-2 rounded-4 p-4 p-md-5 text-center" style={{ borderStyle: "dashed", backgroundColor: "#fafbfc" }}>
                <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: "72px", height: "72px", backgroundColor: "#e8f1ff", fontSize: "30px" }}>
                  📷
                </div>
                <h5 className="fw-bold mb-2">
                  Add Product Images
                </h5>
                <p className="text-muted mx-auto mb-4" style={{ maxWidth: "520px", fontSize: "14px", lineHeight: "1.6" }}>
                  Capture a new photo using your camera or select existing
                  product images from your device.
                </p>
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
                  <button type="button" className="btn btn-primary px-4 py-2 rounded-3" onClick={openCamera}>
                    📷 Open Camera
                  </button>
                  <button type="button" className="btn btn-outline-primary px-4 py-2 rounded-3" onClick={() => fileInputRef.current?.click()}>
                    🖼️ Add from Gallery
                  </button>
                </div>
              </div>
            )}

            {/* Hidden Canvas */}
            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="mt-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="fw-bold mb-1">
                      Selected Images
                    </h5>
                    <small className="text-muted">
                      Review the evidence before starting the inspection.
                    </small>
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
                        <img src={image} alt={`Product ${index + 1}`} className="w-100" style={{ height: "190px", objectFit: "cover" }} />
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center gap-2">
                            <span className="fw-semibold" style={{ fontSize: "13px" }}>
                              Image {index + 1}
                            </span>
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

            {/* Guidance */}
            <div className="row g-3 mt-4">
              <div className="col-12 col-md-4">
                <div className="rounded-3 p-3 h-100" style={{ backgroundColor: "#f8f9fa" }}>
                  <div className="fw-semibold mb-1">
                    📐 Clear framing
                  </div>
                  <div className="text-muted" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                    Keep the product fully visible and properly aligned.
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="rounded-3 p-3 h-100" style={{ backgroundColor: "#f8f9fa" }}>
                  <div className="fw-semibold mb-1">
                    💡 Good lighting
                  </div>
                  <div className="text-muted" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                    Avoid glare, shadows and reflections on the package.
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="rounded-3 p-3 h-100" style={{ backgroundColor: "#f8f9fa" }}>
                  <div className="fw-semibold mb-1">
                    🔎 Readable text
                  </div>
                  <div className="text-muted" style={{ fontSize: "12px", lineHeight: "1.5" }}>
                    Make declarations and labels clearly visible.
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <hr className="my-5" />
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <h5 className="fw-bold mb-1">
                  Ready to analyze?
                </h5>
                <p className="text-muted mb-0" style={{ fontSize: "13px" }}>
                  {images.length === 0
                    ? "Add at least one product image to continue."
                    : `${images.length} ${
                        images.length === 1
                          ? "image is"
                          : "images are"
                      } ready for processing.`}
                </p>
              </div>
              <button type="button" className="btn btn-primary btn-lg px-5 rounded-3" disabled={images.length === 0} onClick={startInspection}>
                Start Inspection →
              </button>
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

export default UploadPhotos;
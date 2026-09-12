import { useEffect, useState } from "react";

import Landing from "./pages/Landing";
import InspectorLogin from "./pages/InspectorLogin";
import InspectionPage from "./pages/InspectionPage";
import UploadPhotos from "./pages/UploadPhotos";
import Processing from "./pages/Processing";
import ExtractedData from "./pages/ExtractedData";
import EditData from "./pages/EditData";
import Results from "./pages/Results";
import Verification from "./pages/Verification";

/* MOCK AI EXTRACTED DATA */
const initialExtractedData = [
  {
    fieldName: "PRODUCT_NAME",
    label: "Product Name",
    value: "Parle-G Biscuits",
    confidence: 0.98,
    ocrText: "PARLE-G BISCUITS",
    bbox: [120, 180, 900, 320],
    status: "DETECTED",
  },

  {
    fieldName: "MRP",
    label: "MRP",
    value: "₹50",
    confidence: 0.99,
    ocrText: "MRP ₹50 incl. of all taxes",
    bbox: [1900, 350, 2220, 450],
    status: "DETECTED",
  },

  {
    fieldName: "NET_QTY",
    label: "Net Quantity",
    value: "250 g",
    confidence: 0.97,
    ocrText: "Net Quantity 250 g",
    bbox: [150, 420, 620, 500],
    status: "DETECTED",
  },

  {
    fieldName: "MANUFACTURER",
    label: "Manufacturer",
    value: "Parle Products Pvt. Ltd.",
    confidence: 0.94,
    ocrText: "Manufactured by Parle Products Pvt. Ltd.",
    bbox: [120, 2900, 1450, 3150],
    status: "DETECTED",
  },

  {
    fieldName: "PACKER",
    label: "Packer",
    value: "Not detected",
    confidence: null,
    ocrText: null,
    bbox: null,
    status: "NOT_DETECTED",
  },

  {
    fieldName: "IMPORTER",
    label: "Importer",
    value: "Not detected",
    confidence: null,
    ocrText: null,
    bbox: null,
    status: "NOT_DETECTED",
  },

  {
    fieldName: "ADDRESS",
    label: "Address",
    value: "Vile Parle East, Mumbai, Maharashtra, India",
    confidence: 0.90,
    ocrText: "Vile Parle East, Mumbai, Maharashtra, India",
    bbox: [120, 3150, 1600, 3400],
    status: "DETECTED",
  },

  {
    fieldName: "DATE",
    label: "Date",
    value: "2026-08",
    confidence: 0.91,
    ocrText: "MFD AUG 2026",
    bbox: [1850, 2550, 2220, 2650],
    status: "DETECTED",
  },

  {
    fieldName: "CONSUMER_CARE",
    label: "Consumer Care",
    value: "1800-123-4567",
    confidence: 0.89,
    ocrText: "Consumer Care 1800-123-4567",
    bbox: [120, 3400, 1100, 3550],
    status: "DETECTED",
  },

  {
    fieldName: "ORIGIN",
    label: "Origin",
    value: "Not detected",
    confidence: null,
    ocrText: null,
    bbox: null,
    status: "NOT_DETECTED",
  },

  {
    fieldName: "DIMENSIONS",
    label: "Dimensions",
    value: "Not detected",
    confidence: null,
    ocrText: null,
    bbox: null,
    status: "NOT_DETECTED",
  },

  {
    fieldName: "OTHER_DECLARATIONS",
    label: "Other Declarations",
    value: "Not detected",
    confidence: null,
    ocrText: null,
    bbox: null,
    status: "NOT_DETECTED",
  },
];
function App() {
  const [page, setPage] = useState("landing");
  const [selectedInspector, setSelectedInspector] = useState(null);


  const [extractedData, setExtractedData] = useState(
    initialExtractedData
  );

  // Set initial history entry
  useEffect(() => {
    window.history.replaceState(
      { page: "landing" },
      "",
      window.location.href
    );

    const handlePopState = (event) => {
      if (event.state?.page) {
        setPage(event.state.page);
      } else {
        setPage("landing");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Navigation function
  const navigateTo = (nextPage) => {
    window.history.pushState(
      { page: nextPage },
      "",
      window.location.href
    );
    setPage(nextPage);
  };

  // Scroll to top
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [page]);

  return (
    <>
      {/* LANDING */}
      {page === "landing" && (
        <Landing
        onInspectorLogin={() => {navigateTo("inspectorLogin");}}
        onDashboardLogin={() => { alert("Dashboard login will be connected later.");}}
          />
      )}

      {/* INSPECTOR LOGIN */}
      {page === "inspectorLogin" && (
        <InspectorLogin
         onSelectInspector={(inspector) => { setSelectedInspector(inspector); navigateTo("inspection");}}
         />
      )}

      {/* INSPECTION */}
      {page === "inspection" && (
        <InspectionPage
         inspector={selectedInspector}
          onStartInspection={() => { navigateTo("uploadPhotos");}}
           onLogout={() => { setSelectedInspector(null); navigateTo("landing");}}
          />
      )}

      {/* UPLOAD PHOTOS */}
      {page === "uploadPhotos" && (
         <UploadPhotos
          onContinue={() => { navigateTo("processing");}}
          />
      )}

      {/* PROCESSING */}
      {page === "processing" && (
        <Processing
          onComplete={() => { navigateTo("extractedData"); }}
        />
      )}

      {/* EXTRACTED DATA */}
      {page === "extractedData" && (
        <ExtractedData
          data={extractedData}
          onEdit={() => { navigateTo("editData");}}
          onContinue={() => { navigateTo("results");}}
        />
      )}

      {/* EDIT DATA */}
      {page === "editData" && (
        <EditData
          data={extractedData}
          onCancel={() => { navigateTo("extractedData");}}
          onSave={(updatedData) => { setExtractedData(updatedData); navigateTo("extractedData");}}
        />
      )}

      {/* RESULTS */}
      {page === "results" && (
        <Results
          extractedData={extractedData}
          onProceedToVerification={() => { navigateTo("verification");}}
          onNewInspection={() => { setExtractedData(initialExtractedData); navigateTo("inspection");}}
        />
      )}

      {/* VERIFICATION */}
      {page === "verification" && (
        <Verification
          extractedData={extractedData}
          onSaveChanges={(updatedData) => { setExtractedData(updatedData);}}
          onCompleteVerification={(updatedData) => { setExtractedData(updatedData); navigateTo("results");}}
          onReinspect={() => { navigateTo("processing");}}
        />
      )}
    </>
  );
}

export default App;
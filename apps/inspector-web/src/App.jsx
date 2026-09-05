import { useEffect, useState } from "react";

import InspectionPage from "./pages/InspectionPage";
import Processing from "./pages/Processing";
import Results from "./pages/Results";
import Verification from "./pages/Verification";
import FinalResult from "./pages/FinalResult";

function App() {
  const [page, setPage] = useState("inspection");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [page]);

  return (
    <>
      {page === "inspection" && (
        <InspectionPage
          onStartInspection={() => setPage("processing")}
        />
      )}

      {page === "processing" && (
        <Processing
          onComplete={() => setPage("results")}
        />
      )}

      {page === "results" && (
        <Results
        onProceedToVerification={() => setPage("verification")}
        onProceedToFinal={() => setPage("final")}
        />
      )}

      {page === "verification" && (
        <Verification
          onCompleteVerification={() => setPage("final")}
        />
      )}

      {page === "final" && (
        <FinalResult
          onNewInspection={() => setPage("inspection")}
        />
      )}
    </>
  );
}

export default App;
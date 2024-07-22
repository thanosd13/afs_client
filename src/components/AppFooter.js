import React from "react";
import { CFooter } from "@coreui/react";

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a
          style={{ color: "#1A8AAE" }}
          href="https://afs.gr/"
          target="_blank"
          rel="noopener noreferrer"
        >
          AFS
        </a>
        <span className="ms-1">&copy; 2024</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a
          style={{ color: "#1A8AAE" }}
          href="https://www.linkedin.com/in/thanos-dimopoulos-089541243/"
          target="_blank"
          rel="noopener noreferrer"
        >
          td13
        </a>
      </div>
    </CFooter>
  );
};

export default React.memo(AppFooter);

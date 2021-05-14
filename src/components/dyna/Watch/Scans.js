import React from "react";

const Scans = ({ id, finished, NextScan, FinishedScan, inVolume, VolId }) => {
  return (
    <div
      onClick={() => FinishedScan(id, inVolume ? VolId - 1 : null)}
      className="ScanManga"
      id={inVolume ? `Vol-${VolId}-VM-${id}` : `SM-${id}`}
    >
      Scan <span className="SM-Text">{id}</span>{" "}
      {NextScan ? (
        <span className="fas fa-flag-checkered"></span>
      ) : finished ? (
        <span className="fas fa-check-circle"></span>
      ) : (
        <span className="fas fa-times"></span>
      )}
    </div>
  );
};

export default Scans;

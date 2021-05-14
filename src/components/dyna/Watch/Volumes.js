import React from "react";
// CO
import Scans from "./Scans";

const Volumes = ({ objData, FinishedScan }) => {
  let LastFinished = [false, 0];
  const RenderScans = objData.Scans.map((finished, i) => {
    if (!finished && !LastFinished[0]) {
      LastFinished = [true, i];
    }

    return (
      <Scans
        key={i}
        id={i + 1}
        finished={finished}
        FinishedScan={FinishedScan}
        inVolume={true}
        VolId={objData.volumeId}
        NextScan={
          LastFinished[0] && LastFinished[1] === 0 && i === 0
            ? true
            : LastFinished[0] && i === LastFinished[1] && LastFinished[1] !== 0
            ? true
            : false
        }
      />
    );
  });
  return (
    <div className="VolumeManga" id={`VM-${objData.volumeId}`}>
      <h1>
        Volume {objData.volumeId}{" "}
        {objData.finished ? (
          <span style={{ color: "#01d332" }} className="fas fa-check"></span>
        ) : (
          ":"
        )}
      </h1>
      <div className="ScanContainer">{RenderScans}</div>
    </div>
  );
};

export default Volumes;

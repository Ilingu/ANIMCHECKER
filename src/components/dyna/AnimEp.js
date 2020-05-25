import React from "react";
import { Button } from "react-bootstrap";

const AnimEp = ({ ObjInfo, play, ToOpen, NextToOpen, AddEp }) => {
  const EP = ObjInfo.Episodes.map((id) => (
    <div
      key={id.id}
      id={id.id}
      style={id.finished ? { textDecoration: "line-through" } : null}
      onClick={() => play(ObjInfo, id.id)}
    >
      {id.finished ? (
        <span className="fas fa-check"></span>
      ) : (
        <span className="fas fa-play"></span>
      )}{" "}
      Episode {id.id}
    </div>
  ));

  return (
    <div
      className={
        ToOpen === ObjInfo.name.split(" ").join("")
          ? "accordion-child active"
          : "accordion-child"
      }
      id={ObjInfo.name.split(" ").join("")}
      onClick={() => NextToOpen(ObjInfo.name.split(" ").join(""))}
    >
      <div className="name">
        {ObjInfo.name}{" "}
        {ObjInfo.finished === true ? (
          <span className="fas fa-check"></span>
        ) : null}
        <Button variant="success" id="AddEpBtn" onClick={AddEp}>
          <span className="fas fa-plus"></span> Add Ep
        </Button>
      </div>
      <div className="episodes">{EP}</div>
    </div>
  );
};

export default AnimEp;

import React from "react";
import { Button } from "react-bootstrap";

const AnimEp = ({
  ObjInfo,
  play,
  ToOpen,
  NextToOpen,
  AddEp,
  nbTotalSeason,
  ReverseFinished,
  RemoveVal,
}) => {
  const idSaison = ObjInfo.name.split(" ")[1];
  const EP = ObjInfo.Episodes.map((id) => (
    <div
      key={id.id}
      id={id.id}
      onClick={(event) => {
        if (
          event.target.classList[1] === "fa-trash" ||
          event.target.classList[1] === "fa-undo-alt"
        )
          return;
        play(ObjInfo, id.id);
      }}
    >
      {id.finished ? (
        <span className="fas fa-check"></span>
      ) : (
        <span className="fas fa-play"></span>
      )}{" "}
      <span
        style={
          id.finished
            ? { textDecoration: "line-through", color: "greenyellow" }
            : { color: "#ff6d00" }
        }
      >
        Episode {id.id}
      </span>{" "}
      <span
        onClick={() => ReverseFinished(idSaison - 1, id.id)}
        className="fas fa-undo-alt"
      ></span>
      {id.id === ObjInfo.Episodes.length ? (
        <span
          onClick={() => RemoveVal("EP", idSaison - 1, id.id)}
          title={`Supprimer l'épisode ${
            id.id < 10 ? `0${id.id}` : id.id
          }S${idSaison} ?`}
          className="fas fa-trash"
        ></span>
      ) : null}
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
      onClick={(event) => {
        if (
          event.target.classList[1] === "fa-trash" ||
          event.target.classList[1] === "fa-undo-alt"
        )
          return;
        NextToOpen(ObjInfo.name.split(" ").join(""));
      }}
    >
      <div className="name">
        {ObjInfo.name}{" "}
        {ObjInfo.finished === true ? (
          <span className="fas fa-check"></span>
        ) : null}
        {parseInt(idSaison) === nbTotalSeason ? (
          <span
            title={`Supprimer la Saison ${idSaison} ?`}
            onClick={() => RemoveVal("Serie", idSaison - 1)}
            className="fas fa-trash"
          ></span>
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

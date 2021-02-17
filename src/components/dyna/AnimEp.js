import React, { useContext } from "react";
import EpisodeList from "./Episode";
import { Button } from "react-bootstrap";
// Context
import Context from "../../Context/ContextEP";

const AnimEp = ({ ObjInfo, ToOpen, NextToOpen, AddEp, nbTotalSeason }) => {
  // Context
  const ContextVar = useContext(Context);
  // APP
  const idSaison = ObjInfo.name.split(" ")[1];
  const EPList = ObjInfo.Episodes.map((id) => (
    <EpisodeList
      key={id.id}
      AllDataEp={id}
      LastEP={ObjInfo.Episodes.length}
      idSaison={idSaison}
      ForWatch={true}
    />
  ));

  return (
    <div
      className={
        ToOpen === idSaison ? "accordion-child active" : "accordion-child"
      }
      id={ObjInfo.name.split(" ").join("")}
    >
      <div
        className="name"
        onClick={(event) => {
          if (
            event.target.classList[1] === "fa-trash" ||
            event.target.classList[1] === "fa-undo-alt"
          )
            return;
          NextToOpen(idSaison);
        }}
      >
        {ObjInfo.name}
        {ObjInfo.finished === true ? (
          <span className="fas fa-check"></span>
        ) : null}{" "}
        <span className="HourAnime">
          (
          {typeof ContextVar.Duration === "string" &&
          ContextVar.Duration !== "none"
            ? parseFloat(
                (ObjInfo.Episodes.length *
                  parseInt(ContextVar.Duration.split(" ")[0])) /
                  60
              ).toFixed(1)
            : null}
          H)
        </span>
        {parseInt(idSaison) === nbTotalSeason ? (
          <span
            title={`Supprimer la Saison ${idSaison} ?`}
            onClick={() => ContextVar.RemoveEP("Serie", idSaison - 1)}
            className="fas fa-trash"
          ></span>
        ) : null}
        <Button variant="success" id="AddEpBtn" onClick={AddEp}>
          <span className="fas fa-plus"></span> Add Ep
        </Button>
      </div>
      <div id="EpisodesList">{EPList}</div>
    </div>
  );
};

export default AnimEp;

import React, { useContext } from "react";
// Context
import Context from "../../Context/ContextEP";

const Episode = ({
  imgUrl,
  nbEp,
  urlVideo,
  title,
  ForWatch = false,
  AllDataEp,
  idSaison,
  LastEP,
}) => {
  // Context
  const ContextVar = useContext(Context);
  // APP
  if (!ForWatch)
    return (
      <div className="EP">
        <a href={urlVideo} target="_blank" rel="noopener noreferrer">
          <div className="img">
            <img src={imgUrl} alt="Ep img" />
            <div className="play">
              <span className="fas fa-play"></span>
            </div>
          </div>
          <h4>
            <span className="EpNb">{nbEp}: </span>
            <span className="title">{title}</span>
          </h4>
        </a>
      </div>
    );
  /*
 filler,
  recap,
  duration
   */

  return (
    <div
      id={`EP-${AllDataEp.id}`}
      className={
        AllDataEp.Info?.filler
          ? "EPWatch filler"
          : AllDataEp.Info?.recap
          ? "EPWatch recap"
          : AllDataEp.finished
          ? "EPWatch finishedEp"
          : "EPWatch"
      }
    >
      <div className="img">
        {LastEP === AllDataEp.id ? (
          <div
            className="deleteEP"
            title={`Supprimer l'épisode ${
              AllDataEp.id < 10 ? `0${AllDataEp.id}` : AllDataEp.id
            }S${idSaison} ?`}
            onClick={() =>
              ContextVar.RemoveEP("EP", idSaison - 1, AllDataEp.id)
            }
          >
            <span className="fas fa-trash"></span>
          </div>
        ) : null}
        <div
          className="reverseEP"
          onClick={() => ContextVar.ReverseEP(idSaison - 1, AllDataEp.id)}
        >
          <span className="fas fa-undo-alt"></span>
        </div>
        <div
          className={
            AllDataEp.id.toString().length >= 3 ? "EpHashtag Big" : "EpHashtag"
          }
        >
          #<span>{AllDataEp.id}</span>
        </div>
        {AllDataEp.Info?.filler || AllDataEp.Info?.recap ? (
          <div
            className={`Specials ${
              AllDataEp.Info?.filler ? "Filler" : "Recap"
            }`}
          >
            {AllDataEp.Info?.filler ? "Filler" : "Recap"}
          </div>
        ) : null}
        <img src={ContextVar.ImgUrl} alt="Ep img" />
        <div className="play" onClick={() => ContextVar.play(AllDataEp.id)}>
          <span className="fas fa-play"></span>
        </div>
      </div>
      <h4>
        <span className="EpNb">
          EP <span>{AllDataEp.id}</span>
          {typeof ContextVar.Duration === "string" &&
          ContextVar.Duration !== "none"
            ? `-${ContextVar.Duration.split(" ")[0]}Min`
            : null}
          {!AllDataEp.Info ? "" : ":"}{" "}
        </span>
        <span className="title">{AllDataEp.Info?.title}</span>
      </h4>
    </div>
  );
};

export default Episode;

import React from "react";
import { Link } from "react-router-dom";

const WhitchSeason = () => {
  const Month = new Date().getMonth() + 1;
  let season = null;
  switch (Month) {
    case 12:
    case 1:
    case 2:
      season = "hiver";
      break;
    case 3:
    case 4:
    case 5:
      season = "printemps";
      break;
    case 6:
    case 7:
    case 8:
      season = "ete";
      break;
    case 9:
    case 10:
    case 11:
      season = "automne";
      break;
    default:
      break;
  }
  return season;
};

const PosterAnim = ({
  Pseudo,
  url,
  score,
  title,
  type,
  id,
  Rate,
  UnPaused,
  SeeInDetails,
  inMyAnim,
  fnFav,
  isFinished,
  deleteAnim,
  isFav,
  Paused,
  AnimeSeason,
  ModeFilter,
  isAlleged,
}) => {
  let Fav = isFav;

  const templatePoster = (
    <div
      className={
        AnimeSeason && !isFinished
          ? `MyAnimPoster Season ${WhitchSeason()}`
          : Paused
          ? "MyAnimPoster Paused"
          : isFinished && isAlleged
          ? "MyAnimPoster finished alleged"
          : !isFinished && isAlleged
          ? "MyAnimPoster alleged"
          : isFinished
          ? "MyAnimPoster finished"
          : "MyAnimPoster"
      }
      title={title}
    >
      {isFinished || Paused ? <h4>{title}</h4> : null}
      <div
        id="FavBtns"
        title={isFav ? "Retirer des Fav" : "Ajouter au Fav"}
        onClick={() => fnFav(id, !isFav)}
      >
        <span
          className={`FvBtn fas fa-heart ${Fav ? "show" : "hide"}${
            isFinished || Paused ? " bottom" : ""
          }`}
        ></span>
        <span
          className={`FvBtn far fa-heart ${!Fav ? "show" : "hide"}${
            isFinished || Paused ? " bottom" : ""
          }`}
        ></span>
      </div>
      {Rate ? (
        <span style={{ color: "gold" }} className="RatingStar fas fa-star">
          {Rate}
        </span>
      ) : null}

      <div className="ImgInterract">
        <img src={url} alt="Img of Anim" />
      </div>
      <div className="action">
        {Paused ? (
          <div
            className="watch paused"
            onClick={() => UnPaused(id)}
            title={`Reprendre ${title}`}
          >
            <span className="fas fa-play-circle"></span>
          </div>
        ) : isAlleged ? null : (
          <Link push="false" to={`/Watch/${Pseudo}/${id}`}>
            <div className="watch">
              <span className="fas fa-eye"></span>
            </div>
          </Link>
        )}

        <div
          className="delete"
          onClick={() => deleteAnim(`${Pseudo}/${id.split("-")[0]}/${id}`)}
        >
          <span className="fas fa-trash-alt"></span>
        </div>
      </div>
      {Paused ? (
        <h5>
          <span className="fas fa-pause"></span> En Pause
        </h5>
      ) : isFinished && isAlleged ? (
        <h5>
          <span className="fas fa-check"></span> + Allégé
        </h5>
      ) : isAlleged ? (
        <h5>{title}: Allégé</h5>
      ) : isFinished ? (
        <h5>
          <span className="fas fa-check"></span>
        </h5>
      ) : (
        <h4 className="name">{title}</h4>
      )}
    </div>
  );

  if (!inMyAnim) {
    return (
      <div className="poster" onClick={() => SeeInDetails(id)}>
        <img src={url} alt="Img of Anim" />
        <h4>
          <span className="title">{title}</span>,<br />
          <span className="score">{score}/10</span>,{" "}
          <span className="type">{type === "Movie" ? "Movie" : "Anime"}</span>
        </h4>
      </div>
    );
  } else if (ModeFilter === "All") {
    return templatePoster;
  } else if (ModeFilter === "NotFinished") {
    return isFinished ? null : Paused ? null : templatePoster;
  } else if (ModeFilter === "Finished") {
    return isFinished ? templatePoster : null;
  } else if (ModeFilter === "Paused") {
    return Paused ? templatePoster : null;
  } else if (ModeFilter === "Rate") {
    return Rate ? templatePoster : null;
  } else if (ModeFilter === "fav") {
    return isFav ? templatePoster : null;
  } else {
    return AnimeSeason ? templatePoster : null;
  }
};

export default PosterAnim;

import React from "react";
import { Link } from "react-router-dom";

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
  isFinished,
  deleteAnim,
  Paused,
  ModeFilter,
  isAlleged,
}) => {
  const templatePoster = (
    <div
      className={
        Paused
          ? "MyAnimPoster Paused"
          : isFinished && isAlleged
          ? "MyAnimPoster finished alleged"
          : !isFinished && isAlleged
          ? "MyAnimPoster alleged"
          : isFinished
          ? "MyAnimPoster finished"
          : "MyAnimPoster"
      }
    >
      {isFinished || Paused ? <h4>{title}</h4> : null}
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
  } else {
    return Rate ? templatePoster : null;
  }
};

export default PosterAnim;

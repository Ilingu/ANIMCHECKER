import React from "react";
import { Link } from "react-router-dom";

const PosterAnim = ({
  url,
  score,
  title,
  type,
  id,
  SeeInDetails,
  inMyAnim,
  isFinished,
  deleteAnim,
}) => {
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
  } else {
    return (
      <div className={isFinished ? "MyAnimPoster finished" : "MyAnimPoster"}>
        {isFinished ? <h4>{title}</h4> : null}

        <div className="ImgInterract">
          <img src={url} alt="Img of Anim" />
        </div>
        <div className="action">
          <Link push="true" to={`/Watch/${id}`}>
            <div className="watch">
              <span className="fas fa-eye"></span>
            </div>
          </Link>

          <div
            className="delete"
            onClick={() => deleteAnim(`/${id.split("-")[0]}/${id}`)}
          >
            <span className="fas fa-trash-alt"></span>
          </div>
        </div>
        {isFinished ? (
          <h5>
            <span className="fas fa-check"></span>
          </h5>
        ) : (
          <h4 className="name">{title}</h4>
        )}
      </div>
    );
  }
};

export default PosterAnim;

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
      <Link push="true" to={`/Watch/${id}`}>
        <div className="poster">
          <img src={url} alt="Img of Anim" />
          <h4>
            <span className="title">{title}</span>,<br />
          </h4>
        </div>
      </Link>
    );
  }
};

export default PosterAnim;

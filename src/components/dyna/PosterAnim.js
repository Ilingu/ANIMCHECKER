import React, { useState } from "react";
import { Redirect } from "react-router-dom";

const PosterAnim = ({ url, score, title, type }) => {
  const [GoSee, setGoSee] = useState(false);

  if (!GoSee) {
    return (
      <div className="poster" onClick={() => setGoSee(true)}>
        <img src={url} alt="Img of Anim" />
        <h4>
          <span className="title">{title}</span>,<br />
          <span className="score">{score}/10</span>,{" "}
          <span className="type">{type === "Movie" ? "Movie" : "Anime"}</span>
        </h4>
      </div>
    );
  } else {
    return <Redirect push="true" to={`/Anim/${title}`} />;
  }
};

export default PosterAnim;

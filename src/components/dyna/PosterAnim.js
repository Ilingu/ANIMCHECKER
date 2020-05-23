import React from "react";

const PosterAnim = ({ url, score, title, type, id, SeeInDetails }) => {
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
};

export default PosterAnim;

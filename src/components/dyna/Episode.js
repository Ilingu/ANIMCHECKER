import React from "react";

const Episode = ({ imgUrl, nbEp, urlVideo, title }) => {
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
};

export default Episode;

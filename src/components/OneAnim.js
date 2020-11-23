import React, { Fragment } from "react";
// Components
import Episode from "./dyna/Episode";
// CSS
import { Button, ResponsiveEmbed } from "react-bootstrap";

const OneAnim = ({
  details,
  back,
  handleAdd,
  ShowMessageHtml,
  ShowMessage,
  ResText,
}) => {
  let Episodes = details[0].episodes.map((EP) => (
    <Episode
      key={EP.episode_id}
      imgUrl={details[1].image_url}
      nbEp={EP.episode_id}
      urlVideo={EP.video_url}
      title={EP.title}
    />
  ));

  return (
    <Fragment>
      <div className="container" id="oneAnim">
        <header>
          <h1 className="title">{`${details[1].title} (${details[1].title_japanese})`}</h1>
          <div className="img">
            <img src={details[1].image_url} alt="Img of anim" />
            <a href={details[1].url} target="_blank" rel="noopener noreferrer">
              <div className="play">
                <span className="fas fa-play"></span>
              </div>
            </a>
          </div>
          <h5>
            <span className="score">{`${details[1].score}/10 (${
              details[1].scored_by >= 2
                ? details[1].scored_by + " votes"
                : details[1].scored_by + " vote"
            })`}</span>
            <br />
            <span className="broadcast">
              One episodes every {details[1].broadcast}
            </span>
          </h5>
        </header>
        <section id="infoSup">
          <Button variant="primary" onClick={back} className="btnBackDesing">
            <span className="fas fa-arrow-left"></span> Retour
          </Button>
          <header>
            <h1>Info supplémentaires</h1>
          </header>
          <div className="content">
            <ul>
              <li>
                Durée: <span className="info">{details[1].duration}</span>
              </li>
              <li>
                Type:{" "}
                <span className="info">
                  {details[1].type === "Movie" ? details[1].type : "Anime"}
                </span>
              </li>
              <li>
                Age requis: <span className="info">{details[1].rating}</span>
              </li>
              <li>
                Premiere: <span className="info">{details[1].premiered}</span>
              </li>
              <li>
                Résumé: <span className="info">{details[1].synopsis}</span>
              </li>
            </ul>
          </div>
        </section>
        <section id="trailer">
          <header>
            <h1>Trailer</h1>
          </header>
          <div
            id="TrailerVideo"
            style={{
              width: 660,
              height: "auto",
            }}
          >
            <ResponsiveEmbed aspectRatio="16by9">
              <embed type="image/svg+xml" src={details[1].trailer_url} />
            </ResponsiveEmbed>
          </div>
        </section>
        <section id="episodes">
          <header>
            <h1>
              {details[0].episodes.length >= 2
                ? `Episodes (${details[0].episodes.length})`
                : `Episode (${details[0].episodes.length})`}
            </h1>
          </header>
          <div className="EpContent">{Episodes}</div>
        </section>
      </div>
      <Button
        variant="success"
        block
        className="fixedOnBottom"
        size="lg"
        onClick={handleAdd}
      >
        <span className="fas fa-plus"></span> Ajouter {details[1].title}
      </Button>
      {ShowMessageHtml ? (
        <div className={`ackmessage${ShowMessage ? " show" : " hide"}`}>
          <span className="fas fa-info"></span> {ResText}
        </div>
      ) : null}
    </Fragment>
  );
};

export default OneAnim;

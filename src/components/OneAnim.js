import React, { useState, Fragment, useEffect } from "react";
import axios from "axios";
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
  Manga,
}) => {
  const [SynopsisText, setSynopsisText] = useState(details[1].synopsis);
  const [TranslatedCacheSynopsis, setTranslatedCacheSynopsis] = useState("");
  const [Original, setOriginal] = useState(true);
  useEffect(() => {
    axios
      .request({
        method: "GET",
        url:
          "https://systran-systran-platform-for-language-processing-v1.p.rapidapi.com/translation/text/translate",
        params: { source: "en", target: "fr", input: details[1].synopsis },
        headers: {
          "x-rapidapi-key":
            "412437fce2mshdbaa1f4314616bep11404djsn8f200dcb59de",
          "x-rapidapi-host":
            "systran-systran-platform-for-language-processing-v1.p.rapidapi.com",
        },
      })
      .then((res) => {
        setSynopsisText(res.data.outputs[0].output);
        setTranslatedCacheSynopsis(res.data.outputs[0].output);
        setOriginal(false);
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (Manga) {
    // Extra render
    const Genres = details[1]?.genres.map((genre) => genre.name).join(", ");
    const Authors = details[1]?.authors.map((author) => author.name).join(", ");
    const SynonymsTitles = `${
      details[1]?.title_english
    }, ${details[1]?.title_synonyms.join(", ")}, ${details[1]?.title_japanese}`;
    return (
      <Fragment>
        <div className="container" id="oneAnim">
          <header>
            <h1 className="title">{`${details[1].title}`}</h1>
            <div className="img">
              <img src={details[1].image_url} alt="Img of anim" />
              <a
                href={details[1].url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="info">
                  <span className="fas fa-info-circle"></span>
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
            </h5>
          </header>
          <section id="infoSup">
            <Button
              variant="primary"
              onClick={back}
              className="btnBackDesing fixed"
            >
              <span className="fas fa-arrow-left"></span>
            </Button>
            <header>
              <h1>Info supplémentaires</h1>
            </header>
            <div className="content">
              <ul>
                <li>
                  Titres Alternatifs:{" "}
                  <span className="info">{SynonymsTitles}</span>
                </li>
                <li>
                  Type: <span className="info">{details[1].type}</span>
                </li>
                <li>
                  Genre{details[1].genres > 1 ? "s" : null}:{" "}
                  <span className="info">
                    <b>{Genres}</b>
                  </span>
                </li>
                <li>
                  Popularité:{" "}
                  <span className="info">
                    {details[1].popularity}
                    <sup>ème</sup>
                  </span>
                </li>
                <li>
                  Scan:{" "}
                  <span className="info">
                    {!details[1].chapters
                      ? "Non précisé, manga non finis"
                      : details[1].chapters}
                  </span>
                </li>
                <li>
                  Status: <span className="info">{details[1].status}</span>
                </li>
                <li>
                  Auteur(s): <span className="info">{Authors}</span>
                </li>
                <li>
                  Résumé: <span className="info">{SynopsisText}</span>{" "}
                  {!Original ? (
                    <span style={{ color: "#aaa" }}>
                      {`{Traduit par SYSTRAN.io}`}{" "}
                    </span>
                  ) : null}
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => {
                      if (Original) {
                        if (TranslatedCacheSynopsis === "") {
                          setSynopsisText("Traduction impossible.");
                          setTimeout(
                            () => setSynopsisText(details[1].synopsis),
                            5000
                          );
                          return;
                        }
                        setSynopsisText(TranslatedCacheSynopsis);
                        setOriginal(false);
                        return;
                      }
                      setSynopsisText(details[1].synopsis);
                      setOriginal(true);
                    }}
                  >
                    {Original ? "Traduire (par SYSTRAN.io)" : "Original"}
                  </Button>
                </li>
              </ul>
            </div>
          </section>
          <Button
            variant="primary"
            id="fixedOnTop"
            onClick={() => handleAdd("NA")}
          >
            <span className="fas fa-plus"></span> Ajouter aux "Next Manga"
          </Button>
          <Button
            variant="success"
            block
            id="fixedOnBottom"
            onClick={handleAdd}
          >
            <span className="fas fa-plus"></span>{" "}
            <span className="textContent">
              Ajouter {details[1]?.title.split(":")[0]}
            </span>
          </Button>
        </div>

        {ShowMessageHtml ? (
          <div className={`ackmessage${ShowMessage ? " show" : " hide"}`}>
            <span className="fas fa-info"></span> {ResText}
          </div>
        ) : null}
      </Fragment>
    );
  }
  const Episodes = details[0]?.episodes.map((EP) => (
    <Episode
      key={EP.episode_id}
      imgUrl={details[1].image_url}
      nbEp={EP.episode_id}
      urlVideo={EP.video_url}
      title={EP.title}
    />
  ));
  // Extra render
  const Genres = details[1]?.genres.map((genre) => genre.name).join(", ");
  const Studios = details[1]?.studios.map((studio) => studio.name).join(", ");
  const SynonymsTitles = `${
    details[1]?.title_english
  }, ${details[1]?.title_synonyms.join(", ")}, ${details[1]?.title_japanese}`;
  // Render
  return (
    <Fragment>
      <div className="container" id="oneAnim">
        <header>
          <h1 className="title">{`${details[1].title}`}</h1>
          <div className="img">
            <img src={details[1].image_url} alt="Img of anim" />
            <a href={details[1].url} target="_blank" rel="noopener noreferrer">
              <div className="info">
                <span className="fas fa-info-circle"></span>
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
          <Button
            variant="primary"
            onClick={back}
            className="btnBackDesing fixed"
          >
            <span className="fas fa-arrow-left"></span>
          </Button>
          <header>
            <h1>Info supplémentaires</h1>
          </header>
          <div className="content">
            <ul>
              <li>
                Titres Alternatifs:{" "}
                <span className="info">{SynonymsTitles}</span>
              </li>
              <li>
                Type:{" "}
                <span className="info">
                  {details[1].type === "Movie" ? details[1].type : "Series"}
                </span>
              </li>
              <li>
                Genre{details[1].genres > 1 ? "s" : null}:{" "}
                <span className="info">
                  <b>{Genres}</b>
                </span>
              </li>
              <li>
                Popularité:{" "}
                <span className="info">
                  {details[1].popularity}
                  <sup>ème</sup>
                </span>
              </li>
              <li>
                Durée: <span className="info">{details[1].duration}</span>
              </li>
              <li>
                Status: <span className="info">{details[1].status}</span>
              </li>

              <li>
                Studio{details[1].studios > 1 ? "s" : null}:{" "}
                <span className="info">{Studios}</span>
              </li>
              <li>
                Premiere: <span className="info">{details[1].premiered}</span>
              </li>
              <li>
                Age requis: <span className="info">{details[1].rating}</span>
              </li>
              <li>
                Résumé: <span className="info">{SynopsisText}</span>{" "}
                {!Original ? (
                  <span style={{ color: "#aaa" }}>
                    {`{Traduit par SYSTRAN.io}`}{" "}
                  </span>
                ) : null}
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => {
                    if (Original) {
                      if (TranslatedCacheSynopsis === "") {
                        setSynopsisText("Traduction impossible.");
                        setTimeout(
                          () => setSynopsisText(details[1].synopsis),
                          5000
                        );
                        return;
                      }
                      setSynopsisText(TranslatedCacheSynopsis);
                      setOriginal(false);
                      return;
                    }
                    setSynopsisText(details[1].synopsis);
                    setOriginal(true);
                  }}
                >
                  {Original ? "Traduire (par SYSTRAN.io)" : "Original"}
                </Button>
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
              <iframe
                title={`Trailer de ${details[1].title}`}
                src={details[1].trailer_url?.split("?")[0]}
                frameBorder="0"
                allowFullScreen={true}
              ></iframe>
            </ResponsiveEmbed>
          </div>
        </section>
        <section id="episodesOneAnim">
          <header>
            <h1>
              {details[0].episodes.length >= 2
                ? `Episodes (${details[0].episodes.length})`
                : `Episode (${details[0].episodes.length})`}
            </h1>
          </header>
          <div className="EpContent">{Episodes}</div>
        </section>
        <Button
          variant="primary"
          id="fixedOnTop"
          onClick={() => handleAdd("NA")}
        >
          <span className="fas fa-plus"></span> Ajouter aux "Next Anime"
        </Button>
        <Button variant="success" block id="fixedOnBottom" onClick={handleAdd}>
          <span className="fas fa-plus"></span>{" "}
          <span className="textContent">
            Ajouter {details[1]?.title.split(":")[0]}
          </span>
        </Button>
      </div>

      {ShowMessageHtml ? (
        <div className={`ackmessage${ShowMessage ? " show" : " hide"}`}>
          <span className="fas fa-info"></span> {ResText}
        </div>
      ) : null}
    </Fragment>
  );
};

export default OneAnim;

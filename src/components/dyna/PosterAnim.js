import React, { Fragment, useState } from "react";
import { Badge, Popover, OverlayTrigger, ProgressBar } from "react-bootstrap";
import { Link } from "react-router-dom";
// Img
import PlaceHolderImg from "../../Assets/Img/PlaceHolderImg.png";

const WhitchSeason = () => {
  const Month = new Date().getMonth() + 1;
  const Day = new Date().getDate();
  let season = null;
  switch (true) {
    case Month === 12 && Day >= 21:
    case Month === 1:
    case Month === 2:
      season = "hiver";
      break;
    case Month === 3 && Day >= 20:
    case Month === 4:
    case Month === 5:
      season = "printemps";
      break;
    case Month === 6 && Day >= 20:
    case Month === 7:
    case Month === 8:
      season = "ete";
      break;
    case Month === 9 && Day >= 22:
    case Month === 10:
    case Month === 11:
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
  AddEpSeasonToAlleged,
  isFinished,
  ChangeNote,
  deleteAnim,
  CopyTitle,
  Objectif,
  isFav,
  Paused,
  Drop,
  NewEpMode,
  AnimeSeason,
  ModeFilter,
  isAlleged,
  InWait,
  CheckNotUrlParams,
  NotAskAgain,
  Skeleton,
  InfoTooltip,
  ReTakeImgFromName,
  // MyManga
  inMyManga,
  isFinishedManga,
  MangaSearch,
}) => {
  let Fav = isFav;
  const [ShowOverlay, setShowOverlay] = useState(false);

  // MyManga
  if (inMyManga === true) {
    const TemplateMangaPoster = (
      <div className={`PosterManga${isFinishedManga ? " finished" : ""}`}>
        <div className="ImgInterract">
          <img
            draggable={"false"}
            src={url === "PlaceHolderImg" ? PlaceHolderImg : url}
            alt="Img of Manga"
          />
          <div className="copy" onClick={CopyTitle}>
            <span className="fas fa-copy"></span>
          </div>
        </div>
        <div className="content">
          {isFinishedManga ? <span className="fas fa-check"> </span> : null}
          {title}
        </div>
        <Link push="false" to={`/WatchManga/${Pseudo}/${id}`}>
          <span className="fas fa-eye"></span>
        </Link>
      </div>
    );
    // Filter
    if (ModeFilter === "NotFinished") {
      return isFinishedManga ? null : TemplateMangaPoster;
    } else if (ModeFilter === "Finished") {
      return isFinishedManga ? TemplateMangaPoster : null;
    } else {
      return TemplateMangaPoster;
    }
  }

  // MyAnim
  if (url === "PlaceHolderImg" && !NotAskAgain) ReTakeImgFromName();
  else if (url && inMyAnim) CheckNotUrlParams(url);

  const templateInfoBeginEnd = (data) => (
    <Fragment>
      <br />
      <ul>
        {data.Begin ? (
          <li>
            Commencé le
            <br />
            <span>{new Date(data.Begin).toLocaleDateString()}</span>
          </li>
        ) : null}
        {data.End ? (
          <li>
            Terminé le
            <br />
            <span>{new Date(data.End).toLocaleDateString()}</span>
          </li>
        ) : null}
      </ul>
    </Fragment>
  );

  const templatePoster = (
    <OverlayTrigger
      show={ShowOverlay}
      className="TooltipPoster"
      placement="top"
      overlay={
        <Popover
          id="popover-basic"
          onMouseEnter={() => setShowOverlay(true)}
          onMouseLeave={() => setShowOverlay(false)}
        >
          <Popover.Title as="h3">{title}</Popover.Title>
          <Popover.Content>
            {type === "serie" ? (
              Array.isArray(InfoTooltip) ? (
                <Fragment>
                  {InfoTooltip[0]}
                  {InfoTooltip[1].InfoBeginEnd
                    ? templateInfoBeginEnd(InfoTooltip[1].InfoBeginEnd)
                    : null}
                </Fragment>
              ) : InfoTooltip.WhereStop !== undefined ? (
                <Fragment>
                  <ProgressBar
                    variant={
                      InfoTooltip.Progress <= 25
                        ? "danger"
                        : InfoTooltip.Progress > 25 &&
                          InfoTooltip.Progress <= 50
                        ? "warning"
                        : InfoTooltip.Progress > 50 &&
                          InfoTooltip.Progress <= 75
                        ? "primary"
                        : "success"
                    }
                    now={InfoTooltip.Progress}
                    label={`${InfoTooltip.Progress}%`}
                  />{" "}
                  {InfoTooltip.InfoBeginEnd ? (
                    templateInfoBeginEnd(InfoTooltip.InfoBeginEnd)
                  ) : (
                    <br />
                  )}
                  {Objectif[0] ? (
                    <p style={{ color: "#c59fff" }}>
                      Objectif en cours (EP{Objectif[1].End[1]}).
                      <br />
                      <br /> Fin le{" "}
                      <span style={{ textDecoration: "underline" }}>
                        {new Date(Objectif[1].End[2]).toLocaleDateString()}
                      </span>
                    </p>
                  ) : null}
                  <Link push="false" to={`/Watch/${Pseudo}/${id}/true`}>
                    <span
                      style={{ color: "yellowgreen" }}
                      className="fas fa-play"
                    ></span>{" "}
                    S
                    <b>
                      {InfoTooltip.WhereStop !== undefined
                        ? InfoTooltip.WhereStop[0]
                        : null}
                    </b>{" "}
                    EP
                    <b>
                      {InfoTooltip.WhereStop !== undefined
                        ? InfoTooltip.WhereStop[1] + 1 < 10
                          ? `0${InfoTooltip.WhereStop[1] + 1}`
                          : InfoTooltip.WhereStop[1] + 1
                        : null}
                    </b>
                  </Link>
                </Fragment>
              ) : (
                InfoTooltip
              )
            ) : Array.isArray(InfoTooltip) ? (
              <Fragment>
                {InfoTooltip[0]}

                <div id="WatchedFilmWhen">
                  {InfoTooltip[1] ? (
                    <Fragment>
                      <br />
                      <br />
                      Regardé le
                      <br />
                      <br />
                      <span>
                        {new Date(InfoTooltip[1].Watched).toLocaleDateString()}
                      </span>
                    </Fragment>
                  ) : null}
                </div>
              </Fragment>
            ) : (
              InfoTooltip
            )}
          </Popover.Content>
        </Popover>
      }
    >
      <div
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}
        id={`${!title || !inMyAnim ? null : title.split(" ").join("")}-${
          !id || !inMyAnim
            ? null
            : id.split("-")[1].split("").reverse().join("").slice(0, 5)
        }`}
        className={
          Skeleton
            ? "MyAnimPoster Skeleton"
            : InWait
            ? "MyAnimPoster InWait"
            : AnimeSeason && !isFinished
            ? `MyAnimPoster Season ${WhitchSeason()}${
                NewEpMode ? " NewEP" : ""
              }`
            : Paused
            ? "MyAnimPoster Paused"
            : Drop
            ? "MyAnimPoster Drop"
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
        {Skeleton ? (
          <div className="MiniPoster"></div>
        ) : (
          <Fragment>
            {isFinished || Paused || Drop || InWait ? <h4>{title}</h4> : null}
            {Drop ? null : (
              <div
                id="FavBtns"
                title={isFav ? "Retirer des Fav" : "Ajouter au Fav"}
                onClick={() => fnFav(id, !isFav ? true : null)}
              >
                <span
                  className={`FvBtn fas fa-heart ${Fav ? "show" : "hide"}${
                    isFinished || Paused || Drop || InWait ? " bottom" : ""
                  }`}
                ></span>
                <span
                  className={`FvBtn far fa-heart ${!Fav ? "show" : "hide"}${
                    isFinished || Paused || Drop || InWait ? " bottom" : ""
                  }`}
                ></span>
              </div>
            )}
            {AnimeSeason &&
            NewEpMode &&
            !isFinished &&
            !Paused &&
            !Drop &&
            !InWait ? (
              <h3 className="NEWEPBadge">
                <Badge variant="danger">NEW</Badge>
              </h3>
            ) : null}
            {Rate ? (
              <span
                style={{ color: "gold" }}
                onClick={ChangeNote}
                className="RatingStar fas fa-star"
              >
                {Rate}
              </span>
            ) : isFinished ? (
              <span
                style={{ color: "gold" }}
                onClick={ChangeNote}
                className="RatingStar fas fa-plus"
              ></span>
            ) : null}
            {url === "PlaceHolderImg" ? (
              <span
                className="ReTakeImgBtn fas fa-undo-alt"
                onClick={ReTakeImgFromName}
              ></span>
            ) : null}
            <div className="ImgInterract">
              <img
                draggable={"false"}
                src={url === "PlaceHolderImg" ? PlaceHolderImg : url}
                alt="Img of Anim"
                onError={ReTakeImgFromName}
              />
            </div>
            <div className="copy" onClick={CopyTitle}>
              <span className="fas fa-copy"></span>
            </div>
            <div className="action">
              {(Paused && !isAlleged) ||
              (Drop && !isAlleged) ||
              (InWait && !isAlleged) ? (
                <div
                  className="watch paused"
                  onClick={UnPaused}
                  title={`Reprendre ${title}`}
                >
                  <span className="fas fa-play-circle"></span>
                </div>
              ) : isAlleged ? (
                <div
                  onClick={AddEpSeasonToAlleged}
                  title="Rajouter des Episodes"
                  className="watch addEP"
                >
                  <span className="fas fa-plus"></span>
                </div>
              ) : (
                <Link push="false" to={`/Watch/${Pseudo}/${id}`}>
                  <div
                    className={`watch${
                      inMyAnim && Objectif[0] ? " Objectif" : ""
                    }`}
                  >
                    <span
                      className={`fas ${
                        inMyAnim && Objectif[0] ? "fa-bullseye" : "fa-eye"
                      }`}
                    ></span>
                  </div>
                </Link>
              )}

              <div
                className="delete"
                onClick={() =>
                  deleteAnim(`${Pseudo}/${id.split("-")[0]}/${id}`)
                }
              >
                <span className="fas fa-trash-alt"></span>
              </div>
            </div>
            {Paused || Drop || InWait ? (
              <h5>
                {Drop ? (
                  <Fragment>
                    <span className="fas fa-stop"></span> Arrêté
                  </Fragment>
                ) : InWait ? (
                  <Fragment>
                    <span className="fas fa-hourglass-half"></span> En Attente
                  </Fragment>
                ) : (
                  <Fragment>
                    <span className="fas fa-pause"></span> En Pause
                  </Fragment>
                )}
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
          </Fragment>
        )}
      </div>
    </OverlayTrigger>
  );

  if (!inMyAnim) {
    return (
      <div
        className={`poster${Skeleton ? " Skeleton" : ""}`}
        onClick={() => {
          if (!Skeleton) SeeInDetails(id);
        }}
      >
        {Skeleton ? null : (
          <Fragment>
            <img src={url} alt="Img of Anim" />
            <h4>
              <span className="title">{title}</span>
              <br />
              {!score ? null : (
                <span className="score" style={{ fontWeight: "bold" }}>
                  {score}/10{" "}
                </span>
              )}
              <span className="type">
                {MangaSearch
                  ? type === "Movie"
                    ? "Movie"
                    : type === "TV"
                    ? "Anime"
                    : type
                  : type}
              </span>
            </h4>
          </Fragment>
        )}
      </div>
    );
  } else if (Skeleton) {
    return templatePoster;
  } else if (ModeFilter === "All") {
    return templatePoster;
  } else if (ModeFilter === "NotFinished") {
    return isFinished
      ? null
      : Paused
      ? null
      : Drop
      ? null
      : InWait
      ? null
      : templatePoster;
  } else if (ModeFilter === "Finished") {
    return isFinished ? templatePoster : null;
  } else if (ModeFilter === "Paused") {
    return Paused ? templatePoster : null;
  } else if (ModeFilter === "Rate") {
    return Rate ? templatePoster : null;
  } else if (ModeFilter === "fav") {
    return isFav ? templatePoster : null;
  } else if (ModeFilter === "seasonAnim") {
    return AnimeSeason ? templatePoster : null;
  } else if (ModeFilter === "Drop") {
    return Drop ? templatePoster : null;
  } else if (ModeFilter === "WaitAnim") {
    return InWait ? templatePoster : null;
  } else if (ModeFilter === "BySeries") {
    return type === "serie" ? templatePoster : null;
  } else if (ModeFilter === "ByFilm") {
    return type === "film" ? templatePoster : null;
  } else {
    return templatePoster;
  }
};

export default PosterAnim;

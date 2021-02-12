import React, { Fragment, useState } from "react";
import { Badge, Popover, OverlayTrigger, ProgressBar } from "react-bootstrap";
import { Link } from "react-router-dom";
// Img
import PlaceHolderImg from "../../Assets/Img/PlaceHolderImg.png";

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
  AddEpSeasonToAlleged,
  isFinished,
  ChangeNote,
  deleteAnim,
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
}) => {
  let Fav = isFav;
  const [ShowOverlay, setShowOverlay] = useState(false);

  if (url === "PlaceHolderImg" && !NotAskAgain) ReTakeImgFromName();
  else if (url && inMyAnim) CheckNotUrlParams(url);

  const templatePoster = (
    <OverlayTrigger
      show={ShowOverlay}
      className="TooltipPoster"
      placement="auto"
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
                InfoTooltip[0]
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
                  <br />
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
            !isFinished & !Paused &&
            !Drop &&
            !InWait ? (
              <h3 id="NEWEPBadge">
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
                src={url === "PlaceHolderImg" ? PlaceHolderImg : url}
                alt="Img of Anim"
                onError={ReTakeImgFromName}
              />
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
                  <div className="watch">
                    <span className="fas fa-eye"></span>
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
              <span className="title">{title}</span>,<br />
              <span className="score">{score}/10</span>,{" "}
              <span className="type">
                {type === "Movie" ? "Movie" : "Anime"}
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
  } else {
    return templatePoster;
  }
};

export default PosterAnim;

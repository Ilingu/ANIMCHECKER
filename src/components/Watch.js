import React, { Component, Fragment } from "react";
import { Redirect, Link } from "react-router-dom";
import Rating from "react-rating";
// Components
import AnimEpCo from "./dyna/AnimEp";
// Img
import ADNLogo from "../Assets/Img/ADNLogo.png";
import CrunchyrollLogo from "../Assets/Img/CrunchyrollLogo.png";
import MavLogo from "../Assets/Img/MAVLogo.png";
import NekoSamaLogo from "../Assets/Img/NekoSamaLogo.svg";
import NetflixLogo from "../Assets/Img/NetflixLogo.png";
import WakanimLogo from "../Assets/Img/WakanimLogo.png";
// CSS
import { Spinner, Button, Modal, Form, Dropdown, Badge } from "react-bootstrap";
// DB
import base from "../db/base";
import firebase from "firebase/app";
import "firebase/auth";

class Watch extends Component {
  state = {
    // Firebase
    Pseudo: this.props.match.params.pseudo,
    AnimToWatch: {},
    Badges: [],
    // Auth
    uid: null,
    id: null,
    proprio: null,
    // Bon fonctionnement de l'app
    modeStart: false,
    type: "",
    isFirstTime: true,
    RedirectHome: false,
    ToOpen: "",
    ShowFormBadge: false,
    ShowModalRateAnime: false,
    ShowMessage: false,
    ShowMessageHtml: false,
    SecondMessage: false,
    AlreadyClicked: false,
    ResText: null,
    // Repere
    repereSaison: {},
    repereEpisode: [],
    // Form
    SeasonToAddEp: null,
    Rate: 0,
    RateHover: 0,
    nbEpToAdd: 1,
    // Modal
    ShowModalVerification: [false, null],
    ShowModalAddEp: false,
    ShowModalAddSeasonEp: false,
  };

  componentDidMount() {
    const self = this;

    if (this.props.match.params.id !== undefined) {
      this.refreshAnimToWatch(this.props.match.params.id);

      this.setState({
        id: this.props.match.params.id,
        type: self.props.match.params.id.split("-")[0],
      });
    }

    if (this.state.Pseudo) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          self.handleAuth({ user });
        }
      });
    }
  }

  handleAuth = async (authData) => {
    const box = await base.fetch(this.state.Pseudo, { context: this });

    if (!box.proprio) {
      await base.post(`${this.state.Pseudo}/proprio`, {
        data: authData.user.uid,
      });
    }

    this.setState({
      uid: authData.user.uid,
      proprio: box.proprio || authData.user.uid,
    });
  };

  refreshAnimToWatch = async (ForFirstTime = null) => {
    const { id } = this.state;

    try {
      const AnimToWatch = await base.fetch(
        ForFirstTime !== null
          ? `${this.state.Pseudo}/${ForFirstTime.split("-")[0]}/${ForFirstTime}`
          : `${this.state.Pseudo}/${id.split("-")[0]}/${id}`,
        {
          context: this,
        }
      );
      const BadgeFireBase = await base.fetch(
        ForFirstTime !== null
          ? `${this.state.Pseudo}/${
              ForFirstTime.split("-")[0]
            }/${ForFirstTime}/Badge`
          : `${this.state.Pseudo}/${id.split("-")[0]}/${id}/Badge`,
        {
          context: this,
        }
      );
      this.setState({
        AnimToWatch,
        Badges: Object.keys(BadgeFireBase).length !== 0 ? BadgeFireBase : [],
      });
    } catch (err) {
      console.error(err);
    }
  };

  addValue = (path, value) => {
    base
      .post(path, {
        data: value,
      })
      .then(this.refreshAnimToWatch)
      .catch((err) => console.error(err));
  };

  deleteValue = (path) => {
    base
      .remove(path)
      .then(this.refreshAnimToWatch)
      .catch((err) => console.error(err));
  };

  updateValue = (path, value, next = null) => {
    base
      .update(path, {
        data: value,
      })
      .then(() => {
        this.refreshAnimToWatch();
        if (next !== null) next();
      })
      .catch((err) => console.error(err));
  };

  getValue = async (path) => {
    const value = await base.fetch(path, { context: this });

    return value;
  };

  addEp = (Season, nbEpToAdd) => {
    const { id, AnimToWatch } = this.state;
    const idSaison = parseInt(Season.name.split(" ")[1]) - 1;
    let Stockage = [];

    for (let i = 0; i < nbEpToAdd; i++) {
      Stockage = [
        ...Stockage,
        {
          finished: false,
          id: AnimToWatch.AnimEP[idSaison].Episodes.length + (i + 1),
        },
      ];
    }

    this.addValue(
      `${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}/Episodes`,
      AnimToWatch.AnimEP[idSaison].Episodes.concat(Stockage)
    );
    this.updateValue(`${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}`, {
      finished: false,
    });
    this.updateValue(`${this.state.Pseudo}/serie/${id}`, {
      finishedAnim: false,
    });

    this.setState({
      nbEpToAdd: 1,
      ShowModalAddEp: false,
      SeasonToAddEp: null,
    });
  };

  addSeason = (nbEp) => {
    const { id, AnimToWatch } = this.state;

    let EpObj = [];
    let Stockage = [];

    for (let j = 0; j < parseInt(nbEp); j++) {
      EpObj = [...EpObj, { id: j + 1, finished: false }];
    }

    Stockage = [
      ...AnimToWatch.AnimEP,
      {
        name: `Saison ${AnimToWatch.AnimEP.length + 1}`,
        Episodes: EpObj,
        finished: false,
      },
    ];

    this.addValue(`${this.state.Pseudo}/serie/${id}/AnimEP`, Stockage);
    this.updateValue(`${this.state.Pseudo}/serie/${id}`, {
      finishedAnim: false,
    });

    this.setState({
      nbEpToAdd: 1,
      ShowModalAddSeasonEp: false,
    });
  };

  StartModeWatch = () => {
    window.scrollTo(0, 0);
    document.body.style.cssText = "overflow: hidden;";
    this.setState({ modeStart: true });
  };

  setRepere = (Saison, idEp) => {
    let previousEp = idEp - 1,
      nextEp = idEp + 1,
      thisEp = idEp,
      Ep;

    for (Ep of Saison.Episodes) {
      if (Ep.id === previousEp) {
        previousEp = Ep;
      } else if (Ep.id === thisEp) {
        thisEp = Ep;
      } else if (Ep.id === nextEp) {
        nextEp = Ep;
      }
    }

    if (typeof previousEp === "number") {
      previousEp = null;
    } else if (typeof nextEp === "number") {
      nextEp = null;
    }

    this.setState({
      repereEpisode: [previousEp, thisEp, nextEp],
      repereSaison: Saison,
    });
  };

  StopModeWatch = () => {
    document.body.style.cssText = "overflow: unset;";
    this.setState({ modeStart: false });
  };

  finishedEp = (Saison, EpFinishedID) => {
    const {
      id,
      repereEpisode,
      repereSaison,
      SecondMessage,
      AlreadyClicked,
    } = this.state;
    const idSaison = parseInt(Saison.name.split(" ")[1]) - 1;

    this.updateValue(
      `${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}/Episodes/${
        EpFinishedID - 2
      }`,
      { finished: true },
      () => {
        this.setState({
          SecondMessage: AlreadyClicked ? true : false,
          AlreadyClicked: true,
          ShowMessage: true,
          ShowMessageHtml: true,
          ResText: `Episode ${repereEpisode[1].id}(S${
            Object.keys(repereSaison).length === 0
              ? null
              : repereSaison.name.split(" ")[1]
          }) fini !`,
        });

        setTimeout(() => {
          if (SecondMessage) {
            this.setState({ SecondMessage: false });
            return;
          }

          this.setState({ ShowMessage: false, AlreadyClicked: false });

          setTimeout(() => {
            this.setState({ ShowMessageHtml: false, ResText: null });
          }, 900);
        }, 2000);
      }
    );
  };

  StartNextEP = (Saison = null, EpFinishedID = null) => {
    if (Saison !== null && EpFinishedID !== null) {
      this.finishedEp(Saison, EpFinishedID);
      this.setRepere(Saison, EpFinishedID);
    } else {
      const { AnimToWatch } = this.state;
      let lastOne = null;

      AnimToWatch.AnimEP.forEach((Season) => {
        Season.Episodes.forEach((Ep) => {
          if (!Ep.finished && lastOne === null) {
            lastOne = [Season, Ep.id];
          }
        });
      });

      this.setRepere(lastOne[0], lastOne[1]);
    }
    this.StartModeWatch();
  };

  endOfSaison = (Saison, EpFinishedID) => {
    const { id, AnimToWatch } = this.state;
    const idSaison = parseInt(Saison.name.split(" ")[1]) - 1;

    this.updateValue(`${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}`, {
      finished: true,
    });

    if (AnimToWatch.AnimEP.length === idSaison + 1)
      this.updateValue(
        `${this.state.Pseudo}/serie/${id}`,
        {
          finishedAnim: true,
        },
        () => this.setState({ ShowModalRateAnime: true })
      );

    this.finishedEp(Saison, EpFinishedID + 1);
    this.StopModeWatch();
  };

  playEp = (Saison, idEp) => {
    this.setRepere(Saison, idEp);
    this.StartModeWatch();
  };

  EndFilm = () => {
    const { id } = this.state;

    this.updateValue(
      `${this.state.Pseudo}/film/${id}`,
      { finished: true },
      () => this.setState({ ShowModalRateAnime: true })
    );
    this.StopModeWatch();
  };

  handleDelete = () => {
    const { type, id } = this.state;

    this.updateValue(`${this.state.Pseudo}/${type}`, { [id]: null });
    this.setState({ uid: null, RedirectHome: true });
  };

  handleDeleteBadge = (index) => {
    const { Badges, Pseudo, type, id } = this.state;
    Badges.splice(index, 1);
    this.updateValue(`${Pseudo}/${type}/${id}/`, { Badge: Badges });
  };

  handleAlleger = () => {
    const { type, id } = this.state;

    if (type !== "film") {
      this.updateValue(`${this.state.Pseudo}/serie/${id}`, {
        AnimEP: null,
        Badge: null,
      });
      this.setState({ uid: null, RedirectHome: true });
    }
  };

  render() {
    const {
      Pseudo,
      AnimToWatch,
      Badges,
      uid,
      id,
      RedirectHome,
      proprio,
      type,
      isFirstTime,
      ShowModalRateAnime,
      Rate,
      ShowFormBadge,
      RateHover,
      SecondMessage,
      modeStart,
      ShowModalVerification,
      ShowMessage,
      ShowMessageHtml,
      ResText,
      repereEpisode,
      repereSaison,
      ToOpen,
      ShowModalAddEp,
      nbEpToAdd,
      SeasonToAddEp,
      ShowModalAddSeasonEp,
    } = this.state;

    if (!Pseudo) return <Redirect to="/notifuser/2" />;
    if (AnimToWatch.Paused) return <Redirect to="/notifuser/1" />;
    if (RedirectHome) return <Redirect to="/notifuser/5" />;

    if (!uid) {
      return (
        <Spinner
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
          }}
          animation="border"
          variant="warning"
        />
      );
    }

    if (uid !== proprio) return <Redirect to="/notifuser/3" />;

    if (id === null) {
      return <Redirect to="/notifuser/4" />;
    } else if (isFirstTime) {
      this.setState({ isFirstTime: false });
      return <Redirect to="/Watch" />;
    }

    let MyAnimAccordeon = null,
      BadgesHtml = null;

    if (type === "serie") {
      MyAnimAccordeon = AnimToWatch.AnimEP.map((EpSaison) => (
        <AnimEpCo
          key={Date.now() + Math.random() * 100000 - Math.random() * -100000}
          ObjInfo={EpSaison}
          play={this.playEp}
          ToOpen={ToOpen}
          AddEp={() =>
            this.setState({ ShowModalAddEp: true, SeasonToAddEp: EpSaison })
          }
          NextToOpen={(SaisonName) => {
            if (SaisonName === ToOpen) {
              this.setState({ ToOpen: "" });
              return;
            }
            this.setState({ ToOpen: SaisonName });
          }}
        />
      ));
    }

    if (Badges.length !== 0) {
      BadgesHtml = Badges.map((value, i) => {
        if (value.toLowerCase() === "adn") {
          return (
            <Badge
              key={i}
              className="BadgesME"
              variant="primary"
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={ADNLogo} alt="ADNLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
            </Badge>
          );
        } else if (
          value.toLowerCase() === "crunchyroll" ||
          value.toLowerCase() === "crunchyrol"
        ) {
          return (
            <Badge
              key={i}
              className="BadgesME"
              variant="light"
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={CrunchyrollLogo} alt="CrunchyrollLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
            </Badge>
          );
        } else if (
          value.toLowerCase() === "mav" ||
          value.toLowerCase() === "mavanime" ||
          value.toLowerCase() === "mavanimes" ||
          value.toLowerCase() === "mavanimeco" ||
          value.toLowerCase() === "mavanimesco" ||
          value.toLowerCase() === "mavanime.co" ||
          value.toLowerCase() === "mavanimes.co"
        ) {
          return (
            <Badge
              key={i}
              className="BadgesME"
              variant="dark"
              style={{ background: "#101010" }}
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={MavLogo} alt="MavLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
            </Badge>
          );
        } else if (
          value.toLowerCase() === "neko-sama" ||
          value.toLowerCase() === "nekosama" ||
          value.toLowerCase() === "neko-sama.fr" ||
          value.toLowerCase() === "nekosama.fr" ||
          value.toLowerCase() === "neko-samafr" ||
          value.toLowerCase() === "nekosamafr"
        ) {
          return (
            <Badge
              key={i}
              className="BadgesME"
              variant="primary"
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={NekoSamaLogo} alt="NekoSamaLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
            </Badge>
          );
        } else if (value.toLowerCase() === "netflix") {
          return (
            <Badge
              key={i}
              className="BadgesME"
              variant="dark"
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={NetflixLogo} alt="NetflixLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
            </Badge>
          );
        } else if (value.toLowerCase() === "wakanim") {
          return (
            <Badge
              key={i}
              className="BadgesME"
              variant="dark"
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={WakanimLogo} alt="WakanimLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
            </Badge>
          );
        }
        const rdaColor = [
          Math.round(Math.random() * 255),
          Math.round(Math.random() * 255),
          Math.round(Math.random() * 255),
        ];

        const grayScaleRdaColor =
          0.2126 * rdaColor[0] + 0.7152 * rdaColor[1] + 0.0722 * rdaColor[2];

        return (
          <Badge
            key={i}
            className="BadgesME"
            variant="primary"
            onClick={() => this.handleDeleteBadge(i)}
            style={{
              background: `rgb(${rdaColor[0]},${rdaColor[1]},${rdaColor[2]})`,
              color: grayScaleRdaColor < 128 ? "#fff" : "#212529",
            }}
          >
            <div id="ValueBadge">{value}</div>
            <div id="CancelBadge">
              <span className="fas fa-times"></span>
            </div>
          </Badge>
        );
      });
    }

    return (
      <section id="Watch">
        <div className={modeStart ? "nonStartMod" : "nonStartMod active"}>
          <header>
            <h1 className="title">
              {AnimToWatch.name}{" "}
              {type === "film" ? `(${AnimToWatch.durer}min)` : null}
            </h1>
            <div className="img">
              <img src={AnimToWatch.imageUrl} alt="Img of anim" />
              {AnimToWatch.Rate ? (
                <span
                  style={{ color: "gold" }}
                  className="RatingStar fas fa-star"
                >
                  {AnimToWatch.Rate}
                </span>
              ) : null}
              <div
                className="play"
                onClick={() => {
                  type === "serie" ? this.StartNextEP() : this.StartModeWatch();
                }}
              >
                <span className="fas fa-play"></span>
              </div>
            </div>
          </header>
          <section id="ToWatch">
            <Link push="true" to="/">
              <Button variant="primary" className="btnBackDesing">
                <span className="fas fa-arrow-left"></span> Retour
              </Button>
            </Link>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="DropdownAction">
                <span className="fas fa-bars"></span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {type === "serie" ? (
                  <Fragment>
                    <Dropdown.Item>
                      <Button
                        variant="success"
                        block
                        onClick={() =>
                          this.setState({ ShowModalAddSeasonEp: true })
                        }
                      >
                        <span className="fas fa-plus"></span> Ajouter une saison
                      </Button>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <Button
                        variant="info"
                        block
                        onClick={() => {
                          this.updateValue(`${this.state.Pseudo}/serie/${id}`, {
                            Paused: true,
                          });
                          this.setState({ uid: null, RedirectHome: true });
                        }}
                      >
                        <span className="fas fa-pause"></span> Mettre en Pause
                      </Button>
                    </Dropdown.Item>

                    <Dropdown.Item>
                      <Button
                        variant="warning"
                        block
                        onClick={() =>
                          this.setState({
                            ShowModalVerification: [true, "alleger"],
                          })
                        }
                      >
                        <span className="fas fa-window-close"></span> Alléger
                        cet anime
                      </Button>
                    </Dropdown.Item>
                  </Fragment>
                ) : null}
                {AnimToWatch.finished || AnimToWatch.finishedAnim ? (
                  <Dropdown.Item>
                    <Button
                      style={{
                        backgroundColor: "gold",
                        color: "#212121",
                        border: "none",
                      }}
                      block
                      onClick={() =>
                        this.setState({
                          ShowModalRateAnime: true,
                        })
                      }
                    >
                      <span className="fas fa-star"></span> Changer la note
                    </Button>
                  </Dropdown.Item>
                ) : null}

                <Dropdown.Item>
                  <Button
                    variant="danger"
                    block
                    onClick={() =>
                      this.setState({
                        ShowModalVerification: [true, "supprimer"],
                      })
                    }
                  >
                    <span className="fas fa-trash-alt"></span> Supprimer{" "}
                    {AnimToWatch.name}
                  </Button>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <div id="badgeStreaming">
              <Badge
                variant="warning"
                className="BadgesME"
                id="InputBadgeStreaming"
                style={{ display: ShowFormBadge ? "block" : "none" }}
                contentEditable="true"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    this.updateValue(`${Pseudo}/${type}/${id}/`, {
                      Badge: [
                        ...Badges,
                        document.querySelector("#InputBadgeStreaming")
                          .innerText,
                      ],
                    });
                    this.setState({ ShowFormBadge: false });
                  }
                }}
              >
                Nom du site
              </Badge>
              {BadgesHtml}
              <Badge
                pill
                className="BadgesME"
                variant="secondary"
                onClick={() => this.setState({ ShowFormBadge: true })}
              >
                <span className="fas fa-plus-circle"></span>
              </Badge>
            </div>
            <header>
              <h1>{type === "serie" ? "Anime:" : "Film:"}</h1>
            </header>
            <div className="content">
              {type === "film" ? (
                <div
                  className="film"
                  id={AnimToWatch.name}
                  onClick={this.StartModeWatch}
                >
                  <span className="fas fa-play"></span> {AnimToWatch.name}
                </div>
              ) : (
                <div className="accordionAnimEP">{MyAnimAccordeon}</div>
              )}
            </div>
          </section>
        </div>
        <div className={modeStart ? "StartMod active" : "StartMod"}>
          <div className="cancel" onClick={this.StopModeWatch}>
            <span className="fas fa-ban"></span>
          </div>
          {type === "serie" ? (
            <Fragment>
              <header>
                <h2>
                  Episode{" "}
                  {repereEpisode[1] === undefined ? null : repereEpisode[1].id}{" "}
                  (S
                  {Object.keys(repereSaison).length === 0
                    ? null
                    : repereSaison.name.split(" ")[1]}
                  )
                </h2>
              </header>
              <div
                className="next"
                onClick={() => {
                  repereEpisode[2] !== null
                    ? this.StartNextEP(repereSaison, repereEpisode[2].id)
                    : this.endOfSaison(repereSaison, repereEpisode[1].id);
                }}
              >
                {repereEpisode[2] !== null ? (
                  <span className="fas fa-chevron-circle-right"></span>
                ) : (
                  <span className="fas fa-check"></span>
                )}
              </div>
              <footer>
                {repereEpisode[0] !== null ? (
                  <div
                    className="previousEp blockNextAction"
                    onClick={() => {
                      repereEpisode[0] !== null
                        ? this.playEp(repereSaison, repereEpisode[0].id)
                        : console.warn(
                            "Impossible de charger un Episode innexistant !"
                          );
                    }}
                  >
                    Episode{" "}
                    {repereEpisode[0] === undefined
                      ? null
                      : repereEpisode[0].id}{" "}
                    <span className="fas fa-long-arrow-alt-left"></span>
                  </div>
                ) : null}

                {repereEpisode[2] !== null ? (
                  <div
                    className="nextEp blockNextAction"
                    onClick={() => {
                      repereEpisode[2] !== null
                        ? this.StartNextEP(repereSaison, repereEpisode[2].id)
                        : console.warn(
                            "Impossible de charger un Episode innexistant !"
                          );
                    }}
                  >
                    Episode{" "}
                    {repereEpisode[2] === undefined
                      ? null
                      : repereEpisode[2].id}{" "}
                    <span className="fas fa-long-arrow-alt-right"></span>
                  </div>
                ) : null}
              </footer>
            </Fragment>
          ) : (
            <div className="finished" onClick={this.EndFilm}>
              <span className="fas fa-check"></span>
            </div>
          )}
        </div>

        {/* MODAL */}
        <Modal
          show={ShowModalVerification[0]}
          size="lg"
          onHide={() => this.setState({ ShowModalVerification: [false, null] })}
        >
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title
              style={{
                color:
                  ShowModalVerification[1] === "alleger"
                    ? "#ffc107"
                    : "#dc3545",
              }}
            >
              Êtes-vous sûre de vouloir {ShowModalVerification[1]}{" "}
              {AnimToWatch.name} ?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            En faisant ça {AnimToWatch.name}{" "}
            {ShowModalVerification[1] === "alleger"
              ? "ne sera pas supprimer mais il sera inaccessible: en gros vous le verez toujours dans votre liste d'anime mais vous ne pourrez plus voir vos épisodes restant/saisons fini, Badges car ils seront supprimer (la note ne sera pas supprimer) vous ne pourrez plus modifier l'anime (ajouter des saison/ep, changer la note... mais vous pourrez toujours le supprimer depuis la page global (la où il y a tout les animes)). L'anime sera là en temps que déco, pour dire 'ba voilà j'ai la preuve d'avoir fini cette anime' (je vous conseille de la faire quand l'anime n'aura pas de suite)."
              : "sera entièrement supprimer avec aucune possiblité de le récupérer, en gros il n'existera plus."}
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button
              variant="secondary"
              onClick={() =>
                this.setState({ ShowModalVerification: [false, null] })
              }
            >
              Annuler
            </Button>
            <Button
              variant={
                ShowModalVerification[1] === "alleger" ? "warning" : "danger"
              }
              onClick={() =>
                ShowModalVerification[1] === "alleger"
                  ? this.handleAlleger()
                  : this.handleDelete()
              }
            >
              {ShowModalVerification[1] === "alleger" ? "Alleger" : "Supprimer"}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={ShowModalRateAnime}
          size="lg"
          onHide={() =>
            this.setState({ ShowModalRateAnime: false, Rate: 0, RateHover: 0 })
          }
        >
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>Noté {AnimToWatch.name} / 10</Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            <Rating
              value={Rate}
              onChange={(Rate) => this.setState({ Rate })}
              onHover={(Rate) => this.setState({ RateHover: Rate })}
              step={0.5}
              stop={10}
            />
            <p>{RateHover || Rate} étoiles</p>
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button
              variant="secondary"
              onClick={() =>
                this.setState({
                  ShowModalRateAnime: false,
                  Rate: 0,
                  RateHover: 0,
                })
              }
            >
              Annuler
            </Button>
            <Button
              variant="success"
              onClick={() => {
                if (
                  Rate !== undefined &&
                  Rate !== null &&
                  Rate > 0 &&
                  Rate <= 10 &&
                  (AnimToWatch.finished || AnimToWatch.finishedAnim)
                ) {
                  this.updateValue(`${Pseudo}/${type}/${id}`, {
                    Rate,
                  });
                  this.setState({
                    ShowModalRateAnime: false,
                    Rate: 0,
                    RateHover: 0,
                  });
                } else {
                  this.setState({
                    AlreadyClicked: true,
                    ShowMessage: true,
                    ShowMessageHtml: true,
                    ResText:
                      "Impossible de noter si l'anime n'ai pas fini ou que la note soit incorrect.",
                  });

                  setTimeout(() => {
                    if (SecondMessage) {
                      this.setState({ SecondMessage: false });
                      return;
                    }

                    this.setState({
                      ShowMessage: false,
                      AlreadyClicked: false,
                    });

                    setTimeout(() => {
                      this.setState({ ShowMessageHtml: false, ResText: null });
                    }, 900);
                  }, 6000);
                }
              }}
              disabled={
                Rate !== undefined &&
                Rate !== null &&
                Rate > 0 &&
                Rate <= 10 &&
                (AnimToWatch.finished || AnimToWatch.finishedAnim)
                  ? false
                  : true
              }
            >
              <span className="fas fa-check"></span> Valider
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={ShowModalAddEp}
          onHide={() => this.setState({ ShowModalAddEp: false })}
        >
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>Rajouter des episode</Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            <Form id="Addep">
              <Form.Group controlId="duree">
                <Form.Label>Nombres d'ep à rajouter</Form.Label>
                <Form.Control
                  type="number"
                  value={nbEpToAdd.toString()}
                  min="1"
                  placeholder="Nombres d'EP"
                  autoComplete="off"
                  onChange={(event) => {
                    const value = parseInt(event.target.value);

                    if (value < 1) return;
                    this.setState({ nbEpToAdd: value });
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button
              variant="secondary"
              onClick={() => this.setState({ ShowModalAddEp: false })}
            >
              Annuler
            </Button>
            <Button
              variant="success"
              onClick={() => this.addEp(SeasonToAddEp, nbEpToAdd)}
            >
              <span className="fas fa-plus"></span> Ajouter {nbEpToAdd + " EP"}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal
          show={ShowModalAddSeasonEp}
          onHide={() => this.setState({ ShowModalAddSeasonEp: false })}
        >
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>Ajouter une Saison</Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            <Form id="AddSEP">
              <Form.Group controlId="duree">
                <Form.Label>Rajouter les EP</Form.Label>
                <Form.Control
                  type="number"
                  value={nbEpToAdd.toString()}
                  min="1"
                  placeholder="Nombres d'épisode de cette saison"
                  autoComplete="off"
                  onChange={(event) => {
                    const value = parseInt(event.target.value);

                    if (value < 1) return;
                    this.setState({ nbEpToAdd: value });
                  }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button
              variant="secondary"
              onClick={() => this.setState({ ShowModalAddSeasonEp: false })}
            >
              Annuler
            </Button>
            <Button variant="success" onClick={() => this.addSeason(nbEpToAdd)}>
              <span className="fas fa-plus"></span> Ajouter {nbEpToAdd + " EP"}
            </Button>
          </Modal.Footer>
        </Modal>
        {ShowMessageHtml ? (
          <div className={`ackmessage${ShowMessage ? " show" : " hide"} green`}>
            <span className="fas fa-check-circle"></span> {ResText}
          </div>
        ) : null}
      </section>
    );
  }
}

export default Watch;

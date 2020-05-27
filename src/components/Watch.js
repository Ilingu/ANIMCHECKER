import React, { Component, Fragment } from "react";
import { Redirect, Link } from "react-router-dom";
// Components
import AnimEpCo from "./dyna/AnimEp";
// CSS
import { Spinner, Button, Modal, Form } from "react-bootstrap";
// DB
import base from "../db/base";
import firebase from "firebase/app";
import "firebase/auth";

class Watch extends Component {
  state = {
    // Firebase
    Anim: {},
    AnimToWatch: {},
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
    // Repere
    repereSaison: {},
    repereEpisode: [],
    // Form
    SeasonToAddEp: null,
    nbEpToAdd: 1,
    // Modal
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

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        self.handleAuth({ user });
      }
    });
  }

  handleAuth = async (authData) => {
    const box = await base.fetch("/", { context: this });

    if (!box.proprio) {
      await base.post("/proprio", {
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
          ? `/${ForFirstTime.split("-")[0]}/${ForFirstTime}`
          : `/${id.split("-")[0]}/${id}`,
        {
          context: this,
        }
      );

      this.setState({ AnimToWatch: AnimToWatch });
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

  updateValue = (path, value) => {
    base
      .update(path, {
        data: value,
      })
      .then(this.refreshAnimToWatch)
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
      `/serie/${id}/AnimEP/${idSaison}/Episodes`,
      AnimToWatch.AnimEP[idSaison].Episodes.concat(Stockage)
    );
    this.updateValue(`/serie/${id}/AnimEP/${idSaison}`, {
      finished: false,
    });
    this.updateValue(`/serie/${id}`, { finishedAnim: false });

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

    this.addValue(`/serie/${id}/AnimEP`, Stockage);
    this.updateValue(`/serie/${id}`, { finishedAnim: false });

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
    const { id } = this.state;
    const idSaison = parseInt(Saison.name.split(" ")[1]) - 1;

    this.updateValue(
      `/serie/${id}/AnimEP/${idSaison}/Episodes/${EpFinishedID - 2}`,
      { finished: true }
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

    this.updateValue(`/serie/${id}/AnimEP/${idSaison}`, { finished: true });

    if (AnimToWatch.AnimEP.length === idSaison + 1)
      this.updateValue(`/serie/${id}`, { finishedAnim: true });

    this.finishedEp(Saison, EpFinishedID + 1);
    this.StopModeWatch();
  };

  playEp = (Saison, idEp) => {
    this.setRepere(Saison, idEp);
    this.StartModeWatch();
  };

  EndFilm = () => {
    const { id } = this.state;

    this.updateValue(`/film/${id}`, { finished: true });
    this.StopModeWatch();
  };

  handleDelete = () => {
    const { type, id } = this.state;

    this.updateValue(`/${type}`, { [id]: null });
    this.setState({ uid: null, RedirectHome: true });
  };

  render() {
    const {
      AnimToWatch,
      uid,
      id,
      RedirectHome,
      proprio,
      type,
      isFirstTime,
      modeStart,
      repereEpisode,
      repereSaison,
      ToOpen,
      ShowModalAddEp,
      nbEpToAdd,
      SeasonToAddEp,
      ShowModalAddSeasonEp,
    } = this.state;

    if (RedirectHome) return <Redirect to="/" />;

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

    if (uid !== proprio) return <Redirect to="/" />;

    if (id === null) {
      return <Redirect to="/" />;
    } else if (isFirstTime) {
      this.setState({ isFirstTime: false });
      return <Redirect to="/Watch" />;
    }

    let MyAnimAccordeon = null;

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
              <Button variant="primary">
                <span className="fas fa-arrow-left"></span> Retour
              </Button>
            </Link>
            <Button
              variant="success"
              onClick={() => this.setState({ ShowModalAddSeasonEp: true })}
            >
              <span className="fas fa-plus"></span> Ajouter une saison
            </Button>
            <Button variant="danger" onClick={this.handleDelete}>
              <span className="fas fa-trash-alt"></span> Supprimer cet anime
            </Button>

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
          show={ShowModalAddEp}
          onHide={() => this.setState({ ShowModalAddEp: false })}
        >
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>Rajouter des episode</Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            <Form id="AddAnim">
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
            <Form id="AddAnim">
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
      </section>
    );
  }
}

export default Watch;

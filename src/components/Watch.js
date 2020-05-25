import React, { Component, Fragment } from "react";
// Components
import AnimEpCo from "./dyna/AnimEp";
// CSS
import { Spinner, Button } from "react-bootstrap";
// DB
import base from "../db/base";
import { Redirect } from "react-router-dom";

class Watch extends Component {
  state = {
    // Firebase
    Anim: {},
    // Auth
    uid: null,
    id: null,
    // Bon fonctionnement de l'app
    AnimToWatch: {},
    modeStart: false,
    type: "",
    repereSaison: {},
    repereEpisode: [],
    isFirstTime: true,
    RedirectPath: "",
    ToOpen: "",
  };

  componentDidMount() {
    this.ref = base.syncState(`/`, {
      context: this,
      state: "Anim",
    });

    this.setState({
      uid: this.props.match.params.uid,
      id: this.props.match.params.id,
    });
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  linkAnimToWatch() {
    const { id, Anim } = this.state;

    this.setState({
      AnimToWatch: Anim[id.split("-")[0]][id],
      type: id.split("-")[0],
    });
  }

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
    const StateCopy = { ...this.state.Anim };
    const { id } = this.state;
    const idSaison = parseInt(Saison.name.split(" ")[1]) - 1;

    StateCopy[id.split("-")[0]][id].AnimEP[idSaison].Episodes[
      EpFinishedID - 2
    ].finished = true;
    this.setState({ Anim: StateCopy });
  };

  StartNextEP = (Saison = null, EpFinishedID = null) => {
    if (Saison !== null && EpFinishedID !== null) {
      this.finishedEp(Saison, EpFinishedID);
      this.setRepere(Saison, EpFinishedID);
    } else {
    }
    this.StartModeWatch();
  };

  endOfSaison = (Saison, EpFinishedID) => {
    const StateCopy = { ...this.state.Anim };
    const { id } = this.state;
    const idSaison = parseInt(Saison.name.split(" ")[1]) - 1;

    StateCopy[id.split("-")[0]][id].AnimEP[idSaison].finished = true;

    this.finishedEp(Saison, EpFinishedID + 1);
    this.setState({ Anim: StateCopy });
    this.StopModeWatch();
  };

  playEp = (Saison, idEp) => {
    this.setRepere(Saison, idEp);
    this.StartModeWatch();
  };

  render() {
    const {
      Anim,
      AnimToWatch,
      uid,
      type,
      isFirstTime,
      RedirectPath,
      modeStart,
      repereEpisode,
      repereSaison,
      ToOpen,
    } = this.state;

    if (RedirectPath !== "") return <Redirect to={RedirectPath} />;

    if (Anim.proprio) {
      if (Anim.proprio !== uid || !uid) {
        return <Redirect to="/" />;
      } else if (isFirstTime) {
        this.setState({ isFirstTime: false });
        this.linkAnimToWatch();
        return <Redirect to="/Watch" />;
      }
    } else {
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

    let MyAnimAccordeon = null;

    if (type === "serie") {
      MyAnimAccordeon = AnimToWatch.AnimEP.map((EpSaison) => (
        <AnimEpCo
          key={Date.now() + Math.random() * 100000 - Math.random() * -100000}
          ObjInfo={EpSaison}
          play={this.playEp}
          ToOpen={ToOpen}
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
              <div className="play" onClick={this.StartNextEP}>
                <span className="fas fa-play"></span>
              </div>
            </div>
          </header>
          <section id="ToWatch">
            <Button
              variant="primary"
              onClick={() => this.setState({ RedirectPath: "/" })}
            >
              <span className="fas fa-arrow-left"></span> Retour
            </Button>
            <header>
              <h1>{type === "serie" ? "Anime:" : "Film:"}</h1>
            </header>
            <div className="content">
              {type === "film" ? (
                <div className="film" id={AnimToWatch.name}>
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
                  {repereEpisode[1] === undefined ? null : repereEpisode[1].id}
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
            <div className="finished">
              <span className="fas fa-check"></span>
            </div>
          )}
        </div>
      </section>
    );
  }
}

export default Watch;

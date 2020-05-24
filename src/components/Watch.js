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
    repereEpisode: [],
    isFirstTime: true,
    RedirectPath: "",
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

  StopModeWatch = () => {
    document.body.style.cssText = "overflow: unset;";
    this.setState({ modeStart: false });
  };

  StartNextEP = (episodeFinished = null) => {
    if (episodeFinished !== null) {
    } else {
    }
    this.StartModeWatch();
  };

  StartPreviousEP = () => {
    this.StartModeWatch();
  };

  playEp = (Saison, idEp) => {
    console.log(Saison, idEp);
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
      return <Spinner animation="border" variant="warning" />;
    }

    let MyAnimAccordeon = null;

    if (type === "serie") {
      MyAnimAccordeon = AnimToWatch.AnimEP.map((EpSaison) => (
        <AnimEpCo
          key={Date.now() + Math.random() * 100000 - Math.random() * -100000}
          ObjInfo={EpSaison}
          play={this.playEp}
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
                <h2>{repereEpisode[1]}</h2>
              </header>
              <div className="next">
                <span className="fas fa-chevron-circle-right"></span>
              </div>
              <footer>
                <div className="previousEp" onClick={this.StartPreviousEP}>
                  {repereEpisode[0]}{" "}
                  <span className="fas fa-long-arrow-alt-left"></span>
                </div>
                <div
                  className="nextEp"
                  onClick={() => this.StartNextEP(repereEpisode[1])}
                >
                  {repereEpisode[2]}{" "}
                  <span className="fas fa-long-arrow-alt-right"></span>
                </div>
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

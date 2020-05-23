import React, { Component, Fragment } from "react";
import axios from "axios";
// Components
import Header from "./components/Header";
import Poster from "./components/dyna/PosterAnim";
import Episode from "./components/dyna/Episode";
// CSS
import { Modal, Button, ResponsiveEmbed } from "react-bootstrap";
// DB
import base from "./db/base";

export default class Home extends Component {
  state = {
    Anim: {
      moovies: {},
      anims: {},
    },
    findAnim: [],
    ShowModal: false,
    animToDetails: [],
  };

  componentDidMount() {
    if (!this.props.store.getState() === true) {
      window.history.pushState("", "", "/");
      window.location.reload();
    } else {
      this.ref = base.syncState(`/Anim`, {
        context: this,
        state: "Anim",
      });
    }
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  SearchAnim = (name) => {
    let NameToSend = name;
    this.setState({ ShowModal: true });

    if (name.includes(" ")) {
      NameToSend = name
        .split("")
        .map((char) => (char === " " ? "%20" : char))
        .join("");
    }

    axios
      .get(`https://api.jikan.moe/v3/search/anime?q=${NameToSend}&limit=16`)
      .then((result) => {
        this.setState({ findAnim: result.data.results });
      })
      .catch((err) => console.error(err));
  };

  handleClick = (id) => {
    this.setState({ ShowModal: false });

    axios
      .get(`https://api.jikan.moe/v3/anime/${id}`)
      .then((result) => {
        this.setState({ animToDetails: [result.data], findAnim: [] });
      })
      .catch((err) => console.error(err));
    axios
      .get(`https://api.jikan.moe/v3/anime/${id}/episodes`)
      .then((result) => {
        this.setState({
          animToDetails: [result.data, ...this.state.animToDetails],
          findAnim: [],
        });
      })
      .catch((err) => console.error(err));
  };

  render() {
    const { ShowModal, findAnim, animToDetails } = this.state;
    let animList = null;

    if (findAnim.length !== 0) {
      animList = findAnim.map((anim) => (
        <Poster
          key={anim.mal_id}
          url={anim.image_url}
          score={anim.score}
          title={anim.title}
          SeeInDetails={this.handleClick}
          type={anim.type}
          id={anim.mal_id}
          clicked={this.handleClick}
        />
      ));
    }

    if (animToDetails !== null && animToDetails.length >= 2) {
      let Episodes = animToDetails[0].episodes.map((EP) => (
        <Episode
          key={EP.episode_id}
          imgUrl={animToDetails[1].image_url}
          nbEp={EP.episode_id}
          urlVideo={EP.video_url}
          title={EP.title}
        />
      ));

      return (
        <Fragment>
          <div className="container" id="oneAnim">
            <header>
              <h1 className="title">{`${animToDetails[1].title} (${animToDetails[1].title_japanese})`}</h1>
              <div className="img">
                <img src={animToDetails[1].image_url} alt="Img of anim" />
                <a
                  href={animToDetails[1].url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="play">
                    <span className="fas fa-play"></span>
                  </div>
                </a>
              </div>
              <h5>
                <span className="score">{`${animToDetails[1].score}/10 (${
                  animToDetails[1].scored_by >= 2
                    ? animToDetails[1].scored_by + " votes"
                    : animToDetails[1].scored_by + " vote"
                })`}</span>
                <br />
                <span className="broadcast">
                  One episodes every {animToDetails[1].broadcast}
                </span>
              </h5>
            </header>
            <section id="infoSup">
              <Button
                variant="primary"
                onClick={() => this.setState({ animToDetails: null })}
              >
                <span className="fas fa-arrow-left"></span> Retour
              </Button>
              <header>
                <h1>Info supplémentaires</h1>
              </header>
              <div className="content">
                <ul>
                  <li>
                    Duration:{" "}
                    <span className="info">
                      {animToDetails[1].duration}/EP (moyenne)
                    </span>
                  </li>
                  <li>
                    Type:{" "}
                    <span className="info">
                      {animToDetails[1].type === "Movie"
                        ? animToDetails[1].type
                        : "Anime"}
                    </span>
                  </li>
                  <li>
                    Age requis:{" "}
                    <span className="info">{animToDetails[1].rating}</span>
                  </li>
                  <li>
                    Premiere:{" "}
                    <span className="info">{animToDetails[1].premiered}</span>
                  </li>
                  <li>
                    Résumé:{" "}
                    <span className="info">{animToDetails[1].synopsis}</span>
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
                  <embed
                    type="image/svg+xml"
                    src={animToDetails[1].trailer_url}
                  />
                </ResponsiveEmbed>
              </div>
            </section>
            <section id="episodes">
              <header>
                <h1>
                  {animToDetails[0].episodes.length >= 2
                    ? `Episodes (${animToDetails[0].episodes.length})`
                    : `Episode (${animToDetails[0].episodes.length})`}
                </h1>
              </header>
              <div className="EpContent">{Episodes}</div>
            </section>
          </div>
          <Button variant="success" block className="fixedOnBottom" size="lg">
            <span className="fas fa-plus"></span> Ajouter{" "}
            {animToDetails[1].title}
          </Button>
        </Fragment>
      );
    } else {
      return (
        <div className="container">
          <Header search={this.SearchAnim} />

          {/* MODAL */}
          <Modal
            show={ShowModal}
            onHide={() => this.setState({ ShowModal: false })}
          >
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Animé(s) trouvé(s)</Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">{animList}</Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button
                variant="secondary"
                onClick={() => this.setState({ ShowModal: false })}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }
}

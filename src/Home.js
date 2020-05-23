import React, { Component, Fragment } from "react";
import axios from "axios";
// Components
import Header from "./components/Header";
import Poster from "./components/dyna/PosterAnim";
import Episode from "./components/dyna/Episode";
import NextAnimCO from "./components/dyna/NextAnim";
// CSS
import {
  Modal,
  Button,
  ResponsiveEmbed,
  Form,
  Alert,
  Nav,
} from "react-bootstrap";
// DB
import base from "./db/base";

export default class Home extends Component {
  state = {
    // Firebase
    Anim: {},
    // Bon fonctionnement de l'app
    findAnim: [],
    ShowModalSearch: false,
    ShowModalAddAnim: false,
    ShowModalAddFilm: false,
    ShowModalType: false,
    SwitchMyAnim: false,
    animToDetails: [],
    // Form
    title: "",
    type: "serie",
    durer: 110,
    nbSaison: 1,
    EPSaison: [1],
    NextAnim: "",
    // Alerts
    ResText: null,
    typeAlert: null,
  };

  componentDidMount() {
    if (!this.props.store.getState() === true) {
      window.history.pushState("", "", "/");
      window.location.reload();
    } else {
      this.ref = base.syncState(`/`, {
        context: this,
        state: "Anim",
      });
    }
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  addAnime = (imageUrl) => {
    const { title, nbSaison, EPSaison, type, durer } = this.state;
    const self = this;
    const StateCopy = { ...this.state.Anim };

    if (typeof imageUrl === "object") {
      const title2 = this.replaceSpace(title, "%20");
      axios
        .get(`https://api.jikan.moe/v3/search/anime?q=${title2}&limit=1`)
        .then((result) => {
          imageUrl = result.data.results[0].image_url;
          next();
        })
        .catch((err) => {
          this.setState({
            ResText:
              "Excusés-nous mais nous avons rencontré un problème lors de la recherche d'une photos de cette anim, vueillez réessayer plus tard ou chercher cette anim (non manuellement)",
            typeAlert: "danger",
          });
          console.error(err);
        });
    }

    function next() {
      if (type === "serie") {
        let isGoodForAllEP = true;

        EPSaison.forEach((EP) => {
          if (typeof EP !== "number") {
            isGoodForAllEP = false;
          } else if (EP < 1) {
            isGoodForAllEP = false;
          }
        });

        if (
          title !== undefined &&
          title !== null &&
          typeof title === "string" &&
          title.trim().length !== 0 &&
          title !== "" &&
          typeof nbSaison === "number" &&
          nbSaison >= 1 &&
          isGoodForAllEP
        ) {
          let SaisonEPObj = {};
          let EPObj = {};

          for (let i = 0; i < nbSaison; i++) {
            for (let j = 0; j < EPSaison[i]; j++) {
              EPObj[`Episode${j + 1}`] = {
                finished: false,
                startedEPDate: "null",
                finishedEPDate: "null",
              };
            }
            SaisonEPObj[`Saison${i + 1}`] = { finishedS: false, EPObj };
          }

          StateCopy.serie[`series-${Date.now()}`] = {
            name: title,
            imageUrl,
            startedAnimDate: "null",
            finishedAnimDate: "null",
            finishedAnim: false,
            Anim: SaisonEPObj,
          };

          self.setState({
            Anim: StateCopy,
            findAnim: [],
            ShowModalSearch: false,
            ShowModalAddAnim: false,
            ShowModalAddFilm: false,
            ShowModalType: false,
            animToDetails: [],
            // Form
            title: "",
            type: "serie",
            durer: 110,
            nbSaison: 1,
            EPSaison: [1],
            NextAnim: "",
            // Alerts
            ResText: null,
            typeAlert: null,
          });
        } else {
          self.setState({
            ResText: "Tous les champs doivent être remplie correctement",
            typeAlert: "danger",
          });
        }
      } else if (type === "film") {
        if (
          title !== undefined &&
          title !== null &&
          typeof title === "string" &&
          title.trim().length !== 0 &&
          title !== "" &&
          typeof durer === "number" &&
          durer >= 1
        ) {
          StateCopy.film[`film-${Date.now()}`] = {
            name: title,
            durer,
            imageUrl,
            startedFilmDate: "null",
            finishedFilmDate: "null",
            finished: false,
          };

          self.setState({
            Anim: StateCopy,
            findAnim: [],
            ShowModalSearch: false,
            ShowModalAddAnim: false,
            ShowModalAddFilm: false,
            ShowModalType: false,
            animToDetails: [],
            // Form
            title: "",
            type: "serie",
            durer: 110,
            nbSaison: 1,
            EPSaison: [1],
            NextAnim: "",
            // Alerts
            ResText: null,
            typeAlert: null,
          });
        } else {
          self.setState({
            ResText: "Tous les champs doivent être remplie correctement",
            typeAlert: "danger",
          });
        }
      } else {
        self.setState({
          ResText:
            "Vous n'avez pas choisi de type pour l'oeuvre que vous allez regarder",
          typeAlert: "danger",
        });
      }
    }

    this.setState({ ShowModalAddAnim: false, ShowModalAddFilm: false });
  };

  newNextAnim = (event) => {
    event.preventDefault();

    const NextAnimCopy = { ...this.state.Anim };
    const { NextAnim } = this.state;

    if (
      NextAnim !== undefined &&
      NextAnim !== null &&
      typeof NextAnim === "string" &&
      NextAnim.trim().length !== 0 &&
      NextAnim !== ""
    ) {
      NextAnimCopy.NextAnim[`NextAnim${Date.now()}`] = { name: NextAnim };
      this.setState({ Anim: NextAnimCopy, NextAnim: "" });
    } else {
      this.setState({
        ResText: "Vueillez me donner le nom de l'anime à rajouter",
        typeAlert: "danger",
      });
    }
  };

  replaceSpace = (data, remplaceStr) => {
    return data
      .split("")
      .map((char) => (char === " " ? remplaceStr : char))
      .join("");
  };

  SearchAnim = (name) => {
    let NameToSend = name;
    this.setState({ ShowModalSearch: true });

    if (name.includes(" ")) {
      NameToSend = this.replaceSpace(name, "%20");
    }

    axios
      .get(`https://api.jikan.moe/v3/search/anime?q=${NameToSend}&limit=16`)
      .then((result) => {
        this.setState({ findAnim: result.data.results });
      })
      .catch((err) => console.error(err));
  };

  handleClick = (id) => {
    this.setState({ ShowModalSearch: false });

    axios
      .get(`https://api.jikan.moe/v3/anime/${id}`)
      .then((result) => {
        this.setState({
          animToDetails: [result.data],
          findAnim: [],
        });
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

  openNext = () => {
    const { type } = this.state;

    if (type === "serie") this.setState({ ShowModalAddAnim: true });
    else this.setState({ ShowModalAddFilm: true });
  };

  cancelModal = () => {
    this.setState({
      ShowModalSearch: false,
      ShowModalAddAnim: false,
      ShowModalAddFilm: false,
      ShowModalType: false,
      title: "",
      type: "serie",
      durer: 110,
      nbSaison: 1,
      EPSaison: [1],
    });
  };

  render() {
    const {
      ShowModalSearch,
      findAnim,
      animToDetails,
      Anim,
      ShowModalAddAnim,
      nbSaison,
      title,
      EPSaison,
      ResText,
      typeAlert,
      type,
      ShowModalAddFilm,
      ShowModalType,
      durer,
      SwitchMyAnim,
      NextAnim,
    } = this.state;
    let animList = null;
    let MyAnimList = "Vous avez aucun anime :/\nRajoutez-en !";
    let MyNextAnimList =
      "Vous avez mis aucun anime comme souhait dans cette section\nRajoutez-en";
    let EPSaisonHtml = [];

    if (type === "serie") {
      for (let i = 0; i < nbSaison; i++) {
        const stateCopy = { ...this.state };

        if (stateCopy.EPSaison[i] === undefined) {
          stateCopy.EPSaison = [...stateCopy.EPSaison, 1];
          this.setState(stateCopy);
        }

        EPSaisonHtml = [
          ...EPSaisonHtml,
          <Form.Group controlId="saison" key={i}>
            <Form.Label>Nombre d'épisode de la saison {i + 1}</Form.Label>
            <Form.Control
              type="number"
              value={EPSaison[i]}
              placeholder="Nombre d'épisode"
              onChange={(event) => {
                const value = parseInt(event.target.value);

                if (value < 1) return;

                stateCopy.EPSaison[i] = value;
                this.setState(stateCopy);
              }}
            />
          </Form.Group>,
        ];
      }
    }

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
          inMyAnim={false}
          clicked={this.handleClick}
        />
      ));
    }

    if (Object.keys(Anim).length !== 0 && SwitchMyAnim) {
      const { serie, film } = this.state.Anim;
      MyAnimList = Object.keys(serie)
        .map((key) => (
          <Poster
            key={key}
            id={key}
            url={serie[key].imageUrl}
            title={serie[key].name}
            isFinished={serie[key].finishedAnim}
            inMyAnim={true}
          />
        ))
        .concat(
          Object.keys(film).map((key) => (
            <Poster
              key={key}
              id={key}
              url={film[key].imageUrl}
              title={film[key].name}
              isFinished={film[key].finished}
              inMyAnim={true}
            />
          ))
        );
    } else if (!SwitchMyAnim && this.state.Anim.NextAnim !== undefined) {
      const { NextAnim } = this.state.Anim;
      MyNextAnimList = Object.keys(NextAnim).map((key) => (
        <NextAnimCO key={key} name={NextAnim[key].name} />
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
          <Header
            search={this.SearchAnim}
            openModalNewAnim={() => this.setState({ ShowModalType: true })}
          />

          <section id="MyAnime">
            <header>
              <Nav fill variant="tabs">
                <Nav.Item>
                  <Nav.Link
                    eventKey="link-1"
                    active={SwitchMyAnim}
                    onClick={() => this.setState({ SwitchMyAnim: true })}
                  >
                    My Anim
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    eventKey="link-2"
                    active={!SwitchMyAnim}
                    onClick={() => this.setState({ SwitchMyAnim: false })}
                  >
                    My next anim
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              <div className="return">
                {ResText === null && typeAlert === null ? null : (
                  <Alert
                    variant={typeAlert}
                    onClose={() =>
                      this.setState({
                        ResText: null,
                        typeAlert: null,
                      })
                    }
                    dismissible
                  >
                    <p>{ResText}</p>
                  </Alert>
                )}
              </div>
            </header>
            <div className={SwitchMyAnim ? "content" : "content none"}>
              {SwitchMyAnim ? (
                MyAnimList
              ) : (
                <Fragment>
                  <header>
                    <h4>
                      Ici tu met les anime que tu veux regarder plus tard:{" "}
                    </h4>
                    <Form onSubmit={this.newNextAnim}>
                      <Form.Group controlId="type">
                        <Form.Label>Le nom ton prochain anime: </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nom de cette anime"
                          autoComplete="off"
                          value={NextAnim}
                          onChange={(event) =>
                            this.setState({ NextAnim: event.target.value })
                          }
                        />
                      </Form.Group>
                      <Button variant="success" type="submit">
                        <span className="fas fa-plus"></span> Ajouter {}
                      </Button>
                    </Form>
                    <hr />
                  </header>

                  {MyNextAnimList}
                </Fragment>
              )}
            </div>
          </section>

          {/* MODALS */}
          <Modal show={ShowModalSearch} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Animé(s) trouvé(s)</Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">{animList}</Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                Annuler
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={ShowModalType} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Type d'anime</Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              <Form>
                <Form.Group controlId="type">
                  <Form.Label>Série OU Film</Form.Label>
                  <Form.Control
                    as="select"
                    value={type}
                    onChange={(event) =>
                      this.setState({ type: event.target.value })
                    }
                    custom
                  >
                    <option value="serie">Série</option>
                    <option value="film">Film</option>
                  </Form.Control>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                Annuler
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  this.setState({ ShowModalType: false });
                  this.openNext();
                }}
              >
                Suivant <span className="fas fa-arrow-right"></span>
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={ShowModalAddAnim} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Ajouter un Anim/Film</Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              <Form id="AddAnim" onSubmit={this.addAnime}>
                <Form.Group controlId="titre">
                  <Form.Label>Titre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Titre de l'anime/film"
                    autoComplete="off"
                    value={title}
                    onChange={(event) =>
                      this.setState({
                        title: event.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="saison">
                  <Form.Label>Nombre de saisons</Form.Label>
                  <Form.Control
                    type="number"
                    value={nbSaison.toString()}
                    placeholder="Nombre De saison"
                    onChange={(event) => {
                      const value = parseInt(event.target.value);

                      if (value < 1) return;
                      this.setState({ nbSaison: value });
                    }}
                  />
                </Form.Group>
                <div id="EPSaisonHtml">{EPSaisonHtml}</div>
              </Form>
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                Annuler
              </Button>
              <Button variant="success" onClick={this.addAnime}>
                <span className="fas fa-plus"></span> Créer {title}
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={ShowModalAddFilm} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Ajouter un Anim/Film</Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              <Form id="AddAnim" onSubmit={this.addAnime}>
                <Form.Group controlId="titre">
                  <Form.Label>Titre</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Titre de l'anime/film"
                    autoComplete="off"
                    value={title}
                    onChange={(event) =>
                      this.setState({
                        title: event.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="duree">
                  <Form.Label>Durée du film</Form.Label>
                  <Form.Control
                    type="number"
                    value={durer.toString()}
                    min="1"
                    placeholder="Durée en minutes"
                    onChange={(event) => {
                      const value = parseInt(event.target.value);

                      if (value < 1) return;
                      this.setState({ durer: value });
                    }}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                Annuler
              </Button>
              <Button variant="success" onClick={this.addAnime}>
                <span className="fas fa-plus"></span> Créer {title}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }
}

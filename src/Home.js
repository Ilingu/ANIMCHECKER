import React, { Component, Fragment } from "react";
import axios from "axios";
// Components
import Poster from "./components/dyna/PosterAnim";
import NextAnimCO from "./components/dyna/NextAnim";
import OneAnim from "./components/OneAnim";
import MyAnim from "./components/MyAnim";
import Login from "./components/Auth/Login";
// Context
import ContextForMyAnim from "./ContextSchema";
// CSS
import { Modal, Button, Form } from "react-bootstrap";
// DB
import base, { firebaseApp } from "./db/base";
import firebase from "firebase/app";
import "firebase/auth";

export default class Home extends Component {
  state = {
    // Firebase
    Anim: {},
    uid: 12,
    proprio: 12,
    // Bon fonctionnement de l'app
    findAnim: [],
    ShowModalSearch: false,
    ShowModalAddAnim: false,
    ShowModalAddFilm: false,
    ShowModalType: false,
    SwitchMyAnim: true,
    animToDetails: [],
    // Form
    title: "",
    type: "serie",
    imageUrl: null,
    durer: 110,
    nbEP: "",
    NextAnim: "",
    CodeNumber: ["", 1],
    // Alerts
    ResText: null,
    typeAlert: null,
  };

  componentDidMount() {
    const self = this;
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        self.handleAuth({ user });
      }
      self.ref = base.syncState(`/`, {
        context: this,
        state: "Anim",
      });
    });
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
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

  authenticate = () => {
    firebase.auth().languageCode = "fr";
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "recaptcha-container"
    );
    firebaseApp
      .auth()
      .signInWithPhoneNumber("+33652114944", window.recaptchaVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        this.setState({
          CodeNumber: [this.state.CodeNumber[0], 2],
        });
      });
  };

  verificateCode = () => {
    window.confirmationResult
      .confirm(this.state.CodeNumber[0])
      .then((result) => {
        this.console.log(result.user);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  logOut = () => {
    const CopyState = { ...this.state.Anim };
    firebase
      .auth()
      .signOut()
      .then(() => {
        CopyState.proprio = "";
        this.setState({ Anim: CopyState });
      })
      .catch((err) => console.error(err));
  };

  addAnime = () => {
    const { title, nbEP, type, durer, imageUrl } = this.state;
    const self = this;
    const StateCopy = { ...this.state.Anim };
    let imgUrl = imageUrl;

    if (imgUrl === null) {
      const title2 = this.replaceSpace(title, "%20");
      axios
        .get(`https://api.jikan.moe/v3/search/anime?q=${title2}&limit=1`)
        .then((result) => {
          imgUrl = result.data.results[0].image_url;
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
    } else if (typeof imgUrl === "string") {
      next();
    } else {
      this.setState({
        ResText:
          "Attention impossible de prendre une image à partir d'un lien non existant",
        typeAlert: "danger",
      });
    }

    function next() {
      if (type === "serie") {
        if (
          title !== undefined &&
          title !== null &&
          typeof title === "string" &&
          title.trim().length !== 0 &&
          title !== "" &&
          nbEP !== undefined &&
          nbEP !== null &&
          typeof nbEP === "string" &&
          nbEP.trim().length !== 0 &&
          nbEP !== ""
        ) {
          let AnimSEP = nbEP.split(",").map((nbEpS, i) => {
            let EpObj = [];

            for (let j = 0; j < parseInt(nbEpS); j++) {
              EpObj = [...EpObj, { id: j + 1, finished: false }];
            }

            return {
              name: `Saison ${i + 1}`,
              Episodes: EpObj,
              finished: false,
            };
          });

          StateCopy.serie[`serie-${Date.now()}`] = {
            name: title,
            imageUrl: imgUrl,
            finishedAnim: false,
            AnimEP: AnimSEP,
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
            nbEP: "",
            NextAnim: "",
            imageUrl: null,
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
            imageUrl: imgUrl,
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
            nbEP: "",
            NextAnim: "",
            imageUrl: null,
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

    this.setState({
      ShowModalAddAnim: false,
      ShowModalAddFilm: false,
    });
  };

  deleteAnim = (id) => {
    const CopyAnim = { ...this.state.Anim };

    CopyAnim[id.split("-")[0]][id] = null;
    this.setState({ Anim: CopyAnim });
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
      NextAnimCopy.NextAnim[`NextAnim${Date.now()}`] = {
        name: NextAnim,
      };
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

    this.setState({ animToDetails: [] });
  };

  DeleteNextAnim = (id) => {
    const AnimCopy = { ...this.state.Anim };
    AnimCopy.NextAnim[id] = null;
    this.setState({ Anim: AnimCopy });
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
      nbEP: "",
      imageUrl: null,
    });
  };

  render() {
    const {
      uid,
      proprio,
      ShowModalSearch,
      findAnim,
      animToDetails,
      Anim,
      ShowModalAddAnim,
      title,
      ResText,
      typeAlert,
      type,
      ShowModalAddFilm,
      ShowModalType,
      durer,
      SwitchMyAnim,
      NextAnim,
      CodeNumber,
      nbEP,
    } = this.state;

    if (!uid) {
      return (
        <Login
          authenticate={this.authenticate}
          verificateCode={this.verificateCode}
          forForm={CodeNumber.concat([
            (event) =>
              this.setState({
                CodeNumber: [event.target.value, CodeNumber[1]],
              }),
          ])}
        />
      );
    }

    if (uid !== proprio) {
      base.removeBinding(this.ref);

      return (
        <div>
          <p>
            Vous n'êtes pas le bonne utilisateur \n (PS: Si vous êtes pas le
            développeur de cette App ça sert à rien de continuer)
          </p>
        </div>
      );
    }

    let animList = null;
    let MyAnimList = "Vous avez aucun anime :/\nRajoutez-en !";
    let MyNextAnimList =
      "Vous avez mis aucun anime comme souhait dans cette section\nRajoutez-en";

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
            deleteAnim={this.deleteAnim}
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
        <NextAnimCO
          key={key}
          name={NextAnim[key].name}
          handleClick={() => {
            this.setState({
              ShowModalType: true,
              title: NextAnim[key].name,
            });
            this.DeleteNextAnim(key);
          }}
        />
      ));
    }

    if (animToDetails !== null && animToDetails.length >= 2)
      return (
        <OneAnim
          details={animToDetails}
          back={() => this.setState({ animToDetails: null })}
          handleAdd={() => {
            this.setState({
              title: animToDetails[1].title,
              type: animToDetails[1].type === "Movie" ? "film" : "serie",
              imageUrl: animToDetails[1].image_url,
            });
            this.openNext();
          }}
        />
      );
    else
      return (
        <Fragment>
          <ContextForMyAnim.Provider
            value={{
              openModalNewAnim: () => this.setState({ ShowModalType: true }),
              search: this.SearchAnim,
              logOut: this.logOut,
            }}
          >
            <MyAnim
              SwitchMyAnimVar={SwitchMyAnim}
              SwitchMyNextAnim={() => this.setState({ SwitchMyAnim: false })}
              SwitchMyAnim={() => this.setState({ SwitchMyAnim: true })}
              NextAnimChange={(event) =>
                this.setState({ NextAnim: event.target.value })
              }
              NextAnim={NextAnim}
              ResText={ResText}
              typeAlert={typeAlert}
              MyAnimList={MyAnimList}
              MyNextAnimList={MyNextAnimList}
              handleSubmit={this.newNextAnim}
              onClose={() =>
                this.setState({
                  ResText: null,
                  typeAlert: null,
                })
              }
            />
          </ContextForMyAnim.Provider>

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
                    autoComplete="off"
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
              <Modal.Title>Ajouter une série</Modal.Title>
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
                  <Form.Label>
                    Nombre d'épisode (séparé d'un "," pour chnager de saison pas
                    d'espace !)
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={nbEP}
                    placeholder="Nombre d'EP => S1NbEP,S2NbEP..."
                    autoComplete="off"
                    onChange={(event) =>
                      this.setState({ nbEP: event.target.value })
                    }
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

          <Modal show={ShowModalAddFilm} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Ajouter un Film</Modal.Title>
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
                    autoComplete="off"
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
        </Fragment>
      );
  }
}

/* eslint-disable no-unused-expressions */
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
    NextAnimFireBase: {},
    filmFireBase: {},
    serieFirebase: {},
    uid: null,
    proprio: null,
    // Bon fonctionnement de l'app
    findAnim: [],
    ShowModalSearch: false,
    ShowModalAddAnim: false,
    ShowModalAddFilm: false,
    ShowModalType: false,
    SwitchMyAnim: true,
    animToDetails: [],
    NextAnimToDelete: null,
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
    // A2HS
    AddToHomeScreen: null,
  };

  componentDidMount() {
    const self = this;
    // A2HS
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      self.setState({
        AddToHomeScreen: e,
      });
    });
    // Firebase
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        self.handleAuth({ user });
      }

      self.refreshValueFirebase();
    });
  }

  AddToHome = () => {
    const { AddToHomeScreen } = this.state;

    if (AddToHomeScreen) {
      AddToHomeScreen.prompt();
      AddToHomeScreen.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          alert("Thanks :)");
        }
        this.setState({
          AddToHomeScreen: null,
        });
      });
    } else {
      console.error("Error To Open The Prompt");
    }
  };

  refreshValueFirebase = async () => {
    try {
      const NextAnim = await base.fetch("/NextAnim", { context: this });
      const serie = await base.fetch("/serie", { context: this });
      const film = await base.fetch("/film", { context: this });

      this.setState({
        NextAnimFireBase: NextAnim,
        serieFirebase: serie,
        filmFireBase: film,
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
      .then(() => {
        this.refreshValueFirebase();
        this.setState({
          ResText: "Votre requête d'ajout a réussite.",
          typeAlert: "success",
        });
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          ResText: "Votre requête d'ajout à echoué.",
          typeAlert: "danger",
        });
      });

    setTimeout(() => {
      this.setState({
        ResText: null,
        typeAlert: null,
      });
    }, 2500);
  };

  deleteValue = async (path) => {
    base
      .remove(path)
      .then(() => {
        this.refreshValueFirebase();
        this.setState({
          ResText: "Votre requête de suppression a réussite.",
          typeAlert: "success",
        });

        setTimeout(() => {
          this.setState({
            ResText: null,
            typeAlert: null,
          });
        }, 2000);
      })
      .catch((err) => {
        console.error(err);
        this.setState({
          ResText: "Votre requête de suppression a échoué.",
          typeAlert: "danger",
        });

        setTimeout(() => {
          this.setState({
            ResText: null,
            typeAlert: null,
          });
        }, 2000);
      });
  };

  handleAuth = async (authData) => {
    const box = await base.fetch("/", { context: this });

    if (!box.proprio) {
      await base.post("/proprio", {
        data: authData.user.uid,
      });
    }

    this.notifyMe();
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
    const { title, nbEP, type, durer, imageUrl, NextAnimToDelete } = this.state;
    const self = this;

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
      let IsGood = false;
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
          IsGood = true;
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

          self.addValue("/serie", {
            ...self.state.serieFirebase,
            [`serie-${Date.now()}`]: {
              name: title,
              imageUrl: imgUrl,
              finishedAnim: false,
              AnimEP: AnimSEP,
            },
          });

          // reset
          self.setState({
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
          IsGood = true;

          self.addValue("/film", {
            ...self.state.filmFireBase,
            [`film-${Date.now()}`]: {
              name: title,
              durer,
              imageUrl: imgUrl,
              finished: false,
            },
          });

          // Reset
          self.setState({
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

      if (IsGood && NextAnimToDelete !== null) {
        self.deleteValue(`/NextAnim/${NextAnimToDelete}`);
        self.setState({
          NextAnimToDelete: null,
        });
      }
    }

    this.setState({
      ShowModalAddAnim: false,
      ShowModalAddFilm: false,
    });
  };

  notifyMe = () => {
    const self = this;
    if (window.Notification) {
      if (Notification.permission === "granted") {
        self.doNotif();
      } else {
        Notification.requestPermission()
          .then(function (p) {
            if (p === "granted") {
              self.doNotif();
            } else {
              console.log("User blocked notifications.");
            }
          })
          .catch(function (err) {
            console.error(err);
          });
      }
    }
  };

  doNotif = async () => {
    try {
      const NotifFirebase = await base.fetch("/Notif", { context: this }),
        TimeNow = new Date().getHours() * 3600 + new Date().getMinutes() * 60;

      Object.keys(NotifFirebase).forEach((notifKey) => {
        if (
          new Date().getDay().toString() === NotifFirebase[notifKey].day &&
          TimeNow >= NotifFirebase[notifKey].time &&
          !NotifFirebase[notifKey].called &&
          !NotifFirebase[notifKey].paused
        ) {
          new Notification(`Sortie Anime: ${NotifFirebase[notifKey].name} !`, {
            body: `Nouvel Episode de ${NotifFirebase[notifKey].name}, ne le rate pas !`,
            icon: "https://myanimchecker.netlify.app/favicon.ico",
          });
          base.update(`/Notif/${notifKey}`, {
            data: { called: true },
          });
        } else if (
          new Date().getDay().toString() !== NotifFirebase[notifKey].day &&
          NotifFirebase[notifKey].called
        ) {
          base.update(`/Notif/${notifKey}`, {
            data: { called: false },
          });
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  newNextAnim = (event) => {
    event.preventDefault();

    const { NextAnim } = this.state;

    if (
      NextAnim !== undefined &&
      NextAnim !== null &&
      typeof NextAnim === "string" &&
      NextAnim.trim().length !== 0 &&
      NextAnim !== ""
    ) {
      this.addValue("/NextAnim", {
        ...this.state.NextAnimFireBase,
        [`NextAnim${Date.now()}`]: {
          name: NextAnim,
        },
      });

      this.setState({ NextAnim: "" });
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

  openNext = (onDefault = null) => {
    const { type } = this.state;

    if (onDefault !== null) {
      onDefault === "serie"
        ? this.setState({ ShowModalAddAnim: true })
        : this.setState({ ShowModalAddFilm: true });
    } else {
      type === "serie"
        ? this.setState({ ShowModalAddAnim: true })
        : this.setState({ ShowModalAddFilm: true });
    }

    this.setState({ animToDetails: [] });
  };

  cancelModal = () => {
    this.setState({
      ShowModalSearch: false,
      ShowModalAddAnim: false,
      ShowModalAddFilm: false,
      ShowModalType: false,
      NextAnimToDelete: null,
      title: "",
      type: "serie",
      durer: 110,
      nbEP: "",
      imageUrl: null,
    });
  };

  shuffleArray = (array) => {
    return array.sort(() => {
      return Math.random() - 0.5;
    });
  };
  
  render() {
    const {
      filmFireBase,
      serieFirebase,
      NextAnimFireBase,
      uid,
      proprio,
      ShowModalSearch,
      findAnim,
      animToDetails,
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

    if (
      (Object.keys(filmFireBase).length !== 0 ||
        Object.keys(serieFirebase).length !== 0) &&
      SwitchMyAnim
    ) {
      MyAnimList = Object.keys(serieFirebase)
        .map((key) => (
          <Poster
            key={key}
            id={key}
            url={serieFirebase[key].imageUrl}
            title={serieFirebase[key].name}
            isFinished={serieFirebase[key].finishedAnim}
            deleteAnim={this.deleteValue}
            isAlleged={!serieFirebase[key].AnimEP ? true : false}
            inMyAnim={true}
          />
        ))
        .concat(
          Object.keys(filmFireBase).map((key) => (
            <Poster
              key={key}
              id={key}
              url={filmFireBase[key].imageUrl}
              title={filmFireBase[key].name}
              isFinished={filmFireBase[key].finished}
              deleteAnim={this.deleteValue}
              isAlleged={false}
              inMyAnim={true}
            />
          ))
        );
      MyAnimList = this.shuffleArray(MyAnimList);
    } else if (
      !SwitchMyAnim &&
      Object.keys(NextAnimFireBase).length !== 0 &&
      NextAnimFireBase !== undefined
    ) {
      MyNextAnimList = Object.keys(NextAnimFireBase).map((key) => (
        <NextAnimCO
          key={key}
          name={NextAnimFireBase[key].name}
          handleClick={() => {
            this.setState({
              ShowModalType: true,
              title: NextAnimFireBase[key].name,
              NextAnimToDelete: key,
            });
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
            this.openNext(animToDetails[1].type === "Movie" ? "film" : "serie");
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
              addToHome: this.AddToHome,
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
              <Form id="AddAnim">
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
              <Form id="AddAnim">
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

/* eslint-disable no-unused-expressions */
import React, { Component, Fragment } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
// Components
import Poster from "./components/dyna/PosterAnim";
import NextAnimCO from "./components/dyna/NextAnim";
import OneAnim from "./components/OneAnim";
import MyAnim from "./components/MyAnim";
import Login from "./components/Auth/Login";
import PseudoCO from "./components/Auth/Pseudo";
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
    Pseudo: !JSON.parse(window.localStorage.getItem("Pseudo"))
      ? null
      : JSON.parse(window.localStorage.getItem("Pseudo")),
    NumTel: "",
    NewLogin: false,
    NextAnimFireBase: {},
    filmFireBase: {},
    serieFirebase: {},
    PhoneNumFireBase: null,
    NotifState: null,
    FirstQuerie: false,
    AuthenticateMethod: false,
    AllowUseReAuth: false,
    uid: null,
    proprio: null,
    // Bon fonctionnement de l'app
    findAnim: [],
    JustDefined: false,
    RedirectPage: null,
    ShowModalSearch: false,
    ShowModalAddAnim: false,
    ShowModalAddFilm: false,
    ShowModalType: false,
    ShowModalVerification: false,
    PalmaresModal: false,
    SwitchMyAnim: true,
    animToDetails: [],
    NextAnimToDelete: null,
    SearchInAnimeList: [false, null],
    RefreshRandomizeAnime: true,
    RefreshRandomizeAnime2: true,
    MyAnimListSaved: null,
    MyNextAnimListSaved: null,
    ModeFilter: "NotFinished",
    ModeFindAnime: [false, null],
    palmares: null,
    MicOn: false,
    ShowMessage: false,
    ShowMessageHtml: false,
    SecondMessage: false,
    // Form
    title: "",
    type: "serie",
    imageUrl: null,
    durer: 110,
    nbEP: "",
    NextAnim: "",
    CodeNumber: ["", 1],
    titleSearchAnime: "",
    DeletePathVerif: null,
    // Alerts
    ResText: null,
    typeAlert: null,
    // A2HS
    AddToHomeScreen: null,
  };

  componentDidMount() {
    const self = this;
    // Recup Message Inter-page
    if (this.props.match.params.codemsg !== undefined) {
      let ResText = null;
      let typeAlert = null;
      switch (this.props.match.params.codemsg) {
        case "1":
          ResText =
            "Impossible d'accéder à cette page car cette anime est actuellement en pause. (Pour le reprendre aller sur l'anime depuis votre liste et clicker sur le bouton reprendre/play";
          typeAlert = "danger";
          break;
        case "2":
          ResText = "Erreur aucun Pseudo n'a été acossié";
          typeAlert = "danger";
          break;
        case "3":
          ResText = "Ce n'est pas votre compte";
          typeAlert = "danger";
          break;
        case "4":
          ResText = "Auncun Anime à été trouvé";
          typeAlert = "danger";
          break;
        case "5":
          ResText = "Votre modification a bien été pris en compte";
          typeAlert = "success";
          break;
        case "6":
          this.logOut();
          break;
        default:
          break;
      }
      this.setState({ ResText, typeAlert, RedirectPage: "/" });
    }
    // A2HS
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      self.setState({
        AddToHomeScreen: e,
      });
    });
    // Firebase
    if (this.state.Pseudo) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          self.handleAuth({ user });
        }

        self.setState({ AuthenticateMethod: true });
      });
    } else {
      self.setState({ AllowUseReAuth: true });
    }
    // Verified Conn
    this.AllowVpn(false);
  }

  reAuth = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.handleAuth({ user });
      }

      this.setState({ AuthenticateMethod: true, AllowUseReAuth: false });
    });
  };

  AllowVpn = (Reconn, reFunc = null) => {
    // Allow Vpn
    if (Reconn && reFunc !== null) {
      // Allow Vpn
      window.localStorage.removeItem("firebase:previous_websocket_failure");
      setTimeout(reFunc, 2000);
    } else {
      let i = 0;
      const interval = setInterval(() => {
        if (i === 6) this.reAuth();
        if (this.state.uid === null && this.state.proprio === null) {
          // Allow Vpn
          window.localStorage.removeItem("firebase:previous_websocket_failure");
        } else {
          clearInterval(interval);
        }
        i++;
      }, 1000);
    }
  };

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

  refreshValueFirebase = async (after = null) => {
    try {
      const NextAnim = await base.fetch(`${this.state.Pseudo}/NextAnim`, {
        context: this,
      });
      const serie = await base.fetch(`${this.state.Pseudo}/serie`, {
        context: this,
      });
      const film = await base.fetch(`${this.state.Pseudo}/film`, {
        context: this,
      });
      const NotifState = await base.fetch(`${this.state.Pseudo}/NotifState`, {
        context: this,
      });
      const PhoneNum = await base.fetch(`${this.state.Pseudo}/PhoneNum`, {
        context: this,
      });

      this.setState(
        {
          ModeFindAnime: [false, null],
          RefreshRandomizeAnime: true,
          RefreshRandomizeAnime2: true,
          FirstQuerie: true,
          NextAnimFireBase: NextAnim,
          serieFirebase: serie,
          filmFireBase: film,
          PhoneNumFireBase: PhoneNum,
          NotifState,
        },
        after
      );
    } catch (err) {
      this.AllowVpn(true, () => this.refreshValueFirebase(after));
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
        this.AllowVpn(true, () => this.addValue(path, value));
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

  updateValue = (path, value) => {
    base
      .update(path, {
        data: value,
      })
      .then(this.refreshValueFirebase)
      .catch((err) => {
        this.AllowVpn(true, () => this.updateValue(path, value));
        console.error(err);
      });
  };

  deleteValue = async (path) => {
    base
      .remove(path)
      .then(() => {
        this.cancelModal();
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
        this.AllowVpn(true, () => this.deleteValue(path));
        console.error(err);
        this.cancelModal();
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
    // Allow Vpn
    window.localStorage.removeItem("firebase:previous_websocket_failure");
    // Connection
    const box = await base.fetch(this.state.Pseudo, { context: this });

    if (!box.proprio) {
      await base.post(`${this.state.Pseudo}/proprio`, {
        data: authData.user.uid,
      });
    }

    this.refreshValueFirebase(() => {
      this.notifyMe();
      if (this.state.NewLogin) {
        this.verificateNum();
      }
    });
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
      .signInWithPhoneNumber(this.state.NumTel, window.recaptchaVerifier)
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
      .then(() => {
        console.log("Connected");
        this.setState({ NewLogin: true, JustDefined: false });
      })
      .catch((err) => {
        console.error(err);
      });
  };

  verificateNum = () => {
    const { NumTel, PhoneNumFireBase, Pseudo } = this.state;

    if (NumTel !== "") {
      if (Object.keys(PhoneNumFireBase).length === 0) {
        this.updateValue(`${Pseudo}/`, { PhoneNum: NumTel });
      } else if (NumTel !== PhoneNumFireBase) {
        window.localStorage.removeItem("Pseudo");
        this.logOut(true);
      }
    }
  };

  logOut = (refresh = false) => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        this.setState({
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
          PalmaresModal: false,
          ShowModalVerification: false,
          palmares: null,
          SwitchMyAnim: true,
          animToDetails: [],
          NextAnimToDelete: null,
          SearchInAnimeList: [false, null],
          RefreshRandomizeAnime: true,
          RefreshRandomizeAnime2: true,
          MyAnimListSaved: null,
          MyNextAnimListSaved: null,
          ModeFindAnime: [false, null],
        });
        if (refresh) {
          window.location.reload();
        }
      })
      .catch((err) => console.error(err));
  };

  SearchAnimInList = (event) => {
    event.preventDefault();
    const {
        SearchInAnimeList,
        titleSearchAnime,
        serieFirebase,
        filmFireBase,
        NextAnimFireBase,
      } = this.state,
      self = this;
    if (
      SearchInAnimeList[0] !== undefined &&
      titleSearchAnime &&
      typeof titleSearchAnime === "string" &&
      titleSearchAnime.trim().length !== 0 &&
      titleSearchAnime !== ""
    ) {
      let index = [];
      if (SearchInAnimeList[1]) {
        // Anime
        Object.values(serieFirebase)
          .concat(Object.values(filmFireBase))
          .filter((anime, i) => {
            if (
              anime.name.toLowerCase() === titleSearchAnime.toLowerCase() ||
              anime.name.toLowerCase().includes(titleSearchAnime.toLowerCase())
            )
              index = [...index, i];
            return null;
          });
        next(
          index.map(
            (In) =>
              Object.keys(serieFirebase).concat(Object.keys(filmFireBase))[In]
          )
        );
      } else {
        // NextAnime
        Object.values(NextAnimFireBase).filter((NextAnime, i) => {
          if (
            NextAnime.name.toLowerCase() === titleSearchAnime.toLowerCase() ||
            NextAnime.name
              .toLowerCase()
              .includes(titleSearchAnime.toLowerCase())
          )
            index = [...index, i];
          return null;
        });
        next(index.map((In) => Object.keys(NextAnimFireBase)[In]));
      }

      function next(key) {
        key.length === 0
          ? self.setState({
              ResText: `Aucun anime trouvé pour: ${titleSearchAnime}`,
              typeAlert: "danger",
            })
          : self.setState({ ModeFindAnime: [true, key] });
        self.cancelModal();
      }
    } else {
      this.cancelModal();
    }
  };

  addAnime = (event) => {
    event.preventDefault();
    const {
      title,
      nbEP,
      type,
      durer,
      imageUrl,
      NextAnimToDelete,
      filmFireBase,
      serieFirebase,
    } = this.state;
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
      self.setState({ ModeFindAnime: [false, null] });
      let IsGood = false,
        IsGoodForPost = true;
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

          Object.keys(serieFirebase).forEach((key) => {
            if (serieFirebase[key].name.toLowerCase() === title.toLowerCase()) {
              IsGoodForPost = false;
            }
          });

          if (IsGoodForPost) {
            self.addValue(`${self.state.Pseudo}/serie`, {
              ...self.state.serieFirebase,
              [`serie-${Date.now()}`]: {
                name: title,
                imageUrl: imgUrl,
                finishedAnim: false,
                AnimEP: AnimSEP,
              },
            });
            // reset
            reset();
          } else {
            self.setState({
              ResText: `Vous avez déjà ajouter ${title} dans votre liste d'anime`,
              typeAlert: "warning",
            });
            self.cancelModal();
            setTimeout(() => {
              // reset
              reset();
            }, 4000);
          }
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

          Object.keys(filmFireBase).forEach((key) => {
            if (filmFireBase[key].name.toLowerCase() === title.toLowerCase()) {
              IsGoodForPost = false;
            }
          });

          if (IsGoodForPost) {
            self.addValue(`${self.state.Pseudo}/film`, {
              ...self.state.filmFireBase,
              [`film-${Date.now()}`]: {
                name: title,
                durer,
                imageUrl: imgUrl,
                finished: false,
              },
            });
            // Reset
            reset();
          } else {
            self.setState({
              ResText: `Vous avez déjà ajouter ${title} dans votre liste d'anime`,
              typeAlert: "warning",
            });
            self.cancelModal();
            setTimeout(() => {
              // reset
              reset();
            }, 4000);
          }
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
        self.deleteValue(`${self.state.Pseudo}/NextAnim/${NextAnimToDelete}`);
        self.setState({
          NextAnimToDelete: null,
        });
      }

      function reset() {
        // Reset
        self.setState({
          findAnim: [],
          ShowModalSearch: false,
          ShowModalAddAnim: false,
          ShowModalAddFilm: false,
          ShowModalType: false,
          PalmaresModal: false,
          ShowModalVerification: false,
          palmares: null,
          SearchInAnimeList: [false, self.state.SearchInAnimeList[1]],
          animToDetails: [],
          // Form
          titleSearchAnime: "",
          DeletePathVerif: null,
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
      }
    }

    this.setState({
      ShowModalAddAnim: false,
      ShowModalAddFilm: false,
    });
  };

  DeleteAnimVerification = (path) => {
    this.setState({ ShowModalVerification: true, DeletePathVerif: path });
  };

  notifyMe = () => {
    const self = this;
    if (window.Notification) {
      if (
        Notification.permission === "granted" &&
        this.state.NotifState !== false &&
        this.state.NotifState !== null &&
        this.state.NotifState !== undefined
      ) {
        self.doNotif();
      } else if (Notification.permission !== "granted") {
        Notification.requestPermission()
          .then(function (p) {
            if (p === "granted") {
              self.doNotif();
            } else {
              console.log("User blocked notifications succefuly.");
            }
          })
          .catch(function (err) {
            console.error(err);
          });
      } else {
        console.error("Aucune notification pour ce compte");
      }
    }
  };

  doNotif = async () => {
    try {
      const NotifFirebase = await base.fetch(`${this.state.Pseudo}/Notif`, {
          context: this,
        }),
        TimeNow = new Date().getHours() * 3600 + new Date().getMinutes() * 60;

      Object.keys(NotifFirebase).forEach((notifKey) => {
        if (
          new Date().getDay().toString() === NotifFirebase[notifKey].day &&
          TimeNow >= NotifFirebase[notifKey].time &&
          !NotifFirebase[notifKey].called &&
          !NotifFirebase[notifKey].paused
        ) {
          navigator.serviceWorker
            .getRegistration()
            .then((reg) => {
              reg.showNotification(
                `Sortie Anime: ${NotifFirebase[notifKey].name} !`,
                {
                  body: `Nouvel Episode de ${NotifFirebase[notifKey].name}, ne le rate pas !`,
                  icon: "https://myanimchecker.netlify.app/favicon.ico",
                  vibrate: [100, 50, 100],
                  data: {
                    // eslint-disable-next-line no-restricted-globals
                    url: self.location.origin,
                    dateOfArrival: Date.now(),
                    primaryKey: 1,
                  },
                }
              );
            })
            .catch(() => {
              new Notification(
                `Sortie Anime: ${NotifFirebase[notifKey].name} !`,
                {
                  body: `Nouvel Episode de ${NotifFirebase[notifKey].name}, ne le rate pas !`,
                  icon: "https://myanimchecker.netlify.app/favicon.ico",
                }
              );
            });

          base.update(`${this.state.Pseudo}/Notif/${notifKey}`, {
            data: { called: true },
          });
        } else if (
          new Date().getDay().toString() !== NotifFirebase[notifKey].day &&
          NotifFirebase[notifKey].called
        ) {
          base.update(`${this.state.Pseudo}/Notif/${notifKey}`, {
            data: { called: false },
          });
        }
      });
    } catch (err) {
      this.AllowVpn(true, this.doNotif);
      console.error(err);
    }
  };

  newNextAnim = (event) => {
    event.preventDefault();

    const { NextAnim, NextAnimFireBase } = this.state;
    let IsGoodForPost = true;

    if (
      NextAnim !== undefined &&
      NextAnim !== null &&
      typeof NextAnim === "string" &&
      NextAnim.trim().length !== 0 &&
      NextAnim !== ""
    ) {
      this.setState({ ModeFindAnime: [false, null] });

      Object.keys(NextAnimFireBase).forEach((key) => {
        if (
          NextAnimFireBase[key].name.toLowerCase() === NextAnim.toLowerCase()
        ) {
          IsGoodForPost = false;
        }
      });

      if (IsGoodForPost) {
        this.addValue(`${this.state.Pseudo}/NextAnim`, {
          ...this.state.NextAnimFireBase,
          [`NextAnim${Date.now()}`]: {
            name: NextAnim,
          },
        });
      } else {
        this.setState({
          ResText: `Vous avez déjà ajouter ${NextAnim} dans votre liste d'anime`,
          typeAlert: "warning",
        });
        this.cancelModal();
        setTimeout(() => {
          this.setState({
            ResText: null,
            typeAlert: null,
          });
        }, 4000);
      }

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

  findPalmares = () => {
    const CopyState = { ...this.state };
    const DurerTotal = Object.values(CopyState.filmFireBase).reduce(
      (acc, currentVal) => acc + currentVal.durer,
      0
    );
    const FinishedTotalSerie = Object.values(CopyState.serieFirebase).reduce(
      (acc, currentVal) => {
        const add = currentVal.finishedAnim ? 1 : 0;
        return acc + add;
      },
      0
    );
    const FinishedTotalFilm = Object.values(CopyState.filmFireBase).reduce(
      (acc, currentVal) => {
        const add = currentVal.finished ? 1 : 0;
        return acc + add;
      },
      0
    );
    const AllegedTotal = Object.values(CopyState.serieFirebase).reduce(
      (acc, currentVal) => {
        const add = currentVal.AnimEP ? 0 : 1;
        return acc + add;
      },
      0
    );

    return {
      nbNextAnime: Object.keys(CopyState.NextAnimFireBase).length,
      nbFilm: Object.keys(CopyState.filmFireBase).length,
      nbSeries: Object.keys(CopyState.serieFirebase).length,
      durerFilm: (
        parseFloat("0." + (DurerTotal / 60).toString().split(".")[1]) * 0.6 +
        parseInt((DurerTotal / 60).toString().split(".")[0])
      ).toString(),
      EnCours:
        Object.keys(CopyState.serieFirebase).length -
        FinishedTotalSerie +
        (Object.keys(CopyState.filmFireBase).length - FinishedTotalFilm),
      Finished: FinishedTotalSerie + FinishedTotalFilm,
      alleged: [
        AllegedTotal,
        parseInt((AllegedTotal / FinishedTotalSerie) * 100),
      ],
    };
  };

  StartSpeechRecognition = () => {
    const { SecondMessage } = this.state;
    try {
      const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognition.start();

      recognition.onstart = () => {
        this.setState({
          MicOn: true,
          ShowMessage: true,
          ShowMessageHtml: true,
          ResText: "Le micro est bien allumé, vous pouvez parlez !",
        });

        setTimeout(() => {
          if (SecondMessage) {
            this.setState({ SecondMessage: false });
            return;
          }
          this.setState({ ShowMessage: false });

          setTimeout(() => {
            this.setState({ ShowMessageHtml: false, ResText: null });
          }, 900);
        }, 3600);
      };

      recognition.onend = () => {
        this.setState({
          SecondMessage: true,
          MicOn: false,
          ShowMessage: true,
          ShowMessageHtml: true,
          ResText: "Le micro est maintenant éteint",
        });
        setTimeout(() => {
          this.setState({ ShowMessage: false });

          setTimeout(() => {
            this.setState({ ShowMessageHtml: false, ResText: null });
          }, 900);
        }, 3600);
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;

        const transcript = event.results[current][0].transcript;
        this.setState({ titleSearchAnime: transcript });
      };
    } catch (e) {
      this.setState({
        ShowMessage: true,
        ShowMessageHtml: true,
        ResText:
          "Une erreur est survenue lors du traitement de votre requête. Il semblerait que votre naviguateur ne puisse pas ou veut pas démarrez cette fonction (veuillez verifier la version de votre navigateur ainsi que sa mordernité ou tout simplement les autorisations pour ce site).",
      });

      setTimeout(() => {
        this.setState({ ShowMessage: false });

        setTimeout(() => {
          this.setState({ ShowMessageHtml: false, ResText: null });
        }, 900);
      }, 7000);
      console.error(e);
    }
  };

  cancelModal = () => {
    this.setState({
      ShowModalSearch: false,
      ShowModalAddAnim: false,
      ShowModalAddFilm: false,
      ShowModalType: false,
      PalmaresModal: false,
      ShowModalVerification: false,
      palmares: null,
      SearchInAnimeList: [false, this.state.SearchInAnimeList[1]],
      NextAnimToDelete: null,
      titleSearchAnime: "",
      DeletePathVerif: null,
      title: "",
      type: "serie",
      durer: 110,
      nbEP: "",
      imageUrl: null,
    });
  };

  durerStrToIntMin = (str) => {
    const hour = parseInt(str.split(" ")[0]),
      minute = parseInt(str.split(" ")[2]);

    return hour * 60 + minute;
  };

  shuffleArray = (array) => {
    return array.sort(() => {
      return Math.random() - 0.5;
    });
  };

  render() {
    const {
      Pseudo,
      filmFireBase,
      serieFirebase,
      NextAnimFireBase,
      uid,
      proprio,
      AuthenticateMethod,
      AllowUseReAuth,
      RedirectPage,
      ShowModalSearch,
      findAnim,
      animToDetails,
      ShowModalAddAnim,
      title,
      ResText,
      DeletePathVerif,
      typeAlert,
      type,
      ModeFilter,
      ShowModalAddFilm,
      PalmaresModal,
      ShowModalVerification,
      ShowModalType,
      MicOn,
      ShowMessage,
      ShowMessageHtml,
      durer,
      FirstQuerie,
      SwitchMyAnim,
      NextAnim,
      CodeNumber,
      JustDefined,
      nbEP,
      SearchInAnimeList,
      RefreshRandomizeAnime,
      RefreshRandomizeAnime2,
      MyAnimListSaved,
      MyNextAnimListSaved,
      titleSearchAnime,
      ModeFindAnime,
      palmares,
    } = this.state;

    if (RedirectPage !== null) {
      const RedirectSave = RedirectPage;
      this.setState({ RedirectPage: null });
      return <Redirect to={RedirectSave} />;
    }

    if (!Pseudo || typeof Pseudo !== "string") {
      return (
        <PseudoCO
          Submit={(PseudoArgs) => {
            this.setState({ Pseudo: PseudoArgs, JustDefined: true });
            window.localStorage.setItem("Pseudo", JSON.stringify(PseudoArgs));
          }}
        />
      );
    }

    if (!AuthenticateMethod && AllowUseReAuth) {
      this.reAuth();
    }

    if (!uid) {
      return (
        <Login
          verificateCode={this.verificateCode}
          SubmitLogin={(NumTel) => {
            this.setState({ NumTel }, () => this.authenticate());
          }}
          forForm={CodeNumber.concat([
            (event) =>
              this.setState({
                CodeNumber: [event.target.value, CodeNumber[1]],
              }),
          ])}
          JustDefined={JustDefined}
          ShowMessage={ShowMessage}
          ShowMessageHtml={ShowMessageHtml}
          ResText={ResText}
          resetVpn={() => {
            this.setState({
              ShowMessage: true,
              ShowMessageHtml: true,
              ResText:
                "Le système est actuellement entrain de régler le problème, vueillez patientez... (attente de 0s à 1-2min)",
            });
            this.AllowVpn(false);
            setTimeout(() => {
              this.setState({ ShowMessage: false });

              setTimeout(() => {
                this.setState({ ShowMessageHtml: false, ResText: null });
              }, 900);
            }, 7000);
          }}
          resetPseudo={() => {
            window.localStorage.removeItem("Pseudo");
            this.setState({ Pseudo: null });
          }}
        />
      );
    }

    if (uid !== proprio) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p>Ce n'est pas votre compte, veuillez vous déconnecter.</p>
          <Button
            variant="outline-warning"
            onClick={() => {
              window.localStorage.removeItem("Pseudo");
              this.logOut();
            }}
          >
            <span className="fas fa-sign-out-alt"></span> Se Déconnecter
          </Button>
        </div>
      );
    }

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
          inMyAnim={false}
          clicked={this.handleClick}
        />
      ));
    }

    if (
      (Object.keys(filmFireBase).length !== 0 ||
        Object.keys(serieFirebase).length !== 0) &&
      SwitchMyAnim &&
      RefreshRandomizeAnime
    ) {
      this.setState({
        RefreshRandomizeAnime: false,
        MyAnimListSaved: this.shuffleArray(
          Object.keys(serieFirebase)
            .map((key) => (
              <Poster
                key={key}
                id={key}
                Pseudo={Pseudo}
                Paused={
                  serieFirebase[key].Paused ? serieFirebase[key].Paused : false
                }
                isFav={serieFirebase[key].Fav ? serieFirebase[key].Fav : false}
                fnFav={(id, FavVal) => {
                  this.updateValue(`${Pseudo}/serie/${id}`, {
                    Fav: FavVal,
                  });
                }}
                UnPaused={(id) => {
                  this.updateValue(`${Pseudo}/serie/${id}`, {
                    Paused: false,
                  });
                  this.setState({ RedirectPage: `/Watch/${Pseudo}/${id}` });
                }}
                AnimeSeason={
                  serieFirebase[key].AnimeSeason
                    ? serieFirebase[key].AnimeSeason
                    : false
                }
                ModeFilter={ModeFilter}
                url={serieFirebase[key].imageUrl}
                title={serieFirebase[key].name}
                isFinished={serieFirebase[key].finishedAnim}
                Rate={serieFirebase[key].Rate}
                deleteAnim={this.DeleteAnimVerification}
                isAlleged={!serieFirebase[key].AnimEP ? true : false}
                inMyAnim={true}
              />
            ))
            .concat(
              Object.keys(filmFireBase).map((key) => (
                <Poster
                  key={key}
                  id={key}
                  Pseudo={Pseudo}
                  Paused={false}
                  fnFav={(id, FavVal) => {
                    this.updateValue(`${Pseudo}/film/${id}`, {
                      Fav: FavVal,
                    });
                  }}
                  AnimeSeason={false}
                  ModeFilter={ModeFilter}
                  url={filmFireBase[key].imageUrl}
                  title={filmFireBase[key].name}
                  isFav={filmFireBase[key].Fav ? filmFireBase[key].Fav : false}
                  isFinished={filmFireBase[key].finished}
                  Rate={filmFireBase[key].Rate}
                  deleteAnim={this.DeleteAnimVerification}
                  isAlleged={false}
                  inMyAnim={true}
                />
              ))
            )
        ),
      });
    } else if (
      !SwitchMyAnim &&
      Object.keys(NextAnimFireBase).length !== 0 &&
      NextAnimFireBase !== undefined &&
      RefreshRandomizeAnime2
    ) {
      this.setState({
        RefreshRandomizeAnime2: false,
        MyNextAnimListSaved: this.shuffleArray(
          Object.keys(NextAnimFireBase).map((key) => (
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
          ))
        ),
      });
    } else if (
      Object.keys(filmFireBase).length === 0 &&
      Object.keys(serieFirebase).length === 0 &&
      Object.keys(NextAnimFireBase).length === 0 &&
      Pseudo &&
      FirstQuerie
    ) {
      this.refreshValueFirebase();
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
              durer:
                animToDetails[1].type === "Movie"
                  ? this.durerStrToIntMin(animToDetails[1].duration)
                  : 110,
              nbEP:
                animToDetails[1].type === "Movie"
                  ? ""
                  : animToDetails[0].episodes.length.toString(),
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
              Pseudo,
              search: this.SearchAnim,
              logOut: this.logOut,
              addToHome: this.AddToHome,
              openPalmares: () =>
                this.setState({
                  PalmaresModal: true,
                  palmares: this.findPalmares(),
                }),
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
              ModeFindAnime={ModeFindAnime[0]}
              ModeFilter={ModeFilter}
              NewFilter={(filter) => {
                this.setState({
                  ModeFilter: filter,
                  SwitchMyAnim: true,
                  RefreshRandomizeAnime: true,
                });
              }}
              MyAnimList={
                ModeFindAnime[0] && SearchInAnimeList[1]
                  ? ModeFindAnime[1].map((key) => (
                      <Poster
                        key={key}
                        id={key}
                        Pseudo={Pseudo}
                        url={
                          { ...serieFirebase, ...filmFireBase }[key].imageUrl
                        }
                        title={{ ...serieFirebase, ...filmFireBase }[key].name}
                        isFinished={
                          { ...serieFirebase, ...filmFireBase }[key]
                            .finishedAnim
                        }
                        AnimeSeason={
                          serieFirebase[key] !== undefined
                            ? serieFirebase[key].AnimeSeason !== undefined
                              ? serieFirebase[key].AnimeSeason
                              : false
                            : false
                        }
                        Rate={{ ...serieFirebase, ...filmFireBase }[key].Rate}
                        deleteAnim={this.DeleteAnimVerification}
                        Paused={
                          serieFirebase[key] !== undefined
                            ? serieFirebase[key].Paused !== undefined
                              ? serieFirebase[key].Paused
                              : false
                            : false
                        }
                        isFav={
                          { ...serieFirebase, ...filmFireBase }[key].Fav
                            ? { ...serieFirebase, ...filmFireBase }[key].Fav
                            : false
                        }
                        fnFav={(id, FavVal) => {
                          this.updateValue(
                            `${Pseudo}/${id.split("-")[0]}/${id}`,
                            {
                              Fav: FavVal,
                            }
                          );
                        }}
                        UnPaused={(id) => {
                          this.updateValue(`${Pseudo}/serie/${id}`, {
                            Paused: false,
                          });
                          this.setState({
                            RedirectPage: `/Watch/${Pseudo}/${id}`,
                          });
                        }}
                        ModeFilter={ModeFilter}
                        isAlleged={
                          { ...serieFirebase, ...filmFireBase }[key].AnimEP ===
                            undefined &&
                          { ...serieFirebase, ...filmFireBase }[key].durer ===
                            undefined
                            ? true
                            : { ...serieFirebase, ...filmFireBase }[key]
                                .durer !== undefined
                            ? false
                            : !{ ...serieFirebase, ...filmFireBase }[key].AnimEP
                            ? true
                            : false
                        }
                        inMyAnim={true}
                      />
                    ))
                  : MyAnimListSaved || "Vous avez aucun anime :/\nRajoutez-en !"
              }
              MyNextAnimList={
                ModeFindAnime[0] && !SearchInAnimeList[1]
                  ? ModeFindAnime[1].map((key) => (
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
                    ))
                  : MyNextAnimListSaved ||
                    "Vous avez mis aucun anime comme souhait dans cette section\nRajoutez-en"
              }
              CloseModeFindAnime={() =>
                this.setState({
                  SearchInAnimeList: [false, null],
                  ModeFindAnime: [false, null],
                })
              }
              handleSubmit={this.newNextAnim}
              SearchInAnimeListFn={(type) =>
                this.setState({ SearchInAnimeList: [true, type] })
              }
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

          <Modal
            show={ShowModalVerification}
            size="lg"
            onHide={this.cancelModal}
          >
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title
                style={{
                  color: "#dc3545",
                }}
              >
                Êtes-vous sûre de vouloir supprimer{" "}
                {DeletePathVerif !== null && ShowModalVerification
                  ? filmFireBase[DeletePathVerif.split("/")[2]] !== undefined
                    ? filmFireBase[DeletePathVerif.split("/")[2]].name
                    : serieFirebase[DeletePathVerif.split("/")[2]].name
                  : null}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              En faisant ça cette anime sera entièrement supprimer avec aucune
              possiblité de le récupérer, en gros il n'existera plus.
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={() => this.deleteValue(DeletePathVerif)}
              >
                Supprimer
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={PalmaresModal} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>
                <span
                  className="fas fa-trophy"
                  style={{ color: "gold" }}
                ></span>{" "}
                Palmarès de tes animes
              </Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              {palmares ? (
                <ul id="palamaresUl">
                  <li>
                    <span className="palma">Animes en cours:</span>{" "}
                    {palmares.EnCours}
                  </li>
                  <li>
                    <span className="palma">Animes finis:</span>{" "}
                    {palmares.Finished}
                  </li>
                  <li>
                    <span className="palma">Nombres Anime Allégé:</span>{" "}
                    {palmares.alleged[0]} ={">"}{" "}
                    {palmares.alleged[1] <= 25
                      ? `Il y a que ${palmares.alleged[1]}% de tous tes animes fini qui sont allégé, c'est pas sympa pour la planète (en allegant tu libère de la place sur le serveur faisant consommer moins d'énergie: 1 serie sur le serveur pendant 1H = 1 amploue allumée 24H) vise les 50%!`
                      : palmares.alleged[1] <= 50 && palmares.alleged[1] > 25
                      ? `Il y a ${palmares.alleged[1]}% de tous tes animes fini qui sont allégé, ils faut encore plus les allégé pour économisé plus de place sur le serveur ce qui le fera moins consommer d'énergie (1 serie sur le serveur pendant 1H = 1 amploue allumée 24H)`
                      : palmares.alleged[1] <= 75 && palmares.alleged[1] > 50
                      ? `Il y a ${palmares.alleged[1]}% de tous tes animes fini qui sont allégé, c'est bien malgré que tu pourrais encore plus en allégé (1 serie sur le serveur pendant 1H = 1 amploue allumée 24H)`
                      : palmares.alleged[1] < 100 && palmares.alleged[1] > 75
                      ? `Il y a ${palmares.alleged[1]}% de tous tes animes fini qui sont allégé, c'est très bien malgré que tu pourrais encore plus en allégé (1 serie sur le serveur pendant 1H = 1 amploue allumée 24H)`
                      : `Il y a ${palmares.alleged[1]}% de tous tes animes fini qui sont allégé, Merci enormémant pour les avoir tous allégé continue comme ça ! (1 serie sur le serveur pendant 1H = 1 amploue allumée 24H)`}
                  </li>
                  <li>
                    <span className="palma">
                      Durée Total de tous tes films:
                    </span>{" "}
                    {`${palmares.durerFilm.split(".")[0]}H ${
                      palmares.durerFilm.split(".")[1]
                    }Min`}
                  </li>
                  <li>
                    <span className="palma">Nombre Total Film:</span>{" "}
                    {palmares.nbFilm}
                  </li>
                  <li>
                    <span className="palma">Nombre Total Series:</span>{" "}
                    {palmares.nbSeries}
                  </li>
                  <li>
                    <span className="palma">
                      Nombre Total de tes prochains anime:
                    </span>{" "}
                    {palmares.nbNextAnime}
                  </li>
                  <li>
                    <span className="palma">Nombre Total d'anime:</span>{" "}
                    {palmares.nbFilm + palmares.nbSeries}
                  </li>
                  <li>
                    <span className="palma">
                      Nombre Total d'element stocké:
                    </span>{" "}
                    {palmares.nbFilm + palmares.nbSeries + palmares.nbNextAnime}
                  </li>
                </ul>
              ) : null}
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                Annuler
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={SearchInAnimeList[0]} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Chercher un Animé</Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              <Form onSubmit={this.SearchAnimInList}>
                <Form.Group id="searchInAnimeList">
                  <Form.Label>Nom de l'animé:</Form.Label>
                  <Form.Control
                    type="text"
                    id="searchInAnimeListInput"
                    placeholder="Titre de l'anime à rechercher"
                    autoComplete="off"
                    value={titleSearchAnime}
                    onChange={(event) =>
                      this.setState({
                        titleSearchAnime: event.target.value,
                      })
                    }
                  />
                  <div
                    id="SearchFormBtnVoice"
                    onClick={this.StartSpeechRecognition}
                  >
                    <span
                      className={
                        MicOn ? "fas fa-microphone" : "fas fa-microphone-slash"
                      }
                    ></span>
                  </div>
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                Annuler
              </Button>
              <Button variant="info" onClick={this.SearchAnimInList}>
                <span className="fas fa-search"></span> Chercher
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={ShowModalType} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Type d'anime</Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  this.setState({ ShowModalType: false });
                  this.openNext();
                }}
              >
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
                    placeholder="Titre de la série"
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
                    Nombre d'épisode (séparé d'un "," pour changer de saison pas
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
                    placeholder="Titre du film"
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
          {ShowMessageHtml ? (
            <div className={`ackmessage${ShowMessage ? " show" : " hide"}`}>
              <span className="fas fa-info"></span> {ResText}
            </div>
          ) : null}
        </Fragment>
      );
  }
}

// Modules
import React, { Component, Fragment } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import { openDB } from "idb";
import ObjectPath from "object-path";
import ReactStars from "react-rating-stars-component";
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
import { Modal, Button, Form, Dropdown } from "react-bootstrap";
// DB
import base, { firebaseApp, messaging } from "./db/base";
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
    ParamsOptn: null,
    FirstQuerie: false,
    AuthenticateMethod: false,
    AllowUseReAuth: false,
    uid: null,
    proprio: null,
    ReConnectionFirebase: false,
    // Bon fonctionnement de l'app
    OfflineMode: !JSON.parse(window.localStorage.getItem("OfflineMode"))
      ? false
      : JSON.parse(window.localStorage.getItem("OfflineMode")),
    UpdateDbFromIndexedDB: false,
    findAnim: [],
    JustDefined: false,
    RedirectPage: null,
    ShowModalSearch: false,
    IdToAddEp: null,
    InfoAnimeToChangeNote: null,
    ShowModalChangeNote: false,
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
    ModeDisplayNextAnim: !JSON.parse(
      window.localStorage.getItem("ModeDisplayNextAnim")
    )
      ? null
      : JSON.parse(window.localStorage.getItem("ModeDisplayNextAnim")),
    ModeFindAnime: [false, null],
    LoadingMode: [true, true],
    palmares: null,
    MicOn: false,
    addEPToAlleged: false,
    ShowMessage: false,
    ShowMessageHtml: false,
    SecondMessage: false,
    // Form
    title: "",
    type: "serie",
    Rate: 7.5,
    imageUrl: null,
    ModeCombinaisonSearch: "ET",
    durer: 110,
    nbEP: "",
    NextAnim: "",
    ImportanceNA: 0,
    ImportanceSearch: null,
    TagNA: "",
    TagSearchAnime: "",
    CodeNumber: ["", 1],
    titleSearchAnime: "",
    DeletePathVerif: null,
    // Alerts
    ResText: null,
    typeAlert: null,
    // A2HS
    AddToHomeScreen: null,
  };

  setIntervalVar = null;

  componentDidMount() {
    const self = this;
    // Offline Mode
    if (!JSON.parse(window.localStorage.getItem("OfflineMode")))
      window.localStorage.setItem("OfflineMode", JSON.stringify(false));
    else if (JSON.parse(window.localStorage.getItem("OfflineMode")) === true)
      this.OfflineMode();
    // Push Message
    messaging
      .getToken()
      .then((currentToken) => {
        if (currentToken) {
          window.localStorage.setItem(
            "PushNotifSub",
            JSON.stringify(currentToken)
          );
        } else {
          console.log(
            "No registration token available. Request permission to generate one."
          );
        }
      })
      .catch((err) => {
        console.error("An error occurred while retrieving token. ", err);
      });

    navigator.serviceWorker.addEventListener("message", (message) => {
      navigator.serviceWorker
        .getRegistration()
        .then((reg) => {
          reg.showNotification(
            message.data["firebase-messaging-msg-data"] === undefined
              ? message.data.notification.title.split(" ")[0] === "Sortie"
                ? message.data.notification.title
                : `Sortie Anime: ${message.data.notification.title} !`
              : message.data[
                  "firebase-messaging-msg-data"
                ].notification.title.split(" ")[0] === "Sortie"
              ? message.data["firebase-messaging-msg-data"].notification.title
              : `Sortie Anime: ${message.data["firebase-messaging-msg-data"].notification.title} !`,
            {
              body:
                message.data["firebase-messaging-msg-data"] === undefined
                  ? message.data.notification.body.split(" ")[0] === "Nouvel"
                    ? message.data.notification.body
                    : `Nouvel Épisode de ${message.data.notification.body}, ne le rate pas !`
                  : message.data[
                      "firebase-messaging-msg-data"
                    ].notification.body.split(" ")[0] === "Nouvel"
                  ? message.data["firebase-messaging-msg-data"].notification
                      .body
                  : `Nouvel Épisode de ${message.data["firebase-messaging-msg-data"].notification.body}, ne le rate pas !`,
              icon: "https://myanimchecker.netlify.app/Img/Icon.png",
              vibrate: [100, 50, 100],
            }
          );
        })
        .catch(() => {
          new Notification(
            message.data["firebase-messaging-msg-data"] === undefined
              ? message.data.notification.title.split(" ")[0] === "Sortie"
                ? message.data.notification.title
                : `Sortie Anime: ${message.data.notification.title} !`
              : message.data[
                  "firebase-messaging-msg-data"
                ].notification.title.split(" ")[0] === "Sortie"
              ? message.data["firebase-messaging-msg-data"].notification.title
              : `Sortie Anime: ${message.data["firebase-messaging-msg-data"].notification.title} !`,
            {
              body:
                message.data["firebase-messaging-msg-data"] === undefined
                  ? message.data.notification.body.split(" ")[0] === "Nouvel"
                    ? message.data.notification.body
                    : `Nouvel Épisode de ${message.data.notification.body}, ne le rate pas !`
                  : message.data[
                      "firebase-messaging-msg-data"
                    ].notification.body.split(" ")[0] === "Nouvel"
                  ? message.data["firebase-messaging-msg-data"].notification
                      .body
                  : `Nouvel Épisode de ${message.data["firebase-messaging-msg-data"].notification.body}, ne le rate pas !`,
              icon: "https://myanimchecker.netlify.app/Img/Icon.png",
            }
          );
        });
    });

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
        case "7":
          ResText =
            "Impossible d'accéder à cette page car vous avez drop (laisser tombé) cette anime. (Pour le reprendre aller sur l'anime depuis votre liste et clicker sur le bouton reprendre/play";
          typeAlert = "danger";
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
    this.AllowVpn();
  }

  OfflineMode = (forced) => {
    const self = this;
    if (forced === true) {
      next();
    } else {
      axios
        .get("https://tytoux-api.herokuapp.com/v1/site/Actu/AllActuSite")
        .then(() => {
          this.setState({
            ShowMessage: true,
            ShowMessageHtml: true,
            ResText: "Impossible d'activé le mode hors ligne",
          });
          setTimeout(() => {
            this.setState({ ShowMessage: false });

            setTimeout(() => {
              this.setState({ ShowMessageHtml: false, ResText: null });
            }, 900);
          }, 7000);
        })
        .catch(next);
    }

    async function next() {
      self.setState({
        ShowMessage: true,
        ShowMessageHtml: true,
        ResText: "Mode hors ligne activé",
      });

      if (self.setIntervalVar !== null) {
        clearInterval(self.setIntervalVar);
        self.setIntervalVar = null;
      }
      window.localStorage.setItem("OfflineMode", JSON.stringify(true));
      // Get Data IndexedDB
      self.fnDbOffline("GET", null, null, self.notifyMe);
      setTimeout(() => {
        self.setState({ ShowMessage: false });

        setTimeout(() => {
          self.setState({ ShowMessageHtml: false, ResText: null });
        }, 900);
      }, 6000);
    }
  };

  reAuth = () => {
    // Verified Internet
    axios
      .get("https://tytoux-api.herokuapp.com/v1/site/Actu/AllActuSite")
      .catch(() => this.OfflineMode(true));
    // reAuth
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.handleAuth({ user });
      }

      this.setState({ AuthenticateMethod: true, AllowUseReAuth: false });
    });
  };

  reconectFirebase = () => {
    let i = 0;
    this.setIntervalVar = setInterval(() => {
      console.log(i);
      if (i === 5) this.reAuth();
      if (i === 10) this.OfflineMode();
      // Allow Vpn
      window.localStorage.removeItem("firebase:previous_websocket_failure");
      i++;
    }, 1000);
  };

  AllowVpn = () => {
    // Allow Vpn
    let i = 0;
    this.setIntervalVar = setInterval(() => {
      if (i === 5) this.reAuth();
      if (i === 10) this.OfflineMode();
      if (this.state.uid === null && this.state.proprio === null) {
        // Allow Vpn
        window.localStorage.removeItem("firebase:previous_websocket_failure");
      } else {
        clearInterval(this.setIntervalVar);
        this.setIntervalVar = null;
      }
      i++;
    }, 1000);
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

  UpdateDbFromIndexeddb = async () => {
    const { Pseudo, UpdateDbFromIndexedDB } = this.state;

    if (UpdateDbFromIndexedDB) {
      // Get Data IndexedDB
      const db = await openDB("AckDb", 1);
      const Store = [
        db.transaction("serieFirebase").objectStore("serieFirebase"),
        db.transaction("filmFireBase").objectStore("filmFireBase"),
        db.transaction("NextAnimFireBase").objectStore("NextAnimFireBase"),
        db.transaction("ParamsOptn").objectStore("ParamsOptn"),
      ];

      const results = await Promise.all(
        Store.map(async (req) => await req.getAll())
      );

      [
        "serieFirebase",
        "filmFireBase",
        "NextAnimFireBase",
        "ParamsOptn",
      ].forEach((key, i) => {
        if (!results[i] || !results[i][0].data) return;
        this.updateValue(`${Pseudo}/${key}`, { [key]: results[i][0].data });
      });
    }
  };

  refreshValueFirebase = async (after = null, HomePage = null) => {
    try {
      const GlobalInfoUser = await base.fetch(`${this.state.Pseudo}`, {
        context: this,
      });

      this.setState(
        {
          ModeFindAnime: [false, null],
          RefreshRandomizeAnime: true,
          RefreshRandomizeAnime2: true,
          LoadingMode: [
            Object.keys(GlobalInfoUser.serie).length !== 0 ||
            Object.keys(GlobalInfoUser.film).length !== 0
              ? false
              : true,
            Object.keys(GlobalInfoUser.NextAnim).length !== 0 ? false : true,
          ],
          ModeFilter:
            HomePage !== null
              ? HomePage
              : GlobalInfoUser.ParamsOptn.TypeAnimeHomePage
              ? GlobalInfoUser.ParamsOptn.TypeAnimeHomePage
              : "NotFinished",
          FirstQuerie: true,
          NextAnimFireBase: GlobalInfoUser.NextAnim,
          serieFirebase: GlobalInfoUser.serie,
          filmFireBase: GlobalInfoUser.film,
          PhoneNumFireBase: GlobalInfoUser.PhoneNum,
          ParamsOptn: GlobalInfoUser.ParamsOptn,
        },
        after
      );
      if (!this.state.UpdateDbFromIndexedDB) {
        // Add Data To IndexedDB
        const db = await openDB("AckDb", 1);
        const Store = [
          db
            .transaction("serieFirebase", "readwrite")
            .objectStore("serieFirebase"),
          db
            .transaction("filmFireBase", "readwrite")
            .objectStore("filmFireBase"),
          db
            .transaction("NextAnimFireBase", "readwrite")
            .objectStore("NextAnimFireBase"),
          db
            .transaction("NotifFirebase", "readwrite")
            .objectStore("NotifFirebase"),
          db.transaction("ParamsOptn", "readwrite").objectStore("ParamsOptn"),
        ];
        Store.forEach(async (req) => {
          req.put({
            id: req.name,
            data:
              req.name === "serieFirebase"
                ? GlobalInfoUser.serie
                : req.name === "filmFireBase"
                ? GlobalInfoUser.film
                : req.name === "NextAnimFireBase"
                ? GlobalInfoUser.NextAnim
                : req.name === "NotifFirebase"
                ? GlobalInfoUser.Notif
                : GlobalInfoUser.ParamsOptn,
          });
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  fnDbOffline = async (type, path, value, next = null) => {
    const db = await openDB("AckDb", 1);
    if (type === "GET") {
      // Get Data IndexedDB
      const Store = [
        db.transaction("serieFirebase").objectStore("serieFirebase"),
        db.transaction("filmFireBase").objectStore("filmFireBase"),
        db.transaction("NextAnimFireBase").objectStore("NextAnimFireBase"),
        db.transaction("ParamsOptn").objectStore("ParamsOptn"),
      ];

      const results = await Promise.all(
        Store.map(async (req) => await req.getAll())
      );
      this.setState(
        {
          OfflineMode: true,
          serieFirebase: results[0] ? results[0][0].data : {},
          filmFireBase: results[1] ? results[1][0].data : {},
          NextAnimFireBase: results[2] ? results[2][0].data : {},
          ParamsOptn: results[3] ? results[3][0].data : {},
          LoadingMode: [
            results[0] && results[1]
              ? Object.keys(results[0][0].data).length !== 0 ||
                Object.keys(results[1][0].data).length !== 0
                ? false
                : true
              : true,
            results[2]
              ? Object.keys(results[2][0].data).length !== 0
                ? false
                : true
              : true,
          ],
          ModeFindAnime: [false, null],
          RefreshRandomizeAnime: true,
          RefreshRandomizeAnime2: true,
          ModeFilter: typeof next === "string" ? next : "NotFinished",
          FirstQuerie: true,
        },
        typeof next === "string" ? null : next
      );
    } else if (type === "POST") {
      const WayStr = path.split("/")[1];
      const WayIndex = WayStr === "serie" ? 0 : WayStr === "film" ? 1 : 2;
      const Store = [
        db
          .transaction("serieFirebase", "readwrite")
          .objectStore("serieFirebase"),
        db.transaction("filmFireBase", "readwrite").objectStore("filmFireBase"),
        db
          .transaction("NextAnimFireBase", "readwrite")
          .objectStore("NextAnimFireBase"),
      ];
      Store[WayIndex].put({
        id: Store[WayIndex].name,
        data: value,
      })
        .then(() => {
          this.fnDbOffline("GET");
          this.setState({
            ResText: "Votre requête d'ajout a réussite.",
            typeAlert: "success",
          });
        })
        .catch(() =>
          this.setState({
            ResText: "Votre requête d'ajout à echoué.",
            typeAlert: "danger",
          })
        );
    } else if (type === "PUT") {
      const WayStr = path.split("/")[1];
      const WayIndex = WayStr === "serie" ? 0 : WayStr === "film" ? 1 : 2;
      const Store = [
        db
          .transaction("serieFirebase", "readwrite")
          .objectStore("serieFirebase"),
        db.transaction("filmFireBase", "readwrite").objectStore("filmFireBase"),
        db
          .transaction("NextAnimFireBase", "readwrite")
          .objectStore("NextAnimFireBase"),
      ];
      const CopyData = [...(await Store[WayIndex].getAll())][0].data;
      let NewPath = path.split("/");
      NewPath.shift();
      NewPath.shift();
      NewPath = NewPath.join(".");
      const ObjToEdit = ObjectPath.get(CopyData, NewPath);
      Object.keys(value).forEach((key, i) => {
        if (Object.values(value)[i] === null) {
          ObjectPath.del(CopyData, `${NewPath}.${key}`);
          return;
        }
        ObjToEdit[key] = Object.values(value)[i];
      });

      Store[WayIndex].put({
        id: Store[WayIndex].name,
        data: CopyData,
      })
        .then(() => this.fnDbOffline("GET", null, null, next))
        .catch(console.error);
    } else if (type === "DELETE") {
      const WayStr = path.split("/")[1];
      const WayIndex = WayStr === "serie" ? 0 : WayStr === "film" ? 1 : 2;
      const Store = [
        db
          .transaction("serieFirebase", "readwrite")
          .objectStore("serieFirebase"),
        db.transaction("filmFireBase", "readwrite").objectStore("filmFireBase"),
        db
          .transaction("NextAnimFireBase", "readwrite")
          .objectStore("NextAnimFireBase"),
      ];
      const CopyData = [...(await Store[WayIndex].getAll())][0].data;
      let NewPath = path.split("/");
      NewPath.shift();
      NewPath.shift();
      NewPath = NewPath.join(".");
      ObjectPath.del(CopyData, NewPath);
      Store[WayIndex].put({
        id: Store[WayIndex].name,
        data: CopyData,
      })
        .then(() => {
          this.cancelModal();
          this.fnDbOffline("GET", null, null, next);
          this.setState({
            ResText: "Votre requête de suppression a réussite.",
            typeAlert: "success",
          });
        })
        .catch(() => {
          this.setState({
            ResText: "Votre requête de suppression a échoué.",
            typeAlert: "danger",
          });
        });
    }

    setTimeout(() => {
      this.setState({
        ResText: null,
        typeAlert: null,
      });
    }, 2500);
  };

  addValue = (path, value) => {
    const { OfflineMode } = this.state;
    if (OfflineMode === true) {
      this.fnDbOffline("POST", path, value);
      return;
    }

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
        this.OfflineMode();
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

  updateValue = (path, value, HomePage = null) => {
    const { OfflineMode } = this.state;
    if (OfflineMode === true) {
      this.fnDbOffline("PUT", path, value, HomePage !== null ? HomePage : null);
      return;
    }

    base
      .update(path, {
        data: value,
      })
      .then(
        HomePage !== null
          ? () => this.refreshValueFirebase(null, HomePage)
          : this.refreshValueFirebase
      )
      .catch((err) => {
        this.OfflineMode();
        console.error(err);
      });
  };

  deleteValue = async (path) => {
    const { OfflineMode } = this.state;
    if (OfflineMode === true) {
      this.fnDbOffline("DELETE", path);
      return;
    }

    base
      .remove(path)
      .then(() => {
        this.cancelModal();
        this.refreshValueFirebase();
        this.setState({
          ResText: "Votre requête de suppression a réussite.",
          typeAlert: "success",
        });
      })
      .catch((err) => {
        console.error(err);
        this.OfflineMode();
        this.cancelModal();
        this.setState({
          ResText: "Votre requête de suppression a échoué.",
          typeAlert: "danger",
        });
      });
    setTimeout(() => {
      this.setState({
        ResText: null,
        typeAlert: null,
      });
    }, 2000);
  };

  handleAuth = async (authData) => {
    // Allow Vpn
    window.localStorage.removeItem("firebase:previous_websocket_failure");
    // Connection
    const box = await base.fetch(this.state.Pseudo, { context: this });
    const connectedRef = firebase.database().ref(".info/connected");

    if (!box.proprio) {
      await base.post(`${this.state.Pseudo}/proprio`, {
        data: authData.user.uid,
      });
    }

    // Verified listener Conn
    connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        // Verified if OfflineMode In an another session
        if (this.state.OfflineMode === true) {
          this.setState({ UpdateDbFromIndexedDB: true });
          this.UpdateDbFromIndexeddb();
        }
        // Fast Loading Anime before FnRefresh
        this.fnDbOffline("GET");
        // Disable OfflineMode
        window.localStorage.setItem("OfflineMode", JSON.stringify(false));
        this.setState({ OfflineMode: false });
        if (
          this.setIntervalVar !== null &&
          this.state.ReConnectionFirebase === true
        ) {
          clearInterval(this.setIntervalVar);
          this.setIntervalVar = null;
          this.setState({ ReConnectionFirebase: false });
          console.warn("Firebase Connexion (re)establish");
        }
      } else {
        this.reconectFirebase();
        this.setState({ ReConnectionFirebase: true });
        console.warn(
          "Firebase Connexion Disconnected\n\tReconnect to Firebase..."
        );
      }
    });

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

  verificateCode = (event) => {
    event.preventDefault();
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
          Pseudo: null,
          NumTel: "",
          NewLogin: false,
          NextAnimFireBase: {},
          filmFireBase: {},
          serieFirebase: {},
          PhoneNumFireBase: null,
          ParamsOptn: null,
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
          IdToAddEp: null,
          InfoAnimeToChangeNote: null,
          ShowModalChangeNote: false,
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
          ModeDisplayNextAnim: "Block",
          ModeFindAnime: [false, null],
          LoadingMode: [true, true],
          palmares: null,
          MicOn: false,
          addEPToAlleged: false,
          ShowMessage: false,
          ShowMessageHtml: false,
          SecondMessage: false,
          // Form
          title: "",
          type: "serie",
          Rate: 7.5,
          imageUrl: null,
          durer: 110,
          nbEP: "",
          ImportanceNA: 0,
          ImportanceSearch: null,
          TagNA: "",
          TagSearchAnime: "",
          NextAnim: "",
          CodeNumber: ["", 1],
          titleSearchAnime: "",
          DeletePathVerif: null,
          // Alerts
          ResText: null,
          typeAlert: null,
          // A2HS
          AddToHomeScreen: null,
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
        ImportanceSearch,
        TagSearchAnime,
        ModeCombinaisonSearch,
      } = this.state,
      self = this;

    let index = [],
      GoodModeET = 0,
      Mode = 1;

    if (
      typeof titleSearchAnime === "string" &&
      titleSearchAnime.trim().length !== 0
    )
      GoodModeET++;
    if (
      typeof TagSearchAnime === "string" &&
      TagSearchAnime.trim().length !== 0
    )
      GoodModeET++;
    if (ImportanceSearch !== null) GoodModeET++;

    if (
      SearchInAnimeList[1] &&
      typeof titleSearchAnime === "string" &&
      titleSearchAnime.trim().length !== 0
    ) {
      // My Anime
      Mode = 1;
      Object.values(serieFirebase)
        .concat(Object.values(filmFireBase))
        .forEach((anime, i) => {
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
    } else if (ModeCombinaisonSearch === "OU" || GoodModeET === 1) {
      let GlobalSearchArr = [];
      if (
        !SearchInAnimeList[1] &&
        typeof titleSearchAnime === "string" &&
        titleSearchAnime.trim().length !== 0
      ) {
        // NextAnime By Title
        Mode = 1;
        Object.values(NextAnimFireBase).forEach((NA, i) => {
          if (
            NA.name.toLowerCase() === titleSearchAnime.toLowerCase() ||
            NA.name.toLowerCase().includes(titleSearchAnime.toLowerCase())
          )
            index = [...index, i];
          return null;
        });
        GlobalSearchArr = [
          ...GlobalSearchArr,
          ...index.map((In) => Object.keys(NextAnimFireBase)[In]),
        ];
        index = [];
      }
      if (
        !SearchInAnimeList[1] &&
        typeof TagSearchAnime === "string" &&
        TagSearchAnime.trim().length !== 0
      ) {
        // NextAnime By Tag
        Mode = 2;
        const TagArr = TagSearchAnime.split(",");
        Object.values(NextAnimFireBase).forEach((NA, i) => {
          TagArr.forEach((Tag) => {
            if (NA.Badges)
              NA.Badges.forEach((Bdg) => {
                if (
                  Tag.toLowerCase() === Bdg.toLowerCase() ||
                  Bdg.toLowerCase().includes(Tag.toLowerCase())
                )
                  index = [...index, i];
              });
          });
          return null;
        });
        GlobalSearchArr = [
          ...GlobalSearchArr,
          ...index.map((In) => Object.keys(NextAnimFireBase)[In]),
        ];
        index = [];
      }
      if (!SearchInAnimeList[1] && ImportanceSearch !== null) {
        // NextAnime By Importance
        Mode = 3;
        Object.values(NextAnimFireBase).forEach((NA, i) => {
          if (
            NA.Importance === ImportanceSearch ||
            (ImportanceSearch === 0 && !NA.Importance)
          )
            index = [...index, i];
          return null;
        });
        GlobalSearchArr = [
          ...GlobalSearchArr,
          ...index.map((In) => Object.keys(NextAnimFireBase)[In]),
        ];
        index = [];
      }

      // Anti doublons
      GlobalSearchArr.forEach((SearchedAnim) => {
        let DoublonsIndex = null;
        let HowManyTimes = 0;
        GlobalSearchArr.forEach((Anim) => {
          if (SearchedAnim === Anim) {
            HowManyTimes++;
            if (HowManyTimes > 1) {
              DoublonsIndex = GlobalSearchArr.indexOf(SearchedAnim);
            }
          }
        });
        if (DoublonsIndex !== null) GlobalSearchArr.splice(DoublonsIndex, 1);
      });

      // Send
      next(GlobalSearchArr);
    } else {
      if (
        typeof titleSearchAnime === "string" &&
        titleSearchAnime.trim().length !== 0 &&
        typeof TagSearchAnime === "string" &&
        TagSearchAnime.trim().length !== 0 &&
        ImportanceSearch !== null
      ) {
        const TagArr = TagSearchAnime.split(",");
        Object.values(NextAnimFireBase).forEach((NA, i) => {
          TagArr.forEach((Tag) => {
            if (NA.Badges)
              NA.Badges.forEach((Bdg) => {
                if (
                  (Tag.toLowerCase() === Bdg.toLowerCase() ||
                    Bdg.toLowerCase().includes(Tag.toLowerCase())) &&
                  (NA.Importance === ImportanceSearch ||
                    (ImportanceSearch === 0 && !NA.Importance)) &&
                  (NA.name.toLowerCase() === titleSearchAnime.toLowerCase() ||
                    NA.name
                      .toLowerCase()
                      .includes(titleSearchAnime.toLowerCase()))
                )
                  index = [...index, i];
              });
          });

          return null;
        });
        next(index.map((In) => Object.keys(NextAnimFireBase)[In]));
      } else if (
        typeof TagSearchAnime === "string" &&
        TagSearchAnime.trim().length !== 0 &&
        ImportanceSearch !== null
      ) {
        const TagArr = TagSearchAnime.split(",");
        Object.values(NextAnimFireBase).forEach((NA, i) => {
          TagArr.forEach((Tag) => {
            if (NA.Badges)
              NA.Badges.forEach((Bdg) => {
                if (
                  (Tag.toLowerCase() === Bdg.toLowerCase() ||
                    Bdg.toLowerCase().includes(Tag.toLowerCase())) &&
                  (NA.Importance === ImportanceSearch ||
                    (ImportanceSearch === 0 && !NA.Importance))
                )
                  index = [...index, i];
              });
          });

          return null;
        });
        next(index.map((In) => Object.keys(NextAnimFireBase)[In]));
      } else if (
        ImportanceSearch !== null &&
        typeof titleSearchAnime === "string" &&
        titleSearchAnime.trim().length !== 0
      ) {
        Object.values(NextAnimFireBase).forEach((NA, i) => {
          if (
            (NA.Importance === ImportanceSearch ||
              (ImportanceSearch === 0 && !NA.Importance)) &&
            (NA.name.toLowerCase() === titleSearchAnime.toLowerCase() ||
              NA.name.toLowerCase().includes(titleSearchAnime.toLowerCase()))
          )
            index = [...index, i];

          return null;
        });
        next(index.map((In) => Object.keys(NextAnimFireBase)[In]));
      } else {
        const TagArr = TagSearchAnime.split(",");
        Object.values(NextAnimFireBase).forEach((NA, i) => {
          TagArr.forEach((Tag) => {
            if (NA.Badges)
              NA.Badges.forEach((Bdg) => {
                if (
                  (Tag.toLowerCase() === Bdg.toLowerCase() ||
                    Bdg.toLowerCase().includes(Tag.toLowerCase())) &&
                  (NA.name.toLowerCase() === titleSearchAnime.toLowerCase() ||
                    NA.name
                      .toLowerCase()
                      .includes(titleSearchAnime.toLowerCase()))
                )
                  index = [...index, i];
              });
          });

          return null;
        });
        next(index.map((In) => Object.keys(NextAnimFireBase)[In]));
      }
    }

    function next(key) {
      key.length === 0
        ? self.setState({
            ResText: `Aucun anime trouvé pour${
              Mode === 1
                ? ` ${titleSearchAnime}`
                : Mode === 2
                ? `: Tag = ${TagSearchAnime}`
                : Mode === 3
                ? `: Importance = ${
                    ImportanceSearch === 0
                      ? "Auncune"
                      : ImportanceSearch === 1
                      ? "Faible"
                      : ImportanceSearch === 2
                      ? "Moyenne"
                      : "Haute"
                  }`
                : " cette combinaisons de critères"
            }`,
            typeAlert: "danger",
          })
        : self.setState({ ModeFindAnime: [true, key] });
      self.cancelModal();
    }
  };

  AddEPToAlleged = () => {
    const { Pseudo, nbEP, IdToAddEp } = this.state;

    if (typeof nbEP === "string" && nbEP.trim().length !== 0 && nbEP !== "") {
      const AnimSEP = nbEP.split(",").map((nbEpS, i) => {
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

      this.updateValue(`${Pseudo}/serie/${IdToAddEp}`, {
        AnimEP: AnimSEP,
        finishedAnim: false,
        Drop: null,
        Paused: null,
      });
      this.setState({ RedirectPage: `/Watch/${Pseudo}/${IdToAddEp}` });
    }
  };

  TakeImgFromName = async (title) => {
    try {
      const ImgUrlRes = await axios.get(
        `https://api.jikan.moe/v3/search/anime?q=${title}&limit=1`
      );
      return ImgUrlRes.data.results[0].image_url;
    } catch (err) {
      console.error(err);
      return "PlaceHolderImg";
    }
  };

  addAnime = () => {
    const {
      title,
      nbEP,
      type,
      durer,
      imageUrl,
      NextAnimToDelete,
      filmFireBase,
      serieFirebase,
      OfflineMode,
    } = this.state;
    const self = this;

    let imgUrl = imageUrl;

    if (imgUrl === null) {
      if (OfflineMode === true) {
        imgUrl = "PlaceHolderImg";
        next();
      } else {
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
      }
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
          ImportanceSearch: null,
          TagSearchAnime: "",
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
    const { ParamsOptn } = this.state;
    if (window.Notification && ParamsOptn !== null) {
      if (
        Notification.permission === "granted" &&
        ParamsOptn.NotifState !== false &&
        ParamsOptn.NotifState !== null &&
        ParamsOptn.NotifState !== undefined
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
      const { OfflineMode } = this.state;
      const db = await openDB("AckDb", 1);
      const Store = db
        .transaction("NotifFirebase")
        .objectStore("NotifFirebase");
      const results = await Store.getAll();

      const NotifFirebase = OfflineMode
          ? results[0].data
          : await base.fetch(`${this.state.Pseudo}/Notif`, {
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
          fetch("https://fcm.googleapis.com/fcm/send", {
            method: "POST",
            headers: {
              authorization:
                "key=AAAAq3ZYpFM:APA91bFtsu-1NQ-_Sgexr7n5PuNCK7NfxwXHCkRt61PArKCDZhmKLeqkkQf8XVhlviPWSnxH58Z0SwLs48YxXhQkBKaCEtiNzVWu7DthTff1rUOIjlxc92JDyoBe5wagS_OLMD6_nKKQ",
              "content-type": "application/json",
            },
            body: JSON.stringify({
              collapse_key: "type_a",
              notification: {
                body: NotifFirebase[notifKey].name,
                title: NotifFirebase[notifKey].name,
                icon: "https://myanimchecker.netlify.app/Img/Icon.png",
              },
              to: JSON.parse(window.localStorage.getItem("PushNotifSub")),
            }),
          })
            .then((response) => {
              this.updateValue(`${this.state.Pseudo}/Notif/${notifKey}`, {
                called: true,
              });
              return response.json();
            })
            .then((data) => console.log(data))
            .catch((err) => {
              navigator.serviceWorker
                .getRegistration()
                .then((reg) => {
                  reg.showNotification(
                    `Sortie Anime: ${NotifFirebase[notifKey].name} !`,
                    {
                      body: `Nouvel Épisode de ${NotifFirebase[notifKey].name}, ne le rate pas !`,
                      icon: "https://myanimchecker.netlify.app/Img/Icon.png",
                      vibrate: [100, 50, 100],
                    }
                  );
                })
                .catch(() => {
                  new Notification(
                    `Sortie Anime: ${NotifFirebase[notifKey].name} !`,
                    {
                      body: `Nouvel Épisode de ${NotifFirebase[notifKey].name}, ne le rate pas !`,
                      icon: "https://myanimchecker.netlify.app/Img/Icon.png",
                    }
                  );
                });
              console.error(err);
            });
        } else if (
          new Date().getDay().toString() !== NotifFirebase[notifKey].day &&
          NotifFirebase[notifKey].called
        ) {
          this.updateValue(`${this.state.Pseudo}/Notif/${notifKey}`, {
            called: false,
          });
        }
      });
    } catch (err) {
      this.OfflineMode();
      console.error(err);
    }
  };

  newNextAnim = (event) => {
    event.preventDefault();

    const { NextAnim, ImportanceNA, TagNA, NextAnimFireBase } = this.state;
    let IsGoodForPost = true;

    const BadgeStrToArr = () => {
      if (typeof TagNA !== "string" || TagNA.trim().length <= 0) {
        return null;
      }

      return TagNA.split(",").map((tag) => tag);
    };

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
            Importance: !ImportanceNA ? null : ImportanceNA,
            Badges: BadgeStrToArr(),
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

      this.setState({ NextAnim: "", ImportanceNA: 0, TagNA: "" });
    } else {
      this.setState({
        ResText: "Veuillez me donner le nom de l'anime à rajouter",
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
    const RatedTotal = Object.values(CopyState.serieFirebase)
      .concat(Object.values(CopyState.filmFireBase))
      .reduce((acc, currentVal) => {
        const add = typeof currentVal.Rate === "number" ? 1 : 0;
        return acc + add;
      }, 0);

    return {
      nbNextAnime: Object.keys(CopyState.NextAnimFireBase).length,
      nbFilm: [Object.keys(CopyState.filmFireBase).length, FinishedTotalFilm],
      nbSeries: [
        Object.keys(CopyState.serieFirebase).length,
        FinishedTotalSerie,
      ],
      RatedTotal: [
        RatedTotal,
        `${Math.round(
          (RatedTotal / (FinishedTotalSerie + FinishedTotalFilm)) * 100
        )}%`,
      ],
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
      IdToAddEp: null,
      InfoAnimeToChangeNote: null,
      Rate: 7.5,
      ShowModalChangeNote: false,
      findAnim: [],
      SearchInAnimeList: [false, this.state.SearchInAnimeList[1]],
      ModeCombinaisonSearch: "ET",
      NextAnimToDelete: null,
      titleSearchAnime: "",
      ImportanceSearch: null,
      TagSearchAnime: "",
      addEPToAlleged: false,
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
      ModeDisplayNextAnim,
      AllowUseReAuth,
      RedirectPage,
      ShowModalSearch,
      addEPToAlleged,
      findAnim,
      animToDetails,
      ShowModalAddAnim,
      title,
      ResText,
      DeletePathVerif,
      OfflineMode,
      typeAlert,
      type,
      ModeFilter,
      ShowModalAddFilm,
      PalmaresModal,
      Rate,
      ShowModalVerification,
      ShowModalType,
      MicOn,
      ShowMessage,
      ShowMessageHtml,
      TagNA,
      TagSearchAnime,
      durer,
      FirstQuerie,
      SwitchMyAnim,
      ParamsOptn,
      NextAnim,
      LoadingMode,
      CodeNumber,
      JustDefined,
      ImportanceNA,
      ImportanceSearch,
      InfoAnimeToChangeNote,
      nbEP,
      SearchInAnimeList,
      ShowModalChangeNote,
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

    if (!uid && !OfflineMode) {
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
          OfflineMode={this.OfflineMode}
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

    const TemplateGAnime = (key) => (
      <Poster
        key={key}
        id={key}
        Skeleton={false}
        Pseudo={Pseudo}
        Paused={
          key.split("-")[0] === "serie"
            ? serieFirebase[key].Paused
              ? serieFirebase[key].Paused
              : false
            : false
        }
        AddEpSeasonToAlleged={() => {
          if (key.split("-")[0] !== "serie") return;
          this.setState({
            addEPToAlleged: true,
            ShowModalAddAnim: true,
            IdToAddEp: key,
            title: serieFirebase[key].name,
          });
        }}
        Drop={
          key.split("-")[0] === "serie"
            ? serieFirebase[key].Drop
              ? serieFirebase[key].Drop
              : false
            : false
        }
        ChangeNote={() =>
          this.setState({
            ShowModalChangeNote: true,
            InfoAnimeToChangeNote: key,
          })
        }
        isFav={
          { ...serieFirebase, ...filmFireBase }[key].Fav
            ? { ...serieFirebase, ...filmFireBase }[key].Fav
            : false
        }
        fnFav={(id, FavVal) => {
          this.updateValue(
            `${Pseudo}/${key.split("-")[0]}/${id}`,
            {
              Fav: FavVal,
            },
            ModeFilter
          );
        }}
        UnPaused={() => {
          this.updateValue(`${Pseudo}/${key.split("-")[0]}/${key}`, {
            Paused: null,
            Drop: null,
          });

          this.setState({ RedirectPage: `/Watch/${Pseudo}/${key}` });
        }}
        AnimeSeason={
          key.split("-")[0] === "serie"
            ? serieFirebase[key].AnimeSeason
              ? serieFirebase[key].AnimeSeason
              : false
            : false
        }
        ModeFilter={ModeFilter}
        url={{ ...serieFirebase, ...filmFireBase }[key].imageUrl}
        title={{ ...serieFirebase, ...filmFireBase }[key].name}
        isFinished={
          key.split("-")[0] === "serie"
            ? serieFirebase[key].finishedAnim
            : filmFireBase[key].finished
        }
        Rate={{ ...serieFirebase, ...filmFireBase }[key].Rate}
        deleteAnim={this.DeleteAnimVerification}
        isAlleged={
          key.split("-")[0] === "serie"
            ? !serieFirebase[key].AnimEP
              ? true
              : false
            : false
        }
        inMyAnim={true}
      />
    );
    const TemplateGNextAnim = (key) => (
      <NextAnimCO
        key={key}
        name={NextAnimFireBase[key].name}
        ModeDisplay={ModeDisplayNextAnim}
        ModeImportant={
          !NextAnimFireBase[key].Importance
            ? 0
            : NextAnimFireBase[key].Importance
        }
        setImportance={(LvlImportance) => {
          this.updateValue(`${Pseudo}/NextAnim/${key}/`, {
            Importance: LvlImportance,
          });
        }}
        BadgesType={NextAnimFireBase[key].Badges}
        AddNewBadgeType={(NameBadge) => {
          this.updateValue(`${Pseudo}/NextAnim/${key}/`, {
            Badges: [
              ...(!NextAnimFireBase[key].Badges
                ? []
                : NextAnimFireBase[key].Badges),
              NameBadge,
            ],
          });
        }}
        handleDeleteBadge={(index) => {
          const Badges = [...NextAnimFireBase[key].Badges];
          Badges.splice(index, 1);
          this.updateValue(`${Pseudo}/NextAnim/${key}/`, { Badges });
        }}
        Skeleton={[false, null]}
        handleClick={(eventTarget) => {
          if (
            eventTarget.id === "RepereImportantNextAnime" ||
            eventTarget.id === "RepereMenuImportantNextAnime" ||
            eventTarget.id === "InputBadgeNA" ||
            eventTarget.id === "InputNANbadgeReperage" ||
            eventTarget.id === "BadgeAddReperagePill" ||
            eventTarget.id === "BadgeAddReperagePillSpan" ||
            eventTarget.classList[0] === "BadgesNA" ||
            eventTarget.classList[0] === "fas" ||
            eventTarget.id === "CancelBadge" ||
            eventTarget.classList[0] === "deleteNA"
          )
            return;
          this.setState({
            ShowModalType: true,
            title: NextAnimFireBase[key].name,
            NextAnimToDelete: key,
          });
        }}
        DeleteNextAnim={() => {
          this.deleteValue(`${Pseudo}/NextAnim/${key}`);
        }}
      />
    );
    let animList = null;
    let NbTemplate = [];

    if (findAnim.length !== 0) {
      animList = findAnim.map((anim) => (
        <Poster
          key={anim.mal_id}
          url={anim.image_url}
          Skeleton={false}
          score={anim.score}
          title={anim.title}
          SeeInDetails={(id) => {
            this.handleClick(id);
            this.setState({
              ShowMessage: true,
              ShowMessageHtml: true,
              ResText: "Chargement de la page... Veuillez patienté...",
            });
            setTimeout(() => {
              this.setState({ ShowMessage: false });

              setTimeout(() => {
                this.setState({ ShowMessageHtml: false, ResText: null });
              }, 900);
            }, 5000);
          }}
          type={anim.type}
          id={anim.mal_id}
          inMyAnim={false}
        />
      ));
    } else if (ShowModalSearch) {
      for (let i = 0; i < 2; i++) {
        if (animList) {
          animList = [
            ...animList,
            <Poster key={i} Skeleton={true} inMyAnim={false} />,
          ];
        } else {
          animList = [<Poster key={i} Skeleton={true} inMyAnim={false} />];
        }
      }
    }

    if (SearchInAnimeList[0] && !SearchInAnimeList[1]) {
      let NbFois = !ImportanceSearch ? 1 : ImportanceSearch;
      for (let i = 0; i < NbFois; i++) {
        NbTemplate = [
          ...NbTemplate,
          <span key={i} className="fas fa-exclamation"></span>,
        ];
      }
    }

    if (
      (Object.keys(filmFireBase).length !== 0 ||
        Object.keys(serieFirebase).length !== 0) &&
      SwitchMyAnim &&
      !LoadingMode[0] &&
      RefreshRandomizeAnime
    ) {
      const MyAnimListTemplate = Object.keys({
        ...serieFirebase,
        ...filmFireBase,
      }).map((key) => TemplateGAnime(key));

      this.setState({
        RefreshRandomizeAnime: false,
        MyAnimListSaved:
          ParamsOptn === null
            ? this.shuffleArray(MyAnimListTemplate)
            : ParamsOptn.MyAnimRandom === false
            ? MyAnimListTemplate
            : this.shuffleArray(MyAnimListTemplate),
      });
    } else if (
      !SwitchMyAnim &&
      NextAnimFireBase !== undefined &&
      Object.keys(NextAnimFireBase).length !== 0 &&
      !LoadingMode[1] &&
      RefreshRandomizeAnime2
    ) {
      const MyNextAnimListTemplate = Object.keys(NextAnimFireBase).map((key) =>
        TemplateGNextAnim(key)
      );
      this.setState({
        RefreshRandomizeAnime2: false,
        MyNextAnimListSaved:
          ParamsOptn === null
            ? this.shuffleArray(MyNextAnimListTemplate)
            : ParamsOptn.MyAnimRandom === false
            ? MyNextAnimListTemplate
            : this.shuffleArray(MyNextAnimListTemplate),
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

    if (animToDetails !== null && animToDetails.length >= 2) {
      return (
        <OneAnim
          details={animToDetails}
          back={() => this.setState({ animToDetails: null })}
          ShowMessage={ShowMessage}
          ShowMessageHtml={ShowMessageHtml}
          ResText={ResText}
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
    } else {
      let SkeletonListAnime = [],
        SkeletonListNextAnime = [];

      if (LoadingMode[0]) {
        for (let i = 0; i < 10; i++) {
          SkeletonListAnime = [
            ...SkeletonListAnime,
            <Poster key={i} Skeleton={true} inMyAnim={true} />,
          ];
        }
      }
      if (LoadingMode[1]) {
        for (let i = 0; i < 8; i++) {
          SkeletonListNextAnime = [
            ...SkeletonListNextAnime,
            <NextAnimCO
              key={i}
              ModeDisplay={ModeDisplayNextAnim}
              Skeleton={[true, i]}
            />,
          ];
        }
      }

      return (
        <Fragment>
          <ContextForMyAnim.Provider
            value={{
              openModalNewAnim: () => this.setState({ ShowModalType: true }),
              Pseudo,
              search: this.SearchAnim,
              logOut: this.logOut,
              LoadingMode: LoadingMode[0],
              RdaAnime: () => {
                const KeyRda = Object.keys(NextAnimFireBase)[
                  Math.round(
                    Math.random() * (Object.keys(NextAnimFireBase).length - 1)
                  )
                ];
                this.setState({
                  ShowModalType: true,
                  title: NextAnimFireBase[KeyRda].name,
                  NextAnimToDelete: KeyRda,
                });
              },
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
              fnNextAnimForm={[
                (LvlImportance) => {
                  this.setState({ ImportanceNA: LvlImportance });
                },
                (event) => this.setState({ TagNA: event.target.value }),
              ]}
              Tag={TagNA}
              ModeImportant={ImportanceNA}
              LoadingMode={LoadingMode[0]}
              ModeDisplayNextAnim={ModeDisplayNextAnim}
              ChangeModeDisplayNextAnim={(NewMode) => {
                if (NewMode === ModeDisplayNextAnim) return;
                window.localStorage.setItem(
                  "ModeDisplayNextAnim",
                  JSON.stringify(NewMode)
                );
                this.setState({
                  ModeDisplayNextAnim: NewMode,
                  RefreshRandomizeAnime2: true,
                });
              }}
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
                  ? ModeFindAnime[1].map((key) => TemplateGAnime(key))
                  : LoadingMode[0]
                  ? SkeletonListAnime
                  : MyAnimListSaved || "Vous avez aucun anime :/\nRajoutez-en !"
              }
              MyNextAnimList={
                ModeFindAnime[0] && !SearchInAnimeList[1]
                  ? ModeFindAnime[1].map((key) => TemplateGNextAnim(key))
                  : LoadingMode[1]
                  ? SkeletonListNextAnime
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

          <Modal show={ShowModalChangeNote} size="lg" onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>
                Changée la Note de{" "}
                {ShowModalChangeNote
                  ? { ...serieFirebase, ...filmFireBase }[InfoAnimeToChangeNote]
                      .name
                  : null}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              <ReactStars
                {...{
                  size: 50,
                  count: 10,
                  color: "black",
                  activeColor: "yellow",
                  value: 7.5,
                  a11y: true,
                  isHalf: true,
                  emptyIcon: <i className="far fa-star" />,
                  halfIcon: <i className="fa fa-star-half-alt" />,
                  filledIcon: <i className="fa fa-star" />,
                  onChange: (Rate) => this.setState({ Rate }),
                }}
              />
              <p>{Rate} étoiles</p>
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                Annuler
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  let Good = false;
                  const AnimToChange = { ...serieFirebase, ...filmFireBase }[
                    InfoAnimeToChangeNote
                  ];

                  if (
                    AnimToChange.finishedAnim !== undefined &&
                    AnimToChange.finishedAnim
                  )
                    Good = true;
                  else if (
                    AnimToChange.finished !== undefined &&
                    AnimToChange.finished
                  )
                    Good = true;

                  if (Good)
                    this.updateValue(
                      `${Pseudo}/${
                        InfoAnimeToChangeNote.split("-")[0]
                      }/${InfoAnimeToChangeNote}`,
                      {
                        Rate,
                      },
                      ModeFilter
                    );

                  this.cancelModal();
                }}
              >
                <span className="fas fa-check"></span> Validez
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
                    <span className="palma">
                      Animes en cours (Serie + Film):
                    </span>{" "}
                    {palmares.EnCours}
                  </li>
                  <li>
                    <span className="palma">Animes finis (Serie + Film):</span>{" "}
                    {palmares.Finished}
                  </li>
                  <li>
                    <span className="palma">Nombre d'Animes Notée:</span>{" "}
                    {palmares.RatedTotal[0]}, tu as donc notée{" "}
                    {palmares.RatedTotal[1]} de tous tes animes finis
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
                    {palmares.nbFilm[0]} dont {palmares.nbFilm[1]} finis soit{" "}
                    {Math.round(
                      (palmares.nbFilm[1] / palmares.nbFilm[0]) * 100
                    )}
                    % de film finis
                  </li>
                  <li>
                    <span className="palma">Nombre Total Series:</span>{" "}
                    {palmares.nbSeries[0]} dont {palmares.nbSeries[1]} finis
                    soit{" "}
                    {Math.round(
                      (palmares.nbSeries[1] / palmares.nbSeries[0]) * 100
                    )}
                    % de séries finis
                  </li>
                  <li>
                    <span className="palma">
                      Nombre Total de tes prochains anime:
                    </span>{" "}
                    {palmares.nbNextAnime}
                  </li>
                  <li>
                    <span className="palma">Nombre Total d'anime:</span>{" "}
                    {palmares.nbFilm[0] + palmares.nbSeries[0]}
                  </li>
                  <li>
                    <span className="palma">
                      Nombre Total d'element stocké:
                    </span>{" "}
                    {palmares.nbFilm[0] +
                      palmares.nbSeries[0] +
                      palmares.nbNextAnime}
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
            <Modal.Body
              id="ModalBody"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  this.SearchAnimInList(event);
                }
              }}
            >
              <Form onSubmit={this.SearchAnimInList}>
                {!SearchInAnimeList[1] ? (
                  <Form.Text>
                    Au moins un critère dois être rempli les autres sont
                    facultatif mais vous pouvez combinée plusieurs critère (Par
                    ex: Anime avec le tag "Fate" et/ou qui sont en haute
                    importance ...) <br />
                  </Form.Text>
                ) : null}
                <Form.Group id="searchInAnimeList">
                  <Form.Label>Nom de l'animé:</Form.Label>
                  <Form.Control
                    type="text"
                    className="searchInAnimeListInput"
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

                  {!SearchInAnimeList[1] ? (
                    <Fragment>
                      <Form.Label>Importance de l'anime:</Form.Label>
                      <Dropdown>
                        <Dropdown.Toggle
                          variant={`outline-${
                            !ImportanceSearch
                              ? "secondary"
                              : ImportanceSearch === 1
                              ? "info"
                              : ImportanceSearch === 2
                              ? "warning"
                              : "danger"
                          }`}
                        >
                          {NbTemplate}
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() =>
                              this.setState({ ImportanceSearch: null })
                            }
                          >
                            Rien
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              this.setState({ ImportanceSearch: 0 })
                            }
                            style={{ color: "rgb(108, 117, 125)" }}
                          >
                            Aucune Importance
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              this.setState({ ImportanceSearch: 1 })
                            }
                            style={{ color: "#4d8ccf" }}
                          >
                            <span className="fas fa-exclamation"></span> Faible
                            Importance
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              this.setState({ ImportanceSearch: 2 })
                            }
                            style={{ color: "rgb(255, 193, 7)" }}
                            id="RepereImportantNextAnime"
                          >
                            <span className="fas fa-exclamation"></span>{" "}
                            <span className="fas fa-exclamation"></span>{" "}
                            Importance Moyenne
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              this.setState({ ImportanceSearch: 3 })
                            }
                            style={{ color: "#fb401f" }}
                          >
                            <span className="fas fa-exclamation"></span>{" "}
                            <span className="fas fa-exclamation"></span>{" "}
                            <span className="fas fa-exclamation"></span> Haute
                            Importance
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                      <Form.Label>Type de l'anime:</Form.Label>
                      <Form.Control
                        type="text"
                        className="searchInAnimeListInput"
                        placeholder={`Les Tag de l'anime séparé par une "," (tag1,tag2...)`}
                        autoComplete="off"
                        value={TagSearchAnime}
                        onChange={(event) =>
                          this.setState({
                            TagSearchAnime: event.target.value,
                          })
                        }
                      />
                      <Form.Label>
                        Combinée en <b>OU</b> ou en <b>ET</b>
                      </Form.Label>
                      <br />
                      <Form.Check
                        inline
                        label="ET"
                        onClick={() =>
                          this.setState({ ModeCombinaisonSearch: "ET" })
                        }
                        type="radio"
                        name="ouet"
                      />
                      <Form.Check
                        inline
                        onClick={() =>
                          this.setState({ ModeCombinaisonSearch: "OU" })
                        }
                        label="OU"
                        type="radio"
                        name="ouet"
                      />
                      <Form.Text>
                        Par défault{" "}
                        <b style={{ textDecoration: "underline" }}>ET</b> <br />
                        En <b style={{ textDecoration: "underline" }}>OU</b> =
                        Il faut que l'anime ait le critère1 <b>OU</b> le
                        critère2... (exemple: Tous les animes avec le Tag "Fate"{" "}
                        <b>OU</b> qui sont en Haute Importance) <br /> En{" "}
                        <b style={{ textDecoration: "underline" }}>ET</b> = Il
                        faut que l'anime ait le critère1 <b>ET</b> le
                        critère2... (exemple: Tous les animes avec le Tag "Fate"{" "}
                        <b>ET</b> qui sont en Haute Importance)
                      </Form.Text>
                    </Fragment>
                  ) : null}
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
              <Modal.Title>
                {title.trim().length !== 0
                  ? `Le type d'anime de ${title}`
                  : "Type d'anime"}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body
              id="ModalBody"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  this.setState({ ShowModalType: false });
                  this.openNext();
                }
              }}
            >
              <Form
                onSubmit={() => {
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
            <Modal.Body
              onKeyDown={(event) => {
                if (event.key === "Enter") this.addAnime();
              }}
              id="ModalBody"
            >
              <Form id="AddAnim" onSubmit={this.addAnime}>
                <Form.Group controlId="titre">
                  <Form.Label>Titre</Form.Label>
                  <Form.Control
                    type="text"
                    disabled={addEPToAlleged}
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
              <Button
                variant="success"
                onClick={(event) => {
                  event.preventDefault();
                  if (addEPToAlleged) {
                    this.AddEPToAlleged();
                    return;
                  }
                  this.addAnime();
                }}
              >
                <span className="fas fa-plus"></span> Créer {title}
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={ShowModalAddFilm} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Ajouter un Film</Modal.Title>
            </Modal.Header>
            <Modal.Body
              id="ModalBody"
              onKeyDown={(event) => {
                if (event.key === "Enter") this.addAnime();
              }}
            >
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
}

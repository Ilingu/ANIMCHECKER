import React, { Component, Fragment } from "react";
import { Redirect, Link } from "react-router-dom";
import axios from "axios";
import { openDB } from "idb";
import ObjectPath from "object-path";
import ReactStars from "react-rating-stars-component";
import { Fireworks } from "fireworks/lib/react";
// Components
import AnimEpCo from "./dyna/AnimEp";
// Context
import ContextSchema from "../Context/ContextEP";
// Img
import ADNLogo from "../Assets/Img/ADNLogo.png";
import CrunchyrollLogo from "../Assets/Img/CrunchyrollLogo.png";
import MavLogo from "../Assets/Img/MAVLogo.png";
import NekoSamaLogo from "../Assets/Img/NekoSamaLogo.svg";
import NetflixLogo from "../Assets/Img/NetflixLogo.png";
import WakanimLogo from "../Assets/Img/WakanimLogo.png";
import VoirAnimeLogo from "../Assets/Img/voiranime.png";
import NineAnimeLogo from "../Assets/Img/9anime.png";
// CSS
import { Button, Modal, Form, Badge } from "react-bootstrap";
// DB
import base from "../db/base";
import firebase from "firebase/app";

class Watch extends Component {
  state = {
    // Firebase
    Pseudo: this.props.match.params.pseudo,
    AnimToWatch: {},
    Badges: [],
    id: this.props.match.params.id,
    // Auth
    uid: null,
    proprio: null,
    // Bon fonctionnement de l'app
    OfflineMode: !JSON.parse(window.localStorage.getItem("OfflineMode"))
      ? false
      : JSON.parse(window.localStorage.getItem("OfflineMode")),
    modeWatch: false,
    type: "",
    LoadingMode: true,
    LoadingModeAuth: true,
    isFirstTime: true,
    WatchModeNow: null,
    RedirectTo: [false, ""],
    Shortcut: true,
    ToOpen: "",
    ToggleNavbar: false,
    OpenDropDownAction: false,
    OpenDropDownAlleger: false,
    ModeEditTitle: false,
    ShowFormBadge: false,
    ShowModalRateAnime: false,
    ShowModalAddObjectif: false,
    ShowMessage: false,
    ShowMessageHtml: false,
    SmartRepere: true,
    SecondMessage: false,
    PauseWithAlleged: false,
    DropWithAlleged: false,
    ScrollPosAccordeon: 0,
    AlreadyClicked: false,
    // Message
    ResText: null,
    typeAlertMsg: null,
    // Fun
    LetsCelebrate: false,
    LetsNotCelebrate: false,
    // Repere
    repereSaison: {},
    repereEpisode: [],
    // Form
    SeasonToAddEp: null,
    Rate: 7.5,
    nbEpToAddToHave: [1, 1],
    Newtitle: "",
    nbEpObjectif: 1,
    DateObjectif: new Date().toISOString().split(".")[0],
    NewBadgeName: "",
    ActionEndAnime: [false, false, false],
    nbEpToAdd: 1,
    // Modal
    ShowModalVerification: [false, null],
    ShowModalAddEp: false,
    ShowModalAddSeasonEp: false,
  };

  _isMounted = false;
  DataBaseWS = null;
  connectedRef = null;
  setIntervalVar = null;
  setTimeOutMsgInfo = null;
  setTimeOutMsgInfo2 = null;
  FirstBadge = true;
  DynamicSize = 0;

  componentDidMount() {
    this._isMounted = true;
    const self = this;
    /* Var From URL */
    // Pseudo
    if (
      this.state.Pseudo !== JSON.parse(window.localStorage.getItem("Pseudo")) ||
      !this.state.Pseudo
    ) {
      this.setState({ uid: null, RedirectTo: [true, "/notifuser/2"] });
      return;
    }
    // ID
    if (this.state.id) {
      if (
        this.state.id.split("-")[0] !== "serie" &&
        this.state.id.split("-")[0] !== "film"
      ) {
        this.setState({ uid: null, RedirectTo: [true, "/notifuser/11"] });
        return;
      }
      this.setState(
        {
          type: this.props.match.params.id.split("-")[0],
        },
        () => {
          if (this.state.OfflineMode === true) {
            // Get Data IndexedDB
            self.fnDbOffline("GET");
            return;
          }
          this.refreshAnimToWatch();
          /* WS */
          this.ActiveWebSockets();
        }
      );
    } else {
      this.setState({ uid: null, RedirectTo: [true, "/notifuser/10"] });
      return;
    }
    // WatchMode
    if (this.props.match.params.watchmode !== undefined)
      this.setState({ WatchModeNow: this.props.match.params.watchmode });
    /* FB Conn */
    if (this.state.Pseudo && !this.state.OfflineMode && this._isMounted) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          self.handleAuth({ user });
        }
      });
    }
    /* Color */
    if (window.localStorage.getItem("BGC-ACK")) {
      document.body.style.backgroundColor =
        window.localStorage.getItem("BGC-ACK");
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.DataBaseWS) this.DataBaseWS.off("value");
    if (this.connectedRef) this.connectedRef.off("value");
    this.DataBaseWS = null;
    this.connectedRef = null;
    document.onkeydown = null;
  }

  ActiveWebSockets = () => {
    // WS
    const { Pseudo, type, id } = this.state;
    this.DataBaseWS = firebase.database().ref(`${Pseudo}/${type}/${id}`);
    this.DataBaseWS.on("value", (snap) => {
      const NewData = snap.val();
      this.refreshAnimToWatch(null, NewData);
    });
  };

  reAuth = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.handleAuth({ user });
      }
    });
  };

  reconectFirebase = () => {
    let i = 0;
    this.setIntervalVar = setInterval(() => {
      if (i === 5) this.reAuth();
      // Allow Vpn
      window.localStorage.removeItem("firebase:previous_websocket_failure");
      i++;
    }, 1000);
  };

  handleAuth = async (authData) => {
    const box = await base.fetch(this.state.Pseudo, { context: this });
    this.connectedRef = firebase.database().ref(".info/connected");

    if (!box.proprio) {
      await base.post(`${this.state.Pseudo}/proprio`, {
        data: authData.user.uid,
      });
    }

    // Verified listener Conn
    this.connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        // Fast Loading Anime before FnRefresh
        this.fnDbOffline("GET");

        // Reconected
        if (this.setIntervalVar !== null) {
          clearInterval(this.setIntervalVar);
          this.DisplayMsg("Reconnecté avec succès !", 5000, "success");
          console.warn("Firebase Connexion retablished");
        }
      } else {
        this.reconectFirebase();
        this.DisplayMsg(
          "Connection aux serveurs perdues -> Reconnection...",
          5000,
          "warn"
        );
        console.warn(
          "Firebase Connexion Disconnected\n\tReconnect to Firebase..."
        );
      }
    });

    this.setState({
      uid: authData.user.uid,
      proprio: box.proprio || authData.user.uid,
      LoadingModeAuth: false,
    });
  };

  refreshAnimToWatch = async (next = null, WSData = null) => {
    const { id, type, ScrollPosAccordeon } = this.state;

    try {
      const [AnimToWatch, ParamsOptn] = await Promise.all([
        WSData !== null
          ? WSData
          : await base.fetch(`${this.state.Pseudo}/${type}/${id}`, {
              context: this,
            }),
        await base.fetch(`${this.state.Pseudo}/ParamsOptn`, {
          context: this,
        }),
      ]);

      document.title = `ACK:${AnimToWatch.name}`;

      if (this._isMounted)
        this.setState(
          {
            AnimToWatch,
            Newtitle: AnimToWatch.name,
            SmartRepere:
              Object.keys(ParamsOptn).length !== 0
                ? ParamsOptn?.SmartRepere !== undefined
                  ? ParamsOptn.SmartRepere
                  : true
                : true,
            Shortcut:
              Object.keys(ParamsOptn).length !== 0
                ? ParamsOptn?.Shortcut !== undefined
                  ? ParamsOptn.Shortcut
                  : true
                : true,
            Badges: AnimToWatch.Badge ? AnimToWatch.Badge : [],
            LoadingMode: false,
          },
          () => {
            // KeyShortcuts
            if (
              !window.mobileAndTabletCheck() &&
              this.state.Shortcut &&
              document.onkeydown === null
            ) {
              document.onkeydown = (keyDownEvent) => {
                if (keyDownEvent.repeat) return;
                const {
                  repereEpisode,
                  repereSaison,
                  modeWatch,
                  ShowFormBadge,
                  ModeEditTitle,
                } = this.state;
                if (
                  keyDownEvent.key === "f" &&
                  !ShowFormBadge &&
                  !ModeEditTitle
                )
                  return this.StartNextEP();
                if (keyDownEvent.key === "Escape" && !modeWatch)
                  return this.setState({ RedirectTo: [true, "/"] });
                if (!modeWatch) return;
                if (keyDownEvent.key === "ArrowRight") {
                  return repereEpisode[2] !== null
                    ? this.StartNextEP(repereSaison, repereEpisode[2].id)
                    : this.verifiedEPRepere(repereSaison, true);
                }
                if (keyDownEvent.key === "Escape") return this.StopModeWatch();
                if (keyDownEvent.key === "ArrowLeft")
                  return repereEpisode[0] !== null
                    ? this.playEp(repereSaison, repereEpisode[0].id)
                    : console.warn(
                        "Impossible de charger un Episode innexistant !"
                      );
              };
            }
            if (
              AnimToWatch.Objectif !== undefined &&
              AnimToWatch.Objectif.End[2] < Date.now()
            ) {
              this.DisplayMsg("Vous avez râté votre objectif", 6000, "danger");
              this.setState({ LetsNotCelebrate: true });
              this.deleteValue(`${this.state.Pseudo}/serie/${id}/Objectif`);
              if (!this.state.OfflineMode) {
                this.fnDbOffline(
                  "DELETE",
                  `${this.state.Pseudo}/serie/${id}/Objectif`
                );
              }
            } else if (AnimToWatch.Objectif !== undefined) this.StartNextEP();
            if (this.state.WatchModeNow === "true") {
              this.StartNextEP();
              this.setState({ WatchModeNow: null });
            }
            if (next !== null) next();
            if (AnimToWatch.DurationPerEP === undefined && type === "serie") {
              this.ReTakeInfoFromName();
            }
            // Scroll EP
            if (
              document.getElementById("EpisodesList") !== undefined &&
              document.getElementById("EpisodesList") !== null
            ) {
              document
                .getElementById("EpisodesList")
                .scrollTo(0, ScrollPosAccordeon);
            }
          }
        );
    } catch (err) {
      console.error(err);
    }
  };

  fnDbOffline = async (type, path, value, next = null) => {
    const db = await openDB("AckDb", 1);
    if (type === "GET") {
      // Get Data IndexedDB
      const { id, type } = this.state;

      const Store = [
        type === "serie"
          ? db.transaction("serieFirebase").objectStore("serieFirebase")
          : db.transaction("filmFireBase").objectStore("filmFireBase"),
        db.transaction("ParamsOptn").objectStore("ParamsOptn"),
      ];
      const results = await Promise.all(
        Store.map(async (req) => await req.getAll())
      );
      const AnimToWatch = results[0] ? results[0][0].data[id] : {};

      document.title = `ACK:${
        Object.keys(AnimToWatch).length !== 0
          ? AnimToWatch.name
          : "Anim-Checker"
      }`;
      this.setState(
        {
          AnimToWatch,
          Newtitle:
            Object.keys(AnimToWatch).length !== 0 ? AnimToWatch.name : "",
          SmartRepere: results[1]
            ? results[1][0].data === undefined
              ? true
              : results[1][0].data.SmartRepere === undefined
              ? true
              : results[1][0].data.SmartRepere
            : true,
          Badges:
            Object.keys(AnimToWatch).length !== 0
              ? AnimToWatch.Badge
                ? AnimToWatch.Badge
                : []
              : [],
          LoadingMode: false,
        },
        () => {
          if (this.state.WatchModeNow === "true") this.StartNextEP();
          if (next !== null) next();
        }
      );
    } else if (type === "POST") {
      const Store = db
        .transaction("serieFirebase", "readwrite")
        .objectStore("serieFirebase");

      const CopyData = [...(await Store.getAll())][0].data;
      let NewPath = path.split("/"),
        NewValue = null;
      NewPath.shift();
      NewPath.shift();
      NewValue = NewPath.pop();
      NewPath = NewPath.join(".");
      const ObjToEdit = ObjectPath.get(CopyData, NewPath);
      ObjToEdit[NewValue] = value;
      Store.put({
        id: "serieFirebase",
        data: CopyData,
      })
        .then(() => this.fnDbOffline("GET", null, null, next))
        .catch(console.error);
    } else if (type === "PUT") {
      const WayStr = path.split("/")[1];
      const WayIndex = WayStr === "serie" ? 0 : 1;
      const Store = [
        db
          .transaction("serieFirebase", "readwrite")
          .objectStore("serieFirebase"),
        db.transaction("filmFireBase", "readwrite").objectStore("filmFireBase"),
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
      const WayIndex = WayStr === "serie" ? 0 : 1;
      const Store = [
        db
          .transaction("serieFirebase", "readwrite")
          .objectStore("serieFirebase"),
        db.transaction("filmFireBase", "readwrite").objectStore("filmFireBase"),
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
        .then(() => this.fnDbOffline("GET", null, null, next))
        .catch(console.error);
    }
  };

  addValue = (path, value) => {
    const { OfflineMode } = this.state;
    try {
      this.setState({
        ScrollPosAccordeon: document.getElementById("EpisodesList").scrollTop,
      });
    } catch (err) {}
    if (OfflineMode === true) {
      this.fnDbOffline("POST", path, value);
      return;
    }

    base
      .post(path, {
        data: value,
      })
      .then(this.refreshAnimToWatch)
      .catch(console.error);
  };

  deleteValue = (path) => {
    const { OfflineMode } = this.state;
    try {
      this.setState({
        ScrollPosAccordeon: document.getElementById("EpisodesList").scrollTop,
      });
    } catch (err) {}
    if (OfflineMode === true) {
      this.fnDbOffline("DELETE", path);
      return;
    }

    base.remove(path).then(this.refreshAnimToWatch).catch(console.error);
  };

  updateValue = (path, value, next = null, nextAfterRefresh = false) => {
    const { OfflineMode } = this.state;
    // Save PosAccordeon
    try {
      this.setState({
        ScrollPosAccordeon: document.getElementById("EpisodesList").scrollTop,
      });
    } catch (err) {}
    // Update
    if (OfflineMode === true) {
      this.fnDbOffline("PUT", path, value, next);
      return;
    }

    base
      .update(path, {
        data: value,
      })
      .then(() => {
        this.refreshAnimToWatch(nextAfterRefresh ? next : null);
        if (next !== null && !nextAfterRefresh) next();
      })
      .catch((err) => console.error(err));
  };

  getAllTheEpisode = async (id) => {
    let Episodes = [
      ...(await axios.get(`https://api.jikan.moe/v3/anime/${id}/episodes`)).data
        .episodes,
    ];
    let i = 0;
    const fetchOtherEP = async () => {
      if (Episodes.length === 100) {
        return axios
          .get(`https://api.jikan.moe/v3/anime/${id}/episodes/${i + 2}`)
          .then(async (res) => {
            Episodes = [...Episodes, ...res.data.episodes];
            i++;
            return await fetchOtherEP();
          });
      } else {
        i = 0;
        return Episodes;
      }
    };
    return await fetchOtherEP();
  };

  ReTakeInfoFromName = async () => {
    const { AnimToWatch, id, type } = this.state;
    let ChangeAnime = true;

    try {
      const AnimeID = (
        await axios.get(
          `https://api.jikan.moe/v3/search/anime?q=${AnimToWatch.name}&limit=1`
        )
      ).data.results[0].mal_id;
      const InfoAnimeRes = await Promise.all([
        await this.getAllTheEpisode(AnimeID),
        await axios.get(`https://api.jikan.moe/v3/anime/${AnimeID}`),
      ]);

      if (
        InfoAnimeRes[1].data.image_url.split("?s=")[0] !==
          AnimToWatch.imageUrl &&
        !window.confirm(
          `⚠ ATTENTION !\nSouhaiter vous changé la photo de cette anime et ses nom d'épisodes ? (OUI = "OK", NON = "Annuler")`
        )
      )
        ChangeAnime = false;

      const EpName =
        InfoAnimeRes[0].length !== 0
          ? InfoAnimeRes[0].map((epi) => {
              return {
                title: epi.title,
                filler: !epi.filler ? null : true,
                recap: !epi.recap ? null : true,
              };
            })
          : "none";
      let AnimSEP = null;

      if (EpName !== "none" && ChangeAnime === true) {
        let ArrEpSaison = AnimToWatch.AnimEP.map(
          (saisons) => saisons.Episodes.length
        ).join(",");
        AnimSEP = ArrEpSaison.split(",").map((nbEpS, i) => {
          let EpObj = [];

          for (let j = 0; j < parseInt(nbEpS); j++) {
            EpObj = [
              ...EpObj,
              {
                id: j + 1,
                finished: AnimToWatch.AnimEP[i].Episodes[j].finished,
                Info: i === 0 ? (!EpName[j] ? null : EpName[j]) : null,
              },
            ];
          }

          return {
            name: `Saison ${i + 1}`,
            Episodes: EpObj,
            finished: AnimToWatch.AnimEP[i].finished,
          };
        });
      }

      this.updateValue(`${this.state.Pseudo}/${type}/${id}`, {
        imageUrl: ChangeAnime
          ? InfoAnimeRes[1].data.image_url.split("?s=")[0]
          : AnimToWatch.imageUrl,
        AnimEP: !AnimSEP || !ChangeAnime ? AnimToWatch.AnimEP : AnimSEP,
        DurationPerEP: !InfoAnimeRes[1].data.duration
          ? "none"
          : InfoAnimeRes[1].data.duration,
      });

      if (!this.state.OfflineMode) {
        this.fnDbOffline("PUT", `${this.state.Pseudo}/${type}/${id}`, {
          imageUrl: ChangeAnime
            ? InfoAnimeRes[1].data.image_url.split("?s=")[0]
            : AnimToWatch.imageUrl,
          AnimEP: !AnimSEP || !ChangeAnime ? AnimToWatch.AnimEP : AnimSEP,
          DurationPerEP: !InfoAnimeRes[1].data.duration
            ? "none"
            : InfoAnimeRes[1].data.duration,
        });
      }
    } catch (err) {
      console.error(err);
      this.updateValue(`${this.state.Pseudo}/${type}/${id}`, {
        DurationPerEP: "none",
      });
      if (!this.state.OfflineMode) {
        this.fnDbOffline("PUT", `${this.state.Pseudo}/${type}/${id}`, {
          DurationPerEP: "none",
        });
      }
    }
  };

  addEp = (Season, nbEpToAdd) => {
    const { id, AnimToWatch } = this.state;
    const idSaison = parseInt(Season.name.split(" ")[1]) - 1;
    let Stockage = [];

    if (
      typeof nbEpToAdd === "string" ||
      isNaN(nbEpToAdd) ||
      Math.sign(nbEpToAdd) === -1 ||
      Math.sign(nbEpToAdd) === 0
    )
      return;

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
      Rate: null,
    });

    if (!this.state.OfflineMode) {
      this.fnDbOffline(
        "POST",
        `${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}/Episodes`,
        AnimToWatch.AnimEP[idSaison].Episodes.concat(Stockage)
      );
      this.fnDbOffline(
        "PUT",
        `${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}`,
        {
          finished: false,
        }
      );
      this.fnDbOffline("PUT", `${this.state.Pseudo}/serie/${id}`, {
        finishedAnim: false,
        Rate: null,
      });
    }

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

    if (!this.state.OfflineMode) {
      this.fnDbOffline(
        "POST",
        `${this.state.Pseudo}/serie/${id}/AnimEP`,
        Stockage
      );
      this.fnDbOffline("PUT", `${this.state.Pseudo}/serie/${id}`, {
        finishedAnim: false,
      });
    }

    this.setState({
      nbEpToAdd: 1,
      ShowModalAddSeasonEp: false,
    });
  };

  StartModeWatch = () => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    this.setState({ modeWatch: true });
  };

  StopModeWatch = () => {
    document.body.style.overflow = "unset";
    this.setState({ modeWatch: false });
  };

  setRepere = (Saison, idEp, smart = false, addObjectif = false) => {
    let previousEp, nextEp, thisEp, Ep;

    if (smart && this.state.SmartRepere) {
      const { AnimToWatch } = { ...this.state };
      const saisonIndex = parseInt(Saison.name.split(" ")[1]) - 1;
      let lastOne = null;
      AnimToWatch.AnimEP[saisonIndex].Episodes[idEp - 2].finished = true;

      AnimToWatch.AnimEP[saisonIndex].Episodes.forEach((Ep) => {
        if (!Ep.finished && lastOne === null) {
          lastOne = Ep.id;
        }
      });

      if (lastOne === null) {
        previousEp = idEp - 1;
        nextEp = idEp + 1;
        thisEp = idEp;
      } else {
        previousEp = lastOne - 1;
        nextEp = lastOne + 1;
        thisEp = lastOne;
      }

      for (Ep of Saison.Episodes) {
        if (Ep.id === previousEp) {
          previousEp = Ep;
        } else if (Ep.id === thisEp) {
          thisEp = Ep;
        } else if (Ep.id === nextEp) {
          nextEp = Ep;
        }
      }
    } else {
      previousEp = idEp - 1;
      nextEp = idEp + 1;
      thisEp = idEp;

      for (Ep of Saison.Episodes) {
        if (Ep.id === previousEp) {
          previousEp = Ep;
        } else if (Ep.id === thisEp) {
          thisEp = Ep;
        } else if (Ep.id === nextEp) {
          nextEp = Ep;
        }
      }
    }
    if (typeof previousEp === "number") previousEp = null;
    if (typeof nextEp === "number") nextEp = null;

    this.setState({
      repereEpisode: [previousEp, thisEp, nextEp],
      repereSaison: Saison,
    });
    if (addObjectif) {
      this.setState({
        ShowModalAddObjectif: true,
        nbEpObjectif: this.CalculateWhereStop()[1] + 1,
      });
    }
  };

  endAnime = () => {
    const { id, AnimToWatch } = this.state;

    this.updateValue(
      `${this.state.Pseudo}/serie/${id}`,
      {
        finishedAnim: true,
        AnimeSeason: null,
        Info: {
          Begin: AnimToWatch?.Info?.Begin ? AnimToWatch.Info.Begin : null,
          End: Date.now(),
        },
      },
      () => this.setState({ ShowModalRateAnime: true })
    );

    if (!this.state.OfflineMode) {
      this.fnDbOffline("PUT", `${this.state.Pseudo}/serie/${id}`, {
        finishedAnim: true,
        AnimeSeason: null,
        Info: {
          Begin: AnimToWatch?.Info?.Begin ? AnimToWatch.Info.Begin : null,
          End: Date.now(),
        },
      });
    }

    this.StopModeWatch();
  };

  endOfSaison = (idSaison) => {
    const { id, repereEpisode } = this.state;

    this.updateValue(`${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}`, {
      finished: true,
    });

    if (!this.state.OfflineMode) {
      this.fnDbOffline(
        "PUT",
        `${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}`,
        {
          finished: true,
        }
      );
    }

    if (repereEpisode[2] === null) this.StopModeWatch();
  };

  verifiedEPRepere = (Season, modeEnd) => {
    let { AnimToWatch } = this.state;
    const idSeason = parseInt(Season.name.split(" ")[1]) - 1;

    // Last Season
    let SeasonFinished = true,
      AnimeFinished = true;

    const Verified = (forcedStopMode) => {
      AnimToWatch.AnimEP[idSeason].Episodes.forEach((EP) => {
        if (!EP.finished) SeasonFinished = false;
      });
      AnimToWatch.AnimEP.forEach((Saison) => {
        Saison.Episodes.forEach((EP) => {
          if (!EP.finished) AnimeFinished = false;
        });
      });

      if (forcedStopMode) this.StopModeWatch();
      if (SeasonFinished) this.endOfSaison(idSeason);
      if (AnimeFinished) this.endAnime();
    };

    if (modeEnd) {
      this.finishedEp(
        Season,
        Season.Episodes[Season.Episodes.length - 1].id + 1,
        false,
        () => {
          AnimToWatch = this.state.AnimToWatch;
          Verified(true);
        }
      );
    } else {
      Verified(false);
    }
  };

  finishedEp = (Saison, EpFinishedID, verified = true, next = null) => {
    const {
      Pseudo,
      id,
      AnimToWatch,
      repereEpisode,
      repereSaison,
      AlreadyClicked,
    } = this.state;
    const idSaison = parseInt(Saison.name.split(" ")[1]) - 1;

    if (!AnimToWatch.AnimEP[idSaison].Episodes[EpFinishedID - 2].finished) {
      let IsFirstWatch = true;
      if (AnimToWatch.NewEpMode)
        this.updateValue(`${Pseudo}/serie/${id}`, { NewEpMode: null });

      AnimToWatch.AnimEP.forEach((Season) => {
        Season.Episodes.forEach((EP) => {
          if (EP.finished) IsFirstWatch = false;
        });
      });

      if (IsFirstWatch)
        this.updateValue(`${Pseudo}/serie/${id}/Info`, { Begin: Date.now() });

      this.updateValue(
        `${Pseudo}/serie/${id}/AnimEP/${idSaison}/Episodes/${EpFinishedID - 2}`,
        { finished: true },
        () => {
          if (verified) this.verifiedEPRepere(Saison, false);
          if (next !== null) next();

          this.setState(
            {
              SecondMessage: AlreadyClicked ? true : false,
              AlreadyClicked: true,
            },
            () =>
              this.DisplayMsg(
                `Episode ${repereEpisode[1].id}(S${
                  Object.keys(repereSaison).length === 0
                    ? null
                    : repereSaison.name.split(" ")[1]
                }) fini !`,
                3000,
                "success"
              )
          );
        },
        true
      );

      if (!this.state.OfflineMode) {
        if (AnimToWatch.NewEpMode)
          this.fnDbOffline("PUT", `${Pseudo}/serie/${id}`, {
            NewEpMode: null,
          });
        if (IsFirstWatch)
          this.fnDbOffline("POST", `${Pseudo}/serie/${id}/Info`, {
            Begin: Date.now(),
          });
        this.fnDbOffline(
          "PUT",
          `${Pseudo}/serie/${id}/AnimEP/${idSaison}/Episodes/${
            EpFinishedID - 2
          }`,
          { finished: true }
        );
      }
    } else {
      this.setState(
        {
          SecondMessage: AlreadyClicked ? true : false,
          AlreadyClicked: true,
        },
        () =>
          this.DisplayMsg(
            `Episode ${repereEpisode[1].id}(S${
              Object.keys(repereSaison).length === 0
                ? null
                : repereSaison.name.split(" ")[1]
            }) déjà fini`,
            3000,
            "warn"
          )
      );
    }
    if (
      AnimToWatch.Objectif !== undefined &&
      this.CalculateWhereStop()[1] + 1 === AnimToWatch.Objectif.End[1]
    ) {
      this.deleteValue(`${Pseudo}/serie/${id}/Objectif`);
      if (!this.state.OfflineMode) {
        this.fnDbOffline("DELETE", `${Pseudo}/serie/${id}/Objectif`);
      }
      this.StopModeWatch();
      this.setState({ LetsCelebrate: true });
    }
  };

  StartNextEP = (Saison = null, EpFinishedID = null) => {
    if (Saison !== null && EpFinishedID !== null) {
      this.finishedEp(Saison, EpFinishedID);
      this.setRepere(Saison, EpFinishedID, true);
    } else {
      const { AnimToWatch, SmartRepere } = this.state;
      let lastOne = null,
        BackUpLastOne = null;

      AnimToWatch?.AnimEP?.forEach((Season) => {
        Season.Episodes.forEach((Ep) => {
          if (SmartRepere && lastOne !== null && Ep.finished) lastOne = null;
          if (!Ep.finished && lastOne === null) {
            lastOne = BackUpLastOne = [Season, Ep.id];
          }
        });
      });

      if (!lastOne && !BackUpLastOne) return this.endAnime();
      if (!lastOne && BackUpLastOne) lastOne = BackUpLastOne;

      try {
        this.setRepere(lastOne[0], lastOne[1]);
      } catch (error) {
        this.setRepere(AnimToWatch.AnimEP[0], 1);
      }
      this.StartModeWatch();
    }
  };

  playEp = (Saison, idEp) => {
    this.setRepere(Saison, idEp);
    this.StartModeWatch();
  };

  EndFilm = () => {
    const { id } = this.state;

    this.updateValue(
      `${this.state.Pseudo}/film/${id}`,
      {
        finished: true,
        Info: {
          Watched: Date.now(),
        },
      },
      () => this.setState({ ShowModalRateAnime: true })
    );

    if (!this.state.OfflineMode) {
      this.fnDbOffline("PUT", `${this.state.Pseudo}/film/${id}`, {
        finished: true,
        Info: {
          Watched: Date.now(),
        },
      });
    }

    this.StopModeWatch();
  };

  addObjectif = () => {
    const {
      Pseudo,
      AnimToWatch,
      type,
      repereSaison,
      DateObjectif,
      id,
      nbEpObjectif,
    } = this.state;
    if (
      type !== "serie" ||
      AnimToWatch.AnimeSeason === true ||
      typeof nbEpObjectif !== "number" ||
      nbEpObjectif <= this.CalculateWhereStop()[1]
    )
      return;
    this.updateValue(`${Pseudo}/serie/${id}`, {
      Objectif: {
        Begin: [
          parseInt(repereSaison.name.split(" ")[1]),
          this.CalculateWhereStop()[1],
          Date.now(),
        ],
        End: [
          parseInt(repereSaison.name.split(" ")[1]),
          nbEpObjectif,
          new Date(DateObjectif).getTime(),
        ],
      },
    });
    if (!this.state.OfflineMode) {
      this.fnDbOffline("PUT", `${Pseudo}/serie/${id}`, {
        Objectif: {
          Begin: [
            parseInt(repereSaison.name.split(" ")[1]),
            this.CalculateWhereStop()[1],
            Date.now(),
          ],
          End: [
            parseInt(repereSaison.name.split(" ")[1]),
            nbEpObjectif,
            new Date(DateObjectif).getTime(),
          ],
        },
      });
    }
    this.setState({ ShowModalAddObjectif: false, nbEpObjectif: 1 });
  };

  handleDelete = () => {
    const { Pseudo, type, id, AnimToWatch } = this.state;

    if (AnimToWatch.Lier) {
      this.deleteValue(`${Pseudo}/Notif/${AnimToWatch.Lier}`);
      if (!this.state.OfflineMode) {
        this.fnDbOffline("DELETE", `${Pseudo}/Notif/${AnimToWatch.Lier}`);
      }
    }

    this.deleteValue(`${Pseudo}/${type}/${id}`);
    if (!this.state.OfflineMode) {
      this.fnDbOffline("DELETE", `${Pseudo}/${type}/${id}`);
    }
    this.setState({ uid: null, RedirectTo: [true, "/notifuser/5"] });
  };

  handleDeleteBadge = (index) => {
    const { Badges, Pseudo, type, id } = this.state;
    Badges.splice(index, 1);
    this.updateValue(`${Pseudo}/${type}/${id}`, { Badge: Badges });
    if (!this.state.OfflineMode) {
      if (Badges.length === 0) {
        this.fnDbOffline("DELETE", `${Pseudo}/${type}/${id}/Badge`);
        return;
      }

      this.fnDbOffline("PUT", `${Pseudo}/${type}/${id}`, { Badge: Badges });
    }
  };

  addBadge = (event) => {
    event.preventDefault();
    const { Pseudo, type, id, Badges, NewBadgeName } = this.state;
    if (
      event.target.id !== undefined &&
      (event.target.id === "InputNbadgeReperage" ||
        event.target.id === "InputBadgeStreaming")
    )
      return;
    if (typeof NewBadgeName === "string" && NewBadgeName.trim().length !== 0) {
      window.removeEventListener("click", this.addBadge, false);
      this.updateValue(`${Pseudo}/${type}/${id}`, {
        Badge: [...Badges, NewBadgeName],
      });
      if (!this.state.OfflineMode) {
        this.fnDbOffline("PUT", `${Pseudo}/${type}/${id}`, {
          Badge: [...Badges, NewBadgeName],
        });
      }
      this.setState({ ShowFormBadge: false, NewBadgeName: "" });
    } else if (this.FirstBadge) {
      this.FirstBadge = false;
    } else {
      this.FirstBadge = true;
      window.removeEventListener("click", this.addBadge, false);
      this.setState({ ShowFormBadge: false, NewBadgeName: "" });
    }
  };

  handleAlleger = () => {
    const { Pseudo, type, id, PauseWithAlleged, DropWithAlleged, AnimToWatch } =
      this.state;

    if (type === "serie") {
      if (AnimToWatch.Lier) {
        this.deleteValue(`${Pseudo}/Notif/${AnimToWatch.Lier}`);
      }
      this.updateValue(`${Pseudo}/serie/${id}`, {
        AnimEP: null,
        Badge: null,
        Lier: null,
        DurationPerEP: null,
        NewEpMode: null,
        InWait: null,
        AnimeSeason: null,
        Paused: PauseWithAlleged ? true : null,
        Drop: DropWithAlleged ? true : null,
      });
      if (!this.state.OfflineMode) {
        this.fnDbOffline("PUT", `${Pseudo}/serie/${id}`, {
          AnimEP: null,
          Badge: null,
          Lier: null,
          DurationPerEP: null,
          NewEpMode: null,
          InWait: null,
          AnimeSeason: null,
          Paused: PauseWithAlleged ? true : null,
          Drop: DropWithAlleged ? true : null,
        });
      }
      this.setState({ uid: null, RedirectTo: [true, "/notifuser/5"] });
    }
  };

  ChangeTitle = (event) => {
    event.preventDefault();
    const { Pseudo, type, id, Newtitle } = this.state;
    if (
      event.target.id !== undefined &&
      event.target.id === "InputNTitleReperage"
    )
      return;

    if (typeof Newtitle === "string" && Newtitle.trim().length !== 0) {
      window.removeEventListener("click", this.ChangeTitle, false);
      this.setState({ ModeEditTitle: false });
      this.updateValue(
        `${Pseudo}/${type}/${id}`,
        {
          name: Newtitle,
        },
        this.ReTakeInfoFromName
      );
      if (!this.state.OfflineMode) {
        this.fnDbOffline("PUT", `${Pseudo}/${type}/${id}`, {
          name: Newtitle,
        });
      }
    }
  };

  DisplayMsg = (msg, time, type) => {
    clearTimeout(this.setTimeOutMsgInfo);
    clearTimeout(this.setTimeOutMsgInfo2);

    this.setState({
      ShowMessage: true,
      ShowMessageHtml: true,
      ResText: msg,
      typeAlertMsg: type,
    });
    this.setTimeOutMsgInfo = setTimeout(() => {
      if (this.state.SecondMessage) {
        this.setState({ SecondMessage: false });
        return;
      }

      this.setState({
        ShowMessage: false,
        AlreadyClicked: false,
      });

      this.setTimeOutMsgInfo2 = setTimeout(() => {
        this.setState({
          ShowMessageHtml: false,
          ResText: null,
          typeAlertMsg: null,
        });
      }, 900);
    }, time);
  };

  RemoveAnimVal = (typeRemove, idSeason, idEP) => {
    const { Pseudo, id, AnimToWatch } = this.state;

    if (typeRemove === "EP") {
      if (idEP === 1) {
        if (AnimToWatch.AnimEP.length === 1) {
          this.setState({ ShowModalVerification: [true, "supprimer"] });
          return;
        }
        if (idSeason === AnimToWatch.AnimEP.length - 1) {
          this.deleteValue(`${Pseudo}/serie/${id}/AnimEP/${idSeason}`);
          if (!this.state.OfflineMode) {
            this.fnDbOffline(
              "DELETE",
              `${Pseudo}/serie/${id}/AnimEP/${idSeason}`
            );
          }
        }
        return;
      }

      if (idEP === AnimToWatch.AnimEP[idSeason].Episodes.length) {
        let IsSeasonFinished = true;
        AnimToWatch.AnimEP[idSeason].Episodes.forEach((Ep) => {
          if (Ep.id === idEP) return;
          if (!Ep.finished) {
            IsSeasonFinished = false;
          }
        });

        if (IsSeasonFinished) this.endOfSaison(idSeason);
        if (IsSeasonFinished && idSeason === AnimToWatch.AnimEP.length - 1)
          this.endAnime();

        this.deleteValue(
          `${Pseudo}/serie/${id}/AnimEP/${idSeason}/Episodes/${idEP - 1}`
        );
        if (!this.state.OfflineMode) {
          this.fnDbOffline(
            "DELETE",
            `${Pseudo}/serie/${id}/AnimEP/${idSeason}/Episodes/${idEP - 1}`
          );
        }
      }
    } else {
      if (AnimToWatch.AnimEP.length === 1) {
        this.setState({ ShowModalVerification: [true, "supprimer"] });
        return;
      }

      if (idSeason === AnimToWatch.AnimEP.length - 1) {
        this.deleteValue(`${Pseudo}/serie/${id}/AnimEP/${idSeason}`);
        if (!this.state.OfflineMode) {
          this.fnDbOffline(
            "DELETE",
            `${Pseudo}/serie/${id}/AnimEP/${idSeason}`
          );
        }
      }
    }
  };

  derterminateEpTotal = (TotalInSeason = null) => {
    const { AnimToWatch, repereEpisode, repereSaison } = this.state;
    if (TotalInSeason !== null) {
      return AnimToWatch.AnimEP[parseInt(TotalInSeason.name.split(" ")[1]) - 1]
        .Episodes.length;
    }
    const IDSaison = parseInt(repereSaison.name.split(" ")[1]);
    return AnimToWatch.AnimEP.reduce((acc, currentValue) => {
      if (parseInt(currentValue.name.split(" ")[1]) < IDSaison) {
        return acc + currentValue.Episodes.length;
      }
      return acc + 0;
    }, repereEpisode[1].id);
  };

  CalculateWhereStop = () => {
    const { AnimToWatch } = this.state;
    let RepereStop = [];
    AnimToWatch.AnimEP.forEach((Saison) => {
      Saison.Episodes.forEach((Ep) => {
        if (Ep.finished && Ep.id !== Saison.Episodes.length)
          RepereStop = [Saison.name.split(" ")[1], Ep.id];
        else if (Ep.finished)
          RepereStop = [
            (parseInt(Saison.name.split(" ")[1]) + 1).toString(),
            0,
          ];
      });
    });
    return RepereStop.length === 0 ? ["1", 0] : RepereStop;
  };

  CalculateProgressionAnime = () => {
    const { AnimToWatch } = this.state;
    const TotalEP = AnimToWatch.AnimEP.reduce((acc, currentValue) => {
      return acc + currentValue.Episodes.length;
    }, 0);

    let nbEpFinished = 0;
    AnimToWatch.AnimEP.forEach((Season) => {
      Season.Episodes.forEach((Ep) => {
        if (Ep.finished) nbEpFinished++;
      });
    });

    return nbEpFinished === 0 ? 0 : Math.round((nbEpFinished / TotalEP) * 100);
  };

  CalculateNbTimeAnime = () => {
    const { AnimToWatch } = this.state;

    if (
      typeof AnimToWatch.DurationPerEP !== "string" ||
      AnimToWatch.DurationPerEP === "none"
    )
      return "0";

    return parseFloat(
      (AnimToWatch.AnimEP.reduce(
        (acc, currentValue) => acc + currentValue.Episodes.length,
        0
      ) *
        parseInt(AnimToWatch.DurationPerEP.split(" ")[0])) /
        60
    ).toFixed(1);
  };

  CalculateTimeDifference = (date1, date2) => {
    const Date1 = new Date(date1),
      Date2 = new Date(date2);
    const DifferenceInTime = Date2.getTime() - Date1.getTime();
    if (DifferenceInTime / (1000 * 3600 * 24) > 1)
      return `${Math.round(DifferenceInTime / (1000 * 3600 * 24))} Jours`;
    else if (DifferenceInTime / 3600000 > 1) {
      return `${Math.round(DifferenceInTime / 3600000)} Heures`;
    } else if (DifferenceInTime / 60000 > 1) {
      return `${Math.round(DifferenceInTime / 60000)} Minutes`;
    } else {
      return `${Math.round(DifferenceInTime / 1000)} Secondes`;
    }
  };

  ShareFinishedAnime = () => {
    if (this.state.OfflineMode === false) {
      try {
        const rand = () => Math.random(0).toString(36).substr(2);
        const token = (length) => {
          let ToReturn = (rand() + rand() + rand() + rand()).substr(0, length);
          while (ToReturn.includes("-")) {
            ToReturn = (rand() + rand() + rand() + rand()).substr(0, length);
          }
          return ToReturn;
        };
        const { Pseudo, AnimToWatch, type } = this.state;
        const TokenTemplate = `${Pseudo.split("")
          .reverse()
          .join("")}-Template-${Date.now()}${token(30)}${(Math.random() * 1000)
          .toString()
          .split(".")
          .join("")}`;

        let ArrEpSaison = null,
          durer = null;
        if (type === "serie") {
          ArrEpSaison = AnimToWatch.AnimEP.map((saisons) => {
            return saisons.Episodes.length;
          });
        } else {
          durer = AnimToWatch.durer;
        }
        this.addValue(`${Pseudo}/TemplateAnim/${TokenTemplate}`, {
          type,
          AnimEP: ArrEpSaison,
          durer,
          title: AnimToWatch.name,
          imageUrl: AnimToWatch.imageUrl,
        });
        // Share
        navigator
          .share({
            title: AnimToWatch.name,
            text: `${Pseudo} a fini ${AnimToWatch.name} ! Clické sur le lien pour vous aussi commencer cette anime !`,
            url: `https://myanimchecker.netlify.app/Template/${TokenTemplate}`,
          })
          .then(() => console.log("Successful share !"))
          .catch((err) => {
            console.error(err);
            this.deleteValue(`${Pseudo}/TemplateAnim/${TokenTemplate}`);
          });
      } catch (err) {
        console.error(
          "Share Failed: " +
            err +
            " (It's probably because your navigator doesn't support yet the share in Web, navigator like Chrome and opera Desktop, Firefox)"
        );
      }
    }
  };

  WhitchSeason = () => {
    const Month = new Date().getMonth() + 1;
    const Day = new Date().getDate();
    let season = null;
    switch (true) {
      case Month === 12 && Day >= 21:
      case Month === 1:
      case Month === 2:
        season = "snowflake";
        break;
      case Month === 3 && Day >= 20:
      case Month === 4:
      case Month === 5:
        season = "seedling";
        break;
      case Month === 6 && Day >= 20:
      case Month === 7:
      case Month === 8:
        season = "umbrella-beach";
        break;
      case Month === 9 && Day >= 22:
      case Month === 10:
      case Month === 11:
        season = "tree";
        break;
      default:
        break;
    }
    return season;
  };

  render() {
    const {
      Pseudo,
      AnimToWatch,
      Badges,
      uid,
      id,
      RedirectTo,
      proprio,
      type,
      isFirstTime,
      ShowModalRateAnime,
      LoadingModeAuth,
      Rate,
      ShowFormBadge,
      LetsCelebrate,
      NewBadgeName,
      DateObjectif,
      nbEpToAddToHave,
      LetsNotCelebrate,
      typeAlertMsg,
      modeWatch,
      ShowModalVerification,
      ShowMessage,
      ShowMessageHtml,
      ResText,
      OpenDropDownAction,
      OpenDropDownAlleger,
      ToggleNavbar,
      ActionEndAnime,
      repereEpisode,
      ShowModalAddObjectif,
      nbEpObjectif,
      Newtitle,
      repereSaison,
      ToOpen,
      LoadingMode,
      ModeEditTitle,
      ShowModalAddEp,
      nbEpToAdd,
      SeasonToAddEp,
      ShowModalAddSeasonEp,
    } = this.state;

    if (!Pseudo || typeof Pseudo !== "string")
      return <Redirect to="/notifuser/2" />;
    if (
      Object.keys(AnimToWatch).length !== 0 &&
      !AnimToWatch.AnimEP &&
      type === "serie"
    )
      return <Redirect to="/notifuser/9" />;
    if (AnimToWatch.Paused) return <Redirect to="/notifuser/1" />;
    if (AnimToWatch.Drop) return <Redirect to="/notifuser/7" />;
    if (AnimToWatch.InWait) return <Redirect to="/notifuser/8" />;
    if (RedirectTo[0]) return <Redirect to={RedirectTo[1]} />;

    if (LoadingMode || LoadingModeAuth) {
      return (
        <section id="WatchSkeleton">
          <header>
            <div id="STitle"></div>
            <div id="SImg"></div>
          </header>
          <section id="SToWatch">
            <div id="SBtnAction"></div>
            <div id="SBadges"></div>
            <div id="SText"></div>
            <div id="Scontent">
              {type === "film" ? (
                <div id="Sfilm">
                  <span className="fas fa-play"></span>
                </div>
              ) : (
                <div id="Saccordeon"></div>
              )}
            </div>
          </section>
        </section>
      );
    }

    if (uid !== proprio || !uid || !proprio)
      return <Redirect to="/notifuser/3" />;

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
        <ContextSchema.Provider
          key={Date.now() + Math.random() * 100000 - Math.random() * -100000}
          value={{
            play: (id) => this.playEp(EpSaison, id),
            RemoveEP: (typeSuppr, idSeason, idEP) =>
              this.RemoveAnimVal(typeSuppr, idSeason, idEP),
            ReverseEP: (idSaison, idEP) => {
              const AnimToWatchCopy = [...this.state.AnimToWatch.AnimEP];
              let IsSeasonFinished = true;
              AnimToWatchCopy[idSaison].finished = false;
              AnimToWatchCopy[idSaison].Episodes[idEP - 1].finished =
                !AnimToWatchCopy[idSaison].Episodes[idEP - 1].finished;

              AnimToWatchCopy[idSaison].Episodes.forEach((Ep) => {
                if (!Ep.finished) {
                  IsSeasonFinished = false;
                }
              });

              if (IsSeasonFinished) AnimToWatchCopy[idSaison].finished = true;
              else if (AnimToWatchCopy[idSaison].finished)
                AnimToWatchCopy[idSaison].finished = false;

              if (IsSeasonFinished && idSaison === AnimToWatchCopy.length - 1)
                this.endAnime();
              else if (idSaison === AnimToWatchCopy.length - 1) {
                this.updateValue(`${Pseudo}/serie/${id}`, {
                  finishedAnim: false,
                });
                if (!this.state.OfflineMode) {
                  this.fnDbOffline("PUT", `${Pseudo}/serie/${id}`, {
                    finishedAnim: false,
                  });
                }
              }

              this.updateValue(`${Pseudo}/serie/${id}`, {
                AnimEP: AnimToWatchCopy,
              });
              if (!this.state.OfflineMode) {
                this.fnDbOffline("PUT", `${Pseudo}/serie/${id}`, {
                  AnimEP: AnimToWatchCopy,
                });
              }
            },
            ImgUrl: AnimToWatch.imageUrl,
            Duration: AnimToWatch.DurationPerEP,
          }}
        >
          <AnimEpCo
            key={Date.now() + Math.random() * 100000 - Math.random() * -100000}
            ObjInfo={EpSaison}
            nbTotalSeason={AnimToWatch.AnimEP.length}
            ToOpen={ToOpen}
            AddEp={() =>
              this.setState({
                ShowModalAddEp: true,
                SeasonToAddEp: EpSaison,
                nbEpToAddToHave: [this.derterminateEpTotal(EpSaison) + 1, 1],
              })
            }
            NextToOpen={(SaisonName) => {
              if (SaisonName === ToOpen) {
                this.setState({ ToOpen: "" });
                return;
              }
              this.setState({ ToOpen: SaisonName });
            }}
          />
        </ContextSchema.Provider>
      ));
    }

    if (Badges.length !== 0) {
      BadgesHtml = Badges.map((value, i) => {
        if (value.toLowerCase() === "adn") {
          return (
            <Badge key={i} className="BadgesME" variant="primary">
              <a
                href="https://animedigitalnetwork.fr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={ADNLogo} alt="ADNLogo" />
                <div
                  id="CancelBadge"
                  onClick={(event) => {
                    event.preventDefault();
                    this.handleDeleteBadge(i);
                  }}
                >
                  <span className="fas fa-times"></span>
                </div>
              </a>
            </Badge>
          );
        } else if (
          value.toLowerCase() === "voiranime" ||
          value.toLowerCase() === "voiranime.com"
        ) {
          return (
            <Badge key={i} className="BadgesME" variant="dark">
              <a
                href="https://voiranime.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={VoirAnimeLogo} alt="VoirAnimeLogo" />
                <div
                  id="CancelBadge"
                  onClick={(event) => {
                    event.preventDefault();
                    this.handleDeleteBadge(i);
                  }}
                >
                  <span className="fas fa-times"></span>
                </div>
              </a>
            </Badge>
          );
        } else if (
          value.toLowerCase() === "9anime" ||
          value.toLowerCase() === "9anime.to"
        ) {
          return (
            <Badge key={i} className="BadgesME" variant="light">
              <a
                href="https://www13.9anime.to/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={NineAnimeLogo} alt="NineAnimeLogo" />
                <div
                  id="CancelBadge"
                  onClick={(event) => {
                    event.preventDefault();
                    this.handleDeleteBadge(i);
                  }}
                >
                  <span className="fas fa-times"></span>
                </div>
              </a>
            </Badge>
          );
        } else if (value.toLowerCase() === "crunchyroll") {
          return (
            <Badge key={i} className="BadgesME" variant="light">
              <a
                href="https://www.crunchyroll.com/fr"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={CrunchyrollLogo} alt="CrunchyrollLogo" />
                <div
                  id="CancelBadge"
                  onClick={(event) => {
                    event.preventDefault();
                    this.handleDeleteBadge(i);
                  }}
                >
                  <span className="fas fa-times"></span>
                </div>
              </a>
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
            >
              <a
                href="http://www.mavanimes.co/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={MavLogo} alt="MavLogo" />
                <div
                  id="CancelBadge"
                  onClick={(event) => {
                    event.preventDefault();
                    this.handleDeleteBadge(i);
                  }}
                >
                  <span className="fas fa-times"></span>
                </div>
              </a>
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
            <Badge key={i} className="BadgesME" variant="primary">
              <a
                href="https://neko-sama.fr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={NekoSamaLogo} alt="NekoSamaLogo" />
                <div
                  id="CancelBadge"
                  onClick={(event) => {
                    event.preventDefault();
                    this.handleDeleteBadge(i);
                  }}
                >
                  <span className="fas fa-times"></span>
                </div>
              </a>
            </Badge>
          );
        } else if (value.toLowerCase() === "netflix") {
          return (
            <Badge key={i} className="BadgesME" variant="dark">
              <a
                href="https://www.netflix.com/fr/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={NetflixLogo} alt="NetflixLogo" />
                <div
                  id="CancelBadge"
                  onClick={(event) => {
                    event.preventDefault();
                    this.handleDeleteBadge(i);
                  }}
                >
                  <span className="fas fa-times"></span>
                </div>
              </a>
            </Badge>
          );
        } else if (value.toLowerCase() === "wakanim") {
          return (
            <Badge key={i} className="BadgesME" variant="dark">
              <a
                href="https://www.wakanim.tv/fr/v2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={WakanimLogo} alt="WakanimLogo" />
                <div
                  id="CancelBadge"
                  onClick={(event) => {
                    event.preventDefault();
                    this.handleDeleteBadge(i);
                  }}
                >
                  <span className="fas fa-times"></span>
                </div>
              </a>
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
            style={{
              background: `rgb(${rdaColor[0]},${rdaColor[1]},${rdaColor[2]})`,
              color: grayScaleRdaColor < 128 ? "#fff" : "#212529",
            }}
          >
            <a
              href={`http://${value}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div id="ValueBadge">{value}</div>
              <div
                id="CancelBadge"
                onClick={(event) => {
                  event.preventDefault();
                  this.handleDeleteBadge(i);
                }}
              >
                <span className="fas fa-times"></span>
              </div>
            </a>
          </Badge>
        );
      });
    }

    return (
      <section id="Watch">
        <nav
          id="SideBarMenu"
          className={
            (!ToggleNavbar && !window.mobileAndTabletCheck()) || modeWatch
              ? "closeModal"
              : ""
          }
        >
          <ul id="NavContent">
            <li className="NavItem" title="Retour">
              <Link push="true" to="/">
                <button className="NavLink">
                  <span className="fas fa-long-arrow-alt-left NavIcon"></span>
                  <span className="linkText">Retour</span>
                </button>
              </Link>
            </li>
            <li
              className={`NavItem NavDropDown${
                OpenDropDownAction ? " active" : ""
              }${OpenDropDownAlleger ? " activeSecond" : ""}`}
              title="Actions"
            >
              <button
                className="NavLink btnAgrandir"
                onClick={() =>
                  this.setState({ OpenDropDownAction: !OpenDropDownAction })
                }
              >
                <span
                  className={`fas fa-chevron-${
                    !window.mobileAndTabletCheck()
                      ? OpenDropDownAction
                        ? "up"
                        : "down"
                      : OpenDropDownAction
                      ? "left"
                      : "right"
                  } NavIcon`}
                ></span>
                <span className="linkText">
                  {OpenDropDownAction ? "Réduire" : "Agrandir"}
                </span>
              </button>

              {type === "serie" ? (
                <Fragment>
                  <li className="DropDownItem">
                    <button
                      className="NavLink"
                      onClick={() =>
                        this.setState({ ShowModalAddSeasonEp: true })
                      }
                    >
                      <span className="fas fa-plus NavIcon"></span>{" "}
                      <span className="linkText">Nouvelle saison</span>
                    </button>
                  </li>
                  {AnimToWatch.AnimeSeason === true ? null : (
                    <li className="DropDownItem">
                      <button
                        className="NavLink"
                        onClick={() => {
                          this.setRepere(
                            AnimToWatch.AnimEP[
                              parseInt(this.CalculateWhereStop()[0]) - 1
                            ],
                            this.CalculateWhereStop()[1],
                            false,
                            true
                          );
                        }}
                      >
                        <span className="fas fa-bullseye NavIcon"></span>{" "}
                        <span className="linkText">Objectif</span>
                      </button>
                    </li>
                  )}
                  <li className="DropDownItem">
                    <button
                      className="NavLink"
                      onClick={() => {
                        this.updateValue(
                          `${this.state.Pseudo}/serie/${id}`,
                          {
                            AnimeSeason: AnimToWatch.AnimeSeason ? null : true,
                          },
                          () =>
                            this.DisplayMsg(
                              "Changement opéré !",
                              3000,
                              "success"
                            )
                        );

                        if (!this.state.OfflineMode) {
                          this.fnDbOffline(
                            "PUT",
                            `${this.state.Pseudo}/serie/${id}`,
                            {
                              AnimeSeason: AnimToWatch.AnimeSeason
                                ? null
                                : true,
                            }
                          );
                        }
                      }}
                    >
                      <span
                        className={`fas fa-${this.WhitchSeason()} NavIcon`}
                      ></span>{" "}
                      <span className="linkText">
                        {AnimToWatch.AnimeSeason
                          ? "Anime Normal"
                          : "Anime de saison"}
                      </span>
                    </button>
                  </li>
                </Fragment>
              ) : null}
              {AnimToWatch.finished || AnimToWatch.finishedAnim ? (
                <li className="DropDownItem">
                  <button
                    className="NavLink"
                    onClick={() =>
                      this.setState({
                        ShowModalRateAnime: true,
                      })
                    }
                  >
                    <span className="fas fa-star NavIcon"></span>{" "}
                    <span className="linkText">Changer la note</span>
                  </button>
                </li>
              ) : null}
              <li className="DropDownItem">
                <button
                  className="NavLink"
                  onClick={() => {
                    this.updateValue(`${Pseudo}/${type}/${id}`, {
                      InWait: true,
                    });
                    if (!this.state.OfflineMode) {
                      this.fnDbOffline("PUT", `${Pseudo}/${type}/${id}`, {
                        InWait: true,
                      });
                    }
                    this.setState({
                      uid: null,
                      RedirectTo: [true, "/notifuser/5"],
                    });
                  }}
                >
                  <span className="fas fa-hourglass-half NavIcon"></span>{" "}
                  <span className="linkText">Mettre en attente</span>
                </button>
              </li>
              {AnimToWatch.finished === false ||
              AnimToWatch.finishedAnim === false ? (
                <li className="DropDownItem">
                  <button
                    className="NavLink"
                    onClick={() => {
                      this.updateValue(`${this.state.Pseudo}/${type}/${id}`, {
                        Drop: true,
                        Paused: null,
                        InWait: null,
                        AnimeSeason: null,
                        Lier: null,
                        NewEpMode: null,
                      });
                      if (!this.state.OfflineMode) {
                        this.fnDbOffline(
                          "PUT",
                          `${this.state.Pseudo}/${type}/${id}`,
                          {
                            Drop: true,
                            Paused: null,
                            InWait: null,
                            AnimeSeason: null,
                            Lier: null,
                            NewEpMode: null,
                          }
                        );
                      }
                      this.setState({
                        uid: null,
                        RedirectTo: [true, "/notifuser/5"],
                      });
                    }}
                  >
                    <span className="fas fa-stop NavIcon"></span>{" "}
                    <span className="linkText">Drop</span>
                  </button>
                </li>
              ) : null}
              <li className="DropDownItem">
                <button
                  className="NavLink"
                  onClick={() => {
                    this.updateValue(`${this.state.Pseudo}/${type}/${id}`, {
                      Paused: true,
                      Drop: null,
                      InWait: null,
                      AnimeSeason: null,
                      Lier: null,
                      NewEpMode: null,
                    });
                    if (!this.state.OfflineMode) {
                      this.fnDbOffline(
                        "PUT",
                        `${this.state.Pseudo}/${type}/${id}`,
                        {
                          Paused: true,
                          Drop: null,
                          InWait: null,
                          AnimeSeason: null,
                          Lier: null,
                          NewEpMode: null,
                        }
                      );
                    }
                    this.setState({
                      uid: null,
                      RedirectTo: [true, "/notifuser/5"],
                    });
                  }}
                >
                  <span className="fas fa-pause NavIcon"></span>{" "}
                  <span className="linkText">Mettre en Pause</span>
                </button>
              </li>
              {type === "serie" ? (
                <Fragment>
                  <li className="DropDownItem">
                    <button
                      className="NavLink"
                      onClick={this.ReTakeInfoFromName}
                    >
                      <span className="fas fa-undo-alt NavIcon">
                        <sup className="fas fa-info NavIconLittle"></sup>
                      </span>{" "}
                      <span className="linkText">Infos de l'anime</span>
                    </button>
                  </li>
                  <li className="DropDownItem">
                    <button
                      className="NavLink"
                      onClick={() =>
                        this.setState({
                          OpenDropDownAlleger: !OpenDropDownAlleger,
                        })
                      }
                    >
                      <span
                        className={`fas fa-chevron-${
                          !window.mobileAndTabletCheck()
                            ? OpenDropDownAlleger
                              ? "up"
                              : "down"
                            : OpenDropDownAlleger
                            ? "left"
                            : "right"
                        } NavIcon`}
                      ></span>
                      <span className="linkText">Alléger</span>
                    </button>
                  </li>
                  {OpenDropDownAlleger ? (
                    <Fragment>
                      <li className="DropDownItem">
                        <button
                          className="NavLink"
                          onClick={() =>
                            this.setState({
                              ShowModalVerification: [true, "alleger"],
                            })
                          }
                        >
                          <span className="fas fa-file-archive NavIcon"></span>{" "}
                          <span className="linkText">Alléger</span>
                        </button>
                      </li>
                      {!AnimToWatch.finishedAnim ? (
                        <li className="DropDownItem">
                          <button
                            className="NavLink"
                            onClick={() =>
                              this.setState({
                                DropWithAlleged: true,
                                ShowModalVerification: [true, "alleger"],
                              })
                            }
                          >
                            <span className="fas fa-file-archive NavIcon">
                              <sup className="fas fa-stop NavIconLittle"></sup>
                            </span>{" "}
                            <span className="linkText">Alléger et Drop</span>
                          </button>
                        </li>
                      ) : null}
                      <li className="DropDownItem">
                        <button
                          className="NavLink"
                          onClick={() =>
                            this.setState({
                              PauseWithAlleged: true,
                              ShowModalVerification: [true, "alleger"],
                            })
                          }
                        >
                          <span className="fas fa-file-archive NavIcon">
                            <sup className="fas fa-pause NavIconLittle"></sup>
                          </span>{" "}
                          <span className="linkText">Alléger et pauser</span>
                        </button>
                      </li>
                    </Fragment>
                  ) : null}
                </Fragment>
              ) : null}
              <li className="DropDownItem">
                <button
                  className="NavLink"
                  onClick={() =>
                    this.setState({
                      ShowModalVerification: [true, "supprimer"],
                    })
                  }
                >
                  <span className="fas fa-trash-alt NavIcon"></span>{" "}
                  <span className="linkText">Supprimer</span>
                </button>
              </li>
            </li>
          </ul>
        </nav>
        <div
          id="MainWatchContent"
          className={
            modeWatch || LetsCelebrate
              ? `nonStartMod${
                  (!ToggleNavbar && !window.mobileAndTabletCheck()) || modeWatch
                    ? " closeModal"
                    : ""
                }`
              : `nonStartMod active${
                  !ToggleNavbar && !window.mobileAndTabletCheck()
                    ? " closeModal"
                    : ""
                }`
          }
        >
          <header>
            <button
              className={`ToogleNavBar${!ToggleNavbar ? " closeModal" : ""}`}
              onClick={() => this.setState({ ToggleNavbar: !ToggleNavbar })}
            >
              <span className="fas fa-angle-double-left"></span>{" "}
            </button>
            <h1
              onDoubleClick={() => {
                this.setState({ ModeEditTitle: true });
                window.addEventListener("click", this.ChangeTitle, false);
              }}
              className={`title${
                AnimToWatch.AnimeSeason && AnimToWatch.NewEpMode
                  ? " ModeNewEp"
                  : ""
              }`}
            >
              {ModeEditTitle ? (
                <Form onSubmit={this.ChangeTitle}>
                  <Form.Control
                    type="text"
                    required
                    suppressContentEditableWarning={true}
                    id="InputNTitleReperage"
                    value={Newtitle}
                    onChange={(event) =>
                      this.setState({ Newtitle: event.target.value })
                    }
                    placeholder="Nouveaux titre"
                  />
                </Form>
              ) : (
                AnimToWatch.name
              )}{" "}
            </h1>
            <div className="img">
              <img src={AnimToWatch.imageUrl} alt="Img of anim" />
              {AnimToWatch.Fav ? (
                <span
                  title="Retirer des Favoris"
                  className="FvBtn fas fa-heart"
                  onClick={() => {
                    this.updateValue(`${this.state.Pseudo}/${type}/${id}`, {
                      Fav: null,
                    });
                    if (!this.state.OfflineMode) {
                      this.fnDbOffline(
                        "DELETE",
                        `${this.state.Pseudo}/${type}/${id}/Fav`
                      );
                    }
                  }}
                ></span>
              ) : (
                <span
                  title="Ajouter aux Favoris"
                  className="FvBtn far fa-heart"
                  onClick={() => {
                    this.updateValue(`${this.state.Pseudo}/${type}/${id}`, {
                      Fav: true,
                    });
                    if (!this.state.OfflineMode) {
                      this.fnDbOffline(
                        "PUT",
                        `${this.state.Pseudo}/${type}/${id}`,
                        {
                          Fav: true,
                        }
                      );
                    }
                  }}
                ></span>
              )}
              {AnimToWatch.AnimeSeason && AnimToWatch.NewEpMode ? (
                <h3 id="NEWEPBadgeWatch">
                  <Badge variant="danger">NEW</Badge>
                </h3>
              ) : null}
              {AnimToWatch.Rate ? (
                <span
                  style={{ color: "gold" }}
                  className="RatingStar fas fa-star"
                >
                  {AnimToWatch.Rate}
                </span>
              ) : null}
              <div
                className={
                  AnimToWatch.Objectif !== undefined ? "play Objectif" : "play"
                }
                onClick={() => {
                  type === "serie" ? this.StartNextEP() : this.StartModeWatch();
                }}
              >
                <span className="fas fa-play"></span>
              </div>
            </div>
          </header>
          <section id="ToWatch">
            <div id="badgeStreaming">
              {ShowFormBadge ? (
                <Badge
                  variant="warning"
                  className="BadgesME"
                  id="InputBadgeStreaming"
                >
                  <Form onSubmit={this.addBadge}>
                    <Form.Control
                      type="text"
                      suppressContentEditableWarning={true}
                      autoComplete="off"
                      required
                      id="InputNbadgeReperage"
                      value={NewBadgeName}
                      onChange={(event) =>
                        this.setState({ NewBadgeName: event.target.value })
                      }
                      placeholder="Nom du site"
                    />
                  </Form>
                </Badge>
              ) : null}
              {BadgesHtml}
              <Badge
                pill
                className="BadgesME"
                variant="secondary"
                onClick={() => {
                  this.setState({ ShowFormBadge: true });
                  window.addEventListener("click", this.addBadge, false);
                }}
              >
                <span className="fas fa-plus-circle"></span>
              </Badge>
            </div>
            {type === "serie" ? (
              <Fragment>
                {AnimToWatch.Objectif !== undefined ? (
                  <div id="Objectif" className="ObjectifSectionID">
                    <div className="TitleObjectif">Objectif:</div>
                    <aside id="ObjectifEnd" title="Fin de l'objectif">
                      <span className="fas fa-bullseye"></span> S
                      <b>{AnimToWatch.Objectif.End[0]}</b> EP
                      <b>{AnimToWatch.Objectif.End[1]}</b>
                    </aside>
                    <div className="TitleObjectif">Prochain EP:</div>
                    <aside id="ObjectifNow">
                      <span
                        style={{ color: "#301c4d" }}
                        className="fas fa-play"
                      ></span>{" "}
                      S<b>{this.CalculateWhereStop()[0]}</b> EP
                      <b>
                        {this.CalculateWhereStop()[1] + 1 < 10
                          ? `0${this.CalculateWhereStop()[1] + 1}`
                          : this.CalculateWhereStop()[1] + 1}
                      </b>
                    </aside>
                    <div className="TitleObjectif">Progression:</div>
                    <aside id="ObjectifProgress">
                      {Math.round(
                        ((this.CalculateWhereStop()[1] -
                          AnimToWatch.Objectif.Begin[1]) /
                          (AnimToWatch.Objectif.End[1] -
                            AnimToWatch.Objectif.Begin[1])) *
                          100
                      )}{" "}
                      % de l'objectif
                    </aside>
                    <div className="TitleObjectif">Début il y a:</div>
                    <aside id="BeginAtObjectif">
                      <span className="fas fa-hourglass-half"></span>{" "}
                      {this.CalculateTimeDifference(
                        AnimToWatch.Objectif.Begin[2],
                        Date.now()
                      )}
                    </aside>
                    <div className="TitleObjectif">Fin dans:</div>
                    <aside id="BeginAtObjectif">
                      <span className="fas fa-hourglass-end"></span>{" "}
                      {new Date(
                        AnimToWatch.Objectif.End[2]
                      ).toLocaleDateString()}
                    </aside>
                  </div>
                ) : null}
                <div
                  id="DataAnim"
                  className={
                    AnimToWatch?.Info?.Begin && AnimToWatch?.Info?.End
                      ? "BeginEnd"
                      : AnimToWatch?.Info?.Begin
                      ? "Begin"
                      : AnimToWatch?.Info?.End
                      ? "End"
                      : ""
                  }
                >
                  <aside id="ProgressCircle">
                    <div className="percent">
                      <svg>
                        <circle cx="70" cy="70" r="70"></circle>
                        <circle
                          style={{
                            "--value": this.CalculateProgressionAnime(),
                          }}
                          cx="70"
                          cy="70"
                          r="70"
                        ></circle>
                      </svg>
                      <div className="number">
                        <h2>
                          {this.CalculateProgressionAnime()}
                          <span>%</span>
                        </h2>
                      </div>
                    </div>
                  </aside>
                  {AnimToWatch.Info ? (
                    <aside id="InfoAnim">
                      <ul>
                        {AnimToWatch.Info.Begin ? (
                          <li>
                            Commencé le
                            <br />
                            <span>
                              {new Date(
                                AnimToWatch.Info.Begin
                              ).toLocaleDateString()}
                            </span>
                          </li>
                        ) : null}
                        {AnimToWatch.Info.End ? (
                          <li>
                            Terminé le
                            <br />
                            <span>
                              {new Date(
                                AnimToWatch.Info.End
                              ).toLocaleDateString()}
                            </span>
                          </li>
                        ) : null}
                      </ul>
                    </aside>
                  ) : null}

                  <aside id="continuedAnim" onClick={this.StartNextEP}>
                    <span
                      style={{ color: "yellowgreen" }}
                      className="fas fa-play"
                    ></span>{" "}
                    S<b>{this.CalculateWhereStop()[0]}</b> EP
                    <b>
                      {this.CalculateWhereStop()[1] + 1 < 10
                        ? `0${this.CalculateWhereStop()[1] + 1}`
                        : this.CalculateWhereStop()[1] + 1}
                    </b>
                  </aside>
                </div>
              </Fragment>
            ) : null}
            <header>
              <h1
                className={`${
                  AnimToWatch.AnimeSeason && AnimToWatch.NewEpMode
                    ? " ModeNewEp"
                    : ""
                }`}
              >
                {type === "serie" ? (
                  AnimToWatch.AnimeSeason && AnimToWatch.NewEpMode ? (
                    <Fragment>
                      <span
                        className="fas fa-undo-alt"
                        title='Annulé le mode "NEW"'
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          this.updateValue(`${Pseudo}/serie/${id}`, {
                            NewEpMode: null,
                          });
                          if (!this.state.OfflineMode) {
                            this.fnDbOffline("PUT", `${Pseudo}/serie/${id}`, {
                              NewEpMode: null,
                            });
                          }
                        }}
                      ></span>{" "}
                      Anime
                      {typeof AnimToWatch.DurationPerEP === "string" &&
                      AnimToWatch.DurationPerEP !== "none" &&
                      AnimToWatch.DurationPerEP !== "Unknown"
                        ? `(${this.CalculateNbTimeAnime()}H)`
                        : ""}
                      :
                    </Fragment>
                  ) : (
                    `Anime${
                      typeof AnimToWatch.DurationPerEP === "string" &&
                      AnimToWatch.DurationPerEP !== "none" &&
                      AnimToWatch.DurationPerEP !== "Unknown"
                        ? `(${this.CalculateNbTimeAnime()}H)`
                        : ""
                    }:`
                  )
                ) : AnimToWatch.finished ? (
                  <Fragment>
                    <span
                      style={{ color: "greenyellow" }}
                      className="fas fa-check"
                    ></span>{" "}
                    Film({AnimToWatch.durer}min):
                  </Fragment>
                ) : (
                  `Film(${AnimToWatch.durer}min):`
                )}
              </h1>
            </header>
            <div className="content">
              {type === "film" ? (
                <div
                  className="film"
                  id={AnimToWatch.name}
                  onClick={(event) => {
                    if (
                      event.target.classList[0] === "fas" &&
                      event.target.classList[1] === "fa-undo-alt"
                    )
                      return;
                    this.StartModeWatch();
                  }}
                >
                  <span className="fas fa-play"></span>{" "}
                  <span
                    onClick={() => {
                      this.updateValue(`${Pseudo}/film/${id}`, {
                        finished: !AnimToWatch.finished,
                      });
                      if (!this.state.OfflineMode) {
                        this.fnDbOffline("PUT", `${Pseudo}/film/${id}`, {
                          finished: !AnimToWatch.finished,
                        });
                      }
                    }}
                    className="fas fa-undo-alt"
                  ></span>{" "}
                  {AnimToWatch.name}
                </div>
              ) : (
                <div id="accordeonAnimEP">{MyAnimAccordeon}</div>
              )}
            </div>
          </section>
        </div>
        {LetsCelebrate ? (
          <div id="Celebrate">
            <Fireworks
              count={3}
              interval={370}
              colors={["#cc3333", "#4CAF50", "#81C784"]}
              calc={(props, i) => ({
                ...props,
                x: (i + 1) * (window.innerWidth / 3) - (i + 1) * 100,
                y: 200 + Math.random() * 100 - 50 + (i === 2 ? -80 : 0),
              })}
            />
            <h1 onClick={() => this.setState({ LetsCelebrate: false })}>
              <span style={{ color: "gold" }} className="fas fa-trophy"></span>{" "}
              Bravo Votre Objectif est fini !{" "}
              <span className="fas fa-times-circle"></span>
            </h1>
          </div>
        ) : null}
        {LetsNotCelebrate ? (
          <div id="NotCelebrate">
            <h1 onClick={() => this.setState({ LetsNotCelebrate: false })}>
              <span style={{ color: "#f00" }} className="fas fa-frown"></span>{" "}
              Vous avez râté votre Objectif 💩{" "}
              <span className="fas fa-times-circle"></span>
            </h1>
          </div>
        ) : null}
        <div className={modeWatch ? "StartMod active" : "StartMod"}>
          <div
            className="cancel"
            onDoubleClick={() => {
              if (AnimToWatch.Objectif !== undefined) {
                this.deleteValue(`${Pseudo}/serie/${id}/Objectif`);
                if (!this.state.OfflineMode) {
                  this.fnDbOffline("DELETE", `${Pseudo}/serie/${id}/Objectif`);
                }
                this.StopModeWatch();
              }
            }}
            onClick={() => {
              if (AnimToWatch.Objectif !== undefined) {
                this.DisplayMsg(
                  "Mode Objectif Activé: Impossible de quitter le mode Watch. Veuillez Désactiver le Mode Objectif pour quitter (Double Click sur le boutton quitter)",
                  12000,
                  "warn"
                );
                return;
              }
              this.StopModeWatch();
            }}
          >
            <span className="fas fa-ban"></span>
          </div>
          {type === "serie" ? (
            <Fragment>
              <header
                id="HeaderStartModSizeDyna"
                ref={(el) => {
                  try {
                    el.style.setProperty(
                      "--size",
                      `${el.getBoundingClientRect().width}px`
                    );
                  } catch (err) {}
                }}
              >
                <h2>
                  Épisode{" "}
                  {repereEpisode[1] === undefined ? null : repereEpisode[1].id}{" "}
                  (S
                  {Object.keys(repereSaison).length === 0
                    ? null
                    : repereSaison.name.split(" ")[1]}
                  )
                  <br />
                  <span id="TotalEP">
                    (
                    {repereEpisode[1] === undefined ||
                    Object.keys(repereSaison).length === 0
                      ? null
                      : this.derterminateEpTotal()}
                    <sup>ème</sup> épisode au total)
                  </span>
                </h2>
              </header>
              <div
                className="next"
                onClick={() => {
                  repereEpisode[2] !== null
                    ? this.StartNextEP(repereSaison, repereEpisode[2].id)
                    : this.verifiedEPRepere(repereSaison, true);
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
          onHide={() =>
            this.setState({
              ShowModalVerification: [false, null],
              PauseWithAlleged: false,
              DropWithAlleged: false,
            })
          }
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
              ? "ne sera pas supprimer mais il sera inaccessible: en gros vous le verez toujours dans votre liste d'anime mais vous ne pourrez plus voir vos épisodes restant/saisons fini, Badges car ils seront supprimer (la note ne sera pas supprimer) vous ne pourrez plus modifier l'anime (mais vous pourrez toujours, réajouter des Saison et Episode (depuis le début donc pensé à réajouter tous les saison que vous avez déjà vu), changer sa note et le supprimer que depuis la page global (la où il y a tout les animes)). L'anime sera là en temps que déco, pour dire 'ba voilà j'ai la preuve d'avoir fini cette anime' (je vous conseille de la faire quand l'anime n'aura pas de suite, où qu'une suite n'ai pas prévu de suite)."
              : "sera entièrement supprimer avec aucune possiblité de le récupérer, en gros il n'existera plus."}
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button
              variant="secondary"
              onClick={() =>
                this.setState({
                  ShowModalVerification: [false, null],
                  PauseWithAlleged: false,
                  DropWithAlleged: true,
                })
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
          onHide={() => this.setState({ ShowModalRateAnime: false, Rate: 0 })}
        >
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>Noté {AnimToWatch.name} / 10</Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            <section id="RatingSection">
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
            </section>
            <hr />
            <section id="ActionEndAnime">
              <Form>
                {type === "film" ? null : (
                  <Fragment>
                    <Form.Check
                      type="checkbox"
                      disabled={ActionEndAnime[2]}
                      checked={ActionEndAnime[0]}
                      onChange={() => {
                        const ActionEndAnimeCopy = {
                          ...this.state.ActionEndAnime,
                        };
                        ActionEndAnimeCopy[0] = !ActionEndAnimeCopy[0];
                        this.setState({
                          ActionEndAnime: ActionEndAnimeCopy,
                        });
                      }}
                      label={
                        <div style={{ color: "#17a2b8" }}>
                          <span className="fas fa-pause"></span> Mettre En Pause{" "}
                          {AnimToWatch.name}
                        </div>
                      }
                    />
                    <Form.Check
                      type="checkbox"
                      disabled={ActionEndAnime[2]}
                      checked={ActionEndAnime[1]}
                      onChange={() => {
                        const ActionEndAnimeCopy = {
                          ...this.state.ActionEndAnime,
                        };
                        ActionEndAnimeCopy[1] = !ActionEndAnimeCopy[1];
                        ActionEndAnimeCopy[2] = false;
                        this.setState({
                          ActionEndAnime: ActionEndAnimeCopy,
                        });
                      }}
                      label={
                        <div style={{ color: "#ffc107" }}>
                          <span className="fas fa-window-close"></span> Alléger{" "}
                          {AnimToWatch.name}
                        </div>
                      }
                    />
                  </Fragment>
                )}

                <Form.Check
                  type="checkbox"
                  disabled={ActionEndAnime[1]}
                  checked={ActionEndAnime[2]}
                  onChange={() => {
                    const ActionEndAnimeCopy = { ...this.state.ActionEndAnime };
                    ActionEndAnimeCopy[2] = !ActionEndAnimeCopy[2];
                    ActionEndAnimeCopy[1] = false;
                    ActionEndAnimeCopy[0] = false;
                    this.setState({
                      ActionEndAnime: ActionEndAnimeCopy,
                    });
                  }}
                  label={
                    <div style={{ color: "#dc3545" }}>
                      <span className="fas fa-trash-alt"></span> Supprimer{" "}
                      {AnimToWatch.name}
                    </div>
                  }
                />
              </Form>
            </section>
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button
              variant="secondary"
              onClick={() =>
                this.setState({
                  ShowModalRateAnime: false,
                  Rate: 0,
                })
              }
            >
              Annuler
            </Button>
            <Button variant="info" onClick={this.ShareFinishedAnime}>
              <span className="fas fa-share"></span>
            </Button>
            <Button
              variant="success"
              onClick={() => {
                let GoToHome = false;
                if (
                  ActionEndAnime[0] &&
                  !ActionEndAnime[2] &&
                  type === "serie" &&
                  !ActionEndAnime[1]
                ) {
                  this.updateValue(`${this.state.Pseudo}/${type}/${id}`, {
                    Paused: true,
                    Drop: null,
                    InWait: null,
                    AnimeSeason: null,
                    Lier: null,
                    NewEpMode: null,
                  });
                  if (!this.state.OfflineMode) {
                    this.fnDbOffline(
                      "PUT",
                      `${this.state.Pseudo}/${type}/${id}`,
                      {
                        Paused: true,
                        Drop: null,
                        InWait: null,
                        AnimeSeason: null,
                        Lier: null,
                        NewEpMode: null,
                      }
                    );
                  }
                  GoToHome = true;
                } else if (
                  ActionEndAnime[0] &&
                  !ActionEndAnime[2] &&
                  type === "serie" &&
                  ActionEndAnime[1]
                ) {
                  this.setState({ PauseWithAlleged: true });
                }
                if (ActionEndAnime[1] && !ActionEndAnime[2] && type === "serie")
                  this.setState({
                    ShowModalVerification: [true, "alleger"],
                  });
                if (ActionEndAnime[2] && !ActionEndAnime[1])
                  this.setState({
                    ShowModalVerification: [true, "supprimer"],
                  });

                if (
                  !ActionEndAnime[2] &&
                  Rate !== undefined &&
                  Rate !== null &&
                  Rate > 0 &&
                  Rate <= 10 &&
                  (AnimToWatch.finished || AnimToWatch.finishedAnim)
                ) {
                  this.updateValue(`${Pseudo}/${type}/${id}`, {
                    Rate,
                  });
                  if (!this.state.OfflineMode) {
                    this.fnDbOffline("PUT", `${Pseudo}/${type}/${id}`, {
                      Rate,
                    });
                  }
                  this.setState({
                    ShowModalRateAnime: false,
                    Rate: 0,
                  });
                } else {
                  this.DisplayMsg(
                    "Impossible de noter l'anime quand il n'est pas fini.",
                    6000,
                    "danger"
                  );
                }
                if (GoToHome)
                  this.setState({
                    uid: null,
                    RedirectTo: [true, "/notifuser/5"],
                  });
              }}
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
              <Form.Group controlId="EpToAdd">
                <Form.Label>Nombres d'ep à rajouter</Form.Label>
                <Form.Control
                  type="number"
                  value={nbEpToAdd.toString()}
                  min="1"
                  placeholder="Nombres d'EP"
                  autoComplete="off"
                  onChange={(event) => {
                    const value = parseInt(event.target.value);

                    this.setState({ nbEpToAdd: value });
                  }}
                />{" "}
                <Form.Label>
                  <b>AIDE</b>: Nombre d'épisode pour atteindre le{" "}
                  {nbEpToAddToHave[0]} épisodes = {nbEpToAddToHave[1]}
                </Form.Label>
                <Form.Control
                  type="number"
                  value={nbEpToAddToHave[0].toString()}
                  min="1"
                  placeholder="Episode à atteindre"
                  autoComplete="off"
                  onChange={(event) => {
                    const value = parseInt(event.target.value);
                    const TotalEPnb = this.derterminateEpTotal(SeasonToAddEp);

                    this.setState({
                      nbEpToAddToHave: [value, value - TotalEPnb],
                      nbEpToAdd: value - TotalEPnb,
                    });
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
          show={ShowModalAddObjectif}
          onHide={() => this.setState({ ShowModalAddObjectif: false })}
        >
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>Ajouter Un Objectif</Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            <Form id="Addep">
              <Form.Group controlId="EpToAdd">
                <Form.Label>Objectif d'ep</Form.Label>
                <Form.Control
                  type="number"
                  value={nbEpObjectif.toString()}
                  min={1}
                  placeholder="Objectif à atteindre"
                  autoComplete="off"
                  onChange={(event) =>
                    this.setState({
                      nbEpObjectif: parseInt(event.target.value),
                    })
                  }
                />
              </Form.Group>
              <Form.Group>
                <label htmlFor="DateForStopObjectif">A terminer avant:</label>
                <input
                  type="datetime-local"
                  id="DateForStopObjectif"
                  value={DateObjectif}
                  onChange={(event) =>
                    this.setState({ DateObjectif: event.target.value })
                  }
                  min={new Date().toISOString().split(".")[0]}
                  className="form-control"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button
              variant="secondary"
              onClick={() => this.setState({ ShowModalAddObjectif: false })}
            >
              Annuler
            </Button>
            <Button
              onClick={this.addObjectif}
              style={{ backgroundColor: "#301c4d", border: "none" }}
            >
              <span className="fas fa-bullseye"></span> Ajouter
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
          <div className={`ackmessage${ShowMessage ? " show" : " hide"}`}>
            <span
              className={`fas fa-${
                typeAlertMsg === "info"
                  ? "info"
                  : typeAlertMsg === "success"
                  ? "check"
                  : typeAlertMsg === "warn"
                  ? "exclamation-triangle"
                  : typeAlertMsg === "danger"
                  ? "times-circle"
                  : "info"
              }`}
            ></span>{" "}
            {ResText}
          </div>
        ) : null}
      </section>
    );
  }
}

export default Watch;

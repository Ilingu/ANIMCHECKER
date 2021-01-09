import React, { Component, Fragment } from "react";
import { Redirect, Link } from "react-router-dom";
import { openDB } from "idb";
import ObjectPath from "object-path";
import ReactStars from "react-rating-stars-component";
// Components
import AnimEpCo from "./dyna/AnimEp";
// Img
import ADNLogo from "../Assets/Img/ADNLogo.png";
import CrunchyrollLogo from "../Assets/Img/CrunchyrollLogo.png";
import MavLogo from "../Assets/Img/MAVLogo.png";
import NekoSamaLogo from "../Assets/Img/NekoSamaLogo.svg";
import NetflixLogo from "../Assets/Img/NetflixLogo.png";
import WakanimLogo from "../Assets/Img/WakanimLogo.png";
// CSS
import { Button, Modal, Form, Dropdown, Badge } from "react-bootstrap";
// DB
import base from "../db/base";
import firebase from "firebase/app";
import "firebase/auth";

class Watch extends Component {
  state = {
    // Firebase
    Pseudo: this.props.match.params.pseudo,
    AnimToWatch: {},
    Badges: [],
    // Auth
    uid: null,
    id: null,
    proprio: null,
    // Bon fonctionnement de l'app
    OfflineMode: !JSON.parse(window.localStorage.getItem("OfflineMode"))
      ? false
      : JSON.parse(window.localStorage.getItem("OfflineMode")),
    modeStart: false,
    type: "",
    LoadingMode: true,
    isFirstTime: true,
    RedirectHome: false,
    ToOpen: "",
    ModeEditTitle: false,
    ShowFormBadge: false,
    ShowModalRateAnime: false,
    ShowMessage: false,
    ShowMessageHtml: false,
    SmartRepere: true,
    SecondMessage: false,
    PauseWithAlleged: false,
    DropWithAlleged: false,
    AlreadyClicked: false,
    ResText: null,
    // Repere
    repereSaison: {},
    repereEpisode: [],
    // Form
    SeasonToAddEp: null,
    Rate: 7.5,
    Newtitle: "",
    NewBadgeName: "",
    ActionEndAnime: [false, false, false],
    nbEpToAdd: 1,
    // Modal
    ShowModalVerification: [false, null],
    ShowModalAddEp: false,
    ShowModalAddSeasonEp: false,
  };

  setIntervalVar = null;
  FirstBadge = true;

  componentDidMount() {
    const self = this;

    if (this.props.match.params.id !== undefined) {
      this.setState(
        {
          id: this.props.match.params.id,
          type: this.props.match.params.id.split("-")[0],
        },
        () => {
          if (this.state.OfflineMode === true) {
            // Get Data IndexedDB
            self.fnDbOffline("GET");
            return;
          }
          this.refreshAnimToWatch();
        }
      );
    }

    if (this.state.Pseudo && !this.state.OfflineMode) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          self.handleAuth({ user });
        }
      });
    }
  }

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
    const connectedRef = firebase.database().ref(".info/connected");

    if (!box.proprio) {
      await base.post(`${this.state.Pseudo}/proprio`, {
        data: authData.user.uid,
      });
    }

    // Verified listener Conn
    connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        // Fast Loading Anime before FnRefresh
        this.fnDbOffline("GET");

        if (this.setIntervalVar !== null) {
          clearInterval(this.setIntervalVar);
          console.warn("Firebase Connexion retablished");
        }
      } else {
        this.reconectFirebase();
        console.warn(
          "Firebase Connexion Disconnected\n\tReconnect to Firebase..."
        );
      }
    });

    this.setState({
      uid: authData.user.uid,
      proprio: box.proprio || authData.user.uid,
    });
  };

  refreshAnimToWatch = async (next = null) => {
    const { id, type } = this.state;

    try {
      const AllDataPseudo = await base.fetch(this.state.Pseudo, {
        context: this,
      });

      const AnimToWatch = AllDataPseudo[type][id];

      document.title = `ACK:${AnimToWatch.name}`;
      this.setState({
        AnimToWatch,
        Newtitle: AnimToWatch.name,
        SmartRepere:
          AllDataPseudo.ParamsOptn === undefined
            ? true
            : AllDataPseudo.ParamsOptn.SmartRepere === undefined
            ? true
            : AllDataPseudo.ParamsOptn.SmartRepere,
        Badges: AnimToWatch.Badge ? AnimToWatch.Badge : [],
        LoadingMode: false,
      });
      if (next !== null) next();
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
        next
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
    if (OfflineMode === true) {
      this.fnDbOffline("DELETE", path);
      return;
    }

    base.remove(path).then(this.refreshAnimToWatch).catch(console.error);
  };

  updateValue = (path, value, next = null, nextAfterRefresh = false) => {
    const { OfflineMode } = this.state;
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
      `${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}/Episodes`,
      AnimToWatch.AnimEP[idSaison].Episodes.concat(Stockage)
    );
    this.updateValue(`${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}`, {
      finished: false,
    });
    this.updateValue(`${this.state.Pseudo}/serie/${id}`, {
      finishedAnim: false,
    });

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

  setRepere = (Saison, idEp, smart = false) => {
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
  };

  StopModeWatch = () => {
    document.body.style.cssText = "overflow: unset;";
    this.setState({ modeStart: false });
  };

  endAnime = () => {
    const { id } = this.state;

    this.updateValue(
      `${this.state.Pseudo}/serie/${id}`,
      {
        finishedAnim: true,
        AnimeSeason: null,
      },
      () => this.setState({ ShowModalRateAnime: true })
    );
    this.StopModeWatch();
  };

  endOfSaison = (idSaison) => {
    const { id, repereEpisode } = this.state;

    this.updateValue(`${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}`, {
      finished: true,
    });

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
      id,
      AnimToWatch,
      repereEpisode,
      repereSaison,
      SecondMessage,
      AlreadyClicked,
    } = this.state;
    const idSaison = parseInt(Saison.name.split(" ")[1]) - 1;

    if (!AnimToWatch.AnimEP[idSaison].Episodes[EpFinishedID - 2].finished) {
      this.updateValue(
        `${this.state.Pseudo}/serie/${id}/AnimEP/${idSaison}/Episodes/${
          EpFinishedID - 2
        }`,
        { finished: true },
        () => {
          if (verified) this.verifiedEPRepere(Saison, false);
          if (next !== null) next();

          this.setState({
            SecondMessage: AlreadyClicked ? true : false,
            AlreadyClicked: true,
            ShowMessage: true,
            ShowMessageHtml: true,
            ResText: `Episode ${repereEpisode[1].id}(S${
              Object.keys(repereSaison).length === 0
                ? null
                : repereSaison.name.split(" ")[1]
            }) fini !`,
          });

          setTimeout(() => {
            if (SecondMessage) {
              this.setState({ SecondMessage: false });
              return;
            }

            this.setState({ ShowMessage: false, AlreadyClicked: false });

            setTimeout(() => {
              this.setState({ ShowMessageHtml: false, ResText: null });
            }, 900);
          }, 3000);
        },
        true
      );
    } else {
      this.setState({
        SecondMessage: AlreadyClicked ? true : false,
        AlreadyClicked: true,
        ShowMessage: true,
        ShowMessageHtml: true,
        ResText: `Episode ${repereEpisode[1].id}(S${
          Object.keys(repereSaison).length === 0
            ? null
            : repereSaison.name.split(" ")[1]
        }) déjà fini`,
      });

      setTimeout(() => {
        if (SecondMessage) {
          this.setState({ SecondMessage: false });
          return;
        }

        this.setState({ ShowMessage: false, AlreadyClicked: false });

        setTimeout(() => {
          this.setState({ ShowMessageHtml: false, ResText: null });
        }, 900);
      }, 3000);
    }
  };

  StartNextEP = (Saison = null, EpFinishedID = null) => {
    if (Saison !== null && EpFinishedID !== null) {
      this.finishedEp(Saison, EpFinishedID);
      this.setRepere(Saison, EpFinishedID, true);
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

      try {
        this.setRepere(lastOne[0], lastOne[1]);
      } catch (error) {
        this.setRepere(AnimToWatch.AnimEP[0], 1);
      }
    }
    this.StartModeWatch();
  };

  playEp = (Saison, idEp) => {
    this.setRepere(Saison, idEp);
    this.StartModeWatch();
  };

  EndFilm = () => {
    const { id } = this.state;

    this.updateValue(
      `${this.state.Pseudo}/film/${id}`,
      { finished: true },
      () => this.setState({ ShowModalRateAnime: true })
    );
    this.StopModeWatch();
  };

  handleDelete = () => {
    const { type, id } = this.state;

    this.deleteValue(`${this.state.Pseudo}/${type}/${id}`);
    this.setState({ uid: null, RedirectHome: true });
  };

  handleDeleteBadge = (index) => {
    const { Badges, Pseudo, type, id } = this.state;
    Badges.splice(index, 1);
    this.updateValue(`${Pseudo}/${type}/${id}`, { Badge: Badges });
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
    const { type, id, PauseWithAlleged, DropWithAlleged } = this.state;

    if (type !== "film") {
      this.updateValue(`${this.state.Pseudo}/serie/${id}`, {
        AnimEP: null,
        Badge: null,
        AnimeSeason: null,
        Paused: PauseWithAlleged ? true : null,
        Drop: DropWithAlleged ? true : null,
      });
      this.setState({ uid: null, RedirectHome: true });
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
      this.updateValue(`${Pseudo}/${type}/${id}`, {
        name: Newtitle,
      });
    }
  };

  RemoveAnimVal = (typeRemove, idSeason, idEP) => {
    const { id, AnimToWatch } = this.state;

    if (typeRemove === "EP") {
      if (idEP === 1) {
        if (AnimToWatch.AnimEP.length === 1) {
          this.setState({ ShowModalVerification: [true, "supprimer"] });
          return;
        }
        if (idSeason === AnimToWatch.AnimEP.length - 1)
          this.deleteValue(
            `${this.state.Pseudo}/serie/${id}/AnimEP/${idSeason}`
          );
        return;
      }

      if (idEP === AnimToWatch.AnimEP[idSeason].Episodes.length)
        this.deleteValue(
          `${this.state.Pseudo}/serie/${id}/AnimEP/${idSeason}/Episodes/${
            idEP - 1
          }`
        );
    } else {
      if (AnimToWatch.AnimEP.length === 1) {
        this.setState({ ShowModalVerification: [true, "supprimer"] });
        return;
      }

      if (idSeason === AnimToWatch.AnimEP.length - 1)
        this.deleteValue(`${this.state.Pseudo}/serie/${id}/AnimEP/${idSeason}`);
    }
  };

  ShareFinishedAnime = () => {
    if (this.state.OfflineMode === false) {
      try {
        const { Pseudo, AnimToWatch, type } = this.state;
        const TokenTemplate = `${Pseudo}-Template-${Date.now()}${
          [
            "UsntXqEYEw",
            "mgbYwpVXXd",
            "NgpàHzuh|J",
            "/é6fXlN5D3",
            "2GEQ5RfyVK",
            "OLq7§5sXjb",
            "àtdWXyHé7q",
            "9Kdl3PHW&à",
            "e21zé&E3zO",
            "jlKIwIU&le",
            "35AJ3sFLIA",
            "hD0OApiToz",
            "RUGh0Foxx5",
            "y6x0cn2uJg",
            "23&QYE2fva",
          ][Math.round(Math.random() * 14)]
        }${(Math.random() * 100000000).toString().split(".").join("")}`;
        navigator
          .share({
            title: document.title,
            text: `${Pseudo} a fini ${AnimToWatch.name} ! Clické sur le lien pour vous aussi commencer cette anime !`,
            url: `https://myanimchecker.netlify.app/Template/${TokenTemplate}`,
          })
          .then(() => {
            // Successful share !
            let ArrEpSaison = null,
              durer = null;
            if (type === "serie") {
              ArrEpSaison = AnimToWatch.AnimEP.map((saisons) => {
                return saisons.Episodes.length;
              });
            } else {
              durer = AnimToWatch.durer;
            }
            this.addValue(`${Pseudo}/TemplateAnim`, {
              [TokenTemplate]: {
                type,
                AnimEP: ArrEpSaison,
                durer,
                name: AnimToWatch.name,
                imageUrl: AnimToWatch.imageUrl,
              },
            });
          })
          .catch(console.error);
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
    let season = null;
    switch (Month) {
      case 12:
      case 1:
      case 2:
        season = "snowflake";
        break;
      case 3:
      case 4:
      case 5:
        season = "seedling";
        break;
      case 6:
      case 7:
      case 8:
        season = "umbrella-beach";
        break;
      case 9:
      case 10:
      case 11:
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
      RedirectHome,
      proprio,
      type,
      isFirstTime,
      ShowModalRateAnime,
      Rate,
      ShowFormBadge,
      NewBadgeName,
      SecondMessage,
      modeStart,
      ShowModalVerification,
      ShowMessage,
      ShowMessageHtml,
      ResText,
      ActionEndAnime,
      repereEpisode,
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
    if (AnimToWatch.Paused) return <Redirect to="/notifuser/1" />;
    if (AnimToWatch.Drop) return <Redirect to="/notifuser/7" />;
    if (RedirectHome) return <Redirect to="/notifuser/5" />;

    if (LoadingMode) {
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

    if (uid !== proprio) return <Redirect to="/notifuser/3" />;

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
        <AnimEpCo
          key={Date.now() + Math.random() * 100000 - Math.random() * -100000}
          ObjInfo={EpSaison}
          nbTotalSeason={AnimToWatch.AnimEP.length}
          play={this.playEp}
          ToOpen={ToOpen}
          RemoveVal={this.RemoveAnimVal}
          AddEp={() =>
            this.setState({ ShowModalAddEp: true, SeasonToAddEp: EpSaison })
          }
          ReverseFinished={(idSaison, idEP) => {
            const AnimToWatchCopy = { ...this.state.AnimToWatch.AnimEP };
            AnimToWatchCopy[idSaison].finished = false;
            AnimToWatchCopy[idSaison].Episodes[
              idEP - 1
            ].finished = !AnimToWatchCopy[idSaison].Episodes[idEP - 1].finished;
            this.updateValue(`${Pseudo}/serie/${id}`, {
              finishedAnim: false,
              AnimEP: AnimToWatchCopy,
            });
          }}
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

    if (Badges.length !== 0) {
      BadgesHtml = Badges.map((value, i) => {
        if (value.toLowerCase() === "adn") {
          return (
            <Badge
              key={i}
              className="BadgesME"
              variant="primary"
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={ADNLogo} alt="ADNLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
            </Badge>
          );
        } else if (
          value.toLowerCase() === "crunchyroll" ||
          value.toLowerCase() === "crunchyrol"
        ) {
          return (
            <Badge
              key={i}
              className="BadgesME"
              variant="light"
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={CrunchyrollLogo} alt="CrunchyrollLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
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
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={MavLogo} alt="MavLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
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
            <Badge
              key={i}
              className="BadgesME"
              variant="primary"
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={NekoSamaLogo} alt="NekoSamaLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
            </Badge>
          );
        } else if (value.toLowerCase() === "netflix") {
          return (
            <Badge
              key={i}
              className="BadgesME"
              variant="dark"
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={NetflixLogo} alt="NetflixLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
            </Badge>
          );
        } else if (value.toLowerCase() === "wakanim") {
          return (
            <Badge
              key={i}
              className="BadgesME"
              variant="dark"
              onClick={() => this.handleDeleteBadge(i)}
            >
              <img src={WakanimLogo} alt="WakanimLogo" />
              <div id="CancelBadge">
                <span className="fas fa-times"></span>
              </div>
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
            onClick={() => this.handleDeleteBadge(i)}
            style={{
              background: `rgb(${rdaColor[0]},${rdaColor[1]},${rdaColor[2]})`,
              color: grayScaleRdaColor < 128 ? "#fff" : "#212529",
            }}
          >
            <div id="ValueBadge">{value}</div>
            <div id="CancelBadge">
              <span className="fas fa-times"></span>
            </div>
          </Badge>
        );
      });
    }

    return (
      <section id="Watch">
        <div className={modeStart ? "nonStartMod" : "nonStartMod active"}>
          <header>
            <h1
              onDoubleClick={() => {
                this.setState({ ModeEditTitle: true });
                window.addEventListener("click", this.ChangeTitle, false);
              }}
              className="title"
            >
              {ModeEditTitle ? (
                <Form onSubmit={this.ChangeTitle}>
                  <Form.Control
                    type="text"
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
              {type === "film" ? `(${AnimToWatch.durer}min)` : null}
            </h1>
            <div className="img">
              <img src={AnimToWatch.imageUrl} alt="Img of anim" />
              {AnimToWatch.Fav ? (
                <span
                  title="Retirer des Favoris"
                  className="FvBtn fas fa-heart"
                  onClick={() =>
                    this.updateValue(`${this.state.Pseudo}/${type}/${id}`, {
                      Fav: false,
                    })
                  }
                ></span>
              ) : (
                <span
                  title="Ajouter aux Favoris"
                  className="FvBtn far fa-heart"
                  onClick={() =>
                    this.updateValue(`${this.state.Pseudo}/${type}/${id}`, {
                      Fav: true,
                    })
                  }
                ></span>
              )}
              {AnimToWatch.Rate ? (
                <span
                  style={{ color: "gold" }}
                  className="RatingStar fas fa-star"
                >
                  {AnimToWatch.Rate}
                </span>
              ) : null}
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
              <Button variant="primary" className="btnBackDesing">
                <span className="fas fa-arrow-left"></span> Retour
              </Button>
            </Link>
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="DropdownAction">
                <span className="fas fa-bars"></span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {type === "serie" ? (
                  <Fragment>
                    <Dropdown.Item>
                      <Button
                        variant="success"
                        block
                        onClick={() =>
                          this.setState({ ShowModalAddSeasonEp: true })
                        }
                      >
                        <span className="fas fa-plus"></span> Ajouter une saison
                      </Button>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <Button
                        variant="info"
                        block
                        onClick={() => {
                          if (type === "serie") {
                            this.updateValue(
                              `${this.state.Pseudo}/serie/${id}`,
                              {
                                Paused: true,
                                Drop: null,
                              }
                            );
                            this.setState({ uid: null, RedirectHome: true });
                          }
                        }}
                      >
                        <span className="fas fa-pause"></span> Mettre en Pause{" "}
                        {AnimToWatch.name}
                      </Button>
                    </Dropdown.Item>
                    <Dropdown.Item>
                      <Button
                        variant="dark"
                        onClick={() => {
                          this.updateValue(
                            `${this.state.Pseudo}/serie/${id}`,
                            {
                              AnimeSeason: AnimToWatch.AnimeSeason
                                ? false
                                : true,
                            },
                            () => {
                              this.setState({
                                ShowMessage: true,
                                ShowMessageHtml: true,
                                ResText: "Changement opéré !",
                              });

                              setTimeout(() => {
                                if (SecondMessage) {
                                  this.setState({ SecondMessage: false });
                                  return;
                                }

                                this.setState({
                                  ShowMessage: false,
                                  AlreadyClicked: false,
                                });

                                setTimeout(() => {
                                  this.setState({
                                    ShowMessageHtml: false,
                                    ResText: null,
                                  });
                                }, 900);
                              }, 3000);
                            }
                          );
                        }}
                        block
                      >
                        <span
                          className={`fas fa-${this.WhitchSeason()}`}
                        ></span>{" "}
                        {AnimToWatch.AnimeSeason
                          ? "Anime Normal"
                          : "Anime de saison"}
                      </Button>
                    </Dropdown.Item>
                    {!AnimToWatch.finishedAnim ? (
                      <Dropdown.Item>
                        <Button
                          variant="primary"
                          block
                          onClick={() => {
                            this.updateValue(
                              `${this.state.Pseudo}/${type}/${id}`,
                              {
                                Drop: true,
                                Paused: null,
                              }
                            );
                            this.setState({ uid: null, RedirectHome: true });
                          }}
                        >
                          <span className="fas fa-stop"></span> Drop{" "}
                          {AnimToWatch.name}
                        </Button>
                      </Dropdown.Item>
                    ) : null}
                    <Dropdown.Item>
                      <Button
                        variant="warning"
                        block
                        onClick={() =>
                          this.setState({
                            ShowModalVerification: [true, "alleger"],
                          })
                        }
                      >
                        <span className="fas fa-window-close"></span> Alléger{" "}
                        {AnimToWatch.name}
                      </Button>
                    </Dropdown.Item>
                    <Dropdown className="FakeDropDownItem">
                      <Dropdown.Toggle
                        variant="outline-primary"
                        id="dropdown-basic"
                        block
                      >
                        Actions combinées
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        {!AnimToWatch.finishedAnim ? (
                          <Dropdown.Item>
                            <Button
                              variant="light"
                              block
                              onClick={() =>
                                this.setState({
                                  DropWithAlleged: true,
                                  ShowModalVerification: [true, "alleger"],
                                })
                              }
                            >
                              <span className="fas fa-window-close"></span>{" "}
                              Alléger et Mettre en Pause {AnimToWatch.name}
                            </Button>
                          </Dropdown.Item>
                        ) : null}
                      </Dropdown.Menu>
                    </Dropdown>
                  </Fragment>
                ) : !AnimToWatch.finished ? (
                  <Dropdown.Item>
                    <Button
                      variant="primary"
                      block
                      onClick={() => {
                        this.updateValue(`${this.state.Pseudo}/serie/${id}`, {
                          Drop: true,
                          Paused: null,
                        });
                        this.setState({ uid: null, RedirectHome: true });
                      }}
                    >
                      <span className="fas fa-stop"></span> Drop{" "}
                      {AnimToWatch.name}
                    </Button>
                  </Dropdown.Item>
                ) : null}
                {AnimToWatch.finished || AnimToWatch.finishedAnim ? (
                  <Dropdown.Item>
                    <Button
                      style={{
                        backgroundColor: "gold",
                        color: "#212121",
                        border: "none",
                      }}
                      block
                      onClick={() =>
                        this.setState({
                          ShowModalRateAnime: true,
                        })
                      }
                    >
                      <span className="fas fa-star"></span> Changer la note
                    </Button>
                  </Dropdown.Item>
                ) : null}
                <Dropdown.Divider />
                <Dropdown.Item>
                  <Button
                    variant="danger"
                    block
                    onClick={() =>
                      this.setState({
                        ShowModalVerification: [true, "supprimer"],
                      })
                    }
                  >
                    <span className="fas fa-trash-alt"></span> Supprimer{" "}
                    {AnimToWatch.name}
                  </Button>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
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
                  this.updateValue(`${this.state.Pseudo}/serie/${id}`, {
                    Paused: true,
                    Drop: null,
                  });
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
                  this.setState({
                    ShowModalRateAnime: false,
                    Rate: 0,
                  });
                } else {
                  this.setState({
                    AlreadyClicked: true,
                    ShowMessage: true,
                    ShowMessageHtml: true,
                    ResText:
                      "Impossible de noter si l'anime n'ai pas fini ou que la note soit incorrect.",
                  });

                  setTimeout(() => {
                    if (SecondMessage) {
                      this.setState({ SecondMessage: false });
                      return;
                    }

                    this.setState({
                      ShowMessage: false,
                      AlreadyClicked: false,
                    });

                    setTimeout(() => {
                      this.setState({
                        ShowMessageHtml: false,
                        ResText: null,
                      });
                    }, 900);
                  }, 6000);
                }
                if (GoToHome) this.setState({ uid: null, RedirectHome: true });
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
          <div className={`ackmessage${ShowMessage ? " show" : " hide"} green`}>
            <span className="fas fa-check-circle"></span> {ResText}
          </div>
        ) : null}
      </section>
    );
  }
}

export default Watch;

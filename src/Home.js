// Modules
import React, { Component, Fragment } from "react";
import { Redirect } from "react-router-dom";
import axios from "axios";
import { openDB } from "idb";
import ObjectPath from "object-path";
import ReactStars from "react-rating-stars-component";
import TimePicker from "react-bootstrap-time-picker";
// Components
import Poster from "./components/dyna/Home/PosterAnim";
import NextAnimCO from "./components/dyna/Home/NextAnim";
import OneAnim from "./components/Home/OneAnim";
import MyAnim from "./components/Home/MyAnim";
import MyManga from "./components/Home/MyManga";
import Login from "./components/Auth/Login";
import PseudoCO from "./components/Auth/Pseudo";
// Context
import ContextForMyAnim from "./Context/ContextSchema";
// CSS
import { Modal, Button, Form, Dropdown, Spinner } from "react-bootstrap";
// DB
import base, { firebaseApp } from "./db/base";
import firebase from "firebase/app";

export default class Home extends Component {
  state = {
    // Firebase
    Pseudo: !JSON.parse(window.localStorage.getItem("Pseudo"))
      ? null
      : JSON.parse(window.localStorage.getItem("Pseudo")),
    NumTel: "",
    NewLogin: false,
    NextAnimFireBase: {},
    MangaFirebase: [],
    filmFireBase: {},
    serieFirebase: {},
    ParamsOptn: null,
    FirstQuerie: false,
    AuthenticateMethod: false,
    AllowUseReAuth: false,
    uid: null,
    proprio: null,
    ReConnectionFirebase: false,
    UserOnLogin: false,
    // Bon fonctionnement de l'app
    PageMode:
      JSON.parse(window.localStorage.getItem("PageMode")) === null ||
      JSON.parse(window.localStorage.getItem("PageMode")) === undefined
        ? true
        : JSON.parse(window.localStorage.getItem("PageMode")),
    OfflineMode: !JSON.parse(window.localStorage.getItem("OfflineMode"))
      ? false
      : JSON.parse(window.localStorage.getItem("OfflineMode")),
    UpdateDbFromIndexedDB: false,
    LastAntiLostData:
      JSON.parse(window.localStorage.getItem("LastSecurityAntiLostData")) !==
        false &&
      JSON.parse(window.localStorage.getItem("LastSecurityAntiLostData")) !==
        true
        ? true
        : JSON.parse(window.localStorage.getItem("LastSecurityAntiLostData")),
    findAnim: [],
    JustDefined: false,
    RedirectPage: null,
    IdToAddEp: null,
    InfoAnimeToChangeNote: null,
    //// Modal
    ShowModalSearch: false,
    ShowModalChangeNote: false,
    ShowModalAddAnime: false,
    ShowModalAddNM: false,
    ShowModalAddNotifLier: false,
    ShowModalChooseImgURL: [false, null],
    ShowModalImportFile: false,
    ShowModalVerification: false,
    ShowModalAddManga: false,
    ////
    OpenNextNewAnime: false,
    PalmaresModal: false,
    SeasonPage: false,
    NotAskAgain: true,
    ModePreview: false,
    SwitchMyAnim: true,
    SwipeActive: true,
    AddNotifWithAnim: false,
    animToDetails: [],
    SeasonAnimeDetails: null,
    NextAnimToDelete: null,
    NextMangaToDelete: null,
    SearchInAnimeList: [false, null],
    RefreshRenderAnime: true,
    RefreshRenderNA: true,
    RefreshRenderManga: true,
    HaveAlreadyBeenMix: [false, false],
    NextReRenderOrderSerie: null,
    NextReRenderOrderNA: null,
    MyMangaListSaved: [
      "Vous n'avez aucun Manga En Cours",
      "Vous n'avez aucun Manga à Regarder Prochainement",
    ],
    MyAnimListSaved: null,
    MyNextAnimListSaved: null,
    ModeFilter: "NotFinished",
    ModeFilterNA: "all",
    ModeFindAnime: [false, null],
    LoadingMode: [true, true],
    palmares: null,
    ToReSearchAfterRefresh: false,
    MicOn: false,
    addEPToAlleged: false,
    ShowMessage: false,
    ShowMessageHtml: false,
    SecondMessage: false,
    // Form
    title: "",
    type: "serie",
    typeManga: ["scan", false],
    Rate: 7.5,
    UrlUserImg: "",
    FileToImport: null,
    imageUrl: null,
    AnimateFasIcon: [false, false],
    EpisodeName: null,
    DurationPerEp: null,
    AntiLostData: true,
    SeasonAnimCheck: false,
    OpenSearchFilter: false,
    WaitAnimCheck: false,
    ModeCombinaisonSearch: "ET",
    year: new Date().getFullYear().toString(),
    season: "spring",
    SearchFilter: {},
    day: new Date().getDay().toString(),
    time:
      new Date().getHours() * 3600 +
      Math.round(new Date().getMinutes() / 10) * 10 * 60,
    durer: 110,
    nbEP: "",
    Scan: NaN,
    Volumes: [NaN, NaN],
    VolumesPersonnalize: {},
    NextManga: "",
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
    ResTextMsg: null,
    typeAlert: null,
    typeAlertMsg: null,
    // A2HS
    AddToHomeScreen: null,
  };

  _isMounted = false;
  DataBaseWS = null;
  connectedRef = null;
  setIntervalVar = null;
  setTimeOutMsgInfo = null;
  setTimeOutMsgInfo2 = null;
  NumberOfFailedConnection = 0;

  componentDidMount() {
    this._isMounted = true;
    const self = this;
    // Title
    this.state.PageMode
      ? (document.title = "ACK:Anim-Checker")
      : (document.title = "MCK:Manga-Checker");
    // Color
    if (window.localStorage.getItem("BGC-ACK")) {
      document.body.style.backgroundColor =
        window.localStorage.getItem("BGC-ACK");
    }
    // Firebase
    if (this.state.Pseudo && this._isMounted) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          // User Detected
          this.setState({ UserOnLogin: true });
          self.handleAuth({ user });
        } else {
          // No User detected -> Login with phone number
          this.setState({ UserOnLogin: null });
          this.ShowMessageInfo(
            "Aucun Compte Détecter, Veuillez vous connectez.",
            6500,
            "info"
          );
        }
        self.setState({ AuthenticateMethod: true });
        // WS
        this.ActiveWebSockets();
      });
    } else {
      // No User -> Login with phone number
      this.ShowMessageInfo(
        "Aucun Compte Détecter, Veuillez vous connectez.",
        6500,
        "info"
      );
      self.setState({ AllowUseReAuth: true });
    }
    // Verified Conn
    this.AllowVpn();
    // Offline Mode
    if (!JSON.parse(window.localStorage.getItem("OfflineMode")))
      window.localStorage.setItem("OfflineMode", JSON.stringify(false));
    else if (JSON.parse(window.localStorage.getItem("OfflineMode")) === true)
      this.OfflineMode(null, true);

    // AntiLostData
    const VarAntiLostData = JSON.parse(
      window.localStorage.getItem("LastSecurityAntiLostData")
    );
    if (VarAntiLostData !== false && VarAntiLostData !== true) {
      window.localStorage.setItem(
        "LastSecurityAntiLostData",
        JSON.stringify(false)
      );
    }
    // Check If Mobile or PC
    window.mobileAndTabletCheck = () => {
      let check = false;
      (function (a) {
        if (
          /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(
            a
          ) ||
          // eslint-disable-next-line no-useless-escape
          /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
            a.substr(0, 4)
          )
        )
          check = true;
      })(navigator.userAgent || navigator.vendor || window.opera);
      return check;
    };
    // A2HS
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      self.setState({
        AddToHomeScreen: e,
      });
    });
    // Recup templateAnim
    if (this.props.match.params.token !== undefined && this.state.Pseudo) {
      const Token = this.props.match.params.token;
      (async () => {
        const TemplateFirebase = await base.fetch(
          `${Token.split("-")[0]
            .split("")
            .reverse()
            .join("")}/TemplateAnim/${Token}`,
          {
            context: this,
          }
        );

        this.setState({
          ShowModalAddAnime: true,
          OpenNextNewAnime: true,
          title: TemplateFirebase.title,
          type: TemplateFirebase.type,
          nbEP:
            TemplateFirebase.type === "serie"
              ? TemplateFirebase.AnimEP.join(",")
              : "",
          durer:
            TemplateFirebase.type === "film" ? TemplateFirebase.durer : 110,
          RedirectPage: "/",
        });
      })();
    }
    // Connection Test
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (connection) {
      if (
        connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g"
      ) {
        this.ShowMessageInfo(
          `Connexion internet faible/instable (${connection.effectiveType})`,
          7000,
          "warn"
        );
      }
    }
    // Recup Message Inter-page
    if (this.props.match.params.codemsg !== undefined) {
      let ResText = null;
      let typeAlert = null;
      switch (this.props.match.params.codemsg) {
        case "1":
          ResText =
            "403 Forbidden - Impossible d'accéder à cette page car cette anime est actuellement en pause. (Pour le reprendre aller sur l'anime depuis votre liste et clicker sur le bouton reprendre/play";
          typeAlert = "danger";
          break;
        case "2":
          ResText = "422 - Erreur aucun Pseudo n'a été acossié";
          typeAlert = "danger";
          break;
        case "3":
          ResText = "403 Forbidden - Ce n'est pas votre compte";
          typeAlert = "danger";
          break;
        case "4":
          ResText = "404 - Auncun Anime à été trouvé";
          typeAlert = "danger";
          break;
        case "5":
          ResText = "200 - Votre modification a bien été pris en compte";
          typeAlert = "success";
          break;
        case "6":
          this.logOut(true);
          break;
        case "7":
          ResText =
            "403 Forbidden - Impossible d'accéder à cette page car vous avez drop (arrêtez) cette anime. (Pour le reprendre aller sur l'anime depuis votre liste et clicker sur le bouton reprendre/play";
          typeAlert = "danger";
          break;
        case "8":
          ResText =
            "403 Forbidden - Impossible d'accéder à cette page car vous avez mis en attente cette anime. (Pour le reprendre aller sur l'anime depuis votre liste et clicker sur le bouton reprendre/play";
          typeAlert = "danger";
          break;
        case "9":
          ResText =
            "403 Forbidden - Impossible d'accéder à cette page car cette anime est allégée.";
          typeAlert = "danger";
          break;
        case "10":
          ResText = "Aucun ID préciser";
          typeAlert = "danger";
          break;
        case "11":
          ResText = "Type Inexistant";
          typeAlert = "danger";
          break;
        case "12":
          ResText = "Element inexistant (404)";
          typeAlert = "danger";
          break;
        case "13":
          ResText =
            "403 Forbidden - Veuillez d'abord vous connectez sur la page principal";
          typeAlert = "danger";
          break;
        default:
          break;
      }
      this.setState({ ResText, typeAlert, RedirectPage: "/" });

      setTimeout(() => {
        this.setState({ ResText: null, typeAlert: null });
      }, 12000);
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
    if (this.state.OfflineMode === false) {
      this.DataBaseWS = firebase.database().ref(this.state.Pseudo);
      this.DataBaseWS.on("value", (snap) => {
        const NewData = snap.val();
        if (!NewData) return this.logOut();
        const isFirstQuerie = this.state.FirstQuerie;
        this.refreshValueFirebase((DataNotif) => {
          if (!isFirstQuerie) this.notifyMe(DataNotif);
          if (this.state.NewLogin) {
            this.verificateNum();
          }
        }, NewData);
      });
    }
  };

  OfflineMode = (forced, auto = false) => {
    const self = this;
    if (forced === true) {
      next();
    } else {
      axios
        .get("https://rest.ensembl.org/info/ping?content-type=application/json")
        .then(() => {
          const connection =
            navigator.connection ||
            navigator.mozConnection ||
            navigator.webkitConnection;
          if (!auto)
            this.ShowMessageInfo(
              "Impossible d'activé le mode hors ligne",
              7000,
              "danger"
            );
          else if (!connection)
            this.ShowMessageInfo(
              "Connexion internet faible/instable.",
              7000,
              "warn"
            );
        })
        .catch(next);
    }

    async function next() {
      self.setState({ OfflineMode: true, RefreshRenderAnime: true });
      self.ShowMessageInfo("Mode hors ligne activé", 6000, "success");

      if (self.setIntervalVar !== null) {
        clearInterval(self.setIntervalVar);
        self.setIntervalVar = null;
      }
      window.localStorage.setItem("OfflineMode", JSON.stringify(true));
      // Get Data IndexedDB
      self.fnDbOffline("GET", null, null, self.notifyMe);
    }
  };

  reAuth = () => {
    // Verified Internet
    axios
      .get("https://rest.ensembl.org/info/ping?content-type=application/json")
      .catch(() => this.OfflineMode(true));
    // reAuth
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ UserOnLogin: true });
        this.handleAuth({ user });
      }

      this.setState({ AuthenticateMethod: true, AllowUseReAuth: false });
    });
  };

  reconectFirebase = () => {
    let i = 0;
    this.setIntervalVar = setInterval(() => {
      if (i === 5 && this.state.UserOnLogin !== null) this.reAuth();
      if (i === 10) this.OfflineMode(null, true);
      // Allow Vpn
      window.localStorage.removeItem("firebase:previous_websocket_failure");
      i++;
    }, 1000);
  };

  AllowVpn = () => {
    let i = 0;
    this.setIntervalVar = setInterval(() => {
      if (i === 5 && this.state.UserOnLogin !== null) this.reAuth();
      if (i === 10) this.OfflineMode(null, true);
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
        db.transaction("NotifFirebase").objectStore("NotifFirebase"),
      ];

      const results = await Promise.all(
        Store.map(async (req) => await req.getAll())
      );

      ["serie", "film", "NextAnim", "ParamsOptn", "Notif"].forEach((key, i) => {
        if (!results[i] || !results[i][0].data) return;
        this.updateValue(`${Pseudo}`, { [key]: results[i][0].data });
      });
      this.setState({ UpdateDbFromIndexedDB: false });
    }
  };

  refreshValueFirebase = async (after = null, WithWSData, forced = false) => {
    try {
      const deepEqualObj = (object1, object2) => {
        const isObject = (object) => {
          return object != null && typeof object === "object";
        };
        if (typeof object1 !== "object" || typeof object2 !== "object")
          return false;
        const keys1 = Object.keys(object1);
        const keys2 = Object.keys(object2);

        if (keys1.length !== keys2.length) {
          return false;
        }

        for (const key of keys1) {
          const val1 = object1[key];
          const val2 = object2[key];
          const areObjects = isObject(val1) && isObject(val2);
          if (
            (areObjects && !deepEqualObj(val1, val2)) ||
            (!areObjects && val1 !== val2)
          ) {
            return false;
          }
        }

        return true;
      };

      // Data In One Var
      const GlobalInfoUser = forced
        ? await base.fetch(`${this.state.Pseudo}`, {
            context: this,
          })
        : WithWSData;

      const {
        NextAnimFireBase,
        serieFirebase,
        filmFireBase,
        MangaFirebase,
        ToReSearchAfterRefresh,
        ModeFilter,
      } = this.state;

      // RefreshVar for Render
      if (this._isMounted) {
        const IsRefreshRenderAnime = deepEqualObj(
          { ...serieFirebase, ...filmFireBase },
          {
            ...(GlobalInfoUser?.serie ? GlobalInfoUser.serie : {}),
            ...(GlobalInfoUser?.film ? GlobalInfoUser.film : {}),
          }
        );
        const IsRefreshRenderNA = deepEqualObj(
          NextAnimFireBase,
          GlobalInfoUser?.NextAnim ? GlobalInfoUser.NextAnim : {}
        );
        const IsRefreshRenderManga =
          deepEqualObj(
            MangaFirebase[0] ? MangaFirebase[0] : {},
            GlobalInfoUser?.manga ? GlobalInfoUser.manga[0] : {}
          ) &&
          deepEqualObj(
            MangaFirebase[1] ? MangaFirebase[1] : {},
            GlobalInfoUser?.manga ? GlobalInfoUser.manga[1] : {}
          )
            ? true
            : false;

        this.setState(
          {
            ModeFindAnime: [false, null],
            RefreshRenderAnime: IsRefreshRenderAnime
              ? this.state.RefreshRenderAnime
              : true,
            RefreshRenderNA: IsRefreshRenderNA
              ? this.state.RefreshRenderNA
              : true,
            RefreshRenderManga: IsRefreshRenderManga
              ? this.state.RefreshRenderManga
              : true,
            FirstQuerie: true,
            LoadingMode: [
              typeof GlobalInfoUser.serie === "object" &&
              typeof GlobalInfoUser.film === "object"
                ? Object.keys(GlobalInfoUser.serie).length !== 0 ||
                  Object.keys(GlobalInfoUser.film).length !== 0
                  ? false
                  : true
                : false,
              typeof GlobalInfoUser.NextAnim === "object"
                ? Object.keys(GlobalInfoUser.NextAnim).length !== 0
                  ? false
                  : true
                : false,
            ],
            ModeFilter:
              GlobalInfoUser.ParamsOptn?.TypeAnimeHomePage &&
              !this.state.FirstQuerie
                ? GlobalInfoUser.ParamsOptn?.TypeAnimeHomePage
                : ModeFilter,
            ModeFilterNA: this.state.ModeFilterNA,
            NextAnimFireBase: !GlobalInfoUser?.NextAnim
              ? {}
              : GlobalInfoUser.NextAnim,
            serieFirebase: !GlobalInfoUser?.serie ? {} : GlobalInfoUser.serie,
            filmFireBase: !GlobalInfoUser?.film ? {} : GlobalInfoUser.film,
            MangaFirebase: !GlobalInfoUser?.manga ? [] : GlobalInfoUser.manga,
            ParamsOptn: !GlobalInfoUser?.ParamsOptn
              ? {}
              : GlobalInfoUser.ParamsOptn,
          },
          () => {
            if (after !== null)
              after(GlobalInfoUser?.Notif ? GlobalInfoUser.Notif : {});
            if (ToReSearchAfterRefresh) this.SearchAnimInList();
          }
        );

        // Check If Data Lost
        const AllDataIndexedDb = await this.fnDbOffline("GETReturn");
        let IsLostData = false;
        let UserNo = false;

        const CheckLastAntiLostData = (type) => {
          if (
            JSON.parse(
              window.localStorage.getItem("LastSecurityAntiLostData")
            ) === true &&
            window.confirm(
              `DERNIER AVERTISSMENT !
          Si vous continué (en appuyant sur "ok") vos ${type} seront supprimées.
          Si vous ne souhaitez pas la disparition de vos ${type} alors appuyer sur "Annulé".`
            )
          ) {
            UserNo = true;
          }
        };

        if (
          (typeof GlobalInfoUser.serie !== "object" ||
            Object.keys(GlobalInfoUser.serie).length === 0) &&
          AllDataIndexedDb[0][0]?.data
        ) {
          CheckLastAntiLostData("séries");
          if (!UserNo) {
            console.warn(
              "Perte des données séries, procedure de réparage enclenché."
            );
            IsLostData = true;
            this.addValue(
              `${this.state.Pseudo}/serie`,
              AllDataIndexedDb[0][0]?.data
            );
          } else {
            UserNo = false;
          }
        }
        if (
          (typeof GlobalInfoUser.film !== "object" ||
            Object.keys(GlobalInfoUser.film).length === 0) &&
          AllDataIndexedDb[1][0]?.data
        ) {
          CheckLastAntiLostData("films");
          if (!UserNo) {
            console.warn(
              "Perte des données film, procedure de réparage enclenché."
            );
            IsLostData = true;
            this.addValue(
              `${this.state.Pseudo}/film`,
              AllDataIndexedDb[1][0]?.data
            );
          } else {
            UserNo = false;
          }
        }
        if (
          (typeof GlobalInfoUser.NextAnim !== "object" ||
            Object.keys(GlobalInfoUser.NextAnim).length === 0) &&
          AllDataIndexedDb[2][0]?.data
        ) {
          CheckLastAntiLostData("prochains animes");
          if (!UserNo) {
            console.warn(
              "Perte des données prochain animes, procedure de réparage enclenché."
            );
            IsLostData = true;
            UserNo = false;
            this.addValue(
              `${this.state.Pseudo}/NextAnim`,
              AllDataIndexedDb[2][0]?.data
            );
          } else {
            UserNo = false;
          }
        }
        if (
          (typeof GlobalInfoUser.ParamsOptn !== "object" ||
            Object.keys(GlobalInfoUser.ParamsOptn).length === 0) &&
          AllDataIndexedDb[3][0]?.data
        ) {
          CheckLastAntiLostData("Configuration Paramètre");
          if (!UserNo) {
            console.warn(
              "Perte des données Paramètre, procedure de réparage enclenché."
            );
            IsLostData = true;
            this.addValue(
              `${this.state.Pseudo}/ParamsOptn`,
              AllDataIndexedDb[3][0]?.data
            );
          } else {
            UserNo = false;
          }
        }
        if (
          (typeof GlobalInfoUser.manga !== "object" ||
            Object.keys(GlobalInfoUser.manga).length === 0) &&
          AllDataIndexedDb[4][0]?.data
        ) {
          CheckLastAntiLostData("Manga");
          if (!UserNo) {
            console.warn(
              "Perte des données Manga, procedure de réparage enclenché."
            );
            IsLostData = true;
            this.addValue(
              `${this.state.Pseudo}/manga`,
              AllDataIndexedDb[4][0]?.data
            );
          } else {
            UserNo = false;
          }
        }

        if (
          JSON.parse(
            window.localStorage.getItem("LastSecurityAntiLostData")
          ) === true
        ) {
          window.localStorage.setItem(
            "LastSecurityAntiLostData",
            JSON.stringify(false)
          );
        }
        if (IsLostData) return;

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
            db
              .transaction("MangaFirebase", "readwrite")
              .objectStore("MangaFirebase"),
          ];
          Store.forEach(async (req) => {
            req.put({
              id: req.name,
              data:
                req.name === "serieFirebase"
                  ? !GlobalInfoUser?.serie
                    ? {}
                    : GlobalInfoUser.serie
                  : req.name === "filmFireBase"
                  ? !GlobalInfoUser?.film
                    ? {}
                    : GlobalInfoUser.film
                  : req.name === "NextAnimFireBase"
                  ? !GlobalInfoUser?.NextAnim
                    ? {}
                    : GlobalInfoUser.NextAnim
                  : req.name === "NotifFirebase"
                  ? GlobalInfoUser.Notif
                  : req.name === "ParamsOptn"
                  ? !GlobalInfoUser?.ParamsOptn
                    ? {}
                    : GlobalInfoUser.ParamsOptn
                  : !GlobalInfoUser?.manga
                  ? []
                  : GlobalInfoUser.manga,
            });
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  fnDbOffline = async (type, path, value, next = null, refresh = true) => {
    try {
      const db = await openDB("AckDb", 1);
      if (type === "GET") {
        // Get Data IndexedDB
        const Store = [
          db.transaction("serieFirebase").objectStore("serieFirebase"),
          db.transaction("filmFireBase").objectStore("filmFireBase"),
          db.transaction("NextAnimFireBase").objectStore("NextAnimFireBase"),
          db.transaction("ParamsOptn").objectStore("ParamsOptn"),
          db.transaction("MangaFirebase").objectStore("MangaFirebase"),
        ];

        const results = await Promise.all(
          Store.map(async (req) => await req.getAll())
        );
        this.setState(
          {
            serieFirebase: results[0]
              ? results[0][0]
                ? results[0][0].data
                  ? results[0][0].data
                  : {}
                : {}
              : {},
            filmFireBase: results[1]
              ? results[1][0]
                ? results[1][0].data
                  ? results[1][0].data
                  : {}
                : {}
              : {},
            NextAnimFireBase: results[2]
              ? results[2][0]
                ? results[2][0].data
                  ? results[2][0].data
                  : {}
                : {}
              : {},
            MangaFirebase:
              results[4] && results[4][0] && results[4][0].data
                ? results[4][0].data
                : [],
            ParamsOptn:
              results[3] && results[3][0] && results[3][0].data
                ? results[3][0].data
                : {},
            LoadingMode: [
              results[0] && results[1]
                ? results[0][0] && results[1][0]
                  ? results[0][0].data && results[1][0].data
                    ? Object.keys(results[0][0].data).length !== 0 ||
                      Object.keys(results[1][0].data).length !== 0
                      ? false
                      : true
                    : true
                  : true
                : true,
              results[2]
                ? results[2][0]
                  ? results[2][0].data
                    ? Object.keys(results[2][0].data).length !== 0
                      ? false
                      : true
                    : true
                  : true
                : true,
            ],
            ModeFindAnime: [false, null],
            RefreshRenderAnime: true,
            RefreshRenderNA: true,
            ModeFilter:
              results[3] &&
              results[3][0] &&
              results[3][0]?.data?.TypeAnimeHomePage &&
              !this.state.FirstQuerie
                ? results[3][0].data.TypeAnimeHomePage
                : this.state.ModeFilter,
            ModeFilterNA: this.state.ModeFilterNA,
          },
          () => {
            if (next !== null) next();
          }
        );
      } else if (type === "GETReturn") {
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

        return results;
      } else if (type === "POST") {
        const WayStr = path.split("/")[1];
        const WayIndex = WayStr === "serie" ? 0 : WayStr === "film" ? 1 : 2;
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
        ];
        Store[WayIndex].put({
          id: Store[WayIndex].name,
          data: value,
        })
          .then(() => {
            if (refresh) this.fnDbOffline("GET");
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
        const WayIndex =
          WayStr === "serie"
            ? 0
            : WayStr === "film"
            ? 1
            : WayStr === "NextAnim"
            ? 2
            : 3;
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
          .then(() => {
            if (refresh) this.fnDbOffline("GET", null, null, next);
          })
          .catch(console.error);
      } else if (type === "DELETE") {
        const WayStr = path.split("/")[1];
        const WayIndex = WayStr === "serie" ? 0 : WayStr === "film" ? 1 : 2;
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
            if (refresh) this.fnDbOffline("GET", null, null, next);
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
    } catch (err) {
      console.error(
        "Error occurred in Update/Get IndexedDB (fnDbOffline)",
        err
      );
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
      .then(() => {
        this.setState({
          ResText: "Votre requête d'ajout a réussite.",
          typeAlert: "success",
        });
      })
      .catch((err) => {
        console.error(err);
        this.OfflineMode(null, true);
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

  updateValue = (path, value, Next = null) => {
    const { OfflineMode } = this.state;
    if (OfflineMode === true) {
      this.fnDbOffline("PUT", path, value, Next !== null ? Next : null);
      return;
    }

    base
      .update(path, {
        data: value,
      })
      .then(() => {
        if (Next !== null) Next();
      })
      .catch((err) => {
        this.OfflineMode(null, true);
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
        this.setState({
          ResText: "Votre requête de suppression a réussite.",
          typeAlert: "success",
        });
      })
      .catch((err) => {
        console.error(err);
        this.OfflineMode(null, true);
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
    this.connectedRef = firebase.database().ref(".info/connected");

    if (!box.proprio) {
      await base.post(`${this.state.Pseudo}/proprio`, {
        data: authData.user.uid,
      });
    }
    // Verified listener Conn
    this?.connectedRef?.on("value", (snap) => {
      if (snap.val() === true) {
        // Verified if OfflineMode In an another session
        if (this.state.OfflineMode === true) {
          this.setState({ UpdateDbFromIndexedDB: true });
          this.UpdateDbFromIndexeddb();
        }
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
          this.ShowMessageInfo("Reconnecté avec succès !", 5000, "success");
          console.warn("Firebase Connexion (re)establish");
        }
      } else {
        this.reconectFirebase();
        this.setState({ ReConnectionFirebase: true });
        this.ShowMessageInfo(
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
      UserOnLogin: false,
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
        // Connected Successfully
        this.setState({
          NewLogin: true,
          JustDefined: false,
          RefreshRenderAnime: true,
          RefreshRenderNA: true,
          RefreshRenderManga: true,
        });
        this.ActiveWebSockets();
        this.NumberOfFailedConnection = 0;
      })
      .catch(() => {
        // Not connected: Bad Code ?
        this.NumberOfFailedConnection += 1;
        this.ShowMessageInfo(
          "La connexion a echoué: Mauvaise code ?",
          6000,
          "danger"
        );
        this.setState({
          CodeNumber: this.NumberOfFailedConnection >= 3 ? ["", 1] : ["", 2],
        });
        if (this.NumberOfFailedConnection >= 3) {
          window.confirmationResult = null;
          this.NumberOfFailedConnection = 1;
        }
      });
  };

  verificateNum = () => {
    const { NumTel } = this.state;

    if (NumTel !== "") {
      const UserNum = firebase.auth()?.currentUser?.phoneNumber;

      if (UserNum && NumTel !== UserNum) {
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
        this.setState(
          {
            // Firebase
            Pseudo: !JSON.parse(window.localStorage.getItem("Pseudo"))
              ? null
              : JSON.parse(window.localStorage.getItem("Pseudo")),
            NumTel: "",
            NewLogin: false,
            NextAnimFireBase: {},
            MangaFirebase: [],
            filmFireBase: {},
            serieFirebase: {},
            ParamsOptn: null,
            FirstQuerie: false,
            AuthenticateMethod: false,
            AllowUseReAuth: false,
            uid: null,
            proprio: null,
            ReConnectionFirebase: false,
            UserOnLogin: false,
            // Bon fonctionnement de l'app
            PageMode:
              JSON.parse(window.localStorage.getItem("PageMode")) === null ||
              JSON.parse(window.localStorage.getItem("PageMode")) === undefined
                ? true
                : JSON.parse(window.localStorage.getItem("PageMode")),
            OfflineMode: !JSON.parse(window.localStorage.getItem("OfflineMode"))
              ? false
              : JSON.parse(window.localStorage.getItem("OfflineMode")),
            UpdateDbFromIndexedDB: false,
            LastAntiLostData:
              JSON.parse(
                window.localStorage.getItem("LastSecurityAntiLostData")
              ) !== false &&
              JSON.parse(
                window.localStorage.getItem("LastSecurityAntiLostData")
              ) !== true
                ? true
                : JSON.parse(
                    window.localStorage.getItem("LastSecurityAntiLostData")
                  ),
            findAnim: [],
            JustDefined: false,
            RedirectPage: null,
            IdToAddEp: null,
            InfoAnimeToChangeNote: null,
            //// Modal
            ShowModalSearch: false,
            ShowModalChangeNote: false,
            ShowModalAddAnime: false,
            ShowModalAddNM: false,
            ShowModalAddNotifLier: false,
            ShowModalChooseImgURL: [false, null],
            ShowModalImportFile: false,
            ShowModalVerification: false,
            ShowModalAddManga: false,
            ////
            OpenNextNewAnime: false,
            PalmaresModal: false,
            SeasonPage: false,
            NotAskAgain: true,
            ModePreview: false,
            SwitchMyAnim: true,
            SwipeActive: true,
            AddNotifWithAnim: false,
            animToDetails: [],
            SeasonAnimeDetails: null,
            NextAnimToDelete: null,
            NextMangaToDelete: null,
            SearchInAnimeList: [false, null],
            RefreshRenderAnime: true,
            RefreshRenderNA: true,
            RefreshRenderManga: true,
            HaveAlreadyBeenMix: [false, false],
            NextReRenderOrderSerie: null,
            NextReRenderOrderNA: null,
            MyMangaListSaved: [
              "Vous n'avez aucun Manga En Cours",
              "Vous n'avez aucun Manga à Regarder Prochainement",
            ],
            MyAnimListSaved: null,
            MyNextAnimListSaved: null,
            ModeFilter: "NotFinished",
            ModeFilterNA: "all",
            ModeFindAnime: [false, null],
            LoadingMode: [true, true],
            palmares: null,
            ToReSearchAfterRefresh: false,
            MicOn: false,
            addEPToAlleged: false,
            ShowMessage: false,
            ShowMessageHtml: false,
            SecondMessage: false,
            // Form
            title: "",
            type: "serie",
            typeManga: ["scan", false],
            Rate: 7.5,
            UrlUserImg: "",
            FileToImport: null,
            imageUrl: null,
            AnimateFasIcon: [false, false],
            EpisodeName: null,
            DurationPerEp: null,
            AntiLostData: true,
            SeasonAnimCheck: false,
            OpenSearchFilter: false,
            WaitAnimCheck: false,
            ModeCombinaisonSearch: "ET",
            year: new Date().getFullYear().toString(),
            season: "spring",
            SearchFilter: {},
            day: new Date().getDay().toString(),
            time:
              new Date().getHours() * 3600 +
              Math.round(new Date().getMinutes() / 10) * 10 * 60,
            durer: 110,
            nbEP: "",
            Scan: NaN,
            Volumes: [NaN, NaN],
            VolumesPersonnalize: {},
            NextManga: "",
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
            ResTextMsg: null,
            typeAlert: null,
            typeAlertMsg: null,
            // A2HS
            AddToHomeScreen: null,
          },
          async () => {
            if (this.DataBaseWS) this.DataBaseWS.off("value");
            if (this.connectedRef) this.connectedRef.off("value");
            this.DataBaseWS = null;
            this.connectedRef = null;
            this.setIntervalVar = null;
            this.setTimeOutMsgInfo = null;
            this.setTimeOutMsgInfo2 = null;
            this.NumberOfFailedConnection = 0;
            // IndexedDB
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
                .transaction("ParamsOptn", "readwrite")
                .objectStore("ParamsOptn"),
              db
                .transaction("NotifFirebase", "readwrite")
                .objectStore("NotifFirebase"),
              db
                .transaction("MangaFirebase", "readwrite")
                .objectStore("MangaFirebase"),
            ];

            Store.forEach((req) => req.clear());
            window.localStorage.clear();
            // Refresh ALl
            if (refresh) {
              window.location.reload();
            }
          }
        );
      })
      .catch(console.error);
  };

  SearchAnimInList = () => {
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

    // My Anime
    if (
      SearchInAnimeList[1] &&
      typeof titleSearchAnime === "string" &&
      titleSearchAnime.trim().length !== 0
    ) {
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
    } else {
      if (SearchInAnimeList[1]) Error();
    }

    // NextAnime
    if (
      !SearchInAnimeList[1] &&
      (ModeCombinaisonSearch === "OU" || GoodModeET === 1)
    ) {
      let GlobalSearchArr = [];
      if (
        !SearchInAnimeList[1] &&
        typeof titleSearchAnime === "string" &&
        titleSearchAnime.trim().length !== 0
      ) {
        // NextAnime By Title
        Mode = 1;
        let AlreadyFind = false;
        Object.values(NextAnimFireBase).forEach((NA, i) => {
          if (NA.AlternativeTitle !== undefined) {
            NA.AlternativeTitle.forEach((ATitle) => {
              if (
                NA.name.toLowerCase() === titleSearchAnime.toLowerCase() ||
                NA.name
                  .toLowerCase()
                  .includes(titleSearchAnime.toLowerCase()) ||
                ATitle.toLowerCase() === titleSearchAnime.toLowerCase() ||
                ATitle.toLowerCase().includes(titleSearchAnime.toLowerCase())
              ) {
                if (!AlreadyFind) index = [...index, i];
                AlreadyFind = true;
              }
            });
          } else if (
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

      if (GlobalSearchArr.length === 0) {
        Error();
        return;
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
    } else if (!SearchInAnimeList[1]) {
      let AlreadyFind = false;
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
                if (NA.AlternativeTitle !== undefined) {
                  NA.AlternativeTitle.forEach((ATitle) => {
                    if (
                      (Tag.toLowerCase() === Bdg.toLowerCase() ||
                        Bdg.toLowerCase().includes(Tag.toLowerCase())) &&
                      (NA.Importance === ImportanceSearch ||
                        (ImportanceSearch === 0 && !NA.Importance)) &&
                      (NA.name.toLowerCase() ===
                        titleSearchAnime.toLowerCase() ||
                        NA.name
                          .toLowerCase()
                          .includes(titleSearchAnime.toLowerCase()) ||
                        ATitle.toLowerCase() ===
                          titleSearchAnime.toLowerCase() ||
                        ATitle.toLowerCase().includes(
                          titleSearchAnime.toLowerCase()
                        ))
                    ) {
                      if (!AlreadyFind) index = [...index, i];
                      AlreadyFind = true;
                    }
                  });
                } else if (
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
          if (NA.AlternativeTitle !== undefined) {
            NA.AlternativeTitle.forEach((ATitle) => {
              if (
                (NA.Importance === ImportanceSearch ||
                  (ImportanceSearch === 0 && !NA.Importance)) &&
                (NA.name.toLowerCase() === titleSearchAnime.toLowerCase() ||
                  NA.name
                    .toLowerCase()
                    .includes(titleSearchAnime.toLowerCase()) ||
                  ATitle.toLowerCase() === titleSearchAnime.toLowerCase() ||
                  ATitle.toLowerCase().includes(titleSearchAnime.toLowerCase()))
              ) {
                if (!AlreadyFind) index = [...index, i];
                AlreadyFind = true;
              }
            });
          } else if (
            (NA.Importance === ImportanceSearch ||
              (ImportanceSearch === 0 && !NA.Importance)) &&
            (NA.name.toLowerCase() === titleSearchAnime.toLowerCase() ||
              NA.name.toLowerCase().includes(titleSearchAnime.toLowerCase()))
          )
            index = [...index, i];

          return null;
        });
        next(index.map((In) => Object.keys(NextAnimFireBase)[In]));
      } else if (
        typeof TagSearchAnime === "string" &&
        TagSearchAnime.trim().length !== 0 &&
        typeof titleSearchAnime === "string" &&
        titleSearchAnime.trim().length !== 0
      ) {
        const TagArr = TagSearchAnime.split(",");
        Object.values(NextAnimFireBase).forEach((NA, i) => {
          TagArr.forEach((Tag) => {
            if (NA.Badges)
              NA.Badges.forEach((Bdg) => {
                if (NA.AlternativeTitle !== undefined) {
                  NA.AlternativeTitle.forEach((ATitle) => {
                    if (
                      (Tag.toLowerCase() === Bdg.toLowerCase() ||
                        Bdg.toLowerCase().includes(Tag.toLowerCase())) &&
                      (NA.name.toLowerCase() ===
                        titleSearchAnime.toLowerCase() ||
                        NA.name
                          .toLowerCase()
                          .includes(titleSearchAnime.toLowerCase()) ||
                        ATitle.toLowerCase() ===
                          titleSearchAnime.toLowerCase() ||
                        ATitle.toLowerCase().includes(
                          titleSearchAnime.toLowerCase()
                        ))
                    ) {
                      if (!AlreadyFind) index = [...index, i];
                      AlreadyFind = true;
                    }
                  });
                } else if (
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
      } else {
        Error();
      }
    } else {
      if (!SearchInAnimeList[1]) Error();
    }

    function Error() {
      self.setState({
        ModeFindAnime: [false, null],
        ToReSearchAfterRefresh: false,
        ResText: "Veuillez remplir au minimum le(s) champs",
        typeAlert: "danger",
      });
      self.cancelModal();
      setTimeout(() => {
        self.setState({
          ResText: null,
          typeAlert: null,
        });
      }, 4000);
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
    const { Pseudo, nbEP, IdToAddEp, SeasonAnimCheck, WaitAnimCheck } =
      this.state;

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
        AnimeSeason: !SeasonAnimCheck ? null : true,
        InWait: !WaitAnimCheck ? null : true,
        Lier: null,
        Drop: null,
        Paused: null,
        Rate: null,
      });
      this.setState({ RedirectPage: `/Watch/${Pseudo}/${IdToAddEp}` });
    }
  };

  AddNotifLier = async (IDSerie) => {
    const { Pseudo, title, day, time, OfflineMode } = this.state;
    const db = await openDB("AckDb", 1);
    const Store = db
      .transaction("NotifFirebase", "readwrite")
      .objectStore("NotifFirebase");
    const results = await Store.getAll();

    const NotifFirebase = OfflineMode
      ? results[0].data
      : await base.fetch(`${this.state.Pseudo}/Notif`, {
          context: this,
        });

    const IDNotif = `notif${this.token(10)}${Date.now()}`;

    // FN
    const GenerateCalledTime = () => {
      let NextDay = new Date();
      // Get Day to first call notif from now
      NextDay.setDate(
        NextDay.getDate() + ((parseInt(day) + 7 - NextDay.getDay()) % 7)
      );
      // Set date to 00:00
      NextDay.setHours(0, 0, 0, 0);
      // Set Date to TimeStamp
      NextDay = NextDay.getTime();
      // Add Time in day to call Notif
      NextDay += time * 1000;
      // Return => 604800000 -> Week in ms / 1209600000 -> 2Week in ms
      return [NextDay, NextDay + 604800000, NextDay + 1209600000];
    };

    const NewNotifTemplate = {
      ...NotifFirebase,
      [IDNotif]: {
        calledTime: GenerateCalledTime(),
        Lier: IDSerie,
        name: title,
      },
    };

    if (!OfflineMode) {
      this.addValue(`${Pseudo}/Notif`, NewNotifTemplate);
    } else {
      Store.put({
        id: "NotifFirebase",
        data: NewNotifTemplate,
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
    }

    return IDNotif;
  };

  CalculateWhereStop = (AnimEP) => {
    let RepereStop = [];
    AnimEP.forEach((Saison) => {
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

  CalculateProgressionAnime = (AnimEP) => {
    const TotalEP = AnimEP.reduce((acc, currentValue) => {
      return acc + currentValue.Episodes.length;
    }, 0);

    let nbEpFinished = 0;
    AnimEP.forEach((Season) => {
      Season.Episodes.forEach((Ep) => {
        if (Ep.finished) nbEpFinished++;
      });
    });

    return nbEpFinished === 0 ? 0 : Math.round((nbEpFinished / TotalEP) * 100);
  };

  FindEPBtn = async () => {
    this.setState({ AnimateFasIcon: [true, false] });
    const { title, nbEP, durer } = this.state;
    try {
      const AnimeID = (await this.SearchAnim(title, true)).data.results[0]
        .mal_id;
      const InfoAnimeRes = await this.SeeInDetails(AnimeID, true, true);
      this.setState({
        AnimateFasIcon: [false, false],
        nbEP: InfoAnimeRes?.length ? `${InfoAnimeRes.length}` : nbEP,
        durer: InfoAnimeRes?.data?.duration
          ? this.durerStrToIntMin(InfoAnimeRes.data.duration)
          : durer,
      });
    } catch (err) {
      this.setState({ AnimateFasIcon: [true, true] }, () => {
        setTimeout(() => {
          this.setState({ AnimateFasIcon: [false, false] });
        }, 4000);
      });
      console.error(err);
    }
  };

  TakeInfoFromName = async (
    title,
    ModeRetake = false,
    id = null,
    next = null,
    Manga = false
  ) => {
    try {
      const AnimeID = (await this.SearchAnim(title, true)).data.results[0]
        .mal_id;
      const InfoAnimeRes = await this.SeeInDetails(AnimeID, true);
      if (Manga) {
        return this.handleDeleteImageURLParameter(InfoAnimeRes[1].image_url);
      }
      if (ModeRetake === true) {
        this.updateValue(`${this.state.Pseudo}/${id.split("-")[0]}/${id}`, {
          imageUrl: this.handleDeleteImageURLParameter(
            InfoAnimeRes[1].image_url
          ),
          DurationPerEP: !InfoAnimeRes[1].duration
            ? "none"
            : InfoAnimeRes[1].duration,
        });
        return;
      }
      return next(
        this.handleDeleteImageURLParameter(InfoAnimeRes[1].image_url),
        InfoAnimeRes[0].episodes.length !== 0
          ? InfoAnimeRes[0].episodes.map((epi) => {
              return {
                title: epi.title,
                filler: !epi.filler ? null : true,
                recap: !epi.recap ? null : true,
              };
            })
          : "none",
        !InfoAnimeRes[1].duration ? "none" : InfoAnimeRes[1].duration
      );
    } catch (err) {
      console.error(err);
      this.setState({ ShowModalChooseImgURL: [true, id] });
      if (ModeRetake === true) return;
      if (Manga) return "PlaceHolderImg";
      return next("PlaceHolderImg", "none", "none");
    }
  };

  addManga = async () => {
    const {
      Pseudo,
      OfflineMode,
      typeManga,
      MangaFirebase,
      VolumesPersonnalize,
      title,
      Scan,
      Volumes,
      NextMangaToDelete,
      imageUrl,
      SwipeActive,
      UrlUserImg,
    } = this.state;
    const self = this;
    if (OfflineMode === true) {
      return this.setState({
        ResText: "Impossible d'ajouter un manga en mode Hors-Ligne",
        typeAlert: "warning",
      });
    }

    let imgUrl = imageUrl;
    if (typeof title === "string" && title.trim().length !== 0) {
      if (typeof UrlUserImg === "string" && UrlUserImg.trim().length !== 0) {
        try {
          new URL(UrlUserImg);
          imgUrl = UrlUserImg;
        } catch (err) {
          console.error(err);
          this.ShowMessageInfo(
            "Veuillez donner un URL valide: https://www.exemple.com",
            7000,
            "danger"
          );
          return;
        }
      } else if (!imgUrl)
        imgUrl = await this.TakeInfoFromName(title, false, null, null, true);

      let IsGoodForPost = true,
        ScanArr = [];

      if (typeManga[0] === "scan")
        for (let i = 0; i < Scan; i++) {
          ScanArr = [...ScanArr, false];
        }

      if (typeManga[0] === "volume") {
        if (Volumes[0] >= 50000 || Volumes[1] >= 10000) IsGoodForPost = false;
        let Scans = [];
        for (let i = 0; i < Volumes[1]; i++) {
          Scans = [...Scans, false];
        }
        if (Scans.length <= 0) {
          IsGoodForPost = false;
        }
        for (let i = 0; i < Volumes[0]; i++) {
          if (!IsGoodForPost) break;
          let ScansPerso = [];
          if (VolumesPersonnalize[`Volume${i}`]?.Scan) {
            for (let j = 0; j < VolumesPersonnalize[`Volume${i}`]?.Scan; j++) {
              ScansPerso = [...ScansPerso, false];
            }
          }
          ScanArr = [
            ...ScanArr,
            {
              volumeId: i + 1,
              finished: false,
              Scans: ScansPerso.length > 0 ? ScansPerso : Scans,
            },
          ];
        }
      }

      if (ScanArr.length <= 0 || !IsGoodForPost) {
        return this.ShowMessageInfo("Nombre de Scan Incorrect", 6000, "warn");
      }

      try {
        Object.keys(MangaFirebase[0]).forEach((key) => {
          if (MangaFirebase[key].name.toLowerCase() === title.toLowerCase()) {
            IsGoodForPost = false;
          }
        });
      } catch (error) {}

      if (IsGoodForPost) {
        this.addValue(`${Pseudo}/manga/0`, {
          ...MangaFirebase[0],
          [`${typeManga[0]}-${this.token(10)}${Date.now()}`]: {
            name: title,
            Scans: ScanArr,
            imageUrl: imgUrl,
            finished: false,
          },
        });
        if (NextMangaToDelete !== null) {
          this.deleteValue(`${Pseudo}/manga/1/${NextMangaToDelete}`);
        }
        reset();
      } else {
        reset(false, `"${title}" existe déjà dans votre liste`);
      }
    } else {
      reset("Veuillez remplir tous les champs");
    }

    function reset(error = false, warn = false) {
      self.cancelModal();
      self.setState({
        SwipeActive: error ? SwipeActive : true,
        ResText: error ? error : warn ? warn : null,
        typeAlert: error ? "danger" : warn ? "warning" : null,
      });
      if (error) {
        setTimeout(() => {
          self.setState({
            ResText: null,
            typeAlert: null,
          });
        }, 3600);
      }
    }
  };

  addAnime = () => {
    const {
      title,
      nbEP,
      SeasonAnimCheck,
      WaitAnimCheck,
      AddNotifWithAnim,
      type,
      durer,
      imageUrl,
      NextAnimToDelete,
      filmFireBase,
      serieFirebase,
      EpisodeName,
      DurationPerEp,
      OfflineMode,
      UrlUserImg,
    } = this.state;
    const self = this;

    let imgUrl = imageUrl,
      EpName = EpisodeName,
      DuraPerEp = DurationPerEp;

    const VerifiedURLUserImg = () => {
      if (typeof UrlUserImg === "string" && UrlUserImg.trim().length !== 0) {
        try {
          new URL(UrlUserImg);
          imgUrl = UrlUserImg;
        } catch (err) {
          console.error(err);
          this.ShowMessageInfo(
            "Veuillez donner un URL valide: https://www.exemple.com",
            7000,
            "danger"
          );
          return;
        }
      }
    };

    if (imgUrl === null || EpName === null || DuraPerEp === null) {
      if (OfflineMode === true) {
        imgUrl = "PlaceHolderImg";
        VerifiedURLUserImg();
        EpName = DuraPerEp = "none";
        next();
      } else {
        const title2 = this.replaceSpace(title, "%20");
        this.TakeInfoFromName(
          title2,
          false,
          null,
          (resImg, resEp, resDuration) => {
            imgUrl = resImg;
            VerifiedURLUserImg();
            EpName = resEp;
            DuraPerEp = resDuration;
            next();
          }
        );
      }
    } else if (
      typeof imgUrl === "string" &&
      EpName.length !== 0 &&
      typeof DuraPerEp === "string"
    ) {
      next();
    } else {
      this.setState({
        ResText:
          "Attention impossible de prendre une image à partir d'un lien non existant",
        typeAlert: "danger",
      });
    }

    async function next() {
      self.setState({
        ModeFindAnime: [false, null],
        ToReSearchAfterRefresh: false,
      });
      let IsGood = false,
        IsGoodForPost = true;
      if (type === "serie") {
        if (
          typeof title === "string" &&
          title.trim().length !== 0 &&
          title !== "" &&
          typeof nbEP === "string" &&
          nbEP.trim().length !== 0 &&
          nbEP !== ""
        ) {
          IsGood = true;
          const IDSerie = `serie-${self.token(10)}${Date.now()}`;
          let IDNotif = null;
          if (AddNotifWithAnim) {
            IDNotif = await self.AddNotifLier(IDSerie);
          }
          let AnimSEP = nbEP.split(",").map((nbEpS, i) => {
            let EpObj = [];

            for (let j = 0; j < parseInt(nbEpS); j++) {
              EpObj = [
                ...EpObj,
                {
                  id: j + 1,
                  finished: false,
                  Info: i === 0 ? (!EpName[j] ? null : EpName[j]) : null,
                },
              ];
            }

            return {
              name: `Saison ${i + 1}`,
              Episodes: EpObj,
              finished: false,
            };
          });

          if (!AnimSEP || AnimSEP[0].Episodes.length <= 0) {
            self.setState({
              ShowModalChooseImgURL: [false, null],
              ShowModalAddAnime: true,
              OpenNextNewAnime: true,
              nbEP: "",
            });
            return self.ShowMessageInfo(
              "Veuillez donner une liste d'épisode valide !",
              6000,
              "warn"
            );
          }

          try {
            Object.keys(serieFirebase).forEach((key) => {
              if (
                serieFirebase[key].name.toLowerCase() === title.toLowerCase()
              ) {
                IsGoodForPost = false;
              }
            });
          } catch (err) {}

          if (IsGoodForPost) {
            self.addValue(`${self.state.Pseudo}/serie`, {
              ...self.state.serieFirebase,
              [IDSerie]: {
                name: title,
                imageUrl: imgUrl,
                Lier: IDNotif,
                finishedAnim: false,
                AnimEP: AnimSEP,
                AnimeSeason: !SeasonAnimCheck ? null : true,
                InWait: !WaitAnimCheck ? null : true,
                DurationPerEP: DuraPerEp,
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
              [`film-${self.token(10)}${Date.now()}`]: {
                name: title,
                durer,
                imageUrl: imgUrl,
                InWait: !WaitAnimCheck ? null : true,
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
          ShowModalAddAnime: false,
          PalmaresModal: false,
          ShowModalVerification: false,
          palmares: null,
          ShowModalAddNotifLier: false,
          AddNotifWithAnim: false,

          SearchInAnimeList: [false, self.state.SearchInAnimeList[1]],
          animToDetails: [],
          // Form
          titleSearchAnime: "",
          ImportanceSearch: null,
          TagSearchAnime: "",
          DeletePathVerif: null,
          SeasonAnimCheck: false,
          WaitAnimCheck: false,
          title: "",
          type: "serie",
          durer: 110,
          nbEP: "",
          NextAnim: "",
          imageUrl: null,
          EpisodeName: null,
          DurationPerEp: null,
          // Alerts
          ResText: null,
          typeAlert: null,
        });
      }
    }

    this.setState({
      ShowModalAddAnime: false,
    });
  };

  DeleteAnimVerification = (path) => {
    this.setState({ ShowModalVerification: true, DeletePathVerif: path });
  };

  notifyMe = (DataNotif) => {
    const self = this;
    const { ParamsOptn } = this.state;
    if (window.Notification && ParamsOptn !== null) {
      if (
        Notification.permission === "granted" &&
        typeof ParamsOptn === "object" &&
        ParamsOptn.NotifState !== false &&
        ParamsOptn.NotifState !== null &&
        ParamsOptn.NotifState !== undefined
      ) {
        self.doNotif(DataNotif);
      } else if (Notification.permission !== "granted") {
        Notification.requestPermission()
          .then(function (p) {
            if (p === "granted") {
              self.doNotif(DataNotif);
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

  doNotif = async (DataNotif) => {
    try {
      const { OfflineMode } = this.state;
      const db = await openDB("AckDb", 1);
      const Store = db
        .transaction("NotifFirebase")
        .objectStore("NotifFirebase");

      const NotifFirebase = OfflineMode
        ? (await Store.getAll())[0].data
        : DataNotif;

      // Generate Notif
      const NotifCall = (notifKey) => {
        const UpdateNotifFB = () => {
          const GenerateCalledTime = (day, time) => {
            let NextDay = new Date();
            NextDay.setDate(
              NextDay.getDate() + ((parseInt(day) + 7 - NextDay.getDay()) % 7)
            );
            NextDay.setHours(0, 0, 0, 0);
            NextDay = NextDay.getTime();
            NextDay += time * 1000;
            return [NextDay, NextDay + 604800000, NextDay + 1209600000];
          };
          let CopyCalledTime = [...NotifFirebase[notifKey].calledTime];
          let NumberToAdd = 0,
            TimeStampBackUp = null;
          // Remove
          let ToRemoveIndex = [];
          CopyCalledTime.forEach((timestamp) => {
            if (timestamp <= Date.now()) {
              NumberToAdd++;
              NumberToAdd === 3
                ? (TimeStampBackUp = timestamp)
                : (TimeStampBackUp = null);
              ToRemoveIndex = [...ToRemoveIndex, timestamp];
            }
          });
          ToRemoveIndex.forEach((timestampToRemove) => {
            CopyCalledTime = CopyCalledTime.filter(
              (timestamp) => timestamp !== timestampToRemove
            );
          });
          // Add New
          if (NumberToAdd === 3) {
            const Day = new Date(TimeStampBackUp).getDay();
            const Time =
              new Date(TimeStampBackUp).getHours() * 3600 +
              new Date(TimeStampBackUp).getMinutes() * 60;
            CopyCalledTime = GenerateCalledTime(Day, Time);
          } else {
            for (let i = 0; i < NumberToAdd; i++) {
              CopyCalledTime = [
                ...CopyCalledTime,
                CopyCalledTime[CopyCalledTime.length - 1] + 604800000,
              ];
            }
          }

          // Save
          this.updateValue(
            `${this.state.Pseudo}/Notif/${notifKey}`,
            {
              calledTime: CopyCalledTime,
            },
            () => {
              // LierNotif
              if (NotifFirebase[notifKey].Lier) {
                this.updateValue(
                  `${this.state.Pseudo}/serie/${NotifFirebase[notifKey].Lier}`,
                  {
                    NewEpMode: true,
                  }
                );
              }
            }
          );
        };
        // Make Notif
        navigator.serviceWorker
          .getRegistration()
          .then((reg) => {
            reg.showNotification(
              `Sortie Anime: ${NotifFirebase[notifKey].name} !`,
              {
                body: `Nouvel Épisode de ${NotifFirebase[notifKey].name}, ne le rate pas !`,
                icon: "https://myanimchecker.netlify.app/Img/IconAck192.png",
                vibrate: [100, 50, 100],
              }
            );
            UpdateNotifFB();
          })
          .catch(() => {
            new Notification(
              `Sortie Anime: ${NotifFirebase[notifKey].name} !`,
              {
                body: `Nouvel Épisode de ${NotifFirebase[notifKey].name}, ne le rate pas !`,
                icon: "https://myanimchecker.netlify.app/Img/IconAck192.png",
              }
            );
            UpdateNotifFB();
          });
      };
      // Check
      Object.keys(NotifFirebase).forEach((notifKey) => {
        if (
          NotifFirebase[notifKey].calledTime[0] <= Date.now() &&
          !NotifFirebase[notifKey].paused
        )
          NotifCall(notifKey);
      });
    } catch (err) {
      this.OfflineMode(null, true);
      console.error(err);
    }
  };

  compareValues = (key, order = "asc") => {
    return function innerSort(a, b) {
      if (!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
        // property doesn't exist on either object
        return 0;
      }

      const varA = typeof a[key] === "string" ? a[key].toUpperCase() : a[key];
      const varB = typeof b[key] === "string" ? b[key].toUpperCase() : b[key];

      let comparison = 0;
      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
      return order === "desc" ? comparison * -1 : comparison;
    };
  };

  ImportFile = () => {
    const {
      Pseudo,
      FileToImport,
      AntiLostData,
      serieFirebase,
      filmFireBase,
      NextAnimFireBase,
      MangaFirebase,
      ParamsOptn,
    } = this.state;
    let NotAutoCloseAlert = false;

    if (!FileToImport) {
      this.ShowMessageInfo("Auncun fichier selectionné.", 5000, "danger");
      return;
    }

    const fr = new FileReader();
    fr.onload = async () => {
      this.setState({ ResText: "Fichier Importer !", typeAlert: "success" });
      const fileContent = JSON.parse(fr.result);

      if (typeof fileContent !== "object" || !fileContent) {
        NotAutoCloseAlert = true;
        this.setState({
          ResText:
            "Danger: Le fichier n'est pas d'ACK. Opération annulée automatiquement",
          typeAlert: "danger",
        });
        return;
      }
      if (
        !fileContent.serie &&
        !fileContent.film &&
        !fileContent.NextAnim &&
        !fileContent.Notif &&
        !fileContent.manga &&
        !fileContent.ParamsOptn
      ) {
        NotAutoCloseAlert = true;
        this.setState({
          ResText:
            "Danger: Le fichier ne contient aucune données (il aurait supprimer TOUTES vos données). Opération annulée automatiquement",
          typeAlert: "danger",
        });
        return;
      }
      if (
        (!fileContent.serie ||
          !fileContent.film ||
          !fileContent.NextAnim ||
          !fileContent.Notif ||
          !fileContent.manga ||
          !fileContent.ParamsOptn) &&
        !AntiLostData
      ) {
        if (
          !window.confirm(
            `ATTENTION !!! Le système de sécurité a détecté un problème, les entrers suivantes sont introuvables:
            ${!fileContent.serie ? "- Les séries\n" : ""}${
              !fileContent.film ? "- Les films\n" : ""
            }${!fileContent.NextAnim ? "- Les prochains animes\n" : ""}${
              !fileContent.Notif ? "- Les notifications\n" : ""
            }${!fileContent.manga ? "- Les mangas\n" : ""}${
              !fileContent.ParamsOptn ? "- Les paramètres\n" : ""
            }Cela supprimera de votre liste ces/cette entrer(s). Imaginons qu'il manque les films et les séries alors en validant vos séries et films seront supprimer et remplacé par... RIEN (donc seront supprimer). Si vous voulez que ces entrers vide soit ignorer et que ACK remplisse uniquement les entrers non vide, veuillez cochez l'option "Anti perte de données" dans importer (cette option aura pour effet d'empêcher tous ce que je viens de vous dire).

            Voulez vous continué ? Si oui les données annoncés seront supprimer.
            `
          )
        ) {
          NotAutoCloseAlert = true;
          this.setState({
            ResText: "Opération annulée par l'utilisateur",
            typeAlert: "success",
          });
          return;
        } else {
          window.localStorage.setItem(
            "LastSecurityAntiLostData",
            JSON.stringify(true)
          );
        }
      }

      const GetNotifIndexedDB = async () => {
        const db = await openDB("AckDb", 1);
        const Store = db
          .transaction("NotifFirebase")
          .objectStore("NotifFirebase");
        const results = await Store.getAll();
        return results[0].data;
      };

      const GiveNewKey = (data, type) => {
        let DataToReturn = {};
        Object.keys(data).forEach((key) => {
          DataToReturn = {
            ...DataToReturn,
            [`${type === true ? key.split("-")[0] : type}-${this.token(10)}${
              Date.now() +
              (Math.random() * 10000).toString().split(".").join("")
            }`]: {
              ...data[key],
            },
          };
        });
        return DataToReturn;
      };

      this.updateValue(`${Pseudo}`, {
        serie: AntiLostData
          ? !fileContent.serie
            ? !serieFirebase ||
              (typeof serieFirebase === "object" &&
                Object.keys(serieFirebase).length === 0)
              ? null
              : serieFirebase
            : GiveNewKey(fileContent.serie, "serie")
          : !fileContent.serie
          ? null
          : GiveNewKey(fileContent.serie, "serie"),
        film: AntiLostData
          ? !fileContent.film
            ? !filmFireBase ||
              (typeof filmFireBase === "object" &&
                Object.keys(filmFireBase).length === 0)
              ? null
              : filmFireBase
            : GiveNewKey(fileContent.film, "film")
          : !fileContent.film
          ? null
          : GiveNewKey(fileContent.film, "film"),
        NextAnim: AntiLostData
          ? !fileContent.NextAnim
            ? !NextAnimFireBase ||
              (typeof NextAnimFireBase === "object" &&
                Object.keys(NextAnimFireBase).length === 0)
              ? null
              : NextAnimFireBase
            : GiveNewKey(fileContent.NextAnim, "NextAnim")
          : !fileContent.NextAnim
          ? null
          : GiveNewKey(fileContent.NextAnim, "NextAnim"),
        manga: AntiLostData
          ? !fileContent.manga
            ? !MangaFirebase
              ? null
              : MangaFirebase
            : [
                GiveNewKey(fileContent.manga[0], true),
                GiveNewKey(fileContent.manga[1], "NM"),
              ]
          : !fileContent.manga
          ? null
          : [
              GiveNewKey(fileContent.manga[0], true),
              GiveNewKey(fileContent.manga[1], "NM"),
            ],
        Notif: AntiLostData
          ? !fileContent.Notif
            ? !(await GetNotifIndexedDB())
              ? null
              : await GetNotifIndexedDB()
            : GiveNewKey(fileContent.Notif, "Notif")
          : !fileContent.Notif
          ? null
          : GiveNewKey(fileContent.Notif, "Notif"),
        ParamsOptn: AntiLostData
          ? !fileContent.ParamsOptn
            ? !ParamsOptn ||
              (typeof ParamsOptn === "object" &&
                Object.keys(ParamsOptn).length === 0)
              ? null
              : ParamsOptn
            : fileContent.ParamsOptn
          : !fileContent.ParamsOptn
          ? null
          : fileContent.ParamsOptn,
      });
    };

    fr.onerror = () =>
      this.setState({
        ResText: "Impossible d'importé le fichier",
        typeAlert: "danger",
      });

    fr.readAsText(FileToImport);
    this.cancelModal();
    setTimeout(() => {
      if (!NotAutoCloseAlert)
        this.setState({
          ResText: null,
          typeAlert: null,
        });
    }, 4000);
  };

  addNextManga = () => {
    const self = this;
    const { Pseudo, NextManga, MangaFirebase, OfflineMode } = this.state;
    if (OfflineMode === true) {
      return this.setState({
        ResText: "Impossible d'ajouter un manga en mode Hors-Ligne",
        typeAlert: "warning",
      });
    }

    if (typeof NextManga === "string" && NextManga.trim().length !== 0) {
      let IsGoodForPost = true;

      try {
        Object.keys(MangaFirebase[1]).forEach((NM) => {
          if (NM.name === NextManga) IsGoodForPost = false;
        });
      } catch (err) {}

      if (IsGoodForPost) {
        this.addValue(`${Pseudo}/manga/1`, {
          ...MangaFirebase[1],
          [`NM-${this.token(10)}${Date.now()}`]: { name: NextManga },
        });
        reset();
      } else {
        reset(false, `"${NextManga}" existe déjà dans votre liste`);
      }
    } else {
      reset("Veuillez remplir tous les champs");
    }

    function reset(error = false, warn = false) {
      self.setState({
        NextManga: "",
        ShowModalAddNM: false,
        ResText: error ? error : warn ? warn : null,
        typeAlert: error ? "danger" : warn ? "warning" : null,
      });
      if (error) {
        setTimeout(() => {
          self.setState({
            ResText: null,
            typeAlert: null,
          });
        }, 3600);
      }
    }
  };

  addNextAnim = async (event) => {
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

      // GET Title Alternative
      const AnimeID = (await this.SearchAnim(NextAnim, true)).data.results[0]
        .mal_id;
      const { title, title_english, title_synonyms } = (
        await this.SeeInDetails(AnimeID, true)
      )[1];

      try {
        Object.keys(NextAnimFireBase).forEach((key) => {
          if (NextAnimFireBase[key].AlternativeTitle !== undefined) {
            NextAnimFireBase[key].AlternativeTitle.forEach((ATitle) => {
              if (
                NextAnimFireBase[key].name.toLowerCase() ===
                  NextAnim.toLowerCase() ||
                ATitle.toLowerCase() === NextAnim.toLowerCase()
              ) {
                IsGoodForPost = false;
              }
            });
          } else if (
            NextAnimFireBase[key].name.toLowerCase() === NextAnim.toLowerCase()
          ) {
            IsGoodForPost = false;
          }
        });
      } catch (err) {}

      if (IsGoodForPost) {
        this.addValue(`${this.state.Pseudo}/NextAnim`, {
          ...this.state.NextAnimFireBase,
          [`NextAnim${Date.now()}`]: {
            name: NextAnim,
            Importance: !ImportanceNA ? null : ImportanceNA,
            Badges: BadgeStrToArr(),
            AlternativeTitle: [...title_synonyms, title, title_english],
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
      .trimStart()
      .split("")
      .map((char) => (char === " " ? remplaceStr : char))
      .join("");
  };

  GETSeasonAnime = async () => {
    const { year, season } = this.state;
    this.setState({ AnimateFasIcon: [true, false] });
    try {
      if (
        isNaN(new Date(`1/1/${year}`).getTime()) ||
        !season ||
        (season !== "spring" &&
          season !== "summer" &&
          season !== "fall" &&
          season !== "winter")
      )
        throw new Error("Invaid Date");
      this.setState({
        AnimateFasIcon: [false, false],
        SeasonAnimeDetails: (
          await axios.get(`https://api.jikan.moe/v3/season/${year}/${season}`)
        ).data.anime,
      });
    } catch (err) {
      this.setState({ AnimateFasIcon: [true, true] }, () => {
        setTimeout(() => {
          this.setState({ AnimateFasIcon: [false, false] });
        }, 4000);
      });
      console.error(err);
    }
  };

  SearchAnim = async (name, toReturn = false) => {
    const { PageMode, SearchFilter } = this.state;
    if (toReturn === true) {
      try {
        return await axios.get(
          `https://api.jikan.moe/v3/search/${
            PageMode ? "anime" : "manga"
          }?q=${this.replaceSpace(
            `${name}${name.length <= 1 ? "  " : name.length <= 2 ? " " : ""}`,
            "%20"
          )}&limit=2`
        );
      } catch (err) {
        console.error(err);
        return false;
      }
    }
    this.setState({ ShowModalSearch: true });
    let Request = null;

    if (name === null && Object.keys(SearchFilter).length !== 0) {
      let IsLimitsCall = false;
      Request = `https://api.jikan.moe/v3/search/anime?`;
      Object.keys(SearchFilter).forEach((key, i) => {
        if (key === "limit=") IsLimitsCall = true;
        Request += `${i === 0 ? "" : "&"}${key}${
          key === "q="
            ? this.replaceSpace(
                `${SearchFilter[key]}${
                  SearchFilter[key].length <= 1
                    ? "  "
                    : SearchFilter[key].length <= 2
                    ? " "
                    : ""
                }`,
                "%20"
              )
            : SearchFilter[key]
        }`;
      });
      if (!IsLimitsCall) Request += "&limit=16";
    } else if (name === null && Object.keys(SearchFilter).length === 0) {
      this.cancelModal();
      this.setState({
        ResText: `Veuillez remplir au minimun l'un des filtre...`,
        typeAlert: "danger",
      });
      setTimeout(() => {
        this.setState({
          ResText: null,
          typeAlert: null,
        });
      }, 4000);
      return;
    } else {
      Request = `https://api.jikan.moe/v3/search/${
        PageMode ? "anime" : "manga"
      }?q=${this.replaceSpace(
        `${name}${name.length <= 1 ? "  " : name.length <= 2 ? " " : ""}`,
        "%20"
      )}&limit=16`;
    }

    axios
      .get(Request)
      .then((result) =>
        this.setState({
          findAnim: result.data.results,
          OpenSearchFilter: false,
          SearchFilter: {},
        })
      )
      .catch((err) => {
        console.error(err);
        this.cancelModal();
        this.setState({
          ResText: `Je n'ai pas réussi un anime ayant pour nom: ${name}. Veuillez réessayer avec un notre nom.`,
          typeAlert: "danger",
        });
        setTimeout(() => {
          this.setState({
            ResText: null,
            typeAlert: null,
          });
        }, 8000);
      });
  };

  getAllTheEpisode = (id) => {
    return new Promise(async (resolve, reject) => {
      let Episodes = [];
      let i = 1;

      const fetchOtherEP = async () => {
        axios
          .get(`https://api.jikan.moe/v3/anime/${id}/episodes/${i}`)
          .then(async (res) => {
            if (!res?.data?.episodes || res?.data?.episodes?.length <= 0)
              return resolve(Episodes);
            Episodes = [...Episodes, ...res.data.episodes];
            if (i === res?.data?.episodes_last_page) return resolve(Episodes);
            i++;
            setTimeout(fetchOtherEP, 500);
          })
          .catch(reject);
      };
      fetchOtherEP();
    });
  };

  SeeInDetails = async (id, toReturn = false, toReturnAndJustEP = false) => {
    try {
      const { PageMode } = this.state;
      if (toReturnAndJustEP === true) {
        if (this.state.type === "serie") return await this.getAllTheEpisode(id);
        else return await axios.get(`https://api.jikan.moe/v3/anime/${id}`);
      }
      if (toReturn === true) {
        return (
          await Promise.all([
            PageMode ? await this.getAllTheEpisode(id) : null,
            await axios.get(
              `https://api.jikan.moe/v3/${PageMode ? "anime" : "manga"}/${id}`
            ),
          ])
        ).map((dataAnime, i) =>
          i > 0 ? dataAnime.data : PageMode ? { episodes: dataAnime } : null
        );
      }
      this.setState({ ShowModalSearch: false });
      axios
        .get(`https://api.jikan.moe/v3/${PageMode ? "anime" : "manga"}/${id}`)
        .then((res) => {
          this.setState({
            animToDetails: [
              !this.state.animToDetails[0] ? null : this.state.animToDetails[0],
              res.data,
            ],
            findAnim: [],
          });
        })
        .catch(console.error);
      if (PageMode)
        this.getAllTheEpisode(id)
          .then((res) => {
            this.setState({
              animToDetails: [
                { episodes: res },
                !this.state.animToDetails[1]
                  ? null
                  : this.state.animToDetails[1],
              ],
              findAnim: [],
            });
          })
          .catch(console.error);
    } catch (err) {
      this.ShowMessageInfo(
        "Erreur dans le chargement de l'anime.",
        5000,
        "danger"
      );
      console.error(err);
    }
  };

  findPalmares = () => {
    const sizeof = require("object-sizeof");
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
    let AllegedTotalFinished = 0;
    const AllegedTotal = Object.values(CopyState.serieFirebase).reduce(
      (acc, currentVal) => {
        if (!currentVal.AnimEP && currentVal.finishedAnim) {
          AllegedTotalFinished++;
        }

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

    const SizeOfAll = [
      (sizeof(this.state.serieFirebase) / 1000).toFixed(2),
      (sizeof(this.state.filmFireBase) / 1000).toFixed(2),
      (sizeof(this.state.NextAnimFireBase) / 1000).toFixed(2),
      (
        sizeof({
          ...this.state.serieFirebase,
          ...this.state.filmFireBase,
          ...this.state.NextAnimFireBase,
        }) / 1000
      ).toFixed(2),
    ];

    return {
      SizeOfUserInDB: SizeOfAll,
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
        parseFloat("0." + (DurerTotal / 60).toString().split(".")[1]).toFixed(
          1
        ) *
          0.6 +
        parseInt((DurerTotal / 60).toString().split(".")[0])
      ).toString(),
      EnCours:
        Object.keys(CopyState.serieFirebase).length -
        FinishedTotalSerie +
        (Object.keys(CopyState.filmFireBase).length - FinishedTotalFilm),
      Finished: FinishedTotalSerie + FinishedTotalFilm,
      alleged: [
        AllegedTotal,
        AllegedTotalFinished,
        parseInt((AllegedTotalFinished / FinishedTotalSerie) * 100),
      ],
    };
  };

  token = (length) => {
    const rand = () => Math.random(0).toString(36).substr(2);
    let ToReturn = (rand() + rand() + rand() + rand()).substr(0, length);
    while (ToReturn.includes("-")) {
      ToReturn = (rand() + rand() + rand() + rand()).substr(0, length);
    }
    return ToReturn;
  };

  handleDeleteImageURLParameter = (URL, IfurlParamUpdateInDB = null) => {
    const UrlSplit = URL.split("?s=");

    if (UrlSplit.length > 1 && IfurlParamUpdateInDB !== null)
      this.updateValue(
        `${this.state.Pseudo}/${
          IfurlParamUpdateInDB.split("-")[0]
        }/${IfurlParamUpdateInDB}`,
        {
          imageUrl: UrlSplit[0],
        }
      );
    else if (UrlSplit.length > 1) return UrlSplit[0];

    return URL;
  };

  TransitionTabsChange = (First, Manga = false, DirectionManga = null) => {
    const elem = document.getElementById(
      Manga ? "ContentMangaList" : "ContentAnimeList"
    );
    const elemPos = parseInt(elem.style.left.split("vw")[0]);
    if (First) {
      elem.style.left = `${Manga ? (!DirectionManga ? "80" : "-80") : "80"}vw`;
      if (!Manga) elem.style.marginLeft = "80vw";
      requestAnimationFrame(() =>
        this.TransitionTabsChange(false, Manga, DirectionManga)
      );
    } else if (elemPos > 0) {
      elem.style.left = `${elemPos - 4}vw`;
      if (!Manga) elem.style.marginLeft = `${elemPos - 4}vw`;
      requestAnimationFrame(() =>
        this.TransitionTabsChange(false, Manga, DirectionManga)
      );
    } else if (elemPos < 0 && Manga && DirectionManga) {
      elem.style.left = `${elemPos + 4}vw`;
      requestAnimationFrame(() =>
        this.TransitionTabsChange(false, Manga, DirectionManga)
      );
    } else {
      elem.style.left = "0";
      elem.style.marginLeft = "0";
    }
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
    } catch (err) {
      this.ShowMessageInfo(
        "Une erreur est survenue lors du traitement de votre requête.",
        7500,
        "danger"
      );
      console.error(err);
    }
  };

  CopyText = (text, key = null) => {
    const { serieFirebase, filmFireBase } = this.state;
    navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
      if (result.state === "granted" || result.state === "prompt") {
        navigator.clipboard.writeText(text).then(
          () => {
            console.log("✅Clipboard successfully set✅");
            if (key !== null) {
              const ElemCopied = document.getElementById(
                `${{ ...serieFirebase, ...filmFireBase }[key].name
                  .split(" ")
                  .join("")}-${key
                  .split("-")[1]
                  .split("")
                  .reverse()
                  .join("")
                  .slice(0, 5)}`
              );
              let ElemBtnCopy = null;
              Array.from(ElemCopied.children).forEach((child) => {
                if (child.className === "copy") ElemBtnCopy = child;
              });
              ElemBtnCopy.style.color = "rgba(38, 255, 0, 0.8)";
              ElemBtnCopy.style.width = "75px";
              ElemBtnCopy.style.left = "calc(50% - 35px)";
              ElemBtnCopy.innerHTML = `<span class="fas fa-copy"></span> <b>Copié !</b>`;
              setTimeout(() => {
                ElemBtnCopy.innerHTML = `<span class="fas fa-copy"></span>`;
                ElemBtnCopy.style.color = "#fff";
                ElemBtnCopy.style.width = "32px";
                ElemBtnCopy.style.left = "calc(50% - 45px / 3)";
              }, 2000);
            }
          },
          () => {
            console.error("❌Clipboard write failed❌");
          }
        );
      }
    });
  };

  ShowMessageInfo = (text, time, type = "info") => {
    clearTimeout(this.setTimeOutMsgInfo);
    clearTimeout(this.setTimeOutMsgInfo2);

    this.setState({
      ShowMessage: true,
      ShowMessageHtml: true,
      ResTextMsg: text,
      typeAlertMsg: type,
    });
    this.setTimeOutMsgInfo = setTimeout(() => {
      this.setState({ ShowMessage: false });

      this.setTimeOutMsgInfo2 = setTimeout(() => {
        this.setState({
          ShowMessageHtml: false,
          ResTextMsg: null,
          typeAlertMsg: null,
        });
      }, 900);
    }, time);
  };

  WhitchSeason = () => {
    const Month = new Date().getMonth() + 1;
    const Day = new Date().getDate();
    let season = null;
    switch (true) {
      case Month === 12 && Day >= 21:
      case Month === 1:
      case Month === 2:
      case Month === 3 && Day < 20:
        season = "winter";
        break;
      case Month === 3 && Day >= 20:
      case Month === 4:
      case Month === 5:
      case Month === 6 && Day < 20:
        season = "spring";
        break;
      case Month === 6 && Day >= 20:
      case Month === 7:
      case Month === 8:
      case Month === 9 && Day < 22:
        season = "summer";
        break;
      case Month === 9 && Day >= 22:
      case Month === 10:
      case Month === 11:
      case Month === 12 && Day < 21:
        season = "fall";
        break;
      default:
        break;
    }
    return season;
  };

  cancelModal = () => {
    this.setState({
      ShowModalSearch: false,
      ShowModalAddAnime: false,
      ShowModalAddNM: false,
      ShowModalAddManga: false,
      ShowModalChooseImgURL: [false, null],
      ShowModalAddNotifLier: false,
      ShowModalImportFile: false,
      FileToImport: null,
      AnimateFasIcon: [false, false],
      AntiLostData: true,
      AddNotifWithAnim: false,
      SeasonAnimCheck: false,
      WaitAnimCheck: false,
      PalmaresModal: false,
      ShowModalVerification: false,
      OpenNextNewAnime: false,
      palmares: null,
      IdToAddEp: null,
      InfoAnimeToChangeNote: null,
      Rate: 7.5,
      typeManga: ["scan", false],
      VolumesPersonnalize: {},
      UrlUserImg: "",
      Volumes: [NaN, NaN],
      OpenSearchFilter: false,
      SearchFilter: {},
      ShowModalChangeNote: false,
      findAnim: [],
      SearchInAnimeList: [false, this.state.SearchInAnimeList[1]],
      NextAnimToDelete: null,
      NextMangaToDelete: null,
      addEPToAlleged: false,
      Scan: NaN,
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

    if (isNaN(minute)) {
      return hour * 60;
    }

    return hour * 60 + minute;
  };

  shuffleArray = (array) =>
    array.sort(() => {
      return Math.random() - 0.5;
    });

  render() {
    const {
      Pseudo,
      filmFireBase,
      serieFirebase,
      NextAnimFireBase,
      MangaFirebase,
      uid,
      proprio,
      PageMode,
      AuthenticateMethod,
      UserOnLogin,
      SeasonAnimeDetails,
      AllowUseReAuth,
      ShowModalChooseImgURL,
      RedirectPage,
      ShowModalSearch,
      addEPToAlleged,
      findAnim,
      animToDetails,
      ShowModalAddAnime,
      ShowModalAddNotifLier,
      title,
      ResText,
      DeletePathVerif,
      Scan,
      OpenSearchFilter,
      SearchFilter,
      OfflineMode,
      typeAlert,
      type,
      typeManga,
      ModeFilter,
      ModeFilterNA,
      HaveAlreadyBeenMix,
      NextReRenderOrderSerie,
      NextReRenderOrderNA,
      ShowModalAddNM,
      PalmaresModal,
      Rate,
      ShowModalVerification,
      Volumes,
      VolumesPersonnalize,
      typeAlertMsg,
      MicOn,
      ShowModalImportFile,
      ShowMessage,
      year,
      season,
      UrlUserImg,
      ShowMessageHtml,
      ShowModalAddManga,
      ResTextMsg,
      NotAskAgain,
      TagNA,
      TagSearchAnime,
      durer,
      AnimateFasIcon,
      SwipeActive,
      FirstQuerie,
      SwitchMyAnim,
      SeasonAnimCheck,
      ParamsOptn,
      NextAnim,
      NextManga,
      LoadingMode,
      CodeNumber,
      JustDefined,
      day,
      time,
      OpenNextNewAnime,
      ImportanceNA,
      AntiLostData,
      ImportanceSearch,
      InfoAnimeToChangeNote,
      nbEP,
      ModePreview,
      SearchInAnimeList,
      WaitAnimCheck,
      ShowModalChangeNote,
      SeasonPage,
      RefreshRenderAnime,
      RefreshRenderNA,
      RefreshRenderManga,
      MyAnimListSaved,
      MyNextAnimListSaved,
      MyMangaListSaved,
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
          ShowMessage={ShowMessage}
          typeAlertMsg={typeAlertMsg}
          ShowMessageHtml={ShowMessageHtml}
          ResText={ResTextMsg}
          Submit={async (PseudoArgs) => {
            this.setState({ Pseudo: PseudoArgs, JustDefined: true });
            window.localStorage.setItem("Pseudo", JSON.stringify(PseudoArgs));
          }}
        />
      );
    }

    if (!AuthenticateMethod && AllowUseReAuth) {
      this.reAuth();
    }

    if (!uid && OfflineMode === false) {
      return (
        <Login
          UserOnLogin={UserOnLogin}
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
          typeAlertMsg={typeAlertMsg}
          ShowMessageHtml={ShowMessageHtml}
          ResText={ResTextMsg}
          OfflineMode={this.OfflineMode}
          resetPseudo={() => {
            window.localStorage.removeItem("Pseudo");
            this.setState({ Pseudo: null });
          }}
        />
      );
    }

    if (uid !== proprio || !uid || !proprio) {
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
        type={key.split("-")[0]}
        Skeleton={false}
        Pseudo={Pseudo}
        NewEpMode={
          key.split("-")[0] === "serie"
            ? serieFirebase[key].NewEpMode
              ? serieFirebase[key].NewEpMode
              : false
            : false
        }
        Paused={
          { ...serieFirebase, ...filmFireBase }[key].Paused
            ? { ...serieFirebase, ...filmFireBase }[key].Paused
            : false
        }
        AddEpSeasonToAlleged={() => {
          if (key.split("-")[0] !== "serie") return;
          this.setState({
            addEPToAlleged: true,
            ShowModalAddAnime: true,
            OpenNextNewAnime: true,
            type: "serie",
            IdToAddEp: key,
            title: serieFirebase[key].name,
          });
        }}
        Objectif={
          key.split("-")[0] === "serie" && serieFirebase[key].Objectif
            ? [true, serieFirebase[key].Objectif]
            : [false]
        }
        ReTakeImgFromName={() => {
          this.TakeInfoFromName(
            this.replaceSpace(
              { ...serieFirebase, ...filmFireBase }[key].name,
              "%20"
            ),
            true,
            key
          );
        }}
        CheckNotUrlParams={(URL) =>
          this.handleDeleteImageURLParameter(URL, key)
        }
        Drop={
          { ...serieFirebase, ...filmFireBase }[key].Drop
            ? { ...serieFirebase, ...filmFireBase }[key].Drop
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
          this.updateValue(`${Pseudo}/${key.split("-")[0]}/${id}`, {
            Fav: FavVal,
          });
        }}
        NotAskAgain={
          { ...serieFirebase, ...filmFireBase }[key].NotAskAgain
            ? { ...serieFirebase, ...filmFireBase }[key].NotAskAgain
            : false
        }
        UnPaused={() => {
          this.updateValue(`${Pseudo}/${key.split("-")[0]}/${key}`, {
            Paused: null,
            InWait: null,
            Drop: null,
            Rate: null,
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
        InfoTooltip={
          key.split("-")[0] === "serie" ? (
            serieFirebase[key].Paused ||
            serieFirebase[key].Drop ||
            serieFirebase[key].InWait ? (
              <Fragment>
                <span
                  style={{
                    color: serieFirebase[key].Paused
                      ? "rgba(23, 163, 184, 0.746)"
                      : serieFirebase[key].Drop
                      ? "#fb401f"
                      : "#6c757d",
                  }}
                  className={`fas fa-${
                    serieFirebase[key].Paused
                      ? "pause"
                      : serieFirebase[key].Drop
                      ? "stop"
                      : "hourglass-half"
                  }`}
                ></span>{" "}
                {serieFirebase[key].Paused
                  ? "En Pause"
                  : serieFirebase[key].Drop
                  ? "Arrêté"
                  : "En attente"}
              </Fragment>
            ) : serieFirebase[key].finishedAnim &&
              !serieFirebase[key].AnimEP ? (
              [
                "✅ Fini et 💯 Allégé !",
                {
                  InfoBeginEnd: serieFirebase[key].Info
                    ? serieFirebase[key].Info
                    : null,
                },
              ]
            ) : serieFirebase[key].finishedAnim ? (
              [
                "✅ Fini !",
                {
                  InfoBeginEnd: serieFirebase[key].Info
                    ? serieFirebase[key].Info
                    : null,
                },
              ]
            ) : !serieFirebase[key].AnimEP ? (
              [
                "💯 Allégé.",
                {
                  InfoBeginEnd: serieFirebase[key].Info
                    ? serieFirebase[key].Info
                    : null,
                },
              ]
            ) : (
              {
                Progress: this.CalculateProgressionAnime(
                  serieFirebase[key].AnimEP
                ),
                WhereStop: this.CalculateWhereStop(serieFirebase[key].AnimEP),
                InfoBeginEnd: serieFirebase[key].Info
                  ? serieFirebase[key].Info
                  : null,
              }
            )
          ) : filmFireBase[key].finished ? (
            [
              "✅ Fini !",
              filmFireBase[key].Info ? filmFireBase[key].Info : null,
            ]
          ) : (
            <Fragment>
              <span
                style={{ color: "yellowgreen" }}
                className="fas fa-play"
              ></span>{" "}
              <b>{filmFireBase[key].durer}</b>min
            </Fragment>
          )
        }
        InWait={
          { ...serieFirebase, ...filmFireBase }[key]?.InWait
            ? { ...serieFirebase, ...filmFireBase }[key].InWait
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
        CopyTitle={() =>
          this.CopyText({ ...serieFirebase, ...filmFireBase }[key].name, key)
        }
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
        ModeImportant={
          !NextAnimFireBase[key].Importance
            ? 0
            : NextAnimFireBase[key].Importance
        }
        ModeFilterNA={ModeFilterNA}
        ModeFindAnime={[ModeFindAnime[0], ImportanceSearch]}
        setImportance={(LvlImportance) => {
          this.updateValue(`${Pseudo}/NextAnim/${key}`, {
            Importance: LvlImportance,
          });
        }}
        BadgesType={NextAnimFireBase[key].Badges}
        AddNewBadgeType={(NameBadge) => {
          this.updateValue(`${Pseudo}/NextAnim/${key}`, {
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
          this.updateValue(`${Pseudo}/NextAnim/${key}`, { Badges });
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
            ShowModalAddAnime: true,
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
    let VolumesMangaPreview = [];

    if (findAnim.length !== 0) {
      animList = findAnim.map((anim) => (
        <Poster
          key={anim.mal_id}
          url={anim.image_url}
          Skeleton={false}
          score={anim.score}
          title={anim.title}
          SeeInDetails={(id) => {
            this.SeeInDetails(id);
            this.ShowMessageInfo(
              "Chargement de la page... Veuillez patienté...",
              5000,
              "info"
            );
          }}
          type={anim.type}
          id={anim.mal_id}
          inMyAnim={false}
          MangaSearch={PageMode}
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
      PageMode === true &&
      typeof serieFirebase === "object" &&
      typeof filmFireBase === "object" &&
      (Object.keys(filmFireBase).length !== 0 ||
        Object.keys(serieFirebase).length !== 0) &&
      SwitchMyAnim &&
      !LoadingMode[0] &&
      RefreshRenderAnime
    ) {
      let AnimeKeySort = [];
      if (ModeFilter === "Rate") {
        // Sort Anime Rate
        let AnimeArrRateSort = [];

        const AnimeWithRate = Object.fromEntries(
          Object.entries({
            ...serieFirebase,
            ...filmFireBase,
          }).filter(([key, value]) => value.Rate !== undefined)
        );
        Object.keys(AnimeWithRate).forEach((AnimeKey) => {
          AnimeArrRateSort = [
            ...AnimeArrRateSort,
            { ...AnimeWithRate[AnimeKey], key: AnimeKey },
          ];
        });
        AnimeArrRateSort.sort(this.compareValues("Rate", "desc"));
        AnimeArrRateSort.forEach((ObjAnime) => {
          AnimeKeySort = [...AnimeKeySort, ObjAnime.key];
        });
      }

      // Render Components
      let MyAnimListTemplateKey = (
          ModeFilter === "Rate"
            ? AnimeKeySort
            : Object.keys({
                ...serieFirebase,
                ...filmFireBase,
              })
        ).map((key) => key),
        NewNextReRenderOrderSerie = null,
        NewValHaveAlreadyBeenMix = HaveAlreadyBeenMix[0];

      if (
        ModeFilter !== "Rate" &&
        !HaveAlreadyBeenMix[0] &&
        (!ParamsOptn || ParamsOptn.MyAnimRandom)
      ) {
        NewValHaveAlreadyBeenMix = true;
        MyAnimListTemplateKey = this.shuffleArray(MyAnimListTemplateKey);
      }

      let MyAnimListTemplate = null;

      if (
        ModeFilter !== "Rate" &&
        HaveAlreadyBeenMix[0] &&
        NextReRenderOrderSerie
      ) {
        if (MyAnimListTemplateKey.length < NextReRenderOrderSerie.length) {
          // Delete Anime
          const CopyNextReRenderOrderSerie = [...NextReRenderOrderSerie];
          let NumberOfDelete = 0;
          NextReRenderOrderSerie.forEach((Key, i) => {
            if (MyAnimListTemplateKey.indexOf(Key) === -1) {
              CopyNextReRenderOrderSerie.splice(i - NumberOfDelete, 1);
              NumberOfDelete += 1;
            }
          });
          NewNextReRenderOrderSerie = CopyNextReRenderOrderSerie;
        }

        if (MyAnimListTemplateKey.length > NextReRenderOrderSerie.length) {
          // New Anime
          const CopyNextReRenderOrderSerie = [...NextReRenderOrderSerie];
          MyAnimListTemplateKey.forEach((Key) => {
            if (NextReRenderOrderSerie.indexOf(Key) === -1)
              CopyNextReRenderOrderSerie.splice(
                Math.round(Math.random() * CopyNextReRenderOrderSerie.length),
                0,
                Key
              );
          });
          NewNextReRenderOrderSerie = CopyNextReRenderOrderSerie;
        }

        MyAnimListTemplate = (
          MyAnimListTemplateKey.length !== NextReRenderOrderSerie.length
            ? NewNextReRenderOrderSerie
            : NextReRenderOrderSerie
        ).flatMap((key) => {
          try {
            return TemplateGAnime(key);
          } catch (err) {
            return [];
          }
        });
      } else {
        MyAnimListTemplate = MyAnimListTemplateKey.map((key) =>
          TemplateGAnime(key)
        );
      }

      this.setState({
        RefreshRenderAnime: false,
        NextReRenderOrderSerie: !HaveAlreadyBeenMix[0]
          ? MyAnimListTemplateKey
          : HaveAlreadyBeenMix[0] &&
            NextReRenderOrderSerie &&
            NextReRenderOrderSerie.length !== MyAnimListTemplateKey.length
          ? NewNextReRenderOrderSerie
          : NextReRenderOrderSerie,
        HaveAlreadyBeenMix: [NewValHaveAlreadyBeenMix, HaveAlreadyBeenMix[1]],
        MyAnimListSaved: MyAnimListTemplate,
      });
    } else if (
      PageMode === true &&
      !SwitchMyAnim &&
      NextAnimFireBase !== undefined &&
      Object.keys(NextAnimFireBase).length !== 0 &&
      !LoadingMode[1] &&
      RefreshRenderNA
    ) {
      let MyNextAnimListTemplateKey = Object.keys(NextAnimFireBase).map(
          (key) => key
        ),
        NewNextReRenderOrderNA = null,
        NewValHaveAlreadyBeenMix = HaveAlreadyBeenMix[1];

      if (!HaveAlreadyBeenMix[1] && (!ParamsOptn || ParamsOptn.MyAnimRandom)) {
        NewValHaveAlreadyBeenMix = true;
        MyNextAnimListTemplateKey = this.shuffleArray(
          MyNextAnimListTemplateKey
        );
      }

      let MyNextAnimListTemplate = null;

      if (HaveAlreadyBeenMix[1] && NextReRenderOrderNA) {
        if (MyNextAnimListTemplateKey.length < NextReRenderOrderNA.length) {
          // Delete NA
          const CopyNextReRenderOrderNA = [...NextReRenderOrderNA];
          let NumberOfDelete = 0;
          NextReRenderOrderNA.forEach((Key, i) => {
            if (MyNextAnimListTemplateKey.indexOf(Key) === -1) {
              CopyNextReRenderOrderNA.splice(i - NumberOfDelete, 1);
              NumberOfDelete += 1;
            }
          });

          NewNextReRenderOrderNA = CopyNextReRenderOrderNA;
        }

        if (MyNextAnimListTemplateKey.length > NextReRenderOrderNA.length) {
          // New NA
          const CopyNextReRenderOrderNA = [...NextReRenderOrderNA];
          MyNextAnimListTemplateKey.forEach((Key) => {
            if (NextReRenderOrderNA.indexOf(Key) === -1)
              CopyNextReRenderOrderNA.splice(
                Math.round(Math.random() * CopyNextReRenderOrderNA.length),
                0,
                Key
              );
          });
          NewNextReRenderOrderNA = CopyNextReRenderOrderNA;
        }

        MyNextAnimListTemplate = (
          MyNextAnimListTemplateKey.length !== NextReRenderOrderNA.length
            ? NewNextReRenderOrderNA
            : NextReRenderOrderNA
        ).map((key) => TemplateGNextAnim(key));
      } else {
        MyNextAnimListTemplate = MyNextAnimListTemplateKey.map((key) =>
          TemplateGNextAnim(key)
        );
      }

      this.setState({
        RefreshRenderNA: false,
        NextReRenderOrderNA: !HaveAlreadyBeenMix[1]
          ? MyNextAnimListTemplateKey
          : HaveAlreadyBeenMix[1] &&
            NextReRenderOrderNA.length !== MyNextAnimListTemplateKey.length
          ? NewNextReRenderOrderNA
          : NextReRenderOrderNA,
        HaveAlreadyBeenMix: [HaveAlreadyBeenMix[0], NewValHaveAlreadyBeenMix],
        MyNextAnimListSaved: MyNextAnimListTemplate,
      });
    } else if (
      PageMode === true &&
      typeof filmFireBase === "object" &&
      typeof serieFirebase === "object" &&
      typeof NextAnimFireBase === "object" &&
      ((Object.keys(filmFireBase)?.length === 0 && MyAnimListSaved === null) ||
        (Object.keys(serieFirebase)?.length === 0 &&
          MyAnimListSaved === null) ||
        (Object.keys(NextAnimFireBase)?.length === 0 &&
          MyNextAnimListSaved === null)) &&
      Pseudo &&
      !FirstQuerie
    ) {
      // Loading Anime from IndexedDB
      this.fnDbOffline("GET");
      this.refreshValueFirebase(null, null, true);
    }

    if (
      PageMode === false &&
      MangaFirebase.length !== 0 &&
      RefreshRenderManga
    ) {
      this.setState({
        RefreshRenderManga: false,
        MyMangaListSaved: [
          MangaFirebase[0]
            ? Object.keys(MangaFirebase[0])
                .reverse()
                .map((key) => (
                  <Poster
                    key={key}
                    id={key}
                    Pseudo={Pseudo}
                    ModeFilter={ModeFilter}
                    ReTakeImgFromName={() => {
                      console.error("Manga Img Error");
                    }}
                    isFinishedManga={MangaFirebase[0][key].finished}
                    inMyManga={true}
                    title={MangaFirebase[0][key].name}
                    url={MangaFirebase[0][key].imageUrl}
                    CopyTitle={() => this.CopyText(MangaFirebase[0][key].name)}
                  />
                ))
            : "Vous n'avez aucun Manga En Cours",
          MangaFirebase[1]
            ? Object.keys(MangaFirebase[1]).map((key) => (
                <div
                  key={key}
                  className="PosterNextManga"
                  onClick={(event) => {
                    if (event.target.classList[1] === "fa-trash-alt") return;
                    this.setState({
                      title: MangaFirebase[1][key].name,
                      NextMangaToDelete: key,
                      ShowModalAddManga: true,
                    });
                  }}
                >
                  <span className="fas fa-long-arrow-alt-left"></span>{" "}
                  {MangaFirebase[1][key].name}{" "}
                  <span
                    onClick={() => this.deleteValue(`${Pseudo}/manga/1/${key}`)}
                    className="fas fa-trash-alt"
                  ></span>
                </div>
              ))
            : "Vous n'avez aucun Manga à Regarder Prochainement",
        ],
      });
    }

    if (
      ShowModalAddManga &&
      typeManga[1] &&
      typeManga[0] === "volume" &&
      !isNaN(Volumes[0]) &&
      !isNaN(Volumes[1]) &&
      Volumes[0] <= 1000
    ) {
      for (let i = 0; i < Volumes[0]; i++) {
        VolumesMangaPreview = [
          ...VolumesMangaPreview,
          <div className="VolumesMangaPreview">
            <span>
              Volume <span id="NumberVolumesMangaPreview">{i + 1}</span>
            </span>{" "}
            :{" "}
            {VolumesPersonnalize[`Volume${i}`]?.Scan
              ? `${VolumesPersonnalize[`Volume${i}`].Scan} scans`
              : `${Volumes[1]} scans`}{" "}
            <Button
              onClick={() => {
                const VolumesPersonnalize = {
                  ...this.state.VolumesPersonnalize,
                };
                VolumesPersonnalize[`Volume${i}`] = {
                  Scan: VolumesPersonnalize[`Volume${i}`]?.Scan
                    ? VolumesPersonnalize[`Volume${i}`].Scan + 1
                    : Volumes[1] + 1,
                };
                if (VolumesPersonnalize[`Volume${i}`].Scan === Volumes[1])
                  delete VolumesPersonnalize[`Volume${i}`];
                this.setState({ VolumesPersonnalize });
              }}
            >
              +
            </Button>
            <Button
              onClick={() => {
                const VolumesPersonnalize = {
                  ...this.state.VolumesPersonnalize,
                };
                VolumesPersonnalize[`Volume${i}`] = {
                  Scan: VolumesPersonnalize[`Volume${i}`]?.Scan
                    ? VolumesPersonnalize[`Volume${i}`].Scan - 1
                    : Volumes[1] - 1,
                };
                if (VolumesPersonnalize[`Volume${i}`].Scan === Volumes[1])
                  delete VolumesPersonnalize[`Volume${i}`];
                this.setState({ VolumesPersonnalize });
              }}
            >
              -
            </Button>
          </div>,
        ];
      }
    }

    if (animToDetails !== null && animToDetails.length >= 2) {
      // Other Page In Home
      return (
        <OneAnim
          details={animToDetails}
          back={() => this.setState({ animToDetails: [] })}
          ShowMessage={ShowMessage}
          ShowMessageHtml={ShowMessageHtml}
          ResText={ResText}
          Manga={PageMode ? false : true}
          UserCountry={
            ParamsOptn?.Country !== undefined ? ParamsOptn.Country : null
          }
          handleAdd={(typePage) => {
            // Manga
            if (typePage === "NA" && !PageMode) {
              this.setState(
                {
                  NextManga: animToDetails[1].title,
                  animToDetails: [],
                  SeasonPage: false,
                  SwipeActive: false,
                },
                this.addNextManga
              );
              return;
            }
            if (!PageMode) {
              this.setState({
                title: animToDetails[1].title,
                Scan: !animToDetails[1].chapters
                  ? 1
                  : animToDetails[0].chapters.length.toString(),
                imageUrl: this.handleDeleteImageURLParameter(
                  animToDetails[1].image_url
                ),
                ShowModalAddManga: true,
                animToDetails: [],
                SeasonPage: false,
              });
              return;
            }
            // Anime
            if (typePage === "NA" && PageMode) {
              this.setState({
                SwitchMyAnim: false,
                SeasonPage: false,
                NextAnim: animToDetails[1].title,
                TagNA: animToDetails[1].genres
                  .map((genre) => genre.name)
                  .join(","),
                animToDetails: [],
              });
              return;
            }
            this.setState({
              title: animToDetails[1].title,
              SeasonPage: false,
              type: animToDetails[1].type === "Movie" ? "film" : "serie",
              durer:
                animToDetails[1].type === "Movie"
                  ? this.durerStrToIntMin(animToDetails[1].duration)
                  : 110,
              nbEP:
                animToDetails[1].type === "Movie"
                  ? ""
                  : animToDetails[0].episodes.length.toString(),
              imageUrl: this.handleDeleteImageURLParameter(
                animToDetails[1].image_url
              ),
              EpisodeName:
                animToDetails[1].type === "Movie"
                  ? null
                  : animToDetails[0].episodes.length !== 0
                  ? animToDetails[0].episodes.map((epi) => {
                      return {
                        title: epi.title,
                        filler: !epi.filler ? null : true,
                        recap: !epi.recap ? null : true,
                      };
                    })
                  : "none",
              DurationPerEp:
                animToDetails[1].type === "Movie"
                  ? null
                  : !animToDetails[1].duration
                  ? "none"
                  : animToDetails[1].duration,
              OpenNextNewAnime: true,
              ShowModalAddAnime: true,
              animToDetails: [],
            });
          }}
        />
      );
    } else if (SeasonPage === true) {
      let SeasonAnimeRender = "Aucun Anime";
      let YearRender = [];
      for (let i = 0; i < new Date().getFullYear() + 13 - 2000; i++) {
        YearRender = [
          <option key={i} value={1990 + i}>
            {1990 + i}
          </option>,
          ...YearRender,
        ];
      }
      if (SeasonAnimeDetails !== null && SeasonAnimeDetails.length !== 0) {
        SeasonAnimeRender = SeasonAnimeDetails.map((SeasonAnime) => (
          <Poster
            key={SeasonAnime.mal_id}
            url={SeasonAnime.image_url}
            Skeleton={false}
            score={SeasonAnime.score}
            title={SeasonAnime.title}
            SeeInDetails={(id) => {
              this.SeeInDetails(id);
              this.ShowMessageInfo(
                "Chargement de la page... Veuillez patienté...",
                5000,
                "info"
              );
            }}
            type={SeasonAnime.type}
            id={SeasonAnime.mal_id}
            inMyAnim={false}
          />
        ));
      }
      return (
        <section id="SeasonAnime">
          <aside>
            <Form
              onSubmit={(event) => {
                event.preventDefault();
                this.GETSeasonAnime();
              }}
            >
              <Button
                variant="primary"
                onClick={() => {
                  this.setState({
                    SeasonPage: false,
                    SeasonAnimeDetails: null,
                  });
                }}
                className="btnBackDesing special"
              >
                <span className="fas fa-arrow-left"></span>
              </Button>
              <Form.Group>
                <label htmlFor="YearForm">Années:</label>
                <Form.Control
                  id="YearForm"
                  as="select"
                  custom
                  value={year}
                  onChange={(event) =>
                    this.setState({ year: event.target.value })
                  }
                  placeholder="Années de la Saison"
                >
                  {YearRender}
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <label htmlFor="YearForm">Saison:</label>
                <Form.Control
                  id="YearForm"
                  as="select"
                  custom
                  value={season}
                  onChange={(event) =>
                    this.setState({ season: event.target.value })
                  }
                  placeholder="Saison"
                >
                  <option value="summer">Été</option>
                  <option value="spring">Printemps</option>
                  <option value="fall">Automne</option>
                  <option value="winter">Hiver</option>
                </Form.Control>
              </Form.Group>
              <Button variant="success" type="submit">
                <span
                  className={`fas ${
                    AnimateFasIcon[0] && AnimateFasIcon[1]
                      ? "fa-times"
                      : `fa-sync${AnimateFasIcon[0] ? " fa-spin" : ""}`
                  }`}
                ></span>
              </Button>
            </Form>
          </aside>
          <aside id="resultsSeasonAnime">{SeasonAnimeRender}</aside>
        </section>
      );
    } else if (ModePreview === true) {
      return (
        <section id="Preview">
          <Button
            onClick={() => this.setState({ ModePreview: false })}
            variant="primary"
            className="btnBackDesing"
          >
            <span className="fas fa-arrow-left"></span> Retour
          </Button>
          <img src={UrlUserImg} alt="Ton poster" />
        </section>
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
            <NextAnimCO key={i} Skeleton={[true, i]} />,
          ];
        }
      }

      return (
        <Fragment>
          <ContextForMyAnim.Provider
            value={{
              openModalNew: () =>
                this.setState({
                  ShowModalAddAnime: PageMode ? true : false,
                  ShowModalAddManga: PageMode ? false : true,
                }),
              Pseudo,
              search: this.SearchAnim,
              logOut: this.logOut,
              OpenSearchFilter: () => {
                this.setState({ OpenSearchFilter: !OpenSearchFilter });
              },
              OpenSeasonPage: () => {
                this.setState(
                  {
                    SeasonPage: true,
                    season: this.WhitchSeason(),
                  },
                  this.GETSeasonAnime
                );
              },
              LoadingMode: LoadingMode[0],
              ChangePage: () => {
                PageMode
                  ? (document.title = "MCK:Manga-Checker")
                  : (document.title = "ACK:Anim-Checker");
                this.setState({
                  PageMode: !PageMode,
                  RefreshRenderAnime: true,
                  RefreshRenderManga: true,
                  ModeFilter: "NotFinished",
                });
                window.localStorage.setItem(
                  "PageMode",
                  JSON.stringify(!PageMode)
                );
              },
              PageMode: PageMode,
              RdaAnime: () => {
                try {
                  const KeyRda = Object.keys(
                    PageMode ? NextAnimFireBase : MangaFirebase[1]
                  )[
                    Math.round(
                      Math.random() *
                        (Object.keys(
                          PageMode ? NextAnimFireBase : MangaFirebase[1]
                        ).length -
                          1)
                    )
                  ];
                  if (!KeyRda) return;
                  this.setState({
                    ShowModalAddAnime: true,
                    title: (PageMode ? NextAnimFireBase : MangaFirebase[1])[
                      KeyRda
                    ].name,
                    NextAnimToDelete: KeyRda,
                  });
                } catch (err) {
                  console.warn("Error: No Next Manga");
                }
              },
              addToHome: this.AddToHome,
              openPalmares: () =>
                this.setState({
                  PalmaresModal: true,
                  palmares: this.findPalmares(),
                }),
              ExportDB: async () => {
                const db = await openDB("AckDb", 1);
                const Store = db
                  .transaction("NotifFirebase")
                  .objectStore("NotifFirebase");
                const results = await Store.getAll();

                const JsonExport = {
                  serie: serieFirebase,
                  film: filmFireBase,
                  NextAnim: NextAnimFireBase,
                  manga: MangaFirebase,
                  Notif: results[0].data,
                  ParamsOptn,
                };
                const filename = `ACKSnapshot-${Date.now()}.json`;
                const jsonStr = JSON.stringify(JsonExport);

                let element = document.createElement("a");
                element.setAttribute(
                  "href",
                  "data:text/plain;charset=utf-8," + encodeURIComponent(jsonStr)
                );
                element.setAttribute("download", filename);

                element.style.display = "none";
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
              },
              ImportDB: () => this.setState({ ShowModalImportFile: true }),
            }}
          >
            {PageMode === false ? (
              <MyManga
                MyMangaList={
                  MyMangaListSaved || [
                    <Spinner animation="border" variant="warning" />,
                    <Spinner animation="border" variant="warning" />,
                  ]
                }
                ResText={ResText}
                typeAlert={typeAlert}
                ModeFilter={ModeFilter}
                NewFilter={(filter) => {
                  this.setState({
                    ModeFilter: filter,
                    SwitchMyAnim: true,
                    RefreshRenderManga: true,
                  });
                }}
                openModalAddNextManga={() =>
                  this.setState({ ShowModalAddNM: true })
                }
                SwipeActive={SwipeActive}
                ChangeSwipe={(NewActive) => {
                  this.setState({ SwipeActive: NewActive });
                  this.TransitionTabsChange(true, true, NewActive);
                }}
                IsShortcut={
                  ParamsOptn?.Shortcut !== undefined
                    ? ParamsOptn.Shortcut
                    : true
                }
              />
            ) : (
              <MyAnim
                SwitchMyAnimVar={SwitchMyAnim}
                SwitchMyNextAnim={() => {
                  this.setState({ SwitchMyAnim: false });
                  requestAnimationFrame(() => this.TransitionTabsChange(true));
                }}
                SwitchMyAnim={() => {
                  this.setState({ SwitchMyAnim: true });
                  requestAnimationFrame(() => this.TransitionTabsChange(true));
                }}
                NextAnimChange={(event) =>
                  this.setState({ NextAnim: event.target.value })
                }
                NextAnim={NextAnim}
                OpenSearchFilter={OpenSearchFilter}
                SearchFilter={SearchFilter}
                FnSearchFilter={[
                  (add, value) => {
                    const CopySearchFilter = {
                      ...SearchFilter,
                    };
                    CopySearchFilter[add] = value;
                    this.setState({ SearchFilter: CopySearchFilter });
                  },
                  (rem) => {
                    const CopySearchFilter = {
                      ...SearchFilter,
                    };
                    delete CopySearchFilter[rem];
                    this.setState({ SearchFilter: CopySearchFilter });
                  },
                ]}
                fnNextAnimForm={[
                  (LvlImportance) => {
                    this.setState({ ImportanceNA: LvlImportance });
                  },
                  (event) => this.setState({ TagNA: event.target.value }),
                ]}
                Tag={TagNA}
                ModeImportant={ImportanceNA}
                LoadingMode={LoadingMode[0]}
                ResText={ResText}
                typeAlert={typeAlert}
                ModeFindAnime={ModeFindAnime[0]}
                ModeFilter={ModeFilter}
                NewFilter={(filter) => {
                  this.setState({
                    ModeFilter: filter,
                    SwitchMyAnim: true,
                    RefreshRenderAnime: true,
                  });
                }}
                ModeFilterNA={ModeFilterNA}
                NewModeFilterNA={(nfilter) => {
                  this.setState({
                    ModeFilterNA: nfilter,
                    SwitchMyAnim: false,
                    RefreshRenderNA: true,
                  });
                }}
                MyAnimList={
                  ModeFindAnime[0] && SearchInAnimeList[1]
                    ? ModeFindAnime[1].map((key) => TemplateGAnime(key))
                    : LoadingMode[0]
                    ? SkeletonListAnime
                    : MyAnimListSaved ||
                      "Vous avez aucun anime :/\nRajoutez-en !"
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
                    ToReSearchAfterRefresh: false,
                    RefreshRenderNA: !SwitchMyAnim ? true : RefreshRenderNA,
                  })
                }
                handleSubmit={this.addNextAnim}
                SearchInAnimeListFn={(type) =>
                  this.setState({
                    SearchInAnimeList: [true, type],
                    ModeCombinaisonSearch: "ET",
                    titleSearchAnime: "",
                    ImportanceSearch: null,
                    TagSearchAnime: "",
                    ToReSearchAfterRefresh: false,
                  })
                }
                onClose={() =>
                  this.setState({
                    ResText: null,
                    typeAlert: null,
                  })
                }
                IsShortcut={
                  ParamsOptn?.Shortcut !== undefined
                    ? ParamsOptn.Shortcut
                    : true
                }
              />
            )}
          </ContextForMyAnim.Provider>

          {/* MODALS */}
          <Modal show={ShowModalSearch} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Animé(s) trouvé(s)</Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">{animList}</Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                <span className="fas fa-window-close"></span> Annuler
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={ShowModalChooseImgURL[0]} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Choisie l'image de l'anime</Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              <Form>
                <Form.Text>
                  Si tu est tombé ici ça veut dire que je n'ai pas réussi à
                  trouvé l'image correspondant à ton anime. <br />
                  Je te laisse alors la possibilité de mettre ta propre{" "}
                  <b>URL</b> menant à l'image/poster de l'anime. Vous pourrez
                  revenir ici ultérieurement.
                </Form.Text>
                <Form.Group controlId="GiveURL">
                  <Form.Label>
                    URL de l'image/poster de l'anime (facultatif)
                  </Form.Label>
                  <Form.Control
                    type="url"
                    placeholder="http(s)://exemple.com"
                    autoComplete="off"
                    required
                    value={UrlUserImg}
                    onChange={(event) =>
                      this.setState({
                        UrlUserImg: event.target.value,
                      })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="NotAsk">
                  <Form.Check
                    type="checkbox"
                    disabled={UrlUserImg !== ""}
                    checked={NotAskAgain}
                    label={`Ne plus demander: ${
                      NotAskAgain === true && UrlUserImg === "" ? "Oui" : "Non"
                    }`}
                    onChange={(event) =>
                      this.setState({ NotAskAgain: event.target.checked })
                    }
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                <span className="fas fa-window-close"></span> Annuler
              </Button>
              <Button
                disabled={UrlUserImg === ""}
                onClick={() => {
                  try {
                    new URL(UrlUserImg);
                  } catch (err) {
                    console.error(err);
                    this.ShowMessageInfo(
                      "Veuillez donner un URL valide: https://www.exemple.com",
                      7000,
                      "danger"
                    );
                    return;
                  }
                  this.setState({ ModePreview: true });
                }}
                variant="info"
              >
                <span className="fas fa-eye"></span> Prévisualiser
              </Button>
              {NotAskAgain && UrlUserImg === "" ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    this.updateValue(
                      `${Pseudo}/${ShowModalChooseImgURL[1].split("-")[0]}/${
                        ShowModalChooseImgURL[1]
                      }`,
                      {
                        NotAskAgain: true,
                      }
                    );
                    this.cancelModal();
                  }}
                >
                  <span className="fas fa-check"></span> Validez
                </Button>
              ) : null}
              {UrlUserImg !== "" ? (
                <Button
                  variant="success"
                  onClick={() => {
                    try {
                      new URL(UrlUserImg);
                    } catch (err) {
                      console.error(err);
                      this.ShowMessageInfo(
                        "Veuillez donner un URL valide: http://exemple.com OU https://exemple.com",
                        7000,
                        "danger"
                      );
                      return;
                    }
                    this.updateValue(
                      `${Pseudo}/${ShowModalChooseImgURL[1].split("-")[0]}/${
                        ShowModalChooseImgURL[1]
                      }`,
                      {
                        imageUrl: UrlUserImg,
                      }
                    );
                    this.cancelModal();
                  }}
                >
                  <span className="fas fa-plus"></span> Mettre cette URL
                </Button>
              ) : null}
            </Modal.Footer>
          </Modal>

          <Modal show={ShowModalImportFile} size="lg" onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Choisir un fichier</Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              <h2>Règles :</h2>
              <Form>
                <Form.Text
                  style={{
                    color: "#f00",
                    fontSize: "14px",
                    textAlign: "justify",
                  }}
                >
                  <span className="fas fa-exclamation-triangle"></span>
                  <b style={{ textDecoration: "underline" }}>
                    - Quand le fichier sera importé toute votre liste sera
                    supprimer puis remplacer par le contenu du fichier.
                  </b>
                  <br />
                  -Ce fichier doit <b>OBLIGATOIREMENT</b> être un fichier
                  exporter de ACK.
                  <br />
                  -Les fichiers ne venant pas de ACK ne marcherons pas et
                  pourrons détruire toute vos donnéees...
                  <br />
                  -Pour finir attention à Internet, ne faites pas confiance à
                  n'importe qui. Si le fichier s'avère détruire votre magnifique
                  liste d'anime malgré les <b>multiples</b> protections,{" "}
                  <b style={{ textDecoration: "underline" }}>
                    le site ACK ne sera en aucun cas responsable.
                  </b>
                  <span className="fas fa-exclamation-triangle"></span>
                </Form.Text>
                <Form.Text>
                  PS: La dernière phrase du diclaimer s'applique uniquement si
                  vous décidez d'importer un fichier d'autres personnes
                  (téléchargé sur internet ou autre...). Si c'est votre fichier
                  que vous avez exporter depuis votre compte il n'y a aucun
                  problème que votre liste soit détruite{" "}
                  <span role="img" aria-label="Emoji Ok">
                    👌
                  </span>{" "}
                  .
                </Form.Text>
                <br />

                <Form.Group controlId="FetchFile">
                  <Form.Label>Votre fichier :</Form.Label>{" "}
                  <input
                    type="file"
                    id="attachment"
                    accept=".json"
                    onChange={(event) =>
                      this.setState({ FileToImport: event.target.files[0] })
                    }
                  />
                </Form.Group>
                <Form.Group controlId="AntiLostData">
                  <Form.Check
                    type="checkbox"
                    checked={AntiLostData}
                    label={`Anti perte de données: ${
                      AntiLostData === true ? "✅ Oui" : "⚠ Non"
                    }`}
                    onChange={(event) =>
                      this.setState({ AntiLostData: event.target.checked })
                    }
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                <span className="fas fa-window-close"></span> Annuler
              </Button>
              <Button
                variant={AntiLostData ? "primary" : "danger"}
                onClick={this.ImportFile}
              >
                <span className="fas fa-file-download"></span>{" "}
                {AntiLostData ? "Importer" : "⚠Importer (Risqué)⚠"}
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
                <span className="fas fa-window-close"></span> Annuler
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
                      }
                    );

                  this.cancelModal();
                }}
              >
                <span className="fas fa-check"></span> Validez
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={ShowModalAddNotifLier} onHide={this.addAnime}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Ajouter une notif à {title}</Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              <Form id="AddNotif">
                <Form.Text>
                  Fermer cette pop-up si vous ne voulez pas de notif lié à{" "}
                  {title}
                </Form.Text>
                <Form.Group controlId="calendar">
                  <Form.Label>Jour de la notif</Form.Label>
                  <Form.Control
                    as="select"
                    custom
                    value={day}
                    onChange={(event) =>
                      this.setState({ day: event.target.value })
                    }
                    placeholder="Le jour de la notif hebdo"
                  >
                    <option value="1">Lundi</option>
                    <option value="2">Mardi</option>
                    <option value="3">Mercredi</option>
                    <option value="4">Jeudi</option>
                    <option value="5">Vendredi</option>
                    <option value="6">Samedi</option>
                    <option value="0">Dimanche</option>
                  </Form.Control>
                </Form.Group>
                <Form.Group controlId="hour">
                  <Form.Label>Heure de la notif</Form.Label>
                  <TimePicker
                    step={5}
                    format={24}
                    value={time}
                    onChange={(time) => this.setState({ time })}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.addAnime}>
                <span className="fas fa-window-close"></span> Annuler
              </Button>
              <Button
                variant="success"
                onClick={() =>
                  this.setState({ AddNotifWithAnim: true }, this.addAnime)
                }
              >
                <span className="fas fa-plus"></span> Créer la notif
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
                    : serieFirebase[DeletePathVerif.split("/")[2]] !== undefined
                    ? serieFirebase[DeletePathVerif.split("/")[2]].name
                    : null
                  : null}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body id="ModalBody">
              En faisant ça cette anime sera entièrement supprimer avec aucune
              possiblité de le récupérer, en gros il n'existera plus.
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                <span className="fas fa-window-close"></span> Annuler
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  const IDPath =
                      DeletePathVerif.split("/")[
                        DeletePathVerif.split("/").length - 1
                      ],
                    AnimeObj = { ...serieFirebase, ...filmFireBase }[IDPath];

                  if (AnimeObj.Lier) {
                    this.deleteValue(`${Pseudo}/Notif/${AnimeObj.Lier}`);
                  }

                  this.deleteValue(DeletePathVerif);
                }}
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
                    <span className="palma">Taille pris:</span> Tous:{" "}
                    {palmares.SizeOfUserInDB[3]}KB (Anime:{" "}
                    {palmares.SizeOfUserInDB[0]}KB\Film:{" "}
                    {palmares.SizeOfUserInDB[1]}KB\NextAnime:{" "}
                    {palmares.SizeOfUserInDB[2]}KB)
                  </li>
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
                    <span className="palma">
                      Nombre Total de tes prochains animes:
                    </span>{" "}
                    {palmares.nbNextAnime}
                  </li>
                  <li>
                    <span className="palma">
                      Nombre Total d'anime (Serie + Film) au total:
                    </span>{" "}
                    {palmares.nbFilm[0] + palmares.nbSeries[0]}
                  </li>
                  <li>
                    <span className="palma">Nombre d'Animes Notée:</span>{" "}
                    {palmares.RatedTotal[0]}, tu as donc notée{" "}
                    {palmares.RatedTotal[1]} de tous tes animes finis
                  </li>
                  <li>
                    <span className="palma">Nombres Anime Allégé:</span>{" "}
                    {palmares.alleged[0]} dont {palmares.alleged[1]} qui sont
                    finis ={">"}{" "}
                    {palmares.alleged[2] <= 25
                      ? `Il y a que ${palmares.alleged[2]}% de tes animes qui sont fini et allégé, c'est pas sympa pour la planète (en allegant tu libère de la place sur le serveur faisant consommer moins d'énergie: 1 serie sur le serveur pendant 1H = 1 amploue allumée 24H) vise les 50%!`
                      : palmares.alleged[2] <= 50 && palmares.alleged[2] > 25
                      ? `Il y a ${palmares.alleged[2]}% de tes animes qui sont fini et allégé, ils faut encore plus les allégé pour économisé plus de place sur le serveur ce qui le fera moins consommer d'énergie (1 serie sur le serveur pendant 1H = 1 amploue allumée 24H)`
                      : palmares.alleged[2] <= 75 && palmares.alleged[2] > 50
                      ? `Il y a ${palmares.alleged[2]}% de tes animes qui sont fini et allégé, c'est bien malgré que tu pourrais encore plus en allégé (1 serie sur le serveur pendant 1H = 1 amploue allumée 24H)`
                      : palmares.alleged[2] < 100 && palmares.alleged[2] > 75
                      ? `Il y a ${palmares.alleged[2]}% de tes animes qui sont fini et allégé, c'est très bien malgré que tu pourrais encore plus en allégé (1 serie sur le serveur pendant 1H = 1 amploue allumée 24H)`
                      : `Il y a ${palmares.alleged[2]}% de tes animes qui sont fini et allégé, Merci enormémant pour les avoir tous allégé continue comme ça ! (1 serie sur le serveur pendant 1H = 1 amploue allumée 24H)`}
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
                <span className="fas fa-window-close"></span> Annuler
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
                  event.preventDefault();
                  this.setState(
                    {
                      ToReSearchAfterRefresh: true,
                    },
                    this.SearchAnimInList
                  );
                }
              }}
            >
              <Form
                onSubmit={(event) => {
                  event.preventDefault();
                  this.setState(
                    {
                      ToReSearchAfterRefresh: true,
                    },
                    this.SearchAnimInList
                  );
                }}
              >
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
                    required={SearchInAnimeList[1]}
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
                        Combinée en <b>OU</b> ou en <b>ET</b> (Par défault: en{" "}
                        <b>ET</b>)
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
                <span className="fas fa-window-close"></span> Annuler
              </Button>
              <Button
                variant="info"
                onClick={(event) => {
                  event.preventDefault();
                  this.setState(
                    {
                      ToReSearchAfterRefresh: true,
                    },
                    this.SearchAnimInList
                  );
                }}
              >
                <span className="fas fa-search"></span> Chercher
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={ShowModalAddAnime} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>
                {!OpenNextNewAnime ? (
                  title.trim().length !== 0 ? (
                    `Le type d'anime de ${title}`
                  ) : (
                    "Type d'anime"
                  )
                ) : type === "serie" ? (
                  <Fragment>
                    <Button
                      variant="primary"
                      onClick={() => this.setState({ OpenNextNewAnime: false })}
                      className="btnBackDesing only"
                    >
                      <span className="fas fa-arrow-left"></span>
                    </Button>
                    Ajouter une série
                  </Fragment>
                ) : type === "film" ? (
                  <Fragment>
                    <Button
                      variant="primary"
                      onClick={() => this.setState({ OpenNextNewAnime: false })}
                      className="btnBackDesing only"
                    >
                      <span className="fas fa-arrow-left"></span>
                    </Button>
                    Ajouter un Film
                  </Fragment>
                ) : (
                  this.setState({ OpenNextNewAnime: false, type: "serie" })
                )}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body
              id="ModalBody"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  if (!OpenNextNewAnime)
                    return this.setState({ OpenNextNewAnime: true });
                  // Serie
                  if (type === "serie") {
                    if (addEPToAlleged) return this.AddEPToAlleged();
                    if (SeasonAnimCheck)
                      return this.setState({ ShowModalAddNotifLier: true });

                    return this.addAnime();
                  }
                  // Film
                  if (type === "film") return this.addAnime();
                  // No Type
                  this.setState({ OpenNextNewAnime: false, type: "serie" });
                }
              }}
            >
              <Form
                onSubmit={() => {
                  if (!OpenNextNewAnime)
                    return this.setState({ OpenNextNewAnime: true });
                  // Serie
                  if (type === "serie") {
                    if (addEPToAlleged) return this.AddEPToAlleged();
                    if (SeasonAnimCheck)
                      return this.setState({ ShowModalAddNotifLier: true });

                    return this.addAnime();
                  }
                  // Film
                  if (type === "film") return this.addAnime();
                  // No Type
                  this.setState({ OpenNextNewAnime: false, type: "serie" });
                }}
              >
                {!OpenNextNewAnime ? (
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
                ) : type === "serie" ? (
                  <Fragment>
                    <Form.Group controlId="titre">
                      <Form.Label>Titre</Form.Label>
                      <Form.Control
                        type="text"
                        required
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
                        Nombre d'épisode (séparé d'un "," pour changer de saison
                        pas d'espace !)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={nbEP}
                        required
                        placeholder="Nombre d'EP => S1NbEP,S2NbEP..."
                        autoComplete="off"
                        onChange={(event) =>
                          this.setState({ nbEP: event.target.value })
                        }
                      />
                    </Form.Group>
                  </Fragment>
                ) : type === "film" ? (
                  <Fragment>
                    <Form.Group controlId="titreFilm">
                      <Form.Label>Titre</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Titre du film"
                        required
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
                        min={1}
                        placeholder="Durée en minutes"
                        autoComplete="off"
                        onChange={(event) => {
                          const value = parseInt(event.target.value);

                          if (value < 1) return;
                          this.setState({ durer: value });
                        }}
                      />
                    </Form.Group>
                  </Fragment>
                ) : (
                  this.setState({ OpenNextNewAnime: false, type: "serie" })
                )}
                {OpenNextNewAnime ? (
                  <Fragment>
                    <Form.Label>Options (Facultatif)</Form.Label>
                    {type === "serie" ? (
                      <Fragment>
                        <Form.Group controlId="seasonAnime">
                          <Form.Check
                            type="checkbox"
                            checked={SeasonAnimCheck}
                            label={`Anime de saison: ${
                              SeasonAnimCheck === true ? "Oui" : "Non"
                            }`}
                            onChange={(event) =>
                              this.setState({
                                SeasonAnimCheck: event.target.checked,
                              })
                            }
                          />
                        </Form.Group>
                        <Form.Group controlId="WaitAnim">
                          <Form.Check
                            type="checkbox"
                            checked={WaitAnimCheck}
                            label={`Série en attente de visionnage: ${
                              WaitAnimCheck === true ? "Oui" : "Non"
                            }`}
                            onChange={(event) =>
                              this.setState({
                                WaitAnimCheck: event.target.checked,
                              })
                            }
                          />
                        </Form.Group>
                      </Fragment>
                    ) : type === "film" ? (
                      <Form.Group controlId="WaitAnimFilm">
                        <Form.Check
                          type="checkbox"
                          checked={WaitAnimCheck}
                          label={`Film en attente de visionnage: ${
                            WaitAnimCheck === true ? "Oui" : "Non"
                          }`}
                          onChange={(event) =>
                            this.setState({
                              WaitAnimCheck: event.target.checked,
                            })
                          }
                        />
                      </Form.Group>
                    ) : null}
                    <Form.Group controlId="urlPersoAnime">
                      <Form.Control
                        type="text"
                        placeholder="Image Personnalisé (URL)"
                        autoComplete="off"
                        value={UrlUserImg}
                        onChange={(event) =>
                          this.setState({
                            UrlUserImg: event.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  </Fragment>
                ) : null}
              </Form>
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                <span className="fas fa-window-close"></span> Annuler
              </Button>
              {(OpenNextNewAnime &&
                type === "serie" &&
                title.trim().length !== 0 &&
                nbEP.trim().length === 0) ||
              (type === "film" && title.trim().length !== 0) ? (
                <Button variant="info" onClick={this.FindEPBtn}>
                  <span
                    className={`fas ${
                      AnimateFasIcon[0] && AnimateFasIcon[1]
                        ? "fa-times"
                        : `fa-sync${AnimateFasIcon[0] ? " fa-spin" : ""}`
                    }`}
                  ></span>{" "}
                  Find Ep for {title}
                </Button>
              ) : null}
              {UrlUserImg.trim().length !== 0 && OpenNextNewAnime ? (
                <Button
                  variant="link"
                  onClick={() => {
                    try {
                      new URL(UrlUserImg);
                    } catch (err) {
                      console.error(err);
                      this.ShowMessageInfo(
                        "Veuillez donner un URL valide: https://www.exemple.com",
                        7000,
                        "danger"
                      );
                      return;
                    }
                    this.setState({ ModePreview: true });
                  }}
                >
                  <span className="fas fa-eye"></span> Preview
                </Button>
              ) : null}
              <Button
                variant="success"
                disabled={
                  !OpenNextNewAnime
                    ? type === ""
                    : type === "serie"
                    ? title.trim().length === 0 || nbEP.trim().length === 0
                    : false
                }
                onClick={() => {
                  if (!OpenNextNewAnime)
                    return this.setState({ OpenNextNewAnime: true });
                  // Serie
                  if (type === "serie") {
                    if (addEPToAlleged) return this.AddEPToAlleged();
                    if (SeasonAnimCheck)
                      return this.setState({ ShowModalAddNotifLier: true });

                    return this.addAnime();
                  }
                  // Film
                  if (type === "film") return this.addAnime();
                  // No Type
                  this.setState({ OpenNextNewAnime: false, type: "serie" });
                }}
              >
                {!OpenNextNewAnime ? (
                  <Fragment>
                    Suivant <span className="fas fa-arrow-right"></span>
                  </Fragment>
                ) : type === "serie" || type === "film" ? (
                  <Fragment>
                    <span className="fas fa-plus"></span> Créer {title}
                  </Fragment>
                ) : (
                  this.setState({ OpenNextNewAnime: false, type: "serie" })
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={ShowModalAddManga}
            size={typeManga[1] && typeManga[0] === "volume" ? "lg" : null}
            onHide={this.cancelModal}
          >
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Ajouter un Manga</Modal.Title>
            </Modal.Header>
            <Modal.Body
              id="ModalBody"
              onKeyDown={(event) => {
                if (event.key === "Enter") this.addManga();
              }}
            >
              <Form id="AddManga" onSubmit={this.addManga}>
                <Form.Group controlId="typeManga">
                  <Form.Label>1. En scans OU en volumes</Form.Label>
                  <Form.Control
                    as="select"
                    value={typeManga[0]}
                    autoComplete="off"
                    onChange={(event) =>
                      this.setState({
                        typeManga: [event.target.value, typeManga[1]],
                      })
                    }
                    custom
                  >
                    <option value="scan">Scans (Online)</option>
                    <option value="volume">Volumes</option>
                  </Form.Control>
                </Form.Group>
                {typeManga[1] ? (
                  <Fragment>
                    <Form.Group controlId="titreM">
                      <Form.Label>2. Titre Du Manga</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Attaques des Titans"
                        required
                        autoComplete="off"
                        value={title}
                        onChange={(event) =>
                          this.setState({
                            title: event.target.value,
                          })
                        }
                      />
                    </Form.Group>
                    {typeManga[0] === "volume" ? (
                      <Form.Group controlId="volume">
                        <Form.Label>3. Nombres de Tomes</Form.Label>
                        <Form.Control
                          type="number"
                          value={Volumes[0].toString()}
                          min="1"
                          placeholder="34"
                          autoComplete="off"
                          onChange={(event) => {
                            const value = parseInt(event.target.value);
                            if (value < 1) return;
                            this.setState({ Volumes: [value, Volumes[1]] });
                          }}
                        />
                        <Form.Label>
                          3. Nombres de Chapitres par Tome
                        </Form.Label>
                        <Form.Control
                          type="number"
                          value={Volumes[1].toString()}
                          min="1"
                          placeholder="4"
                          autoComplete="off"
                          onChange={(event) => {
                            const value = parseInt(event.target.value);
                            if (value < 1) return;
                            this.setState({ Volumes: [Volumes[0], value] });
                          }}
                        />
                        <Form.Label>4. Prévisualiser</Form.Label>
                        {VolumesMangaPreview}
                      </Form.Group>
                    ) : (
                      <Form.Group controlId="scan">
                        <Form.Label>3. Nombres de Scans</Form.Label>
                        <Form.Control
                          type="number"
                          value={Scan.toString()}
                          min="1"
                          placeholder="139"
                          autoComplete="off"
                          onChange={(event) => {
                            const value = parseInt(event.target.value);

                            if (value < 1) return;
                            this.setState({ Scan: value });
                          }}
                        />
                      </Form.Group>
                    )}
                  </Fragment>
                ) : null}
                {typeManga[1] ? (
                  <Form.Group controlId="optnManga">
                    <Form.Label>Options (Facultatif)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Image Personnalisé (URL)"
                      autoComplete="off"
                      value={UrlUserImg}
                      onChange={(event) =>
                        this.setState({
                          UrlUserImg: event.target.value,
                        })
                      }
                    />
                    {UrlUserImg.trim().length !== 0 ? (
                      <Button
                        variant="link"
                        onClick={() => {
                          try {
                            new URL(UrlUserImg);
                          } catch (err) {
                            console.error(err);
                            this.ShowMessageInfo(
                              "Veuillez donner un URL valide: https://www.exemple.com",
                              7000,
                              "danger"
                            );
                            return;
                          }
                          this.setState({ ModePreview: true });
                        }}
                      >
                        <span className="fas fa-eye"></span> Preview
                      </Button>
                    ) : null}
                  </Form.Group>
                ) : null}
              </Form>
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                <span className="fas fa-window-close"></span> Annuler
              </Button>
              <Button
                variant="success"
                onClick={() => {
                  if (!typeManga[1])
                    return this.setState({ typeManga: [typeManga[0], true] });
                  this.addManga();
                }}
              >
                {!typeManga[1] ? (
                  <Fragment>
                    Suivant <span className="fas fa-arrow-right"></span>
                  </Fragment>
                ) : (
                  <Fragment>
                    <span className="fas fa-plus"></span> Créer {title}
                  </Fragment>
                )}
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={ShowModalAddNM} onHide={this.cancelModal}>
            <Modal.Header id="ModalTitle" closeButton>
              <Modal.Title>Next Manga</Modal.Title>
            </Modal.Header>
            <Modal.Body
              id="ModalBody"
              onKeyDown={(event) => {
                if (event.key === "Enter") this.addNextManga();
              }}
            >
              <Form id="AddNextManga" onSubmit={this.addNextManga}>
                <Form.Group controlId="titreNM">
                  <Form.Label>Titre Du Manga</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Titre Du Manga"
                    required
                    autoComplete="off"
                    value={NextManga}
                    onChange={(event) =>
                      this.setState({
                        NextManga: event.target.value,
                      })
                    }
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer id="ModalFooter">
              <Button variant="secondary" onClick={this.cancelModal}>
                <span className="fas fa-window-close"></span> Annuler
              </Button>
              <Button variant="success" onClick={this.addNextManga}>
                <span className="fas fa-plus"></span> Ajouter
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
              {ResTextMsg}
            </div>
          ) : null}
        </Fragment>
      );
    }
  }
}

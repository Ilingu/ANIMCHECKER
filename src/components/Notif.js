import React, { Component } from "react";
import { openDB } from "idb";
import { Link, Redirect } from "react-router-dom";
// Components
import OneNotif from "./dyna/OneNotif";
// CSS
import { Spinner, Button, Modal, Form, Alert } from "react-bootstrap";
import TimePicker from "react-bootstrap-time-picker";
// DB
import base from "../db/base";
import firebase from "firebase/app";

export default class Notif extends Component {
  state = {
    // Firebase
    Notif: {},
    Pseudo: this.props.match.params.pseudo,
    AnimeList: null,
    RefreshNotif: true,
    NotifRenderSaved: "Vous avez aucune notif d'anime, rajoutez-en !",
    // Auth
    uid: null,
    proprio: null,
    RedirectHome: false,
    // Bon fonctionnement de l'app
    OfflineMode: !JSON.parse(window.localStorage.getItem("OfflineMode"))
      ? false
      : JSON.parse(window.localStorage.getItem("OfflineMode")),
    ManuallyChangeBlockWS: false,
    RefreshAnimListRenderer: true,
    isFirstTime: true,
    UpdateNotif: null,
    MyAnimNameStocked: null,
    PickAnime: true,
    // Form
    name: "",
    day: new Date().getDay().toString(),
    time:
      new Date().getHours() * 3600 +
      Math.round(new Date().getMinutes() / 10) * 10 * 60,
    Lier: null,
    // Modal
    ShowModalAddNotif: false,
    // Alerts
    ResText: null,
    typeAlert: null,
    // Fun
    ShowTheChangeNotifColorBtn: false,
  };

  _isMounted = false;
  DataBaseWS = null;
  connectedRef = null;
  setIntervalVar = null;
  NumberOfClick = [0, 0];

  componentDidMount() {
    this._isMounted = true;
    const self = this;
    /* FB Conn */
    if (this.state.Pseudo && this._isMounted) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          self.handleAuth({ user });
        }
      });
    }
    this.refreshNotif();
    /* WS */
    this.ActiveWebSockets();
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

  ActiveWebSockets = () => {
    // WS
    if (this.state.OfflineMode === false) {
      this.DataBaseWS = firebase.database().ref(`${this.state.Pseudo}/Notif`);
      this.DataBaseWS.on("value", (snap) => {
        const NewData = snap.val();
        if (!NewData) return this.setState({ RedirectHome: true });
        if (this.state.ManuallyChangeBlockWS)
          return this.setState({ ManuallyChangeBlockWS: false });
        if (!this.state.isFirstTime && NewData) this.refreshNotif(NewData);
      });
    }
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
      // Fast Loading Anime before FnRefresh
      this.refreshNotif(null, true);

      if (snap.val() === true) {
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

  FetchAnime = async () => {
    const { OfflineMode } = this.state;
    const db = await openDB("AckDb", 1);
    const StoreAnim = db
      .transaction("serieFirebase")
      .objectStore("serieFirebase");
    const resultsAnim = await StoreAnim.getAll();
    let AnimeList = this.state.AnimeList;
    AnimeList = OfflineMode
      ? resultsAnim[0].data
      : await base.fetch(`${this.state.Pseudo}/serie`, {
          context: this,
        });

    this.setState({ AnimeList, RefreshAnimListRenderer: true });
  };

  refreshNotif = async (WSData = null) => {
    try {
      const { OfflineMode } = this.state;
      const db = await openDB("AckDb", 1);
      const Store = db
        .transaction("NotifFirebase")
        .objectStore("NotifFirebase");
      const results = await Store.getAll();

      const Notif =
        WSData !== null
          ? WSData
          : OfflineMode
          ? results[0].data
          : await base.fetch(`${this.state.Pseudo}/Notif`, {
              context: this,
            });

      if (this.state.PickAnime === true) {
        this.FetchAnime();
      }

      if (this._isMounted)
        this.setState({ Notif, PickAnime: false, RefreshNotif: true });
    } catch (err) {
      console.error(err);
    }
  };

  addValue = (path, value) => {
    const { OfflineMode } = this.state;

    this.setState(
      {
        ManuallyChangeBlockWS:
          OfflineMode === true ? this.state.ManuallyChangeBlockWS : true,
      },
      () => {
        base
          .post(path, {
            data: value,
          })
          .then(() => {
            if (path.includes("manga")) {
              this.refreshManga();
            } else this.refreshNotif();
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
      }
    );
  };

  updateValue = (path, value) => {
    const { OfflineMode } = this.state;

    this.setState(
      {
        ManuallyChangeBlockWS:
          OfflineMode === true ? this.state.ManuallyChangeBlockWS : true,
      },
      () => {
        base
          .update(path, {
            data: value,
          })
          .then(this.refreshNotif)
          .catch((err) => {
            this.OfflineMode(null, true);
            console.error(err);
          });
      }
    );
  };

  deleteValue = async (path) => {
    const { OfflineMode } = this.state;

    this.setState(
      {
        ManuallyChangeBlockWS:
          OfflineMode === true ? this.state.ManuallyChangeBlockWS : true,
      },
      () => {
        base
          .remove(path)
          .then(() => {
            this.refreshNotif();
            this.setState({
              ResText: "Votre requête de suppression a réussite.",
              typeAlert: "success",
            });
          })
          .catch((err) => {
            console.error(err);
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
      }
    );
  };

  addNotif = async () => {
    const {
      Pseudo,
      name,
      day,
      time,
      Lier,
      Notif,
      OfflineMode,
      UpdateNotif,
      AnimeList,
    } = this.state;

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

    // Add
    const db = await openDB("AckDb", 1);
    const Store = db
      .transaction("NotifFirebase", "readwrite")
      .objectStore("NotifFirebase");

    if (
      name !== undefined &&
      name !== null &&
      typeof name === "string" &&
      name.trim().length !== 0 &&
      name !== "" &&
      UpdateNotif !== null &&
      typeof UpdateNotif === "string" &&
      UpdateNotif.trim().length !== 0
    ) {
      let CopyDataGlobal = null;
      if (OfflineMode === true) {
        const CopyData = [...(await Store.getAll())][0].data;
        CopyData[UpdateNotif] = {
          name,
          Lier,
          calledTime: GenerateCalledTime(),
          paused: false,
        };
        CopyDataGlobal = CopyData;
      }

      if (
        Lier !== null &&
        typeof Lier === "string" &&
        Lier.trim().length !== 0
      ) {
        if (OfflineMode) {
          const StoreAnime = db
            .transaction("serieFirebase", "readwrite")
            .objectStore("serieFirebase");
          const CopyData = [...(await StoreAnime.getAll())][0].data;
          const AnimeObj = AnimeList[Lier];
          if (AnimeObj.Lier) {
            delete CopyDataGlobal[AnimeObj.Lier].Lier;
          }
          const NotifObj = Notif[UpdateNotif];
          if (NotifObj.Lier) {
            delete CopyData[NotifObj.Lier].Lier;
          }
          CopyData[Lier] = {
            ...CopyData[Lier],
            Lier: UpdateNotif,
          };
          Store.put({
            id: "serieFirebase",
            data: CopyData,
          });
        } else {
          const AnimeObj = AnimeList[Lier];
          if (AnimeObj.Lier) {
            this.deleteValue(`${Pseudo}/Notif/${AnimeObj.Lier}/Lier`);
          }
          const NotifObj = Notif[UpdateNotif];
          if (NotifObj.Lier) {
            this.deleteValue(`${Pseudo}/serie/${NotifObj.Lier}/Lier`);
          }
          base
            .update(`${Pseudo}/serie/${Lier}`, {
              data: { Lier: UpdateNotif },
            })
            .then(this.FetchAnime);
        }
      } else {
        const NotifObj = Notif[UpdateNotif];
        if (NotifObj.Lier) {
          this.deleteValue(`${Pseudo}/serie/${NotifObj.Lier}/Lier`);
        }
      }

      OfflineMode === true
        ? Store.put({
            id: "NotifFirebase",
            data: CopyDataGlobal,
          }).then(() => this.refreshNotif())
        : this.updateValue(`${Pseudo}/Notif/${UpdateNotif}`, {
            name,
            calledTime: GenerateCalledTime(),
            Lier: !Lier ? null : Lier,
          });

      this.setState({
        ShowModalAddNotif: false,
        UpdateNotif: null,
        name: "",
        day: new Date().getDay().toString(),
        time:
          new Date().getHours() * 3600 +
          Math.round(new Date().getMinutes() / 10) * 10 * 60,
        Lier: null,
      });
    } else if (
      name !== undefined &&
      name !== null &&
      typeof name === "string" &&
      name.trim().length !== 0 &&
      name !== ""
    ) {
      const token = (length) => {
        const rand = () => Math.random(0).toString(36).substr(2);
        let ToReturn = (rand() + rand() + rand() + rand()).substr(0, length);
        while (ToReturn.includes("-")) {
          ToReturn = (rand() + rand() + rand() + rand()).substr(0, length);
        }
        return ToReturn;
      };
      const IDNotif = `notif${token(10)}${Date.now()}`;
      let NewNotifTemplate = {
        ...Notif,
        [IDNotif]: {
          name,
          Lier,
          calledTime: GenerateCalledTime(),
          paused: false,
        },
      };

      if (
        Lier !== null &&
        typeof Lier === "string" &&
        Lier.trim().length !== 0
      ) {
        if (OfflineMode) {
          const StoreAnime = db
            .transaction("serieFirebase", "readwrite")
            .objectStore("serieFirebase");
          const CopyData = [...(await StoreAnime.getAll())][0].data;
          const AnimeObj = AnimeList[Lier];
          if (AnimeObj.Lier) {
            const CopyNotif = { ...Notif };
            delete CopyNotif[AnimeObj.Lier].Lier;
            NewNotifTemplate = {
              ...CopyNotif,
              [IDNotif]: {
                name,
                Lier,
                calledTime: GenerateCalledTime(),
                paused: false,
              },
            };
          }
          CopyData[Lier] = {
            ...CopyData[Lier],
            Lier: IDNotif,
          };
          Store.put({
            id: "serieFirebase",
            data: CopyData,
          });
        } else {
          const AnimeObj = AnimeList[Lier];
          if (AnimeObj.Lier) {
            try {
              const CopyNotif = { ...Notif };
              delete CopyNotif[AnimeObj.Lier].Lier;
              NewNotifTemplate = {
                ...CopyNotif,
                [IDNotif]: {
                  name,
                  Lier,
                  calledTime: GenerateCalledTime(),
                  paused: false,
                },
              };
              this.deleteValue(`${Pseudo}/Notif/${AnimeObj.Lier}/Lier`);
            } catch (error) {}
          }
          base
            .update(`${Pseudo}/serie/${Lier}`, {
              data: { Lier: IDNotif },
            })
            .then(this.FetchAnime);
        }
      }

      OfflineMode === true
        ? Store.put({
            id: "NotifFirebase",
            data: NewNotifTemplate,
          })
            .then(() => {
              this.refreshNotif(null, true);
              this.setState({
                ResText: "Notif ajouter",
                typeAlert: "success",
              });
            })
            .catch((err) => {
              console.error(err);
              this.setState({
                ResText: "Error: Impossible d'ajouter la notif",
                typeAlert: "danger",
              });
            })
        : this.addValue(`${Pseudo}/Notif`, NewNotifTemplate);

      this.setState({
        ShowModalAddNotif: false,
        name: "",
        day: new Date().getDay().toString(),
        time:
          new Date().getHours() * 3600 +
          Math.round(new Date().getMinutes() / 10) * 10 * 60,
        Lier: null,
      });

      setTimeout(() => {
        this.setState({
          ResText: null,
          typeAlert: null,
        });
      }, 3200);
    }
  };

  updatePaused = async (key, value) => {
    const { OfflineMode } = this.state;
    let CopyDataGlobal = null;
    const db = await openDB("AckDb", 1);
    const Store = db
      .transaction("NotifFirebase", "readwrite")
      .objectStore("NotifFirebase");
    if (OfflineMode === true) {
      const CopyData = [...(await Store.getAll())][0].data;
      CopyData[key].paused = value;
      CopyDataGlobal = CopyData;
    }

    OfflineMode === true
      ? Store.put({
          id: "NotifFirebase",
          data: CopyDataGlobal,
        })
          .then(this.refreshNotif)
          .catch((err) => console.error(err))
      : this.updateValue(`${this.state.Pseudo}/Notif/${key}`, {
          paused: value,
        });
  };

  handleDelete = async (key) => {
    const { Pseudo, OfflineMode, Notif } = this.state;
    let CopyDataGlobal = null;
    const db = await openDB("AckDb", 1);
    const Store = db
      .transaction("NotifFirebase", "readwrite")
      .objectStore("NotifFirebase");
    if (OfflineMode === true) {
      const CopyData = [...(await Store.getAll())][0].data;
      delete CopyData[key];
      CopyDataGlobal = CopyData;
    }
    if (Notif[key].Lier) {
      this.deleteValue(`${Pseudo}/serie/${Notif[key].Lier}/Lier`);
    }
    OfflineMode === true
      ? (() => {
          Store.put({
            id: "NotifFirebase",
            data: CopyDataGlobal,
          })
            .then(() => {
              this.FetchAnime();
              this.refreshNotif(null, true);
              this.setState({
                ResText: "Notif Supprimer avec succès",
                typeAlert: "success",
              });
            })
            .catch((err) => {
              console.error(err);
              this.setState({
                ResText: "Error: Impossible de supprimer la notif :/",
                typeAlert: "danger",
              });
            });
          setTimeout(() => {
            this.setState({
              ResText: null,
              typeAlert: null,
            });
          }, 3600);
        })()
      : this.deleteValue(`${Pseudo}/Notif/${key}`);
  };

  render() {
    const {
      Pseudo,
      uid,
      proprio,
      RefreshNotif,
      NotifRenderSaved,
      isFirstTime,
      Notif,
      Lier,
      OfflineMode,
      RefreshAnimListRenderer,
      ShowTheChangeNotifColorBtn,
      ShowModalAddNotif,
      AnimeList,
      name,
      RedirectHome,
      MyAnimNameStocked,
      UpdateNotif,
      day,
      time,
      ResText,
      typeAlert,
    } = this.state;

    if (!Pseudo || typeof Pseudo !== "string")
      return <Redirect to="/notifuser/2" />;

    if (RedirectHome) {
      return <Redirect to="/notifuser/12" />;
    }

    if (isFirstTime) {
      this.setState({ isFirstTime: false });
      return <Redirect to="/notificator" />;
    }

    if (!uid && OfflineMode === false) {
      return (
        <Spinner
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
          }}
          animation="border"
          variant="warning"
        />
      );
    }

    if (uid !== proprio || !uid || !proprio)
      return <Redirect to="/notifuser/3" />;

    let MyAnimName = "Vous n'avez pas d'anime, rajoutez-en !";

    if (Object.keys(Notif)?.length !== 0 && RefreshNotif) {
      // Render Notif
      let ResultInComponents = [];
      [1, 2, 3, 4, 5, 6, 0].forEach((days) => {
        let dayInLetter = null,
          nbOfNotif = 0,
          color = [
            Math.round(Math.random() * 255),
            Math.round(Math.random() * 255),
            Math.round(Math.random() * 255),
          ];
        let NewNotifToStore = [];
        Object.keys(Notif).forEach((key) => {
          if (new Date(Notif[key].calledTime[0]).getDay() === days) {
            nbOfNotif++;
            NewNotifToStore = [
              ...NewNotifToStore,
              <OneNotif
                key={key}
                color={color}
                name={Notif[key].name}
                calledTime={Notif[key].calledTime[0]}
                paused={Notif[key].paused}
                fn={[
                  () => this.updatePaused(key, !Notif[key].paused),
                  () => this.handleDelete(key),
                  () =>
                    this.setState({
                      UpdateNotif: key,
                      ShowModalAddNotif: true,
                      name: Notif[key].name,
                      day: new Date(Notif[key].calledTime[0])
                        .getDay()
                        .toString(),
                      time:
                        new Date(Notif[key].calledTime[0]).getHours() * 3600 +
                        new Date(Notif[key].calledTime[0]).getMinutes() * 60,
                      Lier: Notif[key].Lier,
                    }),
                ]}
              />,
            ];
          }
        });
        switch (days) {
          case 0:
            dayInLetter = "Dimanche";
            break;
          case 1:
            dayInLetter = "Lundi";
            break;
          case 2:
            dayInLetter = "Mardi";
            break;
          case 3:
            dayInLetter = "Mercredi";
            break;
          case 4:
            dayInLetter = "Jeudi";
            break;
          case 5:
            dayInLetter = "Vendredi";
            break;
          case 6:
            dayInLetter = "Samedi";
            break;
          default:
            dayInLetter = "Fatal Error";
            break;
        }
        ResultInComponents = [
          ...ResultInComponents,
          <h3 key={days}>
            {dayInLetter} ({nbOfNotif})<br />
          </h3>,
          ...NewNotifToStore,
        ];
      });
      // Save Notif
      this.setState({
        RefreshNotif: false,
        NotifRenderSaved: ResultInComponents,
      });
    }

    if (AnimeList !== null && RefreshAnimListRenderer === true) {
      let FirstKey = null;
      MyAnimName = Object.keys(AnimeList).map((key, i) => {
        if (i === 0) FirstKey = key;
        if (!AnimeList[key].AnimeSeason) return null;
        return (
          <option key={i} value={key}>
            {AnimeList[key].name}
          </option>
        );
      });
      MyAnimName = [
        <option
          key={`${(Math.random() * 1000000000)
            .toString()
            .split(".")
            .join("")}${Date.now()}`}
          value={null}
        >
          Aucun
        </option>,
        ...MyAnimName,
      ];
      this.setState({
        Lier: FirstKey,
        RefreshAnimListRenderer: false,
        MyAnimNameStocked: MyAnimName,
      });
    }

    return (
      <section id="Notif" className="container">
        <header>
          <Link push="true" to="/">
            <Button className="btnBackDesing">
              <span className="fas fa-arrow-left"></span> Retour
            </Button>
          </Link>

          <h2>
            <span
              className="fas fa-bell"
              onClick={() => {
                this.NumberOfClick = [
                  this.NumberOfClick[0] + 1,
                  this.NumberOfClick[1],
                ];
                if (
                  this.NumberOfClick[0] === 14 &&
                  this.NumberOfClick[1] === 14
                ) {
                  this.NumberOfClick[0] = this.NumberOfClick[1] = 0;
                  this.setState({
                    ShowTheChangeNotifColorBtn: !ShowTheChangeNotifColorBtn,
                  });
                }
              }}
            ></span>
            <span style={{ userSelect: "none", color: "#ff6d00" }}>
              {" "}
              Notif ({Object.keys(Notif)?.length}){" "}
            </span>
            <span
              className="fas fa-bell"
              onClick={() => {
                this.NumberOfClick = [
                  this.NumberOfClick[0],
                  this.NumberOfClick[1] + 1,
                ];
                if (
                  this.NumberOfClick[0] === 14 &&
                  this.NumberOfClick[1] === 14
                ) {
                  this.NumberOfClick[0] = this.NumberOfClick[1] = 0;
                  this.setState({
                    ShowTheChangeNotifColorBtn: !ShowTheChangeNotifColorBtn,
                  });
                }
              }}
            ></span>
          </h2>
          <h4>
            Ici, vous pouvez ajouter les dates de sortie hebdomadaire des anime
            et vous serez notifié(e) quand cette date arriveras
          </h4>
          <Button
            variant="outline-success"
            block
            onClick={() => this.setState({ ShowModalAddNotif: true })}
          >
            <span className="fas fa-plus-circle"></span> Notif
          </Button>
          {ShowTheChangeNotifColorBtn ? (
            <Button
              variant="outline-secondary"
              block
              onClick={() =>
                this.setState({
                  RefreshNotif: true,
                })
              }
            >
              🥚 Changer la couleurs des notif
            </Button>
          ) : null}
          <div id="returnAlert">
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
        <div id="returnNotif">{NotifRenderSaved}</div>

        {/* MODAL */}
        <Modal
          show={ShowModalAddNotif}
          onHide={() =>
            this.setState({
              ShowModalAddNotif: false,
              UpdateNotif: null,
              name: "",
              day: new Date().getDay().toString(),
              time:
                new Date().getHours() * 3600 +
                Math.round(new Date().getMinutes() / 10) * 10 * 60,
              Lier: null,
            })
          }
        >
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>
              {UpdateNotif !== null
                ? "Modifié une notification"
                : "Ajouter une notification d'anime"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            <Form id="AddNotif">
              <Form.Group controlId="name">
                <Form.Label>Nom de l'anime</Form.Label>
                <Form.Control
                  type="text"
                  required
                  value={name}
                  min="1"
                  placeholder="Titre de l'anime à notifier"
                  autoComplete="off"
                  onChange={(event) =>
                    this.setState({ name: event.target.value })
                  }
                />
              </Form.Group>
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
              <Form.Group controlId="nameLier">
                <Form.Label>Nom de l'anime à lier</Form.Label>
                <Form.Control
                  as="select"
                  custom
                  value={Lier === null ? "Aucun" : Lier}
                  onChange={(event) =>
                    this.setState({
                      Lier:
                        event.target.value === "Aucun"
                          ? null
                          : event.target.value,
                      name:
                        name.trim().length !== 0
                          ? name
                          : event.target.value === "Aucun"
                          ? name
                          : AnimeList[event.target.value].name,
                    })
                  }
                >
                  {MyAnimNameStocked}
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button
              variant="secondary"
              onClick={() =>
                this.setState({
                  ShowModalAddNotif: false,
                  UpdateNotif: null,
                  name: "",
                  day: new Date().getDay().toString(),
                  time:
                    new Date().getHours() * 3600 +
                    Math.round(new Date().getMinutes() / 10) * 10 * 60,
                  Lier: null,
                })
              }
            >
              Annuler
            </Button>
            <Button
              variant={UpdateNotif !== null ? "info" : "success"}
              onClick={this.addNotif}
            >
              {UpdateNotif !== null ? (
                <span className="fas fa-pencil-alt"></span>
              ) : (
                <span className="fas fa-plus"></span>
              )}{" "}
              {UpdateNotif !== null ? "Modifier la notif" : "Créer la notif"}
            </Button>
          </Modal.Footer>
        </Modal>
      </section>
    );
  }
}

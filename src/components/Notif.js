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
import "firebase/auth";

export default class Notif extends Component {
  state = {
    // Firebase
    Notif: {},
    Pseudo: this.props.match.params.pseudo,
    // Auth
    uid: null,
    proprio: null,
    // Bon fonctionnement de l'app
    OfflineMode: !JSON.parse(window.localStorage.getItem("OfflineMode"))
      ? false
      : JSON.parse(window.localStorage.getItem("OfflineMode")),
    isFirstTime: true,
    // Form
    name: "",
    day: new Date().getDay().toString(),
    time:
      new Date().getHours() * 3600 +
      Math.round(new Date().getMinutes() / 10) * 10 * 60,
    // Modal
    ShowModalAddNotif: false,
    // Alerts
    ResText: null,
    typeAlert: null,
  };

  setIntervalVar = null;

  componentDidMount() {
    const self = this;

    this.refreshNotif();
    if (this.state.Pseudo) {
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
      // Fast Loading Anime before FnRefresh
      this.refreshNotif();

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

  refreshNotif = async () => {
    try {
      const { OfflineMode } = this.state;
      const db = await openDB("AckDb", 1);
      const Store = db
        .transaction("NotifFirebase")
        .objectStore("NotifFirebase");
      const results = await Store.getAll();

      const Notif = OfflineMode
        ? results[0].data
        : await base.fetch(`${this.state.Pseudo}/Notif`, {
            context: this,
          });

      this.setState({ Notif });
    } catch (err) {
      console.error(err);
    }
  };

  addNotif = async () => {
    const { name, day, time, Notif, OfflineMode } = this.state;

    if (
      name !== undefined &&
      name !== null &&
      typeof name === "string" &&
      name.trim().length !== 0 &&
      name !== ""
    ) {
      const NewNotifTemplate = {
        ...Notif,
        [`notif${Date.now()}`]: {
          name,
          day,
          time,
          paused: false,
          called: false,
        },
      };

      const db = await openDB("AckDb", 1);
      const Store = db
        .transaction("NotifFirebase", "readwrite")
        .objectStore("NotifFirebase");

      (OfflineMode === true
        ? Store.put({
            id: "NotifFirebase",
            data: NewNotifTemplate,
          })
        : base.post(`${this.state.Pseudo}/Notif`, {
            data: NewNotifTemplate,
          })
      )
        .then(() => {
          this.refreshNotif();
          this.setState({
            ResText: "Notif ajouter",
            typeAlert: "success",
            ShowModalAddNotif: false,
          });
        })
        .catch((err) => {
          console.error(err);
          this.setState({
            ResText: "Error: Impossible d'ajouter la notif",
            typeAlert: "danger",
            ShowModalAddNotif: false,
          });
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

    (OfflineMode === true
      ? Store.put({
          id: "NotifFirebase",
          data: CopyDataGlobal,
        })
      : base.update(`${this.state.Pseudo}/Notif/${key}`, {
          data: { paused: value },
        })
    )
      .then(this.refreshNotif)
      .catch((err) => console.error(err));
  };

  handleDelete = async (key) => {
    const { OfflineMode } = this.state;
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

    (OfflineMode === true
      ? Store.put({
          id: "NotifFirebase",
          data: CopyDataGlobal,
        })
      : base.remove(`${this.state.Pseudo}/Notif/${key}`)
    )
      .then(() => {
        this.refreshNotif();
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
    }, 3200);
  };

  render() {
    const {
      Pseudo,
      uid,
      proprio,
      isFirstTime,
      Notif,
      OfflineMode,
      ShowModalAddNotif,
      name,
      day,
      time,
      ResText,
      typeAlert,
    } = this.state;

    if (!Pseudo || typeof Pseudo !== "string")
      return <Redirect to="/notifuser/2" />;
    else if (isFirstTime) {
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

    if (uid !== proprio) return <Redirect to="/notifuser/3" />;

    let MyNotif = "Vous avez aucune notif d'anime rajoutez-en !";

    if (Object.keys(Notif).length !== 0) {
      MyNotif = Object.keys(Notif).map((key, i) => {
        return (
          <OneNotif
            key={key}
            name={Notif[key].name}
            day={Notif[key].day}
            time={Notif[key].time}
            paused={Notif[key].paused}
            fn={[
              () => this.updatePaused(key, !Notif[key].paused),
              () => this.handleDelete(key),
            ]}
          />
        );
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
            <span className="fas fa-cog fa-spin"></span> Notif params{" "}
            <span className="fas fa-cog fa-spin"></span>
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
          <Button
            variant="outline-secondary"
            block
            onClick={() => this.setState({ ShowModalAddNotif: false })}
          >
            Changer la couleurs des notif
          </Button>
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
        <div id="returnNotif">{MyNotif}</div>

        {/* MODAL */}
        <Modal
          show={ShowModalAddNotif}
          onHide={() => this.setState({ ShowModalAddNotif: false })}
        >
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>Ajouter une notifications d'anime</Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            <Form id="AddNotif">
              <Form.Group controlId="name">
                <Form.Label>Nom de l'anime</Form.Label>
                <Form.Control
                  type="text"
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
            </Form>
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button
              variant="secondary"
              onClick={() => this.setState({ ShowModalAddNotif: false })}
            >
              Annuler
            </Button>
            <Button variant="success" onClick={this.addNotif}>
              <span className="fas fa-plus"></span> Créer la notif
            </Button>
          </Modal.Footer>
        </Modal>
      </section>
    );
  }
}

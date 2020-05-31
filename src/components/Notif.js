import React, { Component } from "react";
import { Redirect } from "react-router-dom";
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
    // Auth
    uid: null,
    proprio: null,
    // Bon fonctionnement de l'app
    // Form
    name: "",
    day: new Date().getDay().toString(),
    time: 0,
    // Modal
    ShowModalAddNotif: false,
    // Alerts
    ResText: null,
    typeAlert: null,
  };

  componentDidMount() {
    const self = this;

    this.refreshNotif();
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        self.handleAuth({ user });
      }
    });
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

  refreshNotif = async () => {
    try {
      const Notif = await base.fetch("/Notif", {
        context: this,
      });

      this.setState({ Notif });
    } catch (err) {
      console.error(err);
    }
  };

  addNotif = () => {
    const { name, day, time, Notif } = this.state;

    if (
      name !== undefined &&
      name !== null &&
      typeof name === "string" &&
      name.trim().length !== 0 &&
      name !== ""
    ) {
      base
        .post("/Notif", {
          data: {
            ...Notif,
            [`notif${Date.now()}`]: {
              name,
              day,
              time,
              paused: false,
            },
          },
        })
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
            ResText: "Error: Impossible d'ajouter la notif, fatal: true",
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

  updatePaused = (key, value) => {
    base
      .update(`/Notif/${key}`, {
        data: { paused: value },
      })
      .then(this.refreshNotif)
      .catch((err) => console.error(err));
  };

  handleDelete = (key) => {
    base
      .remove(`/Notif/${key}`)
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
      uid,
      proprio,
      Notif,
      ShowModalAddNotif,
      name,
      day,
      time,
      ResText,
      typeAlert,
    } = this.state;

    if (!uid) {
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

    if (uid !== proprio) return <Redirect to="/" />;

    let MyNotif = "Vous avez aucune notif d'anime rajoutez-en !";

    if (Object.keys(Notif).length !== 0) {
      MyNotif = Object.keys(Notif).map((key) => (
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
      ));
    }

    return (
      <section id="Notif" className="container">
        <header>
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

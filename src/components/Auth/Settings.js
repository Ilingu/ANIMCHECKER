import React, { Component, Fragment } from "react";
import { Redirect, Link } from "react-router-dom";
// CSS
import { Spinner, Alert, Button, Modal, Form } from "react-bootstrap";
// DB
import base from "../../db/base";
import firebase from "firebase/app";
import "firebase/auth";

class Settings extends Component {
  state = {
    // FireBase
    Pseudo: this.props.match.params.pseudo,
    NotifState: null,
    // Auth
    uid: null,
    proprio: null,
    // Bon Fonctionnement
    isFirstTime: true,
    RedirectHome: null,
    ShowModalDeleteUser: false,
    ShowModalResetData: false,
    ShowModalChangePseudo: false,
    newPseudo: "",
    ResText: null,
    typeAlert: null,
  };

  componentDidMount() {
    const self = this;

    if (this.state.Pseudo) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          self.handleAuth({ user });
        }
      });
    }
  }

  AllowVpn = (reFunc) => {
    // Allow Vpn
    window.localStorage.removeItem("firebase:previous_websocket_failure");
    setTimeout(reFunc, 2000);
  };

  refreshNotifState = async () => {
    try {
      const NotifState = await base.fetch(`${this.state.Pseudo}/NotifState`, {
        context: this,
      });
      this.setState({ NotifState });
    } catch (err) {
      this.AllowVpn(this.refreshNotifState);
      console.error(err);
    }
  };

  addValue = (path, value, after = null) => {
    base
      .post(path, {
        data: value,
      })
      .then(after)
      .catch((err) => {
        this.AllowVpn(() => this.addValue(path, value, after));
        console.error(err);
      });
  };

  updateValue = (path, value, after = null) => {
    base
      .update(path, {
        data: value,
      })
      .then(after)
      .catch((err) => {
        this.AllowVpn(() => this.updateValue(path, value, after));
        console.error(err);
      });
  };

  deleteValue = (path, after = null) => {
    base
      .remove(path)
      .then(after)
      .catch((err) => {
        this.AllowVpn(() => this.deleteValue(path, after));
        console.error(err);
      });
  };

  handleAuth = async (authData) => {
    const box = await base.fetch(this.state.Pseudo, { context: this });

    if (!box.proprio) {
      await base.post(`${this.state.Pseudo}/proprio`, {
        data: authData.user.uid,
      });
    }

    this.refreshNotifState();
    this.setState({
      uid: authData.user.uid,
      proprio: box.proprio || authData.user.uid,
    });
  };

  ChangePseudo = async (event) => {
    event.preventDefault();
    this.cancelState();

    const { Pseudo, newPseudo } = this.state;

    if (
      newPseudo &&
      typeof newPseudo === "string" &&
      newPseudo.trim().length !== 0
    ) {
      try {
        const AllDataUser = await base.fetch(`${Pseudo}/`, {
          context: this,
        });
        this.addValue(`${newPseudo}/`, { ...AllDataUser }, () => {
          this.deleteValue(`/${Pseudo}`, () => {
            window.localStorage.setItem("Pseudo", newPseudo);
            this.setState({ RedirectHome: "/notifuser/6" });
          });
        });
      } catch (err) {
        this.AllowVpn(() => this.ChangePseudo(event));
        console.log(err);
      }
    } else {
      this.cancelState();
      this.setState({
        ResText: "Vueillez donné un nom pour votre nouveau pseudo !",
        typeAlert: "danger",
      });
    }
  };

  cancelState = () => {
    this.setState({
      ShowModalDeleteUser: false,
      ShowModalResetData: false,
      ShowModalChangePseudo: false,
      ResText: null,
      typeAlert: null,
    });
  };

  render() {
    const {
      Pseudo,
      NotifState,
      uid,
      proprio,
      RedirectHome,
      newPseudo,
      isFirstTime,
      ResText,
      typeAlert,
      ShowModalChangePseudo,
      ShowModalDeleteUser,
      ShowModalResetData,
    } = this.state;

    if (RedirectHome !== null) return <Redirect to={RedirectHome} />;

    if (!Pseudo || typeof Pseudo !== "string")
      return <Redirect to="/notifuser/2" />;
    else if (isFirstTime) {
      this.setState({ isFirstTime: false });
      return <Redirect to="/Settings" />;
    }

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

    if (uid !== proprio) return <Redirect to="/notifuser/3" />;

    return (
      <Fragment>
        <section id="Settings">
          <header>
            <Link push="true" to="/">
              <Button className="btnBackDesing">
                <span className="fas fa-arrow-left"></span> Retour
              </Button>
            </Link>
            <h2>
              <span className="fas fa-cog fa-spin"></span>
              {Pseudo}, voici tes paramètres
              <span className="fas fa-cog fa-spin"></span>
            </h2>
            <div id="returnAlert">
              {ResText === null && typeAlert === null ? null : (
                <Alert
                  variant={typeAlert}
                  onClose={this.cancelState}
                  dismissible
                >
                  <p>{ResText}</p>
                </Alert>
              )}
            </div>
          </header>
          <div id="ActionAccount">
            <h1>Action:</h1>
            <Button
              variant="outline-primary"
              className="BtnActionAccount"
              onClick={() => this.setState({ ShowModalChangePseudo: true })}
            >
              <span className="fas fa-user"></span> Changer De Pseudo
            </Button>
            {NotifState === null ? null : (
              <Button
                variant={
                  NotifState === false ? "outline-info" : "outline-warning"
                }
                onClick={() =>
                  this.updateValue(
                    `${Pseudo}/`,
                    {
                      NotifState: NotifState === false ? true : false,
                    },
                    this.refreshNotifState
                  )
                }
                className="BtnActionAccount"
              >
                {NotifState === false ? (
                  <Fragment>
                    <span className="fas fa-bell"></span>
                    Activer{" "}
                  </Fragment>
                ) : (
                  <Fragment>
                    <span className="fas fa-bell-slash"></span>
                    Désactiver{" "}
                  </Fragment>
                )}
                les Notif
              </Button>
            )}
            <hr />
            <Button
              variant="outline-dark"
              className="BtnActionAccount"
              onClick={() => this.setState({ ShowModalResetData: true })}
            >
              <span className="fas fa-history"></span> Réinitialiser les données
            </Button>
            <Button
              variant="outline-danger"
              className="BtnActionAccount"
              onClick={() => this.setState({ ShowModalDeleteUser: true })}
            >
              <span className="fas fa-user-times"></span> Supprimer le compte
            </Button>
          </div>
        </section>
        <Modal show={ShowModalChangePseudo} onHide={this.cancelState}>
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>
              Changer de Pseudo ({Pseudo} -{">"} {newPseudo})
            </Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            <Form onSubmit={this.ChangePseudo}>
              <Form.Group controlId="changepseudo">
                <Form.Label>
                  Votre nouveau nom de compte (ATTENTION En changeant votre
                  pseudo vous serez totalement déconnecté, penser à mettre votre
                  nouveau pseudo quand on vous demandera votre pseudo)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Votre nouveau nom de compte"
                  autoComplete="off"
                  value={newPseudo}
                  onChange={(event) =>
                    this.setState({ newPseudo: event.target.value })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button variant="secondary" onClick={this.cancelState}>
              Annuler
            </Button>
            <Button variant="primary" onClick={this.ChangePseudo}>
              Changer {Pseudo} pour {newPseudo}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal show={ShowModalDeleteUser} size="lg" onHide={this.cancelState}>
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>
              Voulez-vous vraiment Supprimer votre compte ({Pseudo})
            </Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            En faisant ça votre compte ({Pseudo}) sera entièrement supprimer
            avec aucune possiblité de le récupérer, en gros il n'existera plus.
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button variant="secondary" onClick={this.cancelState}>
              Annuler
            </Button>
            <Link to="/notifuser/6">
              <Button
                variant="danger"
                onClick={() => this.deleteValue(`/${Pseudo}`)}
              >
                Supprimer ce compte
              </Button>
            </Link>
          </Modal.Footer>
        </Modal>
        <Modal show={ShowModalResetData} size="lg" onHide={this.cancelState}>
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>
              Voulez-vous supprimez toutes vos données ?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            TOUS vos anime/film/notification/NextAnime/... seront supprimés
            entièrement, mais votre compte vous apartiendras toujours et sera
            pas supprimé (Réinitialisation du compte en bref).
          </Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button variant="secondary" onClick={this.cancelState}>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                this.deleteValue(`${Pseudo}/serie`);
                this.deleteValue(`${Pseudo}/film`);
                this.deleteValue(`${Pseudo}/NextAnim`);
                this.deleteValue(`${Pseudo}/Notif`);
                this.deleteValue(`${Pseudo}/NotifState`, () =>
                  this.setState({
                    ResText: "Toutes vos données ont bien été réinitialisées",
                    typeAlert: "success",
                  })
                );
                this.cancelState();
                this.refreshNotifState();
              }}
            >
              Supprimer les données
            </Button>
          </Modal.Footer>
        </Modal>
      </Fragment>
    );
  }
}

export default Settings;

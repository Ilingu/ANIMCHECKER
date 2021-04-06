import React, { Component, Fragment } from "react";
import { openDB } from "idb";
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
    ParamsOptn: null,
    // Auth
    uid: null,
    proprio: null,
    // Bon Fonctionnement
    OfflineMode: !JSON.parse(window.localStorage.getItem("OfflineMode"))
      ? false
      : JSON.parse(window.localStorage.getItem("OfflineMode")),
    isFirstTime: true,
    RedirectHome: null,
    ShowModalDeleteUser: false,
    ShowModalResetData: false,
    ShowModalChangePseudo: false,
    newPseudo: "",
    ACKColor: null,
    ResText: null,
    typeAlert: null,
  };

  setIntervalVar = null;

  componentDidMount() {
    const self = this;

    this.refreshParamsOptn();
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

  refreshParamsOptn = async () => {
    try {
      const { OfflineMode } = this.state;
      const db = await openDB("AckDb", 1);
      const Store = db.transaction("ParamsOptn").objectStore("ParamsOptn");
      const results = await Store.getAll();

      const ParamsOptn = OfflineMode
        ? results[0].data
        : await base.fetch(`${this.state.Pseudo}/ParamsOptn`, {
            context: this,
          });
      this.setState({ ParamsOptn, ACKColor: ParamsOptn.ACKColor });
    } catch (err) {
      console.error(err);
    }
  };

  addValue = (path, value, after = null) => {
    if (this.state.OfflineMode === false) {
      base
        .post(path, {
          data: value,
        })
        .then(after)
        .catch((err) => console.error(err));
    }
  };

  updateValue = async (path, value, after = null) => {
    const { OfflineMode } = this.state;
    let CopyDataGlobal = null;
    const db = await openDB("AckDb", 1);
    const Store = db
      .transaction("ParamsOptn", "readwrite")
      .objectStore("ParamsOptn");
    if (OfflineMode === true) {
      const CopyData = [...(await Store.getAll())][0].data;
      CopyData[Object.keys(value)[0]] = Object.values(value)[0];
      CopyDataGlobal = CopyData;
    }

    (OfflineMode === true
      ? Store.put({
          id: "ParamsOptn",
          data: CopyDataGlobal,
        })
      : base.update(path, {
          data: value,
        })
    )
      .then(after)
      .catch((err) => console.error(err));
  };

  deleteValue = (path, after = null) => {
    if (this.state.OfflineMode === false) {
      base
        .remove(path)
        .then(() => {
          if (after !== null) after();
          this.refreshParamsOptn();
        })
        .catch((err) => console.error(err));
    }
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

  ChangePseudo = async (event) => {
    event.preventDefault();
    this.cancelState();

    if (this.state.OfflineMode === false) {
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
          console.error(err);
        }
      } else {
        this.cancelState();
        this.setState({
          ResText: "Vueillez donné un nom pour votre nouveau pseudo !",
          typeAlert: "danger",
        });
      }
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
      ParamsOptn,
      uid,
      proprio,
      RedirectHome,
      newPseudo,
      isFirstTime,
      ACKColor,
      OfflineMode,
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
          <h1>Action:</h1>
          <div id="ActionAccount">
            <aside id="App">
              <h3>
                Application
                {!ParamsOptn ? null : (
                  <Fragment>
                    :
                    <input
                      type="color"
                      value={ACKColor ? ACKColor : "#212121"}
                      onChange={(event) => {
                        document.body.style.backgroundColor =
                          event.target.value;
                      }}
                      id="PersoAppBgc"
                    />
                  </Fragment>
                )}
                :
              </h3>
              {ParamsOptn === null ? null : (
                <Fragment>
                  <Button
                    variant={
                      ParamsOptn.NotifState === false
                        ? "outline-info"
                        : "outline-warning"
                    }
                    onClick={() =>
                      this.updateValue(
                        `${Pseudo}/ParamsOptn`,
                        {
                          NotifState:
                            ParamsOptn.NotifState === false ? true : false,
                        },
                        this.refreshParamsOptn
                      )
                    }
                    className="BtnActionAccount"
                  >
                    {ParamsOptn.NotifState === false ? (
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
                  <Button
                    variant="outline-light"
                    className="BtnActionAccount"
                    onClick={() =>
                      this.updateValue(
                        `${Pseudo}/ParamsOptn`,
                        {
                          MyAnimRandom:
                            ParamsOptn.MyAnimRandom === false ? true : false,
                        },
                        this.refreshParamsOptn
                      )
                    }
                  >
                    <span className="fas fa-dice"></span> Mélange de la liste
                    d'anime: {ParamsOptn.MyAnimRandom === false ? "Off" : "On"}
                  </Button>
                  <Button
                    variant="outline-info"
                    className="BtnActionAccount"
                    onClick={() =>
                      this.updateValue(
                        `${Pseudo}/ParamsOptn`,
                        {
                          SmartRepere:
                            ParamsOptn.SmartRepere === false ? true : false,
                        },
                        this.refreshParamsOptn
                      )
                    }
                  >
                    <span className="fas fa-eye"></span> Repere de votre
                    progression intelligente:{" "}
                    {ParamsOptn.SmartRepere === false ? "Off" : "On"}
                  </Button>
                  <Form>
                    <Form.Group controlId="animeAcueill">
                      <Form.Control
                        value={
                          ParamsOptn.TypeAnimeHomePage
                            ? ParamsOptn.TypeAnimeHomePage
                            : "NotFinished"
                        }
                        onChange={(event) => {
                          this.updateValue(
                            `${Pseudo}/ParamsOptn`,
                            {
                              TypeAnimeHomePage: event.target.value,
                            },
                            this.refreshParamsOptn
                          );
                          this.setState({
                            ResText: `A votre retour sur votre page d'accueil vous verez maintenant ${
                              event.target.value === "All"
                                ? "Tous vos Anime"
                                : `vos animes ${event.target.value}`
                            }`,
                            typeAlert: "success",
                          });
                          setTimeout(() => {
                            this.setState({
                              ResText: null,
                              typeAlert: null,
                            });
                          }, 3600);
                        }}
                        as="select"
                        custom
                      >
                        <option value="NotFinished">
                          Page d'accueil sur tes animes En Cours
                        </option>
                        <option value="Finished">
                          Page d'accueil sur tes animes Finis
                        </option>
                        <option value="seasonAnim">
                          Page d'accueil sur tes animes De Saison
                        </option>
                        <option value="Paused">
                          Page d'accueil sur tes animes En Pauses
                        </option>
                        <option value="Drop">
                          Page d'accueil sur tes animes que ta arrêter en cours
                        </option>
                        <option value="WaitAnim">
                          Page d'accueil sur tes animes en attentes
                        </option>
                        <option value="Rate">
                          Page d'accueil sur tes animes Notés
                        </option>
                        <option value="BySeries">
                          Page d'accueil sur tes séries
                        </option>
                        <option value="ByFilm">
                          Page d'accueil sur tes films
                        </option>
                        <option value="fav">
                          Page d'accueil sur tes animes Favoris
                        </option>
                        <option value="All">
                          Page d'accueil sur Tous tes animes
                        </option>
                      </Form.Control>
                    </Form.Group>
                  </Form>
                </Fragment>
              )}
            </aside>
            <aside id="User">
              <h3>Utilisateur:</h3>
              <Button
                variant="outline-primary"
                className="BtnActionAccount"
                disabled={OfflineMode}
                onClick={() => this.setState({ ShowModalChangePseudo: true })}
              >
                <span className="fas fa-user"></span> Changer De Pseudo
              </Button>
              <Button
                variant="outline-dark"
                disabled={OfflineMode}
                style={{ color: "#ddd" }}
                className="BtnActionAccount"
                onClick={() => {
                  this.cancelState();
                  if (OfflineMode) return;
                  this.setState({ ShowModalResetData: true });
                }}
              >
                <span className="fas fa-history"></span> Réinitialiser les
                données
              </Button>
              <Button
                variant="outline-danger"
                disabled={OfflineMode}
                className="BtnActionAccount"
                onClick={() => this.setState({ ShowModalDeleteUser: true })}
              >
                <span className="fas fa-user-times"></span> Supprimer le compte
              </Button>
            </aside>
            <aside id="About">
              <h3>A Propos:</h3>
              <ul>
                <li>
                  <span style={{ textDecoration: "underline" }}>
                    Version ACK:
                  </span>{" "}
                  LTS<b>1</b>β<b>2</b>
                </li>
                <li>
                  <span style={{ textDecoration: "underline" }}>
                    Version MCK:
                  </span>{" "}
                  β<b>2</b>
                </li>
              </ul>
              <p>
                Vous êtes actuellement sur la version{" "}
                {window.matchMedia("(display-mode: standalone)").matches ? (
                  <b>APP</b>
                ) : (
                  <b>WEB</b>
                )}{" "}
                de MyAnimChecker
              </p>
              <h5>Développeur</h5>
              <ul>
                <li>
                  <span style={{ textDecoration: "underline" }}>Pseudo:</span>{" "}
                  Ilingu
                </li>
                <li>
                  <span style={{ textDecoration: "underline" }}>Email:</span>{" "}
                  <a
                    href="mailto:thetitouoff@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    thetitouoff@gmail.com
                  </a>
                </li>
              </ul>
            </aside>
          </div>
        </section>
        {/* MODAL */}
        <Modal
          show={ShowModalChangePseudo && OfflineMode === false}
          onHide={this.cancelState}
        >
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>
              Changer de Pseudo ({Pseudo} -{">"} {newPseudo})
            </Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">
            <Form
              onSubmit={() => {
                this.cancelState();
                if (OfflineMode) return;
                this.ChangePseudo();
              }}
            >
              <Form.Group controlId="changepseudo">
                <Form.Label>
                  Votre nouveau nom de compte (ATTENTION En changeant votre
                  pseudo vous serez totalement déconnecté, penser à mettre votre
                  nouveau pseudo quand on vous demandera votre pseudo)
                </Form.Label>
                <Form.Control
                  type="text"
                  required
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
            <Button
              disabled={OfflineMode}
              variant="primary"
              onClick={() => {
                this.cancelState();
                if (OfflineMode === true) return;
                this.ChangePseudo();
              }}
            >
              Changer {Pseudo} pour {newPseudo}
            </Button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={ShowModalDeleteUser && OfflineMode === false}
          size="lg"
          onHide={this.cancelState}
        >
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
                onClick={async () => {
                  this.cancelState();
                  if (OfflineMode) return;
                  this.deleteValue(`/${Pseudo}`);
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
                  ];

                  Store.forEach((req) => req.delete(req.name));
                }}
              >
                Supprimer ce compte
              </Button>
            </Link>
          </Modal.Footer>
        </Modal>
        <Modal
          show={ShowModalResetData && OfflineMode === false}
          size="lg"
          onHide={this.cancelState}
        >
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
              onClick={async () => {
                this.cancelState();
                if (OfflineMode) return;

                // FireBase
                this.deleteValue(`${Pseudo}/serie`);
                this.deleteValue(`${Pseudo}/film`);
                this.deleteValue(`${Pseudo}/NextAnim`);
                this.deleteValue(`${Pseudo}/Notif`);
                this.deleteValue(`${Pseudo}/ParamsOptn`);

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
                ];

                Store.forEach((req) => req.delete(req.name));
                this.setState({
                  ResText: "Toutes vos données ont bien été réinitialisées",
                  typeAlert: "success",
                });
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

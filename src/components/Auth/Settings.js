import React, { Component, Fragment } from "react";
import { openDB } from "idb";
import { Redirect, Link } from "react-router-dom";
import { ChromePicker } from "react-color";
import CountrySelect from "react-bootstrap-country-select";
// CSS
import { Spinner, Alert, Button, Modal, Form } from "react-bootstrap";
// DB
import base from "../../db/base";
import firebase from "firebase/app";
import "firebase/auth";
import CountryJSON from "../../db/Country.json";
class Settings extends Component {
  state = {
    // FireBase
    Pseudo: this.props.match.params.pseudo,
    ParamsOptn: null,
    TemplateAnimeFirebase: {},
    // Auth
    uid: null,
    proprio: null,
    // Bon Fonctionnement
    FirstQuerie: false,
    OfflineMode: !JSON.parse(window.localStorage.getItem("OfflineMode"))
      ? false
      : JSON.parse(window.localStorage.getItem("OfflineMode")),
    isFirstTime: true,
    ConnectionInfo: {},
    Country: null,
    IndexForTemplateAnim: 0,
    RedirectHome: null,
    ShowModalDeleteUser: false,
    ShowModalResetData: false,
    ShowModalChangePseudo: false,
    newPseudo: "",
    ACKColor: null,
    ShowColorPicker: false,
    ResText: null,
    typeAlert: null,
  };

  _isMounted = false;
  DataBaseWS = null;
  connectedRef = null;
  setIntervalVar = null;

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
      /* WS */
      this.ActiveWebSockets();
    }
    /* UserInfo */
    this.GetUserConnInfo();
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
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    connection.removeEventListener("change", () => this.GetUserConnInfo(true));
  }

  ActiveWebSockets = () => {
    // WS
    const { Pseudo } = this.state;
    this.DataBaseWS = firebase.database().ref(`${Pseudo}/ParamsOptn`);
    this.DataBaseWS.on("value", (snap) => {
      const NewData = snap.val();
      this.refreshParamsOptn(NewData);
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

  refreshParamsOptn = async (WSData, forced = false) => {
    try {
      const { OfflineMode, FirstQuerie } = this.state;
      const db = await openDB("AckDb", 1);
      const Store = db.transaction("ParamsOptn").objectStore("ParamsOptn");

      const DataRequired = await Promise.all([
        OfflineMode || forced ? (await Store.getAll())[0].data : WSData,
        !FirstQuerie
          ? await base.fetch(`${this.state.Pseudo}/TemplateAnim`, {
              context: this,
            })
          : {},
      ]);

      if (this._isMounted)
        this.setState({
          ParamsOptn: DataRequired[0],
          TemplateAnimeFirebase: DataRequired[1],
          ACKColor: DataRequired[0].ACKColor,
          Country: DataRequired[0].Country,
          FirstQuerie: true,
        });
    } catch (err) {
      console.error(err);
    }
  };

  addValue = (path, value, after) => {
    if (this.state.OfflineMode === false) {
      base
        .post(path, {
          data: value,
        })
        .then(() => {
          after();
        })
        .catch((err) => console.error(err));
    }
  };

  updateValue = async (path, value) => {
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

    OfflineMode === true
      ? Store.put({
          id: "ParamsOptn",
          data: CopyDataGlobal,
        })
          .then(this.refreshParamsOptn)
          .catch((err) => console.error(err))
      : base
          .update(path, {
            data: value,
          })
          .catch((err) => console.error(err));
  };

  deleteValue = (path, after = null) => {
    if (this.state.OfflineMode === false) {
      base
        .remove(path)
        .then(() => {
          if (after !== null) after();
        })
        .catch((err) => console.error(err));
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

  GetUserConnInfo = (AlreadyInstanced = false) => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (connection) {
      const Type = connection.effectiveType;
      const TypeTechno = connection.type;
      const Speed = connection.downlink;
      const RecudeConsommation = connection.saveData;
      if (!AlreadyInstanced)
        connection.addEventListener("change", () => this.GetUserConnInfo(true));
      this.setState({
        ConnectionInfo: { Type, Speed, TypeTechno, RecudeConsommation },
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
      ParamsOptn,
      TemplateAnimeFirebase,
      uid,
      proprio,
      IndexForTemplateAnim,
      RedirectHome,
      newPseudo,
      ConnectionInfo,
      Country,
      isFirstTime,
      ACKColor,
      OfflineMode,
      ResText,
      typeAlert,
      ShowColorPicker,
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

    if (uid !== proprio || !uid || !proprio)
      return <Redirect to="/notifuser/3" />;

    let TemplateAnime = "Tu n'as aucun template d'anime";

    if (
      typeof TemplateAnimeFirebase === "object" &&
      Object.keys(TemplateAnimeFirebase)?.length !== 0
    ) {
      TemplateAnime = Object.keys(TemplateAnimeFirebase).map((key) => (
        <div className="TemplateAnim">
          <span
            className="fas fa-trash"
            onClick={() => this.deleteValue(`${Pseudo}/TemplateAnim/${key}`)}
            style={{ color: "#f00" }}
          ></span>{" "}
          {TemplateAnimeFirebase[key].title}
        </div>
      ));
    }

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
              <h3>Application (Personnalisation):</h3>
              {ShowColorPicker ? (
                <Fragment>
                  <ChromePicker
                    color={ACKColor}
                    onChangeComplete={(color) =>
                      this.setState({ ACKColor: color.hex })
                    }
                  />
                  <br />
                </Fragment>
              ) : null}

              <Button
                className="BtnOfOptn"
                variant="outline-light"
                onClick={() => {
                  if (window.localStorage.getItem("BGC-ACK")) {
                    document.body.style.backgroundColor = "#212121";
                    window.localStorage.removeItem("BGC-ACK");
                    this.setState({ ShowColorPicker });
                    return;
                  }
                  if (ACKColor) {
                    document.body.style.backgroundColor = ACKColor;
                    window.localStorage.setItem("BGC-ACK", ACKColor);
                    this.setState({ ShowColorPicker });
                    return;
                  }
                  this.setState({ ShowColorPicker: !ShowColorPicker });
                }}
              >
                {window.localStorage.getItem("BGC-ACK") ? (
                  <Fragment>
                    <span className="far fa-times-circle"></span> Annuler
                  </Fragment>
                ) : ACKColor ? (
                  <Fragment>
                    <span className="fas fa-check"></span> Valider
                  </Fragment>
                ) : (
                  "Changer la couleur"
                )}
              </Button>

              <div className="hrDiv"></div>
              <Button
                className="BtnOfOptn"
                variant={
                  !ParamsOptn || !ParamsOptn?.NotifState
                    ? "outline-info"
                    : "outline-warning"
                }
                onClick={() =>
                  this.updateValue(`${Pseudo}/ParamsOptn`, {
                    NotifState: !ParamsOptn?.NotifState ? true : false,
                  })
                }
              >
                {!ParamsOptn?.NotifState ? (
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
                className="BtnOfOptn"
                variant="outline-light"
                onClick={() =>
                  this.updateValue(`${Pseudo}/ParamsOptn`, {
                    MyAnimRandom: !ParamsOptn?.MyAnimRandom ? true : false,
                  })
                }
              >
                <span className="fas fa-dice"></span> Mélange de la liste
                d'anime:{" "}
                {ParamsOptn?.MyAnimRandom === false
                  ? "Off"
                  : !ParamsOptn?.MyAnimRandom
                  ? "On (par défaut)"
                  : "On"}
              </Button>
              <Button
                className="BtnOfOptn"
                variant="outline-light"
                onClick={() =>
                  this.updateValue(`${Pseudo}/ParamsOptn`, {
                    Shortcut: !ParamsOptn?.Shortcut ? true : false,
                  })
                }
              >
                <span className="fas fa-keyboard"></span> Raccourci clavier:{" "}
                {ParamsOptn?.Shortcut === false
                  ? "Off"
                  : !ParamsOptn?.Shortcut
                  ? "On (par défaut)"
                  : "On"}
              </Button>
              <Button
                className="BtnOfOptn"
                variant="outline-light"
                onClick={() =>
                  this.updateValue(`${Pseudo}/ParamsOptn`, {
                    SmartRepere: !ParamsOptn?.SmartRepere ? true : false,
                  })
                }
              >
                <span className="fas fa-eye"></span> Progression intelligente:{" "}
                {ParamsOptn?.SmartRepere === false
                  ? "Off"
                  : !ParamsOptn?.SmartRepere
                  ? "On (par défaut)"
                  : "On"}
              </Button>
              <Form>
                <Form.Group controlId="animeAcueill">
                  <Form.Control
                    value={
                      ParamsOptn?.TypeAnimeHomePage
                        ? ParamsOptn?.TypeAnimeHomePage
                        : "NotFinished"
                    }
                    onChange={(event) => {
                      this.updateValue(`${Pseudo}/ParamsOptn`, {
                        TypeAnimeHomePage: event.target.value,
                      });
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
                    block
                  >
                    <option value="NotFinished">
                      Page d'accueil sur tes animes En Cours
                      {!ParamsOptn?.TypeAnimeHomePage ? " (par défaut)" : null}
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
                    <option value="ByFilm">Page d'accueil sur tes films</option>
                    <option value="fav">
                      Page d'accueil sur tes animes Favoris
                    </option>
                    <option value="All">
                      Page d'accueil sur Tous tes animes
                    </option>
                  </Form.Control>
                </Form.Group>
              </Form>
            </aside>
            <aside id="User">
              <h3>Utilisateur (Données):</h3>
              <h4>
                T'es Template d'anime{" "}
                <Button
                  variant="outline-primary"
                  style={{ width: "38px" }}
                  onClick={() => {
                    this.setState({
                      IndexForTemplateAnim:
                        TemplateAnime.length - 1 === IndexForTemplateAnim
                          ? 0
                          : IndexForTemplateAnim + 1,
                    });
                  }}
                >
                  <span className="fas fa-long-arrow-alt-right"></span>
                </Button>
              </h4>
              <div id="TemplateAnimContainer">
                {typeof TemplateAnime === "string"
                  ? TemplateAnime
                  : TemplateAnime[IndexForTemplateAnim]}
              </div>
              <div className="hrDiv"></div>
              <CountrySelect
                value={Country}
                onChange={(country) => {
                  if (country !== null) {
                    this.updateValue(`${Pseudo}/ParamsOptn`, {
                      Country: country,
                    });
                  }
                  this.setState({ Country: country });
                }}
                countries={CountryJSON}
                valueAs="id"
                noMatchesText="Ce pays n'existe pas. Le créas-tu ?"
                flush={false}
                flags={true}
                placeholder="Type or select country"
              />
              <br />
              <ul style={{ listStyle: "none", fontSize: "20px" }}>
                <li>
                  <span style={{ textDecoration: "underline", color: "#ddd" }}>
                    Identifiant:
                  </span>{" "}
                  {Pseudo}
                </li>
                <li>
                  <span style={{ textDecoration: "underline", color: "#ddd" }}>
                    Numéros de Téléphone:
                  </span>{" "}
                  {firebase.auth().currentUser.phoneNumber}
                </li>
              </ul>
              <Button
                className="BtnOfOptn"
                variant="outline-primary"
                disabled={OfflineMode}
                onClick={() => this.setState({ ShowModalChangePseudo: true })}
              >
                <span className="fas fa-user"></span> Changer De Pseudo
              </Button>
              <Button
                className="BtnOfOptn"
                variant="outline-dark"
                disabled={OfflineMode}
                style={{ color: "#ddd" }}
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
                className="BtnOfOptn"
                variant="outline-danger"
                disabled={OfflineMode}
                onClick={() => this.setState({ ShowModalDeleteUser: true })}
              >
                <span className="fas fa-user-times"></span> Supprimer le compte
              </Button>
            </aside>
            <aside id="About">
              <h3>A Propos:</h3>
              <ul>
                <li>
                  <span style={{ textDecoration: "underline", color: "#ddd" }}>
                    Version ACK:
                  </span>{" "}
                  Stable (LTS)<b>1</b>β<b>13</b> (F1)
                </li>
                <li>
                  <span style={{ textDecoration: "underline", color: "#ddd" }}>
                    Version MCK:
                  </span>{" "}
                  β<b>3</b>
                </li>
                <li>
                  <span style={{ textDecoration: "underline", color: "#ddd" }}>
                    Project Version:
                  </span>{" "}
                  Stable (LTS)<b>1.9</b>
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
              {Object.keys(ConnectionInfo) === 0 ? null : (
                <Fragment>
                  <h5>Session Actuelle</h5>
                  <ul>
                    {!ConnectionInfo.TypeTechno ? null : (
                      <li>
                        <span
                          style={{ textDecoration: "underline", color: "#ddd" }}
                        >
                          Type de connexion:
                        </span>{" "}
                        {ConnectionInfo.TypeTechno}
                      </li>
                    )}
                    <li>
                      <span
                        style={{ textDecoration: "underline", color: "#ddd" }}
                      >
                        Vitesse:
                      </span>{" "}
                      Connexion équivalente à de la {ConnectionInfo.Type} (
                      {ConnectionInfo.Speed} Mbps)
                    </li>
                    <li>
                      <span
                        style={{ textDecoration: "underline", color: "#ddd" }}
                      >
                        Demande de réduction de consommation:
                      </span>{" "}
                      {ConnectionInfo.RecudeConsommation
                        ? "Réduction de données actif."
                        : "Aucune demande"}
                    </li>
                  </ul>
                </Fragment>
              )}
              <h5>Développeur</h5>
              <ul>
                <li>
                  <span style={{ textDecoration: "underline", color: "#ddd" }}>
                    Pseudo:
                  </span>{" "}
                  Ilingu
                </li>
                <li>
                  <span style={{ textDecoration: "underline", color: "#ddd" }}>
                    Email:
                  </span>{" "}
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
            <Button
              variant="danger"
              onClick={async () => {
                this.cancelState();
                if (OfflineMode) return;
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

                Store.forEach((req) => req.clear());

                // Delete Data And User
                this.deleteValue(`/${Pseudo}`, () => {
                  this.setState({
                    ResText: "Suppression du compte en cours...",
                    typeAlert: "info",
                  });
                  firebase
                    .auth()
                    .currentUser.delete()
                    .then(() => {
                      console.log("Successfully Remove Account !");
                      this.setState({ RedirectHome: "/notifuser/6" });
                    })
                    .catch((err) => {
                      console.error(`Failed to Delete Account`, err);
                      this.setState({
                        ResText:
                          "Impossible de supprimer votre compte. Réessayer ultérieurement.",
                        typeAlert: "danger",
                      });
                      setTimeout(() => {
                        this.setState({
                          ResText: null,
                          typeAlert: null,
                        });
                      }, 6000);
                    });
                });
              }}
            >
              Supprimer ce compte
            </Button>
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

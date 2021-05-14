import React, { useState, useEffect, useCallback } from "react";
import { Link, useHistory } from "react-router-dom";
// Components
import Scans from "../dyna/Watch/Scans";
import VolumesCO from "../dyna/Watch/Volumes";
// CSS
import { Spinner, Button, Modal, Form } from "react-bootstrap";
// DB
import base from "../../db/base";
import firebase from "firebase/app";

let setIntervalVar = null;
let DataBaseWS = null;
let connectedRef = null;

const WatchManga = (props) => {
  /* DefinedState */
  const [state, setRealState] = useState({
    // Firebase
    Pseudo: props.match.params.pseudo,
    uid: null,
    proprio: null,
    id: props.match.params.id,
    type: null,
    MangaToWatch: {},
    // Render
    RefreshRenderVolumes: true,
    RefreshRenderScans: true,
    RenderVolumesSaved: [],
    RenderScansSaved: [],
    // App
    RedirectHome: [false, ""],
    isFirstTime: true,
    LastFinished: 0,
    LoadingMode: true,
    LoadingModeAuth: true,
    // Form
    Scan: NaN,
    Volumes: [NaN, NaN],
    // Modal
    ShowModalAddScan: false,
    ShowModalVerification: [false, null],
  });
  const setState = useCallback((data) => {
    setRealState((prevState) => {
      return {
        ...prevState,
        ...data,
      };
    });
  }, []);
  /* Var State */
  const {
    Pseudo,
    uid,
    proprio,
    MangaToWatch,
    RedirectHome,
    LoadingMode,
    id,
    ShowModalAddScan,
    type,
    Scan,
    isFirstTime,
    RenderVolumesSaved,
    RenderScansSaved,
    Volumes,
    ShowModalVerification,
    LastFinished,
    RefreshRenderVolumes,
    RefreshRenderScans,
    LoadingModeAuth,
  } = state;
  /* Hooks */
  let History = useHistory();
  /* componentDidMount */
  useEffect(() => {
    // UpdateState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [LastFinished, isFirstTime, setState, state.Pseudo, state.id]);
  useEffect(() => {
    // DidMount
    if (
      state.Pseudo !== JSON.parse(window.localStorage.getItem("Pseudo")) ||
      !state.Pseudo
    ) {
      setState({ uid: null, RedirectHome: [true, "/notifuser/2"] });
      return;
    }
    if (state.id) {
      if (
        state.id.split("-")[0] !== "scan" &&
        state.id.split("-")[0] !== "volume"
      ) {
        setState({ uid: null, RedirectHome: [true, "/notifuser/11"] });
        return;
      } else {
        setState({ type: state.id.split("-")[0] });
      }
    } else {
      setState({ uid: null, RedirectHome: [true, "/notifuser/10"] });
      return;
    }
    /* FB Conn */
    if (state.Pseudo) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          handleAuth({ user });
        }
      });
    }
    /* WS */
    ActiveWebSockets();
    /* Color */
    if (window.localStorage.getItem("BGC-ACK")) {
      document.body.style.backgroundColor =
        window.localStorage.getItem("BGC-ACK");
    }
    // WillUnMount
    return () => {
      console.log("GEGEG");
      if (DataBaseWS) DataBaseWS.off("value");
      if (connectedRef) connectedRef.off("value");
      DataBaseWS = connectedRef = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* FN */
  const ActiveWebSockets = useCallback(() => {
    // WS
    DataBaseWS = firebase.database().ref(`${Pseudo}/manga/0/${id}`);
    DataBaseWS.on("value", (snap) => {
      const NewData = snap.val();
      if (!NewData) return setState({ RedirectHome: [true, "/notifuser/12"] });
      refreshMangaToWatch(NewData);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Pseudo, id, setState]);
  // Connection
  const handleAuth = useCallback(
    async (authData) => {
      const box = await base.fetch(state.Pseudo, { context: {} });
      connectedRef = firebase.database().ref(".info/connected");

      if (!box.proprio) {
        await base.post(`${state.Pseudo}/proprio`, {
          data: authData.user.uid,
        });
      }

      // Verified listener Conn
      connectedRef.on("value", (snap) => {
        if (snap.val() === true) {
          // Fast Loading Anime before FnRefresh
          // Reconected
          if (setIntervalVar !== null) {
            clearInterval(setIntervalVar);
            console.warn("Firebase Connexion retablished");
          }
        } else {
          reconectFirebase();
          console.warn(
            "Firebase Connexion Disconnected\n\tReconnect to Firebase..."
          );
        }
      });
      setState({
        uid: authData.user.uid,
        proprio: box.proprio || authData.user.uid,
        LoadingModeAuth: false,
      });
      refreshMangaToWatch();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setState, state.Pseudo]
  );
  const reAuth = useCallback(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        handleAuth({ user });
      }
    });
  }, [handleAuth]);
  const reconectFirebase = useCallback(() => {
    let i = 0;
    setIntervalVar = setInterval(() => {
      if (i === 5) reAuth();
      // Allow Vpn
      window.localStorage.removeItem("firebase:previous_websocket_failure");
      i++;
    }, 1000);
  }, [reAuth]);
  // RefreshData
  const refreshMangaToWatch = useCallback(
    async (WSData = null) => {
      try {
        const MangaToWatch =
          WSData !== null
            ? WSData
            : await base.fetch(`${Pseudo}/manga/0/${id}`, {
                context: {},
              });

        document.title = `MCK:${MangaToWatch.name}`;
        setState({
          MangaToWatch,
          LoadingMode: false,
          RefreshRenderVolumes: true,
          RefreshRenderScans: true,
        });
      } catch (err) {
        console.error(err);
      }
    },
    [Pseudo, id, setState]
  );
  // FireBase
  const UpdateValue = useCallback((path, value) => {
    base
      .update(path, {
        data: value,
      })
      .catch((err) => console.error(err));
  }, []);
  const DeleteValue = useCallback((path) => {
    base.remove(path).catch(console.error);
  }, []);
  // App
  const handleAlleger = useCallback(() => {
    UpdateValue(`${Pseudo}/manga/0/${id}`, {
      Scans: null,
    });
    setState({ ShowModalVerification: [false, null] });
  }, [Pseudo, UpdateValue, id, setState]);

  const handleDelete = useCallback(() => {
    DeleteValue(`${Pseudo}/manga/0/${id}`);
    setState({ RedirectHome: [true, "/notifuser/5"] });
  }, [DeleteValue, Pseudo, id, setState]);

  const addVolumeScan = useCallback(() => {
    if (type === "volume") {
      if (isNaN(Volumes[0]) || isNaN(Volumes[1])) return;
      let VolToAdd = [],
        ScansToAdd = [];
      for (let i = 0; i < Volumes[1]; i++) {
        ScansToAdd = [...ScansToAdd, false];
      }
      for (let i = 0; i < Volumes[0]; i++) {
        VolToAdd = [
          ...VolToAdd,
          {
            volumeId: MangaToWatch?.Scans
              ? MangaToWatch.Scans.length + i + 1
              : i + 1,
            finished: false,
            Scans: ScansToAdd,
          },
        ];
      }
      const Scans = [
        ...(MangaToWatch?.Scans ? MangaToWatch.Scans : []),
        ...VolToAdd,
      ];

      UpdateValue(`${Pseudo}/manga/0/${id}`, { Scans, finished: false });
    } else {
      if (isNaN(Scan)) return;
      let ScansToAdd = [];
      for (let i = 0; i < Scan; i++) {
        ScansToAdd = [...ScansToAdd, false];
      }
      const Scans = [
        ...(MangaToWatch?.Scans ? MangaToWatch.Scans : []),
        ...ScansToAdd,
      ];
      UpdateValue(`${Pseudo}/manga/0/${id}`, { Scans, finished: false });
    }
    setState({ ShowModalAddScan: false, Scan: NaN });
  }, [
    type,
    setState,
    Volumes,
    Scan,
    MangaToWatch.Scans,
    UpdateValue,
    Pseudo,
    id,
  ]);

  const FinishedScan = useCallback(
    (scanID, volumeID) => {
      if (type === "volume") {
        const Scans = { ...MangaToWatch };
        if (
          scanID === Scans.Scans[volumeID].Scans.length &&
          Scans.Scans[volumeID].finished === false &&
          Scans.Scans[volumeID].volumeId === Scans.Scans.length &&
          MangaToWatch.finished === false
        ) {
          Scans.Scans[volumeID].finished = !Scans.Scans[volumeID].finished;
          Scans.Scans[volumeID].Scans[scanID - 1] =
            !Scans.Scans[volumeID].Scans[scanID - 1];

          UpdateValue(`${Pseudo}/manga/0/${id}`, {
            finished: true,
            Scans: Scans.Scans,
          });
          return;
        }

        if (
          scanID === Scans.Scans[volumeID].Scans.length &&
          Scans.Scans[volumeID].finished === false
        ) {
          Scans.Scans[volumeID].finished = !Scans.Scans[volumeID].finished;
          Scans.Scans[volumeID].Scans[scanID - 1] =
            !Scans.Scans[volumeID].Scans[scanID - 1];

          UpdateValue(`${Pseudo}/manga/0/${id}`, {
            Scans: Scans.Scans,
          });
          return;
        }
        Scans.Scans[volumeID].Scans[scanID - 1] =
          !Scans.Scans[volumeID].Scans[scanID - 1];
        UpdateValue(`${Pseudo}/manga/0/${id}`, {
          Scans: Scans.Scans,
        });
        return;
      }

      const Scans = [...MangaToWatch.Scans];
      Scans[scanID - 1] = !Scans[scanID - 1];
      if (scanID === Scans.length && !Scans[scanID - 1] === false) {
        UpdateValue(`${Pseudo}/manga/0/${id}`, {
          finished: true,
          Scans,
        });
        return;
      }
      UpdateValue(`${Pseudo}/manga/0/${id}`, {
        Scans,
      });
    },
    [MangaToWatch, Pseudo, UpdateValue, id, type]
  );

  /* Render */
  if (!Pseudo || typeof Pseudo !== "string") History.push("/notifuser/2");
  if (RedirectHome[0]) History.push(RedirectHome[1]);

  if (LoadingMode || LoadingModeAuth)
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Spinner animation="border" variant="warning" />
      </div>
    );

  if (uid !== proprio || !uid || !proprio) History.push("/notifuser/3");

  if (id === null) {
    History.push("/notifuser/4");
  }
  if (isFirstTime) {
    setState({ isFirstTime: false });
    History.push("/WatchManga");
  }

  if (
    MangaToWatch?.Scans &&
    MangaToWatch?.Scans.length !== 0 &&
    type === "volume" &&
    RefreshRenderVolumes
  ) {
    let LastFinished = [false, 0];
    const RenderVolumes = MangaToWatch.Scans.map((obj, i) => {
      if (!obj.finished && !LastFinished[0]) {
        LastFinished = [true, obj.volumeId];
      }

      return <VolumesCO key={i} objData={obj} FinishedScan={FinishedScan} />;
    });

    setState({
      LastFinished: LastFinished[1],
      RefreshRenderVolumes: false,
      RenderVolumesSaved: RenderVolumes,
    });
  } else if (type === "volume") {
    if (document.getElementById(`VM-${LastFinished}`)) {
      document.getElementById(`VM-${LastFinished}`).scrollIntoView();
    }
  }

  if (
    MangaToWatch?.Scans &&
    MangaToWatch?.Scans.length !== 0 &&
    type === "scan" &&
    RefreshRenderScans
  ) {
    let LastFinished = [false, 0];
    const RenderScans = MangaToWatch.Scans.map((finished, i) => {
      if (!finished && !LastFinished[0]) {
        LastFinished = [true, i];
      }

      return (
        <Scans
          key={i}
          id={i + 1}
          finished={finished}
          FinishedScan={FinishedScan}
          NextScan={
            LastFinished[0] && LastFinished[1] === 0 && i === 0
              ? true
              : LastFinished[0] &&
                i === LastFinished[1] &&
                LastFinished[1] !== 0
              ? true
              : false
          }
        />
      );
    });

    setState({
      RefreshRenderScans: false,
      LastFinished: LastFinished[1] + 1,
      RenderScansSaved: RenderScans,
    });
  } else if (type === "scan") {
    if (document.getElementById(`SM-${LastFinished}`)) {
      document.getElementById(`SM-${LastFinished}`).scrollIntoView();
    }
  }

  return (
    <section id="WatchManga">
      <aside id="infoManga">
        <Link push="true" to="/">
          <Button className="btnBackDesing">
            <span className="fas fa-arrow-left"></span>
          </Button>
        </Link>
        <header>
          <h2>{MangaToWatch.name}</h2>
          <img
            draggable="false"
            src={MangaToWatch.imageUrl}
            alt="MangaPoster"
          />
        </header>
        <div
          id="actionsManga"
          ref={(el) => {
            try {
              el.style.setProperty(
                "--sizeManga",
                `${
                  document
                    .querySelector("#infoManga")
                    .children[0].getBoundingClientRect().width
                }px`
              );
            } catch (err) {}
          }}
        >
          <hr />
          <Link push="true" to="/">
            <Button variant="outline-primary" block>
              <span className="fas fa-arrow-left"></span> Retour
            </Button>
          </Link>
          <Button
            variant="outline-success"
            block
            onClick={() => setState({ ShowModalAddScan: true })}
          >
            <span className="fas fa-plus"></span> Ajouter{" "}
            {type === "volume" ? "volumes" : "scans"}
          </Button>
          <Button
            variant="outline-warning"
            onClick={() =>
              setState({ ShowModalVerification: [true, "alleger"] })
            }
            block
          >
            <span className="fas fa-file-archive"></span> Alléger
          </Button>
          <Button
            variant="danger"
            onClick={() =>
              setState({ ShowModalVerification: [true, "supprimer"] })
            }
            block
          >
            <span className="fas fa-trash-alt"></span> Supprimer
          </Button>
        </div>
      </aside>
      <aside id="readManga">
        <aside
          id="MangaScansContainer"
          className={type === "volume" ? "VolumeType" : null}
        >
          {type === "volume" ? RenderVolumesSaved : RenderScansSaved}
        </aside>
      </aside>

      {/* MODAL */}
      <Modal
        show={ShowModalVerification[0]}
        size="lg"
        onHide={() =>
          setState({
            ShowModalVerification: [false, null],
          })
        }
      >
        <Modal.Header id="ModalTitle" closeButton>
          <Modal.Title
            style={{
              color:
                ShowModalVerification[1] === "alleger" ? "#ffc107" : "#dc3545",
            }}
          >
            Êtes-vous sûre de vouloir {ShowModalVerification[1]}{" "}
            {MangaToWatch.name} ?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id="ModalBody">
          En faisant ça {MangaToWatch.name}{" "}
          {ShowModalVerification[1] === "alleger"
            ? "ne sera pas supprimer mais il sera inaccessible: en gros vous le verez toujours dans votre liste de manga mais vous ne pourrez plus voir vos épisodes restant/saisons fini, Badges car ils seront supprimer (la note ne sera pas supprimer) vous ne pourrez plus modifier l'anime (mais vous pourrez toujours, réajouter des Saison et Episode (depuis le début donc pensé à réajouter tous les saison que vous avez déjà vu), changer sa note et le supprimer que depuis la page global (la où il y a tout les mangas)). Le manga sera là en temps que déco, pour dire 'ba voilà j'ai la preuve d'avoir fini ce manga (je vous conseille de la faire quand le manga n'aura pas de suite, où qu'une suite n'ai pas prévu de suite)."
            : "sera entièrement supprimer avec aucune possiblité de le récupérer, en gros il n'existera plus."}
        </Modal.Body>
        <Modal.Footer id="ModalFooter">
          <Button
            variant="secondary"
            onClick={() =>
              setState({
                ShowModalVerification: [false, null],
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
                ? handleAlleger()
                : handleDelete()
            }
          >
            {ShowModalVerification[1] === "alleger" ? "Alleger" : "Supprimer"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={ShowModalAddScan}
        onHide={() => setState({ ShowModalAddScan: false })}
      >
        <Modal.Header id="ModalTitle" closeButton>
          <Modal.Title>
            Ajouter des {type === "volume" ? "volumes" : "scans"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body id="ModalBody">
          <Form>
            {type === "volume" ? (
              <Form.Group controlId="volume">
                <Form.Label>Nombres de Tomes</Form.Label>
                <Form.Control
                  type="number"
                  value={Volumes[0].toString()}
                  min="1"
                  placeholder="34"
                  autoComplete="off"
                  onChange={(event) => {
                    const value = parseInt(event.target.value);
                    if (value < 1) return;
                    setState({ Volumes: [value, Volumes[1]] });
                  }}
                />
                <Form.Label>Nombres de Chapitres par Tome</Form.Label>
                <Form.Control
                  type="number"
                  value={Volumes[1].toString()}
                  min="1"
                  placeholder="4"
                  autoComplete="off"
                  onChange={(event) => {
                    const value = parseInt(event.target.value);
                    if (value < 1) return;
                    setState({ Volumes: [Volumes[0], value] });
                  }}
                />
              </Form.Group>
            ) : (
              <Form.Group controlId="scan">
                <Form.Label>Nombres de Scans</Form.Label>
                <Form.Control
                  type="number"
                  value={Scan.toString()}
                  min="1"
                  placeholder="139"
                  autoComplete="off"
                  onChange={(event) => {
                    const value = parseInt(event.target.value);

                    if (value < 1) return;
                    setState({ Scan: value });
                  }}
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer id="ModalFooter">
          <Button
            variant="secondary"
            onClick={() => setState({ ShowModalAddScan: false })}
          >
            <span className="fas fa-window-close"></span> Annuler
          </Button>
          <Button variant="success" onClick={addVolumeScan}>
            <span className="fas fa-check"></span> Ajouter
          </Button>
        </Modal.Footer>
      </Modal>
    </section>
  );
};

export default WatchManga;

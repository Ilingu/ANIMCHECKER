import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
// CSS
import { Spinner, Button } from "react-bootstrap";
// DB
import base from "../../db/base";
import firebase from "firebase/app";

let setIntervalVar = null;
let DataBaseWS = null;
let connectedRef = null;

const WatchManga = (props) => {
  const isMountedComponent = useRef(true);
  /* DefinedState */
  const [state, setRealState] = useState({
    // Firebase
    Pseudo: props.match.params.pseudo,
    uid: null,
    proprio: null,
    id: props.match.params.id,
    type: null,
    MangaToWatch: {},
    RenderVolumesSaved: [],
    RenderScansSaved: [],
    RefreshRenderVolumes: true,
    RefreshRenderScans: true,
    // App
    RedirectHome: [false, ""],
    isFirstTime: true,
    LoadingMode: true,
    LoadingModeAuth: true,
  });
  const setState = useCallback((data) => {
    setRealState((prevState) => {
      return {
        ...prevState,
        ...data,
      };
    });
  }, []);
  /* Hooks */
  let History = useHistory();
  /* componentDidMount */
  useEffect(() => {
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
    if (state.Pseudo && isMountedComponent.current) {
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
      isMountedComponent.current = false;
      if (DataBaseWS) DataBaseWS.off("value");
      if (connectedRef) connectedRef.off("value");
      DataBaseWS = connectedRef = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.Pseudo, state.id]);
  /* FN */
  const ActiveWebSockets = useCallback(() => {
    // WS
    const { Pseudo, id } = state;
    DataBaseWS = firebase.database().ref(`${Pseudo}/manga/0/${id}`);
    DataBaseWS.on("value", (snap) => {
      const NewData = snap.val();
      refreshMangaToWatch(NewData);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
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
    [state.Pseudo]
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
      const { Pseudo, id } = state;
      try {
        const MangaToWatch =
          WSData !== null
            ? WSData
            : await base.fetch(`${Pseudo}/manga/0/${id}`, {
                context: this,
              });

        document.title = `MCK:${MangaToWatch.name}`;
        if (isMountedComponent.current)
          setState({ MangaToWatch, LoadingMode: false });
      } catch (err) {
        console.error(err);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state]
  );
  // FireBase
  const AddValue = useCallback(
    (path, value) => {
      base
        .post(path, {
          data: value,
        })
        .then(refreshMangaToWatch)
        .catch(console.error);
    },
    [refreshMangaToWatch]
  );
  const UpdateValue = useCallback(
    (path, value) => {
      base
        .update(path, {
          data: value,
        })
        .then(refreshMangaToWatch)
        .catch((err) => console.error(err));
    },
    [refreshMangaToWatch]
  );
  const DeleteValue = useCallback(
    (path) => {
      base.remove(path).then(refreshMangaToWatch).catch(console.error);
    },
    [refreshMangaToWatch]
  );

  /* Render */
  const {
    Pseudo,
    uid,
    proprio,
    MangaToWatch,
    RedirectHome,
    LoadingMode,
    id,
    type,
    isFirstTime,
    RenderVolumesSaved,
    RenderScansSaved,
    RefreshRenderVolumes,
    RefreshRenderScans,
    LoadingModeAuth,
  } = state;
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
  // if (isFirstTime) {
  //   setState({ isFirstTime: false });
  //   History.push("/WatchManga");
  // }

  if (
    MangaToWatch?.Scans &&
    MangaToWatch?.Scans.length !== 0 &&
    type === "volume" &&
    RefreshRenderVolumes
  ) {
    let RenderVolumes = MangaToWatch.Scans.map((key, i) => {});
    setState({
      RefreshRenderVolumes: false,
      RenderVolumesSaved: RenderVolumes,
    });
  }

  if (
    MangaToWatch?.Scans &&
    MangaToWatch?.Scans.length !== 0 &&
    type === "scan" &&
    RefreshRenderScans
  ) {
    let RenderScans = MangaToWatch.Scans.map((key, i) => {});
    setState({ RefreshRenderScans: false, RenderScansSaved: RenderScans });
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
          <Button variant="outline-success" block>
            <span className="fas fa-plus"></span> Ajouter{" "}
            {type === "volume" ? "volumes" : "scans"}
          </Button>
          <Button variant="outline-secondary" block>
            <span className="fas fa-eye"></span> Load All
          </Button>
          <Button variant="outline-warning" block>
            <span className="fas fa-file-archive"></span> Alléger
          </Button>
          <Button variant="danger" block>
            <span className="fas fa-trash-alt"></span> Supprimer
          </Button>
        </div>
      </aside>
      <aside id="readManga">
        <header>
          <Button variant="secondary">
            Load More <span className="fas fa-eye"></span>
          </Button>
        </header>
        <aside id="MangaScansContainer"></aside>
        <footer>
          <Button variant="secondary">
            Load More <span className="fas fa-eye"></span>
          </Button>
        </footer>
      </aside>
    </section>
  );
};

export default WatchManga;

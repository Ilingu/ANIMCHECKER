import React, { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
// CSS
import {} from "react-bootstrap";
// DB
import base from "../db/base";
import firebase from "firebase/app";

let setIntervalVar = null;

const WatchManga = (props) => {
  /* DefinedState */
  const [state, setRealState] = useState({
    // Firebase
    Pseudo: props.match.params.pseudo,
    uid: null,
    proprio: null,
    id: props.match.params.id,
    MangaToWatch: {},
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.Pseudo, state.id]);
  /* FN */
  const ActiveWebSockets = useCallback(() => {
    // WS
    const { Pseudo, id } = state;
    const DataBaseWS = firebase.database().ref(`${Pseudo}/manga/0/${id}`);
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
      const connectedRef = firebase.database().ref(".info/connected");

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
    RedirectHome,
    LoadingMode,
    id,
    isFirstTime,
    LoadingModeAuth,
  } = state;
  if (!Pseudo || typeof Pseudo !== "string") History.push("/notifuser/2");
  if (RedirectHome[0]) History.push(RedirectHome[1]);

  if (LoadingMode || LoadingModeAuth) return <div></div>;

  if (uid !== proprio || !uid || !proprio) History.push("/notifuser/3");

  if (id === null) {
    History.push("/notifuser/4");
  }
  if (isFirstTime) {
    setState({ isFirstTime: false });
    History.push("/WatchManga");
  }

  return <section id="WatchManga"></section>;
};

export default WatchManga;

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
  // FireBase
  const [Pseudo, setPseudo] = useState(props.match.params.pseudo);
  const [Uid, setUid] = useState(null);
  const [proprio, setProprio] = useState(null);
  const [Id, setId] = useState(props.match.params.id);
  const [MangaToWatch, setMangaToWatch] = useState({});
  // App State
  const [RedirectHome, setRedirectHome] = useState([false, ""]);
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [LoadingMode, setLoadingMode] = useState(true);
  let History = useHistory();
  /* componentDidMount */
  useEffect(() => {
    if (
      Pseudo !== JSON.parse(window.localStorage.getItem("Pseudo")) ||
      !Pseudo
    ) {
      setRedirectHome([true, "/notifuser/2"]);
      setUid(null);
      return;
    }
    if (Id) {
      if (Id.split("-")[0] !== "scan" && Id.split("-")[0] !== "volume") {
        setRedirectHome([true, "/notifuser/11"]);
        setUid(null);
        return;
      }
    } else {
      setRedirectHome([true, "/notifuser/10"]);
      setUid(null);
      return;
    }
    /* FB Conn */
    if (Pseudo) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          handleAuth({ user });
        }
      });
    }
    /* Color */
    if (window.localStorage.getItem("BGC-ACK")) {
      document.body.style.backgroundColor =
        window.localStorage.getItem("BGC-ACK");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Pseudo, setRedirectHome, Id, setUid]);
  /* FN */
  // Connection
  const handleAuth = useCallback(
    async (authData) => {
      const box = await base.fetch(Pseudo, { context: {} });
      const connectedRef = firebase.database().ref(".info/connected");

      if (!box.proprio) {
        await base.post(`${Pseudo}/proprio`, {
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
      setUid(authData.user.uid);
      setProprio(box.proprio || authData.user.uid);
      refreshMangaToWatch();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [Pseudo]
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
  const refreshMangaToWatch = useCallback(async () => {
    try {
      const MangaToWatch = await base.fetch(`${Pseudo}/manga/0/${Id}`, {
        context: this,
      });
      if (MangaToWatch) {
        setMangaToWatch(MangaToWatch);
        setLoadingMode(false);
      }
    } catch (err) {
      console.error(err);
    }
  }, [Id, Pseudo]);
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
  if (!Pseudo || typeof Pseudo !== "string") History.push("/notifuser/2");
  if (RedirectHome[0]) History.push(RedirectHome[1]);
  if (LoadingMode) return <div></div>;

  if (Uid !== proprio) History.push("/notifuser/3");

  if (Id === null) {
    History.push("/notifuser/4");
  }
  if (isFirstTime) {
    setIsFirstTime(false);
    History.push("/WatchManga");
  }

  return <section id="WatchManga"></section>;
};

export default WatchManga;

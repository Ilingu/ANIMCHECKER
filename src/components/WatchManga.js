import React, { useState, useEffect, useRef } from "react";
import { Redirect, Link } from "react-router-dom";
// CSS
import { Button, Modal, Form, Dropdown, Badge } from "react-bootstrap";
// DB
import base from "../db/base";
import firebase from "firebase/app";

/* Global State */
const useRefState = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  return [stateRef.current, setState];
};

/* FN */
// FireBase
const AddValue = () => {};
const UpdateValue = () => {};
const DeleteValue = () => {};
// Connection
const handleAuth = () => {};
// RefreshVal

const WatchManga = (props) => {
  /* DefinedState */
  // FireBase
  const [Pseudo, setPseudo] = useRefState(props.match.params.pseudo);
  const [Uid, setUid] = useRefState(null);
  const [Id, setId] = useRefState(props.match.params.id);
  const [MangaToWatch, setMangaToWatch] = useRefState({});
  // App State
  const [RedirectHome, setRedirectHome] = useRefState([false, ""]);
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
    if (this.state.Pseudo && !this.state.OfflineMode) {
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
  }, [Pseudo, setRedirectHome, Id]);
  /* Render */
  if (RedirectHome[0]) return <Redirect to={RedirectHome[1]} />;
  return <div></div>;
};

export default WatchManga;

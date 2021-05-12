import React, { useState, useEffect, useRef } from "react";
import { Redirect, Link } from "react-router-dom";
// CSS
import { Button, Modal, Form, Dropdown, Badge } from "react-bootstrap";
// DB
import base from "../db/base";
import firebase from "firebase/app";

// Global State
const useRefState = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  return [stateRef, setState];
};

// FN
const AddValue = () => {};
const UpdateValue = () => {};
const DeleteValue = () => {};

const WatchManga = (props) => {
  /* DefinedState */
  const [Pseudo, setPseudo] = useRefState(props.match.params.pseudo);
  const [ID, setID] = useRefState(props.match.params.id);
  const [MangaToWatch, setMangaToWatch] = useRefState({});
  /* componentDidMount */
  useEffect(() => {
    if (Pseudo !== JSON.parse(window.localStorage.getItem("Pseudo"))) {
      return;
    }
  }, [Pseudo]);
  /* Render */
  return <div></div>;
};

export default WatchManga;

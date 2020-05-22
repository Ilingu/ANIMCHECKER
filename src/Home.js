import React, { Component } from "react";
import axios from "axios";
// Components
import Header from "./components/Header";
import Poster from "./components/dyna/PosterAnim";
// CSS
import { Modal, Button } from "react-bootstrap";
// DB
import base from "./db/base";

export default class Home extends Component {
  state = {
    Anim: {
      moovies: {},
      anims: {},
    },
    findAnim: [],
    ShowModal: false,
    animToDetails: null,
  };

  componentDidMount() {
    if (!this.props.store.getState() === true) {
      window.history.pushState("", "", "/");
      window.location.reload();
    } else {
      this.ref = base.syncState(`/Anim`, {
        context: this,
        state: "Anim",
      });
    }
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  SearchAnim = (name) => {
    let NameToSend = name;
    this.setState({ ShowModal: true });

    if (name.includes(" ")) {
      NameToSend = name
        .split("")
        .map((char) => (char === " " ? "%20" : char))
        .join("");
    }

    axios
      .get(`https://api.jikan.moe/v3/search/anime?q=${NameToSend}&limit=16`)
      .then((result) => {
        this.setState({ findAnim: result.data.results });
      })
      .catch((err) => console.error(err));
  };

  handleClick = (name) => {
    this.setState({ animToDetails: name });
  };

  render() {
    const { ShowModal, findAnim } = this.state;
    let animList = null;

    if (findAnim.length !== 0) {
      animList = findAnim.map((anim) => (
        <Poster
          key={Date.now() + (Math.random() * 100000 - Math.random() * -100000)}
          url={anim.image_url}
          score={anim.score}
          title={anim.title}
          type={anim.type}
          clicked={this.handleClick}
        />
      ));
    }

    return (
      <div className="container">
        <Header search={this.SearchAnim} />

        {/* MODAL */}
        <Modal
          show={ShowModal}
          onHide={() => this.setState({ ShowModal: false })}
        >
          <Modal.Header id="ModalTitle" closeButton>
            <Modal.Title>Animé(s) trouvé(s)</Modal.Title>
          </Modal.Header>
          <Modal.Body id="ModalBody">{animList}</Modal.Body>
          <Modal.Footer id="ModalFooter">
            <Button
              variant="secondary"
              onClick={() => this.setState({ ShowModal: false })}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

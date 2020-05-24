import React, { Component } from "react";
// CSS
import { Spinner } from "react-bootstrap";
// DB
import base from "../db/base";
import { Redirect } from "react-router-dom";

class Watch extends Component {
  state = {
    Anim: {},
    AnimToWatch: {},
    uid: null,
    id: null,
    isFirstTime: true,
  };

  componentDidMount() {
    this.ref = base.syncState(`/`, {
      context: this,
      state: "Anim",
    });

    this.setState({
      uid: this.props.match.params.uid,
      id: this.props.match.params.id,
    });
  }

  componentWillUnmount() {
    base.removeBinding(this.ref);
  }

  linkAnimToWatch() {
    const { id, Anim } = this.state;

    this.setState({ AnimToWatch: Anim[id.split("-")[0]][id] });
  }

  render() {
    const { Anim, AnimToWatch, uid, id, isFirstTime } = this.state;

    if (Anim.proprio) {
      if (Anim.proprio !== uid || !uid) {
        return <Redirect to="/" />;
      } else if (isFirstTime) {
        this.setState({ isFirstTime: false });
        this.linkAnimToWatch();
        return <Redirect to="/Watch" />;
      }
    } else {
      return <Spinner animation="border" variant="warning" />;
    }

    return (
      <section className="container" id="Watch">
        lolita
      </section>
    );
  }
}

export default Watch;

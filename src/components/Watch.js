import React, { Component } from "react";
// CSS
import {} from "react-bootstrap";
// DB
import base from "../db/base";

class Watch extends Component {
  state = {
    Anim: {},
  };

  componentDidMount() {
    if (
      !this.props.store.getState() === true &&
      window.location.pathname.split("/")[2] !== undefined
    ) {
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
  render() {
    return <div></div>;
  }
}

export default Watch;

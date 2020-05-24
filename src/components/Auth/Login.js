// React
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
// Redux
import { logIn } from "../../Redux/actions";
// CSS
import { Form, Button, Spinner, Alert } from "react-bootstrap";

export default class Login extends Component {
  state = {
    ResText: null,
    type: null,
  };

  render() {
    const { ResText, type, RedirectPath } = this.state;
    if (RedirectPath !== undefined) {
      return <Redirect to={RedirectPath} />;
    } else {
      return (
        <section className="container" id="Login">
          <header>
            <div className="return">
              {ResText === null && type === null ? null : (
                <Alert
                  variant={type}
                  onClose={() => this.setState({ ResText: null, type: null })}
                  dismissible
                >
                  <p>{ResText}</p>
                </Alert>
              )}
            </div>
          </header>
          <div className="login">
            Se connecter avec <span className="fas fa-google"></span>
          </div>
        </section>
      );
    }
  }
}

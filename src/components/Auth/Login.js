// React
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
// Redux
import { logIn } from "../../Redux/actions";
// CSS
import { Form, Button, Spinner, Alert } from "react-bootstrap";
// File
import DB from "./DB";

export default class Login extends Component {
  state = {
    Username: "",
    Password: "",
    Loading: false,
    ResText: null,
    type: null,
  };

  Login = (event) => {
    event.preventDefault();

    const { Username, Password } = this.state;
    this.setState({ Loading: true });

    if (
      Username !== undefined &&
      Username !== null &&
      typeof Username === "string" &&
      Username.trim().length !== 0 &&
      Username !== "" &&
      Password !== undefined &&
      Password !== null &&
      typeof Password === "string" &&
      Password.trim().length !== 0 &&
      Password !== ""
    ) {
      if (
        DB.name.toLocaleLowerCase() === Username.toLocaleLowerCase() &&
        // eslint-disable-next-line eqeqeq
        DB.password == Password
      ) {
        this.setState({
          ResText: "You're connected !",
          type: "success",
          Loading: false,
        });
        setTimeout(() => {
          this.props.store.dispatch(logIn(true));
          this.setState({
            RedirectPath: "/Home",
          });
        }, 1000);
      } else {
        this.setState({
          ResText: "Password or Username is incorrect\n Give a other shoot :/",
          type: "danger",
          Loading: false,
          Username: "",
          Password: "",
        });
      }
    } else {
      this.setState({
        ResText: "Vueillez remplir tous les champs et correctement",
        type: "danger",
        Loading: false,
        Username: "",
        Password: "",
      });
    }
  };

  render() {
    const {
      Username,
      Password,
      Loading,
      ResText,
      type,
      RedirectPath,
    } = this.state;
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
                  <Alert.Heading>
                    {type === "success" ? "GG !" : "Oh mince! Ta une erreur!"}
                  </Alert.Heading>
                  <p>{ResText}</p>
                </Alert>
              )}
            </div>
          </header>
          <div className="content">
            <Form>
              <Form.Group controlId="Username">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter Username"
                  autoComplete="off"
                  value={Username}
                  onChange={(event) =>
                    this.setState({ Username: event.target.value })
                  }
                />
              </Form.Group>

              <Form.Group controlId="formBasicPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Password"
                  autoComplete="off"
                  value={Password}
                  onChange={(event) =>
                    this.setState({ Password: event.target.value })
                  }
                />
              </Form.Group>
              <Button
                variant="primary"
                type="submit"
                block
                onClick={this.Login}
              >
                {Loading ? (
                  <Spinner animation="border" variant="warning" />
                ) : (
                  "Submit"
                )}
              </Button>
            </Form>
          </div>
        </section>
      );
    }
  }
}

// React
import React, { Fragment } from "react";
// CSS
import { Button, Form } from "react-bootstrap";

const Login = ({ authenticate, forForm, verificateCode }) => {
  let stepToShow = null;

  if (forForm[1] === 1) {
    stepToShow = (
      <Button onClick={authenticate} className="google-button">
        1. Envoyer le code
      </Button>
    );
  } else if (forForm[1] === 2) {
    stepToShow = (
      <Fragment>
        <Form>
          <Form.Group controlId="login">
            <Form.Control
              type="text"
              placeholder="2. Code reçu"
              autoComplete="off"
              value={forForm[0]}
              onChange={forForm[2]}
            />
          </Form.Group>
        </Form>
        <Button className="google-button" onClick={verificateCode}>
          3. Se Connecter
        </Button>
      </Fragment>
    );
  }

  return (
    <section className="container" id="login">
      {forForm[1] === 1 ? <div id="recaptcha-container"></div> : null}
      <h2>Connecte toi pour faire des list d'anime:</h2>
      {stepToShow}
    </section>
  );
};

export default Login;

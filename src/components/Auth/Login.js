// React
import React, { Fragment, useState } from "react";
// Design
import { Button, Form } from "react-bootstrap";

const Login = ({ forForm, verificateCode, SubmitLogin, resetPseudo }) => {
  const [NumTel, setNumTel] = useState("");

  let stepToShow = null;

  if (forForm[1] === 1) {
    stepToShow = (
      <Fragment>
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            if (
              NumTel !== undefined &&
              NumTel !== null &&
              typeof NumTel === "string" &&
              NumTel.trim().length !== 0 &&
              /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im.test(
                String(NumTel)
              )
            ) {
              SubmitLogin(NumTel.trim());
            }
          }}
        >
          <Form.Group controlId="login">
            <Form.Control
              type="tel"
              placeholder="1. Ton Numéro de téléphone"
              autoComplete="off"
              value={NumTel}
              onChange={(event) => setNumTel(event.target.value)}
            />
          </Form.Group>
          <Button type="submit" block className="google-button">
            2. Envoyer le code
          </Button>
        </Form>
      </Fragment>
    );
  } else if (forForm[1] === 2) {
    stepToShow = (
      <Fragment>
        <Form>
          <Form.Group controlId="login">
            <Form.Control
              type="text"
              placeholder="3. Code reçu"
              autoComplete="off"
              value={forForm[0]}
              onChange={forForm[2]}
            />
          </Form.Group>
        </Form>
        <Button className="google-button" block onClick={verificateCode}>
          4. Se Connecter
        </Button>
      </Fragment>
    );
  }

  return (
    <section className="loginForm">
      <Button variant="primary" onClick={resetPseudo} className="btnBackDesing">
        <span className="fas fa-arrow-left"></span> Retour (mon Pseudo est pas
        le bon)
      </Button>
      {forForm[1] === 1 ? <div id="recaptcha-container"></div> : null}
      <h2>Connecte toi pour faire des list d'anime:</h2>
      {stepToShow}
    </section>
  );
};

export default Login;

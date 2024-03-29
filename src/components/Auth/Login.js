// React
import React, { Fragment, useState } from "react";
// Design
import { Button, Form, Spinner } from "react-bootstrap";

const Login = ({
  UserOnLogin,
  forForm,
  verificateCode,
  SubmitLogin,
  resetPseudo,
  OfflineMode,
  JustDefined,
  ShowMessageHtml,
  ShowMessage,
  ResText,
  typeAlertMsg,
}) => {
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
              /^((\+)33|0|0033)[1-9](\d{2}){4}$/g.test(NumTel)
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
              required
              value={NumTel}
              onChange={(event) => {
                setNumTel(event.target.value);
              }}
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
        <Form onSubmit={verificateCode}>
          <Form.Group controlId="login">
            <Form.Control
              type="tel"
              placeholder="3. Code reçu"
              autoComplete="off"
              required
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
    <section id="loginForm">
      {UserOnLogin ? (
        <div id="OnUserLogin">
          <Spinner animation="grow" variant="success" />
          Connection à votre compte...
        </div>
      ) : (
        <Fragment>
          {JustDefined ? (
            <Button
              variant="primary"
              onClick={resetPseudo}
              className="btnBackDesing"
            >
              <span className="fas fa-arrow-left"></span> Retour (mon Pseudo est
              pas le bon)
            </Button>
          ) : null}
          <Button variant="danger" id="resetVpnBtn" onClick={OfflineMode}>
            <span className="fas fa-exclamation-triangle"></span> Mode hors
            ligne
          </Button>
          {forForm[1] === 1 ? <div id="recaptcha-container"></div> : null}
          <h2>Connecte toi pour faire des list d'anime:</h2>
          {stepToShow}
        </Fragment>
      )}

      {ShowMessageHtml ? (
        <div className={`ackmessage${ShowMessage ? " show" : " hide"}`}>
          <span
            className={`fas fa-${
              typeAlertMsg === "info"
                ? "info"
                : typeAlertMsg === "success"
                ? "check"
                : typeAlertMsg === "warn"
                ? "exclamation-triangle"
                : typeAlertMsg === "danger"
                ? "times-circle"
                : "info"
            }`}
          ></span>{" "}
          {ResText}
        </div>
      ) : null}
    </section>
  );
};

export default Login;

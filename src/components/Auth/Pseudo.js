import React, { useState } from "react";
// Design
import { Button, Form } from "react-bootstrap";

const Pseudo = ({
  Submit,
  ShowMessageHtml,
  ShowMessage,
  typeAlertMsg,
  ResText,
}) => {
  const [Pseudo, setPseudo] = useState("");

  return (
    <section id="loginForm">
      <h2>0. Identifiant</h2>
      <Form
        onSubmit={(event) => {
          event.preventDefault();
          if (
            Pseudo !== undefined &&
            Pseudo !== null &&
            typeof Pseudo === "string" &&
            Pseudo.trim().length !== 0 &&
            Pseudo !== ""
          ) {
            Submit(Pseudo);
          }
        }}
      >
        <Form.Group controlId="login">
          <Form.Control
            type="text"
            required
            placeholder="0. Identifiant de votre de compte"
            autoComplete="off"
            value={Pseudo}
            onChange={(event) => setPseudo(event.target.value)}
          />
        </Form.Group>
        <Button block type="submit" className="google-button">
          Suivant <span className="fas fa-arrow-right"></span>
        </Button>
      </Form>
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

export default Pseudo;

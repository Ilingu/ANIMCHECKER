import React, { useState } from "react";
// Design
import { Button, Form } from "react-bootstrap";

const Pseudo = ({ Submit }) => {
  const [Pseudo, setPseudo] = useState("");

  return (
    <section className="container" class="loginForm">
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
            class
            placeholder="0. Votre (nom de compte)"
            autoComplete="off"
            value={Pseudo}
            onChange={(event) => setPseudo(event.target.value)}
          />
        </Form.Group>
        <Button block type="submit" className="google-button">
          Suivant <span className="fas fa-arrow-right"></span>
        </Button>
      </Form>
    </section>
  );
};

export default Pseudo;

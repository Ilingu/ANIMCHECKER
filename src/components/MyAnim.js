import React, { Fragment } from "react";
// Components
import Header from "./Header";
// CSS
import { Nav, Form, Button, Alert } from "react-bootstrap";

const MyAnim = ({
  SwitchMyAnimVar,
  SwitchMyAnim,
  SwitchMyNextAnim,
  NextAnimChange,
  ResText,
  typeAlert,
  MyAnimList,
  NextAnim,
  MyNextAnimList,
  handleSubmit,
}) => {
  return (
    <div className="container">
      <Header />

      <section id="MyAnime">
        <header>
          <Nav fill variant="tabs">
            <Nav.Item>
              <Nav.Link
                eventKey="link-1"
                active={SwitchMyAnimVar}
                onClick={SwitchMyAnim}
              >
                My Anim
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="link-2"
                active={!SwitchMyAnimVar}
                onClick={SwitchMyNextAnim}
              >
                My next anim
              </Nav.Link>
            </Nav.Item>
          </Nav>
          <div className="return">
            {ResText === null && typeAlert === null ? null : (
              <Alert
                variant={typeAlert}
                onClose={() =>
                  this.setState({
                    ResText: null,
                    typeAlert: null,
                  })
                }
                dismissible
              >
                <p>{ResText}</p>
              </Alert>
            )}
          </div>
        </header>
        <div className={SwitchMyAnimVar ? "content" : "content none"}>
          {SwitchMyAnimVar ? (
            MyAnimList
          ) : (
            <Fragment>
              <header>
                <h4>Ici tu met les anime que tu veux regarder plus tard: </h4>
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="type">
                    <Form.Label>Le nom ton prochain anime: </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nom de cette anime"
                      autoComplete="off"
                      value={NextAnim}
                      onChange={NextAnimChange}
                    />
                  </Form.Group>
                  <Button variant="success" type="submit">
                    <span className="fas fa-plus"></span> Ajouter {}
                  </Button>
                </Form>
                <hr />
              </header>

              {MyNextAnimList}
            </Fragment>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyAnim;

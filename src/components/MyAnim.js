import React, { Fragment } from "react";
// Components
import Header from "./Header";
// CSS
import { Nav, Form, Button, Alert, Dropdown } from "react-bootstrap";

const MyAnim = ({
  SwitchMyAnimVar,
  SwitchMyAnim,
  SwitchMyNextAnim,
  NextAnimChange,
  ResText,
  LoadingMode,
  typeAlert,
  MyAnimList,
  NextAnim,
  MyNextAnimList,
  handleSubmit,
  onClose,
  SearchInAnimeListFn,
  ModeFindAnime,
  ModeFilter,
  NewFilter,
  CloseModeFindAnime,
}) => (
  <div className="container">
    <Header />

    {ModeFindAnime ? (
      <Button
        variant="outline-danger"
        onClick={() => CloseModeFindAnime()}
        style={{
          position: "absolute",
          left: "calc(50% - 100px)",
          borderRadius: "100px",
          zIndex: "50",
          top: "170px",
          width: "200px",
        }}
      >
        <span className="fas fa-times-circle"></span>
      </Button>
    ) : null}

    <section id="MyAnime">
      <header>
        <Nav fill variant="tabs">
          <Nav.Item>
            <div
              id="TabsHomeMade"
              className={SwitchMyAnimVar ? "active" : ""}
              onClick={ModeFindAnime ? null : SwitchMyAnim}
            >
              My Anim{" "}
              {SwitchMyAnimVar && !LoadingMode ? (
                <Fragment>
                  <Button
                    variant="link"
                    onClick={() => SearchInAnimeListFn(true)}
                  >
                    <span className="fas fa-search"></span>
                  </Button>
                  <Dropdown>
                    <Dropdown.Toggle
                      variant="link"
                      title="Filtre"
                      id="FilterBtn"
                    >
                      <span className="fas fa-filter"></span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        active={ModeFilter === "NotFinished" ? true : false}
                        onClick={() => {
                          if (ModeFilter === "NotFinished") return;
                          NewFilter("NotFinished");
                        }}
                      >
                        En Cours
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={ModeFilter === "seasonAnim" ? true : false}
                        onClick={() => {
                          if (ModeFilter === "seasonAnim") return;
                          NewFilter("seasonAnim");
                        }}
                      >
                        Anime de saison
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={ModeFilter === "Finished" ? true : false}
                        onClick={() => {
                          if (ModeFilter === "Finished") return;
                          NewFilter("Finished");
                        }}
                      >
                        Finis
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={ModeFilter === "Paused" ? true : false}
                        onClick={() => {
                          if (ModeFilter === "Paused") return;
                          NewFilter("Paused");
                        }}
                      >
                        Pause
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={ModeFilter === "Drop" ? true : false}
                        onClick={() => {
                          if (ModeFilter === "Drop") return;
                          NewFilter("Drop");
                        }}
                      >
                        Drop
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        active={ModeFilter === "Rate" ? true : false}
                        onClick={() => {
                          if (ModeFilter === "Rate") return;
                          NewFilter("Rate");
                        }}
                      >
                        Note
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={ModeFilter === "fav" ? true : false}
                        onClick={() => {
                          if (ModeFilter === "fav") return;
                          NewFilter("fav");
                        }}
                      >
                        Favoris
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item
                        active={ModeFilter === "All" ? true : false}
                        onClick={() => {
                          if (ModeFilter === "All") return;
                          NewFilter("All");
                        }}
                      >
                        Tous
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Fragment>
              ) : null}
            </div>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="link-2"
              active={!SwitchMyAnimVar}
              onClick={ModeFindAnime ? null : SwitchMyNextAnim}
            >
              My next anim{" "}
              {!SwitchMyAnimVar && !LoadingMode ? (
                <Button
                  variant="link"
                  onClick={() => SearchInAnimeListFn(false)}
                >
                  <span className="fas fa-search"></span>
                </Button>
              ) : null}
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <div id="returnAlert">
          {ResText !== null && typeAlert !== null ? (
            <Alert variant={typeAlert} onClose={onClose} dismissible>
              <p>{ResText}</p>
            </Alert>
          ) : null}
        </div>
      </header>
      <div
        id="ContentAnimeList"
        className={SwitchMyAnimVar ? "content" : "content none"}
      >
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
            <div className="NextAnimContainer">{MyNextAnimList}</div>
            <br />
          </Fragment>
        )}
      </div>
    </section>
  </div>
);

export default MyAnim;

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
  ModeDisplayNextAnim,
  ChangeModeDisplayNextAnim,
  NextAnim,
  MyNextAnimList,
  handleSubmit,
  onClose,
  SearchInAnimeListFn,
  ModeFindAnime,
  ModeFilter,
  NewFilter,
  CloseModeFindAnime,
  fnNextAnimForm,
  ModeImportant,
  Tag,
}) => {
  // Dyna Components
  let NbTemplate = [],
    NbFois = !ModeImportant ? 1 : ModeImportant;
  for (let i = 0; i < NbFois; i++) {
    NbTemplate = [
      ...NbTemplate,
      <span key={i} className="fas fa-exclamation"></span>,
    ];
  }

  // Render
  return (
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
                Mes Animes{" "}
                {SwitchMyAnimVar && !LoadingMode ? (
                  <Fragment>
                    <Button
                      variant="link"
                      aria-label="Button for search an anime in the list"
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
                          active={ModeFilter === "Finished" ? true : false}
                          onClick={() => {
                            if (ModeFilter === "Finished") return;
                            NewFilter("Finished");
                          }}
                        >
                          Finis
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
                        <Dropdown.Item
                          active={ModeFilter === "WaitAnim" ? true : false}
                          onClick={() => {
                            if (ModeFilter === "WaitAnim") return;
                            NewFilter("WaitAnim");
                          }}
                        >
                          Anime en attente
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
                My next anime{" "}
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
                      required
                      placeholder="Nom de l'anime"
                      autoComplete="off"
                      value={NextAnim}
                      onChange={NextAnimChange}
                    />
                  </Form.Group>
                  <div id="actionFormAddNA">
                    <Form.Control
                      type="text"
                      placeholder="Tag de l'anime séparée par une virgule (tag1,tag2,tag3...)"
                      autoComplete="off"
                      value={Tag}
                      onChange={fnNextAnimForm[1]}
                    />
                    <Dropdown>
                      <Dropdown.Toggle
                        variant={`outline-${
                          !ModeImportant
                            ? "secondary"
                            : ModeImportant === 1
                            ? "info"
                            : ModeImportant === 2
                            ? "warning"
                            : "danger"
                        }`}
                      >
                        {NbTemplate}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item style={{ "pointer-events": "none" }}>
                          Importance pour regarder l'anime ({NextAnim})
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item
                          onClick={() => fnNextAnimForm[0](0)}
                          style={{ color: "rgb(108, 117, 125)" }}
                          id="RepereImportantNextAnime"
                        >
                          Aucune Importance
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => fnNextAnimForm[0](1)}
                          style={{ color: "#4d8ccf" }}
                        >
                          <span className="fas fa-exclamation"></span> Faible
                          Importance
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => fnNextAnimForm[0](2)}
                          style={{ color: "rgb(255, 193, 7)" }}
                        >
                          <span className="fas fa-exclamation"></span>{" "}
                          <span className="fas fa-exclamation"></span>{" "}
                          Importance Moyenne
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => fnNextAnimForm[0](3)}
                          style={{ color: "#fb401f" }}
                        >
                          <span className="fas fa-exclamation"></span>{" "}
                          <span className="fas fa-exclamation"></span>{" "}
                          <span className="fas fa-exclamation"></span> Haute
                          Importance
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    <Button variant="success" type="submit">
                      <span className="fas fa-plus"></span> Ajouter {}
                    </Button>
                  </div>
                </Form>
                <hr />
                <Button
                  id="BtnModeDisplayNextAnim"
                  variant="outline-secondary"
                  onClick={() => ChangeModeDisplayNextAnim("Block")}
                >
                  <span className="fas fa-th-large"></span>
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => ChangeModeDisplayNextAnim("Lines")}
                >
                  <span className="fas fa-grip-lines"></span>
                </Button>
              </header>
              <div
                className={`NextAnimContainer${
                  !ModeDisplayNextAnim || ModeDisplayNextAnim === "Block"
                    ? " ModeBlock"
                    : ""
                }`}
              >
                {MyNextAnimList}
              </div>
              <br />
            </Fragment>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyAnim;

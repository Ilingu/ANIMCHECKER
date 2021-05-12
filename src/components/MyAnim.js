import React, { useEffect, Fragment } from "react";
// Components
import Header from "./Header";
// CSS
import { Form, Button, Alert, Dropdown } from "react-bootstrap";

const MyAnim = ({
  SwitchMyAnimVar,
  SwitchMyAnim,
  SwitchMyNextAnim,
  NextAnimChange,
  ResText,
  LoadingMode,
  OpenSearchFilter,
  SearchFilter,
  FnSearchFilter,
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
  IsShortcut,
}) => {
  useEffect(() => {
    // KeyShortcut
    document.onkeydown = null;
    if (!window.mobileAndTabletCheck()) {
      if (IsShortcut && document.onkeydown === null) {
        document.onkeydown = (keyDownEvent) => {
          if (keyDownEvent.repeat) return;
          if (document.body.contains(document.querySelector(".modal"))) return;
          if (keyDownEvent.key === "ArrowRight") {
            return SwitchMyNextAnim();
          }
          if (keyDownEvent.key === "ArrowLeft") return SwitchMyAnim();
        };
      }
      return;
    }
    // Mobile Swipe
    let touchstartX = 0,
      touchendX = 0;
    let touchstartY = 0,
      touchendY = 0;

    const gesuredZone = document.getElementById("ContentAnimeList");

    gesuredZone.addEventListener(
      "touchstart",
      function (event) {
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
      },
      false
    );

    gesuredZone.addEventListener(
      "touchend",
      function (event) {
        touchendX = event.changedTouches[0].screenX;
        touchendY = event.changedTouches[0].screenY;
        handleGesure();
      },
      false
    );

    function handleGesure() {
      if (
        touchstartX - touchendX >= window.innerWidth / 3 &&
        touchstartY - touchendY < window.innerHeight / 6
      ) {
        SwitchMyNextAnim(); // Left
      }
      if (
        touchendX - touchstartX >= window.innerWidth / 3 &&
        touchendY - touchstartY < window.innerHeight / 6
      ) {
        SwitchMyAnim(); // Right
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Dyna Components
  let NbTemplate = [],
    NbFois = !ModeImportant ? 1 : ModeImportant;
  if (!SwitchMyAnimVar) {
    for (let i = 0; i < NbFois; i++) {
      NbTemplate = [
        ...NbTemplate,
        <span key={i} className="fas fa-exclamation"></span>,
      ];
    }
  }

  // Render
  return (
    <div className="container">
      <Header SearchFilter={SearchFilter} FnSearchFilter={FnSearchFilter} />

      {OpenSearchFilter ? (
        <section id="SearchFilter">
          <ul>
            <li>
              Type:{" "}
              <Form.Control
                as="select"
                custom
                value={SearchFilter["type="]}
                onChange={(event) => {
                  if (event.target.value === "rien") FnSearchFilter[1]("type=");
                  else FnSearchFilter[0]("type=", event.target.value);
                }}
                placeholder="Le Type d'anime"
              >
                <option value="rien">
                  Ne pas prendre ce paramère en compte
                </option>
                <option value="tv">TV</option>
                <option value="ova">OVA</option>
                <option value="movie">Movie</option>
                <option value="special">Special</option>
                <option value="ona">ONA</option>
                <option value="music">Music</option>
              </Form.Control>
            </li>
            <li>
              Status:{" "}
              <Form.Control
                as="select"
                custom
                value={SearchFilter["status="]}
                onChange={(event) => {
                  if (event.target.value === "rien")
                    FnSearchFilter[1]("status=");
                  else FnSearchFilter[0]("status=", event.target.value);
                }}
                placeholder="Le status de l'anime"
              >
                <option value="rien">Rien - Le status de l'anime</option>
                <option value="airing">En cours de diffusion</option>
                <option value="completed">Fini</option>
                <option value="upcoming">A venir</option>
              </Form.Control>
            </li>
            <li>
              Âge:{" "}
              <Form.Control
                as="select"
                custom
                value={SearchFilter["rated="]}
                onChange={(event) => {
                  if (event.target.value === "rien")
                    FnSearchFilter[1]("rated=");
                  else FnSearchFilter[0]("rated=", event.target.value);
                }}
                placeholder="L'âge requis de l'anime"
              >
                <option value="rien">Rien - L'âge requis de l'anime</option>
                <option value="g">G: Tous âges</option>
                <option value="pg">PG: Enfant</option>
                <option value="pg13">PG13: Adolescent 13+</option>
                <option value="r17">
                  R17: 17+ recommandé (violence et insulte)
                </option>
                <option value="r">
                  R+: Nudité présente (peut aussi contenir violence et insulte)
                </option>
                <option value="rx">
                  RX: 18+ Hentai (Contenu sexuelle réserver aux majeurs)
                </option>
              </Form.Control>
            </li>
            <li>
              Trier par:{" "}
              <Form.Control
                as="select"
                custom
                value={SearchFilter["order_by="]}
                onChange={(event) => {
                  if (event.target.value === "rien")
                    FnSearchFilter[1]("order_by=");
                  else FnSearchFilter[0]("order_by=", event.target.value);
                }}
                placeholder="Rechercher trier par (apparait en 1er)"
              >
                <option value="rien">
                  Rien - Rechercher trier par (apparait en 1er)
                </option>
                <option value="title">Titre</option>
                <option value="start_date">Commencement</option>
                <option value="end_date">Fin</option>
                <option value="score">score</option>
                <option value="type">type</option>
                <option value="members">membres</option>
                <option value="id">id</option>
                <option value="episodes">episodes</option>
                <option value="rating">Evaluation</option>
              </Form.Control>
            </li>
            <li>
              Trier par ordre:{" "}
              <Form.Control
                as="select"
                custom
                value={SearchFilter["sort="]}
                onChange={(event) => {
                  if (event.target.value === "rien") FnSearchFilter[1]("sort=");
                  else FnSearchFilter[0]("sort=", event.target.value);
                }}
                placeholder="Ordre de trie"
              >
                <option value="rien">Rien - Ordre de trie:</option>
                <option value="asc">Croissant</option>
                <option value="desc">Décroissant</option>
              </Form.Control>
            </li>
            <li>
              Genres:{" "}
              <Form.Control
                as="select"
                custom
                value={SearchFilter["genre="]}
                onChange={(event) => {
                  if (event.target.value === "rien")
                    FnSearchFilter[1]("genre=");
                  else
                    FnSearchFilter[0](
                      "genre=",
                      `${
                        SearchFilter["genre="]
                          ? SearchFilter["genre="] + ","
                          : ""
                      }${event.target.value}`
                    );
                }}
                placeholder="Genre de l'anime"
              >
                {SearchFilter["genre="]?.split(",").length > 0 ? (
                  <option>Multiple</option>
                ) : null}
                <option value="rien">Rien/Reset - Genre de l'anime</option>
                <option value="1">Action</option>
                <option value="2">Aventure</option>
                <option value="3">Voiture</option>
                <option value="4">Comique</option>
                <option value="5">Démence</option>
                <option value="6">Démons</option>
                <option value="7">Mystère</option>
                <option value="8">Drama</option>
                <option value="9">Ecchi (R+)</option>
                <option value="10">Fantastique</option>
                <option value="11">Jeux</option>
                <option value="12">Hentai (RX 18+)</option>
                <option value="13">Historique</option>
                <option value="14">Horreur</option>
                <option value="15">Enfants</option>
                <option value="16">Magique</option>
                <option value="17">Art Matiaux</option>
                <option value="18">Mecha</option>
                <option value="19">Musique</option>
                <option value="20">Parodie</option>
                <option value="21">Samurai</option>
                <option value="22">Romance</option>
                <option value="23">School Life (School/École)</option>
                <option value="24">Sci Fi</option>
                <option value="25">Shoujo</option>
                <option value="26">Yuri/Girl Love (Shoujo Ai)</option>
                <option value="27">Shounen</option>
                <option value="28">BL (Shounen Ai)</option>
                <option value="29">L'espace</option>
                <option value="30">Sports</option>
                <option value="31">Super pouvoirs</option>
                <option value="32">Vampire</option>
                <option value="33">Yaoi (RX 18+)</option>
                <option value="34">Yuri (RX 18+)</option>
                <option value="35">Harem</option>
                <option value="36">Slice Of Life</option>
                <option value="37">Paranormal/Surnaturel</option>
                <option value="38">Militaire</option>
                <option value="39">Police</option>
                <option value="40">Psychologie</option>
                <option value="41">Thriller</option>
                <option value="42">Seinen</option>
                <option value="43">Josei</option>
              </Form.Control>
            </li>
            <li>
              Nombre de résultats:{" "}
              <Form.Control
                id="SearchFilterNbResult"
                type="number"
                value={SearchFilter["limit="]}
                min="0"
                placeholder="Par défaut: 16"
                autoComplete="off"
                onChange={(event) => {
                  if (
                    parseInt(event.target.value) === 0 ||
                    isNaN(parseInt(event.target.value))
                  )
                    FnSearchFilter[1]("limit=");
                  else FnSearchFilter[0]("limit=", event.target.value);
                }}
              />
            </li>
          </ul>
        </section>
      ) : null}

      <section id="MyAnime">
        <header>
          <div id="TabsAnime">
            <div
              id="MyAnimeTabs"
              className={SwitchMyAnimVar ? "active" : ""}
              onClick={ModeFindAnime || SwitchMyAnimVar ? null : SwitchMyAnim}
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
                        active={ModeFilter === "BySeries" ? true : false}
                        onClick={() => {
                          if (ModeFilter === "BySeries") return;
                          NewFilter("BySeries");
                        }}
                      >
                        Séries
                      </Dropdown.Item>
                      <Dropdown.Item
                        active={ModeFilter === "ByFilm" ? true : false}
                        onClick={() => {
                          if (ModeFilter === "ByFilm") return;
                          NewFilter("ByFilm");
                        }}
                      >
                        Film
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

            <div
              id="NATabs"
              className={!SwitchMyAnimVar ? "active" : ""}
              onClick={
                ModeFindAnime || !SwitchMyAnimVar ? null : SwitchMyNextAnim
              }
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
            </div>
          </div>

          <div id="BtnCancelModeFindAnime">
            {ModeFindAnime ? (
              <Button
                variant="outline-danger"
                onClick={() => CloseModeFindAnime()}
                style={{
                  borderRadius: "100px",
                  width: "200px",
                }}
              >
                <span className="fas fa-times-circle"></span>
              </Button>
            ) : null}
          </div>

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

import React, { useState, useContext, Fragment } from "react";
import { Link } from "react-router-dom";
// Context
import ContextForMyAnim from "../../Context/ContextSchema";
// CSS
import {
  Navbar,
  Nav,
  Form,
  Button,
  Dropdown,
  InputGroup,
} from "react-bootstrap";

const WhitchSeason = () => {
  const Month = new Date().getMonth() + 1;
  const Day = new Date().getDate();
  let season = null;
  switch (true) {
    case Month === 12 && Day >= 21:
    case Month === 1:
    case Month === 2:
      season = ["snowflake", "#007bff"];
      break;
    case Month === 3 && Day >= 20:
    case Month === 4:
    case Month === 5:
      season = ["seedling", "green"];
      break;
    case Month === 6 && Day >= 20:
    case Month === 7:
    case Month === 8:
      season = ["umbrella-beach", "gold"];
      break;
    case Month === 9 && Day >= 22:
    case Month === 10:
    case Month === 11:
      season = ["tree", "brown"];
      break;
    default:
      break;
  }
  return season;
};

const Header = ({ FnSearchFilter, SearchFilter }) => {
  const [TitleSearch, SetTitleSearch] = useState("");
  const [IsOpen, SetIsOpen] = useState(false);
  const [ResText, SetResText] = useState("");
  const [ShowMessage, SetShowMessage] = useState(false);
  const [SecondMessage, SetSecondMessage] = useState(false);
  const [MicOn, SetMicOn] = useState(false);
  const [ShowMessageHtml, SetShowMessageHtml] = useState(false);
  const Context = useContext(ContextForMyAnim);

  const StartSpeechRecognition = () => {
    try {
      const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognition.start();

      recognition.onstart = () => {
        SetMicOn(true);
        SetShowMessage(true);
        SetShowMessageHtml(true);
        SetResText("Le micro est bien allumé, vous pouvez parlez !");
        setTimeout(() => {
          if (SecondMessage) {
            SetSecondMessage(false);
            return;
          }
          SetShowMessage(false);

          setTimeout(() => {
            SetShowMessageHtml(false);
            SetResText("");
          }, 900);
        }, 3000);
      };

      recognition.onend = () => {
        SetSecondMessage(true);
        SetMicOn(false);
        SetShowMessage(true);
        SetShowMessageHtml(true);
        SetResText("Le micro est maintenant éteint");
        setTimeout(() => {
          SetShowMessage(false);

          setTimeout(() => {
            SetShowMessageHtml(false);
            SetResText("");
          }, 900);
        }, 3000);
      };

      recognition.onresult = (event) => {
        const current = event.resultIndex;

        const transcript = event.results[current][0].transcript;
        SetTitleSearch(transcript);
        if (
          typeof transcript === "string" &&
          transcript.trim().length !== 0 &&
          FnSearchFilter
        )
          FnSearchFilter[0]("q=", transcript);
        else if (FnSearchFilter) FnSearchFilter[1]("q=");
      };
    } catch (e) {
      SetShowMessage(true);
      SetShowMessageHtml(true);
      SetResText(
        "Une erreur est survenue lors du traitement de votre requête. Il semblerait que votre naviguateur ne puisse pas ou veut pas démarrez cette fonction (veuillez verifier la version de votre navigateur ainsi que sa mordernité ou tout simplement les autorisations pour ce site)."
      );
      setTimeout(() => {
        SetShowMessage(false);

        setTimeout(() => {
          SetShowMessageHtml(false);
          SetResText("");
        }, 900);
      }, 6000);
      console.error(e);
    }
  };

  return (
    <Fragment>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand
          title={
            Context.PageMode
              ? "Aller Dans MyManga-Checker"
              : "Aller dans MyAnim-Checker"
          }
          onClick={Context.ChangePage}
        >
          {Context.PageMode ? "ACK" : "MCK"}
          <sup>
            {Context.PageMode ? (
              <Fragment>
                LTS<b>1</b>
              </Fragment>
            ) : (
              <Fragment>
                β<b>3</b>
              </Fragment>
            )}
          </sup>
        </Navbar.Brand>
        <div id="btnBarsMenu" onClick={() => SetIsOpen(!IsOpen)}>
          <span className="fas fa-bars"></span>
        </div>
        <Navbar.Collapse
          className={IsOpen ? "active" : ""}
          id="basic-navbar-nav"
        >
          <Nav className="mr-auto">
            <Nav.Item>
              <Button variant="outline-success" onClick={Context.openModalNew}>
                <span className="fas fa-plus-circle"></span>{" "}
                {Context.PageMode ? "Anime" : "Manga"}
              </Button>
            </Nav.Item>
            <Nav.Item>
              <Link push="true" to={`/notificator/${Context.Pseudo}`}>
                <Button variant="outline-info">
                  <span className="fas fa-bell"></span> Notif
                </Button>
              </Link>
            </Nav.Item>
            {window.matchMedia("(display-mode: standalone)").matches ? null : (
              <Nav.Item>
                <Button
                  variant="outline-secondary"
                  title="Ajoute cette application à ton écran d'accueil ou Bureau !"
                  onClick={Context.addToHome}
                >
                  <span className="fas fa-plus-circle"></span>
                </Button>
              </Nav.Item>
            )}
            <Nav.Item>
              <Dropdown>
                <Dropdown.Toggle
                  variant="light"
                  aria-label="Show the account button of the user"
                  id="dropdown-basic"
                >
                  <span className="fas fa-user"></span>
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <h5>Bonjour, {Context.Pseudo}</h5>
                  <Dropdown.Item
                    disabled={Context.LoadingMode}
                    onClick={Context.openPalmares}
                  >
                    <span
                      className="fas fa-trophy"
                      style={{ color: "gold" }}
                    ></span>{" "}
                    Palmarès
                  </Dropdown.Item>
                  <Dropdown.Item
                    disabled={Context.LoadingMode}
                    onClick={Context.RdaAnime}
                    title="Choisir un anime aléatoirement parmi toutes taliste de prochain anime"
                  >
                    <span
                      style={{ color: "#007bff" }}
                      className="fas fa-random"
                    ></span>{" "}
                    Random {Context.PageMode ? "Anime" : "Manga"}
                  </Dropdown.Item>
                  <Dropdown.Item
                    disabled={Context.LoadingMode}
                    onClick={Context.OpenSeasonPage}
                  >
                    <span
                      className={`fas fa-${WhitchSeason()[0]}`}
                      style={{ color: WhitchSeason()[1] }}
                    ></span>{" "}
                    Anime de Saison
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    disabled={Context.LoadingMode}
                    onClick={Context.ExportDB}
                  >
                    <span className="fas fa-file-upload"></span> Exporter Ton
                    ACK
                  </Dropdown.Item>
                  <Dropdown.Item
                    disabled={Context.LoadingMode}
                    onClick={Context.ImportDB}
                  >
                    <span className="fas fa-file-download"></span> Imorter un
                    ACK
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    title="Se déconnecter"
                    onClick={Context.logOut}
                  >
                    <span className="fas fa-sign-out-alt"></span> Se déconnecter
                  </Dropdown.Item>
                  <Link
                    id="FakeDropdownItem"
                    push="true"
                    to={`/Settings/${Context.Pseudo}`}
                  >
                    <span
                      className="fas fa-cog fa-spin"
                      style={{ color: "grey" }}
                    ></span>{" "}
                    Paramètres
                  </Link>
                </Dropdown.Menu>
              </Dropdown>
            </Nav.Item>
          </Nav>

          <Form
            onSubmit={(event) => {
              event.preventDefault();
              Context.search(Context.PageMode ? null : TitleSearch);
            }}
            id="searchForm"
            inline
          >
            <Form.Group>
              <Form.Control
                type="text"
                required={Context.PageMode ? false : true}
                placeholder={
                  Context.PageMode
                    ? "Search Anim To Watch"
                    : "Search Manga To Read"
                }
                value={
                  Context.PageMode ? SearchFilter["q="] || "" : TitleSearch
                }
                onChange={(event) => {
                  if (
                    Context.PageMode &&
                    typeof event.target.value === "string" &&
                    event.target.value.trim().length !== 0
                  )
                    FnSearchFilter[0]("q=", event.target.value);
                  else if (Context.PageMode) FnSearchFilter[1]("q=");
                  else SetTitleSearch(event.target.value);
                }}
              />
              <InputGroup.Append>
                {Context.PageMode ? (
                  <Button
                    variant="secondary"
                    onClick={Context.OpenSearchFilter}
                    title="Ouvre les différent paramètres de recherches"
                  >
                    <span className="fas fa-filter"></span>
                  </Button>
                ) : null}
                <Button
                  id="SearchFormBtnSubmit"
                  aria-label="Submit The anime"
                  type="submit"
                >
                  <span className="fas fa-search"></span>
                </Button>
              </InputGroup.Append>
              <div id="SearchFormBtnVoice" onClick={StartSpeechRecognition}>
                <span
                  className={
                    MicOn ? "fas fa-microphone" : "fas fa-microphone-slash"
                  }
                ></span>
              </div>
            </Form.Group>
          </Form>
        </Navbar.Collapse>
      </Navbar>
      {ShowMessageHtml ? (
        <div className={`ackmessage${ShowMessage ? " show" : " hide"}`}>
          <span className="fas fa-info"></span> {ResText}
        </div>
      ) : null}
    </Fragment>
  );
};

export default Header;

import React, { useState, useContext, Fragment } from "react";
import { Link } from "react-router-dom";
// Context
import ContextForMyAnim from "../Context/ContextSchema";
// CSS
import { Navbar, Nav, Form, Button, Dropdown } from "react-bootstrap";

const Header = () => {
  const [Anim, SetAnim] = useState("");
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
        SetAnim(transcript);
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

  const HandleSubmit = (event) => {
    event.preventDefault();

    if (
      Anim !== undefined &&
      Anim !== null &&
      typeof Anim === "string" &&
      Anim.trim().length !== 0 &&
      Anim !== ""
    ) {
      Context.search(Anim);
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
          <sup>V10</sup>
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
            <Nav.Item>
              <Button
                id="RdaBtn"
                title="Choisir un anime aléatoirement parmi toutes taliste de prochain anime"
                onClick={Context.RdaAnime}
                variant="outline-primary"
              >
                <span className="fas fa-random"></span>
              </Button>
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
                  <div id="FakeDropdownItem">
                    <Link push="true" to={`/Settings/${Context.Pseudo}`}>
                      <span
                        className="fas fa-cog fa-spin"
                        style={{ color: "grey" }}
                      ></span>{" "}
                      Parametres
                    </Link>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </Nav.Item>
          </Nav>
          {Context.PageMode ? (
            <Form onSubmit={HandleSubmit} id="searchForm" inline>
              <Form.Group>
                <Form.Control
                  type="text"
                  required
                  placeholder="Search Anim To Watch"
                  value={Anim}
                  onChange={(event) => SetAnim(event.target.value)}
                />
              </Form.Group>
              <Button
                id="SearchFormBtnSubmit"
                aria-label="Submit The anime"
                type="submit"
              >
                <span className="fas fa-search"></span>
              </Button>
              <div id="SearchFormBtnVoice" onClick={StartSpeechRecognition}>
                <span
                  className={
                    MicOn ? "fas fa-microphone" : "fas fa-microphone-slash"
                  }
                ></span>
              </div>
            </Form>
          ) : null}
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

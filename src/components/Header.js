import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
// Context
import ContextForMyAnim from "../ContextSchema";
// CSS
import { Navbar, Nav, Form, Button, Dropdown } from "react-bootstrap";

const Header = () => {
  const [Anim, SetAnim] = useState("");
  const Context = useContext(ContextForMyAnim);

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
    <Navbar bg="light" expand="lg">
      <Navbar.Brand>ACK</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Link push="true" to={`/notificator/${Context.Pseudo}`}>
            <Button variant="outline-info">My Notif</Button>
          </Link>
          <Nav.Item>
            <Button
              variant="outline-success"
              style={{ marginLeft: "10px" }}
              onClick={Context.openModalNewAnim}
            >
              New Anime
            </Button>
          </Nav.Item>
          <Nav.Item>
            <Button
              variant="outline-secondary"
              style={{ marginLeft: "10px" }}
              id="AdueHSbtn"
              onClick={Context.addToHome}
            >
              <span className="fas fa-plus-circle"></span> Install
            </Button>
          </Nav.Item>
          <Nav.Item>
            <Button
              variant="outline-warning"
              style={{ marginLeft: "10px" }}
              onClick={Context.logOut}
            >
              <span className="fas fa-sign-out-alt"></span>
            </Button>
          </Nav.Item>
        </Nav>
        <Form onSubmit={HandleSubmit} id="searchForm" inline>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Search Anim To Watch"
              value={Anim}
              onChange={(event) => SetAnim(event.target.value)}
            />
          </Form.Group>
          <Button type="submit">
            <span className="fas fa-search"></span>
          </Button>
        </Form>
        <aside id="account">
          <Dropdown>
            <Dropdown.Toggle variant="light" id="dropdown-basic">
              <span className="fas fa-user"></span>
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <h5>Bonjour, </h5>
              <Dropdown.Item onClick={Context.openPalmares}>
                <span
                  className="fas fa-trophy"
                  style={{ color: "gold" }}
                ></span>{" "}
                Palmarès
              </Dropdown.Item>
              <Dropdown.Item>
                <Link push="true" to="/Settings">
                  <span
                    className="fas fa-cog fa-spin"
                    style={{ color: "grey" }}
                  ></span>{" "}
                  Parametres
                </Link>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </aside>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;

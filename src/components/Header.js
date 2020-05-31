import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
// Context
import ContextForMyAnim from "../ContextSchema";
// CSS
import { Navbar, Nav, Form, Button } from "react-bootstrap";

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
          <Nav.Link href="https://discord.gg/Jrmks5b" target="_blank">
            Discord Anime
          </Nav.Link>
          <Link push="true" to="/notificator">
            <Button variant="outline-info">My Notif</Button>
          </Link>
          <Nav.Item>
            <Button
              variant="outline-success"
              style={{ marginLeft: "10px" }}
              onClick={Context.openModalNewAnim}
            >
              New Anime (manually)
            </Button>
          </Nav.Item>
          <Nav.Item>
            <Button
              variant="outline-secondary"
              style={{ marginLeft: "10px" }}
              id="AdueHSbtn"
              onClick={Context.addToHome}
            >
              <span className="fas fa-plus-circle"></span> Home Screen
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
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;

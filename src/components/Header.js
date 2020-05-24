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
    } else {
    }
  };

  return (
    <Navbar bg="light" expand="lg">
      <Link push="true" to="/">
        <Navbar.Brand>ASI-Check</Navbar.Brand>
      </Link>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="mr-auto">
          <Nav.Link href="https://discord.gg/Jrmks5b" target="_blank">
            Discord Anime
          </Nav.Link>
          <Nav.Item>
            <Button
              variant="outline-success"
              style={{ marginLeft: "10px" }}
              onClick={Context.openModalNewAnim}
            >
              Create Anime/Moovie (manually)
            </Button>
          </Nav.Item>
          <Nav.Item>
            <Button
              variant="outline-warning"
              style={{ marginLeft: "10px" }}
              onClick={Context.logOut}
            >
              LogOut
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

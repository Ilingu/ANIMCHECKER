import React, { useState } from "react";
import { Link } from "react-router-dom";
// CSS
import { Nav, Form, Button } from "react-bootstrap";

const Header = ({ search }) => {
  const [Anim, SetAnim] = useState("");

  const HandleSubmit = (event) => {
    event.preventDefault();

    if (
      Anim !== undefined &&
      Anim !== null &&
      typeof Anim === "string" &&
      Anim.trim().length !== 0 &&
      Anim !== ""
    ) {
      search(Anim);
    } else {
    }
  };

  return (
    <Nav variant="tabs">
      <Nav.Item>
        <Link to="/Home">
          <Button variant="warning" id="btnHome">
            Home
          </Button>
        </Link>
      </Nav.Item>
      <Nav.Item>
        <a
          href="https://discord.gg/Jrmks5b"
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginRight: "10px" }}
        >
          <Button variant="outline-primary">Discord</Button>
        </a>
      </Nav.Item>
      <Nav.Item>
        <Form onSubmit={HandleSubmit} id="searchForm">
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
      </Nav.Item>
      <Nav.Item>
        <Link to="/NewAnim" style={{ marginLeft: "10px" }}>
          <Button variant="outline-success">Create anim (manually)</Button>
        </Link>
      </Nav.Item>
    </Nav>
  );
};

export default Header;

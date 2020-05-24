import React from "react";
import { Button } from "react-bootstrap";

const NextAnim = ({ name, handleClick }) => {
  return (
    <div id="NextAnim">
      <div className="name">{name}</div>
      <Button variant="outline-success" block onClick={handleClick}>
        Commencer{" "}
        <span className="fas fa-long-arrow-alt-right animation"></span>
      </Button>
      <hr />
    </div>
  );
};

export default NextAnim;

import React, { Fragment } from "react";
import { Button } from "react-bootstrap";

const NextAnim = ({ name, handleClick, Skeleton }) => {
  return (
    <div id="NextAnim" className={Skeleton[0] ? "Skeleton" : ""}>
      {Skeleton[0] ? (
        <Fragment>
          <div id="nameSkeleton"></div>
          <div id="BtnSkeleton"></div>
          {Skeleton[1] === 5 ? null : <hr />}
        </Fragment>
      ) : (
        <Fragment>
          <div className="name">{name}</div>
          <Button variant="outline-success" block onClick={handleClick}>
            Commencer{" "}
            <span className="fas fa-long-arrow-alt-right animation"></span>
          </Button>
          <hr />
        </Fragment>
      )}
    </div>
  );
};

export default NextAnim;

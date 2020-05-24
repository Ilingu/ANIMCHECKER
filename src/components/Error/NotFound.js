import React from "react";
import { Link } from "react-router-dom";
// CSS
import { Button } from "react-bootstrap";

const NotFound = () => {
  return (
    <div className="NotFound">
      <h1>404</h1>
      <h3>Not Found :/</h3>
      <p>
        The page you're looking for doesn't exist or existed but now no longer.{" "}
        <br /> Please Go Back
      </p>
      <Link push={false} to="/">
        <Button variant="outline-danger">
          <span className="fas fa-arrow-left"> Go Home</span>
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;

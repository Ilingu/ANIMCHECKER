import React, { useState, useEffect } from "react";
import { Link, Redirect } from "react-router-dom";
// CSS
import { Button } from "react-bootstrap";

const NotFound = () => {
  const [RedirectHome, setRedirect] = useState(false);
  const [Time, setTime] = useState(60);

  useEffect(() => {
    const Interval = setInterval(() => {
      setTime(Time - 10);
      if (Time - 10 <= 0) {
        setRedirect(true);
      }
    }, 10000);

    // WillUnMount
    return () => {
      clearTimeout(Interval);
    };
  }, [Time]);

  if (RedirectHome) return <Redirect to="/" />;

  return (
    <div className="NotFound">
      <h1>404</h1>
      <h3>Not Found :/</h3>
      <p>
        The page you're looking for doesn't exist or existed but now no longer.{" "}
        <br /> Please Go Back. You will be rediriged in {Time}s
      </p>
      <Link push="false" to="/">
        <Button variant="outline-danger">
          <span className="fas fa-arrow-left"> Go Home</span>
        </Button>
      </Link>
    </div>
  );
};

export default NotFound;

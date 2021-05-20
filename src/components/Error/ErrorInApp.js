import React, { useState } from "react";
import { useHistory } from "react-router";
// CSS
import { Button } from "react-bootstrap";

const ErrorInApp = (props) => {
  let History = useHistory();
  const [Is1Time, setIs1Time] = useState(true);
  const MsgError = useState(props.match.params.msgerror);
  if (Is1Time) {
    setIs1Time(false);
    return History.push("/error");
  }
  return (
    <div id="ErrorInApp" className="container-fluid">
      <h1>❌ERROR❌</h1>
      <h3>⚠️An error occured in the app⚠️</h3>
      <p>
        Sorry but MyAnimChecker <span className="boldTxt">crash</span> 💥
        <span className="boldTxt underlineTxt"> An error</span> occured
        somewhere in the app 🔍 <br />
        <span className="underlineTxt">This is a bug</span> and you were
        <span className="underlineTxt"> automatically redirect</span> to this
        page due to <span className="boldTxt">security reasons</span> 🔰 <br />{" "}
        Please let me know that a error occured by clicking "Contact Me" button,
        the error model has already been generated.
      </p>
      <a
        href={`mailto:thetitouoff@gmail.com?subject=An error occured in ACK!&body=Date: ${Date.now()}%0D%0AReason: %0D%0A//BEGIN//%0D%0A${
          MsgError[0]
        }%0D%0A//END//`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button onClick={() => History.push("/")} variant="link">
          Contact Me And Go Home.
        </Button>
      </a>
    </div>
  );
};

export default ErrorInApp;

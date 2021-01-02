import React, { Fragment, useEffect, useRef } from "react";
// Design
import { Button, Dropdown } from "react-bootstrap";

const NextAnim = ({
  name,
  handleClick,
  Skeleton,
  ModeDisplay,
  ModeImportant,
}) => {
  const IDElem = `NextAnim${Date.now()}${name}`
    .replace(/[^a-zA-Z0-9]/g, "")
    .split(" ")
    .join("");
  let NameRef = useRef(name);

  const countLines = (elem) => {
    const el = document.getElementById(elem).children[0];
    const divHeight = el.offsetHeight;
    const lines = divHeight / 27;
    return lines;
  };

  if (!ModeDisplay)
    window.localStorage.setItem("ModeDisplayNextAnim", JSON.stringify("Block"));

  useEffect(() => {
    if (
      !Skeleton[0] &&
      countLines(IDElem) >= 3 &&
      (!ModeDisplay || ModeDisplay === "Block")
    ) {
      NameRef.current = NameRef.current.split(" ");
      for (let i = 0; i < countLines(IDElem) - 1; i++) {
        NameRef.current.pop();
      }
      document.getElementById(IDElem).children[0].innerText =
        NameRef.current.join(" ") + "...";
    }
  });

  return (
    <div
      id={IDElem}
      title={name}
      onClick={
        !Skeleton[0] && (!ModeDisplay || ModeDisplay === "Block")
          ? handleClick
          : null
      }
      className={`NextAnim${Skeleton[0] ? " Skeleton" : ""}`}
    >
      {Skeleton[0] ? (
        <Fragment>
          <div id="nameSkeleton"></div>
        </Fragment>
      ) : !ModeDisplay || ModeDisplay === "Block" ? (
        <Fragment>
          <div className="name">{name}</div>
          {ModeImportant ? (
            ModeImportant
          ) : (
            <Dropdown>
              <Dropdown.Toggle
                variant="outline-secondary"
                id="RepereImportantNextAnime"
              >
                <span className="fas fa-exclamation"></span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item>Importance de l'anime ({name})</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item>Aucune</Dropdown.Item>
                <Dropdown.Item>Basse</Dropdown.Item>
                <Dropdown.Item>Moyenne</Dropdown.Item>
                <Dropdown.Item>Haute</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Fragment>
      ) : (
        <Fragment>
          <div className="name">{name}</div>
          <Button variant="outline-success" onClick={handleClick} block>
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

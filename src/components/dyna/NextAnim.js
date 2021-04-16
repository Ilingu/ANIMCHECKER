import React, { Fragment, useEffect, useRef, useState } from "react";
// Design
import { Button, Dropdown, Badge, Form } from "react-bootstrap";

const NextAnim = ({
  name,
  handleClick,
  Skeleton,
  ModeDisplay,
  ModeImportant,
  setImportance,
  BadgesType,
  AddNewBadgeType,
  handleDeleteBadge,
  DeleteNextAnim,
}) => {
  // State
  const [ShowFormBadge, SetShowFormBadge] = useState(false);
  const [NewBadgeName, SetNewBadgeName] = useState("");
  const [Back, setBack] = useState(false);
  // App
  if (!ModeDisplay)
    window.localStorage.setItem("ModeDisplayNextAnim", JSON.stringify("Block"));

  /* Var */
  const IDElem = `NextAnim${Date.now()}${name}`
    .replace(/[^a-zA-Z0-9]/g, "")
    .split(" ")
    .join("");
  let NameRef = useRef(name),
    First = true;
  let timer = null,
    prevent = false;

  /* Fn */
  const countLines = (elem) => {
    const el = document.getElementById(elem).children[0].children[0];
    const divHeight = el.offsetHeight;
    const lines = divHeight / 27;
    return lines;
  };

  const addBadge = (event) => {
    event.preventDefault();
    if (
      event.target.id !== undefined &&
      (event.target.id === "InputBadgeNA" ||
        event.target.id === "InputNANbadgeReperage")
    )
      return;
    if (typeof NewBadgeName === "string" && NewBadgeName.trim().length !== 0) {
      window.removeEventListener("click", addBadge, false);
      AddNewBadgeType(NewBadgeName);
      SetNewBadgeName("");
      SetShowFormBadge(false);
    } else if (First) {
      First = false;
    } else {
      window.removeEventListener("click", addBadge, false);
      SetShowFormBadge(false);
    }
  };

  const handleClickPrevent = (event) => {
    const Target = event.target;
    timer = setTimeout(() => {
      if (
        !prevent &&
        !Skeleton[0] &&
        (!ModeDisplay || ModeDisplay === "Block")
      ) {
        handleClick(Target);
      } else {
        prevent = false;
      }
    }, 200);
  };

  const handleDbClick = () => {
    clearTimeout(timer);
    prevent = true;
    setBack(!Back);
  };

  useEffect(() => {
    if (!ModeDisplay || ModeDisplay === "Block")
      for (let i = 0; i < 2; i++) {
        if (!Skeleton[0] && countLines(IDElem) >= 3) {
          try {
            NameRef.current = NameRef.current.split(" ");
          } catch (error) {}
          for (let i = 0; i < countLines(IDElem) - 1; i++) {
            NameRef.current.pop();
          }
          document.getElementById(IDElem).children[0].children[0].innerText =
            NameRef.current.join(" ") + "...";
        }
      }
  });

  /* Dyna Components */
  let BadgesTypeComponents = null;
  if (BadgesType) {
    BadgesTypeComponents = BadgesType.map((text, i) => {
      const rdaColor = [
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
        Math.round(Math.random() * 255),
      ];

      const grayScaleRdaColor =
        0.2126 * rdaColor[0] + 0.7152 * rdaColor[1] + 0.0722 * rdaColor[2];

      return (
        <Badge
          key={i}
          className="BadgesNA"
          variant="primary"
          onClick={() => handleDeleteBadge(i)}
          style={{
            background: `rgb(${rdaColor[0]},${rdaColor[1]},${rdaColor[2]})`,
            color: grayScaleRdaColor < 128 ? "#fff" : "#212529",
          }}
        >
          <div id="ValueBadge">{text}</div>
          <div id="CancelBadge">
            <span className="fas fa-times"></span>
          </div>
        </Badge>
      );
    });
  }

  let NbTemplate = [],
    NbFois = !ModeImportant ? 1 : ModeImportant;
  for (let i = 0; i < NbFois; i++) {
    NbTemplate = [
      ...NbTemplate,
      <span
        key={i}
        id="RepereImportantNextAnime"
        className="fas fa-exclamation"
      ></span>,
    ];
  }

  return (
    <div
      id={IDElem}
      title={name}
      onClick={handleClickPrevent}
      onDoubleClick={handleDbClick}
      className={`NextAnim${Skeleton[0] ? " Skeleton" : ""}${
        !ModeDisplay || ModeDisplay === "Block"
          ? !ModeImportant
            ? ""
            : ModeImportant === 1
            ? " small"
            : ModeImportant === 2
            ? " medium"
            : " big"
          : ""
      }${Back ? " BackActive" : ""}`}
    >
      {Skeleton[0] ? (
        <Fragment>
          <div id="nameSkeleton"></div>
        </Fragment>
      ) : !ModeDisplay || ModeDisplay === "Block" ? (
        <Fragment>
          <div className={`front${Back ? "" : " active"}`}>
            <div className="name">{name}</div>
            <Dropdown>
              <Dropdown.Toggle
                variant={`outline-${
                  !ModeImportant
                    ? "secondary"
                    : ModeImportant === 1
                    ? "info"
                    : ModeImportant === 2
                    ? "warning"
                    : "danger"
                }`}
                id="RepereImportantNextAnime"
              >
                {NbTemplate}
              </Dropdown.Toggle>

              <Dropdown.Menu id="RepereMenuImportantNextAnime">
                <Dropdown.Item
                  style={{ pointerEvents: "none" }}
                  id="RepereImportantNextAnime"
                >
                  Importance pour regarder l'anime ({name})
                </Dropdown.Item>
                <Dropdown.Divider id="RepereImportantNextAnime" />
                <Dropdown.Item
                  onClick={() => setImportance(0)}
                  style={{ color: "rgb(108, 117, 125)" }}
                  id="RepereImportantNextAnime"
                >
                  Aucune Importance
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setImportance(1)}
                  style={{ color: "#4d8ccf" }}
                  id="RepereImportantNextAnime"
                >
                  <span className="fas fa-exclamation"></span> Faible Importance
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setImportance(2)}
                  style={{ color: "rgb(255, 193, 7)" }}
                  id="RepereImportantNextAnime"
                >
                  <span className="fas fa-exclamation"></span>{" "}
                  <span className="fas fa-exclamation"></span> Importance
                  Moyenne
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => setImportance(3)}
                  style={{ color: "#fb401f" }}
                  id="RepereImportantNextAnime"
                >
                  <span className="fas fa-exclamation"></span>{" "}
                  <span className="fas fa-exclamation"></span>{" "}
                  <span className="fas fa-exclamation"></span> Haute Importance
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <div id="BadgesType">
              {ShowFormBadge ? (
                <Badge variant="warning" className="BadgesME" id="InputBadgeNA">
                  <Form onSubmit={addBadge}>
                    <Form.Control
                      type="text"
                      required
                      suppressContentEditableWarning={true}
                      autoComplete="off"
                      id="InputNANbadgeReperage"
                      value={NewBadgeName}
                      onChange={(event) => SetNewBadgeName(event.target.value)}
                      placeholder="Nom du Tag"
                    />
                  </Form>
                </Badge>
              ) : null}
              {BadgesTypeComponents}
              <Badge
                pill
                className="BadgesME"
                id="BadgeAddReperagePill"
                variant="secondary"
                onClick={() => {
                  SetShowFormBadge(true);
                  window.addEventListener("click", addBadge, false);
                }}
              >
                <span
                  id="BadgeAddReperagePillSpan"
                  className="fas fa-plus-circle"
                ></span>
              </Badge>
            </div>
          </div>
          <div className={`back${Back ? " active" : ""}`}>
            <div className="deleteNA" onClick={DeleteNextAnim}>
              <span className="fas fa-trash-alt"></span>
            </div>
          </div>
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

import React, { useEffect } from "react";
// Components
import Header from "./Header";
// Design
import { Button, Alert, Dropdown } from "react-bootstrap";

const MyManga = ({
  MyMangaList,
  openModalAddNextManga,
  ModeFindManga,
  CloseModeFindManga,
  ModeFilter,
  NewFilter,
  ResText,
  typeAlert,
  CloseAlert,
  SwipeActive,
  ChangeSwipe,
  IsShortcut,
}) => {
  useEffect(() => {
    // KeyShortcut
    document.onkeydown = null;
    if (!window.mobileAndTabletCheck()) {
      if (IsShortcut && document.onkeydown === null) {
        document.onkeydown = (keyDownEvent) => {
          if (keyDownEvent.repeat) return;
          if (keyDownEvent.key === "ArrowRight") {
            return ChangeSwipe(false);
          }
          if (keyDownEvent.key === "ArrowLeft") return ChangeSwipe(true);
        };
      }
      return;
    }
    // Mobile Swipe
    let touchstartX = 0,
      touchendX = 0;
    let touchstartY = 0,
      touchendY = 0;

    const gesuredZone = document.getElementById("ContentMangaList");

    gesuredZone.addEventListener(
      "touchstart",
      function (event) {
        touchstartX = event.changedTouches[0].screenX;
        touchstartY = event.changedTouches[0].screenY;
      },
      false
    );

    gesuredZone.addEventListener(
      "touchend",
      function (event) {
        touchendX = event.changedTouches[0].screenX;
        touchendY = event.changedTouches[0].screenY;
        handleGesure();
      },
      false
    );

    function handleGesure() {
      if (
        touchstartX - touchendX >= window.innerWidth / 3 &&
        touchstartY - touchendY < window.innerHeight / 6
      ) {
        ChangeSwipe(false); // Left
      }
      if (
        touchendX - touchstartX >= window.innerWidth / 3 &&
        touchendY - touchstartY < window.innerHeight / 6
      ) {
        ChangeSwipe(true); // Right
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="container">
      <Header />

      <section id="MyManga">
        <header>
          {!window.mobileAndTabletCheck() ? (
            <div id="BtnSwipe">
              <Button
                variant="outline-secondary"
                onClick={() => {
                  if (SwipeActive) return;
                  ChangeSwipe(true);
                }}
              >
                <span className="fas fa-long-arrow-alt-left"></span>
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => {
                  if (!SwipeActive) return;
                  ChangeSwipe(false);
                }}
              >
                <span className="fas fa-long-arrow-alt-right"></span>
              </Button>
            </div>
          ) : null}
          <div id="BtnCancelModeFindAnime">
            {ModeFindManga ? (
              <Button
                variant="outline-danger"
                onClick={() => CloseModeFindManga()}
                style={{
                  borderRadius: "100px",
                  width: "200px",
                }}
              >
                <span className="fas fa-times-circle"></span>
              </Button>
            ) : null}
          </div>

          <div id="returnAlert">
            {ResText !== null && typeAlert !== null ? (
              <Alert variant={typeAlert} onClose={CloseAlert} dismissible>
                <p>{ResText}</p>
              </Alert>
            ) : null}
          </div>
        </header>
        <div id="ContentMangaList">
          <div id="MyMangaTab" className={SwipeActive ? "active" : ""}>
            <header>
              Mes Mangas{" "}
              <Dropdown>
                <Dropdown.Toggle variant="link" title="Filtre" id="FilterBtn">
                  <span className="fas fa-filter"></span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    active={ModeFilter === "NotFinished" ? true : false}
                    onClick={() => {
                      if (ModeFilter === "NotFinished") return;
                      NewFilter("NotFinished");
                    }}
                  >
                    En Cours
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={ModeFilter === "Finished" ? true : false}
                    onClick={() => {
                      if (ModeFilter === "Finished") return;
                      NewFilter("Finished");
                    }}
                  >
                    Finis
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item
                    active={ModeFilter === "All" ? true : false}
                    onClick={() => {
                      if (ModeFilter === "All") return;
                      NewFilter("All");
                    }}
                  >
                    Tous
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </header>
            <aside>{MyMangaList[0]}</aside>
          </div>
          <div id="NextMangaTab" className={!SwipeActive ? "active" : ""}>
            <header>
              My Next Manga{" "}
              <Button
                onClick={openModalAddNextManga}
                variant="outline-success"
                style={{ border: "none" }}
              >
                <span className="fas fa-plus"></span>
              </Button>
            </header>
            <aside>{MyMangaList[1]}</aside>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MyManga;

import React from "react";
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
}) => {
  return (
    <div className="container">
      <Header />

      <section id="MyManga">
        <header>
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
          <div id="MyMangaTab">
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
                </Dropdown.Menu>
              </Dropdown>
            </header>
            <aside>{MyMangaList[0]}</aside>
          </div>
          <div id="NextMangaTab">
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

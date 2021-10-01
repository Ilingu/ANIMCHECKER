// Module
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
// SW
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
// IndexedDB
import "./db/initIndexedDB";
// Main Components
import Home from "./Home";
// Components
import Watch from "./components/Watch/Watch";
import WatchManga from "./components/Watch/WatchManga";
import Notif from "./components/Notif";
import Settings from "./components/Auth/Settings";
import NotFound from "./components/Error/NotFound";
// CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./Assets/CSS/App.css";
// DB
import "firebase/auth";

// Page Confi
document.cookie = "promo_shown=1; Max-Age=2600000; Secure; SameSite=Strict";

const Root = () => (
  <Router>
    <Switch>
      {/* Home */}
      <Route exact path="/" component={Home} />
      <Route exact path={`/notifuser/:codemsg`} component={Home} />
      <Route exact path={`/Template/:token`} component={Home} />
      {/* Watch */}
      <Route exact path={`/Watch/:pseudo`} component={Watch} />
      <Route exact path={`/Watch/:pseudo/:id`} component={Watch} />
      <Route exact path={`/Watch/:pseudo/:id/:watchmode`} component={Watch} />
      <Route exact path="/Watch" component={Watch} />
      {/* WatchManga */}
      <Route exact path="/WatchManga/:pseudo/:id" component={WatchManga} />
      <Route exact path="/WatchManga" component={WatchManga} />
      {/* Settings */}
      <Route exact path="/Settings" component={Settings} />
      <Route exact path={`/Settings/:pseudo`} component={Settings} />
      {/* Notif */}
      <Route exact path={`/notificator/:pseudo`} component={Notif} />
      <Route exact path="/notificator" component={Notif} />
      {/* 404 Error */}
      <Route component={NotFound} />
    </Switch>
  </Router>
);

ReactDOM.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
  document.getElementById("root")
);

serviceWorkerRegistration.register();

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
import Watch from "./components/Watch";
import Notif from "./components/Notif";
import Settings from "./components/Auth/Settings";
import NotFound from "./components/Error/NotFound";
// CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./Assets/CSS/App.css";

const Root = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route exact path={`/Watch/:pseudo/:id`} component={Watch} />
      <Route exact path={`/Watch/:pseudo/:id/:watchmode`} component={Watch} />
      <Route exact path="/Watch" component={Watch} />
      <Route exact path="/Settings" component={Settings} />
      <Route exact path={`/Settings/:pseudo`} component={Settings} />
      <Route exact path={`/notificator/:pseudo`} component={Notif} />
      <Route exact path="/notificator" component={Notif} />
      <Route exact path={`/notifuser/:codemsg`} component={Home} />
      <Route exact path={`/Template/:token`} component={Home} />
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

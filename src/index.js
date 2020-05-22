// Module
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore } from "redux";
import Reducer from "./Redux/Reducer";
// Main Components
import Home from "./Home";
// Components
import Login from "./components/Auth/Login";
// CSS
import "bootstrap/dist/css/bootstrap.min.css";
import "./Assets/CSS/App.css";
// Service Worker
import * as serviceWorker from "./serviceWorker";

const store = createStore(
  Reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const Root = () => (
  <Router>
    <Switch>
      <Route exact path="/" render={() => <Login store={store} />} />
      <Route exact path="/Home" render={() => <Home store={store} />} />
    </Switch>
  </Router>
);

ReactDOM.render(
  <Provider store={store}>
    <Root />
  </Provider>,
  document.getElementById("root")
);

serviceWorker.unregister();

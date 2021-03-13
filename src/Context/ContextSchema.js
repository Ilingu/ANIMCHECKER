import { createContext } from "react";

export default createContext({
  openModalNew: Function,
  Pseudo: String,
  search: Function,
  logOut: Function,
  RdaAnime: Function,
  LoadingMode: Boolean,
  ChangePage: Function,
  PageMode: Boolean,
  addToHome: Function,
  openPalmares: Function,
  ExportDB: Function,
  ImportDB: Function,
});

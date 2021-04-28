import React from "react";
// CSS
import { Button } from "react-bootstrap";

const OneNotif = ({ name, calledTime, paused, fn, color }) => {
  const toDayString = () => {
    let dayVar = null;
    switch (new Date(calledTime).getDay()) {
      case 0:
        dayVar = "Dimanche";
        break;
      case 1:
        dayVar = "Lundi";
        break;
      case 2:
        dayVar = "Mardi";
        break;
      case 3:
        dayVar = "Mercredi";
        break;
      case 4:
        dayVar = "Jeudi";
        break;
      case 5:
        dayVar = "Vendredi";
        break;
      case 6:
        dayVar = "Samedi";
        break;
      default:
        dayVar = "Fatal Error";
        break;
    }
    return dayVar;
  };

  const toHourMinute = () => {
    const toDate = new Date(calledTime);
    return `${
      toDate.getHours() < 10 ? `0${toDate.getHours()}` : toDate.getHours()
    }:${
      toDate.getMinutes() < 10 ? `0${toDate.getMinutes()}` : toDate.getMinutes()
    }`;
  };

  return (
    <div
      className="notif"
      onDoubleClick={fn[2]}
      style={{
        border: `2px solid rgb(${color[0]}, ${color[1]}, ${color[2]})`,
      }}
    >
      <div className="name">{name}</div>
      <div className="time">
        Se déclenche tous les {toDayString()} à {toHourMinute()}
      </div>
      <div className="actions">
        <Button variant={paused ? "success" : "warning"} onClick={fn[0]}>
          {paused ? "Reprendre la notif" : "Pauser la notif"}
        </Button>
        <Button variant="danger" onClick={fn[1]}>
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default OneNotif;

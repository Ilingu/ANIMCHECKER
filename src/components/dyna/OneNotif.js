import React from "react";
// CSS
import { Button } from "react-bootstrap";

const OneNotif = ({ name, day, time, paused, fn }) => {
  const toDayString = () => {
    let dayVar = null;
    switch (day) {
      case "0":
        dayVar = "Dimanche";
        break;
      case "1":
        dayVar = "Lundi";
        break;
      case "2":
        dayVar = "Mardi";
        break;
      case "3":
        dayVar = "Mercredi";
        break;
      case "4":
        dayVar = "Jeudi";
        break;
      case "5":
        dayVar = "Vendredi";
        break;
      case "6":
        dayVar = "Samedi";
        break;
      default:
        dayVar = "Fatal Error";
        break;
    }
    return dayVar;
  };

  const toHourMinute = () => {
    let baseCalcul = Math.round(((time / 3600) * 30) / 0.5);
    let HMSplit = (baseCalcul / 60).toString().split(".");
    let decimalToMin =
      HMSplit.length === 1
        ? 0
        : parseFloat("0." + HMSplit[1].split("")[0] + HMSplit[1].split("")[1]) *
          60;

    return baseCalcul >= 60
      ? `${parseInt(HMSplit[0]) < 10 ? `0${HMSplit[0]}` : HMSplit[0]}:${
          Math.round(decimalToMin) < 10
            ? `0${Math.round(decimalToMin)}`
            : Math.round(decimalToMin)
        }`
      : `00:${baseCalcul}`;
  };

  return (
    <div
      className="notif"
      style={{
        border: `2px solid rgb(${Math.round(Math.random() * 255)}, ${Math.round(
          Math.random() * 255
        )}, ${Math.round(Math.random() * 255)})`,
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

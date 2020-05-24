import React from "react";

const AnimEp = ({ ObjInfo, play }) => {
  const EP = ObjInfo.Episodes.map((id) => (
    <div key={id.id} id={id.id} onClick={() => play(ObjInfo, id.id)}>
      <span className="fas fa-play"></span> Episode {id.id}
    </div>
  ));
  return (
    <div className="accordion-child" id={ObjInfo.name.split(" ").join("")}>
      <div className="name">{ObjInfo.name}</div>
      <div className="episode">{EP}</div>
    </div>
  );
};

export default AnimEp;

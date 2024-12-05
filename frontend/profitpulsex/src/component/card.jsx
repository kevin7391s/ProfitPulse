import React from "react";

const Card = ({ children, selected, className }) => {
  return (
    <div
      className={`w-full rounded-md p-4 border-1 shadow-2xl ${
        selected
          ? "bg-black text-lightgreen shadow-2xl "
          : "bg-gray-800 text-white shadow-2xl "
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;

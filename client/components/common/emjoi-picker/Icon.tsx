import * as React from "react";

import { exhaustiveTypeCheck } from "./helpers/emjoi-helpers";
import PngIcon from "./icons/PngIcon";
import type { IconNames } from "./types";

export const Icon = ({
  iconName,
  isActive,
  normalColor,
  activeColor,
}: {
  iconName: IconNames | "Close" | "QuestionMark" | "Backspace";
  isActive: boolean;
  normalColor: string;
  activeColor: string;
}) => {
  const color = isActive ? activeColor : normalColor;
  switch (iconName) {
    case "Smile":
      return <PngIcon fill={color} source={require("./icons/smile.png")} />;
    case "Trees":
      return <PngIcon fill={color} source={require("./icons/trees.png")} />;
    case "Pizza":
      return <PngIcon fill={color} source={require("./icons/pizza.png")} />;
    case "Plane":
      return <PngIcon fill={color} source={require("./icons/plane.png")} />;
    case "Football":
      return <PngIcon fill={color} source={require("./icons/football.png")} />;
    case "Lightbulb":
      return <PngIcon fill={color} source={require("./icons/lightbulb.png")} />;
    case "Flag":
      return <PngIcon fill={color} source={require("./icons/flag.png")} />;
    case "Ban":
      return <PngIcon fill={color} source={require("./icons/ban.png")} />;
    case "Users":
      return <PngIcon fill={color} source={require("./icons/users.png")} />;
    case "Search":
      return <PngIcon fill={color} source={require("./icons/search.png")} />;
    case "Close":
      return <PngIcon fill={color} source={require("./icons/close.png")} />;
    case "Clock":
      return <PngIcon fill={color} source={require("./icons/clock.png")} />;
    case "QuestionMark":
      return (
        <PngIcon fill={color} source={require("./icons/questionMark.png")} />
      );
    case "Backspace":
      return <PngIcon fill={color} source={require("./icons/backspace.png")} />;
    default:
      exhaustiveTypeCheck(iconName);
      return null;
  }
};

import {createProcess} from "../Helper";
export Change from "./Change";
export Wait from "./Wait";

export default function Location() {
  return createProcess("Location", function() {
    return this.sendAction("location");
  });
}

export const Get = Location;
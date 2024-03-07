import React from "react";
import { ModeToggle } from "./ModeToggle";

type Props = {};

const Navbar = (props: Props) => {
  return (
    <div className="w-full h-24 flex items-center justify-between">
      <div className="font-black text-4xl tracking-tighter">Cover.AI</div>
      <ModeToggle />
    </div>
  );
};

export default Navbar;

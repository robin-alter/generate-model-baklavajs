import { Node } from "@baklavajs/core";

export class SideBarNode extends Node {
    constructor() {
        super();
        this.type = "SideBarNode";
        this.name = "";
        this.addOption("Open Sidebar", "ButtonOption", () => ({testtext: "any"}), "SliderOption", "InputOption")
    }
}

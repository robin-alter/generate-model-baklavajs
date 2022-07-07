import { Node } from "@baklavajs/core";

export class ColorNode extends Node {
    constructor(name, value) {
        super();
        this.type = "ColorNode";
        this.name = name;
        this.value = value;
    }

}

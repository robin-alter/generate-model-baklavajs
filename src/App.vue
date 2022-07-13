<template>
    <div style="height: 80vh; width: 100vw">
        <baklava-editor :plugin="viewPlugin" />
    </div>
</template>

<script>
import { Editor } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";
import { OptionPlugin } from "@baklavajs/plugin-options-vue";
import { Engine } from "@baklavajs/plugin-engine";
import { ColorNode } from "./ColorNode";
import { SideBarNode } from "./SideBarNode";
import { Token } from "./token";
import { Relation } from "./relation";

export default {
    components: { },
    data() {
        return {
            editor: new Editor(),
            viewPlugin: new ViewPlugin(),
            engine: new Engine(true),
            color : 'green',
            thickness: 10,
            mode: "absolute"
        };
    },
    created() {
        this.editor.use(this.viewPlugin);
        this.editor.use(new OptionPlugin());
        this.editor.use(this.engine);

        this.editor.registerNodeType("ColorNode", ColorNode);
        this.editor.registerNodeType("SideBarNode", SideBarNode);

        const tokenList = this.generateRandomTokens(5);
        const relationList = this.generateRandomRelations(5, tokenList);

        this.initializeGraph(tokenList, relationList);

        this.engine.calculate();
    },
    methods: {
        generateRandomTokens(amount) {
            var tokenList = [];
            for(let i = 0; i < amount; i++) {
                var absValue = Math.floor(Math.random() * 250);
                var relValue = Math.floor(Math.random() * 250);
                var element = new Token("Element".concat(i.toString()),absValue, relValue);
                tokenList.push(element)
            }
            return tokenList;
        },
        generateRandomRelations(amount, tokenList) {
            var relationList = [];
            for (let i= 0; i< amount; i++) {
                var start = tokenList[Math.floor(Math.random() * tokenList.length)];
                var end = tokenList[Math.floor(Math.random() * tokenList.length)];
                while(start == end) {
                    end = tokenList[Math.floor(Math.random() * tokenList.length)];
                } 
                var relation = new Relation("Relation".concat(i.toString()),start,end);
                relationList.push(relation);
            }
            return relationList;
        },
        initializeGraph(tokenList, relationList) {
            var nodeList = this.createNodeList(tokenList);
            this.placeNodes(nodeList, 100 , 100 , 300, 1200);
            this.connectNodes(nodeList, relationList);
            this.partitionNodes(nodeList);
        },
        createNodeList(tokenList) {
            var nodeList = [];

            tokenList.forEach(token => {
                var node = this.createNode(ColorNode,token.name, token.absValue, token.relValue);
                nodeList.push(node);
            });
            return nodeList
        },
        createNode(nodeType, name, absValue, relValue) {
            return new nodeType(name, absValue, relValue);
        },       
        connectNodes(nodeList, relationList) {
            relationList.forEach(relation => {
                nodeList.forEach(node => {
                    if(node.name == relation.start.name) {
                        relation.start = node;
                    } else if(node.name == relation.end.name) {
                        relation.end = node;
                    }
                }
                )
                this.addConnection(relation.start,relation.end);
            }
            )
        },
        addConnection(start,end){
            var inputName = (end.interfaces.size).toString();
            var outputName = (start.interfaces.size).toString();
            end.addInputInterface(inputName);
            start.addOutputInterface(outputName);
            this.editor.addConnection(
                end.getInterface(inputName),
                start.getInterface(outputName)
            );
        },
        placeNodes(nodeList, xStart, yStart, step, max) {
            var x = xStart;
            var y = yStart;
            nodeList.forEach(node => {   
                this.editor.addNode(node);
                node.position.x = x;
                node.position.y = y;
                if(x <= max){
                    x = x + step;
                } else {
                    y = y + step;
                    x = xStart;
                }
            });
        },
        partitionNodes(nodeList) {
            var maxVal = 0;
            if(this.mode == "absolute") {
                nodeList.forEach(node => {
                    var value = node.absValue;
                    if(value >= maxVal) {
                            maxVal = value;
                        }
                    });
                    var val80 = 0.8 * maxVal;
                    var val60 = 0.6 * maxVal;
                    var val40 = 0.4 * maxVal;
                    var val20 = 0.2 * maxVal;
                nodeList.forEach(node => {
                    var value = node.absValue;
                    if(value >= val80) {
                        node.customClasses = 'val80';
                    } else if (val80 > value && value >= val60) {
                        node.customClasses = 'val60';
                    }               
                    else if (val60 > value && value >= val40) {
                        node.customClasses = 'val40';
                    }
                    else if (val40 > value && value >= val20) {
                        node.customClasses = 'val20';
                    }
                    else if (val20 > value) {
                        node.customClasses = 'val0';
                    }                
                });
            } else if (this.mode == "relative") {
                nodeList.forEach(node => {
                    var value = node.relValue;
                    if(value >= maxVal) {
                            maxVal = value;
                        }
                });
                val80 = 0.8 * maxVal;
                val60 = 0.6 * maxVal;
                val40 = 0.4 * maxVal;
                val20 = 0.2 * maxVal;

                nodeList.forEach(node => {
                    var value = node.relValue;
                    if(value >= val80) {
                        node.customClasses = 'val80';
                    } else if (val80 > value && value >= val60) {
                        node.customClasses = 'val60';
                    }               
                    else if (val60 > value && value >= val40) {
                        node.customClasses = 'val40';
                    }
                    else if (val40 > value && value >= val20) {
                        node.customClasses = 'val20';
                    }
                    else if (val20 > value) {
                        node.customClasses = 'val0';
                    }                
                });
            } else {
                nodeList.forEach(node => {
                    node.customClasses = '';
                });
            }
        },
        changeThickness(newThickness) {
            this.thickness = newThickness;
        },
        changeColor(newColor) {
            this.color = newColor;
        },
        changeMode(newMode) {
            this.mode  = newMode;
        }
    }
};
</script>

<style>
.connection {
    stroke-width: v-bind(thickness);
}
.val80 {
    background: v-bind(color);
    filter: brightness(200%);
}
.val60 {
    background: v-bind(color);
    filter: brightness(160%);
}
.val40 {
    background: v-bind(color);
    filter: brightness(120%);
}
.val20 {
    background: v-bind(color);
    filter: brightness(80%);
}
.val0 {
    background: v-bind(color);
    filter: brightness(40%);
}
</style>
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
            engine: new Engine(true)
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
                var value = Math.floor(Math.random() * 250);
                var element = new Token("Element".concat(i.toString()),value);
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
        },
        createNodeList(tokenList) {
            var nodeList = [];

            tokenList.forEach(token => {
                var node = this.createNode(ColorNode,token.name, token.value);
                nodeList.push(node);
            });
            return nodeList
        },
        createNode(nodeType, name, value) {
            return new nodeType(name, value);
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
        }
    }
};
</script>
<template>
    <div style="height: 100vh; width: 100vw">
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
        // Register the plugins
        // The view plugin is used for rendering the nodes
        this.editor.use(this.viewPlugin);
        // The option plugin provides some default option UI elements
        this.editor.use(new OptionPlugin());
        // The engine plugin calculates the nodes in the graph in the
        // correct order using the "calculate" methods of the nodes
        this.editor.use(this.engine);

        // Show a minimap in the top right corner
        this.viewPlugin.enableMinimap = false;

        // register the nodes we have defined, so they can be
        // added by the user as well as saved & loaded.
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
            var x = 100;
            var y = 100;
            var nodeList = [];

            tokenList.forEach(token => {
                var node = this.addNodeWithCoordinates(ColorNode, token.name, token.value, x, y);
                nodeList.push(node);
                if(x <= 1200){
                    x = x + 300;
                } else {
                    y = y + 300;
                    x = 100;
                }
            });
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
        addNodeWithCoordinates(nodeType, name, value, x, y) {
            const n = new nodeType(name, value);
            
            this.editor.addNode(n);
            n.position.x = x;
            n.position.y = y;
            return n;
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
        }

    }
};
</script>
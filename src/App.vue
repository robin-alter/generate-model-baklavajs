<template>
    <div style="height: 80vh; width: 80vw">
        <baklava-editor :plugin="viewPlugin" />
        <div class="sideBar">
            Options
            <button @click="resetGraph()">Reset Graph</button>
            <button @click="toggleHeatmap()">Toggle Heatmap</button>
            <button @click="toggleValue()">Toggle Values</button>
        </div>
        <div class="legend">
            <div class="legend0">{{maximum*0}} - {{Math.floor(maximum*0.2)}}</div>
            <div class="legend20">{{Math.floor(maximum*0.2)+1}} - {{Math.floor(maximum*0.4)}}</div>
            <div class="legend40">{{Math.floor(maximum*0.4)+1}} - {{Math.floor(maximum*0.6)}}</div>
            <div class="legend60">{{Math.floor(maximum*0.6)+1}} - {{Math.floor(maximum*0.8)}}</div>
            <div class="legend80">{{Math.floor(maximum*0.8)+1}} - {{Math.floor(maximum)}}</div>
            Legend
        </div>
    </div>
</template>

<script>
import { Editor } from "@baklavajs/core";
import { ViewPlugin } from "@baklavajs/plugin-renderer-vue";
import { OptionPlugin } from "@baklavajs/plugin-options-vue";
import { Engine } from "@baklavajs/plugin-engine";
import { ColorNode } from "./ColorNode";
import { RelationNode} from "./RelationNode"
import { Token } from "./token";
import { Relation } from "./relation";

export default {
    components: {
    },
    data() {
        return {
            editor: new Editor(),
            viewPlugin: new ViewPlugin(),
            engine: new Engine(true),
            tokenList: [],
            relationList: [],
            color : 'green',
            mode: "absolute",
            maximum: 0,
            absMax: 0,
            relMax: 0
        };
    },
    created() {
        this.editor.use(this.viewPlugin);
        this.editor.use(new OptionPlugin());
        this.editor.use(this.engine);

        this.editor.registerNodeType("ColorNode", ColorNode);
        this.editor.registerNodeType("RelationNode", RelationNode);

        this.tokenList = this.generateRandomTokens(2);
        this.relationList = this.generateRandomRelations(4);

        this.initializeGraph();
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
        generateRandomRelations(amount) {
            var relationList = [];
            for (let i= 0; i< amount; i++) {
                var start = this.tokenList[Math.floor(Math.random() * this.tokenList.length)];
                var end = this.tokenList[Math.floor(Math.random() * this.tokenList.length)];
                while(start == end) {
                    end = this.tokenList[Math.floor(Math.random() * this.tokenList.length)];
                } 
                var absValue = Math.floor(Math.random() * 250);
                var relValue = Math.floor(Math.random() * 250);
                var relation = new Relation("Relation".concat(i.toString()),absValue, relValue, start, end);
                relationList.push(relation);
            }
            return relationList;
        },
        initializeGraph() {
            var nodeList = this.createNodeListFromData();
            this.partitionNodes(nodeList);
            this.paintNodes(nodeList);
            this.placeNodesInEditor(nodeList, 100 , 100 , 300, 900);
            this.connectNodes();
        },
        createNodeListFromData() {
            var nodeList = [];
            this.tokenList.forEach(token => {
                var node = this.createNode(ColorNode,token.name, token.absValue, token.relValue);
                nodeList.push(node);
            });
            this.nodeList = nodeList;
            this.relationList.forEach(relation => {
                var start = 0;
                var end = 0;
                this.nodeList.forEach(node => {
                    if(node.name == relation.start.name) {
                        start = node;
                    } else if(node.name == relation.end.name) {
                        end = node;
                    }
                }
                )
                if(start != 0 && end != 0) {
                    var node = new RelationNode(relation.name, start, end, relation.absValue, relation.relValue)
                    nodeList.push(node);
                }
            }
            )
            this.nodeList = nodeList;
            return nodeList
        },
        createNode(nodeType, name, absValue, relValue) {
            return new nodeType(name, absValue, relValue);
        },     
        placeNodesInEditor(nodeList, xStart, yStart, step, max) {
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
        connectNodes() {
            var nodeList = this.getNodeList();
            nodeList.forEach(node => {
                if(node.type == "RelationNode") {
                    this.addConnection(node);
                }
            });
        },
        addConnection(node){
            var validInput = 0;
            var validOutput = 0;
            var inputName = 0;
            var outputName = 0;
            var end = node.end;
            var start = node.start;

            end.interfaces.forEach(inter => {
                if(inter.isInput) {
                    if(inter.connectionCount < 1) {
                        validInput = inter;
                    }
                }
            });
            start.interfaces.forEach(inter => {
                if(!inter.isInput) {
                    validOutput = inter;
                }
            })
            if(validInput != 0 && validOutput != 0) {
                this.editor.addConnection(
                    validInput,
                    node.getInterface(end.name)
                )
                this.editor.addConnection(
                    node.getInterface(start.name), 
                    validOutput
                )
            }   else if(validInput == 0 && validOutput != 0) {
                inputName = (end.interfaces.size).toString();
                end.addInputInterface(inputName);
                this.editor.addConnection(
                    end.getInterface(inputName),
                    node.getInterface(end.name)
                )
                this.editor.addConnection(
                    node.getInterface(start.name), 
                    validOutput
                )
            }   else if(validInput != 0 && validOutput == 0) {
                outputName = (start.interfaces.size).toString();
                start.addOutputInterface(outputName);
                this.editor.addConnection(
                    validInput,
                    node.getInterface(end.name)
                )
                this.editor.addConnection(
                    start.getInterface(outputName),
                    node.getInterface(start.name)
                )
            }   else {
                inputName = (end.interfaces.size).toString();
                outputName = (start.interfaces.size).toString();
                end.addInputInterface(inputName);
                start.addOutputInterface(outputName);
                this.editor.addConnection(
                    end.getInterface(inputName),
                    node.getInterface(end.name)
                );                
                this.editor.addConnection(
                    start.getInterface(outputName),
                    node.getInterface(start.name)
                );
            }
        },
        partitionNodes(nodeList) {
            var maximums = this.getMaximums(nodeList);
            var absMax = maximums[0];
            var relMax = maximums[1];

            var abs80 = absMax *0.8;
            var abs60 = absMax *0.6;
            var abs40 = absMax *0.4;
            var abs20 = absMax *0.2;
            
            var rel80 = relMax *0.8;
            var rel60 = relMax *0.6;
            var rel40 = relMax *0.4;
            var rel20 = relMax *0.2;
            nodeList.forEach(node => {
                var absVal = node.absValue;
                var relVal = node.relValue;
                if(absVal >= abs80) {
                    node.absRank = 80;
                } 
                else if (abs80 > absVal && absVal >= abs60) {
                    node.absRank = 60;
                }               
                else if (abs60 > absVal && absVal >= abs40) {
                    node.absRank = 40;
                }
                else if (abs40 > absVal && absVal >= abs20) {
                    node.absRank = 20;
                }
                else if (abs20 > absVal) {
                    node.absRank = 0;
                }

                if(relVal >= rel80) {
                    node.relRank = 80;
                } 
                else if (rel80 > relVal && relVal >= rel60) {
                    node.relRank = 60;
                }               
                else if (rel60 > relVal && relVal >= rel40) {
                    node.relRank = 40;
                }
                else if (rel40 > relVal && relVal >= rel20) {
                    node.relRank = 20;
                }
                else if (rel20 > relVal) {
                    node.relRank = 0;
                }    
            });
        },
        getMaximums(nodeList) {
            var maximums = [];
            var maxAbs = 0;
            var maxRel = 0;
            nodeList.forEach(node => {
                var absVal = node.absValue;
                var relVal = node.relValue;
                if(absVal >= maxAbs) {
                    maxAbs = absVal;
                }
                if(relVal >= maxRel) {
                    maxRel = relVal;
                }
            });
            this.relMax = maxRel;
            this.absMax = maxAbs;
            maximums.push(maxAbs);
            maximums.push(maxRel);
            return maximums;
        },
        paintNodes(nodeList) {
            if(this.mode == "absolute") {
                this.maximum = this.absMax;
                nodeList.forEach(node => {
                    switch (node.absRank) {
                        case 80:
                            if(node.type=="RelationNode") {
                                node.customClasses = "val80Rel"
                            } else {
                            node.customClasses  = "val80";
                            }
                            break;                        
                        case 60:
                            if(node.type=="RelationNode") {
                                node.customClasses = "val60Rel"
                            } else {
                            node.customClasses = "val60";
                            }
                            break;                        
                        case 40:
                            if(node.type=="RelationNode") {
                                node.customClasses = "val40Rel"
                            } else {
                            node.customClasses = "val40";
                            }
                            break;                        
                        case 20:                            
                            if(node.type=="RelationNode") {
                                node.customClasses = "val20Rel"
                            } else {
                            node.customClasses = "val20";
                            }
                            break;              
                        case 0:                            
                            if(node.type=="RelationNode") {
                                node.customClasses = "val0Rel"
                            } else {
                            node.customClasses = "val0";
                            }
                            break;
                    }
                });
            } else if(this.mode == "relative") {
                this.maximum = this.relMax;
                nodeList.forEach(node => {
                    switch (node.relRank) {
                        case 80:
                            if(node.type=="RelationNode") {
                                node.customClasses = "val80Rel"
                            } else {
                            node.customClasses  = "val80";
                            }
                            break;                        
                        case 60:
                            if(node.type=="RelationNode") {
                                node.customClasses = "val60Rel"
                            } else {
                            node.customClasses = "val60";
                            }
                            break;                        
                        case 40:
                            if(node.type=="RelationNode") {
                                node.customClasses = "val40Rel"
                            } else {
                            node.customClasses = "val40";
                            }
                            break;                        
                        case 20:                            
                            if(node.type=="RelationNode") {
                                node.customClasses = "val20Rel"
                            } else {
                            node.customClasses = "val20";
                            }
                            break;              
                        case 0:                            
                            if(node.type=="RelationNode") {
                                node.customClasses = "val0Rel"
                            } else {
                            node.customClasses = "val0";
                            }
                            break;
                    }
                });
            } else {
                nodeList.forEach(node => {                           
                    if(node.type=="RelationNode") {
                        node.customClasses = "defaultRel"
                    } else {
                        node.customClasses = "default";
                    }
                });
            }
        },
        resetGraph(){
            this.removeAllNodes();
            this.initializeGraph();
        },
        toggleHeatmap() {
            if(this.mode == "absolute" || this.mode == "relative") {
                this.mode = "none";
            }else {
                this.mode = "absolute";
            }
            this.repaintGraph();
        },
        toggleValue() {
            if(this.mode == "absolute") {
                this.mode = "relative";
            } else if(this.mode == "relative")  {
                this.mode = "absolute";
            } else {
                this.mode = "absolute";
            }
            this.repaintGraph();
        },
        repaintGraph() {
            var nodeList = this.getNodeList();
            var positions = this.saveNodePositions(nodeList);
            this.removeAllNodes();
            this.paintNodes(nodeList);
            this.placeAllNodes(nodeList, positions);
            this.connectNodes();
        },
        saveNodePositions(nodeList) {
            var positions =  {};
            nodeList.forEach(node => {
                positions[node.name] = [node.position.x,node.position.y];
            });
            return positions;
        },
        placeAllNodes(nodeList, positions){
            nodeList.forEach(node => {
                this.editor.addNode(node);
                node.position.x = positions[node.name][0];
                node.position.y = positions[node.name][1];
            });
        },
        removeAllNodes() {
            var nodeList = this.getNodeList();
            nodeList.forEach(node => {
                this.editor.removeNode(node);
            });
        },
        getNodeList() {
            var nodeList = [];
            this.editor.nodes.forEach(node => {
                nodeList.push(node);
            });
            return nodeList;
        }
    }
};
</script>

<style >

.--input {
    max-height: 0px;
}

.--output {
    max-height: 0px;
}

.__port{
        opacity: 0;
}
.val80 {
    text-align: center;
    background: v-bind(color);
    filter: brightness(200%);
}
.val80 .__title{
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
}
.val60 {
    text-align: center;
    background: v-bind(color);
    filter: brightness(160%);
}
.val60 .__title{
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
}
.val40 {
    text-align: center;
    background: v-bind(color);
    filter: brightness(120%);
}
.val40 .__title{
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
}
.val20 {
    text-align: center;
    background: v-bind(color);
    filter: brightness(80%);
}
.val20 .__title{
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
}
.val0 {
    text-align: center;
    background: v-bind(color);
    filter: brightness(40%);
}
.val0 .__title{
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
}

.val80Rel {
    text-align: center;
    background: v-bind(color);
    filter: brightness(200%);
    max-width: 8rem;
}
.val80Rel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
}
.val60Rel {
    text-align: center;
    background: v-bind(color);
    filter: brightness(160%);
    max-width: 8rem;
}
.val60Rel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
}
.val40Rel {
    text-align: center;
    background: v-bind(color);
    filter: brightness(120%);
    max-width: 8rem;
}
.val40Rel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
}
.val20Rel {
    text-align: center;
    background: v-bind(color);
    filter: brightness(80%);
    max-width: 8rem;
}
.val20Rel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
}
.val0Rel {
    text-align: center;
    background: v-bind(color);
    filter: brightness(40%);
    max-width: 8rem;
}
.val0Rel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
}

.default {
    text-align: center;
}
.default .__title{
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 2rem;
}

.defaultRel {
    text-align: center;
    max-width: 8rem;
}
.defaultRel .__title {
    overflow-wrap: break-word;
    max-height: fit-content;
    font-size: 1.2rem;
}
.sideBar {
    text-align: center;
    font-size: 40px;
    position: absolute;
    right: 3.3vw;
    top: 0.9vh;
    width: 15vw;
    height: 79.5vh;
    border: 2px solid #000000
}
.legend {
    position: absolute;
    left: 0.5vw;
    height: 19.5vh;
    width: 95vw;
    border:2px solid #000000;
    line-height: 20vh;
    text-align: right;
    font-size: 80px;
}
.legend0 {
    background: v-bind(color);
    filter: brightness(40%);
    position: absolute;
    left: 0.5vw;
    top: 0.5vh;
    height: 17vh;
    width: 14vw;
    border:2px solid #000000;
    text-align: center;
    line-height: 15vh;
    font-size: 30px;
}
.legend20 {
    background: v-bind(color);
    filter: brightness(80%);
    position: absolute;
    left: 15.5vw ;
    top: 0.5vh;
    height: 17vh;
    width: 14vw;
    border:2px solid #000000;
    text-align: center;
    line-height: 15vh;
    font-size: 30px;
}
.legend40 {
    background: v-bind(color);
    filter: brightness(120%);
    position: absolute;
    left: 30.5vw;
    top: 0.5vh;
    height: 17vh;
    width: 14vw;
    border:2px solid #000000;
    text-align: center;
    line-height: 15vh;
    font-size: 30px;
}
.legend60 {
    background: v-bind(color);
    filter: brightness(160%);
    position: absolute;
    left: 45.5vw;
    top: 0.5vh;
    height: 17vh;
    width: 14vw;
    border:2px solid #000000;
    text-align: center;
    line-height: 15vh;
    font-size: 30px;
}
.legend80 {
    background: v-bind(color);
    filter: brightness(200%);
    position: absolute;
    left: 60.5vw;
    top: 0.5vh;
    height: 17vh;
    width: 14vw;
    border:2px solid #000000;
    text-align: center;
    line-height: 15vh;
    font-size: 30px;
}
</style>
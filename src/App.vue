<script>
import ModelView from './ModelView.vue'
import {tore_codes, tore_relationships } from "./TORE";

export default {
  components: {
    ModelView
  },
  methods: {
    generateRandomCodeFrequencies() {
      var tore_code_frequency = {};
      var frequencies = [0, 0];
      var name = 0;
      for(let i = 0; i< tore_codes.length; i++) {
          frequencies[0] = Math.floor(Math.random() * 250);
          frequencies[1] = Math.floor(Math.random() * 60);
          name = tore_codes[i];
          tore_code_frequency[name] = [frequencies[0], frequencies[1]];
      }
      return tore_code_frequency;
    },
    generateRandomRelationFrequencies() {
      var tore_relationship_frequency = {};
      var frequencies = [0, 0];
      var name = 0;
      for(let i = 0; i< 12; i++) {
          frequencies[0] = Math.floor(Math.random() * 60);
          frequencies[1] = Math.floor(Math.random() * 60);
          name = Object.keys(tore_relationships)[i];
          tore_relationship_frequency[name] = [frequencies[0], frequencies[1]];
      }
      return tore_relationship_frequency;
    }
  }
}
</script>

<template>
  <ModelView 
  :tore_code_frequency = "this.generateRandomCodeFrequencies()" 
  :tore_relationship_frequency = "this.generateRandomRelationFrequencies()"
  />
</template>
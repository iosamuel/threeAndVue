<template>
  <div id="app">
    <h4>Click the DOG! <span class="clicked-dog" v-if="clickedTimes">Woof! x{{clickedTimes}}</span></h4>
    <h3 v-if="clickedTimes >= 2">Love this penguin!</h3>
    <canvas></canvas>
    <p>
      Checkout the code at <a href="https://github.com/iosamuel/threeAndVue" target="_blank" rel="noreferrer">https://github.com/iosamuel/threeAndVue</a>
    </p>
  </div>
</template>

<script>
import main from "./app.js"

export default {
  data() {
    return {
      clickedTimes: 0
    }
  },
  mounted() {
    main(this.$data);
  }
}
</script>

<style scoped>
  * {
    font-family: sans-serif;
  }

  canvas {
    width: 100%;
    height: 100%;
  }

  h4 span {
    color: rgb(40, 190, 209);
  }

  h3 {
    color:#8627de;
  }
</style>

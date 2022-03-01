<template>
  <div v-if="!completed">
    <TransitionGroup
        tag="div"
        :css="false"
        class="absolute top-0"
        @enter="onEnter"
    >
      <div
          v-for="({ size, left, velocity, valid, clicked }, index) in tokens"
          :key="`${index}:${size}:${left}:${velocity}:${valid}`"
          :style="`top: -150px;width: ${size}px;height: ${size}px;left: ${left}px;transition: transform ${velocity}ms linear;`"
          :data-index="index"
          class="absolute cursor-pointer"
          @click.prevent="updateScore(index)"
      >
        <img src="/logo.svg" :class="{'grayscale-[75%]': !valid, rotate: clicked, 'hover:scale-110': true }" />
      </div>
    </TransitionGroup>
    <h2 class="text-5xl text-center mb-6">{{ text }}</h2>
    <Button v-if="!started" @click="start" class="z-50">Start</Button>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from './Button.vue'

const tokens = ref([])
const score = ref(0)
const text = ref('Collect 15 URN to mint')
const started = ref(false)
const completed = ref(false)
let interval = null

const rand = (min, max) => Math.round(Math.random() * (max-min) + min)

const updateScore = index => {
  if (tokens.value[index].valid) {
    const audio = new Audio('win.wav')
    audio.play()
    if (!tokens.value[index].clicked) {
      score.value++
      tokens.value[index].clicked = true
    }
    if (score.value >= 15) {
      clearInterval(interval)
      completed.value = true
    }
  } else {
    const audio = new Audio('dud.wav')
    audio.play()
    score.value--
  }
  text.value = `${score.value}`
}

const onEnter = el => {
  setTimeout(() => el.classList.add('move'), 50);
}

const generate = () => {
  setTimeout(() => {
    tokens.value.push({
      size: rand(100, 150),
      left: rand(50, window.innerWidth - 200),
      velocity: rand(850, 7000),
      valid: Math.round(Math.random()),
      clicked: false
    })
  }, rand(50, 1000))
}

const start = async () => {
  started.value = true
  text.value = 'Collect ONLY the blue URN'
  await new Promise(resolve => setTimeout(() => resolve(), 3500))
  text.value = 'Ready?'
  await new Promise(resolve => setTimeout(() => resolve(), 3500))
  text.value = 'Go!'
  for (let i = 0;i < 3;i++) {
    generate()
  }
  interval = setInterval(() => {
    for (let i = 0;i < 3;i++) {
      generate()
    }
  }, 3000)
}
</script>

<style>
.move {
  transform: translateY(120vh);
}
.rotate{
  animation: rotate 1.5s linear infinite;
}
@keyframes rotate {
  to{ transform: rotate(360deg); }
}
</style>

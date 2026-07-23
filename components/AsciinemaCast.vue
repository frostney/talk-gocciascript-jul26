<script setup>
import { create } from 'asciinema-player'
import 'asciinema-player/dist/bundle/asciinema-player.css'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import castUrl from '../test.cast?url'

const container = ref(null)
let player

onMounted(() => {
  player = create(castUrl, container.value, {
    autoPlay: true,
    controls: true,
    fit: 'both',
    idleTimeLimit: 1.5,
    terminalFontSize: '13px',
  })
})

onBeforeUnmount(() => {
  player?.dispose()
})
</script>

<template>
  <div ref="container" class="goccia-asciinema" />
</template>

<style>
.goccia-asciinema {
  height: 20rem;
  overflow: hidden;
  border: 1px solid var(--goccia-rule);
  border-radius: 1rem;
  background: var(--goccia-console);
  box-shadow: 0 2px 0 rgb(0 0 0 / 0.3), 0 18px 42px -28px rgb(0 0 0 / 0.78);
}

.goccia-asciinema .ap-wrapper {
  height: 100%;
  max-width: 100%;
  background: var(--goccia-console);
}

.goccia-asciinema .ap-terminal {
  border-radius: 1rem 1rem 0 0;
}
</style>

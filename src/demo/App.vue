<script setup lang="ts">
import { ref, h, type Ref } from 'vue'
// import { GridDragResize, type GridDragResizeProps } from 'vue3-grid-drag-resize'
// import { GridDragResize } from '../../dist/vue3-grid-drag-resize/index.js'
import { GridDragResize } from '@/lib/components/GridDragResize'
import type { GridDragResizeProps } from '@/lib/components/GridDragResize/types'

const children: Ref<GridDragResizeProps['children']> = ref([
  {
    dragHandler: '.demo-item>button',
    render: () => h('div', { class: "demo-item", style: { background: '#eb9c64' } }, [h('button', 'drag handler')])
  },
  {
    columnStart: 2,
    draggable: false,
    render: () => h('div', { class: "demo-item", style: { background: '#ff8789' } }, 'undraggable')
  },
  {
    rowStart: 2,
    columnStart: 2,
    resizable: false,
    render: () => h('div', { class: "demo-item", style: { background: '#554e4f' } }, 'unresizable')
  },
  {
    rowStart: 2,
    rowEnd: 4,
    columnStart: 4,
    columnEnd: 5,
    render: () => h('div', { class: "demo-item", style: { background: '#8fbf9f' } }, '2')
  },
  {
    rowStart: 4,
    rowEnd: 6,
    columnStart: 2,
    columnEnd: 4,
    render: () => h('div', { class: "demo-item", style: { background: '#346145' } }, '3')
  },
  {
    rowStart: 4,
    rowEnd: 5,
    columnStart: 1,
    columnEnd: 2,
    render: () => h('div', { class: "demo-item", style: { background: '#c2baa6' } }, '4')
  },
])
</script>

<template>
<div class="page">
  <GridDragResize :columns="4" :gap="10" :row-size="100" :row-expandable="true" :readonly="false" :children="children">
  </GridDragResize>
  <!-- <div v-html="JSON.stringify(children, null, 2).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp; ')"></div> -->
</div>
</template>

<style lang="less">
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  font-weight: normal;
}

body {
  min-height: 100vh;
  color: var(--color-text);
  background: var(--color-background);
  transition:
    color 0.5s,
    background-color 0.5s;
  line-height: 1.6;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  font-size: 15px;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
<style lang="less">
.page {
  padding: 32px;
}

.demo-item {
  padding: 10px;
  height: 100%;
}

.grid-drag-resize {
  background-color: #eee;

  .grid-drag-resize__item {
    background-color: #ddd;

    &--dragging {
      box-shadow: 0 0 6px 2px #0000ff;
    }

    &--selected {
      box-shadow: 0 0 6px 2px #ff00ff;
    }
  }
}
</style>

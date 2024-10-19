<script setup lang="ts">
import { ref, h, type Ref } from 'vue'

// Build test:
// import { GridDragResize, type GridDragResizeProps } from 'vue3-grid-drag-resize'
// import { GridDragResize } from '../../dist/index.js'

import { GridDragResize } from '@/lib/components/GridDragResize'
import type {
  GridDragResizeProps,
  GridDragResizeItemProps
} from '@/lib/components/GridDragResize/types'

import ComponentA from '@/demo/components/ComponentA.vue'
import ComponentB from '@/demo/components/ComponentB.vue'
import ComponentC from '@/demo/components/ComponentC.vue'
import ComponentD from '@/demo/components/ComponentD.vue'
import ComponentG from '@/demo/components/ComponentG.vue'

// 生成 render
function candidateRender(
  columns: number,
  rows: number,
  background: string,
  props: GridDragResizeItemProps
) {
  if (
    [props.columnStart, props.columnEnd, props.rowStart, props.rowEnd].every((o) => o !== void 0)
  ) {
    const info = [h('div', `${props.columns} x ${props.rows}`)]
    return h('div', { class: 'demo-item', style: { background } }, info)
  } else {
    return h('div', { class: 'demo-item', style: { background } }, [
      h('div', `${props.columns ?? columns}x${props.rows ?? rows}`)
    ])
  }
}

// 生成拖入内容
function createCandidate(
  columns = 1,
  rows = 1,
  columnStart = 1,
  rowStart = 1,
  background = '#fff'
) {
  return {
    columns,
    rows,
    columnStart,
    rowStart,
    render: (props: GridDragResizeItemProps) => candidateRender(columns, rows, background, props)
  } as GridDragResizeItemProps
}

// 待拖入内容
const candidate: Ref<GridDragResizeProps['children']> = ref([
  createCandidate(1, 1, 1, 1, '#E09F6D'),
  createCandidate(2, 1, 2, 1, '#6c35de'),
  createCandidate(3, 1, 1, 2, '#ffc7ff'),
  createCandidate(2, 2, 4, 1, '#282828'),
  {
    rowStart: 1,
    columns: 2,
    columnStart: 6,
    removable: false,
    render: () => h(ComponentA),
    data: {
      name: 'A'
    }
  },
  {
    rowStart: 2,
    columns: 2,
    columnStart: 6,
    draggable: false,
    render: () => h(ComponentB),
    data: {
      name: 'B'
    }
  },
  {
    rowStart: 3,
    columns: 2,
    columnStart: 6,
    resizable: false,
    render: () => h(ComponentC),
    data: {
      name: 'C'
    }
  },
  {
    rowStart: 4,
    columns: 2,
    columnStart: 6,
    droppableOut: false,
    render: () => h(ComponentD),
    data: {
      name: 'D'
    }
  },
  {
    rows: 2,
    rowStart: 5,
    columns: 2,
    columnStart: 6,
    dragHandler: '.demo-item>button',
    render: () =>
      h('div', { class: 'demo-item', style: { background: '#eb9c64' } }, [h('button', 'Drag here')])
  },
  {
    columns: 5,
    rows: 4,
    columnStart: 1,
    rowStart: 3,
    child: {
      className: 'group',
      columns: 3,
      rows: 3,
      children: []
    },
    data: {
      name: 'Group 3 x 3'
    }
  },
  {
    columns: 5,
    rows: 2,
    columnStart: 1,
    rowStart: 7,
    child: {
      className: 'group-undroppable',
      columns: 3,
      rows: 3,
      children: [],
      droppableIn: false
    },
    data: {
      name: 'Group but undroppable in'
    }
  },
  {
    columns: 5,
    rows: 2,
    columnStart: 1,
    rowStart: 9,
    readonly: true,
    child: {
      className: 'group-readonly',
      columns: 3,
      rows: 2,
      children: [createCandidate(1, 1, 1, 2, '#E09F6D'), createCandidate(1, 1, 3, 2, '#E09F6D')]
    },
    data: {
      name: 'Group but readonly'
    }
  }
])

// 已拖入内容
const children: Ref<GridDragResizeProps['children']> = ref([
  {
    rowStart: 2,
    rowEnd: 6,
    columnStart: 2,
    columnEnd: 8,
    render: () => h(ComponentG),
    data: {
      name: 'Component G'
    }
  }
])

// 拖入之前进行处理（异步）
async function beforeDrop(child: GridDragResizeItemProps): Promise<GridDragResizeItemProps> {
  return await (() =>
    new Promise((resolve) => {
      setTimeout(() => {
        child.data = {
          ...(child.data ?? {}),
          time: Date.now()
        }
        resolve(child)
      }, 100)
    }))()
}
</script>

<template>
  <!-- GridDragResize: 状态共享 | State share -->
  <GridDragResize class="page">
    <section style="padding: 4px; border: 1px solid #666">
      <div
        v-html="JSON.stringify(candidate, null, 2).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp; ')"
      ></div>
    </section>
    <section>
      <GridDragResize
        :column-size="50"
        :row-size="50"
        :gap="10"
        overflow="hidden"
        rowExpandable
        columnExpandable
        v-model:children="candidate"
      ></GridDragResize>
    </section>
    <div style="display: flex; align-items: center; justify-content: center">
      <span>&lt;-&gt;</span>
    </div>
    <section>
      <GridDragResize
        :column-size="50"
        :row-size="50"
        :gap="10"
        overflow="hidden"
        columnExpandable
        rowExpandable
        :beforeDrop="beforeDrop"
        v-model:children="children"
      ></GridDragResize>
    </section>
    <section style="padding: 4px; border: 1px solid #666">
      <div
        v-html="JSON.stringify(children, null, 2).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp; ')"
      ></div>
    </section>
  </GridDragResize>
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
  transition:
    color 0.5s,
    background-color 0.5s;
  background: var(--color-background);
  color: var(--color-text);
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
  text-rendering: optimizelegibility;
}
</style>

<style lang="less">
.grid-drag-resize {
  padding: 10px;
}
</style>

<style lang="less">
.page {
  display: grid;
  grid-template: 1fr/1fr 2fr 30px 2fr 1fr;
  height: 100vh;
  padding: 16px;
  gap: 10px;

  & > section {
    overflow: auto;
    border: 1px solid #666;
  }
}
</style>

<style lang="less">
.demo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 10px;
  color: #fff;
  line-height: 1.1em;
}

.group {
  padding: 10px;
  border: 1px solid #61bc84;

  &::before {
    content: 'Group 3 x 3';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    transform: translate(-50%, -50%);
    color: #999;
    text-align: center;
  }
}

.group-undroppable {
  padding: 10px;
  border: 1px solid #999;

  &::before {
    content: 'Group but undroppable in';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    transform: translate(-50%, -50%);
    color: #999;
    text-align: center;
  }
}

.group-readonly {
  padding: 10px;
  border: 1px solid #999;

  &::before {
    content: 'Group but readonly';
    position: absolute;
    top: 0%;
    left: 0%;
    width: 100%;
    color: #999;
    text-align: center;
  }
}
</style>

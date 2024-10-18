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
import ComponentG from '@/demo/components/ComponentG.vue'

let id = 0

// 已拖入内容
const children: Ref<GridDragResizeProps['children']> = ref([
  {
    rowStart: 4,
    rowEnd: 7,
    columnStart: 1,
    columnEnd: 3,
    data: {
      id: ++id
    },
    child: {
      className: 'demo-child',
      columns: 3,
      rows: 3,
      children: [
        {
          rowStart: 1,
          rows: 1,
          columnStart: 1,
          columns: 1,
          render: () => h('div', { class: 'demo-item', style: { background: '#346145' } }, 'Nest')
        },
        {
          rowStart: 2,
          rows: 2,
          columnStart: 2,
          columns: 2,
          render: () =>
            h('div', { class: 'demo-item', style: { background: '#6FBFF9' } }, 'by prop child')
        }
      ]
    }
  },
  {
    rowStart: 1,
    rowEnd: 4,
    columnStart: 4,
    columnEnd: 6,
    render: () => h(ComponentG),
    data: {
      id: ++id
    }
  },
  {
    removable: false,
    render: () => h(ComponentA),
    data: {
      id: ++id,
      name: 'ComponentA'
    }
  },
  {
    columnStart: 2,
    rowStart: 2,
    draggable: false,
    render: () => h(ComponentB),
    data: {
      id: ++id,
      name: 'ComponentB'
    }
  },
  {
    rowStart: 3,
    columnStart: 3,
    resizable: false,
    render: () => h(ComponentC),
    data: {
      id: ++id,
      name: 'ComponentC'
    }
  },
  {
    rowStart: 4,
    columnStart: 5,
    rows: 2,
    columns: 1,
    dragHandler: '.demo-item>button',
    render: () =>
      h('div', { class: 'demo-item', style: { background: '#eb9c64' } }, [
        h('button', 'Drag handler')
      ]),
    data: {
      id: ++id
    }
  },
  {
    rowStart: 2,
    rowEnd: 3,
    columnStart: 1,
    columnEnd: 2,
    render: () =>
      h('div', { class: 'demo-item', style: { background: '#8fbf9f' } }, 'Component D 1'),
    data: {
      id: ++id
    }
  },
  {
    rowStart: 4,
    rowEnd: 7,
    columnStart: 3,
    columnEnd: 5,
    data: {
      id: ++id
    },
    child: {
      className: 'demo-child',
      columns: 3,
      rows: 3,
      children: []
    }
  },
  {
    rowStart: 3,
    rowEnd: 4,
    columnStart: 1,
    columnEnd: 2,
    render: () =>
      h('div', { class: 'demo-item', style: { background: '#8fbf9f' } }, 'Component D2'),
    data: {
      id: ++id
    }
  }
])

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
function createCandidate(columns = 1, rows = 1, background = '#fff') {
  return {
    columns,
    rows,
    render: (props: GridDragResizeItemProps) => candidateRender(columns, rows, background, props)
  } as GridDragResizeItemProps
}

// 待拖入内容
const candidate: Ref<GridDragResizeProps['children']> = ref([
  createCandidate(1, 2, '#6c35de'),
  createCandidate(5, 1, '#ffc7ff'),
  {
    columns: 2,
    rows: 2,
    render: () => h(ComponentG)
  }
])

// 拖入子组件的数据项
const droppingChild: Ref<GridDragResizeItemProps | undefined> = ref()

// 开始拖入
function dragstart(e: DragEvent, idx: number) {
  // 目标 拖入子组件的数据项
  if (candidate.value?.[idx]) {
    const item = { ...candidate.value?.[idx] }
    item.data = { id: ++id }

    // 设置 拖入子组件的数据项
    droppingChild.value = item
  }
}

// 拖入终止
function dragend() {
  // 清除 拖入子组件的数据项
  droppingChild.value = undefined
}
</script>

<template>
  <div class="page">
    <header>
      <header>
        <div
          v-for="(item, idx) of candidate"
          :key="idx"
          draggable="true"
          @dragstart="dragstart($event, idx)"
          @dragend="dragend"
        >
          <component :is="item.render"></component>
        </div>
      </header>
      <footer
        v-html="JSON.stringify(children, null, 2).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp; ')"
      ></footer>
      <!-- <footer v-html="JSON.stringify(candidate, null, 2).replace(/\n/g, '<br>').replace(/\s/g, '&nbsp; ')"></footer> -->
    </header>
    <GridDragResize
      :columns="5"
      :rows="6"
      :gap="10"
      :row-size="100"
      :row-expandable="true"
      :readonly="false"
      v-model:children="children"
      :dropping-child="droppingChild"
    >
    </GridDragResize>
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
.page {
  display: flex;
  align-items: flex-start;
  min-height: 100vh;
  padding: 16px;

  // height: 100vh;
  // overflow: auto;
  & > header {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    align-self: stretch;
    width: 400px;
    margin-right: 32px;
    border: 1px solid #ddd;

    & > header,
    & > footer {
      height: 0;
      overflow: auto;
    }

    & > header {
      flex-grow: 2;

      & > div {
        height: 100px;
        border-bottom: 1px solid #eee;
        background-color: #fff;
        cursor: grab;
        user-select: none;

        &:last-child {
          height: 250px;
        }
      }
    }

    & > footer {
      flex-grow: 1;
      border-top: 1px solid #eee;
    }
  }
}

.demo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 10px;
  color: #fff;
  font-size: 18px;
  line-height: 1.1em;
}

.demo-child {
  padding: 20px;
  border: 1px solid #f00;
}

.grid-drag-resize {
  flex-grow: 1;
  background-color: #eee;

  &--dropping {
    box-shadow: 0 0 6px 2px #0f0 inset;
  }

  .grid-drag-resize__item {
    background-color: #ddd;

    &--dragging {
      box-shadow: 0 0 6px 2px #00f;
    }

    &--selected {
      box-shadow: 0 0 6px 2px #f0f;
    }
  }
}
</style>

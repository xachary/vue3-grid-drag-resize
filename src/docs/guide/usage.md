# 使用

## 引入组件

```ts
import { ref, h, type Ref } from 'vue'
import { nanoid } from 'nanoid'

import { GridDragResize, type GridDragResizeProps } from 'vue3-grid-drag-resize'
```

## 样式

```less
.grid-drag-resize {
  background-color: #eee;
  width: 80%;

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
```

## 拖动、调整大小

### 数据

```ts
import ComponentA from '@/demo/components/ComponentA.vue'
import ComponentB from '@/demo/components/ComponentB.vue'
import ComponentC from '@/demo/components/ComponentC.vue'

// 已拖入内容
const children: Ref<GridDragResizeProps['children']> = ref([
  {
    render: () => h(ComponentA),
    data: {
      id: nanoid()
    }
  },
  {
    columnStart: 2,
    rowStart: 2,
    draggable: false,
    render: () => h(ComponentB),
    data: {
      id: nanoid()
    }
  },
  {
    rowStart: 3,
    columnStart: 3,
    resizable: false,
    render: () => h(ComponentC),
    data: {
      id: nanoid()
    }
  },
  {
    rowStart: 4,
    columnStart: 4,
    dragHandler: '.demo-item>button',
    render: () =>
      h('div', { class: 'demo-item', style: { background: '#eb9c64' } }, [
        h('button', 'Drag handler')
      ]),
    data: {
      id: nanoid()
    }
  },
  {
    rowStart: 2,
    rowEnd: 4,
    columnStart: 1,
    columnEnd: 2,
    render: () => h('div', { class: 'demo-item', style: { background: '#8fbf9f' } }, 'Component D'),
    data: {
      id: nanoid()
    }
  },
  {
    rowStart: 3,
    rowEnd: 7,
    columnStart: 2,
    columnEnd: 3,
    render: () => h('div', { class: 'demo-item', style: { background: '#346145' } }, 'Component E'),
    data: {
      id: nanoid()
    }
  },
  {
    rowStart: 5,
    rowEnd: 7,
    columnStart: 3,
    columnEnd: 5,
    render: () => h('div', { class: 'demo-item', style: { background: '#c2baa6' } }, 'Component F'),
    data: {
      id: nanoid()
    }
  }
])
```

### 组件

```vue
<GridDragResize
  :columns="4"
  :gap="10"
  :row-size="100"
  :row-expandable="true"
  :readonly="false"
  v-model:children="children"
  :dropping-child="droppingChild"
>
</GridDragResize>
```

## 拖入

### 数据

```ts
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
    const info = [
      h('div', `${props.columns} x ${props.rows}`),
      h('div', `column: start ~ end = ${props.columnStart} ~ ${props.columnEnd}`),
      h('div', `row: start ~ end = ${props.rowStart} ~ ${props.rowEnd}`)
    ]
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
  createCandidate(1, 1, '#6c35de'),
  createCandidate(2, 3, '#ffc7ff'),
  createCandidate(4, 2, '#cb80ff')
])
```

### 拖入候选

```vue
<div
  v-for="(item, idx) of candidate"
  :key="idx"
  draggable="true"
  @dragstart="dragstart($event, idx)"
  @dragend="dragend"
>
    <component :is="item.render"></component>
</div>
```

### 事件处理

```ts
// 拖入子组件的数据项
const droppingChild: Ref<GridDragResizeItemProps | undefined> = ref()

// 开始拖入
function dragstart(e: DragEvent, idx: number) {
  // 目标 拖入子组件的数据项
  const item = candidate.value?.[idx]
  if (item) {
    item.data = { id: nanoid() }
    // 设置 拖入子组件的数据项
    droppingChild.value = item
  }
}

// 拖入终止
function dragend() {
  // 清除 拖入子组件的数据项
  droppingChild.value = undefined
}
```

## 完整示例

```vue
<script setup lang="ts">
import { ref, h, type Ref } from 'vue'
import { nanoid } from 'nanoid'

import { GridDragResize, type GridDragResizeProps } from 'vue3-grid-drag-resize'

import ComponentA from '@/demo/components/ComponentA.vue'
import ComponentB from '@/demo/components/ComponentB.vue'
import ComponentC from '@/demo/components/ComponentC.vue'

// 已拖入内容
const children: Ref<GridDragResizeProps['children']> = ref([
  {
    render: () => h(ComponentA),
    data: {
      id: nanoid()
    }
  },
  {
    columnStart: 2,
    rowStart: 2,
    draggable: false,
    render: () => h(ComponentB),
    data: {
      id: nanoid()
    }
  },
  {
    rowStart: 3,
    columnStart: 3,
    resizable: false,
    render: () => h(ComponentC),
    data: {
      id: nanoid()
    }
  },
  {
    rowStart: 4,
    columnStart: 4,
    dragHandler: '.demo-item>button',
    render: () =>
      h('div', { class: 'demo-item', style: { background: '#eb9c64' } }, [
        h('button', 'Drag handler')
      ]),
    data: {
      id: nanoid()
    }
  },
  {
    rowStart: 2,
    rowEnd: 4,
    columnStart: 1,
    columnEnd: 2,
    render: () => h('div', { class: 'demo-item', style: { background: '#8fbf9f' } }, 'Component D'),
    data: {
      id: nanoid()
    }
  },
  {
    rowStart: 3,
    rowEnd: 7,
    columnStart: 2,
    columnEnd: 3,
    render: () => h('div', { class: 'demo-item', style: { background: '#346145' } }, 'Component E'),
    data: {
      id: nanoid()
    }
  },
  {
    rowStart: 5,
    rowEnd: 7,
    columnStart: 3,
    columnEnd: 5,
    render: () => h('div', { class: 'demo-item', style: { background: '#c2baa6' } }, 'Component F'),
    data: {
      id: nanoid()
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
    const info = [
      h('div', `${props.columns} x ${props.rows}`),
      h('div', `column: start ~ end = ${props.columnStart} ~ ${props.columnEnd}`),
      h('div', `row: start ~ end = ${props.rowStart} ~ ${props.rowEnd}`)
    ]
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
  createCandidate(1, 1, '#6c35de'),
  createCandidate(2, 3, '#ffc7ff'),
  createCandidate(4, 2, '#cb80ff')
])

// 拖入子组件的数据项
const droppingChild: Ref<GridDragResizeItemProps | undefined> = ref()

// 开始拖入
function dragstart(e: DragEvent, idx: number) {
  // 目标 拖入子组件的数据项
  const item = candidate.value?.[idx]
  if (item) {
    item.data = { id: nanoid() }
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
    </header>
    <GridDragResize
      :columns="4"
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
  display: flex;
  align-items: flex-start;
  min-height: 100vh;

  // height: 100vh;
  // overflow: auto;
  & > header {
    display: flex;
    flex-direction: column;
    align-self: stretch;
    border: 1px solid #ddd;
    margin-right: 32px;

    & > header,
    & > footer {
      flex-grow: 1;
      height: 0;
      overflow: auto;
    }

    & > header {
      & > div {
        height: 100px;
        border-bottom: 1px solid #eee;
        cursor: grab;
        user-select: none;
        background-color: #fff;
      }
    }

    & > footer {
      border-top: 1px solid #eee;
    }
  }
}

.demo-item {
  padding: 10px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  line-height: 1.1em;
  color: #fff;
  flex-direction: column;
}

.grid-drag-resize {
  background-color: #eee;
  width: 80%;

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
```

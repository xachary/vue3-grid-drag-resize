<template>
  <div class="component-g">
    <header>
      <p>Component G</p>
    </header>
    <footer>
      <GridDragResize
        :columns="4"
        :rows="4"
        :gap="4"
        :beforeDrop="beforeDrop"
        v-model:children="children"
      >
      </GridDragResize>
    </footer>
  </div>
</template>

<style lang="less" scoped>
.component-g {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 10px;
  background: #345c81;
  color: #fff;
  line-height: 1.1em;

  & > header {
    flex-shrink: 0;
    padding-bottom: 10px;
    text-align: center;
  }

  & > footer {
    flex-grow: 1;
    height: 0;
    background-color: #fff;
  }
}
</style>

<script setup lang="ts">
import { ref, h, type Ref } from 'vue'

import { GridDragResize } from '@/lib/components/GridDragResize'
import type {
  GridDragResizeProps,
  GridDragResizeItemProps,
} from '@/lib/components/GridDragResize/types'

import ComponentH from '@/demo/components/ComponentH.vue'

// 已拖入内容
const children: Ref<GridDragResizeProps['children']> = ref([
  {
    rowStart: 2,
    rowEnd: 3,
    columnStart: 1,
    columnEnd: 2,
    render: () => h('div', { class: 'demo-item', style: { background: '#0085ff' } }, 'Child 1'),
  },
  {
    rowStart: 1,
    rowEnd: 2,
    columnStart: 2,
    columnEnd: 4,
    render: () => h('div', { class: 'demo-item', style: { background: '#c2402a' } }, 'Child 2'),
  },
  {
    columns: 2,
    render: () => h('div', { class: 'demo-item', style: { background: '#FF6347' } }, 'Child 3'),
  },
  {
    rowStart: 2,
    rowEnd: 5,
    columnStart: 3,
    columnEnd: 5,
    render: () => h(ComponentH),
    data: {
      name: 'Component H',
    },
  },
])

// 拖入之前进行处理（同步）
function beforeDrop(child: GridDragResizeItemProps): GridDragResizeItemProps {
  child.data = {
    ...(child.data ?? {}),
    time: Date.now(),
  }

  return child
}
</script>

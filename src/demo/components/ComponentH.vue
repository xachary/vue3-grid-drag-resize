<template>
  <div class="component-h">
    <header>
      <p>Component H</p>
    </header>
    <footer>
      <GridDragResize
        :columns="2"
        :rows="2"
        :gap="4"
        :beforeDrop="beforeDrop"
        v-model:children="children"
      ></GridDragResize>
    </footer>
  </div>
</template>

<style lang="less" scoped>
.component-h {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  padding: 10px;
  background: #3c3c3c;
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
  GridDragResizeItemProps
} from '@/lib/components/GridDragResize/types'

// 已拖入内容
const children: Ref<GridDragResizeProps['children']> = ref([
  {
    rowStart: 1,
    rowEnd: 2,
    columnStart: 1,
    columnEnd: 2,
    render: () => h('div', { class: 'demo-item', style: { background: '#8e5c6a' } }, 'A')
  },
  {
    rowStart: 2,
    rowEnd: 3,
    columnStart: 2,
    columnEnd: 3,
    render: () => h('div', { class: 'demo-item', style: { background: '#F2BAC9' } }, 'B')
  }
])

// 拖入之前进行处理（同步）
function beforeDrop(child: GridDragResizeItemProps): GridDragResizeItemProps {
  child.data = {
    ...(child.data ?? {}),
    time: Date.now()
  }

  return child
}
</script>

<template>
<div class="component-h">
    <header>
        <p>Component H</p>
        <p>(GridDragResize nested)</p>
    </header>
    <GridDragResize :columns="2" :rows="2" :gap="5" :children="children" sub></GridDragResize>
</div>
</template>

<style lang="less" scoped>
.component-h {
    background: #3C3C3C;
    height: 100%;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    line-height: 1.1em;
    flex-direction: column;
    color: #fff;

    &>header {
        padding-bottom: 10px;
        text-align: center;
    }

    .grid-drag-resize {
        width: 100%;
        height: 100%;

        :deep(.demo-item) {
            font-size: 12px;
        }
    }
}
</style>

<script setup lang="ts">
import { ref, h, type Ref } from 'vue'
import { nanoid } from 'nanoid'

import { GridDragResize } from '@/lib/components/GridDragResize'
import type { GridDragResizeProps } from '@/lib/components/GridDragResize/types'

// 已拖入内容
const children: Ref<GridDragResizeProps['children']> = ref([
    {
        rowStart: 1,
        rowEnd: 2,
        columnStart: 1,
        columnEnd: 2,
        render: () => h('div', { class: "demo-item", style: { background: '#8e5c6a' } }, 'A'),
        data: {
            id: nanoid()
        }
    },
    {
        rowStart: 2,
        rowEnd: 3,
        columnStart: 2,
        columnEnd: 3,
        render: () => h('div', { class: "demo-item", style: { background: '#F2BAC9' } }, 'B'),
        data: {
            id: nanoid()
        }
    },
])
</script>
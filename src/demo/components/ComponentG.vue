<template>
<div class="component-g">
    <header>
        <p>Component G</p>
        <p>[GridDragResize nested]</p>
    </header>
    <GridDragResize :columns="4" :rows="4" :gap="5" v-model:children="children" sub>
    </GridDragResize>
</div>
</template>

<style lang="less" scoped>
.component-g {
    background: #345C81;
    height: 100%;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    line-height: 1.1em;
    flex-direction: column;
    color: #fff;

    &>header {
        padding-bottom: 10px;
        text-align: center;
    }
}
</style>

<script setup lang="ts">
import { ref, h, type Ref } from 'vue'

import { GridDragResize } from '@/lib/components/GridDragResize'
import type { GridDragResizeProps } from '@/lib/components/GridDragResize/types'

import ComponentH from '@/demo/components/ComponentH.vue'

let id = 0

// 已拖入内容
const children: Ref<GridDragResizeProps['children']> = ref([
    {
        rowStart: 1,
        rowEnd: 2,
        columnStart: 1,
        columnEnd: 2,
        render: () => h('div', { class: "demo-item", style: { background: '#0085ff' } }, 'Child 1'),
        data: {
            id: `G${++id}`
        }
    },
    {
        rowStart: 2,
        rowEnd: 3,
        columnStart: 2,
        columnEnd: 3,
        render: () => h('div', { class: "demo-item", style: { background: '#c2402a' } }, 'Child 2'),
        data: {
            id: `G${++id}`
        }
    },
    {
        rowStart: 3,
        rowEnd: 4,
        columnStart: 1,
        columnEnd: 3,
        render: () => h('div', { class: "demo-item", style: { background: '#FF6347' } }, 'Child 3'),
        data: {
            id: `G${++id}`
        }
    },
    {
        rowStart: 2,
        rowEnd: 5,
        columnStart: 3,
        columnEnd: 5,
        render: () => h(ComponentH),
        data: {
            id: `G${++id}`
        }
    },
])
</script>
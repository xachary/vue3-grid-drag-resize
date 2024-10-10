<script setup lang="ts">
import { ref, computed, provide, type Ref } from 'vue'

import type { GridDragResizeProps, GridDragResizeItemProps } from './types'

import GridDragResizeItem from './GridDragResizeItem.vue'

const props = withDefaults(defineProps<GridDragResizeProps>(), {
    children: () => []
});

const style = computed(() => {
    return {
        'grid-template-columns': Number.isInteger(props.columns) ? `repeat(${props.columns},${Number.isInteger(props.columnSize) ? `${props.columnSize}px` : '1fr'})` : '',
        'grid-template-rows': Number.isInteger(props.rows) ? `repeat(${props.rows},${Number.isInteger(props.rowSize) ? `${props.rowSize}px` : '1fr'})` : '',
        'grid-gap': Number.isInteger(props.gap) ? `${props.gap}px ${props.gap}px` : ''
    }
})

const rootEle: Ref<HTMLElement | undefined> = ref()

// 给子组件穿透转递组件 Props
provide('parentProps', props)

// 组件位置、大小信息
const rootRect = computed(() => {
    return rootEle?.value?.getBoundingClientRect() ?? {
        height: 0,
        width: 0,
        x: 0,
        y: 0,
        bottom: 0,
        right: 0
    }
})

// 列宽
const columnSize = computed(() => {
    return (rootRect.value.width - (props.gap ?? 0) * ((props.columns ?? 1) - 1)) / (props.columns ?? 1)
})

// 行高
const rowSize = computed(() => {
    return (rootRect.value.height - (props.gap ?? 0) * ((props.rows ?? 1) - 1)) / (props.rows ?? 1)
})

// 根据鼠标拖动偏移量，计算列/行方向上，移动后最新的位置和大小
function calcStartEnd(opts: { size: number, gap: number, span: number, max: number, offset: number, startBefore: number }) {
    let { size, gap, span, max, offset, startBefore } = opts

    let offsetStart = Math.round(offset / (size + gap))

    let start = startBefore + offsetStart

    if (start < 1) {
        start = 1
    }

    if (start + span > max) {
        start = max - span + 1
    }

    return {
        start,
        end: start + span
    }
}

// 当前拖动子组件的数据项
const draggingChild: Ref<GridDragResizeItemProps | undefined> = ref()
// 当前拖动子组件的数据项（初始状态）
const draggingChildBefore: Ref<GridDragResizeItemProps | undefined> = ref()
// 当前拖动子组件的位置、大小信息
const draggingChildRect: Ref<DOMRect | undefined> = ref()

// 拖动开始位置
let dragStartClientX = 0, dragStartClientY = 0;

// 拖动偏移量
let dragOffsetClientX = 0, dragOffsetClientY = 0;

let dragging = false

// 开始拖动
function dragstart(e: MouseEvent) {
    if (!props.readonly) {
        dragging = true

        // 记录 拖动开始位置
        dragStartClientX = e.clientX
        dragStartClientY = e.clientY
    }
}

// 拖动中
function drag(e: MouseEvent) {
    if (dragging && draggingChild.value && draggingChildRect.value) {
        // 计算 拖动开始位置
        dragOffsetClientX = e.clientX - dragStartClientX
        dragOffsetClientY = e.clientY - dragStartClientY

        // 当前拖动子组件的 grid 大小
        let rowSpan = (draggingChild.value.rowEnd ?? draggingChild.value.rowStart ?? 1) - (draggingChild.value.rowStart ?? 1)
        let columnSpan = (draggingChild.value.columnEnd ?? draggingChild.value.columnStart ?? 1) - (draggingChild.value.columnStart ?? 1)

        // 边界处理
        if (rowSpan <= 0) {
            rowSpan = 1
        }

        if (columnSpan <= 0) {
            columnSpan = 1
        }
        
        
        // 计算行方向上，移动后最新的位置和大小
        let { start: rowStart, end: rowEnd } = calcStartEnd({
            size: rowSize.value, gap: (props.gap ?? 0), span: rowSpan, max: props.rows ?? 1, offset: dragOffsetClientY, startBefore: draggingChildBefore.value?.rowStart ?? 1
        })

        // 计算列方向上，移动后最新的位置和大小
        let { start: columnStart, end: columnEnd } = calcStartEnd({
            size: columnSize.value, gap: (props.gap ?? 0), span: columnSpan, max: props.columns ?? 1, offset: dragOffsetClientX, startBefore: draggingChildBefore.value?.columnStart ?? 1
        })

        // 当前拖动子组件的数据项
        draggingChild.value.columnStart = columnStart
        draggingChild.value.columnEnd = columnEnd
        draggingChild.value.rowStart = rowStart
        draggingChild.value.rowEnd = rowEnd
    }
}

// 拖动结束
function dragend(e: MouseEvent) {
    e.stopPropagation()

    dragging = false

    draggingChild.value = undefined
}

// 超出组件区域，补充结束事件
document.body.addEventListener('mouseup', dragend)
window.addEventListener('mouseup', dragend)
</script>

<template>
<div class="grid-drag-resize" :style="style" @mousedown="dragstart" @mousemove="drag" @mouseup="dragend" ref="rootEle">
    <template v-for="(child, idx) of props.children" :key="idx">
        <GridDragResizeItem v-bind="child" v-model:column-start="child.columnStart" v-model:column-end="child.columnEnd"
            v-model:row-start="child.rowStart" v-model:row-end="child.rowEnd"
            @dragging="(rect) => { draggingChild = child; draggingChildBefore = { ...child }; draggingChildRect = rect }"
            :style="{ 'zIndex': draggingChild === child ? props.children.length + 1 : idx + 1 }"
            :class="{ 'grid-drag-resize__item--dragging': draggingChild === child }">
            <component :is="child.render"></component>
        </GridDragResizeItem>
    </template>
</div>
</template>
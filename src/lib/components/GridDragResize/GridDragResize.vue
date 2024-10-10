<script setup lang="ts">
import { ref, computed, provide, type Ref } from 'vue'

import type { GridDragResizeProps, GridDragResizeItemProps } from './types'

import GridDragResizeItem from './GridDragResizeItem.vue'

const props = withDefaults(defineProps<GridDragResizeProps>(), {
    draggable: true,
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

provide('parentProps', props)
provide('rootEle', rootEle)

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

const columnSize = computed(() => {
    return (rootRect.value.width - (props.gap ?? 0) * ((props.columns ?? 1) - 1)) / (props.columns ?? 1)
})

const rowSize = computed(() => {
    return (rootRect.value.height - (props.gap ?? 0) * ((props.rows ?? 1) - 1)) / (props.rows ?? 1)
})

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

const draggingChild: Ref<GridDragResizeItemProps | undefined> = ref()
const draggingChildBefore: Ref<GridDragResizeItemProps | undefined> = ref()
const draggingChildRect: Ref<DOMRect | undefined> = ref()

let dragStartClientX = 0, dragStartClientY = 0, dragOffsetClientX = 0, dragOffsetClientY = 0;

let dragging = false

function dragstart(e: MouseEvent) {
    if (props.draggable) {
        dragging = true

        dragStartClientX = e.clientX
        dragStartClientY = e.clientY
    }
}

function drag(e: MouseEvent) {
    if (dragging && draggingChild.value && draggingChildRect.value) {
        dragOffsetClientX = e.clientX - dragStartClientX
        dragOffsetClientY = e.clientY - dragStartClientY

        let rowSpan = (draggingChild.value.rowEnd ?? draggingChild.value.rowStart ?? 1) - (draggingChild.value.rowStart ?? 1)
        let columnSpan = (draggingChild.value.columnEnd ?? draggingChild.value.columnStart ?? 1) - (draggingChild.value.columnStart ?? 1)

        if (rowSpan <= 0) {
            rowSpan = 1
        }

        if (columnSpan <= 0) {
            columnSpan = 1
        }

        let { start: rowStart, end: rowEnd } = calcStartEnd({
            size: rowSize.value, gap: (props.gap ?? 0), span: rowSpan, max: props.rows ?? 1, offset: dragOffsetClientY, startBefore: draggingChildBefore.value?.rowStart ?? 1
        })

        let { start: columnStart, end: columnEnd } = calcStartEnd({
            size: columnSize.value, gap: (props.gap ?? 0), span: columnSpan, max: props.columns ?? 1, offset: dragOffsetClientX, startBefore: draggingChildBefore.value?.columnStart ?? 1
        })

        draggingChild.value.columnStart = columnStart
        draggingChild.value.columnEnd = columnEnd
        draggingChild.value.rowStart = rowStart
        draggingChild.value.rowEnd = rowEnd
    }
}

function dragend(e: MouseEvent) {
    e.stopPropagation()

    dragging = false

    draggingChild.value = undefined
}

document.body.addEventListener('mouseup', dragend)
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
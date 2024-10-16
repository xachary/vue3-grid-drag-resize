<script setup lang="ts">
import { ref, computed, watch, watchEffect, inject, type Ref } from 'vue'

import type { GridDragResizeProps, GridDragResizeItemProps, StartResizeEvent, StartDragEvent } from './types'

const parentProps = inject<GridDragResizeProps>('parentProps')

const props = withDefaults(defineProps<GridDragResizeItemProps>(), {
    columns: 0,
    rows: 0,
    //
    columnStart: 0,
    columnEnd: 0,
    rowStart: 0,
    rowEnd: 0,
    //
    dragHandler: '',
    draggable: true,
    resizable: true,
    removable: true,
    overflow: 'hidden'
});

const columnsParsed = computed(() => props.columns || 1)
const rowsParsed = computed(() => props.rows || 1)

const columnStartParsed = computed(() => props.columnStart < 1 ? 1 : props.columnStart)
const columnEndParsed = computed(() => props.columnEnd < 2 ? 2 : props.columnEnd)
const rowStartParsed = computed(() => props.rowStart < 1 ? 1 : props.rowStart)
const rowEndParsed = computed(() => props.rowEnd < 2 ? 2 : props.rowEnd)

const dragHandlerParsed = computed(() => props.dragHandler || parentProps?.dragHandler)
const draggableParsed = computed(() => parentProps?.readonly ? false : props.draggable)
const resizableParsed = computed(() => parentProps?.readonly ? false : props.resizable)
const removableParsed = computed(() => parentProps?.readonly ? false : props.removable)

type Emit = {
    (e: 'update:columnStart', val: number): void
    (e: 'update:columnEnd', val: number): void
    (e: 'update:rowStart', val: number): void
    (e: 'update:rowEnd', val: number): void
    (e: 'update:rows', val: number): void
    (e: 'update:columns', val: number): void
    (e: 'startDrag', val: StartDragEvent): void
    (e: 'select'): void
    (e: 'startResize', val: StartResizeEvent): void
    (e: 'remove'): void
}

const emit = defineEmits<Emit>()

// 数据整理
watch(() => [props.rows, props.columns], () => {
    if (props.rows !== rowsParsed.value) {
        emit('update:rows', rowsParsed.value)
    }

    if (props.columns !== columnsParsed.value) {
        emit('update:columns', columnsParsed.value)
    }
}, {
    immediate: true
})

watchEffect(() => {
    if (props.columnStart === void 0 || props.columnStart < 1) {
        emit('update:columnStart', 1)
    }

    if (props.columnEnd === void 0 || props.columnEnd < props.columnStart) {
        if (props.columns === void 0 || props.columns < 1) {
            emit('update:columnEnd', props.columnStart + 1)
        } else {
            emit('update:columnEnd', props.columnStart + props.columns)
        }
    }

    if (props.rowStart === void 0 || props.rowStart < 1) {
        emit('update:rowStart', 1)
    }

    if (props.rowEnd === void 0 || props.rowEnd < props.rowStart) {
        if (props.rows === void 0 || props.rows < 1) {
            emit('update:rowEnd', props.rowStart + 1)
        } else {
            emit('update:rowEnd', props.rowStart + props.rows)
        }
    }

    if (props.columns === void 0 || props.columns < 1) {
        if (props.columnStart !== void 0 && props.columnEnd !== void 0) {
            emit('update:columns', props.columnEnd - props.columnStart)
        }
    }

    if (props.rows === void 0 || props.rows < 1) {
        if (props.rowEnd !== void 0 && props.rowStart !== void 0) {
            emit('update:rows', props.rowEnd - props.rowStart)
        }
    }
})

// 样式
const style = computed(() => {
    return {
        'grid-column-start': columnStartParsed.value,
        'grid-column-end': columnEndParsed.value,
        'grid-row-start': rowStartParsed.value,
        'grid-row-end': rowEndParsed.value,
    }
})

const itemEle: Ref<HTMLElement | undefined> = ref()

// dragHandler 定位、处理、事件绑定
watchEffect(() => {
    if (draggableParsed.value && dragHandlerParsed.value && itemEle.value) {
        const handlerEle = itemEle.value.querySelector(dragHandlerParsed.value)
        if (handlerEle instanceof HTMLElement) {
            handlerEle.style.cursor = 'grab'

            handlerEle.addEventListener('mousedown', dragstart)
        }
    }
})

// 拖动开始
function dragstart(e: MouseEvent) {
    if (draggableParsed.value) {
        // 通知父组件 当前拖动子组件
        emit('startDrag', {
            event: e,
            rect: itemEle?.value?.getBoundingClientRect() ?? {
                height: 0,
                width: 0,
                x: 0,
                y: 0,
                bottom: 0,
                right: 0
            } as DOMRect
        })
    }
}

// 选中
function select(e: MouseEvent) {
    if (resizableParsed.value) {
        e.stopPropagation()

        // 通知父组件 选中子组件
        emit('select')
    }
}

// 开始改变大小
function resizeStart(e: MouseEvent, direction: string) {
    if (resizableParsed.value) {
        e.stopPropagation()

        emit('startResize', {
            event: e,
            rect: itemEle?.value?.getBoundingClientRect() ?? {
                height: 0,
                width: 0,
                x: 0,
                y: 0,
                bottom: 0,
                right: 0
            } as DOMRect,
            cursor: e.target instanceof HTMLElement ? getComputedStyle(e.target).cursor : '',
            direction
        })
    }
}

// 移除
function remove(e: MouseEvent) {
    e.stopPropagation()

    emit('remove')
}

// 自适应间距
const removeDistance = computed(() => {
    const size = 13 / 2
    const gap = (parentProps?.gap ?? 0)
    return (gap < size ? gap : size)
})

// 自适应间距
const adjustDistance = computed(() => {
    const size = 10 / 2
    const gap = (parentProps?.gap ?? 0)
    return (gap < size ? gap : size)
})
</script>

<template>
<div class="grid-drag-resize__item" :class="{
    'grid-drag-resize__item--draggable': draggableParsed,
    'grid-drag-resize__item--draggable-full': draggableParsed && !dragHandlerParsed
}" :style="style" @mousedown="(e: MouseEvent) => dragHandlerParsed ? undefined : dragstart(e)" @click="select"
    ref="itemEle">
    <div class="grid-drag-resize__item__group" :style="{ overflow: props.overflow }">
        <slot></slot>
    </div>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--top"
        @mousedown="resizeStart($event, 'top')" :style="{ top: `${-adjustDistance}px` }">
    </i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--right"
        @mousedown="resizeStart($event, 'right')" :style="{ right: `${-adjustDistance}px` }"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--bottom"
        @mousedown="resizeStart($event, 'bottom')" :style="{ bottom: `${-adjustDistance}px` }"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--left"
        @mousedown="resizeStart($event, 'left')" :style="{ left: `${-adjustDistance}px` }"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--top-left"
        @mousedown="resizeStart($event, 'top-left')"
        :style="{ top: `${-adjustDistance}px`, left: `${-adjustDistance}px` }"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--top-right"
        @mousedown="resizeStart($event, 'top-right')"
        :style="{ top: `${-adjustDistance}px`, right: `${-adjustDistance}px` }"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--bottom-left"
        @mousedown="resizeStart($event, 'bottom-left')"
        :style="{ bottom: `${-adjustDistance}px`, left: `${-adjustDistance}px` }"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--bottom-right"
        @mousedown="resizeStart($event, 'bottom-right')"
        :style="{ bottom: `${-adjustDistance}px`, right: `${-adjustDistance}px` }"></i>
    <span class="grid-drag-resize__item__remove" @click="remove" @mousedown.stop @mousemove.stop @mouseup.stop
        :style="{ top: `${-removeDistance}px`, right: `${-removeDistance}px` }" v-if="removableParsed">
    </span>
</div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, inject, type Ref } from 'vue'

import type { GridDragResizeProps, GridDragResizeItemProps, StartResizeEvent } from './types'

const parentProps = inject<GridDragResizeProps>('parentProps')

const props = withDefaults(defineProps<GridDragResizeItemProps>(), {
    draggable: true,
    resizable: true
});

type Emit = {
    (e: 'update:columnStart', val: number): void
    (e: 'update:columnEnd', val: number): void
    (e: 'update:rowStart', val: number): void
    (e: 'update:rowEnd', val: number): void
    (e: 'startDrag', val: DOMRect): void
    (e: 'select'): void
    (e: 'startResize', val: StartResizeEvent): void
}

const emit = defineEmits<Emit>()

// 数据整理
watchEffect(() => {
    if (props.columnStart !== void 0) {
        if (props.columnEnd === void 0 || props.columnEnd < props.columnStart) {
            emit('update:columnEnd', props.columnStart + 1)
        }
    } else {
        emit('update:columnStart', 1)
    }

    if (props.rowStart !== void 0) {
        if (props.rowEnd === void 0 || props.rowEnd < props.rowStart) {
            emit('update:rowEnd', props.rowStart + 1)
        }
    } else {
        emit('update:rowStart', 1)
    }
})

// 样式
const style = computed(() => {
    return {
        'grid-column-start': props.columnStart,
        'grid-column-end': props.columnEnd,
        'grid-row-start': props.rowStart,
        'grid-row-end': props.rowEnd,
    }
})

const itemEle: Ref<HTMLElement | undefined> = ref()

const dragHandlerParsed = computed(() => props.dragHandler ?? parentProps?.dragHandler)
const draggableParsed = computed(() => parentProps?.readonly ? false : props.draggable)

const resizableParsed = computed(() => parentProps?.readonly ? false : props.resizable)

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
function dragstart() {
    if (draggableParsed.value) {
        // 通知父组件 当前拖动子组件
        emit('startDrag', itemEle?.value?.getBoundingClientRect() ?? {
            height: 0,
            width: 0,
            x: 0,
            y: 0,
            bottom: 0,
            right: 0
        } as DOMRect)
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
</script>

<template>
<div class="grid-drag-resize__item" :class="{
    'grid-drag-resize__item--draggable': draggableParsed,
    'grid-drag-resize__item--draggable-full': draggableParsed && dragHandlerParsed === void 0
}" :style="style" @mousedown="() => dragHandlerParsed ? undefined : dragstart()" @click="select" ref="itemEle">
    <slot></slot>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--top"
        @mousedown="resizeStart($event, 'top')">
    </i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--right"
        @mousedown="resizeStart($event, 'right')"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--left"
        @mousedown="resizeStart($event, 'left')"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--bottom"
        @mousedown="resizeStart($event, 'bottom')"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--top-left"
        @mousedown="resizeStart($event, 'top-left')"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--top-right"
        @mousedown="resizeStart($event, 'top-right')"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--bottom-left"
        @mousedown="resizeStart($event, 'bottom-left')"></i>
    <i class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--bottom-right"
        @mousedown="resizeStart($event, 'bottom-right')"></i>
</div>
</template>

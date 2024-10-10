<script setup lang="ts">
import { ref, computed, watchEffect, inject, type Ref } from 'vue'

import type { GridDragResizeProps, GridDragResizeItemProps } from './types'

const parentProps = inject<GridDragResizeProps>('parentProps')

const props = withDefaults(defineProps<GridDragResizeItemProps>(), {
    draggable: true
});

const emit = defineEmits(['update:columnStart', 'update:columnEnd', 'update:rowStart', 'update:rowEnd', 'dragging'])

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
        emit('dragging', itemEle?.value?.getBoundingClientRect() ?? {
            height: 0,
            width: 0,
            x: 0,
            y: 0,
            bottom: 0,
            right: 0
        })
    }
}
</script>

<template>
<div class="grid-drag-resize__item" :class="{
    'grid-drag-resize__item--draggable': draggableParsed,
    'grid-drag-resize__item--draggable-full': draggableParsed && dragHandlerParsed === void 0
}" :style="style" @mousedown="() => dragHandlerParsed ? undefined : dragstart()" ref="itemEle">
    <slot></slot>
</div>
</template>

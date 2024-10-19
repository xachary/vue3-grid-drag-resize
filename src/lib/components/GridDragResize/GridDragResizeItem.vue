<script setup lang="ts">
import { ref, computed, watch, watchEffect, inject, provide, type Ref } from 'vue'

import type {
  GridDragResizeProps,
  GridDragResizeItemProps,
  StartResizeEvent,
  StartDragEvent
} from './types'

import { ParentInjectSymbol, ChildInjectSymbol, StateInjectSymbol } from './const'

const props = withDefaults(defineProps<GridDragResizeItemProps>(), {
  columns: 0,
  rows: 0,
  //
  columnStart: 0,
  columnEnd: 0,
  rowStart: 0,
  rowEnd: 0,
  //
  // 未传递，保留 undefined
  readonly: undefined,
  draggable: undefined,
  resizable: undefined,
  removable: undefined,
  droppableIn: undefined,
  droppableOut: undefined
})

const columnsParsed = computed(() => props.columns || 1)
const rowsParsed = computed(() => props.rows || 1)

const columnStartParsed = computed(() => (props.columnStart < 1 ? 1 : props.columnStart))
const columnEndParsed = computed(() => (props.columnEnd < 2 ? 2 : props.columnEnd))
const rowStartParsed = computed(() => (props.rowStart < 1 ? 1 : props.rowStart))
const rowEndParsed = computed(() => (props.rowEnd < 2 ? 2 : props.rowEnd))

// 单例 state 透传
let stateInject = inject<{
  actionEle: Ref<HTMLElement | undefined>
  droppingChild: Ref<GridDragResizeItemProps | undefined>
  droppingChildEle: Ref<HTMLElement | undefined>
  droppingChildRaw: Ref<GridDragResizeItemProps | undefined>
  droppingChildRemove: (() => void) | undefined
  droppingEle: Ref<HTMLElement | undefined>
  hoverEle: Ref<HTMLElement | undefined>
  dragging: Ref<boolean>
  resizing: Ref<boolean>
} | null>(StateInjectSymbol, null)

// 给子组件穿透转递组件 Props
const parentInject = inject<{ props: Ref<GridDragResizeProps> }>(ParentInjectSymbol)

// 穿透 Props 处理
const dragHandlerParsed = computed(() => props.dragHandler || parentInject?.props.value.dragHandler)
const overflowParsed = computed(() => props.overflow || parentInject?.props.value.overflow)
//
const readonlyParsed = computed(() => props.readonly ?? parentInject?.props.value.readonly)
//
const draggableParsed = computed(() =>
  readonlyParsed.value ? false : props.draggable ?? parentInject?.props.value.draggable
)
const resizableParsed = computed(() =>
  readonlyParsed.value ? false : props.resizable ?? parentInject?.props.value.resizable
)
const removableParsed = computed(() =>
  readonlyParsed.value ? false : props.removable ?? parentInject?.props.value.removable
)
const droppableOutParsed = computed(() =>
  readonlyParsed.value
    ? false
    : parentInject?.props.value?.droppableOut ??
      props.droppableOut ??
      parentInject?.props.value.droppableOut
)
//
const debugParsed = computed(() => props.debug ?? parentInject?.props.value.debug)

// 默认值处理
const draggableDefault = computed(() => draggableParsed.value ?? true)
const resizableDefault = computed(() => resizableParsed.value ?? true)
const removableDefault = computed(() => removableParsed.value ?? true)
const droppableDefault = computed(() => droppableOutParsed.value ?? true)

if (debugParsed.value) {
  console.log(parentInject?.props.value)
}

const providePropsRef = ref({
  ...props,
  //
  dragHandler: dragHandlerParsed.value,
  overflow: overflowParsed.value,
  //
  readonly: readonlyParsed.value,
  //
  draggable: draggableParsed.value,
  resizable: resizableParsed.value,
  removable: removableParsed.value,
  droppableOut: droppableOutParsed.value,
  //
  debug: debugParsed.value
})

provide(ChildInjectSymbol, {
  props: providePropsRef
})

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
  (e: 'dropStart', val: { ele: HTMLElement | undefined; remove: () => void | undefined }): void
  (e: 'dropEnd'): void
}

const emit = defineEmits<Emit>()

// 数据整理
watch(
  () => [props.rows, props.columns],
  () => {
    if (props.rows !== rowsParsed.value) {
      emit('update:rows', rowsParsed.value)
    }

    if (props.columns !== columnsParsed.value) {
      emit('update:columns', columnsParsed.value)
    }
  },
  {
    immediate: true
  }
)

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

  if (props.columns === void 0 || props.columns < 1 || props.columnEnd - props.columnStart) {
    if (props.columnStart !== void 0 && props.columnEnd !== void 0) {
      emit('update:columns', props.columnEnd - props.columnStart)
    }
  }

  if (props.rows === void 0 || props.rows < 1 || props.rows > props.rowEnd - props.rowStart) {
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
    'grid-row-end': rowEndParsed.value
  }
})

const itemEle: Ref<HTMLElement | undefined> = ref()

// dragHandler 定位、处理、事件绑定
watchEffect(() => {
  if (draggableDefault.value && dragHandlerParsed.value && itemEle.value) {
    const handlerEle = itemEle.value.querySelector(dragHandlerParsed.value)
    if (handlerEle instanceof HTMLElement) {
      handlerEle.style.cursor = 'grab'

      handlerEle.addEventListener('mousedown', dragstart)
    }
  }
})

// 拖动开始
function dragstart(e: MouseEvent) {
  if (draggableDefault.value) {
    // 通知父组件 当前拖动子组件
    emit('startDrag', {
      event: e,
      rect:
        itemEle?.value?.getBoundingClientRect() ??
        ({
          height: 0,
          width: 0,
          x: 0,
          y: 0,
          bottom: 0,
          right: 0
        } as DOMRect)
    })
  }
}

// 选中
function select(e: MouseEvent) {
  if (resizableDefault.value) {
    e.stopPropagation()

    // 通知父组件 选中子组件
    emit('select')
  }
}

// 开始改变大小
function resizeStart(e: MouseEvent, direction: string) {
  if (resizableDefault.value) {
    e.stopPropagation()

    emit('startResize', {
      event: e,
      rect:
        itemEle?.value?.getBoundingClientRect() ??
        ({
          height: 0,
          width: 0,
          x: 0,
          y: 0,
          bottom: 0,
          right: 0
        } as DOMRect),
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
  const gap = parentInject?.props.value?.gap ?? 0
  return gap < size ? gap : size
})

// 自适应间距
const adjustDistance = computed(() => {
  const size = 10 / 2
  const gap = parentInject?.props.value?.gap ?? 0
  return gap < size ? gap : size
})

// 自适应间距
const dropDistance = computed(() => {
  const size = 16 / 2
  const gap = parentInject?.props.value?.gap ?? 0
  return gap < size ? gap : size
})

function dropStart() {
  emit('dropStart', {
    ele: itemEle.value,
    remove: () => {
      removableDefault.value && emit('remove')
    }
  })
}

function dropEnd() {
  emit('dropEnd')
}

function mouseover(e: MouseEvent) {
  if (stateInject && e.currentTarget instanceof HTMLElement) {
    stateInject.hoverEle.value = e.currentTarget
  }
}

function mouseleave() {
  if (stateInject) {
    stateInject.hoverEle.value = undefined
  }
}

const hover = computed(() => {
  return stateInject?.hoverEle.value === itemEle.value
})
</script>

<template>
  <div
    class="grid-drag-resize__item"
    :class="{
      'grid-drag-resize__item--draggable': draggableDefault,
      'grid-drag-resize__item--draggable-full': draggableDefault && !dragHandlerParsed,
      'grid-drag-resize__item--hover':
        hover && !stateInject?.dragging.value && !stateInject?.resizing.value
    }"
    :style="style"
    @mousedown="(e: MouseEvent) => (dragHandlerParsed ? undefined : dragstart(e))"
    @click="select"
    @mouseover.capture="mouseover"
    @mouseleave.capture="mouseleave"
    ref="itemEle"
  >
    <div class="grid-drag-resize__item__group" :style="{ overflow: overflowParsed }">
      <slot></slot>
    </div>
    <i
      class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--top"
      :style="{ top: `${-adjustDistance}px` }"
      @mousedown="resizeStart($event, 'top')"
    >
    </i>
    <i
      class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--right"
      :style="{ right: `${-adjustDistance}px` }"
      @mousedown="resizeStart($event, 'right')"
    >
    </i>
    <i
      class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--bottom"
      :style="{ bottom: `${-adjustDistance}px` }"
      @mousedown="resizeStart($event, 'bottom')"
    >
    </i>
    <i
      class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--left"
      :style="{ left: `${-adjustDistance}px` }"
      @mousedown="resizeStart($event, 'left')"
    >
    </i>
    <i
      class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--top-left"
      :style="{ top: `${-adjustDistance}px`, left: `${-adjustDistance}px` }"
      @mousedown="resizeStart($event, 'top-left')"
    >
    </i>
    <i
      class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--top-right"
      :style="{ top: `${-adjustDistance}px`, right: `${-adjustDistance}px` }"
      @mousedown="resizeStart($event, 'top-right')"
    >
    </i>
    <i
      class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--bottom-left"
      :style="{ bottom: `${-adjustDistance}px`, left: `${-adjustDistance}px` }"
      @mousedown="resizeStart($event, 'bottom-left')"
    >
    </i>
    <i
      class="grid-drag-resize__item__adjust grid-drag-resize__item__adjust--bottom-right"
      :style="{ bottom: `${-adjustDistance}px`, right: `${-adjustDistance}px` }"
      @mousedown="resizeStart($event, 'bottom-right')"
    >
    </i>
    <span
      class="grid-drag-resize__item__remove"
      :style="{ top: `${-removeDistance}px`, right: `${-removeDistance}px` }"
      @click="remove"
      @mousedown.stop
      @mousemove.stop
      @mouseup.stop
      v-if="removableDefault"
    >
    </span>
    <div
      :class="'grid-drag-resize__item__drop'"
      :style="{ top: draggableDefault ? `${-dropDistance}px` : '' }"
      draggable="true"
      @mousedown.stop="dropStart"
      @mousemove.stop
      @mouseup.stop
      @dragstart.stop
      @dragend.stop="dropEnd"
      v-if="droppableDefault"
    ></div>
  </div>
</template>

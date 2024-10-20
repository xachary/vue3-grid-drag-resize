<script setup lang="ts">
import { ref, computed, provide, inject, watch, type Ref } from 'vue'

import type {
  GridDragResizeProps,
  GridDragResizeItemProps,
  StartResizeEvent,
  StartDragEvent
} from './types'

import GridDragResizeItem from './GridDragResizeItem.vue'
import GridDragResize from './GridDragResize.vue'

import { ParentInjectSymbol, ChildInjectSymbol, StateInjectSymbol } from './const'

const props = withDefaults(defineProps<GridDragResizeProps>(), {
  columns: 1,
  rows: 1,
  gap: 0,
  //
  columnExpandable: false,
  rowExpandable: false,
  //
  children: () => [],
  tagName: 'div',
  //
  // ^ 未传递，保留 undefined
  readonly: undefined,
  draggable: undefined,
  resizable: undefined,
  removable: undefined,
  droppableIn: undefined,
  droppableOut: undefined
})

type Emit = {
  (e: 'update:rows', val: number): void
  (e: 'update:columns', val: number): void
  (e: 'update:children', val: GridDragResizeProps['children']): void
  (e: 'update:droppingChild', val: GridDragResizeItemProps | undefined): void
  (e: 'update:selectedChild', val: GridDragResizeItemProps | undefined): void
  (e: 'select', val: GridDragResizeItemProps | undefined): void
}

const emit = defineEmits<Emit>()

const columnsParsed = computed(() => props.columns || 1)
const rowsParsed = computed(() => props.rows || 1)
const gapParsed = computed(() => props.gap || 0)

const childrenParsed: Ref<GridDragResizeItemProps[]> = ref([...props.children])

const rootEle: Ref<HTMLElement | undefined> = ref()

// 给子组件穿透转递组件 Props
const parentInject = inject<{ props: Ref<GridDragResizeProps> }>(ParentInjectSymbol, {
  props: ref(props)
})
// 给子组件穿透转递组件 Props
const childInject = inject<{ props: Ref<GridDragResizeItemProps> } | undefined>(
  ChildInjectSymbol,
  undefined
)

// 判断嵌套
const sub = parentInject.props.value !== props

// 穿透 Props 处理
const overflowParsed = computed(
  () => props.overflow || childInject?.props.value.overflow || parentInject.props.value.overflow
)
const dragHandlerParsed = computed(
  () =>
    props.dragHandler ||
    childInject?.props.value.dragHandler ||
    parentInject.props.value.dragHandler
)
const dropOutHandlerParsed = computed(
  () =>
    props.dropOutHandler ||
    childInject?.props.value.dropOutHandler ||
    parentInject.props.value.dropOutHandler
)
const removeHandlerParsed = computed(
  () =>
    props.removeHandler ||
    childInject?.props.value.removeHandler ||
    parentInject.props.value.removeHandler
)
//
const readonlyParsed = computed(
  () => props.readonly ?? childInject?.props.value.readonly ?? parentInject.props.value.readonly
)
//
const draggableParsed = computed(() =>
  readonlyParsed.value
    ? false
    : props.draggable ?? childInject?.props.value.draggable ?? parentInject.props.value.draggable
)
const resizableParsed = computed(() =>
  readonlyParsed.value
    ? false
    : props.resizable ?? childInject?.props.value.resizable ?? parentInject.props.value.resizable
)
const removableParsed = computed(() =>
  readonlyParsed.value
    ? false
    : props.removable ?? childInject?.props.value.removable ?? parentInject.props.value.removable
)
const droppableOutParsed = computed(() =>
  readonlyParsed.value
    ? false
    : props.droppableOut ??
      childInject?.props.value.droppableOut ??
      parentInject.props.value.droppableOut
)
//
const debugParsed = computed(
  () => props.debug ?? childInject?.props.value.debug ?? parentInject.props.value.debug
)
//
const droppableInParsed = computed(() =>
  readonlyParsed.value ? false : props.droppableIn ?? parentInject.props.value.droppableIn
)
//
const beforeDropParsed = computed(() => props.beforeDrop ?? parentInject.props.value.beforeDrop)
//
const classNameParsed = computed(() => props.className || parentInject.props.value.className)
const tagNameParsed = computed(() => props.tagName || parentInject.props.value.tagName)

const providePropsRef = ref({
  ...props,
  //
  dragHandler: dragHandlerParsed.value,
  dropOutHandler: dropOutHandlerParsed.value,
  removeHandler: removeHandlerParsed.value,
  overflow: overflowParsed.value,
  //
  readonly: readonlyParsed.value,
  //
  draggable: draggableParsed.value,
  resizable: resizableParsed.value,
  removable: removableParsed.value,
  droppableOut: droppableOutParsed.value,
  //
  debug: debugParsed.value,
  //
  droppableIn: droppableInParsed.value,
  //
  before: beforeDropParsed.value,
  //
  className: classNameParsed.value,
  tagName: tagNameParsed.value
})

provide(ParentInjectSymbol, {
  props: providePropsRef
})

// 默认值处理
const droppableInDefault = computed(() => droppableInParsed.value ?? true)

if (debugParsed.value) {
  console.log(providePropsRef.value)
}

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
  selectedChild: Ref<GridDragResizeItemProps | undefined>
} | null>(StateInjectSymbol, null)
if (stateInject === null) {
  stateInject = {
    actionEle: ref(), // 当前正在 drag、resize 的 GridDragResize 组件
    droppingChild: ref(props.droppingChild), // 当前正在 drop 的 配置（副本）
    droppingChildRaw: ref(props.droppingChild), // 当前正在 drop 的 配置（原本）
    droppingChildEle: ref(), // 当前正在 drop 的 GridDragResizeItem 的 ele
    droppingChildRemove: undefined, // 当前正在 drop 的 GridDragResizeItem 的移除方法
    droppingEle: ref(), // 当前正在承接 drop 的 GridDragResize 的 ele
    hoverEle: ref(), // hover 目标
    dragging: ref(false), // dragging 状态
    resizing: ref(false), // dragging 状态
    selectedChild: ref(props.selectedChild)
  }
}
provide(StateInjectSymbol, stateInject)

// 正在拖入的目标（仅外部用）
watch(
  () => props.droppingChild,
  () => {
    if (stateInject) {
      stateInject.droppingChild.value = { ...props.droppingChild }
    }
  },
  { immediate: true }
)

const droppingChildParsed = computed(() => {
  return stateInject?.droppingChild.value ?? props.droppingChild
})

// 清空 drop 相关状态
function droppingChildClear() {
  emit('update:droppingChild', undefined)

  if (stateInject) {
    stateInject.droppingChild.value = undefined
    stateInject.droppingChildEle.value = undefined
    stateInject.droppingChildRaw.value = undefined
    stateInject.droppingEle.value = undefined
    stateInject.droppingChildRemove = undefined
  }
}

// 拖入操作中
const dropping = computed(
  () => stateInject?.droppingEle?.value === rootEle.value && !droppingSelfOrParent.value
)

// 在自己内部、自己的 parent drop 不算数
const droppingSelfOrParent = computed(() => {
  if (stateInject) {
    if (stateInject.droppingChildRaw.value && rootEle.value) {
      return (
        childrenParsed.value.includes(stateInject.droppingChildRaw.value) ||
        stateInject?.droppingChildEle.value?.contains(rootEle.value)
      )
    }
  }

  return false
})

// 限制 扩展
const rowExpandableParsed = computed(() => props.rowExpandable && !droppingSelfOrParent.value)
const columnExpandableParsed = computed(() => props.columnExpandable && !droppingSelfOrParent.value)

// 更新状态
function stateInjectActionDown(v: boolean) {
  if (stateInject) {
    if (v) {
      stateInject.actionEle.value = rootEle.value // 记录 当前正在 drag、resize 的 GridDragResize 组件
    } else {
      stateInject.actionEle.value = undefined
    }
  }
}

// // 判断是否处于 draggable 的节点内部
// watch(
//   () => [props.readonly, rootEle.value],
//   () => {
//     let underDraggable = false
//     if (rootEle.value) {
//       let parent = rootEle.value.parentElement
//       while (parent && !parent.draggable) {
//         parent = parent.parentElement
//       }
//       if (parent) {
//         underDraggable = true
//       }
//     }
//     readonlyParsed.value = props.readonly || underDraggable

//     // 更新
//     propsParsed.value = { ...props, readonly: readonlyParsed.value }
//   },
//   {
//     immediate: true
//   }
// )

// 同步外部 children 变化
watch(
  () => props.children,
  () => {
    childrenParsed.value = [...props.children]
  },
  {
    deep: true
  }
)

// 转换为 grid 模版
function gridTemplateParse(count: number, size?: number) {
  return `repeat(${count},${Number.isInteger(size) ? `${size}px` : '1fr'})`
}

// 如果没定义 行数/列数，根据 children 计算合适的 行数/列数
function calcMaxCount(target: string, min?: number, more: GridDragResizeItemProps[] = []) {
  const calc = [...childrenParsed.value, ...more].reduce((max, child) => {
    const end = { rows: child.rowEnd, columns: child.columnEnd }[target]
    if (end && end > 1) {
      if (end - 1 > max) {
        max = end - 1
      }
    }
    return max
  }, 1)

  return min === void 0 ? calc : min < calc ? calc : min
}

const rows = ref(1)
const columns = ref(1)

watch(
  () => [props.rows, props.columns, childrenParsed.value],
  () => {
    rows.value = calcMaxCount('rows', rowsParsed.value)
    columns.value = calcMaxCount('columns', columnsParsed.value)

    if (rows.value !== rowsParsed.value) {
      emit('update:rows', rows.value)
    }

    if (columns.value !== columnsParsed.value) {
      emit('update:columns', columns.value)
    }
  },
  {
    immediate: true,
    deep: true
  }
)

// grid 样式
const style = computed(() => {
  return {
    'grid-template-columns': gridTemplateParse(columns.value, props.columnSize),
    'grid-template-rows': gridTemplateParse(rows.value, props.rowSize),
    'grid-gap': gapParsed.value > 0 ? `${gapParsed.value}px ${gapParsed.value}px` : ''
  }
})

// 列宽
const columnSize = computed(() => {
  const rootRect = rootEle?.value?.getBoundingClientRect() ?? {
    height: 0,
    width: 0,
    x: 0,
    y: 0,
    bottom: 0,
    right: 0
  }
  return (
    props.columnSize ?? (rootRect.width - gapParsed.value * (columns.value - 1)) / columns.value
  )
})

// 行高
const rowSize = computed(() => {
  const rootRect = rootEle?.value?.getBoundingClientRect() ?? {
    height: 0,
    width: 0,
    x: 0,
    y: 0,
    bottom: 0,
    right: 0
  }
  return props.rowSize ?? (rootRect.height - gapParsed.value * (rows.value - 1)) / rows.value
})

// 点击开始位置
let clickStartX = 0,
  clickStartY = 0
// 点击偏移量
let clickOffsetX = 0,
  clickOffsetY = 0

// 当前调整大小子的数据项
const resizingChild: Ref<GridDragResizeItemProps | undefined> = ref()

// 当前调整大小子组件的数据项（初始状态）
const resizingChildBefore: Ref<GridDragResizeItemProps | undefined> = ref()
// 当前调整大小子组件的位置、大小信息
const resizingChildRect: Ref<DOMRect | undefined> = ref()
// 当前调整大小类型
const resizingChildCursor: Ref<string> = ref('')
// 当前调整大小方向
const resizingChildDirection: Ref<string> = ref('')
// 当前调整大小子组件的 Dom
const resizingChildEle: Ref<HTMLElement | undefined> = ref()

// 调整大小开始位置
let resizeStartClientX = 0,
  resizeStartClientY = 0
// 调整大小拖动偏移量
let resizeOffsetClientRow = 0,
  resizeOffsetClientColumn = 0

// 当前拖动子组件的数据项
const draggingChild: Ref<GridDragResizeItemProps | undefined> = ref()
// 当前拖动子组件的数据项（初始状态）
const draggingChildBefore: Ref<GridDragResizeItemProps | undefined> = ref()
// 当前拖动子组件的位置、大小信息
const draggingChildRect: Ref<DOMRect | undefined> = ref()
// 当前拖动子组件的 Dom
const draggingChildEle: Ref<HTMLElement | undefined> = ref()

// 拖动开始位置
let dragStartClientX = 0,
  dragStartClientY = 0
// 拖动偏移量
let dragOffsetClientRow = 0,
  dragOffsetClientColumn = 0

// 计算移动方向
let rowDirection = 0,
  columnDirection = 0

// 根据鼠标拖动偏移量，计算列/行方向上，移动后最新的位置和大小
function calcDragStartEndByOffset(opts: {
  size: number
  gap: number
  span: number
  max: number
  offset: number
  startBefore: number
  direction: number
  expandable: boolean
}) {
  let { size, gap, span, max, offset, startBefore, expandable } = opts

  let offsetStart = Math.round(offset / (size + gap))

  let start = startBefore + offsetStart

  if (start < 1) {
    start = 1
  }

  if (!expandable) {
    if (start + span > max) {
      start = max - span + 1
    }
  }

  return {
    start,
    end: start + span
  }
}

// 根据鼠标拖动位置（相对于组件），计算列/行方向上的位置，移动后最新的位置和大小
function calcDragStartEndByPos(opts: {
  size: number
  gap: number
  span: number
  max: number
  pos: number
  expandable: boolean
}) {
  let { size, gap, span, max, pos, expandable } = opts

  // 虚拟地在 grid 四边补充二分之一的 gap 距离
  // 如此，通过计算 拖动位置（相对于组件）与 大小+间隙 的倍数即可
  let start = Math.ceil((pos + gap / 2) / (size + gap))

  if (start < 1) {
    start = 1
  }

  if (!expandable) {
    if (start + span > max) {
      start = max - span + 1
    }
  }

  return {
    start,
    end: start + span
  }
}

// 根据鼠标拖动偏移量，计算调整大小后的位置
function calcResizeStartEnd(opts: {
  size: number
  gap: number
  max: number
  offset: number
  startBefore: number
  endBefore: number
  target: 'start' | 'end'
  expandable: boolean
}) {
  let { size, gap, max, offset, startBefore, endBefore, target, expandable } = opts

  let offsetStart = Math.round(offset / (size + gap))

  if (target === 'start') {
    let start = startBefore + offsetStart

    if (start < 1) {
      start = 1
    }

    if (start >= endBefore) {
      start = endBefore - 1
    }

    return {
      start,
      end: endBefore
    }
  } else {
    let end = endBefore + offsetStart

    if (!expandable) {
      if (end > max) {
        end = max + 1
      }
    }

    if (end <= startBefore) {
      end = startBefore + 1
    }

    return {
      start: startBefore,
      end
    }
  }
}

function resizingReset() {
  if (stateInject) {
    stateInject.resizing.value = false
  }
  stateInjectActionDown(false)

  resizingChildBefore.value = undefined
  resizingChildRect.value = undefined
  resizingChildCursor.value = ''
  resizingChildDirection.value = ''

  document.body.style.cursor = ''
}

function dragReset() {
  if (stateInject) {
    stateInject.dragging.value = false
  }
  stateInjectActionDown(false)

  draggingChild.value = undefined
  draggingChildBefore.value = undefined
  draggingChildRect.value = undefined
  draggingChildEle.value = undefined
}

// 元素是否整个在都可视区域内
function isElementInViewport(el: HTMLElement) {
  var rect = el.getBoundingClientRect()

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}

// 滚动使小组件在可视区域内
function scrollIntoViewIfNeeded(target?: HTMLElement) {
  if (target) {
    if (!isElementInViewport(target)) {
      target.scrollIntoView()
    }
  }
}

// 拖动开始
function startDrag(res: StartDragEvent, child: GridDragResizeItemProps) {
  const { event: e, rect } = res
  if (e && e.currentTarget instanceof HTMLElement) {
    updateDrag(child, rect, e.currentTarget)
  }
}

// 调整大小开始
function resizingStart(...args: any[] | unknown[]) {
  // 这里的写法是为了通过 github pages 的 type-check
  const res = args[0] as StartResizeEvent
  const { event: e, rect, cursor, direction } = res

  if (e && e.currentTarget instanceof HTMLElement) {
    if (e.currentTarget.parentElement instanceof HTMLElement) {
      resizingChildEle.value = e.currentTarget.parentElement
    }
  }

  // 更新 点击开始位置
  clickStartX = e.clientX
  clickStartY = e.clientY

  // 更新 调整大小开始位置
  resizeStartClientX = e.clientX
  resizeStartClientY = e.clientY

  // 状态互斥
  dragReset()
  if (stateInject) {
    stateInject.resizing.value = true
  }
  stateInjectActionDown(true)

  // 更新计算所需信息
  resizingChildRect.value = rect
  resizingChildCursor.value = cursor
  resizingChildDirection.value = direction

  // 拖出区域保持鼠标类型
  document.body.style.cursor = cursor

  // 缓存状态
  resizingChildBefore.value = { ...resizingChild.value }
}

// 更新拖动信息
function updateDrag(child: GridDragResizeItemProps, rect: DOMRect, target: HTMLElement) {
  draggingChild.value = child
  draggingChildBefore.value = { ...child }
  draggingChildRect.value = rect
  draggingChildEle.value = target
}

// 拖动开始
function dragStart(e: MouseEvent) {
  // 更新 点击开始位置
  clickStartX = e.clientX
  clickStartY = e.clientY

  if (!readonlyParsed.value) {
    if (draggingChild.value && draggingChildRect.value) {
      // 状态互斥
      resizingReset()
      if (stateInject) {
        stateInject.dragging.value = true
      }
      stateInjectActionDown(true)

      // 记录 拖动开始位置
      dragStartClientX = e.clientX
      dragStartClientY = e.clientY
    }
  }
}

// 拖动中
function dragMove(e: MouseEvent) {
  if (stateInject?.dragging.value && draggingChild.value) {
    // 计算 拖动偏移量
    dragOffsetClientColumn = e.clientX - dragStartClientX
    dragOffsetClientRow = e.clientY - dragStartClientY

    // 当前拖动子组件的 grid 大小
    let rowSpan =
      (draggingChild.value.rowEnd ?? draggingChild.value.rowStart ?? 1) -
      (draggingChild.value.rowStart ?? 1)
    let columnSpan =
      (draggingChild.value.columnEnd ?? draggingChild.value.columnStart ?? 1) -
      (draggingChild.value.columnStart ?? 1)

    // 边界处理
    {
      if (rowSpan <= 0) {
        rowSpan = 1
      }

      if (columnSpan <= 0) {
        columnSpan = 1
      }
    }

    // 计算行方向上，移动后最新的位置和大小
    let { start: rowStart, end: rowEnd } = calcDragStartEndByOffset({
      size: rowSize.value,
      gap: gapParsed.value,
      span: rowSpan,
      max: rows.value ?? 1,
      offset: dragOffsetClientRow,
      startBefore: draggingChildBefore.value?.rowStart ?? 1,
      direction: rowDirection,
      expandable: rowExpandableParsed.value
    })

    if (rowExpandableParsed.value) {
      // 向下扩展
      rows.value = calcMaxCount('rows', rowsParsed.value)
    }

    // 计算列方向上，移动后最新的位置和大小
    let { start: columnStart, end: columnEnd } = calcDragStartEndByOffset({
      size: columnSize.value,
      gap: gapParsed.value,
      span: columnSpan,
      max: columns.value ?? 1,
      offset: dragOffsetClientColumn,
      startBefore: draggingChildBefore.value?.columnStart ?? 1,
      direction: columnDirection,
      expandable: columnExpandableParsed.value
    })

    if (columnExpandableParsed.value) {
      // 向右扩展
      columns.value = calcMaxCount('columns', columnsParsed.value)
    }

    // 更新 当前拖动子组件的数据项
    draggingChild.value.columnStart = columnStart
    draggingChild.value.columnEnd = columnEnd
    draggingChild.value.rowStart = rowStart
    draggingChild.value.rowEnd = rowEnd

    // 滚动跟随
    scrollIntoViewIfNeeded(draggingChildEle.value)
  }
  if (stateInject?.resizing.value) {
    // 计算 调整大小拖动偏移量
    resizeOffsetClientColumn = e.clientX - resizeStartClientX
    resizeOffsetClientRow = e.clientY - resizeStartClientY

    if (resizingChild.value) {
      // 行 向
      if (resizingChildDirection.value.startsWith('top')) {
        let { start: rowStart, end: rowEnd } = calcResizeStartEnd({
          size: rowSize.value,
          gap: gapParsed.value,
          max: rows.value ?? 1,
          offset: resizeOffsetClientRow,
          startBefore: resizingChildBefore.value?.rowStart ?? 1,
          endBefore: resizingChildBefore.value?.rowEnd ?? 1,
          target: 'start',
          expandable: rowExpandableParsed.value
        })
        resizingChild.value.rowStart = rowStart
        resizingChild.value.rowEnd = rowEnd
        resizingChild.value.rows = rowEnd - rowStart
      } else if (resizingChildDirection.value.startsWith('bottom')) {
        let { start: rowStart, end: rowEnd } = calcResizeStartEnd({
          size: rowSize.value,
          gap: gapParsed.value,
          max: rows.value ?? 1,
          offset: resizeOffsetClientRow,
          startBefore: resizingChildBefore.value?.rowStart ?? 1,
          endBefore: resizingChildBefore.value?.rowEnd ?? 1,
          target: 'end',
          expandable: rowExpandableParsed.value
        })
        resizingChild.value.rowStart = rowStart
        resizingChild.value.rowEnd = rowEnd
        resizingChild.value.rows = rowEnd - rowStart

        if (rowExpandableParsed.value) {
          // 向下扩展
          rows.value = calcMaxCount('rows', rowsParsed.value)
        }
      }

      // 列 向
      if (resizingChildDirection.value.endsWith('left')) {
        let { start: columnStart, end: columnEnd } = calcResizeStartEnd({
          size: columnSize.value,
          gap: gapParsed.value,
          max: columns.value ?? 1,
          offset: resizeOffsetClientColumn,
          startBefore: resizingChildBefore.value?.columnStart ?? 1,
          endBefore: resizingChildBefore.value?.columnEnd ?? 1,
          target: 'start',
          expandable: columnExpandableParsed.value
        })
        resizingChild.value.columnStart = columnStart
        resizingChild.value.columnEnd = columnEnd
        resizingChild.value.columns = columnEnd - columnStart
      } else if (resizingChildDirection.value.endsWith('right')) {
        let { start: columnStart, end: columnEnd } = calcResizeStartEnd({
          size: columnSize.value,
          gap: gapParsed.value,
          max: columns.value ?? 1,
          offset: resizeOffsetClientColumn,
          startBefore: resizingChildBefore.value?.columnStart ?? 1,
          endBefore: resizingChildBefore.value?.columnEnd ?? 1,
          target: 'end',
          expandable: columnExpandableParsed.value
        })
        resizingChild.value.columnStart = columnStart
        resizingChild.value.columnEnd = columnEnd
        resizingChild.value.columns = columnEnd - columnStart

        if (columnExpandableParsed.value) {
          // 向右扩展
          columns.value = calcMaxCount('columns', columnsParsed.value)
        }
      }
    }

    // 滚动跟随
    scrollIntoViewIfNeeded(resizingChildEle.value)
  }
}

// 拖动结束
function dragEnd(e: MouseEvent) {
  // 计算 点击拖动偏移量
  clickOffsetX = e.clientX - clickStartX
  clickOffsetY = e.clientY - clickStartY

  // 状态重置
  {
    resizingReset()
    dragReset()
  }
}

// 清除选择
function clearSelection() {
  // 判断真实 click
  if (Math.abs(clickOffsetX) < 5 && Math.abs(clickOffsetY) < 5) {
    if (stateInject) {
      stateInject.selectedChild.value = undefined
      emit('update:selectedChild', undefined)
      emit('select', undefined)
    }
    resizingChild.value = undefined
  }

  // 状态重置
  {
    resizingReset()
    dragReset()
  }
}

// 选择
function select(child: GridDragResizeItemProps) {
  if (Math.abs(clickOffsetX) < 5 && Math.abs(clickOffsetY) < 5) {
    if (stateInject) {
      stateInject.selectedChild.value = child
      emit('update:selectedChild', child)
      emit('select', child)
    }
  }
}

// 选择 调整大小
function selectResizing(child: GridDragResizeItemProps) {
  if (Math.abs(clickOffsetX) < 5 && Math.abs(clickOffsetY) < 5) {
    resizingChild.value = child

    draggingChild.value = undefined
    draggingChildBefore.value = undefined
    draggingChildRect.value = undefined
    draggingChildEle.value = undefined
  }
}

if (sub) {
  // 补充 鼠标超出区域时 计算是否为点击
  window.addEventListener('mousedown', (e: MouseEvent) => {
    // 更新 点击开始位置
    clickStartX = e.clientX
    clickStartY = e.clientY
  })
  window.addEventListener('mouseup', (e: MouseEvent) => {
    // 计算 点击拖动偏移量
    clickOffsetX = e.clientX - clickStartX
    clickOffsetY = e.clientY - clickStartY

    // 状态重置
    {
      resizingReset()
      dragReset()
    }
  })
} else {
  window.addEventListener('mousedown', dragStart)
  window.addEventListener('mousemove', dragMove)
  window.addEventListener('mouseup', dragEnd)
}

// 点击空白区域，清空选择
window.addEventListener('click', clearSelection)

// 拖入中
function dropover(e: DragEvent) {
  if (droppableInDefault.value) {
    e.stopPropagation()
    e.preventDefault()

    if (stateInject) {
      stateInject.droppingEle.value = rootEle.value
    }

    if (droppingChildParsed.value) {
      // 当前拖动子组件的 grid 大小
      let rowSpan = droppingChildParsed.value.rows ?? 1
      let columnSpan = droppingChildParsed.value.columns ?? 1

      const rootRect = rootEle?.value?.getBoundingClientRect() ?? {
        height: 0,
        width: 0,
        x: 0,
        y: 0,
        bottom: 0,
        right: 0
      }

      // 相对于 组件 的鼠标位置（并考虑 相对于 当前拖动子组件 的鼠标位置）
      let posY = e.clientY - rootRect.y
      if (posY < 0) {
        posY = 0
      } else if (!rowExpandableParsed.value && posY > rootRect.height) {
        posY = rootRect.height
      }

      let posX = e.clientX - rootRect.x
      if (posX < 0) {
        posX = 0
      } else if (!columnExpandableParsed.value && posX > rootRect.width) {
        posX = rootRect.width
      }

      // 计算行方向上，移动后最新的位置和大小
      let { start: rowStart, end: rowEnd } = calcDragStartEndByPos({
        size: rowSize.value,
        gap: gapParsed.value,
        span: rowSpan,
        max: rows.value ?? 1,
        pos: posY,
        expandable: rowExpandableParsed.value
      })

      // 更新 当前拖入子组件的数据项
      droppingChildParsed.value.rowStart = rowStart
      droppingChildParsed.value.rowEnd = rowEnd

      if (rowExpandableParsed.value) {
        // 向下扩展
        rows.value = calcMaxCount('rows', rowsParsed.value, [droppingChildParsed.value])
      }

      // 计算列方向上，移动后最新的位置和大小
      let { start: columnStart, end: columnEnd } = calcDragStartEndByPos({
        size: columnSize.value,
        gap: gapParsed.value,
        span: columnSpan,
        max: columns.value ?? 1,
        pos: posX,
        expandable: columnExpandableParsed.value
      })

      // 更新 当前拖入子组件的数据项
      droppingChildParsed.value.columnStart = columnStart
      droppingChildParsed.value.columnEnd = columnEnd

      if (columnExpandableParsed.value) {
        // 向右扩展
        columns.value = calcMaxCount('columns', columnsParsed.value, [droppingChildParsed.value])
      }
    }
  }
}

// 拖入结束
function drop(e: DragEvent) {
  if (droppableInDefault.value) {
    e.stopPropagation()
    e.preventDefault()

    // 在自己的 parent drop 不算数
    if (droppingChildParsed.value && !droppingSelfOrParent.value) {
      // 拖出删除
      stateInject?.droppingChildRemove?.()

      let child = { ...droppingChildParsed.value }
      if (beforeDropParsed.value instanceof Function) {
        const res = beforeDropParsed.value(child)
        if (res instanceof Promise) {
          res
            .then((c) => {
              child = c ?? child

              childrenParsed.value?.push(child)
              emit('update:children', childrenParsed.value)
            })
            .catch((e) => {
              console.error(e)
            })
        } else {
          child = res ?? child

          childrenParsed.value?.push(child)
          emit('update:children', childrenParsed.value)
        }
      } else {
        childrenParsed.value?.push(child)
        emit('update:children', childrenParsed.value)
      }
    }

    droppingChildClear()
  }
}

if (!sub) {
  // 鼠标处理事件（处理拖入中的扩展）
  window.addEventListener('dragover', dropover)
}

// 是否阻止事件传递
const sholdStop = computed(() => {
  if (rootEle.value && stateInject) {
    if (stateInject.actionEle.value) {
      // 通过“contains”、“判断是否为自身”两种方式判断：
      // 高层的 GridDragResize 或是 自身 正在 drag、resize 操作
      return (
        !stateInject.actionEle.value.contains(rootEle.value) ||
        stateInject.actionEle.value === rootEle.value
      )
    }
  }

  // 假如没有上面的逻辑，均返回 true （阻止）
  // 将会导致高层的 GridDragResize 往内部 resize 的时候失效
  return true
})

let draggingBlank = false

// 嵌套时，控制事件传递
function subDragStart(e: MouseEvent) {
  draggingBlank = e.target === rootEle.value

  if (sub && sholdStop.value && !draggingBlank) {
    e.stopPropagation()

    dragStart(e)
  }
}

function subDragMove(e: MouseEvent) {
  if (sub && sholdStop.value && !draggingBlank) {
    e.stopPropagation()

    dragMove(e)
  }
}

function subDragEnd(e: MouseEvent) {
  if (sub && sholdStop.value && !draggingBlank) {
    e.stopPropagation()

    dragEnd(e)
  }

  draggingBlank = false
}

function subClick(e: MouseEvent) {
  if (sub && e.target !== rootEle.value) {
    e.stopPropagation()

    clearSelection()
  }
}

// 移除
function remove(child: GridDragResizeItemProps) {
  if (childrenParsed.value) {
    const idx = childrenParsed.value.findIndex((o) => o === child)
    if (idx > -1) {
      childrenParsed.value.splice(idx, 1)
      emit('update:children', childrenParsed.value)
    }
  }
}

function dropStart(
  val: {
    ele: HTMLElement | undefined
    remove: () => void | undefined
  },
  child: GridDragResizeItemProps
) {
  childDropStart(child, val)
}

const droppingRowColumn = computed(() => {
  const rowColumn = {
    columnStart: droppingChildParsed?.value?.columnStart ?? 1,
    columnEnd: droppingChildParsed?.value?.columnEnd ?? 2,
    rowStart: droppingChildParsed?.value?.rowStart ?? 1,
    rowEnd: droppingChildParsed?.value?.rowEnd ?? 2
  }
  return rowColumn
})

function subDropover(e: DragEvent) {
  if (sub && droppableInDefault.value) {
    e.stopPropagation()

    dropover(e)
  }
}

// 克隆
function deepClone(child: Record<string, any>): GridDragResizeItemProps {
  const copy: Record<string, any> = {}
  for (const p in child) {
    if (Array.isArray(child[p])) {
      copy[p] = child[p].map((o: any) => deepClone(o))
    } else if (child[p] instanceof Function) {
      copy[p] = child[p]
    } else if (child[p] instanceof Object) {
      copy[p] = deepClone(child[p])
    } else {
      copy[p] = child[p]
    }
  }
  return copy as GridDragResizeItemProps
}

// 内部互 drop 开始
function childDropStart(
  child: GridDragResizeItemProps,
  val: { ele: HTMLElement | undefined; remove: () => void }
) {
  if (stateInject) {
    stateInject.droppingChild.value = deepClone(child)
    stateInject.droppingChildEle.value = val.ele
    stateInject.droppingChildRaw.value = child
    stateInject.droppingChildRemove = val.remove

    emit('update:droppingChild', stateInject.droppingChild.value)
  }
}

// 内部互 drop 结束
function childDropEnd() {
  clearSelection()

  droppingChildClear()
}
</script>

<template>
  <component
    :is="tagNameParsed"
    class="grid-drag-resize"
    :class="[
      ...(classNameParsed ? [classNameParsed] : []),
      ...(sub ? ['grid-drag-resize--sub'] : []),
      ...(droppingChildParsed && dropping ? ['grid-drag-resize--dropping'] : [])
    ]"
    :style="style"
    ref="rootEle"
    @dragover="subDropover"
    @drop="drop"
    @mousedown="subDragStart"
    @mousemove="subDragMove"
    @mouseup="subDragEnd"
    @click="subClick"
    v-if="$slots.default === void 0"
  >
    <template v-for="(child, idx) of childrenParsed" :key="child">
      <GridDragResizeItem
        :class="{
          'grid-drag-resize__item--dragging': draggingChild === child,
          'grid-drag-resize__item--selected': stateInject?.selectedChild.value === child,
          'grid-drag-resize__item--resizing':
            stateInject?.selectedChild.value === child && resizingChild === child
        }"
        :style="{
          zIndex:
            draggingChild === child
              ? childrenParsed.length + 2
              : stateInject?.selectedChild.value === child
                ? childrenParsed.length + 1
                : idx + 1,
          cursor: resizingChildCursor
        }"
        v-bind="child"
        v-model:column-start="child.columnStart"
        v-model:column-end="child.columnEnd"
        v-model:row-start="child.rowStart"
        v-model:row-end="child.rowEnd"
        v-model:rows="child.rows"
        v-model:columns="child.columns"
        @startDrag="startDrag($event, child)"
        @select="select(child)"
        @selectResizing="selectResizing(child)"
        @startResize="resizingStart"
        @remove="remove(child)"
        @dropStart="dropStart($event, child)"
        @dropEnd="childDropEnd"
      >
        <GridDragResize
          v-bind="child.child"
          v-model:children="child.child.children"
          v-if="child.child"
        >
        </GridDragResize>
        <component v-bind="child" :is="child.render" v-else></component>
      </GridDragResizeItem>
    </template>
    <GridDragResizeItem
      class="grid-drag-resize__item--shadow"
      :style="{ zIndex: childrenParsed.length + 3 }"
      v-bind="droppingRowColumn"
      :draggable="false"
      :resizable="false"
      v-show="droppingChildParsed && dropping"
    >
    </GridDragResizeItem>
  </component>
  <component
    :is="tagNameParsed"
    class="grid-drag-resize"
    :class="[
      ...(classNameParsed ? [classNameParsed] : []),
      ...(sub ? ['grid-drag-resize--sub'] : [])
    ]"
    ref="rootEle"
    v-else
  >
    <slot></slot>
  </component>
</template>

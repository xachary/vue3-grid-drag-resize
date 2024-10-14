<script setup lang="ts">
import { ref, computed, provide, watch, type Ref } from 'vue'

import type { GridDragResizeProps, GridDragResizeItemProps, StartResizeEvent, StartDragEvent } from './types'

import GridDragResizeItem from './GridDragResizeItem.vue'

const props = withDefaults(defineProps<GridDragResizeProps>(), {
    children: () => []
});

const childrenParsed: Ref<GridDragResizeItemProps[]> = ref([...props.children])

watch(() => props.children, () => {
    childrenParsed.value = [...props.children]
})

type Emit = {
    (e: 'update:rows', val: number): void
    (e: 'update:columns', val: number): void
    (e: 'update:children', val: GridDragResizeProps['children']): void
}

const emit = defineEmits<Emit>()

// 转换为 grid 模版
function gridTemplateParse(count: number, size?: number) {
    return `repeat(${count},${Number.isInteger(size) ? `${size}px` : '1fr'})`
}

// 如果没定义 行数/列数，根据 children 计算合适的 行数/列数
function calcMaxCount(target: string, count?: number, more: GridDragResizeItemProps[] = []) {
    if (!Number.isInteger(count) || (Number.isInteger(count) && count! < 1)) {
        count = [...childrenParsed.value, ...more].reduce((max, child) => {
            const end = { rows: child.rowEnd, columns: child.columnEnd }[target]
            if (end && end > 1) {
                if (end - 1 > max) {
                    max = end - 1
                }
            }
            return max
        }, 1)
    }

    return count ?? 1
}

const rows = ref(1)
const columns = ref(1)

watch(() => [props.rows, props.columns], () => {
    rows.value = calcMaxCount('rows', props.rows)
    columns.value = calcMaxCount('columns', props.columns)

    if (rows.value !== props.rows) {
        emit('update:rows', rows.value)
    }

    if (columns.value !== props.columns) {
        emit('update:columns', columns.value)
    }
}, {
    immediate: true
})

// grid 样式
const style = computed(() => {
    return {
        'grid-template-columns': gridTemplateParse(columns.value, props.columnSize),
        'grid-template-rows': gridTemplateParse(rows.value, props.rowSize),
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
    return props.columnSize ?? (rootRect.value.width - (props.gap ?? 0) * (columns.value - 1)) / columns.value
})

// 行高
const rowSize = computed(() => {
    return props.rowSize ?? (rootRect.value.height - (props.gap ?? 0) * (rows.value - 1)) / rows.value
})

// 点击开始位置
let clickStartX = 0, clickStartY = 0
// 点击偏移量
let clickOffsetX = 0, clickOffsetY = 0

// 调整大小
let resizing = false

// 当前选中子组件的数据项
const selectingChild: Ref<GridDragResizeItemProps | undefined> = ref()

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
let resizeStartClientX = 0, resizeStartClientY = 0;
// 调整大小拖动偏移量
let resizeOffsetClientRow = 0, resizeOffsetClientColumn = 0;

// 拖动中
let dragging = false

// 当前拖动子组件的数据项
const draggingChild: Ref<GridDragResizeItemProps | undefined> = ref()
// 当前拖动子组件的数据项（初始状态）
const draggingChildBefore: Ref<GridDragResizeItemProps | undefined> = ref()
// 当前拖动子组件的位置、大小信息
const draggingChildRect: Ref<DOMRect | undefined> = ref()
// 当前拖动子组件的 Dom
const draggingChildEle: Ref<HTMLElement | undefined> = ref()

// 拖动开始位置
let dragStartClientX = 0, dragStartClientY = 0;
// 拖动偏移量
let dragOffsetClientRow = 0, dragOffsetClientColumn = 0;

// 计算移动方向
// let lastClientX = 0, lastClientY = 0
let rowDirection = 0, columnDirection = 0

// 根据鼠标拖动偏移量，计算列/行方向上，移动后最新的位置和大小
function calcDragStartEndByOffset(opts: { size: number, gap: number, span: number, max: number, offset: number, startBefore: number, direction: number, expandable: boolean }) {
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
function calcDragStartEndByPos(opts: { size: number, gap: number, span: number, max: number, pos: number, expandable: boolean }) {
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
function calcResizeStartEnd(opts: { size: number, gap: number, max: number, offset: number, startBefore: number, endBefore: number, target: 'start' | 'end', expandable: boolean }) {
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
    resizing = false

    resizingChildBefore.value = undefined
    resizingChildRect.value = undefined
    resizingChildCursor.value = ''
    resizingChildDirection.value = ''

    document.body.style.cursor = ''
}

function dragReset() {
    dragging = false

    draggingChild.value = undefined
    draggingChildBefore.value = undefined
    draggingChildRect.value = undefined
    draggingChildEle.value = undefined
}

// 元素是否整个在都可视区域内
function isElementInViewport(el: HTMLElement) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
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
function resizingStart(res: StartResizeEvent, ...args: any[]) {
    // console.log(args)
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
    resizing = true

    // 更新计算所需信息
    resizingChildRect.value = rect
    resizingChildCursor.value = cursor
    resizingChildDirection.value = direction

    // 拖出区域保持鼠标类型
    document.body.style.cursor = cursor

    // 缓存状态
    resizingChildBefore.value = { ...selectingChild.value };
}

// 更新拖动信息
function updateDrag(child: GridDragResizeItemProps, rect: DOMRect, target: HTMLElement) {
    draggingChild.value = child;
    draggingChildBefore.value = { ...child };
    draggingChildRect.value = rect;
    draggingChildEle.value = target
}

// 拖动开始
function dragStart(e: MouseEvent) {
    e.stopPropagation()

    // 更新 点击开始位置
    clickStartX = e.clientX
    clickStartY = e.clientY

    if (!props.readonly) {
        if (draggingChild.value && draggingChildRect.value) {
            // 状态互斥
            resizingReset()
            dragging = true

            // 记录 拖动开始位置
            dragStartClientX = e.clientX
            dragStartClientY = e.clientY

            // lastClientX = e.clientX
            // lastClientY = e.clientY
            // rowDirection = 0
            // columnDirection = 0
        }
    }
}

// 拖动中
function dragMove(e: MouseEvent) {
    e.stopPropagation()

    if (dragging && draggingChild.value) {
        // 计算 拖动偏移量
        dragOffsetClientColumn = e.clientX - dragStartClientX
        dragOffsetClientRow = e.clientY - dragStartClientY

        // lastClientX = e.clientX
        // lastClientY = e.clientY

        // 当前拖动子组件的 grid 大小
        let rowSpan = (draggingChild.value.rowEnd ?? draggingChild.value.rowStart ?? 1) - (draggingChild.value.rowStart ?? 1)
        let columnSpan = (draggingChild.value.columnEnd ?? draggingChild.value.columnStart ?? 1) - (draggingChild.value.columnStart ?? 1)

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
            size: rowSize.value, gap: (props.gap ?? 0), span: rowSpan, max: rows.value ?? 1, offset: dragOffsetClientRow, startBefore: draggingChildBefore.value?.rowStart ?? 1, direction: rowDirection, expandable: props.rowExpandable ?? false
        })

        if (props.rowExpandable) {
            // 向下扩展
            rows.value = calcMaxCount('rows')
        }

        // 计算列方向上，移动后最新的位置和大小
        let { start: columnStart, end: columnEnd } = calcDragStartEndByOffset({
            size: columnSize.value, gap: (props.gap ?? 0), span: columnSpan, max: columns.value ?? 1, offset: dragOffsetClientColumn, startBefore: draggingChildBefore.value?.columnStart ?? 1, direction: columnDirection, expandable: props.columnExpandable ?? false
        })

        if (props.columnExpandable) {
            // 向右扩展
            columns.value = calcMaxCount('columns')
        }

        // 更新 当前拖动子组件的数据项
        draggingChild.value.columnStart = columnStart
        draggingChild.value.columnEnd = columnEnd
        draggingChild.value.rowStart = rowStart
        draggingChild.value.rowEnd = rowEnd


        // 滚动跟随
        scrollIntoViewIfNeeded(draggingChildEle.value)
    }
    if (resizing) {
        // 计算 调整大小拖动偏移量
        resizeOffsetClientColumn = e.clientX - resizeStartClientX
        resizeOffsetClientRow = e.clientY - resizeStartClientY

        if (selectingChild.value) {
            // 行 向
            if (resizingChildDirection.value.startsWith('top')) {
                let { start: rowStart, end: rowEnd } = calcResizeStartEnd({
                    size: rowSize.value, gap: (props.gap ?? 0), max: rows.value ?? 1, offset: resizeOffsetClientRow, startBefore: resizingChildBefore.value?.rowStart ?? 1, endBefore: resizingChildBefore.value?.rowEnd ?? 1, target: 'start', expandable: props.rowExpandable
                })
                selectingChild.value.rowStart = rowStart
                selectingChild.value.rowEnd = rowEnd
                selectingChild.value.columns = rowEnd - rowStart
            } else if (resizingChildDirection.value.startsWith('bottom')) {
                let { start: rowStart, end: rowEnd } = calcResizeStartEnd({
                    size: rowSize.value, gap: (props.gap ?? 0), max: rows.value ?? 1, offset: resizeOffsetClientRow, startBefore: resizingChildBefore.value?.rowStart ?? 1, endBefore: resizingChildBefore.value?.rowEnd ?? 1, target: 'end', expandable: props.rowExpandable
                })
                selectingChild.value.rowStart = rowStart
                selectingChild.value.rowEnd = rowEnd
                selectingChild.value.columns = rowEnd - rowStart

                if (props.rowExpandable) {
                    // 向下扩展
                    rows.value = calcMaxCount('rows')
                }
            }

            // 列 向
            if (resizingChildDirection.value.endsWith('left')) {
                let { start: columnStart, end: columnEnd } = calcResizeStartEnd({
                    size: columnSize.value, gap: (props.gap ?? 0), max: columns.value ?? 1, offset: resizeOffsetClientColumn, startBefore: resizingChildBefore.value?.columnStart ?? 1, endBefore: resizingChildBefore.value?.columnEnd ?? 1, target: 'start', expandable: props.columnExpandable
                })
                selectingChild.value.columnStart = columnStart
                selectingChild.value.columnEnd = columnEnd
                selectingChild.value.columns = columnEnd - columnStart
            } else if (resizingChildDirection.value.endsWith('right')) {
                let { start: columnStart, end: columnEnd } = calcResizeStartEnd({
                    size: columnSize.value, gap: (props.gap ?? 0), max: columns.value ?? 1, offset: resizeOffsetClientColumn, startBefore: resizingChildBefore.value?.columnStart ?? 1, endBefore: resizingChildBefore.value?.columnEnd ?? 1, target: 'end', expandable: props.columnExpandable
                })
                selectingChild.value.columnStart = columnStart
                selectingChild.value.columnEnd = columnEnd
                selectingChild.value.columns = columnEnd - columnStart

                if (props.columnExpandable) {
                    // 向右扩展
                    columns.value = calcMaxCount('columns')
                }
            }
        }


        // 滚动跟随
        scrollIntoViewIfNeeded(resizingChildEle.value)
    }
}

// 拖动结束
function dragEnd(e: MouseEvent) {
    e.stopPropagation()

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
        selectingChild.value = undefined
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
        selectingChild.value = child;

        draggingChild.value = undefined
        draggingChildBefore.value = undefined;
        draggingChildRect.value = undefined;
        draggingChildEle.value = undefined
    }
}

// 鼠标处理事件
window.addEventListener('mousedown', dragStart)
window.addEventListener('mousemove', dragMove)
window.addEventListener('mouseup', dragEnd)

// 点击空白区域，清空选择
window.addEventListener('click', clearSelection)

// 拖入子组件的数据项
const droppingChild: Ref<GridDragResizeItemProps | undefined> = ref()

defineExpose({
    // 设置 拖入子组件的数据项
    setDropping: (child: GridDragResizeItemProps) => {
        droppingChild.value = child
    },
    // 清除 拖入子组件的数据项
    clearDropping: () => {
        droppingChild.value = undefined
    }
})

// 拖入中
function dropover(e: DragEvent) {
    e.preventDefault()

    if (droppingChild.value) {
        // 当前拖动子组件的 grid 大小
        let rowSpan = droppingChild.value.rows ?? 1
        let columnSpan = droppingChild.value.columns ?? 1

        // 相对于 组件 的鼠标位置（并考虑 相对于 当前拖动子组件 的鼠标位置）
        let posY = e.clientY - rootRect.value.y
        if (posY < 0) {
            posY = 0
        } else if (!props.rowExpandable && posY > rootRect.value.height) {
            posY = rootRect.value.height
        }

        let posX = e.clientX - rootRect.value.x
        if (posX < 0) {
            posX = 0
        } else if (!props.columnExpandable && posX > rootRect.value.width) {
            posX = rootRect.value.width
        }

        // 计算行方向上，移动后最新的位置和大小
        let { start: rowStart, end: rowEnd } = calcDragStartEndByPos({
            size: rowSize.value, gap: (props.gap ?? 0), span: rowSpan, max: rows.value ?? 1, pos: posY, expandable: props.rowExpandable ?? false
        })

        // 更新 当前拖入子组件的数据项
        droppingChild.value.rowStart = rowStart
        droppingChild.value.rowEnd = rowEnd

        if (props.rowExpandable) {
            // 向下扩展
            rows.value = calcMaxCount('rows', undefined, [droppingChild.value])
        }

        // 计算列方向上，移动后最新的位置和大小
        let { start: columnStart, end: columnEnd } = calcDragStartEndByPos({
            size: columnSize.value, gap: (props.gap ?? 0), span: columnSpan, max: columns.value ?? 1, pos: posX, expandable: props.columnExpandable ?? false
        })

        // 更新 当前拖入子组件的数据项
        droppingChild.value.columnStart = columnStart
        droppingChild.value.columnEnd = columnEnd

        if (props.columnExpandable) {
            // 向右扩展
            columns.value = calcMaxCount('columns', undefined, [droppingChild.value])
        }
    }
}

// 拖入结束
function drop(e: DragEvent) {
    e.preventDefault()

    if (droppingChild.value) {
        childrenParsed.value?.push({ ...droppingChild.value })
        emit('update:children', childrenParsed.value)
    }
    droppingChild.value = undefined
}

// 鼠标处理事件
window.addEventListener('dragover', dropover)
window.addEventListener('drop', drop)
</script>

<template>
<div class="grid-drag-resize" :style="style" ref="rootEle" @dragover="dropover" @drop="drop">
    <template v-for="(child, idx) of childrenParsed" :key="idx">
        <GridDragResizeItem v-bind="child" v-model:column-start="child.columnStart" v-model:column-end="child.columnEnd"
            v-model:row-start="child.rowStart" v-model:row-end="child.rowEnd" @startDrag="startDrag($event, child)"
            @select="select(child)" @startResize="resizingStart"
            :style="{ 'zIndex': draggingChild === child ? childrenParsed.length + 2 : selectingChild === child ? childrenParsed.length + 1 : idx + 1, cursor: resizingChildCursor }"
            :class="{ 'grid-drag-resize__item--dragging': draggingChild === child, 'grid-drag-resize__item--selected': selectingChild === child }">
            <component :is="child.render" v-bind="child"></component>
        </GridDragResizeItem>
    </template>
    <GridDragResizeItem v-show="droppingChild" :draggable="false" :resizable="false"
        :column-start="droppingChild?.columnStart" :column-end="droppingChild?.columnEnd"
        :row-start="droppingChild?.rowStart" :row-end="droppingChild?.rowEnd"
        :style="{ 'zIndex': childrenParsed.length + 3 }" class="grid-drag-resize__item--shadow">
    </GridDragResizeItem>
</div>
</template>
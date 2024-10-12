<script setup lang="ts">
import { ref, computed, provide, watch, type Ref } from 'vue'

import type { GridDragResizeProps, GridDragResizeItemProps, StartResizeEvent } from './types'

import GridDragResizeItem from './GridDragResizeItem.vue'

const props = withDefaults(defineProps<GridDragResizeProps>(), {
    children: () => []
});

type Emit = {
    (e: 'update:rows', val: number): void
    (e: 'update:columns', val: number): void
}

const emit = defineEmits<Emit>()

// 转换为 grid 模版
function gridTemplateParse(count: number, size?: number) {
    return `repeat(${count},${Number.isInteger(size) ? `${size}px` : '1fr'})`
}

// 如果没定义 行数/列数，根据 children 计算合适的 行数/列数
function calcMaxCount(target: string, count?: number) {
    if (!Number.isInteger(count) || (Number.isInteger(count) && count! < 1)) {
        count = props.children.reduce((max, child) => {
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

// 当前调整大小子组件的数据项
const resizingChild: Ref<GridDragResizeItemProps | undefined> = ref()
// 当前调整大小子组件的数据项（初始状态）
const resizingChildBefore: Ref<GridDragResizeItemProps | undefined> = ref()
// 当前调整大小子组件的位置、大小信息
const resizingChildRect: Ref<DOMRect | undefined> = ref()
// 当前调整大小类型
const resizingChildCursor: Ref<string> = ref('')
// 当前调整大小方向
const resizingChildDirection: Ref<string> = ref('')

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

// // 根据鼠标拖动位置（相对于组件），计算列/行方向上的位置，移动后最新的位置和大小
// function calcDragStartEndByPos(opts: { size: number, gap: number, span: number, max: number, pos: number }) {
//     let { size, gap, span, max, pos } = opts

//     // 虚拟地在 grid 四边补充二分之一的 gap 距离
//     // 如此，通过计算 拖动位置（相对于组件）与 大小+间隙 的倍数即可
//     let start = Math.ceil((pos + gap / 2) / (size + gap))

//     if (start < 1) {
//         start = 1
//     }

//     if (start + span > max) {
//         start = max - span + 1
//     }

//     return {
//         start,
//         end: start + span
//     }
// }

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

// 调整大小开始
function resizingStart(res: StartResizeEvent) {
    const { event: e, rect, cursor, direction } = res

    // 更新 点击开始位置
    clickStartX = e.clientX
    clickStartY = e.clientY

    // 更新 调整大小开始位置
    resizeStartClientX = e.clientX
    resizeStartClientY = e.clientY

    // 状态互斥
    dragging = false
    resizing = true

    // 更新计算所需信息
    resizingChildRect.value = rect
    resizingChildCursor.value = cursor
    resizingChildDirection.value = direction

    // 拖出区域保持鼠标类型
    document.body.style.cursor = cursor

    // 缓存状态
    resizingChildBefore.value = { ...resizingChild.value };
}

// 更新拖动信息
function updateDrag(child: GridDragResizeItemProps, rect: DOMRect) {
    draggingChild.value = child;
    draggingChildBefore.value = { ...child };
    draggingChildRect.value = rect;
}

// 拖动开始
function dragStart(e: MouseEvent) {
    // 更新 点击开始位置
    clickStartX = e.clientX
    clickStartY = e.clientY

    if (!props.readonly) {
        if (draggingChild.value && draggingChildRect.value) {
            // 状态互斥
            resizing = false
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
    if (dragging && draggingChild.value) {
        // 计算 拖动偏移量
        dragOffsetClientColumn = e.clientX - dragStartClientX
        dragOffsetClientRow = e.clientY - dragStartClientY

        // if (e.clientX > lastClientX) {
        //     columnDirection = 1
        // } else if (e.clientX < lastClientX) {
        //     columnDirection = -1
        // }

        // if (e.clientY > lastClientY) {
        //     rowDirection = 1
        // } else if (e.clientY < lastClientY) {
        //     rowDirection = -1
        // }

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

        // // 相对于 组件 的鼠标位置（并考虑 相对于 当前拖动子组件 的鼠标位置）
        // let posY = e.clientY - rootRect.value.y
        // if (posY < 0) {
        //     posY = 0
        // } else if (posY > rootRect.value.height) {
        //     posY = rootRect.value.height
        // }

        // let posX = e.clientX - rootRect.value.x
        // if (posX < 0) {
        //     posX = 0
        // } else if (posX > rootRect.value.width) {
        //     posX = rootRect.value.width
        // }

        // // 计算行方向上，移动后最新的位置和大小
        // let { start: rowStart, end: rowEnd } = calcDragStartEndByPos({
        //     size: rowSize.value, gap: (props.gap ?? 0), span: rowSpan, max: rows.value ?? 1, pos: posY
        // })

        // // 计算列方向上，移动后最新的位置和大小
        // let { start: columnStart, end: columnEnd } = calcDragStartEndByPos({
        //     size: columnSize.value, gap: (props.gap ?? 0), span: columnSpan, max: columns.value ?? 1, pos: posX
        // })

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
    }
    if (resizing) {
        // 计算 调整大小拖动偏移量
        resizeOffsetClientColumn = e.clientX - resizeStartClientX
        resizeOffsetClientRow = e.clientY - resizeStartClientY

        if (resizingChild.value) {
            // 行 向
            if (resizingChildDirection.value.startsWith('top')) {
                let { start: rowStart, end: rowEnd } = calcResizeStartEnd({
                    size: rowSize.value, gap: (props.gap ?? 0), max: rows.value ?? 1, offset: resizeOffsetClientRow, startBefore: resizingChildBefore.value?.rowStart ?? 1, endBefore: resizingChildBefore.value?.rowEnd ?? 1, target: 'start', expandable: props.rowExpandable
                })
                resizingChild.value.rowStart = rowStart
                resizingChild.value.rowEnd = rowEnd
            } else if (resizingChildDirection.value.startsWith('bottom')) {
                let { start: rowStart, end: rowEnd } = calcResizeStartEnd({
                    size: rowSize.value, gap: (props.gap ?? 0), max: rows.value ?? 1, offset: resizeOffsetClientRow, startBefore: resizingChildBefore.value?.rowStart ?? 1, endBefore: resizingChildBefore.value?.rowEnd ?? 1, target: 'end', expandable: props.rowExpandable
                })
                resizingChild.value.rowStart = rowStart
                resizingChild.value.rowEnd = rowEnd

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
                resizingChild.value.columnStart = columnStart
                resizingChild.value.columnEnd = columnEnd
            } else if (resizingChildDirection.value.endsWith('right')) {
                let { start: columnStart, end: columnEnd } = calcResizeStartEnd({
                    size: columnSize.value, gap: (props.gap ?? 0), max: columns.value ?? 1, offset: resizeOffsetClientColumn, startBefore: resizingChildBefore.value?.columnStart ?? 1, endBefore: resizingChildBefore.value?.columnEnd ?? 1, target: 'end', expandable: props.columnExpandable
                })
                resizingChild.value.columnStart = columnStart
                resizingChild.value.columnEnd = columnEnd

                if (props.columnExpandable) {
                    // 向右扩展
                    columns.value = calcMaxCount('columns')
                }

            }
        }
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
        dragging = false
        draggingChild.value = undefined

        resizing = false
        resizingChildCursor.value = ''
        document.body.style.cursor = ''
    }
}

// 清除选择
function clearSelection() {
    // 判断真实 click
    if (Math.abs(clickOffsetX) < 5 && Math.abs(clickOffsetY) < 5) {
        // 取消选择
        resizing = false
        resizingChild.value = undefined

        resizingChildCursor.value = ''
        document.body.style.cursor = ''
    }

    // 取消拖动
    dragging = false
    draggingChild.value = undefined
}

// 选择
function select(child: GridDragResizeItemProps) {
    if (Math.abs(clickOffsetX) < 5 && Math.abs(clickOffsetY) < 5) {
        resizingChild.value = child;
        draggingChild.value = undefined
    }
}

// 超出组件区域，鼠标按下事件
function mousedownOut(e: MouseEvent) {
    // 更新 点击开始位置
    clickStartX = e.clientX
    clickStartY = e.clientY
}

// 超出窗口区域，补充鼠标按下事件
window.addEventListener('mousedown', mousedownOut)

// 鼠标处理事件
document.body.addEventListener('mousedown', dragStart)
document.body.addEventListener('mousemove', dragMove)
document.body.addEventListener('mouseup', dragEnd)

// 超出组件区域，补充结束事件
document.body.addEventListener('mouseup', dragEnd)
window.addEventListener('mouseup', dragEnd)

// 点击空白区域，清空选择
document.body.addEventListener('click', clearSelection)
window.addEventListener('click', clearSelection)
</script>

<template>
<div class="grid-drag-resize" :style="style" ref="rootEle">
    <template v-for="(child, idx) of props.children" :key="idx">
        <GridDragResizeItem v-bind="child" v-model:column-start="child.columnStart" v-model:column-end="child.columnEnd"
            v-model:row-start="child.rowStart" v-model:row-end="child.rowEnd"
            @startDrag="(rect) => updateDrag(child, rect)" @select="select(child)" @startResize="resizingStart"
            :style="{ 'zIndex': draggingChild === child ? props.children.length + 1 : idx + 1, cursor: resizingChildCursor }"
            :class="{ 'grid-drag-resize__item--dragging': draggingChild === child, 'grid-drag-resize__item--selected': resizingChild === child }">
            <component :is="child.render"></component>
        </GridDragResizeItem>
    </template>
</div>
</template>
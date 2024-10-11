import type { VNode } from 'vue'

// 子组件的 Props
export interface GridDragResizeItemProps {
  draggable?: boolean
  dragHandler?: string // 满足 querySelector 的查询字符串，指向可拖拉拽的元素位置
  resizable?: boolean
  // css display grid 属性
  columnStart?: number
  columnEnd?: number
  rowStart?: number
  rowEnd?: number
  //
  render?: () => VNode
}

// 组件的 Props
export interface GridDragResizeProps {
  dragHandler?: string // 同上，优先级 低于 子组件
  readonly?: boolean // 优先级 低于 子组件 的 draggable、resizable
  //
  columns?: number // 列数
  rows?: number // 行数
  gap?: number // 间隙
  columnSize?: number // 列宽，默认是 1fr
  rowSize?: number // 行高，默认是 1fr
  //
  children?: GridDragResizeItemProps[] // 子组件
}

// 子组件 startResize 事件返回数据
export interface StartResizeEvent {
  event: MouseEvent
  rect: DOMRect
  cursor: string
  direction: string
}
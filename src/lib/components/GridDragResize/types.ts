import type { VNode } from 'vue'

// 子组件的 Props
export interface GridDragResizeItemProps<T = any> {
  columns?: number // 列数
  rows?: number // 行数
  //
  // css display grid 属性
  columnStart?: number
  columnEnd?: number
  rowStart?: number
  rowEnd?: number
  //
  dragHandler?: string // 满足 querySelector 的查询字符串，指向可拖拉拽的元素位置
  //
  draggable?: boolean
  resizable?: boolean
  overflow?: string
  //
  render?: () => VNode
  //
  data?: T
}

// 组件的 Props
export interface GridDragResizeProps<T = any> {
  columns?: number // 列数
  rows?: number // 行数
  gap?: number // 间隙
  columnSize?: number // 列宽，undefined 相当于 1fr
  rowSize?: number // 行高，undefined 相当于 1fr
  columnExpandable?: boolean // 允许向右扩展列数
  rowExpandable?: boolean // 允许向下扩展行数
  //
  children?: GridDragResizeItemProps<T>[] // 子组件配置项
  //
  dragHandler?: string // 优先级低于子组件的 dragHandler
  readonly?: boolean // 优先级高于子组件的 draggable、resizable
}

// 子组件 startDrag 事件返回数据
export interface StartDragEvent {
  event: MouseEvent
  rect: DOMRect
}

// 子组件 startResize 事件返回数据
export interface StartResizeEvent {
  event: MouseEvent
  rect: DOMRect
  cursor: string
  direction: string
}

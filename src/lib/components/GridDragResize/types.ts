import type { VNode } from 'vue'

// 子组件的 Props
export interface GridDragResizeItemProps<T = any> {
  columns?: number // 列数
  rows?: number // 行数
  //
  columnStart?: number // CSS columnStart
  columnEnd?: number // CSS columnEnd
  rowStart?: number // CSS rowStart
  rowEnd?: number // CSS rowEnd
  //
  dragHandler?: string // 拖动锚点（querySelector）
  //
  draggable?: boolean // 是否可拖动
  resizable?: boolean // 是否可调整大小
  overflow?: string // CSS overflow
  //
  render?: () => VNode // 显示内容
  //
  data?: T // 数据项
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
  dragHandler?: string // 拖动锚点（querySelector），优先级低于子组件的 dragHandler
  readonly?: boolean // 只读，优先级高于子组件的 draggable、resizable
  //
  sub?: boolean // 嵌套所需
  //
  debug?: boolean // 用于调试
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

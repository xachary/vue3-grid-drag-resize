import type { VNode } from 'vue'

// ! 这些配置在嵌套过程中，会从外到内传递继承
export interface GridDragResizeCoommonProps {
  overflow?: string // CSS overflow
  dragHandler?: string // 拖动锚点（querySelector）
  //
  readonly?: boolean // * 只读，true 将禁用所有的 xxxable
  //
  draggable?: boolean // 是否可拖动
  resizable?: boolean // 是否可调整大小
  removable?: boolean // 是否移除
  droppableIn?: boolean // 是否可拖入
  droppableOut?: boolean // 是否可拖出
  //
  debug?: boolean
}

// 子组件的 Props
export interface GridDragResizeItemProps<T = any> extends GridDragResizeCoommonProps {
  columns?: number // 列数
  rows?: number // 行数
  //
  columnStart?: number // CSS columnStart
  columnEnd?: number // CSS columnEnd
  rowStart?: number // CSS rowStart
  rowEnd?: number // CSS rowEnd
  //
  render?: () => VNode // 显示内容
  //
  data?: T // 数据项
  //
  child?: GridDragResizeProps<T> // 子 GridDragResize
}

// 组件的 Props
export interface GridDragResizeProps<T = any> extends GridDragResizeCoommonProps {
  columns?: number // 列数
  rows?: number // 行数
  gap?: number // 间隙
  columnSize?: number // 列宽，undefined 相当于 1fr
  rowSize?: number // 行高，undefined 相当于 1fr
  //
  columnExpandable?: boolean // 允许向右扩展列数
  rowExpandable?: boolean // 允许向下扩展行数
  //
  children?: GridDragResizeItemProps<T>[] // 子组件配置项
  //
  droppingChild?: GridDragResizeItemProps // 拖入子组件的数据项
  selectedChild?: GridDragResizeItemProps // 选择项
  //
  beforeDrop?: (
    before: GridDragResizeItemProps
  ) => GridDragResizeItemProps | Promise<GridDragResizeItemProps> // 拖入之前进行处理
  //
  className?: string // 附加 CSS Class
  tagName?: string // 根 HTML 标签
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

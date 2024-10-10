import type { VNode } from 'vue'

export interface GridDragResizeItemProps {
  draggable?: boolean
  dragHandler?: string
  //
  columnStart?: number
  columnEnd?: number
  rowStart?: number
  rowEnd?: number
  //
  render?: () => VNode
}

export interface GridDragResizeProps {
  draggable?: boolean
  dragHandler?: string
  //
  columns?: number
  rows?: number
  gap?: number
  columnSize?: number
  rowSize?: number
  //
  children?: GridDragResizeItemProps[]
}

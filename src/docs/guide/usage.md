# 使用

```ts
import { ref, h, type Ref } from 'vue'
import { nanoid } from 'nanoid'

import { GridDragResize } from '@/lib/components/GridDragResize'
import type { GridDragResizeItemProps } from '@/lib/components/GridDragResize/types'

import ComponentA from '@/demo/components/ComponentA.vue'
import ComponentB from '@/demo/components/ComponentB.vue'

// 显示内容
const children: Ref<GridDragResizeProps['children']> = ref([
  {
    columnStart: 1,
    columns: 1,
    rowStart: 1,
    rows: 1,
    render: () => h(ComponentA),
    // 携带数据
    data: {
      // ...
    }
  },
  {
    columnStart: 2,
    columnEnd: 4,
    rowStart: 2,
    rowEnd: 4,
    render: () => h(ComponentB),
    className: 'demo-item'
  },
  {
    columnStart: 4,
    columns: 1,
    rowStart: 4,
    rows: 1,
    render: () => h('div', [h('span', '...')]),
    tagName: 'section'
  }
])
```

```html
<template>
  <GridDragResize
    :column-size="50"
    :row-size="50"
    :gap="10"
    v-model:children="candidate"
  ></GridDragResize>
</template>
```

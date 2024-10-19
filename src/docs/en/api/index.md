# GridDragResize

## Props

> GridDragResizeCoommonProps
>
> These props are inherited from the outside to the inside during the nesting group.

| 名称         | 类型    | 默认值    | 说明                                                      | 版本   |
| :----------- | :------ | :-------- | :-------------------------------------------------------- | :----- |
| overflow     | string  | undefined | CSS overflow, children has higher priority                | 0.6.0  |
| dragHandler  | string  | ''        | Drag anchor (querySelector), children has higher priority | 0.0.17 |
| readonly     | boolean | false     | Readonly, true will disable all xxxable                   | 0.0.17 |
| draggable    | boolean | true      | Draggable                                                 | 0.0.17 |
| resizable    | boolean | true      | Resizable                                                 | 0.0.17 |
| removable    | boolean | true      | Removable                                                 | 0.2.0  |
| droppableIn  | boolean | true      | Droppable in                                              | 0.7.0  |
| droppableOut | boolean | true      | Droppable out                                             | 0.7.0  |

> GridDragResizeProps&lt;T&gt;

| Name                    | Type                                                                                                                    | Default   | Desc                                                                | Version |
| :---------------------- | :---------------------------------------------------------------------------------------------------------------------- | :-------- | :------------------------------------------------------------------ | :------ |
| columns (v-model)       | number                                                                                                                  | 1         | Number of columns                                                   | 0.0.17  |
| rows (v-model)          | number                                                                                                                  | 1         | Number of rows                                                      | 0.0.17  |
| gap                     | number                                                                                                                  | 0         | gap size                                                            | 0.0.17  |
| columnSize              | number                                                                                                                  | undefined | Column size, undefined as 1fr                                       | 0.0.17  |
| rowSize                 | number                                                                                                                  | undefined | Row size, undefined undefined as 1fr                                | 0.0.17  |
| columnExpandable        | boolean                                                                                                                 | false     | Enable columns to expand to the right(Disable when in nested group) | 0.0.17  |
| rowExpandable           | boolean                                                                                                                 | false     | Enable rows to expand to the bottom(Disable when in nested group)   | 0.0.17  |
| children (v-model)      | GridDragResizeItemProps&lt;T&gt;[]                                                                                      | []        | children Props                                                      | 0.0.17  |
| droppingChild (v-model) | GridDragResizeItemProps                                                                                                 | undefined | Child which is dropping                                             | 0.2.6   |
| beforeDrop              | (prop:GridDragResizeItemProps)<br>=&gt;<br>GridDragResizeItemProps \|<br>Promise&lt;<br>GridDragResizeItemProps<br>&gt; | undefined | Update prop before drop                                             | 0.7.0   |
| className               | string                                                                                                                  | undefined | Add CSS Class                                                       | 0.4.0   |
| tagName                 | string                                                                                                                  | 'div'     | Root element TagName                                                | 0.7.0   |

## children Props

> GridDragResizeItemProps&lt;T&gt;

| Name                  | Type                         | Default   | Desc               | Version |
| :-------------------- | :--------------------------- | :-------- | :----------------- | :------ |
| columns (v-model)     | number                       | 1         | Number of columns  | 0.0.17  |
| rows (v-model)        | number                       | 1         | Number of rows     | 0.0.17  |
| columnStart (v-model) | number                       | 1         | CSS columnStart    | 0.0.17  |
| columnEnd (v-model)   | number                       | 2         | CSS columnEnd      | 0.0.17  |
| rowStart (v-model)    | number                       | 1         | CSS rowStart       | 0.0.17  |
| rowEnd (v-model)      | number                       | 2         | CSS rowEnd         | 0.0.17  |
| render                | () => VNode                  | undefined | Content            | 0.0.17  |
| data                  | T                            | undefined | Data               | 0.0.17  |
| child                 | GridDragResizeProps&lt;T&gt; | undefined | Sub GridDragResize | 0.4.0   |

# GridDragResize

## 配置项

> GridDragResizeCoommonProps
>
> 这些配置在嵌套过程中，会从外到内传递继承。

| 名称         | 类型    | 默认值    | 说明                                        | 版本   |
| :----------- | :------ | :-------- | :------------------------------------------ | :----- |
| overflow     | string  | undefined | CSS overflow ，子组件优先级更高             | 0.6.0  |
| dragHandler  | string  | ''        | 拖动锚点（querySelector），子组件优先级更高 | 0.0.17 |
| readonly     | boolean | false     | 只读，true 将禁用所有的 xxxable             | 0.0.17 |
| draggable    | boolean | true      | 是否可拖动                                  | 0.0.17 |
| resizable    | boolean | true      | 是否可调整大小                              | 0.0.17 |
| removable    | boolean | true      | 是否可移除                                  | 0.2.0  |
| droppableIn  | boolean | true      | 是否能拖入                                  | 0.7.0  |
| droppableOut | boolean | true      | 是否能拖出                                  | 0.7.0  |

> GridDragResizeProps&lt;T&gt;

| 名称                    | 类型                                                                                                                    | 默认值    | 说明                             | 版本   |
| :---------------------- | :---------------------------------------------------------------------------------------------------------------------- | :-------- | :------------------------------- | :----- |
| columns (v-model)       | number                                                                                                                  | 1         | 列数                             | 0.0.17 |
| rows (v-model)          | number                                                                                                                  | 1         | 行数                             | 0.0.17 |
| gap                     | number                                                                                                                  | 0         | 间隙                             | 0.0.17 |
| columnSize              | number                                                                                                                  | undefined | 列宽，undefined 相当于 1fr       | 0.0.17 |
| rowSize                 | number                                                                                                                  | undefined | 行高，undefined 相当于 1fr       | 0.0.17 |
| columnExpandable        | boolean                                                                                                                 | false     | 允许向右扩展列数（嵌套组件无效） | 0.0.17 |
| rowExpandable           | boolean                                                                                                                 | false     | 允许向下扩展行数（嵌套组件无效） | 0.0.17 |
| children (v-model)      | GridDragResizeItemProps&lt;T&gt;[]                                                                                      | []        | 子配置项                         | 0.0.17 |
| droppingChild (v-model) | GridDragResizeItemProps                                                                                                 | undefined | 正在拖入的配置项                 | 0.2.6  |
| selectedChild (v-model) | GridDragResizeItemProps                                                                                                 | undefined | 选中项                           | 0.8.0  |
| beforeDrop              | (prop:GridDragResizeItemProps)<br>=&gt;<br>GridDragResizeItemProps \|<br>Promise&lt;<br>GridDragResizeItemProps<br>&gt; | undefined | 拖入之前进行处理                 | 0.7.0  |
| className               | string                                                                                                                  | undefined | 附加 CSS Class                   | 0.4.0  |
| tagName                 | string                                                                                                                  | 'div'     | 根节点的 TagName                 | 0.7.0  |

## 事件

| Name   | Type                                        | Default   | Desc | Version |
| :----- | :------------------------------------------ | :-------- | :--- | :------ |
| select | (prop:GridDragResizeItemProps)<br>=&gt;void | undefined | 选择 | 0.8.0   |

## 子配置项

> GridDragResizeItemProps&lt;T&gt;

| 名称                  | 类型                         | 默认值    | 说明              | 版本   |
| :-------------------- | :--------------------------- | :-------- | :---------------- | :----- |
| columns (v-model)     | number                       | 1         | 列数              | 0.0.17 |
| rows (v-model)        | number                       | 1         | 行数              | 0.0.17 |
| columnStart (v-model) | number                       | 1         | CSS columnStart   | 0.0.17 |
| columnEnd (v-model)   | number                       | 2         | CSS columnEnd     | 0.0.17 |
| rowStart (v-model)    | number                       | 1         | CSS rowStart      | 0.0.17 |
| rowEnd (v-model)      | number                       | 2         | CSS rowEnd        | 0.0.17 |
| render                | () => VNode                  | undefined | 显示内容          | 0.0.17 |
| data                  | T                            | undefined | 数据项            | 0.0.17 |
| child                 | GridDragResizeProps&lt;T&gt; | undefined | 子 GridDragResize | 0.4.0  |

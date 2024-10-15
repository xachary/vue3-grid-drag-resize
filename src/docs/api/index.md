# GridDragResize

## 配置项

> GridDragResizeProps&lt;T&gt;

| 名称             | 类型                               | 默认值    | 说明                                          | 版本   |
| :--------------- | :--------------------------------- | :-------- | :-------------------------------------------- | :----- |
| columns          | number                             | 1         | 列数                                          | 0.0.17 |
| rows             | number                             | 1         | 行数                                          | 0.0.17 |
| gap              | number                             | 0         | 间隙                                          | 0.0.17 |
| columnSize       | number                             | undefined | 列宽，undefined 相当于 1fr                    | 0.0.17 |
| rowSize          | number                             | undefined | 行高，undefined 相当于 1fr                    | 0.0.17 |
| columnExpandable | boolean                            | false     | 允许向右扩展列数                              | 0.0.17 |
| rowExpandable    | boolean                            | false     | 允许向下扩展行数                              | 0.0.17 |
| children         | GridDragResizeItemProps&lt;T&gt;[] | []        | 子组件配置项                                  | 0.0.17 |
| dragHandler      | string                             | ''        | 拖动锚点，优先级低于子组件的 dragHandler      | 0.0.17 |
| readonly         | boolean                            | false     | 只读，优先级高于子组件的 draggable、resizable | 0.0.17 |

## 子配置项

> GridDragResizeItemProps&lt;T&gt;

| 名称        | 类型        | 默认值    | 说明                     | 版本   |
| :---------- | :---------- | :-------- | :----------------------- | :----- |
| columns     | number      | 1         | 列数，undefined 相当于 1 | 0.0.17 |
| rows        | number      | 1         | 行数，undefined 相当于 1 | 0.0.17 |
| columnStart | number      | 1         | CSS columnStart          | 0.0.17 |
| columnEnd   | number      | 2         | CSS columnEnd            | 0.0.17 |
| rowStart    | number      | 1         | CSS rowStart             | 0.0.17 |
| rowEnd      | number      | 2         | CSS rowEnd               | 0.0.17 |
| dragHandler | string      | ''        | 拖动锚点                 | 0.0.17 |
| draggable   | boolean     | true      | 是否可拖拉拽             | 0.0.17 |
| resizable   | boolean     | true      | 是否可调整大小           | 0.0.17 |
| overflow    | string      | 'hidden'  | CSS overflow             | 0.0.17 |
| render      | () => VNode | undefined | 显示内容                 | 0.0.17 |
| data        | T           | undefined | 数据项                   | 0.0.17 |

## 方法

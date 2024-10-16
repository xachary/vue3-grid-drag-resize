# GridDragResize

## Props

> GridDragResizeProps&lt;T&gt;

| Name               | Type                               | Default   | Desc                                                                       | Version |
| :----------------- | :--------------------------------- | :-------- | :------------------------------------------------------------------------- | :------ |
| columns (v-model)  | number                             | 1         | Number of columns                                                          | 0.0.17  |
| rows (v-model)     | number                             | 1         | Number of rows                                                             | 0.0.17  |
| gap                | number                             | 0         | gap size                                                                   | 0.0.17  |
| columnSize         | number                             | undefined | Column size, undefined as 1fr                                              | 0.0.17  |
| rowSize            | number                             | undefined | Row size, undefined undefined as 1fr                                       | 0.0.17  |
| columnExpandable   | boolean                            | false     | Enable columns to expand to the right                                      | 0.0.17  |
| rowExpandable      | boolean                            | false     | Enable rows to expand to the bottom                                        | 0.0.17  |
| children (v-model) | GridDragResizeItemProps&lt;T&gt;[] | []        | children Props                                                             | 0.0.17  |
| dragHandler        | string                             | ''        | Drag anchor (querySelector), children has higher priority                  | 0.0.17  |
| readonly           | boolean                            | false     | Readonly, true will disable the draggable/resizable/removable of children  | 0.0.17  |
| overflow           | string                             | undefined | CSS overflow, children has higher priority                                 | 0.6.0   |
| sub                | boolean                            | false     | Work as sub component, columnExpandable and rowExpandable will be disabled | 0.0.17  |
| droppingChild      | GridDragResizeItemProps            | undefined | Child which is dropping                                                    | 0.2.6   |
| droppable          | boolean                            | true      | Enable drop in                                                             | 0.5.0   |
| className          | string                             | undefined | Add CSS Class                                                              | 0.4.0   |

## children Props

> GridDragResizeItemProps&lt;T&gt;

| Name                  | Type                         | Default   | Desc                        | Version |
| :-------------------- | :--------------------------- | :-------- | :-------------------------- | :------ |
| columns (v-model)     | number                       | 1         | Number of columns           | 0.0.17  |
| rows (v-model)        | number                       | 1         | Number of rows              | 0.0.17  |
| columnStart (v-model) | number                       | 1         | CSS columnStart             | 0.0.17  |
| columnEnd (v-model)   | number                       | 2         | CSS columnEnd               | 0.0.17  |
| rowStart (v-model)    | number                       | 1         | CSS rowStart                | 0.0.17  |
| rowEnd (v-model)      | number                       | 2         | CSS rowEnd                  | 0.0.17  |
| dragHandler           | string                       | ''        | Drag anchor (querySelector) | 0.0.17  |
| draggable             | boolean                      | true      | Draggable                   | 0.0.17  |
| resizable             | boolean                      | true      | Resizable                   | 0.0.17  |
| removable             | boolean                      | true      | Removable                   | 0.2.0   |
| droppable             | boolean                      | true      | Enable drop out             | 0.5.0   |
| overflow              | string                       | undefined | CSS overflow                | 0.6.0   |
| render                | () => VNode                  | undefined | Content                     | 0.0.17  |
| data                  | T                            | undefined | Data                        | 0.0.17  |
| child                 | GridDragResizeProps&lt;T&gt; | undefined | Sub GridDragResize          | 0.4.0   |

#Основные термины и понятия
**jssy** Рабочее название нашего приложения. Как правило имеется в виду
фронтенд.

**Кодогенератор** Утилита для построения кода и всех вспомогательных файлов
(package.json, конфиг webpack и т.п.) по проекту.

**Метаданные** Метаданные библиотеки компонентов, необходимые jssy для её
использования при конструировании приложений. Должные содержаться в npm-пакете
с библиотекой компонентов в виде набора JSON-файлов. Метаданные всех библиотек
компонентов, используемых в проекте, собираются в один JSON-файл на этапе
построения бандла компонентов. Его структура:
```json
{
  "Library1": {
    "Foo": { /* metadata for component Foo */ },
    "Bar": { /* metadata for component Bar */ }
  },
  "Library2": {
    "Baz": { /* metadata for component Baz */ }
  }
}
```

**Бандл компонентов** Набор файлов, необходимых jssy для загрузки проекта.
Включает в себя собранные в один файл метаданные всех библиотек компонентов,
используемых в проекте, файл с кодом всех компонентов и дополнительные файлы,
необходимые компонентам (шрифты, картинти и т.п.). Бандл собирается бэкендом при
создании проекта через REST API (см.
[endpoints/create-project.js](../endpoints/create-project.js)) или консольной
утилитой [rebuild-components-bundle.js](../rebuild-components-bundle.js).

**Проект** Приложение, созданное пользователем в jssy, представленное в виде
JSON-сериализуемой структуры данных. Проект содержит список используемых
библиотек компонентов, дерево роутов, функции, созданные пользователем и,
опционально, URL GraphQL-endpoint'а. Формат проекта определен в файле
[shared/typedefs/project.js](../shared/typedefs/project.js) в формате jsdoc.

**Компонент** Структура данных, используемая в проекте для представления одного
react-компонента, HTML-тэга или служебного "псевдокомпонента", такого как текст,
список и т.п. Формат структуры компонента определен в
[shared/typedefs/project.js](../shared/typedefs/project.js) (см. typedef
`ProjectComponent`).

**Дерево компонентов** Древовидная структура из компонентов с одним корнем,
которая должна рендериться целиком. Приблизительно соответствует дереву из
JSX-тэгов в методе render react-компонента:
```jsx harmony
<SomeComponent>
  <Component1 />
  <Component2>
    <Component3 />
  </Component2>   
</SomeComponent>
```
Ссылки на компоненты по id из других компонентов допустимы только в пределах
одного дерева. Дочерние компоненты хранятся в виде массива в поле `children`
компонента.

**Роут** Экран в проекте. Имеет путь (относительно родительского роута),
который может содержать параметры (например: `user/:id`) и дерево компонентов.
Также может иметь дополнительное дерево компонентов для индексного роута и
правила редиректа. Формат структкры данных для роута см. в
[shared/typedefs/project.js](../shared/typedefs/project.js) (typedef
`ProjectRoute`).

**Дерево роутов** Древовидная структура из роутов с несколькими корневыми
вершинами (т.е. формально это лес :) ). Каждый проект содержит ровно одно дерево
роутов. Дерево роутов определяет все экраны, которые есть в проекте. Отношение
родитель-потомок означает следующее: в каждый момент может быть активен только
один из потомков, и его дерево компонентов вставится на место компонента Outlet
в дереве компонентов родителя. Дочерние роуты хранятся в виде массива в поле
`children` роута.

**Outlet** Компонент (в терминах этого документа), служащий указателем точки
монтирования деревьев компонентов дочерних роутов.

**Функция** Произвольная JS-функция, созданная пользователем в jssy, либо
структкра дынных, хранящая информацию о ней. Все функции храняться в структуре
проекта под ключом `functions`. Формат структкры данных для функции см. в
[shared/typedefs/project.js](../shared/typedefs/project.js) (typedef
`ProjectFunction`).

**JssyValue** Структура данных, содержащая инструкции по получению произвольного
значения (числа, строки, объекта, функции, ...) во время работы приложения,
созданного пользователем в jssy. Используется в структуре
проекта повсеместно: props компонентов, аргументы для GraphQL-запросов,
аргументы для вызова функции, параметры действий и т.п. Формат описан в файле 
[shared/typedefs/project.js](../shared/typedefs/project.js) (typedef
`PlainJssyValue`). Подробнее см. в [JssyValue](./jssy-values.md).

**Действие / Action** Структура, содержащая инструкции для выполнения чего-либо
(изменения значения prop компонента, GraphQL-мутации, перехода на другой роут и
т.п.). Встречается только внутри JssyValue с source, равным "actions". Формат
описан в файле 
[shared/typedefs/project.js](../shared/typedefs/project.js) (typedef `Action`).


[Назад](./index.md)
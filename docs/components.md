#Важные компоненты

##Canvas
Находится в файле
[app/src/containers/Canvas/Canvas.js](../app/src/containers/Canvas/Canvas.js).
Отвечает за создание и разрушение iframe, в котором рендерится дерево
компонентов, над которым работает пользователь. Это может быть дерево
компонентов роура (основное или индексное) или дерево компонентов из JssyValue с
source, равным "designer".
Также отвечает за инициализацию Apollo, проброс событий мыши и клавиатуры из
iframe в верхнее окно и проброс событий drag'n'drop внутрь iframe.
Является dropZone (см. HOC [dropZone](../app/src/hocs/dropZone.js)).

Внутрь iframe вставляется отрендеренный шаблон
[app/src/containers/Canvas/content/content.ejs](../app/src/containers/Canvas/content/content.ejs),
который содержит контейнеры для содержимого канвы и оверлея. В первый Canvas
рендерит
[CanvasContent](../app/src/containers/Canvas/content/containers/CanvasContent.js),
во второй - [Overlay](../app/src/containers/Canvas/content/containers/Overlay.js).
CanvasContent, в свою очередь, рендерит builder'ы, которые отображают текущее
состояние редактируемого дерева компонентов. Overlay отвечает за отображение
рамок и названий выделенных компонентов и остальной графики, выводимой поверх
канвы. Внутри iframe не допускается использонание CSS и модификация глобальной
области видимости (window), т.к. это может повлиять на работу или внешний вид
компонентов.

Передача данных между компонентами в основном окне и компонентами внутри iframe
осуществляется через общий redux store.

##Builders
Находятся в каталоге `app/src/containers/builders`. Билдеры отвечают за рендер
дерева компонентов. Всего их три:
+ [CanvasBuilder](../app/src/containers/builders/CanvasBuilder/CanvasBuilder.js) -
Рендерит дерево компонентов на канве
+ [PlaceholderBuilder](../app/src/containers/builders/CanvasBuilder/PlaceholderBuilder.js) -
Рендерит полупрозрачные превью компонентов при перетаскивании
+ [PreviewBuilder](../app/src/containers/builders/CanvasBuilder/PreviewBuilder.js) -
Рендерит дерево компонентов в превью приложения.

##Preview
Находится в файле
[app/src/containers/Preview/Preview.js](../app/src/containers/Preview/Preview.js).
Рендерит превью приложения без элементов интерфейса jssy. Для превью есть
отдельный entry point [app/src/preview.js](../app/src/preview.js), который
вставляет Preview непосредственно в шаблон. Preview использует для рендера
деревьев компонентов билдер PreviewBuilder, котоый рендерит компоненты
максимально близко к тому, как бы они выглядели и работали в собранном
приложении, а также использует настоящий роутинг (react-router).

##ComponentsDragArea
Находится в файле
[app/src/containers/ComponentsDragArea/ComponentsDragArea.js](../app/src/containers/ComponentsDragArea/ComponentsDragArea.js).
Рисует голубой прямоугольник при перетаскивании компонента из библиотеки, с
дерева или с канвы и отвечает за анимацию снэппинга этого прямоугольника к
точкам вставки компонента и обратно к курсору. Также отвечает за показ и скрытие
дроп-меню, если оно нужно.

Помимо ComponentsDragArea в этом файле экспортируются два HOC: connectDraggable
и connectDropZone. Они нужны для подключения draggable и dropZone компонентов
(т.е. компонентов, обёрнутых в соответствующие HOC). Примеры draggable - иконки
компонентов на вкладке библиотеки, ноды в дереве компонентов и сми компоненты на
канве. dropZone - Canvas и ComponentsTreeView.

##ComponentsTreeView
Находится в файле
[app/src/containers/ComponentsTreeView/ComponentsTreeView.js](../app/src/containers/ComponentsTreeView/ComponentsTreeView.js).
Рендерит дерево компонентов на правой вкладке. Является dropZone. Ноды дерева
являются draggable.

##ComponentsLibrary
Находится в файле
[app/src/containers/ComponentsLibrary/ComponentsLibrary.js](../app/src/containers/ComponentsLibrary/ComponentsLibrary.js).
Рендерит библиотеку компонентов. Иконки компонентов являются draggable.

##Desktop
Находится в файле
[app/src/containers/Desktop/Desktop.js](../app/src/containers/Desktop/Desktop.js).
Рендерит каркас центральной области UI (MainRegion в терминах Reactackle):
рабочую область и боковую панель. Боковая панель ресайзится, инструменты с нее
можно отцепить, сделав таскаемым окном, и прицепить обратно.


[Назад](./index.md)

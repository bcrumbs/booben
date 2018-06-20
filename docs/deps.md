# Используемые технологии
Здесь перечислены ключевые библиотеки и технологии, используемые в Booben.
Добавление новых зависимостей следует выносить на обсуждение с командой.
+ [React](https://reactjs.org) -
Фреймворк. На данный момент версия 16,
обновляем по мере выхода новых версий (можно beta/RC).
+ [React Router v4](https://reacttraining.com/react-router/) -
Роутер. Используем версию 4. Т.к. авторы имеют привычку кардинально менять API в
новых версиях, обновляться только в случае крайней необходимости.
+ [Redux](https://redux.js.org) (redux + react-redux) - State management. Nuff
said.
+ [Reselect](https://github.com/reactjs/reselect) -
Селекторы для redux.
+ [immutable.js](https://facebook.github.io/immutable-js/) -
Реализация иммутабельных структур данных для JS от Facebook. Все объекты в redux
state храним в иммутабельных структурах (Map, List, Set, Record, ...).
Исключение составляют структуры данных, которые не изменяются в принципе, либо
заменяются только целиком (например, метаданные).
+ [Apollo](https://www.apollographql.com) (apollo-client + react-apollo) -
GraphQL клиент. Используется только для общения с GraphQL-endpoint'ом проекта.
Сам booben со своим бэкендом общается через REST API.
+ [Styled Components](https://www.styled-components.com) -
Реализация CSS-in-JS. Используем для стилизации компонентов.
+ [Lodash](https://lodash.com) -
Утилиты обще-JS-ного назначения. Функции из lodash добавляем в зависимости
отдельными пакетами по мере необходимости.
+ [Reactackle](https://gitlab.ordbuy.com/reactackle/reactackle) -
Наша библиотека UI-компонентов. Используется версия из нашего приватного npm,
т.к. еще не все необходимые компоненты перенесены на GitHub / в публичный npm.
+ [Webpack](https://webpack.github.io) -
Сборщик. На данный момент используется версия 3. Обновляем по мере
необходимости.
+ [Babel](https://babeljs.io) -
Транспайлер. На данный момент используется версия 6 с пресерами es2015, es2016,
react и плагинами transform-object-rest-spread и styled-components. Планируется
переход на пресет env. **Никаких дополнительных плагинов не добавляем до тех
пор, пока соответствующая фича языка не перейдет на stage 4!**
+ [Eslint](https://eslint.org) -
Линтер. Сейчас используются кастомные пресеты, планируется переход на
[Prettier](https://prettier.io).


[Назад](./index.md)

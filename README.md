<div align="center"><img  align="center" style="width: 100%;" src="https://preview.ibb.co/nEUQPd/booben_logo.png" /></div>
<h3 align="center">Full-stack web app developing platform</h4>
<p align="center">Design, develop, connect data, get source code - all in one place.</p>
<div align="center"><a href="http://demo.booben.io/app/demo/">Demo</a></div>
<br />
<hr />

[![Build Status](https://travis-ci.org/bcrumbs/booben.svg?branch=master)](https://travis-ci.org/bcrumbs/booben)
[![Braincrumbs Slack](https://slackin.braincrumbs.io/badge.svg)](https://slackin.braincrumbs.io)

### Features
+ Design your app without a line of code by dragging-and-dropping components on the canvas
+ Get a markup which is completely identical to what you see in the components tree without any unnecessary inline styles and / or wrappers
+ Bind data with **GraphQL**
+ Setup actions and write pure functions through the Booben interface
+ Use **any components library** to build your own App. All you need is to cover this library with [metadata](https://github.com/bcrumbs/reactackle-meta). As a default we use [Reactackle components library](https://github.com/bcrumbs/reactackle) and plain [HTML-tags](https://github.com/bcrumbs/booben-html-meta). You may look at the [Reactackle's meta](https://github.com/bcrumbs/reactackle-meta) for an example.
+ Style components by **modifying its props** and/or by adding **custom css** (scss syntax is supported)
+ Download generated code in a single click

### Technologies used:
+ [React](https://reactjs.org) - to power up frontend
+ [React Router v4](https://reacttraining.com/react-router/)
+ [Redux](https://redux.js.org) (redux + react-redux) - state management
+ [Reselect](https://github.com/reactjs/reselect) - redux selectors
+ [immutable.js](https://facebook.github.io/immutable-js/) - we store all redux objects in immutable structures (Map, List, Set, Record, ...).
Exceptions are those data structures which can't be changed at all or may be changed only completely (ex. metadata).
+ [Apollo](https://www.apollographql.com) (apollo-client + react-apollo) - GraphQL client, used only to communicate with project's GraphQL endpoint. Booben itself communicates with its backend by REST API.
+ [Styled Components](https://www.styled-components.com) - CSS-in-JS used for styling components
+ [Lodash](https://lodash.com)
+ [Reactackle](https://github.com/bcrumbs/reactackle) - react ui-components library
+ [Webpack](https://webpack.github.io)
+ [Babel](https://babeljs.io)
+ [Eslint](https://eslint.org) - we are now using custom presets but are going to migrate to
[Prettier](https://prettier.io).

### Docs
Documentation is not complete and translated yet. Contributions are welcomed.

[Docs in Russian](./docs/index.md)

### Prerequisites

You'll need [node](https://nodejs.org) version 8.6.0 or higher to run dev environment.

### Setup

Clone Booben repo
```
git clone https://github.com/bcrumbs/booben
cd booben
```

**Quick setup**

Run bash script from the booben's directory. It will clone blank project for Booben and create config file.
```
bash bootstrap.sh
node index.js --config projects-config.json
```
OR
```
make bootstrap
```
On Docker:
```
docker pull braincrumbs/booben
docker run -d --name=booben -p 3000:3000 braincrumbs/booben
```
OR
```
docker-compose pull
docker-compose up -d
```

App will be running on http://localhost:3000/app/blank

### Contributing
All contributions are welcomed.

## License
[Apache 2.0](/LICENSE)

# Rin Front-End Library

This library provides functionality to build custom elements, connect to [Wind](https://github.com/rsthn/rose-webservice)-based web services and provides several pre-made elements (with API integration built-in) to develop web applications fast.

<br/>

## Installation

You can use npm to install the library, or download the standalone `rin-front.js` file from the `dist` folder and include it in your index.html file, in the latter case an object named `rfront` will be available in the global scope.

<small>**NOTE:** When using the web distribution file and because [Rin](https://github.com/rsthn/rin/) is a core dependency, it will be available as `rin` in the `rfront` object.</small>

```sh
npm i @rsthn/rin-front
```

<br/>

# Docs

- [Api](./docs/api.md)
- [Router](./docs/router.md)
- [RemoteCollection](./docs/remote-collection.md)

<br/>

# Elements

- [r-tabs](./docs/r-tabs.md)
- [r-form](./docs/r-form.md)
- [r-panel](./docs/r-panel.md)
- [r-list](./docs/r-list.md)
- [r-item](./docs/r-item.md)
- [r-paginator](./docs/r-paginator.md)
- [r-table](./docs/r-table.md)

# Mk[ui] v2.0
Flexible, Accessible Web Components.

1. Independent of any 3rd party libraries/frameworks (including jQuery).
2. Supports AMD, CommonJS, and vanilla JavaScript.
3. Plays nice with Angular and React.
4. Easily customizable JavaScript, CSS (both LESS and SCSS versions), and Markup for any component.
5. Written with responsive design and full WCAG 2.0 accessibility support.
6. Written with full mobile and tablet support (and their screen readers) for the best user experience possible.

#### Live Docs & Examples
Check out our live documentation and example of each available component on our [GitHub Pages](http://markitondemand.github.io/mk-ui/).

#### Mk[ui] v1.0
Using an older version of Mk[ui]? Get access to the old repository [here](https://github.com/markitondemand/mk-ui/tree/version-1.0/).

### Currently Available Components

1. Core
2. Selectmenu
3. Datepicker
4. Autocomplete
5. Tooltip
6. Dialog
7. Loader

###### *Available Soon*

1. Modal
2. Accordion
3. Table Sorter

### Install

You can copy the files directly from this repo OR (recommended) you can install this project as a node module using npm. Using NPM is ideal for easy updates. It also *will not* give you the enire project. Doing an install gives you the JavaScript, Less, SCSS, and CSS assets for Mk-Ui only. So don't worry about the install being bulky, it aint.

```bash
npm install mk-ui
```

### Documentation

Clone or Fork this repository for the most up to date documentation. Once the you have the app running, simply go to localhost:5280 to launch the docs site. Or just visit our [GitHub Pages](http://markitondemand.github.io/mk-ui/).

```bash
git clone https://github.com/markitondemand/mk-ui.git mk-ui

cd mk-ui

npm install

node index.js
```

### Bugs, Patches, Features, and Pull Requests

When implementing a bug fix, patch, feature, and creating a pull request, you'll want to modify the JavaScript source files that live in /src/js. For CSS/SCSS changes, you'll want to make modifications to /dist/scss. DO NOT MODIFY JAVASCRIPT or .CSS FILES LIVING IN THE DIST FOLDER. When your changes are completed and at a point where you're ready to open a Pull Request, we have a couple handy gulp methods you should take advantage of first.

For compiling SCSS to CSS:

```bash
gulp sass
```

For creating both minified and unminified JavaScript files in the dist folder:

```bash
gulp minify
```

If you edit any documentation pages:

```bash
gulp static-site
```

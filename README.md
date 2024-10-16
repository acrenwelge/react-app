# My Full Stack Test App

This is a full stack test app that I built to demonstrate my skills in React, Node.js, and Express. The app is a todo list and tic tac toe game (view [the full feature list here](./features.md)). The front end is built with React and Material-UI, and the back end is built with Node.js and Express. The app is Dockerized and can be run locally with Docker or docker-compose.

## Get Started

### npm

```bash
npm install
npm start
```

### Docker

```bash
docker build -t imgname:tagname .
docker run -p 8080:8080 imgname:tagname
```

Or use `docker-compose`:

```bash
docker-compose up -d
```

You should then be able to hit the app at `localhost:8080`. Note that **you cannot directly navigate to endpoints** because
the app is being served by a static file server - e.g. `localhost:8080/todos` will NOT work.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `cypress open`

Starts Cypress testing - component and end-to-end tests.

### `npm start`

Runs the app in the development mode.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.

It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.

Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

# Add a New Express Project

**Supported Features**

Because we are using an Nx plugin for Express, all the features of Nx are available.

{% pill url="/core-features/run-tasks" %}✅ Run Tasks{% /pill %}
{% pill url="/core-features/cache-task-results" %}✅ Cache Task Results{% /pill %}
{% pill url="/core-features/remote-cache" %}✅ Share Your Cache{% /pill %}
{% pill url="/core-features/explore-graph" %}✅ Explore the Graph{% /pill %}
{% pill url="/core-features/distribute-task-execution" %}✅ Distribute Task Execution{% /pill %}
{% pill url="/core-features/integrate-with-editors" %}✅ Integrate with Editors{% /pill %}
{% pill url="/core-features/automate-updating-dependencies" %}✅ Automate Updating Nx{% /pill %}
{% pill url="/core-features/enforce-module-boundaries" %}✅ Enforce Module Boundaries{% /pill %}
{% pill url="/core-features/plugin-features/use-task-executors" %}✅ Use Task Executors{% /pill %}
{% pill url="/core-features/plugin-features/use-code-generators" %}✅ Use Code Generators{% /pill %}
{% pill url="/core-features/automate-updating-dependencies" %}✅ Automate Updating Framework Dependencies{% /pill %}

## Install the Express Plugin

{% tabs %}
{%tab label="npm"%}

```shell
npm i --save-dev @nx/express
```

{% /tab %}
{%tab label="yarn"%}

```shell
yarn add --dev @nx/express
```

{% /tab %}
{% /tabs %}

## Create an Application

Use the `app` generator to create a new Express app.

```shell
nx g @nx/express:app my-express-api
```

Serve the API by running

```shell
nx serve my-express-api
```

This starts the application on localhost:3333/api by default.

## Create a Library

The `@nx/express` plugin does not have a `library` generator, but we can use the `library` generator from the `@nx/js` plugin. To create a new library, install the `@nx/js` package and run:

```shell
nx g @nx/js:lib my-lib
```

Once the library is created, update the following files.

```typescript {% fileName="libs/my-lib/src/lib/my-lib.ts" %}
export function someFunction(): string {
  return 'some function';
}
```

```typescript {% fileName="apps/my-express-app/src/main.ts" %}
/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to my-express-app!' });
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
```

Now when you serve your API, you'll see the content from the library being displayed.

## More Documentation

- [@nx/express](/packages/express)
- [@nx/js](/packages/js)
- [Express](https://expressjs.com/)

# Kurai Foundation Express Router

Layer-2 framework based on express, which makes it faster and easier to 
build fault-tolerant backend applications

## Table of contents

- [Installation](#installation)
- [Basic usage](#basic-usage)
  - [Usage example](#usage-example)
  - [Basic swagger integration](#basic-swagger-integration)
  - [Advanced swagger integration](#advanced-swagger-integration)
- [Advanced API](#advanced-api)
- - [Router builder](#router-builder)
  - [Routes with JOI schemas](#routes-with-joi-schemas)
- [License](#license)

## Installation

There is little to describe, the installation process is no different from any other package:

```shell
npm add @kurai-io/express-router
```

Or use any other package manager, the command is just an example, 
please consult your package manager's documentation for the exact installation command.

```shell
pnpm[yarn, etc...] install @kurai-io/express-router
```

## Basic usage

### Usage example

Let's create a simple application that can create and return users from the database  
while allowing access only to authorized users

First, let's create schemas to validate the content that will go into the handlers

```typescript
// src/schemas.ts

import { ISchema } from "@kurai-io/express-router"

export const UserCreateSchema: ISchema = {
  body: Joi.object({
    login: Joi.string().min(4).max(24).required(),
    password: Joi.string.min(8).max(128).required()
  })
}

export const UserGetSchema: ISchema = {
  params: Joi.object({
    id: Joi.string().length(24).required()
  })
}
```

Now let's write the code of the application itself

```typescript
// src/app.ts

import { Application } from "@kurai-io/express-router"
import { Unauthorized } from "@kurai-io/express-router/exceptions"
import { UserCreateSchema, UserGetSchema } from "./schemas.ts"

const app = new Application()
const builder = app.createRoute({
  root: "/users",
  middleware: request => {
    let autenticated = false

    // Verify that the user has permission to execute requests
    if (request.header("access-token") === process.env.ACCESS_TOKEN) authenticated = true
    
    return { authenticated }
  }
})

// The request argument already contains the "authenticated" field (and is typed)
builder.schema(UserCreateSchema).post("/create", async request => {
  // Here you can either throw or return an exception
  if (!request.authenticated) return Unauthorized("Invalid token")

  // We recommend returning exceptions because it creates 
  // more predictable code than the "throw" syntax. 
  // But the choice is yours, you can use both approaches

  // Insert the user into the database
  // No need for additional validation, because the schema did all the work for us.
  const insertionResult = await database.insertOne({ ...request.body })
  
  return insertionResult.insertedId
})

// Define a GET request to retrieve the user
builder.schema(UserGetSchema).get("/:id", async request => {
  // No need for try/catch or other monstrosities, the router does all the work
  return database.findOne({ _id: new ObjectId(request.params.id) })
})
```

In the code above, we created several request handlers, 
but each of them either returned a response (the default response code is 200) or an error. 
Now let's create a handler that will return code 204 if successful and a custom error if not.

```typescript
import { Exception } from "@kurai-io/express-router/exceptions"
import { CustomResponse } from "@kurai-io/express-router"

// ...

// Pass null to the schema to disable validation
builder.schema(null).head("/:id", async request => {
  const hasDocument = database.countDocuments({ _id: new ObjectId(request.params.id) })

  if (!hasDocument) {
    // We could use the NotFound error as we did earlier with Unauthorized, 
    // but instead we will create our own error, just for the sake of example. 
    // In most cases we should use predefined errors, as they are predefined for 
    // almost every 4xx and 5xx error code
    
    return new Exception({
      code: 404,
      name: "NotFound",
      message: "Document not found"
    })
  }

  // If the document exists, return 204. Since the response structure is slightly different 
  // for 4xx/5xx and 1xx-3xx responses, do not use exceptions to return the actual content
  return CustomResponse({
    code: 204,
    content: true
  })
})
```

Here we have created a simple and fail-safe application that knows how to validate, create and find users. 
It's not hard, right?

### Basic swagger integration

To enable Swagger documentation, the following packages must be installed:
- `@kurai-io/express-router-swagger` - Swagger transformer
- `swagger-ui-express` - Swagger UI renderer

Then, in the application configuration, enable integration

```typescript
const app = new Application({
  enableSwagger: true
})
```

Optionally, you can customize the display of documentation
using the `swagger` field in the configuration

The documentation will be generated automatically from schemes and 
registered routes, the names will be set to automatically generated strings.

If desired, the route can be set the exception list and name manually, 
let's take the code from the last section as an example. 
We know that this handler can return a 404 error and a 204 response, 
let's set the metadata to reflect this

```typescript
import { ResponseFactory } from "@kurai-io/express-router"

builder.schema(null).head("/:id", async request => {
  // ... see previous examle
}).metadata({
  responses: [ResponseFactory(204), NotFound],
  description: "Get user by ID"
})
```

_The `500 Internal server error` and the `200 Success response` are added automatically._

_The `200 Success response` will not be added if other `1xx - 3xx` responses have been added._

### Advanced swagger integration

If desired, it is possible to create routes in such a way that all required answers are 
automatically displayed in the documentation. To do this, you need to create answer 
objects within the route itself:

```typescript
// ...

builder.schema(null).get("/content", (request, responses) => {
  //                              content is required
  //                                       v
  return new responses.SuccessResponse(Math.random())
}, {
  // content filed omitted
  SuccessResponse: {
    code: 200,
    example: 0.1391314135135
  }
})
```

This approach will automatically add answers to the documentation and get 
rid of unnecessary variables in the models

## Advanced API

### Router builder

RouterBuilder is the main part of the framework that does all the work. 
In most cases the Application class will provide sufficient functionality, 
but if it fails, you can manually use RouterBuilder to achieve your tasks

```ts
import { RouterBuilder } from "@kurai-io/express-router"

const someRouter = new RouterBuilder()

someRouter.get("/path", null, async req => {
  return {
    result: "success"
  }
})
```

### Routes with JOI schemas

Same, but with JOI schema

```ts
import { RouterBuilder } from "@kurai-io/express-router"

const someRouter = new RouterBuilder()

const someSchema = someRouter.generateSchema("params", {
  address: Joi.string().length(42).required()
})

someRouter.get("/path/:address", someSchema, async req => {
  return {
    address: req.params.address
  }
})
```

Available JOI schema types: `params`, `query`, `body`

## License

You can copy and paste the MIT license summary from below.

```text
MIT License

Copyright (c) 2022-2024 Kurai Foundation

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

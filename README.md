# POC: TypeScript Architectures

Implementation of 3 Use Cases using different approaches of error handling.

## Motivation
Verify if auxiliary types like `Result` and `Option` improves readability, code quality and maintainability, when compared to error handling using `try {} catch {}` and using conventions alongside with language features such as typescript tuples to represent a result like return tuple: `[Error?, T?]`.

And keep related code together, in a Feature oriented organization, to see if it also improves organization and maintainability.

## Project Folder Structure

```
.
├── 📁 src/
│   ├── 📁 <feature-one>/
│   │   ├── 📁 usecases/
│   │   │   ├── 📄 <usecase-one>.ts
│   │   │   └── 📄 <usecase-two>.ts
│   │   ├── 📄 <service-interface-one>.ts
│   │   ├── 📄 <service-interface-two>.ts
│   │   ├── 📄 <interface-adapter-one>.ts
│   │   └── 📄 entities.ts
│   ├── 📁 <feature-two>/
│   │   └── entities.ts
│   ├── 📁 <core-component>/
│   │   └── ...
│   ├── 📄 env.ts
│   └── 📄 main.ts
├── 📄 .env
├── 📄 <configuration-files>
└── 📄 README.md
```

### Features
> ⚠️ The name `Feature` is just a suggestion, and can be changed if we find a more descriptive and adequate name.

Each feature folder holds code related to one feature or domain object. Instead of splitting a feature by its architectural components like entities, usecases, interface adapters and so on, into different folders that groups each component type, the idea is to keep components of the same feature together so it is easier to maintain and understand the complexity of a feature by just looking into the components of its feature folder.

The goal of this division in the POC is to test the hipothesis that code would be more readable and easier to navigate, than if each component (controller, usecase, repositories, entities) were in different folders grouped to components of different features.

#### Dependency Between features
The rules of dependency between features must follow the rule of dependency of Clean Architecture.

For example, an use case of feature A, can depend on some entity of feature B. But an usecase of feature A should not depend on an interface adapter of either feature A or B.

For now, the entities are stored inside each feature folder, but since entities are the primary way to model and describe the domain, if the need shows up, they could be extracted into a dedicated domain folder, that all features can depend on.

### Core Components
> ⚠️ I couldn't think of a better name. It can change if we find a better one. Feel free to suggest a good name.

These are components that handle code related to a category of technologies, like `web`, `db`, `cache`, etc... So a HTTP server configuration and provider would be defined in the `web` core component.

For example, a Postgres database connection would be defined in the `db` folder, but keep in mind that it doesn't mean implementing a repository in the `db` core component folder.

The repository implementation can be inside the feature folder, and if it uses Postgress for the concrete implementation, the Postgress connection instance can be injected into it in the **Main Entrypoint**.

This way, if more repositories of different features are implemented and will depend on Postgress, we can use the connections configured in the `db` folder, by injecting them when instantiating the repositories, leaving the repositories close to their feature folders.

### Main Entrypoint and Main Folder
The folder structure example above has just a `main.ts` file. But it could be a `main/` folder where the entrypoint of the application would reside.

The `main.ts` file is where we compose and instantiate the components of the application and start the application. If we had a more complex application like having a HTTP server, TCP server, Background Jobs, and more. We could break them into different files and simplify the main entrypoint file, all inside a `main/` folder.

## Error Handling
This POC uses 3 approaches to error handling:
1. one using a `Result<T, E>` type
2. another using just `try {} catch {}` blocks.
3. and the last one using the result-like tuple `[Error?, T?]`

> ⚠️ **Disclaimer:** the `try {} catch {}` currently short-circuits the flow by throwing errors, we could return errors as values too. Maybe we can implement a third usecase where we can use this approach.

We're also using custom errors to represent application errors and handle those.

The error handling part of the application happens in the interface adapters. For example, in the HTTP controller of a feature we handle the errors and respond the HTTP Request, accordingly.

If an external dependency throws a recoverable error as part of its Public API, the handling of those cases can be inside the component that consumes them, and in case of unrecoverable errors, the component will propagate the error.

In the usecases, we also make a simple handling of the errors of dependencies, but just to convert those errors into application errors, to give mode description and context of what operation failed.

### The `Result` Type
It is a representation of a discriminated union of `Ok<T, E> | Err<T, E>`, where `Ok<T, E>` represents the success case of a result and the `Err<T, E>` represents the failure case of a result. This type was inspired by the Rust's Result Enum.

### The Result-like Tuple
Instead of representing a union of `Error | T` where the discrimination could be hard if not impossible in some cases, and instead of using a wrapper type, the result-like tuple, works alongside with a convention that the first element of the tuple is always the error type, where both the Failure case (the first element) and the Success case (the actual return type) are marked as optional with the `?` operator.

So if a function returns a `number` could fail, it's signature would be:
```ts
function getLuckyNumber(): [Error?, number?];
```

While a function that returns `void` and could fail, would have this signature:
```ts
function runStuff(): [Error?];
```
Having a single type in the tuple.

To consume those functions, we can use the [Destructuring Assignment](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#syntax) feature:
```ts
// Get both variables to check if it was error and use the value
const [getNumErr, luckyNumber] = getLuckyNumber()

// Get only the error since it's the only return type inside the tuple, to check if the function ran successfully
const [runErr] = runStuff()

// This way, we can ignore errors explicitly by not using the first parameter of the tuple
const [, luckyNumber] = getLuckyNumber()
```

The down side of this is that both the error and the returned data are a union between its type and `undefined`. So, the type system treats every succes as an "optional".
```ts
const [getNumErr, luckyNumber] = getLuckyNumber()
//     ^? Error | undefined
const [getNumErr, luckyNumber] = getLuckyNumber()
//                ^? number | undefined
```

We can make the verification if the value is present, or we can look at the implementation of the function to know if it is in fact optional or not and then use the [Non-null Assertion Operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-0.html#non-null-assertion-operator) `!` to tell the compiler that the value is not undefined.

The other option is to use `null` to explicitly mark optional cases, like:
```ts
// A function that can fail and in case of success maybe returns a number
function getLuckyNumber(): [Error?, (number | null)?]
```

This approach relies heavily on conventions.

## Null Handling
There are also 3 ways we handled this:
1. using the `Option<T>` type
2. using a union type of `T | undefined` without a wrapper type
3. using the `?` optional marker in type definitions.

The `Option<T>` is inspired by the Rust's Option Enum.

Each usecase implemented uses one of the two approaches, so we can compare them.


# POC: TypeScript Architectures

Implementation of 2 Use Cases using different approaches of error handling.

## Motivation
Verify if auxiliary types like `Result` and `Option` improves readability, code quality and maintainability, when compared to error handling using `try {} catch {}`.

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
This POC uses 2 approaches to error handling, one using a `Result<T, E>` type and another using just `try {} catch {}` blocks.

> ⚠️ **Disclaimer:** the `try {} catch {}` currently short-circuits the flow by throwing errors, we could return errors as values too. Maybe we can implement a third usecase where we can use this approach.

We're also using custom errors to represent application errors and handle those.

The error handling part of the application happens in the interface adapters. For example, in the HTTP controller of a feature we handle the errors and respond the HTTP Request, accordingly.

If an external dependency throws a recoverable error as part of its Public API, the handling of those cases can be inside the component that consumes them, and in case of unrecoverable errors, the component will propagate the error.

In the usecases, we also make a simple handling of the errors of dependencies, but just to convert those errors into application errors, to give mode description and context of what operation failed.

### The `Result` Type
It is a representation of a discriminated union of `Ok<T, E> | Err<T, E>`, where `Ok<T, E>` represents the success case of a result and the `Err<T, E>` represents the failure case of a result. This type was inspired by the Rust's Result Enum.

## Null Handling
There are also 2 ways we handled this, one using the `Option<T>` type and another using a union type of `T | undefined` without a wrapper type.

The `Option<T>` is inspired by the Rust's Option Enum.

Each usecase implemented uses one of the two approaches, so we can compare them.


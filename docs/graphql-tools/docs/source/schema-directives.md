---
title: Schema directives
description: Using and implementing custom directives to transform schema types, fields, and arguments
---

A _directive_ is an identifier preceded by a `@` character, optionally followed by a list of named arguments, which can appear after almost any form of syntax in the GraphQL query or schema languages. Here's an example from the [GraphQL draft specification](http://facebook.github.io/graphql/draft/#sec-Type-System.Directives) that illustrates several of these possibilities:

```typescript
directive @deprecated(
  reason: String = "No longer supported"
) on FIELD_DEFINITION | ENUM_VALUE

type ExampleType {
  newField: String
  oldField: String @deprecated(reason: "Use `newField`.")
}
```

As you can see, the usage of `@deprecated(reason: ...)` _follows_ the field that it pertains to (`oldField`), though the syntax might remind you of "decorators" in other languages, which usually appear on the line above. Directives are typically _declared_ once, using the `directive @deprecated ... on ...` syntax, and then _used_ zero or more times throughout the schema document, using the `@deprecated(reason: ...)` syntax.

Given a directive declaration, it's up to the GraphQL server to enforce the argument types (`reason: String`) and locations (`FIELD_DEFINITION | ENUM_VALUE`) of its usages. Use of undeclared directives is permitted as long as the GraphQL server can make sense of them. Of course, a GraphQL server may simply ignore directives it doesn't understand&mdash;which is certainly one way of interpreting them.

The possible applications of directive syntax are numerous: enforcing access permissions, formatting date strings, auto-generating resolver functions for a particular backend API, marking strings for internationalization, synthesizing globally unique object identifiers, specifying caching behavior, skipping or including or deprecating fields, and just about anything else you can imagine.

This document focuses on directives that appear in GraphQL _schemas_ (as opposed to queries) written in [Schema Definition Language](https://github.com/facebook/graphql/pull/90), or SDL for short. In the following sections, you will see how custom directives can be implemented and used to modify the structure and behavior of a GraphQL schema in ways that would not be possible using SDL syntax alone.

## Using schema directives

Most of this document is concerned with _implementing_ schema directives, and some of the examples may seem quite complicated. No matter how many tools and best practices you have at your disposal, it can be difficult to implement a non-trivial schema directive in a reliable, reusable way. Exhaustive testing is essential, and using a typed language like TypeScript is recommended, because there are so many different schema types to worry about.

However, the API we provide for _using_ a schema directive is extremely simple. Just import the implementation of the directive, then pass it to `makeExecutableSchema` via the `schemaDirectives` argument, which is an object that maps directive names to directive implementations:

```js
import { makeExecutableSchema } from 'graphql-tools';
import { RenameDirective } from 'rename-directive-package';

const typeDefs = `
type Person @rename(to: "Human") {
  name: String!
  currentDateMinusDateOfBirth: Int @rename(to: "age")
}`;

const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: {
    rename: RenameDirective,
  },
});
```

That's it. The implementation of `RenameDirective` takes care of everything else. If you understand what the directive is supposed to do to your schema, then you do not have to worry about how it works.

Everything you read below addresses some aspect of how a directive like `@rename(to: ...)` could be implemented. If that's not something you care about right now, feel free to skim the rest of this document. When you need it, it will be here.

## Implementing schema directives

Since the GraphQL specification does not discuss any specific implementation strategy for directives, it's up to each GraphQL server framework to expose an API for implementing new directives.

If you're using Apollo Server, you are also likely to be using the [`graphql-tools`](https://github.com/apollographql/graphql-tools) npm package, which provides a convenient yet powerful tool for implementing directive syntax: the [`SchemaDirectiveVisitor`](https://github.com/apollographql/graphql-tools/blob/wip-schema-directives/src/schemaVisitor.ts) class.

To implement a schema directive using `SchemaDirectiveVisitor`, simply create a subclass of `SchemaDirectiveVisitor` that overrides one or more of the following visitor methods:

- `visitSchema(schema: GraphQLSchema)`
- `visitScalar(scalar: GraphQLScalarType)`
- `visitObject(object: GraphQLObjectType)`
- `visitFieldDefinition(field: GraphQLField<any, any>)`
- `visitArgumentDefinition(argument: GraphQLArgument)`
- `visitInterface(iface: GraphQLInterfaceType)`
- `visitUnion(union: GraphQLUnionType)`
- `visitEnum(type: GraphQLEnumType)`
- `visitEnumValue(value: GraphQLEnumValue)`
- `visitInputObject(object: GraphQLInputObjectType)`
- `visitInputFieldDefinition(field: GraphQLInputField)`

By overriding methods like `visitObject`, a subclass of `SchemaDirectiveVisitor` expresses interest in certain schema types such as `GraphQLObjectType` (the first parameter type of `visitObject`).

These method names correspond to all possible [locations](https://github.com/graphql/graphql-js/blob/a62eea88d5844a3bd9725c0f3c30950a78727f3e/src/language/directiveLocation.js#L22-L33) where a directive may be used in a schema. For example, the location `INPUT_FIELD_DEFINITION` is handled by `visitInputFieldDefinition`.

Here is one possible implementation of the `@deprecated` directive we saw above:

```typescript
import { SchemaDirectiveVisitor } from 'graphql-tools';

class DeprecatedDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field: GraphQLField<any, any>) {
    field.isDeprecated = true;
    field.deprecationReason = this.args.reason;
  }

  public visitEnumValue(value: GraphQLEnumValue) {
    value.isDeprecated = true;
    value.deprecationReason = this.args.reason;
  }
}
```

In order to apply this implementation to a schema that contains `@deprecated` directives, simply pass the `DeprecatedDirective` class to the `makeExecutableSchema` function via the `schemaDirectives` option:

```typescript
import { makeExecutableSchema } from 'graphql-tools';

const typeDefs = `
type ExampleType {
  newField: String
  oldField: String @deprecated(reason: "Use \`newField\`.")
}`;

const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: {
    deprecated: DeprecatedDirective,
  },
});
```

Alternatively, if you want to modify an existing schema object, you can use the `SchemaDirectiveVisitor.visitSchemaDirectives` interface directly:

```typescript
SchemaDirectiveVisitor.visitSchemaDirectives(schema, {
  deprecated: DeprecatedDirective,
});
```

Note that a subclass of `SchemaDirectiveVisitor` may be instantiated multiple times to visit multiple different occurrences of the `@deprecated` directive. That's why you provide a class rather than an instance of that class.

If for some reason you have a schema that uses another name for the `@deprecated` directive, but you want to use the same implementation, you can! The same `DeprecatedDirective` class can be passed with a different name, simply by changing its key in the `schemaDirectives` object passed to `makeExecutableSchema`. In other words, `SchemaDirectiveVisitor` implementations are effectively anonymous, so it's up to whoever uses them to assign names to them.

## Examples

To appreciate the range of possibilities enabled by `SchemaDirectiveVisitor`, let's examine a variety of practical examples.

### Uppercasing strings

Suppose you want to ensure a string-valued field is converted to uppercase. Though this use case is simple, it's a good example of a directive implementation that works by wrapping a field's `resolve` function:

```js
import { defaultFieldResolver } from 'graphql';

const typeDefs = `
directive @upper on FIELD_DEFINITION

type Query {
  hello: String @upper
}`;

class UpperCaseDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const result = await resolve.apply(this, args);
      if (typeof result === 'string') {
        return result.toUpperCase();
      }
      return result;
    };
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: {
    upper: UpperCaseDirective,
    upperCase: UpperCaseDirective,
  },
});
```

Notice how easy it is to handle both `@upper` and `@upperCase` with the same `UpperCaseDirective` implementation.

### Fetching data from a REST API

Suppose you've defined an object type that corresponds to a [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) resource, and you want to avoid implementing resolver functions for every field:

```js
const typeDefs = `
directive @rest(url: String) on FIELD_DEFINITION

type Query {
  people: [Person] @rest(url: "/api/v1/people")
}`;

class RestDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field) {
    const { url } = this.args;
    field.resolve = () => fetch(url);
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: {
    rest: RestDirective
  }
});
```

There are many more issues to consider when implementing a real GraphQL wrapper over a REST endpoint (such as how to do caching or pagination), but this example demonstrates the basic structure.

### Formatting date strings

Suppose your resolver returns a `Date` object but you want to return a formatted string to the client:

```js
const typeDefs = `
directive @date(format: String) on FIELD_DEFINITION

scalar Date

type Post {
  published: Date @date(format: "mmmm d, yyyy")
}`;

class DateFormatDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { format } = this.args;
    field.resolve = async function(...args) {
      const date = await resolve.apply(this, args);
      return require('dateformat')(date, format);
    };
    // The formatted Date becomes a String, so the field type must change:
    field.type = GraphQLString;
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: {
    date: DateFormatDirective,
  },
});
```

Of course, it would be even better if the schema author did not have to decide on a specific `Date` format, but could instead leave that decision to the client. To make this work, the directive just needs to add an additional argument to the field:

```js
import formatDate from "dateformat";
import {
  defaultFieldResolver,
  GraphQLString,
} from "graphql";

const typeDefs = `
directive @date(
  defaultFormat: String = "mmmm d, yyyy"
) on FIELD_DEFINITION

scalar Date

type Query {
  today: Date @date
}`;

class FormattableDateDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { defaultFormat } = this.args;

    field.args.push({
      name: 'format',
      type: GraphQLString
    });

    field.resolve = async function (
      source,
      { format, ...otherArgs },
      context,
      info,
    ) {
      const date = await resolve.call(this, source, otherArgs, context, info);
      // If a format argument was not provided, default to the optional
      // defaultFormat argument taken by the @date directive:
      return formatDate(date, format || defaultFormat);
    };

    field.type = GraphQLString;
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: {
    date: FormattableDateDirective
  }
});
```

Now the client can specify a desired `format` argument when requesting the `Query.today` field, or omit the argument to use the `defaultFormat` string specified in the schema:

```js
import { graphql } from 'graphql';

graphql(
  schema,
  `
    query {
      today
    }
  `,
).then(result => {
  // Logs with the default "mmmm d, yyyy" format:
  console.log(result.data.today);
});

graphql(
  schema,
  `
    query {
      today(format: "d mmm yyyy")
    }
  `,
).then(result => {
  // Logs with the requested "d mmm yyyy" format:
  console.log(result.data.today);
});
```

### Marking strings for internationalization

Suppose you have a function called `translate` that takes a string, a path identifying that string's role in your application, and a target locale for the translation.

Here's how you might make sure `translate` is used to localize the `greeting` field of a `Query` type:

```js
const typeDefs = `
directive @intl on FIELD_DEFINITION

type Query {
  greeting: String @intl
}`;

class IntlDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function(...args) {
      const context = args[2];
      const defaultText = await resolve.apply(this, args);
      // In this example, path would be ["Query", "greeting"]:
      const path = [details.objectType.name, field.name];
      return translate(defaultText, path, context.locale);
    };
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: {
    intl: IntlDirective,
  },
});
```

GraphQL is great for internationalization, since a GraphQL server can access unlimited translation data, and clients can simply ask for the translations they need.

### Enforcing access permissions

Imagine a hypothetical `@auth` directive that takes an argument `requires` of type `Role`, which defaults to `ADMIN`. This `@auth` directive can appear on an `OBJECT` like `User` to set default access permissions for all `User` fields, as well as appearing on individual fields, to enforce field-specific `@auth` restrictions:

```graphql
directive @auth(requires: Role = ADMIN) on OBJECT | FIELD_DEFINITION

enum Role {
  ADMIN
  REVIEWER
  USER
  UNKNOWN
}

type User @auth(requires: USER) {
  name: String
  banned: Boolean @auth(requires: ADMIN)
  canPost: Boolean @auth(requires: REVIEWER)
}
```

What makes this example tricky is that the `OBJECT` version of the directive needs to wrap all fields of the object, even though some of those fields may be individually wrapped by `@auth` directives at the `FIELD_DEFINITION` level, and we would prefer not to rewrap resolvers if we can help it:

```js
class AuthDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type._requiredAuthRole = this.args.requires;
  }
  // Visitor methods for nested types like fields and arguments
  // also receive a details object that provides information about
  // the parent and grandparent types.
  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredAuthRole = this.args.requires;
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();

    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async function(...args) {
        // Get the required Role from the field first, falling back
        // to the objectType if no Role is required by the field:
        const requiredRole = field._requiredAuthRole || objectType._requiredAuthRole;

        if (!requiredRole) {
          return resolve.apply(this, args);
        }

        const context = args[2];
        const user = await getUser(context.headers.authToken);
        if (!user.hasRole(requiredRole)) {
          throw new Error('not authorized');
        }

        return resolve.apply(this, args);
      };
    });
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: {
    auth: AuthDirective,
    authorized: AuthDirective,
    authenticated: AuthDirective,
  },
});
```

One drawback of this approach is that it does not guarantee fields will be wrapped if they are added to the schema after `AuthDirective` is applied, and the whole `getUser(context.headers.authToken)` is a made-up API that would need to be fleshed out. In other words, we’ve glossed over some of the details that would be required for a production-ready implementation of this directive, though we hope the basic structure shown here inspires you to find clever solutions to the remaining problems.

### Enforcing value restrictions

Suppose you want to enforce a maximum length for a string-valued field:

```js
const typeDefs = `
directive @length(max: Int) on FIELD_DEFINITION | INPUT_FIELD_DEFINITION

type Query {
  books: [Book]
}

type Book {
  title: String @length(max: 50)
}

type Mutation {
  createBook(book: BookInput): Book
}

input BookInput {
  title: String! @length(max: 50)
}`;

class LengthDirective extends SchemaDirectiveVisitor {
  visitInputFieldDefinition(field) {
    this.wrapType(field);
  }

  visitFieldDefinition(field) {
    this.wrapType(field);
  }

  // Replace field.type with a custom GraphQLScalarType that enforces the
  // length restriction.
  wrapType(field) {
    if (field.type instanceof GraphQLNonNull && field.type.ofType instanceof GraphQLScalarType) {
      field.type = new GraphQLNonNull(new LimitedLengthType(field.type.ofType, this.args.max));
    } else if (field.type instanceof GraphQLScalarType) {
      field.type = new LimitedLengthType(field.type, this.args.max);
    } else {
      throw new Error(`Not a scalar type: ${field.type}`);
    }
  }
}

class LimitedLengthType extends GraphQLScalarType {
  constructor(type, maxLength) {
    super({
      name: `LengthAtMost${maxLength}`,

      // For more information about GraphQLScalar type (de)serialization,
      // see the graphql-js implementation:
      // https://github.com/graphql/graphql-js/blob/31ae8a8e8312/src/type/definition.js#L425-L446

      serialize(value) {
        value = type.serialize(value);
        assert.isAtMost(value.length, maxLength);
        return value;
      },

      parseValue(value) {
        return type.parseValue(value);
      },

      parseLiteral(ast) {
        return type.parseLiteral(ast);
      },
    });
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: {
    length: LengthDirective,
  },
});
```

### Synthesizing unique IDs

Suppose your database uses incrementing IDs for each resource type, so IDs are not unique across all resource types. Here’s how you might synthesize a field called `uid` that combines the object type with various field values to produce an ID that’s unique across your schema:

```js
import { GraphQLID } from 'graphql';
import { createHash } from 'crypto';

const typeDefs = `
directive @uniqueID(
  # The name of the new ID field, "uid" by default:
  name: String = "uid"

  # Which fields to include in the new ID:
  from: [String] = ["id"]
) on OBJECT

# Since this type just uses the default values of name and from,
# we don't have to pass any arguments to the directive:
type Location @uniqueID {
  id: Int
  address: String
}

# This type uses both the person's name and the personID field,
# in addition to the "Person" type name, to construct the ID:
type Person @uniqueID(from: ["name", "personID"]) {
  personID: Int
  name: String
}`;

class UniqueIdDirective extends SchemaDirectiveVisitor {
  visitObject(type) {
    const { name, from } = this.args;
    const fields = type.getFields();
    if (name in fields) {
      throw new Error(`Conflicting field name ${name}`);
    }
    fields[name] = {
      name,
      type: GraphQLID,
      description: 'Unique ID',
      args: [],
      resolve(object) {
        const hash = createHash('sha1');
        hash.update(type.name);
        from.forEach(fieldName => {
          hash.update(String(object[fieldName]));
        });
        return hash.digest('hex');
      },
    };
  }
}

const schema = makeExecutableSchema({
  typeDefs,
  schemaDirectives: {
    uniqueID: UniqueIdDirective,
  },
});
```

## Declaring schema directives

While the above examples should be sufficient to implement any `@directive` used in your schema, SDL syntax also supports declaring the names, argument types, default argument values, and permissible locations of any available directives:

```js
directive @auth(
  requires: Role = ADMIN,
) on OBJECT | FIELD_DEFINITION

enum Role {
  ADMIN
  REVIEWER
  USER
  UNKNOWN
}

type User @auth(requires: USER) {
  name: String
  banned: Boolean @auth(requires: ADMIN)
  canPost: Boolean @auth(requires: REVIEWER)
}
```

This hypothetical `@auth` directive takes an argument named `requires` of type `Role`, which defaults to `ADMIN` if `@auth` is used without passing an explicit `requires` argument. The `@auth` directive can appear on an `OBJECT` like `User` to set a default access control for all `User` fields, and also on individual fields, to enforce field-specific `@auth` restrictions.

Enforcing the requirements of the declaration is something a `SchemaDirectiveVisitor` implementation could do itself, in theory, but the SDL syntax is easer to read and write, and provides value even if you're not using the `SchemaDirectiveVisitor` abstraction.

However, if you're implementing a reusable `SchemaDirectiveVisitor` for public consumption, you will probably not be the person writing the SDL syntax, so you may not have control over which directives the schema author decides to declare, and how. That's why a well-implemented, reusable `SchemaDirectiveVisitor` should consider overriding the `getDirectiveDeclaration` method:

```typescript
import {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLEnumType,
} from "graphql";

class AuthDirective extends SchemaDirectiveVisitor {
  public visitObject(object: GraphQLObjectType) {...}
  public visitFieldDefinition(field: GraphQLField<any, any>) {...}

  public static getDirectiveDeclaration(
    directiveName: string,
    schema: GraphQLSchema,
  ): GraphQLDirective {
    const previousDirective = schema.getDirective(directiveName);
    if (previousDirective) {
      // If a previous directive declaration exists in the schema, it may be
      // better to modify it than to return a new GraphQLDirective object.
      previousDirective.args.forEach(arg => {
        if (arg.name === 'requires') {
          // Lower the default minimum Role from ADMIN to REVIEWER.
          arg.defaultValue = 'REVIEWER';
        }
      });

      return previousDirective;
    }

    // If a previous directive with this name was not found in the schema,
    // there are several options:
    //
    // 1. Construct a new GraphQLDirective (see below).
    // 2. Throw an exception to force the client to declare the directive.
    // 3. Return null, and forget about declaring this directive.
    //
    // All three are valid options, since the visitor will still work without
    // any declared directives. In fact, unless you're publishing a directive
    // implementation for public consumption, you can probably just ignore
    // getDirectiveDeclaration altogether.

    return new GraphQLDirective({
      name: directiveName,
      locations: [
        DirectiveLocation.OBJECT,
        DirectiveLocation.FIELD_DEFINITION,
      ],
      args: {
        requires: {
          // Having the schema available here is important for obtaining
          // references to existing type objects, such as the Role enum.
          type: (schema.getType('Role') as GraphQLEnumType),
          // Set the default minimum Role to REVIEWER.
          defaultValue: 'REVIEWER',
        }
      }]
    });
  }
}
```

Since the `getDirectiveDeclaration` method receives not only the name of the directive but also the `GraphQLSchema` object, it can modify and/or reuse previous declarations found in the schema, as an alternative to returning a totally new `GraphQLDirective` object. Either way, if the visitor returns a non-null `GraphQLDirective` from `getDirectiveDeclaration`, that declaration will be used to check arguments and permissible locations.

## What about query directives?

As its name suggests, the `SchemaDirectiveVisitor` abstraction is specifically designed to enable transforming GraphQL schemas based on directives that appear in your SDL text.

While directive syntax can also appear in GraphQL queries sent from the client, implementing query directives would require runtime transformation of query documents. We have deliberately restricted this implementation to transformations that take place when you call the `makeExecutableSchema` function&mdash;that is, at schema construction time.

We believe confining this logic to your schema is more sustainable than burdening your clients with it, though you can probably imagine a similar sort of abstraction for implementing query directives. If that possibility becomes a desire that becomes a need for you, let us know, and we may consider supporting query directives in a future version of these tools.

## What about `directiveResolvers`?

Before `SchemaDirectiveVisitor` was implemented, the `makeExecutableSchema` function took a `directiveResolvers` option that could be used for implementing certain kinds of `@directive`s on fields that have resolver functions.

The new abstraction is more general, since it can visit any kind of schema syntax, and do much more than just wrap resolver functions. However, the old `directiveResolvers` API has been [left in place](directive-resolvers) for backwards compatibility, though it is now implemented in terms of `SchemaDirectiveVisitor`:

```typescript
function attachDirectiveResolvers(
  schema: GraphQLSchema,
  directiveResolvers: IDirectiveResolvers<any, any>,
) {
  const schemaDirectives = Object.create(null);

  Object.keys(directiveResolvers).forEach(directiveName => {
    schemaDirectives[directiveName] = class extends SchemaDirectiveVisitor {
      public visitFieldDefinition(field: GraphQLField<any, any>) {
        const resolver = directiveResolvers[directiveName];
        const originalResolver = field.resolve || defaultFieldResolver;
        const directiveArgs = this.args;
        field.resolve = (...args: any[]) => {
          const [source /* original args */, , context, info] = args;
          return resolver(
            async () => originalResolver.apply(field, args),
            source,
            directiveArgs,
            context,
            info,
          );
        };
      }
    };
  });

  SchemaDirectiveVisitor.visitSchemaDirectives(schema, schemaDirectives);
}
```

Existing code that uses `directiveResolvers` should probably consider migrating to `SchemaDirectiveVisitor` if feasible, though we have no immediate plans to deprecate `directiveResolvers`.

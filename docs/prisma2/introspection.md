# Introspection

Prisma lets you introspect your database to derive a data model definition from the current database schema. Introspection is available via two CLI commands:

- `prisma init`: Interactive wizard that helps you connect to a database and introspect it. Typically used when starting to use Prisma with an existing database.
- `prisma introspect`: Assumes Prisma is already connected to your database and (re)introspects it for you. Typically used in [Photon-only](./photon/use-only-photon.md) projects where migrations are performed not via Lift, so the data model needs to be updated manually after each database schema change.

## Conventions

As database schemas are likely to look very different per project, Prisma employs a number of conventions for translating a database schema into a data model definition.

### Models

- Tables/collections names are normalized to [PascalCasing](http://wiki.c2.com/?PascalCase) (camelCase with uppercase initial letter) in the Prisma schema.
- Tables/collections named in ALL UPPERCASE letters, will remain ALL UPPERCASED in the Prisma schema.
- If a normalized model name conflicts with the name of another model or scalar, normalization is skipped.

### Field names

- Tables/collections names are normalized to [camelCasing](http://wiki.c2.com/?CamelCase) in the Prisma schema.
- Columns/fields named in ALL UPPERCASE letters, will remain ALL UPPERCASED in the Prisma schema.
- If a normalized field with the same normalized name already exists, normalization is skipped.

### Embedded types

- Name is set to parent type name + uppercased field name (field which is referencing the type)

### Relations

- Relation names (for ambiguous back relations) are generated as follows: `${parentType.name}${capitalize(field.name)}To${field.type.name}${capitalize(field.relatedField.name)}`.

### Keeping manual changes in the Prisma schemas

In the TS implementation, the data model that's generated from an introspection is merged with the existing data model, and the naming in the existing data model always takes precedence. Matching fields (in case fields were renamed) are identified by _name_, _id property_ and _relation type_, in that order.

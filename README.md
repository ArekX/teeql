# teeql

teeql is a simple yet powerful query builder for SQL languages. It is designed to simplify the process of writing and managing SQL queries in Typescript and Javascript applications. It leverages JavaScript's template literals to provide a clean, intuitive syntax for constructing queries.

This library as it written right now it does not depend on any specific database engines like MySQL, Postgres, etc. It only generates a prepared SQL string and gives you the parameters used. The only place it actually generates SQL on its own is in the general SQL dialect which is a configuration which can be overridden by you if you are in some specific case where you need something generated which is unsupported by common SQL database engines.

## Motivation

Object query builders have become very complicated to learn and use properly. ORMs start as a good thing but in larger projects they become a liability since they usually load more data than needed.

Developers usually try to run away from writing SQL because it is clunkly to write in code and also to maintain.

So what if we had a way to simplify writing the SQL itself and also to make it maintainable? This is what teeql does. And support for Typescript is also a plus.

## Security

teeql follows a simple principle which also allows for best possible security from SQL injection. By using javascript template literal language itself provides a barrier
to separate what should be a parameter and what should be a query string.

Take for example this query for retriving login details:

```typescript
const username = request.body.get('username')
tql`SELECT id, username, password FROM users WHERE username = ${username}`; 
```

In template literal syntax this will be processed as:

```typescript
strings = ["SELECT id, username, password FROM users WHERE username = ", ""];
args = [username]
```

When compiling this, teeql converts this into prepared string format:

```typescript
{
  sql: "SELECT id, username, password FROM users WHERE username = :p_1",
  params: {
    ":p_1": username
  }
}
```

teeql also looks at what the type of the parameter is and only if its another query
created by `tql` it will allow it to be treated as a part of the query string, so this:

```typescript
const subquery = tql`SELECT id FROM user_profile WHERE active = 1`;
const maliciousUsername = "' --"; // this would be a malicious exploit from user input.
const query = tql`SELECT id, username, password FROM users WHERE username = ${maliciousUsername} AND profile_id IN (${subquery})`;


const compiled = compile(query);
```

Would result in:

```typescript
{
  sql: "SELECT id, username, password FROM users WHERE username = :p_1 AND AND profile_id IN (SELECT id FROM user_profile WHERE active = 1)",
  params: {
     ':p_1': "' --"
  }
}
```

Because anything which is not a query created by `tql` is always treated as it is
a parameter.

# Installation

## JSR

Check https://jsr.io/@arekx/teeql to see installation commands for your runtime.

# Basic Usage

At its simplest, teeql can be used to construct and compile SQL queries using the `tql` template literal and the `compile` function. Here's an example:

```ts
import { tql, compile } from 'teeql';

const query = tql`SELECT * FROM users WHERE id = ${1}`;
const compiledQuery = compile(query);

// Pass compiledQuery.sql and compiledQuery.params into your database
```

In this example, compiledQuery will be an object of type CompiledQuery, which includes the SQL query string and the parameters used in the query.

# Operators

teeql has operators which can be used to simplify the whole proces of writing queries.

Operators in a nutshell are set of helper functions which end up passing or generating additional `tql` so that your query can be built based on some additional
parameters.

Following is a quick summary of operators you can use in `tql`

## when

`when` operator is used to conditionally add additional SQL to your query based
on whether a parameter passed to it is true or false. This is very useful for building
filters or adding different joins and conditions based on what data is needed.

For example:

```typescript
const productSearch = request.get('search') ?? null;
const query = compile(tql`
  SELECT id, name FROM product
  WHERE
    active = 1
    ${when(productSearch, tql`AND name LIKE ${`%${productSearch}%`}`)}
`);
```

Will add `AND LIKE :p_1` (where `:p_1` is the `'%searchTerm%'`') to the compiled
query only when productSearch is actually passed in the request.

It can also be used as a ternary operator:

```typescript
const onlyActiveProducts = request.get('active_products') ?? null;
const query = compile(tql`
  SELECT id, name FROM product
  WHERE
    active = 1
    ${when(onlyActiveProducts, 
      tql`AND status = 'active'` // will be returned if onlyActiveProducts is true,
      tql`AND status IN ('pending', 'active')` // will be returned if onlyActiveProducts is false
    )}
`);
```

### Parameters vs functions

Parameters passed to `when` can be values or functions returning those values. For
performance and memory reasons it is useful to prefer functions over just returning
the values directly:

```typescript
const active = 1;
const queryUsingValues = compile(tql`SELECT id FROM users ${when(
  active == 1, 
  tql`WHERE active = 1` // this will always be generated here then only passed if active = 1
)}`);

const queryUsingFunctions = compile(tql`SELECT id FROM users ${when(
  () => active == 1, 
  () => tql`WHERE active = 1` // this will only be generated and passed when active = 1
)}`);
```

## glue

glue operator allows you to stictch two or more queries together, it is useful when
you want to build list of columns, filters or union queries or just join multiple queries together.

Example:
```typescript
const columnsToInclude = [
  tql`id`, 
  tql`name`, 
  tql`password`
];
const query = compile(tql`
  SELECT
    ${glue(
      tql` ,`,
      columnsToInclude
    )}
  FROM
    users
`); 
```

Will return:
```typescript
{
  sql: 'SELECT id, name, password FROM users',
  params: {}
}
```

There are specialized operators for common glue operations:
* `glueAnd` - Glues queries with ` AND `. Useful when building filters
* `glueOr` - Glues queries with ` OR `. Useful when building filters
* `glueComma` - Glues queries with `, `. Useful when combining queries like columns or parameters.
* `glueUnion` - Glues queries with ` UNION `. Useful when making union queries.

Please note that `glue` can work together with `when` perfectly to only add things
which are needed.

Example using `glueAnd` when building filters:

```typescript
const search = request.get('search'); // filter for search
const activeOnly = request.get('active_only'); // filter to show only active products

const query = compile(tql`
  SELECT 
    id, name, cost
  FROM product
  WHERE
  ${glueAnd(
    tql`is_published = 1`,
    when(search.length > 0, tql`name LIKE ${`%${search}%`}`),
    when(activeOnly == 1, tql`active = 1`),
  )}`;
```

This will produce all three filters are set:

```typescript
{
  sql: "SELECT id, name, cost FROM product WHERE is_published = 1 AND name LIKE :p_1 AND active = 1", 
  params: {
    ':p_1': search // value from search with % and % on the sides.
  }
}
```

## prepend

Prepend operator prepends a source query with another query if that query is not empty. This is useful when
you want for instance to apply `WHERE` when there is a filter set:

```typescript
const search = request.get('search'); // filter for search

const query = compile(tql`
  SELECT 
    id, name, cost
  FROM product
  ${prepend(tql`WHERE `, glueAnd(
    tql`is_published = 1`,
    when(search.length > 0, tql`name LIKE ${`%${search}%`}`),
  )})}`;
```

## match

Match operator is similar to `when` except it accepts an array of parameters and returns the query on the first matched value:

```typescript
const STATE_ACTIVE = 10;
const STATE_PENDING = 20;
const STATE_DELETED = 30;
const activeState = request.get('active_state');
const query = compile(tql`
  SELECT 
    id, name
  FROM users
  WHERE
  status = ${match(
    [() => active == STATE_ACTIVE, () => tql`'active'`],
    [() => active == STATE_PENDING, () => tql`'pending-activation'`],
    [() => active == STATE_DELETED, () => tql`'deleted'`],
  )}
`)
```

Match will run the function from the first index of each array and return the
query if its true.

So in case when active = 30, the result will 

```typescript
{
  sql: "SELECT id, name FROM users WHERE status = 'deleted'",
  params: {}
}
```

**Note:** Match, like `when` can accept parameters either as a function returning a value or the value itself.

# Unsafe operations

Real world is never simple so it is not possible to create a perfect query builder for all possible use cases and make it fully secure from SQL operations. This is why these additional operations are added.

Keep note that these operations allow strings to be added to the query so they allow for SQL injection to 
happen. This means that these operations should be used only with full knowledge of their effects and with extreme caution not to let any user input to be passed to these methods in any way (either from another method
or from database, etc.). These methods are prefixed with `unsafe` to denote that they are not fully secure.

## unsafeRaw

As the name says, this just passes whatever the string is passed to this directly into the query without
any sanitization or processing:

```typescript
const username = request.get('username'); // The passed value in request here is "' --"
const query = compile(tql`SELECT id FROM users WHERE username = '${unsafeRaw(username)}' AND is_active = 1`);
```

Would output:

```typescript
{
  sql: "SELECT id FROM users WHERE username = '' -- AND is_active = 1", // Anything after -- is considered a comment in SQL, meaning the SQL injection happened here.
  params: {} // No parameters since unsafeRaw was used.
}
```

Usecase for this function would be for internal, queries which work on constants or some cases where you
need SQL generated from a string and for whatever reason you cannot use `tql` to do it. These cases should be extremely rare so please make sure that you have a really good reason to use this method.

## unsafeName

This allows you to reference table names, column names and other database objects by their name. This method
attempts sanitization and it is a bit safer than `unsafeRaw`. Sanitization is performed by the dialect object
itself which in general case means that anything which is not a:
- letter
- number
- dot
- underscore

Will be removed from a name:

```typescript
const tableName = tables.usersTable; // returns string "public.users"
const columnName = userRecord.targetColumn; // returns "name!"
const query = compile(tql`SELECT id, ${unsafeName(columnName)} FROM ${unsafeName(tableName)}`);
```

Will return:

```typescript
{
  sql: "SELECT id, name FROM users", // "!" is removed due to sanitization
  params: {}
}
```

Usecase for this is similar to `unsafeRaw`, for internal use and not accepting user input, when you need to
pick a column or a table based on some internal logic.

Note: While this method will not (probably) not allow SQL injection directly if user input is used (due to sanitization) it will still allow user input to specify whatever valid string they want which can cause unintended consequences like reading data from a column or a table which you did not intend.

# Advanced Usage
For more complex use cases, teeql allows you to define your own parameter builder and SQL dialect. This can be useful for handling different SQL dialects or customizing how parameters are handled.

Here's an example of how you might define a custom parameter builder and custom dialect:

```typescript
import { tql, compile, createDialect, generalSqlDialect, ParameterBuilder } from 'teeql';

const params: ParameterBuilder = new ParameterBuilder();
const dialect: Dialect = {
  ...generalSqlDialect,
  getParameterName: (p) => `@${p}`, // In this example the database requires prepared parameters to be @p_1, @p_2, etc.
  toPreparedParameters: builder => {
      const result = {};

      for(const [key, value] of Object.entries(builder.parameters)) {
        result["@" + key] = value;
      }

      return result;
  };
};

const query = tql`SELECT * FROM users WHERE id IN ${[1, 2, 3]}`;
const compiledQuery = compile(query, parameters, dialect);
```

This would return:

```typescript
{
  sql: "SELECT * FROM users WHERE id IN (@p_1, @p_2, @p_3)",
  params: {
     "@p_1": 1,
     "@p_2": 2,
     "@p_3": 3,
  }
}
```

# Testing
This project uses Jest for testing. 

You can run the tests with the following command: `npm test`
To generate a coverage report run: `npm run coverage`

# Building
To build the project, use the following command: `npm run build`

# Contributing
Contributions are welcome! Please feel free to submit a pull request.

# License
This project is licensed under the [Apache 2.0 License](LICENSE)
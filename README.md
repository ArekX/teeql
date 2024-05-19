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
const maliciousUsername = "' OR 1=1"; // this would be a malicious exploit from user input.
const query = tql`SELECT id, username, password FROM users WHERE username = ${maliciousUsername} AND profile_id IN (${subquery})`;


const compiled = compile(query);
```

Would result in:

```typescript
{
  sql: "SELECT id, username, password FROM users WHERE username = :p_1 AND AND profile_id IN (SELECT id FROM user_profile WHERE active = 1)",
  params: {
     ':p_1': "' OR 1=1"
  }
}
```

Because anything which is not a query created by `tql` is always treated as it is
a parameter.

# Basic Usage

At its simplest, teeql can be used to construct and compile SQL queries using the `tql` template literal and the `compile` function. Here's an example:

```typescript
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

# glue

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

# Advanced Usage
For more complex use cases, teeql allows you to define your own parameter builder and SQL dialect. This can be useful for handling different SQL dialects or customizing how parameters are handled.

Here's an example of how you might define a custom parameter builder and dialect:

```typescript
import { tql, compile, createDialect, ParameterBuilder } from 'teeql';

const params: ParameterBuilder = new ParameterBuilder();
const dialect = createDialect({
  getParameterName: (p) => `:${p}`,
  toPreparedparams: (p) => p.parameters,
  glueArray: (p) => `(${p.join(", ")})`,
});

const query = tql`SELECT * FROM users WHERE id IN ${[1, 2, 3]}`;
const compiledQuery = compile(query, parameters, dialect);
```

In this example, the getParameterName function in the dialect is used to prefix parameter names with a colon, and the glueArray function is used to join array parameters with commas.

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
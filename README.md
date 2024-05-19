# teeql

teeql is a simple yet powerful query builder for SQL languaged. It is designed to simplify the process of writing and managing SQL queries in Typescript and Javascript applications. It leverages JavaScript's template literals to provide a clean, intuitive syntax for constructing queries.

This library as it written right now it does not depend on any specific database engines like MySQL, Postgres, etc. It only generates a prepared SQL string and gives you the parameters used. The only place it actually generates SQL on its own is in the general SQL dialect which is a configuration which can be overridden by you if you are in some specific case where you need something generated which is unsupported by common SQL database engines.

## Motivation

Object query builders have become very complicated to learn and use properly. ORMs start as a good thing but in larger projects they become a liability since they usually load more data than needed.

Developers usually try to run away from writing SQL because it is clunkly to write in code and also to maintain.

So what if we had a way to simplify writing the SQL itself and also to make it maintainable? This is what teeql does. And support for Typescript is also a plus.

## Basic Usage

At its simplest, teeql can be used to construct and compile SQL queries using the `tql` template literal and the `compile` function. Here's an example:

```typescript
import { tql, compile } from 'teeql';

const query = tql`SELECT * FROM users WHERE id = ${1}`;
const compiledQuery = compile(query);

// Pass compiledQuery.sql and compiledQuery.params into your database
```

In this example, compiledQuery will be an object of type CompiledQuery, which includes the SQL query string and the parameters used in the query.

### Operators

teeql has additional operators which can be used to simplify the whole proces of writing queries.

# Advanced Usage
For more complex use cases, teeql allows you to define your own parameter builder and SQL dialect. This can be useful for handling different SQL dialects or customizing how parameters are handled.

Here's an example of how you might define a custom parameter builder and dialect:

```typescript
import { tql, compile, createDialect, ParameterBuilder } from 'teeql';

const parameters: ParameterBuilder = new ParameterBuilder();
const dialect = createDialect({
  getParameterName: (p) => `:${p}`,
  toPreparedParameters: (p) => p.parameters,
  glueArray: (p) => `(${p.join(", ")})`,
});

const query = tql`SELECT * FROM users WHERE id IN ${[1, 2, 3]}`;
const compiledQuery = compile(query, parameters, dialect);
```

In this example, the getParameterName function in the dialect is used to prefix parameter names with a colon, and the glueArray function is used to join array parameters with commas.

Testing
This project uses Jest for testing. You can run the tests with the following command:

Building
To build the project, use the following command:

Contributing
Contributions are welcome! Please feel free to submit a pull request.

License
This project is licensed under the MIT License.
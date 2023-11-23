# JSON Make for Typescript
Meet your new TypeScript sidekick `json-make-ts`! Easily turn user-input JSON into fancy TypeScript structures, perfect for crafting complex objects on the fly. With solid data validation and customizable flair, it's the go-to for keeping things simple and dynamic.

## Cool Features:
🚀 On-the-Fly Magic: Transform JSON into TypeScript with a snap, perfect for dynamic object creation.

🛡️ Rock-Solid Validation: Ensure your code's integrity with built-in validation—it's like a shield for your creations.

🎨 Make It Yours: Customize json-make-ts to fit your project like a glove, seamlessly blending into your workflow.

### A simple example
```typescript
// Declaration
@RecipeModel()
class User {
    @RecipeField() username: string;
    @RecipeField() email: string;
}

@RecipeModel()
class BlogPost {
    @RecipeField() title: string;
    @RecipeField() content: string;
    @RecipeField() author: User;
}

// Imagine turning this json
const config = {
    "$$type": "BlogPost",
    "title": "New Blog Post",
    "content": "This is the content of the blog post",
    "author": {
        "username": "jane_doe",
        "email": "jane@example.com"
    }
}

// Into an exact js-object like this
const blogSpot = new BlogSpot()
blogSpot.title = 'New Blog Post'
blogSpot.content = 'This is the content of the blog post'
blogSpot.author = new User()
blogSpot.author.username = 'jane_doe'
blogSpot.author.email = 'jane@example.com'
```

## Installation

You can install **json-make-ts** using either npm or yarn.

```bash
# Using npm
npm install json-make-ts

# Using yarn
yarn add json-make-ts
```

## Getting Started

1. Start by using the `@RecipeModel` and `@RecipeField` decorators in your classes:

    ```typescript
    @RecipeModel()
    class User {
        @RecipeField() username: string;
        @RecipeField() email: string;
    }
    ```

2. Add your class to the repository:

    ```typescript
    User.addToMakeRepo(MakeGlobal);
    ```

3. Create objects easily:

    ```typescript
    const user = MakeGlobal.make({
        $$type: 'User',
        username: 'user1',
        email: 'user1@gmail.com'
    });
    ```

4. See how `json-make-ts` helps catch errors during data validation:

    ```typescript
    // This will gracefully trigger an error
    const user = MakeGlobal.make({
        $$type: 'User',
        username: 1, // only strings are accepted in this context
        email: 'user1@gmail.com'
    });
    ```

5. Explore nested structures with support for complex relationships:

    ```typescript
    @RecipeModel()
    class BlogPost {
        @RecipeField() title: string;
        @RecipeField() content: string;
        @RecipeField() author: User;
    }

    BlogPost.addToMakeRepo(MakeGlobal);

    const blog = MakeGlobal.make({
        "$$type": "BlogPost",
        "title": "New Blog Post",
        "content": "This is the content of the blog post",
        "author": { // The User type will be seamlessly interpolated
            "username": "jane_doe",
            "email": "jane@example.com"
        }
    });
    ```

Discover the features of `json-make-ts` on your exciting journey! 🚀✨

## Data Validation
**json-make-ts** goes beyond just transforming JSON configurations into JavaScript objects—it provides robust data validation to ensure that the input conforms to your expected structure.

### Primitives

Validation for all primitive types comes built-in, requiring no additional setup. The library seamlessly handles the following primitive types:

- String
- Number
- Boolean
- Null / Undefined

### Associations

**json-make-ts** seamlessly integrates with various association types. Take a look at this example:

```typescript
@RecipeModel()
class BlogPost {
    @RecipeField() title: string;
    @RecipeField() content: string;
    @RecipeField() author: User;
}
```

In this scenario, the `author` field is expected to be an instance of the User type by default. If an invalid data type is provided, the library ensures robustness by throwing an error, helping you catch and address discrepancies in your data structure.

If it's not possible to explicitly define the expected type of a field during its declaration, the use of [@RecipeField options](#field-options) provides a customizable solution for greater flexibility.

### Arrays

As TypeScript lacks type information for generic types, specifying the expected element type of an array field can be achieved using `preferedType` in [**@RecipeField options**](#field-options) for type validation.

```typescript
@RecipeModel()
class BlogPost {
    // ...
    @RecipeField({ preferedType: () => String })
    categories: string[]

    @RecipeField({ preferedType: () => User })
    viewers: User[]
}
```

### Nested Objects

Unfortunately, nested object field type validation is not supported at the moment. If you still wish to utilize nested object fields, you can bypass type validation by using `skipTypeCheck` in [**@RecipeField options**](#field-options).

```typescript
@RecipeModel()
class BlogPost {
    @RecipeField({ skipTypeCheck: true })
    metadata: {
        link: string,
        tags: string[]
    }
}
```

### Fields Options

- **fieldName**: The name of the field, automatically set and generally shouldn't be changed unless you have a specific reason to do so.

- **type**: A function specifying the type of the field. It can be set automatically, but explicit specification is available when needed.

- **skipTypeCheck**: Boolean flag to skip the entire type validation process. Default is `false`.

- **optional**: Boolean flag indicating whether the field accepts `null` or `undefined` as valid values. Default is `false`.

- **defaultValue**: A factory function returning the default value if the input is `null` or `undefined`. This option overrides the `optional` flag.

- **configName**: The field name in the JSON configuration that will be mapped to this field. The default is the same as the `fieldName`.

- **make**: A custom factory function, allowing replacement the construction of this field's value. More details are available at [Field Custom Factory](#field-custom-factories).

- **validation**: Custom validation for a field, with the signature `(field: FieldRecipeDesc, value: any) => boolean`.

These options provide a high level of customization for handling various aspects of field definition, validation, and conversion within **json-make-ts**.

```typescript
// This validate the format of email field and set the field to empty string if no data provided
@RecipeField({
  defaultValue: () => '',
  validation: (desc, val) => !val || emailRegex.match(val)
})
email: string;
```

### Factory

By default, object construction within **json-make-ts** is straightforward, utilizing the `new` operator. However, for more nuanced scenarios, custom factories provide a powerful tool for customization.

#### Class Custom Factory

You can apply a class custom factory by setting the first parameter of `@RecipeModel`, which then applies to all object constructions of that type. For example:

```typescript
@RecipeModel(() => ({
    htmlContent: ''
}))
class BlogPost {
    htmlContent: string;
}
```

In this setup, a plain object is used instead of a new BlogPost instance whenever constructing data of type BlogPost.

#### Field Custom Factory

For field-specific customization, you can set the make parameter of @RecipeField, allowing you to construct the initial value for that field. Here's an example:

Example: this will init the `author` field by the preferred type of `AdminUser` if the field `type` in the configuration is `ADMIN`. Otherwise it uses the default construction.
```typescript
class BlogPost {
    @RecipeField({
        make: (ctx, config) => config.type === 'ADMIN' ? ctx.make(config, { preferredType: AdminUser }) : ctx.make(config)
    })
    author: User
}
```

In this example, the author field is initialized based on the preferred type of `AdminUser` if the field type in the configuration is set to 'ADMIN'. Otherwise, it uses the default construction.

### Custom Object Construction

In the examples above, we focused on using **json-make-ts** to generate objects that we explicitly defined. However, in practical scenarios, we often need to construct objects that are not declared by us. In such cases, custom object construction comes to the rescue.

To achieve this, we can add a new factory function directly to the Repository. For instance:

```typescript
MakeGlobal.add(MongoConnection.name, (config) => {
    const conn = new MongoConnection();
    conn.connect();
    return conn;
});
```

In this example, a factory for the MongoConnection object is set up. It creates an instance from a pre-defined class and initializes the connection.

Now, this custom factory can be used in other places:

```typescript
@RecipeModel()
class AppConnection {
    @RecipeField()
    mongo: MongoConnection;
}
```

In the AppConnection class, the mongo field is defined with the `@RecipeField` decorator, and it will utilize the custom factory we set up for `MongoConnection`.

## References

### MakeRepository

The `MakeRepository` serves as the central hub for storing models and factories within **json-make-ts**. While the global instance named `MakeGlobal` is commonly used in most scenarios, the flexibility of the library allows for the creation of multiple repositories as needed.

- **addMaker(type: string, maker: Maker):** Adds a custom maker function for a specific type to the repository.

- **hasMaker(type: string):** Checks if the repository contains a custom maker function for a given type.

- **getMaker(type: string):** Retrieves the custom maker function associated with a specific type from the repository.

- **addTemplate(name: string, template: MakeConfig):** Adds a template configuration for a specified name to the repository.

- **hasTemplate(type: string):** Checks if the repository contains a template configuration for a given name.

- **getTemplate(type: string):** Retrieves the template configuration associated with a specific name from the repository.

- **addRef(name: string, ref: any):** Adds a reference to an object / configuration with a given name to the repository.

- **hasRef(name: string):** Checks if the repository contains a reference object with a specified name.

- **getRef(name: string):** Retrieves the reference object associated with a specific name from the repository.

- **newContext():** Creates and returns a new MakeContext(#makecontext) tied to this repository.

### MakeContext

The `MakeContext` contains the entire scenario of object creation. In simpler words, it serves as the orchestrator to transform JSON configurations into objects within a given scenario. It can be retrieved by using the `newContext` method from a repository.

- **Repository:** The make repository associated with the context.

- **Path:** The path of the current object within the object creation scenario.

- **Error:** The current error, if any, encountered during object creation.

- **make(config, options):** Creates an object from a configuration with specific options. The available options are:
  - `fieldName?: string`
  - `**preferredType**?: ClassType`
  - `skipTypeCheck?: boolean`
  - `optional?: boolean`
  - `defaultValue?: any`

- **resolveConfig(config):** Resolves the configuration by applying templates and references, resulting in the full configuration.

## Conclusion & contribution

**json-make-ts** empowers developers with a versatile toolset for transforming JSON configurations into JavaScript objects. With comprehensive support for data validation, customizable object construction, and the flexibility of the `MakeRepository` and `MakeContext` classes, the library offers a seamless and efficient approach to handling diverse data structures. Explore the rich features and customization options to enhance your development workflow and ensure robust data integrity 🚀 🛡️.

We welcome and encourage contributions from the community to enhance the capabilities and usability of **json-make-ts**, whether it's addressing issues, adding new features, or improving documentation. Feel free to explore the codebase, open issues, submit pull requests, and join us in shaping the future of **json-make-ts**.

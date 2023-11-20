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

### Primitives

### Associations

### Arrays

### Nested Objects

### Field Options

### Custom factories

## Support other objects

## References

### MakeRepository

### MakeContext

### Recipe

### Decorators

## Samples

## Conclusion & contribution

To begin with, we need to understand there terms:

- A maker: is just a factory function, receiving a json-configuration and returning the ouput object. However, the difference is on the first argument, which is a MakeContext object allowing us to generate nested field without reimplementing the making logic.
- MakeRepository: where we store all makers
- MakeContext: a runtime context when creating an object

Let's check an example:
Example:
```typescript
const repo = new MakerRepository() // an empty repo

// add some makers for user and blogspot
repo.add('User', (ctx, config) => ({
	username: config.username,
	email: config.email
}))

repo.add('BlogPost', (ctx, config) => ({
	title: ctx.title,
	content: ctx.content,
	author: ctx.make(config.author)
}))

// Then we can use the repo to create a js-object from the json:
const blog = repo.newContext().make({
    "$$type": "BlogPost",
    "title": "New Blog Post",
    "content": "This is the content of the blog post",
    "author": {
        "$$type": "User",
        "username": "jane_doe",
        "email": "jane@example.com"
    }
})
```

Explaination:
- In the `BlogPost` maker, we use the context to building the `author` field, which must be a `User` as specified in the options by `preferredType` field
- In the input json, we define the type of `BlogPost` and `User` in `$$type` field, this is a key-word field to determine the output type
  
So, what's powerful with this lib.
Firstly, it supports fully type-checking. Let's revisit the example above:
- what if we want to make sure the username & email to be string and not empty, using type-validation:
```typescript
repo.add('User', (ctx, config) => ({
	username: ctx.make(config.username, { preferredType: String }),
	email: ctx.make(config.username, { preferredType: String })
}))
```

- Secondly, it's fully compatible with js class type:
```typescript
class User {
    constructor(public username: string, public email: string) {}
}

repo.add(User.name, (ctx, config) => new User(
    ctx.make(config.username, { preferredType: String },
    ctx.make(config.email, { preferredType: String }
))))

repo.add('BlogPost', (ctx, config) => ({
	title: ctx.make(config.title, { preferredType: String }),
	content: ctx.make(config.content, { preferredType: String }),
	author: ctx.make(config.author, { preferedType: User }) // <-- it will fail if the config `author` field not returning a User instance
}))
```
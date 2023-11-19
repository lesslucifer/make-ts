# JSON Make for Typescript
Meet your new TypeScript sidekick `json-make-ts`! Easily turn user-input JSON into fancy TypeScript structures, perfect for crafting complex objects on the fly. With solid data validation and customizable flair, it's the go-to for keeping things simple and dynamic.

## Cool Features:
🚀 On-the-Fly Magic: Transform JSON into TypeScript with a snap, perfect for dynamic object creation.

🛡️ Rock-Solid Validation: Ensure your code's integrity with built-in validation—it's like a shield for your creations.

🎨 Make It Yours: Customize json-make-ts to fit your project like a glove, seamlessly blending into your workflow.

### A simple example
```typescript
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

// Imagine we can turn this json
const config = {
    "$$type": "BlogPost",
    "title": "New Blog Post",
    "content": "This is the content of the blog post",
    "author": {
        "$$type": "User",
        "username": "jane_doe",
        "email": "jane@example.com"
    }
}

// To an exact object like this
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
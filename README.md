
# Welcome to Money Mapper

## Project info

A financial tracking application that uses MongoDB for data storage.

## MongoDB Setup

This application uses MongoDB as the primary database. Follow these steps to set up MongoDB with your application:

### 1. MongoDB Connection String

You need to provide a MongoDB connection string for the application to connect to your database. There are a few options:

**Option 1: MongoDB Atlas (Recommended for Production)**
- Create a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- Create a new cluster
- Configure database access (create a user with password)
- Configure network access (whitelist your IP or set to allow access from anywhere)
- Get your connection string from Atlas dashboard, it will look like:
  ```
  mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority
  ```

**Option 2: Local MongoDB Installation**
- Install [MongoDB Community Edition](https://www.mongodb.com/try/download/community) on your local machine
- Start the MongoDB service
- Use connection string: `mongodb://localhost:27017/finance_app`

### 2. Configuration

Before deploying your application, you must set the MongoDB connection string as an environment variable:

- `MONGODB_URI`: Your MongoDB connection string
- `MONGODB_DB_NAME`: (Optional) The name of your database (defaults to 'finance_app')

### 3. Testing Your Connection

The application includes a test function to check if your MongoDB connection is working correctly. You can verify your connection from the Settings page of the application.

### 4. Database Collections

The application uses the following collections:
- `categories`: Stores all your expense and income categories
- `transactions`: Stores all financial transactions

### 5. Troubleshooting

Common issues:
- **Connection failures**: Make sure your connection string is correct and the MongoDB server is running
- **Authentication failures**: Verify your username and password are correct
- **Network issues**: Check if your IP is whitelisted in MongoDB Atlas, or if your local network allows connections to MongoDB

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- MongoDB for database storage

## How can I deploy this project?

To deploy this project, you'll need to:

1. Set up your MongoDB database as described above
2. Set the MongoDB connection string as an environment variable in your hosting environment
3. Build the project with `npm run build`
4. Deploy the built files to your preferred hosting service (Netlify, Vercel, etc.)

Remember that this is a frontend application with MongoDB integration, so your MongoDB connection string should be secured and not exposed in the frontend code.

## Express (4.17.3) and Mongoose (6.3.1) with Auth and CRUD Application

### Requirement

1. Node.js
2. MongoDB URL
3. Postman

### Set up

```
npm install
```

This command will be installing all the package that listed in package.json file.

### Running for development

```
npm run dev
```

App will be running on port 5000 (http://localhost:5000).

### Development

Create file .env and make variable MONGO_URI and JWT_SECRET then assign the variable with MongoDB Atlas URL and JWT token.

Example :

```
MONGO_URI = mongodb+srv://admin:<password>@cluster0.8z0ls.mongodb.net/<database_name>?retryWrites=true&w=majority
JWT_SECRET=Super_secret_string
```

### API Endpoint

Open `./routes`


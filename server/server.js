//import express.js package
const express = require('express');
//import ApolloServer
const { ApolloServer } = require('apollo-server-express');
//import typeDefs and resolvers
const { typeDefs, resolvers } = require('./schemas');
//import database connection to MongoDB via Mongoose
const db = require('./config/connection');
const path = require('path');
//import Auth middleware
const { authMiddleware } = require('./utils/auth');

// require('./utils/cron')

//set environment variable
const PORT = process.env.PORT || 3003;
//create a new Apollo server and pass in our schema data
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware
});
//instantiate the server
const app = express();

//parse incoming string or array data
app.use(express.urlencoded({ extended: false }));
//parse incoming JSON data
app.use(express.json());

//create a new instance of an Apollo server with the GraphQl schema
const startApolloServer = async (typeDefs, resolvers) => {
    await server.start();
    //integrate our Apollo server with the Express application as middleware
    server.applyMiddleware({ app });
    // Serve up static assets
    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../client/build')));
    }

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });

    //establish connection to server via the listen() method
    db.once('open', () => {
        app.listen(PORT, () => {
            console.log(`API server running on port ${PORT}!`);
            console.log(`Use GraphQl at http://localhost:${PORT}${server.graphqlPath}`);
        });
    });
};

//call the async function to start the server
startApolloServer(typeDefs, resolvers);
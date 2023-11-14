const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mainRoutes = require('./routes/mainRoutes');

app.use('/', mainRoutes);

module.exports = app;

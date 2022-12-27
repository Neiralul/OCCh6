const express = require('express');
const mongoose = require('mongoose');
const sauce = require('./models/sauce');
const User = require('./models/user');

const userRoutes = require('./routes/user');

const app = express();

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

mongoose.connect('mongodb+srv://Stephane:20121990@piiquante.zczcp4e.mongodb.net/?retryWrites=true&w=majority',
{ useNewUrlParser: true,
  useUnifiedTopology: true })
    .then(() => console.log('Connextion à MongoDB réussie !'))
    .catch(() => console.log('Connextion à MongoDB échouée !'));


app.use((req, res, next) => {
    res.json({ message: 'Votre requête a bien été reçue!'});
});

app.use('/api/auth', userRoutes);

app.get('/api/sauce', (req, res, next) => {
  sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => req.status(400).json({ error }));
});

app.get('/api/sauce/:id', (req, res, next) => {
  sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => req.status(400).json({ error }));
});

module.exports = app;
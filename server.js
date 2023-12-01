// server.js
const express = require('express');
const Joi = require('joi');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose
  .connect('mongodb://localhost/videogames', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to mongodb'))
  .catch(error => console.log("Couldn't connect to mongodb", error));

const videoGameSchema = new mongoose.Schema({
  title: String,
  genre: String,
  releaseYear: Number,
  platform: String,
  characters: [String],
  imagePath: String,
});

const videogames = mongoose.model('videogames', videoGameSchema);

const createVideoGame = async () => {
  const videogame = new videogames({
    title: 'The Last of Us',
    genre: 'Action',
    releaseYear: 2013,
    platform: 'Console',
    characters: ['Joel Miller', 'Ellie Williams'],
    imagePath: '/uploads/placeholder-image.jpg', // Provide a default placeholder image path
  });

  try {
    const result = await videogame.save();
    console.log(result);
  } catch (error) {
    console.error('Error saving videogame:', error);
  }
};

createVideoGame(); // Call the function once

const storage = multer({ dest: 'uploads/' });

const itemSchema = Joi.object({
  title: Joi.string().required(),
  genre: Joi.string().required(),
  releaseYear: Joi.number().required(),
  platform: Joi.string().required(),
  characters: Joi.array().items(Joi.string()).required(),
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/data', async (req, res) => {
  try {
    const data = await videogames.find();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/add-item', storage.single('image'), async (req, res) => {
  try {
    const validatedData = await itemSchema.validateAsync(req.body);

    const newItem = new videogames({
      ...validatedData,
      imagePath: req.file ? `/uploads/${req.file.filename}` : '/uploads/placeholder-image.jpg',
    });

    const result = await newItem.save();
    res.status(200).send('Item added successfully');
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(400).send('Error adding item');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

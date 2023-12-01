const express = require('express');
const Joi = require('joi');
const multer = require('multer');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

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
  imageUrl: String,
  description: String,
  trailerUrl: String,
});

const videogames = mongoose.model('videogames', videoGameSchema);

const createVideoGame = async () => {
  const videogame = new videogames({
    title: 'The Last of Us',
    genre: 'Action',
    releaseYear: 2013,
    platform: 'Console',
    characters: ['Joel Miller', 'Ellie Williams'],
    imageUrl: 'https://images.search.yahoo.com/...', 
    description: 'Post apocalyptic action game',
    trailerUrl: 'https://video.search.yahoo.com/...', 
  });

  try {
    const result = await videogame.save();
    console.log(result);
  } catch (error) {
    console.error('Error saving videogame:', error);
  }
};

// Call the function once
createVideoGame();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const itemSchema = Joi.object({
  title: Joi.string().required(),
  genre: Joi.string().required(),
  releaseYear: Joi.number().required(),
  platform: Joi.string().required(),
  characters: Joi.array().items(Joi.string()).required(),
  imageUrl: Joi.string().required(),
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

app.post('/api/add-item', upload.single('file'), async (req, res) => {
  try {
    const validatedData = await itemSchema.validateAsync(req.body);
    const newItem = new videogames(validatedData);
    const result = await newItem.save();
    res.status(200).send('Item added successfully');
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(400).send('Error adding item');
  }
});

app.put('/api/edit-item/:id', async (req, res) => {
  const id = req.params.id;
  const newData = req.body.newData;

  try {
    const updatedItem = await videogames.findByIdAndUpdate(id, { description: newData }, { new: true });
    if (updatedItem) {
      res.status(200).send('Item edited successfully');
    } else {
      res.status(404).send('Item not found');
    }
  } catch (error) {
    console.error('Error editing item:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/api/delete-item/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const deletedItem = await videogames.findByIdAndRemove(id);
    if (deletedItem) {
      res.status(200).send('Item deleted successfully');
    } else {
      res.status(404).send('Item not found');
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

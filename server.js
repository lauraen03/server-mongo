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
app.use('/public', express.static(path.join(__dirname, 'public')));

mongoose
  .connect("mongodb+srv://lauran9263:Katielaura@videogames.gecfl4q.mongodb.net/")
  .then(() => console.log('Connected to mongodb'))
  .catch(error => console.log("Couldn't connect to mongodb", error));

const videoGameSchema = new mongoose.Schema({
  title: String,
  genre: String,
  releaseYear: Number,
  platform: String,
  characters: [String],
  imagePath: String,
  description: String, 
  trailerUrl: String,  
});

const videogames = mongoose.model('videogames', videoGameSchema);

const storage = multer({ dest: 'uploads/' });

const itemSchema = Joi.object({
  title: Joi.string().required(),
  genre: Joi.string().required(),
  releaseYear: Joi.number().required(),
  platform: Joi.string().required(),
  characters: Joi.array().items(Joi.string()).required(),
  description: Joi.string(),  
  trailerUrl: Joi.string(),  
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
      imagePath: req.file ? `/uploads/${req.file.filename}` : '/public/tlouimage.jpeg',
    });

    const result = await newItem.save();
    res.status(200).send('Item added successfully');
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(400).send('Error adding item');
  }
});


app.put('/api/edit-item/:id', storage.single('image'), async (req, res) => {
  try {
    const itemId = req.params.id;
    const validatedData = await itemSchema.validateAsync(req.body);

    const updatedItem = {
      ...validatedData,
      imagePath: req.file ? `/uploads/${req.file.filename}` : '/public/tlouimage.jpeg',
    };

    const result = await videogames.findByIdAndUpdate(itemId, updatedItem, { new: true });
    res.status(200).json(result);
  } catch (error) {
    console.error('Error editing item:', error);
    res.status(400).send('Error editing item');
  }
});


app.delete('/api/delete-item/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    const result = await videogames.findByIdAndDelete(itemId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(400).send('Error deleting item');
  }
});



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

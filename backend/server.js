const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://mongo:27017/vinventory', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Wine Schema
const wineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  vintage: { type: Number, required: true },
  region: { type: String },
  grape: { type: String },
  tastingNotes: { type: String },
});
const Wine = mongoose.model('Wine', wineSchema);

// API Routes
app.get('/wines', async (req, res) => {
  const wines = await Wine.find();
  res.json(wines);
});

app.post('/wines', async (req, res) => {
  const wine = new Wine(req.body);
  await wine.save();
  res.status(201).json(wine);
});

app.get('/wines/:id', async (req, res) => {
  const wine = await Wine.findById(req.params.id);
  if (!wine) return res.status(404).send('Wine not found');
  res.json(wine);
});

app.put('/wines/:id', async (req, res) => {
  const wine = await Wine.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!wine) return res.status(404).send('Wine not found');
  res.json(wine);
});

app.delete('/wines/:id', async (req, res) => {
  const wine = await Wine.findByIdAndDelete(req.params.id);
  if (!wine) return res.status(404).send('Wine not found');
  res.status(204).send();
});

// Basic Route
app.get('/', (req, res) => {
  res.send('Welcome to Vinventory API');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
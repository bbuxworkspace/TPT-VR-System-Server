const mongoose = require('mongoose');

const tileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  areaCoverage: {
    type: Number,  // in square meters per box
    required: true,
  },
  price: {
    type: Number,  // in euros
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String, // URLs or paths to images
    required: true,
  },
  brand: {
    type: String,
    default: 'TPT' // Assuming TPT is the brand
  },
});

const Tile = mongoose.model('Tile', tileSchema);

module.exports = Tile;

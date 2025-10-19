const mongoose = require('mongoose');

// Movie watchlist schema
const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
  year: { type: Number },
  genre: { type: String, trim: true },
    watched: { type: Boolean, default: false },
  rating: { type: Number },

    posterUrl: { type: String, trim: true },
    imdbID: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  {
    versionKey: false,
    collection: 'filmes',
  }
);

//Indexes for optimizing queries
movieSchema.index({ title: 1 });

movieSchema.index({ createdAt: -1 });

movieSchema.index({ watched: 1, rating: -1 });

// Export as 'Movie' model; the file name remains for compatibility with existing imports
module.exports = mongoose.models.Movie || mongoose.model('Movie', movieSchema);

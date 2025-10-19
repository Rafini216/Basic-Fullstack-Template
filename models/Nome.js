const mongoose = require('mongoose');

const nomeSchema = new mongoose.Schema({
  nome: { type: String, required: true },
}, {
  versionKey: false
});

module.exports = mongoose.models.Nome || mongoose.model('Nome', nomeSchema);

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  sicilNo: {
    type: String,
    required: true,
    unique: true
  },
  ad: {
    type: String,
    required: true
  },
  soyad: {
    type: String,
    required: true
  },
  unvan: {
    type: String,
    required: true,
    enum: ['Müdür', 'Katip', 'Mübaşir', 'Memur', 'Teknisyen', 'Tekniker'],
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 
const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  kullanici: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tip: {
    type: String,
    required: true,
    enum: ['Kasa', 'Ekran', 'Yazıcı', 'Tarayıcı']
  },
  marka: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  seriNo: {
    type: String,
    required: true,
    unique: true
  },
  domain: {
    type: String,
    required: function() {
      return this.tip === 'Kasa';
    }
  },
  garantiBaslangic: {
    type: Date,
    required: true
  },
  garantiBitis: {
    type: Date,
    required: true
  },
  durum: {
    type: String,
    enum: ['Aktif', 'Arızalı', 'Serviste', 'Hurda'],
    default: 'Aktif'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Device', deviceSchema); 
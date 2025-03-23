const mongoose = require('mongoose');

const solutionSchema = new mongoose.Schema({
  problem: {
    type: String,
    required: true
  },
  cihazTipi: [{
    type: String,
    enum: ['Kasa', 'Ekran', 'Yazıcı', 'Tarayıcı', 'Mikrofon', 'Kamera', 'Televizyon']
  }],
  belirtiler: [{
    type: String,
    required: true
  }],
  cozumAdimlari: [{
    type: String,
    required: true
  }],
  zorlukSeviyesi: {
    type: String,
    enum: ['Kolay', 'Orta', 'Zor'],
    required: true
  },
  basariOrani: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  etiketler: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Arama için index oluştur
solutionSchema.index({ problem: 'text', belirtiler: 'text', etiketler: 'text' });

// updatedAt alanını otomatik güncelle
solutionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Solution', solutionSchema); 
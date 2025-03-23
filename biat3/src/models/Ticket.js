const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  bildiren: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cihaz: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'cihazModel',
    required: true
  },
  cihazModel: {
    type: String,
    required: true,
    enum: ['Device', 'CourtRoom']
  },
  baslik: {
    type: String,
    required: true
  },
  aciklama: {
    type: String,
    required: true
  },
  oncelik: {
    type: String,
    enum: ['Düşük', 'Orta', 'Yüksek', 'Kritik'],
    default: 'Orta'
  },
  durum: {
    type: String,
    enum: ['Açık', 'İncelemede', 'Serviste', 'Çözüldü', 'Kapalı'],
    default: 'Açık'
  },
  servisSaglayici: {
    type: String,
    enum: ['Bakanlık', 'Arena Bilgisayar', 'Makro Bilgisayar'],
    required: function() {
      return this.durum === 'Serviste';
    }
  },
  notlar: [{
    yazan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    mesaj: {
      type: String,
      required: true
    },
    tarih: {
      type: Date,
      default: Date.now
    }
  }],
  cozumAciklamasi: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// updatedAt alanını otomatik güncelle
ticketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema); 
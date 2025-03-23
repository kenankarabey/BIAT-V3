const mongoose = require('mongoose');

const courtRoomSchema = new mongoose.Schema({
  salonNo: {
    type: String,
    required: true,
    unique: true
  },
  ekipmanlar: [{
    tip: {
      type: String,
      required: true,
      enum: ['Kasa', 'Ekran', 'Yazıcı', 'Mikrofon', 'Kamera', 'Televizyon']
    },
    kullaniciTipi: {
      type: String,
      required: true,
      enum: ['Hakim', 'Katip', 'Avukat']
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
      required: true
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
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CourtRoom', courtRoomSchema); 
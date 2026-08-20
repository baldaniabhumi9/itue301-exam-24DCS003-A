const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema(
  {
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    borrowDate: { type: Date, required: true, default: Date.now },
    returnDate: { type: Date, required: true },
    status: { type: String, enum: ['borrowed', 'returned', 'overdue'], default: 'borrowed' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Borrowing', borrowingSchema);

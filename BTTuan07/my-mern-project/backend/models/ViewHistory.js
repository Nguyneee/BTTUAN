const mongoose = require('mongoose');
const { Schema } = mongoose;

const viewHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        viewedAt: { type: Date, default: Date.now },
        viewCount: { type: Number, default: 1 },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { transform(doc, ret) { delete ret.__v; return ret; } },
  }
);

// Max 50 items in history
viewHistorySchema.pre('save', function (next) {
  if (this.products.length > 50) {
    this.products = this.products.slice(-50);
  }
  next();
});

const ViewHistory = mongoose.model('ViewHistory', viewHistorySchema);
module.exports = ViewHistory;

const mongoose = require('mongoose');
const Joi = require('joi');
const mongoosePaginate = require('mongoose-paginate-v2')

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },

  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  imageUrl: {
    type: String,
    required: true,
    trim: true
  },

  category: {
    type: String,
    trim: true,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },

  isAvailable: {
    type: Boolean,
    default: true
  },

  tags: {
    type: [String],
    default: []
  }
});

productSchema.statics.validateProduct = function(productData) {
  const schema = Joi.object({
    title: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).required(),
    price: Joi.number().min(0).required(),
    imageUrl: Joi.string().uri().required(),
    category: Joi.string().optional().allow(null, ''),
    stock: Joi.number().integer().min(0).required(),
    isAvailable: Joi.boolean().optional(),
    tags: Joi.array().items(Joi.string()).optional()
  });

  return schema.validate(productData);
};

productSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('Product', productSchema);

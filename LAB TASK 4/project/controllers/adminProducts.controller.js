const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
// exports.getAllProducts = async (req, res) => {
//   try {
//     const products = await Product.find();
//     res.render('products/list', { products });
//   } catch (error) {
//     res.status(500).send('Error retrieving products');
//   }
// };


exports.getProducts = async (req , res) => {
  const products = await Product.find().sort({ _id: -1 });
  res.render('products/adminproducts' , {req , user:req.user , products});
}

exports.getAddProduct = async (req , res) =>{
  res.render('products/addproduct' , {req , user : req.user});
}

exports.postAddProduct =  async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      stock,
      isAvailable,
      tags
    } = req.body;
    console.log(title , " " , description , " " , price);
    console.log(req.file.filename)
    const imageUrl = req.file ? `/images/products/${req.file.filename}` : undefined;

    const productData = {
      title,
      description,
      price: parseFloat(price),
      imageUrl,
      category: category || null,
      stock: parseInt(stock),
      isAvailable: isAvailable === 'on',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    };

    console.log("Reached Here");
    const newProduct = new Product(productData);
    await newProduct.save();
    console.log("Reached There");
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

exports.getEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    res.render('products/updateproduct', {
      req,
      user: req.user,
      id: req.params.id,
      product
    });
  } catch (error) {
    res.status(500).send('Server error');
  }
}

exports.postEditProduct = async (req, res) => {
  try {
    const {
      productId,
      title,
      description,
      price,
      category,
      stock,
      isAvailable,
      tags
    } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Product not found');
    }

    if (req.file) {
      if (product.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', 'public', product.imageUrl);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error('Failed to delete old image:', err.message);
          } else {
            console.log('Old image deleted:', oldImagePath);
          }
        });
      }

      product.imageUrl = `/images/products/${req.file.filename}`;
    }

    product.title = title;
    product.description = description;
    product.price = parseFloat(price);
    product.category = category || null;
    product.stock = parseInt(stock);
    product.isAvailable = isAvailable === 'on';
    product.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    await product.save();

    res.redirect('/admin/products');
  } catch (error) {
    console.error('Update error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.postDeleteProduct = async (req, res) => {
  try {
    console.log('Reached There');
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const imagePath = path.join(__dirname, '..', 'public', deletedProduct.imageUrl); // Adjust this path if necessary
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error('Error deleting image:', err.message);
      } else {
        console.log('Image deleted successfully');
      }
    });

    res.json({ message: 'Product and image deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

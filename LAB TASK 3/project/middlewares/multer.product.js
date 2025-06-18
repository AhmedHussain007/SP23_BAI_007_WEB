const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req , file , callback)=>{
    const uploadPath = path.join(__dirname, '..', 'public', 'images', 'products');
    callback(null , uploadPath);
  },
  filename: (req,file , callback)=>{
    const extension = path.extname(file.originalname);
    const title = (req.body.title) || 'user';
    const newFilename = Date.now() + extension;
    callback(null , newFilename)
  }
})
module.exports = multer({
  storage : storage,
  limits:{fileSize:1024*1024*5}
})

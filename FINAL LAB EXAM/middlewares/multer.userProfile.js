const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: (req , file , callback)=>{
    const uploadPath = path.join(__dirname, '..', 'public', 'images', 'users');
    callback(null , uploadPath);
  },
  filename: (req,file , callback)=>{
    const extension = path.extname(file.originalname);
    const username = (req.body.firstName + req.body.lastName) || 'user';
    const newFilename = Date.now() + username + extension;
    callback(null , newFilename)
  }
})
module.exports = multer({
  storage : storage,
  limits:{fileSize:1024*1024*5}
})

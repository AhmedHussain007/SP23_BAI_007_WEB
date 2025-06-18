const Order = require('../models/Order');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } });
    res.render('admin/users', { req, user: req.user, users });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}

exports.getOrders = async (req , res)=>{
  const orders = await Order.find();
  res.render("admin/orders" , {req , user:req.user, Order: orders});
}



exports.getAdmin = (req , res)=>{
  res.render('admin.ejs' , {req , user : req.user});
}


exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().populate('userId').populate('orderId');
    res.render('admin/complaints', { complaints , user : req.user});
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
}

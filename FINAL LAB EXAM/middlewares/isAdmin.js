const isAdmin = (req , res , next)=>{
  if(req.user.isAdmin){
    next();
  }else{
    res.send("You are not an admin so you don't have permission to access admin pages");
  }
}

module.exports = isAdmin

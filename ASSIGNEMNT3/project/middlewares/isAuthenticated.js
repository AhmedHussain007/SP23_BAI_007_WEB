const isAuthenticated = (req , res , next) =>{
  if(req.user !== null){
    next();
  }else{
    res.redirect('/auth/login')
  }
}

module.exports = isAuthenticated;

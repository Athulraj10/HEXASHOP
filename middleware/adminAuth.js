
const isAdminLogin = async (req, res, next) => {
    try {
      if (req.session.adminloggedIn) { 
        res.redirect("/admin/adminhome")
      } else {
        // res.redirect('/');
        next()
      }
    } catch (error) {
        console.log(error.message)
    }
  };

  const isAdminLogout = async (req, res, next) => {
    try {
      if (!req.session.adminloggedIn) {
        res.redirect('/admin');
      } else {
        next();
      }
    } catch (error) {
        console.log(error.message)
    }
  };
  
  module.exports = {
    isAdminLogin,
    isAdminLogout
  };
  


const isUserLogin = async (req, res, next) => {
    try {
      if (req.session.loggedIn) { 
        res.redirect("/home")
      } else {
        // res.redirect('/');
        next()
      }
    } catch (error) {

        console.log(error.message)
    }
  };

  const isUserLogout = async (req, res, next) => {
    try {
      if (!req.session.loggedIn) {
        res.redirect('/');
      } else {
        next();
      }
    } catch (error) {
        console.log(error.message)
    }
  };
  
  module.exports = {
    isUserLogin,
    isUserLogout
  };
  

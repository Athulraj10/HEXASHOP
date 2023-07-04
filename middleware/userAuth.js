
const isUserLogin = async (req, res, next) => {
    try {
      if (req.session.loggedIn) { 
        next()
      } else {
        // res.redirect('/login')
      }
    } catch (error) {

        console.log(error.message)
    }
  };

  const isUserLogout = async (req, res, next) => {
    try {
      if (!req.session.loggedIn) {
        // res.redirect('/login');
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
  

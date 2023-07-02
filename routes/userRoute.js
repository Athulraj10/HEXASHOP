const express=require('express')
const app=express();

app.use(express.json())
app.use(express.urlencoded({extended:true}))
const userController=require("../controller/userController");
// const config=require('../config/config')
const auth=require('../middleware/userAuth')



app.get('/home',userController.loadHome);

app.get('/',auth.isUserLogin,userController.loadlogin);
app.post('/',userController.verifyUser);

app.get('/allProducts', auth.isUserLogout,userController.allProductLoad);
app.get('/singleProduct', auth.isUserLogout,userController.singleProduct);
app.get('/categorySort',auth.isUserLogout,userController.categorySortProduct);


app.get('/cart',auth.isUserLogout,userController.cartGetMethod);
app.post('/addtocart',userController.postAddToCart);
app.post('/update-quantity',userController.quantityChanging);
app.get('/deleteproduct',auth.isUserLogout,userController.deleteFromCart);
app.get('/search',userController.searchProduct);


app.get('/profile',auth.isUserLogout,userController.userProfile);
app.get('/orderCancel',auth.isUserLogout,userController.cancelOrder);
app.get('/orderReturn',auth.isUserLogout,userController.orderReturn);
app.get('/orderReturnCancel',auth.isUserLogout,userController.cancelReturnOrder);
app.post('/handleButtonClick', userController.cheakReturndate);
app.get('/profile/manageaddress',auth.isUserLogout,userController.manageAddress);
app.get('/profile/manageaddressEdit',auth.isUserLogout,userController.manageaddressEdit);
app.post('/profile/manageAddressEdit',userController.manageaddressEditPostMethod);
app.get('/profile/coupons',auth.isUserLogout,userController.manageCoupon);
app.post('/cheakCouponAvailable',userController.cheakCoupon);

app.post('/checkWalletBalance',auth.isUserLogout,userController.cheakWalletAmount)

app.get('/wishlist',auth.isUserLogout, userController.wishlistGet);
app.post('/wishlistpost', userController.wishlistPost);
app.delete('/deleteProductWishlist',userController.deleteFromWishlist)

app.get('/profile/manageaddressAddAddress',auth.isUserLogout, userController.manageAddressGetAddress);
app.post('/profile/manageaddressPostAddAddress', userController.manageAddressAddAddress);

app.get('/profile/changeProfile',auth.isUserLogout, userController.profileChangeGetMethod);

app.get('/address',auth.isUserLogout,userController.cheakUserHasAddressornot,userController.addressPageGet);
app.get("/addressEditCart",userController.editaddress)
app.post("/addressEditCart",userController.editaddressPost)
app.post('/newUserInsertAddress', userController.newUserInsertAddress);
app.get('/userAddMoreAddress',auth.isUserLogout, userController.userAddMoreAddressGetMethod);
app.post('/userAddMoreAddressPostMethod', userController.userAddMoreAddressPostMethod);

app.get('/orderDetailsPage',userController.orderDetailPage)
app.post('/confirmOrder',userController.conformOrder);
app.get('/buynow',auth.isUserLogout, userController.addressPageGet);

app.post('/createOrder',userController.createPaymentOrder);

app.get('/manageaccount/wallet',auth.isUserLogout, userController.managewalletGetmethod);

app.get('/forgetPassword', auth.isUserLogin,userController.forgetPasswordEnterMail);
app.post('/forgetPasswordUserFind',userController.forgetPasswordUserFind);
app.post('/forgetPassword', userController.forgotPasswordVerifyEmail);

app.get('/loadOTPPage',auth.isUserLogin, userController.loadOtp);
app.post('/loadOTPVerification', userController.OTPVerification);
app.post('/cheakValidOTP', userController.cheakValidOTP);


app.post('/duplicateUser',userController.registerDuplicate)
app.post('/duplicateNumber',userController.duplicateNumber)
app.get('/register',auth.isUserLogin, userController.loadRegister);
app.post('/register', userController.insertUser);


app.get('/logout', userController.logout);

module.exports = app;

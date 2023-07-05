const UserModel = require("../model/userModel")
const mongoose = require('mongoose');
const Razorpay = require('razorpay')
const razorpayInstance = new Razorpay({
    key_id: 'rzp_test_x9w0KDyJ4nuAAj', 
    key_secret: 'cVur1BB3fc8BSDpA9t6zqmU3'
});
const OTPmodel = require("../model/OTPmodel")
const bcrypt = require('bcrypt')
const randomString = require("randomstring")
const userModel = require("../model/userModel")
const configarationOfEmail = require('../config/config')
const nodemailer = require('nodemailer');
const productModel = require("../model/productModel");
const categoryModel = require("../model/categoryModel");
const cartModel = require("../model/cartModel")
const addressModel = require("../model/addressModel")
const orderModel = require('../model/order');
const wishlistModel = require('../model/wishlistModel')
const { ConnectionCheckOutFailedEvent, OrderedBulkOperation, ObjectId } = require("mongodb");
const order = require("../model/order");
const couponModel = require("../model/couponModel");
const wallet = require("../model/wallet");
// const { stringify } = require("qs")
const sendVerifyMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: configarationOfEmail.emailUser,
                password: configarationOfEmail.NewAppPassword
            }
        });
        const mailOptions = {
            from: configarationOfEmail.emailUser,
            to: email,
            subject: "Reset your Password",
            html: `<p>Hi ${name},User requsted for a Password reset...?If Yes...Your OTP For reset password is ${token}`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            } else {
                console.log("email successfully", info.response);
            }
        })

    } catch (error) {
        console.log(error.message)
    }
}
const sendForgetPassword = async (name, email, OTP) => {

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: configarationOfEmail.emailUser,
                pass: configarationOfEmail.NewAppPassword
            }
        });
        const mailOptions = {
            from: configarationOfEmail.emailUser,
            to: email,
            subject: "Reset your Password",
            html: `<p>Hi ${name},User requsted for a Password reset...?<br>If Yes...Your OTP For reset password is ${OTP}`
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error)
            } else {
                console.log("email successfully", info.response);
            }
        })

    } catch (error) {
        console.log(error.message)
    }
}


const countCart = async (userid) => {
            let cartCount = 0;
            if (userid) {
              try {
                const cart = await cartModel.findOne({ userid });
                if (cart && cart.product) {
                  cartCount = cart.product.length;
                }
              } catch (error) {
                console.log('Error retrieving product count:', error);
              }
            }
            return cartCount;
};
const categoryAll = async () => {
    try {
        return allcategory=await categoryModel.find({delete:{$ne:true}})
    } catch (error) {
        console.error(error)
    }
};
    
const securePassword = async (password) => {
    try {
        const passwordHashed = await bcrypt.hash(password, 10)
        return passwordHashed;
    } catch (error) {
        console.log(error.message)
    }
}
const loadlogin = async (req, res) => {
    try {
        res.render("users/login")
        return;
    }
    catch (error) {
        console.log(error.message)
    }
}
const verifyUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const Userfinded = await UserModel.findOne({ email: email })

        if (!Userfinded) {
            req.flash('Unauthorized Login')
            res.render('users/login', { message: 'login failed' });
            return;
        }
        if (Userfinded.block == true) {
            req.flash('title', 'User is unauthorized Contact Admin')
            res.render('users/login', { message: 'User is blocked' })
            return;
        }
        const passwordMatched = await bcrypt.compare(password, Userfinded.password)
        if (!passwordMatched) {
            res.render('users/login', { message: "Email or Password is Incorrect" })
            return;
        }
        if (Userfinded.is_verified === "0") {
            res.render('users/login', { message: "Please verify your Email" })
            return;
        }
        if (Userfinded && passwordMatched) {
            req.session.userId = Userfinded._id;
            req.session.loggedIn = true;
            if (req.session.loggedIn) {
                return res.redirect('/home')
            }
        }
    } catch (error) {
        console.log(error.message)
    }
}
const forgetPasswordEnterMail = async (req, res) => {
    try {
        res.render('users/forgetPasswordPage')
    } catch (error) {
        console.log(error.message)
    }
}
const OTPsaveFunction = async (email, otp) => {
    try {
        const existingOTP = await OTPmodel.findOne({ email });
        if (existingOTP) {
            await OTPmodel.deleteOne({ email });
        }

        const saveOTP = new OTPmodel({
            email: email,
            otp: otp
        });
        const OTPsaved = await saveOTP.save();
        return;
    } catch (error) {
        console.log(error.message);
    }
};
const forgetPasswordUserFind=async(req,res)=>{
    try {
        const {email}=req.body
        console.log(req.body)
        const userfind=await userModel.findOne({email:email})
        console.log(userfind)
        if(userfind){return res.json({exists:true})}
        if(!userfind){return res.json({exists:false})}
    } catch (error){console.log(error)}
}
const forgotPasswordVerifyEmail = async (req, res) => {
    try {
        const emailParsed = req.body.email;
        const userFinded = await userModel.findOne({ email: emailParsed })
        if (!userFinded) {
            res.render('users/forgetPasswordPage', { message: 'Invalid Login credential' })
            return;
        }
        if (userFinded.is_verified === 0) {
            res.render('users/forgetPassword', { message: 'Please verify your email' })
            return;
        } else {
            let OTPgenerated = Math.floor(100000 + Math.random() * 900000);
            sendForgetPassword(userFinded.name, userFinded.email, OTPgenerated);
            const saveOrNot = await OTPsaveFunction(userFinded.email, OTPgenerated)
            const { _id: userId } = userFinded;
            req.session.email = req.body.email;
            res.redirect('/loadOTPPage');
            return;
        }
    } catch (error) {
        console.log(error.message)
    }
}
const loadOtp = async (req, res) => {
    try {
        return res.render("users/OTPPage")
    } catch (error) {
        console.log(error.message)
    }
}
const cheakValidOTP = async (req, res) => {
    try {
        const userEnterOTP =req.body.otp
        const sessionEmail=req.session.email
        const GetUser = await OTPmodel.findOne({ email: sessionEmail });
        if(!GetUser){return res.json({OTP:false})}
        if(GetUser){
            const enterOTP=parseInt(userEnterOTP)
            const databaseOTP= parseInt(GetUser.otp)
            if (enterOTP !== databaseOTP) {
                return res.json({valid:false})
            } 
            if (enterOTP === databaseOTP) {
                return res.json({valid:true,OTP:true})
            } 
        }
    } catch (error) {
        console.log(error.message)
    }
}
const OTPVerification = async (req, res) => {
    try {
        const sessionEmail = req.session.email;
        const password = req.body.password;
        const confirmPassword = req.body.conformPassword;
        const userEnterOTP = parseInt(req.body.OTP)
        const GetUser = await OTPmodel.findOne({ email: sessionEmail });
        if (parseInt(userEnterOTP) !== parseInt(GetUser.otp)) {
            return res.render("users/OTPPage", { OTPmessage: "incorrect OTP" })
        }
        if (password != confirmPassword) {
            return res.render('users/OTPPage', { message: "Conform Password Incorrect" })
        } else {
            const passwordhashed = await securePassword(confirmPassword);
            const filter = { email: sessionEmail };
            const update = { password: passwordhashed };
            // const changePassword = await UserModel.find({ email: sessionEmail }, { $set: { password: passwordhashed } })
            const updatedUser = await UserModel.findOneAndUpdate(filter, update, { new: true });
            return res.redirect('/')
        }

    } catch (error) {
        console.log(error.message)
    }
}
const allProductLoad = async (req, res) => {
    try {
      const ITEMS_PER_PAGE = 6;
      const page = parseInt(req.query.page) || 1;
      const skipItems = (page - 1) * ITEMS_PER_PAGE;
      const totalCount = await productModel.countDocuments();
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
      const allProducts = await productModel.find({ delete: { $ne: true } })
        .skip(skipItems)
        .limit(ITEMS_PER_PAGE)
        .populate('category_id')
        .lean();
  
      // Shuffle the allProducts array
      const allcategory = await categoryAll().then((category) => {
          return category;
        }).catch((error) => {
            console.log(error);
        });
        
        const userid = req.session.userId;
        const cartCount = await countCart(userid).then((count) => {
            return count;
        }).catch((error) => {
            console.log(error);
        });
        
        const shuffledProducts = shuffleArray(allProducts);
      res.render("users/products", {
        cartCount,
        allProducts: shuffledProducts,
        allcategory,
        currentPage: page,
        totalPages
      });
    } catch (error) {
      console.log(error.message);
    }
  };
  
// Function to shuffle an array randomly
function shuffleArray(array) {
    const shuffledArray = array.slice(); // Create a shallow copy of the original array
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
  }

  
const categorySortProduct = async (req, res) => {
    try {
        const categoryId = req.query.categoryid;
                const allcategory=await categoryAll().then((category)=>{
            return category
        }).catch((error)=>{console.log(error)})

        const ITEMS_PER_PAGE = 6;
        const page = parseInt(req.query.page) || 1;
        const skipItems = (page - 1) * ITEMS_PER_PAGE;
        const totalCount = await productModel.countDocuments();
        const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
        const userid=req.session.userId
        let cartCount=await countCart(userid).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
        const allProducts = await productModel.find({ category_id: categoryId }).skip(skipItems)
            .limit(ITEMS_PER_PAGE);

        res.render('users/products', {
            cartCount,
            allProducts: allProducts,
            allcategory: allcategory,
            currentPage: page,
            totalPages: totalPages
        })



    } catch (error) {
        console.log(error.message)
    }
}
const singleProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const productDetails = await productModel.findById(id).populate('category_id').exec()
        const allProducts = await productModel.find({delete:{$ne:true}})
        const userid=req.session.userId
        let cartCount=await countCart(userid).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
                const allcategory=await categoryAll().then((category)=>{
            return category
        }).catch((error)=>{console.log(error)})


        res.render('users/single-product', { cartCount,productDetails, allProducts, allcategory })

    } catch (error) {
        console.log(error.message)
    }
}
const searchProduct = async (req, res) => {
    try {
      const ITEMS_PER_PAGE = 6;
      const page = parseInt(req.query.page) || 1;
      const skipItems = (page - 1) * ITEMS_PER_PAGE;
      const searchTerm = req.query.term;
  
      const totalCount = await productModel.countDocuments({
        $or: [
          { productName: { $regex: searchTerm, $options: 'i' } },
          { productColor: { $regex: searchTerm, $options: 'i' } },
          { productSize: { $regex: searchTerm, $options: 'i' } },
          { productDescription: { $regex: searchTerm, $options: 'i' } }
        ]
      });
  
      const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  
      const allProducts = await productModel
        .find({
          $or: [
            { productName: { $regex: searchTerm, $options: 'i' } },
            { productColor: { $regex: searchTerm, $options: 'i' } },
            { productSize: { $regex: searchTerm, $options: 'i' } },
            { productDescription: { $regex: searchTerm, $options: 'i' } }
          ]
        })
        .skip(skipItems)
        .limit(ITEMS_PER_PAGE)
        .populate('category_id')
        .exec();
  
              const allcategory=await categoryAll().then((category)=>{
            return category
        }).catch((error)=>{console.log(error)})

        ;
      const userid=req.session.userId
      let cartCount=await countCart(userid).then((count)=>{
          return count
      }).catch((error)=>{console.log(error)})
     
      res.render('users/search',{
        allProducts,
        cartCount,
        allcategory: allcategory,
        currentPage: page,
        totalPages: totalPages
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
const cartGetMethod = async (req, res) => {
    try {
        const userId = req.session.userId;
        const allcategory=await categoryModel.find()
        const userCartData = await cartModel.findOne({ userid: userId }).populate("product.product_id").exec()
        let cartCount=await countCart(userId).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
       
        let totalPrice = 0;
        if (userCartData && userCartData.product && userCartData.product.length > 0) {
            for (const cartItem of userCartData.product) {
                const product = cartItem.product_id;
                const productPrice = product.price * cartItem.productQuantity;
                const productStock = product.productQuantity;
                totalPrice += productPrice;
            }
            res.render('users/cart.ejs', { cartCount,userCartData, totalPrice ,allcategory});
        }else{
            return res.render('users/cart.ejs', { cartCount,userCartData:false, totalPrice:0 ,allcategory});
        }

    }
    catch (error) {
        console.log(error.message);
    }
}
const postAddToCart = async (req, res) => {
    try {
        const userID = req.session.userId;
        const { productId } = req.body;
        const cart = await cartModel.findOne({ userid: userID });

        if (cart) {
            const productExists = cart.product.some((product) => product.product_id.toString() === productId);
            if (productExists) {
                return res.json({ message: 'Product already exists in the cart' });
            }
            cart.product.push({ product_id: productId });
            await cart.save();
        } else {
            const newCart = new cartModel({
                product: [{ product_id: productId }],
                userid: userID,
                productQuantity: 1

            });
            await newCart.save();
        }
        res.json({ message: 'Product added to cart' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ message: 'An error occurred while adding the product to cart' });
    }
};
const cheakUserHasAddressornot=async(req,res,next)=>{
    try {
        const id=req.session.userId
        const userAddress=await addressModel.findOne({userid:id})
        if(userAddress){
            next()
            return
        }else{
            return res.redirect("/userAddMoreAddress")

        }
    } catch (error) {
        console.log(error)
    }
}
const createPaymentOrder = async (req, res) => {
    try {
        const userId=req.session.userId;
        const userCartData=await cartModel.findOne({userid:userId}).populate('product.product_id').exec()
        let totalPrice = 0;
        if (userCartData && userCartData.product && userCartData.product.length > 0) {
            for (const cartItem of userCartData.product) {
                const product = cartItem.product_id;
                const productPrice = product.price * cartItem.productQuantity;
                const productStock = product.productQuantity;
                totalPrice += productPrice;
            }
        }
        if(req.body.couponCode){
            let couponUserEntered=req.body.couponCode;
            const coupon=await couponModel.findOne({code:couponUserEntered})
            if(coupon&&totalPrice>coupon.minimumAmount){
                totalPrice=totalPrice-coupon.couponAmount
            }
        }
         const cartdiscount = await cartModel
        .find({ userid:userId })
        .populate({
          path: 'product.product_id',
          populate: {
            path: 'category_id',
            model: 'categoryModel'
          }
        })
        .exec();
       
        let categorydiscount = 0;
        if(cartdiscount){
            cartdiscount.forEach(item => {
                item.product.forEach(product => {
                  const product_id = product.product_id;
                  const category = product.product_id.category_id;
                  if (category && category.CategoryOffer) {
                    categorydiscount += category.CategoryOffer;
                  }
                });
              });
              totalPrice=totalPrice-categorydiscount
        }
        const amount = totalPrice * 100; // Multiply by 100 to convert to paise
        const options = {
            amount: amount,
            currency: 'INR',
            receipt: 'arshithaachu165@gmail.com',
        };

        razorpayInstance.orders.create(options, async (err, order) => {
            if (!err) {
                res.status(200).send({
                    success: true,
                    msg: 'Order Created',
                    order_id: order.id,
                    amount: amount,
                    key_id: 'rzp_test_x9w0KDyJ4nuAAj',
                    name: req.body.name,
                    email: req.body.email,
                    mobile: req.body.phone,
                });
            } else {
                res.status(400).send({ success: false, msg: 'Something went wrong' });
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};
const quantityChanging = async (req, res) => {
    try {

        const { productId, quantity } = req.body;
        const userId = req.session.userId;
        const quantityNumber = parseInt(quantity)
        if (quantityNumber < 1) {
            const filter = { userid: userId };
            const update = { $pull: { product: { _id: productId } } };

            const deleteFromCart = await cartModel.updateOne(filter, update);
            res.send({ redirect: '/cart' });
            return;
        }
        const quantityUpdate = await cartModel.updateOne(
            { userid: userId, 'product._id': productId },
            { $set: { 'product.$.productQuantity': quantity } }
        );
        if (quantityUpdate.modifiedCount === 1) {
            res.send({ redirect: '/cart' });
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Failed to update quantity:', error);
        res.status(500).send('An error occurred while updating the quantity.');
    }
};
const deleteFromCart = async (req, res) => {
        const userId = req.session.userId;
        const productId = req.query.deleteId
        try {
            const cart = await cartModel.updateOne(
              { userid: userId },
              { $pull: { product: { _id: productId } } }
            );
            return res.redirect("/cart")
          } catch (error) {
            console.log(error);
          }
}
const addressPageGet = async (req, res) => {
    try {
        const userid = req.session.userId;
        const allcategory=await categoryModel.find()
        const userAddress = await addressModel.find({ userid: userid });
        let cartCount=await countCart(userid).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
       
        const cart = await cartModel
        .find({ userid })
        .populate({
          path: 'product.product_id',
          populate: {
            path: 'category_id',
            model: 'categoryModel'
          }
        })
        .exec();

        let categorydiscount = 0;
        cart.forEach(item => {
          item.product.forEach(product => {
            const product_id = product.product_id;
            const category = product.product_id.category_id;
            if (category && category.CategoryOffer) {
              categorydiscount += category.CategoryOffer;
            }
          });
        });
        const cartPrice = () => {
            let sum = 0;
            const cartproducts = cart[0].product
            for (var i = 0; i < cartproducts.length; i++) {
                var product = cartproducts[i];
                var price = product.product_id.price * product.productQuantity
                sum += Number(price)
            }
            return sum
        }

        let userWalletAmount=0
        const userwallet = await wallet.findOne({ userId: userid });
        if(userwallet){userWalletAmount = userwallet.totalAmount}

        if (userAddress) {
            let totalCart = cartPrice();
            let totaldiscountcategory=totalCart-categorydiscount
            var encodedBalance = encodeURIComponent(userWalletAmount);
            res.render("users/currentAddress", { cartCount,categorydiscount,cart,address: userAddress, balance: userWalletAmount, totalCart,totaldiscountcategory, userWalletAmount, allcategory });
            return;          
        } else {
            res.render('users/NewUserAddAddress', { message: 'No address please add a Address' })
            return;
        }
    }
    catch (error) {
        console.log('Error:', error);
    }
};
const cheakWalletAmount = async (req, res) => {
    try {
        let cartValue = req.body.totalAmount
        cartValue=parseInt(cartValue)
        const userId = req.session.userId;
        const userWallet = await wallet.findOne({ userId })
        let userTotalAmount = userWallet.totalAmount
        if (userTotalAmount >= cartValue) {
            let userCurrentTotal = userTotalAmount - cartValue;
            userWallet.totalAmount = userCurrentTotal;
            await userWallet.save();
            let responseObj = {
              status: true,
              updatedAmount: userTotalAmount
            };
            res.json(responseObj);
        }else{
            res.json({status:false})
        }
    } catch (error) {
        console.log(error.message)
    }
}
const userProfile = async (req, res) => {
    try {
        const sortPreferance=req.query.sort||"newest"
        const id = req.session.userId;
        const allcategory=await categoryAll().then((category)=>{
        return category
        }).catch((error)=>{console.log(error)})

        let cartCount=await countCart(id).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
       
        const userDetails = await userModel.findOne({ _id: id })
        const cart = await cartModel.findOne({ userid: id })
        
        const orderedProducts = await orderModel.find({ userId: id })
        .populate('address')
        .populate('products.product_id')
        .sort({ createdAt: -1 }) 
        .lean()
        .exec();

        let reversedOrderedProducts;
        if(sortPreferance==='newest'){reversedOrderedProducts = orderedProducts.reverse()}
        else{reversedOrderedProducts = orderedProducts}
      
        data = {
            cartCount,
            allcategory,
            userDetails,
            sortPreference:sortPreferance,
            cart,
            orderedProducts: reversedOrderedProducts,
        }
        res.render("users/userProfile", data)
    }
    catch (error) {
        console.log(error.message)
    }
}
const cancelOrder = async (req, res) => {
    try {
        const userid = req.session.userId;
        const id = req.query.id;
        const filter = { _id: id };
        const update = {
            'cancelled.cancelled': true,
            'cancelled.reason': 'delivery Expected to long',
            'cancelled.dateOfCancel': new Date(),
            status: 'Cancelled By User'
        };
        const deleteorder = await orderModel.findOneAndUpdate(filter, update);
        return res.redirect("/profile")

    } catch (error) {
        console.log(error.message)
    }
}
const orderReturn = async (req, res) => {
    try {
        const id = req.query.id
        const filter = { _id: id }
        const currentDate = new Date();
        const comparison = await orderModel.findById(filter)
        const productDeliveredDate = comparison.delivered.deliveredDate;

        const comparingDate = currentDate.getTime() - productDeliveredDate.getTime()
        const productReturnValidation = Math.floor(comparingDate / (1000 * 60 * 60 * 24))
        if (productReturnValidation < 7) {
            const update = {
                'return.status': true,
                'return.reason': 'Not satisfied with product',
                'return.userRequestDate': currentDate,
                status: "Return Requested"
            }
            const i = await orderModel.findOneAndUpdate(filter, update)
            return res.redirect('/profile')
        }

    } catch (error) {
        console.log(error.message)
    }
}
const cheakReturndate = async (req, res) => {
    try {
        const id = req.body
    } catch (error) {
        console.log(error.message)
    }
}
const cancelReturnOrder = async (req, res) => {
    try {
        const id = req.query.id
        const filter = { _id: id }
        const update = {
            'return.status': false,
            'return.reason': 'User cancelled Return',
            'userCancelledRequestDate': new Date(),
            status: 'Return Cancelled'
        }
        const i = await orderModel.findOneAndUpdate(filter, update)
        res.redirect("/profile")

    } catch (error) {
        console.log(error.message)
    }
}
const orderDetailPage=async(req,res)=>{
    try {
        
    } catch (error) {
        console.error(error)
    }
}
const manageAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        let cartCount=await countCart(userId).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
       
        const address = await addressModel.find({ userid: userId })
                const allcategory=await categoryAll().then((category)=>{
            return category
        }).catch((error)=>{console.log(error)})

        let data = {
            allcategory,
            address
        }
        res.render("users/manageAddress", { cartCount,data, allcategory })
    } catch (error) {
        console.log(error.message)
    }
}
const manageaddressEdit = async (req, res) => {
    try {
        const id = req.query.id
        const address = await addressModel.findById(id)
                const allcategory=await categoryAll().then((category)=>{
            return category
        }).catch((error)=>{console.log(error)})

        const userid=req.session.userId
        let cartCount=await countCart(userid).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
        return res.render('users/usermanageaddressEdit', {cartCount, allcategory, address })
    } catch (error) {
        console.log(error.message)
    }
}
const manageAddressGetAddress = async (req, res) => {
    try {
        res.render('users/userManageAddress', { message: 'Please Give a proper Mobile number' })
        return;
    } catch (error) {
        console.log(error.message)
    }
}
const manageaddressEditPostMethod = async (req, res) => {
    try {
        const { name, id, address, city, landmark, pincode, phoneNo } = req.body
        const addresses = await addressModel.find({ _id: id })
        const filter = { _id: id }
        const update = {
            name,
            address,
            city,
            landmark,
            pincode,
            phoneNo
        }
        const addressupdate = await addressModel.findOneAndUpdate(filter, update)
        return res.redirect('/profile/manageaddress')
    } catch (error) {
        console.log(error.message)
    }
}
const manageCoupon = async (req, res) => {
    try {
        const userid=req.session.userId
        let cartCount=await countCart(userid).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
                const allcategory=await categoryAll().then((category)=>{
            return category
        }).catch((error)=>{console.log(error)})

        const coupon = await couponModel.find()
        return res.render('users/userCoupon', { cartCount,allcategory, coupon })
    } catch (error) {
        console.log(error.message)
    }
}
const wishlistGet = async (req, res) => {
    try {
                const allcategory=await categoryAll().then((category)=>{
            return category
        }).catch((error)=>{console.log(error)})

        const userid=req.session.userId
        let cartCount=await countCart(userid).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
        const userId = req.session.userId;
        const userWishlist = await wishlistModel.findOne({ userId }).populate("product.product_id").exec()
        return res.render("users/wishlist", { cartCount,allcategory, userWishlist })
    } catch (error) {
        console.log(error.message)
    }
}
const wishlistPost = async (req, res) => {
    try {
        const userId = req.session.userId
        const { productId } = req.body
        const filter = { userId }
        const userIs = await wishlistModel.findOne(filter).then((wishlist) => {
            if (!wishlist) {
                const newwishlist = new wishlistModel({
                    userId,
                    product: [{ product_id: productId }]
                })
                return newwishlist.save()
            } else {
                const isProductExist = wishlist.product.some((item) => {
                    return item.product_id.toString() === productId.toString()
                });
                if (!isProductExist) {
                    wishlist.product.push({ product_id: productId })
                    return wishlist.save();
                } else {
                    throw new Error('Product already exists')
                }
            }
        }).then((updatedwishlist) => {
            return res.json({ updatedwishlist })
        }).catch((error) => {
            console.log(error)
        })

    } catch (error) {
        console.log(error.message)
    }
}
const deleteFromWishlist=async(req,res)=>{
    try {
        const {productId}=req.body;
        const userId=req.session.userId;
        if(userId){
            const findWishlist=await wishlistModel.updateOne({userId},{$pull:{product:{product_id:productId}}})
            res.status(200).json({message:'product Deleted'})        
        }else{
            res.status(500).json({message:'Something went wrong'})
        }
    }
     catch (error) {
        console.error(error)
    }
}
const cheakCoupon = async (req, res) => {
    try {
        const userId = req.session.userId
        const userCode = req.body.code;
        const coupon = await couponModel.findOne({ code: { $regex: new RegExp('^' + userCode + '$', 'i') } });
        const currentDate = new Date(); // Get the current date and time
        // const currentDate=date.toISOString();
        if(!coupon){
            return res.json({coupon:false})
        }
        const userCartData = await cartModel.findOne({ userid: userId })
        .populate({
            path: 'product.product_id',
            populate: {
              path: 'category_id',
              model: 'categoryModel'
            }
          })
          
        let totalPrice = 0;
        if (userCartData && userCartData.product && userCartData.product.length > 0) {
            for (const cartItem of userCartData.product) {
                const product = cartItem.product_id;
                const productPrice = product.price * cartItem.productQuantity;
                totalPrice += productPrice;
            }
        }

        const cart = await cartModel
        .find({ userid:userId })
        .populate({
          path: 'product.product_id',
          populate: {
            path: 'category_id',
            model: 'categoryModel'
          }
        })
        .exec();

        let categorydiscount = 0;
        cart.forEach(item => {
          item.product.forEach(product => {
            const product_id = product.product_id;
            const category = product.product_id.category_id;
            if (category && category.CategoryOffer) {
              categorydiscount += category.CategoryOffer;
            }
          });
        });

        let couponApplyDiscount = 0;
        if (userCode == coupon.code && currentDate < coupon.couponExpireDate && totalPrice >= coupon.minimumAmount) {
            couponApplyDiscount = totalPrice - coupon.couponAmount-categorydiscount
        }

        let couponAmounts = coupon.couponAmount
        if (couponApplyDiscount !== 0) {
            res.json({ available: true, couponApplyDiscount: couponApplyDiscount, couponAmounts }); // Coupon is available, send couponApplyDiscount in the response
        } else {
            res.json({ available: false }); // Coupon is not available
        }



    } catch (error) {
        console.log(error.message);
    }
};
const manageAddressAddAddress = async (req, res) => {
    try {
        const { address, name, city, payment, landmark, pincode, phone } = req.body;
        const userid = req.session.userId;
        const newAddress = new addressModel({
            userid: userid,
            name: name,
            address: address,
            city: city,
            landmark: landmark,
            pincode: pincode,
            phoneNo: phone,
            type: payment
        })
        const addressAdded = await newAddress.save()
        res.redirect("/profile/manageaddress")
    } catch (error) {
        console.log(error.message)
    }
}
const profileChangeGetMethod = async (req, res) => {
    try {
        const userId=req.session.userId;
        const userdata=await userModel.findOne({_id:userId})
        res.render("users/profileChange.ejs",{userdata})
    } catch (error) {
        console.log(error.message)
    }
}
const newUserInsertAddress = async (req, res) => {
    try {
        const { address, name, city, payment, landmark, pincode, phone } = req.body;
        const userid = req.session.userId;
        const newAddress = new addressModel({
            userid: userid,
            name: name,
            address: address,
            city: city,
            landmark: landmark,
            pincode: pincode,
            phoneNo: phone,
            type: payment
        })
        const addressAdded = await newAddress.save()
        res.redirect("/address")

    } catch (error) {
        console.log(error.message)
    }
}
const userAddMoreAddressGetMethod = async (req, res) => {
    try {
        res.render('users/userAddMoreAddress', { message: 'Please Give a proper Mobile number' })
        return;
    } catch (error) {
        console.log(error.message)
    }
}
const editaddress=async(req,res)=>{
    try {
        const id = req.query.id
        const address = await addressModel.findById(id)
                const allcategory=await categoryAll().then((category)=>{
            return category
        }).catch((error)=>{console.log(error)})

        const userid=req.session.userId
        let cartCount=await countCart(userid).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
        return res.render('users/addressEditCart', {cartCount, allcategory, address })
    } catch (error) {
        console.log(error.message)
    }
}
const editaddressPost=async(req,res)=>{
    try {
        const { name, id, address, city, landmark, pincode, phoneNo } = req.body
        const addresses = await addressModel.find({ _id: id })
        const filter = { _id: id }
        const update = {
            name,
            address,
            city,
            landmark,
            pincode,
            phoneNo
        }
        const addressupdate = await addressModel.findOneAndUpdate(filter, update)
        return res.redirect('/address')
    } catch (error) {
        console.log(error.message)
    }
}
const userAddMoreAddressPostMethod = async (req, res) => {
    try {
        const { address, name, city, payment, landmark, pincode, phone } = req.body;
        const userid = req.session.userId;
        const newAddress = new addressModel({
            userid: userid,
            name: name,
            address: address,
            city: city,
            landmark: landmark,
            pincode: pincode,
            phoneNo: phone,
            type: payment
        })
        const addressAdded = await newAddress.save()
        res.redirect("/address")
    } catch (error) {
        console.log(error.message)
    }
}
const conformOrder = async (req, res) => {
    try {
        const userId = req.session.userId;
        const { addressForDelivery, payment } = req.body;
        const couponCode = req.body.couponCode || ''
        let couponAvailable;
        var couponAmount = 0;
        let couponApplyDiscount = 0;
        let currentDate = new Date();

        if (couponCode) {
            couponAvailable = await couponModel.findOne({ code: couponCode })
            const userCartData = await cartModel.findOne({ userid: userId }).populate("product.product_id")
            if (userCartData && userCartData.product && userCartData.product.length > 0) {
                for (const cartItem of userCartData.product) {
                    const product = cartItem.product_id;
                    const productPrice = product.price * cartItem.productQuantity;
                    couponApplyDiscount += productPrice;
                }
                let couponValue = couponAvailable.couponAmount;
                let couponMinimumValue = couponAvailable.minimumAmount;
                if(couponApplyDiscount>=couponMinimumValue){
                    couponApplyDiscount = couponApplyDiscount - couponValue
                }else{  
                    couponApplyDiscount = couponApplyDiscount - 0
                }
            }
        }
                const allcategory=await categoryAll().then((category)=>{
            return category
        }).catch((error)=>{console.log(error)})

        ;
        const currentAddress = await addressModel.find({ userid: userId });
        const matchingAddress = currentAddress.find(
            (address) => address._id.toString() === addressForDelivery
        );
        const cart = await cartModel.findOne({ userid: userId });
        const productIdOnly = cart.product.map((i) => i.product_id);
        const productIdAndQuantity = cart.product.map((i) => {
            const productId = i.product_id;
            const productQuantity = i.productQuantity;
            return { productQuantity, productId };
        });
        const productAllDetails = await productModel
            .find({ _id: { $in: productIdOnly } })
            .populate("category_id");
        const totalQuantity = cart.product.reduce(
            (total, product) => total + product.productQuantity,
            0
        );
        const totalAmount = productAllDetails.reduce((total, product) => {
            const productQuantity = productIdAndQuantity.find(
                (item) => item.productId.toString() === product._id.toString()
            ).productQuantity;
            return total + product.price * productQuantity;
        }, 0);
        var expectedDeliveryDate = new Date();
        expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 4);
        let couponCoded=0
        if (couponAvailable) {
            couponAvailable.code
            couponCoded = couponAvailable.code ? couponAvailable.code : "not available"
        }
        const cartdiscount = await cartModel
        .find({ userid:userId })
        .populate({
          path: 'product.product_id',
          populate: {
            path: 'category_id',
            model: 'categoryModel'
          }
        })
        .exec();
       
        let categorydiscount = 0;
        cartdiscount.forEach(item => {
          item.product.forEach(product => {
            const product_id = product.product_id;
            const category = product.product_id.category_id;
            if (category && category.CategoryOffer) {
              categorydiscount += category.CategoryOffer;
            }
          });
        });
        let totalDiscountLastPrice = 0;

        if (couponApplyDiscount && categorydiscount) {
          totalDiscountLastPrice = couponApplyDiscount-categorydiscount; 
        
        } else if (totalAmount && couponApplyDiscount) {
          totalDiscountLastPrice = couponApplyDiscount;
        
        } else if (totalAmount && categorydiscount) {
          totalDiscountLastPrice = totalAmount - categorydiscount;
        
        } else if (totalAmount) {
          totalDiscountLastPrice = totalAmount;
        }
        // Create a newOrder object with the updated orderDate field
        let newOrder = new orderModel({
          userId: userId,
          products: productIdAndQuantity.map((item) => ({
            product_id: item.productId,
            Quantity: item.productQuantity,
          })),
          total: totalDiscountLastPrice,
          totalQuantity: totalQuantity,
          coupon: couponCoded, // Fill this with the coupon value if applicable
          paymentMethod: payment,
          status: "Pending",
          address: matchingAddress._id,
          orderDate: currentDate.toISOString(), // Convert the date to ISO string format
          paymentStatus: payment == "Net Banking" ? "Paid" : "Unpaid",
          orderNumber: generateOrderNumber(),
          expectedDeliveryDate: expectedDeliveryDate,
        });
        const savedOrder = await newOrder.save();
        if(payment=="Wallet"){
            const userwallet=await wallet.findOne({userId})
            const updateInWallet={
            OrderId:savedOrder._id,
            status:"Withdrawal Completed",
            moneyWishdrawal:totalDiscountLastPrice,
            moneyAddedDate:new Date()                
            }
            const userFinalAmount=userwallet.totalAmount-totalDiscountLastPrice
            userwallet.walletWithdrawal.push(updateInWallet)
            userwallet.totalAmount=userFinalAmount
            await userwallet.save()
        }
        const productIds = productIdAndQuantity.map((item) => item.productId);
        const productsToUpdate = await productModel.find({ _id: { $in: productIds } });
        // Update the product stock based on the ordered quantities
        for (let i = 0; i < productsToUpdate.length; i++) {
            const productToUpdate = productsToUpdate[i];

            const orderedQuantity = Number(productIdAndQuantity.find((item) => item.productId.toString() === productToUpdate._id.toString()).productQuantity);

            for (let i = 0; i < productsToUpdate.length; i++) {
                const productToUpdate = productsToUpdate[i];
                const orderedQuantity = Number(productIdAndQuantity.find((item) => item.productId.toString() === productToUpdate._id.toString()).productQuantity);

                if (!isNaN(orderedQuantity) && orderedQuantity > 0) {
                    const currentQuantity = productToUpdate.productQuantity;
                    let updatedQuantity;

                    if (typeof currentQuantity === 'number') {
                        updatedQuantity = currentQuantity - orderedQuantity;
                    } else if (typeof currentQuantity === 'string') {
                        updatedQuantity = Number(currentQuantity) - orderedQuantity;
                    }

                    await productModel.findOneAndUpdate(
                        { _id: productToUpdate._id },
                        { $set: { productQuantity: updatedQuantity.toString() } }
                    );
                }
            }
        }
        if(savedOrder){
            await cartModel.findOneAndUpdate(
            { userid: userId },
            { $pull: { product: { product_id: { $in: productIdOnly } } } }
          );}
        let cartCount=await countCart(userId).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
       
        const data = {
            matchingAddress,
            order: savedOrder,
            totalAmount: totalAmount,
            totalQuantity: totalQuantity,
            allcategory: allcategory,
            products: productAllDetails,
        };
        res.render("users/orderConformation", { cartCount,data });
    } catch (error) {
        console.error(error);
    }
};
// Function to generate the order number
function generateOrderNumber() {
    // Generate a random alphanumeric string for the order number
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let orderNumber = '';
    for (let i = 0; i < 8; i++) {
        orderNumber += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return orderNumber;
}
const buynow = async (req, res) => {
    try {
        const Id = req.query.Id;
    } catch (error) {
        console.log(error.message)
    }
}
const logout = async (req, res) => {
    try {
        req.session.loggedIn = false
        req.session.destroy();
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}
const loadRegister = async (req, res) => {
    try {
        res.render('users/register')
        return;
    } catch (error) {
        console.log(error.message)
    }
}
const registerDuplicate=async(req,res)=>{
    try {
        const {email}=req.body;
        const duplicate=await userModel.findOne({email:email})
        if(duplicate){
            return res.json({exists:true})
        }
        if(!duplicate){
            return res.json({exist:false})
        }
    } catch (error) {
        console.error(error)
    }
}
const duplicateNumber=async(req,res)=>{
    try {
        const {usermobileNumber}=req.body;
        const duplicate=await userModel.findOne({mobile:usermobileNumber})
        if(duplicate){
            return res.json({exists:true})
        }
        if(!duplicate){
            return res.json({exist:false})
        }
    } catch (error) {
        console.error(error)
    }
}
const insertUser = async (req, res) => {
    try {
        const userEmail = req.body.email;
        const userNumber = req.body.mobile;
        const userDuplicate = await userModel.findOne({ email: userEmail })
        const userNumberFind = await userModel.findOne({ mobile: userNumber })
        if (userDuplicate) {
            res.render('users/register', { message: 'User Already Existed' })
        }
        if (userNumberFind) {
            res.render('users/register', { duplicateNumber: "User Mobile Number Already exist" })
        }
        else {
            const {referalCode}=req.body
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let referalCodeHashed = '';
            const length=8;
            for (let i = 0; i < length; i++) {
                referalCodeHashed += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            const securePasscode = await securePassword(req.body.confirmPassword)
            const userDataSaveToDatabase = new userModel({
                name: req.body.name,
                email: userEmail,
                mobile: req.body.mobile,
                password: securePasscode,
                is_admin: 0,
                UniqueCode:referalCodeHashed,
                referredBy:req.body.referalCode||'',
                is_verified: 1
            })
            const userDataSave = await userDataSaveToDatabase.save();
            if(referalCode){
                let newUserId=userDataSave._id

                if(newUserId){
                    const newWallet=new wallet({
                        userId:newUserId,
                        totalAmount:50,
                        wallet:[{
                            User:userDataSaveToDatabase._id,
                            status:"Referal is successfully",
                            moneyAdded:50,
                            moneyAddedDate:new Date()
                        }]})
                        const saveWallet=await newWallet.save()
                }

                const findUser=await userModel.findOne({UniqueCode:referalCode})
                const newUser=await userModel.findById({_id:newUserId})
                if(findUser){
                    const userid=findUser._id
                    const addMoneyToWallet=await wallet.findOne({userId:userid})
                    if(addMoneyToWallet){
                        addMoneyToWallet.totalAmount+=50;
                        const walletStatus={
                            User:userDataSaveToDatabase._id,
                            status:'Referal is SuccessFully',
                            moneyAdded:50,
                            moneyAddedDate:new Date()
                        }
                        addMoneyToWallet.wallet.push(walletStatus)
                        const savewallet=await addMoneyToWallet.save()
                    }else{
                        const newWallet=new wallet({
                            userId:findUser._id,
                            totalAmount:50,
                            wallet:[{
                                User:userDataSaveToDatabase._id,
                                status:"Referal is successfully",
                                moneyAdded:50,
                                moneyAddedDate:new Date()
                            }]})
                            const saveWallet=await newWallet.save()
                    }
                }else{
                    console.log('No user using referal code')
                }
            }else{
                console.log('No referal code')
            }
            res.render('users/login')

        }
    } catch (error) {
        console.log(error.message)
    }
}
const managewalletGetmethod = async (req, res) => {
    try {
        const id = req.session.userId;
                const allcategory=await categoryAll().then((category)=>{
            return category
        }).catch((error)=>{console.log(error)})

        let cartCount=await countCart(id).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
       
        const userWallet = await wallet.findOne({ userId: id }).populate('refunds.orderId').exec();
        if (!userWallet) {
            return res.render("users/wallet", { cartCount,allcategory, wallet: null, totalRefundAmount: null });
        }
        const activeAmount=userWallet.totalAmount;
        return res.render("users/wallet", { cartCount,allcategory, wallet: userWallet,activeAmount, totalRefundAmount:activeAmount });
    } catch (error) {
        console.log(error.message);
    }
}
const loadHome = async (req, res) => {
    try {
        const userid=req.session.userId;
            const allcategory=await categoryAll().then((category)=>{
            return category
        }).catch((error)=>{console.log(error)})


        const coupon = await couponModel.find({})
        const cartCount=await countCart(userid).then((count)=>{
            return count
        }).catch((error)=>{console.log(error)})
        coupon[0]
        res.render("users/index", { allcategory, coupon,cartCount })
    } catch (error) {
        console.log(error.message)
    }
};
const resetOTP = async (req, res) => {
    try {

    } catch (error) {
        console.log(error.message)
    }
}
module.exports = {
    loadlogin,
    verifyUser,
    forgetPasswordUserFind,
    forgetPasswordEnterMail,
    forgotPasswordVerifyEmail,
    loadOtp,
    OTPVerification,
    loadRegister,
    registerDuplicate,
    duplicateNumber,
    insertUser,
    loadHome,
    logout,
    resetOTP,
    cheakValidOTP,
    singleProduct,
    allProductLoad,
    postAddToCart,
    manageaddressEditPostMethod,
    cartGetMethod,
    quantityChanging,
    managewalletGetmethod,
    deleteFromCart,
    addressPageGet,
    newUserInsertAddress,
    cheakUserHasAddressornot,
    userAddMoreAddressGetMethod,
    userAddMoreAddressPostMethod,
    conformOrder,
    orderDetailPage,
    categorySortProduct,
    userProfile,
    wishlistGet,
    wishlistPost,
    cancelOrder,
    orderReturn,
    cheakCoupon,
    cheakReturndate,
    cancelReturnOrder,
    manageAddress,
    editaddressPost,
    manageaddressEdit,
    deleteFromWishlist,
    manageCoupon,
    cheakWalletAmount,
    editaddress,
    manageAddressAddAddress,
    manageAddressGetAddress,
    profileChangeGetMethod,
    createPaymentOrder,
    buynow,
    searchProduct
}
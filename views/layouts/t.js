const Admin=require('../model/adminModel');
const User=require('../model/usersModel');
const Product=require('../model/productModel');
const Category=require('../model/categoryModel');
const nodemailer=require('nodemailer');
const dotenv=require('dotenv').config();
const Order=require('../model/orderModel');
const Coupon=require('../model/couponModel');

const path=require('path');
const sharp=require('sharp');

const ejs=require('ejs');
const pdf=require('html-pdf');
const fs=require('fs');
const { log } = require('console');
// const { response } = require('../routes/adminRoute');

// verify mail
const sendVerifyMail = async (email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.emailUser,
                pass: process.env.emailpassword,
            },
        });
        const port = process.env.PORT;
        const mailOptions = {
            from: process.env.emailUser,
            to: email,
            subject: 'For verification mail',
            html:
          '<p>Hi Admin, please click here to <a href=\'http://127.0.0.1:' + port + '/admin/enterpassword?id=' +
          user_id +
          '\'>verify</a> your mail.</p>',
        };
      
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('mail sent ', info.response);
            }
        });
    } catch (error) {
        return error.message;
    }
};
// matching id and rendering enter password page
const enterpassword=async(req,res)=>{
    try{
        const id=req.query.id;
        res.render('enterpassword',{id:id});
    }catch(error){
        res.render('error', { error: error.message });
    }
};
// Renderin admin login page
const admin=async(req,res)=>{
    try{
        res.render('adminlogin');
    }
    catch(error){
        res.render('error', { error: error.message });
    }
};
// admin login post method
const adminlogin=async(req,res)=>{
    try{
        const key=req.body.key;
        const adminData=await Admin.findOne({key:key});
        if(adminData){
            req.session.admin= adminData._id;
            res.redirect('/admin/adminhome');
        }
        else{
            res.render('adminlogin',{message:'Invalid admin key'});
        }
    }catch(error){
        res.render('error', { error: error.message });
    }
};
// Rendering admin dashboard
const adminhome=async(req,res)=>{
    try{

      
        const orderStatus = await Order.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);
        const order=await Order.find({}).countDocuments();
        const user=await User.find({}).countDocuments();
        const product=await Product.find({}).countDocuments();
        const orderdata=await Order.find({});
        let orderDetails;
        let total=0;  

        orderDetails = orderdata.map(ord => {
          total += ord.totalamount;})


        const returnCount = await Order.countDocuments({ 'return.status': true });

        res.render('adminhome',{orderData:orderStatus,returnCount,ordercount:order,
            usercount:user,productcount:product,totalsales:total});
    }
    catch(error){
        res.render('error', { error: error.message });
    }
};
// logout post session destroy
const adminlogout=async(req,res)=>{
    try{
        req.session.destroy();
        res.redirect('/admin');
    }
    catch(error){
        res.render('error', { error: error.message });
    }
};
// rendering forgotpass page
const forget = async (req, res) => {
    try {
        res.render('forgetpass');
    } catch (error) {
        res.render('error', { error: error.message });
    }
};
// send conformation mail
const sendMail=async(req,res)=>{
    try{
        const email=req.body.email;
        const data=await Admin.findOne({email:email}); 
        if (data) {
            sendVerifyMail(req.body.email, data._id);
            res.render('forgetpass', { message: 'Please check your mail for reset password ' });
        } else {
            res.render('forgetpass', { message: 'registration failed' });
        }
    }
    catch (error) {
        
        res.render('error', { error: error.message });
    } 
};
// reset password page
const resetpassword=async(req,res)=>{
    try{
       
        const admin_id=req.body.id;
        const updated= await Admin.updateOne({_id:admin_id},{$set:{key:req.body.password}});
        if(updated){
            res.redirect('/admin');
        }
        else{
            res.render('enterpassword',{message:'something went wrong cant reset password'});
        }
    }catch(error){
        
        res.render('error', { error: error.message });
    }
};
//list users
const userlist=async(req,res)=>{
    try{
        const userList=await User.find({});
        if(userList.length>0){
        res.render('userlist',{users:userList});
        }else{
            res.render('userlist',{users:"",message:"No users to display"});   
        }
    }catch(error){
        res.render('error', { error: error.message });
    }
};
// blocking user
const blockuser=async(req,res)=>{
    try{
        const id=req.query.id;
        await User.updateOne({_id:id},{$set:{is_blocked:1}});
        res.redirect('/admin/userlist');
    }catch(error)
    {
        res.render('error', { error: error.message });
    }
};
// unblocking user 
const unblockuser=async(req,res)=>{
    try{
        const id=req.query.id;
        await User.updateOne({_id:id},{$set:{is_blocked:0}});
        res.redirect('/admin/userlist');
    }catch(error)
    {
        res.render('error', { error: error.message });
    }
};
// view addproducts form 
const addproducts=async(req,res)=>{

    try{
        const category=await Category.find({});
        let error=req.session.errorFileUpload;
        req.session.errorFileUpload=null;
        res.render('addproduct',{category:category,error:error});
    }catch(error){
        res.render('error', { error: error.message });
    }
};
// add products post 
const addproductspost=async(req,res)=>{
    if(req.isFileValid) {
       
        try {    
               const product = new Product({
                name: req.body.name,
                brand: req.body.brand,
                category: req.body.categoryid,
                stock:req.body.quantity,
                price:req.body.price,
                description:req.body.description,
                offer:req.body.offer,
            });
            const croppedImages = [];
            for (let file of req.files) {
            const croppedImage = `cropped_${file.filename}`;

            await sharp(file.path)
                .resize(500, 600, { fit: "cover" })
                .toFile(`./public/images/product/${croppedImage}`);

            croppedImages.push(croppedImage);
            }

            product.image=croppedImages
            const data = await product.save();
            if (data) {
                res.redirect('/admin/products');
            } else {
                res.render('addproduct', { messages: 'failed to add product' });
            }
          }
        catch (error) {
          res.render('error', { error:error.message });
           } 
        }
     else {
  
        res.redirect('/admin/addproducts',{message:'file is not valid'});
    }

};

// view product list page  
const product=async(req,res)=>{
    try{
        const category=await Category.find({});  
        const product=await Product.find({}).populate('category');
    
        if(product.length>0){
           
            res.render('products',{product:product,category:category});
        }
        else{
            res.render('products',{product:"",message:'There is no product to display'});
        }
    }catch(error){
    
        res.render('error', { error: error.message });
    }
};
// delete product set avilability none
const deleteproduct= async(req,res)=>{
    try{
        const id=req.query.id;
        await Product.updateOne({_id:id},{$set:{is_delete:1}});
        res.redirect('/admin/products');
    }catch(error){
        res.render('error', { error: error.message });
    }
};
// undo delete product
const makeavailable= async(req,res)=>{
    try{
        const id=req.query.id;
        await Product.updateOne({_id:id},{$set:{is_delete:0}});
        res.redirect('/admin/products');
    }catch(error){
        res.render('error', { error: error.message });
    }
};
// edit product get page
const editproduct=async(req,res)=>{
    try{
        const id=req.query.id;
        const product=await Product.findOne({_id:id});
        const category=await Category.findOne({_id:product.category[0]._id});
        const allCategories= await Category.find({});
        if(product){
            const error = req.session.errorFileUpload;
            req.session.errorFileUpload = null;
             
            const encodedcat=encodeURIComponent(JSON.stringify(allCategories));
               
            res.render('editproduct',{product:product,category:category,allCategories:allCategories,encodedcat:encodedcat,error:error});
        }
    }catch(error){
        res.render('error', { error: error.message });
    }
};
// update product 
const updateproducts = async (req, res) => {
    try {
        if(req.session.errorFileUpload){
    
            res.redirect('/admin/editproduct');
        
        }else{ 
            let arr = [];
            // Check if new images are uploaded
            if (req.files && req.files.length > 0) {
                // New images are selected, update with new image filenames
                for (let i = 0; i < req.files.length; i++) {
                    arr[i] = req.files[i].filename;
                }
            } else {
                // No new images selected, keep the existing image filenames
                const existingProduct = await Product.findById(req.body.id);
                arr = existingProduct.image;
            }
      
            const product = await Product.updateOne(
                { _id: req.body.id },
                {
                    name: req.body.name,
                    brand: req.body.brand,
                    category: req.body.category,
                    stock: req.body.quantity,
                    description:req.body.description,
                    price: req.body.price,
                    offer:req.body.offer,
                    image: arr,
                }
            );
  
            if (product) {
                setTimeout(()=>{
                    res.redirect('/admin/products');
                },1000);
        
            } else {
                res.render('editproduct', { messages: 'Failed to update product' });
            }
        }
    } catch (error) {
        res.render('error', { error: error.message });
    }
};
// list category
const category=async(req,res)=>{
    try{
        const product=await Category.find({});
        if(product.length>0){
        res.render('category',{product:product});
        }
        else{
            res.render('category',{product:"",message:"No items to display"});  
        }
    }catch(error){
        res.render('error', { error: error.message });
    }
};
// add category form 
const addcategory=async(req,res)=>{
    try{
        res.render('addcategory');
    }catch(error){
        res.render('error', { error: error.message });
    }
};
// add category post
const addcategorypost=async(req,res)=>{
    try {
        const name = req.body.name;

        const category = await Category.findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } });
        
        if (category) {
            res.render('addcategory', { messages: 'Category already exsist' });
        } else { 
            const categ = new Category({
                name: req.body.name,
                image: req.file.filename,
            });
            const data = await categ.save();
            if (data) {
                res.redirect('/admin/category');
            } else {
                res.render('addcategory', { messages: 'Error occur in adding' });
            }
        }
    } catch (error) {
        res.render('error', { error: error.message });
    } 
};
//  delete category
const deletecategory= async(req,res)=>{
    try{
        const id=req.query.id;
        await Category.deleteOne({_id:id});
        res.redirect('/admin/category');
    }catch(error){
        
        res.render('error', { error: error.message });
    }
};
// edit category
const editcategory=async(req,res)=>{
    try{
        const id=req.query.id;
        const category=await Category.findOne({_id:id});
        if(product){
            res.render('editcategory',{category:category});
        }
    }catch(error){
      
        res.render('error', { error: error.message });
    }
};
// updaate category
const updatecategory=async(req,res)=>{
    try {
        let img;
        if (req.file) {
            // New images are selected, update with new image filenames
            img = req.file.filename;
          
        } else {
            // No new images selected, keep the existing image filenames
            const existingProduct = await Category.findById(req.body.id);
            img = existingProduct.image;
        }
        const categ = await Category.updateOne({_id:req.body.id},{
            name: req.body.name,
            offer:req.body.offer,
            image: img,
        });
        
        if (categ) {
            setTimeout(()=>{
                res.redirect('/admin/category');
            },1000);}
        else {
            res.render('editcategory', { messages: 'Error occur in editing' });
        }
    }
    catch (error) {
        res.render('error', { error: error.message });
    } 
};
// orders list
const orders = async (req, res) => {
    try {
        const orderdata = await Order.find({});
    
        if (orderdata.length > 0) {
            const orderDetails = orderdata.map(ord => {
                const orderDate = new Date(ord.orderdate); // Convert orderdate to a Date object
                const year = orderDate.getFullYear();
                const month = orderDate.getMonth() + 1;
                const date = orderDate.getDate();
        
                return {
                    orderid: ord._id,
                    name: ord.address[0].name,
                    phone: ord.address[0].phone,
                    totalamount: ord.totalamount,
                    status: ord.status,
                    payment: ord.paymentmethod,
                    orderdate: `${date}/${month}/${year}`,
                    delivereddate: ord.delivereddate,
                    return:ord.return.status
                };
            });
            res.render('orders', { orderdetails: orderDetails });
        } else {
            res.render('orders', { message: 'No orders',orderdetails:'' });
        }
    } catch (error) {
        res.render('error', { error: error.message });
    }
};
// order detatils
const orderdetails=async(req,res)=>{
    try{
        let orderid=req.query.orderId;
        let order=await Order.findOne({_id:orderid}).populate('items.product');
        if(order){
            let products= order.items.map(item=>{
                return{
                    image:item.product.image[0],
                    name:item.product.name,
                    price:item.product.price,
                    brand:item.product.brand,
                    quantity:item.quantity
                };
      
            });
            res.render('orderdetails',{orderid:orderid, order:order,address:order.address[0],products:products});
        }
    }
    catch(error){
        res.render('error', { error: error.message });
    }
};
// update order status
const updateorderstatus=async(req,res)=>{
    try{
        const orderid=req.body.orderID;
        const status=req.body.status;
        let order;
        if(status==='Delivered'){
            order=await Order.updateOne({_id:orderid},{$set:{status:status,delivereddate:Date.now()}});
        }
        else{
            order=await Order.updateOne({_id:orderid},{$set:{status:status}});
        }
        if(order){
            res.send({isOk: true, message: ''});
        }else{
            res.send({isOk:false, message: 'error'});
        }
    }catch(error)
    {
        res.render('error', { error: error.message });
    }
};
// delete image
const deleteimage=async(req,res)=>{
    try {
        const productId = req.query.id;
        const imageIndex = req.query.index;

        // Find the product by ID
        const product = await Product.findById(productId);

        if (product) {
            product.image.splice(imageIndex, 1);

            // Save the updated product
            const updatedProduct = await product.save();

            if (updatedProduct) {
                // Redirect to the product details page or any other appropriate route
                res.redirect(`/admin/editproduct?id=${productId}`);
            } else {
                res.render('admin/editproduct', { messages: 'Failed to delete image' });
            }
        }
    }

    catch(error){
       
        res.render('error',{message:error.message});
    }
};
// coupon render page
const coupon=async(req,res)=>{
    try{
        const coupon=await Coupon.find({});
        let couponDetails;
        if(coupon.length>0){
            couponDetails=coupon.map(coup=>{
                const couponDate = new Date(coup.date); // Convert date to a Date object
                const year = couponDate.getFullYear();
                const month = couponDate.getMonth() + 1;
                const date = couponDate.getDate();
                return {
                    date:`${date}/${month}/${year}`,
                };
            });
        }
        if(req.session.updated){
            var message=req.session.updated;
            req.session.updated='';
        }
      
       if(coupon.length>0){
        res.render('coupon',{coupon:coupon,message,date:couponDetails});
       }else{
        res.render('coupon',{coupon:"",messageempty:"There is no coupons",date:""});
       }
    }catch(error){
        res.render('error', { error: error.message });
    }
};
// coupon uodate changes
const editcoupon=async(req,res)=>{
    try{
        const couponId=req.body.couponid;
        const coupon=await Coupon.findByIdAndUpdate(
            couponId,{code:req.body.editCouponCode,offer:req.body.editCouponOffer,
                price:req.body.editCouponPrice,date:req.body.editCouponDate});
       
        if(coupon){
            req.session.updated='Coupon Updated successfully';
        }

        res.redirect('/admin/coupon');
    }catch(error){
        res.render('error', { error: error.message });
    }
};
// add coupon code
const addcoupon=async(req,res)=>{
    try{
        const coupon=await Coupon.insertMany(
            {code:req.body.code,offer:req.body.offer,
                price:req.body.price,date:req.body.date});
    
        if(coupon){
            
            req.session.updated='Coupon Added Successfully';
        }

        res.redirect('/admin/coupon');
    }catch(error){
       
        res.render('error', { error: error.message });
    }
};



// Display salesreport
const salesreport = async (req, res) => {
    try {
        
        const orderdata=await Order.find({});
        let orderDetails;
        let total=0;  

        orderDetails = orderdata.map(ord => {
          total += ord.totalamount;
  
          const orderDate = new Date(ord.orderdate);
          const year = orderDate.getFullYear();
          const month = orderDate.getMonth() + 1;
          const date = orderDate.getDate();
  
          return {
            orderid: ord._id,
            name: ord.address[0].name,
            phone: ord.address[0].phone,
            totalamount: ord.totalamount,
            status: ord.status,
            payment: ord.paymentmethod,
            orderdate: `${date}/${month}/${year}`,
            delivereddate: ord.delivereddate,
            return: ord.return.status
          };
        });
  
        if (orderDetails.length > 0) {
          res.render('salesreport', { orders: orderDetails, totalAmount: total });
        } else {
          res.render('salesreport', { message: 'No orders',orders: "", totalAmount: total });
        }
      }
     catch (error) {
      res.render('error', { error: error.message });
    }
}
  
// report according to current day

const todayssales=async(req,res)=>{
    try{
        let orderdata = await Order.find({});
        let orderDetails = [];
        let total = 0;
        const date = new Date();
        const dateonly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        orderDetails = orderdata.map(ord => {
          const orderDateOnly = new Date(ord.orderdate.getFullYear(), ord.orderdate.getMonth(), ord.orderdate.getDate());

          if (dateonly.getTime() === orderDateOnly.getTime()) {
          
             
             total += ord.totalamount;
            const orderDate = new Date(ord.orderdate);
            const year = orderDate.getFullYear();
            const month = orderDate.getMonth() + 1;
            const date = orderDate.getDate();
  
            return {
                orderid: ord._id,
            name: ord.address[0].name,
            phone: ord.address[0].phone,
            totalamount: ord.totalamount,
            status: ord.status,
            payment: ord.paymentmethod,
            orderdate: `${date}/${month}/${year}`,
            delivereddate: ord.delivereddate,
            return: ord.return.status
            };
          }
        });
        orderDetails = orderDetails.filter(ord => ord !== undefined);
        
        if (orderDetails.length > 0) {
            res.render('salesreport', { orders: orderDetails, totalAmount: total });
          } else {
            res.render('salesreport', { message: 'No orders',orders: "", totalAmount: total });
          }
    
}
catch(error){
    res.render('error',{error:error.message});
 }
}

// report according to current week
const currentweeksales=async(req,res)=>{
    try{
        let orderdata = await Order.find({});
        let orderDetails = [];
        let total = 0;
        const date = new Date();
        const previousWeekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7);
        const previousWeekEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate()+1 );
        
        orderDetails = orderdata.map(ord => {
            const orderDate = new Date(ord.orderdate.getFullYear(), ord.orderdate.getMonth(), ord.orderdate.getDate());
            if (orderDate >= previousWeekStart && orderDate <= previousWeekEnd){
             total += ord.totalamount;
            const orderDate = new Date(ord.orderdate);
            const year = orderDate.getFullYear();
            const month = orderDate.getMonth() + 1;
            const date = orderDate.getDate();
  
            return {
                orderid: ord._id,
            name: ord.address[0].name,
            phone: ord.address[0].phone,
            totalamount: ord.totalamount,
            status: ord.status,
            payment: ord.paymentmethod,
            orderdate: `${date}/${month}/${year}`,
            delivereddate: ord.delivereddate,
            return: ord.return.status
            };
        }
        });
        orderDetails = orderDetails.filter(ord => ord !== undefined);
        if (orderDetails.length > 0) {
            res.render('salesreport', { orders: orderDetails, totalAmount: total });
          } else {
            res.render('salesreport', { message: 'No orders',orders:"", totalAmount: total });
          }
    
}
catch(error){
    res.render('error',{error:error.message});
 }
}

// report according to current month
const currentmonthsales = async (req, res) => {
    try {
      const orderdata = await Order.find({});
      let orderDetails = [];
      let total = 0;
      const date = new Date();
      const currentMonth = date.getMonth();
   
      orderDetails = orderdata.map(ord => {
        const orderMonth = new Date(ord.orderdate).getMonth();
        if (currentMonth === orderMonth) {
          total += ord.totalamount;
          const orderDate = new Date(ord.orderdate);
          const year = orderDate.getFullYear();
          const month = orderDate.getMonth() + 1;
          const day = orderDate.getDate();
  
          return {
            orderid: ord._id,
            name: ord.address[0].name,
            phone: ord.address[0].phone,
            totalamount: ord.totalamount,
            status: ord.status,
            payment: ord.paymentmethod,
            orderdate: `${day}/${month}/${year}`,
            delivereddate: ord.delivereddate,
            return: ord.return.status
          };
        }
      });
  
      orderDetails = orderDetails.filter(ord => ord !== undefined);
  
      if (orderDetails.length > 0) {
        res.render('salesreport', { orders: orderDetails, totalAmount: total });
      } else {
        res.render('salesreport', { message: 'No orders', orders: '', totalAmount: total });
      }
    } catch (error) {
      res.render('error', { error: error.message });
    }
  };
  
 // report according to current year
const currentyearsales = async (req, res) => {
    try {
      const orderdata = await Order.find({});
      let orderDetails = [];
      let total = 0;
      const date = new Date();
      const currentYear = date.getFullYear();
     
      orderDetails = orderdata.map(ord => {
        const orderYear = new Date(ord.orderdate).getFullYear();
        
        if (currentYear === orderYear) {
          total += ord.totalamount;
          const orderDate = new Date(ord.orderdate);
          const year = orderDate.getFullYear();
          const month = orderDate.getMonth() + 1;
          const day = orderDate.getDate();
  
          return {
            orderid: ord._id,
            name: ord.address[0].name,
            phone: ord.address[0].phone,
            totalamount: ord.totalamount,
            status: ord.status,
            payment: ord.paymentmethod,
            orderdate: `${day}/${month}/${year}`,
            delivereddate: ord.delivereddate,
            return: ord.return.status
          };
        }
      });
  
      orderDetails = orderDetails.filter(ord => ord !== undefined);
  
      if (orderDetails.length > 0) {
        res.render('salesreport', { orders: orderDetails, totalAmount: total });
      } else {
        res.render('salesreport', { message: 'No orders', orders: '', totalAmount: total });
      }
    } catch (error) {
      res.render('error', { error: error.message });
    }
  };

// report according to specified date  
  
const saleswithdate = async (req, res) => {
    try {
      const orderdata = await Order.find({});
      let orderDetails = [];
      let total = 0;
      const fromdate = new Date(req.body.fromDate);
      const todate = new Date(req.body.toDate);
  
      orderDetails = orderdata.map(ord => {
        const orderdatematch = new Date(ord.orderdate);
  
        if (orderdatematch <= todate && orderdatematch >= fromdate) {
          total += ord.totalamount;
          const orderDate = new Date(ord.orderdate);
          const year = orderDate.getFullYear();
          const month = orderDate.getMonth() + 1;
          const day = orderDate.getDate();
  
          return {
            orderid: ord._id,
            name: ord.address[0].name,
            phone: ord.address[0].phone,
            totalamount: ord.totalamount,
            status: ord.status,
            payment: ord.paymentmethod,
            orderdate: `${day}/${month}/${year}`,
            delivereddate: ord.delivereddate,
            return: ord.return.status
          };
        }
      });
  
      orderDetails = orderDetails.filter(ord => ord !== undefined);
  
      if (orderDetails.length > 0) {
        res.render('salesreport', { orders: orderDetails, totalAmount: total });
      } else {
        res.render('salesreport', { message: 'No orders', orders: '', totalAmount: total });
      }
    } catch (error) {
      res.render('error', { error: error.message });
    }
  };
   

// error page rendering
const errorpage=async(req,res)=>{
    try{
        res.render('error');
    }catch(error){
        console.log(error.message);
    }
};

// unmatch root
const unmatch=async(req, res) => {
    res.redirect('/admin');
  }

//sales report convet pdf

const salespdf = async (req, res) => {
    try {
      const orderdata = await Order.find({});
      let total = 0;
      let orders = orderdata.map(ord => {
        total += ord.totalamount;
  
        const orderDate = new Date(ord.orderdate);
        const year = orderDate.getFullYear();
        const month = orderDate.getMonth() + 1;
        const date = orderDate.getDate();
  
        return {
          orderid: ord._id,
          name: ord.address[0].name,
          phone: ord.address[0].phone,
          totalamount: ord.totalamount,
          status: ord.status,
          payment: ord.paymentmethod,
          orderdate: `${date}/${month}/${year}`,
          delivereddate: ord.delivereddate,
          return: ord.return.status
        };
      });
  
      const data = {
        orders: orders,
        total: total
      };
  
      const filePathName = path.resolve(__dirname, '../views/admin/salespdf.ejs');
      const htmlString = fs.readFileSync(filePathName).toString();
      const option = {
        format: 'A3',
        orientation:"portrait",
        border:"10mm"
      };
  
      const ejsData = ejs.render(htmlString, data);
      pdf.create(ejsData, option).toFile('sales.pdf', (err, response) => {
        if (err) {
            return res.status(500).send(err)
        } 
        else {
            const filePath =path.resolve(__dirname,'../sales.pdf');
            fs.readFile(filePath,(err,file)=>{
                if(err){
                   return res.status(500).send(err)
                }
                res.setHeader('Content-Type','application/pdf');
                res.setHeader('Content-Disposition','attachment;filename="sales.pdf"');

                res.send(file);
            })
        }
      });
    } catch (error) {
      res.render('error', { error: error.message });
    }
  };
  
  

module.exports={
    //unmatch
    unmatch,
    //admin
    admin,adminlogin,
    adminhome,adminlogout,
    forget,sendMail,
    enterpassword,resetpassword,
    //users
    userlist ,blockuser ,unblockuser,
    //products
    addproducts,addproductspost,
    product,
    deleteproduct,makeavailable,
    editproduct,updateproducts,
    //category
    category,addcategory,addcategorypost,
    deletecategory,editcategory, updatecategory,
    //orders
    orders,orderdetails,updateorderstatus,errorpage,deleteimage,
    //coupon
    coupon,editcoupon,addcoupon,

    //salesreport
    salesreport,todayssales,currentweeksales,currentmonthsales,currentyearsales,saleswithdate,
    salespdf
}; 
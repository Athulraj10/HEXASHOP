const mongoose = require('mongoose');
const UserModel = require("../model/userModel")
const bcrypt = require('bcrypt')
const product = require('../model/productModel')
const category = require('../model/categoryModel');
const userModel = require("../model/userModel");
const categoryModel = require("../model/categoryModel");
const productModel = require("../model/productModel");
const orders = require('../model/order');
const couponModel = require('../model/couponModel');
const wallet = require('../model/wallet');
const order = require('../model/order');
const sharp=require('sharp')
const PdfPrinter=require('pdfmake')
const exceljs=require('exceljs')

const fs=require('fs')
// const path=require('path');


const loadLogin = async (req, res) => {
  try {
    res.render("adminLogin")
    return
  } catch (error) {
    console.log(error.message)
  }
}
const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminFinded = await UserModel.findOne({ email: email })
    if (!adminFinded || adminFinded.is_admin == 0) {
      res.render('adminLogin', { message: 'Admin not Found' });
      return;
    }
    const passwordMatched = await bcrypt.compare(password, adminFinded.password)
    if (!passwordMatched) {
      res.render('adminLogin', { message: "Invalid login" })
      return;
    }
    if (adminFinded.is_admin == 1) {
      req.session.admin_id = adminFinded._id;
      req.session.adminloggedIn=true;
      res.redirect("/admin/adminHome")
      return;
    }
  } catch (error) {
    console.log(error.message)
  }
}
const userBlock = async (req, res) => {
  try {
    const { userId, blockStatus } = req.body;
    // Update the user's block status in the database
    const user = await userModel.findById(userId);
    //   user.
    user.block = blockStatus === '1' ? false : true;
    await user.save();
    // Send the updated user data as the response
    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
const adminHome = async (req, res) => {
  const adminId = req.session.admin_id;
  const adminFinded = await UserModel.findById(adminId)
  const allOrder = await orders.find()
    .populate({ path: "userId", model: "User" })
    .populate({ path: "address", model: "addres" })
    .populate({ path: "products.product_id", model: "productModel" })
    .exec();
  let email = "admin@gmail.com"

  const AllUsers = await UserModel.find({ is_admin: 0 })
  const totalOrders = allOrder.reduce((total, order) => total + order.totalQuantity, 0);
  const pendingOrders = allOrder.filter(order => order.status === "Pending");
  const allOrderDetails=[...allOrder]
  const deliveredOrders = allOrder.filter(order => order.status === "Delivered");
  const cancelledOrders = allOrder.filter(order => order.cancelled.cancelled === true);
  const returnedOrder = allOrder.filter(order => order.return.admin === true)
  const pendingOrdersAprovel = allOrder.filter(order => order.status === "Pending");
  const totalCod = allOrder.filter(order => order.paymentMethod === 'cashOnDelivery')
  const paypalTotal = allOrder.filter(order => order.paymentMethod === 'Net Banking')
  const walletTotal = allOrder.filter(order => order.paymentMethod == 'Wallet')
  const totalOrderAmount = allOrder.reduce((sum, pointer) => {
    return sum + pointer.total;
  }, 0)

  function getTimeElapsed(date) {
    const now = new Date();
    const diff = Math.abs(now - date);
  
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
  
    if (years > 0) {
      return years === 1 ? "1 year ago" : `${years} years ago`;
    } else if (months > 0) {
      return months === 1 ? "1 month ago" : `${months} months ago`;
    } else if (days > 0) {
      return days === 1 ? "1 day ago" : `${days} days ago`;
    } else if (hours > 0) {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    } else {
      return minutes <= 1 ? "just now" : `${minutes} minutes ago`;
    }
  }
  // // DATES
  function getLastOrderDetails(orders) {
    const sortedOrders = orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    const lastOrder = sortedOrders[0];
    const lastOrderDate = lastOrder ? lastOrder.orderDate : null;
    const lastOrderDateAgo = lastOrder ? getTimeElapsed(new Date(lastOrder.orderDate)) : null;
    return { lastOrderDate, lastOrderDateAgo };
  }
  
  function formatDate(date) {
    return date ? date.toLocaleString([], { timeZone: "UTC" }) : null;
  }
  
  let pendingOrderDetails = getLastOrderDetails(pendingOrders);
  let deliveredOrderDetails = getLastOrderDetails(deliveredOrders);
  let cancelledOrderDetails = getLastOrderDetails(cancelledOrders);
  let totalReturnOrderDetails = getLastOrderDetails(returnedOrder);
  let lastPaypalPaymentDetails = getLastOrderDetails(paypalTotal);
  let lastReturnOrderDetails = getLastOrderDetails(returnedOrder)
  let lastCodPaymentDetails = getLastOrderDetails(totalCod);
  let lastWalletPaymentDetails = getLastOrderDetails(walletTotal);
  let lastOrderDetails = getLastOrderDetails(allOrderDetails);
  
  // DATES
  let OrderlastorderDate = formatDate(lastOrderDetails.lastOrderDate);
  let OrderlastorderTimeAgo =  lastOrderDetails.lastOrderDateAgo;
  let returnOrderlastorderDate = formatDate(lastReturnOrderDetails.lastOrderDate);
  let returnOrderlastorderTimeAgo = lastReturnOrderDetails.lastOrderDateAgo;
  let pendingOrderlastorderDate = formatDate(pendingOrderDetails.lastOrderDate);
  let pendingOrderlastorderTimeAgo = pendingOrderDetails.lastOrderDateAgo;
  let deliveredrecentOrderDate = formatDate(deliveredOrderDetails.lastOrderDate);
  let deliveredrecentOrderTimeAgo = deliveredOrderDetails.lastOrderDateAgo;
  let cancelledOrderLastDate = formatDate(cancelledOrderDetails.lastOrderDate);
  let cancelledOrderLastTimeAgo = cancelledOrderDetails.lastOrderDateAgo;
  let totalReturnOrderLastSortDate = formatDate(totalReturnOrderDetails.lastOrderDate);
  let totalReturnOrderLastSortDateAgo = totalReturnOrderDetails.lastOrderDateAgo;
  
  // Paypal
  let lastdatePaypalPayment = lastPaypalPaymentDetails.lastOrderDate;
  let lastDatePaypalPayment = formatDate(lastdatePaypalPayment);
  let lastdatePaypalPaymentDateAgo = lastPaypalPaymentDetails.lastOrderDateAgo;
  
  // CashOnDelivery
  let lastdateCodPayment = lastCodPaymentDetails.lastOrderDate;
  let lastDateCodPayment = formatDate(lastdateCodPayment);
  let lastDateCodPaymentDateAgo = lastCodPaymentDetails.lastOrderDateAgo;
  
  // Wallet
  let lastdateWalletPayment = lastWalletPaymentDetails.lastOrderDate;
  let lastDateWalletPayment = formatDate(lastdateWalletPayment);
  let lastDateWalletPaymentDateAgo = lastWalletPaymentDetails.lastOrderDateAgo;
  

  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 1);
  var previousDay = currentDate.getDate();
  var previousMonth = currentDate.getMonth() + 1;
  var previousYear = currentDate.getFullYear();
  var previousMonth = currentDate.getMonth();
  var previousMonthDate = new Date(currentDate.getFullYear(), previousMonth, 0);

  var formattedPreviousDate = previousYear + '-' + (previousMonth < 10 ? '0' + previousMonth : previousMonth) + '-' + (previousDay < 10 ? '0' + previousDay : previousDay);

  var currentDates = new Date();

  var previousMonths = currentDates.getMonth();
  var previousMonthDates = new Date(currentDates.getFullYear(), previousMonths, 1);
  var formattedPreviousDates = previousMonthDates.toISOString()

  const totalSaleMonth = await order.aggregate([
    {
      $match: {
        $and: [{ "delivered.deliveredDate": { $gte: new Date(formattedPreviousDates), $lte: new Date() } },
        { "delivered.status": true }
        ]
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$delivered.deliveredDate" } },
        totalSaleAmount: { $sum: { $multiply: ["$total", "$totalQuantity"] } },
        averageQuantity: { $avg: "$totalQuantity" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalSaleAmount: -1 }
    }
  ]);
  let dateStartingFrom = ""; // Default value
  if (totalSaleMonth.length > 0) {
    dateStartingFrom = totalSaleMonth[totalSaleMonth.length - 1]._id;
  }
  const totalSaleAmountsMonthly = totalSaleMonth.reduce((sum, pointer) => sum + pointer.totalSaleAmount, 0)
  const yesterday = currentDate;
  yesterday.setDate(yesterday.getDate());
  yesterday.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalSaleToday = await order.aggregate([
    {
      $match: {
        "delivered.deliveredDate": {
          $gte: yesterday,
          $lte: new Date()
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$delivered.deliveredDate" } },
        totalSaleAmount: { $sum: { $multiply: ["$total", "$totalQuantity"] } },
        averageQuantity: { $avg: "$totalQuantity" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalSaleAmount: -1 }
    }
  ]);
  const totalSaleTotalAmount = totalSaleToday.reduce((sum, sale) => sum + sale.totalSaleAmount, 0);
  const [totalsaleTodaysDate] = totalSaleToday

  const todays = new Date();
  const yesterdays = new Date(todays.setDate(todays.getDate()));
  yesterdays.setHours(0, 0, 0, 0);

  const daybefore = new Date(todays.setDate(todays.getDate() - 3));
  daybefore.setHours(0, 0, 0, 0);

  const totalSaleDayBeforeYesterday = await order.aggregate([
    {
      $match: {
        "delivered.deliveredDate": {
          $gte: daybefore,
          $lt: yesterdays
        }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$delivered.deliveredDate" } },
        totalSaleAmount: { $sum: { $multiply: ["$total", "$totalQuantity"] } },
        averageQuantity: { $avg: "$totalQuantity" },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { totalSaleAmount: -1 }
    }
  ]);


  const totalRevenue = await order.aggregate([
    {
      $match: { "delivered.status": true }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: { $multiply: ["$total", "$totalQuantity"] } },
        averageQuantity: { $avg: "$totalQuantity" },
        count: { $sum: 1 }
      }
    }
  ]);

  let totalAmount = 0; 
  if (totalRevenue.length > 0) {
    const [result] = totalRevenue;
    totalAmount = result.totalAmount;
  }
  let data = {
    admin: adminFinded,
    users: AllUsers,
    totalOrders,
    allOrder,
    
    pendingOrderlastorderTimeAgo,
    deliveredrecentOrderTimeAgo,
    cancelledOrderLastTimeAgo,
    OrderlastorderDate,


    OrderlastorderTimeAgo,
    totalReturnOrderLastSortDate,


      
    totalReturnOrderLastSortDateAgo,
    lastdatePaypalPaymentDateAgo,
    lastDateCodPaymentDateAgo,
    lastDateWalletPaymentDateAgo,
    returnOrderlastorderDate,
    returnOrderlastorderTimeAgo,
    pendingOrderlastorderDate,
    deliveredrecentOrderDate,
    cancelledOrderLastDate,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    returnedOrder,
    pendingOrdersAprovel,
    totalCod,
    paypalTotal,
    walletTotal,
    lastDatePaypalPayment,
    lastDateCodPayment,
    lastDateWalletPayment,  
    totalOrderAmount,
    totalRevenue:totalAmount,
    totalsaleTodaysDate,
    totalSaleTotalAmount,
    totalSaleAmountsMonthly,
    dateStartingFrom
  };
  res.render("adminDashboard.ejs", { data });
  return;

}
const loadAddProduct = async (req, res) => {
  try {
    const categorys = await category.find({})
    res.render("add-product", { category: categorys });
    return
  } catch (error) {
    console.log(error.message)
  }
}
const productlist = async (req, res) => {
  try {
    const products = await product.find({ delete: { $ne: true } });
    res.render('product', { products: products });
  } catch (error) {
    console.log(error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.query.id;
    const deleteProduct = await product.findByIdAndUpdate(id, { delete: true });
    res.redirect('/admin/productList')
  } catch (error) {
    console.log(error.message)
  }
}
const addProduct = async (req, res) => {
  try {
    const uploadedFiles = req.files ? req.files.map((file) => file.filename) : [];

    const productModel = new product({
      productName: req.body.productName,
      productDescription: req.body.productDes,
      productColor: req.body.productColor,
      productSize: req.body.productSize,
      price: req.body.price,
      productQuantity: req.body.productQuantity,
      category_id: req.body.category_id,
    });
    
    let croppedImages = [];
    for (let file of req.files) {
      const outputFileName = `cropped-${file.filename}`; // Use a different file name for output
      await sharp(file.path)
        .resize(600, 800, { fit: 'cover' })
        .toFile(`./public/upload/${outputFileName}`);
      croppedImages.push(outputFileName);
    }
    
    productModel.productImage = croppedImages;
    const product_data = await productModel.save();
    
    res.status(200).redirect('/admin/productList');
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
    console.log(error.message);
  }
}
const loadEditProduct = async (req, res) => {
  try {
    const editid = req.query.id
    const categorydata = await category.find();
    const modelfinded = await productModel.findById(editid)
    res.render('edit-product', { model: modelfinded, category: categorydata })
    return
  } catch (error) {
    console.log(error.message)
  }
}
const approveReturn = async (req, res) => {
  try {
    const id = req.query.id;
    const userId = req.session.userId;
    const currentDate = new Date();
    const update = {
      $set: {
        'return.status': true,
        'return.adminApprovedDate': currentDate,
        'return.approved': 'Approved by Admin',
        'return.admin': true,
        status: "Return Approved By admin"
      }
    };

    const updatedOrder = await orders.findByIdAndUpdate(
      id,
      update
    );
    res.redirect('/admin/updateOrders');
  } catch (error) {
    console.log(error.message);
    res.status(500).send("An error occurred while approving the order return.");
  }
};
const approveRefund = async (req, res) => {
  try {
    const orderId = req.query.id;

    const order = await orders.findOne({ _id: orderId });
    if (
      order.delivered.status === true &&
      order.return.admin === true &&
      order.return.status === true
    ) {
      const userWallet = await wallet.findOne({ userId: order.userId });
      if (!userWallet) {
        const newWallet = new wallet({
          userId: order.userId,
          totalAmount:order.total,
          refunds: [
            {
              orderId: order._id,
              status: {
                adminApproval: true,
                refundStatus: 'Refund Approved',
                approvalDate: Date.now()
              },
              refundStatus: 'Refund Approved By admin',
              returnAmount: order.total
            }
          ]
        });
        const savedWallet = await newWallet.save();
        // const savedRefund = savedWallet.refunds[0];

        const updateInOrder = {
          status: "Refund Completed",
          refundStatus: {
            status: true,
            refundAccount: "Wallet",
            refundAmount: order.total,
            wallet: savedWallet._id
          }
        };
        order.status = updateInOrder.status;
        order.refundStatus = updateInOrder.refundStatus;
        await order.save();
      } else {
        const existingRefund = userWallet.refunds.find(
          (refund) => refund.orderId.toString() === orderId
        );
        if (existingRefund) {
          console.log('Refund already approved for this order');
        } else {

          userWallet.refunds.push({
            orderId: order._id,
            status: {
              adminApproval: true,
              refundStatus: 'Refund Approved',
              approvalDate: Date.now()
            },
            refundStatus: 'Refund Approved By admin',
            returnAmount: order.total
          });
          userWallet.totalAmount+=order.total;
          const savedWallet = await userWallet.save();

          const updateInOrder = {
            status: "Refund Completed",
            refundStatus: {
              status: true,
              refundAccount: "wallet",
              refundAmount: order.total,
              wallet: savedWallet._id
            }
          };
          // order.status = updateInOrder.status;
          // await order.save();
          order.status = updateInOrder.status;
          order.refundStatus = updateInOrder.refundStatus;
          await order.save();
        }
      }

      return res.redirect('/admin/updateOrders');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const approveDelivery = async (req, res) => {
  try {
    const id = req.body.orderId;
    const currentDate = new Date();

    const formattedDate = currentDate.toISOString().split("T")[0];
    const update = {
      'delivered.status': true,
      'delivered.deliveredDate': currentDate,
      status: "Delivered"
    };

    const updatedDelivery = await orders.findByIdAndUpdate(id, update);

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};
const editProduct = async (req, res) => {
  const id = req.body.id;

  const arrImages = [];
  if (req.files && req.files.length > 0) {
    for (let i = 0; i < req.files.length; i++) {
      arrImages.push(req.files[i].filename);
    }
  } else {
    const existingProduct = await productModel.findById(id);
    arrImages.push(...existingProduct.productImage);
  }

  const editProduct = {
    productName: req.body.productName,
    productDescription: req.body.productDes,
    productColor: req.body.productColor,
    productSize: req.body.productSize,
    price: req.body.price,
    productQuantity: req.body.productQuantity,
    category_id: req.body.category_id,
    productImage: arrImages
  };

  try {
    const updatedProduct = await productModel.findByIdAndUpdate(id, editProduct, { new: true });
    return res.redirect("/admin/productlist")
  } catch (error) {
    console.log(error.message)
  }
}
const category_list = async (req, res) => {
  try {
    const categorydata = await category.find({});
    res.render('category', { category: categorydata })
  } catch (error) {
    console.log(error.message);
  }
}
const add_category = async (req, res) => {
  try {
    const uploadedFiles = req.files ? req.files.map((file) => file.filename) : [];
    const parsedCategoryName = req.body.categoryName;
    const trimmedCategoryName = parsedCategoryName.trim();
    const CategoryDescription = req.body.CategoryDescription;
    const categoryOfferAmount = req.body.categoryOfferAmount;
    
    const category = await categoryModel.findOne({
      $or: [
        { categoryName: { $regex: new RegExp(`^${trimmedCategoryName}$`, 'i') } }, // Match category name as a whole (case-insensitive)
        { keywords: { $in: [new RegExp(`${trimmedCategoryName}`, 'i')] } }, // Match individual keywords (case-insensitive)
      ],
    });
    if (category) {
      return res.redirect('/admin/category');
    }
    const categorys = new categoryModel({
      categoryName: parsedCategoryName,
      CategoryDescription: CategoryDescription,
      CategoryOffer: categoryOfferAmount,
      categoryImage: uploadedFiles
    });
    const category_data = await categorys.save();
    res.redirect("/admin/category")
  }
  catch (error) {
    console.log(error.message);
  }
}
const addcoupons = async (req, res) => {
  try {
    const category = await categoryModel.find({})
    return res.render("addcoupons", { category })
  } catch (error) {
    console.log(error.message)
  }
}
const addCouponsPostMethod = async (req, res) => {
  try {
    const { name, amount, expire_date, code, description, minimumAmount, category_id } = req.body
    const addcoupon = new couponModel({
      couponName: name,
      couponAmount: amount,
      couponExpireDate: expire_date,
      couponDescription: description,
      minimumAmount: minimumAmount,
      category_id: category_id||"No category",
      code: code
    })
    const couponAdded = await addcoupon.save();
    res.redirect("/admin/listCoupons")

  } catch (error) {
    console.log(error.message)
  }
}
const listCoupons = async (req, res) => {
  try {
    const coupons = await couponModel.find({delete:{$ne:true}})
    res.render('listCoupon', { coupons })
  } catch (error) {
    console.log(error.message)
  }
}
const editCoupon = async (req, res) => {
  try {
    const id = req.query.id
    const editcoupon = await couponModel.findById(id)
    return res.render("editcoupon", { editcoupon })
  } catch (error) {
    console.log(error.message)
  }
}
const editCouponsPostMethod = async (req, res) => {
  try {
    const { couponName, couponAmount, couponExpireDate, code, couponDescription, minimumAmount } = req.body
    const { id } = req.body
    const editCoupon = {
      couponName: couponName,
      couponAmount: couponAmount,
      couponExpireDate: couponExpireDate,
      code: code,
      couponDescription: couponDescription,
      minimumAmount: minimumAmount
    };

    const updatedProduct = await couponModel.findByIdAndUpdate(id, editCoupon);
    return res.redirect("/admin/listCoupons")
  } catch (error) {
    console.log(error.message)
  }
}
const deleteCoupon = async (req, res) => {
  try {
    const id = req.query.id
    const deleteCoupon = await couponModel.findByIdAndUpdate(id,{delete:true})
    if (deleteCoupon) {
      res.status(200).json({ message: 'coupon is deleted' })
    } else {
      res.status(204).json({ message: 'not context found' })
    }
  } catch (error) {
    console.log(error.message)
  }
}
const loadEditCategory = async (req, res) => {
  try {
    const id = req.query.id;
    const category = await categoryModel.findById(id);
    res.render('editCategory', { category: category });
  } catch (error) {
    console.log(error.message);
  }
}
const duplicateCategory = async (req, res) => {
  try {
    const { categoryNameValue } = req.body;
    const trimmedCategoryName = categoryNameValue.trim();

    const category = await categoryModel.findOne({
      $or: [
        { categoryName: { $regex: new RegExp(`^${trimmedCategoryName}$`, 'i') } }, // Match category name as a whole (case-insensitive)
        { keywords: { $in: [new RegExp(`${trimmedCategoryName}`, 'i')] } }, // Match individual keywords (case-insensitive)
      ],
    });
    if (category) {
      res.json({category:true,categoryNameValue})
    } else {
      res.json({category:false})
    }
  } catch (error) {
    console.log(error.message);
  }
};
const editCategory = async (req, res) => {
  try {
    const parsedCategoryId = req.body.id
    const parsedCategoryName = req.body.categoryName;
    const parsedCategoryDescription = req.body.categoryDescription;
    const categoryOfferAmount = req.body.categoryOfferAmount;
    const editCategory = await categoryModel.findByIdAndUpdate(parsedCategoryId, {
      $set: {
        categoryName: parsedCategoryName,
        CategoryDescription: parsedCategoryDescription,
        CategoryOffer:categoryOfferAmount
      }
    });
    res.redirect("/admin/category");
  } catch (error) {
    console.log(error.message);
    // Handle error response
    return res.status(500).json({ error: 'Internal server error' });
  }
}
const deleteCategory = async (req, res) => {
  try {
    const deleteCatogory = req.query.id;
    const deleting = await categoryModel.findByIdAndDelete(deleteCatogory)
    res.redirect("/admin/category")
  } catch (error) {
    console.log(error.message)
  }
}
const userStatus=async(req,res)=>{
  try {
  const AllUsers = await UserModel.find({})
    // {$and:
    //   [{is_admin: 0},
    //     {block:true}
    //   ]
    // })
    const blockedCount=AllUsers.filter(count=>count.block==true)
    const verifiedUsers=AllUsers.filter(count=>count.is_verified==1)
  
    return res.render('userStatus.ejs',{
      users:blockedCount,
      allusers:AllUsers.length,
      usersCount:blockedCount.length,
      verifiedUsers:verifiedUsers.length
    })
} catch (error) {
    console.log(error.message)
  }
}
const totalSaleExcel=async(req,res)=>{
  try {
    const currentDate = new Date();
    const yesterday = currentDate;
    yesterday.setDate(yesterday.getDate());
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalSaleToday =await order.aggregate([
      {
        $match: {
          "delivered.deliveredDate": {
            $gte: yesterday,
            $lte: new Date()
          }
        }
      }
    ]);
    
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('orders');
    worksheet.columns = [
      { header: "S:no", key: "s_no" },
      { header: "Id", key: "_id" },
      { header: "User Id", key: "userId" },
      { header: 'Products', key: "products" },
      { header: "Total", key: "total" },
      { header: "Total Quantity", key: "totalQuantity" },
      { header: "Payment Method", key: "paymentMethod" },
      { header: "Delivered Status", key: "deliveredStatus" },
      { header: "Order Date", key: "orderDate" },
      { header: "Order Number", key: "orderNumber" },
      { header: "Payment Status", key: "paymentStatus" },
      { header: "Cancelled Status", key: "cancelledStatus" },
      { header: "Expected Delivery Date", key: "expectedDeliveryDate" },
      { header: "Return", key: "return" },
      { header: "__v", key: "__v" }
    ];
    let counter = 1;
    totalSaleToday.forEach(element => {
      element.s_no = counter;
      element.deliveredStatus=element.delivered?element.delivered.status:"";

      worksheet.addRow(element);
      counter++;
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Disposition", 'attachment;filename=todaysales.xlsx');
    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    console.log(error.message)
  }
}
const totalRevenueExcel=async(req,res)=>{
try {
  const allOrder = await order.find({status:"Delivered"});
  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('orders');
  worksheet.columns = [
    { header: "S no", key: "s_no" },
    { header: "Id", key: "_id" },
    { header: "total", key: "total" },
    { header: "Payment method", key: "paymentMethod" },
    { header: "status", key: "delivered" },
    { header: "status", key: "status" },
    { header: "orderDate", key: "orderDate" },
    { header: "orderNumber", key: "orderNumber" },
    { header: "paymentStatus", key: "paymentStatus" },
  ];
  let counter = 1;
  allOrder.forEach(element => {
    element.s_no = counter;
    worksheet.addRow(element);
    counter++;
  });
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );

  res.setHeader("Content-Disposition", 'attachment;filename=revenue.xlsx');
  return workbook.xlsx.write(res).then(() => {
    res.status(200);
  });
} catch (error) {
  console.log(error.message)
}
}
const productListExcel=async(req,res)=>{
  try {
    const productModellist = await productModel.find();
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('orders');
    worksheet.columns = [
      { header: "S no", key: "s_no" },
      { header: "Id", key: "_id" },
      { header: "productName", key: "productName" },
      { header: "productColor", key: "productColor" },
      { header: "Description", key: "productDescription"},
      { header: "price", key: "price" }
    ];
    let counter = 1;
    productModellist.forEach(element => {
      element.s_no = counter;
      worksheet.addRow(element);
      counter++;
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Disposition", 'attachment;filename=productList.xlsx');
    return workbook.xlsx.write(res).then(() => {
      res.status(200);

    });
  } catch (error) {
    console.log(error.message)
  }
}

const customPDF = async (req, res) => {
  try {
    const startDate = req.query.start; // Get the starting date from the query parameters
    const endDate = req.query.end; // Get the ending date from the query parameters
    const allOrder = await order.find({
      // status: "Delivered",
      orderDate: {
        $gte: startDate, 
        $lte: endDate,
      },
    })
      .populate({ path: "userId", model: "User" })
      .populate({ path: "address", model: "addres" })
      .populate({ path: "products.product_id", model: "productModel" })
      .exec();

    let startY = 150;
    const writeStream = fs.createWriteStream("order.pdf");
    const printer = new PdfPrinter({
      Roboto: {
        normal: "Helvetica",
        bold: "Helvetica-Bold",
        italics: "Helvetica-Oblique",
        bolditalics: "Helvetica-BoldOblique",
      },
    });

    const dateOptions = { year: "numeric", month: "long", day: "numeric" };

    // Create document definition
    const docDefinition = {
      content: [
        { text: "Hexa Shop", style: "header" },
        { text: "\n" },
        { text: "Order Information", style: "header1" },
        { text: "\n" },
        { text: "\n" },
      ],
      styles: {
        header: {
          fontSize: 25,
          alignment: "center",
        },
        header1: {
          fontSize: 12,
          alignment: "center",
        },
        total: {
          fontSize: 18,
          alignment: "center",
        },
      },
    };

    // Create the table data
    const tableBody = [
      ["Index", "Date", "User", "address" ,"Order Number","Status", "PayMode", "Quantity", "Amount"], // Table header
    ];
    let totalAmount=0
    for (let i = 0; i < allOrder.length; i++) {
      const data = allOrder[i];
      totalAmount=totalAmount+data.total
      const formattedDate = new Intl.DateTimeFormat(
        "en-US",
        dateOptions
      ).format(new Date(data.orderDate));
      tableBody.push([
        (i + 1).toString(), // Index value
        formattedDate,
        data.address.name,
        data.address.address,
        data.orderNumber,
        data.status,
        data.paymentMethod,
        data.totalQuantity,
        data.total,
      ]);
    }
    const table = {
      table: {
        widths: ["auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto", "auto"],
        headerRows: 1,
        body: tableBody,
      },
    };

    // Add the table to the document definition
    docDefinition.content.push(table);
    docDefinition.content.push([
      { text: "\n" },
      { text: `Total:${totalAmount}`, style: "total" },
    ]);
    // Generate PDF from the document definition
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    // Pipe the PDF document to a write stream
    pdfDoc.pipe(writeStream);

    // Finalize the PDF and end the stream
    pdfDoc.end();

    writeStream.on("finish", () => {
      res.download("order.pdf", "order.pdf");
    });
  } catch (error) {
    console.log(error.message);
    res.send(error.message);
  }
};

const orderDetailPDF=async(req,res)=>{
  try {
    const allOrder = await order.find({status:"Delivered"})
    .populate({ path: "userId", model: "User" })
    .populate({ path: "address", model: "addres" })
    .populate({ path: "products.product_id", model: "productModel" })
    .exec();
    res.render('salespdf.ejs',{orders:allOrder})
  } catch (error) {
    console.log(error.message)
  }
}

const allOrderStatus = async (req, res) => {
  try {
    const allOrder = await order.find();
    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('orders');
    worksheet.columns = [
      { header: "S no", key: "s_no" },
      { header: "Id", key: "_id" },
      { header: "total", key: "total" },
      { header: "productColor", key: "productColor" },
      { header: "status", key: "delivered" },
      { header: "status", key: "status" },
      { header: "orderDate", key: "orderDate" },
      { header: "orderNumber", key: "orderNumber" },
      { header: "paymentStatus", key: "paymentStatus" },
    ];
    let counter = 1;
    allOrder.forEach(element => {
      element.s_no = counter;
      worksheet.addRow(element);
      counter++;
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader("Content-Disposition", 'attachment;filename=orders.xlsx');
    return workbook.xlsx.write(res).then(() => {
      res.status(200);
    });
  } catch (error) {
    console.error(error);
    // Handle the error appropriately
  }
};
const updateOrders=async(req,res)=>{
  try {
    const allOrder = await orders.find()
    .populate({ path: "userId", model: "User" })
    .populate({ path: "address", model: "addres" })
    .populate({ path: "products.product_id", model: "productModel" })
    .exec();
    let allorders=allOrder.reverse();
    return res.render('updateOrders.ejs',{allOrder:allorders})

  } catch (error) {
    console.log(error.message)
  }
}

const orderDetailPage=async(req,res)=>{
  try {
    const id=req.query.id
    const product = await orders.findById({_id:id})
    .populate({ path: "userId", model: "User" })
    .populate({ path: "address", model: "addres" })
    .populate({ path: "products.product_id", model: "productModel" })
    .exec();
    if(!product){return res.redirect("/admin/updateOrders")}
    if(product){return res.render("../detailpage.ejs",{product})}
  } catch (error) {
    console.log(error);
  }
  
}
const userStatusList=async(req,res)=>{
  try {
    const AllUsers = await UserModel.find({})
    const blockedCount=AllUsers.filter(count=>count.block==true)
    const verifiedUsers=AllUsers.filter(count=>count.is_verified==1)
  return res.render('userStatusList.ejs',
  {
    users:AllUsers,
    allusers:AllUsers.length,
    UsersBlockedCount:blockedCount.length,
    verifiedUsers:verifiedUsers.length
  })
} catch (error) {
    console.log(error.message)
  }
}
const adminLogout=async(req,res)=>{
  try {
    req.session.adminloggedIn=false
    req.session.destroy()
    res.redirect("/admin")
  } catch (error) {
    console.log(error.message)
  }
}
module.exports = {
  loadLogin,
  verifyLogin,
  adminHome,
  userBlock,
  loadAddProduct,
  addProduct,
  deleteProduct,
  productlist,
  orderDetailPage,
  category_list,
  add_category,
  loadEditCategory,
  deleteCategory,
  loadEditProduct,
  editProduct,
  addcoupons,
  listCoupons,
  editCoupon,
  deleteCoupon,
  editCouponsPostMethod,
  addCouponsPostMethod,
  duplicateCategory,
  editCategory,
  approveDelivery,
  approveReturn,
  approveRefund,
  adminLogout,
  userStatus,
  userStatusList,
  updateOrders,
  totalSaleExcel,
  totalRevenueExcel,
  productListExcel,
  orderDetailPDF,
  customPDF,
  allOrderStatus
}
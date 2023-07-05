const express=require("express")
const adminRoute=express()
const adminController=require("../controller/adminController");
const config=require('../config/config')
const authentication=require('../middleware/adminAuth')
const bodyParser=require('body-parser')
const multer = require('multer')

const flash = require('express-flash');

adminRoute.use(flash());

adminRoute.set('view engine',"ejs")
adminRoute.set("views","./views/admin")

adminRoute.use(express.json())
adminRoute.use(express.urlencoded({extended:true}))
var path=require('path')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, '../public/upload'), function (err, success) {
        if (err) {
          throw err;
        }
      });
    },
    filename: function (req, file, cb) {
      const name = Date.now() + "-" + file.originalname;
      cb(null, name, function (error, success) {
        if (error) {
          throw error;
        }
      });
    },
  });
  
  const upload = multer({ storage: storage });
  
  

adminRoute.get('/',authentication.isAdminLogin,adminController.loadLogin)
adminRoute.post('/adminlogin',adminController.verifyLogin)

//Admin HOME rendering
adminRoute.get('/adminhome',authentication.isAdminLogout,adminController.adminHome)
adminRoute.post('/admin/block', adminController.userBlock);

adminRoute.get('/approveReturn',authentication.isAdminLogout,adminController.approveReturn)

adminRoute.get('/approveRefund',authentication.isAdminLogout,adminController.approveRefund)
adminRoute.post('/admin/approveDelivery',adminController.approveDelivery)

adminRoute.get('/addproduct',authentication.isAdminLogout,adminController.loadAddProduct)
adminRoute.post('/addproduct', upload.array("productImage", 5), adminController.addProduct);

adminRoute.get('/editProduct',authentication.isAdminLogout,adminController.loadEditProduct)
adminRoute.post('/editProduct',upload.array("productImage", 5),adminController.editProduct)

adminRoute.get('/productList',authentication.isAdminLogout,adminController.productlist)

adminRoute.get('/deleteProduct',authentication.isAdminLogout,adminController.deleteProduct)

adminRoute.get('/userStatus',authentication.isAdminLogout,adminController.userStatus)
adminRoute.get('/userStatusList',authentication.isAdminLogout,adminController.userStatusList)
adminRoute.get('/updateOrders',authentication.isAdminLogout,adminController.updateOrders)
adminRoute.get('/orderDetails',authentication.isAdminLogout,adminController.orderDetailPage)

adminRoute.get('/category',authentication.isAdminLogout,adminController.category_list)
adminRoute.post('/addcatogory',upload.array("categoryImage", 5),adminController.add_category)
adminRoute.post('/duplicateCategory',authentication.isAdminLogout,adminController.duplicateCategory)

adminRoute.get('/addcoupons',authentication.isAdminLogout,adminController.addcoupons)
adminRoute.post('/addcoupons',adminController.addCouponsPostMethod)
adminRoute.get('/listCoupons',authentication.isAdminLogout,adminController.listCoupons)
adminRoute.get("/editcoupon",authentication.isAdminLogout,adminController.editCoupon)
adminRoute.post("/editcoupon",adminController.editCouponsPostMethod)

adminRoute.delete('/deletecoupon',authentication.isAdminLogout, adminController.deleteCoupon);

adminRoute.get('/editCategory',authentication.isAdminLogout,adminController.loadEditCategory)
adminRoute.post('/editCategory',adminController.editCategory)

adminRoute.get('/deleteCategory',authentication.isAdminLogout,adminController.deleteCategory)

// Excel convertion
adminRoute.get('/totalSaleExcel',authentication.isAdminLogout,adminController.totalSaleExcel)
adminRoute.get('/todayRevenueExcel',authentication.isAdminLogout,adminController.totalRevenueExcel)
adminRoute.get('/allProductExcel',authentication.isAdminLogout,adminController.productListExcel)
adminRoute.get('/allOrderStatusExcel',authentication.isAdminLogout,adminController.allOrderStatus)
adminRoute.get('/customDate',authentication.isAdminLogout,adminController.customPDF)
adminRoute.get('/orderDetailPDF',authentication.isAdminLogout,adminController.orderDetailPDF)
// Excel convertion ended


adminRoute.get('/logout',adminController.adminLogout)






module.exports=adminRoute
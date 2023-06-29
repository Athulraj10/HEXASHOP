

 const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productModel",
      required: true,
      autopopulate:true
    },
    Quantity: {
      type: Number,
      required: true
    },
    size: {
      type: String,
      required: false
    }
  }],
  
  
  
  total: {
    type: Number,
    required: true
  },
  totalQuantity: {
    type: Number,
    required: true
  },
  coupon:{
    type:String,
    required:false
},
  paymentMethod: {
    type: String,
    required: true
  },


  delivered: {
    status: {
      type: Boolean,
      default: false
    },
    deliveredDate:{
      type:Date
    }
  },

  expectedDeliveryDate: {
    type: Date
  },


  cancelled: {
    cancelled:{
      type:Boolean,
      default:false
    },
    reason:{
      type:String,
      default:""
    },
    dateOfCancel:{
      type:Date
    }
  },
  status: {
    type: String,
    default: "Pending"
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "addres",
    required: true
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categoryModel',
    required: false
  },
  orderNumber: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    default: "Unpaid"
  },
  
  
  refundStatus:{
    status:{
      type:Boolean,
      required:false
    },
    refundAccount:{
      type:String,
      required:false
    },
    refundAmount:{
      type:Number,
      required:false,
     },
     wallet:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: false
     }
  },
  
  return: {
    status: {
      type: Boolean,
    },
    approved: {
      type: String,
      default:''
    },
    admin: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String,
      required: false
    },
    userRequestDate:{
      type:Date
    },

    userCancelledRequestDate:{
      type:Date
    },
    adminApprovedDate:{
      type:Date
    }
  }
});

orderSchema.plugin(require('mongoose-autopopulate'));


module.exports = mongoose.model('order', orderSchema);

// const mongoose = require('mongoose');

// const orderSchema = mongoose.Schema({
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
//     orders: [{
//       product_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "productModel",
//         required: true
//       },
//       total: {
//         type: Number,
//         required: true
//       },
//       coupon: {
//         type: String,
//         default: "no Coupons applied"
//       },
//       paymentMethod: {
//         type: String,
//         required: true
//       },
//       status: {
//         type: String,
//         default: "Pending"
//       },
//       address: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Address",
//         required: true
//       },
//       orderDate: {
//         type: Date,
//         default: Date.now
//       },
//       itemquantity: {
//         type: Number,
//         required: true
//       }
//     }]
//   });
  
//   module.exports = mongoose.model('Order', orderSchema);
  
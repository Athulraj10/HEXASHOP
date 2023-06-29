const mongoose= require('mongoose');
const couponSchema = new mongoose.Schema({

couponName:{
    type: String,
    required:true
},
couponAmount:{
    type: Number,
    required:true
},
couponExpireDate:{
    type: Date,
    required:true
},
code:{
    type: String,
    required:true
},
couponDescription:{
    type: String,
    required:true
},
// createdAt: {
//     type: Date,
//     default: Date.now,
//     index: { expires:'90000' },
//   },
minimumAmount:{
    type: Number,
    required:true
},
category_id:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'categoryModel',
    required:false
},
userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  
})

module.exports = mongoose.model('coupon',couponSchema);
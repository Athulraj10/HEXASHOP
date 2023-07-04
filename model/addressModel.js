const mongoose = require('mongoose');


const addressSchema = mongoose.Schema({

   userid :{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
   },
   name:{
    type:String,
    required:true
   },
   address:{
      type: String,
      required: true
   },
   city:{
      type: String,
      required: true
   },
  landmark:{
   type: String,
   required: true
  },
  pincode:{
   type: String,
   required: true
  },
  phoneNo:{
    type:Number,
    required:true
  },
  type:{
    type:String,
    required:true
  },
  delete:{
    type:Boolean,
    default:false,
    required:false
  }
});

module.exports = mongoose.model('addres',addressSchema);
 

















// const mongoose = require('mongoose');




















// const addressSchema = mongoose.Schema({
//   address: {
//     type: String,
//     required: true
//   },
//   name:{
//     type:String,
//     required:true
//   },
//   city: {
//     type: String,
//     required: true
//   },
//   landmark: {
//     type: String,
//     required: true
//   },
//   pincode: {
//     type: Number,
//     required: true
//   },
//   phoneNo: {
//     type: Number,
//     required: true
//   },
//   type:{
//     type:String,
//     required:true
//   }
// });

// const addressField = mongoose.Schema({
//   userid: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   address: [addressSchema]
// });

// // module.exports = mongoose.model('address', addressField);
// const Address = mongoose.model('Address', addressField);

// module.exports = Address;

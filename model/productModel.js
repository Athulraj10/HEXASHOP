const mongoose=require('mongoose')
const productSchema=mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    productColor:{
        type:String,
        required:true,
    },
    productSize:{
        type:String,
        required:true
    },
    productDescription:{
        type:String,
        required:true
    },
    price:{
        type:String,
        required:true
    },
    category_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'categoryModel',
        required:true
    },
    productQuantity:{
        type:Number,
        required:true
    },
    productStatus:{
        type:Boolean,
        default:true
    },
    productImage:{
        type:Array,
        required:true,
        validate:[arraylimit,'maximum 4 product images']
    },
    delete:{
      type:Boolean,
      default:false,
      required:false
    }})

    function arraylimit(val){
        return val.length <=4;
    }

module.exports=mongoose.model('productModel',productSchema);
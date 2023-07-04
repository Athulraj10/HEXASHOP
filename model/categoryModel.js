const mongoose=require('mongoose')

const arraylimit=(value)=>{
    return value.length <= 4
}

const categoryModelSchema=mongoose.Schema({
    categoryName:{
        type:String,
        required:true
    },
    CategoryDescription:{
        type:String,
        required:true
    },
    CategoryOffer:{
        type:Number,
        default:0,
    },
    categoryImage:{
        type:Array,
        validate:[arraylimit,'maxinum 4 photos']
    },

  delete:{
    type:Boolean,
    default:false,
    required:false
  }
})
module.exports=mongoose.model("categoryModel",categoryModelSchema)
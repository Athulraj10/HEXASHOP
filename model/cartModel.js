
const mongoose=require('mongoose')

const cartSchema = mongoose.Schema({
    product:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'productModel',
            required:true
        },
        productQuantity:{
            default:1,
            type:Number,
            required:false
        }}],

        userid:{
            type:String,
            required:true,
        }
})

module.exports=mongoose.model("cart",cartSchema);
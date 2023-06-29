const {Schema,model}=require('mongoose')

const OTPschema=new Schema({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now,
        index:{expires:300}
    }
})

const OTP=model('OTP',OTPschema)
// module.exports=mongoose.schema(OTPmodel,"OTPschema")
module.exports=OTP;
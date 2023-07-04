const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

    name: {
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    mobile: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required:true
    },
    is_admin: {
        required:true,
        type:Number,
        default:0
    },
    is_verified: {
        type:Number,
        default:0
    }
    ,
    UniqueCode: {
        type:String,
        default:""
    },
    referredBy: {
        type:String,
        default:""
    }
    ,
    token: {
        type:String,
        default:''
    }
    ,
    block:{
        type:Boolean,
        default:false
    },
    delete:{
      type:Boolean,
      default:false,
      required:false
    }
});

module.exports = mongoose.model('User', userSchema);

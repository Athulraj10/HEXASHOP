const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalAmount: {
    type:Number,
    default:0,
    required: false
  },
  wallet: [
    {
      User: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
      },
      status: {
       type:String,
       default:''
      },
      moneyAdded: {
        type: Number,
        default:0,
        required: false
      },
      moneyAddedDate: {
        type: Date
      }
    }
  ],
  walletWithdrawal: [
    {
      OrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
        required: false
      },
      status: {
       type:String,
       default:''
      },
      moneyWishdrawal: {
        type: Number,
        default:0,
        required: false
      },
      moneyAddedDate: {
        type: Date
      }
    }
  ],
  refunds: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'order',
        required: false
      },
      status: {
        adminApproval: {
          type: Boolean,
          default: false
        },
        refundStatus: {
          type: String,
          required: false
        },
        approvalDate: {
          type: Date,
          required: false
        }
      },
      refundDate: {
        type: Date,
        default: new Date()
      },
      refundStatus: {
        type: String,
        required: false
      },
      returnAmount: {
        type: Number,
        required: false,
        min: 0,
        max: 500000 
        }
    }
  ]
});

module.exports = mongoose.model('Wallet', walletSchema);



// const mongoose=require('mongoose');

// const wallet=mongoose.Schema({
//     userId:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:'User',
//         required:true
//     },
//     orderId:{
//             type:mongoose.Schema.Types.ObjectId,
//             ref:"order",
//             required:true,
//             autopopulate:true
//     },
//     status:{
//         adminApproval:{
//             type:Boolean,
//             default:false
//         },
//         refundStatus:{
//             type:String,
//             required:true
//         },
//         approvalDate:{
//             type:Date,
//             required:true
//         }
//     },
//     refundDate:{
//         type:Date,
//         default:new Date()
//     },
//     refundStatus:{
//         type:String,
//         required:true
//     },
//     returnAmount:{
//     type:Number,
//     required:true
//     }
    

// })


// module.exports = mongoose.model('wallet', wallet);

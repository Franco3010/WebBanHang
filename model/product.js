var mongoose = require('mongoose');
var Schema = mongoose.Schema;





var schema = new Schema({
    imagePath: {
        firstPic:String,
        secondPic:String,
        thirdPic:String
    },
    title: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    purchase_number: {type:Number,default:0},
    rateOneStar:{type:Number,default:0},
    rateTwoStar:{type:Number,default:0},
    rateThreeStar:{type:Number,default:0},
    rateFourStar:{type:Number,default:0},
    rateFiveStar:{type:Number,default:0},
    comment: [
        {
            detail: {type: String, required: true},
            datePost: {type: Date, required: true},
            username: {type: String, required: true},
            userid: {type: Schema.Types.ObjectId, required: true ,ref:'User'},
            datediff: {type: String, default:''}
        }
    ],
    productDetail:{
        screen:String,
        CameraSelfie:String,
        Ram: String,
        Memory: Number,
        Battery: Number ,
        System: String
    }


});
module.exports= mongoose.model('Products', schema);

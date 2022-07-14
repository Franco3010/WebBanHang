const mongoose = require('mongoose');

require('dotenv').config();

/**
 * -------------- DATABASE ----------------
 */

/**
 * Connect to MongoDB Server using the connection string in the `.env` file.  To implement this, place the following
 * string into the `.env` file
 * 
 * DB_STRING=mongodb://<user>:<password>@localhost:27017/database_name
 */ 

const conn = 'mongodb://localhost:27017/Newtest'

const connection = mongoose.createConnection(conn, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Creates simple schema for a User.  The hash and salt are derived from the user's given password when they register
const UserSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String,
    admin: Boolean,
    name:{type:String,default:''},
    surname:{type:String,default:''},
    address:{type:String,default:''},
    phoneNumber: {type:String,default:''},
    token:{type:String,default:''},
    role:{type:String,default:'user'}

});
const AdminSchema = new mongoose.Schema({
    username: String,
    hash: String,
    salt: String,
    admin: Boolean,
    token:{type:String,default:''},
    role:{type:String,default:'admin'}
});
const EmployeeSchema = new mongoose.Schema({
    imagePath:String,
    email: String,
    name: String,
    surname:String,
    password:String
});

var OrderSchema = new mongoose.Schema({
    username:{type: String, required: true},
    cart: {type: Object, required: true},
    address: {type: String, required: true},
    name: {type: String, required: true},
    paymentId: {type: String, required: true},
    status:String,
    arriveDate:String,

});
const Employee = connection.model('Employee', EmployeeSchema);

const Admin = connection.model('Admin', AdminSchema);
const User = connection.model('User', UserSchema);
const Order = connection.model('Order',OrderSchema)
// Expose the connection
module.exports = connection;

const router = require('express').Router();
const multer = require('multer')
const res = require('express/lib/response');
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const Admin = connection.models.Admin;
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;
const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017'
const { body, validationResult } = require('express-validator');
const { isnotAuth } = require('./authMiddleware');
const Cart = require('../model/cart')
const express = require('express')
const app = express()
const paypal = require('paypal-rest-sdk');
// const { find } = require('/ProjTN/src/model/product.js');
const Order = connection.models.Order;
const Employee = connection.models.Employee;
const User = connection.models.User;
// const Comment = connection.models.Comment;
const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/shopping')
mongoose.connect('mongodb://localhost:27017/Newtest')
const Product = require('../model/product.js');
const Comment = require('../model/comments.js');
const validPassword = require('../lib/passwordUtils').validPassword;
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../resources/images')
    },
    filename: function (req, file, cb) {

        cb(null, file.originalname)
    }
})

var upload = multer({ storage: storage })
function sendMail(email,link){
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ngodu.anh3010@gmail.com',
            pass: 'jbnpjpfvqowjbjmd'
        }
    });
    
    let mailOptions = {
        from: 'ngodu.anh3010@gmail.com', 
        to: email,
        subject: 'Nodemailer - Test',
        text: link,
        
    };
    
    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            return console.log(err);
        }
        return console.log('Email sent!!!');
    });
}

router.post('/loginAdmin', passport.authenticate('adminlocal', { failureRedirect: '/loginAdmin', successRedirect: '/getAllProduct' }), (req, res) => {
});

router.post('/registerAdmin',

    (req, res, done) => {
        req.checkBody('uname', 'Invalid email').notEmpty().isEmail();
        req.checkBody('pw', 'Invalid password').notEmpty().isLength({ min: 4 });
        var errors = req.validationErrors();
        if (errors) {
            var messages = [];
            errors.forEach(function (error) {
                messages.push(error.msg);
            });

            done(null, false, req.flash('error', messages));
            res.redirect('/registerAdmin')
        }
        Admin.findOne({ username: req.body.uname })
            .then((user) => {

                if (user) {
                    req.flash('error', 'user da ton tai');
                    res.redirect('/registerAdmin')
                }
                if (!user) {

                    const saltHash = genPassword(req.body.pw);

                    const salt = saltHash.salt;
                    const hash = saltHash.hash;

                    const newUser = new Admin({
                        username: req.body.uname,
                        hash: hash,
                        salt: salt,
                        admin: true
                    });

                    newUser.save()
                        .then((user) => {
                            console.log('newAdmin' + user);
                        });

                    res.redirect('/loginAdmin');

                }


            })
            .catch((err) => {
                done(err);
            });



    });
router.get('/loginAdmin', function (req, res, next) {
    var successMessages = req.flash('Change password success')
    var messages = req.flash('error');

    res.render('LoginAdmin', { layout: 'loginadmin',successMessages:successMessages,hasSuccess:successMessages.length>0, messages: messages, hasErrors: messages.length > 0  })



});


router.get('/registerAdmin', function (req, res, next) {

    res.render('registerAdmin', { layout: 'loginadmin' })
});
//Employee

router.get('/updateEmployee/:id', async (req, res) => {

    const id = req.params.id
    const name = req.query.name
    const surname = req.query.surname
    const password = req.query.password
    const email = req.query.email
    console.log('email', typeof (email))
    const updateEmployee = await Employee.findOne({ _id: id })
    if (name.length > 0) {
        updateEmployee.name = name
    }
    if (surname.length > 0) {
        updateEmployee.surname = surname
    }
    if (password.length > 0) {
        updateEmployee.password = password
    }
    if (email.length > 0) {
        updateEmployee.email = email
    }
    await updateEmployee.save()
    res.json(updateEmployee)
})



//User
router.get('/getAllEmployee', async function (req, res, next) {
    let allEmployee = await Employee.find({})
    let storeEmployee = []
    storeEmployee = allEmployee
    storeEmployee.forEach(element=>{
        element.password = Buffer.from(element.password, 'base64').toString('utf8') 
    })
    // console.log(storeEmployee)
    res.render('adminEmployee', { layout: 'adminLayout', Employee: storeEmployee,admin:req.user.username })
});
router.post('/updateEmployee', upload.single('myFiles'), async (req, res) => {
    const {id} = req.query
    const files = req.files
    const filePath = []
    const { 
        email,
        password,
        surname,
        name
    } = req.body
    console.log(req.body)
        const encoded = Buffer.from(password, 'utf8').toString('base64')
        if(files){
            files.forEach(file=>{
                filePath.push(file.filename)
            })
        }
     
        const Employees = await Employee.findOne({_id:id})
        console.log(Employees)
        if(files){
            Employees.imagePath = filePath[0]

        }
        Employees.email = email
        Employees.password = encoded
        Employees.surname = surname
        Employees.name = name




    await Employees.save()
    res.redirect('/getAllEmployee')
})
router.get('/updateEmployee',async(req,res)=>{
    const {id} = req.query
    const employee = await Employee.find({_id:id})
    res.render('editEmployee',{ layout: 'adminLayout',employee:employee,admin:req.user.username })    
})
router.post('/deleteSelectedEmployee',async(req,res)=>{
    const {checkbox} = req.body
    let store = []
    if(checkbox&&checkbox.length==24){
        store.push(checkbox)
    }
    else{
        store = [...checkbox]
    }


    for(let i = 0 ; i<store.length;i++){
        await Employee.deleteOne({_id:store[i]})
        // console.log(store[i])
    }

    res.redirect('/getAllEmployee')
})
router.get('/deleteEmployee/:id', async (req, res) => {
    const id = req.params.id

    await Employee.deleteOne({ _id: id })

    res.redirect('/getAllEmployee')
})
router.get('/createNewEmployee', async (req, res) => {

    res.render('addEmployee', { layout: 'adminLayout' ,admin:req.user.username})
})
router.post('/createNewEmployee', upload.array('myFiles'), async (req, res) => {
    const files = req.files
    const filePath = []
    console.log(files)
    const { 
        email,
        password,
        surname,
        name
    } = req.body
        
        files.forEach(file=>{
            filePath.push(file.filename)
        })
    const encoded = Buffer.from(password, 'utf8').toString('base64')

    const newEmployee = new Employee({
        imagePath :filePath[0],
        email: email,
        password: encoded,
        surname: surname,
        name :name

    })
    await newEmployee.save()
    res.redirect('/getAllEmployee')
})
router.post('/deleteSelectedProduct',async(req,res)=>{
    const {checkbox} = req.body
    let store = []
    if(checkbox&&checkbox.length==24){
        store.push(checkbox)
    }
    else{
        store = [...checkbox]
    }


    for(let i = 0 ; i<store.length;i++){
        await Product.deleteOne({_id:store[i]})
        // console.log(store[i])
    }

    res.redirect('/getAllProduct')
})
router.get('/getAllUser', async function (req, res, next) {
    const allUser = await User.find({})
    res.render('adminUser',{layout:'adminLayout',user:allUser,admin:req.user.username})
});
router.get('/updateOneUser/:id', async (req, res) => {
    const id = req.params.id
    const username = req.query.username
    const realname = req.query.realname
    const password = req.query.password
    const address = req.query.address
    const phoneNumber = req.query.phoneNumber
    const saltHash = genPassword(password);
    const salt = saltHash.salt;
    const hash = saltHash.hash;
    const updateUser = await User.findOne({ _id: id })
    if (username.length > 0) {
        updateUser.username = username
    }
    if (realname.length > 0) {
        updateUser.realname = realname
    }
    if (password.length > 0) {
        updateUser.salt = salt
        updateUser.hash = hash
    }
    if (address.length > 0) {
        updateUser.address = address
    }
    if (address.length > 0) {
        updateUser.phoneNumber = phoneNumber
    }
    await updateUser.save()
    res.json(updateUser)
})

router.get('/deleteUser', async (req, res) => {
    const {id} = req.query

    await User.deleteOne({ _id: id })

    res.redirect('/getAllUser')
})

//Product
router.get('/getAllProduct', async function (req, res, next) {
    if(req.user){
        let allProduct = await Product.find({})
        let storeProduct = []
        storeProduct = allProduct
        for(let i = 0;i<storeProduct.length;i++){
            storeProduct[i].price = (storeProduct[i].price).toLocaleString('en')
        }
        res.render('adminProduct', { layout: 'adminLayout', product: storeProduct,admin:req.user.username })
    }
    else{
        res.redirect('/loginAdmin')
    }

});
router.post('/updateProduct', upload.array('myFiles', 3), async (req, res) => {
    const {id} = req.query
    const files = req.files
    const filePath = []
    console.log(files)
    const { title,
        price,
        screen,
        CameraSelfie,
        ram,
        battery,
        system,
        memory,
        description } = req.body
        
        files.forEach(file=>{
            filePath.push(file.filename)
        })
        const product = await Product.findOne({_id:id})
        if(files){
            product.imagePath.firstPic = filePath[0]
            product.imagePath.secondPic = filePath[1]
            product.imagePath.thirdPic = filePath[2]
        }
        product.title = title
        product.price = price
        product.description = description
        product.productDetail.screen = screen
        product.productDetail.CameraSelfie = CameraSelfie
        product.productDetail.Ram = ram
        product.productDetail.Memory = memory
        product.productDetail.Battery = battery
        product.productDetail.System = system

    await product.save()
    res.redirect('/getAllProduct')
})
router.get('/updateProduct',async(req,res)=>{
    const {id} = req.query
    const product = await Product.find({_id:id})
    res.render('editProduct',{ layout: 'adminLayout',product:product,admin:req.user.username })    
})

router.get('/deleteProduct/:id', async (req, res) => {
    const id = req.params.id

    await Product.deleteOne({ _id: id })

    res.redirect('/getAllProduct')
})
router.get('/createNewProduct', async (req, res) => {
    const product = 'abcd'
    res.render('addProduct', { layout: 'adminLayout' ,product:product,admin:req.user.username})
})
router.post('/createNewProduct', upload.array('myFiles', 3), async (req, res) => {
    const files = req.files
    const filePath = []
    console.log(files)
    const { title,
        price,
        screen,
        CameraSelfie,
        ram,
        battery,
        system,
        memory,
        description } = req.body
        
        files.forEach(file=>{
            filePath.push(file.filename)
        })

    const newProduct = new Product({
        imagePath : {
            firstPic:filePath[0],
            secondPic:filePath[1],
            thirdPic:filePath[2]
        },
        title: title,
        price: price,
        description: description,
        productDetail:{
            screeen:screen,
            CameraSelfie:CameraSelfie,
            Ram: ram,
            Memory: memory,
            Battery: battery ,
            System: system
        }

    })
    await newProduct.save()
    res.redirect('/getAllProduct')
})
router.post('/deleteSelectedProduct',async(req,res)=>{
    const {checkbox} = req.body
    let store = []
    if(checkbox&&checkbox.length==24){
        store.push(checkbox)
    }
    else{
        store = [...checkbox]
    }


    for(let i = 0 ; i<store.length;i++){
        await Product.deleteOne({_id:store[i]})
        // console.log(store[i])
    }

    res.redirect('/getAllProduct')
})

//Order
router.get('/getAllOrder', async function (req, res, next) {
    let allOrder = await Order.find({})
    const storePrice = []
    for(let i = 0;i<allOrder.length;i++){
        allOrder[i].cart.totalprice =  (allOrder[i].cart.totalPrice*23390).toLocaleString('en')
    }
    res.render('adminOrder', { layout: 'adminLayout', order: allOrder,price:storePrice ,admin:req.user.username})
});
router.get('/orderDetail', async function (req, res, next) {
    const {id} = req.query
    let detailOrder = await Order.findOne({_id:id})
    const storeID = {
        id:id
    }
    // for(let i = 0;i<allOrder.length;i++){
    //     allOrder[i].cart.totalprice =  (allOrder[i].cart.totalPrice*23390).toLocaleString('en')
    // }
   console.log(detailOrder.cart.items)
    res.render('detailOrder', { layout: 'adminLayout', order: detailOrder.cart.items,idTodelete:storeID ,admin:req.user.username})
});
router.get('/deleteElementOrder', async function (req, res, next) {
    const {title,id} = req.query
    let detailOrder = await Order.findOne({_id:id})
    const storePrice = []
    // for(let i = 0;i<allOrder.length;i++){
    //     allOrder[i].cart.totalprice =  (allOrder[i].cart.totalPrice*23390).toLocaleString('en')
    // }
    console.log('detailOrder',detailOrder.cart.items)
    res.render('detailOrder', { layout: 'adminLayout', order: detailOrder.cart.items,admin:req.user.username })
});
router.post('/updateOrder', async (req, res) => {
    const {id} = req.query

    const { title,
        price,
        screen,
        CameraSelfie,
        ram,
        battery,
        system,
        memory,
        description } = req.body
        

        const Order = await Order.findOne({_id:id})
        if(files){
            Order.imagePath.firstPic = filePath[0]
            Order.imagePath.secondPic = filePath[1]
            Order.imagePath.thirdPic = filePath[2]
        }
        Order.title = title
        Order.price = price
        Order.description = description
        Order.OrderDetail.screen = screen
        Order.OrderDetail.CameraSelfie = CameraSelfie
        Order.OrderDetail.Ram = ram
        Order.OrderDetail.Memory = memory
        Order.OrderDetail.Battery = battery
        Order.OrderDetail.System = system

    await Order.save()
    res.redirect('/getAllOrder')
})
router.get('/updateOrder',async(req,res)=>{
    const {id} = req.query
    const Order = await Order.find({_id:id})
    res.render('editOrder',{ layout: 'adminLayout',Order:Order,admin:req.user.username })    
})

router.get('/deleteOrder', async (req, res) => {
    const {id} = req.query

    await Order.deleteOne({ _id: id })

    res.redirect('/getAllOrder')
})
router.get('/createNewOrder', async (req, res) => {
    const Order = 'abcd'
    res.render('addOrder', { layout: 'adminLayout' ,Order:Order,admin:req.user.username})
})
router.post('/createNewOrder', upload.array('myFiles', 3), async (req, res) => {
    const files = req.files
    const filePath = []
    console.log(files)
    const { title,
        price,
        screen,
        CameraSelfie,
        ram,
        battery,
        system,
        memory,
        description } = req.body
        
        files.forEach(file=>{
            filePath.push(file.filename)
        })

    const newOrder = new Order({
        imagePath : {
            firstPic:filePath[0],
            secondPic:filePath[1],
            thirdPic:filePath[2]
        },
        title: title,
        price: price,
        description: description,
        OrderDetail:{
            screeen:screen,
            CameraSelfie:CameraSelfie,
            Ram: ram,
            Memory: memory,
            Battery: battery ,
            System: system
        }

    })
    await newOrder.save()
    res.redirect('/getAllOrder')
})
router.post('/deleteSelectedOrder',async(req,res)=>{
    const {checkbox} = req.body
    let store = []
    if(checkbox&&checkbox.length==24){
        store.push(checkbox)
    }
    else{
        store = [...checkbox]
    }


    for(let i = 0 ; i<store.length;i++){
        await Order.deleteOne({_id:store[i]})
        // console.log(store[i])
    }

    res.redirect('/getAllOrder')
})



router.post('/updateUser', async (req, res) => {
    const {id} = req.query
    const { 
        username,
        surname,
        name,
        phoneNumber,
        address
    } = req.body
     
     
        const Users = await User.findOne({_id:id})
        if(files){
            Users.imagePath = filePath[0]

        }
        Users.username = username
        Users.surname = surname
        Users.name = name
        Users.phoneNumber = phoneNumber
        Users.address = address




    await Users.save()
    res.redirect('/getAllEmployee')
})
router.get('/updateUser',async(req,res)=>{
    const {id} = req.query
    const user = await User.find({_id:id})
    res.render('editUser',{ layout: 'adminLayout',user:user,admin:req.user.username })    
})
router.get('/createNewUser', async (req, res) => {
    const user = 'fsdfsf'
    res.render('addUser', { layout: 'adminLayout',user:user,admin:req.user.username })
})
router.post('/createNewUser', async (req, res) => {

    const { 
        username,
        surname,
        name,
        phoneNumber,
        address
    } = req.body
        


    const newUser = new User({
        phoneNumber :phoneNumber,
        username: username,
        phoneNumber: address,
        surname: surname,
        name :name

    })
    await newEmployee.save()
    res.redirect('/getAllEmployee')
})

router.post('/deleteSelectedUser',async(req,res)=>{
    const {checkbox} = req.body
    let store = []
    if(checkbox&&checkbox.length==24){
        store.push(checkbox)
    }
    else{
        store = [...checkbox]
    }


    for(let i = 0 ; i<store.length;i++){
        await User.deleteOne({_id:store[i]})
        // console.log(store[i])
    }

    res.redirect('/getAllUser')
})



router.get('/registerAdmin', function (req, res, next) {

    res.render('registerAdmin', { layout: 'loginadmin' })
});
router.get('/logoutAdmin', (req, res, next) => {
    req.session.destroy(()=>{
        
        req.logout();
        // console.log(req.session)
        res.redirect('/loginAdmin');
    })

});
router.get('/forgetPasswordAdmin',(req,res)=>{
    const messages = req.flash('notification');
    res.render('forgetPasswordAdmin',{layout:'loginadmin',messages:messages,hasErrors: messages.length > 0})
})
router.post('/forgetPasswordAdmin',async(req,res)=>{
   
    const {email} = req.body
    const result = await Admin.findOne({username:email})
    const secret = 'Secret Key'
    if(result){
        const payload = {
            username: result.username,
            id:result._id
        }
        console.log(payload)
        const token = jwt.sign(payload,secret)
        result.token = token
        
        await result.save()

        const link = `http://localhost:3000/resetPasswordAdmin/?token=${token}`
        sendMail(email,link)
        req.flash('notification',`Please check your email to get link reset your password`)
        res.redirect('/forgetPasswordAdmin')
    }
    else{
        res.redirect('/forgetPasswordAdmin')
    }

    
    
    
})
router.get('/resetPasswordAdmin',(req,res)=>{
    // const {token} = req.params
    const secret = 'Secret Key'
    const {token} = req.query
 
    const decode = jwt.verify(token,secret)
    if(decode){
        res.render(`resetPasswordAdmin`,{layout:'loginadmin'})
    }
    else{
        res.redirect('/forgetPasswordAdmin')
    }
    
})

router.post('/resetPasswordAdmin',async (req,res)=>{
    const {token} = req.query
    const {password} = req.body
    const secret = 'Secret Key'

 
    const decode = jwt.verify(token,secret)
    if(decode){
        const user = await Admin.findOne({_id:decode.id})
        const saltHash = genPassword(password);

        const salt = saltHash.salt;
        const hash = saltHash.hash;
        user.hash = hash
        user.salt = salt
        await user.save()
        req.flash('Change password success','You changed your password successful')
        res.redirect('/loginAdmin')
    }
    else{
        res.redirect('/forgetPasswordAdmin')
    }

    
})
module.exports = router;
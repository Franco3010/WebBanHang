const router = require('express').Router();
// const { query } = require('express');
const res = require('express/lib/response');
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const jwt = require('jsonwebtoken')
const connection = require('../config/database');
const connectionProduct = require('../model/product')
const User = connection.models.User;
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;
const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017'
const { body, validationResult } = require('express-validator');
const { isnotAuth } = require('./authMiddleware');
const Cart = require('/ProjTN/src/model/cart')
const express = require('express')
const app = express()
const paypal = require('paypal-rest-sdk');
// const { find } = require('/ProjTN/src/model/product.js');
const Order = connection.models.Order;
const nodemailer = require('nodemailer')
// const Comment = connection.models.Comment;
const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/shopping')
mongoose.connect('mongodb://localhost:27017/Newtest')
const Product = require('/ProjTN/src/model/product.js');

/**
* -------------- POST ROUTES ----------------
*/
var cart = new Cart({});
let productDetail = {}
let idProduct 
let sum = 0 



paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AYDRzGlfFxq61ntD0MuERaA631GRko2x0OoeDQFcgJSIxZ8_evkel7vQ_ABiwpt-hKUhIZZPhJiiwCtz',
  'client_secret': 'EE8MCC0_k-8UuckvKbQOVNRRsywfA7v-JuDh1pCAEnnmCFjkFYQkgXwECcyfMOhAaoNLJnDDKKTAzytc'
});
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
router.post('/login', passport.authenticate('localuser', { failureRedirect: '/login', successRedirect: 'home' }), (req, res) => {
});

router.post('/register',

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
            res.redirect('/register')
        }
        User.findOne({ username: req.body.uname })
            .then((user) => {

                if (user) {
                    req.flash('error', 'user da ton tai');
                    res.redirect('/register')
                }
                if (!user) {

                    const saltHash = genPassword(req.body.pw);

                    const salt = saltHash.salt;
                    const hash = saltHash.hash;

                    const newUser = new User({
                        username: req.body.uname,
                        hash: hash,
                        salt: salt,
                        admin: true,
                        address:'',
                        phoneNumber:''
                    });

                    newUser.save()
                        .then((user) => {
                            console.log('newUser' + user);
                        });

                    res.redirect('/login');

                }


            })
            .catch((err) => {
                done(err);
            });



    });


/**
* -------------- GET ROUTES ----------------
*/

router.get('/', (req, res, next) => {
    res.send('<h1>Home</h1><p>Please <a href="/register">register</a></p>');
});
router.get('/login', (req, res, next) => {
    var messages = req.flash('error');
    var successMessages = req.flash('Change password success')
    res.render('login', { messages: messages, hasErrors: messages.length > 0,successMessages:successMessages,hasSuccess:successMessages.length>0 });



});

// When you visit http://localhost:3000/login, you will see "Login Page"
router.get('/home', function (req, res, next) {
    console.log('req.user hompage',req.user)
    var successMsg = req.flash('success')[0];
    let storeDoc = []
    mongo.connect(url, (err, db) => {
        let dbo = db.db('Newtest')
        let cusor = dbo.collection('products').find()
        cusor.forEach(function (doc, err) {
            storeDoc.push(doc)
        }, function () {
            storeDoc = storeDoc.sort((a,b)=>b.purchase_number -a.purchase_number)
            storeDoc = storeDoc.slice(0,4)
            for(let i = 0; i< storeDoc.length;i++){
                storeDoc[i].price = storeDoc[i].price.toLocaleString()
            }
            db.close()
            res.render('home', { products: storeDoc ,successMsg: successMsg,noMessages: !successMsg})
        })
    })

});

// When you visit http://localhost:3000/register, you will see "Register Page"
router.get('/register', (req, res, next) => {

    var messages = req.flash('error');
    res.render('register', { messages: messages, hasErrors: messages.length > 0 });

    // if(req.isAuthenticated){
    //     res.redirect('/home')
    // }


});



/**
 * Lookup how to authenticate users on routes with Local Strategy
 * Google Search: "How to use Express Passport Local Strategy"
 * 
 * Also, look up what behaviour express session has without a maxage set
 */
router.get('/protected-route', isAuth, (req, res, next) => {
    res.send('You made it to the route.');
});

router.get('/admin-route', isAdmin, (req, res, next) => {
    res.send('You made it to the admin route.');
});

// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
  
    req.logout();
    req.session.cart = null
    req.session.passport = null
    res.redirect('/home');
});

router.get('/login-success', (req, res, next) => {
    res.send('<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>');
});

router.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});

router.get('/add-to-cart/:title', function (req, res, next) {
    if (!req.session.passport) {
       return  res.redirect('/login');
    }
    var productTitle = req.params.title;
    mongo.connect(url, (err, db) => {
        let dbo = db.db('Newtest')
        dbo.collection('products').findOne({ title: productTitle }, (err, product) => {
            cart.add(product, product.title);
            req.session.cart = cart;
            req.session.save()
            db.close()
        },
            res.redirect('/productDetail')

        )



    }

    )

});
router.get('/shopping-cart', function (req, res, next) {
    if (!req.session.passport) {
        return res.redirect('/login');
    }
    if (!req.session.cart) {
        return res.render('shopping-cart', {products: null});
    }
    res.render('shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
});
router.get('/checkout', function(req, res, next) {
    if (!req.session.cart) {
        return res.redirect('/shopping-cart');
    }
    var errMsg = req.flash('error')[0];
    res.render('checkout', {total: cart.totalPrice, errMsg: errMsg, noError: !errMsg});
});

router.post('/pay', (req, res) => {
    const toUSD = 23360
    let cartModify = []
    for(const key in cart.items){
        const value = (cart.items[key].price/cart.items[key].qty)/toUSD
        cartModify.push({"name":key,"price":`${Math.round(value * 10) / 10}`,"quantity":cart.items[key].qty, "currency": "USD"})
    }
    cartModify.forEach(item=>{
        sum = sum + item.price * item.quantity
    })
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/sucess",
          "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": cartModify
          },
          "amount": {
              "currency": "USD",
              "total": `${sum}`
          },
          "description": "Hat for the best team ever"
      }]
  };
//   console.log('transaction items ',cartModify)
//   console.log('transaction items total',create_payment_json.transactions[0].amount)

//   console.log('cart',cart)
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });

  
  });
  router.get('/sucess', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    cart.totalPrice = sum
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": cart.totalPrice
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          const paymentInfo = payment.payer. payer_info.shipping_address
            var order = new Order({
            username: req.user.username,
            cart: cart,
            address: paymentInfo.line1+' '+ paymentInfo.city,
            name: paymentInfo.recipient_name,
            paymentId: paymentId,
            status:'Đang giao',
            arriveDate: new Date(new Date().getTime()+(7*24*60*60*1000)).toLocaleDateString("en-US")
        });
        order.save()
        .then((result) => {
            console.log('order' + result);
        });
        req.flash('success', 'Successfully bought product!');
        req.session.cart = {}
        cart = new Cart({})
        sum = 0
        res.redirect('/home');
    

      }
  });
  });
  router.get('/findProduct/:nameProduct',function (req,res,next){
    const search = req.params.nameProduct
    const storeFind = []
    mongo.connect(url, (err, db) => {
        let dbo = db.db('shopping')
        let cusor = dbo.collection('products').find({title: new RegExp(search, 'i')})
        cusor.forEach(function (doc, err) {
            storeFind.push(doc)
            
        }, function(){
            db.close()
            return res.json(storeFind)
        }
        
        )

    })
   })

  router.get('/cancel', (req, res) => res.send('Cancelled'));

  router.get('/profile',  function (req, res, next) {
    if (!req.user) {
       return res.redirect('/login');
    }
    let totalPrice = 0
    let totalPriceInVND
    Order.find({username: req.session.passport.user}, function(err, orders) {
        if (err) {
            return res.write('Error!');
        }
        var cart;
        
        orders.forEach(function(order) {
            cart = new Cart(order.cart);
            order.items = cart.generateArray();
            // console.log('order.items',order.items)
            order.items.forEach(element=>{
                element.price = element.price.toLocaleString()
            })
            // order.price = order.price.toLocaleString()
        });
         orders.forEach(order=>{
            totalPrice = totalPrice + order.cart.totalPrice
            
         })
         totalPriceInVND = (totalPrice * 23360).toLocaleString()
        res.render('profile', { orders: orders,totalPrice:totalPrice,totalPriceInVND:totalPriceInVND });
    });
});
router.post('/comment',async (req,res)=>{
    const commentBody = req.body.comment
    const user = req.user

 

    let newComment = {
        detail:commentBody,
        datePost:new Date(),
        username:user.username,
        userid:user._id,
        datediff:'1 giây trước'

    }
          
    const product = await Product.findOne({_id:idProduct})
    product.comment.push(newComment)
    await product.save()
    productDetail.comment = product.comment
    res.redirect('/productDetail')
})

router.post('/changeProfile',(req,res)=>{
    mongo.connect(url, (err, db) => {
        let dbo = db.db('Newtest')
        var myquery = { username: req.body.username }; //req.user.username
        var newvalues = { $set: {username: req.body.username, address: req.body.address,phoneNumber:req.body.phoneNumber } };
       dbo.collection('users').updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        db.close();
      });
      
    })
    return res.json('success')
})
router.get('/productDetail/:title',async (req,res)=>{
    var idParam = req.params.title
    
 

    const product = await Product.findOne({title:idParam})

            productDetail.title = product.title
            productDetail.description = product.description
            productDetail.totalRate = product.rateOneStar + product.rateTwoStar + product.rateThreeStar + product.rateFourStar + product.rateFiveStar
            productDetail.purchase_number = product.purchase_number
            productDetail.price = product.price.toLocaleString()
            productDetail.imagePath = product.imagePath
            productDetail.detail = product.productDetail
            productDetail.comment = product.comment
            idProduct = product._id
            res.redirect('/productDetail')

        
        
        


        



    

     






})
router.get('/productDetail',async (req,res)=>{
    const second = 1000
    const min = 60*1000
    const hour = 3600*1000
    const day = 3600*1000*24
    const week = day *7
    const month = day *30
    
    if(productDetail.comment.length>0){
        productDetail.comment.forEach(newComment=>{
            const t1 = newComment.datePost.getTime()
            const t2 = new Date().getTime()
            const diff = t2 - t1
            if(diff<min&& diff>second){
                const secondago = Math.floor(diff/second)
                newComment.datediff = secondago + ' giây trước'
            }
            if(diff<hour&& diff>min){
                const minago = Math.floor(diff/min)
                newComment.datediff = minago + ' phút trước'
            }
            if(diff<day&& diff>hour){
                const hourago = Math.floor(diff/hour)
                newComment.datediff = hourago + ' giờ trước'
            }
            else if(diff<week&& diff>day){
                const dayago = Math.floor(diff/day)
                newComment.datediff = dayago + ' ngày trước'
            }
            else if(diff<month&& diff>week){
                const weeksago = Math.floor(diff/week)
                newComment.datediff  = weeksago + ' tuần trước'
            }
        })
     
    }
    const product = await Product.findOne({_id:idProduct})
    product.comment = productDetail.comment 
    await product.save()
   

    res.render('productDetail',{productDetail:productDetail})
})

router.get('/reduce/:title', function(req, res, next) {
    var productId = req.params.title;
    cart.reduceByOne(productId);
    req.session.cart = cart;
    req.session.save()
    res.redirect('/shopping-cart');
});

router.get('/remove/:id', function(req, res, next) {
    var productId = req.params.id;
    // var cart = new Cart(req.session.cart ? req.session.cart : {});

    cart.removeItem(productId);
    req.session.cart = cart;
    req.session.save()
    res.redirect('/shopping-cart');
});
router.get('/saveDeliveryInfor',async function(req, res, next) {
    const id = req.query.id
    const realName = req.query.realName;
    const address = req.query.address;
    const phoneNumber = req.query.phoneNumber;
   User.findOne({_id:id},async (err,result)=>{
    result.realName = realName
    result.address = address
    result.phoneNumber = phoneNumber
    await result.save()
    res.json(result)
   })


});
router.get('/buySuccess',async function(req, res, next) {

    res.json('buy success')
  


});
router.get('/forgetPassword',(req,res)=>{
    const messages = req.flash('notification');
    res.render('forgetPassword',{messages:messages,hasErrors: messages.length > 0})
})
router.post('/forgetPassword',async(req,res)=>{
    const {email} = req.body
    const result = await User.findOne({username:email})
    const secret = 'Secret Key'
    if(result){
        const payload = {
            username: result.username,
            id:result._id
        }
        const token = jwt.sign(payload,secret)
        result.token = token
        await result.save()
        const link = `http://localhost:3000/resetPassword/?token=${token}`
        sendMail(email,link)
        req.flash('notification',`Please check your email to get link reset your password`)
        res.redirect('/forgetPassword')
    }
    else{
        res.redirect('/forgetPassword')
    }

    
    
    
})
router.get('/resetPassword',(req,res)=>{
    // const {token} = req.params
    const secret = 'Secret Key'
    const {token} = req.query
 
    const decode = jwt.verify(token,secret)
    if(decode){
        res.render(`resetPassword`)
    }
    else{
        res.redirect('/forgetPassword')
    }
    
})

router.post('/resetPassword',async (req,res)=>{
    const {token} = req.query
    const {password} = req.body
    const secret = 'Secret Key'

 
    const decode = jwt.verify(token,secret)
    if(decode){
        const user = await User.findOne({_id:decode.id})
        const saltHash = genPassword(password);

        const salt = saltHash.salt;
        const hash = saltHash.hash;
        user.hash = hash
        user.salt = salt
        await user.save()
        req.flash('Change password success','You changed your password successful')
        res.redirect('/login')
    }
    else{
        res.redirect('/forgetPassword')
    }

    
})
router.get('/listProduct',(req,res)=>{
    res.render('allProduct',{layout:'productLayout'})
    
})



module.exports = router;








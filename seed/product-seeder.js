
var Product = require('../model/product.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/Newtest');

var products = [
    new Product({
        index:6,
        imagePath: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/IPhone_6_op_tafel.jpg',
        title: 'Iphone 6',
        description: 'Awesome Game!!!!',
        price: 10,
        comment:['62ab0158cf793808b92afffc','62ab01772b6f70f5e3a0c236']     
  
    
   
    }),
    new Product({
        index:1,
        imagePath: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/IPhone_6_op_tafel.jpg',
        title: 'Iphone 6',
        description: 'Awesome Game!!!!',
        price: 10     
  
    
   
    }),
    new Product({
        index:2,
        imagePath: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/IPhone_6_op_tafel.jpg',
        title: 'Iphone 6',
        description: 'Awesome Game!!!!',
        price: 10     
  
    
   
    }),
    new Product({
        index:3,
        imagePath: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/IPhone_6_op_tafel.jpg',
        title: 'Iphone 6',
        description: 'Awesome Game!!!!',
        price: 10     
  
    
   
    })
];

var done = 0;
for (var i = 0; i < products.length; i++) {
    products[i].save(function(err, result) {
        done++;
        if (done === products.length) {
            exit();
        }
    });
}

function exit() {
    mongoose.disconnect();
}
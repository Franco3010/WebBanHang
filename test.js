var someDate = new Date(new Date().getTime()+(5*24*60*60*1000)).toLocaleDateString("en-US");
// someDate.setDate(someDate.getDate() + 6)
// someDate.toLocaleDateString("en-US")
// console.log(someDate.getDate())
// var numberOfDaysToAdd = 6;
// someDate.setDate(someDate.getDate() + numberOfDaysToAdd);
// var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

console.log(someDate)
// const finalDate = someDate.getUTCDay() + '/' + someDate.getUTCMonth() 
// console.log(finalDate)
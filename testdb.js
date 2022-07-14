let arr = []
const object = {
    'item1':{
        value:1
    },
    'item2':[
        {
            value1 : '1',
            value2: '2'
        },
        {
            value3 : '3',
            value4: '4'
        }
    ]
}
object.item2.forEach(element =>{
    element.value5 = '5'
})
console.log(object)
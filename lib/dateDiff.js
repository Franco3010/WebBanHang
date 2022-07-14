module.exports = {
    hourDiff: (t1,t2)=>{
        const d1 = t1.getTime()
        const d2 = t2.getTime()
        return Math.floor((d2-d1)/(3600*1000))
    },
    dayDiff:(t1,t2)=>{
        const d1 = t1.getTime()
        const d2 = t2.getTime()
        return Math.floor((d2-d1)/(24*3600*1000))
    },
    weekDiff:(t1,t2)=>{
        const d1 = t1.getTime()
        const d2 = t2.getTime()
        return Math.floor((d2-d1)/(7*24*3600*1000))
    }
    
}
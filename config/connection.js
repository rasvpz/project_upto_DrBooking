var MongoClient = require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    const url = 'mongodb://localhost:27017'
    const dbname ='bigOproject'
    MongoClient.connect(url,(err, data)=>{
        state.db=data.db(dbname)
        done()
    })    
}
module.exports.get=function(){
    return state.db
}
var MongoClient = require('mongodb').MongoClient
const state={
    db:null
}
module.exports.connect=function(done){
    
    const url = `mongodb+srv://bigoAtlas:${process.env.MONGO_URI}@bigo.tpoon.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    const dbname ='bigOproject'

    MongoClient.connect(url,(err, data)=>{
        if(err)return done(err)
        state.db=data.db(dbname)
        done()
    })    
}
module.exports.get=function(){
    return state.db
}
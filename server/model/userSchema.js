const mongoose = require("mongoose")
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    name  :{
        type : String ,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    departement  :{
        type : String ,
        required : true
    },
    password  :{
        type : String ,
        required : true
    },
    cpassword  :{
        type : String ,
        required : true
    },
    tokens : [
        {
            token : {
                type : String ,
                required : true
            }
        }
    ]
})

// generating token
userSchema.methods.generateAuthToken = async function(){
    try{
        let token = jwt.sign({_id : this._id},process.env.SECRET_KEY)
        this.tokens = this.tokens.concat({token : token}) 
        await this.save()
        return token
    }catch(err){
        console.log(err);
    }
}

const User = mongoose.model('user',userSchema)

module.exports = User
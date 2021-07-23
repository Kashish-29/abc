const express = require("express");
const dotenv = require("dotenv")
const bcrypt = require("bcrypt")

dotenv.config({path : '.env'})

require("./db/conn")
const User = require("./model/userSchema")

const app = express();
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Home")
})

app.get("/register",(req,res)=>{
    res.send("Register page")
})

app.post("/register",async (req,res)=>{
    const {name,email,departement,password,cpassword} = req.body
    if(!name||!email||!departement||!password||!cpassword)
        res.status(422).json({error:"Please fill the field"})
    try{
        const userExist = await User.findOne({email : email})
        // userExist will return whole each and every thing if found email same , else null
        if(userExist){
            return res.status(422).json({error: "Email already exist"})
        }
        else if(password !== cpassword){
            return res.status(422).json({error: "Passwords are not same"})
        }
        else{
            // New user making
            bcrypt.hash(password,10,function(err,hash){
                const newUser = new User({
                    name : name,
                    email : email,
                    departement : departement,                    
                    password : hash,
                    cpassword:hash
                })
                newUser.save((err)=>{
                    if(err){
                        console.log(err);
                    }
                    else { 
                        res.status(201).json({message: "added sucessfully"})
                    }
                })       
            })
        }
    }catch(err){
        console.log(err);
    }    
})

app.post("/login",async (req,res)=>{
    const{email,password} = req.body
    if(!email||!password){
        return res.status(422).json({"Message":"fill the field"})
    }

    try{
        let token
        const userLogin = await User.findOne({email : email})
        // console.log(userLogin);
        if(userLogin){
            const passMatch = await bcrypt.compare(password,userLogin.password)
            console.log(passMatch);
            token = await userLogin.generateAuthToken()

            // Store cookies
            res.cookie("jwtoken" ,token,{
                expires: new Date(Date.now() + 25892000),
                httpOnly : true
            })
            if(passMatch){
                return res.status(200).json({"Message" : "Welcome"})                
            }
            else{
                return res.status(400).json({"message" : "Invalid Credentials"})
            }
        }
        else{
            console.log("User not registered");
            return res.status(400).json({"message" : "User not registered"})            
        }
    }catch(err){
        console.log(err);
    }
})

app.get("/logout",(req,res)=>{
    console.log("logged out")
    res.clearCookie('jwtoken',{path:"/"})
    res.status(200).send("User Logged Out")
})

app.listen(process.env.PORT || 5000, () => console.log("Server started at port 5000"));
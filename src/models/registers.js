const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const EmpSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    gender: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    confirmpassword: {
        type: String,
        required: true
    },
    tokens :[{
        token:{
            type: String,
            required: true
        }

    }]
})
//generateAuthToken()
EmpSchema.methods.generateAuthToken = async function(){
    try{
        // console.log(this._id);
        const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        // console.log(token);
        return token;
    }catch(e){
        
        res.send("the error part is "+e);
        // console.log("the error part is "+e);

    }
}
// Hashing
EmpSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
       // const passwordHash = await bcrypt.hash(password, 10);
        // console.log(`The Curent password is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        this.confirmpassword = await bcrypt.hash(this.confirmpassword, 10);
        // console.log(`The Curent password is ${this.password}`);

        // this.confirmpassword = undefined;
       
    }
    next();
})

// create a Collection

const Register = new mongoose.model("Register", EmpSchema);

module.exports = Register;
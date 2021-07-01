require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");

require("./db/conn");

const Register = require("./models/registers")

const port = process.env.PORT || 3000;

const staticPath = path.join(__dirname, "../public");
const tempPath = path.join(__dirname, "../tempelets/views");
const partialsPath = path.join(__dirname, "../tempelets/partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }))
app.use(express.static(staticPath));
app.set("view engine", "hbs");
app.set("views", tempPath);
hbs.registerPartials(partialsPath);

// console.log(process.env.SECRET_KEY);
// console.log(path.join(__dirname,"../public"));

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/services", auth, (req, res) => {
    // console.log(`This is Cookie ${req.cookies.jwt}`);
    res.render("services");
});

app.get("/logout", auth, async (req, res) => {
    try {
        // console.log(req.user);
        req.user.tokens = req.user.tokens.filter((currElement) => {
            return currElement !== req.token;
        });
        res.clearCookie("jwt");
        console.log("Logged out Successfully");
        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
});
app.get("/logoutall", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        res.clearCookie("jwt");
        console.log("Logged out from all Devices Succsesfuly");
        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
});

app.get("/register", (req, res) => {
    res.render("register");
});
//login Check
app.get("/login", (req, res) => {
    res.render("login");
});

//Create A new User in Database

app.post("/user/register", async (req, res) => {
    try {
        const password = req.body.password;
        const confirmpassword = req.body.confirmpassword;
        if (password === confirmpassword) {
            const registerEmp = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: password,
                confirmpassword: confirmpassword
            })

            // console.log("the Succsess part is " + registerEmp);

            const token = await registerEmp.generateAuthToken();
            // console.log("the Token part is " + token);

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 9000000000),
                httpOnly: true
            });
            // console.log(cookie);

            // Password Hashing
            const registered = await registerEmp.save();
            res.status(201).render("indecs");

        } else {
            res.send("Password not matching")
        }
    } catch (e) {
        res.status(404).send(e);
    }

})
// Login Check
app.post("/user/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const useremail = await Register.findOne({ email: email });

        const isMatch = await bcrypt.compare(password, useremail.password);
        const token = await useremail.generateAuthToken();
        // console.log("the Token part of Login is " + token);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 9000000000),
            httpOnly: true
            //secure:true
        });

        if (isMatch) {
            res.status(201).render("indecs");
        }
        else {
            res.send("Oops! Invalid Login Detail ")
        }
    } catch (e) {
        res.status(400).send("Invalid Login Detail")
    }
});

app.listen(port, () => {
    console.log(`Srerver is running At port ${port}`);
})
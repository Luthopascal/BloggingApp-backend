//EVERYTHING THAT HAS TO BE IMPORTED INTO SERVER.JS
//EXPRESS
//MONGOOSE
//DOTENV
//ROUTES
//MODELS
//JWT TOKEN FOR AUTH
// npm i --save-dev nodemon in terminal to auto restart server on changes (npm run dev)



const express = require("express");// Import Express framework
const jwt = require('jsonwebtoken'); // Import JSON Web Token library for token generation and verification
require("dotenv").config(); // Load environment variables from .env file (our database connection string)
const dotenv = require("dotenv");
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, 'BACKEND', '.env') });

const connectDB = require("./Config/database"); // Import database connection function
//const express = require("express");
const authroutes = require("./Routers/authRoute"); // Import authentication routes
connectDB(); // Connect to the database

const app = express(); // Create an Express application (initialise app)
const cors = require('cors'); // Import CORS middleware to handle Cross-Origin Resource Sharing
app.use(express.json()); // Middleware to parse JSON request bodies
//NEEDED TO PARSE(EXAMINE / ANALYSE) JSON DATA FROM REQUESTS
// MIDDLEWARE THAT ALLOWS JSON TO BE READ AND UNDERSTOOD BY THE SERVER IN REQUEST BODIES (FROM JSON TO JAVASCRIPT OBJECTS)

app.use(cors()); // Enable CORS for all routes


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadDir = path.join(__dirname, 'uploads', 'blog-covers');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Created uploads/blog-covers directory')
}

const startServer = async () => {
    try {
      await connectDB();
app.listen(process.env.PORT, () => { // Start the server and listen on the specified port from environment variables
    console.log(`Server is running on port http://localhost:${process.env.PORT}`); // VALUE OF PORT FROM .ENV FILE
}); // Log a message when the server starts
} catch (err) {
  console.error("Failed to connect to DB", err);
}
};

startServer(); // Start everything

//ROUTES


//home route
 app.get("/",(req,res) =>{
  res.status(200).json ({
    success: true,
    message: "API is working",
  })
 })


 //token route

 app.get('/token',async (req,res)=>{ // Route to generate and return a JWT token
    let data = {
        "email": 'Lutho@gmail.com',
        "Username": 'Lutho,' // explain code
    }
   const token = jwt.sign(data,'mysecret', {expiresIn: '1h'}) // Generate a JWT token with a secret key and expiration time
res.status(200).json({
    success: true,
    token: token
})  //succesfully created token
 })// the above is the data kept in the secret token ( keeps the email and username safe)
 


//token verification route
app.get('/token/:jwtToken',async (req,res)=>{// added in the url parameter ( :jwt
try {
const {jwtToken} = req.params; // Extract the JWT token from the URL parameters
const decoded = jwt.verify(jwtToken,'mysecret') // Verify the token using the same secret key . 
res.status(200).json({
    decoded
})
}
catch (error){
    res.status(401).json({
        success: false,
        message: "Token is invalid or has expired"
    });
}
} ) 
 // we need to verify and authenticate the token. Due to expiry



 app.use('/api/v1/auth', authroutes); // Use authentication routes for /api/v1/auth endpoint //MIDDLEWARE USES THE /api/v1/auth + THE AUTHROUTES FROM THE authRoute.js FILE

   
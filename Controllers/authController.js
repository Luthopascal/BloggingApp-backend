//only write code to controll authorization and authentication

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../Models (Database schema)/User");
const BlogPost = require("../Models (Database schema)/Blogs");
const mongoose = require("mongoose");
const TokenBlacklist = require ("../Models (Database schema)/TokenBlacklist")

const AuthMiddleware = require("../Middleware/authMiddleware");
//const User = require('../models/User'); // if you want to save to DB
//const bcrypt = require('bcryptjs');     // if you want to hash password



// Function to handle user registration

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Optional: check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Save password directly (NOT hashed)
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



//login function
const loginUser = async (req,res) =>{
   try{
    const {email,password} =req.body; // whats needed to login

    //Validation and authentication. MAKE SURE THE CREDENTIALS ARE CORRECT
    
    const user = await User.findOne({email}); //check if user exists
    if (!user){ // if not user
      return res.status(400).json({
        success: false,
        message: 'Invalid email'
      });
    }

    if (user.password !== password) { // check password
      return res.status(400).json({
        success: false,
        message: 'Invalid password'
      });
    }
// if the user exists and password matches create a token
const token = jwt.sign({id:user._id}, "LNXsecret", {expiresIn:'1h'})    //creates token    //the '_id' is the unique ID in the database (you can also take email,only unique identifiers) , LNXsecRet is the secret key to sign the token (should be in env variable in real apps)

    return res.status(200).json({ //token sent to front end
      token
      
    });
  

   } catch(err){
           res.status(500).json({ //server error

      success: false,
      message: err.message
           })


   }


}


//PUT A BLOG POST (CREATE NEW BLOG POST) (protected route)
const NewPost = async (req,res) => {
  try {
    const {title,content} = req.body;
    //validation
    if (!title || !content){
      return res.status(400).json({
        success:false,
        message: 'All fields are required'
      })
    }
    const author = req.user_id; // get from JWT, not body

    const newBlogPost = new BlogPost ({ //take data from request body ans save it in new blog post and save to DB
      title,
      content,
      author
    });  await newBlogPost.save(); //save to DB
    return res.status(201).json({
      success: true,
      message: 'Blog post created successfully',
      data: newBlogPost});
  }
  catch(err){
    return res.status(500).json({
      success: false,
      message: err.message
    })
  }
}

//GET A BLOG POST (protected route)
const blogPost = async (req, res) => {
  try {
    const { id } = req.params; // get id from URL
    console.log("ID from params:", id);

    // Validate that it's a proper MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog post ID'
      });
    }

    const post = await BlogPost.findById(id).populate('author', 'name email'); // optional: populate author
    console.log('Found post:', post); // Debug

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: post
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


//LOG USER OUT (blacklist token)
const logoutUser = async (req, res) => {
  try {
    // Extract the 'Authorization' header (expected format: "Bearer <token>")
    const BearerToken = req.headers['authorization'];

    if (!BearerToken) {
      return res.status(401).json({
        success: false,
        message: 'You are not authorized.'
      });
    }

    const token = BearerToken.split(' ')[1];

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token missing' });
    }

    // Decode the token (without verifying) to access its payload and expiry
    const decoded = require('jsonwebtoken').decode(token);

    // Validate that the decoded token contains an expiration field
    if (!decoded || !decoded.exp) {
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }

    // Convert the token's expiration timestamp (in seconds) to a JS Date
    const expiresAt = new Date(decoded.exp * 1000);

    // Save the token to the blacklist collection with its expiry time
    await TokenBlacklist.create({ token, expiresAt });

    // Respond with a success message
    return res.status(200).json({ success: true, message: 'Logged out successfully' });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

//UPDATE BLOG POST WITH AUTHORIZATION (protected route)

const updateblogposts = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, imageUrl } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog post ID'
      });
    }

    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Blog post not found'
      });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this post'
      });
    }

    if (title) post.title = title;
    if (subtitle) post.subtitle = subtitle;
    if (content) post.content = content;
    if (imageUrl) post.imageUrl = imageUrl;

    await post.save();

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully',
      data: post
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


//delete blog post function can be added similarly
const deleteBlogPost = async (req, res) => {
 try{

const { id } = req.params; // object ID
const blog = await BlogPost.findByIdAndDelete(req.params.id);
if (!blog) {
  return res.status(404).json({ success: false, message: 'Blog post not found' });
}

if (blog.author.toString() !== req.user.id) {
  return res.status(403).json({
    success: false,
    message: 'You are not authorized to update this post'
  });
} //checks if its the actual author before deleting.



return res.status(200).json({success:true, message: 'Blog post deleted successfully' });

 } catch(err){
  return res.status(500).json({
    success: false,
    message: err.message
  });
  // Implementation for deleting a blog post
}};


//Get all the blog posts


// GET all blog posts
const getAllBlogs = async (req, res) => {
  try {
    // Fetch all blogs and populate the author info if you want
    const blogs = await BlogPost.find().populate("author", "username email");

    if (!blogs || blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No blog posts found",
      });
    }

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};





// Export the function AFTER defining it
module.exports = { registerUser , loginUser, blogPost, NewPost, logoutUser, updateblogposts,deleteBlogPost, getAllBlogs}; // export both and import into routes file

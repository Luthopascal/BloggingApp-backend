// all routes are defined here
const express = require("express");
const mongoose = require("mongoose");

//const {register} = require("../Controllers/authController");
const { registerUser, loginUser, NewPost , blogPost, logoutUser, updateblogposts, deleteBlogPost, getAllBlogs} = require("../../Controllers/authController"); // Import the register function from the authController
//const { } = require("../../Middleware/authMiddleware"); // Import the authMiddleware (not used here but can be applied to protect routes)
const authMiddleware = require("../../Middleware/authMiddleware");

const router = express.Router(); // Create a new router object

router.post("/register", registerUser)  // Define a POST route for user registration

router.post("/login",loginUser)  // Define a POST route for user login (functionality to be implemented)

router.post("/NewBlogPost",authMiddleware, NewPost)  // Define a POST route for creating a new blog post (functionality to be implemented)

router.get('/BlogPost/:id',authMiddleware, blogPost)  // Define a GET route for fetching a blog post by title (functionality to be implemented)

router.post('/logout', authMiddleware, logoutUser); // Define a POST route for user logout (functionality to be implemented)

router.post('/UpdatePost/:id', authMiddleware, updateblogposts); // edit the blog post by id

router.delete('/DeletePost/:id', authMiddleware, deleteBlogPost); // delete the blog post by id (functionality to be implemented)

router.get('/AllBlogs',authMiddleware, getAllBlogs); // get all the blog posts



module.exports = router; // Export the router to be used in other parts of the application
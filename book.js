const router = require("express").Router();
const User = require("../models/user");
const jwt=require("jsonwebtoken");
const Book = require("../models/book");
const { authenticateToken } = require("./userAuth");

// Add book (Admin only)
router.post("/add-book", authenticateToken, async (req, res) => {
    try {
        console.log("Received request to add book:", req.body); // ✅ Debugging log

        const { id } = req.headers;
        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        console.log("Fetching user with ID:", id);
        const user = await User.findById(id);

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: "User not found" });
        }

        if (user.role !== "admin") {
            console.log("Unauthorized access attempt by:", user.email);
            return res.status(403).json({ message: "You don't have access to perform admin work" });
        }

        // Check if required fields are present
        if (!req.body.url || !req.body.title || !req.body.author || !req.body.price || !req.body.disc || !req.body.language) {
            console.log("Missing required fields:", req.body);
            return res.status(400).json({ message: "All fields are required" });
        }

        console.log("Creating new book...");
        const book = new Book({
            url: req.body.url,
            title: req.body.title,
            author: req.body.author,
            price: req.body.price,
            disc: req.body.disc,  // ✅ Fixed field name
            language: req.body.language,
        });

        await book.save();
        console.log("Book added successfully");
        res.status(200).json({ message: "Book added successfully" });

    } catch (error) {
        console.error("Error adding book:", error); // ✅ Log the full error
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});



//update-book
router.put("/update-book",authenticateToken,async(req,res)=>{
    try {
        const {bookid}=req.headers;
        await Book.findByIdAndUpdate(bookid,{
            url:req.body.url,
            title:req.body.title,
            author:req.body.author,
            price:req.body.price,
            disc:req.body.disc,
            language:req.body.language,

        });
        return res.status(200).json({message:"Book updated successfilly!"});
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"An error occurred"});
        
    }
});



//delete book
router.delete("/delete-book",authenticateToken,async (req,res)=>{
    try {
        const{bookid}=req.headers;
        await Book.findByIdAndDelete(bookid);
        return res.status(200).json({
            message:"Book delete successfully",
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"an error occured"});
        
    }
});


//get all books 
router.get("/get-all-books",async(req,res)=>{
    try {
        const books=await Book.find().sort({createdAT:-1});
        return res.json({
            status:"success",
            data:books,
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"An error occured"});
    }
})


//get recent addede books limit 4
router.get("/get-recent-books",async(req,res)=>{
    try {
        const books=await Book.find().sort({createdAT:-1}).limit(4);
        return res.json({
            status:"succes",
            data:books,
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"an error occured"});
    }
});


//get book by id
router.get("/get-book-by-id/:id",async(req,res)=>{
    try {
        const {id}=req.params;
        const book=await Book.findById(id);
        return res.json({
            status:"succes",
            data:book,
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"an error occured"});
        
    }
})




module.exports = router;

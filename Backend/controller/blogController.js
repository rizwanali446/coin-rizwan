const Joi = require("joi");

const fs = require("fs");
const Blog = require("../models/blog");
const User = require("../models/user");
const { BACKEND_SERVER_PATH } = require("../config/env");
const BlogDTO = require("../Dto/blog");
const { json } = require("express");
const UserDTO = require("../Dto/dtouser");
const Comment = require("../models/comment");

const mongodbIdPattern = /^[0-9a-fA-F]{24}$/;

const blogController = {
  async create(req, res, next) {
    //1 validate request body   3:35:00
    //2 handle photo storage
    //3 add to blog record to db
    //4 return responce

    //  ///  start below here    \\\\\
    //1 validate request body

    const createBlogSchema = Joi.object({
      title: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
      content: Joi.string().required(),
      //come to clientside base64 encoded string form and in backend we decode-- and store ---> save photpath to db
      photo: Joi.string().required(),
    });
    const { error } = createBlogSchema.validate(req.body);
    // here we set same error code as we done in previous authController.js
    if (error) {
      return next(error);
    }

    //2 handle photo storage
    const { title, author, content, photo } = req.body;

    //read photo as buffer in backend node.js
    const buffer = Buffer.from(
      photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
      "base64"
    );

    //allot a random name to photo
    const imagePath = `${Date.now()}-${author}.png`;
    // save locally by fs nd try catch method
    try {
      fs.writeFileSync(`storage/${imagePath}`, buffer);
    } catch (error) {
      return next(error);
    }

    //3 add to blog record to db
    //save blog in db
    let newBlog;

    try {
      newBlog = new Blog({
        title,
        author,
        content,
        photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
      });
      await newBlog.save();
    } catch (error) {
      return next(error);
    }
    const blogDto = new BlogDTO(newBlog);

    return res.status(201).json({ blog: blogDto });
  },
  // Here below code we dont validate our blog we just get or recieved allblogs  by find({});

  async getAll(req, res, next) {
    try {
      const blogs = await Blog.find({});
      const blogsDto = [];
      for (let i = 0; i < blogs.length; i++) {
        const blogDto = new BlogDTO(blogs[i]);

        blogsDto.push(blogDto);
      }
      return res.status(200).json({ blogs: blogsDto });
    } catch (error) {
      return next(error);
    }
  },
  async getById(req, res, next) {
    // validate blog by id
    const getByIdSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });
    const { error } = getByIdSchema.validate(req.params);
    if (error) {
      return next(error);
    }
    let blog;
    let user;
    const { id } = req.params;
    try {
      blog = await Blog.findOne({ _id: id });
      //here we write below code to find authoDetails to fetch user details
      user = await User.findOne({ _id: blog.author });
      const userDto = new UserDTO(user);
      blog.authorDetail = userDto;
    } catch (error) {
      return next(error);
    }
    // console.log(`${id} - ${blog._id}, ${blog.author}, ${blog.content}`);
    // send responce
    const blogDto = new BlogDTO(blog);
    return res.status(200).json({ blog: blogDto });
  },
  async update(req, res, next) {
    // Validate blog updation
    const updateBlogSchema = Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      author: Joi.string().regex(mongodbIdPattern).required(),
      blogId: Joi.string().regex(mongodbIdPattern).required(),
      photo: Joi.string(),
    });
    const { error } = updateBlogSchema.validate(req.body);
    const { title, content, author, blogId, photo } = req.body;
    // delete previous photo
    // save new photo
    let blog;
    try {
      blog = await Blog.findOne({ _id: blogId });
    } catch (error) {
      return next(error);
    }
    if (photo) {
      let previousPhoto = blogs.photoPath;
      previousPhoto = previousPhoto.split("/").at(-1); //ajflksjfl.jpg
      //delete photo
      fs.unlinkSync(`storage/${previousPhoto}`);
      //read photo as buffer in backend node.js
      const buffer = Buffer.from(
        photo.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""),
        "base64"
      );

      //allot a random name to photo
      const imagePath = `${Date.now()}-${author}.png`;
      // save locally by fs nd try catch method
      try {
        fs.writeFileSync(`storage/${imagePath}`, buffer);
      } catch (error) {
        return next(error);
      }
      await Blog.updateOne(
        { _id: blogId },
        {
          title,
          content,
          photoPath: `${BACKEND_SERVER_PATH}/storage/${imagePath}`,
        }
      );
    } else {
      await Blog.updateOne({ _id: blogId }, { title: content });
    }
    return res.status(200).json({ message: "blog updated:" });
  },
  //Now we last work our delete blog 4:30:00
  async delete(req, res, next) {
    // validate id
    //delete blog
    //delete comments on this blog

    //validate id start below
    const deleteBlogSchema = Joi.object({
      id: Joi.string().regex(mongodbIdPattern).required(),
    });
    const { error } = deleteBlogSchema.validate(req.params);
    const { id } = req.params;
    // delete blog
    //delete comments
    try {
      await Blog.deleteOne({ _id: id });
      await Comment.deleteMany({ blog: id });
    } catch (error) {
      return next(error);
    }
    return res.status(200).json({ message: "blog Deleted" });
  },
};

module.exports = blogController;

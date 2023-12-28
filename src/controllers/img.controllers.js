import express from "express";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import prisma from "../utils/prisma.js";
import { validateUser } from "../validators/users.js";
import { filter } from "../utils/common.js";

const router = express.Router();

// CREATE (POST)
router.post('/', async (req, res) => {
  const data = req.body;

  // Validate user data
  const validationErrors = validateUser(data);

  if (Object.keys(validationErrors).length !== 0) {
    return res.status(400).json({
      error: validationErrors
    });
  }

  // Hash the password
  data.password = bcrypt.hashSync(data.password, 8);

  // Create image using Prisma
  prisma.image.create({
    data: {
      // Adjust field names based on the schema
      UserID: data.UserID,
      price: data.price,
      filename: data.filename,
      title: data.title,
      description: data.description,
      url: data.url,
    }
  }).then(image => {
    // Return the relevant fields
    return res.json(filter(image, 'id', 'UserID', 'price', 'filename', 'title', 'description', 'url'));
  }).catch(err => {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      const formattedError = {};
      formattedError[`${err.meta.target[0]}`] = 'already taken';

      return res.status(500).json({
        error: formattedError
      });
    }
    throw err;
  });
});

// READ ALL (GET)
router.get('/', async (req, res) => {
    // Retrieve all images using Prisma
    const images = await prisma.image.findMany();
  
    return res.json(images.map(image => filter(image, 'id', 'UserID', 'price', 'filename', 'title', 'description', 'url')));
  });
  

// READ (GET)
router.get('/:id', async (req, res) => {
  const imageId = parseInt(req.params.id, 10);

  // Retrieve image by ID using Prisma
  const image = await prisma.image.findUnique({
    where: {
      id: imageId,
    },
  });

  if (!image) {
    return res.status(404).json({
      error: 'Image not found',
    });
  }

  return res.json(filter(image, 'id', 'UserID', 'price', 'filename', 'title', 'description', 'url'));
});

// UPDATE (PUT)
router.put('/:id', async (req, res) => {
  const imageId = parseInt(req.params.id, 10);
  const data = req.body;

  // Update image using Prisma
  const updatedImage = await prisma.image.update({
    where: {
      id: imageId,
    },
    data: {
      // Adjust field names based on the schema
      price: data.price,
      title: data.title,
      description: data.description,
    },
  });

  return res.json(filter(updatedImage, 'id', 'UserID', 'price', 'filename', 'title', 'description', 'url'));
});

// DELETE
router.delete('/:id', async (req, res) => {
  const imageId = parseInt(req.params.id, 10);

  // Delete image using Prisma
  await prisma.image.delete({
    where: {
      id: imageId,
    },
  });

  return res.json({
    message: 'Image deleted successfully',
  });
});

export default router;

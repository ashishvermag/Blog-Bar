import express from 'express';
import multer from 'multer';
import path from 'path'; // Node.js built-in module for working with file paths
const router = express.Router();

// 1. Configure storage for Multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Save files to the 'uploads' folder relative to the server's root
    cb(null, 'uploads/'); 
  },
  filename(req, file, cb) {
    // Generate a unique filename: fieldname-timestamp.ext
    // Example: image-1678888888888.jpeg
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// 2. Filter for image files
function checkFileType(file, cb) {
  const filetypes = /jpe?g|png|webp/; // Allowed extensions
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/; // Allowed MIME types

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // File type is good
  } else {
    cb('Images only!'); // Reject other file types
  }
}

// 3. Initialize Multer upload middleware
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 4. Define the POST route for image uploads
//    'image' is the name of the field in the form data that holds the file
router.post('/', upload.single('image'), (req, res) => {
  if (req.file) {
    // If upload is successful, send back the URL of the saved file
    // Example: /uploads/image-1678888888888.jpeg
    res.send(`http://localhost:3000/${req.file.path}`);
  } else {
    res.status(400).send('No image file uploaded.');
  }
});

export default router;
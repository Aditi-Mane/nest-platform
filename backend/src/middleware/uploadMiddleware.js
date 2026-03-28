import multer from "multer"

//file filter
const fileFilter = (req, file, cb) =>{
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG images allowed"), false);
  }
}

//multer instance creation
const upload = multer({
  storage: multer.memoryStorage(), 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export default upload
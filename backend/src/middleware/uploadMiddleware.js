import multer from "multer"

const storage = multer.diskStorage({ //later memoryStorage with AWS

  //where to save the file
  destination: (req, file, cb) =>{
    cb(null,"uploads/"); //cb(error, result) => callback
  },

  //what to name the file
  filename: (req, file, cb) =>{
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName); //save with this name, null = no errors
  }
})

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
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

export default upload
import multer from "multer"

//file filter
const fileFilter = (req, file, cb) =>{
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "image/heic",
    "image/heif",
  ];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"];
  const fileName = file.originalname?.toLowerCase() || "";
  const hasAllowedExtension = allowedExtensions.some((extension) =>
    fileName.endsWith(extension)
  );

  if (allowedMimeTypes.includes(file.mimetype) || hasAllowedExtension) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG, WEBP, HEIC, or HEIF images allowed"), false);
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

import multer from "multer";
 
/* Extends your existing upload middleware to also accept PDFs,
   using the same memoryStorage + manual uploadToS3 pattern     */
 
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
 
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG and PDF files are allowed"), false);
  }
};
 
const uploadEvidence = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5 MB per file — same as your existing middleware
    files: 3,                    // max 3 files — matches the frontend
  },
});
 
/* .array("evidence", 3) matches the FormData field name in the frontend */
export default uploadEvidence;
 
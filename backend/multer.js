require("dotenv").config(); 
const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cấu hình Multer Storage cho Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads", // Thư mục trên Cloudinary
        format: async (req, file) => "png", // Định dạng file (jpg, png, jpeg, v.v.)
        public_id: (req, file) => Date.now() + "-" + file.originalname, // Đặt tên file
    },
});

// Bộ lọc file chỉ chấp nhận hình ảnh
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"), false);
    }
};

// Khởi tạo Multer
const upload = multer({ storage, fileFilter });

module.exports = upload;

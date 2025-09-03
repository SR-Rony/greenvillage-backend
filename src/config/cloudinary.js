import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // e.g. "mycloudname"
  api_key: process.env.CLOUDINARY_API_KEY,       // e.g. "123456789012345"
  api_secret: process.env.CLOUDINARY_API_SECRET, // e.g. "abcdefg1234567"
  secure: true,
});

export default cloudinary;

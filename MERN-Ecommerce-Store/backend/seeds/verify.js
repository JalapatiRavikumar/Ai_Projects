import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "../models/product.model.js";

dotenv.config();

const categories = ["jeans", "t-shirts", "shoes", "glasses", "jackets", "suits", "bags"];

const run = async () => {
	await mongoose.connect(process.env.MONGO_URI);
	let total = 0;
	for (const c of categories) {
		const count = await Product.countDocuments({ category: c });
		total += count;
		console.log(`${c}: ${count}`);
	}
	console.log(`TOTAL: ${total}`);
	const featured = await Product.countDocuments({ isFeatured: true });
	console.log(`featured: ${featured}`);
	await mongoose.disconnect();
	process.exit(0);
};

run();

import mongoose from "mongoose";
import dotenv from "dotenv";
import Redis from "ioredis";

import Product from "../models/product.model.js";

dotenv.config();

// Category keys MUST match the hrefs used by the frontend HomePage:
// /jeans, /t-shirts, /shoes, /glasses, /jackets, /suits, /bags
// The `image` values point at the static files in frontend/public so they
// load correctly in the dev environment.
const categoryConfig = {
	jeans: {
		image: "/jeans.jpg",
		base: "Jeans",
		priceRange: [39, 120],
		adjectives: [
			"Slim Fit", "Skinny", "Straight Leg", "Bootcut", "Relaxed", "Tapered",
			"High Waist", "Distressed", "Stretch", "Raw Denim", "Vintage Wash",
			"Dark Wash", "Light Wash", "Acid Wash", "Selvedge",
		],
		colors: ["Indigo", "Black", "Charcoal", "Stone Blue", "Faded Grey", "Midnight"],
	},
	"t-shirts": {
		image: "/tshirts.jpg",
		base: "T-Shirt",
		priceRange: [12, 45],
		adjectives: [
			"Classic Crew", "V-Neck", "Oversized", "Graphic", "Pocket", "Striped",
			"Organic Cotton", "Performance", "Henley", "Longline", "Ringer",
			"Pima Cotton", "Slim Fit", "Relaxed", "Vintage",
		],
		colors: ["White", "Black", "Olive", "Navy", "Heather Grey", "Burgundy", "Sand"],
	},
	shoes: {
		image: "/shoes.jpg",
		base: "Shoes",
		priceRange: [49, 220],
		adjectives: [
			"Running", "Casual Sneaker", "Leather Loafer", "Hiking", "Canvas",
			"High-Top", "Low-Top", "Slip-On", "Trail", "Court", "Skate",
			"Chelsea Boot", "Derby", "Oxford", "Trainer",
		],
		colors: ["White", "Black", "Tan", "Grey", "Navy", "Olive", "Red"],
	},
	glasses: {
		image: "/glasses.png",
		base: "Glasses",
		priceRange: [25, 180],
		adjectives: [
			"Aviator", "Wayfarer", "Round", "Cat-Eye", "Square", "Rimless",
			"Polarized", "Blue Light", "Sport", "Oversized", "Browline",
			"Clubmaster", "Wraparound", "Retro", "Geometric",
		],
		colors: ["Black", "Tortoise", "Gold", "Silver", "Matte Grey", "Rose Gold", "Clear"],
	},
	jackets: {
		image: "/jackets.jpg",
		base: "Jacket",
		priceRange: [59, 320],
		adjectives: [
			"Denim", "Leather", "Bomber", "Puffer", "Windbreaker", "Parka",
			"Trucker", "Quilted", "Field", "Track", "Varsity", "Hooded",
			"Shearling", "Softshell", "Moto",
		],
		colors: ["Black", "Olive", "Navy", "Camel", "Khaki", "Burgundy", "Stone"],
	},
	suits: {
		image: "/suits.jpg",
		base: "Suit",
		priceRange: [149, 650],
		adjectives: [
			"Two-Piece", "Three-Piece", "Slim Fit", "Classic Fit", "Tailored",
			"Double-Breasted", "Single-Breasted", "Pinstripe", "Checked",
			"Linen", "Wool", "Tuxedo", "Business", "Wedding", "Modern Fit",
		],
		colors: ["Charcoal", "Navy", "Black", "Grey", "Midnight Blue", "Beige", "Burgundy"],
	},
	bags: {
		image: "/bags.jpg",
		base: "Bag",
		priceRange: [29, 280],
		adjectives: [
			"Leather Tote", "Backpack", "Messenger", "Crossbody", "Duffel",
			"Shoulder", "Bucket", "Laptop", "Weekender", "Sling", "Satchel",
			"Drawstring", "Hobo", "Clutch", "Travel",
		],
		colors: ["Black", "Brown", "Tan", "Navy", "Olive", "Burgundy", "Grey"],
	},
};

const PRODUCTS_PER_CATEGORY = 35;

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPrice = ([min, max]) => {
	const value = Math.random() * (max - min) + min;
	return Math.round(value * 100) / 100; // 2 decimal places
};

const buildProducts = () => {
	const products = [];

	for (const [category, cfg] of Object.entries(categoryConfig)) {
		const usedNames = new Set();

		for (let i = 0; i < PRODUCTS_PER_CATEGORY; i++) {
			const adjective = cfg.adjectives[i % cfg.adjectives.length];
			const color = cfg.colors[randomInt(0, cfg.colors.length - 1)];

			// Ensure unique-ish names: add an edition number when needed.
			let name = `${color} ${adjective} ${cfg.base}`;
			if (usedNames.has(name)) {
				name = `${name} ${randomInt(2, 99)}`;
			}
			usedNames.add(name);

			products.push({
				name,
				description: `Premium ${adjective.toLowerCase()} ${cfg.base.toLowerCase()} in ${color.toLowerCase()}. Crafted from quality, eco-friendly materials for everyday comfort and style.`,
				price: randomPrice(cfg.priceRange),
				image: cfg.image,
				category,
				// Feature roughly every 6th product so the homepage has featured items.
				isFeatured: i % 6 === 0,
			});
		}
	}

	return products;
};

const seed = async () => {
	const mongoUri = process.env.MONGO_URI;
	if (!mongoUri) {
		console.error("MONGO_URI is not set in .env. Aborting.");
		process.exit(1);
	}

	try {
		await mongoose.connect(mongoUri);
		console.log("MongoDB connected for seeding.");

		const products = buildProducts();

		// Remove only the categories we are seeding so we don't wipe unrelated data.
		const categories = Object.keys(categoryConfig);
		const deleted = await Product.deleteMany({ category: { $in: categories } });
		console.log(`Removed ${deleted.deletedCount} existing products in seeded categories.`);

		const inserted = await Product.insertMany(products);
		console.log(`Inserted ${inserted.length} products across ${categories.length} categories.`);

		// Per-category summary.
		for (const category of categories) {
			const count = inserted.filter((p) => p.category === category).length;
			console.log(`  ${category}: ${count}`);
		}

		// Clear the cached featured products so the homepage rebuilds it
		// from the freshly seeded data instead of serving a stale/empty cache.
		const redisUrl = process.env.UPSTASH_REDIS_URL;
		if (redisUrl) {
			try {
				const redis = new Redis(redisUrl, {
					maxRetriesPerRequest: 2,
					tls: redisUrl.startsWith("rediss://") ? {} : undefined,
				});
				await redis.del("featured_products");
				await redis.quit();
				console.log("Cleared featured_products cache in Redis.");
			} catch (err) {
				console.warn("Could not clear Redis cache:", err.message);
			}
		}
	} catch (error) {
		console.error("Seeding failed:", error.message);
		process.exitCode = 1;
	} finally {
		await mongoose.disconnect();
		console.log("Disconnected from MongoDB.");
	}
};

seed();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

// Define User Schema inline to avoid module import issues in standalone script
const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String },
        role: {
            type: String,
            enum: ["user", "admin", "developer", "cr", "hod"],
            default: "user",
        },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seed() {
    if (!process.env.CONNECTIONURI) {
        console.error("❌ CONNECTIONURI is not defined in .env.local");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.CONNECTIONURI);
        console.log("✅ Connected to MongoDB");

        const adminEmail = "admin@cpgs.hub";
        const password = "saymyname";
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log("ℹ️ Admin already exists. Updating password/role...");
            existingAdmin.password = hashedPassword;
            existingAdmin.role = "admin";
            await existingAdmin.save();
            console.log("✅ Admin updated.");
        } else {
            console.log("ℹ️ Creating new admin...");
            await User.create({
                name: "Super Admin",
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
            });
            console.log("✅ Admin created.");
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Seed failed:", error);
        process.exit(1);
    }
}

seed();

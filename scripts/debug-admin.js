const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env.local") });

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true },
        password: { type: String },
        role: { type: String, default: "user" },
    },
    { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function checkAdmin() {
    if (!process.env.CONNECTIONURI) {
        console.error("❌ CONNECTIONURI is not defined");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.CONNECTIONURI);
        console.log("✅ Connected to MongoDB");

        const email = "admin@cpgs.hub";
        const password = "saymyname";

        const user = await User.findOne({ email });

        if (!user) {
            console.log("❌ Admin user NOT FOUND in database.");
        } else {
            console.log(`✅ Admin found: ${user.email} (Role: ${user.role})`);
            console.log(`🔑 Stored Hash: ${user.password}`);
            
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                console.log("✅ Password 'saymyname' MATCHES the stored hash.");
            } else {
                console.log("❌ Password 'saymyname' DOES NOT MATCH the stored hash.");
            }
        }

        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

checkAdmin();

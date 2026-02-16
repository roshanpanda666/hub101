const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const CONNECTIONURI = process.env.CONNECTIONURI;

if (!CONNECTIONURI) {
    console.error("Please define CONNECTIONURI in .env.local");
    process.exit(1);
}

const ResourceSchema = new mongoose.Schema({
    branch: String,
}, { strict: false });

const RoutineSchema = new mongoose.Schema({
    section: String,
}, { strict: false });

const Resource = mongoose.model('Resource', ResourceSchema);
const Routine = mongoose.model('Routine', RoutineSchema);

async function migrate() {
    try {
        await mongoose.connect(CONNECTIONURI);
        console.log("Connected to MongoDB");

        // 1. Update Resources
        const cseResources = await Resource.updateMany(
            { branch: "CSE" },
            { $set: { branch: "CSA" } }
        );
        console.log(`Updated ${cseResources.modifiedCount} resources from CSE to CSA`);

        const biResources = await Resource.updateMany(
            { branch: "BI" },
            { $set: { branch: "Bio Informatics" } }
        );
        console.log(`Updated ${biResources.modifiedCount} resources from BI to Bio Informatics`);

        // 2. Update Routines (Sections)
        // We need to fetch all routines and check their sections because they are like "CSE-1"
        const routines = await Routine.find({});
        let routineCount = 0;

        for (const r of routines) {
            let newSection = r.section;
            if (r.section.startsWith("CSE")) {
                newSection = r.section.replace("CSE", "CSA");
            } else if (r.section.startsWith("BI")) {
                newSection = r.section.replace("BI", "Bio Informatics");
            }

            if (newSection !== r.section) {
                r.section = newSection;
                await r.save();
                routineCount++;
            }
        }
        console.log(`Updated ${routineCount} routines`);

        console.log("Migration complete");
    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();

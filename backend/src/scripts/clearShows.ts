import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { Show } from '../models/index.js';

async function clearShows() {
    console.log('🗑️ Clearing all shows...');

    try {
        await connectDB();

        const result = await Show.deleteMany({});
        console.log(`   ✅ Deleted ${result.deletedCount} shows`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Clear failed:', error);
        process.exit(1);
    }
}

clearShows();

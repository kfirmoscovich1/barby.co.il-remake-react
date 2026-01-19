import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { Show } from '../models/index.js';

// Shows data to import - paste your scraped data here
const showsToImport: any[] = [
    // Paste your JSON array here
];

// Generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/[\s]+/g, '-')
        .replace(/[^\w\u0590-\u05ff-]+/g, '') // Keep Hebrew chars
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// Fix status - only allow valid values
function fixStatus(status: string): 'available' | 'sold_out' | 'closed' {
    if (status === 'sold_out') return 'sold_out';
    if (status === 'closed') return 'closed';
    // "few_left" and anything else becomes "available"
    return 'available';
}

// Fix ticket tiers format
function fixTicketTiers(tiers: any[]): { label: string; price: number; currency: string }[] {
    if (!tiers || tiers.length === 0) {
        return [{ label: 'כרטיס', price: 0, currency: 'ILS' }];
    }
    return tiers.map(tier => ({
        label: tier.label || tier.name || 'כרטיס',
        price: tier.price || tier.priceNis || 0,
        currency: tier.currency || 'ILS',
    }));
}

async function importShows() {
    console.log('🎵 Starting shows import...');

    try {
        await connectDB();

        let imported = 0;
        let updated = 0;
        let skipped = 0;
        let errors = 0;

        for (let i = 0; i < showsToImport.length; i++) {
            const showData = showsToImport[i];
            try {
                // Skip shows without valid dateISO - they can't be displayed properly
                // Or assign a future date based on index
                let dateISO = showData.dateISO;
                if (!dateISO) {
                    // Assign dates starting from tomorrow, one day apart
                    const futureDate = new Date();
                    futureDate.setDate(futureDate.getDate() + i + 1);
                    dateISO = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD format
                }

                const slug = showData.slug || generateSlug(showData.title);

                const showDoc = {
                    title: showData.title,
                    slug,
                    dateISO,
                    doorsTime: showData.doorsTime || '20:00',
                    description: showData.description || '',
                    imageMediaId: showData.imageMediaId || '',
                    status: fixStatus(showData.status),
                    isStanding: showData.isStanding ?? true,
                    is360: showData.is360 ?? false,
                    isInternational: showData.isInternational ?? false,
                    venueName: showData.venueName || 'בארבי',
                    venueAddress: showData.venueAddress || 'הנמל 1, נמל יפו, תל אביב-יפו',
                    ticketTiers: fixTicketTiers(showData.ticketTiers),
                    tags: showData.tags || [],
                    featured: showData.featured ?? false,
                    published: showData.published ?? true,
                    archived: showData.archived ?? false,
                    createdBy: 'import-script',
                    updatedBy: 'import-script',
                };

                // Upsert - update if exists, create if not
                const result = await Show.updateOne(
                    { slug },
                    { $set: showDoc },
                    { upsert: true }
                );

                if (result.upsertedCount > 0) {
                    imported++;
                    console.log(`   ✅ Imported: ${showData.title} (${dateISO})`);
                } else if (result.modifiedCount > 0) {
                    updated++;
                    console.log(`   🔄 Updated: ${showData.title}`);
                } else {
                    skipped++;
                    console.log(`   ⏭️ Unchanged: ${showData.title}`);
                }
            } catch (err) {
                errors++;
                console.error(`   ❌ Error with "${showData.title}":`, (err as Error).message);
            }
        }

        console.log('\n📊 Import Summary:');
        console.log(`   New: ${imported}`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Skipped: ${skipped}`);
        console.log(`   Errors: ${errors}`);
        console.log(`   Total: ${showsToImport.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Import failed:', error);
        process.exit(1);
    }
}

importShows();

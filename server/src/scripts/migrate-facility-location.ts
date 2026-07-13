/**
 * Migration Script: Thêm trường location mặc định cho các facility chưa có
 * 
 * Chạy: npx tsx src/scripts/migrate-facility-location.ts
 * 
 * Script này:
 * 1. Tìm tất cả facilities chưa có trường `location`
 * 2. Thêm `location: { type: 'Point', coordinates: [0, 0] }` mặc định
 * 3. Đảm bảo index 2dsphere được tạo
 */
import mongoose from 'mongoose';
import { env } from '../config/env';

const MONGO_URI = env.MONGODB_URI || 'mongodb://localhost:27017/smart_parking';

async function migrate() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }
    const collection = db.collection('parkingfacilities');

    // Find facilities without location field
    const facilitiesWithoutLocation = await collection.find({
      $or: [
        { location: { $exists: false } },
        { 'location.type': { $exists: false } },
      ]
    }).toArray();

    console.log(`\n📋 Found ${facilitiesWithoutLocation.length} facilities without location field:`);
    facilitiesWithoutLocation.forEach(f => {
      console.log(`  - ${f.name} (${f._id})`);
    });

    if (facilitiesWithoutLocation.length > 0) {
      // Update all facilities without location
      const result = await collection.updateMany(
        {
          $or: [
            { location: { $exists: false } },
            { 'location.type': { $exists: false } },
          ]
        },
        {
          $set: {
            location: {
              type: 'Point',
              coordinates: [0, 0], // Default — admin sẽ update sau
            }
          }
        }
      );

      console.log(`\n✅ Updated ${result.modifiedCount} facilities with default location`);
    }

    // Ensure 2dsphere index exists
    try {
      await collection.createIndex({ location: '2dsphere' });
      console.log('✅ 2dsphere index created/verified');
    } catch (indexError: any) {
      console.log('⚠️  2dsphere index already exists or error:', indexError.message);
    }

    // Verify
    const allFacilities = await collection.find({}).toArray();
    console.log('\n📊 All facilities after migration:');
    allFacilities.forEach(f => {
      const coords = f.location?.coordinates || 'NONE';
      console.log(`  - ${f.name}: location=${JSON.stringify(coords)}`);
    });

    console.log('\n🎉 Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

migrate();

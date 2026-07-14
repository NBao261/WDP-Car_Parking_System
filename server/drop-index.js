const mongoose = require('mongoose');

async function dropIndex() {
  await mongoose.connect('mongodb+srv://cbao:Ncb2601*@cluster0.lbuhmzf.mongodb.net/?appName=Cluster0');
  try {
    await mongoose.connection.collection('parkingsessions').dropIndex('cardCode_1');
    console.log('Dropped cardCode index');
  } catch (err) {
    console.log('Index might not exist or another error: ', err.message);
  }
  mongoose.disconnect();
}

dropIndex();

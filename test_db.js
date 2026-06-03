const mongoose = require('mongoose');

const uri1 = 'mongodb+srv://skagilansk_db_user:akpe2304@cluster0.qjwtjce.mongodb.net/?appName=Cluster0';
const uri2 = 'mongodb+srv://skagilansk_db_user:380105@cluster0.qjwtjce.mongodb.net/?appName=Cluster0';

const testConnect = async (uri, name) => {
  console.log(`Testing connection for ${name}...`);
  try {
    await mongoose.connect(uri);
    console.log(`SUCCESS connected to ${name}`);
    await mongoose.disconnect();
  } catch (err) {
    console.log(`FAILED for ${name}:`, err.message);
  }
};

const run = async () => {
  await testConnect(uri1, 'akpe2304');
  await testConnect(uri2, '380105');
  process.exit(0);
};

run();

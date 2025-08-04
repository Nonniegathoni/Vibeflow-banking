import db from "../config/database";

async function addNameColumns() {
  try {
    console.log("🔄 Adding name columns to users table...");

    // Add first_name and last_name columns
    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS first_name VARCHAR(50),
      ADD COLUMN IF NOT EXISTS last_name VARCHAR(50);
    `);

    // Update existing records to split the name field
    await db.query(`
      UPDATE users
      SET 
        first_name = SPLIT_PART(name, ' ', 1),
        last_name = CASE 
          WHEN SPLIT_PART(name, ' ', 2) = '' THEN NULL
          ELSE SPLIT_PART(name, ' ', 2)
        END;
    `);

    console.log("✅ Name columns added successfully");
  } catch (error) {
    console.error("🔥 Error adding name columns:", error);
    throw error;
  }
}

// Execute the migration
addNameColumns()
  .then(() => {
    console.log("✅ Migration completed successfully");
    process.exit(0);
  })
  .catch(() => {
    console.error("❌ Migration failed:");
    process.exit(1);
  }); 
# How to Get Connection String from Neon Dashboard

## Steps to Copy Connection String:

1. **In your Neon dashboard** (which you're currently viewing):
   - Look for the **"Get connected to your new database"** section
   - Find the card with **"Connection string"** (has a chain link icon 🔗)
   - Click on that card or look for a **"Copy"** button

2. **Alternative method:**
   - Click on **"Connect"** button (top right, with chain link icon)
   - This will show connection options
   - Select **"Connection string"** tab
   - Copy the full connection string

3. **The connection string should look like:**
   ```
   postgresql://neondb_owner:password@ep-lingering-night-aifu0u1u.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

4. **Make sure to:**
   - Copy the **entire** string (it's long!)
   - Include the `?sslmode=require` part at the end
   - Don't add extra spaces

5. **Update your .env file:**
   - The connection string should match what we just updated
   - Current: `postgresql://neondb_owner:npg_tw08hbHORjsz@ep-lingering-night-aifu0u1u.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`

## Verify Connection:

1. Your database shows **"Idle"** status - this is good! (means it's active)
2. The branch is **"production"** - this is correct
3. Compute shows **"Primary"** with **"Idle"** status - database is ready

## If Connection Still Fails:

1. Make sure you copied the **full** connection string
2. Check if there's a **pooler** version (sometimes works better)
3. Try the **direct connection** instead of pooler
4. Verify the password is correct in the connection string


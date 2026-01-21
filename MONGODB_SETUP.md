# MongoDB Setup Guide for Windows

## Issue
Your application cannot connect to MongoDB because MongoDB is not installed or not running on your system.

## Solution Options

### Option 1: Install MongoDB Locally (Recommended for Development)

#### Step 1: Download MongoDB
1. Visit: https://www.mongodb.com/try/download/community
2. Select:
   - Version: Latest (7.0 or higher)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

#### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose "Complete" installation
3. **IMPORTANT**: Check "Install MongoDB as a Service"
4. **IMPORTANT**: Check "Install MongoDB Compass" (GUI tool)
5. Click "Next" and complete installation

#### Step 3: Verify Installation
Open PowerShell and run:
```powershell
mongod --version
```

You should see the MongoDB version information.

#### Step 4: Start MongoDB Service
MongoDB should start automatically if installed as a service. To verify:

```powershell
# Check if MongoDB service is running
Get-Service -Name MongoDB

# If not running, start it:
Start-Service -Name MongoDB
```

#### Step 5: Test Connection
Open MongoDB Compass (installed with MongoDB) and connect to:
```
mongodb://localhost:27017
```

### Option 2: Use MongoDB Atlas (Cloud Database)

This is easier and doesn't require local installation.

#### Step 1: Create Account
1. Visit: https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account

#### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select a cloud provider and region
4. Click "Create Cluster"

#### Step 3: Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username and password (save these!)
5. Set privileges to "Read and write to any database"
6. Click "Add User"

#### Step 4: Whitelist IP Address
1. Go to "Network Access"
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

#### Step 5: Get Connection String
1. Go to "Database" → Click "Connect"
2. Choose "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/library_management?retryWrites=true&w=majority
   ```

#### Step 6: Update .env File
Open `backend/.env` and replace the MONGODB_URI:
```
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/library_management?retryWrites=true&w=majority
```

Replace:
- `your_username` with your database username
- `your_password` with your database password
- `your_cluster` with your cluster name

## Quick Fix Commands

### For Local MongoDB:

```powershell
# Check if MongoDB is installed
mongod --version

# Check if service is running
Get-Service -Name MongoDB

# Start MongoDB service
Start-Service -Name MongoDB

# Restart your backend server
cd backend
npm run dev
```

### For MongoDB Atlas:

Just update the `MONGODB_URI` in `backend/.env` with your Atlas connection string.

## Troubleshooting

### Error: "mongod is not recognized"
- MongoDB is not installed or not in PATH
- Solution: Install MongoDB using Option 1 above

### Error: "Service MongoDB not found"
- MongoDB was not installed as a service
- Solution: Reinstall MongoDB and check "Install as Service"

### Error: "connect ECONNREFUSED"
- MongoDB service is not running
- Solution: Start the service using `Start-Service -Name MongoDB`

### Error: "Authentication failed"
- Wrong username/password in Atlas connection string
- Solution: Double-check credentials in MongoDB Atlas

## Next Steps

After MongoDB is set up:

1. Restart your backend server (it should auto-restart with nodemon)
2. You should see: `✅ MongoDB Connected Successfully`
3. Your API endpoints will now work properly

## Verify Everything Works

1. Backend should show: `✅ MongoDB Connected Successfully`
2. Open browser: http://localhost:5000/api/health
3. You should see: `{"success":true,"message":"Server is running",...}`
4. Frontend should connect without errors

## Need Help?

If you're still having issues:
1. Check which option you prefer (Local vs Atlas)
2. Follow the steps carefully
3. Make sure to restart the backend server after making changes

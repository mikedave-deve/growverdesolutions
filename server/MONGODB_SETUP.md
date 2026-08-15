# Connecting MongoDB Atlas to this project (beginner walkthrough)

You already have a MongoDB Atlas account. This picks up from there.

## Part 1: Create your cluster
1. Go to cloud.mongodb.com and log in.
2. New Project (if needed) → name it → Create Project.
3. Click "Build a Database".
4. Choose the **M0 — Free** plan.
5. Pick any cloud provider/region (closest to you is fine).
6. Click Create / Create Deployment. Wait 1–3 minutes.

## Part 2: Create a database user
(This is separate from your Atlas login — it's what your code uses.)
1. Left sidebar → Database Access → Add New Database User.
2. Authentication method: Password.
3. Username: e.g. `growverde-app`.
4. Click "Autogenerate Secure Password" and save it somewhere safe
   immediately — or type your own, avoiding these characters:
   @ : / ? # [ ]
5. Privileges: leave as "Read and write to any database".
6. Add User.

## Part 3: Allow your computer to connect
1. Left sidebar → Network Access → Add IP Address.
2. Click "Allow Access From Anywhere" (0.0.0.0/0) — fine for a school
   project on your own laptop.
3. Confirm.

## Part 4: Get the connection string
1. Database view → click "Connect" on your cluster.
2. Choose "Drivers" → leave as Node.js.
3. Copy the string shown, e.g.:
   mongodb+srv://growverde-app:<db_password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

## Part 5: Turn it into your real MONGODB_URI
- Replace `<db_password>` with your real password from Part 2 (remove
  the angle brackets too).
- Add a database name right after `.net/` and before the `?` — use
  `growverde`. It's created automatically on first use.

Result looks like:
mongodb+srv://growverde-app:YourPasswordHere@cluster0.xxxxx.mongodb.net/growverde?retryWrites=true&w=majority&appName=Cluster0

## Part 6: Put it in the project
1. In the `server` folder, copy `.env.example` to a new file named `.env`.
2. Open `.env`, replace the MONGODB_URI line with your real string.
3. Set JWT_SECRET to any long random string (30+ characters).
4. Save.

## Part 7: Test it
```bash
cd server
npm install
npm run dev
```
Success looks like:
```
[db] connected to MongoDB (growverde)
[server] Growverde Solutions API listening on http://localhost:4000
```

Troubleshooting:
- "Authentication failed" → wrong username/password in the URI (Part 2)
- IP-related connection error → check Network Access has an entry (Part 3)
- "querySrv ENOTFOUND" → typo in the cluster address, recopy from Atlas (Part 4)

Once connected, registering an account in the app creates a real
document you can see under "Browse Collections" on your cluster in
the Atlas dashboard.

**Never commit your real `.env` file to git** — it contains your
database password. Only `.env.example` (with no real secrets) should
be committed.

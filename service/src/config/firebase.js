import { initializeApp, cert } from "firebase-admin/app";
import { readFileSync } from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

let serviceAccount;

if (!serviceAccount) {
  const serviceAccountPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(import.meta.dirname, "./serviceAccountKey.json");
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));
}

const app = initializeApp({
  credential: cert(serviceAccount)
});

export default app;
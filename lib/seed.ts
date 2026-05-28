import fs from "node:fs/promises";
import path from "node:path";
import type { SeedData } from "@/lib/types";

const emptySeed: SeedData = {
  hymns: [],
  categories: [],
  admins: []
};

export async function loadSeedData(): Promise<SeedData> {
  try {
    const file = await fs.readFile(path.join(process.cwd(), "data", "seed.json"), "utf8");
    return JSON.parse(file) as SeedData;
  } catch {
    return emptySeed;
  }
}

import type { VercelRequest, VercelResponse } from "@vercel/node";

// ── USA Full Name Data (backend only) ─────────────────────────────────────────
const FIRST_NAMES = [
  "james","john","robert","michael","william","david","richard","joseph","thomas","charles",
  "christopher","daniel","matthew","anthony","mark","donald","steven","paul","andrew","joshua",
  "kevin","brian","george","timothy","ronald","edward","jason","jeffrey","ryan","jacob",
  "gary","nicholas","eric","jonathan","stephen","larry","justin","scott","brandon","benjamin",
  "samuel","raymond","frank","gregory","raymond","alexander","patrick","jack","dennis","jerry",
  "mary","patricia","jennifer","linda","barbara","elizabeth","susan","jessica","sarah","karen",
  "lisa","nancy","betty","margaret","sandra","ashley","dorothy","kimberly","emily","donna",
  "michelle","carol","amanda","melissa","deborah","stephanie","rebecca","sharon","laura","cynthia",
  "kathleen","amy","angela","shirley","anna","brenda","pamela","emma","nicole","helen",
  "samantha","katherine","christine","debra","rachel","carolyn","janet","catherine","maria","heather",
];

const LAST_NAMES = [
  "smith","johnson","williams","brown","jones","garcia","miller","davis","rodriguez","martinez",
  "hernandez","lopez","gonzalez","wilson","anderson","thomas","taylor","moore","jackson","martin",
  "lee","perez","thompson","white","harris","sanchez","clark","ramirez","lewis","robinson",
  "walker","young","allen","king","wright","scott","torres","nguyen","hill","flores",
  "green","adams","nelson","baker","hall","rivera","campbell","mitchell","carter","roberts",
  "phillips","evans","turner","torres","parker","collins","edwards","stewart","flores","morris",
  "nguyen","murphy","rivera","cook","rogers","morgan","peterson","cooper","reed","bailey",
  "bell","gomez","kelly","howard","ward","cox","diaz","richardson","wood","watson",
  "brooks","bennett","gray","james","reyes","cruz","hughes","price","myers","long",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateUsaUsername(): string {
  const first = randomItem(FIRST_NAMES);
  const last = randomItem(LAST_NAMES);
  const style = Math.floor(Math.random() * 4);
  const num = Math.floor(Math.random() * 900) + 100;
  switch (style) {
    case 0: return `${first}.${last}`;
    case 1: return `${first}${last}`;
    case 2: return `${first}_${last}`;
    case 3: return `${first}${last}${num}`;
    default: return `${first}.${last}`;
  }
}

// ── Guerrilla Mail Helpers ─────────────────────────────────────────────────────
const BASE = "https://www.guerrillamail.com/ajax.php";
const DOMAINS = [
  "guerrillamailblock.com","sharklasers.com","guerrillamail.info",
  "grr.la","guerrillamail.biz","guerrillamail.de",
  "guerrillamail.net","guerrillamail.org","spam4.me",
];

async function gGet(params: Record<string, string>): Promise<Response> {
  const url = new URL(BASE);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return fetch(url.toString(), {
    headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(12000),
  });
}

// ── Handler ────────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  try {
    // Step 1: Get a fresh session from Guerrilla Mail
    const initRes = await gGet({ f: "get_email_address", lang: "en" });
    if (!initRes.ok) {
      res.status(502).json({ error: "Could not reach Guerrilla Mail. Please try again." });
      return;
    }

    const initData = await initRes.json() as { email_addr?: string; sid_token?: string };
    if (!initData.sid_token) {
      res.status(502).json({ error: "Invalid response from mail provider." });
      return;
    }

    const sid = initData.sid_token;

    // Step 2: Set a USA full name as the username
    const usaUsername = generateUsaUsername();
    const setRes = await gGet({
      f: "set_email_user",
      email_user: usaUsername,
      lang: "en",
      sid_token: sid,
    });

    let finalEmail = initData.email_addr ?? "";
    let finalUser = usaUsername;
    let finalDomain = "guerrillamail.com";
    let finalSid = sid;

    if (setRes.ok) {
      const setData = await setRes.json() as { email_addr?: string; sid_token?: string };
      if (setData.email_addr) {
        finalEmail = setData.email_addr;
        const parts = finalEmail.split("@");
        finalUser = parts[0] ?? usaUsername;
        finalDomain = parts[1] ?? finalDomain;
        finalSid = setData.sid_token ?? sid;
      }
    } else {
      // Fall back to init data if set-user failed
      const parts = finalEmail.split("@");
      finalUser = parts[0] ?? usaUsername;
      finalDomain = parts[1] ?? finalDomain;
    }

    res.status(200).json({
      email: finalEmail,
      user: finalUser,
      domain: finalDomain,
      sid_token: finalSid,
      domains: DOMAINS,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: `Failed to create inbox: ${msg}` });
  }
}

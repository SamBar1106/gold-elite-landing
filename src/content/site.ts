export const phoneDisplay = "(708) 345-8905"
export const phoneTel = "tel:+17083458905"
export const phoneSms = "sms:+17083458905"

export const address = "1824 Roosevelt Rd, Broadview, IL 60155"
export const hoursLine =
  "Mon/Tue/Thu/Fri 10–6 · Wed 10–4 · Sat 10–5 · Sun closed"

export const mapsUrl =
  "https://www.google.com/maps/search/?api=1&query=1824+Roosevelt+Rd%2C+Broadview%2C+IL+60155"

/** Embed used until a keyed Maps account is wired. Address search, no API key. */
export const mapEmbed =
  "https://maps.google.com/maps?q=1824%20Roosevelt%20Rd%2C%20Broadview%2C%20IL%2060155&z=16&output=embed"

export const hours = [
  { label: "Monday, Tuesday, Thursday, Friday", time: "10–6", closed: false },
  { label: "Wednesday", time: "10–4", closed: false },
  { label: "Saturday", time: "10–5", closed: false },
  { label: "Sunday", time: "Closed", closed: true },
] as const

export const whyLine = "Local shop. Fast cash. Straight talk on your gold."

export const buyLine =
  "Gold jewelry & scrap · Silver jewelry & flatware · Coins & bars · Broken or mismatched pieces welcome"

export const chapters = [
  {
    id: "bring",
    title: "Bring it in",
    body: "Jewelry, coins, scrap. No appointment needed during open hours.",
    mediaKey: "bringIn",
  },
  {
    id: "weigh",
    title: "We test & weigh",
    body: "Clear reading on what you have.",
    mediaKey: "weigh",
  },
  {
    id: "cash",
    title: "Cash same visit",
    body: "Get paid before you leave.",
    mediaKey: "cashChapter",
  },
] as const

export const buyCards = [
  { id: "chains", title: "Chains", mediaKey: "chains" },
  { id: "rings", title: "Rings", mediaKey: "rings" },
  { id: "scrap", title: "Scrap", mediaKey: "scrap" },
  { id: "bars", title: "Bars", mediaKey: "bars" },
] as const

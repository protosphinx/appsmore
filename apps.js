// appsmore catalog - hand-picked, one line per app.
// Format: [App Store id, "Display name", "why", ["tags"]]. The id is the number
// after /id in the App Store URL. "why" is one sentence in your own voice,
// shown in the list. Tags are optional; ["duo"] means tried on an iPhone Duo
// and it uses the inner display properly.
// Icons, sizes and update dates are looked up automatically (icons.json via
// scripts/icons.mjs, then the App Store API). Delete freely.
// Order here is order on the page. After editing: node scripts/icons.mjs && node scripts/bake.mjs

const CATEGORIES = [
  ["Messaging", [
    [310633997, "WhatsApp", "Where most of the world already is. If your family is on it, you are on it."],
    [874139669, "Signal", "The one to tell anyone to use. Private by default, run by a nonprofit."],
    [686449807, "Telegram", "Big groups, channels and bots. Not end-to-end encrypted by default, so treat it as public."],
    [454638411, "Messenger", "Only because your Facebook friends message you here. Skip it if they don't."],
    [985746746, "Discord", "Where communities live now, from game servers to open source projects."],
    [618783545, "Slack", "Work chat. You don't pick it, your job does."],
    [546505307, "Zoom", "The video call that always works, even on bad Wi-Fi."],
  ]],
  ["Social", [
    [389801252, "Instagram", "Photos, Reels, DMs. The one social app most people would keep."],
    [6446901002, "Threads", "Instagram's text feed. Same login, quieter than X."],
    [333903271, "X", "Still where news breaks first. Loud; curate your follows hard."],
    [6444370199, "Bluesky", "The calm, open alternative to X. Custom feeds are the point."],
    [1064216828, "Reddit", "The best search results on the internet are Reddit threads. The app is finally decent."],
    [835599320, "TikTok", "The best recommendation engine on any phone. Set a timer."],
    [447188370, "Snapchat", "If your friends are under 25, this is where they are."],
    [284882215, "Facebook", "For groups, Marketplace and relatives. Turn off every notification."],
    [288429040, "LinkedIn", "Job changes and recruiters. Check it weekly, not daily."],
  ]],
  ["Google", [
    [422689480, "Gmail", "Better search and swipes than Apple Mail if your mail is Gmail."],
    [585027354, "Google Maps", "Still the best map data, transit and reviews. Apple Maps is close now."],
    [535886823, "Chrome", "Only if your passwords and tabs already live in Chrome on the desktop."],
    [962194608, "Google Photos", "The best photo search there is, and a second backup next to iCloud."],
    [507874739, "Google Drive", "Docs, Sheets and shared folders on the phone."],
    [909319292, "Google Calendar", "If your calendar is Google, this beats Apple's for shared calendars."],
    [544007664, "YouTube", "The other half of the internet."],
    [414706506, "Google Translate", "Point the camera at a menu. Download languages before you fly."],
  ]],
  ["AI", [
    [6448311069, "ChatGPT", "The one most people mean when they say AI. Voice mode is the reason to have the app."],
    [6473753684, "Claude", "Strong on long documents and careful writing. Projects keep context between chats."],
    [6477489729, "Gemini", "Tied into Gmail, Calendar and Maps. Best if you live in Google."],
  ]],
  ["Work", [
    [951937596, "Outlook", "The best mail app for Microsoft 365 accounts, and a good one for Gmail too."],
    [586447913, "Word", "Opens every .docx correctly. That is the job."],
    [586683407, "Excel", "Real spreadsheets on a phone. Fine for reading, brave for editing."],
    [327630330, "Dropbox", "Still the most reliable sync. Camera upload alone is worth it."],
    [1232780281, "Notion", "Notes, docs and databases in one place. Slow to start, hard to leave."],
    [572688855, "Todoist", "The to-do app that gets out of the way. Type dates in plain English."],
  ]],
  ["Passwords & 2FA", [
    [1511601750, "1Password", "Install this first. Everything after it is a login."],
    [1137397744, "Bitwarden", "Free, open source, and good. The other right answer."],
    [388497605, "Google Authenticator", "Codes for Google and anything that insists on it. Turn on cloud sync."],
    [983156458, "MS Authenticator", "Required for most work accounts. Also does passwordless Microsoft sign-in."],
  ]],
  ["Watch & listen", [
    [324684580, "Spotify", "Best playlists and podcasts in one app. Apple Music if you are all-Apple."],
    [363590051, "Netflix", "Download on Wi-Fi before the flight."],
    [545519333, "Prime Video", "You are probably already paying for it."],
    [1446075923, "Disney+", "Disney, Pixar, Marvel, Star Wars, and Hulu's catalog if you have the bundle."],
    [1666653815, "HBO Max", "The best TV back catalog. It was Max for a while; it is HBO Max again."],
    [460177396, "Twitch", "Live streams, and the chat that goes with them."],
  ]],
  ["Read & learn", [
    [302584613, "Kindle", "Every book you own, synced to the page. Reads well on a big screen."],
    [379693831, "Audible", "Audiobooks. Buy credits, never full price."],
    [284862083, "NYTimes", "News, plus the games, which is what most subscribers actually open."],
    [570060128, "Duolingo", "Five minutes a day actually adds up. The owl is not kidding."],
  ]],
  ["Getting around", [
    [368677368, "Uber", "Rides in most cities worldwide, one account."],
    [529379082, "Lyft", "Check both. It is often cheaper."],
    [323229106, "Waze", "Best for driving: police, traffic and closures reported by other drivers."],
    [401626263, "Airbnb", "Places to stay. Check-in details and host messages live in the app."],
    [719972451, "DoorDash", "The widest restaurant coverage in the US."],
    [1058959277, "Uber Eats", "Same idea, different restaurants. Compare the fees."],
    [545599256, "Instacart", "Groceries delivered from the stores you already shop at."],
  ]],
  ["Money & shopping", [
    [351727428, "Venmo", "How friends in the US pay each other back."],
    [283646709, "PayPal", "Paying strangers and sites safely. Buyer protection is the point."],
    [711923939, "Cash App", "Peer payments plus a debit card."],
    [297606951, "Amazon", "You know what this is. Turn off notifications."],
    [282614216, "eBay", "Used, rare and discontinued things, with buyer protection."],
    [477128284, "Etsy", "Handmade and vintage from real people."],
  ]],
  ["Health", [
    [426826309, "Strava", "Runs and rides, with the friends who make you keep going."],
    [341232718, "MyFitnessPal", "The biggest food database. The barcode scanner does the work."],
    [493145008, "Headspace", "Guided meditation that teaches, not just plays."],
    [571800810, "Calm", "Sleep stories and background sound. Pick this or Headspace, not both."],
  ]],
  ["Browsers", [
    [989804926, "Firefox", "Syncs with desktop Firefox. Strong tracking protection."],
    [1052879175, "Brave", "Blocks ads and trackers by default. Fast."],
    [663592361, "DuckDuckGo", "Private search and a browser that forgets. The fire button is satisfying."],
  ]],
];

// The order things get installed on a fresh phone. Your list sorts by this,
// because you can't sign in to anything before the password manager is on.
// Categories not listed here come after, in page order.
const SETUP_ORDER = ["Passwords & 2FA", "Google", "Messaging", "Browsers", "Work"];

// Not on the list, on purpose. ["Name", "one line why"]. Shown at the bottom.
const REMOVED = [
  ["Shazam", "built into iOS; music recognition lives in Control Center"],
  ["Tile", "AirTags and Find My do this now, built in"],
  ["Hulu", "if you have the Disney+ bundle, its shows are already in the Disney+ app"],
  ["Temu, SHEIN, Wish", "the deals are the product and you are the price"],
  ["NordVPN", "a VPN is not privacy; if you need one, you already know which"],
  ["Fitbit, Sleep Cycle", "only if you own the band; Apple Watch and Health cover the rest"],
  ["The Weather Channel", "Apple Weather is fine now"],
  ["Microsoft Teams", "if work makes you, work will make you; not a pick"],
  ["Evernote, OneNote", "notes went to Apple Notes or Notion"],
  ["Robinhood, Coinbase", "no trading apps on a default list"],
];

// Starter packs: one tap picks a whole set. ["Name", [ids...]].
const PACKS = [
  ["Fresh iPhone", [1511601750, 422689480, 585027354, 962194608, 310633997, 874139669, 389801252, 544007664, 324684580, 6448311069, 368677368, 351727428]],
  ["For my parents", [1511601750, 310633997, 422689480, 585027354, 544007664, 363590051, 302584613, 368677368, 962194608]],
  ["Privacy first", [1137397744, 874139669, 989804926, 663592361, 6444370199]],
  ["Work phone", [983156458, 951937596, 618783545, 546505307, 586447913, 586683407, 1232780281, 572688855, 288429040]],
];

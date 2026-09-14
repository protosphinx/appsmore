// appsmore catalog - hand-picked, one line per app.
// Format: [App Store id, "Display name"]. The id is the number after /id in the App Store URL.
// Icons are looked up automatically (icons.json, then the App Store API). Delete freely.
// Order here is order on the page. v0.1: the obvious picks, to be pruned by hand.
// Optional third field, tags, e.g. [id, "Name", ["duo"]] once an app has been
// tried on an iPhone Duo and uses the inner display properly. None yet.

const CATEGORIES = [
  ["Messaging", [
    [310633997, "WhatsApp"],
    [874139669, "Signal"],
    [686449807, "Telegram"],
    [454638411, "Messenger"],
    [985746746, "Discord"],
    [618783545, "Slack"],
    [546505307, "Zoom"],
  ]],
  ["Social", [
    [389801252, "Instagram"],
    [6446901002, "Threads"],
    [333903271, "X"],
    [6444370199, "Bluesky"],
    [1064216828, "Reddit"],
    [835599320, "TikTok"],
    [447188370, "Snapchat"],
    [284882215, "Facebook"],
    [288429040, "LinkedIn"],
  ]],
  ["Google", [
    [422689480, "Gmail"],
    [585027354, "Google Maps"],
    [535886823, "Chrome"],
    [962194608, "Google Photos"],
    [507874739, "Google Drive"],
    [909319292, "Google Calendar"],
    [544007664, "YouTube"],
    [414706506, "Google Translate"],
  ]],
  ["AI", [
    [6448311069, "ChatGPT"],
    [6473753684, "Claude"],
    [6477489729, "Gemini"],
  ]],
  ["Work", [
    [951937596, "Outlook"],
    [586447913, "Word"],
    [586683407, "Excel"],
    [327630330, "Dropbox"],
    [1232780281, "Notion"],
    [572688855, "Todoist"],
  ]],
  ["Passwords & 2FA", [
    [1511601750, "1Password"],
    [1137397744, "Bitwarden"],
    [388497605, "Google Authenticator"],
    [983156458, "MS Authenticator"],
  ]],
  ["Watch & listen", [
    [324684580, "Spotify"],
    [363590051, "Netflix"],
    [545519333, "Prime Video"],
    [1446075923, "Disney+"],
    [1666653815, "HBO Max"],
    [460177396, "Twitch"],
  ]],
  ["Read & learn", [
    [302584613, "Kindle"],
    [379693831, "Audible"],
    [284862083, "NYTimes"],
    [570060128, "Duolingo"],
  ]],
  ["Getting around", [
    [368677368, "Uber"],
    [529379082, "Lyft"],
    [323229106, "Waze"],
    [401626263, "Airbnb"],
    [719972451, "DoorDash"],
    [1058959277, "Uber Eats"],
    [545599256, "Instacart"],
  ]],
  ["Money & shopping", [
    [351727428, "Venmo"],
    [283646709, "PayPal"],
    [711923939, "Cash App"],
    [297606951, "Amazon"],
    [282614216, "eBay"],
    [477128284, "Etsy"],
  ]],
  ["Health", [
    [426826309, "Strava"],
    [341232718, "MyFitnessPal"],
    [493145008, "Headspace"],
    [571800810, "Calm"],
  ]],
  ["Browsers", [
    [989804926, "Firefox"],
    [1052879175, "Brave"],
    [663592361, "DuckDuckGo"],
  ]],
];

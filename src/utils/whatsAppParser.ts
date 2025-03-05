import { Listing } from './sampleData.public';

/**
 * Parse a WhatsApp chat export into an array of listings
 * @param chatContent The content of the WhatsApp chat export
 * @param groupName The name of the WhatsApp group (used for categorization)
 * @returns An array of parsed listings
 */
export function parseWhatsAppChat(chatContent: string, groupName: string): Listing[] {
  const lines = chatContent.split('\n');
  const listings: Listing[] = [];
  
  let currentListing: Partial<Listing> | null = null;
  let messageBuffer: string[] = [];
  let imageBuffer: string[] = [];
  
  // Regular expressions for parsing
  const messageRegex = /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}:\d{2})\] ([^:]+): (.*)$/;
  const imageRegex = /IMG-\d{8}-WA\d{4}\.jpg/g;
  const priceRegex = /R\s*(\d+)/i;
  const isoRegex = /\b(iso|in search of|looking for)\b/i;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(messageRegex);
    
    if (match) {
      // If we have a current listing, save it before starting a new one
      if (currentListing && messageBuffer.length > 0) {
        finalizeListing();
      }
      
      // Extract date, time, sender, and message
      const [_, dateStr, timeStr, sender, message] = match;
      
      // Parse date
      const dateParts = dateStr.split('/');
      const day = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1; // Month is 0-indexed in JS Date
      const year = parseInt(dateParts[2], 10) < 100 
        ? 2000 + parseInt(dateParts[2], 10) 
        : parseInt(dateParts[2], 10);
      
      // Parse time
      const timeParts = timeStr.split(':');
      const hour = parseInt(timeParts[0], 10);
      const minute = parseInt(timeParts[1], 10);
      const second = parseInt(timeParts[2], 10);
      
      const date = new Date(year, month, day, hour, minute, second);
      
      // Start a new listing
      currentListing = {
        id: `${groupName}-${listings.length + 1}`,
        date: date.toISOString(),
        sender: sender.trim(),
        text: message.trim(),
        images: [],
        price: null,
        condition: null,
        size: null,
        location: null,
        category: null,
        isISO: false
      };
      
      messageBuffer = [message.trim()];
      imageBuffer = [];
      
      // Extract images from the message
      const imageMatches = message.match(imageRegex);
      if (imageMatches) {
        imageBuffer.push(...imageMatches);
      }
      
      // Check if this is an ISO post
      if (isoRegex.test(message)) {
        currentListing.isISO = true;
      }
    } else if (currentListing) {
      // This is a continuation of the current message
      messageBuffer.push(line.trim());
      
      // Extract images from the line
      const imageMatches = line.match(imageRegex);
      if (imageMatches) {
        imageBuffer.push(...imageMatches);
      }
    }
  }
  
  // Don't forget to process the last listing
  if (currentListing && messageBuffer.length > 0) {
    finalizeListing();
  }
  
  return listings;
  
  // Helper function to finalize and add a listing
  function finalizeListing() {
    if (!currentListing) return;
    
    // Combine all message lines
    const fullText = messageBuffer.join('\n');
    currentListing.text = fullText;
    
    // Set images
    if (imageBuffer.length > 0) {
      currentListing.images = [...imageBuffer];
    }
    
    // Extract price
    const priceMatch = fullText.match(priceRegex);
    if (priceMatch && priceMatch[1]) {
      currentListing.price = parseInt(priceMatch[1], 10);
    }
    
    // Extract other information
    currentListing.condition = extractCondition(fullText);
    currentListing.size = extractSize(fullText);
    currentListing.location = extractLocation(fullText);
    currentListing.category = determineCategory(fullText);
    
    // Add to listings
    listings.push(currentListing as Listing);
    
    // Reset for next listing
    currentListing = null;
    messageBuffer = [];
    imageBuffer = [];
  }
}

/**
 * Determine the category of a listing based on its text
 */
function determineCategory(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  if (/\b(clothing|clothes|dress|shirt|onesie|bodysuit|romper|outfit|sleepsuit)\b/.test(lowerText)) {
    return 'Clothing';
  }
  
  if (/\b(toy|toys|play|playmat|activity|puzzle|book|books)\b/.test(lowerText)) {
    return 'Toys';
  }
  
  if (/\b(cot|crib|bed|chair|table|furniture|wardrobe|dresser)\b/.test(lowerText)) {
    return 'Furniture';
  }
  
  if (/\b(shoe|shoes|boot|boots|sandal|sandals|footwear)\b/.test(lowerText)) {
    return 'Footwear';
  }
  
  if (/\b(stroller|pram|carrier|car seat|carseat|baby carrier|sling|wrap|backpack)\b/.test(lowerText)) {
    return 'Gear';
  }
  
  if (/\b(bottle|feeding|food|bib|highchair|high chair|sterilizer|pump|breast pump)\b/.test(lowerText)) {
    return 'Feeding';
  }
  
  if (/\b(hat|accessory|accessories|socks|mittens|gloves|blanket)\b/.test(lowerText)) {
    return 'Accessories';
  }
  
  if (/\b(swim|swimming|pool|float|floatie)\b/.test(lowerText)) {
    return 'Swimming';
  }
  
  if (/\b(bedding|sheet|sheets|duvet|pillow|mattress|sleep sack|sleeping bag)\b/.test(lowerText)) {
    return 'Bedding';
  }
  
  if (/\b(diaper|diapers|nappy|nappies|wipes|changing pad|changing mat)\b/.test(lowerText)) {
    return 'Diapers';
  }
  
  return null;
}

/**
 * Extract the condition from the listing text
 */
function extractCondition(text: string): string | null {
  const lowerText = text.toLowerCase();
  
  if (/\b(new|brand new|never used|unused|with tags|nwt)\b/.test(lowerText)) {
    return 'New';
  }
  
  if (/\b(like new|barely used|excellent condition|pristine)\b/.test(lowerText)) {
    return 'Like New';
  }
  
  if (/\b(good condition|gently used|well kept|minor wear)\b/.test(lowerText)) {
    return 'Good';
  }
  
  if (/\b(fair condition|used|visible wear|worn)\b/.test(lowerText)) {
    return 'Fair';
  }
  
  if (/\b(poor condition|heavily used|damaged|needs repair)\b/.test(lowerText)) {
    return 'Poor';
  }
  
  return null;
}

/**
 * Extract the size from the listing text
 */
function extractSize(text: string): string | null {
  const lowerText = text.toLowerCase();
  const sizeRegex = /\b(newborn|preemie|premie|nb|0-3m|3-6m|6-9m|9-12m|12-18m|18-24m|2t|3t|4t|5t|0-3 months|3-6 months|6-9 months|9-12 months|12-18 months|18-24 months|size \d+|small|medium|large|s|m|l|xl)\b/i;
  
  const match = lowerText.match(sizeRegex);
  return match ? match[0] : null;
}

/**
 * Extract the location from the listing text
 */
function extractLocation(text: string): string | null {
  const lowerText = text.toLowerCase();
  const locationRegex = /\b(cape town|sea point|green point|camps bay|clifton|bantry bay|fresnaye|mouille point|three anchor bay|v&a waterfront|foreshore|gardens|vredehoek|oranjezicht|tamboerskloof|bo-kaap|de waterkant|woodstock|salt river|observatory|mowbray|rosebank|rondebosch|newlands|claremont|kenilworth|wynberg|plumstead|diep river|retreat|lakeside|muizenberg|kalk bay|fish hoek|glencairn|simon's town|hout bay|llandudno|constantia|tokai|bergvliet|meadowridge|southfield|heathfield|ottery|wetton|lansdowne|rondebosch east|crawford|athlone|gatesville|rylands|hazendal|silvertown|bridgetown|kewtown|bonteheuwel|heideveld|surrey estate|manenberg|gugulethu|nyanga|crossroads|philippi|mitchells plain|strandfontein|grassy park|lotus river|pelican park|zeekoevlei|lavender hill|steenberg|retreat|seawinds|vrygrond|capricorn|muizenberg|marina da gama|lakeside|westlake|kirstenhof|tokai|noordhoek|kommetjie|ocean view|masiphumelele|sun valley|fish hoek|kalk bay|st james|clovelly|pinelands|thornton|goodwood|monte vista|edgemead|bothasig|richwood|burgundy estate|milnerton|royal ascot|sunset beach|sunset links|woodbridge island|century city|summer greens|joe slovo park|marconi beam|phoenix|dunoon|table view|parklands|sunningdale|blouberg|bloubergstrand|big bay|melkbosstrand|atlantis|mamre|pella|kalbaskraal|durbanville|eversdal|sonstraal|sonstraal heights|vygeboom|durbanville hills|valmary park|uitzicht|goedemoed|belle vue|welgemoed|stellenberg|loevenstein|plattekloof|panorama|welgelegen|tygerdal|de tijger|parow|ravensmead|uitsig|cravenby|elsies river|eureka|connaught|avonwood|epping|ruyterwacht|matroosfontein|bishop lavis|valhalla park|nooitgedacht|belhar|delft|the hague|voorbrug|leiden|eindhoven|roosendal|symphony|bellville|oakdale|chrismar|hardekraaltjie|kenridge|oude westhof|stellenridge|rosendal|rosenpark|blommendal|boston|bellville south|penhill|kuils river|sarepta|kalkfontein|blackheath|eerste river|blue downs|malibu village|greenfields|fairdale|dennemere|forest heights|forest village|kleinvlei|mfuleni|silversands|macassar|firgrove|croydon|faure|strand|gordon's bay|somerset west|sir lowry's pass|grabouw|elgin|villiersdorp|franschhoek|paarl|wellington|malmesbury|darling|yzerfontein|langebaan|saldanha|vredenburg|st helena bay|paternoster|elands bay|piketberg|porterville|tulbagh|wolseley|ceres|prince alfred hamlet|op-die-berg|de doorns|touws river|worcester|robertson|montagu|ashton|bonnievale|mcgregor|riviersonderend|greyton|genadendal|caledon|hermanus|onrus|vermont|sandbaai|zwelihle|mount pleasant|westcliff|northcliff|eastcliff|voëlklip|fernkloof|hermanus heights|kwaaiwater|hawston|fisherhaven|bengal|kleinmond|betty's bay|pringle bay|rooi els|hangklip|gordon's bay|strand|somerset west|stellenbosch|pniel|kylemore|klapmuts|simondium|franschhoek|la motte|wemmershoek|paarl|wellington|hermon|gouda|tulbagh|wolseley|ceres|prince alfred hamlet|op-die-berg|de doorns|touws river|matjiesfontein|laingsburg|prince albert|klaarstroom|de rust|oudtshoorn|calitzdorp|ladismith|zoar|amalienstein|vanwyksdorp|riversdale|albertinia|gouritsmond|mossel bay|dana bay|hartenbos|klein brak river|groot brak river|herolds bay|victoria bay|wilderness|hoekwil|karatara|sedgefield|knysna|plettenberg bay|nature's valley|storms river|humansdorp|jeffreys bay|st francis bay|cape st francis|oyster bay|tsitsikamma|joubertina|kareedouw|patensie|hankey|loerie|thornhill|gamtoos|van stadens|clarendon marine|seaview|sardinia bay|lovemore heights|theescombe|kamma park|lorraine|kabega park|westering|linton grange|cotswold|glen hurd|sunridge park|framesby|fernglen|adcockvale|sydenham|korsten|north end|central|south end|forest hill|south end|humewood|summerstrand|humerail|walmer|charlo|broadwood|fairview|overbaakens|hunter's retreat|sherwood|morningside|mangold park|parsons vlei|bridgemead|rowallan park|essexvale|westering|cleary park|bethelsdorp|missionvale|kwadwesi|kwazakhele|new brighton|motherwell|swartkops|redhouse|amsterdamhoek|bluewater bay|wells estate|coega|colchester|nanaga|alexandria|boesmansriviermond|kenton-on-sea|port alfred|bathurst|grahamstown|alicedale|riebeek east|pearston|somerset east|cookhouse|adelaide|fort beaufort|seymour|hogsback|cathcart|stutterheim|komga|kei mouth|morgans bay|haga haga|gonubie|beacon bay|nahoon|abbotsford|stirling|berea|vincent|selborne|southernwood|north end|quigney|east london|amalinda|cambridge|mdantsane|potsdam|king william's town|bisho|zwelitsha|dimbaza|middledrift|alice|peddie|hamburg|kidds beach|winterstrand|cintsa|haga-haga|morgans bay|kei mouth|komga|stutterheim|cathcart|queenstown|tarkastad|cradock|graaff-reinet|aberdeen|beaufort west|three sisters|victoria west|richmond|hanover|colesberg|noupoort|middelburg|hofmeyr|steynsburg|burgersdorp|aliwal north|lady grey|barkly east|rhodes|maclear|ugie|elliot|indwe|dordrecht|molteno|sterkstroom|hofmeyr|tarkastad|cradock|bedford|adelaide|fort beaufort|alice|peddie|grahamstown|port alfred|kenton-on-sea|alexandria|paterson|kirkwood|addo|uitenhage|despatch|port elizabeth|humansdorp|jeffreys bay|st francis bay|cape st francis|oyster bay|tsitsikamma|storms river|plettenberg bay|knysna|sedgefield|wilderness|george|mossel bay|albertinia|riversdale|heidelberg|swellendam|bonnievale|robertson|montagu|barrydale|ladismith|calitzdorp|oudtshoorn|de rust|uniondale|willowmore|steytlerville|jansenville|klipplaat|aberdeen|graaff-reinet|murraysburg|beaufort west|laingsburg|matjiesfontein|touws river|de doorns|worcester|robertson|ashton|montagu|barrydale|suurbraak|swellendam|heidelberg|riversdale|albertinia|mossel bay|george|oudtshoorn|calitzdorp|ladismith|zoar|amalienstein|vanwyksdorp|laingsburg|prince albert|klaarstroom|de rust|oudtshoorn|calitzdorp|ladismith|zoar|amalienstein|vanwyksdorp|riversdale|albertinia|gouritsmond|mossel bay|dana bay|hartenbos|klein brak river|groot brak river|herolds bay|victoria bay|wilderness|hoekwil|karatara|sedgefield|knysna|plettenberg bay|nature's valley|storms river|humansdorp|jeffreys bay|st francis bay|cape st francis|oyster bay|tsitsikamma|joubertina|kareedouw|patensie|hankey|loerie|thornhill|gamtoos|van stadens|clarendon marine|seaview|sardinia bay|lovemore heights|theescombe|kamma park|lorraine|kabega park|westering|linton grange|cotswold|glen hurd|sunridge park|framesby|fernglen|adcockvale|sydenham|korsten|north end|central|south end|forest hill|south end|humewood|summerstrand|humerail|walmer|charlo|broadwood|fairview|overbaakens|hunter's retreat|sherwood|morningside|mangold park|parsons vlei|bridgemead|rowallan park|essexvale|westering|cleary park|bethelsdorp|missionvale|kwadwesi|kwazakhele|new brighton|motherwell|swartkops|redhouse|amsterdamhoek|bluewater bay|wells estate|coega|colchester|nanaga|alexandria|boesmansriviermond|kenton-on-sea|port alfred|bathurst|grahamstown|alicedale|riebeek east|pearston|somerset east|cookhouse|adelaide|fort beaufort|seymour|hogsback|cathcart|stutterheim|komga|kei mouth|morgans bay|haga haga|gonubie|beacon bay|nahoon|abbotsford|stirling|berea|vincent|selborne|southernwood|north end|quigney|east london)\b/i;
  
  const match = lowerText.match(locationRegex);
  if (match) {
    // Capitalize the first letter of each word
    return match[0].replace(/\b\w/g, c => c.toUpperCase());
  }
  
  return null;
}

export default parseWhatsAppChat; 
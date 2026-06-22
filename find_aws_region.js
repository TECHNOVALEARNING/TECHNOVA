const ipAddress = '2a05:d014:8ef:5901:4d6f:6fcf:d83b:4d3a';

async function findRegion() {
  try {
    console.log("Fetching AWS IP ranges...");
    const res = await fetch('https://ip-ranges.amazonaws.com/ip-ranges.json');
    const data = await res.json();
    
    // We want to parse the IPv6 ranges
    console.log("Searching IPv6 prefixes...");
    let match = null;
    
    // Simple hex helper to convert IP/Prefix to compare
    for (const item of data.ipv6_prefixes) {
      const prefix = item.ipv6_prefix;
      if (ipIsInPrefix(ipAddress, prefix)) {
        console.log(`Found prefix match: ${prefix}`);
        console.log(`Region: ${item.region}`);
        console.log(`Service: ${item.service}`);
        match = item;
      }
    }
    
    if (!match) {
      console.log("No prefix match found. Let's do a simple string prefix match.");
      // Fallback: 2a05:d014:8ef is 48 bits (3 groups of 16 bits).
      // Let's see if we match the first few groups.
      for (const item of data.ipv6_prefixes) {
        const prefix = item.ipv6_prefix;
        if (prefix.startsWith('2a05:d014:8')) {
          console.log(`Potential match: ${prefix} in region ${item.region}`);
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// Simple IPv6 prefix checker
function ipIsInPrefix(ip, cidr) {
  const [prefixStr, bitsStr] = cidr.split('/');
  const bits = parseInt(bitsStr, 10);
  
  const ipParts = expandIPv6(ip);
  const prefixParts = expandIPv6(prefixStr);
  
  let bitCount = 0;
  for (let i = 0; i < 8; i++) {
    const ipVal = ipParts[i];
    const prefixVal = prefixParts[i];
    
    if (bitCount + 16 <= bits) {
      if (ipVal !== prefixVal) return false;
      bitCount += 16;
    } else {
      const remainingBits = bits - bitCount;
      if (remainingBits <= 0) return true;
      const mask = 0xffff << (16 - remainingBits) & 0xffff;
      return (ipVal & mask) === (prefixVal & mask);
    }
  }
  return true;
}

function expandIPv6(ip) {
  // Handle ::
  let fullIp = ip;
  if (ip.includes('::')) {
    const parts = ip.split('::');
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    const missingCount = 8 - (left.length + right.length);
    const middle = Array(missingCount).fill('0');
    fullIp = [...left, ...middle, ...right].join(':');
  }
  return fullIp.split(':').map(part => parseInt(part, 16));
}

findRegion();

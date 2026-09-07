const dns = require('dns').promises;
const net = require('net');

/**
 * Checks whether an IP address is in a private, loopback, link-local, or multicast range.
 */
function isPrivateIp(ip) {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 0.0.0.0/8
    if (parts[0] === 0) return true;
    // 10.0.0.0/8
    if (parts[0] === 10) return true;
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 169.254.0.0/16 (Link-local)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 224.0.0.0/4 (Multicast)
    if (parts[0] >= 224) return true;
    return false;
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // ::1 (Loopback)
    if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
    // fe80::/10 (Link-local)
    if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
    // fc00::/7 (Unique local)
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    return false;
  }

  return true;
}

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

/**
 * Validates a website URL against SSRF and formatting vulnerabilities.
 */
async function validateAuditUrl(inputUrl) {
  if (!inputUrl || typeof inputUrl !== 'string') {
    throw validationError('Website URL is required.');
  }

  let formattedUrl = inputUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }

  let parsed;
  try {
    parsed = new URL(formattedUrl);
  } catch (err) {
    throw validationError('Invalid URL format.');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw validationError('Only HTTP and HTTPS protocols are supported.');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block localhost, local, internal domain suffixes
  const blockedHostnames = ['localhost', '127.0.0.1', '::1', '0.0.0.0', 'router.local'];
  if (blockedHostnames.includes(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw validationError('Local and internal addresses are not allowed.');
  }

  // If hostname is directly an IP address
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw validationError('Private and reserved IP addresses are not permitted.');
    }
  } else {
    // Resolve DNS to verify it doesn't map to a private internal IP (DNS Rebinding/SSRF)
    try {
      const addresses = await dns.lookup(hostname, { all: true });
      for (const addr of addresses) {
        if (isPrivateIp(addr.address)) {
          throw validationError(`The domain resolves to a private IP address (${addr.address}), which is not permitted.`);
        }
      }
    } catch (dnsErr) {
      if (dnsErr.code === 'ENOTFOUND') {
        throw validationError('Domain name could not be resolved. Please check the URL.');
      }
      throw dnsErr;
    }
  }

  return parsed.href;
}

module.exports = {
  isPrivateIp,
  validateAuditUrl
};

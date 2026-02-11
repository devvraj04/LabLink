/* global BigInt */
/**
 * Aadhaar QR Code Parser (Plain JavaScript version)
 * 
 * Aadhaar QR codes come in multiple formats:
 * 1. Old format (pre-2019): XML data with attributes like uid, name, gender, etc.
 * 2. Secure QR (post-2019): Numeric big-integer encoded data with byte fields
 * 3. Delimited format: pipe/comma separated values
 * 
 * This parser handles all three formats
 */

// Indian states for address extraction
const INDIAN_STATES = [
    'Andaman and Nicobar', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
    'Bihar', 'Chandigarh', 'Chhattisgarh', 'Daman and Diu', 'Delhi', 'Goa',
    'Gujarat', 'Himachal Pradesh', 'Haryana', 'Jharkhand', 'Jammu and Kashmir',
    'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Maharashtra', 'Meghalaya',
    'Manipur', 'Madhya Pradesh', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Puducherry', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttarakhand', 'Uttar Pradesh', 'West Bengal',
];

/**
 * Parse old-format Aadhaar QR (XML format)
 */
function parseXMLFormat(data) {
    const result = { isSecureQR: false, rawData: data };

    const uidMatch = data.match(/uid\s*=\s*["']([^"']+)["']/i);
    const nameMatch = data.match(/name\s*=\s*["']([^"']+)["']/i);
    const genderMatch = data.match(/gender\s*=\s*["']([^"']+)["']/i);
    const dobMatch = data.match(/dob\s*=\s*["']([^"']+)["']/i);
    const yobMatch = data.match(/yob\s*=\s*["']([^"']+)["']/i);

    const houseMatch = data.match(/(?:house|building)\s*=\s*["']([^"']+)["']/i);
    const streetMatch = data.match(/(?:street|road|lane)\s*=\s*["']([^"']+)["']/i);
    const locMatch = data.match(/(?:loc|locality)\s*=\s*["']([^"']+)["']/i);
    const vtcMatch = data.match(/(?:vtc|village|town|city)\s*=\s*["']([^"']+)["']/i);
    const distMatch = data.match(/(?:dist|district)\s*=\s*["']([^"']+)["']/i);
    const stateMatch = data.match(/(?:state)\s*=\s*["']([^"']+)["']/i);
    const pcMatch = data.match(/(?:pc|pincode|zip)\s*=\s*["']([^"']+)["']/i);

    if (uidMatch) result.uid = uidMatch[1];
    if (nameMatch) result.name = nameMatch[1];

    if (genderMatch) {
        const g = genderMatch[1].toUpperCase();
        if (g === 'M' || g === 'MALE') result.gender = 'MALE';
        else if (g === 'F' || g === 'FEMALE') result.gender = 'FEMALE';
        else result.gender = 'OTHER';
    }

    if (dobMatch) {
        const dob = dobMatch[1];
        const parts = dob.split(/[-/]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                result.dob = dob.replace(/\//g, '-');
            } else {
                result.dob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
    }

    if (yobMatch) result.yob = yobMatch[1];

    const addressParts = [
        houseMatch && houseMatch[1],
        streetMatch && streetMatch[1],
        locMatch && locMatch[1],
        vtcMatch && vtcMatch[1],
        distMatch && distMatch[1],
    ].filter(Boolean);

    result.address = addressParts.join(', ');
    if (vtcMatch) result.city = vtcMatch[1];
    if (stateMatch) result.state = stateMatch[1];
    if (pcMatch) result.pincode = pcMatch[1];

    return result;
}

/**
 * Convert a big-integer numeric string to a byte array.
 * Aadhaar Secure QR encodes data as a large base-10 integer.
 */
function bigIntToBytes(numStr) {
    // Use BigInt for precise division
    try {
        let n = BigInt(numStr);
        const bytes = [];
        const zero = BigInt(0);
        const b256 = BigInt(256);
        while (n > zero) {
            bytes.unshift(Number(n % b256));
            n = n / b256;
        }
        return new Uint8Array(bytes);
    } catch {
        return null;
    }
}

/**
 * Read a null-terminated or length-prefixed UTF-8 string from a byte array
 */
function readUTF8Strings(bytes) {
    const strings = [];
    let current = [];
    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0xFF || bytes[i] === 0x00) {
            if (current.length > 0) {
                try {
                    const str = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(current));
                    if (str && str.trim().length > 0) {
                        strings.push(str.trim());
                    }
                } catch { /* skip */ }
                current = [];
            }
        } else {
            current.push(bytes[i]);
        }
    }
    // Last chunk
    if (current.length > 0) {
        try {
            const str = new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(current));
            if (str && str.trim().length > 0) {
                strings.push(str.trim());
            }
        } catch { /* skip */ }
    }
    return strings;
}

/**
 * Parse Secure QR format (post-2019) — big-integer encoded
 * Structure (V2 Secure QR):
 *   - Email/Mobile flag indicators
 *   - Reference ID (bytes)
 *   - Name (UTF-8)
 *   - Date of Birth (DD-MM-YYYY or DD/MM/YYYY)
 *   - Gender (M/F/T)
 *   - Address fields (CO, District, Landmark, House, Location, PIN, PO, State, Street, SubDistrict, VTC)
 *   - Photo bytes (JPEG)
 *   - Signature bytes
 */
function parseSecureQRFormat(data) {
    const result = { isSecureQR: true, rawData: data };

    try {
        // Check if data is a big numeric string (Secure QR)
        if (/^\d+$/.test(data) && data.length > 100) {
            const bytes = bigIntToBytes(data);
            if (!bytes || bytes.length < 20) {
                return result;
            }

            // Try to extract readable strings from the byte array
            // The Secure QR V2 format stores data separated by delimiter bytes
            const allStrings = readUTF8Strings(bytes);

            // Filter out non-printable/noise strings
            const meaningful = allStrings.filter(s => {
                // Must have at least 2 chars and some letters
                return s.length >= 2 && /[a-zA-Z]/.test(s);
            });

            // Heuristic extraction from meaningful strings
            if (meaningful.length > 0) {
                // Look for a name (typically one of the first strings with letters only + spaces)
                for (const s of meaningful) {
                    if (!result.name && /^[A-Za-z\s.'-]+$/.test(s) && s.length > 2 && s.length < 60) {
                        result.name = s;
                        break;
                    }
                }

                // Look for date patterns (DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD)
                for (const s of meaningful) {
                    const dateMatch = s.match(/(\d{2}[-/]\d{2}[-/]\d{4})/);
                    if (dateMatch) {
                        const parts = dateMatch[1].split(/[-/]/);
                        result.dob = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        break;
                    }
                    const dateMatch2 = s.match(/(\d{4}[-/]\d{2}[-/]\d{2})/);
                    if (dateMatch2) {
                        result.dob = dateMatch2[1].replace(/\//g, '-');
                        break;
                    }
                }

                // Look for gender
                for (const s of meaningful) {
                    const g = s.trim().toUpperCase();
                    if (g === 'M' || g === 'MALE') { result.gender = 'MALE'; break; }
                    if (g === 'F' || g === 'FEMALE') { result.gender = 'FEMALE'; break; }
                    if (g === 'T' || g === 'TRANSGENDER') { result.gender = 'OTHER'; break; }
                }

                // Look for Aadhaar number (last 4 or masked pattern)
                for (const s of allStrings) {
                    const aadhaarMatch = s.match(/(\d{4}\s?\d{4}\s?\d{4})/);
                    if (aadhaarMatch) {
                        result.uid = aadhaarMatch[1].replace(/\s/g, '');
                        break;
                    }
                }

                // Look for pincode (6-digit number)
                for (const s of allStrings) {
                    const pinMatch = s.match(/\b(\d{6})\b/);
                    if (pinMatch) {
                        result.pincode = pinMatch[1];
                        break;
                    }
                }

                // Look for state names
                for (const s of meaningful) {
                    for (const state of INDIAN_STATES) {
                        if (s.toLowerCase().includes(state.toLowerCase())) {
                            result.state = state;
                            break;
                        }
                    }
                    if (result.state) break;
                }

                // Look for address (longer strings)
                const addressCandidates = meaningful.filter(s =>
                    s.length > 10 && s !== result.name && !/^\d+$/.test(s)
                );
                if (addressCandidates.length > 0) {
                    // Concatenate address-like strings
                    result.address = addressCandidates.slice(0, 4).join(', ');
                }

                // City — look for VTC-like short strings
                const cityCandidates = meaningful.filter(s =>
                    s.length >= 3 && s.length <= 40 && /^[A-Za-z\s]+$/.test(s) &&
                    s !== result.name && s !== result.state
                );
                if (cityCandidates.length > 0 && !result.city) {
                    result.city = cityCandidates[cityCandidates.length > 1 ? 1 : 0]; // Take 2nd candidate if available
                }
            }

            return result;
        }

        // Delimited format (pipe, comma, semicolon separated)
        const parts = data.split(/[|,;]/);
        if (parts.length >= 4) {
            result.uid = (parts[0] || '').trim();
            result.name = (parts[1] || '').trim();

            for (const part of parts) {
                if (/\d{2}[-/]\d{2}[-/]\d{4}/.test(part)) {
                    const dobParts = part.split(/[-/]/);
                    result.dob = `${dobParts[2]}-${dobParts[1]}-${dobParts[0]}`;
                    break;
                }
                if (/\d{4}[-/]\d{2}[-/]\d{2}/.test(part)) {
                    result.dob = part.replace(/\//g, '-');
                    break;
                }
            }

            for (const part of parts) {
                const g = part.trim().toUpperCase();
                if (g === 'M' || g === 'MALE') { result.gender = 'MALE'; break; }
                if (g === 'F' || g === 'FEMALE') { result.gender = 'FEMALE'; break; }
            }

            const addressCandidates = parts.filter(p => p.length > 20);
            if (addressCandidates.length > 0) {
                result.address = addressCandidates[0];
            }
        }
    } catch (e) {
        console.error('Error parsing Secure QR:', e);
    }

    return result;
}

/**
 * Main parser function - detects format and parses accordingly
 */
export function parseAadhaarQR(qrData) {
    const trimmedData = qrData.trim();
    let parsed;

    if (trimmedData.includes('<?xml') || trimmedData.includes('<QPDA') || /\w+\s*=\s*["']/.test(trimmedData)) {
        parsed = parseXMLFormat(trimmedData);
    } else {
        parsed = parseSecureQRFormat(trimmedData);
    }

    // Extract pincode from address if not found
    if (!parsed.pincode && parsed.address) {
        const pincodeMatch = parsed.address.match(/\b(\d{6})\b/);
        if (pincodeMatch) {
            parsed.pincode = pincodeMatch[1];
        }
    }

    // Extract state from address if not found
    if (!parsed.state && parsed.address) {
        for (const state of INDIAN_STATES) {
            if (parsed.address.toLowerCase().includes(state.toLowerCase())) {
                parsed.state = state;
                break;
            }
        }
    }

    // Use YOB if DOB not available
    if (!parsed.dob && parsed.yob) {
        parsed.dob = `${parsed.yob}-01-01`;
    }

    return {
        uid: parsed.uid || '',
        name: parsed.name || '',
        gender: parsed.gender || '',
        dob: parsed.dob || '',
        yob: parsed.yob || '',
        address: parsed.address || '',
        city: parsed.city || '',
        state: parsed.state || '',
        pincode: parsed.pincode || '',
        rawData: trimmedData,
        isSecureQR: parsed.isSecureQR || false,
    };
}

/**
 * Extract last 4 digits of Aadhaar for storage
 */
export function getAadhaarLast4(uid) {
    const cleanUid = uid.replace(/\s/g, '').replace(/X/gi, '');
    return cleanUid.slice(-4);
}

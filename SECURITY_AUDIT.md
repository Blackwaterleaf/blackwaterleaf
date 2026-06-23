# BlackwaterLeaf Security Audit Report

**Date:** 2026-06-22  
**Status:** 🔴 CRITICAL ISSUES FOUND

---

## Executive Summary

The BlackwaterLeaf application has **7 critical security vulnerabilities** that require immediate remediation before production deployment. These issues span authentication, authorization, input validation, and data privacy.

---

## Critical Issues

### 1. **Missing Ownership Verification in Photo/Event Endpoints** 🔴 CRITICAL

**Location:** `server/routers.ts` lines 169-193, 304-327, 337-350

**Issue:** The `addPhoto` and `addEvent` endpoints accept a `plantId`/`aquariumId` from the user input but **do not verify that the plant/aquarium belongs to the authenticated user**. This allows any authenticated user to:
- Add photos to any other user's plants/aquariums
- Add events to any other user's aquariums
- Modify the cover image of any plant/aquarium

**Vulnerable Code:**
```typescript
// Line 169-193: addPhoto for plants
addPhoto: protectedProcedure
  .input(z.object({
    plantId: z.number(),  // ← No verification this plant belongs to ctx.user
    base64: z.string(),
    mimeType: z.string(),
    caption: z.string().max(500).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // ❌ Missing: verify that plants.id belongs to ctx.user.id
    await db.insert(plantPhotos).values({
      plantId: input.plantId,  // ← Can be ANY plant ID
      userId: ctx.user.id,
      imageUrl: url,
    });
  }),
```

**Impact:** HIGH - Data integrity violation, unauthorized content injection

**Fix:** Add ownership check before photo/event creation:
```typescript
// Verify ownership
const plant = await db.select().from(plants)
  .where(eq(plants.id, input.plantId)).limit(1);
if (!plant[0] || plant[0].userId !== ctx.user.id) {
  throw new TRPCError({ code: "FORBIDDEN" });
}
```

---

### 2. **Public Endpoints Expose Private Data** 🔴 CRITICAL

**Location:** `server/routers.ts` lines 87-94, 195-201, 329-335, 352-361

**Issue:** The `plants.get`, `plants.getPhotos`, `aquariums.get`, `aquariums.getPhotos`, and `aquariums.getEvents` endpoints are **public** but do not check the `isPublic` flag. This allows any user (even unauthenticated) to:
- View private plants/aquariums marked as `isPublic: false`
- Access all photos and events for any plant/aquarium
- Enumerate all resources in the system

**Vulnerable Code:**
```typescript
// Line 87-94: plants.get is PUBLIC
get: publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    const result = await db.select().from(plants)
      .where(eq(plants.id, input.id)).limit(1);
    return result[0] ?? null;  // ❌ No isPublic check
  }),

// Line 195-201: getPhotos is PUBLIC
getPhotos: publicProcedure
  .input(z.object({ plantId: z.number() }))
  .query(async ({ input }) => {
    return db.select().from(plantPhotos)
      .where(eq(plantPhotos.plantId, input.plantId))  // ❌ No privacy check
      .orderBy(desc(plantPhotos.takenAt));
  }),
```

**Impact:** CRITICAL - Privacy violation, data exposure

**Fix:** Add `isPublic` checks to all public getters:
```typescript
get: publicProcedure
  .input(z.object({ id: z.number() }))
  .query(async ({ input }) => {
    const result = await db.select().from(plants)
      .where(and(
        eq(plants.id, input.id),
        eq(plants.isPublic, true)  // ← Add this
      )).limit(1);
    return result[0] ?? null;
  }),
```

---

### 3. **Missing Session AppId Verification** 🔴 CRITICAL

**Location:** `server/_core/sdk.ts` lines 200-232

**Issue:** The `verifySession` function verifies the JWT signature but **does not compare the `appId` in the token to the current application's `ENV.appId`**. This allows:
- Tokens from other applications (if they share the same secret) to be accepted
- Cross-application session hijacking if secrets are compromised

**Vulnerable Code:**
```typescript
// Line 200-232
async verifySession(cookieValue: string | undefined | null) {
  // ... JWT verification ...
  const { openId, appId, name } = payload as Record<string, unknown>;
  
  if (!isNonEmptyString(openId) ||
      !isNonEmptyString(appId) ||  // ← Only checks if non-empty
      !isNonEmptyString(name)) {
    return null;
  }
  
  // ❌ Missing: if (appId !== ENV.appId) throw error
  return { openId, appId, name };
}
```

**Impact:** MEDIUM - Cross-application session hijacking

**Fix:** Add appId equality check:
```typescript
if (appId !== ENV.appId) {
  console.warn("[Auth] AppId mismatch in session token");
  return null;
}
```

---

### 4. **No Rate Limiting on Upload Endpoints** 🔴 CRITICAL

**Location:** `server/_core/index.ts` lines 35-36

**Issue:** The application accepts uploads up to **50MB per request** with **no rate limiting**. Combined with the missing ownership checks, this allows:
- Disk space exhaustion attacks (upload 50MB to random plant IDs)
- Denial of service by flooding the storage system
- No protection against brute-force attacks

**Vulnerable Code:**
```typescript
// Line 35-36: 50MB limit with no rate limiting
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
```

**Impact:** HIGH - Denial of service, resource exhaustion

**Fix:** Implement rate limiting and reduce body limit:
```typescript
import rateLimit from "express-rate-limit";

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,  // 10 uploads per 15 minutes per IP
  message: "Too many uploads, please try again later",
});

app.use(express.json({ limit: "5mb" }));  // Reduce from 50MB
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// Apply rate limiting to upload endpoints
app.post("/api/trpc/plants.addPhoto", uploadLimiter, ...);
app.post("/api/trpc/aquariums.addPhoto", uploadLimiter, ...);
```

---

### 5. **Missing MIME Type Validation** 🔴 HIGH

**Location:** `server/routers.ts` lines 122-126, 177-180, 312-315, 424-427

**Issue:** The application accepts any MIME type without validation. This allows:
- Uploading executable files (.exe, .sh) disguised as images
- Uploading malicious PDFs or documents
- Server-side template injection if files are processed

**Vulnerable Code:**
```typescript
// Line 122-126: No MIME validation
const buffer = Buffer.from(coverImageBase64, "base64");
const ext = coverImageMimeType.split("/")[1] ?? "jpg";  // ❌ Trusts user input
const key = `plants/${ctx.user.id}/${Date.now()}.${ext}`;
const stored = await storagePut(key, buffer, coverImageMimeType);
```

**Impact:** MEDIUM - File type bypass, potential code execution

**Fix:** Whitelist allowed MIME types:
```typescript
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

if (!ALLOWED_MIME_TYPES.includes(coverImageMimeType)) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Only JPEG, PNG, WebP, and GIF images are allowed",
  });
}
```

---

### 6. **No Security Headers** 🔴 HIGH

**Location:** `server/_core/index.ts`

**Issue:** The application does not set any security headers. This allows:
- Clickjacking attacks (no X-Frame-Options)
- MIME type sniffing (no X-Content-Type-Options)
- XSS attacks (no Content-Security-Policy)
- Insecure cookie handling (no Strict-Transport-Security)

**Impact:** HIGH - Multiple attack vectors

**Fix:** Add Helmet middleware:
```typescript
import helmet from "helmet";

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],  // Adjust as needed
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
  },
}));
```

---

### 7. **Missing CSRF Protection** 🔴 MEDIUM

**Location:** `server/_core/index.ts`

**Issue:** The application uses cookies for authentication but has no CSRF protection. This allows:
- Cross-site request forgery attacks
- Unauthorized mutations from third-party sites

**Impact:** MEDIUM - CSRF attacks

**Fix:** Implement CSRF tokens or use SameSite=Strict:
```typescript
// Already partially fixed in cookies.ts (sameSite: "none")
// But should be "strict" for same-origin requests
// OR implement CSRF token validation
```

---

## Summary Table

| Issue | Severity | Location | Fix Time |
|-------|----------|----------|----------|
| Missing ownership verification | CRITICAL | routers.ts:169-350 | 30 min |
| Public endpoints leak private data | CRITICAL | routers.ts:87-361 | 45 min |
| Missing AppId verification | CRITICAL | sdk.ts:200-232 | 15 min |
| No rate limiting | CRITICAL | index.ts:35-36 | 20 min |
| No MIME type validation | HIGH | routers.ts:122-427 | 25 min |
| Missing security headers | HIGH | index.ts | 15 min |
| No CSRF protection | MEDIUM | index.ts | 20 min |

**Total Estimated Fix Time:** ~2.5 hours

---

## Recommendations

1. **Immediate (Before Production):**
   - Fix ownership verification (Issue #1)
   - Fix privacy leaks (Issue #2)
   - Add AppId verification (Issue #3)
   - Implement rate limiting (Issue #4)

2. **Short-term (Before Public Launch):**
   - Add MIME type validation (Issue #5)
   - Add security headers (Issue #6)
   - Implement CSRF protection (Issue #7)

3. **Ongoing:**
   - Implement request logging and monitoring
   - Set up security alerts for suspicious activity
   - Regular security audits (quarterly)
   - Dependency vulnerability scanning

---

## Next Steps

The security team should:
1. Review and approve the fixes
2. Implement the patches
3. Run integration tests
4. Deploy to staging for security testing
5. Perform penetration testing before production


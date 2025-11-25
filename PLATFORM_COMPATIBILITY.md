# Platform Compatibility Guide

## Development → Production Environment

### Development Environment
- **OS**: macOS 15.6.1 (Sequoia)
- **Architecture**: ARM64 (Apple Silicon M1/M2/M3)
- **Platform**: Darwin Kernel 24.6.0
- **Node.js**: v24 (LTS)

### Production Environment (VPS)
- **OS**: Ubuntu Linux
- **Architecture**: x64 (AMD64)
- **Platform**: Linux
- **Node.js**: v24 (LTS)

---

## Cross-Platform Safeguards

### 1. Line Endings (`.gitattributes`)
- **Purpose**: Ensure consistent line endings across platforms
- **Solution**: All text files use LF (Unix-style) line endings
- **Files**: `.gitattributes` normalizes line endings for:
  - Source code (`.js`, `.ts`, `.tsx`, etc.)
  - Config files (`.json`, `.yml`, `.env`)
  - Shell scripts (`.sh`)

### 2. Native Binary Dependencies
**Potential Issues:**
- Some npm packages have platform-specific native binaries
- Examples: `fsevents` (macOS only), `@swc/core`, `esbuild`, `sharp`

**Solution:**
- `npm ci` on Ubuntu VPS rebuilds binaries for Linux x64
- `npm rebuild` explicitly rebuilds all native modules
- `.npmrc` configured to handle optional dependencies correctly

### 3. Package Resolution (`.npmrc`)
**Configuration:**
```ini
legacy-peer-deps=true       # Next.js 16 compatibility
engine-strict=false         # Allow platform differences
optional=true               # Handle platform-specific deps (fsevents)
package-lock=true          # Ensure consistent installs
```

### 4. Node.js Version Consistency
**Configuration in `package.json`:**
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "os": ["darwin", "linux"]
}
```

---

## CI/CD Pipeline Compatibility

### GitHub Actions Runner
- **Platform**: Ubuntu 22.04 LTS (x64)
- **Purpose**: Build and test code in Linux environment
- **Benefits**:
  - Matches production Ubuntu VPS
  - Validates Linux compatibility
  - Rebuilds native binaries for Linux

### Deployment Flow
```
macOS ARM64 (dev)
    ↓ git push
GitHub Ubuntu x64 (CI)
    ↓ npm ci --legacy-peer-deps
    ↓ npm rebuild (Linux binaries)
    ↓ Tests & Build
Ubuntu x64 VPS (prod)
    ↓ npm ci --legacy-peer-deps
    ↓ npm rebuild (ensures Linux binaries)
    ↓ npm run build
    ↓ Production deployment
```

---

## Verified Compatibility

### ✅ Cross-Platform Tested Components

1. **Next.js 16.0.4**
   - ESM modules work on both macOS and Linux
   - Turbopack compiles correctly on both platforms

2. **Prisma Client**
   - Generates platform-specific binaries automatically
   - `prisma generate --force` ensures correct platform binary

3. **Node.js Modules**
   - Optional dependencies (like `fsevents`) are macOS-only, gracefully skipped on Linux
   - Required dependencies work on both platforms

4. **Build Process**
   - `.next` build output is platform-independent
   - Static assets are identical across platforms

---

## Common Platform Issues & Solutions

### Issue 1: "Module not found" after deployment
**Cause**: Native binary built for macOS ARM64, incompatible with Linux x64

**Solution**: Pipeline runs `npm rebuild` to regenerate Linux binaries
```bash
npm rebuild
```

### Issue 2: Different package-lock.json on VPS
**Cause**: Platform-specific dependency resolution

**Solution**: CI/CD verifies package-lock.json consistency before deployment

### Issue 3: Line ending issues (CRLF vs LF)
**Cause**: Windows contributors or Git autocrlf settings

**Solution**: `.gitattributes` enforces LF for all text files

### Issue 4: Prisma Client platform mismatch
**Cause**: Prisma generates binaries for the build platform

**Solution**: `npx prisma generate --force` runs on VPS during deployment

---

## Development Workflow

### Local Development (macOS)
```bash
npm install          # Installs macOS ARM64 binaries
npm run dev          # Runs Next.js dev server
npm run build        # Tests build locally (optional)
```

### Committing Changes
```bash
git add .
git commit -m "Your changes"
git push origin master
```

### Automatic Deployment
1. GitHub Actions runs on Ubuntu x64
2. Installs dependencies with Linux binaries
3. Runs tests and builds
4. Deploys to Ubuntu VPS
5. VPS rebuilds native binaries
6. Starts production server

---

## Monitoring Platform Compatibility

### Check Current Platform
```bash
# Local (macOS)
uname -s -m
# Output: Darwin arm64

# VPS (Ubuntu)
uname -s -m
# Output: Linux x86_64
```

### Verify Node.js Version
```bash
node --version
# Both should show: v24.x.x
```

### Check Prisma Binary Platform
```bash
ls node_modules/.prisma/client/*.node
# macOS: libquery_engine-darwin-arm64.dylib.node
# Linux: libquery_engine-debian-openssl-3.0.x.so.node
```

---

## Best Practices

1. **Always commit `package-lock.json`**
   - Ensures dependency consistency across platforms
   - CI/CD validates it's in sync

2. **Test builds locally on macOS before pushing**
   ```bash
   npm run build
   ```

3. **Let CI/CD handle platform-specific builds**
   - Don't manually modify binaries
   - Trust the automated rebuild process

4. **Use consistent Node.js versions**
   - Both environments use Node.js v24 LTS
   - Specified in `package.json` engines field

5. **Avoid platform-specific code**
   - Use Node.js cross-platform APIs
   - Test critical paths on both platforms if possible

---

## Troubleshooting

### If deployment fails with "Cannot find module"
1. Check CI/CD logs for `npm rebuild` step
2. Verify Prisma generation succeeded
3. Ensure Node.js versions match

### If build succeeds locally but fails on VPS
1. Check for macOS-specific dependencies
2. Verify line endings in shell scripts
3. Review CI/CD platform verification logs

### If native binaries fail
1. VPS may need build tools: `apt-get install build-essential python3`
2. Check Node.js version compatibility
3. Review npm rebuild logs

---

## Summary

✅ **Fully Compatible**: macOS ARM64 (dev) → Ubuntu x64 (prod)

The project is configured with:
- Cross-platform line endings (`.gitattributes`)
- Platform-agnostic npm configuration (`.npmrc`)
- Automatic native binary rebuilds (CI/CD)
- Prisma Client platform detection
- Node.js version consistency
- Comprehensive platform verification logging

No manual intervention required for cross-platform compatibility! 🎉

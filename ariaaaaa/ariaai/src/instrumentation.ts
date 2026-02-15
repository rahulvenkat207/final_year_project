export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Custom DNS resolution for restricted network environments
    try {
      const nodeModule = await import("node:module");
      // @ts-ignore
      const createRequire = nodeModule.createRequire || nodeModule.default?.createRequire;
      
      if (typeof createRequire !== "function") {
        console.warn("[GLOBAL DNS PATCH] createRequire not found in node:module. Keys:", Object.keys(nodeModule));
        return;
      }

      const require = createRequire(import.meta.url);
      const dns = require("node:dns");
      const { promisify } = require("node:util");

      const originalLookup = dns.lookup;
      const resolver = new dns.Resolver();
      resolver.setServers(["8.8.8.8", "1.1.1.1"]);
      const resolve4Async = promisify(resolver.resolve4.bind(resolver));

      const patchLookup = (host: string, opts: any, cb: any) => {
        if (typeof opts === "function") {
          cb = opts;
          opts = {};
        }

        // Domains that are often blocked or fail resolution in restricted networks
        const hostnamesToFix = [
          "neon.tech", "sarvam.ai", "livekit.cloud", "assemblyai.com", 
          "openai.com", "moonshot.cn", "x.ai", "groq.com", "elevenlabs.io"
        ];
        const needsFix = hostnamesToFix.some(h => host.includes(h));

        if (needsFix) {
          console.log(`[GLOBAL DNS PATCH] Resolving: ${host}`);
          resolve4Async(host)
            .then((addresses: string[]) => {
              if (addresses && addresses.length > 0) {
                if (opts?.all) {
                  return cb(null, addresses.map(a => ({ address: a, family: 4 })));
                }
                return cb(null, addresses[0], 4);
              }
              return originalLookup(host, opts, cb);
            })
            .catch((err: any) => {
              console.warn(`[GLOBAL DNS PATCH] Public resolver failed for ${host}:`, err.message);
              return originalLookup(host, opts, cb);
            });
          return;
        }
        return originalLookup(host, opts, cb);
      };

      // Apply the patch to all node processes in the Next.js server
      // @ts-ignore
      dns.lookup = patchLookup;
      
      // @ts-ignore
      if (dns.promises && dns.promises.lookup) {
        // @ts-ignore
        dns.promises.lookup = promisify(patchLookup);
      }
      
      console.log("[GLOBAL DNS PATCH] Successfully registered DNS interceptor");
    } catch (err) {
      console.warn("[GLOBAL DNS PATCH] Unexpected error during DNS patch initialization:", err);
    }
  }
}

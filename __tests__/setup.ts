import Module from "module";
import path from "path";

// Patch require to resolve cloudea.config.ts from project root
const originalResolveFilename = (Module as unknown as { _resolveFilename: (...args: unknown[]) => string })._resolveFilename;
(Module as unknown as { _resolveFilename: (...args: unknown[]) => string })._resolveFilename = function (
  request: string,
  ...args: unknown[]
) {
  if (request === "../../cloudea.config") {
    return path.join(process.cwd(), "cloudea.config.ts");
  }
  return originalResolveFilename.call(this, request, ...args);
};

import fs from "node:fs/promises";
import path from "node:path";
import { getConfig } from "@/lib/config";

const ROOT_DIR = process.cwd();

/**
 * Only local scripts explicitly listed in `cloudea.config.ts → customScripts`
 * may be served. Anything else would expose arbitrary project files.
 */
const ALLOWED_SCRIPTS = new Set(
  (getConfig().customScripts ?? [])
    .filter((script) => script.src && !script.external)
    .map((script) => path.posix.normalize(script.src!.replace(/^\.?\//, ""))),
);

export async function GET(_request: Request, { params }: RouteContext<"/api/custom-script/[...path]">) {
  const { path: segments } = await params;
  const requested = path.posix.normalize(segments.join("/"));

  if (!ALLOWED_SCRIPTS.has(requested)) {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const content = await fs.readFile(path.join(/* turbopackIgnore: true */ ROOT_DIR, requested), "utf-8");
    return new Response(content, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "public, max-age=3600, must-revalidate",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/proxy/image", async (req, res) => {
  const url = req.query.url as string | undefined;
  if (!url || !url.startsWith("http")) {
    res.status(400).json({ error: "Invalid url parameter" });
    return;
  }

  try {
    const fetchRes = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MCOC-Roster/1.0)",
        "Accept": "image/*,*/*;q=0.8",
      },
    });

    if (!fetchRes.ok) {
      logger.warn({ url, status: fetchRes.status }, "Image proxy fetch failed");
      res.status(fetchRes.status).send();
      return;
    }

    const contentType = fetchRes.headers.get("content-type");
    if (contentType) {
      res.setHeader("content-type", contentType);
    }
    res.setHeader("cache-control", "public, max-age=86400");

    const blob = await fetchRes.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());
    res.send(buffer);
  } catch (err) {
    logger.error({ err, url }, "Image proxy error");
    res.status(500).json({ error: "Failed to fetch image" });
  }
});

export default router;

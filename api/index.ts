import { Hono } from "hono"
import { handle } from "hono/vercel"
import { execa } from "execa"

export const runtime = "nodejs"

const app = new Hono().basePath("/api")

app.get("/", (c) => {
  return c.html(
    `<html>
      <body>
        <form action="/api/parse" method="post">
          <label for="url">URL:</label>
          <input type="text" name="url" />
          <button type="submit">Send</button>
        </form>
      </body>
    </html>`
  )
})

app.post("/parse", async (c) => {
  const formData = await c.req.formData()
  const url = formData.get("url")

  if (!url) {
    return c.json({
      msg: "URL is required",
    })
  }

  if (typeof url !== "string") {
    return c.json({
      msg: "URL must be a string",
    })
  }

  try {
    // const { stdout, stderr } = await execa("npx", [
    //   "single-file-cli",
    //   url,
    //   "--dump-content",
    // ])

    const { stdout, stderr } = await execa(
      "./node_modules/.bin/single-file",
      [url, "--dump-content"]
    )

    if (stderr) {
      throw new Error(stderr)
    }

    return c.json({ msg: "ok", parsed: stdout })
  } catch (error: any) {
    return c.json({ msg: error?.message || "unknown error" })
  }
})

const handler = handle(app)

export const GET = handler
export const POST = handler
export const PATCH = handler
export const PUT = handler
export const OPTIONS = handler

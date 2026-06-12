/**
 * regenerate-media-sizes.ts
 *
 * Re-processes ALL existing Media documents through Payload's image resize
 * pipeline, regenerating thumbnail/square/small/medium/large/xlarge/og sizes
 * as compressed WebP files (per the formatOptions added to Media.ts).
 *
 * This does NOT re-upload files. It triggers Payload's local API `update`
 * on each Media doc, passing the existing original file back through,
 * which causes Payload/Sharp to regenerate all configured imageSizes.
 *
 * USAGE (run from junooni-blanks project root):
 *   npx tsx src/scripts/regenerate-media-sizes.ts
 *
 * Make sure Media.ts already has the formatOptions/imageSizes update
 * applied BEFORE running this script.
 */

import { config as loadEnv } from 'dotenv'
import path from 'path'

// Load .env BEFORE anything else is imported, so payload.config.ts sees
// process.env.PAYLOAD_SECRET etc. when it's evaluated.
loadEnv({ path: path.resolve(process.cwd(), '.env') })

console.log('CWD:', process.cwd())
console.log('PAYLOAD_SECRET loaded:', !!process.env.PAYLOAD_SECRET)

const BATCH_SIZE = 5 // process this many media docs in parallel
const DELAY_MS = 250 // small delay between batches to avoid overload

async function run() {
  // Dynamic imports so they're evaluated AFTER loadEnv() runs above.
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config.js')
  const fs = await import('fs')

  const payload = await getPayload({ config })

  payload.logger.info('Starting media size regeneration...')

  let page = 1
  let totalProcessed = 0
  let totalFailed = 0
  const failedIds: (string | number)[] = []

  while (true) {
    const result = await payload.find({
      collection: 'media',
      limit: BATCH_SIZE,
      page,
      depth: 0,
    })

    if (result.docs.length === 0) break

    payload.logger.info(
      `Processing page ${page} (${result.docs.length} docs, ${result.totalDocs} total)...`
    )

    await Promise.all(
      result.docs.map(async (doc: any) => {
        try {
          const staticDir = path.resolve(process.cwd(), 'public/media')
          const filePath = path.join(staticDir, doc.filename)

          if (!fs.existsSync(filePath)) {
            payload.logger.warn(
              `  Skipping ${doc.filename} — file not found at ${filePath}`
            )
            return
          }

          const fileBuffer = fs.readFileSync(filePath)

          // Re-run through Payload's upload pipeline by passing the file again.
          // This regenerates all configured imageSizes with new formatOptions.
          await payload.update({
            collection: 'media',
            id: doc.id,
            data: {},
            file: {
              data: fileBuffer,
              mimetype: doc.mimeType,
              name: doc.filename,
              size: doc.filesize,
            },
          })

          totalProcessed++
          payload.logger.info(`  ✓ Regenerated sizes for ${doc.filename}`)
        } catch (err: any) {
          totalFailed++
          failedIds.push(doc.id)
          payload.logger.error(
            `  ✗ Failed for doc ${doc.id} (${doc.filename}): ${err.message}`
          )
        }
      })
    )

    if (page * BATCH_SIZE >= result.totalDocs) break

    page++
    await new Promise((r) => setTimeout(r, DELAY_MS))
  }

  payload.logger.info('Done.')
  payload.logger.info(`Successfully processed: ${totalProcessed}`)
  payload.logger.info(`Failed: ${totalFailed}`)
  if (failedIds.length > 0) {
    payload.logger.info(`Failed doc IDs: ${failedIds.join(', ')}`)
  }

  process.exit(0)
}

run().catch((err) => {
  console.error('Script failed:', err)
  process.exit(1)
})
import path from 'path'
import url from 'url'

export const __dirname = url.fileURLToPath(import.meta.url)

export const cdkPath = path.join(__dirname, '..', '..', '..', 'node_modules', 'cdk')

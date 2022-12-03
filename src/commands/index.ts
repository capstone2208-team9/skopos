import path from 'path'
import url from 'url'

const __dirname = url.fileURLToPath(import.meta.url)
export const cdkDirectoryPath = path.join(__dirname, '..', '..', 'cdk')
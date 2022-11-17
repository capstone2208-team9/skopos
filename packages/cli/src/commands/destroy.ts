import {executeCommand, ROOT_PATH} from '../lib/index.js'

export default async function destroy() {
  const command = 'npm run destroy --workspaces --if-present'
  await executeCommand(ROOT_PATH, command)
}


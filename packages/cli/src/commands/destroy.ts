import {executeCommand, ROOT_PATH} from '../lib'

export default async function deploy() {
  const command = 'npm run destroy --workspaces --if-present'
  await executeCommand(ROOT_PATH, command)
}


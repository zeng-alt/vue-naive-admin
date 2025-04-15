import fs from 'node:fs'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 要下载的图标列表
const icons = [
  'settings',
  'user',
  'list',
  'user-role',
  'building',
  'data',
  'chart',
  'security',
  'tools',
  'notification',
  'help',
  'search',
  'add',
  'edit',
  'delete',
  'save',
  'close',
  'checkmark',
  'warning',
  'error',
]

// 下载单个图标
function downloadIcon(iconName) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, '../src/assets/icons/carbon', `${iconName}.svg`)
    const file = fs.createWriteStream(filePath)
    https.get(`https://github.com/carbon-design-system/carbon-icons/raw/master/src/svg/${iconName}/32.svg`, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      file.close()
      fs.unlink(filePath, () => {
        reject(err)
      })
    })
  })
}

// 下载所有图标
async function downloadAllIcons() {
  for (const icon of icons) {
    try {
      await downloadIcon(icon)
      console.log(`Downloaded ${icon}.svg`)
    }
    catch (err) {
      console.error(`Error downloading ${icon}.svg:`, err)
    }
  }
}

downloadAllIcons()

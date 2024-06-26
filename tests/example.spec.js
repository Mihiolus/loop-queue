const { test, expect, _electron: electron } = require('@playwright/test')

test('example test', async () => {
  const electronApp = await electron.launch({ args: ['.'] })
  const isPackaged = await electronApp.evaluate(async ({ app }) => {
    // This runs in Electron's main process, parameter here is always
    // the result of the require('electron') in the main app script.
    return app.isPackaged
  })

  expect(isPackaged).toBe(false)

  // Wait for the first BrowserWindow to open
  // and return its Page object
  const window = await electronApp.firstWindow()
  await window.screenshot({ path: 'intro.png' })

  // close app
  await electronApp.close()
})
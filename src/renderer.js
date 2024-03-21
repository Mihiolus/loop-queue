/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

console.log('👋 This message is being logged by "renderer.js", included via Vite');

document.querySelector("#add_item").addEventListener('click', () => addItem());

var items = ["Item 1"];

renderItems();

function addItem(){
  items.push("New item");
  let queue = document.querySelector('#queue');
  let newRow = queue.insertRow(queue.rows.length);

  newRow.insertCell(0).innerHTML = "New item";
  newRow.insertCell(1).innerHTML = '<button onclick="transferItem(this)">\></button>'
}

function transferItem(button){
  let queue = document.querySelector('#queue')
  let row = button.parentNode.parentNode;
}

function renderItems(){
  let queue = document.querySelector('#queueBody');
  for (var item of items){
    queue.append(createNode(item));
  }
}

function createNode(text){
  let tr = document.createElement("tr");
  let td = document.createElement("td");
  td.append(text);
  tr.append(td);
  return tr;
}
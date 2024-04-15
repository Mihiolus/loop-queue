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

const queueList = document.querySelector('#queue ol')
const itemInput = document.querySelector('input')
const addButton = document.querySelector('button')
const planList = document.querySelector('#plan ol')

const data = await window.electronAPI.loadData();
queueList.innerHTML = '';
for (const itemName of data.queue) {
  addItemToQueue(itemName);
}
for (const itemName of data.plan) {
  addItemToPlan(itemName);
}

addButton.addEventListener('click', () => {
  let itemName = itemInput.value;
  if (!isNameValid(itemName)) return;
  itemInput.value = '';
  addItemToQueue(itemName);
  window.electronAPI.addQueue(itemName);
  itemInput.focus();
});

itemInput.addEventListener('input', () => {
  let inputString = itemInput.value;
  addButton.disabled = !isNameValid(inputString);
});

function isNameValid(itemName) {
  if (itemName === null) return false;
  if (typeof itemName != 'string') return false;
  if (itemName.trim().length === 0) return false;
  return true;
}

itemInput.addEventListener('keypress', function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    addButton.click();
  }
})

function editItem(event){
  const sourceElement = event.target;
  const textField = document.createElement("input");
  textField.type = "text";
  textField.value = sourceElement.textContent;
  textField.focus();
  sourceElement.replaceWith(textField);
  textField.select();
  textField.addEventListener("blur", () => {
    const newName = textField.value;
    textField.replaceWith(sourceElement);
    if (isNameValid(newName)) {
      sourceElement.textContent = newName;
      const itemIndex = getItemIndex(queueItem);
      window.electronAPI.renameItem(itemIndex, newName);
    }
  });
  textField.addEventListener('keypress', (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      textField.blur();
    }
  })
}

function addItemToQueue(itemName) {
  let queueItem = document.createElement('li');
  let span = document.createElement('span');
  let planButton = document.createElement('button');
  let deleteButton = document.createElement('button');
  queueItem.appendChild(span);
  queueItem.appendChild(planButton);
  queueItem.appendChild(deleteButton);
  span.textContent = itemName;
  queueList.appendChild(queueItem);
  planButton.textContent = "→";
  planButton.addEventListener('click', () => {
    addItemToPlan(itemName);
    window.electronAPI.addToPlan(itemName);
    queueList.insertBefore(queueItem, queueList.childNodes[0]);
  });
  deleteButton.textContent = "x";
  deleteButton.addEventListener('click', () => {
    const itemIndex = getItemIndex(queueItem);
    queueItem.remove();
    window.electronAPI.deleteItem(itemIndex);
  })
  span.addEventListener('dblclick', editItem);
}
function getItemIndex(queueItem) {
  const queueArray = Array.from(queueList.children);
  const itemIndex = queueArray.indexOf(queueItem);
  return itemIndex;
}

function addItemToPlan(itemName) {
  const planItem = document.createElement('li');
  planItem.textContent = itemName;
  planList.appendChild(planItem);
  planItem.addEventListener('dblclick', editItem);
}


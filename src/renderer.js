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
import uuid4 from 'uuid4';

const queueNode = document.querySelector('#queue ol')
const itemInput = document.querySelector('input')
const addButton = document.querySelector('button')
const historyNode = document.querySelector('#history ol')
const historyLimitField = document.querySelector('#history-limit')

const data = await window.electronAPI.loadData();
console.log(data);
let sqlstr = "CREATE TABLE hello (a int, b char); \
INSERT INTO hello VALUES (0, 'hello'); \
INSERT INTO hello VALUES (1, 'world');";
data.run(sqlstr);
console.log(data);
repaintQueue();
repaintHistory();
historyLimitField.value = data.historyLimit;

const newItemForm = document.querySelector('form');

newItemForm.addEventListener('submit', e => {
  e.preventDefault();
  let itemName = itemInput.value.trim();
  let newItem = { id: uuid4(), name: itemName };
  itemInput.value = '';
  itemInput.focus();
  const event = new Event('input');
  itemInput.dispatchEvent(event);
  data.queue.push(newItem);
  window.electronAPI.saveData(data);
  repaintQueue();
})

itemInput.addEventListener('input', () => {
  let inputString = itemInput.value;
  addButton.disabled = !isNameValid(inputString);
});

historyLimitField.addEventListener('change', () => {
  if (historyLimitField.checkValidity()) {
    data.historyLimit = historyLimitField.value;
  } else {
    historyLimitField.value = data.historyLimit;
  }
  trimHistory();
})

function repaintQueue() {
  queueNode.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (const queueItem of data.queue) {
    fragment.appendChild(createQueueItem(queueItem));
  }
  queueNode.appendChild(fragment);
}

function repaintHistory() {
  historyNode.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (const historyItem of data.history) {
    fragment.appendChild(createHistoryItem(historyItem));
  }
  fragment.lastElementChild?.classList.add("last-history-item");
  historyNode.appendChild(fragment);
}

function isNameValid(itemName) {
  if (itemName === null) return false;
  if (typeof itemName != 'string') return false;
  if (itemName.trim().length === 0) return false;
  return true;
}

const editingField = document.createElement("input");
let editedSpan = null;
editingField.type = "text";
editingField.addEventListener("blur", () => {
  if (!editedSpan) return;
  const newName = editingField.value;
  if (isNameValid(newName)) {
    acceptItemEdit();
  } else {
    cancelItemEdit();
  }
});
editingField.addEventListener('keydown', (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const newName = editingField.value;
    if (isNameValid(newName)) {
      acceptItemEdit();
    } else {
      editingField.placeholder = "Enter a valid name";
    }
  } else if (e.key === "Escape") {
    e.preventDefault();
    cancelItemEdit();
  }
})
function acceptItemEdit() {
  const newName = editingField.value.trim();
  const itemid = editedSpan.dataset.itemid;
  const editedItem = data.queue.find((item) => item.id == itemid);
  editedItem.name = newName;
  editedSpan.textContent = newName;
  const temp = editedSpan;
  editedSpan = null;
  editingField.replaceWith(temp);
  editingField.placeholder = "";
  window.electronAPI.saveData(data);
}
function cancelItemEdit() {
  editingField.placeholder = "";
  const temp = editedSpan;
  editedSpan = null;
  editingField.replaceWith(temp);
}

function editItem(event) {
  editedSpan = event.target;
  editingField.value = editedSpan.textContent;
  editedSpan.replaceWith(editingField);
  editingField.focus();
  editingField.select();
}

function createQueueItem(item) {
  let queueItem = document.createElement('li');
  let span = document.createElement('span');
  let historyButton = document.createElement('button');
  let deleteButton = document.createElement('button');
  queueItem.appendChild(span);
  queueItem.appendChild(historyButton);
  queueItem.appendChild(deleteButton);
  span.textContent = item.name;
  span.dataset.itemid = item.id;
  historyButton.textContent = "→";
  historyButton.addEventListener('click', () => {
    const newHistoryItem = { name: item.name };
    data.history.push(newHistoryItem);
    trimHistory();
    const itemIndex = data.queue.indexOf(item);
    data.queue.splice(itemIndex, 1);
    data.queue.unshift(item);
    repaintQueue();
  });
  deleteButton.textContent = "x";
  deleteButton.addEventListener('click', () => {
    const itemIndex = data.queue.indexOf(item);
    data.queue.splice(itemIndex, 1);
    window.electronAPI.saveData(data);
  })
  span.addEventListener('dblclick', editItem);
  return queueItem;
}

function trimHistory() {
  data.history.splice(0, data.history.length - data.historyLimit);
  window.electronAPI.saveData(data);
  repaintHistory();
}

function createHistoryItem(item) {
  const historyItem = document.createElement('li');
  const span = document.createElement('span');
  historyItem.appendChild(span);
  span.textContent = item.name;
  return historyItem;
}

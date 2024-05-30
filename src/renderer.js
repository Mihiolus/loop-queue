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

const queueList = document.querySelector('#queue ol')
const itemInput = document.querySelector('input')
const addButton = document.querySelector('button')
const planList = document.querySelector('#plan ol')

const data = await window.electronAPI.loadData();
updateQueue();
updatePlan();

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
  updateQueue();
})

itemInput.addEventListener('input', () => {
  let inputString = itemInput.value;
  addButton.disabled = !isNameValid(inputString);
});

function updateQueue() {
  queueList.innerHTML = '';
  const fragment = document.createDocumentFragment();  
  for (const itemName of data.queue) {
    fragment.appendChild(createQueueItem(itemName));
  }
  queueList.appendChild(fragment);
}

function updatePlan() {
  planList.innerHTML = '';
  const fragment = document.createDocumentFragment();
  for (const itemName of data.plan) {
    fragment.appendChild(createPlanItem(itemName));
  }
  planList.appendChild(fragment);
}

function isNameValid(itemName) {
  if (itemName === null) return false;
  if (typeof itemName != 'string') return false;
  if (itemName.trim().length === 0) return false;
  return true;
}

function editItem(event) {
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
      // window.electronAPI.renameItem(itemIndex, newName);
    }
  });
  textField.addEventListener('keypress', (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      textField.blur();
    }
  })
}

function createQueueItem(item) {
  let queueItem = document.createElement('li');
  let span = document.createElement('span');
  let planButton = document.createElement('button');
  let deleteButton = document.createElement('button');
  queueItem.appendChild(span);
  queueItem.appendChild(planButton);
  queueItem.appendChild(deleteButton);
  span.textContent = item.name;
  planButton.textContent = "→";
  planButton.addEventListener('click', () => {
    addItemToPlan(item);
    // window.electronAPI.addToPlan(item);
    queueList.insertBefore(queueItem, queueList.childNodes[0]);
  });
  deleteButton.textContent = "x";
  deleteButton.addEventListener('click', () => {
    const itemIndex = getItemIndex(queueItem);
    queueItem.remove();
    // window.electronAPI.deleteItem(itemIndex);
  })
  span.addEventListener('dblclick', editItem);
  return queueItem;
}

function addItemToQueue(item) {
  let queueItem = document.createElement('li');
  let span = document.createElement('span');
  let planButton = document.createElement('button');
  let deleteButton = document.createElement('button');
  queueItem.appendChild(span);
  queueItem.appendChild(planButton);
  queueItem.appendChild(deleteButton);
  span.textContent = item;
  queueList.appendChild(queueItem);
  planButton.textContent = "→";
  planButton.addEventListener('click', () => {
    addItemToPlan(item);
    // window.electronAPI.addToPlan(item);
    queueList.insertBefore(queueItem, queueList.childNodes[0]);
  });
  deleteButton.textContent = "x";
  deleteButton.addEventListener('click', () => {
    const itemIndex = getItemIndex(queueItem);
    queueItem.remove();
    // window.electronAPI.deleteItem(itemIndex);
  })
  span.addEventListener('dblclick', editItem);
}

function getItemIndex(queueItem) {
  const queueArray = Array.from(queueList.children);
  const itemIndex = queueArray.indexOf(queueItem);
  return itemIndex;
}

function createPlanItem(item) {
  const planItem = document.createElement('li');
  const span = document.createElement('span');
  planItem.appendChild(span);
  span.textContent = item.name;
  span.addEventListener('dblclick', editItem);
  return planItem;
}

function addItemToPlan(itemName) {
  const planItem = document.createElement('li');
  const span = document.createElement('span');
  planItem.appendChild(span);
  span.textContent = itemName;
  planList.appendChild(planItem);
  span.addEventListener('dblclick', editItem);
}


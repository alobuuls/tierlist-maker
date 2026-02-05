const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

const imageInput = $('#image-input');
const itemsSection = $('#selector-items');
const resetButton = $('#reset-tier-button');
const saveButton = $('#save-tier-button');

function createItem(src) {
  const imgElement = document.createElement('img');
  imgElement.draggable = true;
  imgElement.src = src;
  imgElement.className = 'item-image';

  imgElement.addEventListener('dragstart', handleDragStart);
  imgElement.addEventListener('dragend', handleDragEnd);

  itemsSection.appendChild(imgElement);
  return imgElement;
}

function userFilesToCreateItems(files) {
  if (files && files.length > 0) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (eventReader) => {
        createItem(eventReader.target.result);
      }
      reader.readAsDataURL(file);
    });
  }
}

imageInput.addEventListener('change', (event) => {
  const { files } = event.target
  userFilesToCreateItems(files);
});

let draggedElement = null;
let sourceContainer = null;

const rows = $$('.tier .row');

rows.forEach(row => {
  row.addEventListener('dragover', handleDragOver);
  row.addEventListener('drop', handleDrop);
  row.addEventListener('dragleave', handleDragLeave);
});

itemsSection.addEventListener('dragover', handleDragOver);
itemsSection.addEventListener('drop', handleDrop);
itemsSection.addEventListener('dragleave', handleDragLeave);

itemsSection.addEventListener('drop', handleDropFromDesktop);
itemsSection.addEventListener('dragover', handleDragOverFromDesktop);


function handleDragOverFromDesktop(event) {
  event.preventDefault();

  const { currentTarget, dataTransfer } = event;

  if (dataTransfer.types.includes('Files')) {
    currentTarget.classList.add('drag-files');
  }
}

function handleDropFromDesktop(event) {
  event.preventDefault();

  const { currentTarget, dataTransfer } = event;

  if (dataTransfer.types.includes('Files')) {
  currentTarget.classList.remove('drag-files')
  const { files } = dataTransfer
  userFilesToCreateItems(files);
  }
}

function handleDrop(event) {
  event.preventDefault(); 

  const { currentTarget, dataTransfer } = event;

  if (sourceContainer && draggedElement) {
    sourceContainer.removeChild(draggedElement);
  }
  
  if (draggedElement) {
    const src = dataTransfer.getData('text/plain');
    const imgElement = createItem(src);
    currentTarget.appendChild(imgElement);
  }

  currentTarget.classList.remove('drag-over');
  currentTarget.querySelector('.drag-preview')?.remove();
  
}

function handleDragOver(event) {
  event.preventDefault();

  const { currentTarget, dataTransfer } = event;
  if (sourceContainer === currentTarget) return; 

  currentTarget.classList.add('drag-over');

  const dragPreview = document.querySelector('.drag-preview');

  if (draggedElement && !dragPreview) {
    const previewElement = draggedElement.cloneNode(true);
    previewElement.classList.add('drag-preview');
    currentTarget.appendChild(previewElement);
  }
}

function handleDragLeave(event) {
  event.preventDefault();

  const { currentTarget } = event;
  currentTarget.classList.remove('drag-over');
  currentTarget.querySelector('.drag-preview')?.remove();
}

function handleDragStart(event) {
  draggedElement = event.target;
  sourceContainer = draggedElement.parentNode;
  event.dataTransfer.setData('text/plain', draggedElement.src);
}

function handleDragEnd() {
  draggedElement = null;
  sourceContainer = null;
}

resetButton.addEventListener('click', () => {
  const items = $$('.tier .tier-image');
  items.forEach(item => {
    item.remove();
    itemsSection.appendChild(item);
  });
});

saveButton.addEventListener('click', () => {
  const tierContainer = $('.tier');
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  import('https://cdn.jsdelivr.net/npm/html2canvas-pro@1.5.8/+esm')
  .then(({ default: html2canvas }) => {
    html2canvas(tierContainer).then(canvas => {
      ctx.drawImage(canvas, 0, 0);
      const imgURL = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'tier.png';
      downloadLink.href = imgURL;
      downloadLink.click();
    });
  });
});
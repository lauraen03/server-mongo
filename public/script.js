document.addEventListener('DOMContentLoaded', () => {
  fetchData();
});

async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    displayData(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function displayData(data) {
  const appDiv = document.getElementById('app');

  appDiv.innerHTML = '';

  data.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item';

    itemDiv.innerHTML = `
      <img src="${item.imageUrl}" alt="${item.title}" />
      <h2>${item.title}</h2>
      <p>${item.genre}</p>
      <p>${item.releaseYear}</p>
      <p>${item.platform}</p>
      <p>
        Characters:
        <span class="character-list">${item.characters.join(', ')}</span>
      </p>
      <p>Description: ${item.description}</p>
      <a href="${item.trailerUrl}" target="_blank">Watch Trailer</a>
      <button class="edit-btn" onclick="editItem(${item.id})">Edit</button>
      <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
    `;

    appDiv.appendChild(itemDiv);

    const characterList = itemDiv.querySelector('.character-list');
    characterList.addEventListener('click', () => showCharacterImages(item.title, item.characters));
  });
}

function showCharacterImages(game, characters) {
  const modal = document.createElement('div');
  modal.className = 'modal';


  const closeButton = document.createElement('span');
  closeButton.className = 'close-button';
  closeButton.innerHTML = '&times;';


  modal.appendChild(closeButton);


  const characterImagesContainer = document.createElement('div');
  characterImagesContainer.className = 'character-images-container';


  characters.forEach(character => {
    const characterImage = document.createElement('img');
    characterImage.src = getCharacterImageUrl(game, character);
    characterImage.alt = character;
    characterImagesContainer.appendChild(characterImage);
  });


  modal.appendChild(characterImagesContainer);
  document.body.appendChild(modal);


  closeButton.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}


function getCharacterImageUrl(game, character) {
  const characterImages = {
    'Red Dead Redemption 2': {
      'Arthur Morgan': 'arthur-morgan.jpg',
      'John Marston': 'john-marston.jpg',
    },
    'The Last of Us': {
      'Joel': 'joel-miller.jpg',
      'Ellie': 'ellie-image.jpg',
    },
    'World of Warcraft': {
      'Arthas Menethil': 'arthus-image.jpg',
      'Sylvanus Windrunner': 'sylvanus-image.jpg',
    },
    "Assassin's Creed Valhalla": {
      'Eivor': 'eivor.jpg',
      'Sigurd': 'sigurd.jpg',
    },
    'God of War': {
      'Kratos': 'kratos.jpg',
      'Atreus': 'atreus.jpg',
    },
    'The Witcher 3: Wild Hunt': {
      'Geralt of Rivia': 'geralt-rivia.jpg',
      'Ciri': 'ciri.jpg',
    },
  };


  const imageUrl = characterImages[game]?.[character];


  if (!imageUrl) {
    console.error(`Image not found for ${character} in ${game}`);
    return 'default.jpg';
  }


  return imageUrl;
}



function toggleForm() {
  const form = document.getElementById('addItemForm');
  form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function addItem() {
  const title = document.getElementById('title').value;
  const genre = document.getElementById('genre').value;
  const releaseYear = document.getElementById('releaseYear').value;
  const platform = document.getElementById('platform').value;
  const characters = document.getElementById('characters').value.split(',').map(char => char.trim());
  const imageUrl = document.getElementById('imageUrl').value;

  try {
    const response = await fetch('/api/add-item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        genre,
        releaseYear,
        platform,
        characters,
        imageUrl,
      }),
    });

    const result = await response.text();

    displayMessage(result);
    fetchData();
    clearForm();
  } catch (error) {
    console.error('Error adding item:', error);
  }
}

async function editItem(id) {
  const newData = prompt('Enter new data:');
  if (newData !== null) {
    try {
      const response = await fetch(`/api/edit-item/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newData }),
      });

      const result = await response.text();
      displayMessage(result);
      fetchData(); // Refresh the data after editing
    } catch (error) {
      console.error('Error editing item:', error);
      displayMessage('Error editing item');
    }
  }
}

async function deleteItem(id) {
  const isSure = confirm('Are you sure you want to delete this item?');
  if (isSure) {
    try {
      const response = await fetch(`/api/delete-item/${id}`, {
        method: 'DELETE',
      });

      const result = await response.text();
      displayMessage(result);
      fetchData(); // Refresh the data after deleting
    } catch (error) {
      console.error('Error deleting item:', error);
      displayMessage('Error deleting item');
    }
  }
}



function displayMessage(message) {
  const messageDiv = document.getElementById('message');
  if (messageDiv) {
    messageDiv.textContent = message;
    setTimeout(() => {
      messageDiv.textContent = '';
    }, 3000);
  } else {
    console.error('Message div not found.');
  }
}

function clearForm() {
  document.getElementById('title').value = '';
  document.getElementById('genre').value = '';
  document.getElementById('releaseYear').value = '';
  document.getElementById('platform').value = '';
  document.getElementById('characters').value = '';
  document.getElementById('imageUrl').value = '';
}
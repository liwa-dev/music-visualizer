// main.js

let playlist = []; // Array to store the playlist
let currentSongIndex = 0; // Index of the current song being played
let audio;
let storeSongAdded = {};
let isPlaying = false;
let toggleSong = true;
let storedProgress = 0; // Variable to store the progress of the song
let audioLoop = false;
let isSearching = false;

const progressBarInner = document.querySelector('.progress-bar-inner');
const progressBar = document.querySelector('.progress-bar');
const panel = document.querySelector('.panel');
const buttonFetch = document.getElementById('add-button');
const seekCircle = document.createElement('div');
seekCircle.classList.add('seek-circle');
progressBar.appendChild(seekCircle);

function updateProgressBar() {
  if (audio && audio.duration > 0) {
    const currentTime = audio.currentTime;
    const progress = (currentTime / audio.duration) * 100;
    progressBarInner.style.width = `${progress}%`;
    seekCircle.style.left = `${progress}%`;
  }
}

async function fetchLogoAndDisplay() {
  try {
    console.log('fetching...')
    openNotification('Fetching... Please wait', 5000);
    const iconSearch = document.getElementById('search');
    const cards = document.querySelectorAll('.card');
    iconSearch.removeEventListener('click', Search)
    // buttonFetch.textContent = 'Fetching...';
    const response = await fetch(`https://youtube-1.fishyflick.repl.co/download?video_url=${storeSongAdded.url}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status !== 429) {
      const data = await response.json();
      if (data.error) {
        iconSearch.addEventListener('click', Search);
        openNotification(data.error, 5000);
      } else {
        const song = {
          logo: data.img,
          directLink: data.direct_link,
        };
        isSearching = false;
        animationPanel();
        cards.forEach((e) => {
          e.addEventListener('click', cardClickHandler)
        })

        // console.log('Adding song to playlist:', storeSongAdded.title);
        openNotification('Adding song to playlist:' + storeSongAdded.title, 5000);
        playlist.push(song);
        iconSearch.addEventListener('click', Search);

        if (!isPlaying) {
          playNextSong();
        }
      }
    } else {
      console.log("Too many requests");
    }
  } catch (e) {
    console.log("Error fetching song", e);
  }
}

let audioDuration = 0; // Variable to store the duration of the audio
let hasStartedPlaying = false; // Flag to track if the audio has started playing
const logoContainer = document.querySelector('.music-player');
const logoImage = document.getElementById('logo-image');

function checkEnd() {
  if (audio && audio.duration > 0) {
    const currentTime = audio.currentTime;
    const duration = audio.duration;

    console.log('Song duration:', currentTime, '/', duration);

    if (Math.floor(currentTime) >= Math.floor(duration)) {
      console.log("SONG ENDED");
      if (audioLoop) {
        audio.currentTime = 0;
        audio.play();
      } else {
        logoContainer.classList.remove('showLogo');
        logoImage.classList.add("stop-rotate");
        stopPlayback();
        playlist.shift();
        // currentSongIndex = (currentSongIndex + 1) % playlist.length;
        playNextSong();
      }
    }
    if (Math.floor(currentTime) >= Math.floor(duration - 10)) {
      document.querySelector('.window').style.transition = "transform 1s ease, height 1s ease";
      document.querySelector('.window').style.height = '160px';
    } else {
      document.querySelector('.window').style.transition = "transform 1s ease, height 1s ease";
      document.querySelector('.window').style.height = '533px';
    }
  }
}

let storeInterval;

function playNextSong() {
  if (playlist.length === 0) {
    // If the playlist is empty, stop playback
    openNotification('Playlist is empty. Stopping playback.', 5000);
    console.log('Playlist is empty. Stopping playback.');
    isPlaying = false;
    logoContainer.classList.remove('showLogo');
    currentSongIndex = 0;
    audio.currentTime = 0;
    let playIcon = document.getElementById('play-icon');
    playIcon.classList = '';
    playIcon.classList.add('fa-solid', 'fa-play');
    removeEvents();
    progressBar.removeEventListener('click', seekTo);
    return;
  } else {
    addEvents();
    clearInterval(storeInterval); // Clear the interval before playing the next song

    // Get the next song from the playlist
    const song = playlist[currentSongIndex];
    // Load the next song using new Audio
    audio = new Audio(song.directLink)
    let playIcon = document.getElementById('play-icon');
    playIcon.classList = '';
    playIcon.classList.add('fa-solid', 'fa-pause');
    audio.currentTime = 0;
    audio.crossOrigin = "anonymous";
    startVisualizer(audio);
    // audio.src = song.directLink;
    audio.addEventListener('loadedmetadata', () => {
      if (storedProgress >= audio.duration) {
        // If stored progress is greater than or equal to the song duration,
        // reset stored progress to 0 and start playback from the beginning
        storedProgress = 0;
      }

      isPlaying = true;
      storeInterval = setInterval(checkEnd, 1000); // Check if song has ended
      setInterval(updateProgressBar, 200); // Update progress every second
      audio.play(); // Start playback
      logoImage.classList.add('rotate');
      logoImage.src = song.logo;
      logoContainer.classList.add('showLogo');
      logoImage.classList.remove('stop-rotate');
      // Reset the stored progress after starting playback
      storedProgress = 0;
      setTimeout(() => {
        document.querySelector('.window').style.transition = "transform 1s ease, height 1s ease";
        document.querySelector('.window').style.height = '533px';
      }, 1500);

    });

    // Remove the finished song from the playlist
  }
}


function removeEvents() {
  const play_button = document.getElementById('play-button');
  const skip_button = document.getElementById('skip-button');
  const loop_button = document.getElementById('loop-button');
  play_button.removeEventListener('click', togglePlayback);
  skip_button.removeEventListener('click', skipSong);
  loop_button.removeEventListener('click', toggleLoop);
}

function addEvents() {
  const play_button = document.getElementById('play-button');
  const skip_button = document.getElementById('skip-button');
  const loop_button = document.getElementById('loop-button');
  play_button.addEventListener('click', togglePlayback);
  skip_button.addEventListener('click', skipSong);
  loop_button.addEventListener('click', toggleLoop);
}


let lastKnownCurrentTime = 0;

function stopPlayback() {
  console.log('Stopping playback');
  if (audio) {
    logoImage.classList.add("stop-rotate");
    logoContainer.classList.remove('showLogo');
    clearInterval(storeInterval);
    audio.pause();
    isPlaying = false;
  }
}

let handlerSearch = false;

window.addEventListener('DOMContentLoaded', function () {
  const playerButton = document.getElementById('play-button');
  const skipButton = document.getElementById('skip-button');
  const loopCheckbox = document.getElementById('loop-button');
  const iconSearch = document.getElementById('search');

  iconSearch.addEventListener('click', Search)


  playerButton.addEventListener('click', togglePlayback);


  skipButton.addEventListener('click', skipSong);

  loopCheckbox.addEventListener('click', toggleLoop);

  // addButton.addEventListener('click', function () {

  //   console.log('Song added to queue');
  // });

  progressBar.addEventListener('click', seekTo);


  var effectButton1 = document.getElementById("effect-button1");
  effectButton1.addEventListener("click", function () {
    isSearching = true;
    animationPanel();
  })
  var effectButton2 = document.getElementById("effect-button2");
  effectButton2.addEventListener("click", function () {
    isSearching = false;
    animationPanel();
  })


});

let storeList = []

function Search() {
  const addButton = document.getElementById('add-button');
  const input_search = document.querySelector('.input-search');
  const card_container = document.querySelector('.scroll-container');
  const content2 = document.querySelector('.card-row');
  const window2 = document.querySelector('.window2');
  const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/;
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,}(\S*)?$/;
  const urlInput = document.getElementById('url-input');
  const playIcon = document.getElementById('play-icon');
  let isInputFocused = false;

  if (!youtubeUrlPattern.test(urlInput.value)) {
    if (!urlPattern.test(urlInput.value)) {
      if (!handlerSearch) {
        handlerSearch = true;

        fetchSearch(urlInput)
          .then(result => {
            if (result) {
              var cards = document.querySelectorAll(".card");
              if (cards) {
                cards.forEach((e) => {
                  e.remove();
                });
              }
              handlerSearch = false;
              input_search.style.top = '10%';
              result.search.map(item => {
                const image_container = document.createElement('div');
                image_container.classList.add('card');
                const img = document.createElement('img');
                const text = document.createElement('h3');
                text.textContent = item.title;
                img.src = item.thumbnail;
                image_container.appendChild(text);


                image_container.dataset.item = JSON.stringify(item); // Store item data as a data attribute
                image_container.addEventListener('click', cardClickHandler); // Use the same event listener for all cards

                image_container.appendChild(img);
                content2.style.opacity = "1";
                content2.appendChild(image_container);

              });

              content2.style.overflowX = 'scroll !important';
            }
          })
          .catch(error => {
            console.log(error);
          });
      }
    }
  } else {
    storeSongAdded = { 'url': urlInput.value, 'title': 'invalide' };
    fetchLogoAndDisplay();
  }
}

function cardClickHandler(event) {
  var cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    card.removeEventListener('click', cardClickHandler);
  });

  const item = JSON.parse(event.currentTarget.dataset.item); // Retrieve the item data from the data attribute
  console.log('Song added to queue', item.title);
  storeSongAdded = { 'url': item.url, 'title': item.title };
  fetchLogoAndDisplay();
}



function animationPanel() {
  var effectButton1 = document.getElementById("effect-button1");
  var effectButton2 = document.getElementById("effect-button2");
  var windowElement = document.querySelector(".window");
  var visualizer = document.getElementById('visualizer');
  var bg = document.querySelector('.bg');
  var windowElement2 = document.querySelector(".window2");
  if (isSearching) {
    // Apply the parallel effect
    effectButton1.style.top = '170%'
    effectButton2.style.top = '10%'
    windowElement.style.transition = "transform 1s ease, height 1s ease";
    visualizer.style.transition = "transform 1s ease";
    bg.style.transition = "transform 1s ease";
    windowElement.style.transform = "translate(-50%, 800%)";
    visualizer.style.transform = "translate(0%, 200%)";
    bg.style.transform = "translate(0%, 200%)";

    windowElement2.style.transition = "top 1s ease";
    windowElement2.style.top = "50%";
  } else {
    effectButton2.style.top = '-170%'
    effectButton1.style.top = '5%'
    // Remove the parallel effect
    windowElement.style.transition = "transform 1s ease, height 1s ease";
    visualizer.style.transition = "transform 1s ease";
    bg.style.transition = "transform 1s ease";
    visualizer.style.transform = "translate(0%, 0%)";
    bg.style.transform = "translate(0%, 0%)";
    windowElement.style.transform = "translate(-50%, -50%)";

    windowElement2.style.transition = "top 1s ease";
    windowElement2.style.top = "-50%";
  }
}

async function fetchSearch(parameter) {
  try {
    const response = await fetch(`https://youtube-1.fishyflick.repl.co/search?q=${parameter.value}`);
    const data = await response.json();
    // Add your condition here
    if (!data.error) {
      return data;
    }
  } catch (error) {
    console.error(error);
  }
  return false; // Return false if there is an error or the condition is not met
}


function seekTo() {
  if (audio) {
    const progressBarWidth = progressBar.offsetWidth;
    const clickX = event.offsetX;
    const seekPercentage = (clickX / progressBarWidth) * 100;
    const seekTime = (seekPercentage / 100) * audio.duration;
    audio.currentTime = seekTime;
  }
}

async function addSongToQueue() {
  const urlInput = document.getElementById('url-input');
  const url = urlInput.value.trim();
  console.log('Successfully added song!');
  if (url) {
    await fetchLogoAndDisplay();
  }
}

function togglePlayback() {
  const playIcon = document.getElementById('play-icon');
  toggleSong = !toggleSong;
  if (toggleSong) {
    if (audio) {
      playIcon.classList = '';
      playIcon.classList.add('fa-solid', 'fa-pause');
      openNotification('Resuming playback', 2000);
      console.log('Resuming playback');
      audio.play();
      logoImage.classList.remove('stop-rotate');
    }
  } else {
    if (audio) {
      playIcon.classList = '';
      playIcon.classList.add('fa-solid', 'fa-play');
      openNotification('Pausing playback', 2000);
      console.log('Pausing playback');
      logoImage.classList.add('stop-rotate');
      audio.pause();
      storedProgress = audio.currentTime; // Store the current progress of the song
    }
  }
}

function skipSong() {
  if (playlist.length === 0) {
    return;
  }
  if (audioLoop) {
    toggleLoop();
  }
  // currentSongIndex = (currentSongIndex + 1) % playlist.length;
  console.log(playlist);
  playlist.shift();
  toggleSong = true;
  console.log('Skipping song');
  document.querySelector('.window').style.transition = "transform 1s ease, height 1s ease";
  document.querySelector('.window').style.height = '160px';
  stopPlayback();
  playNextSong();
}

function toggleLoop() {
  if (playlist.length === 0) {
    return;
  }
  audioLoop = !audioLoop;
  const loopBtn = document.querySelector('.loop-button');
  if (audioLoop) {
    audio.loop = true;
    loopBtn.classList.add('checked');
  } else {
    audio.loop = false;
    loopBtn.classList.remove('checked');
  }
  console.log('Looping:', audioLoop);
}



// Get the checkbox and visualizer elements
const checkbox = document.getElementById("checkbox");
const visualizer = document.getElementById("visualizer");

// Add event listener to the checkbox
checkbox.addEventListener("change", function () {
  // Toggle the visibility of the visualizer based on the checkbox state
  if (checkbox.checked) {
    visualizer.style.display = "block";
  } else {
    visualizer.style.display = "none";
  }
});
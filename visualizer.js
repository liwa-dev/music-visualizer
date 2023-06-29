// visualizer.js

let beats = [];
let beatThreshold = 5; // Adjust this threshold to detect beats
let particles = [];
let backgroundParticles = [];




function startVisualizer(sound) {
  const button_play = document.getElementById('play-button');
  const button_skip = document.getElementById('skip-button');
  const progress_bar = document.querySelector('.progress-bar');
  const effect_button = document.querySelectorAll('.effect-button');
  progress_bar.addEventListener('click', () => {
    beats = [];
    particles = [];
    backgroundParticles = [];
  });
  effect_button.forEach((button) => {
    button.addEventListener('click', () => {
      beats = [];
      particles = [];
      backgroundParticles = [];
    })
  })
  button_play.addEventListener('click', () => {
    beats = [];
    particles = [];
    backgroundParticles = [];
  })
  button_skip.addEventListener('click', () => {
    beats = [];
    particles = [];
    backgroundParticles = [];
  })
  // button_loop.addEventListener('click', () => {
  //   beats = [];
  //   particles = [];
  //   backgroundParticles = [];
  // })
  setInterval(() => {
    if (Math.floor(sound.currentTime) === Math.floor(0) && !isPlaying) {
      beats = [];
      particles = []
      backgroundParticles = []
      console.log('####### RESET BEATS | PARTICLES | BACKGROUND PARTICLES #######')
    }
  }, 1000);
  const canvas = document.getElementById("visualizer");
  const context = canvas.getContext("2d");



  class BackgroundParticle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.color = "#FFFFFF"; // Adjust the color of the background particles
      this.size = Math.random() * 2 + 1;
      this.velocityX = Math.random() * 2 - 1;
      this.velocityY = Math.random() * 2 - 1;
      this.lifespan = Math.random() * 200 + 100; // Adjust lifespan range
    }

    update() {
      const speed = 2; // Adjust the speed at which the particles move forward

      this.x += this.velocityX * speed;
      this.y += this.velocityY * speed;

      // Wrap the particles around the canvas edges
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }

      this.lifespan--;
    }

    draw(context) {
      context.beginPath();
      context.fillStyle = this.color;
      context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      context.fill();
    }
  }

  const distributeBackgroundParticles = () => {
    const numParticles = 10; // Adjust the number of background particles
    const sideMargin = 100; // Adjust the margin from the sides
    const topMargin = 100; // Adjust the margin from the top and bottom

    // Clear existing background particles
    backgroundParticles = [];

    for (let i = 0; i < numParticles; i++) {
      const x = Math.random() * sideMargin;
      const y = Math.random() * (canvas.height - topMargin * 2) + topMargin;
      const color = "#FFFFFF"; // Adjust the color of the background particles
      backgroundParticles.push(new BackgroundParticle(x, y, color));
    }
  };
  distributeBackgroundParticles();


  // Set canvas dimensions
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Create an AudioContext
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // Create an analyser node
  const analyser = audioContext.createAnalyser();
  if (sound) {
    const source = audioContext.createMediaElementSource(sound);
    source.connect(analyser);
    analyser.connect(audioContext.destination);

    // Set the buffer size (optional)
    analyser.fftSize = 512;

    // Get frequency data and visualize it
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Move the beats loop here
    let beats = [];
    let beatThreshold = 5; // Adjust this threshold to detect beats

    function detectBeats() {
      analyser.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += (dataArray[i] - 128) * (dataArray[i] - 128);
      }
      let rms = Math.sqrt(sum / bufferLength);
      if (rms > beatThreshold) {
        beats.push({ time: sound.currentTime, rms });

        // Create background particles on beat
        const numParticles = Math.floor(Math.random() * 5) + 5; // Adjust the number of particles per beat
        const color = "#FFFFFF"; // Adjust the color of the background particles

        for (let i = 0; i < numParticles; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          backgroundParticles.push(new BackgroundParticle(x, y, color));
        }
      }
    }

    // Call the detectBeats function periodically
    setInterval(detectBeats, 100);

    function fillRoundedRect(context, x, y, width, height, radius, color) {
      context.beginPath();
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.quadraticCurveTo(x + width, y, x + width, y + radius);
      context.lineTo(x + width, y + height);
      context.lineTo(x, y + height);
      context.lineTo(x, y + radius);
      context.quadraticCurveTo(x, y, x + radius, y);
      context.closePath();
      context.fillStyle = color;
      context.fill();
    }

    // Add event listeners for window focus/blur events
    window.addEventListener("focus", resumeAnimation);
    window.addEventListener("blur", pauseAnimation);
    let animationFrameId;

    // Boolean flag to track animation state
    let isAnimating = false;

    // Function to pause the animation loop
    function pauseAnimation() {
      isAnimating = false;
      backgroundParticles = []
      particles = []
      beats = [];
    }

    // Function to resume the animation loop
    function resumeAnimation() {
      isAnimating = true;
      requestAnimationFrame(drawVisualizer);
    }
    resumeAnimation();

    function drawVisualizer() {
      // Check if animation is paused
      if (!isAnimating) {
        return;
      }
      animationFrameId = requestAnimationFrame(drawVisualizer);
      analyser.getByteFrequencyData(dataArray);

      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the particle
      particles.forEach((particle, index) => {
        if (particle.lifespan <= 0) {
          particles.splice(index, 1); // Remove expired particles
        } else {
          particle.update();
          particle.draw(context);
        }
      });
      // Move the following code inside the drawVisualizer() function, before drawing the background particles
      backgroundParticles = backgroundParticles.filter((particle) => particle.lifespan > 0);

      // Draw the background particles
      backgroundParticles.forEach((particle) => {
        particle.update();
        particle.draw(context);
      });



      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;
      const borderRadius = 5; // Adjust this value for desired roundedness

      // Calculate the maximum amplitude from dataArray
      const maxAmplitude = Math.max(...dataArray);

      // Iterate over the bars to determine their brightness based on amplitude
      const activeBars = new Map(); // Track the active bars and their corresponding brightness

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;

        // Determine the brightness based on amplitude
        const amplitude = dataArray[i] / maxAmplitude; // Normalize the amplitude between 0 and 1

        // Set the brightness based on amplitude threshold
        let brightness;
        if (amplitude > 0.8) {
          brightness = 1; // 100% brightness for high amplitude
        } else {
          brightness = amplitude; // Lower brightness for lower amplitudes
        }

        // Create particle if amplitude exceeds threshold
        if (amplitude > 0.8 && Math.random() < 0.1) {
          const particleX = x + barWidth / 2;
          const particleY = canvas.height - barHeight;
          const particleColor = `hsl(${i}, 100%, ${brightness * 70}%)`;
          particles.push(new Particle(particleX, particleY, particleColor));
        }

        // Add the bar to the activeBars map
        activeBars.set(i, brightness);
        const barColor = `hsl(${i}, 100%, ${brightness * 70}%)`;
        fillRoundedRect(context, x, canvas.height - barHeight, barWidth, barHeight, borderRadius, barColor);

        x += barWidth + 1;
      }

      // Remove inactive bars from the activeBars map
      const inactiveBars = [];
      for (const [barIndex] of activeBars) {
        if (!dataArray.includes(barIndex)) {
          inactiveBars.push(barIndex);
        }
      }
      inactiveBars.forEach((barIndex) => activeBars.delete(barIndex));

      // Log the activeBars map
    }

    // Start drawing the visualizer
    drawVisualizer();
  }
}



class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = Math.random() * 3 + 1;
    this.velocityX = Math.random() * 2 - 1;
    this.velocityY = Math.random() * 2 - 1;
    this.lifespan = 100; // Adjust this value for particle lifespan
  }

  update() {
    this.x += this.velocityX;
    this.y += this.velocityY;
    this.lifespan--;
  }

  draw(context) {
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.fill();
  }
}
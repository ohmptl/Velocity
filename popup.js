function setVideoSpeed(speed) {
  const videos = document.querySelectorAll('video');
  videos.forEach(video => {
      video.playbackRate = speed;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const speedInput = document.getElementById('speedInput');
  const applyButton = document.getElementById('applyButton');

  chrome.storage.sync.get('videoSpeed', function(data) {
      if (data.videoSpeed) {
          speedInput.value = data.videoSpeed;
      }
  });

  applyButton.addEventListener('click', function() {
      const speed = parseFloat(speedInput.value);
      if (!isNaN(speed) && speed > 0) {
          chrome.storage.sync.set({ videoSpeed: speed }, function() {
              chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                  chrome.scripting.executeScript({
                      target: { tabId: tabs[0].id, allFrames: true },
                      function: setVideoSpeed,
                      args: [speed]
                  });
              });
          });
      }
  });
});

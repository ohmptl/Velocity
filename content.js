function setVideoSpeed(video, speed) {
  if (video) {
      video.playbackRate = speed;
      console.log(`Set playback speed to ${speed} for`, video);
  }
}

// Function to find videos inside iframes (including deeply nested ones)
function traverseIframes(frame, speed) {
  try {
      const videos = frame.contentDocument?.querySelectorAll("video") || [];
      videos.forEach(video => setVideoSpeed(video, speed));

      // Observe new elements appearing in the iframe
      const observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
              mutation.addedNodes.forEach(node => {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                      if (node.tagName === "VIDEO") {
                          setVideoSpeed(node, speed);
                      } else {
                          node.querySelectorAll("video").forEach(video => setVideoSpeed(video, speed));
                      }
                  }
              });
          });
      });

      observer.observe(frame.contentDocument.body, { childList: true, subtree: true });

      // Check for nested iframes
      frame.contentDocument.querySelectorAll("iframe").forEach(innerFrame => {
          if (innerFrame.src.includes("playposit")) {
              setTimeout(() => traverseIframes(innerFrame, speed), 500);
          }
      });

  } catch (error) {
      console.warn("Unable to access iframe content due to cross-origin restrictions.", error);
  }
}

function applySpeedToAllVideos(speed) {
  document.querySelectorAll("video").forEach(video => setVideoSpeed(video, speed));

  // Check for iframes and apply speed
  document.querySelectorAll("iframe").forEach(iframe => {
      if (iframe.src.includes("playposit") || iframe.src.includes("moodle")) {
          setTimeout(() => traverseIframes(iframe, speed), 500);
      }
  });
}

// Retrieve and apply stored speed setting
chrome.storage.sync.get("videoSpeed", data => {
  if (data.videoSpeed) {
      applySpeedToAllVideos(data.videoSpeed);
  }
});

// Listen for changes in storage and apply new speed in real-time
chrome.storage.onChanged.addListener(changes => {
  if (changes.videoSpeed) {
      applySpeedToAllVideos(changes.videoSpeed.newValue);
  }
});

// Toggle favicon next to "About Me" when profile photo is clicked
document.addEventListener('DOMContentLoaded', function() {
  // Try to find profile photo by ID first, then by class
  const profilePhoto = document.getElementById('profile-photo') || document.querySelector('a.image.avatar');
  const favicon = document.querySelector('link[media="(prefers-color-scheme:light)"]')?.href || './assets/img/favicon.png';
  const faviconDark = document.querySelector('link[media="(prefers-color-scheme:dark)"]')?.href || './assets/img/favicon-dark.png';
  let faviconImg = null;
  let themeChangeListener = null;
  let isDragging = false;
  let mouseMoveListener = null;
  let lastPosition = null; // Store last placed position

  if (profilePhoto) {
    profilePhoto.style.cursor = 'pointer';

    profilePhoto.addEventListener('click', function(e) {
      e.preventDefault();

      // Find the About Me heading
      const aboutMeHeading = document.querySelector('h2#about-me');

      if (aboutMeHeading) {
        // Toggle: if favicon exists, remove it immediately
        if (faviconImg && faviconImg.parentElement) {
          // Save position if it was placed
          if (faviconImg.classList.contains('placed')) {
            lastPosition = {
              left: faviconImg.style.left,
              top: faviconImg.style.top
            };
          }

          faviconImg.remove();
          faviconImg = null;

          // Remove theme change listener
          if (themeChangeListener && window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', themeChangeListener);
            themeChangeListener = null;
          }

          // Remove mouse move listener if dragging
          if (mouseMoveListener) {
            document.removeEventListener('mousemove', mouseMoveListener);
            mouseMoveListener = null;
            isDragging = false;
          }
        } else {
          // Create favicon image element
          faviconImg = document.createElement('img');
          faviconImg.className = 'about-me-favicon';
          faviconImg.alt = 'favicon';

          // Use appropriate favicon based on color scheme
          if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            faviconImg.src = faviconDark;
          } else {
            faviconImg.src = favicon;
          }

          // Insert favicon after the heading text
          aboutMeHeading.appendChild(faviconImg);

          // If there was a last position, restore it
          if (lastPosition) {
            faviconImg.classList.add('placed');
            faviconImg.style.left = lastPosition.left;
            faviconImg.style.top = lastPosition.top;
          }

          // PC: Click to follow cursor, click again to place
          faviconImg.addEventListener('click', function(e) {
            e.stopPropagation();

            if (!isDragging) {
              // Get current position before changing to fixed
              const rect = faviconImg.getBoundingClientRect();

              // Start following cursor
              isDragging = true;
              faviconImg.classList.add('dragging');

              // Set initial position to current position
              faviconImg.style.left = rect.left + 'px';
              faviconImg.style.top = rect.top + 'px';

              mouseMoveListener = function(e) {
                if (faviconImg && isDragging) {
                  faviconImg.style.left = (e.clientX - 24) + 'px';
                  faviconImg.style.top = (e.clientY - 24) + 'px';
                }
              };

              document.addEventListener('mousemove', mouseMoveListener);

              // Click anywhere to place
              const clickToPlaceListener = function(e) {
                if (isDragging && e.target !== faviconImg) {
                  isDragging = false;
                  faviconImg.classList.remove('dragging');
                  faviconImg.classList.add('placed');

                  if (mouseMoveListener) {
                    document.removeEventListener('mousemove', mouseMoveListener);
                    mouseMoveListener = null;
                  }

                  document.removeEventListener('click', clickToPlaceListener);
                }
              };

              setTimeout(function() {
                document.addEventListener('click', clickToPlaceListener);
              }, 100);
            }
          });

          // Mobile: Touch and drag
          faviconImg.addEventListener('touchstart', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Get position BEFORE adding dragging class
            const touch = e.touches[0];
            const rect = faviconImg.getBoundingClientRect();
            const offsetX = touch.clientX - rect.left;
            const offsetY = touch.clientY - rect.top;

            // Set position before changing class (prevents jump)
            faviconImg.style.left = rect.left + 'px';
            faviconImg.style.top = rect.top + 'px';

            isDragging = true;
            faviconImg.classList.add('dragging');

            const handleTouchMove = function(e) {
              if (faviconImg && isDragging && e.touches[0]) {
                faviconImg.style.left = (e.touches[0].clientX - offsetX) + 'px';
                faviconImg.style.top = (e.touches[0].clientY - offsetY) + 'px';
              }
            };

            const handleTouchEnd = function(e) {
              isDragging = false;
              faviconImg.classList.remove('dragging');
              faviconImg.classList.add('placed');

              document.removeEventListener('touchmove', handleTouchMove);
              document.removeEventListener('touchend', handleTouchEnd);
            };

            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            document.addEventListener('touchend', handleTouchEnd);
          }, { passive: false });

          // Listen for theme changes and update favicon
          if (window.matchMedia) {
            themeChangeListener = function(e) {
              if (faviconImg) {
                faviconImg.src = e.matches ? faviconDark : favicon;
              }
            };
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', themeChangeListener);
          }
        }
      }
    });
  }
});

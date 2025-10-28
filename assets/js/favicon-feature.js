// Toggle favicon next to "About Me" when profile photo is clicked
document.addEventListener('DOMContentLoaded', function() {
  const profilePhoto = document.getElementById('profile-photo');
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

          // Add mousedown event to favicon for drag and drop
          faviconImg.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Start dragging
            isDragging = true;
            faviconImg.classList.add('dragging');

            const offsetX = e.clientX - (faviconImg.getBoundingClientRect().left + 24);
            const offsetY = e.clientY - (faviconImg.getBoundingClientRect().top + 24);

            mouseMoveListener = function(e) {
              if (faviconImg && isDragging) {
                faviconImg.style.left = (e.clientX - offsetX) + 'px';
                faviconImg.style.top = (e.clientY - offsetY) + 'px';
              }
            };

            const mouseUpListener = function(e) {
              // Stop dragging and keep favicon at current position
              isDragging = false;
              faviconImg.classList.remove('dragging');
              faviconImg.classList.add('placed');

              if (mouseMoveListener) {
                document.removeEventListener('mousemove', mouseMoveListener);
                mouseMoveListener = null;
              }

              document.removeEventListener('mouseup', mouseUpListener);
            };

            document.addEventListener('mousemove', mouseMoveListener);
            document.addEventListener('mouseup', mouseUpListener);
          });

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

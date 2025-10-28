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

          // Drag and drop handler for both mouse and touch events
          const handleDragStart = function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Get client coordinates from mouse or touch event
            const clientX = e.clientX || (e.touches && e.touches[0].clientX);
            const clientY = e.clientY || (e.touches && e.touches[0].clientY);

            // Get position before changing to fixed
            const rect = faviconImg.getBoundingClientRect();
            const offsetX = clientX - rect.left;
            const offsetY = clientY - rect.top;

            // Start dragging
            isDragging = true;
            faviconImg.classList.add('dragging');

            // Set initial position in fixed coordinates
            faviconImg.style.left = rect.left + 'px';
            faviconImg.style.top = rect.top + 'px';

            const handleMove = function(e) {
              if (faviconImg && isDragging) {
                const moveX = e.clientX || (e.touches && e.touches[0].clientX);
                const moveY = e.clientY || (e.touches && e.touches[0].clientY);
                faviconImg.style.left = (moveX - offsetX) + 'px';
                faviconImg.style.top = (moveY - offsetY) + 'px';
              }
            };

            const handleEnd = function(e) {
              // Stop dragging and keep favicon at current position
              isDragging = false;
              faviconImg.classList.remove('dragging');
              faviconImg.classList.add('placed');

              document.removeEventListener('mousemove', handleMove);
              document.removeEventListener('mouseup', handleEnd);
              document.removeEventListener('touchmove', handleMove);
              document.removeEventListener('touchend', handleEnd);
            };

            document.addEventListener('mousemove', handleMove);
            document.addEventListener('mouseup', handleEnd);
            document.addEventListener('touchmove', handleMove, { passive: false });
            document.addEventListener('touchend', handleEnd);
          };

          // Add both mouse and touch event listeners
          faviconImg.addEventListener('mousedown', handleDragStart);
          faviconImg.addEventListener('touchstart', handleDragStart, { passive: false });

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

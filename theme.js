var pageThemeStorageKey = 'yamliMobileTheme';
var currentPageTheme = 'dark';

function applyPageTheme(theme) {
  currentPageTheme = theme;
  document.documentElement.dataset.theme = theme;

  var themeIcon = document.getElementById('themeIcon');
  var themeToggle = document.getElementById('themeToggle');
  var themeColorMeta = document.querySelector('meta[name="theme-color"]');
  var nextThemeLabel = theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode';

  if (themeIcon) themeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
  if (themeToggle) {
    themeToggle.title = nextThemeLabel;
    themeToggle.setAttribute('aria-label', nextThemeLabel);
  }
  if (themeColorMeta) themeColorMeta.content = theme === 'light' ? '#e8e4dc' : '#181a1c';
}

function toggleTheme() {
  var nextTheme = currentPageTheme === 'light' ? 'dark' : 'light';
  applyPageTheme(nextTheme);

  try {
    localStorage.setItem(pageThemeStorageKey, nextTheme);
  } catch (error) {
    console.warn('Unable to save theme preference:', error);
  }
}

var savedPageTheme = 'dark';
try {
  var storedPageTheme = localStorage.getItem(pageThemeStorageKey);
  if (storedPageTheme === 'light' || storedPageTheme === 'dark') {
    savedPageTheme = storedPageTheme;
  }
} catch (error) {
  console.warn('Unable to load theme preference:', error);
}

applyPageTheme(savedPageTheme);
document.addEventListener('DOMContentLoaded', function() {
  applyPageTheme(currentPageTheme);
}, { once: true });
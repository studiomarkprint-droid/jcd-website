import glob
import re

CORRECT_PLAYER = """      <div class="topbar-right">
        <div class="music-player" aria-label="Music Player">
          <span class="eq" aria-hidden="true"><span></span><span></span><span></span></span>
          <button type="button" class="play-toggle" aria-label="Play" id="playPauseBtn">
            <i class="fa-solid fa-play"></i>
          </button>
          <div class="track">
            <input class="progress" type="range" min="0" max="100" value="0" aria-label="Audio progress" id="volumeSlider">
            <div class="time"><span class="current" id="timeDisplay">0:00</span> / <span class="duration">0:00</span></div>
          </div>
          <audio class="audio" preload="metadata" loop id="bgMusic">
            <source src="Nueva%20carpeta%20con%20elementos%202/JCD-MUSIC.mp3" type="audio/mpeg">
          </audio>
        </div>
      </div>
    </div>
  </header>"""

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    original = html
    
    # Remove the broken `topbar-right` block
    # We find `<div class="topbar-right">` that's right after `</a></div>` (from `.top-actions`)
    # and ends right before `<div class="service-area">` or `<div class="phone">`
    # Let's use a very loose regex:
    html = re.sub(
        r'<div class="topbar-right">\s*<div class="music-player".*?</audio>\s*</div>\s*</div>',
        '',
        html,
        flags=re.DOTALL
    )

    # Force site header replacement
    # Look for `<header class="site-header" ...` up to `</header>`
    header_regex = re.compile(r'(<header class="site-header"[^>]*>\s*<div class="topbar">\s*<div class="brand-left">.*?</span>\s*</div>).*?</header>', re.DOTALL | re.IGNORECASE)
    
    match = header_regex.search(html)
    if match:
        prefix = match.group(1)
        new_header = prefix + "\n" + CORRECT_PLAYER
        html = html[:match.start()] + new_header + html[match.end():]

    if html != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"Fixed {filepath}")

for f in glob.glob('*.html'):
    fix_file(f)
print("Done fixing HTML files.")

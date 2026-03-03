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

def fix_html_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    modified = False

    # 1. Clean up duplicate topbar-right in hero-top
    # Find <div class="topbar-right">...</div> roughly inside the hero
    # Because of nested divs, it's safer to just replace `.topbar-right` if it's right after `cta-top`
    content = re.sub(
        r'<div class="topbar-right">\s*<div class="music-player" aria-label="Music Player">.*?</audio>\s*</div>\s*</div>',
        '',
        content,
        flags=re.DOTALL
    )

    # 2. Rebuild the site header to guarantee it has ONLY the right structure
    # Match from <header class="site-header" ... to </header>
    site_header_pattern = re.compile(
        r'(<header class="site-header"[^>]*>\s*<div class="topbar">\s*<div class="brand-left">.*?</span>\s*</div>)(.*?)(</header>)',
        re.DOTALL | re.IGNORECASE
    )
    
    match = site_header_pattern.search(content)
    if match:
        prefix = match.group(1)
        # We replace group 2 and 3 with the CORRECT_PLAYER
        new_header = prefix + "\n" + CORRECT_PLAYER
        
        # apply it
        content = content[:match.start()] + new_header + content[match.end():]

    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for f in glob.glob('*.html'):
    fix_html_file(f)
print("Done fixing HTML files.")

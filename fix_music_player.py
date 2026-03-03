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
      </div>"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modified = False

    # 1. Remove duplicate topbar-right from hero section
    # Usually immediately before <div class="service-area"> or <div class="brand reveal">
    duplicate_pattern = re.compile(
        r'\s*<div class="topbar-right">\s*<div class="music-player" aria-label="Music Player">.*?</audio>\s*</div>\s*</div>',
        re.DOTALL
    )
    if duplicate_pattern.search(content):
        content = duplicate_pattern.sub('', content)
        modified = True

    # 2. Fix the real topbar-right inside site-header
    # Look for the block inside <header class="site-header">
    # It starts after <div class="brand-left">...</div>
    
    # We will find the site-header block:
    header_pattern = re.compile(
        r'(<header class="site-header"[^>]*>.*?<div class="brand-left">.*?</span>\s*</div>)(.*?)(</header>)',
        re.DOTALL
    )
    
    match = header_pattern.search(content)
    if match:
        prefix = match.group(1)
        middle = match.group(2)
        suffix = match.group(3)
        
        # We need to replace `middle` with CORRECT_PLAYER + "\n    </div>\n  "
        # Wait, the `middle` contains the closing `</div>` for `.topbar`, and sometimes the broken audio tag.
        # Let's be precise.
        
        # We know `.topbar` needs to close after our new `.topbar-right`.
        new_middle = f"\n{CORRECT_PLAYER}\n    </div>\n  "
        
        # But wait, did `middle` have other things? No, only the broken player and the closing `</div>` of `.topbar`.
        # Let's make sure we put back exactly one closing `</div>` for `.topbar`.
        new_header_html = prefix + f"\n{CORRECT_PLAYER}\n    </div>\n  " + suffix
        
        if match.group(0) != new_header_html:
            content = content[:match.start()] + new_header_html + content[match.end():]
            modified = True

    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for f in glob.glob('*.html'):
    process_file(f)
print("Done fixing HTML files.")

import glob

# The exact, tested HTML for the correct music player
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
        lines = f.readlines()

    out_lines = []
    in_hero_top = False
    in_site_header = False
    in_brand_left = False
    skip_lines = 0

    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Track context roughly
        if '<div class="hero-top">' in line:
            in_hero_top = True
        elif '</header>' in line and in_hero_top:
            in_hero_top = False

        if '<header class="site-header"' in line:
            in_site_header = True
        elif '</header>' in line and in_site_header:
            in_site_header = False

        # 1. Skip duplicate player in hero-top
        if in_hero_top and '<div class="topbar-right">' in line:
            # Check if it contains music-player in the next few lines
            is_duplicate = False
            for j in range(i, min(i+15, len(lines))):
                if 'class="music-player"' in lines[j] or 'aria-label="Music Player"' in lines[j]:
                    is_duplicate = True
                    break
            
            if is_duplicate:
                # Skip lines until we close topbar-right 
                # (we know it's a fixed chunk of a few divs, let's just count open/close divs roughly or wait for service-area)
                div_depth = 1
                i += 1
                while i < len(lines) and div_depth > 0:
                    l = lines[i]
                    if '<div' in l: div_depth += l.count('<div')
                    if '</div' in l: div_depth -= l.count('</div')
                    i += 1
                # Check if we consumed too much? No, </div> counts usually work.
                continue

        # 2. Inject real player in site-header
        if in_site_header and '<div class="brand-left">' in line:
            in_brand_left = True
        
        out_lines.append(line)
        
        if in_brand_left and '</div>' in line:
            # We assume this is the end of brand-left, BUT brand-left has an img and a span inside.
            # Usually brand left looks like:
            # <div class="brand-left">
            #   <img ...>
            #   <span ...>...</span>
            # </div>
            # Wait! There's no inner div. So the first </div> after <div class="brand-left"> closes brand-left.
            # Let's verify by just looking for '</div>'
            pass
            
        i += 1

    # To be extremely safe, let's just do a brutal string replace for the duplicate.
    
    html = "".join(lines)
    
    import re
    # Remove from hero-top (everything between top-actions and service-area)
    html = re.sub(
        r'(<div class="top-actions">.*?</div>)\s*<div class="topbar-right">.*?<audio.*?</audio>\s*</div>\s*</div>\s*(<div class="service-area">)',
        r'\1\n\n      \2',
        html,
        flags=re.DOTALL
    )

    # Insert into site-header correctly
    # Replace anything between brand-left closing </div> and </header> with the correct player
    # site-header looks like:
    # <header class="site-header"...>
    #   <div class="topbar">
    #     <div class="brand-left">...</div>
    #     [BAD STUFF]
    #   </div>
    # </header>
    
    html = re.sub(
        r'(<div class="brand-left">.*?</span>\s*</div>).*?(</header>)',
        r'\1\n' + CORRECT_PLAYER + r'\n    </div>\n  \2',
        html,
        flags=re.DOTALL
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"Processed {filepath}")

for f in glob.glob('*.html'):
    process_file(f)


import os
import re

def restore_original_header_visibility(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove style="opacity: 0;" from header
    header_pattern = r'<header class="site-header"([^>]*)>'
    def header_sub(match):
        attrs = match.group(1)
        # Remove opacity: 0; from style attribute
        attrs = re.sub(r'opacity:\s*0;?\s*', '', attrs)
        # If style attribute is now empty (e.g. style=" "), remove it entirely
        attrs = re.sub(r'style="\s*"', '', attrs)
        return f'<header class="site-header"{attrs}>'
    
    content = re.sub(header_pattern, header_sub, content)

    # 2. Make sure .site-header CSS doesn't have opacity: 0
    content = re.sub(r'opacity:\s*0;\s*/\*\s*Hidden initially for preload\s*\*/', '', content)
    
    # 3. Ensure .site-header has original white background
    # (Just in case some pages still have it transparent)
    content = re.sub(r'\.site-header\s*\{([\s\S]*?)background:\s*transparent\s*!important;', r'.site-header {\1background: #ffffff !important;', content)
    
    # 4. Same for header, .site-header, .topbar group
    content = re.sub(r'header,\s*\.site-header,\s*\.topbar\s*\{([\s\S]*?)background:\s*transparent\s*!important;', r'header,\n    .site-header,\n    .topbar {\1background: #ffffff !important;', content)

    # 5. Restore logo filter to original (no filter)
    content = re.sub(r'\.brand-left img\s*\{([\s\S]*?)filter:\s*brightness\(0\)\s*invert\(1\);\s*transition:\s*filter\s*[^;]+;', r'.brand-left img {\1', content)
    content = re.sub(r'\.site-header\.scrolled \.brand-left img\s*\{[\s\S]*?\}', '', content)

    # 6. Restore brand name color to original (dark gray)
    content = re.sub(r'\.brand-left \.name\s*\{([\s\S]*?)color:\s*#ffffff;\s*([\s\S]*?)transition:\s*color\s*[^;]+;', r'.brand-left .name {\1color: #1f2937;\2', content)
    content = re.sub(r'\.site-header\.scrolled \.brand-left \.name\s*\{[\s\S]*?\}', '', content)


    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    directory = '/Users/studiomarkprint/Desktop/JCD-Website'
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                print(f"Restoring header in {file_path}")
                try:
                    restore_original_header_visibility(file_path)
                except Exception as e:
                    print(f"Error in {file_path}: {e}")

if __name__ == "__main__":
    main()

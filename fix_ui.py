import os
import re

files_with_shape_card = [
    'emotions.html',
    'flowers.html',
    'transport.html',
    'animals.html',
    'professions.html',
    'fruits.html',
    'solar.html',
    'vegetables.html'
]

files_with_plain_button = [
    'hindiAlpha.html',
    'teluguAlpha.html'
]

def fix_ui(file, style_template):
    path = f"/Users/mac/apple.fun/{file}"
    if not os.path.exists(path): return
    
    with open(path, 'r') as f:
        content = f.read()
    
    # Extract background image
    bg_match = re.search(r"background-image\s*:\s*url\((.*?)\)", content)
    bg_url = bg_match.group(1) if bg_match else "images/default.jpg"
    bg_url = bg_url.strip("'\"")
    
    # Generate new style
    new_style = style_template.replace("{{BG_URL}}", bg_url)
    
    # Replace style block
    content = re.sub(r"<style>[\s\S]*?</style>", f"<style>\n{new_style}\n  </style>", content)
    
    # Ensure Inter font is included before styles.css
    if "fonts.googleapis.com" not in content:
        content = content.replace(
            '<link rel="stylesheet" href="styles.css">',
            '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">\n  <link rel="stylesheet" href="styles.css">'
        )
    
    with open(path, 'w') as f:
        f.write(content)

shape_card_style = """
    body {
      font-family: 'Inter', sans-serif;
      background-image: url('{{BG_URL}}');
      background-size: cover;
      background-attachment: fixed;
    }

    .button {
      padding: 0;
      font-size: 2.3vh;
      flex-direction: column;
    }

    .shapes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(30vh, 1fr));
      gap: 3vh;
      width: 100%;
      padding: 0 4vh;
    }

    .shape-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
    }

    .shape-card h2 {
      margin: 0 0 15px 0;
      font-size: 4vh;
      font-weight: 800;
      color: #fff;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.6);
      text-transform: capitalize;
    }

    .shape-box {
      width: 25vh;
      height: 25vh;
      margin-bottom: 1vh;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }

    #alphabet {
      grid-template-columns: repeat(auto-fit, minmax(32vh, 1fr));
    }
"""

plain_button_style = """
    body {
      font-family: 'Inter', sans-serif;
      background-image: url('{{BG_URL}}');
      background-size: cover;
      background-attachment: fixed;
    }

    #alphabet {
      grid-template-columns: repeat(auto-fit, minmax(28vh, 1fr));
      gap: 3vh;
      padding: 0 4vh;
    }
    
    .button {
      padding: 3vh;
      font-size: 3.5vh;
      font-weight: 800;
      color: #fff;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.6);
      text-transform: capitalize;
      height: 18vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
"""

for file in files_with_shape_card:
    fix_ui(file, shape_card_style)
    
for file in files_with_plain_button:
    fix_ui(file, plain_button_style)
    
print("UI fixed")

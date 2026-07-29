import os
import re

files_to_fix = [
    'animals.html',
    'emotions.html',
    'flowers.html',
    'fruits.html',
    'hindiAlpha.html',
    'professions.html',
    'solar.html',
    'teluguAlpha.html',
    'transport.html',
    'vegetables.html'
]

for file in files_to_fix:
    path = f"/Users/mac/apple.fun/{file}"
    if not os.path.exists(path):
        continue
    
    with open(path, 'r') as f:
        content = f.read()
    
    # Inject $timeout into controller
    content = re.sub(
        r"app\.controller\('appCtrl',\s*function\(\$scope\)\s*\{",
        "app.controller('appCtrl', function($scope, $timeout) {",
        content
    )
    
    # Inject aud.load() and attachListeners timeout into initiate()
    def replace_initiate(m):
        body = m.group(1)
        if 'aud.load();' not in body:
            body = body.replace('aud = new Audio(data.aud);', 'aud = new Audio(data.aud);\n     aud.load();')
        
        if '$timeout(' not in body:
            # Find the last closing brace and insert before it. 
            # Wait, the regex matches the content inside the braces.
            insertion = "\n     $timeout(function() {\n         if (typeof attachListeners === 'function') attachListeners();\n     }, 500);\n  "
            body = body.rstrip() + insertion
            
        return f"$scope.initiate = function(data){{{body}}}"
        
    content = re.sub(r"\$scope\.initiate\s*=\s*function\(data\)\s*\{([\s\S]*?)\}", replace_initiate, content)
    
    with open(path, 'w') as f:
        f.write(content)
        
print("Audio fixed")

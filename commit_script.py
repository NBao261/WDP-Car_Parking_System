import subprocess
import os

subprocess.run(['git', 'checkout', '-b', 'feature/alpr-integration'])

status = subprocess.check_output(['git', 'status', '--short']).decode('utf-8')

for line in status.split('\n'):
    if not line.strip():
        continue
    
    state = line[:2]
    filename = line[3:].strip()
    
    # Handle renames and quotes
    if '->' in filename:
        filename = filename.split('->')[-1].strip()
    if filename.startswith('"') and filename.endswith('"'):
        filename = filename[1:-1]
        
    subprocess.run(['git', 'add', filename])
    
    action = 'update'
    if 'D' in state:
        action = 'remove'
    elif '?' in state or 'A' in state:
        action = 'add'
        
    msg = f'{action}: {filename}'
    subprocess.run(['git', 'commit', '-m', msg])

subprocess.run(['git', 'push', '-u', 'origin', 'feature/alpr-integration'])

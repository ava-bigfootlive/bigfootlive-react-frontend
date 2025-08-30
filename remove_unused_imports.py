#!/usr/bin/env python3
"""
Script to remove unused imports from TypeScript/React files based on ESLint output
"""

import re
import subprocess
import sys
from pathlib import Path
from collections import defaultdict

def get_eslint_unused():
    """Run ESLint and parse unused variable errors"""
    result = subprocess.run(
        ['npm', 'run', 'lint'],
        capture_output=True,
        text=True,
        cwd='/home/ava-io/repos/bigfootlive-react-frontend'
    )
    
    unused = defaultdict(list)
    for line in result.stdout.split('\n'):
        if 'is defined but never used' in line or 'is assigned a value but never used' in line:
            # Parse: /path/file.tsx:line:col error 'variable' is defined but never used
            match = re.match(r'^(.+?):(\d+):(\d+)\s+error\s+[\'"](.+?)[\'"]\s+is', line)
            if match:
                filepath = match.group(1)
                line_num = int(match.group(2))
                var_name = match.group(4)
                unused[filepath].append((line_num, var_name))
    
    return unused

def remove_unused_from_file(filepath, unused_vars):
    """Remove unused imports from a single file"""
    try:
        with open(filepath, 'r') as f:
            lines = f.readlines()
        
        # Sort by line number in reverse to avoid index issues
        unused_vars.sort(reverse=True)
        
        modified = False
        for line_num, var_name in unused_vars:
            if line_num <= len(lines):
                line_idx = line_num - 1
                line = lines[line_idx]
                
                # Handle different import patterns
                patterns = [
                    # Named import: import { X, Y, Z } from
                    (rf'(\s*)(.*?)(\b{re.escape(var_name)}\b,?\s*)(.*)', r'\1\2\4'),
                    # Single line with only this import
                    (rf'^\s*import\s+.*\b{re.escape(var_name)}\b.*from.*$\n?', ''),
                    # Default import
                    (rf'^\s*import\s+{re.escape(var_name)}\s+from.*$\n?', ''),
                    # const [x, setX] pattern where x is unused
                    (rf'const\s*\[\s*{re.escape(var_name)}\s*,\s*(\w+)\s*\]', r'const [\1]'),
                    # const [x, setX] pattern where setX is unused  
                    (rf'const\s*\[\s*(\w+)\s*,\s*{re.escape(var_name)}\s*\]', r'const [\1]'),
                ]
                
                for pattern, replacement in patterns:
                    new_line = re.sub(pattern, replacement, line)
                    if new_line != line:
                        # Clean up empty imports
                        new_line = re.sub(r'import\s*\{\s*\}\s*from.*\n?', '', new_line)
                        # Clean up trailing commas
                        new_line = re.sub(r',(\s*[}\)])', r'\1', new_line)
                        # Clean up leading commas
                        new_line = re.sub(r'(\{\s*),', r'\1', new_line)
                        
                        lines[line_idx] = new_line
                        modified = True
                        break
        
        if modified:
            # Clean up any empty import statements
            cleaned_lines = []
            for line in lines:
                # Skip completely empty import lines
                if not re.match(r'^\s*import\s*\{\s*\}\s*from', line):
                    cleaned_lines.append(line)
            
            with open(filepath, 'w') as f:
                f.writelines(cleaned_lines)
            
            return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False
    
    return False

def main():
    print("Fetching unused imports from ESLint...")
    unused = get_eslint_unused()
    
    if not unused:
        print("No unused imports found!")
        return
    
    total_files = len(unused)
    total_vars = sum(len(vars) for vars in unused.values())
    
    print(f"Found {total_vars} unused variables in {total_files} files")
    
    fixed_files = 0
    for filepath, vars in unused.items():
        print(f"Processing {filepath} ({len(vars)} unused)...")
        if remove_unused_from_file(filepath, vars):
            fixed_files += 1
    
    print(f"\nFixed {fixed_files} files")
    
    # Run ESLint again to check
    print("\nRunning ESLint to verify...")
    subprocess.run(['npm', 'run', 'lint'], cwd='/home/ava-io/repos/bigfootlive-react-frontend')

if __name__ == '__main__':
    main()
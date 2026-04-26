#!/usr/bin/env python3
"""
Quick test to check .env file path
"""

import os

print("🔍 Checking .env file path...")
print(f"Current working directory: {os.getcwd()}")

# Check different possible paths
paths_to_check = [
    'backend/.env',
    './backend/.env',
    'backend\\backend\.env',
    '.env'
]

for path in paths_to_check:
    if os.path.exists(path):
        print(f"✅ Found .env at: {path}")
        
        # Read and check for API key
        with open(path, 'r') as f:
            content = f.read()
            if 'OPENAI_API_KEY=' in content:
                print("✅ OPENAI_API_KEY found in file")
                # Extract and show key preview
                for line in content.split('\n'):
                    if line.startswith('OPENAI_API_KEY='):
                        key = line.split('=', 1)[1].strip()
                        print(f"🔑 Key preview: {key[:15]}...")
                        break
            else:
                print("❌ OPENAI_API_KEY not found in file")
    else:
        print(f"❌ Not found: {path}")

print("\n📋 Instructions:")
print("1. Make sure you're running this script from the heal-u directory")
print("2. The .env file should be in: backend/.env")
print("3. Run: python check_env_path.py")

#!/usr/bin/env python3
"""
OpenRouter API Key Testing Script
Tests API connectivity, authentication, and model availability
"""

import os
import requests
import json
import sys
from typing import Dict, List, Optional

def load_env_file(env_file: str) -> Dict[str, str]:
    """Load environment variables from .env file"""
    env_vars = {}
    try:
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
        return env_vars
    except FileNotFoundError:
        print(f"❌ .env file not found at: {env_file}")
        return {}

def test_api_key_format(api_key: str) -> bool:
    """Check if API key has correct OpenRouter format"""
    if not api_key:
        print("❌ No API key provided")
        return False
    
    if api_key.startswith('sk-or-v1-'):
        print(f"✅ API key format is correct (starts with sk-or-v1-)")
        print(f"🔑 Key length: {len(api_key)} characters")
        print(f"🔑 Key preview: {api_key[:15]}...")
        return True
    else:
        print(f"❌ Invalid API key format. Should start with 'sk-or-v1-'")
        print(f"🔑 Current format: {api_key[:15]}...")
        return False

def test_connectivity(api_key: str) -> bool:
    """Test basic API connectivity"""
    print("\n📡 Testing API connectivity...")
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'HTTP-Referer': 'https://heal-u.com',
        'X-Title': 'Heal-U Medical Chatbot Test'
    }
    
    try:
        response = requests.get('https://openrouter.ai/api/v1/models', headers=headers, timeout=30)
        
        if response.status_code == 200:
            print("✅ API connectivity successful")
            return True
        elif response.status_code == 401:
            print("❌ Authentication failed (401) - Invalid API key")
            return False
        elif response.status_code == 429:
            print("❌ Rate limit exceeded (429) - Try again later")
            return False
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            print(f"Response: {response.text[:200]}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {e}")
        return False

def get_available_models(api_key: str) -> List[str]:
    """Get list of available models"""
    print("\n📊 Fetching available models...")
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'HTTP-Referer': 'https://heal-u.com',
        'X-Title': 'Heal-U Medical Chatbot Test'
    }
    
    try:
        response = requests.get('https://openrouter.ai/api/v1/models', headers=headers, timeout=30)
        
        if response.status_code == 200:
            models_data = response.json()
            models = models_data.get('data', [])
            
            print(f"✅ Found {len(models)} available models")
            
            # Find free models
            free_models = [model for model in models if ':free' in model.get('id', '')]
            print(f"🆓 Free models available: {len(free_models)}")
            
            # Check for our target model
            target_model = 'meta-llama/llama-3.2-3b-instruct:free'
            target_found = any(model.get('id') == target_model for model in models)
            
            if target_found:
                print(f"✅ Target model '{target_model}' is available")
            else:
                print(f"❌ Target model '{target_model}' not found")
                print("Available free models:")
                for model in free_models[:5]:  # Show first 5 free models
                    print(f"  • {model.get('id')}")
            
            return [model.get('id') for model in models]
        else:
            print(f"❌ Failed to get models: {response.status_code}")
            return []
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Error fetching models: {e}")
        return []

def test_chat_completion(api_key: str, model: str = 'meta-llama/llama-3.2-3b-instruct:free') -> bool:
    """Test chat completion with specified model"""
    print(f"\n🤖 Testing chat completion with model: {model}")
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://heal-u.com',
        'X-Title': 'Heal-U Medical Chatbot Test'
    }
    
    data = {
        'model': model,
        'messages': [
            {
                'role': 'user',
                'content': 'Hello! Can you help me with a simple medical question?'
            }
        ],
        'max_tokens': 50,
        'temperature': 0.7
    }
    
    try:
        response = requests.post(
            'https://openrouter.ai/api/v1/chat/completions',
            headers=headers,
            json=data,
            timeout=30
        )
        
        print(f"📡 Chat API Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            if 'choices' in result and len(result['choices']) > 0:
                message = result['choices'][0]['message']['content']
                print(f"✅ Chat completion successful")
                print(f"🤖 AI Response: {message}")
                return True
            else:
                print("❌ Invalid response format")
                print(f"Response: {json.dumps(result, indent=2)}")
                return False
        else:
            print(f"❌ Chat completion failed: {response.status_code}")
            try:
                error_data = response.json()
                if 'error' in error_data:
                    print(f"Error: {error_data['error'].get('message', 'Unknown error')}")
            except:
                print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Chat completion error: {e}")
        return False

def main():
    """Main test function"""
    print("🔍 OpenRouter API Key Test")
    print("=" * 50)
    
    # Load API key from .env file
    env_file = 'backend/.env'
    env_vars = load_env_file(env_file)
    
    if not env_vars:
        print("\n❌ Could not load .env file")
        print("Please ensure the .env file exists in the backend directory")
        sys.exit(1)
    
    api_key = "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"
    
    # Test 1: API Key Format
    if not test_api_key_format(api_key):
        print("\n🔧 Solution:")
        print("1. Get a free API key from https://openrouter.ai")
        print("2. Add to backend/.env: OPENAI_API_KEY=sk-or-v1-your-key-here")
        sys.exit(1)
    
    # Test 2: API Connectivity
    if not test_connectivity(api_key):
        print("\n🔧 Solution:")
        print("1. Check internet connection")
        print("2. Verify API key is valid")
        print("3. Try accessing https://openrouter.ai in browser")
        sys.exit(1)
    
    # Test 3: Model Availability
    models = get_available_models(api_key)
    if not models:
        print("\n❌ Could not fetch models")
        sys.exit(1)
    
    # Test 4: Chat Completion
    target_model = 'meta-llama/llama-3.2-3b-instruct:free'
    if not test_chat_completion(api_key, target_model):
        print("\n🔧 Trying alternative free model...")
        
        # Try first available free model
        free_models = [m for m in models if ':free' in m]
        if free_models:
            alt_model = free_models[0]
            print(f"Trying: {alt_model}")
            if test_chat_completion(api_key, alt_model):
                print(f"\n✅ Alternative model works! Update chatbot.php to use: {alt_model}")
            else:
                print("\n❌ All models failed")
                sys.exit(1)
        else:
            print("\n❌ No free models available")
            sys.exit(1)
    
    print("\n🎉 All tests passed!")
    print("✅ Your OpenRouter API key is working correctly")
    print("✅ The chatbot should work with full AI functionality")
    print("\n📋 Next Steps:")
    print("1. The chatbot should now provide AI responses")
    print("2. Test it in the patient portal")
    print("3. If still failing, check server logs for additional errors")

if __name__ == "__main__":
    main()

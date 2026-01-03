#!/usr/bin/env python3
"""
Audio Generator using Edge TTS
Converts text to speech using Microsoft Edge's free Neural TTS API.
"""

import sys
import asyncio
import argparse
from pathlib import Path

try:
    import edge_tts
except ImportError:
    print("Error: Required package 'edge-tts' not found. Please install with:")
    print("pip install edge-tts")
    sys.exit(1)

# Default configuration
DEFAULT_VOICE = "en-US-ChristopherNeural"
DEFAULT_RATE = "+0%"
DEFAULT_PITCH = "-2Hz"

async def _generate_audio_async(text, output_file, voice, rate, pitch):
    """Async worker function to generate audio."""
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(output_file)

def generate_voice(text, output_file="output.mp3", voice=DEFAULT_VOICE, rate=DEFAULT_RATE, pitch=DEFAULT_PITCH):
    """Synchronous wrapper to call from any normal script"""
    try:
        # Create output directory if it doesn't exist
        Path(output_file).parent.mkdir(parents=True, exist_ok=True)
        
        print(f"Generating audio...")
        print(f"Voice: {voice}")
        print(f"Text: {text[:50]}..." if len(text) > 50 else f"Text: {text}")
        
        asyncio.run(_generate_audio_async(text, output_file, voice, rate, pitch))
        
        print(f"Generated: {output_file}")
        return True
    except Exception as e:
        print(f"Error: {e}")
        return False

def select_voice_interactive():
    """Ask user for language preference."""
    print("\nSelect language / Selecione o idioma:")
    print("1. English (Christopher - Movie Trailer)")
    print("2. Portuguese (Antonio - Deep/Serious)")
    
    choice = input("\nEnter choice [1/2]: ").strip()
    
    if choice == "2":
        return "pt-BR-AntonioNeural"
    return "en-US-ChristopherNeural"  # Default to English

def main():
    parser = argparse.ArgumentParser(description="Generate audio from text using Edge TTS")
    parser.add_argument('text', help='Text to convert to speech')
    parser.add_argument('--output', '-o', default='output.mp3', help='Output audio file path')
    parser.add_argument('--voice', '-v', help='Voice to use (overrides interactive selection)')
    parser.add_argument('--rate', '-r', default=DEFAULT_RATE, help='Speaking rate (e.g. +10%, -10%)')
    parser.add_argument('--pitch', '-p', default=DEFAULT_PITCH, help='Voice pitch (e.g. +2Hz, -2Hz)')
    
    args = parser.parse_args()
    
    # Determine voice
    voice = args.voice
    if not voice:
        voice = select_voice_interactive()
    
    # Check if text is a file path
    text = args.text
    if Path(text).exists() and Path(text).is_file():
        try:
            print(f"Reading text from file: {text}")
            text = Path(text).read_text(encoding='utf-8')
        except Exception as e:
            print(f"Error reading file: {e}")
            sys.exit(1)

    success = generate_voice(text, args.output, voice, args.rate, args.pitch)
    
    if success:
        sys.exit(0)
    else:
        sys.exit(1)

if __name__ == "__main__":
    main()

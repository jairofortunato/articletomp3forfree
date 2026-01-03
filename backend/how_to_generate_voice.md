# How to Generate High-Quality AI Voice for Free

In this project, we generate professional-grade voiceovers without paying for expensive APIs like ElevenLabs or OpenAI TTS. We use **Microsoft Edge TTS**, which provides access to Azure's "Neural" voices for free.

## The Secret Tool: `edge-tts`

We use a Python library called [`edge-tts`](https://github.com/rany2/edge-tts) that interfaces with the Microsoft Edge Read Aloud API.

### Why it's great:
- **Free**: No API keys or credit cards required.
- **High Quality**: Uses the same "Neural" technology as paid Azure TTS.
- **Unlimited**: No strict character limits for standard usage.
- **Multilingual**: Supports hundreds of voices in many languages.

## 1. Installation

First, install the library:

```bash
pip install edge-tts
```

## 2. Basic Usage (Command Line)

You can generate audio directly from your terminal taking advantage of the installed CLI tool:

```bash
edge-tts --text "Hello, this is a test." --write-media hello.mp3 --voice en-US-ChristopherNeural
```

## 3. Python Integration (The Robust Way)

Since `edge-tts` is asynchronous (async/await), but most scripts are synchronous, we use a wrapper pattern. Here is how we implement it in our codebase (similar to `voice_generator.py`):

```python
import asyncio
import edge_tts

# Configuration
# English: "en-US-ChristopherNeural" (Deep, documentary style)
# Portuguese: "pt-BR-AntonioNeural" (Deep, warm)
VOICE = "en-US-ChristopherNeural"

# Adjust speed and pitch
# Rate: "+0%" is normal. "-10%" is slower/serious. "+50%" is 1.5x speed.
RATE = "+0%" 
PITCH = "-2Hz"

async def _generate_audio_async(text, output_file):
    """Async worker function"""
    communicate = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(output_file)

def generate_voice(text, output_file="output.mp3"):
    """Synchronous wrapper to call from any normal script"""
    try:
        asyncio.run(_generate_audio_async(text, output_file))
        print(f"✅ Generated: {output_file}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    generate_voice("Creating content has never been this easy and free.")
```

## 4. Finding More Voices

To see all available voices, run this command in your terminal:

```bash
edge-tts --list-voices
```

### Our Top Picks per Language:
- **English (Male):** `en-US-ChristopherNeural` (The classic "Movie Trailer" voice)
- **English (Female):** `en-US-AriaNeural` (Professional, news anchor)
- **Portuguese (Male):** `pt-BR-AntonioNeural` (Deep, serious)
- **Portuguese (Female):** `pt-BR-FranciscaNeural` (Soft, soothing)

## 5. Customization Tips

- **The "Stoic" / "Sigma" Sound**: Set `Rate="-15%"` and `Pitch="-5Hz"` for a deeper, more authoritative voice.
- **High Energy / TikTok**: Set `Rate="+10%"` or `Rate="+20%"` for upbeat, quick explanations.

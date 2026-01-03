import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
    try {
        const { text, voice, rate, pitch } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const uniqueId = Date.now().toString();
        const tempDir = os.tmpdir();

        // Input text file
        const tempTextFile = path.join(tempDir, `${uniqueId}.txt`);
        await fs.promises.writeFile(tempTextFile, text);

        // Output audio file
        const outputPath = path.join(tempDir, `${uniqueId}.mp3`);

        // Path to the python script
        const scriptPath = path.resolve(process.cwd(), '../backend/generate_audio.py');

        // Fallback if not found (debugging)
        if (!fs.existsSync(scriptPath)) {
            console.error("Script not found at:", scriptPath);
            return NextResponse.json({ error: 'Backend script not found' }, { status: 500 });
        }

        // Command to execute
        // Detect python command: 'python' on Windows, 'python3' on Linux/Mac (Docker)
        const pythonCommand = process.platform === 'win32' ? 'python' : 'python3';
        const command = `${pythonCommand} "${scriptPath}" "${tempTextFile}" --output "${outputPath}" --voice="${voice || 'en-US-ChristopherNeural'}" --rate="${rate || '+0%'}" --pitch="${pitch || '-2Hz'}"`;

        console.log("Executing command:", command);

        const { stdout, stderr } = await execAsync(command);
        console.log("Stdout:", stdout);
        if (stderr) console.error("Stderr:", stderr);

        // Read the generated audio file
        const audioBuffer = await fs.promises.readFile(outputPath);

        // Cleanup temp files
        try {
            await Promise.all([
                fs.promises.unlink(tempTextFile),
                fs.promises.unlink(outputPath)
            ]);
        } catch (e) {
            console.error("Failed to delete temp files:", e);
        }

        // Return the audio as a stream/buffer
        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length.toString(),
            },
        });

    } catch (error: any) {
        console.error('Error generating audio:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate audio' }, { status: 500 });
    }
}

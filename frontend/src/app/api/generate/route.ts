import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
    try {
        const { text, voice, rate, pitch } = await request.json();

        if (!text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const uniqueId = Date.now().toString();
        const publicDir = path.join(process.cwd(), 'public');
        const audioDir = path.join(publicDir, 'audio');
        const outputFilename = `${uniqueId}.mp3`;
        const outputPath = path.join(audioDir, outputFilename);

        // Ensure output dir exists
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }

        // Write text to a temp file to avoid CLI escaping issues
        const tempTextFile = path.join(audioDir, `${uniqueId}.txt`);
        await fs.promises.writeFile(tempTextFile, text);

        // Path to the python script - adjusting for docker/local diffs if needed, but assuming local relative path
        // valid path: ../backend/generate_audio.py relative to frontend root
        const scriptPath = path.resolve(process.cwd(), '../backend/generate_audio.py');

        // Fallback if not found (debugging)
        if (!fs.existsSync(scriptPath)) {
            console.error("Script not found at:", scriptPath);
            return NextResponse.json({ error: 'Backend script not found' }, { status: 500 });
        }

        // Command to execute
        // using 'python' - ensure it's in PATH. On windows often 'python' or 'py'.
        const command = `python "${scriptPath}" "${tempTextFile}" --output "${outputPath}" --voice="${voice || 'en-US-ChristopherNeural'}" --rate="${rate || '+0%'}" --pitch="${pitch || '-2Hz'}"`;

        console.log("Executing command:", command);

        const { stdout, stderr } = await execAsync(command);
        console.log("Stdout:", stdout);
        if (stderr) console.error("Stderr:", stderr);

        // Cleanup text file
        try {
            await fs.promises.unlink(tempTextFile);
        } catch (e) {
            console.error("Failed to delete temp file:", e);
        }

        // Return URL relative to public
        return NextResponse.json({
            success: true,
            url: `/audio/${outputFilename}`,
            message: 'Audio generated successfully'
        });

    } catch (error: any) {
        console.error('Error generating audio:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate audio' }, { status: 500 });
    }
}

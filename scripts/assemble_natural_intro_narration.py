#!/usr/bin/env python3
"""Muxes the natural German narration into the existing BlackWaterLeaf intro visuals."""

from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
TEMP = BASE / "video/intro/temp"
NARRATION = BASE / "video/intro/audio-natural"
OUT = BASE / "client/src/assets/intro"

EDITIONS = {
    "short": {
        "visual": TEMP / "short_video_raw.mp4",
        "narration": NARRATION / "blackwaterleaf-intro-short-natural.wav",
        "output": OUT / "blackwaterleaf-intro-32s.mp4",
        "duration": 32.0,
        # The source performance is naturally 31.44s; the ending gets quiet room tone.
        "audio_filter": "aformat=sample_rates=48000:channel_layouts=stereo,apad,atrim=duration=32.0,asetpts=N/SR/TB",
    },
    "long": {
        "visual": TEMP / "long_video_raw.mp4",
        "narration": NARRATION / "blackwaterleaf-intro-long-natural.wav",
        "output": OUT / "blackwaterleaf-intro-75s.mp4",
        "duration": 75.0,
        # 82.24s is gently conformed to the 75s visual structure (+9.65%, pitch preserved).
        "audio_filter": "atempo=1.096533,aformat=sample_rates=48000:channel_layouts=stereo,apad,atrim=duration=75.0,asetpts=N/SR/TB",
    },
}


def run(command: list[str]) -> None:
    print("+", " ".join(command))
    subprocess.run(command, check=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--edition", choices=EDITIONS.keys())
    args = parser.parse_args()
    selected_editions = [args.edition] if args.edition else EDITIONS.keys()

    for edition in selected_editions:
        config = EDITIONS[edition]
        for key in ("visual", "narration"):
            if not config[key].exists():
                raise FileNotFoundError(f"{edition}: missing {key}: {config[key]}")

        run([
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-i", str(config["visual"]),
            "-i", str(config["narration"]),
            "-filter:a", config["audio_filter"],
            "-map", "0:v:0", "-map", "1:a:0",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-movflags", "+faststart",
            "-t", str(config["duration"]),
            str(config["output"]),
        ])
        run([
            "ffprobe", "-v", "error",
            "-show_entries", "stream=codec_type,codec_name,duration:format=duration",
            "-of", "json", str(config["output"]),
        ])


if __name__ == "__main__":
    main()

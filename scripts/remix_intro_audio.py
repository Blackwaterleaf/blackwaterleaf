#!/usr/bin/env python3
"""Erzeugt nachvollziehbare, voll lange Sprachspuren für die BlackWaterLeaf-Introfilme.

Der Mischer legt jede deutsche Sprecheraufnahme auf eine feste Zeitachse. Ein exakt
langer, stiller Stereo-Referenzkanal hält die finale Audiodauer konstant; dadurch
kann keine einzelne Sprecheraufnahme die Gesamtausgabe vorzeitig beenden.
"""

from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
AUDIO = BASE / "video/intro/audio"
TEMP = BASE / "video/intro/temp"
OUT = BASE / "client/src/assets/intro"

EDITIONS = {
    "short": {
        "duration": 32.0,
        "video": TEMP / "short_video_raw.mp4",
        "output": OUT / "blackwaterleaf-intro-32s.mp4",
        # +25 % lässt die Kurzfassung verständlich, aber innerhalb von 32 s sprechen.
        "tempo": 1.25,
        "takes": [
            ("short_01.mp3", 0.25),
            ("short_02.mp3", 6.05),
            ("short_03.mp3", 12.00),
            ("short_04.mp3", 18.30),
            ("short_05.mp3", 24.70),
        ],
    },
    "long": {
        "duration": 75.0,
        "video": TEMP / "long_video_raw.mp4",
        "output": OUT / "blackwaterleaf-intro-75s.mp4",
        # +25 % schafft bewusst Atempausen an den Kapitelwechseln.
        "tempo": 1.25,
        "takes": [
            ("long_01.mp3", 0.30),
            ("long_02.mp3", 5.20),
            ("long_03.mp3", 13.20),
            ("long_04.mp3", 21.20),
            ("long_05.mp3", 29.20),
            ("long_06.mp3", 38.20),
            ("long_07.mp3", 46.20),
            ("long_08.mp3", 54.20),
            ("long_09.mp3", 63.20),
            ("long_10.mp3", 70.00),
        ],
    },
}


def run(command: list[str]) -> None:
    print("+", " ".join(command))
    subprocess.run(command, check=True)


def make_audio(edition: str) -> Path:
    config = EDITIONS[edition]
    TEMP.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)

    duration = config["duration"]
    tempo = config["tempo"]
    audio_out = TEMP / f"{edition}_narration.aac"

    # Input 0 is a fully silent, exact-duration stereo bed. It guarantees a full-length
    # output while the actual narration takes occupy their precise time slots.
    command = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-f", "lavfi", "-t", str(duration), "-i", "anullsrc=r=48000:cl=stereo",
    ]
    for filename, _ in config["takes"]:
        command.extend(["-i", str(AUDIO / filename)])

    filters = ["[0:a]aformat=sample_rates=48000:channel_layouts=stereo[bed]"]
    for index, (_, start) in enumerate(config["takes"], start=1):
        delay = round(start * 1000)
        filters.append(
            f"[{index}:a]atempo={tempo},aformat=sample_rates=48000:channel_layouts=stereo,"
            f"adelay={delay}|{delay}[voice{index}]"
        )

    inputs = "[bed]" + "".join(f"[voice{index}]" for index in range(1, len(config["takes"]) + 1))
    filters.append(
        f"{inputs}amix=inputs={len(config['takes']) + 1}:duration=longest:normalize=0,"
        f"atrim=duration={duration},asetpts=N/SR/TB[aout]"
    )

    command.extend([
        "-filter_complex", ";".join(filters),
        "-map", "[aout]",
        "-c:a", "aac", "-b:a", "192k",
        str(audio_out),
    ])
    run(command)
    return audio_out


def mux(edition: str, audio_path: Path) -> Path:
    config = EDITIONS[edition]
    video = config["video"]
    output = config["output"]
    if not video.exists():
        raise FileNotFoundError(f"Visuale Zwischenfassung fehlt: {video}")

    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(video), "-i", str(audio_path),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "copy",
        "-movflags", "+faststart",
        "-shortest", str(output),
    ])
    return output


def validate(path: Path, expected_duration: float) -> None:
    run([
        "ffprobe", "-v", "error",
        "-show_entries", "stream=codec_type,codec_name,duration:format=duration",
        "-of", "json", str(path),
    ])
    run([
        "ffmpeg", "-hide_banner", "-nostats", "-i", str(path), "-map", "0:a:0",
        "-af", "volumedetect", "-f", "null", "-",
    ])
    print(f"Validated {path.name}; expected runtime {expected_duration:.0f}s")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--edition", choices=EDITIONS.keys(), required=True)
    args = parser.parse_args()
    audio_path = make_audio(args.edition)
    final_path = mux(args.edition, audio_path)
    validate(final_path, EDITIONS[args.edition]["duration"])


if __name__ == "__main__":
    main()

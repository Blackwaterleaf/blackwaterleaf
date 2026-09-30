import subprocess
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
AUDIO = BASE / "video/intro/audio"
SCREENS = BASE / "video/intro/assets/screens"
OUT = BASE / "client/src/assets/intro"
TEMP = BASE / "video/intro/temp"
TEMP.mkdir(parents=True, exist_ok=True)

LOGO = BASE / "client/public/blackwaterleaf-mark.png"
NATURE = BASE / "video/intro/assets/current-intro.mp4"

font_bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
font_regular = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# Kurzfassung für die Startseite: 32 Sekunden Gesamtlaufzeit
# K01: 00:00 - 05.00s | Hook & Observatorium (Botanik, Aquaristik, Terraristik)
# K02: 05.00 - 12.00s | Erfassen, Pflegen & Wissen (Explore & Flow Foto)
# K03: 12.00 - 19.00s | Geschützter Start & bewusste Community
# K04: 19.00 - 26.00s | Optionale Technik, Partner & geplante Organisationen
# K05: 26.00 - 32.00s | Finale: Observatorium, Markenabschluss & URL

short_scenes = [
    {
        "id": "k01",
        "dur": 5.0,
        "bg_type": "video_nature",
        "title": "BLACKWATERLEAF",
        "subtitle": "BOTANIK · AQUARISTIK · TERRARISTIK",
        "category": "DAS AQUATISCHE OBSERVATORIUM"
    },
    {
        "id": "k02",
        "dur": 7.0,
        "bg_type": "screen",
        "img": SCREENS / "02_explore_index.png",
        "title": "ERFASSEN · VERSTEHEN · DOKUMENTIEREN",
        "subtitle": "Echte Naturbeobachtungen festhalten und mit Quellen vertiefen",
        "category": "WISSEN & SAMMLUNG"
    },
    {
        "id": "k03",
        "dur": 7.0,
        "bg_type": "screen",
        "img": SCREENS / "04_community_feed.png",
        "title": "PRIVAT STARTEN · BEWUSST TEILEN",
        "subtitle": "Deine Einträge bleiben geschützt, bis du sie in der Community zeigst",
        "category": "DEIN BEREICH"
    },
    {
        "id": "k04",
        "dur": 7.0,
        "bg_type": "screen",
        "img": SCREENS / "05_marketplace_partners.png",
        "title": "OPTIONALE TECHNIK · GEPLANTE TEAMS",
        "subtitle": "Transparente Partner heute – eigene Bereiche für Organisationen in Vorbereitung",
        "category": "TRANSPARENZ & AUSBLICK"
    },
    {
        "id": "k05",
        "dur": 6.0,
        "bg_type": "logo_finale",
        "title": "BLACKWATERLEAF",
        "subtitle": "NATUR WIRD LEBENDIG, SOBALD DU GENAUER HINSIEHST.",
        "category": "BLACKWATERLEAF.COM"
    }
]

print("Rendering short video segments...")
short_segment_files = []
for idx, s in enumerate(short_scenes):
    seg_out = TEMP / f"short_seg_{idx:02d}.mp4"
    short_segment_files.append(seg_out)
    dur = s["dur"]
    title = s["title"].replace("'", "’").replace(":", " -")
    subtitle = s["subtitle"].replace("'", "’").replace(":", " -")
    category = s["category"].replace("'", "’").replace(":", " -")
    
    if s["bg_type"] == "video_nature":
        vf = (
            f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
            f"boxblur=1.5:1,"
            f"drawbox=x=0:y=0:w=1920:h=1080:color=black@0.52:t=fill,"
            f"drawbox=x=120:y=120:w=1680:h=840:color=#0f2a1b@0.75:t=fill,"
            f"drawbox=x=120:y=120:w=1680:h=840:color=#41c97a@0.85:t=3,"
            f"drawtext=fontfile='{font_bold}':text='{category}':fontcolor=#72f2a3:fontsize=26:x=180:y=180,"
            f"drawtext=fontfile='{font_bold}':text='{title}':fontcolor=#ffffff:fontsize=64:x=180:y=240,"
            f"drawtext=fontfile='{font_regular}':text='{subtitle}':fontcolor=#d1ecd5:fontsize=34:x=180:y=340,"
            f"fade=t=in:st=0:d=0.5,fade=t=out:st={dur-0.5}:d=0.5"
        )
        cmd = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-ss", "1.0", "-i", str(NATURE),
            "-t", str(dur),
            "-vf", vf,
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", str(seg_out)
        ]
    elif s["bg_type"] == "logo_finale":
        vf = (
            f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
            f"drawbox=x=0:y=0:w=1920:h=1080:color=#041209:t=fill,"
            f"drawbox=x=0:y=0:w=1920:h=1080:color=black@0.4:t=fill,"
            f"drawbox=x=160:y=140:w=1600:h=800:color=#0b2518@0.85:t=fill,"
            f"drawbox=x=160:y=140:w=1600:h=800:color=#72f2a3@0.9:t=4,"
            f"drawtext=fontfile='{font_bold}':text='{title}':fontcolor=#ffffff:fontsize=76:x=(w-text_w)/2:y=320,"
            f"drawtext=fontfile='{font_regular}':text='{subtitle}':fontcolor=#d8ffc2:fontsize=32:x=(w-text_w)/2:y=440,"
            f"drawtext=fontfile='{font_bold}':text='{category}':fontcolor=#72f2a3:fontsize=42:x=(w-text_w)/2:y=620,"
            f"fade=t=in:st=0:d=0.6,fade=t=out:st={dur-0.6}:d=0.6"
        )
        cmd = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-f", "lavfi", "-i", f"color=c=#041209:s=1920x1080:d={dur}",
            "-vf", vf,
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", str(seg_out)
        ]
    else:
        img_path = s["img"]
        vf = (
            f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
            f"drawbox=x=0:y=0:w=1920:h=1080:color=black@0.15:t=fill,"
            f"drawbox=x=0:y=760:w=1920:h=320:color=#04140b@0.92:t=fill,"
            f"drawbox=x=0:y=760:w=1920:h=3:color=#41c97a:t=fill,"
            f"drawtext=fontfile='{font_bold}':text='{category}':fontcolor=#72f2a3:fontsize=24:x=90:y=805,"
            f"drawtext=fontfile='{font_bold}':text='{title}':fontcolor=#ffffff:fontsize=48:x=90:y=850,"
            f"drawtext=fontfile='{font_regular}':text='{subtitle}':fontcolor=#d1ecd5:fontsize=28:x=90:y=920,"
            f"fade=t=in:st=0:d=0.4,fade=t=out:st={dur-0.4}:d=0.4"
        )
        cmd = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-loop", "1", "-i", str(img_path),
            "-t", str(dur),
            "-vf", vf,
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", "30", str(seg_out)
        ]
    subprocess.run(cmd, check=True)
    print(f"Rendered short segment {idx+1}/{len(short_scenes)}: {seg_out.name}")

concat_list = TEMP / "short_concat.txt"
with open(concat_list, "w") as f:
    for s_file in short_segment_files:
        f.write(f"file '{s_file}'\n")

merged_short_video = TEMP / "short_video_raw.mp4"
subprocess.run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-f", "concat", "-safe", "0", "-i", str(concat_list),
    "-c", "copy", str(merged_short_video)
], check=True)
print("Short video track concatenated.")

# Sprachspur robust auf der vollständigen Zeitachse erzeugen und mit dem Videotrack verbinden.
# Das separate Werkzeug verhindert, dass eine einzelne Sprecheraufnahme die Audiodauer verkürzt.
subprocess.run([
    "python3", str(BASE / "scripts/remix_intro_audio.py"), "--edition", "short"
], check=True)

FINAL_SHORT = OUT / "blackwaterleaf-intro-32s.mp4"
# Außerdem erzeugen wir ein passendes 16:9-Posterbild für beide Player.
POSTER = OUT / "blackwaterleaf-intro-poster.jpg"
subprocess.run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-ss", "00:00:02.000", "-i", str(FINAL_SHORT),
    "-vframes", "1", "-q:v", "2", str(POSTER)
], check=True)

print("SUCCESS: Short video generated:", FINAL_SHORT)
print("SUCCESS: Poster generated:", POSTER)

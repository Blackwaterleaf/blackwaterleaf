import subprocess, os
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
AUDIO = BASE / "video/intro/audio"
SCREENS = BASE / "video/intro/assets/screens"
OUT = BASE / "client/src/assets/intro"
TEMP = BASE / "video/intro/temp"
TEMP.mkdir(parents=True, exist_ok=True)

LOGO = BASE / "client/public/blackwaterleaf-mark.png"
NATURE = BASE / "video/intro/assets/current-intro.mp4"

# Szenen für 75 Sekunden Langfassung:
# S01: 00:00 - 05.00s | Hook: Makro Natur & Intro
# S02: 05.00 - 13.00s | 3 Welten (Botanik, Aquaristik, Terraristik)
# S03: 13.00 - 21.00s | Erfassen & Zuordnen (Flow Foto)
# S04: 21.00 - 29.00s | Wissen & Quellen (Knowledge)
# S05: 29.00 - 38.00s | Schutz & Sichtbarkeit (Profile / Geschützt)
# S06: 38.00 - 46.00s | Community & echter Austausch
# S07: 46.00 - 54.00s | Optionale Technik / Smart-Werte nur nach Freigabe
# S08: 54.00 - 63.00s | Partner & Marktplatz (transparent gekennzeichnet)
# S09: 63.00 - 70.00s | Geplante Organisationen / Vereine / Teams
# S10: 70.00 - 75.00s | Finale: Observatorium & Call to Action (Logo)

scenes = [
    {
        "id": "s01",
        "dur": 5.0,
        "bg_type": "video_nature",
        "title": "BLACKWATERLEAF",
        "subtitle": "DAS AQUATISCHE & TERRESTRISCHE OBSERVATORIUM",
        "category": "EINFÜHRUNG",
        "zoom": "1.0:1.06"
    },
    {
        "id": "s02",
        "dur": 8.0,
        "bg_type": "screen",
        "img": SCREENS / "02_explore_index.png",
        "title": "DREI WELTEN AN EINEM ORT",
        "subtitle": "Botanik, Aquaristik und Terraristik mit System erforschen",
        "category": "01 · ENTDECKEN",
        "zoom": "1.0:1.05"
    },
    {
        "id": "s03",
        "dur": 8.0,
        "bg_type": "screen",
        "img": SCREENS / "06_flow_foto.png",
        "title": "ERFASSEN & ZUORDNEN",
        "subtitle": "Echte Naturmomente festhalten und deinen Sammlungen zuweisen",
        "category": "02 · DOKUMENTIEREN",
        "zoom": "1.0:1.05"
    },
    {
        "id": "s04",
        "dur": 8.0,
        "bg_type": "screen",
        "img": SCREENS / "03_knowledge.png",
        "title": "WISSEN MIT BELEGTEN QUELLEN",
        "subtitle": "Arten, Pflege und Zusammenhänge fundiert verstehen",
        "category": "03 · WISSEN",
        "zoom": "1.0:1.05"
    },
    {
        "id": "s05",
        "dur": 9.0,
        "bg_type": "screen",
        "img": SCREENS / "08_profile_signedout.png",
        "title": "PRIVAT STARTEN · BEWUSST TEILEN",
        "subtitle": "Eigene Einträge sind geschützt – du entscheidest die Sichtbarkeit",
        "category": "04 · PRIVATSPHÄRE",
        "zoom": "1.0:1.04"
    },
    {
        "id": "s06",
        "dur": 8.0,
        "bg_type": "screen",
        "img": SCREENS / "04_community_feed.png",
        "title": "ECHTE COMMUNITY",
        "subtitle": "Echte Konten teilen Naturerlebnisse und Erfahrungen",
        "category": "05 · GEMEINSCHAFT",
        "zoom": "1.0:1.05"
    },
    {
        "id": "s07",
        "dur": 8.0,
        "bg_type": "screen",
        "img": SCREENS / "07_flow_live.png",
        "title": "OPTIONALE TECHNIK",
        "subtitle": "Smart-Werte & Kameras fließen erst nach deiner Freigabe",
        "category": "06 · GERÄTE & SENSOREN",
        "zoom": "1.0:1.05"
    },
    {
        "id": "s08",
        "dur": 9.0,
        "bg_type": "screen",
        "img": SCREENS / "05_marketplace_partners.png",
        "title": "TRANSPARENTE PARTNER",
        "subtitle": "Geprüfte Unternehmensangebote – Kauf und Service direkt beim Partner",
        "category": "07 · MARKTPLATZ",
        "zoom": "1.0:1.05"
    },
    {
        "id": "s09",
        "dur": 7.0,
        "bg_type": "screen",
        "img": SCREENS / "01_home_hero.png",
        "title": "IN PLANUNG: ORGANISATIONEN",
        "subtitle": "Geplante Bereiche für Vereine, Schulen, Naturschutz und Forschung",
        "category": "08 · AUSBLICK & ZIEL",
        "zoom": "1.04:1.0"
    },
    {
        "id": "s10",
        "dur": 5.0,
        "bg_type": "logo_finale",
        "title": "BLACKWATERLEAF",
        "subtitle": "NATUR WIRD LEBENDIG, SOBALD DU GENAUER HINSIEHST.",
        "category": "BLACKWATERLEAF.COM",
        "zoom": "1.0:1.04"
    }
]

print("Rendering visual segments...")
segment_files = []
for idx, s in enumerate(scenes):
    seg_out = TEMP / f"long_seg_{idx:02d}.mp4"
    segment_files.append(seg_out)
    dur = s["dur"]
    title = s["title"].replace("'", "’").replace(":", " -")
    subtitle = s["subtitle"].replace("'", "’").replace(":", " -")
    category = s["category"].replace("'", "’").replace(":", " -")
    
    # Text-Overlay und Vignette für erstklassige Lesbarkeit
    # Robuste Basisschriftart DejaVu Sans
    font_bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    font_regular = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    
    if s["bg_type"] == "video_nature":
        vf = (
            f"scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
            f"boxblur=1.5:1,"
            f"drawbox=x=0:y=0:w=1920:h=1080:color=black@0.55:t=fill,"
            f"drawbox=x=120:y=120:w=1680:h=840:color=#0f2a1b@0.75:t=fill,"
            f"drawbox=x=120:y=120:w=1680:h=840:color=#41c97a@0.8:t=3,"
            f"drawtext=fontfile='{font_bold}':text='{category}':fontcolor=#72f2a3:fontsize=26:x=180:y=180,"
            f"drawtext=fontfile='{font_bold}':text='{title}':fontcolor=#ffffff:fontsize=64:x=180:y=240,"
            f"drawtext=fontfile='{font_regular}':text='{subtitle}':fontcolor=#d1ecd5:fontsize=34:x=180:y=340,"
            f"fade=t=in:st=0:d=0.5,fade=t=out:st={dur-0.5}:d=0.5"
        )
        cmd = [
            "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
            "-ss", "0", "-i", str(NATURE),
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
        # Reale Bildschirmaufnahme mit dezentem Pan/Zoom und klarem Information-Overlay am unteren Rand
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
    print(f"Rendered segment {idx+1}/{len(scenes)}: {seg_out.name}")

# Konkatenieren der visuellen Segmente
concat_list = TEMP / "long_concat.txt"
with open(concat_list, "w") as f:
    for s_file in segment_files:
        f.write(f"file '{s_file}'\n")

merged_video = TEMP / "long_video_raw.mp4"
subprocess.run([
    "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
    "-f", "concat", "-safe", "0", "-i", str(concat_list),
    "-c", "copy", str(merged_video)
], check=True)
print("Video track concatenated.")

# Natürliche Narration auf der vollständigen Zeitachse einbetten.
# Die TTS-Aufnahme wird nur minimal auf die visuelle 75s-Struktur angepasst.
subprocess.run([
    "python3", str(BASE / "scripts/assemble_natural_intro_narration.py"), "--edition", "long"
], check=True)

FINAL_LONG = OUT / "blackwaterleaf-intro-75s.mp4"
print("SUCCESS: Long video generated:", FINAL_LONG)

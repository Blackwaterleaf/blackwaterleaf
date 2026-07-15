-- Badges catalog
INSERT INTO badges (code, name, description, icon, tier) VALUES
('plant_detective', 'Pflanzen-Detektiv', 'Erste Pflanzenbestimmung per Foto durchgeführt.', 'search', 'bronze'),
('streak_week', 'Wochen-Streak', '7 Tage in Folge aktiv gewesen.', 'flame', 'silver'),
('first_post', 'Erster Beitrag', 'Deinen ersten Beitrag in der Community veröffentlicht.', 'pen-line', 'bronze'),
('plant_expert', 'Pflanzenexperte', 'Umfangreiches Wissen rund um Pflanzen bewiesen.', 'leaf', 'gold'),
('aquatic_pro', 'Aquaristik-Profi', 'Erfahrung in der Aquarienhaltung gesammelt.', 'droplets', 'gold'),
('helpful_member', 'Hilfreiches Mitglied', 'Anderen mit Rat und Tat geholfen.', 'heart-handshake', 'silver'),
('top_photographer', 'Top Fotograf', 'Beeindruckende Fotos mit der Community geteilt.', 'camera', 'special'),
('photo_pro', 'Foto-Profi', 'Alle 4 Perspektiven für eine Pflanzenbestimmung hochgeladen.', 'camera', 'silver'),
('fact_checker', 'Fakten-Checker', 'Eine KI-Bestimmung erfolgreich korrigiert.', 'shield-check', 'bronze')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), icon = VALUES(icon), tier = VALUES(tier);

-- Active weekly challenge
INSERT INTO challenges (title, description, rewardXp, category, startsAt, endsAt, isActive) VALUES
('Foto-Challenge: Dein schönster Pflanzenmoment', 'Teile diese Woche dein bestes Foto einer Pflanze oder deines Aquariums im Showcase. Die Community wählt den Favoriten!', 100, 'photo', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), true);

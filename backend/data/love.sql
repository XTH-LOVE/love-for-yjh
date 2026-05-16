-- Love For YJH Database Export
-- Export Date: 2026-05-16T04:37:18.820Z

CREATE TABLE achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        icon TEXT DEFAULT '🏆',
        condition_type TEXT NOT NULL,
        condition_value INTEGER DEFAULT 1
      );

INSERT INTO achievements (id, key, title, description, icon, condition_type, condition_value) VALUES (1, 'first_diary', '第一篇日记', '写下了第一篇爱情日记', '📝', 'first', 1);
INSERT INTO achievements (id, key, title, description, icon, condition_type, condition_value) VALUES (2, 'first_whisper', '悄悄话首发', '发出第一条悄悄话', '💌', 'first', 1);
INSERT INTO achievements (id, key, title, description, icon, condition_type, condition_value) VALUES (3, 'first_photo', '定格瞬间', '上传第一张照片', '📷', 'first', 1);
INSERT INTO achievements (id, key, title, description, icon, condition_type, condition_value) VALUES (4, 'diary_7', '连续记录者', '写满7篇日记', '📔', 'diary_count', 7);
INSERT INTO achievements (id, key, title, description, icon, condition_type, condition_value) VALUES (5, 'diary_30', '日记达人', '写满30篇日记', '📓', 'diary_count', 30);
INSERT INTO achievements (id, key, title, description, icon, condition_type, condition_value) VALUES (6, 'whisper_10', '倾诉小能手', '发出10条悄悄话', '💭', 'whisper_sent', 10);
INSERT INTO achievements (id, key, title, description, icon, condition_type, condition_value) VALUES (7, 'photo_10', '回忆收藏家', '上传10张照片', '🖼️', 'photo_count', 10);
INSERT INTO achievements (id, key, title, description, icon, condition_type, condition_value) VALUES (8, 'photo_50', '时光相册', '上传50张照片', '🎞️', 'photo_count', 50);
INSERT INTO achievements (id, key, title, description, icon, condition_type, condition_value) VALUES (9, 'anniversary_5', '铭记时刻', '添加5个纪念日', '📅', 'anniversary_count', 5);
INSERT INTO achievements (id, key, title, description, icon, condition_type, condition_value) VALUES (10, 'days_100', '百日甜恋', '在一起满100天', '💯', 'days_together', 100);
INSERT INTO achievements (id, key, title, description, icon, condition_type, condition_value) VALUES (11, 'days_365', '一周年', '在一起满365天', '🎉', 'days_together', 365);


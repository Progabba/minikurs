# ЭОМ QUEST · 8-битный курс «Альфа Инженер»

Ретро-игра в стиле Денди (NES): 7 миров-уровней по проектированию ЭОМ.
Карта-мир как в Марио, чиптюн-звук (генерится на лету, без файлов),
CRT-развёртка, пиксельная графика. Чистый HTML/CSS/JS без зависимостей.

## Структура
- index.html — точка входа
- assets/css/style.css — 8-битные стили, CRT, карта, HUD
- assets/js/chiptune.js — звук через Web Audio (эффекты + фоновая мелодия)
- assets/js/data.js — 7 миров: теория (диалоги ИСКРЫ), нормы, мини-игры. Ссылка на курс — COURSE_URL
- assets/js/games.js — мини-игры (order, build, calc, sprint, match, expert)
- assets/js/worldmap.js — карта-мир (SVG-узлы, спрайт героя)
- assets/js/app.js — движок: старт, карта, уровни, HUD, финал, прогресс

## Публикация на GitHub Pages
Залей содержимое папки dendy в репозиторий (в корень или отдельную папку) →
Settings → Pages → Deploy from a branch → main → /(root).

## Настройка
- Ссылка на платный курс — COURSE_URL в начале assets/js/data.js
- Прогресс/монеты хранятся в localStorage (ключ alfa_dendy_v1)
- Звук включается по кнопке PRESS START (требование браузеров к Web Audio)

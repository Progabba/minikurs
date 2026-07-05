# Мини-курс «Первый шаг в проектирование ЭОМ» · Альфа Инженер

Интерактивный бесплатный мини-курс: 7 модулей с анимированной теорией и играми.
Чистый HTML/CSS/JS, без внешних зависимостей — работает офлайн и на GitHub Pages.

## Структура
- `index.html` — точка входа
- `assets/css/style.css` — стили
- `assets/js/engine.js` — движок анимаций (частицы по траекториям, плеер сцен, конфетти)
- `assets/js/scenes.js` — 7 анимаций-историй
- `assets/js/data.js` — теория модулей + ссылка на курс (константа COURSE_URL)
- `assets/js/games.js` — 7 игр
- `assets/js/app.js` — экраны и прогресс (localStorage)

## Публикация на GitHub Pages
1. Залей папку в репозиторий (например, `progabba.github.io/minikurs/`).
2. Открой `https://progabba.github.io/minikurs/` — всё работает сразу.

## Настройка
- Ссылка на платный курс — `COURSE_URL` в начале `assets/js/data.js`.
- Прогресс хранится в localStorage (ключ `alfa_minikurs_v1`), сбрасывается кнопкой «Пройти заново». а

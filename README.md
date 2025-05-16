# Разграбление Корованов: Сага Четырех Зон

**Мечта Кирилла, которую он вынашивал джва года, наконец-то обретает форму!**
_Разграбление Корованов: Сага Четырех Зон_ — это амбициозный 3D-экшен с элементами RPG, где игроки погружаются в мир интриг, сражений и, конечно же, грабежа корованов. Выберите свою сторону: станьте благородным лесным эльфом, верным стражем дворца или коварным злодеем, стремящимся к власти. Игра разрабатывается на HTML5, JavaScript и Three.js, с акцентом на процедурную генерацию и веб-доступные ассеты.

---

## 🚀 Обзор Игры

*   **Жанр:** 3D Экшен / RPG от третьего лица
*   **Ключевые особенности:**
    *   Три уникальные играбельные фракции со своими целями и геймплеем.
    *   **Основная механика: Грабеж корованов!**
    *   Четыре обширные игровые зоны: лес эльфов, земли императора с дворцом, нейтральные территории людей и горная цитадель злодея.
    *   Детализированная система повреждений: возможность потерять конечности или глаз, с необходимостью лечения или установки протезов.
    *   Элементы RPG в стиле Daggerfall: покупка снаряжения, улучшений, возможно, квесты.
    *   Процедурная генерация окружения, включая деревья с системой LOD (Level of Detail).
    *   Полностью 3D-персонажи, враги и даже трупы.
    *   Возможность прыгать и сохранять игру.

---

## 🧠 Основные Игровые Механики

### 1. Выбор Фракции и Цели
Игрок выбирает одну из трех фракций, каждая со своей историей, задачами и стилем игры:

*   **Лесные Эльфы:**
    *   **Местоположение:** Густой лес с деревянными домиками.
    *   **Цели:** Защита своего народа и леса от солдат дворца и приспешников злодея. Выживание, сбор ресурсов.
    *   **Особенности:** Мастера скрытности и дальнего боя. Основной источник дохода – **грабеж корованов**, проходящих через лес или близлежащие территории.
*   **Охрана Дворца:**
    *   **Местоположение:** Величественный дворец в землях Императора.
    *   **Цели:** Служба командиру, защита дворца от атак злодея и партизанских вылазок эльфов. Участие в карательных экспедициях и набегах.
    *   **Особенности:** Дисциплинированные воины, хорошо экипированы. Могут сопровождать имперские корованы или отбивать их у грабителей.
*   **Злодей:**
    *   **Местоположение:** Старый форт в труднодоступных горах.
    *   **Цели:** Накопление сил, командование собственной армией, распространение влияния и, в конечном итоге, штурм дворца.
    *   **Особенности:** Сам себе командир. Может нанимать наемников, строить козни, нападать на кого угодно, включая **грабеж корованов** для пополнения казны и ресурсов.

### 2. Грабеж Корованов (Ключевая Механика)
Эта механика является центральной для экономики и геймплея, особенно для Эльфов и Злодея.

*   **Появление корованов:** Корованы (торговые караваны, повозки с припасами) периодически генерируются и перемещаются между зонами по определенным маршрутам.
*   **Обнаружение:** Игрок может случайно наткнуться на корован, получить наводку от NPC или использовать разведку.
*   **Атака:** Игрок и его союзники (если есть) могут атаковать корован. Завязывается бой с охраной корована. Сила охраны зависит от ценности груза и принадлежности корована.
*   **Добыча:** В случае успеха игрок получает добычу: золото, товары (для продажи), ресурсы (для крафта или улучшений), еду, а иногда и ценную информацию или уникальные предметы.
    ```javascript
    // Пример структуры добычи из корована
    function getCaravanLoot(caravanType) {
        let loot = { gold: 0, items: [], resources: {} };
        if (caravanType === 'merchant') {
            loot.gold = Math.floor(Math.random() * 100) + 50; // 50-149 золота
            loot.items.push('ценные_ткани', 'специи');
        } else if (caravanType === 'imperial_supply') {
            loot.gold = Math.floor(Math.random() * 50) + 20;
            loot.resources['металл'] = Math.floor(Math.random() * 10) + 5;
            loot.resources['оружие_низкого_качества'] = Math.floor(Math.random() * 3) + 1;
        }
        return loot;
    }
    ```
*   **Последствия:** Успешный грабеж может повлиять на репутацию игрока с различными фракциями, привести к назначению награды за его голову или спровоцировать ответные действия.

### 3. Боевая Система
*   **3D-сражения в реальном времени:** Игрок управляет персонажем от третьего лица.
*   **Оружие:** Мечи, топоры, луки (особенно для эльфов), возможно, магия.
*   **Способности:** Прыжки, уклонения, специальные атаки (в зависимости от фракции и прокачки).
*   **Физика:** Трупы врагов остаются на земле как 3D-объекты.

### 4. Система Ранений и Протезирования
Игра будет включать детализированную систему повреждений:
*   **Отрубание конечностей:** В бою можно потерять руку или ногу.
    *   **Потеря руки:** Невозможность использовать двуручное оружие или щит, штрафы к скорости атаки.
    *   **Потеря ноги:** Значительное замедление передвижения (ползание) или невозможность передвигаться без помощи (коляска, если будет реализована).
*   **Потеря глаза:** Одна половина экрана затемняется, ухудшая обзор.
*   **Лечение и протезы:**
    *   Тяжелые ранения требуют немедленного лечения, иначе персонаж может умереть от кровопотери.
    *   Потерянные конечности и глаза можно заменить протезами, которые можно купить или создать. Протезы восстанавливают функциональность, но могут иметь свои плюсы и минусы (например, железный протез руки сильный, но медленный).
    ```javascript
    // Упрощенная логика эффекта потери глаза
    function applyEyeLossEffect(whichEye) { // 'left' or 'right'
        const patchElementId = whichEye === 'left' ? 'eye-patch-left' : 'eye-patch-right';
        document.getElementById(patchElementId).style.display = 'block';
    }
    function removeEyeLossEffect(whichEye) {
        const patchElementId = whichEye === 'left' ? 'eye-patch-left' : 'eye-patch-right';
        document.getElementById(patchElementId).style.display = 'none';
    }
    ```

### 5. Игровой Мир и Зоны
Карта разделена на 4 основные зоны:
1.  **Нейтральная зона Людей:** Города, деревни, торговые пути. Здесь часто встречаются корованы.
2.  **Зона Императора:** Столица с дворцом, казармы, патрулируемые территории.
3.  **Зона Эльфов:** Густой, труднопроходимый лес, скрытые поселения эльфов.
4.  **Зона Злодея:** Мрачные горы, ущелья, старый форт, служащий базой злодея.

### 6. Процедурная Генерация Деревьев (LOD)
Для создания густого леса эльфов и других лесистых местностей будет использоваться система LOD:
*   **Дальние деревья:** Отображаются как 2D-спрайты (билборды) для экономии ресурсов. Текстуры для спрайтов могут быть сгенерированы на Canvas 2D или загружены по URL.
*   **Ближние деревья:** При приближении игрока 2D-спрайты заменяются полноценными 3D-моделями деревьев, созданными из примитивов Three.js (цилиндры для стволов, сферы/конусы для крон) или более сложными процедурными алгоритмами.

### 7. Экономика и Улучшения
*   **Торговля:** Покупка и продажа товаров, оружия, брони, зелий, протезов.
*   **Улучшения:** Возможность улучшать свою базу (для Эльфов и Злодея) или экипировку.

### 8. Сохранение Игры
Игровой прогресс можно будет сохранять и загружать, используя `localStorage` браузера.

---

## 🛠 Технологический Стек

*   **HTML5:** Основа веб-страницы, структура интерфейса.
    *   *Назначение:* Разметка документа, контейнеры для игры и UI.
*   **CSS:** Стилизация пользовательского интерфейса.
    *   *Назначение:* Внешний вид кнопок, информационных панелей, эффектов (например, затемнение экрана при потере глаза).
*   **JavaScript (Vanilla JS):** Вся игровая логика, управление состоянием, AI, физика, взаимодействие с Three.js.
    *   *Назначение:* "Мозг" игры. Отвечает за поведение персонажей, механики, события.
*   **Three.js:** Библиотека для создания и отображения 3D-графики в браузере.
    *   *Назначение:* Рендеринг 3D-сцены, управление камерой, освещением, создание и загрузка 3D-моделей, материалов, текстур.

---

## 🧪 Инструкции по Сборке и Запуску

Поскольку проект использует только клиентские технологии (HTML, CSS, JS) и не требует Node.js или специальных сборщиков, процесс "сборки" и запуска очень прост.

1.  **Создайте структуру проекта:**
    Создайте на вашем компьютере папку для проекта, например, `caravan_robbery_saga`. Внутри нее создайте файл `index.html` и папку `js`.

2.  **Создайте `index.html`:**
    Скопируйте и вставьте следующий код в файл `index.html`:
    ```html
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Разграбление Корованов: Сага Четырех Зон</title>
        <style>
            body { margin: 0; overflow: hidden; background-color: #333; color: white; font-family: Arial, sans-serif; }
            canvas { display: block; }
            #ui-container { position: absolute; top: 10px; left: 10px; padding: 10px; background-color: rgba(0,0,0,0.5); border-radius: 5px; }
            #ui-container p, #ui-container button { margin: 5px 0; }
            .eye-patch { position: absolute; top: 0; width: 50%; height: 100%; background-color: rgba(0,0,0,0.85); display: none; pointer-events: none; z-index: 1000; }
            #eye-patch-left { left: 0; }
            #eye-patch-right { right: 0; }
        </style>
    </head>
    <body>
        <div id="ui-container">
            <h3>Статус Игрока</h3>
            <p>Фракция: <span id="player-faction">Не выбрана</span></p>
            <p>Здоровье: <span id="player-health">100</span></p>
            <p>Золото: <span id="player-gold">0</span></p>
            <button id="save-game">Сохранить</button>
            <button id="load-game">Загрузить</button>
        </div>

        <div id="eye-patch-left" class="eye-patch"></div>
        <div id="eye-patch-right" class="eye-patch"></div>

        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
        <!-- В будущем здесь будут ваши JS файлы -->
        <!-- <script src="js/utils.js"></script> -->
        <!-- <script src="js/assets.js"></script> -->
        <!-- <script src="js/player.js"></script> -->
        <!-- <script src="js/world.js"></script> -->
        <!-- <script src="js/combat.js"></script> -->
        <!-- <script src="js/ui.js"></script> -->
        <script src="js/main.js"></script> 
    </body>
    </html>
    ```

3.  **Создайте `js/main.js` (стартовый файл логики):**
    В папке `js` создайте файл `main.js` и добавьте в него следующий базовый код для инициализации Three.js:
    ```javascript
    // js/main.js

    // Базовая сцена Three.js
    let scene, camera, renderer;
    let playerMesh; // Placeholder для меша игрока

    function init() {
        // Сцена
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87CEEB); // Небесно-голубой фон

        // Камера
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 10); // Начальная позиция камеры
        camera.lookAt(0, 0, 0);

        // Рендерер
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true; // Включаем тени
        document.body.appendChild(renderer.domElement);

        // Освещение
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        // Плоскость земли (простая)
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x556B2F }); // DarkOliveGreen
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2; // Поворачиваем, чтобы была горизонтальной
        ground.receiveShadow = true;
        scene.add(ground);

        // Пример процедурного ассета: простое дерево
        const tree = createProceduralTree(new THREE.Vector3(5, 0, -5));
        scene.add(tree);

        // Пример загрузки текстуры для будущего использования (например, для корована)
        // const woodTexture = new THREE.TextureLoader().load('https://dummyimage.com/128x128/8B4513/fff.png&text=Wood');

        // Инициализация UI и игровых систем (заглушки)
        updateUI();
        setupEventListeners();

        // Запуск игрового цикла
        animate();
    }

    // Функция для создания процедурного дерева (пример)
    function createProceduralTree(position) {
        const treeGroup = new THREE.Group();

        const trunkHeight = Math.random() * 2 + 3; // 3-5
        const trunkRadius = Math.random() * 0.2 + 0.3; // 0.3-0.5
        const foliageRadius = Math.random() * 1 + 1.5; // 1.5-2.5

        // Используем URL для генерации текстур на лету
        const barkTextureUrl = `https://dummyimage.com/64x128/8B4513/5C3317.png&text=Bark`;
        const leavesTextureUrl = `https://dummyimage.com/128x128/228B22/006400.png&text=Leaves`;

        const barkTexture = new THREE.TextureLoader().load(barkTextureUrl);
        const leavesTexture = new THREE.TextureLoader().load(leavesTextureUrl);

        const trunkMaterial = new THREE.MeshLambertMaterial({ map: barkTexture });
        const foliageMaterial = new THREE.MeshLambertMaterial({ map: leavesTexture });

        const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 8);
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = trunkHeight / 2;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        const foliageGeometry = new THREE.SphereGeometry(foliageRadius, 8, 6);
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.y = trunkHeight + foliageRadius * 0.6;
        foliage.castShadow = true;
        treeGroup.add(foliage);
        
        treeGroup.position.copy(position);
        return treeGroup;
    }
    
    // Функция для создания простого меша персонажа (заглушка)
    function createPlayerMesh() {
        const geometry = new THREE.CapsuleGeometry(0.5, 1.0, 4, 8); // Требует Three.js r128+
        // Для более старых версий Three.js: const geometry = new THREE.CylinderGeometry(0.5, 0.5, 2.0, 8);
        const material = new THREE.MeshLambertMaterial({ color: 0x0077ff });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.position.y = 1.0; // Поднять капсулу так, чтобы низ был на y=0
        return mesh;
    }

    // Обновление UI (заглушка)
    function updateUI() {
        document.getElementById('player-faction').textContent = "Лесной Эльф (Пример)";
        document.getElementById('player-health').textContent = "100";
        document.getElementById('player-gold').textContent = "50";
    }
    
    // Обработчики событий (заглушки для сохранения/загрузки)
    function setupEventListeners() {
        document.getElementById('save-game').addEventListener('click', () => {
            // Логика сохранения (используйте localStorage)
            // const gameState = { /* ... */ };
            // localStorage.setItem('kirillsCaravanSagaSave', JSON.stringify(gameState));
            alert('Игра сохранена! (Заглушка)');
        });
        document.getElementById('load-game').addEventListener('click', () => {
            // Логика загрузки
            // const savedState = JSON.parse(localStorage.getItem('kirillsCaravanSagaSave'));
            // if (savedState) { /* ... */ }
            alert('Игра загружена! (Заглушка)');
        });
        
        // Обработка изменения размера окна
        window.addEventListener('resize', onWindowResize, false);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Игровой цикл
    function animate() {
        requestAnimationFrame(animate);
        // Здесь будет логика обновления игры (движение, AI, физика и т.д.)
        // playerMesh.rotation.y += 0.01; // Пример анимации
        renderer.render(scene, camera);
    }

    // Запуск инициализации
    init();
    ```

4.  **Запуск Игры:**
    Просто откройте файл `index.html` в вашем любимом современном веб-браузере (Chrome, Firefox, Edge, Safari).

5.  **Развертывание (Deployment):**
    Поскольку это статический сайт, вы можете разместить папку с проектом (`caravan_robbery_saga` со всеми файлами) на любом хостинге статических сайтов, таком как GitHub Pages, Netlify, Vercel, или на вашем собственном веб-сервере.

---

## 🧾 Заметки для Разработчиков

*   **Мечта Кирилла:** Помните, эта игра – воплощение мечты, которую Кирилл вынашивал **джва года**. Особое внимание уделите механике **грабежа корованов**!
*   **Ассеты:** Все визуальные и звуковые ассеты должны быть либо процедурно сгенерированы кодом (см. `createProceduralTree` в примере), либо загружаться по URL из веб-источников. **Никаких локальных файлов ассетов в репозитории!**
    *   Для текстур можно использовать сервисы типа `dummyimage.com` или `via.placeholder.com` для быстрого прототипирования:
        *   `https://dummyimage.com/128x128/8B4513/fff.png&text=Дерево`
        *   `https://dummyimage.com/256x256/A0522D/000.png&text=Кожа`
    *   Для 3D-моделей ищите бесплатные модели в форматах GLTF/GLB, которые можно загружать по URL с помощью `THREE.GLTFLoader`.
*   **Модульность Кода:** По мере роста проекта разделяйте JavaScript код на модули (файлы), как закомментировано в `index.html` (`player.js`, `world.js`, `combat.js` и т.д.), для лучшей организации. Вы можете использовать нативные ES6 модули (`<script type="module" src="js/main.js">` и `import/export` в JS файлах), но это потребует запуска через локальный веб-сервер для корректной работы (многие браузеры не загружают ES6 модули через `file://` протокол). Простейший способ запустить локальный сервер без Node.js - это использовать расширения для VS Code (например, "Live Server") или Python (`python -m http.server`).
*   **LOD для Деревьев:** Реализуйте систему Level of Detail (LOD) для деревьев. Дальние деревья – `THREE.Sprite` с 2D текстурой. Ближние – полноценные 3D модели. Переключайте их видимость в зависимости от расстояния до камеры.
*   **Система Ранений:** Продумайте, как состояние частей тела (`player.bodyParts.leftArm.hp`) будет влиять на геймплей и как будут отображаться визуальные эффекты (например, затемнение части экрана для потерянного глаза через CSS оверлей).
*   **Сохранение:** Используйте `localStorage` для сохранения состояния игры. Храните ключевые переменные: позицию игрока, здоровье, инвентарь, состояние мира, квесты.
*   **Оптимизация:** Следите за производительностью. Three.js может быть требовательным. Оптимизируйте количество полигонов, используйте инстансинг для множества одинаковых объектов (например, деревьев одного типа), запекайте освещение, если это возможно для статичных частей сцены.
*   **ИИ (AI):** Начните с простого ИИ для врагов (патрулирование, атака при обнаружении) и охраны корованов.
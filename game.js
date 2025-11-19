class Program {
    // ИЗМЕНЕНИЕ 1: Берем размеры окна браузера, а не жесткие цифры
    static width = window.innerWidth-20;
    static height = window.innerHeight-20;
    
    static gEngine = null;
    static engine = null;
    
    // ИЗМЕНЕНИЕ 2: Позицию игрока ставим в центр экрана при старте
    static xpos = window.innerWidth / 2;
    static ypos = window.innerHeight / 2;
    
    static hp = 100;
    static npcs = [];
    static healthKit = null;
    static healthKitz = null;

    // --- ID текущего цикла анимации ---
    static frameId = 0;

    // --- МОБИЛЬНОЕ УПРАВЛЕНИЕ: ФЛАГИ ---
    static mobile_up = false;
    static mobile_down = false;
    static mobile_left = false;
    static mobile_right = false;
    static mobile_attack = false;
    static attackButton = null;
    static mobileButtons = [];

    // --- СТАТИЧЕСКИЕ ПЕРЕМЕННЫЕ АНИМАЦИИ И СОСТОЯНИЯ ---
    static playerHand = null;
    static handLastHitTime = 0;
    static handLastAttackTime = 0;
    static HAND_HIT_DURATION = 150;

    static handWalkOffset = 0;
    static isWalking = false;
    static lastMonsterAttackTime = 0;
    static MONSTER_ATTACK_DELAY = 1000;
    static isGameOver = false;

    static handState = 'idle';
    static handTargetX = 0;
    static handTargetY = 0;
    static handAnimSpeed = 0.2;
    static handBaseOffsetX = -20;
    static handBaseOffsetY = 50;
    static minAtackDistance = 15;
    static maxAtackDistance = 30;
    static player_texture = [
        "res/player/hand_base.png",
        "res/player/anim1.png",
        "res/player/anim2.png"
    ]
    // --- СИСТЕМА УРОВНЕЙ СЛОЖНОСТИ ---
    static difficultyLevels = [
        { name: "EASY", multiplier: 0.8 },
        { name: "NORMAL", multiplier: 1.0 },
        { name: "HARD", multiplier: 1.5 }
    ];
    static currentDifficulty = 1;

    // --- СИСТЕМА ИГРОВЫХ ЭТАПОВ ---
    static GAME_STAGES = [
        { name: "1", initialMonsters: 3, allowedTypes: ["Mummy_Base"] },
        { name: "2", initialMonsters: 6, allowedTypes: ["Mummy_Base", "Mummy_Damage"] },
        { name: "3", initialMonsters: 8, allowedTypes: ["Mummy_Base", "Mummy_Tank"] },
        { name: "4", initialMonsters: 10, allowedTypes: ["Mummy_Base", "Mummy_Speed"] },
        { name: "5", initialMonsters: 12, allowedTypes: ["Mummy_Base", "Mummy_Damage", "Mummy_Tank", "Mummy_Speed"] },
    ];
    static currentStage = 0;

    // --- СИСТЕМА ТИПОВ МОНСТРОВ ---
    static monsterTypes = [
        { name: "Mummy_Base", hp: 50, damage: 10, speed: 1.5, texture: "res/monsters/mum.png", hand_texture: "res/monsters/heds/mum_h.png", chance: 50 },
        { name: "Mummy_Damage", hp: 40, damage: 25, speed: 1.2, texture: "res/monsters/mum_d.png", hand_texture: "res/monsters/heds/mum_h.png", chance: 20 },
        { name: "Mummy_Tank", hp: 150, damage: 8, speed: 1.0, texture: "res/monsters/mum_t.png", hand_texture: "res/monsters/heds/mum_h.png", chance: 20 },
        { name: "Mummy_Speed", hp: 45, damage: 10, speed: 2.5, texture: "res/monsters/mum_s.png", hand_texture: "res/monsters/heds/mum_h.png", chance: 10 },
    ];

    static font = null;
    static rnd = {
        Next: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
    };

    // --- ОСНОВНОЕ МЕНЮ ---
    static MainMenu() {
        Program.frameId++;
        const currentFrameId = Program.frameId;

        Program.gEngine.objects.length = 0;
        
        // Фон меню на весь экран
        const menu = new GnuEngenSFML.D2Gun();
        menu.x = 0;
        menu.y = 0;
        menu.sx = Program.width;
        menu.sy = Program.height;
        menu.texture = new Image();
        menu.texture.src = "res/menu/menu_gl_fone.jpg";
        menu.type = GnuEngenSFML.ObjectType.Sprite;

        // Кнопки центрируем по горизонтали и выравниваем по вертикали
        const centerX = Program.width / 2;
        const centerY = Program.height / 2;

        const buton_play_exit = new GnuEngenSFML.D2Gun();
        buton_play_exit.sx = 107 * 1.5; // Чуть увеличим для удобства
        buton_play_exit.sy = 43 * 1.5;
        buton_play_exit.x = centerX - (buton_play_exit.sx / 2); // Центрирование
        buton_play_exit.y = centerY - 50;
        buton_play_exit.texture = new Image();
        buton_play_exit.texture.src = "res/menu/button_play_gl_fone.png";
        buton_play_exit.type = GnuEngenSFML.ObjectType.Button;
        buton_play_exit.onClick = () => Program.StageSelectMenu();

        const buton_menu_exit = new GnuEngenSFML.D2Gun();
        buton_menu_exit.sx = 130 * 1.5;
        buton_menu_exit.sy = 54 * 1.5;
        buton_menu_exit.x = centerX - (buton_menu_exit.sx / 2); // Центрирование
        buton_menu_exit.y = centerY + 50;
        buton_menu_exit.texture = new Image();
        buton_menu_exit.texture.src = "res/menu/button_exit_gl_fone.png";
        buton_menu_exit.type = GnuEngenSFML.ObjectType.Button;
        buton_menu_exit.onClick = () => window.close();

        Program.gEngine.AddObject(menu);
        Program.gEngine.AddObject(buton_menu_exit);
        Program.gEngine.AddObject(buton_play_exit);

        const loop = () => {
            if (Program.frameId !== currentFrameId) return;
            Program.gEngine.Draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    // --- МЕНЮ ВЫБОРА ЭТАПА ---
    static StageSelectMenu() {
        Program.frameId++;
        const currentFrameId = Program.frameId;

        Program.gEngine.objects.length = 0;
        const menu = new GnuEngenSFML.D2Gun();
        menu.x = 0;
        menu.y = 0;
        menu.sx = Program.width;
        menu.sy = Program.height;
        menu.texture = new Image();
        menu.texture.src = "res/fon/bs.png";
        menu.type = GnuEngenSFML.ObjectType.Sprite;
        Program.gEngine.AddObject(menu);
        
        let yOffset = Program.height * 0.2; // Начинаем с 20% высоты экрана
        let xOffset = 50;

        Program.GAME_STAGES.forEach((stage, index) => {
            const button = new GnuEngenSFML.D2Gun();
            button.x = xOffset;
            button.y = yOffset;
            button.sx = 50;
            button.sy = 50;
            button.type = GnuEngenSFML.ObjectType.TextButton;
            button.text = stage.name;
            button.text_color = 0x111111;
            button.font = Program.font;
            button.base_color = 0xe7eb10;
            button.isActive_color = 0xc6c900;

            button.onClick = () => {
                Program.currentStage = index;
                if (index === 0) {
                    Program.currentDifficulty = 0;
                    Program.StartGame();
                } else {
                    Program.DifficultySelectMenu();
                }
            };

            Program.gEngine.AddObject(button);
            xOffset += 70;
            // Если кнопки выходят за ширину экрана, переносим на след. строку
            if (xOffset > Program.width - 70) {
                xOffset = 50;
                yOffset += 70;
            }
        });

        const loop = () => {
            if (Program.frameId !== currentFrameId) return;
            Program.gEngine.Draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    // --- МЕНЮ ВЫБОРА СЛОЖНОСТИ ---
    static DifficultySelectMenu() {
        Program.frameId++;
        const currentFrameId = Program.frameId;

        Program.gEngine.objects.length = 0;
        const menu = new GnuEngenSFML.D2Gun();
        menu.x = 0;
        menu.y = 0;
        menu.sx = Program.width;
        menu.sy = Program.height;
        menu.texture = new Image();
        menu.texture.src = "res/fon/bs.png";
        menu.type = GnuEngenSFML.ObjectType.Sprite;
        Program.gEngine.AddObject(menu);

        const centerX = Program.width / 2;

        const menuTitle = new GnuEngenSFML.D2Gun();
        menuTitle.x = centerX - 150;
        menuTitle.y = 100;
        menuTitle.type = GnuEngenSFML.ObjectType.Text;
        menuTitle.text = `${Program.GAME_STAGES[Program.currentStage].name}: Select Difficulty`;
        menuTitle.font = Program.font;
        menuTitle.base_color = 0x000000;
        Program.gEngine.AddObject(menuTitle);

        let yOffset = 200;

        Program.difficultyLevels.forEach((level, index) => {
            const button = new GnuEngenSFML.D2Gun();
            button.sx = 150;
            button.sy = 50;
            button.x = centerX - (button.sx / 2); // Центрирование
            button.y = yOffset;
            
            button.type = GnuEngenSFML.ObjectType.TextButton;
            button.text = level.name;
            button.font = Program.font;
            button.base_color = 0xe7eb10;
            button.text_color = 0x111111;
            button.isActive_color = 0xc6c900;

            button.onClick = () => {
                Program.currentDifficulty = index;
                Program.StartGame();
            };

            Program.gEngine.AddObject(button);
            yOffset += 70;
        });

        const loop = () => {
            if (Program.frameId !== currentFrameId) return;
            Program.gEngine.Draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    // --- ЭКРАН ПОБЕДЫ ---
    static WinScreen() {
        if (Program.isGameOver) return;
        Program.isGameOver = true;

        // Добавим затемнение фона
        const winBg = new GnuEngenSFML.D2Gun();
        winBg.x = 0; winBg.y = 0; 
        winBg.sx = Program.width; winBg.sy = Program.height;
        winBg.type = GnuEngenSFML.ObjectType.Rect;
        winBg.fill_color = 0x000000; winBg.alpha = 0.7;
        Program.gEngine.AddObject(winBg);

        const centerX = Program.width / 2;
        const centerY = Program.height / 2;

        const winText = new GnuEngenSFML.D2Gun();
        winText.x = centerX - 100;
        winText.y = centerY - 50;
        winText.type = GnuEngenSFML.ObjectType.Text;
        winText.text = "STAGE COMPLETE!";
        winText.font = Program.font;
        winText.base_color = 0x00AA00;
        Program.gEngine.AddObject(winText);

        const isLastStage = Program.currentStage === Program.GAME_STAGES.length - 1;

        const nextStageButton = new GnuEngenSFML.D2Gun();
        nextStageButton.sx = 150;
        nextStageButton.sy = 50;
        nextStageButton.x = centerX - (nextStageButton.sx / 2);
        nextStageButton.y = centerY + 20;
        
        nextStageButton.text_color = 0x111111;
        nextStageButton.type = GnuEngenSFML.ObjectType.TextButton;
        nextStageButton.text = isLastStage ? "MENU" : "NEXT STAGE";
        nextStageButton.font = Program.font;
        nextStageButton.base_color = 0xFFFFFF;
        nextStageButton.fill_color = 0x008000;

        nextStageButton.onClick = () => {
            if (isLastStage) {
                Program.MainMenu();
            } else {
                Program.currentStage += 1;
                Program.isGameOver = false;
                Program.DifficultySelectMenu();
            }
        };

        Program.gEngine.AddObject(nextStageButton);
        Program.gEngine.Draw();
    }

    // --- ПРОВЕРКА ЗАВЕРШЕНИЯ ЭТАПА ---
    static CheckStageCompletion() {
        if (Program.npcs.length === 0) {
            Program.WinScreen();
        }
    }

    // --- ЗАПУСК ИГРЫ ---
    static StartGame() {
        Program.frameId++;
        const currentFrameId = Program.frameId;

        Program.gEngine.objects.length = 0;
        Program.npcs.length = 0;
        Program.mobileButtons.length = 0;
        Program.hp = 100;
        // Игрок по центру текущего экрана
        Program.xpos = Program.width / 2;
        Program.ypos = Program.height / 2;
        Program.isGameOver = false;
        Program.mobile_attack = false;
        Program.handState = 'idle';

        // --- 1. СОЗДАНИЕ ВСЕХ ИГРОВЫХ ОБЪЕКТОВ ---

        const bg = new GnuEngenSFML.D2Gun();
        bg.x = 0;
        bg.y = 0;
        bg.sx = Program.width;
        bg.sy = Program.height;
        bg.texture = new Image();
        bg.texture.src = "res/fon/bs.png";
        bg.type = GnuEngenSFML.ObjectType.Sprite;

        const player = new GnuEngenSFML.D2Gun();
        player.x = Program.xpos;
        player.y = Program.ypos;
        player.sx = 100;
        player.sy = 100;
        player.texture = new Image();
        player.texture.src = Program.player_texture[1];
        player.type = GnuEngenSFML.ObjectType.Sprite;

        const hpText = new GnuEngenSFML.D2Gun();
        hpText.x = 20; // Чуть отступим от края
        hpText.y = 40;
        hpText.type = GnuEngenSFML.ObjectType.Text;
        hpText.text = `HP: ${Program.hp}`;
        hpText.font = Program.font;
        hpText.base_color = 0xFF0000;

        // Предметы спавним в пределах экрана (с небольшим отступом)
        const safeW = Program.width - 100;
        const safeH = Program.height - 100;

        Program.healthKit = new GnuEngenSFML.D2Gun();
        Program.healthKit.x = Program.rnd.Next(50, safeW);
        Program.healthKit.y = Program.rnd.Next(50, safeH);
        Program.healthKit.sx = 50;
        Program.healthKit.sy = 50;
        Program.healthKit.texture = new Image();
        Program.healthKit.texture.src = "res/item/+HP.png";
        Program.healthKit.type = GnuEngenSFML.ObjectType.Sprite;

        Program.healthKitz = new GnuEngenSFML.D2Gun();
        Program.healthKitz.x = Program.rnd.Next(50, safeW);
        Program.healthKitz.y = Program.rnd.Next(50, safeH);
        Program.healthKitz.sx = 50;
        Program.healthKitz.sy = 50;
        Program.healthKitz.texture = new Image();
        Program.healthKitz.texture.src = "res/item/-HP.png";
        Program.healthKitz.type = GnuEngenSFML.ObjectType.Sprite;

        Program.playerHand = new GnuEngenSFML.D2Gun();
        Program.playerHand.x = Program.xpos + Program.handBaseOffsetX;
        Program.playerHand.y = Program.ypos + Program.handBaseOffsetY;
        Program.playerHand.sx = 50;
        Program.playerHand.sy = 50;
        Program.playerHand.texture = new Image();
        Program.playerHand.texture.src = Program.player_texture[0];
        Program.playerHand.type = GnuEngenSFML.ObjectType.Sprite;

        // --- СОЗДАНИЕ МОНСТРОВ ---
        const stageData = Program.GAME_STAGES[Program.currentStage];
        const totalMonsterCount = stageData.initialMonsters;

        for (let i = 0; i < totalMonsterCount; i++) {
            // Спавн монстров тоже адаптируем под размер экрана
            Program.SpawnNewMonster(Program.rnd.Next(50, safeW), Program.rnd.Next(50, safeH));
        }

        // --- 2. СОЗДАНИЕ КНОПОК МОБИЛЬНОГО УПРАВЛЕНИЯ ---
        // Используем относительные координаты (от нижнего левого и правого углов)
        const buttonSize = 60; // Чуть побольше для пальцев
        const padding = 20;
        
        // WASD: Левый нижний угол
        const cornerX = 50;
        const cornerY = Program.height - buttonSize - padding - 50; // Отступаем снизу
        const inactiveTextColor = 0xAAAAAA;
        
        const createMoveButton = (x, y, text, flagName) => {
            const button = new GnuEngenSFML.D2Gun();
            button.x = x;
            button.y = y;
            button.sx = buttonSize;
            button.sy = buttonSize;
            button.type = GnuEngenSFML.ObjectType.TextButton;
            button.text = text;
            button.font = Program.font;
            button.base_color = inactiveTextColor;
            button.fill_color = 0x555555;
            
            button.onClick = () => {
                Program[flagName] = true;
                button.fill_color = 0x00FF00; 
            };

            Program.mobileButtons.push(button);
        };

        const wasdY = cornerY - buttonSize;
        const wasdX = cornerX;

        createMoveButton(wasdX + buttonSize + 10, wasdY, "W", 'mobile_up');
        createMoveButton(wasdX + buttonSize + 10, wasdY + buttonSize + 10, "S", 'mobile_down');
        createMoveButton(wasdX, wasdY + buttonSize + 10, "A", 'mobile_left');
        createMoveButton(wasdX + 2 * (buttonSize + 10), wasdY + buttonSize + 10, "D", 'mobile_right');

        // АТАКА: Правый нижний угол
        Program.attackButton = new GnuEngenSFML.D2Gun();
        Program.attackButton.sx = 90;
        Program.attackButton.sy = 90;
        Program.attackButton.x = Program.width - Program.attackButton.sx - padding - 20; // Привязка к правой стороне
        Program.attackButton.y = Program.height - Program.attackButton.sy - padding - 20; // Привязка к низу
        Program.attackButton.type = GnuEngenSFML.ObjectType.TextButton;
        Program.attackButton.text = "E";
        Program.attackButton.font = Program.font;
        Program.attackButton.base_color = 0x000000;
        Program.attackButton.fill_color = 0x800000;

        Program.attackButton.onClick = () => {
            Program.mobile_attack = true;
            Program.attackButton.fill_color = 0xFF0000;
        };

        // --- 3. ДОБАВЛЕНИЕ В ДВИЖОК ---
        Program.gEngine.AddObject(bg);
        for (const monster of Program.npcs) Program.gEngine.AddObject(monster);
        Program.gEngine.AddObject(Program.healthKit);
        Program.gEngine.AddObject(Program.healthKitz);
        Program.gEngine.AddObject(player);
        Program.gEngine.AddObject(Program.playerHand);
        for (const button of Program.mobileButtons) Program.gEngine.AddObject(button);
        Program.gEngine.AddObject(Program.attackButton);
        Program.gEngine.AddObject(hpText);

        // --- 4. ИГРОВОЙ ЦИКЛ ---
        const gameLoop = () => {
            if (Program.frameId !== currentFrameId) return;

            if (Program.isGameOver) {
                Program.gEngine.Draw();
                requestAnimationFrame(gameLoop);
                return;
            }

            // --- ДВИЖЕНИЕ ИГРОКА ---
            Program.isWalking = false;
            if (Keyboard.isKeyPressed('W') || Program.mobile_up) {
                Program.ypos -= 2;
                Program.isWalking = true;
            }
            if (Keyboard.isKeyPressed('S') || Program.mobile_down) {
                Program.ypos += 2;
                Program.isWalking = true;
            }
            if (Keyboard.isKeyPressed('A') || Program.mobile_left) {
                Program.xpos -= 2;
                Program.isWalking = true;
            }
            if (Keyboard.isKeyPressed('D') || Program.mobile_right) {
                Program.xpos += 2;
                Program.isWalking = true;
            }

            // Ограничение игрока экраном
            if(Program.xpos < 0) Program.xpos = 0;
            if(Program.ypos < 0) Program.ypos = 0;
            if(Program.xpos > Program.width - 100) Program.xpos = Program.width - 100;
            if(Program.ypos > Program.height - 100) Program.ypos = Program.height - 100;

            player.x = Program.xpos;
            player.y = Program.ypos;

            const now = Date.now();
            const canMonstersAttack = (now - Program.lastMonsterAttackTime) >= Program.MONSTER_ATTACK_DELAY;

            Program.AnimatePlayerHand(now, player);

            // --- ЛОГИКА МОНСТРОВ ---
            for (let i = Program.npcs.length - 1; i >= 0; i--) {
                const monster = Program.npcs[i];
                const dx = Program.xpos - monster.x;
                const dy = Program.ypos - monster.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 0) {
                    monster.x += (dx / distance) * monster.speed;
                    monster.y += (dy / distance) * monster.speed;
                }

                if (canMonstersAttack) {
                    const playerRect = new GnuEngenSFML.FloatRect(player.x, player.y, player.sx, player.sy);
                    const npcRect = new GnuEngenSFML.FloatRect(monster.x, monster.y, monster.sx, monster.sy);
                    if (playerRect.intersects(npcRect)) {
                        Program.hp -= monster.damage;
                        if (Program.hp < 0) Program.hp = 0;
                        Program.handState = 'hit';
                        Program.handLastHitTime = now;
                    }
                }
            }

            if (canMonstersAttack) Program.lastMonsterAttackTime = now;
            if (Program.hp <= 0) {
                Program.GameOver();
                return;
            }

            // --- ЛОГИКА АПТЕЧЕК --- 
            const playerHitBox = new GnuEngenSFML.FloatRect(player.x - 10, player.y - 10, player.sx + 20, player.sy + 20);
            const safeW = Program.width - 100;
            const safeH = Program.height - 100;

            if (new GnuEngenSFML.FloatRect(Program.healthKit.x, Program.healthKit.y, Program.healthKit.sx, Program.healthKit.sy).intersects(playerHitBox)) {
                Program.hp += 50;
                Program.healthKit.x = Program.rnd.Next(50, safeW);
                Program.healthKit.y = Program.rnd.Next(50, safeH);
            }
            if (new GnuEngenSFML.FloatRect(Program.healthKitz.x, Program.healthKitz.y, Program.healthKitz.sx, Program.healthKitz.sy).intersects(playerHitBox)) {
                Program.hp -= 20;
                Program.healthKitz.x = Program.rnd.Next(50, safeW);
                Program.healthKitz.y = Program.rnd.Next(50, safeH);
            }

            // --- ЛОГИКА АТАКИ ---
            const isAttackingNow = Keyboard.isKeyPressed('E') || Program.mobile_attack;
            const isHandBusy = (Program.handState === 'attack' || Program.handState === 'hit');

            if (isAttackingNow && !isHandBusy) {
                player.texture.src = Program.player_texture[2];
                if (Keyboard.isKeyPressed('E') || Program.mobile_attack) {
                    let targetMonster = null;
                    let minDistance = Infinity;

                    for (let i = Program.npcs.length - 1; i >= 0; i--) {
                        const monster = Program.npcs[i];
                        if (new GnuEngenSFML.FloatRect(player.x - 10, player.y - 10, player.sx + 20, player.sy + 20).intersects(new GnuEngenSFML.FloatRect(monster.x, monster.y, monster.sx, monster.sy))) {
                            const dist = Math.sqrt(Math.pow(monster.x - player.x, 2) + Math.pow(monster.y - player.y, 2));
                            if (dist < minDistance) {
                                minDistance = dist;
                                targetMonster = monster;
                            }
                            monster.currentHP -= Program.rnd.Next(this.minAtackDistance, this.maxAtackDistance);
                            if (monster.currentHP <= 0) {
                                const oldX = monster.x; const oldY = monster.y;
                                Program.gEngine.DeleteObject(monster);
                                Program.npcs.splice(i, 1);
                                if (Program.rnd.Next(1, 100) <= 25) Program.SpawnNewMonster(oldX, oldY);
                                if (Program.npcs.length === 0) {
                                    Program.CheckStageCompletion();
                                    return;
                                }
                            }
                        }
                    }
                    if (targetMonster) {
                        Program.handState = 'attack';
                        Program.handTargetX = targetMonster.x + targetMonster.sx / 2;
                        Program.handTargetY = targetMonster.y + targetMonster.sy / 2;
                        Program.handLastAttackTime = now;
                    }
                }
            } else {
                player.texture.src = Program.player_texture[1];
            }

            hpText.text = `HP: ${Program.hp}`;

            // --- СБРОС ФЛАГОВ ПЕРЕД ОТРИСОВКОЙ ---
            Program.mobile_up = false;
            Program.mobile_down = false;
            Program.mobile_left = false;
            Program.mobile_right = false;
            Program.mobile_attack = false;

            Program.mobileButtons.forEach(btn => btn.fill_color = 0x555555);
            Program.attackButton.fill_color = 0x800000;

            Program.gEngine.Draw();
            requestAnimationFrame(gameLoop);
        };
        requestAnimationFrame(gameLoop);
    }

    // --- СПАВН НОВОГО МОНСТРА ---
    static SpawnNewMonster(x = null, y = null) {
        const safeW = Program.width - 100;
        const safeH = Program.height - 100;
        
        if (x === null) x = Program.rnd.Next(50, safeW);
        if (y === null) y = Program.rnd.Next(50, safeH);

        const stageData = Program.GAME_STAGES[Program.currentStage];
        const difficultyData = Program.difficultyLevels[Program.currentDifficulty];
        const allowedTypes = Program.monsterTypes.filter(type => stageData.allowedTypes.includes(type.name));
        if (allowedTypes.length === 0) return;

        let totalChance = allowedTypes.reduce((sum, type) => sum + type.chance, 0);
        let rand = Program.rnd.Next(1, totalChance);
        let selectedType = allowedTypes[0];
        let cumulativeChance = 0;
        for (const type of allowedTypes) {
            cumulativeChance += type.chance;
            if (rand <= cumulativeChance) { selectedType = type; break; }
        }

        const monster = new GnuEngenSFML.D2Gun();
        monster.x = x; monster.y = y; monster.sx = 80; monster.sy = 80;
        monster.texture = new Image(); monster.texture.src = selectedType.texture;
        monster.type = GnuEngenSFML.ObjectType.Sprite;
        monster.monsterType = selectedType;
        monster.currentHP = selectedType.hp * difficultyData.multiplier;
        monster.damage = selectedType.damage * difficultyData.multiplier;
        monster.speed = selectedType.speed * difficultyData.multiplier;

        Program.npcs.push(monster);
        Program.gEngine.AddObject(monster);
    }

    // --- АНИМАЦИЯ РУКИ ИГРОКА ---
    static AnimatePlayerHand(now, player) {
        const hand = Program.playerHand;
        if (!hand) return;
        let targetX = Program.xpos + Program.handBaseOffsetX;
        let targetY = Program.ypos + Program.handBaseOffsetY;

        if (Program.handState !== 'attack' && Program.handState !== 'hit') {
            if (Program.isWalking) {
                Program.handState = 'walk';
                Program.handWalkOffset = Math.sin(now / 150) * 5;
                targetY += Program.handWalkOffset;
            } else {
                Program.handState = 'idle';
            }
        }
        if (Program.handState === 'attack') {
            if ((now - Program.handLastAttackTime) < Program.HAND_HIT_DURATION) {
                targetX = Program.handTargetX - hand.sx / 2;
                targetY = Program.handTargetY - hand.sy / 2;
            } else { Program.handState = Program.isWalking ? 'walk' : 'idle'; }
        }
        if (Program.handState === 'hit') {
            if ((now - Program.handLastHitTime) < Program.HAND_HIT_DURATION) {
                targetX = Program.xpos + Program.handBaseOffsetX - 50;
                targetY = Program.ypos + Program.handBaseOffsetY;
            } else { Program.handState = Program.isWalking ? 'walk' : 'idle'; }
        }
        hand.x += (targetX - hand.x) * Program.handAnimSpeed;
        hand.y += (targetY - hand.y) * Program.handAnimSpeed;
    }

    // --- КОНЕЦ ИГРЫ ---
    static GameOver() {
        if (Program.isGameOver) return;
        Program.isGameOver = true;
        
        // Затемнение
        const gameOverBg = new GnuEngenSFML.D2Gun();
        gameOverBg.x = 0; gameOverBg.y = 0; 
        gameOverBg.sx = Program.width; gameOverBg.sy = Program.height;
        gameOverBg.type = GnuEngenSFML.ObjectType.Rect;
        gameOverBg.fill_color = 0x000000; gameOverBg.alpha = 0.7;
        Program.gEngine.AddObject(gameOverBg);

        const centerX = Program.width / 2;
        const centerY = Program.height / 2;

        const gameOverText = new GnuEngenSFML.D2Gun();
        gameOverText.x = centerX - 100;
        gameOverText.y = centerY - 50;
        gameOverText.type = GnuEngenSFML.ObjectType.Text;
        gameOverText.text = "GAME OVER";
        gameOverText.font = Program.font;
        gameOverText.base_color = 0xFF0000;
        Program.gEngine.AddObject(gameOverText);

        const restartButton = new GnuEngenSFML.D2Gun();
        restartButton.sx = 100;
        restartButton.sy = 50;
        restartButton.x = centerX - (restartButton.sx / 2);
        restartButton.y = centerY + 20;
        
        restartButton.type = GnuEngenSFML.ObjectType.TextButton;
        restartButton.text = "MENU";
        restartButton.font = Program.font;
        restartButton.text_color = 0x111111;
        restartButton.base_color = 0xFFFFFF;
        restartButton.fill_color = 0x808080;
        restartButton.onClick = () => Program.MainMenu();

        Program.gEngine.AddObject(restartButton);
        Program.gEngine.Draw();
    }

    // ИЗМЕНЕНИЕ 4: Добавляем слушатель изменения размера окна
    static HandleResize() {
        Program.width = window.innerWidth;
        Program.height = window.innerHeight;
        
        // Пытаемся обновить размер канваса в движке, если он доступен
        if (Program.gEngine && Program.gEngine.window) {
            const canvas = Program.gEngine.window.canvas;
            if (canvas) {
                canvas.width = Program.width;
                canvas.height = Program.height;
            }
            Program.gEngine.window.width = Program.width;
            Program.gEngine.window.height = Program.height;
        }
    }

    static async Main() {
        // Регистрируем событие изменения окна
        window.addEventListener('resize', Program.HandleResize);
        
        Program.engine = new GameEngine();
        Program.gEngine = new GnuEngenSFML();
        await Program.gEngine.InitWindow(Program.width, Program.height, "PEngine Intro + Game");

        try {
            const fontName = 'VisitorFont';
            const fontUrl = 'res/visitor1.ttf';
            const fontFace = new FontFace(fontName, `url(${fontUrl})`);
            await fontFace.load();
            document.fonts.add(fontFace);
            Program.font = new Font(`20px '${fontName}'`);
            console.log('Шрифт успешно загружен.');
        } catch (e) {
            console.error('Ошибка при загрузке шрифта:', e);
            Program.font = new Font('20px Arial');
        }

        const infoText = new GnuEngenSFML.D2Gun();
        infoText.x = (Program.width / 2) - 150; 
        infoText.y = Program.height - 50;
        infoText.type = GnuEngenSFML.ObjectType.Text;
        infoText.text = "Created by ParrotSoft and Peri228";
        infoText.font = Program.font;
        infoText.base_color = 0xFFFFFF;
        Program.gEngine.AddObject(infoText);
        await Clock.WaitSeconds(2);
        Program.gEngine.DeleteObject(infoText);

        Program.MainMenu();
    }
}

window.onload = Program.Main;
/* ===== scenes.js — анимации-истории по темам ===== */

const SCENES = {

/* М1: жизненный цикл проекта */
m1:{dur:3400,caps:[
 "<b>Задание + ТУ.</b> Заказчик даёт задание на проектирование, сетевая организация — технические условия: сколько кВт выделено и где точка подключения.",
 "<b>Стадия «П».</b> Проектная документация по ПП РФ №87 (подраздел «Система электроснабжения») уходит в экспертизу — по ней выдают разрешение на строительство.",
 "<b>Стадия «Р».</b> Рабочая документация: однолинейные схемы, планы, кабельный журнал, спецификация — по ней монтируют.",
 "<b>Стройка.</b> Монтаж по СП 76.13330, испытания, ввод. Проектировщик ведёт авторский надзор — энергия проекта дошла до объекта."],
 svg:`<svg viewBox="0 0 360 128">
  <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#c2a05f"/><stop offset="1" stop-color="#d8b877"/></linearGradient></defs>
  <path id="m1p" d="M40 52 H320" stroke="#3a4653" stroke-width="2.4" fill="none"/>
  <g class="stg" data-s="0"><circle cx="40" cy="52" r="16" fill="#232b35" stroke="url(#g1)" stroke-width="1.8" class="gl"/>
    <text x="40" y="57" text-anchor="middle" font-size="12" fill="#d8b877">ТУ</text>
    <text x="40" y="92" text-anchor="middle" font-size="10" fill="#94a0ac">Задание</text></g>
  <g class="stg" data-s="1"><rect x="112" y="35" width="34" height="34" rx="6" fill="#232b35" stroke="url(#g1)" stroke-width="1.8" class="gl"/>
    <text x="129" y="57" text-anchor="middle" font-size="13" fill="#d8b877">П</text>
    <text x="129" y="92" text-anchor="middle" font-size="10" fill="#94a0ac">Экспертиза</text></g>
  <g class="stg" data-s="2"><rect x="196" y="35" width="34" height="34" rx="6" fill="#232b35" stroke="url(#g1)" stroke-width="1.8" class="gl"/>
    <text x="213" y="57" text-anchor="middle" font-size="13" fill="#d8b877">Р</text>
    <text x="213" y="92" text-anchor="middle" font-size="10" fill="#94a0ac">Рабочка</text></g>
  <g class="stg" data-s="3"><path d="M296 70 v-22 l18-14 18 14 v22 z" fill="#232b35" stroke="#6fcf97" stroke-width="1.8" class="glg"/>
    <rect x="309" y="56" width="10" height="14" fill="#1a1f26"/>
    <text x="314" y="92" text-anchor="middle" font-size="10" fill="#94a0ac">Объект</text></g>
 </svg>`,
 flows:{0:[{path:'#m1p',opts:{n:2,dur:2600,trail:3}}],
        1:[{path:'#m1p',opts:{n:3,dur:2200,trail:3}}],
        2:[{path:'#m1p',opts:{n:4,dur:1800,trail:3}}],
        3:[{path:'#m1p',opts:{n:5,dur:1400,trail:3,color:'#6fcf97'}}]}},

/* М2: щит — три режима */
m2:{dur:4000,caps:[
 "<b>Нормальный режим.</b> Ток идёт с ввода через счётчик и вводной АВ 40 А на шину и растекается по группам: свет 10 А, розетки 16 А + УЗО 30 мА, плита 32 А.",
 "<b>Перегрузка розеток.</b> Сработал только групповой автомат — свет и плита живут. Это <b>селективность</b>: номиналы растут ступенями от группы к вводу.",
 "<b>Утечка тока.</b> Пробой на корпус — ток уходит через человека. УЗО сравнивает фазу и ноль, видит разницу 30 мА и рвёт цепь за сотые секунды (СП 256, ПУЭ 7.1.79)."],
 svg:`<svg viewBox="0 0 360 176">
  <path id="p_in" d="M32 12 V78" stroke="#3a4653" stroke-width="2.2" fill="none"/>
  <rect x="20" y="26" width="24" height="14" rx="3" fill="#1d232b" stroke="#6f9bc0"/><text x="52" y="37" font-size="10" fill="#94a0ac">кВт·ч</text>
  <rect x="20" y="52" width="24" height="14" rx="3" fill="#1d232b" stroke="#d8b877"/><text x="52" y="63" font-size="10" fill="#94a0ac">АВ 40 А</text>
  <rect x="20" y="78" width="250" height="7" rx="3" fill="#2a323b" stroke="#6f9bc0" stroke-width="1.2"/>
  <text x="278" y="86" font-size="10" fill="#94a0ac">шина</text>
  <path id="p_l1" d="M62 85 V116" stroke="#3a4653" stroke-width="1.8" fill="none"/>
  <path id="p_l2" d="M148 85 V116" stroke="#3a4653" stroke-width="1.8" fill="none"/>
  <path id="p_l3" d="M234 85 V116" stroke="#3a4653" stroke-width="1.8" fill="none"/>
  <rect x="50" y="116" width="24" height="15" rx="3" fill="#1d232b" stroke="#6f9bc0"/><text x="62" y="150" text-anchor="middle" font-size="10" fill="#94a0ac">Свет 10А</text>
  <rect id="rz" x="128" y="116" width="40" height="15" rx="3" fill="#1d232b" stroke="#d8b877"/><text x="148" y="150" text-anchor="middle" font-size="10" fill="#94a0ac">Роз. 16А+УЗО</text>
  <rect x="222" y="116" width="24" height="15" rx="3" fill="#1d232b" stroke="#6f9bc0"/><text x="234" y="150" text-anchor="middle" font-size="10" fill="#94a0ac">Плита 32А</text>
  <g class="stg solo" data-s="1">
    <text x="148" y="108" text-anchor="middle" font-size="11" fill="#e05a5a" font-weight="bold" class="blink">⚡ перегруз</text>
    <line x1="134" y1="116" x2="162" y2="131" stroke="#e05a5a" stroke-width="2.2"/>
    <text x="292" y="124" font-size="10" fill="#6fcf97">остальное ✓</text></g>
  <g class="stg solo" data-s="2">
    <path id="p_leak" d="M312 96 V138" stroke="none" fill="none"/>
    <circle cx="312" cy="90" r="6" fill="none" stroke="#e05a5a" stroke-width="1.6"/>
    <line x1="312" y1="96" x2="312" y2="118" stroke="#e05a5a" stroke-width="1.8"/>
    <line x1="304" y1="124" x2="320" y2="124" stroke="#e05a5a" stroke-width="2"/>
    <line x1="307" y1="129" x2="317" y2="129" stroke="#e05a5a" stroke-width="1.6"/>
    <line x1="310" y1="134" x2="314" y2="134" stroke="#e05a5a" stroke-width="1.3"/>
    <text x="252" y="168" font-size="11" fill="#e05a5a" font-weight="bold">УЗО: отсечка ≤ 0,03 с</text></g>
 </svg>`,
 flows:{0:[{path:'#p_in',opts:{n:2,dur:1300,trail:2}},
           {path:'#p_l1',opts:{n:1,dur:1000}},
           {path:'#p_l2',opts:{n:1,dur:1000}},
           {path:'#p_l3',opts:{n:1,dur:1000}}],
        1:[{path:'#p_in',opts:{n:2,dur:1300,trail:2}},
           {path:'#p_l1',opts:{n:1,dur:1000}},
           {path:'#p_l3',opts:{n:1,dur:1000}}],
        2:[{path:'#p_in',opts:{n:2,dur:1300,trail:2}},
           {path:'#p_leak',opts:{n:2,dur:900,color:'#e05a5a'}}]}},

/* М3: от мощности к автомату */
m3:{dur:3800,caps:[
 "<b>1 · Ток.</b> Однофазно I = P/(U·cosφ): 5 кВт → ≈ 23,9 А. Трёхфазно делим ещё на √3 — вот зачем большим нагрузкам 380 В.",
 "<b>2 · Нагрев.</b> Сечение мало (1,5 мм², Iдоп 19 А < 24 А) — кабель греется. Сечение берём по таблицам ПУЭ гл. 1.3.",
 "<b>3 · Потеря напряжения.</b> Длинная линия «съедает» вольты — лампа в конце тусклее. Держим ΔU ≈ ≤ 5% (качество у потребителя — ГОСТ 32144: ±10%).",
 "<b>4 · Автомат защищает кабель.</b> Iрасч ≤ Iном.АВ ≤ Iдоп: для 23,9 А и кабеля 2,5 мм² (27 А) → автомат C25 (хар-ки — ГОСТ Р 50345)."],
 svg:`<svg viewBox="0 0 360 152">
  <g class="stg" data-s="0">
    <text x="18" y="26" font-size="13" fill="#eef1f4" font-family="monospace">5 кВт → I = 5000/(220·0,95) ≈ <tspan fill="#d8b877" font-weight="bold">23,9 А</tspan></text></g>
  <g class="stg solo" data-s="1">
    <text x="18" y="54" font-size="10.5" fill="#e08a7a">1,5 мм² · Iдоп 19 А &lt; 24 А</text>
    <rect x="18" y="60" width="150" height="8" rx="4" class="heatpulse"/>
    <path d="M55 58 q4 -8 0 -14 M95 58 q4 -8 0 -14 M135 58 q4 -8 0 -14" stroke="#e05a5a" stroke-width="1.5" fill="none" class="blink"/>
    <text x="180" y="68" font-size="11" fill="#e05a5a">перегрев 🔥</text></g>
  <g class="stg solo" data-s="2">
    <path id="p_long" d="M28 64 H250" stroke="#3a5a6a" stroke-width="7" stroke-linecap="round" fill="none"/>
    <circle cx="28" cy="94" r="9" fill="#ffe6ad" class="gl"/>
    <g class="rays"><line x1="28" y1="78" x2="28" y2="70"/><line x1="16" y1="86" x2="10" y2="80"/><line x1="40" y1="86" x2="46" y2="80"/></g>
    <text x="28" y="120" font-size="9.5" fill="#94a0ac" text-anchor="middle">начало · ярко</text>
    <circle cx="250" cy="94" r="9" fill="#6a6a52" opacity=".75"/>
    <text x="250" y="120" font-size="9.5" fill="#94a0ac" text-anchor="middle">конец · тускло</text>
    <text x="282" y="68" font-size="11" fill="#d8b877">ΔU ≤ 5%</text></g>
  <g class="stg solo" data-s="3">
    <text x="18" y="54" font-size="12.5" fill="#eef1f4" font-family="monospace">23,9 А ≤ <tspan fill="#6fcf97" font-weight="bold">25 А</tspan> ≤ 27 А</text>
    <rect x="18" y="66" width="54" height="27" rx="5" fill="#232b35" stroke="#6fcf97" stroke-width="1.8" class="glg"/>
    <text x="45" y="84" font-size="11.5" fill="#6fcf97" text-anchor="middle">C25</text>
    <path id="p_prot" d="M78 80 H236" stroke="#3a5a6a" stroke-width="9" stroke-linecap="round" fill="none"/>
    <text x="248" y="84" font-size="10.5" fill="#94a0ac">2,5 мм² · 27 А</text>
    <text x="18" y="126" font-size="11" fill="#6fcf97">✓ автомат отключится раньше, чем кабель перегреется</text></g>
 </svg>`,
 flows:{2:[{path:'#p_long',opts:{n:3,dur:2600,color:'#8fb8d8',r:2.2}}],
        3:[{path:'#p_prot',opts:{n:3,dur:1500,trail:2}}]}},

/* М4: пирамида норм и маркировки */
m4:{dur:3800,caps:[
 "<b>Иерархия.</b> Сверху техрегламенты: ФЗ-123 (пожарная безопасность), ФЗ-384 (безопасность зданий). Ниже — своды правил, как проектировать. Затем ГОСТ и ПУЭ.",
 "<b>Зоны объекта.</b> Жилые/общественные здания — СП 256. Пути эвакуации и массовое пребывание — кабели <b>нг(А)-HF</b>. Противопожарные системы — <b>нг(А)-FRLS/FRHF</b> и СП 6.13130.",
 "<b>Читаем маркировку</b> нг(А)-FRLS: <b>нг(А)</b> — не распространяет горение при групповой прокладке; <b>FR</b> — огнестойкий, работает в огне; <b>LS</b> — мало дыма. Области применения — ГОСТ 31565, табл. 2."],
 svg:`<svg viewBox="0 0 360 152">
  <g class="stg" data-s="0">
    <path d="M180 10 l54 30 h-108 z" fill="#232b35" stroke="#d8b877" stroke-width="1.4"/>
    <text x="180" y="34" text-anchor="middle" font-size="9.5" fill="#d8b877">ФЗ-123 · ФЗ-384</text>
    <path d="M116 44 h128 l28 28 h-184 z" fill="#1f2630" stroke="#6f9bc0" stroke-width="1.2"/>
    <text x="180" y="62" text-anchor="middle" font-size="9.5" fill="#9fb7cb">СП 256 · СП 6 · СП 52 · СП 76</text>
    <path d="M84 76 h192 l22 28 h-236 z" fill="#1c222b" stroke="#3a4653"/>
    <text x="180" y="94" text-anchor="middle" font-size="9.5" fill="#94a0ac">ГОСТ 31565 · ГОСТ 21.613 · ПУЭ</text></g>
  <g class="stg solo" data-s="1">
    <rect x="26" y="112" width="92" height="30" rx="5" fill="#15251c" stroke="#6fcf97"/>
    <text x="72" y="125" text-anchor="middle" font-size="8.5" fill="#6fcf97">Пути эвакуации</text>
    <text x="72" y="136" text-anchor="middle" font-size="9" fill="#6fcf97" font-weight="bold">нг(А)-HF</text>
    <rect x="132" y="112" width="96" height="30" rx="5" fill="#2a1518" stroke="#e08a7a"/>
    <text x="180" y="125" text-anchor="middle" font-size="8.5" fill="#e08a7a">АПС · СОУЭ · дымоудал.</text>
    <text x="180" y="136" text-anchor="middle" font-size="9" fill="#e08a7a" font-weight="bold">нг(А)-FRLS</text>
    <rect x="242" y="112" width="92" height="30" rx="5" fill="#182028" stroke="#6f9bc0"/>
    <text x="288" y="125" text-anchor="middle" font-size="8.5" fill="#9fb7cb">Жильё · офисы</text>
    <text x="288" y="136" text-anchor="middle" font-size="9" fill="#9fb7cb" font-weight="bold">нг(А)-LS</text></g>
  <g class="stg solo" data-s="2">
    <text x="180" y="122" text-anchor="middle" font-family="monospace" font-size="19" fill="#eef1f4"><tspan fill="#d8b877">нг(А)</tspan>-<tspan fill="#e08a7a">FR</tspan><tspan fill="#6f9bc0">LS</tspan></text>
    <text x="180" y="141" text-anchor="middle" font-size="9" fill="#94a0ac">не горит группой · огнестойкий · мало дыма</text></g>
 </svg>`},

/* М5: заземление и молниезащита */
m5:{dur:4000,caps:[
 "<b>Молния.</b> Разряд бьёт в молниеприёмник, ток уходит по токоотводу в заземлитель — минуя людей и электронику. Нормы: РД 34.21.122-87 и СО 153-34.21.122-2003.",
 "<b>Пробой без защиты.</b> Фаза попала на корпус бойлера. PE-проводника нет — корпус под напряжением, ток пойдёт через человека. Опасно!",
 "<b>PE + УЗО.</b> С защитным проводником ток утечки уходит в землю, УЗО 30 мА мгновенно отключает линию. Жилые здания — система <b>TN-C-S</b>: PEN делится на PE и N на вводе (ПУЭ гл. 1.7)."],
 svg:`<svg viewBox="0 0 360 168">
  <g class="stg" data-s="0">
    <ellipse cx="90" cy="26" rx="40" ry="13" fill="#2a323b"/>
    <ellipse cx="118" cy="20" rx="30" ry="11" fill="#323b46"/>
    <path class="bolt" d="M104 34 l-9 22 h10 l-8 22"/>
    <path d="M60 118 h90 v-40 l-45 -22 -45 22 z" fill="#232b35" stroke="#6f9bc0" stroke-width="1.4"/>
    <line x1="105" y1="56" x2="105" y2="46" stroke="#d8b877" stroke-width="2.4"/>
    <path id="p_bolt" d="M105 46 V118 H58 V140" stroke="#3a4653" stroke-width="2" fill="none"/>
    <line x1="46" y1="140" x2="70" y2="140" stroke="#d8b877" stroke-width="2.4"/>
    <line x1="50" y1="146" x2="66" y2="146" stroke="#d8b877" stroke-width="1.8"/>
    <line x1="54" y1="152" x2="62" y2="152" stroke="#d8b877" stroke-width="1.3"/>
    <text x="105" y="164" font-size="9.5" fill="#94a0ac" text-anchor="middle">молниеприёмник → токоотвод → заземлитель</text></g>
  <g class="stg solo" data-s="1">
    <rect x="216" y="52" width="46" height="60" rx="6" fill="#1d232b" stroke="#e05a5a" stroke-width="1.6" class="glr"/>
    <text x="239" y="84" text-anchor="middle" font-size="9" fill="#e08a7a">бойлер</text>
    <path d="M223 44 l-6 9 h7 l-6 9" stroke="#e05a5a" stroke-width="1.8" fill="none" class="blink"/>
    <circle cx="292" cy="76" r="6" fill="none" stroke="#e05a5a" stroke-width="1.6"/>
    <line x1="292" y1="82" x2="292" y2="104" stroke="#e05a5a" stroke-width="1.8"/>
    <path id="p_body" d="M262 82 H292 V128" stroke="none" fill="none"/>
    <text x="278" y="146" font-size="10.5" fill="#e05a5a" font-weight="bold" text-anchor="middle">⚠ ток через человека</text></g>
  <g class="stg solo" data-s="2">
    <rect x="216" y="52" width="46" height="60" rx="6" fill="#1d232b" stroke="#6fcf97" stroke-width="1.6" class="glg"/>
    <text x="239" y="84" text-anchor="middle" font-size="9" fill="#6fcf97">бойлер</text>
    <path id="p_pe" d="M239 112 V140" stroke="#3f5a4a" stroke-width="2.4" fill="none"/>
    <line x1="227" y1="140" x2="251" y2="140" stroke="#6fcf97" stroke-width="2.2"/>
    <line x1="231" y1="146" x2="247" y2="146" stroke="#6fcf97" stroke-width="1.6"/>
    <rect x="286" y="58" width="42" height="22" rx="4" fill="#232b35" stroke="#6fcf97"/>
    <text x="307" y="72" text-anchor="middle" font-size="9" fill="#6fcf97">УЗО ✓</text>
    <text x="286" y="146" font-size="10.5" fill="#6fcf97" text-anchor="middle" >PE + УЗО = безопасно</text></g>
 </svg>`,
 flows:{0:[{path:'#p_bolt',opts:{n:3,dur:900,color:'#ffe6ad',r:2.8,trail:3}}],
        1:[{path:'#p_body',opts:{n:2,dur:800,color:'#e05a5a',r:2.4}}],
        2:[{path:'#p_pe',opts:{n:2,dur:700,color:'#6fcf97',r:2.4}}]}},

/* М6: освещение */
m6:{dur:3800,caps:[
 "<b>Норма освещённости.</b> Каждому помещению — свой уровень в люксах: жилая комната 150 лк, офис 300–400 лк (СП 52.13330, СанПиН 1.2.3685-21). Проверяем расчётом, а не «на глаз».",
 "<b>Мало света?</b> Добавляем светильники или меняем их поток (люмены) — освещённость на рабочей плоскости растёт до нормы. Расчёт — методом коэффициента использования или в DIALux.",
 "<b>Аварийное освещение.</b> Пропало питание — включаются светильники с БАП и указатели «Выход»: на путях эвакуации — не менее 1 лк (СП 52.13330). Питание таких линий — огнестойким кабелем."],
 svg:`<svg viewBox="0 0 360 158">
  <rect x="24" y="22" width="200" height="112" rx="6" fill="#171d24" stroke="#3a4653"/>
  <g class="stg" data-s="0">
    <rect x="112" y="22" width="24" height="7" rx="2" fill="#232b35" stroke="#d8b877"/>
    <path d="M124 29 L84 108 M124 29 L164 108 M124 29 L124 108" stroke="#d8b877" stroke-width="1" opacity=".28"/>
    <circle cx="124" cy="32" r="4" fill="#ffe6ad" class="gl"/>
    <rect x="60" y="108" width="128" height="5" rx="2.5" fill="#2c3540"/>
    <text x="124" y="128" text-anchor="middle" font-family="monospace" font-size="12" fill="#d8b877"><tspan class="luxval">150</tspan> лк</text></g>
  <g class="stg solo" data-s="1">
    <rect x="64" y="22" width="24" height="7" rx="2" fill="#232b35" stroke="#d8b877"/>
    <rect x="160" y="22" width="24" height="7" rx="2" fill="#232b35" stroke="#d8b877"/>
    <circle cx="76" cy="32" r="4" fill="#ffe6ad" class="gl"/><circle cx="172" cy="32" r="4" fill="#ffe6ad" class="gl"/>
    <path d="M76 29 L46 108 M76 29 L106 108 M172 29 L142 108 M172 29 L202 108" stroke="#d8b877" stroke-width="1" opacity=".3"/>
    <text x="124" y="128" text-anchor="middle" font-family="monospace" font-size="12" fill="#6fcf97"><tspan class="luxval2">300</tspan> лк ✓ офис</text></g>
  <g class="stg solo" data-s="2">
    <rect x="24" y="22" width="200" height="112" rx="6" fill="#0d1116" stroke="#3a4653"/>
    <rect x="96" y="30" width="56" height="20" rx="4" fill="#15251c" stroke="#6fcf97" class="glg"/>
    <text x="124" y="44" text-anchor="middle" font-size="10" fill="#6fcf97" font-weight="bold">ВЫХОД →</text>
    <circle cx="52" cy="34" r="3.5" fill="#bff0d2" class="glg blink"/>
    <circle cx="196" cy="34" r="3.5" fill="#bff0d2" class="glg blink"/>
    <text x="124" y="128" text-anchor="middle" font-family="monospace" font-size="12" fill="#6fcf97">≥ 1 лк на пути эвакуации</text></g>
  <g>
    <rect x="248" y="42" width="86" height="72" rx="8" fill="#1d232b" stroke="#3a4653"/>
    <text x="291" y="62" text-anchor="middle" font-size="9" fill="#94a0ac">люксметр</text>
    <text x="291" y="86" text-anchor="middle" font-family="monospace" font-size="16" fill="#d8b877" class="meter">150</text>
    <text x="291" y="102" text-anchor="middle" font-size="8.5" fill="#94a0ac">лк · рабочая плоскость</text></g>
 </svg>`,
 hooks:{0:svg=>{const m=svg.querySelector('.meter');if(m)countTo(m,150,0,'');},
        1:svg=>{const m=svg.querySelector('.meter');if(m)countTo(m,300,0,'');},
        2:svg=>{const m=svg.querySelector('.meter');if(m)countTo(m,1,0,'');}}},

/* М7: экспертиза */
m7:{dur:3600,caps:[
 "<b>Подача.</b> Комплект по ПП РФ №87 уходит в госэкспертизу (ГГЭ) или негосударственную. Оформление — по СПДС: ГОСТ Р 21.101, для ЭОМ — ГОСТ 21.613.",
 "<b>Замечания.</b> Эксперт проверяет соответствие нормам и выдаёт перечень: не тот тип кабеля, нет расчётов, автомат не защищает линию…",
 "<b>Согласование.</b> Отработал замечания — получил положительное заключение. Проект уходит в производство работ, а ты — на авторский надзор."],
 svg:`<svg viewBox="0 0 360 148">
  <rect x="134" y="10" width="94" height="124" rx="5" fill="#1a1f26" stroke="#3a4653"/>
  <line x1="146" y1="26" x2="216" y2="26" stroke="#2a323b" stroke-width="2"/>
  <line x1="146" y1="40" x2="216" y2="40" stroke="#2a323b" stroke-width="2"/>
  <line x1="146" y1="54" x2="216" y2="54" stroke="#2a323b" stroke-width="2"/>
  <line x1="146" y1="68" x2="216" y2="68" stroke="#2a323b" stroke-width="2"/>
  <line x1="146" y1="82" x2="216" y2="82" stroke="#2a323b" stroke-width="2"/>
  <line x1="146" y1="96" x2="216" y2="96" stroke="#2a323b" stroke-width="2"/>
  <line x1="146" y1="110" x2="216" y2="110" stroke="#2a323b" stroke-width="2"/>
  <g class="stg" data-s="0"><rect x="134" y="10" width="94" height="4" fill="#6f9bc0" class="glb">
    <animate attributeName="y" values="10;130;10" dur="4s" repeatCount="indefinite"/></rect></g>
  <g class="stg solo" data-s="1">
    <rect x="46" y="28" width="76" height="24" rx="4" fill="#2a1518" stroke="#e05a5a"/>
    <text x="84" y="43" text-anchor="middle" font-size="9" fill="#e08a7a">тип кабеля ✗</text>
    <rect x="46" y="62" width="76" height="24" rx="4" fill="#2a1518" stroke="#e05a5a"/>
    <text x="84" y="77" text-anchor="middle" font-size="9" fill="#e08a7a">нет расчёта ✗</text>
    <line x1="122" y1="40" x2="146" y2="46" stroke="#e05a5a" stroke-dasharray="3 3"/>
    <line x1="122" y1="74" x2="146" y2="78" stroke="#e05a5a" stroke-dasharray="3 3"/></g>
  <g class="stg solo" data-s="2">
    <rect x="240" y="30" width="80" height="24" rx="4" fill="#15251c" stroke="#6fcf97"/>
    <text x="280" y="45" text-anchor="middle" font-size="9" fill="#6fcf97">исправлено ✓</text>
    <circle cx="280" cy="98" r="23" fill="none" stroke="#6fcf97" stroke-width="2" class="glg"/>
    <text x="280" y="95" text-anchor="middle" font-size="7.5" fill="#6fcf97">ПОЛОЖИТЕЛЬНОЕ</text>
    <text x="280" y="105" text-anchor="middle" font-size="7.5" fill="#6fcf97">ЗАКЛЮЧЕНИЕ</text></g>
 </svg>`}
};

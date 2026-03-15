// why-rust.js — страница «Почему Rust?»
export function renderWhyRust() {
  return `
    <div class="page-header">
      <div class="page-title">🦀 Почему Rust?</div>
      <div class="page-subtitle">Зачем учить Rust, какие проблемы он решает и почему его любят разработчики</div>
    </div>

    <div class="why-rust-intro">
      <p>Rust — это язык программирования, который решает проблемы, с которыми десятилетиями мучились программисты. Он сочетает скорость C++, безопасность и удобство современных языков. Вот почему его стоит учить.</p>
    </div>

    <div class="why-rust-grid">
      <div class="why-card">
        <div class="why-card-icon">🛡️</div>
        <div class="why-card-title">Безопасность без жертв</div>
        <div class="why-card-body">
          <p><strong>Проблема:</strong> В C и C++ легко допустить ошибки с памятью — утечки, выход за границы массива, «висячие» указатели. Такие баги ломают программы и открывают дыры в безопасности.</p>
          <p><strong>Rust:</strong> Компилятор проверяет код до запуска. Если программа скомпилировалась — многие типичные ошибки уже невозможны. Никакого сборщика мусора, но и никаких ручных free/malloc.</p>
          <p class="why-analogy">💡 <em>Как конструктор с умными деталями: неправильно собрать просто нельзя.</em></p>
        </div>
      </div>

      <div class="why-card">
        <div class="why-card-icon">⚡</div>
        <div class="why-card-title">Скорость как у C</div>
        <div class="why-card-body">
          <p><strong>Проблема:</strong> Языки вроде Python и JavaScript удобны, но медленные. C и C++ быстрые, но опасные и сложные.</p>
          <p><strong>Rust:</strong> Работает почти так же быстро, как C. Подходит для игр, браузеров, операционных систем, встроенных устройств — там, где важна каждая миллисекунда.</p>
          <p class="why-analogy">💡 <em>Как гоночный болид: быстрый и при этом с ремнями безопасности.</em></p>
        </div>
      </div>

      <div class="why-card">
        <div class="why-card-icon">🧵</div>
        <div class="why-card-title">Параллелизм без страха</div>
        <div class="why-card-body">
          <p><strong>Проблема:</strong> Многопоточность в C++ — источник гонок данных и трудноуловимых багов. Ошибка может проявиться раз в месяц.</p>
          <p><strong>Rust:</strong> Система владения и заимствования не даёт написать небезопасный многопоточный код. Компилятор откажет в сборке — и ты сразу узнаешь, где проблема.</p>
          <p class="why-analogy">💡 <em>Как светофор: правила не дают машинам столкнуться.</em></p>
        </div>
      </div>

      <div class="why-card">
        <div class="why-card-icon">🔧</div>
        <div class="why-card-title">Честный компилятор</div>
        <div class="why-card-body">
          <p><strong>Проблема:</strong> В других языках ошибки часто всплывают в рантайме — программа уже у пользователя, и она падает.</p>
          <p><strong>Rust:</strong> Ошибки ловятся при компиляции. Сообщения понятные, с подсказками. «Если скомпилировалось — скорее всего, работает».</p>
          <p class="why-analogy">💡 <em>Как строгий учитель: лучше поправить дома, чем завалить экзамен.</em></p>
        </div>
      </div>
    </div>

    <div class="why-rust-section">
      <h2 class="why-section-title">Кто использует Rust?</h2>
      <p>Rust уже в продакшене у крупных компаний:</p>
      <ul class="why-list">
        <li><strong>Discord</strong> — снизили задержки в 10 раз, переписав части сервера на Rust</li>
        <li><strong>Microsoft</strong> — Windows, Azure, части ядра</li>
        <li><strong>Amazon</strong> — Firecracker (виртуализация), Bottlerocket</li>
        <li><strong>Google</strong> — Android, Fuchsia</li>
        <li><strong>Mozilla</strong> — Firefox (движок Servo)</li>
        <li><strong>Cloudflare</strong> — прокси, парсинг</li>
      </ul>
    </div>

    <div class="why-rust-section">
      <h2 class="why-section-title">Зачем учить Rust?</h2>
      <ul class="why-list">
        <li><strong>Спрос.</strong> Rust стабильно в топе «любимых языков» в опросах разработчиков. Вакансии растут.</li>
        <li><strong>Фундамент.</strong> Владение, заимствование, типы — эти идеи улучшают мышление и в других языках.</li>
        <li><strong>Экосистема.</strong> Cargo, crates.io, документация — всё продумано. Писать проекты приятно.</li>
        <li><strong>Будущее.</strong> WebAssembly, встраиваемые системы, системное программирование — Rust там, где нужны скорость и надёжность.</li>
      </ul>
    </div>

    <div class="why-rust-cta">
      <p>Готов начать? Переходи к <a href="#" onclick="navigate('lessons'); return false;">урокам</a> или открой <a href="#" onclick="navigate('textbook'); return false;">учебник</a>.</p>
    </div>
  `;
}

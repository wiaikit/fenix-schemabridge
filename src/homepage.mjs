export const homepageHtml = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Переименуйте поля и проверьте типы данных в небольших таблицах CSV или JSON. Попробуйте SchemaBridge на простом примере.">
  <title>SchemaBridge · Понятные данные из CSV и JSON</title>
  <link rel="stylesheet" href="/assets/app.css">
  <script src="/assets/app.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#demo" data-i18n="skip">Перейти к примеру</a>
  <div class="page">
    <header class="site-header">
      <a class="wordmark" href="/" aria-label="SchemaBridge">Schema<span>Bridge</span></a>
      <div class="language-switch" role="group" aria-label="Язык страницы" data-i18n-aria="language">
        <button type="button" data-language="ru" aria-pressed="true" lang="ru">RU</button>
        <button type="button" data-language="en" aria-pressed="false" lang="en">EN</button>
      </div>
    </header>
    <main>
      <section class="intro" aria-labelledby="page-title">
        <p class="intro-label" data-i18n="eyebrow">Небольшие таблицы. Явные правила.</p>
        <h1 id="page-title" data-i18n="heading">Приведите данные к нужному виду.</h1>
        <p class="lead" data-i18n="intro">SchemaBridge переименовывает поля и проверяет типы в небольших таблицах CSV или JSON. Например, stock становится quantity, а текст «7» превращается в число 7. Попробуйте на двух товарах ниже.</p>
      </section>

      <section id="demo" class="demo" aria-labelledby="demo-title" tabindex="-1">
        <div class="demo-heading">
          <h2 id="demo-title" data-i18n="demoTitle">От CSV к понятным полям</h2>
          <p data-i18n="demoIntro">Измените исходные значения и отправьте их на API. Результат появится только после ответа сервера.</p>
        </div>
        <form id="demo-form">
          <div class="panels">
            <section class="input-panel" aria-labelledby="input-title">
              <div class="panel-heading"><h3 id="input-title" data-i18n="inputTitle">Исходные данные</h3><span class="format-label">CSV</span></div>
              <label for="csv-input" data-i18n="inputLabel">Таблица с заголовком и двумя товарами</label>
              <textarea id="csv-input" name="csv" rows="7" maxlength="32768" spellcheck="false" autocapitalize="off" autocomplete="off" aria-describedby="input-help limits">sku,name,stock,active
A1,"Tea, green",7,true
B2,Coffee,0,false</textarea>
              <p id="input-help" class="field-help" data-i18n="inputHelp">Можно редактировать. Замените 7 на seven, чтобы увидеть понятную ошибку проверки.</p>
              <div class="actions">
                <button id="submit-button" class="primary-button" type="submit" data-i18n="submit">Преобразовать пример</button>
                <button id="reset-button" class="reset-button" type="button" data-i18n="reset">Сбросить</button>
              </div>
            </section>
            <section id="result-panel" class="result-panel" aria-labelledby="result-title" aria-busy="false">
              <div class="panel-heading"><h3 id="result-title" data-i18n="resultTitle">Результат</h3><span class="format-label" data-i18n="typedData">Поля и типы</span></div>
              <p id="status" class="status" role="status" aria-live="polite" aria-atomic="true">Пока ничего не отправлено. Нажмите «Преобразовать пример».</p>
              <ul id="field-errors" class="field-errors" hidden></ul>
              <div id="empty-result" class="empty-result"><p data-i18n="empty">Здесь появится таблица с проверенными значениями.</p></div>
              <div id="table-container" class="table-container" role="region" aria-label="Преобразованные данные" data-i18n-aria="tableRegion" tabindex="0" hidden></div>
              <details id="response-details" class="response-details" hidden>
                <summary data-i18n="responseDetails">Посмотреть ответ API в JSON</summary>
                <pre id="response-json"></pre>
              </details>
            </section>
          </div>
        </form>
        <div class="rules">
          <p class="rules-title" data-i18n="schemaTitle">В этом примере схема фиксирована</p>
          <ul class="mapping-list" aria-label="Правила преобразования" data-i18n-aria="mappingLabel">
            <li><code>sku → id</code><span data-i18n="stringType">текст</span></li>
            <li><code>name → name</code><span data-i18n="stringType">текст</span></li>
            <li><code>stock → quantity</code><span data-i18n="integerType">целое число</span></li>
            <li><code>active → available</code><span data-i18n="booleanType">true или false</span></li>
          </ul>
          <p class="field-help" data-i18n="schemaHelp">Сохраняйте эти четыре заголовка. API позволяет задать другую схему и принимать JSON; здесь показан один простой сценарий.</p>
        </div>
        <p id="limits" class="limits" data-i18n="limits">До 100 строк данных и 32 КиБ на весь запрос, включая схему. Используйте только вымышленные данные без личной или конфиденциальной информации.</p>
        <noscript><p class="noscript-note">Для живого примера нужен JavaScript. Документация API доступна по ссылкам ниже. JavaScript is needed for the live example; API documentation is linked below.</p></noscript>
      </section>
    </main>
    <footer>
      <details class="developer-details">
        <summary data-i18n="developerTitle">Для разработчиков</summary>
        <p data-i18n="developerHelp">Тот же API можно вызвать из вашего приложения. Форматы запросов и ограничения описаны в OpenAPI.</p>
        <nav aria-label="Документация API" data-i18n-aria="developerNav">
          <a href="/v1" data-i18n="apiLink">Обзор API</a>
          <a href="/health" data-i18n="healthLink">Состояние сервиса</a>
          <a href="/openapi.json">OpenAPI</a>
          <a href="https://github.com/wiaikit/fenix-schemabridge" rel="noreferrer" data-i18n="sourceLink">Исходный код</a>
        </nav>
      </details>
      <p class="footer-note" data-i18n="footerNote">SchemaBridge · Преобразование по правилам, которые задаёте вы.</p>
    </footer>
  </div>
</body>
</html>`;

export const homepageCss = `
:root{color-scheme:light;--ink:#173338;--muted:#52676a;--teal:#08675e;--teal-dark:#064b45;--line:#ceddda;--paper:#f6f9f8;--white:#fff;--tint:#e8f1ee;--error:#922d26;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:var(--paper);font-synthesis:none}
*{box-sizing:border-box}
body{margin:0;font-size:16px;line-height:1.6}
button,textarea{font:inherit}
button,a,summary{-webkit-tap-highlight-color:transparent}
button{cursor:pointer}
a{color:var(--teal);text-underline-offset:4px}
a:hover{color:var(--teal-dark)}
button:focus-visible,a:focus-visible,textarea:focus-visible,summary:focus-visible,[tabindex]:focus-visible{outline:3px solid var(--teal);outline-offset:4px}
[hidden]{display:none!important}
.page{width:min(1144px,100%);margin:auto;padding:0 32px}
.skip-link{position:absolute;top:12px;left:16px;z-index:2;padding:10px 16px;background:var(--white);transform:translateY(-160%)}
.skip-link:focus{transform:none}
.site-header{min-height:92px;display:flex;align-items:center;justify-content:space-between;gap:20px;border-bottom:1px solid var(--line)}
.wordmark{text-decoration:none;font-size:23px;letter-spacing:-.8px;font-weight:750;color:var(--ink)}
.wordmark span{color:var(--teal)}
.language-switch{display:flex;gap:3px;padding:3px;border:1px solid var(--line);border-radius:8px;background:var(--white)}
.language-switch button{min-width:44px;min-height:40px;padding:5px 9px;border:0;border-radius:5px;background:transparent;color:var(--muted);font-size:13px;font-weight:700}
.language-switch button[aria-pressed="true"]{color:var(--white);background:var(--teal)}
.intro{padding:56px 0 36px;max-width:850px}
.intro-label{margin:0 0 14px;color:var(--teal);font-size:14px;font-weight:650}
h1,h2,h3,p{margin-top:0}
h1{max-width:800px;margin-bottom:22px;font-size:clamp(36px,5.2vw,58px);font-weight:650;letter-spacing:-2.1px;line-height:1.1;text-wrap:balance}
.lead{max-width:770px;margin:0;font-size:18px;line-height:1.7;color:var(--muted)}
.demo{margin-bottom:38px;scroll-margin-top:20px}
.demo-heading{margin-bottom:20px}
h2{margin-bottom:4px;font-size:22px;font-weight:650;letter-spacing:-.5px}
.demo-heading p{margin-bottom:0;color:var(--muted);font-size:15px}
.panels{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--white)}
.input-panel,.result-panel{min-width:0;padding:26px}
.result-panel{border-left:1px solid var(--line);background:#f0f6f3}
.panel-heading{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:18px}
h3{margin:0;font-size:18px;line-height:1.4;font-weight:650}
.format-label{font-size:12px;color:var(--muted);white-space:nowrap}
label{display:block;font-size:13px;font-weight:600;margin-bottom:8px}
textarea{display:block;width:100%;min-height:178px;max-height:480px;resize:vertical;border:1px solid #9db7b0;border-radius:6px;padding:14px;background:#fff;color:var(--ink);font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;line-height:1.8;white-space:pre;overflow:auto}
.field-help{font-size:13px;line-height:1.65;color:var(--muted);margin:10px 0 0}
.actions{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:22px}
.primary-button,.reset-button{min-height:46px;border-radius:6px;padding:10px 16px;font-size:14px;font-weight:600}
.primary-button{border:1px solid var(--teal);background:var(--teal);color:var(--white)}
.primary-button:hover:enabled{background:var(--teal-dark);border-color:var(--teal-dark)}
.reset-button{border:1px solid transparent;color:var(--teal);background:transparent}
.reset-button:hover:enabled{background:var(--tint)}
button:disabled{cursor:wait;opacity:.65}
textarea:disabled{opacity:.8}
.status{font-size:14px;line-height:1.65;margin-bottom:16px;color:var(--muted);overflow-wrap:anywhere}
.status[data-state="success"]{color:var(--teal);font-weight:600}
.status[data-state="error"]{color:var(--error)}
.empty-result{display:flex;min-height:164px;align-items:center;justify-content:center;border:1px dashed #a5bdb5;border-radius:6px;padding:24px;color:var(--muted);text-align:center}
.empty-result p{max-width:240px;margin:0;font-size:14px}
.table-container{overflow:auto;max-height:352px;border:1px solid var(--line);border-radius:6px;background:var(--white)}
table{width:100%;border-collapse:collapse;text-align:left;font-size:13px}
caption{padding:10px 12px;text-align:left;color:var(--muted);font-size:12px}
th,td{padding:10px 12px;border-top:1px solid var(--line);vertical-align:top;max-width:220px;overflow-wrap:anywhere}
th{background:var(--tint);font-size:12px;font-weight:650}
td{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.field-errors{padding-left:20px;margin:0 0 18px;font-size:13px;color:var(--error);overflow-wrap:anywhere}
.response-details{margin-top:18px;font-size:13px}
summary{cursor:pointer;color:var(--teal);font-weight:600;min-height:36px;padding:6px 0}
pre{max-height:300px;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;padding:14px;background:var(--white);border:1px solid var(--line);border-radius:6px}
.rules{padding:22px 0 18px;border-bottom:1px solid var(--line)}
.rules-title{font-size:14px;font-weight:650;margin-bottom:12px}
.mapping-list{list-style:none;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:0;padding:0}
.mapping-list li{display:flex;flex-direction:column;gap:2px;font-size:12px;color:var(--muted)}
code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;color:var(--ink)}
.limits{font-size:13px;color:var(--muted);margin:14px 0 0;max-width:880px}
.noscript-note{padding:16px;border:1px solid var(--line)}
footer{border-top:1px solid var(--line);padding:20px 0 28px}
.developer-details{font-size:14px}
.developer-details p{max-width:720px;color:var(--muted);margin:8px 0 12px}
.developer-details nav{display:flex;flex-wrap:wrap;gap:10px 24px}
.developer-details nav a{padding:5px 0}
.footer-note{font-size:12px;color:var(--muted);margin:22px 0 0}
@media(max-width:760px){.page{padding:0 20px}.site-header{min-height:80px}.intro{padding:36px 0 28px}h1{letter-spacing:-1.2px}.lead{font-size:16px}.panels{grid-template-columns:1fr}.input-panel,.result-panel{padding:22px}.result-panel{border-left:0;border-top:1px solid var(--line)}.mapping-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.empty-result{min-height:130px}}
@media(max-width:400px){.page{padding:0 16px}.wordmark{font-size:21px}.input-panel,.result-panel{padding:18px}.panel-heading{gap:8px}.format-label{font-size:11px}.primary-button{width:100%}.reset-button{min-height:44px}.actions{gap:4px}h1{font-size:36px}.mapping-list{column-gap:8px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
`;

export const homepageJs = String.raw`(() => {
  'use strict';
  const copy = {
    ru: {
      pageTitle: 'SchemaBridge · Понятные данные из CSV и JSON', language: 'Язык страницы', skip: 'Перейти к примеру',
      eyebrow: 'Небольшие таблицы. Явные правила.', heading: 'Приведите данные к нужному виду.',
      intro: 'SchemaBridge переименовывает поля и проверяет типы в небольших таблицах CSV или JSON. Например, stock становится quantity, а текст «7» превращается в число 7. Попробуйте на двух товарах ниже.',
      demoTitle: 'От CSV к понятным полям', demoIntro: 'Измените исходные значения и отправьте их на API. Результат появится только после ответа сервера.',
      inputTitle: 'Исходные данные', inputLabel: 'Таблица с заголовком и двумя товарами', inputHelp: 'Можно редактировать. Замените 7 на seven, чтобы увидеть понятную ошибку проверки.',
      submit: 'Преобразовать пример', reset: 'Сбросить', resultTitle: 'Результат', typedData: 'Поля и типы',
      idle: 'Пока ничего не отправлено. Нажмите «Преобразовать пример».', edited: 'Данные изменены. Преобразуйте их, чтобы получить новый результат.',
      pending: 'Отправляем данные и проверяем типы…', empty: 'Здесь появится таблица с проверенными значениями.',
      tableRegion: 'Преобразованные данные', tableCaption: 'Значения из ответа API. Текст в кавычках; числа и true/false без кавычек.',
      responseDetails: 'Посмотреть ответ API в JSON', schemaTitle: 'В этом примере схема фиксирована', mappingLabel: 'Правила преобразования',
      stringType: 'текст', integerType: 'целое число', booleanType: 'true или false',
      schemaHelp: 'Сохраняйте эти четыре заголовка. API позволяет задать другую схему и принимать JSON; здесь показан один простой сценарий.',
      limits: 'До 100 строк данных и 32 КиБ на весь запрос, включая схему. Используйте только вымышленные данные без личной или конфиденциальной информации.',
      developerTitle: 'Для разработчиков', developerHelp: 'Тот же API можно вызвать из вашего приложения. Форматы запросов и ограничения описаны в OpenAPI.',
      developerNav: 'Документация API', apiLink: 'Обзор API', healthLink: 'Состояние сервиса', sourceLink: 'Исходный код', footerNote: 'SchemaBridge · Преобразование по правилам, которые задаёте вы.',
      success: (rows, cells) => 'Готово. Обработано строк: ' + rows + '. Изменён тип значений: ' + cells + '.',
      validation: 'Некоторые значения не подходят под схему. Для stock нужно целое число, для active только true или false. Исправьте данные и повторите. Частичный результат не возвращается.',
      invalidCsv: 'Не удалось прочитать CSV. Проверьте запятые, кавычки и одинаковое число ячеек в каждой строке.',
      header: 'Сохраните заголовок sku,name,stock,active. Имена колонок должны быть уникальными.',
      tooLarge: 'Запрос слишком большой. Сократите данные: максимум 100 строк и 32 КиБ вместе со схемой.',
      cellLimit: 'Слишком длинное значение или слишком много колонок. Сократите ячейки и оставьте четыре колонки примера.',
      timeout: 'Сервер не ответил за 15 секунд. Проверьте соединение и попробуйте ещё раз.',
      network: 'Не удалось связаться с сервисом. Проверьте соединение и попробуйте ещё раз.',
      server: 'Сервис сейчас не смог обработать запрос. Попробуйте ещё раз позже.',
      unexpected: 'Сервис вернул неожиданный ответ. Результат не показан; попробуйте ещё раз позже.',
      emptyInput: 'Добавьте CSV с заголовком sku,name,stock,active и строками данных.',
      field: (row, source, type) => 'Запись ' + row + ', поле ' + source + ': ожидается ' + type + '.',
      missing: (row, source) => 'Запись ' + row + ': отсутствует обязательное поле ' + source + '.'
    },
    en: {
      pageTitle: 'SchemaBridge · Clear data from CSV and JSON', language: 'Page language', skip: 'Skip to the example',
      eyebrow: 'Small tables. Explicit rules.', heading: 'Get your data into the right shape.',
      intro: 'SchemaBridge renames fields and checks types in small CSV or JSON tables. For example, stock becomes quantity, and the text “7” becomes the number 7. Try it with the two products below.',
      demoTitle: 'From CSV to clearly defined fields', demoIntro: 'Edit the source values and send them to the API. Results appear only after the server responds.',
      inputTitle: 'Source data', inputLabel: 'A header and two product records', inputHelp: 'You can edit this. Replace 7 with seven to see an explanatory validation error.',
      submit: 'Transform example', reset: 'Reset', resultTitle: 'Result', typedData: 'Fields and types',
      idle: 'Nothing has been sent yet. Select “Transform example”.', edited: 'The data has changed. Transform it to see an updated result.',
      pending: 'Sending data and checking types…', empty: 'Your table of validated values will appear here.',
      tableRegion: 'Transformed data', tableCaption: 'Values from the API response. Text is quoted; numbers and true/false are not.',
      responseDetails: 'View the JSON API response', schemaTitle: 'This example uses a fixed schema', mappingLabel: 'Transformation rules',
      stringType: 'text', integerType: 'integer', booleanType: 'true or false',
      schemaHelp: 'Keep these four headers. The API also accepts custom schemas and JSON; this page demonstrates one simple workflow.',
      limits: 'Up to 100 data rows and 32 KiB for the entire request, including the schema. Use only synthetic data with no personal or confidential information.',
      developerTitle: 'For developers', developerHelp: 'Call the same API from your application. Request formats and limits are documented in OpenAPI.',
      developerNav: 'API documentation', apiLink: 'API overview', healthLink: 'Service health', sourceLink: 'Source code', footerNote: 'SchemaBridge · Transform data using rules you define.',
      success: (rows, cells) => 'Done. Rows processed: ' + rows + '. Values with a changed type: ' + cells + '.',
      validation: 'Some values do not match the schema. stock needs an integer, and active needs true or false. Fix the data and try again. No partial result is returned.',
      invalidCsv: 'The CSV could not be read. Check commas, quotes and the number of cells in each record.',
      header: 'Keep the header sku,name,stock,active. Column names must be unique.',
      tooLarge: 'The request is too large. Reduce the data: at most 100 rows and 32 KiB including the schema.',
      cellLimit: 'A value is too long or there are too many columns. Shorten the cells and keep the four example columns.',
      timeout: 'The server did not respond within 15 seconds. Check your connection and try again.',
      network: 'The service could not be reached. Check your connection and try again.',
      server: 'The service could not process the request right now. Please try again later.',
      unexpected: 'The service returned an unexpected response. No result is shown; please try again later.',
      emptyInput: 'Add CSV with the header sku,name,stock,active and data records.',
      field: (row, source, type) => 'Record ' + row + ', field ' + source + ': expected ' + type + '.',
      missing: (row, source) => 'Record ' + row + ': required field ' + source + ' is missing.'
    }
  };
  const initialCsv = 'sku,name,stock,active\nA1,"Tea, green",7,true\nB2,Coffee,0,false';
  const schema = [
    {source:'sku',target:'id',type:'string'}, {source:'name',target:'name',type:'string'},
    {source:'stock',target:'quantity',type:'integer'}, {source:'active',target:'available',type:'boolean'}
  ];
  const byId = id => document.getElementById(id);
  const input = byId('csv-input'), submit = byId('submit-button'), reset = byId('reset-button');
  const status = byId('status'), container = byId('table-container'), errors = byId('field-errors');
  let language = 'ru', phase = 'idle', responseData = null, errorKey = null;

  function render() {
    const t = copy[language];
    document.documentElement.lang = language;
    document.title = t.pageTitle;
    document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = t[node.dataset.i18n]; });
    document.querySelectorAll('[data-i18n-aria]').forEach(node => { node.setAttribute('aria-label', t[node.dataset.i18nAria]); });
    document.querySelectorAll('[data-language]').forEach(node => { node.setAttribute('aria-pressed', String(node.dataset.language === language)); });
    const pending = phase === 'pending';
    submit.disabled = pending; reset.disabled = pending; input.disabled = pending;
    byId('result-panel').setAttribute('aria-busy', String(pending));
    submit.textContent = pending ? t.pending : t.submit;
    status.dataset.state = phase;
    status.textContent = phase === 'success' ? t.success(responseData.summary.outputRows, responseData.summary.convertedCells)
      : phase === 'error' ? t[errorKey] : t[phase];
    input.setAttribute('aria-invalid', String(phase === 'error' && ['validation','invalidCsv','header','tooLarge','cellLimit','emptyInput'].includes(errorKey)));
    errors.replaceChildren();
    const fields = responseData && responseData.error && responseData.error.details && responseData.error.details.fields;
    if (phase === 'error' && Array.isArray(fields)) fields.slice(0, 4).forEach(field => {
      if (!Number.isInteger(field.row) || field.row < 0 || typeof field.source !== 'string') return;
      const type = {integer:t.integerType,string:t.stringType,boolean:t.booleanType}[field.expected] || field.expected;
      const item = document.createElement('li');
      item.textContent = field.code === 'MISSING_FIELD' ? t.missing(field.row + 1, field.source.slice(0, 64))
        : t.field(field.row + 1, field.source.slice(0, 64), String(type).slice(0, 64));
      errors.append(item);
    });
    errors.hidden = errors.childElementCount === 0;
    byId('empty-result').hidden = phase === 'success';
    container.hidden = phase !== 'success';
    container.replaceChildren();
    if (phase === 'success') {
      const table = document.createElement('table'), caption = document.createElement('caption');
      caption.textContent = t.tableCaption; table.append(caption);
      const head = document.createElement('thead'), heading = document.createElement('tr');
      schema.forEach(field => { const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = field.target; heading.append(cell); });
      head.append(heading); table.append(head);
      const body = document.createElement('tbody');
      responseData.data.forEach(record => {
        const row = document.createElement('tr');
        schema.forEach(field => { const cell = document.createElement('td'); cell.textContent = JSON.stringify(record[field.target]); row.append(cell); });
        body.append(row);
      });
      table.append(body); container.append(table);
    }
    byId('response-details').hidden = responseData === null;
    byId('response-json').textContent = responseData === null ? '' : JSON.stringify(responseData, null, 2);
  }

  function fail(key, data = null) { phase = 'error'; errorKey = key; responseData = data; render(); }
  function clear(nextPhase) {
    phase = nextPhase; responseData = null; errorKey = null;
    byId('response-details').open = false; render();
  }
  async function readResponse(response) {
    if (!response.headers.get('content-type')?.toLowerCase().includes('application/json') || !response.body) throw new Error('unexpected');
    const reader = response.body.getReader(), decoder = new TextDecoder('utf-8', {fatal:true});
    let text = '', bytes = 0;
    try {
      for (;;) {
        const chunk = await reader.read(); if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > 65536) { await reader.cancel(); throw new Error('unexpected'); }
        text += decoder.decode(chunk.value, {stream:true});
      }
      return JSON.parse(text + decoder.decode());
    } finally { reader.releaseLock(); }
  }
  function validSuccess(value) {
    return value && value.ok === true && Array.isArray(value.data) && value.data.length <= 100 &&
      value.summary && Number.isInteger(value.summary.outputRows) && value.summary.outputRows === value.data.length &&
      Number.isInteger(value.summary.convertedCells) && value.summary.convertedCells >= 0 && value.summary.convertedCells <= 400 &&
      value.data.every(row => row && typeof row.id === 'string' && typeof row.name === 'string' &&
        Number.isSafeInteger(row.quantity) && typeof row.available === 'boolean');
  }
  byId('demo-form').addEventListener('submit', async event => {
    event.preventDefault(); if (phase === 'pending') return;
    if (!input.value.trim()) { fail('emptyInput'); return; }
    const body = JSON.stringify({format:'csv',data:input.value,schema});
    if (new TextEncoder().encode(body).byteLength > 32768) { fail('tooLarge'); return; }
    clear('pending');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('/v1/transform', {
        method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'}, body,
        credentials:'omit', cache:'no-store', redirect:'error', signal:controller.signal
      });
      const data = await readResponse(response);
      if (response.status === 200 && validSuccess(data)) { responseData = data; phase = 'success'; errorKey = null; render(); }
      else if (!response.ok) {
        const code = data && data.error && data.error.code;
        const key = {VALIDATION_FAILED:'validation',INVALID_CSV:'invalidCsv',CSV_COLUMN_COUNT:'invalidCsv',
          INVALID_CSV_HEADER:'header',BODY_LIMIT:'tooLarge',ROW_LIMIT:'tooLarge',CELL_LIMIT:'cellLimit',
          FIELD_LIMIT:'cellLimit',OUTPUT_LIMIT:'tooLarge'}[code];
        fail(key || (response.status >= 500 ? 'server' : 'unexpected'), data);
      } else fail('unexpected', data);
    } catch (error) {
      fail(controller.signal.aborted ? 'timeout' : error.message === 'unexpected' || error instanceof SyntaxError ? 'unexpected' : 'network');
    } finally { clearTimeout(timeout); }
  });
  reset.addEventListener('click', () => { if (phase === 'pending') return; input.value = initialCsv; clear('idle'); input.focus(); });
  input.addEventListener('input', () => { if (phase !== 'edited') clear('edited'); });
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    language = button.dataset.language === 'en' ? 'en' : 'ru'; render();
  }));
  render();
})();`;

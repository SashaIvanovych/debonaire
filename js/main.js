// ==================================================================== Burger =======================================================
let bodyLockStatus = true;
let bodyLock = (delay = 500) => {
    let body = document.querySelector("body");
    if (bodyLockStatus) {
        let lock_padding = document.querySelectorAll("[data-lp]");
        for (let index = 0; index < lock_padding.length; index++) {
            const el = lock_padding[index];
            el.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
        }
        body.style.paddingRight = window.innerWidth - document.querySelector('.wrapper').offsetWidth + 'px';
        document.documentElement.classList.add("lock");

        bodyLockStatus = false;
        setTimeout(function () {
            bodyLockStatus = true;
        }, delay);
    }
}

let bodyLockToggle = (delay = 500) => {
    if (document.documentElement.classList.contains('lock')) {
        bodyUnlock(delay);
    } else {
        bodyLock(delay);
    }
}

let bodyUnlock = (delay = 500) => {
    let body = document.querySelector("body");
    if (bodyLockStatus) {
        let lock_padding = document.querySelectorAll("[data-lp]");
        setTimeout(() => {
            for (let index = 0; index < lock_padding.length; index++) {
                const el = lock_padding[index];
                el.style.paddingRight = '0px';
            }
            body.style.paddingRight = '0px';
            document.documentElement.classList.remove("lock");
        }, delay);
        bodyLockStatus = false;
        setTimeout(function () {
            bodyLockStatus = true;
        }, delay);
    }
}

function menuInit() {
    if (document.querySelector(".icon-menu")) {
        document.addEventListener("click", function (e) {
            if (bodyLockStatus && e.target.closest('.icon-menu')) {
                bodyLockToggle();
                document.documentElement.classList.toggle("menu-open");
            }
        });
    };
}
function menuOpen() {
    bodyLock();
    document.documentElement.classList.add("menu-open");
}
function menuClose() {
    bodyUnlock();
    document.documentElement.classList.remove("menu-open");
}

menuInit();

// ==================================================================== Watcher =======================================================
// Спостерігач об'єктів [всевидюче око]
// data-watch - можна писати значення для застосування кастомного коду
// data-watch-root - батьківський елемент всередині якого спостерігати за об'єктом
// data-watch-margin -відступ
// data-watch-threshold - відсоток показу об'єкта для спрацьовування
// data-watch-once - спостерігати лише один раз
// _watcher-view - клас який додається за появи об'єкта
function uniqArray(array) {
    return array.filter(function (item, index, self) {
        return self.indexOf(item) === index;
    });
}

class ScrollWatcher {
    constructor(props) {
        let defaultConfig = {
            logging: true,
        };
        this.config = Object.assign(defaultConfig, props);
        this.observer;

        // Перевірка, чи є вже клас 'watcher' на кореневому елементі
        if (!document.documentElement.classList.contains('watcher')) {
            this.scrollWatcherRun();
        }
    }

    // Оновлення конструктора
    scrollWatcherUpdate() {
        this.scrollWatcherRun();
    }

    // Запуск конструктора
    scrollWatcherRun() {
        document.documentElement.classList.add('watcher');
        this.scrollWatcherConstructor(document.querySelectorAll('[data-watch]'));
    }

    // Конструктор спостерігачів
    scrollWatcherConstructor(items) {
        if (items.length) {
            this.scrollWatcherLogging(`Прокинувся, стежу за об'єктами (${items.length})...`);
            let uniqParams = uniqArray(Array.from(items).map(item => `${item.dataset.watchRoot ? item.dataset.watchRoot : null}|${item.dataset.watchMargin ? item.dataset.watchMargin : '0px'}|${item.dataset.watchThreshold ? item.dataset.watchThreshold : 0}`));

            uniqParams.forEach(uniqParam => {
                let uniqParamArray = uniqParam.split('|');
                let paramsWatch = {
                    root: uniqParamArray[0],
                    margin: uniqParamArray[1],
                    threshold: uniqParamArray[2]
                };

                let groupItems = Array.from(items).filter(item => {
                    let watchRoot = item.dataset.watchRoot ? item.dataset.watchRoot : null;
                    let watchMargin = item.dataset.watchMargin ? item.dataset.watchMargin : '0px';
                    let watchThreshold = item.dataset.watchThreshold ? item.dataset.watchThreshold : 0;
                    return (
                        String(watchRoot) === paramsWatch.root &&
                        String(watchMargin) === paramsWatch.margin &&
                        String(watchThreshold) === paramsWatch.threshold
                    );
                });

                let configWatcher = this.getScrollWatcherConfig(paramsWatch);
                this.scrollWatcherInit(groupItems, configWatcher);
            });
        } else {
            this.scrollWatcherLogging("Сплю, немає об'єктів для стеження. ZzzZZzz");
        }
    }

    // Функція створення налаштувань
    getScrollWatcherConfig(paramsWatch) {
        let configWatcher = {};
        if (document.querySelector(paramsWatch.root)) {
            configWatcher.root = document.querySelector(paramsWatch.root);
        } else if (paramsWatch.root !== 'null') {
            this.scrollWatcherLogging(`Емм... батьківського об'єкта ${paramsWatch.root} немає на сторінці`);
        }

        configWatcher.rootMargin = paramsWatch.margin;
        if (paramsWatch.margin.indexOf('px') < 0 && paramsWatch.margin.indexOf('%') < 0) {
            this.scrollWatcherLogging(`Йой, налаштування data-watch-margin потрібно задавати в PX або %`);
            return;
        }

        if (paramsWatch.threshold === 'prx') {
            paramsWatch.threshold = [];
            for (let i = 0; i <= 1.0; i += 0.005) {
                paramsWatch.threshold.push(i);
            }
        } else {
            paramsWatch.threshold = paramsWatch.threshold.split(',');
        }
        configWatcher.threshold = paramsWatch.threshold;

        return configWatcher;
    }

    // Функція створення нового спостерігача зі своїми налаштуваннями
    scrollWatcherCreate(configWatcher) {
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                this.scrollWatcherCallback(entry, observer);
            });
        }, configWatcher);
    }

    // Функція ініціалізації спостерігача зі своїми налаштуваннями
    scrollWatcherInit(items, configWatcher) {
        this.scrollWatcherCreate(configWatcher);
        items.forEach(item => this.observer.observe(item));
    }

    // Функція обробки базових дій точок спрацьовування
    scrollWatcherIntersecting(entry, targetElement) {
        if (entry.isIntersecting) {
            !targetElement.classList.contains('_watcher-view') ? targetElement.classList.add('_watcher-view') : null;
            this.scrollWatcherLogging(`Я бачу ${targetElement.classList}, додав клас _watcher-view`);
        } else {
            targetElement.classList.contains('_watcher-view') ? targetElement.classList.remove('_watcher-view') : null;
            this.scrollWatcherLogging(`Я не бачу ${targetElement.classList}, прибрав клас _watcher-view`);
        }
    }

    // Функція вимкнення стеження за об'єктом
    scrollWatcherOff(targetElement, observer) {
        observer.unobserve(targetElement);
        this.scrollWatcherLogging(`Я перестав стежити за ${targetElement.classList}`);
    }

    // Функція виведення в консоль
    scrollWatcherLogging(message) {
        this.config.logging ? console.log(`[Спостерігач]: ${message}`) : null;
    }

    // Функція обробки спостереження
    scrollWatcherCallback(entry, observer) {
        const targetElement = entry.target;
        this.scrollWatcherIntersecting(entry, targetElement);

        if (targetElement.hasAttribute('data-watch-once') && entry.isIntersecting) {
            this.scrollWatcherOff(targetElement, observer);
        }

        document.dispatchEvent(new CustomEvent("watcherCallback", {
            detail: {
                entry: entry
            }
        }));
    }
}

new ScrollWatcher({});

// ================================================================ header scroll =====================================================
let addWindowScrollEvent = false;

function headerScroll() {
    addWindowScrollEvent = true;
    const header = document.querySelector('header.header');
    const headerShow = header.hasAttribute('data-scroll-show');
    const headerShowTimer = header.dataset.scrollShow ? header.dataset.scrollShow : 500;
    const startPoint = header.dataset.scroll ? header.dataset.scroll : 1;
    let scrollDirection = 0;
    let timer;
    document.addEventListener("windowScroll", function (e) {
        const scrollTop = window.scrollY;
        clearTimeout(timer);
        if (scrollTop >= startPoint) {
            !header.classList.contains('header-scroll') ? header.classList.add('header-scroll') : null;
            if (headerShow) {
                if (scrollTop > scrollDirection) {
                    // downscroll code
                    header.classList.contains('header-show') ? header.classList.remove('header-show') : null;
                } else {
                    // upscroll code
                    !header.classList.contains('header-show') ? header.classList.add('header-show') : null;
                }
                timer = setTimeout(() => {
                    !header.classList.contains('header-show') ? header.classList.add('header-show') : null;
                }, headerShowTimer);
            }
        } else {
            header.classList.contains('header-scroll') ? header.classList.remove('header-scroll') : null;
            if (headerShow) {
                header.classList.contains('header-show') ? header.classList.remove('header-show') : null;
            }
        }
        scrollDirection = scrollTop <= 0 ? 0 : scrollTop;
    });
}

headerScroll();

setTimeout(() => {
    if (addWindowScrollEvent) {
        let windowScroll = new Event("windowScroll");
        window.addEventListener("scroll", function (e) {
            document.dispatchEvent(windowScroll);
        });
    }
}, 0);

// ==================================================================== Paralax =======================================================
/*
Параметри data-атрибутів для налаштування ефекту паралаксу:

1. Для батьківського елемента ([data-prlx-parent]):
   - data-prlx-smooth: Визначає плавність анімації. За замовчуванням 15. Більше значення - більш плавний ефект.
   - data-prlx-center: Визначає точку відліку для паралаксу. Можливі значення:
      * "top": верхня точка екрану
      * "center": центр екрану (за замовчуванням)
      * "bottom": нижня точка екрану
    data-prlx-disable-width="992"  
 
2. Для дочірніх елементів ([data-prlx]):
   - data-axis: Визначає вісь руху. Можливі значення:
      * "v": вертикальний рух (за замовчуванням)
      * "h": горизонтальний рух
   - data-direction: Визначає напрямок руху. Якщо не вказано, рух відбувається в протилежному напрямку прокрутки.
   - data-coefficient: Коефіцієнт швидкості руху. За замовчуванням 5. Менше значення - швидший рух.
   - data-properties: Додаткові CSS властивості трансформації, які будуть додані до елемента.
*/

class Parallax {
    constructor(elements) {
        if (elements.length) {
            this.elements = Array.from(elements).map((el) => (
                new Parallax.Each(el)
            ));
        }
    }
}

Parallax.Each = class {
    constructor(parent) {
        this.parent = parent;
        this.elements = this.parent.querySelectorAll('[data-prlx]');
        this.animation = this.animationFrame.bind(this);
        this.offset = 0;
        this.value = 0;
        this.smooth = parent.dataset.prlxSmooth ? Number(parent.dataset.prlxSmooth) : 15;
        // Set to 0 if attribute is not present, meaning parallax is always enabled
        this.disableWidth = parent.dataset.prlxDisableWidth ? Number(parent.dataset.prlxDisableWidth) : 0;
        this.setEvents();
    }

    setEvents() {
        this.animationID = window.requestAnimationFrame(this.animation);
    }

    animationFrame() {
        const windowWidth = window.innerWidth;

        // Check if parallax should be disabled based on screen width
        if (windowWidth < this.disableWidth) {
            this.elements.forEach(el => {
                el.style.transform = 'none';
            });
            this.animationID = window.requestAnimationFrame(this.animation);
            return;
        }

        const topToWindow = this.parent.getBoundingClientRect().top;
        const heightParent = this.parent.offsetHeight;
        const heightWindow = window.innerHeight;
        const positionParent = {
            top: topToWindow - heightWindow,
            bottom: topToWindow + heightParent,
        }
        const centerPoint = this.parent.dataset.prlxCenter || 'center';

        if (positionParent.top < 30 && positionParent.bottom > -30) {
            switch (centerPoint) {
                case 'top':
                    this.offset = -1 * topToWindow;
                    break;
                case 'center':
                    this.offset = (heightWindow / 2) - (topToWindow + (heightParent / 2));
                    break;
                case 'bottom':
                    this.offset = heightWindow - (topToWindow + heightParent);
                    break;
            }
        }

        this.value += (this.offset - this.value) / this.smooth;
        this.animationID = window.requestAnimationFrame(this.animation);

        this.elements.forEach(el => {
            const parameters = {
                axis: el.dataset.axis || 'v',
                direction: el.dataset.direction ? el.dataset.direction + '1' : '-1',
                coefficient: el.dataset.coefficient ? Number(el.dataset.coefficient) : 5,
                additionalProperties: el.dataset.properties || '',
            }
            this.parameters(el, parameters);
        });
    }

    parameters(el, parameters) {
        if (parameters.axis == 'v') {
            el.style.transform = `translate3D(0, ${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0) ${parameters.additionalProperties}`;
        } else if (parameters.axis == 'h') {
            el.style.transform = `translate3D(${(parameters.direction * (this.value / parameters.coefficient)).toFixed(2)}px,0,0) ${parameters.additionalProperties}`;
        }
    }
}

// Ініціалізація паралаксу
if (document.querySelectorAll('[data-prlx-parent]')) {
    new Parallax(document.querySelectorAll('[data-prlx-parent]'));
}

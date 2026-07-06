/* ==========================================================================
   ВАЛИДАЦИЯ ФОРМ
   ========================================================================== */

(function() {
  "use strict";

  const CONFIG = {
    patterns: {
      phone: /^(\+375|375|80)(29|25|44|33|17)\d{7}$/,
      name: /^[А-Яа-яA-Za-z\s\-']{2,}$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    messages: {
      name: 'Имя должно содержать только буквы (минимум 2 символа)',
      phone: 'Введите номер в формате +375 (XX) XXX-XX-XX',
      phoneRequired: 'Введите номер телефона',
      email: 'Введите корректный email',
      message: 'Сообщение должно содержать минимум 10 символов',
      required: 'Это поле обязательно для заполнения',
    }
  };

  // ── Плавное удаление элемента ──
  function removeWithAnimation(element, className = 'is-hiding', delay = 300) {
    if (!element) return;
    element.classList.add(className);
    setTimeout(() => {
      if (element.parentNode) {
        element.remove();
      }
    }, delay);
  }

  // ── Форматирование телефона ──
  function formatPhone(input) {
    const cursorPosBefore = input.selectionStart;
    const valueBefore = input.value;

    let digits = input.value.replace(/\D/g, '');

    if (input.value === '+') {
      return '';
    }

    if (digits.length > 12) digits = digits.substring(0, 12);

    if (digits.startsWith('8') && digits.length >= 1) {
      digits = '375' + digits.substring(1);
    }

    let formatted = '';
    if (digits.length === 0) {
      formatted = '';
    } else if (digits.length <= 3) {
      formatted = '+' + digits;
    } else if (digits.length <= 5) {
      formatted = '+' + digits.substring(0, 3) + ' (' + digits.substring(3);
    } else if (digits.length <= 8) {
      formatted = '+' + digits.substring(0, 3) + ' (' + digits.substring(3, 5) + ') ' + digits.substring(5);
    } else if (digits.length <= 10) {
      formatted = '+' + digits.substring(0, 3) + ' (' + digits.substring(3, 5) + ') ' + digits.substring(5, 8) + '-' + digits.substring(8);
    } else {
      formatted = '+' + digits.substring(0, 3) + ' (' + digits.substring(3, 5) + ') ' + digits.substring(5, 8) + '-' + digits.substring(8, 10) + '-' + digits.substring(10, 12);
    }

    input.value = formatted;

    const diff = formatted.length - valueBefore.length;
    const newCursor = Math.max(0, cursorPosBefore + diff);
    try {
      input.setSelectionRange(newCursor, newCursor);
    } catch (_) {}

    return digits;
  }

  // ── Создать подсказку ──
  function createHint(field, type) {
    const oldHint = field.parentElement.querySelector('.field-hint');
    if (oldHint) oldHint.remove();

    const hint = document.createElement('span');
    hint.className = 'field-hint';
    // Уникальный id для связи с полем через aria-describedby
    hint.id = `hint-${field.id}`;

    let hintText = '';
    let exampleText = '';

    switch (type) {
      case 'name':
        hintText = CONFIG.messages.name;
        exampleText = 'Например: Иван';
        break;
      case 'phone':
        hintText = CONFIG.messages.phone;
        exampleText = 'Например: +375 (29) 123-45-67';
        break;
      case 'email':
        hintText = CONFIG.messages.email;
        exampleText = 'Например: example@mail.com';
        break;
      case 'message':
        hintText = CONFIG.messages.message;
        exampleText = 'Напишите кратко о вашем проекте';
        break;
      default:
        return;
    }

    hint.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="12" x2="12" y2="16"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
      <span>${hintText}</span>
      <small>${exampleText}</small>
    `;

    field.parentElement.appendChild(hint);
    // Связываем подсказку с полем — скринридер объявит её содержимое при фокусе на поле
    field.setAttribute('aria-describedby', hint.id);
  }

  // ── Показать подсказку ──
  function showHint(field, type) {
    const oldHint = field.parentElement.querySelector('.field-hint');
    if (oldHint) {
      if (oldHint.classList.contains('is-hiding')) return;
      removeWithAnimation(oldHint);
      setTimeout(() => {
        createHint(field, type);
      }, 300);
      return;
    }
    createHint(field, type);
  }

  // ── Скрыть подсказку плавно ──
  function hideHint(field) {
    const hint = field.parentElement.querySelector('.field-hint');
    if (hint) {
      if (hint.classList.contains('is-hiding')) return;
      removeWithAnimation(hint);
      field.removeAttribute('aria-describedby');
    }
  }

  // ── Показать ошибку ──
  function showError(field, message) {
    const oldError = field.parentElement.querySelector('.field-error');
    if (oldError) {
      oldError.remove();
    }

    const oldHint = field.parentElement.querySelector('.field-hint');
    if (oldHint) {
      oldHint.remove();
      field.removeAttribute('aria-describedby');
    }

    const error = document.createElement('span');
    error.className = 'field-error';
    error.textContent = message;
    error.setAttribute('role', 'alert');
    field.parentElement.appendChild(error);

    field.classList.remove('is-valid');
    field.classList.add('is-error', 'shake');
    setTimeout(() => field.classList.remove('shake'), 500);
  }

  // ── Очистка ошибок ──
  function clearErrors(field, keepHint = false) {
    field.classList.remove('is-error', 'is-valid', 'shake');

    const error = field.parentElement.querySelector('.field-error');
    if (error) error.remove();

    if (!keepHint) {
      const hint = field.parentElement.querySelector('.field-hint');
      if (hint) {
        hint.remove();
        field.removeAttribute('aria-describedby');
      }
    }
  }

  // ── Основная валидация поля ──
  function validateField(field) {
    const type = field.dataset.validate || field.type;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    clearErrors(field, true);

    if (field.required && !value) {
      isValid = false;
      errorMessage = CONFIG.messages.required;
      showError(field, errorMessage);
      return false;
    }

    if (value) {
      switch (type) {
        case 'name':
          if (!CONFIG.patterns.name.test(value)) {
            isValid = false;
            errorMessage = CONFIG.messages.name;
          }
          break;
        case 'phone':
          const cleanPhone = value.replace(/\D/g, '');
          if (cleanPhone.length === 0) {
            isValid = false;
            errorMessage = CONFIG.messages.phoneRequired;
          } else if (!CONFIG.patterns.phone.test(cleanPhone) || cleanPhone.length < 11) {
            isValid = false;
            errorMessage = CONFIG.messages.phone;
          }
          break;
        case 'email':
          if (!CONFIG.patterns.email.test(value)) {
            isValid = false;
            errorMessage = CONFIG.messages.email;
          }
          break;
        case 'message':
          if (value.length < 10) {
            isValid = false;
            errorMessage = CONFIG.messages.message;
          }
          break;
      }
    }

    if (!isValid && value) {
      showError(field, errorMessage);
    } else if (isValid && value) {
      field.classList.add('is-valid');
      hideHint(field);
    }

    return isValid;
  }

  // ── Валидация всей формы ──
  function validateForm(form) {
    const fields = form.querySelectorAll('[data-validate], [required]');
    let isValid = true;

    fields.forEach(field => {
      if (field.dataset.validate === 'phone' || field.type === 'tel') {
        const clean = formatPhone(field);
        if (clean.length > 0 && clean.length < 12) {
          showError(field, CONFIG.messages.phone);
          isValid = false;
          return;
        }
      }

      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  // ── Инициализация формы ──
  function initForm(form) {
    const fields = form.querySelectorAll('[data-validate], [required]');

    fields.forEach(field => {
      field.addEventListener('input', function() {
        if (this.dataset.validate === 'phone' || this.type === 'tel') {
          const clean = formatPhone(this);
          if (clean.length > 0) {
            validateField(this);
          } else {
            clearErrors(this);
          }
        } else {
          validateField(this);
        }
      });

      field.addEventListener('blur', function() {
        if (this.value.trim() || this.required) {
          validateField(this);
        }
        hideHint(this);
      });

      field.addEventListener('focus', function() {
        if (!this.value.trim()) {
          const type = this.dataset.validate || this.type;
          if (['name', 'phone', 'email', 'message'].includes(type)) {
            showHint(this, type);
          }
        }
      });
    });

    form.addEventListener('submit', function(e) {
      console.log('📤 Отправка формы, проверяем валидацию...');

      fields.forEach(field => hideHint(field));

      const isValid = validateForm(form);

      if (!isValid) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.log('❌ Форма содержит ошибки');
        const firstError = this.querySelector('.is-error');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return false;
      }
    });
  }

  // ── Инициализация всех форм ──
  function initAllForms() {

    const modalForm = document.getElementById('modalContactForm');
    if (modalForm) {
      initForm(modalForm);
    }

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      initForm(contactForm);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllForms);
  } else {
    initAllForms();
  }

})();
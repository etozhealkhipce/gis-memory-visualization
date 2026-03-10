# Ghost Memory Lab

**Интерактивная демонстрация Memory & Context Poisoning** в стиле Ghost in the Shell.

## Быстрый старт (k3s)

```bash
# Сборка образа
docker build -t ghost-memory-lab:latest .

# Загрузка в registry (при необходимости)
docker tag ghost-memory-lab:latest your-registry/ghost-memory-lab:latest
docker push your-registry/ghost-memory-lab:latest
```

### Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `OPENAI_API_KEY` | API ключ OpenAI | Нет (без него работает mock-режим) |

### Пример Secret для k3s

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ghost-memory-lab-secrets
type: Opaque
stringData:
  OPENAI_API_KEY: "sk-your-key-here"
```

### Пример Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ghost-memory-lab
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ghost-memory-lab
  template:
    metadata:
      labels:
        app: ghost-memory-lab
    spec:
      containers:
        - name: app
          image: ghost-memory-lab:latest
          ports:
            - containerPort: 3000
          envFrom:
            - secretRef:
                name: ghost-memory-lab-secrets  # опционально
          livenessProbe:
            httpGet:
              path: /api/status
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /api/status
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
```

## Описание

Концептуальная интерактивная иллюстрация для темы **ASI06: Memory & Context Poisoning**. Приложение показывает, как подмена памяти LLM-агента может изменить его поведение и ответы.

### Возможности

- 🧠 **Визуализация памяти** - интерактивный граф memory nodes со связями
- 💉 **Инъекция ложных воспоминаний** - демонстрация memory poisoning
- 💬 **Чат с агентом** - сравнение ответов до и после инъекции
- 🔄 **4 сценария атак** - False Trust, Privilege Escalation, Project Manipulation, User Preference
- 📊 **Сравнение ответов** - side-by-side diff view

## Локальная разработка

```bash
# Установка зависимостей
npm install

# Dev сервер
npm run dev
```

### OpenAI API (опционально)

Для использования реального OpenAI API:

```bash
# Создать .env.local
echo "OPENAI_API_KEY=sk-your-key" > .env.local

# Перезапустить
npm run dev
```

Без API ключа работает **mock-режим** с готовыми ответами для демо.

## Использование

1. Выберите сценарий (например, "False Trust Injection")
2. Нажмите **ASK DEMO QUESTION** - получите ответ "ДО"
3. Нажмите **INJECT FALSE MEMORY** - в граф добавится ложное воспоминание
4. Задайте тот же вопрос снова - получите противоположный ответ "ПОСЛЕ"

## Технологии

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS + shadcn/ui
- React Flow (граф памяти)
- OpenAI API (опционально)

## Терминология (Ghost in the Shell)

- **Neural Memory Map** - граф памяти
- **Ghost Trace** - лог рассуждений
- **Injected Context** - внедрённый ложный контекст
- **Cyberbrain** - интерфейс управления

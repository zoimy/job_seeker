# Быстрая Проверка Профиля

## Шаг 1: Получить User ID

1. Откройте https://job-seeker-dusky.vercel.app в браузере
2. Нажмите **F12** (открыть DevTools)
3. Перейдите на вкладку **Console**
4. Введите команду:
   ```javascript
   localStorage.getItem('job_tracker_user_id')
   ```
5. Скопируйте UUID (будет выглядеть как: `"abc12345-1234-1234-1234-123456789abc"`)

## Шаг 2: Проверить профиль через API

Замените `YOUR_USER_ID_HERE` на скопированный UUID и выполните:

```bash
curl -H "x-user-id: YOUR_USER_ID_HERE" \
     https://job-seeker-p8zi.onrender.com/api/profile
```

## Ожидаемые результаты:

### ✅ Если профиль существует:
```json
{
  "profile": {
    "userId": "...",
    "name": "Ваше имя",
    "role": "Ваша роль",
    "skills": ["React", "Node.js", ...],
    "experienceLevel": "Middle",
    ...
  }
}
```

### ❌ Если профиля нет:
```json
{
  "profile": null
}
```

Это значит что onboarding не был завершён или профиль не сохранился.

## Шаг 3: Если профиль NULL - проверить onboarding

1. Откройте https://job-seeker-dusky.vercel.app
2. Должно показать экран onboarding (приветствие)
3. Пройдите onboarding заново
4. После завершения проверьте профиль снова

## Альтернатива: Использовать скрипт

Я создал скрипт который делает всё автоматически:

```bash
cd /Users/w1sqvet/Desktop/job_tracker
./test-profile-api.sh
```

Он попросит вас ввести User ID и покажет полную информацию.

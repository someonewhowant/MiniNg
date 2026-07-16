# Фаза 3: Dependency Injection (DI)

В данной фазе реализован встроенный IoC-контейнер для автоматического внедрения зависимостей.

## 1. Декоратор `@Injectable`
Файл: `src/core/decorators/injectable.ts`

Простой декоратор класса, который помечает сервис с помощью метаданных (`reflect-metadata`), чтобы контейнер знал о его доступности для DI.

## 2. DI Container
Файл: `src/core/di/container.ts`

Класс `DIContainer` реализует паттерн SingletonRegistry.
Алгоритм метода `resolve()`:
1. Проверяет наличие инстанса в кэше (`registry`). Если есть — возвращает его.
2. Читает типы аргументов конструктора через `Reflect.getMetadata('design:paramtypes', target)`.
3. Рекурсивно вызывает `resolve()` для каждого типа-зависимости.
4. Создает новый инстанс с уже разрешенными зависимостями: `new target(...dependencies)`.
5. Сохраняет созданный инстанс в кэш.

## 3. Интеграция с Renderer
В `Renderer.render()` создание класса заменено с прямого `new ComponentClass()` на вызов глобального `container.resolve(ComponentClass)`.
Теперь все UI-компоненты автоматически получают нужные сервисы в конструкторе.

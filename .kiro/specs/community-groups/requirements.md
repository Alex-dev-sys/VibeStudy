# Requirements Document

## Introduction

Данный документ описывает требования к функциональности "Группы" в разделе "Сообщество VibeStudy". Функция позволяет пользователям создавать учебные группы, присоединяться к существующим группам, общаться с участниками и совместно изучать программирование.

## Glossary

- **System**: Платформа VibeStudy с функциональностью групп
- **User**: Зарегистрированный пользователь платформы VibeStudy
- **Group**: Учебная группа пользователей с общими интересами или целями
- **Group Owner**: Пользователь, создавший группу
- **Group Member**: Пользователь, присоединившийся к группе
- **Group Chat**: Чат для общения участников группы
- **Community Section**: Раздел "Сообщество VibeStudy" в приложении
- **Group List**: Список доступных групп
- **Group Card**: Карточка группы с основной информацией

## Requirements

### Requirement 1

**User Story:** Как пользователь, я хочу просматривать список доступных групп, чтобы найти подходящую группу для совместного обучения

#### Acceptance Criteria

1. WHEN User открывает раздел "Группы" в Community Section, THEN THE System SHALL отобразить список всех доступных групп
2. THE System SHALL отображать для каждой Group Card название группы, количество участников, язык программирования и краткое описание
3. THE System SHALL предоставить возможность фильтрации Group List по языку программирования
4. THE System SHALL предоставить возможность поиска групп по названию
5. THE System SHALL отображать индикатор для групп, в которых User уже является участником

### Requirement 2

**User Story:** Как пользователь, я хочу создать новую группу, чтобы объединить людей с похожими интересами в обучении

#### Acceptance Criteria

1. WHEN User нажимает кнопку "Создать группу", THEN THE System SHALL отобразить форму создания группы
2. THE System SHALL требовать ввод названия группы длиной от 3 до 50 символов
3. THE System SHALL требовать выбор языка программирования из доступного списка
4. THE System SHALL требовать ввод описания группы длиной от 10 до 500 символов
5. WHEN User заполняет все обязательные поля и подтверждает создание, THEN THE System SHALL создать новую группу и назначить User как Group Owner
6. WHEN группа создана, THEN THE System SHALL автоматически добавить User в список Group Member
7. THE System SHALL ограничить максимальное количество групп, создаваемых одним User, до 3 групп

### Requirement 3

**User Story:** Как пользователь, я хочу присоединиться к существующей группе, чтобы учиться вместе с другими участниками

#### Acceptance Criteria

1. WHEN User нажимает кнопку "Присоединиться" на Group Card, THEN THE System SHALL добавить User в список Group Member
2. THE System SHALL отобразить уведомление об успешном присоединении к группе
3. THE System SHALL обновить счетчик участников группы
4. THE System SHALL ограничить максимальное количество групп, в которых User может состоять, до 10 групп
5. IF User уже является Group Member, THEN THE System SHALL отображать кнопку "Открыть" вместо "Присоединиться"

### Requirement 4

**User Story:** Как участник группы, я хочу общаться с другими участниками в групповом чате, чтобы обсуждать учебные вопросы и делиться опытом

#### Acceptance Criteria

1. WHEN User открывает группу, в которой является Group Member, THEN THE System SHALL отобразить Group Chat
2. THE System SHALL отображать историю сообщений в Group Chat в хронологическом порядке
3. WHEN User отправляет сообщение, THEN THE System SHALL сохранить сообщение с меткой времени и именем отправителя
4. THE System SHALL отображать новые сообщения в реальном времени для всех участников группы
5. THE System SHALL ограничить длину одного сообщения до 1000 символов
6. THE System SHALL отображать аватар и имя отправителя для каждого сообщения

### Requirement 5

**User Story:** Как участник группы, я хочу покинуть группу, если она мне больше не интересна

#### Acceptance Criteria

1. WHEN User нажимает кнопку "Покинуть группу", THEN THE System SHALL отобразить диалог подтверждения
2. WHEN User подтверждает выход, THEN THE System SHALL удалить User из списка Group Member
3. THE System SHALL обновить счетчик участников группы
4. THE System SHALL перенаправить User на страницу списка групп
5. IF User является Group Owner и покидает группу, THEN THE System SHALL назначить нового Group Owner из существующих участников

### Requirement 6

**User Story:** Как владелец группы, я хочу управлять настройками группы, чтобы поддерживать актуальную информацию

#### Acceptance Criteria

1. WHEN Group Owner открывает настройки группы, THEN THE System SHALL отобразить форму редактирования
2. THE System SHALL позволить Group Owner изменить название группы
3. THE System SHALL позволить Group Owner изменить описание группы
4. THE System SHALL позволить Group Owner изменить язык программирования группы
5. WHEN Group Owner сохраняет изменения, THEN THE System SHALL обновить информацию о группе
6. IF User не является Group Owner, THEN THE System SHALL скрыть кнопку настроек группы

### Requirement 7

**User Story:** Как владелец группы, я хочу удалить группу, если она больше не нужна

#### Acceptance Criteria

1. WHEN Group Owner нажимает кнопку "Удалить группу", THEN THE System SHALL отобразить диалог подтверждения с предупреждением
2. WHEN Group Owner подтверждает удаление, THEN THE System SHALL удалить группу и все связанные данные
3. THE System SHALL удалить все сообщения Group Chat
4. THE System SHALL уведомить всех Group Member об удалении группы
5. THE System SHALL перенаправить Group Owner на страницу списка групп

### Requirement 8

**User Story:** Как пользователь, я хочу видеть информацию об участниках группы, чтобы знать, кто учится вместе со мной

#### Acceptance Criteria

1. WHEN User открывает группу, THEN THE System SHALL отображать список всех Group Member
2. THE System SHALL отображать для каждого участника аватар, имя и статус онлайн
3. THE System SHALL отображать специальный значок для Group Owner
4. THE System SHALL отображать дату присоединения каждого участника к группе
5. THE System SHALL сортировать список участников с Group Owner в начале списка

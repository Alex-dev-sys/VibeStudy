export const groupsRu = {
  groups: {
    title: 'Группы',
    subtitle: 'Присоединяйтесь к группам или создайте свою',
    createGroup: 'Создать группу',
    joinGroup: 'Присоединиться',
    leaveGroup: 'Покинуть группу',
    deleteGroup: 'Удалить группу',
    openGroup: 'Открыть',
    members: 'Участники',
    member: 'участник',
    members_plural: 'участников',
    chat: 'Чат',
    settings: 'Настройки',
    search: 'Поиск по названию...',
    allLanguages: 'Все языки',
    noGroups: 'Групп не найдено',
    noGroupsDescription: 'Попробуйте изменить фильтры или создайте первую группу',
    loading: 'Загрузка...',
    owner: 'Вы владелец',
    ownerBadge: 'Владелец группы',
    online: 'Онлайн',
    offline: 'Оффлайн',
    joined: 'Присоединился',
    today: 'Сегодня',
    yesterday: 'Вчера',
    
    // Create Group Dialog
    createDialog: {
      title: 'Создать группу',
      subtitle: 'Создайте группу для совместного обучения',
      nameLabel: 'Название группы',
      namePlaceholder: 'Python для начинающих',
      descriptionLabel: 'Описание',
      descriptionPlaceholder: 'Изучаем Python с нуля. Обсуждаем задачи, помогаем друг другу.',
      languageLabel: 'Язык программирования',
      create: 'Создать',
      cancel: 'Отмена',
      nameRequired: 'Название обязательно',
      nameMinLength: 'Минимум 3 символа',
      nameMaxLength: 'Максимум 50 символов',
      descriptionRequired: 'Описание обязательно',
      descriptionMinLength: 'Минимум 10 символов',
      descriptionMaxLength: 'Максимум 500 символов',
      languageRequired: 'Выберите язык',
      charactersCount: 'символов'
    },
    
    // Settings Dialog
    settingsDialog: {
      title: 'Настройки группы',
      subtitle: 'Редактируйте информацию о группе',
      save: 'Сохранить',
      cancel: 'Отмена',
      dangerZone: 'Опасная зона',
      deleteButton: 'Удалить группу',
      deleteTitle: 'Удалить группу?',
      deleteWarning: 'Это действие нельзя отменить. Все сообщения и данные группы будут удалены навсегда.',
      deleteConfirm: 'Вы собираетесь удалить группу',
      deleteForever: 'Удалить навсегда'
    },
    
    // Chat
    chatMessages: {
      noMessages: 'Пока нет сообщений',
      startConversation: 'Начните общение!',
      loadingMessages: 'Загрузка сообщений...',
      messagePlaceholder: 'Написать сообщение... (Enter для отправки, Shift+Enter для новой строки)',
      user: 'Пользователь'
    },
    
    // Members
    membersSection: {
      title: 'Участники',
      noMembers: 'Пока нет участников'
    },
    
    // Notices
    notices: {
      authRequired: 'Войдите в систему, чтобы создавать группы и присоединяться к ним',
      authRequiredChat: 'Войдите в систему, чтобы общаться в группе',
      notMember: 'Вы не являетесь участником этой группы',
      comingSoon: 'Этот раздел сообщества скоро будет доступен! Следите за обновлениями.',
      login: 'Войти',
      backToList: 'Вернуться к списку'
    },
    
    // Errors
    errors: {
      GROUP_NOT_FOUND: 'Группа не найдена',
      UNAUTHORIZED: 'Необходима авторизация',
      MAX_GROUPS_CREATED: 'Вы можете создать максимум 3 группы',
      MAX_GROUPS_JOINED: 'Вы можете состоять максимум в 10 группах',
      ALREADY_MEMBER: 'Вы уже участник этой группы',
      NOT_MEMBER: 'Вы не являетесь участником этой группы',
      VALIDATION_ERROR: 'Ошибка валидации данных',
      DATABASE_ERROR: 'Ошибка базы данных',
      FAILED_TO_CREATE: 'Не удалось создать группу',
      FAILED_TO_UPDATE: 'Не удалось обновить группу',
      FAILED_TO_DELETE: 'Не удалось удалить группу',
      FAILED_TO_JOIN: 'Не удалось присоединиться к группе',
      FAILED_TO_LEAVE: 'Не удалось покинуть группу',
      FAILED_TO_SEND_MESSAGE: 'Не удалось отправить сообщение',
      MESSAGE_TOO_LONG: 'Сообщение слишком длинное (максимум 1000 символов)',
      MUST_BE_MEMBER: 'Вы должны быть участником группы'
    },
    
    // Success messages
    success: {
      groupCreated: 'Группа успешно создана!',
      groupUpdated: 'Группа успешно обновлена!',
      groupDeleted: 'Группа удалена',
      joined: 'Вы присоединились к группе!',
      left: 'Вы покинули группу'
    }
  }
};

// Инициализация Netlify CMS
CMS.init();

// Кастомный превью для постов
CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;600&display=swap');

// Очистка кэша при публикации
const originalPublish = CMS.store.dispatch;
CMS.store.dispatch = function(action) {
  if (action.type === 'PUBLISH_SUCCESS') {
    // Очищаем кэш статей в localStorage
    localStorage.removeItem('blog_posts_cache');
    console.log('✓ Пост опубликован. Кэш очищен.');
  }
  return originalPublish.apply(CMS.store, arguments);
};

console.log('✓ CMS инициализирована');

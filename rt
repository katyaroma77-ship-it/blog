/**
 * Blog Loader
 * Загружает и отображает статьи с поддержкой мультиязычности
 */

class BlogLoader {
  constructor() {
    this.posts = [];
    this.currentLang = localStorage.getItem('selectedLanguage') || 'de';
    this.init();
  }

  async init() {
    try {
      await this.loadPosts();
      this.render();
      this.setupLanguageSwitcher();
    } catch (error) {
      console.error('Ошибка при загрузке блога:', error);
      this.showError('Ошибка при загрузке статей');
    }
  }

  async loadPosts() {
    // Проверяем кэш
    const cached = localStorage.getItem('blog_posts_cache');
    if (cached) {
      this.posts = JSON.parse(cached);
      return;
    }

    try {
      // Загружаем из GitHub API (если репо на GitHub)
      const response = await fetch('https://api.github.com/repos/artemtarianik/katefinalfix/contents/_posts/blog?ref=main');

      if (!response.ok) {
        throw new Error('Не удалось загрузить посты');
      }

      const files = await response.json();
      const postFiles = files.filter(f => f.name.endsWith('.md') && !f.name.includes('.'));

      for (const file of postFiles) {
        const content = await this.fetchFile(file.download_url);
        const post = this.parseMarkdown(content, file.name);
        if (post) this.posts.push(post);
      }

      // Кэшируем на час
      localStorage.setItem('blog_posts_cache', JSON.stringify(this.posts));
    } catch (error) {
      console.warn('GitHub API не доступен, используем локальные посты');
      await this.loadLocalPosts();
    }
  }

  async loadLocalPosts() {
    // Если GitHub недоступен, загружаем с локального сервера
    try {
      const response = await fetch('/_posts/blog/');
      // Статический сервер может не поддерживать листинг директорий
      // В этом случае нужно хранить список файлов в отдельном манифесте
    } catch (error) {
      console.log('Локальная загрузка блога не настроена');
    }
  }

  async fetchFile(url) {
    const response = await fetch(url);
    return response.text();
  }

  parseMarkdown(content, filename) {
    // Парсим frontmatter
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)/);
    if (!match) return null;

    const [, frontmatter, body] = match;
    const meta = this.parseFrontmatter(frontmatter);

    return {
      slug: filename.replace(/\.(ru|en|de)\.md$/, '').replace(/\.md$/, ''),
      ...meta,
      body: body.trim(),
      filename: filename
    };
  }

  parseFrontmatter(yaml) {
    const result = {};
    yaml.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        let value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        // Парсим boolean
        if (value === 'true') value = true;
        if (value === 'false') value = false;
        result[key.trim()] = value;
      }
    });
    return result;
  }

  render() {
    const container = document.getElementById('blog-posts');
    const loading = document.getElementById('loading');

    if (!container) return;

    // Фильтруем посты по языку и публикации
    const filteredPosts = this.posts.filter(post => {
      return post.lang === this.currentLang && post.published;
    });

    if (loading) loading.style.display = 'none';

    if (filteredPosts.length === 0) {
      container.innerHTML = '<p style="text-align: center; padding: 48px;">Нет опубликованных статей</p>';
      return;
    }

    container.innerHTML = filteredPosts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(post => this.createPostCard(post))
      .join('');
  }

  createPostCard(post) {
    const date = new Date(post.date).toLocaleDateString(this.currentLang === 'ru' ? 'ru-RU' : 'de-DE');
    const excerpt = this.stripMarkdown(post.body).substring(0, 150) + '...';
    const slug = post.slug || post.filename.replace(/\.(ru|en|de)?\.md$/, '');

    return `
      <article class="blog-card reveal">
        ${post.image ? `<div class="blog-card-image"><img src="${post.image}" alt="${post.title}" loading="lazy"></div>` : ''}
        <div class="blog-card-content">
          <h3><a href="blog-post.html?slug=${slug}&lang=${this.currentLang}">${this.escapeHtml(post.title)}</a></h3>
          <p class="blog-meta">${this.escapeHtml(post.author)} • ${date}</p>
          <p class="blog-excerpt">${this.escapeHtml(post.description || excerpt)}</p>
          <a href="blog-post.html?slug=${slug}&lang=${this.currentLang}" class="blog-read-more">
            ${this.currentLang === 'ru' ? 'Читать далее' : this.currentLang === 'en' ? 'Read More' : 'Weiterlesen'} →
          </a>
        </div>
      </article>
    `;
  }

  stripMarkdown(md) {
    return md
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .trim();
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  setupLanguageSwitcher() {
    // Слушаем изменение языка
    document.addEventListener('languageChanged', (e) => {
      this.currentLang = e.detail.lang;
      this.render();
    });
  }

  showError(message) {
    const container = document.getElementById('blog-posts');
    if (container) {
      container.innerHTML = `<p style="color: red; text-align: center; padding: 48px;">${message}</p>`;
    }
  }
}

// Инициализируем при загрузке DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new BlogLoader());
} else {
  new BlogLoader();
}

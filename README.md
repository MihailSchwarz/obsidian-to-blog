# obsidian-to-blog

Генератор статического сайта на основе markdown заметок в приложении Obsidian

## Как начать

### 1. Клонируйте репозиторий

```

git clone https://github.com/MihailSchwarz/obsidian-to-blog.git my-blog-name

```

### 2. Перейдите в папку

```

cd my-blog-name

```

### 3. Установите пакеты

```

npm install

```

### 4. Отредактируйте _data/metadata.json

### 5. Запустите сервер Eleventy

```

npx eleventy --serve --watch

```

### 6. Откройте папку src/posts как базу Obsidian и редактируйте заметки.
[[Как форматировать заметки]]

### 7. Опубликуйте сайт в интернете
Например, используйте APP в [digitalocean](https://m.do.co/c/da01223adc8e). Создайте беплатное приложение APP, подключите github и свой репозиторий. Выберите папку "_site/" для публикации

[![DigitalOcean Referral Badge](https://web-platforms.sfo2.digitaloceanspaces.com/WWW/Badge%203.svg)](https://www.digitalocean.com/?refcode=da01223adc8e&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge)

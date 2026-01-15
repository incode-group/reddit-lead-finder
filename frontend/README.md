# Frontend - Reddit Lead Finder

Мінімалістичний темний дизайн з використанням shadcn/ui компонентів.

## Технології

- **Next.js 14** - React framework з App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Високоякісні React компоненти
- **Radix UI** - Unstyled, accessible компоненти
- **Lucide React** - Іконки

## Структура

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/              # React компоненти
│   ├── ui/                 # shadcn/ui базові компоненти
│   ├── subreddit-selector.tsx
│   ├── statistics-card.tsx
│   ├── lead-card.tsx
│   ├── loading-state.tsx
│   └── error-message.tsx
├── lib/                    # Утиліти
│   └── utils.ts           # cn() helper
└── components.json         # shadcn/ui конфігурація
```

## Встановлення

```bash
cd frontend
npm install
```

## Запуск

```bash
npm run dev
```

Відкрийте [http://localhost:3000](http://localhost:3000)

## Дизайн

- **Тема**: Темна (dark mode)
- **Стиль**: Мінімалістичний, натхненний Supabase/Replit
- **Кольори**: Темні тони з акцентами primary кольору
- **Типографіка**: Inter font

## Компоненти

### Переіспользувані компоненти

- `SubredditSelector` - Вибір субредітів
- `StatisticsCard` - Картка зі статистикою
- `LeadCard` - Картка з лідом
- `LoadingState` - Стан завантаження
- `ErrorMessage` - Повідомлення про помилку

### UI компоненти (shadcn/ui)

- `Button` - Кнопки
- `Card` - Картки
- `Input` - Поля вводу
- `Label` - Мітки
- `Badge` - Значки
- `Separator` - Роздільники
- `Skeleton` - Скелети для завантаження

## Налаштування

### Додавання нових shadcn/ui компонентів

```bash
npx shadcn-ui@latest add [component-name]
```

### Зміна теми

Тема налаштована в `app/globals.css` через CSS змінні. Змініть значення `:root` для зміни кольорів.

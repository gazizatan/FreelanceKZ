export type Locale = 'en' | 'ru' | 'kz';

export const translations: Record<Locale, Record<string, any>> = {
  en: {
    nav: {
      browse: 'Browse Talents',
      postJob: 'Post a Job',
      dashboard: 'Dashboard',
      signin: 'Sign In',
      getStarted: 'Get Started',
    },
    hero: {
      title: 'Connect with Top Freelance Talent',
      subtitle: 'Find the perfect freelancer for your project or showcase your skills and build your professional profile',
      cta: 'Get Started',
      browse: 'Browse Talents',
    },
    features: {
      title: 'Why Choose Us',
      gamification: {
        title: 'Professionalism Levels',
        description: 'Track your expertise with our unique professionalism rating system that showcases your skills and reliability',
      },
      verified: {
        title: 'Verified Professionals',
        description: 'All talents are verified and rated by clients to ensure quality and reliability',
      },
      secure: {
        title: 'Secure & Transparent',
        description: 'Escrow payments and transparent pricing ensure both freelancers and clients are protected',
      },
      global: {
        title: 'Global Community',
        description: 'Connect with top talent from around the world and expand your professional network',
      },
    },
    professionalism: {
      novice: 'Novice',
      intermediate: 'Intermediate',
      expert: 'Expert',
      master: 'Master',
      legend: 'Legend',
    },
    cta: {
      forClients: 'I need to hire',
      forFreelancers: 'I want to work',
    },
  },
  ru: {
    nav: {
      browse: 'Найти таланты',
      postJob: 'Разместить проект',
      dashboard: 'Панель управления',
      signin: 'Вход',
      getStarted: 'Начать',
    },
    hero: {
      title: 'Свяжитесь с лучшими фрилансерами',
      subtitle: 'Найдите идеального фрилансера для вашего проекта или продемонстрируйте свои навыки и создавайте свой профессиональный профиль',
      cta: 'Начать',
      browse: 'Найти таланты',
    },
    features: {
      title: 'Почему выбирают нас',
      gamification: {
        title: 'Уровни профессионализма',
        description: 'Отслеживайте свой опыт с помощью нашей уникальной системы рейтинга профессионализма, которая демонстрирует ваши навыки и надежность',
      },
      verified: {
        title: 'Проверенные специалисты',
        description: 'Все таланты проверены и оценены клиентами для обеспечения качества и надежности',
      },
      secure: {
        title: 'Безопасность и прозрачность',
        description: 'Условное депонирование и прозрачное ценообразование защищают как фрилансеров, так и клиентов',
      },
      global: {
        title: 'Глобальное сообщество',
        description: 'Свяжитесь с лучшими талантами со всего мира и расширьте вашу профессиональную сеть',
      },
    },
    professionalism: {
      novice: 'Новичок',
      intermediate: 'Промежуточный',
      expert: 'Эксперт',
      master: 'Мастер',
      legend: 'Легенда',
    },
    cta: {
      forClients: 'Мне нужно нанять',
      forFreelancers: 'Я хочу работать',
    },
  },
  kz: {
    nav: {
      browse: 'Таланттарды табу',
      postJob: 'Жоба жариялау',
      dashboard: 'Басқару панелі',
      signin: 'Кіру',
      getStarted: 'Бастау',
    },
    hero: {
      title: 'Үздік фрилансерлерге қосылыңыз',
      subtitle: 'Өзіңіздің жобасына идеалды фрилансерді табыңыз немесе өзіңіздің біліктіліктеріңізді көрсетіңіз және кәсіби профильіңізді құрыңыз',
      cta: 'Бастау',
      browse: 'Таланттарды табу',
    },
    features: {
      title: 'Неліктен біз таңдайсыз',
      gamification: {
        title: 'Кәсілік деңгейлері',
        description: 'Өзіңіздің біліктіліктеріңізді және сенімділігіңізді көрсететін уникальды біздің кәсілік рейтингі жүйесімен бақылаңыз',
      },
      verified: {
        title: 'Тексерілген сарапшылар',
        description: 'Барлық таланттар сапа мен сенімділігін қамтамасыз ету үшін клиенттер тарапынан тексерілген және бағаланған',
      },
      secure: {
        title: 'Қауіпсіздік және ашықтық',
        description: 'Депонирлеу төлемдері және ашық баалау фрилансерлер мен клиенттерді де көмектейді',
      },
      global: {
        title: 'Әлемдік қоғамдастық',
        description: 'Дүние жүзінде үздік талантпен қосылыңыз және өзіңіздің кәсіби желісін кеңейтіңіз',
      },
    },
    professionalism: {
      novice: 'Жаңадан',
      intermediate: 'Орта деңгей',
      expert: 'Сарапшы',
      master: 'Ұста',
      legend: 'Аңыз',
    },
    cta: {
      forClients: 'Мен ұйлау керек',
      forFreelancers: 'Мен жұмыс істегім келеді',
    },
  },
};

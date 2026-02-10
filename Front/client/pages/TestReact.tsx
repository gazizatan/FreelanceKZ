import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/LocaleContext';

type Question = {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
};

const QUESTIONS: Question[] = [
  {
    id: 'q1',
    prompt: 'What is the correct way to create a React component?',
    options: [
      'function MyComponent() { return <div />; }',
      'const MyComponent = new React.Component();',
      'component MyComponent() {}',
      'createComponent(MyComponent)',
    ],
    correctIndex: 0,
  },
  {
    id: 'q2',
    prompt: 'What hook is used to manage state in a function component?',
    options: ['useMemo', 'useState', 'useEffect', 'useRef'],
    correctIndex: 1,
  },
  {
    id: 'q3',
    prompt: 'Which prop is required when rendering a list of elements?',
    options: ['id', 'name', 'key', 'value'],
    correctIndex: 2,
  },
  {
    id: 'q4',
    prompt: 'What does `useEffect` run by default?',
    options: [
      'Only once on mount',
      'Only on unmount',
      'On every render',
      'Only when state changes',
    ],
    correctIndex: 2,
  },
  {
    id: 'q5',
    prompt: 'How do you pass data from parent to child?',
    options: ['context', 'props', 'state', 'reducers'],
    correctIndex: 1,
  },
  {
    id: 'q6',
    prompt: 'What is JSX?',
    options: [
      'A templating engine',
      'A JavaScript syntax extension',
      'A CSS preprocessor',
      'A testing framework',
    ],
    correctIndex: 1,
  },
  {
    id: 'q7',
    prompt: 'Which hook is best for accessing DOM elements?',
    options: ['useMemo', 'useCallback', 'useRef', 'useContext'],
    correctIndex: 2,
  },
  {
    id: 'q8',
    prompt: 'What should you return from a component?',
    options: ['A string', 'JSX or null', 'A number', 'A Promise'],
    correctIndex: 1,
  },
  {
    id: 'q9',
    prompt: 'How do you avoid unnecessary renders when passing callbacks?',
    options: ['useState', 'useMemo', 'useCallback', 'useEffect'],
    correctIndex: 2,
  },
  {
    id: 'q10',
    prompt: 'Which hook helps derive values with memoization?',
    options: ['useMemo', 'useReducer', 'useRef', 'useLayoutEffect'],
    correctIndex: 0,
  },
];

export default function TestReact() {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = QUESTIONS[current];

  const score = useMemo(() => {
    return QUESTIONS.reduce((acc, question) => {
      const answer = answers[question.id];
      if (answer === question.correctIndex) return acc + 1;
      return acc;
    }, 0);
  }, [answers]);

  const progress = Math.round(((current + 1) / QUESTIONS.length) * 100);

  const handleSelect = (index: number) => {
    if (isFinished) return;
    setSelected(index);
  };

  const handleNext = () => {
    if (selected === null) return;
    const updated = { ...answers, [currentQuestion.id]: selected };
    setAnswers(updated);
    setSelected(null);

    if (current + 1 >= QUESTIONS.length) {
      setIsFinished(true);
      return;
    }
    setCurrent((prev) => prev + 1);
  };

  const handleRestart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers({});
    setIsFinished(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navbar />

      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              {t('tests.title')}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
              {t('tests.reactTitle')}
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {t('tests.reactSubtitle')}
            </p>
          </div>

          <div className="mb-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('tests.progressLabel')} {current + 1} / {QUESTIONS.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="mb-8 h-2 w-full rounded-full bg-muted">
            <div className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${progress}%` }} />
          </div>

          {!isFinished ? (
            <div className="rounded-2xl border border-border bg-white/80 p-6 shadow-sm dark:bg-black/40">
              <h2 className="text-xl font-semibold text-foreground">{currentQuestion.prompt}</h2>
              <div className="mt-6 space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isActive = selected === index;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(index)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                        isActive
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-muted/30 text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/tests')}>
                  {t('tests.back')}
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={selected === null}
                  className="bg-gradient-to-r from-primary to-secondary text-white"
                >
                  {current + 1 === QUESTIONS.length ? t('tests.finish') : t('tests.next')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white/80 p-8 text-center shadow-sm dark:bg-black/40">
              <h2 className="text-2xl font-semibold text-foreground">{t('tests.completed')}</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                {t('tests.scoreLabel')} {score} / {QUESTIONS.length}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {score >= 7 ? t('tests.pass') : t('tests.fail')}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button variant="outline" onClick={handleRestart}>
                  {t('tests.retry')}
                </Button>
                <Button onClick={() => navigate('/tests')}>
                  {t('tests.backToTests')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

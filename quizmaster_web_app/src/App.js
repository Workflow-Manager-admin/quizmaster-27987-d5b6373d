import React, { useState, useEffect } from 'react';
import './App.css';

import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser,
  onAuthStateChange,
} from './auth';

import {
  fetchQuizQuestions,
  hasUserAttemptedQuiz,
  submitQuizAttempt,
  fetchUserQuizResult,
} from './quizApi';

function App() {
  return <QuizMasterApp />;
}

// PUBLIC_INTERFACE
function QuizMasterApp() {
  const [view, setView] = useState('loading'); // 'loading' | 'start' | 'quiz' | 'result'
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [userAttempted, setUserAttempted] = useState(false);
  const [userResult, setUserResult] = useState(null);

  useEffect(() => {
    // Auth listener
    let unsub;
    getCurrentUser().then((u) => {
      setUser(u?.data?.user || null);
      setView(u?.data?.user ? 'start' : 'start');
    });
    unsub = onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setView(session?.user ? 'start' : 'start');
    });
    return () => { unsub && unsub.data?.subscription?.unsubscribe(); }
  }, []);

  useEffect(() => {
    // Check single attempt, fetch previous result
    if (user?.id) {
      hasUserAttemptedQuiz(user.id)
        .then(async (attempted) => {
          setUserAttempted(attempted);
          if (attempted) {
            // get result
            const result = await fetchUserQuizResult(user.id);
            setUserResult(result);
            setView('result');
          }
        })
        .catch(() => { /* ignore */ });
    }
  }, [user]);

  // Navigation
  function navTo(screen) {
    setView(screen);
  }

  // After quiz submit
  function handleQuizComplete(result) {
    setUserResult(result);
    setView('result');
  }

  if (view === 'loading') {
    return <LoadingScreen />;
  }

  return (
    <div className="app" style={{ background: 'var(--secondary, #f1f5f9)', minHeight: '100vh' }}>
      <nav className="navbar" style={{ background: '#2563eb', color: '#fff' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo" style={{ color: '#fff' }}>
              <span className="logo-symbol" style={{ color: '#f59e42' }}>*</span> QuizMaster
            </div>
            {user ? (
              <button className="btn" style={{ background: '#f59e42', color: '#fff' }} onClick={signOut}>
                Sign Out
              </button>
            ) : null}
          </div>
        </div>
      </nav>
      <main>
        <div className="container">
          {view === 'start' && (
            <StartScreen
              user={user}
              setUser={setUser}
              onStart={async () => {
                // Fetch quiz questions dynamically
                const q = await fetchQuizQuestions();
                setQuestions(q);
                setView('quiz');
              }}
              userAttempted={userAttempted}
              userResult={userResult}
            />
          )}
          {view === 'quiz' && user && (
            <QuizScreen
              questions={questions}
              user={user}
              onComplete={async (answers) => {
                // Evaluate score
                let score = 0;
                questions.forEach((q, i) => {
                  if (answers[i] === q.answer) score++;
                });
                // Submit result to Supabase
                await submitQuizAttempt(user.id, answers, score);
                const result = await fetchUserQuizResult(user.id);
                handleQuizComplete(result);
              }}
            />
          )}
          {view === 'result' && (
            <ResultScreen
              userResult={userResult}
              questions={questions} // for answers context
              onRestart={() => navTo('start')}
            />
          )}
        </div>
      </main>
    </div>
  );
}

//---- COMPONENTS ----//

function LoadingScreen() {
  return (
    <div className="app">
      <div className="container" style={{ marginTop: 120 }}>
        <h2 style={{ color: '#2563eb' }}>Loading...</h2>
      </div>
    </div>
  );
}

function StartScreen({ user, setUser, onStart, userAttempted, userResult }) {
  const [showSignUp, setShowSignUp] = useState(false);

  return (
    <div className="hero">
      <div className="subtitle">Welcome to</div>
      <h1 className="title" style={{ color: '#2563eb' }}>QuizMaster</h1>
      <div className="description">
        {user ? 'Test your knowledge! The quiz can be attempted only once.' :
          'Please sign in or create an account to start the quiz.'}
      </div>

      {!user && (
        <>
          {showSignUp
            ? <AuthForm type="signup" setUser={setUser} onSwitch={() => setShowSignUp(false)} />
            : <AuthForm type="signin" setUser={setUser} onSwitch={() => setShowSignUp(true)} />}
        </>
      )}

      {user && (
        <div>
          {userAttempted ? (
            <div style={{ margin: '24px 0', color: '#f59e42', fontWeight: 'bold' }}>
              You have already attempted the quiz! See your result below.
            </div>
          ) : (
            <button className="btn btn-large" style={{ background: '#2563eb', color: '#fff', marginTop: 20 }} onClick={onStart}>
              Start Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AuthForm({ type, setUser, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      if (type === 'signin') {
        const { data, error } = await signInWithEmail(email, password);
        if (error) throw error;
        setUser(data.user);
      } else {
        const { data, error } = await signUpWithEmail(email, password);
        if (error) throw error;
        setUser(data.user);
      }
    } catch (e) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={handleAuth} style={{
      background: '#f1f5f9', padding: 24, borderRadius: 8, margin: '0 auto', maxWidth: 340, boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ margin: '0 0 12px 0', color: '#2563eb' }}>
        {type === 'signin' ? 'Sign In' : 'Sign Up'}
      </h3>
      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', marginBottom: 12, width: '100%' }}
      />
      <input
        type="password"
        required
        placeholder="Password"
        value={password}
        autoComplete={type === 'signin' ? 'current-password' : 'new-password'}
        onChange={e => setPassword(e.target.value)}
        style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc', marginBottom: 12, width: '100%' }}
      />
      <button type="submit" className="btn btn-large" style={{
        background: "#2563eb", color: "#fff", width: "100%", marginBottom: 8
      }} disabled={loading}>{loading ? 'Processing...' : (type === 'signin' ? 'Sign In' : 'Sign Up')}</button>
      <button type="button"
        style={{ background: "transparent", border: "none", color: "#2563eb", textDecoration: "underline", width: "100%", cursor: "pointer", fontSize: 14 }}
        onClick={onSwitch}
      >
        {type === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
      </button>
      {err && <div style={{ color: "red", fontSize: 13, marginTop: 10 }}>{err}</div>}
    </form>
  );
}

function QuizScreen({ questions, user, onComplete }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(''));
  const [err, setErr] = useState('');

  if (!questions || !questions.length) {
    return <div className="hero"><h3>No quiz questions available. Contact admin.</h3></div>;
  }

  const q = questions[idx];

  function selectAnswer(option) {
    const newAnswers = [...answers];
    newAnswers[idx] = option;
    setAnswers(newAnswers);
    setErr('');
  }

  function next() {
    if (!answers[idx]) {
      setErr('Please select an option.');
      return;
    }
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
    } else {
      // Done!
      onComplete(answers);
    }
  }

  return (
    <div className="hero" style={{ alignItems: 'stretch', maxWidth: 480 }}>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontSize: '1.2rem', color: '#2563eb', marginBottom: 10 }}>
          Question {idx + 1} of {questions.length}
        </div>
        <h2 style={{ color: '#222', fontSize: '1.6rem', margin: '8px 0 24px 0' }}>{q.question}</h2>
        <div>
          {q.options.map((option, i) => (
            <button
              key={i}
              className="btn"
              style={{
                background: answers[idx] == option ? '#2563eb' : '#f1f5f9',
                color: answers[idx] == option ? '#fff' : '#222',
                border: '1px solid #2563eb',
                marginBottom: 10, width: '100%',
                fontWeight: answers[idx] == option ? 600 : 400,
              }}
              onClick={() => selectAnswer(option)}
            >
              {option}
            </button>
          ))}
        </div>
        {err && <div style={{ color: "red", margin: "8px 0" }}>{err}</div>}
        <button
          className="btn btn-large"
          style={{ background: "#f59e42", color: "#fff", width: "100%", margin: "18px 0 0 0" }}
          onClick={next}
        >
          {idx === questions.length - 1 ? "Submit Quiz" : "Next Question"}
        </button>
      </div>
    </div>
  );
}

function ResultScreen({ userResult, questions, onRestart }) {
  if (!userResult) {
    return (
      <div className="hero"><h2>Unable to retrieve result.</h2></div>
    );
  }

  const responses = userResult.responses || [];
  const score = userResult.score ?? '?';

  return (
    <div className="hero" style={{ maxWidth: 640 }}>
      <h2 className="title" style={{ color: '#2563eb', fontSize: 30, marginBottom: 10 }}>Quiz Results</h2>
      <div style={{ fontSize: 21, margin: "12px 0", fontWeight: 500 }}>Score: <span style={{ color: "#f59e42" }}>{score}</span></div>
      <div style={{ margin: "24px 0 36px 0", color: "#666", fontSize: 16 }}>
        Out of {questions.length} questions
      </div>
      <h3 style={{ color: "#2563eb", marginBottom: 12 }}>Correct Answers</h3>
      <ol style={{ background: "#f1f5f9", padding: 18, borderRadius: 8 }}>
        {questions && questions.map((q, i) => (
          <li key={q.id} style={{ marginBottom: 19 }}>
            <strong>{q.question}</strong>
            <div>
              Your answer:{" "}
              <span style={{
                color: responses[i] === q.answer ? "#2563eb" : "red",
                fontWeight: responses[i] === q.answer ? 600 : 400
              }}>
                {responses?.[i] ?? <em>Not answered</em>}
              </span>
              {" | "}
              <span style={{
                color: "#2d994b"
              }}>Correct: {q.answer}</span>
            </div>
          </li>
        ))}
      </ol>
      <button
        className="btn btn-large"
        style={{ background: "#2563eb", color: "#fff", marginTop: 18 }}
        onClick={onRestart}
      >
        Back to Start
      </button>
    </div>
  );
}

export default App;
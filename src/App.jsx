import React, { useState, useEffect } from 'react';
import { tasks } from './data/tasks';
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import './index.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUpgraded, setIsUpgraded] = useState(false);
  const [userTier, setUserTier] = useState('Free'); // 'Free', 'Starter', 'Pro', 'Elite', 'Ultimate'
  const [showModal, setShowModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('selection'); 
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('Processing your payment...');
  
  const packages = [
    { id: 'starter', name: 'Starter', kes: 199, usd: 1.50, tasks: 5, features: ['Unlock 5 Premium Tasks', 'Basic Support'] },
    { id: 'pro', name: 'Professional', kes: 399, usd: 3.00, tasks: 15, features: ['Unlock 15 Premium Tasks', 'Faster Payouts'] },
    { id: 'elite', name: 'Elite', kes: 799, usd: 6.00, tasks: 'All', features: ['Unlock ALL Tasks', 'Priority Support', 'Early Access'] },
    { id: 'ultimate', name: 'Ultimate', kes: 1500, usd: 12.00, tasks: 'All', features: ['Unlock ALL Tasks', 'Instant Payouts', '2x Reward Multiplier', 'Personal Manager'] }
  ];
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskActive, setIsTaskActive] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskAnswers, setTaskAnswers] = useState({});
  const [completedTasks, setCompletedTasks] = useState([]);

  // Auth States for Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const categories = ['All', 'Survey', 'Writing', 'Transcription', 'Data Labeling'];

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        setIsLoggedIn(!!currentUser);
        
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsUpgraded(userData.isUpgraded || false);
            setUserTier(userData.userTier || 'Free');
            setCompletedTasks(userData.completedTasks || []);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async () => {
    setError('');
    setIsAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          fullName,
          email,
          isUpgraded: false,
          completedTasks: []
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
      setFullName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const markTaskCompleted = async (taskId) => {
    const newCompleted = [...completedTasks, taskId];
    setCompletedTasks(newCompleted);
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), {
        completedTasks: newCompleted
      });
    }
  };

  const handleMpesaPay = async () => {
    if (!phoneNumber) {
      setError("Please enter a phone number.");
      return;
    }

    setPaymentStep('processing');
    setError('');

    const externalRef = `PRO_${user?.uid || 'GUEST'}_${selectedPackage.id}_${Date.now()}`;

    try {
      const response = await fetch('/api/initiatestk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPackage.kes,
          phone_number: phoneNumber,
          external_reference: externalRef
        })
      });

      const data = await response.json();
      
      if (response.ok && !data.error && data.ResponseCode !== "FAILED") {
        // STK push sent — now poll for payment confirmation
        setPaymentStatusMessage('STK push sent! Enter your M-Pesa PIN on your phone...');
        const reqId = data.transaction_request_id || data.CheckoutRequestID || externalRef;
        pollPaymentStatus(reqId);
      } else {
        setError(data.error_message || data.message || data.error || data.CustomerMessage || "Push failed. Please try again.");
        setPaymentStep('mpesa');
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Could not connect to MegaPay gateway.");
      setPaymentStep('mpesa');
    }
  };

  const pollPaymentStatus = (reqId) => {
    const maxAttempts = 30; // 30 × 4s = 2 minutes max
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch('/api/transactionstatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ transaction_request_id: reqId })
        });
        const statusData = await res.json();
        console.log('Payment status:', statusData);

        const isSuccess = statusData.TransactionStatus === 'Completed' || statusData.status === 'SUCCESS' || statusData.ResultCode === '0' || statusData.ResultCode === 0;
        const isFailed = statusData.TransactionStatus === 'Failed' || statusData.status === 'FAILED' || statusData.status === 'CANCELLED' || statusData.ResultCode === '1032';

        if (isSuccess) {
          clearInterval(interval);
          handleUpgradeSuccess();
        } else if (isFailed) {
          clearInterval(interval);
          setError("Payment was declined or cancelled. Please try again.");
          setPaymentStep('mpesa');
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setError("Payment timed out. If money was deducted, contact support.");
          setPaymentStep('mpesa');
        } else {
          // Still pending — update countdown message
          const remaining = maxAttempts - attempts;
          setPaymentStatusMessage(`Waiting for payment confirmation... (${remaining * 4}s remaining)`);
        }
      } catch (e) {
        console.error('Status check error:', e);
      }
    }, 4000);
  };

  const handleUpgradeSuccess = async () => {
    setPaymentStep('processing');
    setTimeout(async () => {
      setIsUpgraded(true);
      setUserTier(selectedPackage.name);
      setShowModal(false);
      setPaymentStep('selection');
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          isUpgraded: true,
          userTier: selectedPackage.name
        });
      }
    }, 1000);
  };

  const filteredTasks = (activeTab === 'All' 
    ? tasks 
    : tasks.filter(t => t.category === activeTab)).filter(t => !completedTasks.includes(t.id));

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        background: 'var(--bg)', 
        color: 'white' 
      }}>
        <div className="animate-pulse" style={{ textAlign: 'center' }}>
          <img src="/logo.png" alt="Prolific" style={{ height: '80px', marginBottom: '2rem', filter: 'drop-shadow(0 0 20px var(--primary))' }} />
          <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
        </div>
      </div>
    );
  }

  if (isTaskActive && selectedTask && selectedTask.questions) {
    const totalQuestions = selectedTask.questions.length;
    const currentQuestion = selectedTask.questions[taskProgress];

    const handleAnswer = (answer) => {
      setTaskAnswers({ ...taskAnswers, [taskProgress]: answer });
      if (taskProgress < totalQuestions - 1) {
        setTaskProgress(taskProgress + 1);
      } else {
        markTaskCompleted(selectedTask.id);
        setTaskProgress(totalQuestions); // Move to completion screen
      }
    };

    return (
      <div className="container animate-fade-in" style={{ paddingTop: '5rem' }}>
        <div className="glass" style={{ padding: '3rem', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h2>{selectedTask.title}</h2>
            <span style={{ color: 'var(--primary)' }}>Question {taskProgress < totalQuestions ? taskProgress + 1 : totalQuestions} of {totalQuestions}</span>
          </div>
          
          <div style={{ height: '6px', background: 'var(--glass)', borderRadius: '3px', marginBottom: '3rem' }}>
            <div style={{ height: '100%', background: 'var(--primary)', width: `${((Math.min(taskProgress, totalQuestions))/totalQuestions)*100}%`, transition: 'width 0.5s ease', borderRadius: '3px' }}></div>
          </div>

          {taskProgress < totalQuestions && currentQuestion && (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '1.5rem' }}>{currentQuestion.prompt}</h3>
              
              {currentQuestion.type === 'select' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {currentQuestion.options.map(opt => (
                    <button 
                      key={opt} 
                      className="filter-btn" 
                      style={{ textAlign: 'left', padding: '1rem', background: 'var(--glass)', border: '1px solid var(--border)', cursor: 'pointer', color: 'white', borderRadius: '12px' }} 
                      onClick={() => handleAnswer(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'text' && (
                <div>
                  <textarea 
                    placeholder="Type your response here..." 
                    style={{ width: '100%', height: '120px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', padding: '1rem', marginBottom: '2rem' }}
                    onChange={(e) => setTaskAnswers({ ...taskAnswers, [taskProgress]: e.target.value })}
                    value={taskAnswers[taskProgress] || ''}
                  ></textarea>
                  <button className="btn-primary" style={{ width: '100%' }} onClick={() => handleAnswer(taskAnswers[taskProgress])} disabled={!taskAnswers[taskProgress]}>
                    Continue
                  </button>
                </div>
              )}
            </div>
          )}

          {taskProgress === totalQuestions && (
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <h2>Task Completed!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your responses for "{selectedTask.title}" have been securely recorded. The reward will be added to your account after quality review.</p>
              <button className="btn-primary" onClick={() => { 
                setIsTaskActive(false); 
                setSelectedTask(null); 
                setTaskProgress(0);
                setTaskAnswers({});
              }}>Return to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav>
        <div className="container nav-content">
          <a href="#" className="logo">
            <img src="/logo.png" alt="Prolific" style={{ height: '36px', verticalAlign: 'middle' }} />
          </a>
          <div className="nav-links">
            {/* Desktop-only links */}
            <span className="nav-text-links">
              <a href="#tasks">Browse Tasks</a>
              <a href="#how-it-works">How it Works</a>
            </span>
            
            {deferredPrompt && (
              <button 
                onClick={() => {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
                }} 
                style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', padding: '0.45rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
              >
                ↓ Install App
              </button>
            )}

            {/* Auth buttons — always visible */}
            {!isLoggedIn ? (
              <>
                <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>Login</button>
                <button className="btn-primary" onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}>Join Now</button>
              </>
            ) : (
              <>
                {!isUpgraded ? (
                  <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.55rem 0.9rem' }} onClick={() => setShowModal(true)}>Upgrade</button>
                ) : (
                  <div className="user-profile">
                    <span className="premium-badge" style={{ 
                      background: userTier === 'Ultimate' ? 'linear-gradient(45deg, #f59e0b, #ef4444)' : 
                                  userTier === 'Elite' ? 'linear-gradient(45deg, #8b5cf6, #3b82f6)' : 
                                  'var(--primary)' 
                    }}>
                      {userTier}
                    </span>
                    <span className="balance" style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '700', 
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.1)',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>KES</span>
                      {(completedTasks.length * 45).toLocaleString()}
                    </span>
                    <button 
                      onClick={() => setShowWithdrawModal(true)}
                      style={{ 
                        background: 'var(--primary)', 
                        border: 'none', 
                        color: 'white', 
                        padding: '0.4rem 0.8rem', 
                        borderRadius: '8px', 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        cursor: 'pointer' 
                      }}
                    >
                      Withdraw
                    </button>
                  </div>
                )}
                <button style={{ background: 'var(--glass)', border: '1px solid var(--border)', color: 'white', padding: '0.45rem 0.8rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem' }} onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="hero container animate-fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', textAlign: 'left', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '300px' }}>
            <h1>Work on high-quality tasks <br /> and get paid accurately. {isUpgraded && <span style={{ color: 'var(--primary)' }}>Welcome back, {userTier}!</span>}</h1>
            <p>Join thousands of researchers and contributors on the world's most trusted task platform. Data labeling, writing, and surveys.</p>
            {!isLoggedIn ? (
              <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => { setAuthMode('signup'); setShowAuthModal(true); }}>
                Join Today
              </button>
            ) : !isUpgraded && (
              <button className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => setShowModal(true)}>
                Upgrade Now
              </button>
            )}
          </div>
          <div style={{ flex: '1', minWidth: '300px', textAlign: 'right' }}>
            <img src="/hero.png" alt="Tasks Dashboard" style={{ width: '100%', maxWidth: '500px', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', border: '1px solid var(--border)' }} />
          </div>
        </div>
      </section>

      <main className="container" id="tasks">
        <div className="filter-bar" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`filter-btn ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
              style={{
                padding: '0.5rem 1.25rem',
                background: activeTab === cat ? 'var(--primary)' : 'var(--glass)',
                border: '1px solid var(--border)',
                color: 'white',
                cursor: 'pointer',
                borderRadius: '20px',
                transition: 'var(--transition)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="task-grid">
          {filteredTasks.map((task, index) => {
            // Task Gating Logic
            let isLocked = false;
            if (!isUpgraded) {
              isLocked = task.id !== 1; // Only free task (ID 1) is unlocked by default
            } else {
              if (userTier === 'Starter' && index >= 5) isLocked = true;
              if (userTier === 'Professional' && index >= 15) isLocked = true;
              // Elite and Ultimate unlock everything
            }

            return (
              <TaskCard 
                key={task.id} 
                task={task} 
                isLocked={isLocked}
                onUnlock={() => {
                  if (!isLoggedIn) {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  } else {
                    setShowModal(true);
                  }
                }}
                onOpen={(t) => {
                  if (!isLoggedIn) {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  } else {
                    setSelectedTask(t);
                  }
                }}
              />
            );
          })}
        </div>
      </main>

      <section className="container" id="how-it-works" style={{ padding: '6rem 0' }}>
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '4rem' }}>How Prolific Works</h2>
        <div className="pricing-grid">
          <div className="glass" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📱</div>
            <h3 style={{ marginBottom: '1rem' }}>1. Choose a Plan</h3>
            <p style={{ color: 'var(--text-muted)' }}>Sign up and select a membership tier that fits your earning goals. Higher tiers unlock more rewarding tasks.</p>
          </div>
          <div className="glass" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✍️</div>
            <h3 style={{ marginBottom: '1rem' }}>2. Complete Tasks</h3>
            <p style={{ color: 'var(--text-muted)' }}>Choose from surveys, data labeling, or writing tasks. Our dynamic engine ensures fresh work is always available.</p>
          </div>
          <div className="glass" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>💰</div>
            <h3 style={{ marginBottom: '1rem' }}>3. Get Paid</h3>
            <p style={{ color: 'var(--text-muted)' }}>Your earnings are credited instantly. Withdraw your balance securely to M-Pesa once it reaches the minimum threshold.</p>
          </div>
        </div>
      </section>

      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content glass animate-fade-in" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <h2>{authMode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{authMode === 'login' ? 'Login to your account to start earning.' : 'Join Prolific and start doing tasks today.'}</p>
            
            {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
            
            <div style={{ display: 'grid', gap: '1rem', textAlign: 'left' }}>
              {authMode === 'signup' && (
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }} 
                />
              )}
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }} 
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.8rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '8px', color: 'white' }} 
              />
              <button className="btn-primary" style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }} onClick={handleAuth} disabled={isAuthLoading}>
                {isAuthLoading ? (
                  <><div className="loading-spinner" style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}></div> Processing...</>
                ) : (
                  authMode === 'login' ? 'Login' : 'Sign Up'
                )}
              </button>
            </div>
            <p style={{ marginTop: '1.5rem', fontSize: '0.9rem' }}>
              {authMode === 'login' ? "New here? " : "Already have an account? "}
              <span style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
                {authMode === 'login' ? 'Create Account' : 'Login'}
              </span>
            </p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); setPaymentStep('selection'); setSelectedPackage(null); setError(''); }}>
          <div className="modal-content modal-wide glass animate-fade-in" onClick={e => e.stopPropagation()}>
            
            {!selectedPackage && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Choose Your Plan</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>Unlock the full potential of Prolific with tiered access.</p>
                
                <div className="pricing-grid">
                  {packages.map(pkg => (
                    <div key={pkg.id} className="pricing-card glass" style={{ border: pkg.id === 'ultimate' ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
                      {pkg.id === 'ultimate' && <span style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', padding: '2px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '700' }}>BEST VALUE</span>}
                      <h4 style={{ margin: '0 0 1rem 0' }}>{pkg.name}</h4>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>KES {pkg.kes}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>~ ${pkg.usd} USD</div>
                      
                      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', textAlign: 'left', flex: 1 }}>
                        {pkg.features.map((f, i) => (
                          <li key={i} style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>✓ {f}</li>
                        ))}
                      </ul>
                      
                      <button className="btn-primary" style={{ width: '100%', padding: '0.8rem' }} onClick={() => setSelectedPackage(pkg)}>Select Plan</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPackage && paymentStep === 'selection' && (
              <div className="animate-fade-in">
                <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', float: 'left' }} onClick={() => setSelectedPackage(null)}>← Change Plan</button>
                <div style={{ clear: 'both', paddingTop: '2rem' }}>
                  <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Checkout: {selectedPackage.name}</h2>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>KES {selectedPackage.kes} / ${selectedPackage.usd}</p>
                  
                  {error && <p style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '0.9rem', padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>{error}</p>}

                  <h4 style={{ textAlign: 'left', marginBottom: '1rem' }}>Select Payment Method:</h4>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <button className="filter-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid #10b981' }} onClick={() => { setError(''); setPaymentStep('mpesa'); }}>
                      <span>🇰🇪 M-Pesa (Kenya)</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.9, color: '#10b981' }}>Recommended</span>
                    </button>
                    <button className="filter-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', opacity: 0.7 }} onClick={() => setError('Stripe is currently not available in your region. Please securely checkout using M-Pesa.')}>
                      <span>💳 Credit/Debit Card</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Stripe</span>
                    </button>
                    <button className="filter-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', opacity: 0.7 }} onClick={() => setError('PayPal is currently not available in your region. Please securely checkout using M-Pesa.')}>
                      <span>🅿️ PayPal</span>
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Not Available</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedPackage && paymentStep === 'mpesa' && (
              <div className="animate-fade-in">
                <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', float: 'left' }} onClick={() => setPaymentStep('selection')}>← Back</button>
                <div style={{ clear: 'both', paddingTop: '1rem' }}>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png" alt="M-Pesa" style={{ height: '40px', marginBottom: '1.5rem' }} />
                  <h3 style={{ marginBottom: '1rem' }}>M-Pesa STK Push</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter your M-Pesa number to receive a payment prompt on your phone for <strong>KES {selectedPackage.kes}</strong>.</p>
                  
                  <input 
                    type="tel" 
                    placeholder="2547XXXXXXXX" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    style={{ width: '100%', padding: '1rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', textAlign: 'center', fontSize: '1.2rem', marginBottom: '1.5rem' }} 
                  />
                  
                  <button className="btn-primary" style={{ width: '100%', padding: '1rem' }} onClick={handleMpesaPay}>
                    Pay KES {selectedPackage.kes}
                  </button>
                </div>
              </div>
            )}



            {paymentStep === 'processing' && (
              <div className="animate-fade-in" style={{ padding: '2rem 0', textAlign: 'center' }}>
                <div className="loading-spinner" style={{ width: '60px', height: '60px', border: '4px solid var(--glass)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 2rem auto' }}></div>
                <h3 style={{ marginBottom: '1rem' }}>Waiting for Payment</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>{paymentStatusMessage}</p>
                <div style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  📱 Check your Safaricom phone for an M-Pesa prompt and enter your PIN to confirm.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content glass animate-fade-in" style={{ maxWidth: '800px', textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <span className="task-badge">{selectedTask.category}</span>
            <h2 style={{ fontSize: '2rem', margin: '1rem 0' }}>{selectedTask.title}</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>{selectedTask.description}</p>
            
            <div style={{ background: 'var(--glass)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '1rem' }}>Task Instructions:</h4>
              <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)' }}>
                <li>Read the briefing carefully.</li>
                <li>Complete all required fields in the provided form.</li>
                <li>Submit your work for review. Payouts are processed within 24 hours.</li>
              </ol>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Est. Time</span>
                  <span style={{ fontWeight: '700' }}>{selectedTask.time}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reward</span>
                  <span style={{ fontWeight: '700', color: '#10b981' }}>{selectedTask.reward}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  style={{ background: 'var(--glass)', border: '1px solid var(--border)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}
                  onClick={() => setSelectedTask(null)}
                >Cancel</button>
                <button className="btn-primary" onClick={() => setIsTaskActive(true)}>Start Task</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal-content glass animate-fade-in" style={{ maxWidth: '450px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>🏦</div>
            <h2 style={{ marginBottom: '1rem' }}>Withdraw Funds</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your current balance is <strong>KES {(completedTasks.length * 45).toLocaleString()}</strong>.</p>
            
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.9rem' }}>
              ⚠️ The minimum withdrawal threshold is <strong>KES 500</strong>. Keep completing tasks to reach this goal!
            </div>

            <button className="btn-primary" style={{ width: '100%' }} onClick={() => setShowWithdrawModal(false)}>Got it</button>
          </div>
        </div>
      )}

      <footer style={{ borderTop: '1px solid var(--border)', padding: '4rem 0', background: 'rgba(0,0,0,0.2)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'left', marginBottom: '3rem' }}>
            <div>
              <img src="/logo.png" alt="Prolific" style={{ height: '30px', marginBottom: '1.5rem' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>The world's most trusted platform for high-quality data contribution and human-in-the-loop research.</p>
            </div>
            <div>
              <h4 style={{ marginBottom: '1.5rem' }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <li style={{ marginBottom: '0.8rem' }}><a href="#tasks" style={{ color: 'inherit', textDecoration: 'none' }}>Available Tasks</a></li>
                <li style={{ marginBottom: '0.8rem' }}><a href="#how-it-works" style={{ color: 'inherit', textDecoration: 'none' }}>How it Works</a></li>
                <li style={{ marginBottom: '0.8rem' }}><a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Pricing Plans</a></li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1.5rem' }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <li style={{ marginBottom: '0.8rem' }}>Help Center</li>
                <li style={{ marginBottom: '0.8rem' }}>Terms of Service</li>
                <li style={{ marginBottom: '0.8rem' }}>Privacy Policy</li>
                <li style={{ marginBottom: '0.8rem' }}>Contact Us</li>
              </ul>
            </div>
            <div>
              <h4 style={{ marginBottom: '1.5rem' }}>Secure Payments</h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png" alt="M-Pesa" style={{ height: '24px', filter: 'grayscale(100%) opacity(0.5)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Merchant</span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>© 2024 Prolific Marketplace Ltd. All rights reserved.</p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span style={{ fontSize: '1.2rem', cursor: 'pointer', opacity: 0.6 }}>𝕏</span>
              <span style={{ fontSize: '1.2rem', cursor: 'pointer', opacity: 0.6 }}>LINKEDIN</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const TaskCard = ({ task, isLocked, onUnlock, onOpen }) => {
  return (
    <div 
      className={`task-card glass ${isLocked ? 'locked' : ''}`}
      style={{ cursor: isLocked ? 'default' : 'pointer' }}
      onClick={() => !isLocked && onOpen(task)}
    >
      <span className="task-badge">{task.category}</span>
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      <div className="task-meta">
        <span>⏱ {task.time}</span>
        <span className="reward">{task.reward}</span>
      </div>
      
      {isLocked && (
        <div className="locked-overlay" onClick={(e) => e.stopPropagation()}>
          <div className="locked-icon">🔒</div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>Premium Required</h4>
          <p style={{ margin: '0.25rem 0 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upgrade to unlock this task.</p>
          <button className="btn-primary" style={{ padding: '0.5rem 1.1rem', fontSize: '0.8rem' }} onClick={(e) => { e.stopPropagation(); onUnlock(); }}>
            Upgrade Now
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

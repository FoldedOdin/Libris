import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, Zap, LayoutDashboard, Search, ArrowRight, ShieldCheck, BarChart3, Database, CheckCircle2, Star, ChevronRight } from 'lucide-react';
import AuthContext from '../contexts/AuthContext';
import { Button, Card, LoadingSpinner, ErrorMessage } from '../components/common';

const LiveActivityStrip = () => {
  const activities = [
    { icon: "📘", text: "Arjun borrowed 'Deep Work'" },
    { icon: "�", text: "120 new books added today" },
    { icon: "�", text: "Trending: AI Systems" },
    { icon: "📘", text: "Sarah borrowed 'Atomic Habits'" },
    { icon: "🎓", text: "Alex completed 'Clean Code'" },
    { icon: "🌟", text: "New Collection: Mental Models" },
    { icon: "👥", text: "50+ new readers joined today" }
  ];

  return (
    <div className="bg-secondary border-bottom border-light overflow-hidden d-flex align-items-center py-2" style={{ zIndex: 40, position: 'relative' }}>
      <motion.div
        className="d-flex whitespace-nowrap gap-5"
        animate={{ x: [0, -1035] }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
      >
        {[...activities, ...activities, ...activities].map((activity, i) => (
           <div key={i} className="text-xs text-secondary font-weight-medium d-flex align-items-center gap-2">
             <span className="position-relative d-flex rounded-circle" style={{ width: '6px', height: '6px', background: '#3b82f6', boxShadow: '0 0 8px #3b82f6' }}></span>
             <span>{activity.icon}</span> <span>{activity.text}</span>
           </div>
        ))}
      </motion.div>
    </div>
  );
};

const AnimatedCounter = ({ end, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 2; // 2 seconds
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [end]);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="text-white font-weight-bold display-4 mb-2"
      >
        {count.toLocaleString()}{end > 100 ? '+' : '%'}
      </motion.div>
      <div className="text-secondary text-sm font-weight-semibold text-uppercase letter-spacing-wide">
        {label}
      </div>
    </div>
  );
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeGraphNode, setActiveGraphNode] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        if (!user && !isAuthenticated && isAuthenticated !== false) return;

        if (isAuthenticated && user) {
          if (isAdmin?.()) {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          setIsLoading(false);
        }
      } catch (authError) {
        setError({
          type: 'authentication',
          message: 'Unable to verify authentication status.',
          isTemporary: true
        });
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [isAuthenticated, user, navigate, isAdmin]);

  if (isLoading) return <LoadingSpinner text="Loading..." />;
  if (error) return <ErrorMessage message={error.message} onRetry={() => window.location.reload()} />;

  const dummyBooks = [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200&h=300",
    "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200&h=300",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=200&h=300"
  ];

  return (
    <div className="landing-page bg-primary min-h-screen text-primary overflow-hidden">
      
      <LiveActivityStrip />

      {/* Navigation Header */}
      <nav className="landing-nav fixed w-100 z-50 transition-all border-bottom border-light shadow-soft" style={{ top: '34px', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(16px)' }}>
        <div className="container py-3 d-flex justify-content-between align-items-center">
          <div className="nav-brand d-flex align-items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 d-flex align-items-center justify-content-center shadow-glow">
              <BookOpen className="text-white" size={18} />
            </div>
            <span className="font-weight-bold text-xl text-white">Libris</span>
          </div>
          <div className="nav-links d-none d-md-flex gap-4">
            <a href="#features" className="text-secondary hover-text-primary transition-all font-weight-medium text-sm">Features</a>
            <a href="#how-it-works" className="text-secondary hover-text-primary transition-all font-weight-medium text-sm">How it Works</a>
            <a href="#preview" className="text-secondary hover-text-primary transition-all font-weight-medium text-sm">Preview</a>
          </div>
          <div className="nav-actions d-flex gap-3 align-items-center">
            <button onClick={() => navigate('/login')} className="bg-transparent border-0 text-secondary hover-text-primary font-weight-medium transition-all cursor-pointer text-sm">
              Sign In
            </button>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')} className="rounded-full shadow-glow">
              Get Started Free
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section position-relative pt-5" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', background: 'radial-gradient(circle at 30% 40%, rgba(37, 99, 235, 0.25), transparent 60%), #0F172A' }}>
        <div className="container mt-5 pt-5">
          <div className="row align-items-center">
            
            {/* Left Column - Copy */}
            <motion.div 
              className="col-12 col-lg-5 pr-lg-5 mb-5 mb-lg-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="badge bg-primary-900 text-primary-light px-3 py-1 rounded-full mb-4 d-inline-flex align-items-center gap-2 font-weight-medium border border-primary-800 text-xs">
                <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span> Libris OS 2.0 is live
              </div>
              
              <h1 className="font-weight-bold text-white mb-4" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Your Knowledge.<br/>
                <span className="text-primary-500">Organized.</span> <span className="text-white">Accessible.</span><br/>
                <span className="text-accent">Alive.</span>
              </h1>
              
              <p className="text-secondary mb-5 pr-lg-5 font-weight-regular" style={{ fontSize: '1.125rem', lineHeight: 1.6, maxWidth: '480px' }}>
                Experience the modern productivity system designed for readers and organizations. Stop searching for your books, start interacting with your digital library.
              </p>
              
              <div className="d-flex flex-column gap-3">
                <div className="d-flex flex-wrap gap-4 align-items-center">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/register')} 
                    className="btn btn-primary btn-lg shadow-glow rounded-full d-flex align-items-center gap-2 px-4 py-3"
                  >
                    Get Started Free <ArrowRight size={18} />
                  </motion.button>
                  
                  <button onClick={() => navigate('/login')} className="bg-transparent border-0 text-white font-weight-medium d-flex align-items-center gap-2 transition-all hover-translate-x cursor-pointer opacity-80 hover:opacity-100">
                    See Demo <ChevronRight size={16} />
                  </button>
                </div>
                <div className="text-xs text-muted d-flex align-items-center gap-2 mt-2 font-weight-medium">
                  <CheckCircle2 size={14} className="text-success" /> No credit card required 
                  <span className="mx-1">•</span> 
                  <CheckCircle2 size={14} className="text-success" /> Free forever plan
                </div>
              </div>
            </motion.div>

            {/* Right Column - Dashboard Preview */}
            <motion.div 
              className="col-12 col-lg-7"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="position-relative w-100" style={{ perspective: '1200px' }}>
                <motion.div 
                  className="rounded-2xl overflow-hidden shadow-strong border border-light"
                  style={{ background: '#0B0F19', transform: 'rotateY(-12deg) rotateX(4deg)', transformStyle: 'preserve-3d' }}
                  whileHover={{ rotateY: -5, rotateX: 2, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  <div className="p-3 border-bottom border-light d-flex align-items-center gap-2 bg-secondary">
                    <div className="d-flex gap-2">
                      <div className="w-3 h-3 rounded-circle bg-danger opacity-80"></div>
                      <div className="w-3 h-3 rounded-circle bg-warning opacity-80"></div>
                      <div className="w-3 h-3 rounded-circle bg-success opacity-80"></div>
                    </div>
                    <div className="mx-auto bg-primary border border-light rounded-md px-4 py-1.5 text-xs text-muted flex-grow-1 max-w-xs text-center flex align-items-center justify-content-center gap-2">
                      <Search size={12}/> Search workspace...
                    </div>
                  </div>
                  
                  <div className="d-flex" style={{ height: '400px' }}>
                    <div className="w-25 border-right border-light p-4 d-none d-md-block bg-primary">
                      <div className="d-flex flex-column gap-3">
                        <div className="bg-primary-900 border border-primary-800 text-primary-light p-2 rounded-md text-sm font-weight-medium d-flex align-items-center gap-2"><LayoutDashboard size={14}/> Overview</div>
                        <div className="text-secondary nav-sidebar-item transition-all p-2 text-sm d-flex align-items-center gap-2 cursor-pointer"><BookOpen size={14}/> Collections</div>
                        <div className="text-secondary nav-sidebar-item transition-all p-2 text-sm d-flex align-items-center gap-2 cursor-pointer"><BarChart3 size={14}/> Analytics</div>
                        <div className="text-secondary nav-sidebar-item transition-all p-2 text-sm d-flex align-items-center gap-2 cursor-pointer"><Database size={14}/> Network</div>
                      </div>
                    </div>
                    
                    <div className="flex-grow-1 p-5 bg-secondary position-relative">
                      <div className="h5 text-white mb-4 font-weight-semibold">Continue Reading</div>
                      
                      <div className="d-flex mb-5 overflow-hidden position-relative" style={{ margin: '0 -1.25rem', padding: '0 1.25rem' }}>
                        <motion.div 
                          className="d-flex gap-4"
                          animate={{ x: [0, -1000] }} 
                          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                        >
                          {[...dummyBooks, ...dummyBooks, ...dummyBooks].map((img, i) => (
                            <motion.div 
                              key={i} 
                              whileHover={{ y: -6, scale: 1.02, boxShadow: '0 0 20px rgba(255,255,255,0.1)' }}
                              className="bg-primary border border-light rounded-xl overflow-hidden cursor-pointer shadow-soft group"
                              style={{ minWidth: '140px', flex: '0 0 auto', transition: 'all 0.3s ease' }}
                            >
                              <div className="w-100 position-relative overflow-hidden" style={{ aspectRatio: '3/4' }}>
                                <img src={img} alt="Book cover" className="w-100 h-100 object-cover book-cover-img transition-all" style={{ objectFit: 'cover', opacity: 0.8 }} />
                                <div className="position-absolute bottom-0 w-100 h-50 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                              </div>
                              <div className="p-3">
                                <div className="h-2 w-75 bg-secondary rounded-full mb-2"></div>
                                <div className="h-2 w-50 bg-tertiary rounded-full"></div>
                                <div className="mt-3 w-100 bg-tertiary h-1 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${30 + (i%3)*20}%` }} transition={{ delay: 1, duration: 1 }} className="h-100 bg-primary-500"></motion.div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Animated Toast */}
                <motion.div 
                  className="position-absolute bg-primary border border-light p-3 rounded-xl shadow-strong d-flex align-items-center gap-3"
                  style={{ bottom: '30px', left: '-30px', zIndex: 10, backdropFilter: 'blur(10px)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.5, type: 'spring' }}
                >
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-8 h-8 rounded-circle bg-success bg-opacity-20 d-flex align-items-center justify-content-center text-success"
                  >
                    <ShieldCheck size={16}/>
                  </motion.div>
                  <div>
                    <div className="text-sm font-weight-bold text-white">System Secure</div>
                    <div className="text-xs text-secondary">Encrypted & synced</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 position-relative">
        <div className="container">
          <div className="row justify-content-center gap-4">
            <div className="col-12 col-md-3">
              <motion.div whileHover={{ y: -5, boxShadow: '0 0 20px rgba(37,99,235,0.2)' }} className="bg-secondary border border-light rounded-xl pt-2 pb-0 text-center shadow-glow h-100">
                 <AnimatedCounter end={12000} label="Resources Available" />
              </motion.div>
            </div>
            <div className="col-12 col-md-3">
              <motion.div whileHover={{ y: -5, boxShadow: '0 0 20px rgba(37,99,235,0.2)' }} className="bg-secondary border border-light rounded-xl pt-2 pb-0 text-center shadow-glow h-100">
                 <AnimatedCounter end={3200} label="Active Readers" />
              </motion.div>
            </div>
            <div className="col-12 col-md-3">
              <motion.div whileHover={{ y: -5, boxShadow: '0 0 20px rgba(37,99,235,0.2)' }} className="bg-secondary border border-light rounded-xl pt-2 pb-0 text-center shadow-glow h-100">
                 <AnimatedCounter end={99} label="System Uptime" duration={2} />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Progressive Flow */}
      <section id="how-it-works" className="py-5 my-5 bg-primary">
        <div className="container pt-5">
          <div className="text-center mb-5 pb-5">
            <h2 className="display-4 font-weight-bold text-white mb-3 tracking-tight">The Knowledge Workflow</h2>
            <p className="text-secondary text-lg max-w-2xl mx-auto">A progressive journey from finding raw information to building interconnected wisdom.</p>
          </div>

          <div className="row g-4 position-relative">
            {/* Connecting Line */}
            <div className="d-none d-lg-block position-absolute" style={{ top: '40px', left: '16%', right: '16%', height: '2px', background: 'var(--border-medium)', zIndex: 0 }}>
              <motion.div 
                initial={{ width: 0 }} 
                whileInView={{ width: '100%' }} 
                viewport={{ once: true }} 
                transition={{ duration: 1.5, delay: 0.5 }}
                className="h-100 bg-primary-500 shadow-glow"
              ></motion.div>
              <motion.div 
                initial={{ left: 0 }} 
                whileInView={{ left: '100%' }} 
                viewport={{ once: true }} 
                transition={{ duration: 1.5, delay: 0.5 }}
                className="position-absolute w-3 h-3 rounded-circle bg-white shadow-glow"
                style={{ top: '50%', transform: 'translate(-50%, -50%)', zIndex: 1 }}
              ></motion.div>
            </div>

            {[
              { icon: <Search size={24}/>, step: "Step 1", title: "Discover", opacity: 0.5, glow: 'none', desc: "Search across thousands of resources instantly. Our intelligent engine finds exactly what you need." },
              { icon: <BookOpen size={24}/>, step: "Step 2", title: "Engage", opacity: 0.8, glow: '0 0 15px rgba(59,130,246,0.3)', desc: "Borrow digital or physical copies seamlessly. Manage your reading queue with prioritization." },
              { icon: <Database size={24}/>, step: "Step 3", title: "Synthesize", opacity: 1, glow: '0 0 30px rgba(59,130,246,0.8)', desc: "Build your personal knowledge graph. Track insights and connections automatically." }
            ].map((step, index) => (
              <div key={index} className="col-12 col-lg-4 text-center position-relative z-10 px-lg-4">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.3 }}
                  className="d-flex flex-column align-items-center"
                >
                  <div 
                    className="w-20 h-20 bg-secondary border border-light rounded-2xl d-flex align-items-center justify-content-center mb-4 shadow-strong text-white position-relative"
                    style={{ opacity: step.opacity, boxShadow: step.glow, transition: 'all 0.3s', zIndex: 10 }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = step.opacity}
                  >
                    {step.icon}
                    <div className="position-absolute top-100 bg-primary px-3 py-1 rounded-full border border-light text-xs font-weight-bold" style={{ transform: 'translateY(-50%)' }}>
                      {step.step}
                    </div>
                  </div>
                  <h3 className="h3 font-weight-bold text-white mb-3 mt-3">{step.title}</h3>
                  <p className="text-secondary text-sm">{step.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Feature: Advanced Knowledge Graph */}
      <section className="py-5 my-5 overflow-hidden position-relative bg-secondary border-y border-light">
        <div className="container py-5">
          <div className="row align-items-center position-relative z-10">
            <div className="col-12 col-lg-4 mb-5 mb-lg-0 pr-lg-5">
              <div className="badge border border-accent text-accent px-3 py-1 rounded-full mb-4 d-inline-block font-weight-semibold text-xs shadow-soft" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>USP &bull; Signature Feature</div>
              <h2 className="display-4 font-weight-bold text-white mb-4 tracking-tight">Turn your library into a living intelligence system.</h2>
              <p className="text-lg text-secondary mb-5">
                Libris automatically maps connections between authors, topics, and your reading history, transforming a static catalog into an interconnected neural network of insights.
              </p>
              <Button variant="outline" className="rounded-full shadow-glow">Explore Your Knowledge Graph</Button>
            </div>
            
            <div className="col-12 col-lg-8 position-relative">
              <div className="rounded-3xl border border-light overflow-hidden shadow-strong position-relative" style={{ height: '450px', background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 60%), #020617' }}>
                <div className="position-absolute top-0 left-0 w-100 h-100 opacity-20 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2) 2px, transparent 0)`, backgroundSize: '40px 40px' }}></div>
                
                {/* Advanced Graph Interactive Mockup */}
                <div className="w-100 h-100 position-relative">
                  {/* Lines/Connections */}
                  <svg className="position-absolute w-100 h-100 top-0 left-0 pointer-events-none" style={{ zIndex: 1 }}>
                    <motion.path d="M 150 150 Q 250 200 350 250" fill="transparent" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeDasharray="5 5" animate={{ strokeDashoffset: [0, -20] }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
                    <motion.path d="M 350 250 Q 400 150 500 120" fill="transparent" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" strokeDasharray="5 5" animate={{ strokeDashoffset: [0, 20] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} />
                    <motion.path d="M 350 250 Q 300 350 200 400" fill="transparent" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="2" strokeDasharray="5 5" animate={{ strokeDashoffset: [0, -20] }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} />
                  </svg>

                  {/* Nodes */}
                  <motion.div 
                    className="position-absolute w-16 h-16 bg-primary-600 rounded-circle border-2 border-primary-400 z-10 d-flex align-items-center justify-content-center text-white cursor-pointer shadow-glow"
                    style={{ left: '350px', top: '250px', transform: 'translate(-50%, -50%)' }}
                    whileHover={{ scale: 1.2 }}
                    animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    onMouseEnter={() => setActiveGraphNode('core')}
                    onMouseLeave={() => setActiveGraphNode(null)}
                  >
                    <BookOpen size={24}/>
                    <AnimatePresence>
                      {activeGraphNode === 'core' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="position-absolute bg-white text-dark text-xs p-2 rounded-md shadow-xl w-48 text-center" style={{ top: '-80px' }}>
                          <strong>"Atomic Habits"</strong><br/><span className="text-secondary">Connected to: Productivity, Behavior, Systems</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div 
                    className="position-absolute w-12 h-12 bg-secondary rounded-circle border border-light z-10 d-flex align-items-center justify-content-center text-secondary cursor-pointer"
                    style={{ left: '150px', top: '150px', transform: 'translate(-50%, -50%)' }}
                    whileHover={{ scale: 1.2, backgroundColor: '#3B82F6', color: 'white', borderColor: '#60A5FA' }}
                    animate={{ y: [0, 5, 0], x: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  >
                    <Users size={16}/>
                  </motion.div>

                  <motion.div 
                    className="position-absolute w-14 h-14 bg-tertiary rounded-circle border border-accent z-10 d-flex align-items-center justify-content-center text-accent cursor-pointer shadow-soft"
                    style={{ left: '200px', top: '400px', transform: 'translate(-50%, -50%)' }}
                    whileHover={{ scale: 1.2 }}
                    animate={{ y: [0, -5, 0], x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 6, delay: 1, ease: "easeInOut" }}
                  >
                    <Database size={18}/>
                  </motion.div>

                  <motion.div 
                    className="position-absolute w-10 h-10 bg-secondary rounded-circle border border-light z-10 d-flex align-items-center justify-content-center text-secondary cursor-pointer"
                    style={{ left: '500px', top: '120px', transform: 'translate(-50%, -50%)' }}
                    whileHover={{ scale: 1.2, backgroundColor: '#10B981', color: 'white' }}
                    animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.5, ease: "easeInOut" }}
                  >
                    <BookOpen size={14}/>
                   </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-5 my-5 position-relative">
        <div className="container">
          <div className="text-center p-5 rounded-3xl position-relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="position-absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500 rounded-full blur-[100px] opacity-20" style={{ transform: 'translate(30%, -30%)' }}></div>
            
            <div className="position-relative z-10 py-5">
              {/* Mock Avatars */}
              <div className="d-flex justify-content-center mb-4">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-primary-600 bg-secondary overflow-hidden shadow-soft" style={{ marginLeft: i>1 ? '-16px' : '0' }}>
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
              </div>
              
              <h2 className="display-4 font-weight-bold text-white mb-4 tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                Build a smarter way to think,<br/>learn, and grow.
              </h2>
              <p className="text-lg mb-5 max-w-2xl mx-auto opacity-80" style={{ color: '#dbdbdb' }}>
                Join over 3,000 knowledge workers who have transformed their personal libraries into active intelligence centers.
              </p>
              <Button variant="primary" size="lg" onClick={() => navigate('/register')} className="rounded-full px-5 py-3 text-lg border-0 text-white bg-gradient-to-r from-primary-600 to-primary-400" style={{ boxShadow: '0 0 30px rgba(37,99,235,0.5)' }}>
                Get Started Free
              </Button>
              <div className="text-xs mt-4 opacity-70" style={{ color: '#bdbdbd' }}>
                No credit card required. Free 14-day trial on Pro.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full SaaS Footer */}
      <footer className="pt-5 pb-4 bg-secondary border-top border-light">
        <div className="container mt-4">
          <div className="row mb-5">
            <div className="col-12 col-lg-4 mb-4 mb-lg-0">
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600 d-flex align-items-center justify-content-center">
                  <BookOpen className="text-white" size={18} />
                </div>
                <span className="font-weight-bold text-xl text-white">Libris</span>
              </div>
              <p className="text-secondary text-sm pe-lg-5 mb-4 opacity-80">
                The modern knowledge OS for individuals and enterprise libraries. Organize, discover, and synthesize information faster.
              </p>
              <div className="d-flex gap-3">
                 <motion.div whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(255,255,255,0.2)' }} className="w-8 h-8 rounded-circle bg-tertiary border border-light d-flex align-items-center justify-content-center text-secondary cursor-pointer hover-text-white transition-all">𝕏</motion.div>
                 <motion.div whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(255,255,255,0.2)' }} className="w-8 h-8 rounded-circle bg-tertiary border border-light d-flex align-items-center justify-content-center text-secondary cursor-pointer hover-text-white transition-all">in</motion.div>
                 <motion.div whileHover={{ scale: 1.1, boxShadow: '0 0 15px rgba(255,255,255,0.2)' }} className="w-8 h-8 rounded-circle bg-tertiary border border-light d-flex align-items-center justify-content-center text-secondary cursor-pointer hover-text-white transition-all">gh</motion.div>
              </div>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2">
              <h4 className="text-white font-weight-semibold text-sm text-uppercase letter-spacing-wide mb-4">Product</h4>
              <ul className="list-unstyled d-flex flex-column gap-3 text-sm">
                <li><a href="#" className="text-secondary hover-text-primary transition-all footer-link position-relative">Features</a></li>
                <li><a href="#" className="text-secondary hover-text-primary transition-all footer-link position-relative">Pricing</a></li>
                <li><a href="#" className="text-secondary hover-text-primary transition-all footer-link position-relative">Knowledge Graph API</a></li>
                <li><a href="#" className="text-secondary hover-text-primary transition-all footer-link position-relative">Changelog</a></li>
              </ul>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2">
              <h4 className="text-white font-weight-semibold text-sm text-uppercase letter-spacing-wide mb-4">Company</h4>
              <ul className="list-unstyled d-flex flex-column gap-3 text-sm">
                <li><a href="#" className="text-secondary hover-text-primary transition-all footer-link position-relative">About Us</a></li>
                <li><a href="#" className="text-secondary hover-text-primary transition-all footer-link position-relative">Careers</a> <span className="badge bg-primary-900 text-primary-light text-xs ml-1 rounded-full border-0">Hiring</span></li>
                <li><a href="#" className="text-secondary hover-text-primary transition-all footer-link position-relative">Blog</a></li>
                <li><a href="#" className="text-secondary hover-text-primary transition-all footer-link position-relative">Contact</a></li>
              </ul>
            </div>
            
            <div className="col-6 col-md-3 col-lg-2 mt-4 mt-md-0">
              <h4 className="text-white font-weight-semibold text-sm text-uppercase letter-spacing-wide mb-4">Legal</h4>
              <ul className="list-unstyled d-flex flex-column gap-3 text-sm">
                <li><a href="#" className="text-secondary hover-text-primary transition-all footer-link position-relative">Privacy Policy</a></li>
                <li><a href="#" className="text-secondary hover-text-primary transition-all footer-link position-relative">Terms of Service</a></li>
                <li><a href="#" className="text-secondary hover-text-primary transition-all footer-link position-relative">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-top border-light pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center text-sm text-secondary gap-3">
            <div>&copy; 2026 Libris Systems Inc. All rights reserved.</div>
            <div className="d-flex align-items-center gap-2">
              <div className="w-2 h-2 rounded-circle bg-success"></div> All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
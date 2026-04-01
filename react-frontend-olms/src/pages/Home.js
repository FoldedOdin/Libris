import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { BookOpen, Users, Zap, LayoutDashboard, Search, ArrowRight, ShieldCheck, BarChart3, Database } from 'lucide-react';
import AuthContext from '../contexts/AuthContext';
import { Button, Card, LoadingSpinner, ErrorMessage } from '../components/common';

// Number animation component
const AnimatedCounter = ({ end, duration = 2, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
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
  }, [end, duration]);

  return (
    <div className="stat-item flex flex-col align-items-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="stat-number text-primary font-weight-bold"
        style={{ fontSize: '3.5rem', lineHeight: 1, textShadow: '0 0 20px rgba(37, 99, 235, 0.3)' }}
      >
        {count.toLocaleString()}{end > 100 ? '+' : '%'}
      </motion.div>
      <div className="stat-label text-secondary mt-2 font-weight-semibold letter-spacing-wide text-uppercase text-sm">
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
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
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
    checkAuthAndRedirect();
  }, [isAuthenticated, user, navigate, isAdmin]);

  if (isLoading) return <LoadingSpinner text="Checking authentication..." />;
  if (error) return <ErrorMessage message={error.message} onRetry={() => window.location.reload()} />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="landing-page bg-primary min-h-screen text-primary overflow-hidden">
      
      {/* Navigation Header */}
      <nav className="landing-nav fixed w-100 z-50 transition-all" style={{ background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container py-3 d-flex justify-content-between align-items-center">
          <div className="nav-brand d-flex align-items-center gap-2">
            <BookOpen className="text-primary-light" size={28} />
            <span className="font-weight-bold text-xl text-dark">Libris</span>
          </div>
          <div className="nav-links d-none d-md-flex gap-4">
            <a href="#features" className="text-secondary hover-text-primary transition-all font-weight-medium">Features</a>
            <a href="#how-it-works" className="text-secondary hover-text-primary transition-all font-weight-medium">How it Works</a>
            <a href="#preview" className="text-secondary hover-text-primary transition-all font-weight-medium">Preview</a>
          </div>
          <div className="nav-actions d-flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-dark">Sign In</Button>
            <Button variant="primary" onClick={() => navigate('/register')} className="shadow-lg">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section position-relative pt-5" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <div className="position-absolute top-0 left-0 w-100 h-100 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-circle bg-primary-600 opacity-20 blur-[100px]" style={{ filter: 'blur(120px)' }}></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-circle bg-accent opacity-10 blur-[120px]" style={{ filter: 'blur(120px)' }}></div>
        </div>

        <div className="container">
          <div className="row align-items-center">
            {/* Left Column - Copy */}
            <motion.div 
              className="col-12 col-lg-6 pr-lg-5 mb-5 mb-lg-0"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="badge bg-primary-50 text-primary-700 px-3 py-2 rounded-full mb-4 d-inline-flex align-items-center gap-2 font-weight-medium border border-primary-100" style={{ background: 'rgba(37, 99, 235, 0.1)', borderColor: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa' }}>
                <Zap size={16} /> Libris OS 2.0 is live
              </motion.div>
              
              <motion.h1 variants={itemVariants} className="display-3 font-weight-bold text-dark mb-4" style={{ letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Your Knowledge.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent" style={{ backgroundImage: 'linear-gradient(to right, #3B82F6, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Organized. Accessible.<br/>Alive.
                </span>
              </motion.h1>
              
              <motion.p variants={itemVariants} className="text-xl text-secondary mb-5 pr-lg-5" style={{ fontSize: '1.25rem', lineHeight: 1.6 }}>
                Experience the modern productivity system designed for readers and organizations. Stop searching for your books, start interacting with your digital library.
              </motion.p>
              
              <motion.div variants={itemVariants} className="d-flex flex-wrap gap-4 align-items-center">
                <Button variant="primary" size="lg" onClick={() => navigate('/register')} className="shadow-lg" icon={<ArrowRight size={20} />}>
                  Start Your Journey
                </Button>
                <button onClick={() => navigate('/login')} className="bg-transparent border-0 text-primary-light font-weight-medium d-flex align-items-center gap-2 transition-all hover-translate-x cursor-pointer" style={{ fontSize: '1.1rem' }}>
                  Sign In <span>→</span>
                </button>
              </motion.div>
            </motion.div>

            {/* Right Column - Dashboard Preview */}
            <motion.div 
              className="col-12 col-lg-6"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="position-relative w-100" style={{ perspective: '1000px' }}>
                <motion.div 
                  className="hero-mockup-wrapper rounded-xl overflow-hidden shadow-2xl border border-light"
                  style={{ 
                    background: 'rgba(15, 23, 42, 0.8)', 
                    backdropFilter: 'blur(20px)',
                    transform: 'rotateY(-10deg) rotateX(5deg)',
                    transformStyle: 'preserve-3d'
                  }}
                  whileHover={{ rotateY: 0, rotateX: 0, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                >
                  {/* Mock Browser/App Header */}
                  <div className="p-3 border-bottom border-light d-flex align-items-center gap-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="d-flex gap-2">
                      <div className="w-3 h-3 rounded-circle bg-danger"></div>
                      <div className="w-3 h-3 rounded-circle bg-warning"></div>
                      <div className="w-3 h-3 rounded-circle bg-success"></div>
                    </div>
                    <div className="mx-auto bg-dark border border-light rounded-md px-4 py-1 text-xs text-muted flex-grow-1 max-w-xs text-center mx-4 flex align-items-center justify-content-center gap-2">
                      <Search size={12}/> Search Knowledge Graph...
                    </div>
                  </div>
                  {/* Mock App Content */}
                  <div className="p-4 d-flex gap-4">
                    {/* Mock Sidebar */}
                    <div className="w-25 border-right border-light pr-3 d-none d-md-block">
                      <div className="d-flex flex-column gap-3">
                        <div className="bg-primary-900 text-primary-light p-2 rounded-md text-sm font-weight-medium d-flex align-items-center gap-2"><LayoutDashboard size={14}/> Dashboard</div>
                        <div className="text-secondary p-2 text-sm d-flex align-items-center gap-2"><BookOpen size={14}/> My Library</div>
                        <div className="text-secondary p-2 text-sm d-flex align-items-center gap-2"><BarChart3 size={14}/> Reading Stats</div>
                        <div className="text-secondary p-2 text-sm d-flex align-items-center gap-2"><Database size={14}/> Knowledge Graph</div>
                      </div>
                    </div>
                    {/* Mock Main Content */}
                    <div className="flex-grow-1">
                      <div className="h4 text-dark mb-4 font-weight-bold">Recent Acquisitions</div>
                      <div className="d-flex gap-3 mb-4 overflow-hidden">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex-1 bg-dark border border-light rounded-lg p-3 w-100" style={{ minWidth: '140px' }}>
                            <div className="w-100 bg-secondary rounded-sm mb-3 position-relative overflow-hidden" style={{ aspectRatio: '3/4', background: i===1?'#1e293b':i===2?'#334155':'#0f172a' }}>
                              <div className="absolute bottom-0 left-0 w-100 h-50 bg-gradient-to-t from-black to-transparent"></div>
                            </div>
                            <div className="h-2 w-75 bg-secondary rounded-full mb-2"></div>
                            <div className="h-2 w-50 bg-border-dark rounded-full"></div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-primary-900 border border-primary-800 rounded-lg p-4 d-flex justify-content-between align-items-center" style={{ background: 'rgba(37,99,235,0.1)' }}>
                        <div>
                          <div className="text-sm text-primary-light font-weight-medium mb-1">Reading Goal</div>
                          <div className="text-dark font-weight-bold">12 / 24 Books</div>
                        </div>
                        <div className="w-12 h-12 rounded-circle border-4 border-primary-500 border-t-transparent flex items-center justify-center text-primary-light font-weight-bold text-sm">
                          50%
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Elements for 3D effect */}
                <motion.div 
                  className="position-absolute bg-dark border border-light p-3 rounded-lg shadow-xl d-flex align-items-center gap-3"
                  style={{ bottom: '-20px', left: '-20px', zIndex: 10, backdropFilter: 'blur(10px)' }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  <div className="w-10 h-10 rounded-circle bg-success flex items-center justify-center text-white"><ShieldCheck size={20}/></div>
                  <div>
                    <div className="text-sm font-weight-bold text-dark">System Secure</div>
                    <div className="text-xs text-secondary">All nodes synchronized</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5 bg-dark border-y border-light position-relative overflow-hidden">
        <div className="container position-relative z-10">
          <div className="row justify-content-center gap-5 gap-md-0">
            <div className="col-12 col-md-4 text-center">
              <AnimatedCounter end={12000} label="Resources Available" />
            </div>
            <div className="col-12 col-md-4 text-center border-x-md border-light">
              <AnimatedCounter end={3500} label="Active Researchers" />
            </div>
            <div className="col-12 col-md-4 text-center">
              <AnimatedCounter end={99} label="System Uptime" duration={2} />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-5 my-5">
        <div className="container">
          <div className="text-center mb-5 pb-4">
            <h2 className="display-5 font-weight-bold text-dark mb-3">The Knowledge Workflow</h2>
            <p className="text-secondary text-lg max-w-2xl mx-auto">Seamlessly move from discovery to mastery with our optimized three-step system.</p>
          </div>

          <div className="row g-4 relative">
            <div className="d-none d-lg-block position-absolute" style={{ top: '60px', left: '20%', right: '20%', height: '2px', background: 'linear-gradient(90deg, var(--primary-color) 0%, transparent 100%)', zIndex: 0, opacity: 0.3 }}></div>

            {[
              { icon: <Search size={32}/>, title: "1. Discover", desc: "Search across thousands of resources instantly. Our intelligent engine finds exactly what you need." },
              { icon: <BookOpen size={32}/>, title: "2. Engage", desc: "Borrow digital or physical copies seamlessly. Manage your reading queue with intelligent prioritization." },
              { icon: <Database size={32}/>, title: "3. Synthesize", desc: "Build your personal knowledge graph. Track insights, history, and connections automatically." }
            ].map((step, index) => (
              <div key={index} className="col-12 col-lg-4 text-center position-relative z-10">
                <Card hoverable className="h-100 mt-lg-0 p-5 bg-tertiary border-light shadow-lg">
                  <div className="w-16 h-16 mx-auto bg-primary-600 text-white rounded-2xl d-flex align-items-center justify-content-center mb-4 shadow-lg mb-4" style={{ transform: 'rotate(-5deg)' }}>
                    {step.icon}
                  </div>
                  <h3 className="h4 font-weight-bold text-dark mb-3">{step.title}</h3>
                  <p className="text-secondary">{step.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature Feature: Knowledge Graph Conceptual Block */}
      <section className="py-5 my-5 overflow-hidden position-relative">
        <div className="container">
          <div className="bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-light rounded-3xl p-5 shadow-2xl position-relative overflow-hidden" style={{ minHeight: '500px' }}>
            
            {/* Background decorative graph */}
            <div className="position-absolute top-0 left-0 w-100 h-100 opacity-20 pointer-events-none" 
                 style={{ 
                   backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2) 2px, transparent 0)`,
                   backgroundSize: '40px 40px' 
                 }}>
            </div>

            <div className="row h-100 align-items-center position-relative z-10">
              <div className="col-12 col-lg-5 mb-5 mb-lg-0">
                <div className="badge border border-accent text-accent px-3 py-1 rounded-full mb-4 d-inline-block font-weight-semibold">Signature Feature</div>
                <h2 className="display-4 font-weight-bold text-dark mb-4" style={{ letterSpacing: '-0.03em' }}>The Knowledge Graph View</h2>
                <p className="text-xl text-secondary mb-4">
                  Don't just store books. Build a brain. Libris automatically maps connections between authors, topics, and your reading history, transforming a static catalog into a living neural network of insights.
                </p>
                <ul className="list-unstyled text-secondary d-flex flex-column gap-3 mb-5">
                  <li className="d-flex align-items-center gap-3"><div className="w-2 h-2 rounded-circle bg-primary-light"></div> Visual relationship mapping</li>
                  <li className="d-flex align-items-center gap-3"><div className="w-2 h-2 rounded-circle bg-primary-light"></div> Automated topic clustering</li>
                  <li className="d-flex align-items-center gap-3"><div className="w-2 h-2 rounded-circle bg-primary-light"></div> Interactive timeline of your reading journey</li>
                </ul>
              </div>
              <div className="col-12 col-lg-7 position-relative">
                {/* Conceptual Graph Visualization */}
                <div className="w-100 h-100 d-flex align-items-center justify-content-center relative" style={{ minHeight: '400px' }}>
                   {/* Central Node */}
                   <motion.div animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 20px rgba(59,130,246,0.3)', '0 0 40px rgba(59,130,246,0.6)', '0 0 20px rgba(59,130,246,0.3)'] }} transition={{ repeat: Infinity, duration: 3 }} className="position-absolute w-24 h-24 bg-primary-600 rounded-circle border-4 border-dark z-20 d-flex align-items-center justify-content-center text-white shadow-xl shadow-primary-500/50">
                      <BookOpen size={32}/>
                   </motion.div>
                   {/* Orbiting Nodes */}
                   {[0, 1, 2, 3, 4].map((i) => (
                     <motion.div 
                        key={i}
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 20 + i*5, ease: "linear", reverse: i%2===0 }}
                        className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center pointer-events-none"
                     >
                       <div className={`position-absolute rounded-circle border border-light opacity-30`} style={{ width: `${(i+2)*80}px`, height: `${(i+2)*80}px` }}></div>
                       <motion.div 
                         animate={{ rotate: -360 }}
                         transition={{ repeat: Infinity, duration: 20 + i*5, ease: "linear", reverse: i%2===0 }}
                         className={`position-absolute w-12 h-12 rounded-circle border-2 border-dark shadow-lg d-flex align-items-center justify-content-center ${i%2===0 ? 'bg-accent text-dark' : 'bg-primary-900 border-primary-500 text-primary-light'}`}
                         style={{ transform: `translateY(-${(i+2)*40}px)`, pointerEvents: 'auto' }}
                       >
                         {i%2===0?<Users size={16}/>:<Database size={16}/>}
                       </motion.div>
                     </motion.div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 left-0 w-100 h-100 bg-primary-600 opacity-10" style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(37,99,235,0.3) 0%, transparent 70%)' }}></div>
        <div className="container py-5 text-center position-relative z-10">
          <h2 className="display-4 font-weight-bold text-dark mb-4" style={{ letterSpacing: '-0.02em', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            Start building your<br/>personal knowledge system today.
          </h2>
          <p className="text-xl text-secondary mb-5 max-w-2xl mx-auto">
            Join the smartest teams and individuals who organize their libraries and accelerate their learning with Libris.
          </p>
          <div className="d-flex flex-wrap gap-4 justify-content-center mb-5">
            <Button variant="primary" size="lg" onClick={() => navigate('/register')} className="shadow-xl" style={{ padding: '1.25rem 3rem', fontSize: '1.2rem' }}>
              Create Free Account
            </Button>
          </div>
          <div className="d-flex align-items-center justify-content-center gap-3 text-secondary text-sm font-weight-medium">
            <span><ShieldCheck size={16} className="inline mr-1"/> Enterprise Security</span>
            <span>•</span>
            <span><Zap size={16} className="inline mr-1"/> Lightning Fast</span>
            <span>•</span>
            <span><Users size={16} className="inline mr-1"/> 24/7 Support</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 border-top border-light bg-dark" style={{ background: '#0B0F19' }}>
        <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
          <div className="d-flex align-items-center gap-2">
            <BookOpen className="text-secondary" size={24} />
            <span className="font-weight-bold text-lg text-dark">Libris</span>
          </div>
          <div className="text-secondary text-sm">
            &copy; 2026 Libris Systems. Empowering knowledge workers globally.
          </div>
          <div className="d-flex gap-4 text-sm">
            <a href="#" className="text-secondary hover-text-primary transition-all">Privacy Policy</a>
            <a href="#" className="text-secondary hover-text-primary transition-all">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
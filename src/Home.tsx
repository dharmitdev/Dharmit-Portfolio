import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Palette, Wrench, GraduationCap, Code2, Layers, Terminal, Sparkles, Box, FileCode2, Braces, GitBranch, Github, Laptop, Zap, Atom, ChevronDown } from 'lucide-react';

// Custom easing function (easeInOutQuart)
function easeInOutQuart(t: number, b: number, c: number, d: number) {
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t * t * t + b;
  t -= 2;
  return (-c / 2) * (t * t * t * t - 2) + b;
}

function smoothScrollTo(targetId: string, duration: number = 1200) {
  const targetElement = document.querySelector(targetId) as HTMLElement;
  if (!targetElement) return;

  const navOffset = targetId === '#hero' ? 0 : 80;
  const targetPosition = targetElement.offsetTop - navOffset;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  let startTime: number | null = null;

  const animation = (currentTime: number) => {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuart(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    } else {
      window.scrollTo(0, targetPosition);
    }
  };

  requestAnimationFrame(animation);
}

export default function Home() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [attachment, setAttachment] = useState<{ name: string; type: string; base64: string } | null>(null);
  const [sentAttachmentName, setSentAttachmentName] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: '' });
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [showHireModal, setShowHireModal] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const roles = ['interfaces', 'web apps', 'UI/UX designs', 'experiences'];
  const [displayText, setDisplayText] = useState('');
  const [roleIndex, setRoleIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = roles[roleIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (displayText !== currentWord) {
        timer = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, 100);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2000);
      }
    } else {
      if (displayText !== '') {
        timer = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
        }, 50);
      } else {
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % roles.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, roleIndex]);

  useEffect(() => {
    const hero = heroRef.current;
    if (hero) {
      const handleMouseMove = (e: MouseEvent) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        hero.style.setProperty('--mouse-x', `${x}px`);
        hero.style.setProperty('--mouse-y', `${y}px`);
      };
      hero.addEventListener('mousemove', handleMouseMove);
      return () => {
        hero.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setAttachment(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setAttachment({
        name: file.name,
        type: file.type,
        base64: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus({ loading: true, success: false, error: '' });
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          attachment: attachment ? {
            name: attachment.name,
            type: attachment.type,
            base64: attachment.base64
          } : null
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Contact API is unavailable on this host. Please reach out directly to dharmitpatel8960@gmail.com');
        }
        throw new Error(data?.error || `Failed to send message (HTTP ${res.status})`);
      }
      
      setFormStatus({ loading: false, success: true, error: '' });
      setSentAttachmentName(attachment ? attachment.name : '');
      setFormData({ name: '', email: '', message: '' });
      setAttachment(null);
      
      // Trigger Toast
      setToast({ visible: true, message: "Thanks! I'll get back to you within 24 hours." });
      setTimeout(() => {
        setToast({ visible: false, message: '' });
        setFormStatus({ loading: false, success: false, error: '' });
      }, 4000);
      
      // Clear file input
      const fileInput = document.getElementById('file-attachment') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setFormStatus({ loading: false, success: false, error: err.message || 'An unexpected error occurred while sending your message.' });
    }
  };

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          revealObserver.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.2, rootMargin: '-10% 0px -40% 0px' });
    sections.forEach(section => sectionObserver.observe(section));

    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();

    return () => {
      revealEls.forEach(el => revealObserver.unobserve(el));
      revealObserver.disconnect();
      sections.forEach(section => sectionObserver.unobserve(section));
      sectionObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <>
      <nav className={isScrolled ? 'scrolled' : ''}>
        <a href="#hero" className="nav-logo" onClick={(e) => {
          e.preventDefault();
          smoothScrollTo('#hero', 1400); // Slower easing just for the logo scroll to top
        }}>Dharmit<span>.</span></a>
        <ul className="nav-links">
          <li><a href="#about" className={activeSection === 'about' ? 'active' : ''} onClick={(e) => { e.preventDefault(); smoothScrollTo('#about', 1000); }}>About</a></li>
          <li><a href="#projects" className={activeSection === 'projects' ? 'active' : ''} onClick={(e) => { e.preventDefault(); smoothScrollTo('#projects', 1000); }}>Work</a></li>
          <li><a href="#experience" className={activeSection === 'experience' ? 'active' : ''} onClick={(e) => { e.preventDefault(); smoothScrollTo('#experience', 1000); }}>Experience</a></li>
          <li><a href="#contact" className={activeSection === 'contact' ? 'active' : ''} onClick={(e) => { e.preventDefault(); smoothScrollTo('#contact', 1000); }}>Contact</a></li>
        </ul>
        <button className="nav-cta" onClick={() => setShowHireModal(true)}>Hire Me</button>
      </nav>

      <section className="hero" id="hero" ref={heroRef}>
        <div className="hero-grid-overlay"></div>
        <div className="hero-status-container">
          <div className="availability-badge"><span></span> Available for opportunities</div>
        </div>
        <p className="hero-eyebrow">
          <span className="hero-role-label">
            I build <span className="hero-rotating-word">{displayText}<span className="hero-cursor">|</span></span> people <span className="accent">love.</span>
          </span>
        </p>
        <h1 className="hero-title">
          <span className="hero-title-line">
            <span className="hero-title-inner">Frontend</span>
          </span>
          <span className="hero-title-line">
            <span className="hero-title-inner">
              Developer
            </span>
          </span>
          <span className="hero-title-line">
            <span className="hero-title-inner">
              &amp; <em className="accent">UI/UX Designer</em>
            </span>
          </span>
        </h1>
        <p className="hero-sub">Frontend Web Developer &amp; UI/UX Designer crafting fast, responsive, and visually precise web experiences. Specializing in React, TypeScript, and translating Figma designs into high-performance, pixel-perfect code.</p>
        <div className="hero-actions">
          <a href="#projects" className="btn-primary" onClick={(e) => { e.preventDefault(); smoothScrollTo('#projects', 1000); }}>
            View My Work <span className="btn-arrow">↓</span>
          </a>
        </div>
        <button 
          className={`hero-scroll-indicator ${isScrolled ? 'hidden' : ''}`}
          onClick={() => smoothScrollTo('#about', 800)}
          aria-label="Scroll to about section"
        >
          <div className="mouse-icon">
            <span className="mouse-wheel"></span>
          </div>
          <span className="hero-scroll-text">Scroll down</span>
          <ChevronDown size={12} className="scroll-arrow" />
        </button>
        <div className="hero-stats">
          <div className="stat"><div className="stat-num">12+</div><div className="stat-label">Projects Shipped</div></div>
          <div className="stat"><div className="stat-num">2+</div><div className="stat-label">Years Building</div></div>
        </div>
      </section>

      <div className="section-divider"></div>

      <section id="about">
        <p className="section-label reveal">About</p>
        <div className="about-grid">
          <div>
            <h2 className="section-title reveal">Turning<br/><em>ideas into</em><br/>products.</h2>
            <div className="about-body reveal reveal-delay-1">
              <p>I'm <strong>Dharmit Patel</strong>, a self-driven front-end developer from Gujarat, India, focused on building React-powered web experiences that are <strong>fast, responsive, and intuitive</strong>.</p>
              <p>I got into development because I love the intersection of logic and visual design — where clean code meets thoughtful UI. Every component I write is built with both the developer and the end-user in mind.</p>
              <p>I'm currently deepening my skills in <strong>React, API integration, and performance optimization</strong>, and actively looking for opportunities where I can ship real products and keep growing. Open to freelance and full-time roles.</p>
            </div>
          </div>
          <div className="skills-grid reveal reveal-delay-2">
            <div className="skill-group">
              <div className="skill-group-name"><Code2 size={13} className="text-[var(--acid)]" /> Core</div>
              <div className="skill-tags">
                <span className="skill-tag"><Atom size={11} className="opacity-70" /> React</span>
                <span className="skill-tag"><Braces size={11} className="opacity-70" /> JavaScript</span>
                <span className="skill-tag"><FileCode2 size={11} className="opacity-70" /> HTML5</span>
                <span className="skill-tag"><Layers size={11} className="opacity-70" /> CSS3</span>
              </div>
            </div>
            <div className="skill-group">
              <div className="skill-group-name"><Palette size={13} className="text-[var(--acid)]" /> Styling</div>
              <div className="skill-tags">
                <span className="skill-tag"><Zap size={11} className="opacity-70" /> Tailwind CSS</span>
                <span className="skill-tag"><Sparkles size={11} className="opacity-70" /> Framer Motion</span>
                <span className="skill-tag"><Layers size={11} className="opacity-70" /> SCSS</span>
              </div>
            </div>
            <div className="skill-group">
              <div className="skill-group-name"><Wrench size={13} className="text-[var(--acid)]" /> Tooling</div>
              <div className="skill-tags">
                <span className="skill-tag"><GitBranch size={11} className="opacity-70" /> Git</span>
                <span className="skill-tag"><Github size={11} className="opacity-70" /> GitHub</span>
                <span className="skill-tag"><Laptop size={11} className="opacity-70" /> VS Code</span>
                <span className="skill-tag"><Zap size={11} className="opacity-70" /> Vite</span>
              </div>
            </div>
            <div className="skill-group">
              <div className="skill-group-name"><GraduationCap size={13} className="text-[var(--acid)]" /> Currently learning</div>
              <div className="skill-tags">
                <span className="skill-tag"><Box size={11} className="opacity-70" /> Next.js</span>
                <span className="skill-tag"><FileCode2 size={11} className="opacity-70" /> TypeScript</span>
                <span className="skill-tag"><Cpu size={11} className="opacity-70" /> Node.js</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      <section id="projects">
        <p className="section-label reveal">Selected Work</p>
        <h2 className="section-title reveal">Projects that<br/><em>ship.</em></h2>
        <div className="bento-wrapper reveal">
          <div className="bento">
            
            <div className="project-card featured reveal">
            <div className="project-thumb">
              <svg className="project-thumb-pattern" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice">
                <defs><pattern id="grid1" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="#b8ff57" strokeWidth="0.5"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#grid1)" opacity="0.5"/>
                <circle cx="300" cy="170" r="100" fill="none" stroke="#b8ff57" strokeWidth="0.5" opacity="0.4"/>
              </svg>
              <div className="project-thumb-inner">01</div>
            </div>
            <div className="project-num">01</div>
            <div className="project-content">
              <div className="project-tags">
                <span className="project-tag">React</span>
                <span className="project-tag">Tailwind CSS</span>
                <span className="project-tag">JavaScript</span>
              </div>
              <h3 className="project-name">PureBite – Food Order App</h3>
              <p className="project-desc">A responsive online food ordering platform with real-time cart management, menu filtering, and a streamlined checkout flow. Built mobile-first with React state management and Tailwind utility classes.</p>
              <div className="project-links">
                <a href="https://purebite-food.vercel.app/" target="_blank" rel="noreferrer" className="project-link primary">Live Demo →</a>
                <a href="https://github.com" className="project-link">GitHub ↗</a>
              </div>
            </div>
          </div>

          <div className="project-card side reveal reveal-delay-1">
            <div className="project-thumb">
              <svg className="project-thumb-pattern" viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <pattern id="pipes" width="50" height="50" patternUnits="userSpaceOnUse">
                    <path d="M 0 25 L 50 25 M 25 0 L 25 50" fill="none" stroke="#b8ff57" strokeWidth="0.5" opacity="0.3"/>
                    <circle cx="25" cy="25" r="8" fill="none" stroke="#b8ff57" strokeWidth="0.5" opacity="0.4"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#pipes)"/>
                <path d="M 80 60 C 180 20, 250 100, 320 60" fill="none" stroke="#b8ff57" strokeWidth="1" opacity="0.4"/>
                <path d="M 80 130 C 180 90, 250 170, 320 130" fill="none" stroke="#b8ff57" strokeWidth="1.5" opacity="0.6"/>
              </svg>
              <div className="project-thumb-inner">02</div>
            </div>
            <div className="project-num">02</div>
            <div className="project-content">
              <div className="project-tags">
                <span className="project-tag">React</span>
                <span className="project-tag">Vite</span>
                <span className="project-tag">Tailwind CSS</span>
                <span className="project-tag">Gemini API</span>
              </div>
              <h3 className="project-name">Pipe & Tube Finder</h3>
              <p className="project-desc">A smart engineering reference and pressure piping specification database. Allows users to quickly search, filter, and calculate ASME/ANSI B36.10 dimensions, alloy suffixes, and Indian Boiler Regulations (IBR) rules with full offline capability and Gemini-powered smart intelligence.</p>
              <div className="project-links">
                <a href="https://dharmitpnt.vercel.app/" target="_blank" rel="noreferrer" className="project-link primary">Live Demo →</a>
                <a href="https://github.com/dharmitdev/Dharmit-hmt" target="_blank" rel="noreferrer" className="project-link">GitHub ↗</a>
              </div>
            </div>
          </div>

          <div className="project-card wide reveal reveal-delay-1">
            <div className="project-thumb">
              <svg className="project-thumb-pattern" viewBox="0 0 500 280" preserveAspectRatio="xMidYMid slice">
                <defs><pattern id="diag3" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="20" x2="20" y2="0" stroke="#b8ff57" strokeWidth="0.5"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#diag3)" opacity="0.5"/>
                <polygon points="250,40 420,240 80,240" fill="rgba(184,255,87,0.05)" stroke="#b8ff57" strokeWidth="0.5"/>
              </svg>
              <div className="project-thumb-inner">03</div>
            </div>
            <div className="project-num">03</div>
            <div className="project-content">
              <div className="project-tags">
                <span className="project-tag">React</span>
                <span className="project-tag">API</span>
                <span className="project-tag">Tailwind</span>
              </div>
              <h3 className="project-name">Weather Dashboard</h3>
              <p className="project-desc">Real-time weather app integrating the OpenWeather API. Features 7-day forecasts, location search, and animated condition icons.</p>
              <div className="project-links">
                <Link to="/weather" className="project-link primary">Live Demo →</Link>
                <a href="https://github.com" className="project-link">GitHub ↗</a>
              </div>
            </div>
          </div>

          <div className="project-card wide reveal reveal-delay-2">
            <div className="project-thumb">
              <svg className="project-thumb-pattern" viewBox="0 0 500 280" preserveAspectRatio="xMidYMid slice">
                <defs><pattern id="hex4" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M15 0 L30 8 L30 22 L15 30 L0 22 L0 8Z" fill="none" stroke="#b8ff57" strokeWidth="0.5"/></pattern></defs>
                <rect width="100%" height="100%" fill="url(#hex4)" opacity="0.4"/>
              </svg>
              <div className="project-thumb-inner">04</div>
            </div>
            <div className="project-num">04</div>
            <div className="project-content">
              <div className="project-tags">
                <span className="project-tag">React</span>
                <span className="project-tag">LocalStorage</span>
                <span className="project-tag">CSS</span>
              </div>
              <h3 className="project-name">Task Manager App</h3>
              <p className="project-desc">A productivity-focused to-do app with drag-and-drop reordering, priority labels, and persistent state via localStorage.</p>
              <div className="project-links">
                <a href="#" className="project-link primary">Live Demo →</a>
                <a href="https://github.com" className="project-link">GitHub ↗</a>
              </div>
            </div>
          </div>



        </div>
      </div>
      </section>

      <div className="section-divider"></div>

      <section id="experience">
        <p className="section-label reveal">Background</p>
        <h2 className="section-title reveal">Where I've<br/><em>been.</em></h2>
        <div className="timeline reveal reveal-delay-1">
          <div className="timeline-item">
            <div className="timeline-period">Feb 2024 - PRESENT</div>
            <div>
              <div className="timeline-role">Freelance Front-End Developer</div>
              <div className="timeline-org">Independent · Remote</div>
              <p className="timeline-desc">Designing and building responsive websites for small businesses and personal clients. Focused on clean UI, fast load times, and delivering on brief without unnecessary bloat. Handling end-to-end frontend development and client communication.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-period">Jan 2023 — Jun 2023</div>
            <div>
              <div className="timeline-role">Front-End Developer Intern</div>
              <div className="timeline-org">Maxgen Technologies · Gujarat</div>
              <p className="timeline-desc">Assisted in developing user interfaces for client projects. Gained hands-on experience with modern frontend workflows, version control, and collaborating within a professional development team.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-period">2019 — 2023</div>
            <div>
              <div className="timeline-role">B.Tech in Computer Engineering</div>
              <div className="timeline-org">Ganpat University, Mehsana</div>
              <p className="timeline-desc">Completed formal education in Computer Engineering, building a strong foundation in frontend engineering, UI/UX principles, and web performance optimization.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      <section id="contact">
        <div className="contact-grid">
          <div>
            <p className="section-label reveal">Contact</p>
            <h2 className="contact-heading reveal">Let's build<br/>something<br/><em>great.</em></h2>
            <p className="contact-sub reveal reveal-delay-1">Available for freelance projects and full-time front-end roles. If you have an idea, a problem to solve, or just want to talk code — reach out.</p>
            <a href="mailto:dharmitpatel8960@gmail.com" className="contact-email reveal reveal-delay-2">dharmitpatel8960@gmail.com</a>
            <div className="socials reveal reveal-delay-2">
              <a href="https://github.com/dharmitdev" target="_blank" rel="noreferrer" className="social-link">GitHub</a>
              <a href="https://www.linkedin.com/in/dharmit-patel-" target="_blank" rel="noreferrer" className="social-link">LinkedIn</a>
              <a href="/Dharmit's-Resume.pdf" download="Dharmit's-Resume.pdf" className="social-link">Resume ↓</a>
            </div>
          </div>
          <form className="contact-form reveal reveal-delay-1" onSubmit={handleContactSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input type="text" name="name" className="form-input" placeholder="Alex Johnson" required value={formData.name} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" name="email" className="form-input" placeholder="alex@company.com" required value={formData.email} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea name="message" className="form-textarea" placeholder="Hi Dharmit, I'd like to discuss..." required value={formData.message} onChange={handleFormChange}></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Attachment (Optional)</label>
              <div className="file-upload-wrapper" style={{
                border: '1px dashed var(--border)',
                borderRadius: '4px',
                padding: '1rem',
                background: 'rgba(240,234,214,0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                position: 'relative',
                transition: 'border-color 0.2s',
              }}>
                <input 
                  type="file" 
                  id="file-attachment" 
                  onChange={handleFileChange} 
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%'
                  }} 
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--acid)' }}><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                <span style={{ fontSize: '0.8rem', color: 'var(--cream-dim)', fontFamily: 'var(--font-mono)' }}>
                  {attachment ? attachment.name : "Attach File (PDF, Images, etc.)"}
                </span>
                {attachment && (
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAttachment(null);
                      const fileInput = document.getElementById('file-attachment') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }} 
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ff6b6b',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      zIndex: 2,
                      textDecoration: 'underline'
                    }}
                  >
                    Remove File
                  </button>
                )}
              </div>
            </div>
            <button className={`form-btn ${formStatus.success ? 'success' : ''}`} type="submit" disabled={formStatus.loading || formStatus.success}>
              {formStatus.loading ? (
                <div className="spinner"></div>
              ) : formStatus.success ? (
                <div className="checkmark-wrapper">
                  <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                </div>
              ) : (
                'Send Message →'
              )}
            </button>
            {formStatus.error && (
              <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '6px', background: 'rgba(255, 107, 107, 0.08)', border: '1px solid rgba(255, 107, 107, 0.25)' }}>
                <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{formStatus.error}</p>
                <a
                  href={`mailto:dharmitpatel8960@gmail.com?subject=Portfolio Inquiry from ${encodeURIComponent(formData.name || 'Visitor')}&body=${encodeURIComponent(formData.message + (formData.email ? `\n\nFrom: ${formData.email}` : ''))}`}
                  style={{ color: 'var(--acid)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', textDecoration: 'underline', display: 'inline-block' }}
                >
                  ✉ Click here to send directly via your email app →
                </a>
              </div>
            )}
          </form>
        </div>
      </section>



      {toast.visible && (
        <div className="toast-notification">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--acid)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <span>{toast.message}</span>
        </div>
      )}

      {showHireModal && (
        <div className="hire-modal-overlay" onClick={() => {
          setShowHireModal(false);
          smoothScrollTo('#contact', 1000);
        }}>
          <div className="hire-modal-drawer" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => {
              setShowHireModal(false);
              smoothScrollTo('#contact', 1000);
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="hire-modal-header">
              <div className="availability-badge modal-badge"><span></span> Available for opportunities</div>
              <h3>Let's work together!</h3>
              <p>I'm currently accepting new freelance projects and full-time opportunities. Reach out via any of the platforms below.</p>
            </div>
            
            <div className="hire-modal-services">
              <h4>Core Services</h4>
              <ul>
                <li>Frontend Development</li>
                <li>UI/UX Engineering</li>
                <li>Responsive Websites</li>
                <li>UI Implementation</li>
              </ul>
            </div>

            <div className="hire-modal-actions">
              <a href="mailto:dharmitpatel8960@gmail.com" className="hire-action-btn">
                <span>📧</span> Email Me
              </a>
              <a href="https://wa.me/910000000000" target="_blank" rel="noreferrer" className="hire-action-btn">
                <span>💬</span> WhatsApp
              </a>
              <a href="https://www.linkedin.com/in/dharmit-patel-" target="_blank" rel="noreferrer" className="hire-action-btn">
                <span>💼</span> LinkedIn
              </a>
              <button 
                className="hire-action-btn"
                onClick={(e) => {
                  e.preventDefault();
                  setShowHireModal(false);
                  smoothScrollTo('#contact', 1000);
                }}
              >
                <span>✉️</span> Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      <footer>
        <p className="footer-copy">© <span>{new Date().getFullYear()}</span> Dharmit Patel. Built with <span>♥</span> in Gujarat, India.</p>
        <p className="footer-copy" style={{ opacity: 0.5 }}>Front-End Developer · Open to Work</p>
      </footer>

      <button 
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={() => smoothScrollTo('#hero', 1000)}
        aria-label="Back to top"
      >
        ↑
      </button>
    </>
  );
}

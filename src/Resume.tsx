import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function Resume() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    // Auto-trigger print if ?print=true parameter is present
    const isPrintTriggered = searchParams.get('print') === 'true' || window.location.hash.includes('print=true') || window.location.search.includes('print=true');
    if (isPrintTriggered) {
      const timer = setTimeout(() => {
        window.print();
      }, 800); // minor delay to ensure layout and styling are ready
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="resume-page-container min-h-screen bg-[#0a0a08] text-[#f0ead6] font-sans relative pb-16">
      {/* Background visual element */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(184,255,87,0.03),transparent_40%)] pointer-events-none"></div>

      {/* Navigation / Header controls for the page */}
      <header className="no-print max-w-4xl mx-auto px-6 pt-8 pb-4 flex justify-between items-center border-b border-[rgba(240,234,214,0.08)] relative z-10">
        <Link to="/" className="text-sm font-mono text-[var(--cream-dim)] hover:text-[var(--acid)] transition-colors flex items-center gap-2">
          ← Back to Portfolio
        </Link>
        <button 
          onClick={handlePrint}
          className="px-4 py-2 bg-[var(--acid)] text-[var(--ink)] font-semibold rounded hover:bg-[var(--acid-dim)] transition-colors text-sm flex items-center gap-2 font-mono"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline"><path d="M6 9V2h12v7"></path><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print / Save PDF
        </button>
      </header>

      {/* Resume Content Sheet */}
      <main className="max-w-4xl mx-auto p-6 md:p-12 relative z-10 print-padding mt-4 bg-[var(--surface)] border border-[rgba(240,234,214,0.05)] rounded-lg shadow-2xl print-no-border print-no-shadow print-bg-white print-text-black">
        {/* Print Stylesheet Hooked here for clean PDF generation */}
        <style>{`
          @media print {
            body {
              background: white !important;
              color: black !important;
              font-family: Arial, Helvetica, sans-serif !important;
            }
            .no-print {
              display: none !important;
            }
            .print-padding {
              padding: 0 !important;
              margin-top: 0 !important;
            }
            .print-no-border {
              border: none !important;
              background: white !important;
            }
            .print-no-shadow {
              box-shadow: none !important;
            }
            .print-text-black {
              color: #000000 !important;
            }
            .print-text-dim {
              color: #555555 !important;
            }
            .print-accent {
              color: #000000 !important;
              font-weight: bold !important;
              border-bottom: 2px solid #000 !important;
            }
            .print-skills {
              background: none !important;
              border: 1px solid #ccc !important;
              color: black !important;
            }
            .resume-section-title {
              color: #000000 !important;
              border-bottom: 1.5px solid #333 !important;
              padding-bottom: 4px !important;
            }
            a {
              color: black !important;
              text-decoration: underline !important;
            }
          }
        `}</style>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-[rgba(240,234,214,0.1)] pb-8 print-text-black">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--cream)] print-text-black mb-2">
              DHARMIT PATEL
            </h1>
            <p className="text-lg md:text-xl font-mono text-[var(--acid)] print-text-dim font-medium tracking-wide">
              Frontend Web Developer & UI/UX Designer
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-left md:text-right font-mono text-sm text-[var(--cream-dim)] print-text-dim space-y-1">
            <p>Kadi, India 382715</p>
            <p>+91 7990638902</p>
            <p className="hover:text-[var(--acid)] transition-colors">
              <a href="mailto:dharmitpatel8960@gmail.com">dharmitpatel8960@gmail.com</a>
            </p>
            <div className="flex flex-wrap gap-x-3 md:justify-end pt-1">
              <a href="https://linkedin.com/in/dharmit-patel-" target="_blank" rel="noreferrer" className="hover:text-[var(--acid)] underline transition-colors">LinkedIn</a>
              <span>•</span>
              <a href="https://github.com/dharmitdev" target="_blank" rel="noreferrer" className="hover:text-[var(--acid)] underline transition-colors">GitHub</a>
              <span>•</span>
              <Link to="/" className="hover:text-[var(--acid)] underline transition-colors">Portfolio</Link>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <section className="mt-8">
          <h2 className="resume-section-title text-lg font-mono text-[var(--acid)] uppercase tracking-widest border-b border-[rgba(240,234,214,0.1)] pb-2 mb-4 print-accent">
            Professional Summary
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-[var(--cream-dim)] print-text-black">
            Detail-oriented Frontend Web Developer and UI/UX Designer with hands-on experience in building responsive, user-centric web applications. Proficient in HTML5, CSS3, JavaScript, and modern styling frameworks like Tailwind CSS. Adept at translating Figma designs into functional code and optimizing web performance for seamless digital experiences.
          </p>
        </section>

        {/* Core & Technical Skills Section */}
        <section className="mt-8">
          <h2 className="resume-section-title text-lg font-mono text-[var(--acid)] uppercase tracking-widest border-b border-[rgba(240,234,214,0.1)] pb-2 mb-4 print-accent">
            Technical Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm print-text-black">
            <div>
              <p className="mb-2"><strong className="text-[var(--cream)] print-text-black">Languages:</strong> <span className="text-[var(--cream-dim)] print-text-dim">HTML5, CSS3, JavaScript (ES6+), TypeScript</span></p>
              <p className="mb-2"><strong className="text-[var(--cream)] print-text-black">Frameworks/Libraries:</strong> <span className="text-[var(--cream-dim)] print-text-dim">React, Vite, Tailwind CSS, Bootstrap, Next.js</span></p>
              <p className="mb-2"><strong className="text-[var(--cream)] print-text-black">Developer Tools:</strong> <span className="text-[var(--cream-dim)] print-text-dim">Git, GitHub, VS Code, Netlify, Chrome DevTools</span></p>
            </div>
            <div>
              <p className="mb-2"><strong className="text-[var(--cream)] print-text-black">Design Tools:</strong> <span className="text-[var(--cream-dim)] print-text-dim">Figma, Responsive Web Design, UI/UX Principles</span></p>
              <p className="mb-2"><strong className="text-[var(--cream)] print-text-black">Soft Skills:</strong> <span className="text-[var(--cream-dim)] print-text-dim">Planning & Execution, Problem Solving, Attention to Detail</span></p>
              <p className="mb-2"><strong className="text-[var(--cream)] print-text-black">Languages Spoken:</strong> <span className="text-[var(--cream-dim)] print-text-dim">English (Advanced), Hindi (Proficient), Gujarati (Native)</span></p>
            </div>
          </div>
        </section>

        {/* Professional Experience Section */}
        <section className="mt-8">
          <h2 className="resume-section-title text-lg font-mono text-[var(--acid)] uppercase tracking-widest border-b border-[rgba(240,234,214,0.1)] pb-2 mb-4 print-accent">
            Professional Experience
          </h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="text-base md:text-lg font-semibold text-[var(--cream)] print-text-black">
                FIVERR <span className="text-sm font-normal text-[var(--cream-dim)] print-text-dim">| Kadi, India</span>
              </h3>
              <span className="font-mono text-xs text-[var(--acid)] print-text-dim">08/2023 – Present</span>
            </div>
            <p className="font-mono text-xs text-[var(--cream-dim)] print-text-dim uppercase tracking-wider mb-2">Freelance Frontend Developer</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-[var(--cream-dim)] print-text-black">
              <li>Design and develop custom, responsive websites for global clients using HTML/CSS and Tailwind CSS, ensuring 100% mobile compatibility.</li>
              <li>Translate complex UI/UX designs from Figma into high-quality code with a focus on pixel-perfect implementation.</li>
              <li>Maintain and update client web applications, improving load times and SEO performance through clean code practices.</li>
            </ul>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-2">
              <h3 className="text-base md:text-lg font-semibold text-[var(--cream)] print-text-black">
                MAXGEN TECHNOLOGIES <span className="text-sm font-normal text-[var(--cream-dim)] print-text-dim">| Ahmedabad, India</span>
              </h3>
              <span className="font-mono text-xs text-[var(--acid)] print-text-dim">01/2023 – 06/2023</span>
            </div>
            <p className="font-mono text-xs text-[var(--cream-dim)] print-text-dim uppercase tracking-wider mb-2">Frontend Web Developer Intern</p>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-[var(--cream-dim)] print-text-black">
              <li>Collaborated with senior developers to build interactive user interfaces for web applications using JavaScript.</li>
              <li>Implemented responsive design techniques that increased mobile user engagement by optimizing site layouts for various screen sizes.</li>
              <li>Redesigned legacy site modules to enhance navigation flow and visual appeal, resulting in a more intuitive user journey.</li>
            </ul>
          </div>
        </section>

        {/* Selected Projects Section */}
        <section className="mt-8">
          <h2 className="resume-section-title text-lg font-mono text-[var(--acid)] uppercase tracking-widest border-b border-[rgba(240,234,214,0.1)] pb-2 mb-4 print-accent">
            Featured Projects
          </h2>

          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="text-base md:text-lg font-semibold text-[var(--cream)] print-text-black">
                Pipe & Tube Finder
              </h3>
              <span className="font-mono text-xs text-[var(--cream-dim)] print-text-dim">Vite, React, Tailwind CSS, Gemini API</span>
            </div>
            <p className="text-sm text-[var(--cream-dim)] print-text-black mb-2">
              A smart engineering reference and pressure piping specification database. Built offline-capable matching engine for ASME/ANSI B36.10 dimension calculations and integrated Gemini AI intelligence.
            </p>
            <div className="text-xs font-mono text-[var(--acid)] print-text-dim space-x-3">
              <a href="https://dharmitpnt.vercel.app/" target="_blank" rel="noreferrer" className="hover:underline">Live Demo</a>
              <span>•</span>
              <a href="https://github.com/dharmitdev/Dharmit-hmt" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="text-base md:text-lg font-semibold text-[var(--cream)] print-text-black">
                PureBite – Online Food Ordering Platform
              </h3>
              <span className="font-mono text-xs text-[var(--cream-dim)] print-text-dim">React, Tailwind CSS, JavaScript</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-[var(--cream-dim)] print-text-black mb-2">
              <li>Developed a full-featured frontend for a food delivery application focusing on a streamlined checkout process.</li>
              <li>Optimized frontend performance by reducing image sizes and minifying scripts, leading to faster initial load times.</li>
              <li>Solved complex layout challenges using CSS Grid and Flexbox to ensure a consistent experience across browsers.</li>
            </ul>
            <div className="text-xs font-mono text-[var(--acid)] print-text-dim space-x-3">
              <a href="https://purebite-food.vercel.app/" target="_blank" rel="noreferrer" className="hover:underline">Live Demo</a>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section className="mt-8">
          <h2 className="resume-section-title text-lg font-mono text-[var(--acid)] uppercase tracking-widest border-b border-[rgba(240,234,214,0.1)] pb-2 mb-4 print-accent">
            Education
          </h2>
          <div className="flex justify-between items-baseline">
            <div>
              <h3 className="text-base md:text-lg font-semibold text-[var(--cream)] print-text-black">
                Ganpat University <span className="text-sm font-normal text-[var(--cream-dim)] print-text-dim">| Mehsana, India</span>
              </h3>
              <p className="text-sm text-[var(--cream-dim)] print-text-black">Bachelor of Technology (B.Tech) in Computer Engineering</p>
            </div>
            <span className="font-mono text-xs text-[var(--acid)] print-text-dim">Graduated 06/2023</span>
          </div>
        </section>
      </main>
    </div>
  );
}

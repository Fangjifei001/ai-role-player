"use client";

import { Inter, Noto_Sans_SC } from "next/font/google";
import { useRouter } from "next/navigation";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-home-inter",
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-home-noto-sc",
  display: "swap",
});

/** Scoped styles aligned with project root `test.html` */
const homePageCss = `
  @keyframes home-wave {
    0%, 100% { height: 6px; }
    50% { height: 24px; }
  }
  .home-page-root {
    font-family: var(--font-home-inter), var(--font-home-noto-sc), sans-serif;
  }
  .home-page-root .home-voice-wave {
    display: flex;
    align-items: center;
    gap: 3px;
    height: 28px;
  }
  .home-page-root .home-wave-bar {
    width: 3px;
    background: linear-gradient(to top, var(--brand-primary), var(--brand-accent));
    border-radius: 3px;
    animation: home-wave 1.2s ease-in-out infinite;
  }
  .home-page-root .home-wave-bar:nth-child(2) { animation-delay: 0.1s; }
  .home-page-root .home-wave-bar:nth-child(3) { animation-delay: 0.2s; }
  .home-page-root .home-wave-bar:nth-child(4) { animation-delay: 0.3s; }
  .home-page-root .home-wave-bar:nth-child(5) { animation-delay: 0.4s; }
  .home-page-root .home-tech-glow {
    text-shadow: 0 0 15px rgba(208, 0, 0, 0.2);
  }
  .home-page-root .home-btn-tech {
    transition: all 0.3s ease;
  }
  .home-page-root .home-btn-tech:hover {
    box-shadow: 0 0 20px rgba(208, 0, 0, 0.3);
    transform: translateY(-3px);
  }
  /* test.html .tech-line */
  .home-page-root .home-tech-line {
    position: absolute;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--brand-tech-line), transparent);
    z-index: 0;
    pointer-events: none;
  }
  /* test.html .line-decor */
  .home-page-root .home-line-decor {
    background: linear-gradient(90deg, transparent, var(--brand-primary), transparent);
  }
  /* Sign In: override Ant Design reset on native buttons */
  .home-page-root button.home-sign-in {
    color: var(--brand-primary) !important;
    background-color: transparent !important;
  }
  .home-page-root button.home-sign-in:hover {
    color: #ffffff !important;
    background-color: var(--brand-primary) !important;
  }
`;

export default function Home() {
  const router = useRouter();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: homePageCss }} />
      <div
        className={`home-page-root ${inter.variable} ${notoSansSC.variable} flex min-h-screen flex-col overflow-x-hidden text-gray-800 [background-image:radial-gradient(rgba(208,0,0,0.03)_2px,transparent_2px)] [background-size:30px_30px] bg-fixed backdrop-blur-[4px]`}
      >
        <nav className="fixed top-0 left-0 z-50 w-full px-6 py-4 text-gray-800 backdrop-blur-md md:px-16">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="home-voice-wave" aria-hidden>
                <div className="home-wave-bar" />
                <div className="home-wave-bar" />
                <div className="home-wave-bar" />
                <div className="home-wave-bar" />
                <div className="home-wave-bar" />
              </div>
              <div className="text-2xl font-bold text-brand">VoiceTrain AI</div>
            </div>
            <button
              type="button"
              className="home-sign-in rounded-full border border-brand px-5 py-2 font-medium transition-all"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* Inner hero matches test.html section: min-h-screen + pt-24 + relative so tech-line top/bottom-1/4 spacing matches */}
        <section className="relative flex min-h-0 flex-1 flex-col">
          <div className="relative flex min-h-screen w-full -translate-y-5 flex-col items-center justify-center px-6 pt-24 sm:-translate-y-6">
            <div className="home-tech-line top-1/4 hidden md:block" aria-hidden />
            <div className="home-tech-line bottom-1/4 hidden md:block" aria-hidden />

            <div className="home-line-decor relative z-10 mb-8 hidden h-px w-64 md:block" aria-hidden />

            <h1
              className="home-tech-glow relative z-10 max-w-4xl text-center text-2xl leading-snug font-bold text-brand sm:text-3xl sm:leading-tight md:text-4xl lg:text-[56px] lg:leading-tight"
              style={{ fontFamily: 'Inter, "Noto Sans SC", sans-serif' }}
            >
              Embark on your fantastic sales skills journey
            </h1>

            <p className="relative z-10 mt-6 max-w-3xl text-center text-[clamp(1rem,2vw,1.25rem)] leading-relaxed text-gray-600">
              Choose where to go next. Learners open the dashboard; admins configure scenarios and personas.
            </p>

            <div className="relative z-10 mt-6 flex flex-col gap-5 sm:flex-row">
              <button
                type="button"
                className="home-btn-tech rounded-full bg-brand px-10 py-4 font-medium !text-white duration-300"
                onClick={() => router.push("/dashboard")}
              >
                Learner Dashboard
              </button>
              <button
                type="button"
                className="home-btn-tech rounded-full border border-gray-300 bg-white px-10 py-4 font-medium text-gray-700 duration-300 hover:border-brand"
                onClick={() => router.push("/admin")}
              >
                Admin Configuration
              </button>
            </div>

            <div className="home-line-decor relative z-10 mt-16 hidden h-px w-64 md:block" aria-hidden />
          </div>
        </section>

        <footer className="shrink-0 pb-5 pt-2 text-center text-sm text-gray-500">
          <div className="container mx-auto">
            <p>
              © 2025 VoiceTrain AI · Enterprise Voice Training System |{" "}
              <a href="#" className="text-brand hover:underline">
                Privacy Policy
              </a>{" "}
              |{" "}
              <a href="#" className="text-brand hover:underline">
                Terms of Use
              </a>
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

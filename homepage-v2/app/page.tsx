import { BookOpenText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-base-100 flex min-h-screen flex-col items-center justify-center font-sans">
      <main className="hero bg-base-200/50 relative mx-auto min-h-[80vh] w-full max-w-5xl overflow-hidden rounded-3xl shadow-2xl">
        {/* Background decoration */}
        <div className="bg-primary/20 animate-blob absolute top-0 -left-4 h-72 w-72 rounded-full opacity-70 mix-blend-multiply blur-2xl filter"></div>
        <div className="bg-secondary/20 animate-blob animation-delay-2000 absolute top-0 -right-4 h-72 w-72 rounded-full opacity-70 mix-blend-multiply blur-2xl filter"></div>
        <div className="bg-accent/20 animate-blob animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 rounded-full opacity-70 mix-blend-multiply blur-2xl filter"></div>

        <div className="hero-content relative z-10 flex-col px-8 py-20 text-center">
          <div className="mb-8 rounded-3xl border border-white/20 bg-white/50 p-4 shadow-sm backdrop-blur-sm">
            <BookOpenText className="text-primary h-16 w-16 drop-shadow-md" />
          </div>

          <div className="max-w-2xl">
            <h1 className="text-base-content mb-6 text-5xl font-extrabold tracking-tight">
              Welcome to <span className="text-primary">Knowledge Base</span>
            </h1>

            <p className="text-base-content/70 py-6 text-xl leading-relaxed font-light">
              Explore comprehensive documentation on Frontend, Backend, and Core
              CS concepts. Built with{" "}
              <span className="text-primary font-semibold">Next.js 16</span> and{" "}
              <span className="text-secondary font-semibold">Nextra 4</span>.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/docs"
                className="btn btn-primary btn-lg shadow-primary/30 rounded-full px-10 shadow-lg transition-all duration-300 hover:scale-105"
              >
                Start Reading
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="ml-2 h-5 w-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
              <a
                href="https://161043261.github.io/resume/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-secondary btn-lg rounded-full px-10 transition-all duration-300 hover:scale-105"
              >
                View Resume
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer footer-center text-base-content/60 mt-auto p-10">
        <aside>
          <p>Built with ❤️ using Next.js & Tailwind CSS</p>
        </aside>
      </footer>
    </div>
  );
}

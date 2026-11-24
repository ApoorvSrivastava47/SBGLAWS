import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageMeta } from '../components/PageMeta';

export function NotFoundPage() {
  return (
    <div className="bg-white text-[#08070C] min-h-[70vh] flex items-center">
      <PageMeta
        title="Page Not Found"
        description="The requested page on AWS Student Builder Group – UCER could not be found."
      />
      <div className="max-w-[1360px] mx-auto px-4 sm:px-8 py-12 sm:py-20 w-full">
        <div className="max-w-2xl bg-[#E4D5FF]/40 border border-[#08070C]/15 p-6 sm:p-10 md:p-14 space-y-5">
          <p className="font-mono text-xs uppercase tracking-widest text-[#243A68]">
            Error 404 · Route Not Found
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight">
            This page does not exist.
          </h1>
          <p className="text-sm sm:text-base text-[#08070C]/75">
            The route you entered could not be found. Use the links below to return to the
            community homepage or browse active events.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#08070C] text-white text-sm font-medium hover:bg-[#243A68]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center justify-center px-5 py-3 bg-white border border-[#08070C]/20 text-sm font-medium hover:border-[#08070C]"
            >
              View Events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

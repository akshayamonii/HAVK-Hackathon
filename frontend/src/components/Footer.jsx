import { ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:px-6 md:flex-row md:items-center md:justify-between">
        <p><span className="font-bold text-white">Twitch Arena</span> is an unofficial hackathon concept. Teams, matches and scores are fictional demonstration data.</p>
        <a href="https://www.twitch.tv" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-white hover:text-mint">
          Visit Twitch <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </footer>
  )
}

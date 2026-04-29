import Image from 'next/image'
import Link from 'next/link'

export const metadata = { title: 'Home – Campus Life Companion' }

export default function HomePage() {
  return (
    <div className="container">

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-text">
          <h2>Welcome to Campus Life Companion</h2>
          <p>
            A student-centred platform designed to make university life easier.
            Browse events, explore societies, check room information, and access
            support services — all in one place.
          </p>
          <Link href="/events" className="hero-btn">Explore Events</Link>
        </div>
        <div>
          <img
            src="/uni.jpg"
            alt="University students walking on campus"
            className="hero-image"
          />
        </div>
      </section>

      {/* QUICK ACCESS */}
      <section className="features-section">
        <h3>Quick Access</h3>
        <div className="card-grid">
          <Link href="/events" className="feature-card">
            <h4>Events</h4>
            <p>View upcoming university events and apply to join activities.</p>
          </Link>
          <Link href="/societies" className="feature-card">
            <h4>Societies</h4>
            <p>Discover student societies and campus communities.</p>
          </Link>
          <Link href="/rooms" className="feature-card">
            <h4>Library Rooms</h4>
            <p>Check available study spaces and room details.</p>
          </Link>
          <Link href="/support" className="feature-card">
            <h4>Support</h4>
            <p>Get help and find the right support resources for your needs.</p>
          </Link>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section">
        <h3>About the Platform</h3>
        <p>
          Universities often provide information through different systems,
          websites, and emails. This platform brings important student services
          together into one simple and accessible space, helping students find
          what they need more quickly and easily.
        </p>
      </section>

    </div>
  )
}

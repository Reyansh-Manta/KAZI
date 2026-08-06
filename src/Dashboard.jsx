import { useRef } from 'react';
import { eventsList } from './data/events';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ user, handleLogout }) {
  const eventsRef = useRef(null);
  const navigate = useNavigate();

  const scrollToEvents = () => {
    eventsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-brand">
          <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
          <span>Kaziranga House</span>
        </div>
        <div className="header-user">
          <span className="user-email">{user.email}</span>
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="header-avatar" />
          ) : (
            <div className="header-avatar-placeholder" />
          )}
          <button onClick={handleLogout} className="header-logout">Sign Out</button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <p className="hero-subtitle">RHINO REALM PRESENTS</p>
        <h1 className="hero-title">Kaziranga<br/>Community Day</h1>
        <p className="hero-description">
          A celebration of nature, community, and competition. Discover our exclusive events hosted by the sub-communities of Rhino Realm. 
        </p>
        <button onClick={scrollToEvents} className="explore-btn">
          Explore Events
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </section>

      {/* Events Grid */}
      <section className="events-section" ref={eventsRef}>
        <h2 className="section-title">The Events</h2>
        <div className="events-grid">
          {eventsList.map((event) => (
            <div key={event.id} className="event-card" onClick={() => navigate(`/event/${event.id}`)} style={{ cursor: 'pointer' }}>
              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-desc">
                  Hosted by <strong>{event.community}</strong><br/>
                  <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>{event.head}</span><br/><br/>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Presented by {event.region} Region <br/>(Collab: {event.collab})
                  </span>
                </p>
                {/* Space for Date and Time placeholder */}
                <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', fontSize: '0.85rem', color: '#475569', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '16px', height: '16px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  TBA | Time TBA
                </div>
              </div>
              <button className="register-btn" style={{ background: 'var(--primary-color)', color: 'white', marginTop: '1.5rem', cursor: 'pointer' }}>Register</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

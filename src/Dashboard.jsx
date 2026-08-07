import { useRef, useState, useEffect } from 'react';
import { eventsList } from './data/events';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { collection, getCountFromServer } from 'firebase/firestore';

export default function Dashboard({ user, handleLogout }) {
  const eventsRef = useRef(null);
  const navigate = useNavigate();
  const [regCounts, setRegCounts] = useState({});

  const scrollToEvents = () => {
    eventsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = {};
      await Promise.all(
        eventsList.map(async (event) => {
          try {
            const colRef = collection(db, `${event.title} registrations`);
            const snapshot = await getCountFromServer(colRef);
            counts[event.id] = snapshot.data().count;
          } catch {
            counts[event.id] = 0;
          }
        })
      );
      setRegCounts(counts);
    };
    fetchCounts();
  }, []);

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
            <div key={event.id} className="event-card" onClick={() => navigate(`/event/${event.id}`)} style={{ cursor: 'pointer', position: 'relative' }}>
              {/* Registration Count Badge */}
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, var(--primary-color), #2d8a5e)',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '700',
                boxShadow: '0 4px 12px rgba(26, 71, 49, 0.35)',
                zIndex: 2,
                letterSpacing: '0.02em'
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '14px', height: '14px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                </svg>
                {regCounts[event.id] !== undefined ? regCounts[event.id] : '…'}
              </div>

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
                  {event.date} | {event.time}
                </div>
              </div>
              <button className="register-btn" style={{ background: 'var(--primary-color)', color: 'white', marginTop: '1.5rem', cursor: 'pointer' }}>View Event Page</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

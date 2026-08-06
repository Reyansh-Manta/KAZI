import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsList, regions } from './data/events';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';

export default function EventPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = eventsList.find(e => e.id === parseInt(id));

  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    phone: '',
    email: user?.email || '',
    region: '',
    source: '',
    otherSource: '',
    editingLevel: '',
    rollNo: '',
    gender: '',
    house: '',
    whatsappNumber: '',
    ffUid: '',
    ffIgn: '',
    bgmiUid: '',
    bgmiIgn: '',
    experience: '',
    activeSkill: '',
    chessId: '',
    peakRating: '',
    currentRating: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Secondary form states
  const [registrationId, setRegistrationId] = useState(null);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const [checkingRegistration, setCheckingRegistration] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Check if already registered
  useEffect(() => {
    const checkRegistration = async () => {
      if (!user || !event) return;
      try {
        const q = query(
          collection(db, 'registrations'), 
          where('eventId', '==', event.id),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setRegistrationId(docSnap.id);
          const data = docSnap.data();
          if (event.requiresSubmission && data.submissionLink) {
            setSubmissionSuccess(true);
          }
          setSuccess(true);
        }
      } catch(err) {
        console.error("Error checking registration:", err);
      }
      setCheckingRegistration(false);
    };
    
    checkRegistration();
  }, [user, event]);

  if (!event) return <div className="app-container" style={{color: 'white', paddingTop: '4rem'}}>Event not found</div>;
  if (checkingRegistration) return <div className="app-container" style={{color: 'white', paddingTop: '4rem', textAlign: 'center'}}>Checking registration status...</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registrationData = {
        eventId: event.id,
        eventTitle: event.title,
        userId: user.uid,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        region: formData.region,
        source: formData.source === 'Other' ? formData.otherSource : formData.source,
        timestamp: serverTimestamp()
      };
      
      if (event.title === 'Photopia') {
        registrationData.editingLevel = formData.editingLevel;
      }
      
      if (event.title === 'Free Fire' || event.title === 'BGMI') {
        registrationData.rollNo = formData.rollNo;
        registrationData.gender = formData.gender;
        registrationData.house = formData.house;
        registrationData.whatsappNumber = formData.whatsappNumber;
        registrationData.experience = formData.experience;
      }
      
      if (event.title === 'Chaturanga') {
        registrationData.chessId = formData.chessId;
        registrationData.peakRating = formData.peakRating;
        registrationData.currentRating = formData.currentRating;
      }
      
      if (event.title === 'Free Fire') {
        registrationData.ffUid = formData.ffUid;
        registrationData.ffIgn = formData.ffIgn;
        registrationData.activeSkill = formData.activeSkill;
      }
      
      if (event.title === 'BGMI') {
        registrationData.bgmiUid = formData.bgmiUid;
        registrationData.bgmiIgn = formData.bgmiIgn;
      }

      const docRef = await addDoc(collection(db, 'registrations'), registrationData);
      setRegistrationId(docRef.id);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleLinkSubmit = async (e) => {
    e.preventDefault();
    setSubmissionLoading(true);
    try {
      await updateDoc(doc(db, 'registrations', registrationId), {
        submissionLink: submissionLink
      });
      setSubmissionSuccess(true);
    } catch (err) {
      console.error(err);
    }
    setSubmissionLoading(false);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="dashboard-container" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={handleBack} style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(255,255,255,0.8)', color: 'var(--text-primary)', border: '1px solid rgba(26, 71, 49, 0.2)', borderRadius: '30px', fontSize: '0.9rem', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{width: '18px', height: '18px'}}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Events
      </button>
      
      <div className="event-card" style={{ cursor: 'default', transform: 'none', background: 'rgba(255,255,255,0.95)', border: 'none', boxShadow: '0 25px 50px -12px rgba(26, 71, 49, 0.4)' }}>
        <h1 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>{event.title}</h1>
        <p className="event-desc" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
          Hosted by <strong style={{ color: 'var(--primary-color)'}}>{event.community}</strong> ({event.head})<br/>
          Presented by {event.region} Region (Collab: {event.collab})
        </p>

        <div 
          style={{ fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: '1.6', marginTop: '0.75rem', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}
          dangerouslySetInnerHTML={{ __html: event.description }}
        />
        
        <hr style={{ border: 'none', borderTop: '1px solid rgba(26, 71, 49, 0.15)', margin: '1.5rem 0' }} />

        {success ? (
          <div style={{ marginTop: '1rem', textAlign: 'center', padding: '2.5rem', background: 'rgba(39, 90, 62, 0.05)', borderRadius: '16px', border: '1px solid rgba(39, 90, 62, 0.1)' }}>
            <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#166534" style={{width: '32px', height: '32px'}}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontFamily: 'Playfair Display' }}>Registration Successful! 🎉</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Please join the WhatsApp group for updates and further instructions regarding {event.title}.</p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://chat.whatsapp.com/placeholder" target="_blank" rel="noreferrer" className="explore-btn" style={{ textDecoration: 'none' }}>
                Join WhatsApp Group
              </a>
              {event.title === 'IRIDESCENT' && (
                <a href="https://binaryminds.vercel.app/events" target="_blank" rel="noreferrer" className="explore-btn" style={{ textDecoration: 'none', background: 'white', color: 'var(--primary-color)', border: '2px solid var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width: '18px', height: '18px'}}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  View Problem Statements
                </a>
              )}
              <button onClick={() => navigate('/')} className="explore-btn" style={{ background: 'white', color: 'var(--primary-color)', border: '2px solid var(--primary-color)' }}>
                Explore Other Events
              </button>
            </div>

            {event.requiresSubmission && !submissionSuccess && (
              <form onSubmit={handleLinkSubmit} style={{ marginTop: '3rem', padding: '1.5rem', background: 'white', borderRadius: '12px', border: '1px solid rgba(26, 71, 49, 0.2)', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                  {event.title === 'Photopia' ? 'Submit Your Photograph' : 'Submit Your Presentation'}
                </h3>
                <div className="form-group">
                  <label>Submission Link (Google Drive, etc.) *</label>
                  <input type="url" required value={submissionLink} onChange={(e) => setSubmissionLink(e.target.value)} className="form-input" placeholder="https://..." />
                  <small style={{color: 'var(--text-secondary)', marginTop: '4px'}}>Please ensure the link is publicly accessible.</small>
                </div>
                <button type="submit" disabled={submissionLoading} className="google-btn" style={{ marginTop: '1rem', borderRadius: '12px', padding: '10px 16px', width: 'auto' }}>
                  {submissionLoading ? 'Submitting...' : 'Submit Link'}
                </button>
              </form>
            )}
            
            {submissionSuccess && (
              <div style={{ marginTop: '2rem', padding: '1rem', background: '#dcfce7', borderRadius: '8px', color: '#166534', fontWeight: '600' }}>
                Submission Link received successfully!
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Full Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="form-input" />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="form-input" />
            </div>

            <div className="form-group">
              <label>Student Email ID *</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="form-input" disabled />
            </div>

            {(event.title === 'Free Fire' || event.title === 'BGMI') && (
              <>
                <div className="form-group">
                  <label>Roll No. *</label>
                  <input type="text" required value={formData.rollNo} onChange={(e) => setFormData({...formData, rollNo: e.target.value})} className="form-input" />
                </div>
                
                <div className="form-group">
                  <label>Gender *</label>
                  <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="form-input">
                    <option value="" disabled>Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>House *</label>
                  <input type="text" required value={formData.house} onChange={(e) => setFormData({...formData, house: e.target.value})} className="form-input" />
                </div>

                <div className="form-group">
                  <label>WhatsApp Number *</label>
                  <input type="tel" required value={formData.whatsappNumber} onChange={(e) => setFormData({...formData, whatsappNumber: e.target.value})} className="form-input" />
                </div>
                
                <div className="form-group">
                  <label>Player's Experience (in years) *</label>
                  <input type="number" required min="0" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="form-input" />
                </div>
              </>
            )}

            {event.title === 'Free Fire' && (
              <>
                <div className="form-group">
                  <label>Freefire UID *</label>
                  <input type="text" required value={formData.ffUid} onChange={(e) => setFormData({...formData, ffUid: e.target.value})} className="form-input" />
                </div>
                
                <div className="form-group">
                  <label>Freefire In-Game Name *</label>
                  <input type="text" required value={formData.ffIgn} onChange={(e) => setFormData({...formData, ffIgn: e.target.value})} className="form-input" />
                </div>
                
                <div className="form-group">
                  <label>Do you want to use the Active skill in this tournament? *</label>
                  <select required value={formData.activeSkill} onChange={(e) => setFormData({...formData, activeSkill: e.target.value})} className="form-input">
                    <option value="" disabled>Select Yes/No</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </>
            )}

            {event.title === 'BGMI' && (
              <>
                <div className="form-group">
                  <label>BGMI Character ID (UID) *</label>
                  <input type="text" required value={formData.bgmiUid} onChange={(e) => setFormData({...formData, bgmiUid: e.target.value})} className="form-input" />
                </div>
                
                <div className="form-group">
                  <label>BGMI In-Game Name (IGN) *</label>
                  <input type="text" required value={formData.bgmiIgn} onChange={(e) => setFormData({...formData, bgmiIgn: e.target.value})} className="form-input" />
                </div>
              </>
            )}

            {event.title === 'Chaturanga' && (
              <>
                <div className="form-group">
                  <label>Chess.com ID *</label>
                  <input type="text" required value={formData.chessId} onChange={(e) => setFormData({...formData, chessId: e.target.value})} className="form-input" />
                </div>
                
                <div className="form-group">
                  <label>Peak Rating *</label>
                  <input type="number" required min="0" value={formData.peakRating} onChange={(e) => setFormData({...formData, peakRating: e.target.value})} className="form-input" />
                </div>
                
                <div className="form-group">
                  <label>Current Rating *</label>
                  <input type="number" required min="0" value={formData.currentRating} onChange={(e) => setFormData({...formData, currentRating: e.target.value})} className="form-input" />
                </div>
              </>
            )}

            <div className="form-group">
              <label>Region *</label>
              <select required value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} className="form-input">
                <option value="" disabled>Select your region</option>
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {event.title === 'Photopia' && (
              <div className="form-group">
                <label>Editing Level *</label>
                <select required value={formData.editingLevel} onChange={(e) => setFormData({...formData, editingLevel: e.target.value})} className="form-input">
                  <option value="" disabled>Select your editing level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label style={{ marginBottom: '1rem', display: 'block', fontWeight: '600' }}>How did you get to know about the event? *</label>
              <div className="radio-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {['Email', 'Gspace', 'Whatsapp(Regional Group)', 'Whatsapp(Kaziranga main group chat)', 'Other'].map(opt => (
                  <label key={opt} className="radio-label" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="radio" name="source" value={opt} required onChange={(e) => setFormData({...formData, source: e.target.value})} style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }} />
                    <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                  </label>
                ))}
              </div>
              {formData.source === 'Other' && (
                <input type="text" placeholder="Please specify" required value={formData.otherSource} onChange={(e) => setFormData({...formData, otherSource: e.target.value})} className="form-input mt-2" style={{ marginTop: '0.75rem' }} />
              )}
            </div>

            <button type="submit" disabled={loading} className="google-btn" style={{ marginTop: '1rem', borderRadius: '12px' }}>
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

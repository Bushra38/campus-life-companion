'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [applications, setApplications] = useState([])
  const [status, setStatus] = useState('')
  const [editingId, setEditingId] = useState(null)

  // ML Recommender state
  const [recStudentId, setRecStudentId] = useState('')
  const [recommendations, setRecommendations] = useState([])
  const [recStatus, setRecStatus] = useState('')
  const [recLoading, setRecLoading] = useState(false)

  const [form, setForm] = useState({
    studentId: '',
    eventId: '',
    applicationDate: '',
    reasonToJoin: '',
  })

  useEffect(() => {
    loadEvents()
    loadApplications()
  }, [])

  async function loadEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('event_id, event_name, event_date, event_time, event_location, societies(society_name, category)')
      .order('event_id', { ascending: true })
    if (error) { setStatus('Failed to load events: ' + error.message); return }
    setEvents(data || [])
  }

  async function loadApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select('application_id, student_id, event_id, application_date, reason_to_join')
      .order('application_id', { ascending: true })
    if (error) { setStatus('Failed to load applications: ' + error.message); return }
    setApplications(data || [])
  }

  // ML RECOMMENDER ALGORITHM
  // 1. Get societies the student joined -> extract categories
  // 2. Get events already applied to -> exclude them
  // 3. Score every remaining event:
  //    +3 points if event category matches student joined society category
  //    +1 point base score for all events
  //    +1 behaviour boost if student applied to same category before
  // 4. Sort by score descending -> show top 3
  async function getRecommendations() {
    if (!recStudentId) { setRecStatus('Please enter your Student ID.'); return }
    setRecLoading(true)
    setRecStatus('Finding recommendations...')
    setRecommendations([])

    const { data: memberships, error: memError } = await supabase
      .from('society_members')
      .select('society_id, societies(category, society_name)')
      .eq('student_id', Number(recStudentId))
    if (memError) { setRecStatus('Error: ' + memError.message); setRecLoading(false); return }

    const { data: appliedEvents, error: appError } = await supabase
      .from('applications')
      .select('event_id')
      .eq('student_id', Number(recStudentId))
    if (appError) { setRecStatus('Error: ' + appError.message); setRecLoading(false); return }

    const { data: allEvents, error: evError } = await supabase
      .from('events')
      .select('event_id, event_name, event_date, event_time, event_location, societies(society_name, category)')
    if (evError) { setRecStatus('Error: ' + evError.message); setRecLoading(false); return }

    if (!memberships || memberships.length === 0) {
      setRecStatus('You have not joined any societies yet. Join a society first to get recommendations!')
      setRecLoading(false)
      return
    }

    const studentCategories = memberships.map(m => m.societies?.category?.toLowerCase()).filter(Boolean)
    const appliedEventIds = (appliedEvents || []).map(a => a.event_id)

    const scored = allEvents
      .filter(ev => !appliedEventIds.includes(ev.event_id))
      .map(ev => {
        const eventCategory = ev.societies?.category?.toLowerCase() || ''
        let score = 1
        if (studentCategories.includes(eventCategory)) score += 3
        const sameCategory = appliedEvents?.some(a => {
          const appliedEvent = allEvents.find(e => e.event_id === a.event_id)
          return appliedEvent?.societies?.category?.toLowerCase() === eventCategory
        })
        if (sameCategory) score += 1
        return { ...ev, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    if (scored.length === 0) {
      setRecStatus('No new events to recommend - you have applied to all available events!')
    } else {
      setRecommendations(scored)
      setRecStatus('Found ' + scored.length + ' recommended event' + (scored.length > 1 ? 's' : '') + ' based on your interests.')
    }
    setRecLoading(false)
  }

  function applyForEvent(eventId) {
    const today = new Date().toISOString().split('T')[0]
    setForm(f => ({ ...f, eventId: String(eventId), applicationDate: today }))
    setStatus('Selected event ' + eventId + '. Complete the form and submit.')
    document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  async function saveApplication(e) {
    e.preventDefault()
    const { studentId, eventId, applicationDate, reasonToJoin } = form
    if (!studentId || !eventId || !applicationDate || !reasonToJoin) { setStatus('Please complete all fields.'); return }
    setStatus('Saving application...')
    const payload = { student_id: Number(studentId), event_id: Number(eventId), application_date: applicationDate, reason_to_join: reasonToJoin }
    const result = editingId
      ? await supabase.from('applications').update(payload).eq('application_id', editingId)
      : await supabase.from('applications').insert([payload])
    if (result.error) { setStatus('Save failed: ' + result.error.message); return }
    setEditingId(null)
    setForm({ studentId: '', eventId: '', applicationDate: '', reasonToJoin: '' })
    setStatus(editingId ? 'Application updated.' : 'Application submitted.')
    await loadApplications()
  }

  function editApplication(app) {
    setEditingId(app.application_id)
    setForm({ studentId: String(app.student_id), eventId: String(app.event_id), applicationDate: app.application_date, reasonToJoin: app.reason_to_join || '' })
    setStatus('Editing application ' + app.application_id)
    document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  async function deleteApplication(id) {
    if (!confirm('Delete application ' + id + '?')) return
    setStatus('Deleting...')
    const { error } = await supabase.from('applications').delete().eq('application_id', id)
    if (error) { setStatus('Delete failed: ' + error.message); return }
    setStatus('Application deleted.')
    await loadApplications()
  }

  function formatTime(t) { return t ? t.slice(0, 5) : '' }

  const scoreColour = (score) => {
    if (score >= 4) return '#16a34a'
    if (score >= 2) return '#d97706'
    return '#6b7280'
  }

  return (
    <div className="container">

      <section className="hero-section" style={{ display: 'block' }}>
        <h2>Student Events & Applications</h2>
        <p>Browse available events, apply and manage your applications.</p>
        <img src="/OIP.png" alt="Students attending university events" className="hero-image" />
      </section>

      {/* ML RECOMMENDER */}
      <section className="form-section" style={{ border: '2px solid #4f46e5' }}>
        <h3 style={{ color: '#4f46e5' }}>🤖 AI Event Recommender</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 14 }}>
          Enter your Student ID and our recommendation system will suggest events based on
          the societies you have joined and your application history.
        </p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 20 }}>
          <div className="form-group" style={{ margin: 0, flex: 1 }}>
            <label htmlFor="rec-student-id">Student ID</label>
            <input id="rec-student-id" type="number" placeholder="Enter your student ID"
              value={recStudentId} onChange={e => setRecStudentId(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={getRecommendations} disabled={recLoading} style={{ height: 46 }}>
            {recLoading ? 'Loading...' : 'Get Recommendations'}
          </button>
        </div>
        <div style={{ background: '#f8f9ff', borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13, color: 'var(--muted)' }}>
          <strong style={{ color: 'var(--text)' }}>How it works:</strong> The system analyses your society memberships
          and application history. Events from matching categories score higher (+3 points).
          Events you already applied to are excluded. Results are sorted by relevance score.
        </div>
        {recStatus && (
          <p style={{ fontWeight: 600, color: recommendations.length > 0 ? '#16a34a' : '#d97706', marginBottom: 16 }}>
            {recStatus}
          </p>
        )}
        {recommendations.length > 0 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {recommendations.map((ev, index) => (
              <div key={ev.event_id} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 10, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>#{index + 1} {ev.event_name}</span>
                    <span style={{ background: scoreColour(ev.score), color: 'white', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 700 }}>
                      Score: {ev.score}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--muted)', margin: 0 }}>
                    📅 {ev.event_date} &nbsp;|&nbsp; 🕐 {formatTime(ev.event_time)} &nbsp;|&nbsp; 📍 {ev.event_location} &nbsp;|&nbsp; 🏛️ {ev.societies?.society_name}
                  </p>
                </div>
                <button className="btn-apply" onClick={() => applyForEvent(ev.event_id)} style={{ whiteSpace: 'nowrap', marginLeft: 16 }}>Apply</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* EVENTS TABLE */}
      <section id="events-section" className="table-section">
        <h3>Available Events</h3>
        <table>
          <thead>
            <tr><th>ID</th><th>Event Name</th><th>Date</th><th>Time</th><th>Location</th><th>Society</th><th>Apply</th></tr>
          </thead>
          <tbody>
            {events.length === 0
              ? <tr><td colSpan={7}>Loading events...</td></tr>
              : events.map(ev => (
                <tr key={ev.event_id}>
                  <td>{ev.event_id}</td><td>{ev.event_name}</td><td>{ev.event_date}</td>
                  <td>{formatTime(ev.event_time)}</td><td>{ev.event_location}</td>
                  <td>{ev.societies?.society_name ?? ''}</td>
                  <td><button className="btn-apply" onClick={() => applyForEvent(ev.event_id)}>Apply</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </section>

      {/* APPLICATION FORM */}
      <section id="apply-section" className="form-section">
        <h3>Apply for an Event</h3>
        <p style={{ color: '#555', marginBottom: 16 }}>Apply for events that interest you and meet students who share your interests!</p>
        <form onSubmit={saveApplication} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
          <div className="form-group">
            <label htmlFor="student-id">Student ID</label>
            <input id="student-id" type="number" placeholder="Enter your student ID" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="event-id">Event ID</label>
            <input id="event-id" type="number" placeholder="Selected event ID" readOnly value={form.eventId} onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))} />
          </div>
          <div className="form-group">
            <label htmlFor="app-date">Application Date</label>
            <input id="app-date" type="date" value={form.applicationDate} onChange={e => setForm(f => ({ ...f, applicationDate: e.target.value }))} />
          </div>
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label htmlFor="reason">Reason to Join</label>
            <textarea id="reason" rows={4} placeholder="Tell us why you want to join this event" value={form.reasonToJoin} onChange={e => setForm(f => ({ ...f, reasonToJoin: e.target.value }))} />
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: 12 }}>
            <button type="submit" className="btn-primary">{editingId ? 'Update Application' : 'Submit Application'}</button>
            <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm({ studentId: '', eventId: '', applicationDate: '', reasonToJoin: '' }); setStatus('') }}>Clear</button>
          </div>
        </form>
      </section>

      {/* MY APPLICATIONS */}
      <section id="applications-section" className="table-section">
        <h3>My Applications</h3>
        <table>
          <thead>
            <tr><th>App ID</th><th>Student ID</th><th>Event ID</th><th>Date</th><th>Edit</th><th>Delete</th></tr>
          </thead>
          <tbody>
            {applications.length === 0
              ? <tr><td colSpan={6}>No applications found.</td></tr>
              : applications.map(app => (
                <tr key={app.application_id}>
                  <td>{app.application_id}</td><td>{app.student_id}</td><td>{app.event_id}</td><td>{app.application_date}</td>
                  <td><button className="btn-edit" onClick={() => editApplication(app)}>Edit</button></td>
                  <td><button className="btn-delete" onClick={() => deleteApplication(app.application_id)}>Delete</button></td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </section>

      <div className="status">{status}</div>
    </div>
  )
}